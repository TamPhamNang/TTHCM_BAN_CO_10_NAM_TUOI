"""Chapter 4 playthrough through real pointers, UI, saves, pause and end diary."""
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
    page=browser.new_page(viewport={"width":1200,"height":700})
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("response",lambda r:errors.append(f"HTTP {r.status}: {r.url}") if r.status>=400 else None)
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));page.wait_for_function("window.game",timeout=60000)
    assert page.evaluate("gameArt.failed.length===0"),page.evaluate("gameArt.failed")

    def stop_loop():
        page.evaluate("game.frame=()=>{}");page.wait_for_timeout(50)

    def dialogue():
        for _ in range(10):
            if page.evaluate("game.state")!="dialogue":
                settle_chapter(page)
                page.evaluate("game.render()")
                return
            page.click("#dialogueNextBtn")
        raise AssertionError("Dialogue did not finish")

    def reload():
        assert page.evaluate("!!game.save.load()"),page.evaluate("game.cave?.snapshot()")
        page.reload();page.wait_for_function("window.game",timeout=60000);stop_loop();page.click("#continueBtn");page.evaluate("game.render()")

    def snapshot(name):
        page.evaluate("game.render()")
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter4-{name}.png"))

    def object_click(id):
        obj=page.evaluate("id=>game.objects().find(o=>o.id===id)",id);assert obj,id
        point=page.evaluate("o=>({x:game.viewOffsetX+o.x*game.viewScale,y:game.viewOffsetY+(o.y-(o.art?10:0))*game.viewScale})",obj)
        page.mouse.click(point["x"],point["y"])
        result=page.evaluate("""()=>{for(let i=0;i<1000&&game.travel.length&&game.state==='gameplay';i++)game.update(.025);return {pending:game.travel.length,blocked:game.collision.blocks(game.player.getRect())};}""")
        assert not result["pending"] and not result["blocked"],(id,result)

    # A Chapter 3 v2 save created before Chapter 4 has no cave field.
    stop_loop()
    page.evaluate("game.flags.prologue=true;game.loadLevel(11,false);game.completedLevels=[8,9,10,11];game.finishChapter();const old=game.save.load();delete old.cave;game.save.save(old)")
    reload();assert page.evaluate("game.state==='chapterEnd'&&game.level===11")
    advance_scene(page);dialogue()
    assert page.evaluate("game.level===12&&game.cave&&!game.forest&&game.has('compass')&&game.has('notebook')")
    object_click("caveEntrance");assert page.evaluate("game.cave.data.trail.phase==='search'"),"Cannot clear before survey"
    page.click("#cavePrimaryBtn");assert page.evaluate("game.state==='journal'")
    page.locator("[data-compass='Tây Nam']").click();assert page.evaluate("!game.cave.data.trail.compass")
    page.locator("[data-compass='Đông Bắc']").click();assert page.evaluate("game.cave.data.trail.compass")
    object_click("caveKnife");assert page.evaluate("game.has('caveKnife')")
    object_click("caveAnts");dialogue();reload()
    assert page.evaluate("game.cave.data.trail.clues[0]&&game.cave.data.trail.compass")
    object_click("caveBatClue");dialogue();snapshot("trail")
    object_click("caveEntrance");page.evaluate("game.update(.2);game.saveProgress()")
    reload();assert page.evaluate("game.cave.data.trail.workLeft>0")
    page.click("#pauseBtn")
    assert page.evaluate("(()=>{const before=JSON.stringify(game.cave.data);game.update(5);return before===JSON.stringify(game.cave.data)})()")
    page.click("#resumeBtn");page.evaluate("game.update(.5)")
    assert page.evaluate("game.cave.data.trail.cleared===1")
    for _ in range(2):page.click("#cavePrimaryBtn");page.evaluate("game.update(.7)")
    assert page.evaluate("game.cave.data.trail.phase==='open'&&!!game.save.load()")
    dialogue();assert page.evaluate("game.state==='transition'&&game.completedLevels.includes(12)")
    advance_scene(page);dialogue();assert page.evaluate("game.level===13")
    object_click("caveBench");assert page.evaluate("game.cave.data.build.phase==='collect'")
    for item in ["caveBamboo0","caveBamboo1","caveBamboo2","caveTools","cavePalm"]:object_click(item)
    reload();assert page.evaluate("game.cave.data.build.bamboo.every(Boolean)&&game.has('caveTools')")
    object_click("caveBench");assert page.locator("#caveBuildPanel").is_visible()
    page.locator("[data-build='3']").click();assert page.evaluate("game.cave.data.build.step===0")
    page.locator("[data-build='0']").click();page.evaluate("game.update(.3);game.saveProgress()")
    reload();assert page.evaluate("game.cave.data.build.workLeft>0")
    page.evaluate("game.update(.6)")
    for step in [1,2,3]:
        page.locator(f"[data-build='{step}']").click();snapshot(f"build-{step}");page.evaluate("game.update(.9)")
    assert page.evaluate("game.cave.data.build.phase==='ready'&&!!game.save.load()")
    snapshot("platform");dialogue();advance_scene(page);dialogue();assert page.evaluate("game.level===14")
    assert page.evaluate("(()=>{game.update(30);return game.cave.data.relay.remaining===CHAPTER_FOUR.relay.duration})()"),"No timer before Start"
    page.click("#cavePrimaryBtn");page.click("#cavePrimaryBtn");assert page.evaluate("game.cave.data.relay.held")
    page.click("#cavePrimaryBtn");page.evaluate("game.update(.3);game.saveProgress()")
    reload();assert page.evaluate("game.cave.data.relay.flight>0")
    page.click("#hintBtn");assert page.evaluate("(()=>{const before=JSON.stringify(game.cave.data);game.update(10);return before===JSON.stringify(game.cave.data)})()")
    page.click("#closeJournalBtn");page.evaluate("game.update(CHAPTER_FOUR.relay.flight)")
    assert page.evaluate("game.cave.data.relay.delivered===5")
    page.evaluate("game.cave.data.relay.remaining=.01;game.update(.05)")
    assert page.evaluate("game.state==='failed'")
    advance_scene(page);dialogue()
    page.click("#cavePrimaryBtn")
    # Actual keyboard alternation; there is no small timing target to hit.
    for _ in range(20):
        page.keyboard.press("e");page.evaluate("game.update(.025);game.input.endFrame()")
        page.keyboard.press("Space");page.evaluate("game.update(.025);game.input.endFrame()")
        snapshot("relay") if _==5 else None
        page.evaluate("game.update(CHAPTER_FOUR.relay.flight+.05)")
    assert page.evaluate("game.cave.data.relay.delivered===100&&game.cave.data.relay.phase==='done'&&!!game.save.load()")
    dialogue();assert page.evaluate("game.state==='chapterEnd'&&game.completedLevels.includes(14)")
    assert page.locator("#chapterDiaryContent h2").inner_text()=="TRANG NHẬT KÝ SỐ 4"
    assert page.locator("#nextChapterBtn").count()==0
    assert page.evaluate("document.getElementById('chapterDiaryContent').textContent.includes(CHAPTER_DIARIES[3].paragraphs.at(-1))")
    snapshot("diary");reload();assert page.evaluate("game.state==='chapterEnd'&&game.level===14")
    page.click("#chapterMenuBtn");before=page.evaluate("JSON.stringify({...localStorage})")
    page.click("#diaryArchiveBtn");page.locator("#diaryArchiveNav button").nth(3).click()
    assert page.locator("#archiveDiaryContent h2").inner_text()=="TRANG NHẬT KÝ SỐ 4"
    assert page.evaluate("JSON.stringify({...localStorage})")==before
    page.keyboard.press("Escape")
    page.click("#chapter4Btn");dialogue();assert page.evaluate("game.level===12&&game.completedLevels.includes(14)")
    for width,height in [(390,844),(844,390)]:
        page.set_viewport_size({"width":width,"height":height})
        for level in [12,13,14]:
            page.evaluate("level=>{game.loadLevel(level,false);if(level===13){const b=game.cave.data.build;b.bamboo.fill(true);b.palm=true;b.tools=true;b.phase='building';}game.updateHUD();}",level)
            snapshot(f"mobile-{width}-m{level}")
            for id in ["caveStatus","cavePrimaryBtn","bagBtn","hintBtn","pauseBtn"]+(["caveBuildPanel"] if level==13 else []):
                box=page.locator(f"#{id}").bounding_box()
                assert box and box["x"]>=0 and box["y"]>=0 and box["x"]+box["width"]<=width+1 and box["y"]+box["height"]<=height+1,(id,box)
    assert not errors,errors
    print(json.dumps({"result":"PASS","checks":["all Chapter 4 images","legacy Chapter 3 transition","survey gates, compass and pathfinding","clearing and mid-action reload","materials and ordered construction","100 bags, sunrise failure and retry","keyboard, pause and hints","end diary and read-only archive","portrait and landscape layouts"],"pageErrors":errors},ensure_ascii=False))
    browser.close()
