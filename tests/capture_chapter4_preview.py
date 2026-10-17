"""Export Chapter 4 scenes from runtime, with an optional 30fps review animation."""
import argparse
import base64
import io
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

parser=argparse.ArgumentParser();parser.add_argument("--animate",action="store_true");args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page();page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"));page.wait_for_function("window.game",timeout=60000)
    page.evaluate("game.frame=()=>{};game.flags.prologue=true")
    def frame(t):
        uri=page.evaluate("""time=>{
          const c=document.createElement('canvas');c.width=1200;c.height=780;const ctx=c.getContext('2d');
          ctx.fillStyle='#172e25';ctx.fillRect(0,0,1200,780);
          const titles=['M12 · Theo dấu vết, mở lối vào hang','M13 · Dựng sạp theo từng bước','M13 · Sạp hoàn thiện, cách nền ẩm','M14 · Chuyền 100 bao trước bình minh'];
          [12,13,13,14].forEach((level,i)=>{
            const x=i%2*600,y=Math.floor(i/2)*390;
            ctx.save();ctx.fillStyle='#ead7aa';ctx.font='bold 17px "Times New Roman"';ctx.fillText(titles[i],x+12,y+25);
            ctx.translate(x,y+40);ctx.scale(.5,.5);game.loadLevel(level,false);const d=game.cave.data;d.time=time;
            if(level===12){Object.assign(d.trail,{compass:true,knife:true,clues:[true,true],phase:'clearing',cleared:Math.floor(time/1.4)%3,workLeft:.6*(1-time%1.4/1.4)});Object.assign(game.player,{x:824,y:466});}
            if(level===13){Object.assign(d.build,{bamboo:[true,true,true],palm:true,tools:true,phase:i===2?'ready':'building',step:i===2?4:Math.min(3,Math.floor(time)),workLeft:.4});Object.assign(game.player,{x:760,y:495});}
            if(level===14)Object.assign(d.relay,{phase:'running',remaining:CHAPTER_FOUR.relay.duration-time,delivered:20,flight:Math.max(1e-8,time%CHAPTER_FOUR.relay.flight/CHAPTER_FOUR.relay.flight)});
            game.scene.render(ctx,game);ctx.restore();
          });return c.toDataURL('image/png');
        }""",t)
        return Image.open(io.BytesIO(base64.b64decode(uri.split(",")[1]))).convert("RGB")
    frame(2.5).save(root/"docs/chapter4-preview.jpg",quality=92)
    if args.animate:
        frames=[frame(n/30) for n in range(240)]
        frames[0].save(root/"docs/chapter4-animation-preview.webp",format="WEBP",save_all=True,append_images=frames[1:],duration=[33,33,34]*80,loop=0,quality=82,method=4)
    browser.close()
print("Chapter 4 preview exported"+(" at 30fps" if args.animate else ""))
