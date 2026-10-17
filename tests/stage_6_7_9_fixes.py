"""Visible cargo protection, intact poling at >=24fps and forgiving hill rhythm."""
import base64
import json
import os
import sys
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding="utf-8")
out = Path(tempfile.gettempdir())
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page(viewport={"width": 1200, "height": 700})
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    # Measure real presentation cadence while the normal game loop is running.
    page.evaluate("game.flags.prologue=true;game.loadLevel(7,false);game.river.data.reeds.path=GAME_LEVELS[7].channel;game.river.data.reeds.phase='sailing'")
    cadence = page.evaluate("""()=>new Promise(resolve=>{
      const times=[],positions=[];let first;
      function sample(now){first??=now;times.push(now);positions.push({...game.river.data.reeds.boat});
        if(now-first<1600)requestAnimationFrame(sample);else resolve({fps:(times.length-1)*1000/(now-first),frames:times.length,moved:Math.hypot(positions.at(-1).x-positions[0].x,positions.at(-1).y-positions[0].y)});
      }requestAnimationFrame(sample);
    })""")
    assert cadence["fps"] >= 24 and cadence["moved"] > 50, cadence
    page.evaluate("game.frame=()=>{}")
    page.wait_for_timeout(60)
    page.evaluate("game.loadLevel(6,false)")
    # Verify rendered tarps actually cover the cargo area, even without board crops.
    protection = page.evaluate("""()=>{
      const c=document.createElement('canvas');c.width=1200;c.height=700;const ctx=c.getContext('2d');
      const river=game.river,s=river.data.storm;
      const a=GAME_LEVELS[6].cargo[0];
      // Use the active renderer attached by loadLevel.
      const renderer=new RiverScene(game);
      renderer.cargoCover(ctx,a,0);const bare=ctx.getImageData(a.x-30,a.y-20,60,40).data.filter((v,i)=>i%4===3&&v>0).length;
      ctx.clearRect(0,0,1200,700);s.covered[0]=true;s.tied[0]=true;river.cargoVisual[0]=1;
      renderer.cargoCover(ctx,a,0);const covered=ctx.getImageData(a.x-30,a.y-20,60,40).data.filter((v,i)=>i%4===3&&v>0).length;
      return {bare,covered,hit:river.cargoAt(a)};
    }""")
    assert protection["bare"] == 0 and protection["covered"] >= 2300 and protection["hit"] == 0, protection
    page.evaluate("game.river.data.storm.covered.fill(true);game.river.data.storm.tied=[true,false,true,false];game.river.cargoVisual.fill(1);game.updateHUD();game.render()")
    page.screenshot(path=str(out / "stage-6-shielding.png"))

    # 48 distinct presentation samples at 24Hz, without switching or slicing poses.
    unique = page.evaluate("""()=>{
      game.loadLevel(7,false);const r=game.river.data.reeds;r.phase='sailing';r.path=GAME_LEVELS[7].channel;
      const c=document.createElement('canvas');c.width=200;c.height=200;const ctx=c.getContext('2d');const frames=new Set();
      const renderer=new RiverScene(game);
      for(let i=0;i<48;i++){ctx.clearRect(0,0,200,200);ctx.save();ctx.translate(100-r.boat.x,100-r.boat.y);renderer.reedBoat(ctx,r,i/24);ctx.restore();frames.add(c.toDataURL());}
      return frames.size;
    }""")
    assert unique == 48, unique
    page.evaluate("game.river.update(.8);game.render()")
    page.screenshot(path=str(out / "stage-7-poling.png"))
    for key in ["riverKienPole", "riverKienMud"]:
        uri = page.evaluate("key=>gameArt.images[key].toDataURL()", key)
        (out / f"{key}-intact.png").write_bytes(base64.b64decode(uri.split(",")[1]))

    hill = page.evaluate("""()=>[.55,1,1.5].map(interval=>{
      game.loadLevel(9,false);let next=0;
      for(let i=0;i<4000&&game.state==='gameplay';i++){
        game.update(.025);if(game.forest.data.hill.slipping)game.forest.secondary();
        else if(game.forest.data.time>=next){game.forest.primary();next=game.forest.data.time+interval;}
      }
      return {interval,state:game.state,progress:game.forest.data.hill.progress,time:game.forest.data.time,valid:ForestChapter.valid(game.forest.snapshot())};
    })""")
    assert all(r["state"] == "dialogue" and r["progress"] == 1 and r["valid"] for r in hill), hill
    feedback = page.evaluate("""()=>{
      game.loadLevel(9,false);game.forest.primary();const initial=game.forest.data.hill.velocity;
      for(let i=0;i<50;i++)game.forest.primary();const noSpam=game.forest.data.hill.velocity===initial;
      game.update(.7);const ready=game.forest.pushTiming().ready;
      game.forest.primary();const reset=game.forest.pushTiming().position===0;
      game.update(2);const before=game.forest.data.hill.velocity;game.forest.primary();const late=game.forest.data.hill.velocity>before;
      game.pause();const freeze=JSON.stringify(game.forest.data);game.update(1);game.forest.push();const frozen=freeze===JSON.stringify(game.forest.data);
      game.resume();game.saveProgress();return {noSpam,ready,reset,late,frozen,saved:!!game.save.load()};
    }""")
    assert all(feedback.values()), feedback
    # The DOM gauge stays readable and beside the real action button at small sizes.
    for width, height in [(1200, 700), (390, 844), (844, 390)]:
        page.set_viewport_size({"width": width, "height": height})
        page.evaluate("game.loadLevel(9,false);game.forest.primary();game.update(.7);game.render()")
        for selector in ["#forestRhythm", "#forestPrimaryBtn", "#forestSecondaryBtn"]:
            rect = page.locator(selector).bounding_box()
            assert rect and rect["x"] >= 0 and rect["y"] >= 0 and rect["x"]+rect["width"] <= width+1 and rect["y"]+rect["height"] <= height+1, (selector, rect)
        assert page.evaluate("""()=>{
          const gauge=document.getElementById('forestRhythm').getBoundingClientRect();
          return ['bagBtn','hintBtn','pauseBtn','forestPrimaryBtn','forestSecondaryBtn'].every(id=>{
            const button=document.getElementById(id).getBoundingClientRect();
            return gauge.right<=button.left||gauge.left>=button.right||gauge.bottom<=button.top||gauge.top>=button.bottom;
          });
        }"""), "Rhythm gauge must not cover any controls"
        page.screenshot(path=str(out / f"stage-9-rhythm-{width}.png"))
    assert not errors, errors
    print(json.dumps({"result": "PASS", "presentation": cadence, "polingSamplesAt24fps": unique, "hillCadences": hill, "feedback": feedback, "pageErrors": errors}, ensure_ascii=False))
    browser.close()
