"""Run with a local HTTP server: python tests/chapter1_browser.py.

Requires Python Playwright and an installed Chrome. Override GAME_URL/CHROME_PATH
for another machine. Screenshots go to the OS temp directory.
"""
import json
import os
from pathlib import Path
import sys
import tempfile
from playwright.sync_api import sync_playwright
from transition_helpers import advance_scene, settle_chapter

sys.stdout.reconfigure(encoding="utf-8")
URL = os.environ.get("GAME_URL", "http://127.0.0.1:8000/")
CHROME = os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe")


def run():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROME, headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(URL)
        page.wait_for_function("window.game !== undefined", timeout=60000)
        assert not page.evaluate("gameArt.failed"), "Missing artwork"
        assert page.evaluate("Object.values(CHAPTER_ATLAS.boards).every(name => !!gameArt.images[name])"), "All source boards must load, including the winter train"
        assert page.evaluate("Object.keys(CHAPTER_ATLAS.regions).every(id => !!gameArt.images[id])"), "Atlas regions must be available"
        assert page.evaluate("gameArt.frames.walk.length===9 && gameArt.frames.walk.every(f => f.sprite.sourceRect[2]>=110 && f.sprite.sourceRect[3]>=165)"), "Full-resolution walk frames must retain the complete figure"
        assert page.evaluate("gameArt.disguiseFrames.walk.length===8 && gameArt.disguiseFrames.walk.every(f => f.sprite.sourceRect[2]>=140 && f.sprite.sourceRect[3]>=210)"), "Disguise frames must not be cut by fixed columns"
        assert page.locator("#continueBtn").is_disabled()
        assert page.title().startswith("Hạt Muối")

        def screenshot(name):
            page.screenshot(path=str(Path(tempfile.gettempdir()) / f"chapter1-{name}.png"))

        def dialogue():
            for _ in range(15):
                if page.evaluate("game.state") != "dialogue":
                    settle_chapter(page)
                    return
                page.click("#dialogueNextBtn")
            raise AssertionError("Dialogue did not finish")

        def reload_continue():
            page.reload()
            page.wait_for_function("window.game !== undefined", timeout=60000)
            page.click("#continueBtn")

        def object_click(id):
            point = page.evaluate("""id => {
                const o = game.objects().find(o => o.id === id);
                const image = gameArt.images[id];
                const x = o.art?.x ?? o.x, y = o.art ? o.art.bottom - o.art.width * image.height / image.width * (o.art.squashY || 1) / 2 : o.y;
                return {x: game.viewOffsetX + x * game.viewScale,
                        y: game.viewOffsetY + y * game.viewScale};
            }""", id)
            page.mouse.click(point["x"], point["y"])
            # Fast-forward actual movement logic, rather than teleporting the player.
            result = page.evaluate("""() => {
                for (let i = 0; i < 1000 && game.travel.length; i++) game.updateWalk(.05);
                return {pending: game.pendingObject?.id, moving: game.travel.length,
                    blocked: game.collision.blocks(game.player.getRect())};
            }""")
            assert not result["moving"] and not result["pending"] and not result["blocked"], result

        def world_click(x, y):
            point = page.evaluate("([x,y]) => ({x:game.viewOffsetX+x*game.viewScale,y:game.viewOffsetY+y*game.viewScale})", [x, y])
            page.mouse.click(point["x"], point["y"])

        screenshot("menu")
        page.evaluate("localStorage.setItem('historical_air_defense_save_v1', 'legacy-sentinel')")
        page.click("#startBtn")
        page.focus("#dialogueNextBtn")
        page.keyboard.press("Enter")
        page.wait_for_timeout(100)
        assert page.evaluate("game.dialogue.index") == 1, "Enter must advance exactly one line"
        screenshot("prologue")
        dialogue()
        assert page.evaluate("game.prologueRoom && game.inventory.length === 0"), "Gifts require an interaction with Bac"
        object_click("bac"); dialogue()
        assert page.evaluate("!!game.giftTween && !game.has('compass')"), "Gift travels to Kien before entering the bag"
        assert page.evaluate("(() => { game.pause(); const t=game.giftTween.elapsed; game.update(1); return game.giftTween.elapsed===t; })()"), "Pause freezes gift transfer"
        page.click("#resumeBtn")
        page.wait_for_function("game.has('compass')")
        assert page.evaluate("!game.has('notebook')"), "Receive each gift separately"
        reload_continue()
        assert page.evaluate("game.prologueRoom && game.has('compass') && game.state === 'gameplay'"), "Resume the gift encounter"
        object_click("bac"); dialogue()
        page.wait_for_function("game.has('notebook')")
        screenshot("gifts")
        object_click("bac"); dialogue()
        assert page.evaluate("!game.prologueRoom && game.flags.prologue"), "Thank Bac before entering the camp"
        assert page.evaluate("game.inventory") == ["compass", "notebook"]
        stick = page.locator("#moveStick").bounding_box()
        cx, cy = stick['x'] + stick['width']/2, stick['y'] + stick['height']/2
        before_stick = page.evaluate("({x:game.player.x,y:game.player.y})")
        page.mouse.move(cx+28, cy+9); page.mouse.down(); page.wait_for_timeout(180); page.mouse.up()
        after_stick = page.evaluate("({x:game.player.x,y:game.player.y,axis:game.input.analog})")
        assert after_stick['x'] > before_stick['x'] and abs((after_stick['y']-before_stick['y'])/(after_stick['x']-before_stick['x']) - 9/28) < .0001, "Pointer joystick preserves a non-cardinal angle"
        assert after_stick['axis'] == {'x':0,'y':0}, "Releasing the pointer resets movement"
        page.wait_for_timeout(80)
        assert abs(page.evaluate("game.player.x") - after_stick['x']) < .0001, "No stuck movement after release"
        before = page.evaluate("game.player.x")
        page.keyboard.down("ArrowRight"); page.wait_for_timeout(150); page.keyboard.up("ArrowRight")
        assert page.evaluate("game.player.x") > before, "Arrow controls must move Kiên"
        screenshot("camp")
        # Cannot depart without all three supplies.
        object_click("departure"); dialogue()
        assert page.evaluate("game.level") == 1
        object_click("disguise")
        reload_continue()
        assert page.evaluate("game.has('disguise')")
        object_click("pass"); object_click("gold")
        page.click("#bagBtn"); screenshot("inventory"); page.click("#closeJournalBtn")
        object_click("departure"); dialogue()
        assert page.evaluate("game.state") == "transition"
        reload_continue()
        assert page.evaluate("game.state") == "transition"
        advance_scene(page); dialogue()
        assert page.evaluate("game.level") == 2
        assert page.evaluate("gameArt.disguised && !!gameArt.disguiseFrames"), "Train scene uses the disguise sheet"
        # Time pauses in journal and pause menu.
        page.click("#hintBtn")
        assert page.evaluate("(() => {const n=game.train.remaining;game.update(5);return n===game.train.remaining})()")
        page.click("#closeJournalBtn"); page.click("#pauseBtn")
        assert page.evaluate("(() => {const n=game.train.remaining;game.update(5);return n===game.train.remaining})()")
        page.click("#resumeBtn")
        # Timeout is recoverable with a fresh timer.
        page.evaluate("game.train.remaining=.01;game.update(.05)")
        assert page.evaluate("game.state") == "failed"
        advance_scene(page); dialogue()
        assert page.evaluate("game.train.remaining > 40")
        world_click(353, 572); world_click(937, 350)
        reload_continue()
        assert page.evaluate("game.train.hidden") == [0]
        world_click(437, 572); world_click(937, 350)
        # Drag the last bar.
        point = page.evaluate("() => [game.viewOffsetX,game.viewOffsetY,game.viewScale]")
        ox, oy, scale = point
        page.mouse.move(ox + 521 * scale, oy + 572 * scale)
        page.mouse.down(); page.mouse.move(ox + 937 * scale, oy + 350 * scale); page.mouse.up()
        assert len(page.evaluate("game.train.hidden")) == 3
        screenshot("train")
        world_click(745, 574)
        assert page.evaluate("game.state === 'seating' && !game.train.seated"), "Sit action has a visible transition"
        page.wait_for_function("game.state === 'dialogue'")
        screenshot("train-seated")
        dialogue()
        assert page.evaluate("game.state") == "journal"
        page.locator(".inventory-item").filter(has_text="La bàn").click()
        assert page.evaluate("game.state") == "journal"
        page.locator(".inventory-item").filter(has_text="Giấy thông hành").click(); dialogue()
        assert page.evaluate("game.state") == "transition"
        advance_scene(page); dialogue()
        # Help tasks are gated by items, with progress retained across reloads.
        object_click("agreement"); dialogue()
        assert page.evaluate("game.state") == "gameplay"
        object_click("cart"); dialogue()
        assert not page.evaluate("!!game.flags.cart")
        object_click("tools"); object_click("cart"); dialogue()
        reload_continue()
        assert page.evaluate("game.flags.cart && !game.has('tools')")
        object_click("bucket"); object_click("well")
        assert page.evaluate("game.has('water') && !game.has('bucket')")
        object_click("villagers"); dialogue()
        assert page.evaluate("game.flags.water && !game.has('water')")
        screenshot("salt")
        object_click("agreement"); dialogue()
        advance_scene(page); dialogue()
        assert page.evaluate("game.level") == 4
        assert not page.evaluate("gameArt.disguised"), "Dock scene uses the soldier push/crouch poses"
        # Illegal movement, crouch, undo and beam detection.
        assert page.evaluate("(() => {const d=new DockPuzzle();d.move(-1,0);return !d.move(-1,0) && d.player.x===1})()")
        page.click("#crouchBtn")
        assert page.evaluate("(() => {const n=game.dock.moves;game.moveDock(1,0);game.dock.elapsed=2.2;game.updateDock(1.5);return game.dock.moves===n && game.state==='gameplay'})()")
        page.click("#crouchBtn")
        page.evaluate("game.dock.elapsed=2.2;game.updateDock(1.2)")
        assert page.evaluate("game.state") == "failed"
        advance_scene(page); dialogue()
        page.evaluate("game.moveDock(1,0)")
        page.click("#undoBtn")
        assert page.evaluate("game.dock.moves===0 && game.dock.player.x===2")
        # Solve through the same movement rules as keyboard/pointer controls.
        first = [[0,-1]] * 3 + [[1,0]] * 4
        # Finish each visual step; searchlight behavior is exercised separately above.
        dock_moves = "moves => moves.forEach(([x,y])=>{ game.moveDock(x,y); if(game.dockTween) game.dockTween.elapsed=game.dockTween.duration; })"
        page.evaluate(dock_moves, first)
        reload_continue()
        assert page.evaluate("game.dock.moves") == 7
        assert page.evaluate("game.dock.history.length") == 7
        screenshot("dock")
        rest = [[-1,0]] * 4 + [[0,1]] + [[1,0]] * 4 + [[-1,0]] * 4 + [[0,1]] + [[1,0]] * 4
        page.evaluate(dock_moves, rest)
        dialogue()
        assert page.evaluate("game.state") == "chapterEnd"
        assert page.evaluate("game.completedLevels") == [1,2,3,4]
        reload_continue()
        assert page.evaluate("game.state") == "chapterEnd"
        screenshot("end")
        assert page.evaluate("localStorage.getItem('historical_air_defense_save_v1')") == "legacy-sentinel"
        # Defensive load: valid JSON with a malformed schema must not crash.
        assert page.evaluate("(() => {const s=new SaveSystem('test-bad');localStorage.setItem(s.key,'{\"version\":2,\"level\":2}');const ok=s.load()===null;s.clear();return ok})()")
        # Small portrait and landscape layouts: controls stay inside viewport.
        page.click("#replayBtn"); dialogue()
        for width, height in [(390,844),(844,390)]:
            page.set_viewport_size({"width":width,"height":height})
            screenshot(f"mobile-{width}")
            for id in ["bagBtn","hintBtn","pauseBtn","moveStick","interactBtn"]:
                box=page.locator(f"#{id}").bounding_box()
                assert box and box['x'] >= 0 and box['y'] >= 0 and box['x']+box['width'] <= width+1 and box['y']+box['height'] <= height+1, (id,box)
            interact=page.locator("#interactBtn").bounding_box()
            bag=page.locator("#bagBtn").bounding_box()
            assert interact['x']+interact['width'] <= bag['x'] or interact['y']+interact['height'] <= bag['y'] or bag['y']+bag['height'] <= interact['y'], "Interaction must not overlap the bag on small screens"
        assert not errors, errors
        print(json.dumps({"result":"PASS", "checks":["interactive gifts and reload", "gift animation pause", "360 pointer joystick and release", "4-stage playthrough", "item gates", "click pathfinding", "train click and drag", "pause and timeout", "wrong document retry", "Sokoban undo and beam", "reload checkpoints", "legacy save retained", "malformed save", "mobile layouts"], "page_errors":errors}, ensure_ascii=False))
        browser.close()


if __name__ == "__main__":
    run()
