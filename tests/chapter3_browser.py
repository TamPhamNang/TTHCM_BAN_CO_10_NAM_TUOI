"""Play all four Chapter 3 stages, including failures, saves and real UI controls."""
import json
import os
import sys
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from transition_helpers import advance_scene, settle_chapter

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1280,"height":800})
    page.add_init_script("""const prop=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'font');window.seenFonts=[];Object.defineProperty(CanvasRenderingContext2D.prototype,'font',{...prop,set(v){prop.set.call(this,v);window.seenFonts.push(prop.get.call(this));}});""")
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    page.wait_for_function("window.game",timeout=60000)
    assert page.evaluate("gameArt.failed.length===0"),page.evaluate("gameArt.failed")

    def dialogue():
        for _ in range(12):
            if page.evaluate("game.state")!="dialogue":
                settle_chapter(page)
                return
            page.click("#dialogueNextBtn")
        raise AssertionError("Dialogue stuck")

    def snapshot(name):
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter3-{name}.png"))

    def reload():
        assert page.evaluate("game.save.load()!==null"),page.evaluate("game.forest?.snapshot()")
        page.reload();page.wait_for_function("window.game",timeout=60000);page.click("#continueBtn")

    def click_world(x,y):
        pos=page.evaluate("([x,y])=>({x:game.viewOffsetX+x*game.viewScale,y:game.viewOffsetY+y*game.viewScale})",[x,y])
        page.mouse.click(pos["x"],pos["y"])

    def object_click(id):
        obj=page.evaluate("id=>game.objects().find(o=>o.id===id)",id)
        assert obj,id
        if "art" in obj:click_world(obj["art"]["x"],obj["art"]["bottom"]-10)
        else:click_world(obj["x"],obj["y"])
        result=page.evaluate("""()=>{for(let i=0;i<1000&&game.travel.length&&game.state==='gameplay';i++)game.update(.025);return {travel:game.travel.length,state:game.state,blocked:game.collision.blocks(game.player.getRect())};}""")
        assert not result["travel"] and not result["blocked"] and result["state"]!="failed",(id,result)

    page.click("#chapter3Btn");dialogue()
    assert page.evaluate("game.level===8 && game.forest && !game.river")
    page.click("#forestDepartBtn")
    assert page.evaluate("game.forest.data.pack.phase==='loading'")
    for _ in range(5):page.locator("[data-carrier='0'][data-delta='1']").click()
    assert page.evaluate("game.forest.data.pack.loads[0]===4"),"No overloaded horse"
    page.locator("[data-carrier='0'][data-delta='-1']").click()
    reload();assert page.evaluate("game.forest.data.pack.loads[0]===3")
    for i,capacity in enumerate([4,2,2,1]):
        while page.evaluate("i=>game.forest.data.pack.loads[i]",i)<capacity:
            page.locator(f"[data-carrier='{i}'][data-delta='1']").click()
    snapshot("allocation")
    page.click("#forestDepartBtn");page.evaluate("game.update(.5);game.saveProgress()")
    reload();assert page.evaluate("game.forest.data.pack.phase==='departing' && game.forest.data.pack.departure>0")
    page.click("#pauseBtn")
    assert page.evaluate("(()=>{const s=JSON.stringify(game.forest.data);game.update(2);return s===JSON.stringify(game.forest.data)})()")
    page.click("#resumeBtn")
    page.evaluate("()=>{for(let i=0;i<150&&game.state==='gameplay';i++)game.update(.025)}")
    dialogue();assert page.evaluate("game.state==='transition' && game.completedLevels.includes(8)")
    advance_scene(page);dialogue();assert page.evaluate("game.level===9")
    page.evaluate("game.update(8.6)")
    assert page.evaluate("game.state==='failed'"),"Missed stone causes a retry"
    advance_scene(page);dialogue()
    page.click("#forestPrimaryBtn")
    spam=page.evaluate("(()=>{const v=game.forest.data.hill.velocity;for(let i=0;i<40;i++)game.forest.push();return [v,game.forest.data.hill.velocity]})()")
    assert spam[0]==spam[1],spam
    page.evaluate("game.update(5.6)")
    assert page.evaluate("game.forest.data.hill.slipping")
    snapshot("slipping")
    page.click("#forestSecondaryBtn")
    assert page.evaluate("!game.forest.data.hill.slipping && game.forest.data.hill.stones.some(Boolean)")
    reload();assert page.evaluate("game.forest.data.hill.stones.some(Boolean)")
    # Restart after the deliberately slow first attempt; play with a steady cadence.
    page.click("#pauseBtn");page.click("#checkpointBtn");dialogue()
    hill=page.evaluate("""()=>{
      let next=game.forest.data.time;
      for(let i=0;i<1600&&game.state==='gameplay';i++){
        game.update(.025);
        if(game.forest.data.hill.slipping)game.forest.secondary();
        else if(game.forest.data.time>=next){game.forest.primary();next=game.forest.data.time+.55;}
      }
      return {state:game.state,data:game.forest.data.hill};
    }""")
    assert hill["state"]=="dialogue" and hill["data"]["phase"]=="crested",hill
    dialogue();advance_scene(page);dialogue();assert page.evaluate("game.level===10")
    assert page.evaluate("!game.objects().some(o=>o.id==='forestHerb')")
    page.click("#hintBtn")
    assert page.locator(".forest-herb-reference").is_visible()
    page.click("#closeJournalBtn")
    pos=page.evaluate("()=>({x:game.viewOffsetX+989*game.viewScale,y:game.viewOffsetY+380*game.viewScale})")
    page.mouse.move(pos["x"],pos["y"])
    assert page.evaluate("game.forest.data.camp.revealed")
    object_click("forestHerb")
    assert page.evaluate("game.state==='journal'")
    page.locator("[data-herb='round']").click()
    assert page.evaluate("!game.has('forestHerb') && game.state==='journal'")
    page.locator("[data-herb='herb']").click()
    object_click("forestWood");object_click("forestFlint")
    assert page.evaluate("game.has('forestHerb')&&game.has('forestWood')&&game.has('forestFlint')")
    reload();assert page.evaluate("game.forest.data.camp.herb && game.forest.data.camp.wood && game.forest.data.camp.flint")
    snapshot("night")
    object_click("forestCook");assert page.evaluate("game.forest.data.camp.phase==='lighting'")
    for _ in range(3):
        page.click("#forestPrimaryBtn");page.evaluate("game.update(.3)")
    assert page.evaluate("game.forest.data.camp.phase==='brewing'")
    page.evaluate("game.update(1.2);game.saveProgress()")
    reload();assert page.evaluate("game.forest.data.camp.phase==='brewing' && game.forest.data.camp.brew>0")
    page.click("#hintBtn")
    assert page.evaluate("(()=>{const t=game.forest.data.camp.brew;game.update(10);return t===game.forest.data.camp.brew})()")
    page.click("#closeJournalBtn");page.evaluate("game.update(6)")
    assert page.evaluate("game.forest.data.camp.phase==='ready' && game.has('forestMedicine')")
    object_click("forestPatient")
    assert page.evaluate("game.forest.data.camp.phase==='serving'")
    page.evaluate("game.update(.4);game.saveProgress()")
    reload();assert page.evaluate("game.forest.data.camp.phase==='serving'")
    page.evaluate("game.update(2)");dialogue();advance_scene(page);dialogue()
    assert page.evaluate("game.level===11")
    page.evaluate("game.update(4);game.update(5.1)")
    assert page.evaluate("game.state==='failed'"),"Failure when no alarm/cover orders"
    advance_scene(page);dialogue()
    for wave in [1,2]:
        page.evaluate("game.update(4)")
        assert page.evaluate("game.forest.data.air.phase==='alarm'")
        page.click("#forestPrimaryBtn")
        assert page.evaluate("game.forest.data.air.whistled")
        for i in range(3):
            page.click("#forestSecondaryBtn")
            if i==0:
                page.evaluate("game.update(.2);game.saveProgress()")
                reload();assert page.evaluate("game.forest.data.air.groups[0].cover>=0")
        page.evaluate("game.update(1.2);game.saveProgress()")
        snapshot(f"cover-{wave}")
        page.click("#pauseBtn")
        assert page.evaluate("(()=>{const t=game.forest.data.air.remaining;game.update(9);return t===game.forest.data.air.remaining})()")
        page.click("#resumeBtn")
        page.evaluate("game.update(5)")
        assert page.evaluate("game.forest.data.air.phase==='flyover'"),page.evaluate("game.forest.data.air")
        page.evaluate("game.update(7)")
        assert page.evaluate("game.forest.data.air.phase==='resume'")
        page.click("#forestPrimaryBtn")
    dialogue()
    assert page.evaluate("game.state==='chapterEnd' && game.completedLevels.join(',')==='8,9,10,11'")
    reload();assert page.evaluate("game.state==='chapterEnd' && game.level===11")
    assert page.locator("#nextChapterBtn").count()==0
    assert page.evaluate("window.seenFonts.every(f=>f.includes('Times New Roman'))")
    # Old saves do not require a new forest field; chapter 2 now leads into 3.
    page.evaluate("""()=>{game.loadLevel(7,false);game.completedLevels=[5,6,7];game.finishChapter();const d=game.save.load();delete d.forest;game.save.save(d);}""")
    reload();assert page.evaluate("game.state==='chapterEnd' && game.level===7")
    assert page.locator("#nextChapterBtn").count()==0
    advance_scene(page);dialogue();assert page.evaluate("game.level===8")
    for width,height in [(390,844),(844,390)]:
        page.set_viewport_size({"width":width,"height":height})
        snapshot(f"allocation-{width}")
        for id in ["forestStatus","forestAllocation","forestDepartBtn","bagBtn","hintBtn","pauseBtn"]:
            box=page.locator(f"#{id}").bounding_box()
            assert box and box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=width+1 and box["y"]+box["height"]<=height+1,(id,box)
        page.evaluate("game.loadLevel(11,false);game.update(4)")
        snapshot(f"alarm-{width}")
        for id in ["forestStatus","forestPrimaryBtn","forestSecondaryBtn","timerPanel","bagBtn","hintBtn","pauseBtn"]:
            box=page.locator(f"#{id}").bounding_box()
            assert box and box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=width+1 and box["y"]+box["height"]<=height+1,(id,box)
        boxes=[page.locator(f"#{id}").bounding_box() for id in ["forestStatus","timerPanel","bagBtn"]]
        for a,b in [(boxes[0],boxes[1]),(boxes[1],boxes[2])]:
            assert a["x"]+a["width"]<=b["x"] or b["x"]+b["width"]<=a["x"] or a["y"]+a["height"]<=b["y"] or b["y"]+b["height"]<=a["y"],(a,b)
        page.evaluate("game.loadLevel(8,false)")
    assert page.evaluate("[...document.querySelectorAll('body,body *')].every(el=>getComputedStyle(el).fontFamily.includes('Times New Roman'))")
    assert not errors,errors
    print(json.dumps({"result":"PASS","checks":["all Chapter 3 assets","capacity and allocation","departure and reload","hill cadence, anti-spam, slip, rocks, retry","flashlight and plant identification","collect, kindle, brew, serve, reload and pause","two air-raid waves, groups, failure and resume","old saves and Chapter 2 transition","Times New Roman","portrait and landscape controls"],"pageErrors":errors},ensure_ascii=False))
    browser.close()
