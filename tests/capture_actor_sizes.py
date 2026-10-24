"""Review every scene at the same canvas scale, including special action poses."""
import base64
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page()
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    page.wait_for_function('window.game',timeout=60000)
    page.evaluate('game.frame=()=>{}')
    for action in [False,True]:
        uri=page.evaluate("""action=>{
          const c=document.createElement('canvas');c.width=1800;c.height=1800;const ctx=c.getContext('2d');
          for(let i=0;i<15;i++){
            const level=i+1;ctx.save();ctx.translate(i%3*600,Math.floor(i/3)*360);ctx.scale(.5,.5);
            game.flags={prologue:true};game.inventory=['compass','notebook'];game.loadLevel(level,false);
            if(action){
              if(level===1){game.startPrologue();game.dialogue.active=false;game.state='gameplay';}
              if(level===2)game.train.seated=true;
              if(level===5)game.river.data.crouched=true,game.river.crouchBlend=1;
              if(level===6)game.river.cargoAction={kind:'tie',elapsed:.3};
              if(level===7){game.river.data.reeds.phase='sailing';}
              if(level===10)Object.assign(game.forest.data.camp,{phase:'serving',served:.4});
              if(level===11)Object.assign(game.forest.data.air,{phase:'alarm',whistled:true,shelterTime:.2});
              if(level===12)game.cave.data.trail.compass=true;
              if(level===13)Object.assign(game.cave.data.build,{phase:'building',workLeft:.4});
              if(level===14)Object.assign(game.cave.data.relay,{phase:'running',flight:.2});
              if(level===15)Object.assign(game.supper.data,{phase:'sprinkle',ingredients:true,spoon:true});
            }
            game.scene.render(ctx,game);ctx.fillStyle='#fff';ctx.font='bold 28px serif';ctx.fillText('M'+level,30,50);ctx.restore();
          }
          return c.toDataURL('image/jpeg',.9);
        }""",action)
        target=Path(__file__).resolve().parents[1]/'docs'/('characters-actions.jpg' if action else 'characters-preview.jpg')
        target.write_bytes(base64.b64decode(uri.split(',')[1]))
    browser.close()
print('Exported actor sizes for M1–M15 and action poses')
