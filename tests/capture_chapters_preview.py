"""Regenerate chapter contact sheets with runtime art and Times New Roman labels."""
import base64
import argparse
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument("--chapter",type=int,choices=[1,2]);args=parser.parse_args()
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get("CHROME_PATH","C:/Program Files/Google/Chrome/Application/chrome.exe"),headless=True)
    page=browser.new_page()
    page.goto(os.environ.get("GAME_URL","http://127.0.0.1:8000/"))
    page.wait_for_function("window.game",timeout=60000)
    for chapter,name in [(1,"chapter1-graphics-preview.jpg"),(2,"chapter2-preview.jpg")]:
        if args.chapter and args.chapter!=chapter:continue
        data=page.evaluate("""chapter=>{
          const c=document.createElement('canvas');c.width=1920;c.height=1232;const ctx=c.getContext('2d');
          ctx.fillStyle='#162d25';ctx.fillRect(0,0,c.width,c.height);
          const levels=chapter===1?[1,2,3,4]:[5,6,7,0];
          levels.forEach((level,i)=>{
            const x=i%2*960,y=Math.floor(i/2)*616;
            ctx.fillStyle='#ead8af';ctx.font='bold 24px "Times New Roman"';
            ctx.fillText(level?`Màn ${level} · ${GAME_LEVELS[level].name}`:'Chữ trong giao diện và tài sản',x+20,y+34);
            ctx.save();ctx.translate(x,y+56);ctx.scale(.8,.8);
            if(level){
              game.inventory=['compass','notebook'];game.flags={prologue:true};
              if(level===2||level===3)game.give('disguise');
              game.loadLevel(level,false);
              if(level===2){game.train.seated=true;game.train.hidden=[0,1,2];}
              if(level===5){Object.assign(game.river.data,{chainOpen:true,crossing:2.5,knots:[0,0,0],distraction:40,time:5});Object.assign(game.player,{x:480,y:350});}
              if(level===6){game.river.data.storm.covered=[true,true,true,false];game.river.cargoVisual=[1,1,1,0];game.river.data.storm.tied=[true,false,true,false];game.river.data.time=4;game.river.cargoAction={kind:'tie',elapsed:.3};}
              if(level===7){game.river.data.reeds.path=GAME_LEVELS[7].channel;game.river.data.reeds.phase='sailing';game.river.update(1.2);}
              game.scene.render(ctx,game);
            }else{
              ctx.fillStyle='#20382c';ctx.fillRect(0,0,1200,700);
              gameArt.draw(ctx,'pass',320,480,480);gameArt.draw(ctx,'uiHintBook',875,480,550);
              ctx.fillStyle='#f1dfb8';ctx.font='24px "Times New Roman"';ctx.textAlign='center';
              ctx.fillText('Giấy thông hành · Times New Roman',320,550);ctx.fillText('Trang sổ sạch · Chữ đặt bằng HTML',875,550);
            }
            ctx.restore();
          });
          return c.toDataURL('image/jpeg',.9);
        }""",chapter)
        (root/'docs'/name).write_bytes(base64.b64decode(data.split(',')[1]))
        print(name)
    browser.close()
