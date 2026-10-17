"""Deterministic Chapter 2 timing, animation, pointer ownership and save regressions."""
import json
import os
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"),
        headless=True,
    )
    page = browser.new_page(viewport={"width": 1200, "height": 700})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    # Stop the render loop so each result uses exactly the requested simulation steps.
    page.evaluate("game.frame=()=>{};game.flags.prologue=true")
    page.wait_for_timeout(60)
    assert page.evaluate("gameArt.failed.length===0")
    assert page.evaluate("Object.keys(CHAPTER_TWO_ART.regions).every(id=>gameArt.images[id]?.width>10)")

    rates = page.evaluate("""()=>[30,60,144].map(fps=>{
      game.loadLevel(6,false);
      const s=game.river.data.storm;s.covered.fill(true);s.tied.fill(true);
      for(let i=0;i<12*fps;i++)game.update(1/fps);
      const storm=JSON.parse(JSON.stringify(s));
      game.loadLevel(7,false);
      const r=game.river.data.reeds;r.path=GAME_LEVELS[7].channel.map(p=>({...p}));r.phase='sailing';
      for(let i=0;i<fps;i++)game.update(1/fps);
      const boat={...r.boat},distance=r.distance;
      game.loadLevel(5,false);game.river.data.chainOpen=true;game.river.data.knots=[0,0,0];
      for(let i=0;i<2*fps;i++)game.update(1/fps);
      return {fps,storm,boat,distance,crossing:game.river.data.crossing};
    })""")
    for r in rates:
        assert abs(r["storm"]["remaining"] - 28) < 1e-7, r
        assert abs(r["storm"]["integrity"] - 94) < 1e-7, r
        assert r["storm"]["tied"] == [False, True, False, True], r
        assert abs(r["storm"]["gust"] - 6) < 1e-7, r
        assert abs(r["distance"] - 100) < 1e-7 and abs(r["crossing"] - 2) < 1e-7, r
        assert abs(r["boat"]["x"] - rates[0]["boat"]["x"]) < 1e-7, r
        assert abs(r["boat"]["y"] - rates[0]["boat"]["y"]) < 1e-7, r

    result = page.evaluate("""()=>{
      game.loadLevel(6,false);const s=game.river.data.storm;
      s.covered.fill(true);s.tied.fill(true);s.remaining=.01;s.gust=.01;
      game.update(.05);const fairDeadline=game.state==='dialogue'&&s.tied.every(Boolean);
      game.loadLevel(6,false);game.river.selectedTarp=true;game.river.handleCargo(3);
      const before={x:game.player.x,y:game.player.y};game.update(.05);
      const speed=Math.hypot(game.player.x-before.x,game.player.y-before.y)/.05;
      game.pause();const frozen=JSON.stringify(game.river.data),actor=JSON.stringify(game.river.actorTween);
      game.update(2);const pause=frozen===JSON.stringify(game.river.data)&&actor===JSON.stringify(game.river.actorTween);
      game.resume();for(let i=0;i<100;i++)game.update(.05);
      const stopped=!game.player.moving&&!game.river.actorTween;
      game.loadLevel(7,false);
      const valid=game.river.snapshot();
      valid.reeds.path=GAME_LEVELS[7].channel.map(p=>({...p}));valid.reeds.phase='sailing';
      const good=RiverChapter.valid(valid);
      const badRoute=structuredClone(valid);badRoute.reeds.path[2]={x:900,y:100};
      const badHide=structuredClone(valid);badHide.reeds.phase='watch';badHide.reeds.camouflaged=false;
      const badCrossing=structuredClone(valid);badCrossing.crossing=5;
      const old=structuredClone(valid);delete old.crossing;delete old.reeds.coating;
      return {fairDeadline,speed,pause,stopped,good,badRoute:RiverChapter.valid(badRoute),badHide:RiverChapter.valid(badHide),badCrossing:RiverChapter.valid(badCrossing),old:RiverChapter.valid(old)};
    }""")
    assert result["fairDeadline"] and result["pause"] and result["stopped"], result
    assert 0 < result["speed"] <= 190.00001, result
    assert result["good"] and result["old"], result
    assert not result["badRoute"] and not result["badHide"] and not result["badCrossing"], result

    page.evaluate("game.loadLevel(7,false)")
    page.mouse.move(535, 500)
    page.mouse.down()
    owner = page.evaluate("game.river.pointerId")
    assert owner is not None
    assert page.evaluate("""()=>{
      const r=game.river,owner=r.pointerId,path=JSON.stringify(r.drawing);
      for(const type of ['pointerdown','pointermove','pointerup','pointercancel'])game.canvas.dispatchEvent(new PointerEvent(type,{pointerId:99,clientX:900,clientY:100}));
      return r.pointerId===owner&&JSON.stringify(r.drawing)===path;
    }""")
    page.evaluate("id=>game.canvas.dispatchEvent(new PointerEvent('pointercancel',{pointerId:id}))", owner)
    assert page.evaluate("game.river.pointerId===null && game.river.drawing===null && game.river.data.reeds.phase==='route'")
    page.mouse.up()
    # Pause during a real captured drag must discard the draft and release capture.
    page.mouse.move(535, 500)
    page.mouse.down()
    page.evaluate("game.pause()")
    assert page.evaluate("game.river.drawing===null && game.river.pointerId===null && game.river.data.reeds.phase==='route'")
    page.mouse.up()
    assert not errors, errors
    print(json.dumps({"result": "PASS", "frameRates": [r["fps"] for r in rates],
                      "checks": ["gust overshoot and exact storm deadline", "boat and chain timing", "bounded running speed", "paused actions", "invalid and legacy river saves", "pointer ownership and cancellation"],
                      "pageErrors": errors}, ensure_ascii=False))
    browser.close()
