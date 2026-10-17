"""Capture native Chapter 3 rendering; --animate also exports a small WebP review."""
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
    page.evaluate("game.frame=()=>{}")
    render="""({t,animated})=>{
      const c=document.createElement('canvas');c.width=animated?960:1920;c.height=animated?624:1248;
      const ctx=c.getContext('2d'),scale=c.width/2400;ctx.scale(scale,scale);ctx.fillStyle='#162d25';ctx.fillRect(0,0,2400,1560);
      [8,9,10,11].forEach((level,i)=>{
        const x=(i%2)*1200,y=Math.floor(i/2)*780;
        ctx.save();ctx.translate(x,y);ctx.fillStyle='#ead8af';ctx.font='bold 30px "Times New Roman"';ctx.fillText(`Màn ${level} · ${GAME_LEVELS[level].name}`,22,43);ctx.translate(0,80);
        game.flags={prologue:true};game.inventory=['compass','notebook'];game.loadLevel(level,false);
        const f=game.forest,d=f.data;d.time=t;
        if(level===8){d.pack.loads=[4,2,2,1];if(animated){d.pack.phase='departing';d.pack.departure=t;}}
        if(level===9){Object.assign(d.hill,{progress:.22+t*.07,velocity:.08,slipping:t>2.3,slipLeft:3-(t-2.3)});}
        if(level===10){
          Object.assign(game.player,{x:575,y:455});f.light={x:animated?470:989,y:animated?380:380};d.camp.revealed=true;
          if(animated)Object.assign(d.camp,{phase:'brewing',herb:true,wood:true,flint:true,sparks:3,brew:t*2});
        }
        if(level===11){
          Object.assign(d.air,{phase:t<1.2?'alarm':'flyover',whistled:true,shelterTime:Math.min(1.6,t),watch:7-Math.max(0,t-1.2)});
          d.air.groups=[0,1,2].map(cover=>({cover,progress:animated?Math.min(1,t/1.1):1}));
        }
        game.scene.render(ctx,game);ctx.restore();
      });return c.toDataURL(animated?'image/png':'image/jpeg',.92);
    }"""
    static=page.evaluate(render,{"t":2.5,"animated":False})
    (root/"docs/chapter3-preview.jpg").write_bytes(base64.b64decode(static.split(",")[1]))
    print("chapter3-preview.jpg")
    if args.animate:
        frames=[]
        for n in range(75):
            uri=page.evaluate(render,{"t":n/25,"animated":True})
            frames.append(Image.open(io.BytesIO(base64.b64decode(uri.split(",")[1]))).convert("RGB"))
        target=root/"docs/chapter3-animation-preview.webp"
        frames[0].save(target,format="WEBP",save_all=True,append_images=frames[1:],duration=40,loop=0,quality=82,method=4)
        print(f"{target.name}: {target.stat().st_size} bytes")
    browser.close()
