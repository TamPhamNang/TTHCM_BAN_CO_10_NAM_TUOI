"""Chapter-end reading, reloads, archive isolation, keyboard and responsive layout."""
import os
import sys
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from transition_helpers import advance_scene, settle_chapter

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page(viewport={"width": 1366, "height": 900})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.on("response", lambda response: errors.append(f"HTTP {response.status}: {response.url}") if response.status >= 400 else None)
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    assert page.evaluate("CHAPTER_DIARIES.length===5 && CHAPTER_DIARIES.map(d=>d.paragraphs.length).join(',')==='4,5,4,4,4'")
    assert page.evaluate("CHAPTER_DIARIES[2].paragraphs[2].includes('bác Lương Bằng') && CHAPTER_DIARIES[4].date==='Đêm ngày 19 tháng 12 năm 1946.'")
    page.click("#diaryArchiveBtn")
    assert page.locator("#diaryArchiveEmpty").is_visible()
    assert page.locator("#diaryArchiveNav button:disabled").count() == 5
    assert page.evaluate("game.save.load()===null")
    page.keyboard.press("Escape")
    assert page.locator("#diaryArchive").is_hidden()
    assert page.evaluate("document.activeElement.id==='diaryArchiveBtn'")

    for chapter, level in [(1, 4), (2, 7), (3, 11)]:
        # Use the actual completion handler at each chapter boundary.
        page.evaluate("""level=>{game.flags.prologue=true;game.loadLevel(level,false);game.completeLevel();}""", level)
        settle_chapter(page)
        assert page.evaluate("game.state==='chapterEnd'")
        assert page.locator("#chapterDiaryContent h2").inner_text() == f"TRANG NHẬT KÝ SỐ {chapter}"
        assert page.evaluate("""chapter=>{
          const d=CHAPTER_DIARIES[chapter-1], node=document.getElementById('chapterDiaryContent');
          const ps=[...node.querySelectorAll('p')];
          return ps[0].textContent===d.date && ps[1].textContent==='Nơi viết: '+d.place &&
            JSON.stringify(ps.slice(2).map(p=>p.textContent))===JSON.stringify(d.paragraphs) &&
            getComputedStyle(node).fontFamily.startsWith('"Times New Roman"');
        }""", chapter)
        assert page.evaluate("""async chapter=>{const img=new Image();img.src=CHAPTER_DIARIES[chapter-1].image;await img.decode();return img.naturalWidth>1000;}""", chapter)
        page.screenshot(path=str(Path(tempfile.gettempdir()) / f"diary-{chapter}-opening.png"))
        # Reader freezes mission state; native arrows and Space can scroll its content.
        assert page.evaluate("""()=>{const before=JSON.stringify([game.train,game.river?.snapshot(),game.forest?.snapshot()]);game.update(30);return before===JSON.stringify([game.train,game.river?.snapshot(),game.forest?.snapshot()]);}""")
        page.locator("#chapterDiaryContent").focus()
        page.keyboard.press("End")
        page.wait_for_timeout(250)
        assert page.evaluate("document.getElementById('chapterDiaryContent').scrollTop>0")
        page.screenshot(path=str(Path(tempfile.gettempdir()) / f"diary-{chapter}-desktop.png"))
        page.reload(); page.wait_for_function("window.game", timeout=60000)
        page.click("#continueBtn")
        assert page.locator("#chapterDiaryContent h2").inner_text() == f"TRANG NHẬT KÝ SỐ {chapter}"
        assert page.evaluate("document.getElementById('chapterDiaryContent').scrollTop===0")
        assert page.locator("#nextChapterBtn").count()==0
        if chapter < 3:
            advance_scene(page)
            assert page.evaluate("game.level") == level + 1
            page.evaluate("game.returnToMenu()")
        else:
            page.click("#chapterMenuBtn")

    # Read-only archive must not rewrite any saved gameplay or completion flags.
    before = page.evaluate("JSON.stringify({...localStorage})")
    page.click("#diaryArchiveBtn")
    assert page.locator("#diaryArchiveNav button:disabled").count() == 2
    assert page.locator("#diaryArchiveNav button").count() == 5
    for chapter in [3, 1, 2]:
        page.locator("#diaryArchiveNav button").nth(chapter-1).click()
        assert page.locator("#archiveDiaryContent h2").inner_text() == f"TRANG NHẬT KÝ SỐ {chapter}"
    assert page.evaluate("JSON.stringify({...localStorage})") == before
    page.locator("#closeDiaryArchiveBtn").focus(); page.keyboard.press("Tab")
    assert page.evaluate("document.activeElement===document.querySelector('#diaryArchiveNav button')")
    page.keyboard.press("Escape")

    for width, height in [(390, 844), (844, 390)]:
        page.set_viewport_size({"width": width, "height": height})
        page.click("#continueBtn")
        story = page.locator("#chapterDiaryContent")
        box = story.bounding_box()
        assert box and box["height"] > 65, box
        assert page.evaluate("""()=>{const c=document.getElementById('chapterDiaryContent');return c.scrollWidth===c.clientWidth && c.scrollHeight>c.clientHeight;}""")
        page.evaluate("document.getElementById('chapterDiaryContent').scrollTop=10000")
        assert page.evaluate("""()=>{const c=document.getElementById('chapterDiaryContent'),p=c.lastElementChild.getBoundingClientRect(),r=c.getBoundingClientRect();return p.bottom<=r.bottom && p.bottom>r.top;}""")
        for selector in ["#chapterMenuBtn", "#replayBtn"]:
            rect = page.locator(selector).bounding_box()
            assert rect and rect["x"] >= 0 and rect["y"] >= 0 and rect["x"]+rect["width"] <= width+1 and rect["y"]+rect["height"] <= height+1, (selector, rect)
        page.screenshot(path=str(Path(tempfile.gettempdir()) / f"diary-3-{width}.png"))
        page.click("#chapterMenuBtn"); page.click("#diaryArchiveBtn")
        assert page.locator("#archiveDiaryContent").is_visible()
        page.click("#closeDiaryArchiveBtn")
    # A legacy chapter-complete save may not have filled completedLevels.
    page.evaluate("game.completedLevels=[];game.saveProgress()")
    page.click("#diaryArchiveBtn")
    assert page.locator("#diaryArchiveNav button:disabled").count() == 4
    assert page.locator("#diaryArchiveNav button").nth(2).is_enabled()
    page.click("#closeDiaryArchiveBtn")
    # Storage failure still permits rereading progress in this session.
    page.evaluate("game.save.load=()=>null;game.completedLevels=[4,7];game.chapterComplete=false")
    page.click("#diaryArchiveBtn")
    assert page.locator("#diaryArchiveNav button:enabled").count() == 2
    page.click("#closeDiaryArchiveBtn")
    assert not errors, errors
    browser.close()
print("PASS: five texts, three chapter endings/reloads, read-only archive, keyboard scrolling and mobile layouts")
