"""Furniture placement, winter-train atlas and seated pose regressions."""
import base64
import json
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=2)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    result = page.evaluate("""() => {
      const assert = (ok, text) => { if (!ok) throw new Error(text); };
      game.loadLevel(1, false);
      for (const object of game.objects().filter(o => o.art)) {
        const a = object.art, image = gameArt.images[object.id];
        assert(game.scene.objectAt({x:a.x, y:a.bottom-a.width*image.height/image.width*(a.squashY||1)/2}, game.objects())?.id === object.id, 'Click the visible furniture item');
        assert(!game.collision.blocks(game.player.getRect(object.x,object.y)), 'Approach position is outside furniture');
        game.walkTo(object, object);
        assert(game.travel.length > 0, 'Furniture item must be reachable');
        for (let i=0;i<1500 && game.travel.length;i++) game.updateWalk(.02);
        assert(game.has(object.id), 'Clicking furniture still collects the item');
      }
      const layout=CHAPTER_ONE.trainLayout;
      assert(gameArt.images.kienSeated?.height >= 300, 'Use the full-resolution dedicated seated pose');
      assert(layout.passengers.length >= 5, 'Populate several benches');
      for (const id of ['trainGrandma', ...layout.passengers.map(p=>p.art)]) {
        assert(gameArt.images[id]?.height > 60, 'Complete seated cutout from winter train board');
        assert(gameArt.atlasSources[id].file === CHAPTER_ATLAS.boards.winterTrain+'.png', 'Use the supplied winter train board');
      }
      assert(game.scene.inBasket({x:layout.basket.x,y:layout.basket.bottom-20}), 'Basket hit area follows its artwork');
      game.loadLevel(2,false); game.sitTrain();
      assert(game.state==='gameplay' && !game.trainPose, 'Cannot sit before hiding the gold');
      game.train.hidden=[0,1,2]; game.sitTrain();
      const remaining=game.train.remaining;
      game.update(.3); const start=game.trainDisplay();
      assert(start.walk && start.seat===0 && start.y<layout.standing.y, 'Approach the actual bench');
      game.update(.4); const middle=game.trainDisplay();
      assert(middle.seat>0 && middle.seat<1, 'Bend legs continuously while sitting');
      game.pause(); game.update(1);
      assert(game.trainDisplay().seat===middle.seat && game.train.remaining===remaining, 'Pause freezes seated transition and timer');
      game.resume(); game.update(.3);
      assert(game.train.seated && game.state==='dialogue' && game.trainDisplay().seat===1, 'Inspection starts after sitting');
      game.saveProgress(); game.returnToMenu(); game.continueGame();
      assert(game.trainDisplay().seat===1, 'Reload keeps the seated pose');
      return {passengers:layout.passengers.length, approach:start, sitting:middle};
    }""")
    for level, name in [(1, "camp-furniture"), (2, "winter-train")]:
        data = page.evaluate("""level => {
          game.flags.prologue=true;game.inventory=level===2?['compass','notebook','disguise']:['compass','notebook'];game.loadLevel(level,false);
          if(level===2) { game.train.seated=true;game.train.hidden=[0,1,2]; }
          const c=document.createElement('canvas');c.width=1800;c.height=1050;
          const ctx=c.getContext('2d');ctx.scale(1.5,1.5);game.scene.render(ctx,game);
          return c.toDataURL('image/png');
        }""", level)
        (Path(tempfile.gettempdir()) / f"chapter1-{name}.png").write_bytes(base64.b64decode(data.split(",")[1]))
    assert not errors, errors
    print(json.dumps({"result":"PASS", **result, "pageErrors":errors}))
    browser.close()
