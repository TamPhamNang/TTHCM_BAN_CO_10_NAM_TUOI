"""Capture actual Chapter 2 rendering; assemble a local animation review artifact."""
import base64
import io
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"),
        headless=True,
    )
    page = browser.new_page()
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    page.evaluate("game.frame=()=>{}")
    frames = []
    for n in range(100):
        uri = page.evaluate("""t=>{
          const c=document.createElement('canvas');c.width=960;c.height=624;const ctx=c.getContext('2d');
          ctx.fillStyle='#162d25';ctx.fillRect(0,0,c.width,c.height);ctx.scale(.8,.8);
          const titles=['M5 · Mở tời, thuyền qua trạm','M6 · Trải bạt và buộc dây','M7 · Chống sào vào bãi lau','M7 · Phủ thuyền, chờ tuần tra'];
          [5,6,7,7].forEach((level,i)=>{
            const x=(i%2)*600,y=Math.floor(i/2)*390;
            ctx.save();ctx.fillStyle='#ead8af';ctx.font='bold 18px "Times New Roman"';ctx.fillText(titles[i],x+14,y+26);
            ctx.translate(x,y+40);ctx.scale(.5,.5);
            game.flags={prologue:true};game.inventory=['compass','notebook'];game.loadLevel(level,false);
            const d=game.river.data;d.time=t;
            if(level===5){Object.assign(d,{chainOpen:true,crossing:t,knots:[0,0,0],distraction:42-t});Object.assign(game.player,{x:480,y:350});}
            if(level===6){
              d.storm.covered.fill(true);d.storm.tied=[true,false,true,false];game.river.cargoVisual=[1,1,1,Math.min(1,t*1.8)];
              Object.assign(game.player,{x:650,y:370});game.river.cargoAction={kind:'tie',elapsed:t};
            }
            if(i===2){
              const r=d.reeds;r.path=GAME_LEVELS[7].channel;r.phase='sailing';game.river.update(t*.65);d.time=t;
            }
            if(i===3){
              const r=d.reeds;r.boat={...GAME_LEVELS[7].channel.at(-1)};r.coating=Math.min(1,t/1.6);r.camouflaged=t>=1.6;
              r.phase=t<1.6?'camouflaging':'watch';r.watch=Math.max(0,8-(t-1.6)*3.3);
              Object.assign(game.player,{x:r.boat.x-52,y:r.boat.y+22});
            }
            game.scene.render(ctx,game);ctx.restore();
          });
          return c.toDataURL('image/png');
        }""", n / 25)
        frames.append(Image.open(io.BytesIO(base64.b64decode(uri.split(",")[1]))).convert("RGB"))
    target = root / "docs/chapter2-animation-preview.webp"
    # Animated WebP keeps the painted backgrounds sharp with a much smaller file
    # than a full photographic GIF and preserves continuous color gradients.
    frames[0].save(target, format="WEBP", save_all=True, append_images=frames[1:], duration=40, loop=0, quality=82, method=4)
    print(f"{target.name}: {target.stat().st_size} bytes")
    browser.close()
