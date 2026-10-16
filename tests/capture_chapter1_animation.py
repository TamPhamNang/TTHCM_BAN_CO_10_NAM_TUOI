"""Create a visual review loop using the actual runtime sprite renderer."""
import base64
import os
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page()
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    frames = []
    for i in range(60):
        data = page.evaluate("""phase => {
          const c = document.createElement('canvas'); c.width = 960; c.height = 440;
          const ctx = c.getContext('2d'); ctx.fillStyle = '#243a30'; ctx.fillRect(0,0,960,440);
          const cases = [
            ['Đi ngang · khớp liên tục', false, 'walk', 'right', phase / 1.6],
            ['Đi lên', false, 'walk', 'up', phase / 1.6],
            ['Đi xuống', false, 'walk', 'down', phase / 1.6],
            ['Chạy', false, 'run', 'right', phase / 1.6],
            ['Cải trang', true, 'walk', 'right', phase / 1.6],
            ['Lính xét vé', false, 'guard', 'left', phase * gameArt.guardWalk.length / 12]
          ];
          cases.forEach(([name,costume,state,direction,time],i) => {
            const x=i%3*320, y=Math.floor(i/3)*220;
            ctx.fillStyle='#1d3028';ctx.fillRect(x+8,y+8,304,204);
            ctx.fillStyle='#eed8a7';ctx.font='16px \"Times New Roman\"';ctx.fillText(name,x+20,y+34);
            ctx.strokeStyle='#8e8b64';ctx.beginPath();ctx.moveTo(x+28,y+188);ctx.lineTo(x+292,y+188);ctx.stroke();
            ctx.save();ctx.translate(x+160,y+160);ctx.scale(1.7,1.7);
            gameArt.setCostume(costume);
            if(state==='guard')gameArt.npc(ctx,'guardWalk',0,0,86,time);
            else gameArt.character(ctx,0,0,state,direction,time,false,null,{blend:1});
            ctx.restore();
          });
          return c.toDataURL();
        }""", i / 60)
        import io
        frames.append(Image.open(io.BytesIO(base64.b64decode(data.split(",", 1)[1]))).convert("RGB"))
    output = root / "docs" / "chapter1-animation-preview.gif"
    frames[0].save(output, save_all=True, append_images=frames[1:], duration=20, loop=0, disposal=2)
    print(output.name)
    browser.close()
