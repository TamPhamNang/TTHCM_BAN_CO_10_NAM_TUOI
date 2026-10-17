"""Chapter 3 clocks, late cover orders, pause, keyboard and malformed save checks."""
import json
import os
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1200,"height":700})
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));page.wait_for_function("window.game",timeout=60000)
    page.evaluate("game.frame=()=>{};game.flags.prologue=true");page.wait_for_timeout(60)
    results=page.evaluate("""()=>[30,60,144].map(fps=>{
      game.loadLevel(9,false);game.forest.primary();for(let i=0;i<6*fps;i++)game.update(1/fps);
      const hill=structuredClone(game.forest.data.hill);
      game.loadLevel(8,false);const pack=game.forest.data.pack;pack.loads=[4,2,2,1];pack.phase='departing';
      for(let i=0;i<3*fps;i++)game.update(1/fps);const departure={phase:pack.phase,time:pack.departure,state:game.state};
      game.loadLevel(11,false);for(let i=0;i<3*fps;i++)game.update(1/fps);
      const alarm=game.forest.data.air;game.forest.primary();for(let i=0;i<3;i++)game.forest.secondary();
      for(let i=0;i<6*fps;i++)game.update(1/fps);
      return {fps,hill,departure,air:structuredClone(alarm)};
    })""")
    for r in results:
        assert r["hill"]["slipping"] and abs(r["hill"]["slipLeft"]-2.5)<1e-7,r
        assert abs(r["hill"]["progress"]-results[0]["hill"]["progress"])<1e-7,r
        assert r["departure"]=={"phase":"done","time":3,"state":"dialogue"},r
        assert r["air"]["phase"]=="flyover" and abs(r["air"]["watch"]-6)<1e-7,r
        assert all(group["progress"]==1 for group in r["air"]["groups"]),r
    checks=page.evaluate("""()=>{
      game.loadLevel(11,false);game.update(7.8);game.forest.primary();for(let i=0;i<3;i++)game.forest.secondary();game.update(2);
      const lateOrder=game.state==='failed'&&game.forest.data.air.groups.every(g=>g.progress<1);
      game.loadLevel(11,false);game.update(3);game.forest.primary();game.forest.secondary();game.update(.2);
      game.pause();const before=JSON.stringify(game.forest.data);game.update(5);const frozen=before===JSON.stringify(game.forest.data);
      game.resume();game.update(1.5);const groupDone=game.forest.data.air.groups[0].progress===1;
      const good=game.forest.snapshot(),badLoad=structuredClone(good),badGroups=structuredClone(good),badCamp=structuredClone(good);
      badLoad.pack.loads[0]=5;badGroups.air.groups[1].cover=badGroups.air.groups[0].cover;badGroups.air.groups[1].progress=1;
      badCamp.camp.phase='ready';
      game.saveProgress();const save=game.save.load();
      return {lateOrder,frozen,groupDone,good:ForestChapter.valid(good),badLoad:ForestChapter.valid(badLoad),badGroups:ForestChapter.valid(badGroups),badCamp:ForestChapter.valid(badCamp),saved:!!save};
    }""")
    assert all(checks[k] for k in ["lateOrder","frozen","groupDone","good","saved"]),checks
    assert not any(checks[k] for k in ["badLoad","badGroups","badCamp"]),checks
    page.evaluate("game.loadLevel(9,false)")
    page.keyboard.press("e");page.evaluate("game.update(.025);game.input.endFrame()")
    assert page.evaluate("game.forest.data.hill.velocity>0")
    page.evaluate("game.update(5.6)");page.keyboard.press("c");page.evaluate("game.update(.025);game.input.endFrame()")
    assert page.evaluate("game.forest.data.hill.braced && !game.forest.data.hill.slipping")
    page.evaluate("game.loadLevel(11,false);game.update(3)")
    page.keyboard.press("e");page.evaluate("game.update(.025);game.input.endFrame()")
    assert page.evaluate("game.forest.data.air.whistled")
    page.mouse.click(825,520);page.mouse.click(335,355)
    assert page.evaluate("game.forest.data.air.groups[2].cover===1")
    assert not errors,errors
    print(json.dumps({"result":"PASS","frameRates":[30,60,144],"checks":["analytic hill motion and slip timing","exact departure deadline","five-second cover deadline and carried time","late orders cannot use time after deadline","paused group movement","malformed saves","E/C keys and pointer group/cover orders"],"pageErrors":errors},ensure_ascii=False))
    browser.close()
