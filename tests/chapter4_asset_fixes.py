"""Unbuilt workshop, sprite choreography and migration of pre-slowdown saves."""
import json
import os
import tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page(viewport={"width":1200,"height":700});errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));page.wait_for_function("window.game",timeout=60000)
    page.evaluate("game.frame=()=>{};game.flags.prologue=true");page.wait_for_timeout(50)
    result=page.evaluate("""()=>{
      game.loadLevel(13,false);
      const scene=new CaveScene(game),c=document.createElement('canvas');c.width=1200;c.height=700;
      scene.platform(c.getContext('2d'),0);
      const unbuilt=!c.getContext('2d').getImageData(0,0,1200,700).data.some(Boolean);
      const stages=[];
      for(let step=1;step<=4;step++){
        const ctx=c.getContext('2d');ctx.clearRect(0,0,1200,700);scene.platform(ctx,step);
        const a=ctx.getImageData(0,0,1200,700).data;let left=1200,right=0,top=700,bottom=0;
        for(let y=0;y<700;y++)for(let x=0;x<1200;x++)if(a[(y*1200+x)*4+3]>100){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
        stages.push({left,right,top,bottom});
      }
      const old=game.cave.snapshot();delete old.relay.tempo;Object.assign(old.relay,{phase:'running',remaining:45,delivered:25,flight:.4});
      const validOld=CaveChapter.valid(old),restored=new CaveChapter(game,old).data.relay;
      const frames=Object.fromEntries(Object.entries(gameArt.relayFrames).map(([id,bank])=>[id,bank.length]));
      const spec=CHAPTER_FOUR.relay;
      const handoffs=[];
      for(let bag=0;bag<5;bag++)for(let station=0;station<4;station++){
        const release=bag*spec.cadence+station*spec.stationDelay+spec.releaseAt;
        const donor=scene.relayPose(station,release+.001),receiver=scene.relayPose(station+1,release+spec.receiveAt+.02);
        handoffs.push(donor.phase>=spec.releaseAt&&receiver.frame>=CHAPTER_FOUR_ART.relaySheets[receiver.id].receive);
      }
      return {unbuilt,stages,validOld,restored,frames,handoffs,failed:gameArt.failed};
    }""")
    assert result["unbuilt"] and result["validOld"] and not result["failed"],result
    assert result["restored"]["remaining"]==105 and result["restored"]["delivered"]==25 and result["restored"]["flight"]==.4,result
    assert list(result["frames"].values())==[30,30,30,24,30],result
    assert all(result["handoffs"]),result
    assert all(710<=s["left"]<s["right"]<=1010 and 350<=s["top"]<s["bottom"]<=515 for s in result["stages"]),result
    for step in [0,1,4]:
        page.evaluate("step=>{game.loadLevel(13,false);Object.assign(game.cave.data.build,{bamboo:[true,true,true],palm:true,tools:true,phase:step===4?'ready':'building',step});Object.assign(game.player,{x:760,y:495});game.updateHUD();game.render()}",step)
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter4-fix-workshop-{step}.png"))
    for i,t in enumerate([0,.4,.65,1.4,2.1,3.2,4.8,6.4,7.3]):
        page.evaluate("t=>{game.loadLevel(14,false);Object.assign(game.cave.data.relay,{phase:'running',remaining:200,flight:Math.max(1e-8,t/CHAPTER_FOUR.relay.flight)});game.updateHUD();game.render()}",t)
        page.screenshot(path=str(Path(tempfile.gettempdir())/f"chapter4-fix-relay-{i}.png"))
    assert not errors,errors
    print(json.dumps({"result":"PASS",**result,"pageErrors":errors}));browser.close()
