"""Finale playthrough, automatic transitions, saves and responsive rendering."""
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1200,"height":700})
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.on("response",lambda r:errors.append(f"HTTP {r.status}: {r.url}") if r.status>=400 else None)
    def ready():
        page.wait_for_function("window.game",timeout=60000)
        page.evaluate("game.frame=()=>{}")
        page.wait_for_timeout(60)
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));ready()
    assert page.evaluate("gameArt.failed.length===0"),page.evaluate("gameArt.failed")
    assert page.locator("#nextChapterBtn").count()==0
    assert page.evaluate("Object.values(gameArt.supperFrames).every(f=>f.length===24)")
    def dialogue():
        for _ in range(12):
            if page.evaluate("game.state")!="dialogue":return
            page.click("#dialogueNextBtn")
        raise AssertionError("dialogue stuck")
    def ticks(n=24):
        page.evaluate("n=>{for(let i=0;i<n;i++){game.update(.05);game.input.endFrame();}game.render()}",n)
    def reload():
        assert page.evaluate("!!game.save.load()")
        page.reload();ready();page.click("#continueBtn");page.evaluate("game.render()")
    def obj(id):
        o=page.evaluate("id=>game.objects().find(o=>o.id===id)",id);assert o,id
        point=page.evaluate("o=>({x:game.viewOffsetX+o.x*game.viewScale,y:game.viewOffsetY+(o.y-(o.art?10:0))*game.viewScale})",o)
        page.mouse.click(point["x"],point["y"])
        page.evaluate("()=>{for(let i=0;i<600&&game.travel.length&&game.state==='gameplay';i++)game.update(.025);game.render()}")
        assert page.evaluate("game.travel.length===0&&!game.collision.blocks(game.player.getRect())"),id
    # Every ordinary stage advances exactly once, with a real delay and no success button.
    for level in [1,2,3,5,6,8,9,10,12,13]:
        page.evaluate("level=>{game.flags.prologue=true;game.loadLevel(level,false);game.completeLevel();game.completeLevel();game.render()}",level)
        assert not page.locator("#nextBtn").is_visible()
        ticks(5);assert page.evaluate("game.level")==level
        assert page.evaluate("!!game.save.load()")
        if level==3:reload()  # Resume a completed stage during its transition.
        ticks();assert page.evaluate("game.level")==level+1
        assert page.evaluate("!game.transition&&game.state==='dialogue'")
    # Chapter diaries stay readable until the bottom, then continue automatically.
    for level,target in [(4,5),(7,8),(11,12),(14,15)]:
        page.evaluate("level=>{game.loadLevel(level,false);game.completeLevel()}",level);ticks()
        assert page.evaluate("game.state==='chapterEnd'")
        ticks(60);assert page.evaluate("game.level")==level
        page.evaluate("const el=document.getElementById('chapterDiaryContent');el.scrollTop=el.scrollHeight")
        ticks(20);page.evaluate("document.getElementById('chapterDiaryContent').scrollTop=0");ticks(40)
        assert page.evaluate("game.level")==level
        page.evaluate("const el=document.getElementById('chapterDiaryContent');el.scrollTop=el.scrollHeight")
        ticks(78);assert page.evaluate("game.level")==target
    dialogue();assert page.evaluate("game.level===15&&game.supper&&!game.cave")
    obj("supperSalt");assert page.evaluate("game.supper.data.phase==='collect'")
    obj("supperPot");assert page.evaluate("game.supper.data.phase==='collect'")
    obj("supperIngredients");reload();assert page.evaluate("game.supper.data.phase==='prepare'")
    obj("supperPot");obj("supperSalt");assert page.evaluate("game.supper.data.phase==='scoop'")
    obj("supperSpoon");obj("supperSalt");assert page.evaluate("game.supper.data.phase==='sprinkle'")
    reload();assert page.evaluate("game.supper.data.phase==='sprinkle'")
    obj("supperPot");ticks(10)
    page.screenshot(path=str(Path(tempfile.gettempdir())/"chapter5-cooking.png"))
    page.click("#pauseBtn")
    assert page.evaluate("(()=>{let d=JSON.stringify(game.supper.data);game.update(10);return d===JSON.stringify(game.supper.data)})()")
    page.click("#resumeBtn");page.click("#hintBtn")
    assert page.evaluate("(()=>{let d=JSON.stringify(game.supper.data);game.update(10);return d===JSON.stringify(game.supper.data)})()")
    page.click("#closeJournalBtn");reload();ticks(125)
    assert page.evaluate("game.supper.data.phase==='serve'")
    obj("supperServe");assert page.evaluate("game.state==='dialogue'")
    reload();ticks(1);assert page.evaluate("game.state==='dialogue'")
    page.screenshot(path=str(Path(tempfile.gettempdir())/"chapter5-ending.png"))
    dialogue();ticks();assert page.evaluate("game.state==='chapterEnd'&&game.completedLevels.includes(15)&&game.diaries.unlocked().includes(5)")
    reload();assert page.evaluate("game.state==='chapterEnd'&&game.level===15")
    for w,h in [(390,844),(844,390),(1200,700)]:
        page.set_viewport_size({"width":w,"height":h});page.evaluate("game.render()")
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth")
        assert page.locator("#chapterMenuBtn").is_visible()
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter5-diary-{w}.png"))
    page.click("#chapterMenuBtn");before=page.evaluate("localStorage.getItem(game.save.key)")
    page.click("#diaryArchiveBtn");page.get_by_role("button",name="Chương 5",exact=True).click()
    assert page.locator("#archiveDiaryContent").inner_text().find("TRANG NHẬT KÝ SỐ 5")>=0
    page.click("#closeDiaryArchiveBtn");assert page.evaluate("localStorage.getItem(game.save.key)")==before
    # Invalid finale state rejected; old chapter saves remain readable.
    assert page.evaluate("(()=>{let s=game.save.load();s.supper.salted=false;return !game.save.valid(s)})()")
    for level in [1,5,8,12]:
        assert page.evaluate("level=>{game.loadLevel(level,false);game.saveProgress();let s=game.save.load();delete s.supper;return game.save.valid(s)}",level)
    page.click("#chapter5Btn") if page.evaluate("game.state==='menu'") else page.evaluate("game.startChapterFive()")
    dialogue()
    for w,h in [(390,844),(844,390)]:
        page.set_viewport_size({"width":w,"height":h});page.evaluate("game.render()")
        assert page.locator("#interactBtn").is_visible()
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter5-play-{w}.png"))
    assert not errors,errors
    browser.close()
print("PASS: automatic stages/chapters, Chapter 5, saves, pause, archive, mobile; no JS/HTTP errors")
