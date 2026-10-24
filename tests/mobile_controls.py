"""Real touch viewport: orientation gate, timer freeze and contextual controls."""
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    page.wait_for_function("window.game",timeout=60000)
    page.evaluate("game.frame=()=>{}")
    assert page.locator("#rotateDevice").is_visible()
    page.screenshot(path=str(root/"docs/mobile-rotate.png"))
    page.evaluate("game.flags.prologue=true;game.loadLevel(6,false)")
    assert page.evaluate("()=>{const before=JSON.stringify(game.river.data);game.update(10);return before===JSON.stringify(game.river.data)}")
    page.set_viewport_size({"width":844,"height":390})
    page.wait_for_function("!game.mobile.blocked")
    def load(level):
        page.evaluate("level=>{game.loadLevel(level,false);game.render()}",level)
    def tap(id):
        page.locator('#'+id).tap()
        page.evaluate("game.render()")
    def bounds(id):
        box=page.locator('#'+id).bounding_box()
        assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=845 and box['y']+box['height']<=391,(id,box)
        assert box['height']>=44,(id,box)
    for level in range(1,16):
        load(level)
        assert not page.locator('#rotateDevice').is_visible()
        assert page.locator('#mobileActions').is_visible(),level
        bounds('mobilePrimary')
        for id in ['mobileSecondary','mobileExtra','mobileRun']:
            if page.locator('#'+id).is_visible():bounds(id)
        assert not page.locator('#interactBtn').is_visible()
    load(5);tap('mobileSecondary');assert page.evaluate('game.river.data.crouched')
    load(6);tap('mobilePrimary');assert page.evaluate('game.river.selectedTarp')
    load(8)
    for carrier,capacity in enumerate([4,2,2,1]):
        for _ in range(capacity):page.locator(f'[data-carrier="{carrier}"][data-delta="1"]').tap()
    tap('mobilePrimary');assert page.evaluate("game.forest.data.pack.phase==='departing'")
    load(9);tap('mobilePrimary');assert page.evaluate('game.forest.data.hill.lastPush>=0')
    load(11);tap('mobileExtra');assert page.evaluate('game.forest.data.air.selected===1')
    load(14);tap('mobilePrimary');assert page.evaluate("game.cave.data.relay.phase==='running'")
    tap('mobilePrimary');assert page.evaluate('game.cave.data.relay.held')
    tap('mobilePrimary');assert page.evaluate('game.cave.data.relay.flight>0')
    load(4);tap('mobilePrimary');assert page.evaluate('game.dock.crouched')
    tap('mobilePrimary');assert not page.evaluate('game.dock.crouched')
    page.locator('[data-direction="1,0"]').tap();assert page.evaluate('game.dock.moves===1')
    tap('mobileSecondary');assert page.evaluate('game.dock.moves===0')
    load(15)
    page.evaluate("Object.assign(game.player,{x:383,y:438})")
    tap('mobilePrimary');assert page.evaluate('game.supper.data.ingredients')
    # Hold joystick and run simultaneously, then cancel both by rotating.
    stick=page.locator('#moveStick').bounding_box();run=page.locator('#mobileRun').bounding_box()
    touch=page.context.new_cdp_session(page)
    touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[
        {'x':stick['x']+stick['width']-4,'y':stick['y']+stick['height']/2,'id':9},
        {'x':run['x']+run['width']/2,'y':run['y']+run['height']/2,'id':10}]})
    assert page.evaluate("game.input.movement().x>0&&game.input.isDown('shift')")
    before=page.evaluate('game.player.x');page.evaluate('game.update(.1)');assert page.evaluate('game.player.x')>before
    page.set_viewport_size({"width":390,"height":844});page.wait_for_function('game.mobile.blocked')
    touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    assert page.evaluate("!game.input.isDown('shift')&&game.input.analog.x===0")
    assert page.evaluate("()=>{const before=JSON.stringify(game.supper.data);game.update(10);return before===JSON.stringify(game.supper.data)}")
    page.set_viewport_size({"width":844,"height":390});page.wait_for_function('!game.mobile.blocked')
    for width,height in [(568,320),(667,375),(896,414),(1024,768)]:
        page.set_viewport_size({"width":width,"height":height});load(8)
        for button in page.locator('#forestLoadGrid button').all():
            box=button.bounding_box()
            assert box and box['x']>=0 and box['y']>=0 and box['x']+box['width']<=width+1 and box['y']+box['height']<=height+1,box
            assert box['height']>=44 and box['width']>=44,box
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
    # Large tablets also require landscape.
    page.set_viewport_size({"width":1024,"height":1366});page.wait_for_function('game.mobile.blocked')
    assert page.locator('#rotateDevice').is_visible()
    page.set_viewport_size({"width":844,"height":390});page.wait_for_function('!game.mobile.blocked')
    for level in [4,8,9,12,13,14,15]:
        load(level)
        target=root/f"docs/mobile-m{level}.png" if level in [9,15] else Path(tempfile.gettempdir())/f"mobile-m{level}.png"
        page.screenshot(path=str(target))
    # Reading the end diary must still scroll with a real finger gesture.
    load(14);page.evaluate('game.finishChapter();game.render()')
    diary=page.locator('#chapterDiaryContent').bounding_box()
    x=diary['x']+diary['width']/2;y=diary['y']+diary['height']*.8
    touch.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':x,'y':y,'id':11}]})
    for step in range(1,13):
        touch.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y-step*12,'id':11}]})
        page.wait_for_timeout(35)
    touch.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    page.wait_for_function("document.getElementById('chapterDiaryContent').scrollTop>0")
    assert not errors,errors
    desktop=browser.new_page(viewport={"width":1280,"height":800})
    desktop.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));desktop.wait_for_function('window.game',timeout=60000)
    assert not desktop.locator('#rotateDevice').is_visible()
    assert not desktop.locator('#mobileActions').is_visible()
    # Browser responsive mode without touch emulation must enforce rotation too.
    desktop.set_viewport_size({"width":390,"height":844})
    desktop.wait_for_function('game.mobile.blocked')
    assert desktop.locator('#rotateDevice').is_visible()
    desktop.evaluate('game.frame=()=>{};game.loadLevel(15,false)')
    assert desktop.evaluate("()=>{const before=JSON.stringify(game.supper.data);game.update(10);return before===JSON.stringify(game.supper.data)}")
    desktop.set_viewport_size({"width":844,"height":390})
    desktop.wait_for_function('!game.mobile.blocked')
    desktop.evaluate('game.render()')
    assert not desktop.locator('#rotateDevice').is_visible()
    assert desktop.locator('#mobilePrimary').is_visible()
    desktop.set_viewport_size({"width":1280,"height":800})
    desktop.wait_for_function('!game.mobile.enabled')
    desktop.evaluate('game.render()')
    assert not desktop.locator('#mobileActions').is_visible()
    # The initial portrait instruction must work with all scripts disabled.
    no_js=browser.new_context(viewport={"width":390,"height":844},java_script_enabled=False)
    initial=no_js.new_page();initial.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    assert initial.locator('#rotateDevice').is_visible()
    assert not initial.locator('#mainMenu').is_visible()
    no_js.close()
    browser.close()
print('PASS: mobile portrait freeze, landscape controls M1–M15, touch actions, joystick/run, desktop isolation')
