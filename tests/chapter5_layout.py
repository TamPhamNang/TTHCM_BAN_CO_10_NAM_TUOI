"""Chapter 5 furniture collision and sprite interaction regression checks."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page(viewport={"width": 1200, "height": 700})
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    page.evaluate("game.frame=()=>{};game.startChapterFive()")
    while page.evaluate("game.state==='dialogue'"):
        page.click("#dialogueNextBtn")
    assert page.evaluate("""() => {
      // The stove, table, crates, salt store and both log piles are solid.
      return [[222,380],[400,390],[650,365],[954,435],[150,480],[1100,520],[280,610]]
        .every(([x,y])=>game.collision.blocks(game.player.getRect(x,y)));
    }""")
    assert page.evaluate("""() => {
      Object.assign(game.player,{x:400,y:450});
      game.input.movement=()=>({x:0,y:-1});
      for(let i=0;i<60;i++)game.update(.025);
      game.input.movement=()=>({x:0,y:0});
      return game.player.y>=421&&!game.collision.blocks(game.player.getRect());
    }""")
    for item in ["supperIngredients", "supperPot", "supperSpoon", "supperSalt", "supperPot"]:
        # Click the artwork, including objects on inaccessible table surfaces.
        point = page.evaluate("""id=>{
          const a=game.objects().find(o=>o.id===id).art;
          const h=a.width*gameArt.images[a.id].height/gameArt.images[a.id].width;
          return {x:game.viewOffsetX+a.x*game.viewScale,y:game.viewOffsetY+(a.bottom-h/2)*game.viewScale};
        }""", item)
        page.mouse.click(point["x"], point["y"])
        assert page.evaluate("""()=>{
          for(let i=0;i<1200&&game.travel.length;i++){
            game.update(.025);
            if(game.collision.blocks(game.player.getRect()))return false;
          }
          return !game.travel.length&&!game.pendingObject;
        }"""), item
    assert page.evaluate("game.supper.data.phase==='cooking'")
    page.evaluate("game.update(6);game.render()")
    assert page.evaluate("game.supper.data.phase==='serve'")
    page.screenshot(path=str(Path(__file__).resolve().parents[1]/"docs/chapter5-preview.png"))
    # An older save inside a newly solid log pile resumes on clear ground.
    page.evaluate("Object.assign(game.player,{x:1100,y:520});game.saveProgress();game.continueGame()")
    assert page.evaluate("!game.collision.blocks(game.player.getRect())")
    browser.close()
print("PASS: furniture footprints, keyboard blocking, sprite clicks, clear routes, old save recovery")
