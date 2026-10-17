"""Chapter 4 event deadlines, construction gates and strict v2 save validation."""
import json
import os
import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1200,"height":700});errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));page.wait_for_function("window.game",timeout=60000)
    page.evaluate("game.frame=()=>{};game.flags.prologue=true");page.wait_for_timeout(50)
    rates=page.evaluate("""()=>[24,30,60,144].map(fps=>{
      game.loadLevel(12,false);const t=game.cave.data.trail;Object.assign(t,{compass:true,knife:true,clues:[true,true],phase:'clearing'});game.cave.cut();
      for(let i=0;i<fps;i++)game.update(1/fps);const clearing={count:t.cleared,left:t.workLeft};
      game.loadLevel(13,false);const b=game.cave.data.build;Object.assign(b,{bamboo:[true,true,true],palm:true,tools:true,phase:'building'});game.cave.build(0);
      for(let i=0;i<fps;i++)game.update(1/fps);const building={count:b.step,left:b.workLeft};
      game.loadLevel(14,false);game.cave.primary();game.cave.primary();game.cave.primary();
      for(let i=0;i<8*fps;i++)game.update(1/fps);const relay=structuredClone(game.cave.data.relay);
      return {fps,clearing,building,relay,valid:CaveChapter.valid(game.cave.snapshot())};
    })""")
    for result in rates:
        assert result["clearing"]=={"count":1,"left":0} and result["building"]=={"count":1,"left":0},result
        assert result["relay"]["delivered"]==5 and result["relay"]["flight"]==0 and abs(result["relay"]["remaining"]-202)<1e-7 and result["valid"],result
    checks=page.evaluate("""()=>{
      game.loadLevel(14,false);let r=game.cave.data.relay;
      Object.assign(r,{phase:'running',delivered:95,remaining:CHAPTER_FOUR.relay.flight/2,flight:.5});game.update(CHAPTER_FOUR.relay.flight/2);
      const exact=r.phase==='done'&&r.delivered===100&&game.state==='dialogue'&&!!game.save.load();
      game.loadLevel(14,false);r=game.cave.data.relay;Object.assign(r,{phase:'running',delivered:95,remaining:CHAPTER_FOUR.relay.flight/2-.1,flight:.5});game.update(CHAPTER_FOUR.relay.flight);
      const late=game.state==='failed'&&r.delivered===95&&r.flight<1;
      game.loadLevel(14,false);game.cave.primary();game.cave.primary();game.pause();const before=JSON.stringify(game.cave.data);game.cave.primary();game.update(5);const frozen=before===JSON.stringify(game.cave.data);
      game.resume();game.saveProgress();const saved=!!game.save.load(),good=game.cave.snapshot();
      const both=structuredClone(good);both.relay.flight=.5;
      const badCount=structuredClone(good);badCount.relay.delivered=7;
      const falseOpen=structuredClone(good);falseOpen.trail.phase='open';falseOpen.trail.cleared=3;
      const falseBuild=structuredClone(good);falseBuild.build.phase='ready';falseBuild.build.step=4;
      const falseReady=structuredClone(good);falseReady.relay.phase='ready';
      const falseDone=structuredClone(good);falseDone.relay.phase='done';
      const unsupported=game.save.load();unsupported.level=15;
      return {exact,late,frozen,saved,good:CaveChapter.valid(good),both:CaveChapter.valid(both),badCount:CaveChapter.valid(badCount),falseOpen:CaveChapter.valid(falseOpen),falseBuild:CaveChapter.valid(falseBuild),falseReady:CaveChapter.valid(falseReady),falseDone:CaveChapter.valid(falseDone),unsupported:game.save.valid(unsupported)};
    }""")
    assert all(checks[k] for k in ["exact","late","frozen","saved","good"]),checks
    assert not any(checks[k] for k in ["both","badCount","falseOpen","falseBuild","falseReady","falseDone","unsupported"]),checks
    assert not errors,errors
    print(json.dumps({"result":"PASS","frameRates":[24,30,60,144],"checks":checks,"pageErrors":errors},ensure_ascii=False));browser.close()
