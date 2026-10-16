"""Play Chapter 2 through UI; verify typography, pauses and compatible saves."""
import json
import os
import sys
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1280,"height":800})
    page.add_init_script("""
      const fontProperty=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');window.seenFonts=[];
      Object.defineProperty(CanvasRenderingContext2D.prototype,'font',{...fontProperty,set(v){fontProperty.set.call(this,v);window.seenFonts.push(fontProperty.get.call(this));}});
    """)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    page.wait_for_function("window.game",timeout=60000)
    assert page.evaluate("gameArt.failed.length===0")

    def dialogue():
        for _ in range(12):
            if page.evaluate("game.state")!="dialogue":return
            page.click("#dialogueNextBtn")
        raise AssertionError("Dialogue stuck")

    def world(x,y):
        return page.evaluate("([x,y])=>({x:game.viewOffsetX+x*game.viewScale,y:game.viewOffsetY+y*game.viewScale})",[x,y])

    def click(x,y):
        pos=world(x,y);page.mouse.click(pos["x"],pos["y"])

    def object_click(id):
        obj=page.evaluate("id=>game.objects().find(o=>o.id===id)",id)
        assert obj,id
        click(obj["x"],obj["y"])
        result=page.evaluate("""()=>{
          for(let i=0;i<1500&&game.travel.length&&game.state==='gameplay';i++)game.update(.025);
          return {state:game.state,travel:game.travel.length,blocked:game.collision.blocks(game.player.getRect())};
        }""")
        assert not result["travel"] and not result["blocked"] and result["state"]!="failed",result

    def reload_continue():
        page.reload();page.wait_for_function("window.game",timeout=60000);page.click("#continueBtn")

    def screenshot(name):
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter2-{name}.png"))

    fonts=page.evaluate("""()=>{
      const bad=[...document.querySelectorAll('body,body *')].filter(el=>!getComputedStyle(el).fontFamily.includes('Times New Roman')).map(el=>el.tagName+':'+el.id);
      game.loadLevel(1,false);game.render();game.state='menu';game.ui.showMenu();
      return {bad,canvas:window.seenFonts,pass:[gameArt.images.pass.width,gameArt.images.pass.height]};
    }""")
    assert not fonts["bad"],fonts
    assert fonts["canvas"] and all("Times New Roman" in f for f in fonts["canvas"]),fonts
    assert fonts["pass"]==[640,440],fonts
    screenshot("menu-fonts")
    page.click("#chapter2Btn");dialogue()
    assert page.evaluate("game.level===5 && game.state==='gameplay'")
    detection=page.evaluate("""()=>{
      Object.assign(game.player,{x:370,y:330});game.update(.5);const loud=game.river.data.alert;
      game.river.data.alert=0;game.river.data.crouched=true;game.update(.5);const quiet=game.river.data.alert;
      game.river.data.crouched=false;game.river.data.alert=99;game.update(.1);
      return {loud,quiet,failed:game.state==='failed'};
    }""")
    assert detection["loud"]>detection["quiet"]>0 and detection["failed"],detection
    page.click("#nextBtn");dialogue()
    page.evaluate("game.interact(game.objects().find(o=>o.id==='winch'))")
    assert page.evaluate("game.state==='gameplay' && !game.river.data.chainOpen")
    object_click("bone")
    assert page.evaluate("game.has('bone')")
    reload_continue();assert page.evaluate("game.has('bone') && game.level===5")
    object_click("lure")
    assert page.evaluate("!game.has('bone') && game.river.data.distraction>0")
    page.click("#riverActionBtn");assert page.evaluate("game.river.data.crouched")
    object_click("winch")
    assert page.evaluate("game.state==='journal'")
    page.locator("[data-lock='0']").click()
    reload_continue();assert page.evaluate("game.river.data.knots[0]===2")
    object_click("winch")
    assert page.evaluate("game.state==='journal'")
    screenshot("rope")
    for i in range(3):
        for _ in range(4):
            if page.evaluate("i=>game.river.data.knots[i]===0",i):break
            page.locator(f"[data-lock='{i}']").click()
    dialogue();assert page.evaluate("game.state==='complete' && game.completedLevels.includes(5)")
    page.click("#nextBtn");dialogue();assert page.evaluate("game.level===6")
    page.evaluate("game.river.data.storm.integrity=.01;game.update(.05)")
    assert page.evaluate("game.state==='failed'")
    page.click("#nextBtn");dialogue()
    assert page.evaluate("game.river.data.storm.integrity>98")
    cargo=page.evaluate("GAME_LEVELS[6].cargo")
    a=world(205,580);b=world(cargo[0]["x"],cargo[0]["y"])
    page.mouse.move(a["x"],a["y"]);page.mouse.down();page.mouse.move(b["x"],b["y"],steps=5);page.mouse.up()
    click(cargo[0]["x"],cargo[0]["y"])
    assert page.evaluate("game.river.data.storm.covered[0] && game.river.data.storm.tied[0]")
    reload_continue();assert page.evaluate("game.river.data.storm.covered[0]")
    page.click("#hintBtn")
    assert page.evaluate("(()=>{const s=JSON.stringify(game.river.data);game.update(3);return s===JSON.stringify(game.river.data)})()")
    page.click("#closeJournalBtn")
    for obj in cargo[1:]:
        page.click("#riverActionBtn");click(obj["x"],obj["y"]);click(obj["x"],obj["y"])
    page.evaluate("game.river.data.storm.gust=.01;game.update(.05)")
    loose=page.evaluate("game.river.data.storm.tied.findIndex(v=>!v)")
    assert loose>=0
    click(cargo[loose]["x"],cargo[loose]["y"])
    screenshot("storm")
    page.click("#pauseBtn")
    assert page.evaluate("(()=>{const t=game.river.data.time;game.update(2);return t===game.river.data.time})()")
    page.click("#resumeBtn")
    page.evaluate("""()=>{
      for(let i=0;i<1700&&game.state==='gameplay';i++){
        game.update(.025);
        if(game.state==='gameplay')game.river.data.storm.tied.forEach((v,i)=>{if(!v)game.river.handleCargo(i);});
      }
    }""")
    dialogue();assert page.evaluate("game.state==='complete' && game.completedLevels.includes(6)")
    page.click("#nextBtn");dialogue();assert page.evaluate("game.level===7")
    channel=page.evaluate("GAME_LEVELS[7].channel")
    a=world(channel[0]["x"],channel[0]["y"]);b=world(channel[-1]["x"],channel[-1]["y"])
    page.mouse.move(a["x"],a["y"]);page.mouse.down();page.mouse.move(b["x"],b["y"]);page.mouse.up()
    assert page.evaluate("game.river.data.reeds.phase==='route'"),"Reject shortcuts through reeds"
    page.mouse.move(a["x"],a["y"]);page.mouse.down()
    for q in channel[1:]:
        q=world(q["x"],q["y"]);page.mouse.move(q["x"],q["y"],steps=6)
    page.mouse.up()
    assert page.evaluate("game.river.data.reeds.phase==='sailing'")
    page.evaluate("game.update(.5);game.saveProgress()")
    reload_continue();assert page.evaluate("game.river.data.reeds.phase==='sailing' && game.river.data.reeds.distance>0")
    screenshot("reeds")
    page.evaluate("()=>{for(let i=0;i<1000&&game.river.data.reeds.phase==='sailing';i++)game.update(.025)}")
    dialogue();assert page.evaluate("game.river.data.reeds.phase==='materials'")
    object_click("mud");object_click("leaves");assert page.evaluate("game.has('mud')&&game.has('leaves')")
    reload_continue();assert page.evaluate("game.has('mud')&&game.has('leaves')")
    object_click("camouflage");dialogue()
    assert page.evaluate("game.river.data.reeds.camouflaged && game.river.data.reeds.phase==='watch'")
    screenshot("camouflage")
    page.evaluate("()=>{for(let i=0;i<350&&game.state==='gameplay';i++)game.update(.025)}")
    dialogue();assert page.evaluate("game.state==='chapterEnd' && game.completedLevels.join(',')==='5,6,7'")
    reload_continue();assert page.evaluate("game.state==='chapterEnd' && game.level===7")
    assert page.locator("#nextChapterBtn").is_hidden()
    assert page.evaluate("window.seenFonts.every(f=>f.includes('Times New Roman'))")
    # A v2 Chapter 1 save without a river field remains usable.
    page.evaluate("""()=>{
      game.loadLevel(4,false);game.completedLevels=[1,2,3,4];game.flags.prologue=true;game.finishChapter();
      const d=game.save.load();delete d.river;game.save.save(d);
    }""")
    reload_continue();assert page.evaluate("game.level===4 && game.state==='chapterEnd'")
    assert page.locator("#nextChapterBtn").is_visible()
    page.click("#nextChapterBtn");dialogue()
    for width,height in [(390,844),(844,390)]:
        page.set_viewport_size({"width":width,"height":height})
        screenshot(f"mobile-{width}")
        for id in ["riverStatus","riverActionBtn","moveStick","interactBtn","bagBtn","hintBtn","pauseBtn"]:
            box=page.locator(f"#{id}").bounding_box()
            assert box and box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=width+1 and box["y"]+box["height"]<=height+1,(id,box)
    assert not errors,errors
    print(json.dumps({"result":"PASS","checks":["Times New Roman DOM and Canvas","clean text assets","Chapter 1 v2 save compatibility","M5 bone, distraction and rope puzzle","M6 drag/tap tarps, gust repair, failure and pause","M7 route validation, sailing, collection and camouflage","reload across all stages","portrait and landscape layouts"],"pageErrors":errors},ensure_ascii=False))
    browser.close()
