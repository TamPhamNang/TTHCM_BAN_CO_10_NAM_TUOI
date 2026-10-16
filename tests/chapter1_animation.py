"""Animation/motion regressions; run with the local HTTP server active."""
import json
import os
from playwright.sync_api import sync_playwright


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=os.environ.get("CHROME_PATH", "C:/Program Files/Google/Chrome/Application/chrome.exe"), headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 800}, device_scale_factor=2)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(os.environ.get("GAME_URL", "http://127.0.0.1:8000/"))
    page.wait_for_function("window.game", timeout=60000)
    result = page.evaluate("""async () => {
      const assert = (condition, message) => { if (!condition) throw new Error(message); };
      const motion = [];
      for (const rate of [30, 60, 144]) {
        game.loadLevel(1, false);
        game.player = new Player(600, 420);
        game.travel = Array.from({length: 20}, (_, i) => ({x: 620 + i * 20, y: 420}));
        const deltas = [];
        for (let i = 0; i < rate; i++) {
          const x = game.player.x; game.updateWalk(1 / rate); game.player.updateVisual(1 / rate);
          deltas.push(game.player.x - x);
        }
        const error = Math.max(...deltas.map(d => Math.abs(d - 115 / rate)));
        assert(Math.abs(game.player.x - 715) < 1e-6, 'Path movement must spend all its distance budget');
        assert(error < 1e-6, 'No speed dips at 20px waypoints');
        assert(Math.abs(game.player.animationTime - 1) < 1e-6, 'Gait clock follows actual movement');
        motion.push({rate, x: game.player.x, maxStepError: error});
      }
      const banks = [gameArt.frames, gameArt.disguiseFrames];
      let maxAngleError = 0;
      for (const rate of [30, 60, 144]) for (let n = 0; n < 24; n++) {
        const angle = .193 + n * Math.PI / 12, player = new Player(600, 350);
        game.input.analog = {x: Math.cos(angle), y: Math.sin(angle)};
        for (let i = 0; i < rate; i++) player.update(1 / rate, game.input, new CollisionSystem(1200, 700));
        const error = Math.hypot(player.x - 600 - Math.cos(angle) * 115, player.y - 350 - Math.sin(angle) * 115);
        maxAngleError = Math.max(maxAngleError, error);
        assert(error < 1e-6, 'Analog movement must preserve arbitrary angles at every refresh rate');
      }
      game.input.resetAnalog();
      game.loadLevel(1, false);
      const target = {x: 713.21, y: 463.87};
      game.walkTo(target);
      assert(game.travel.length === 1 && game.travel[0].x === target.x && game.travel[0].y === target.y, 'Open terrain uses an exact unsnapped destination');
      for (let i = 0; i < 300 && game.travel.length; i++) game.updateWalk(1 / 60);
      assert(Math.hypot(game.player.x - target.x, game.player.y - target.y) < 1e-6, 'Arrive exactly at pointer destination');
      game.player = new Player(600, 420); game.walkTo({x: 300, y: 300});
      assert(game.travel.length > 1, 'Route around the camp table');
      let previous = {x: 600, y: 420};
      for (const node of game.travel) { assert(game.collision.clearPath(previous, node), 'Each path segment clears expanded obstacle corners'); previous = node; }
      for (let i = 0; i < 1000 && game.travel.length; i++) {
        game.updateWalk(1 / 60); assert(!game.collision.blocks(game.player.getRect()), 'Continuous movement cannot enter an obstacle');
      }
      assert(!game.travel.length && Math.hypot(game.player.x - 300, game.player.y - 300) < 1e-6, 'Detour reaches its destination');
      const cycleFrames = [];
      for (let i = 0; i < 60; i++) {
        const c = document.createElement('canvas'); c.width = 220; c.height = 220;
        const ctx = c.getContext('2d'); ctx.scale(2, 2);
        gameArt.character(ctx, 55, 85, 'walk', 'right', i / 60, false, null, {blend: 1, heading: 0});
        cycleFrames.push(c.toDataURL());
      }
      const uniqueGaitFrames = new Set(cycleFrames).size;
      assert(uniqueGaitFrames >= 55, 'Gait is evaluated continuously instead of holding poses at 12fps');
      const gaitClock = game.player.animationTime;
      game.player.moving = false; game.player.updateVisual(1);
      assert(game.player.animationTime === gaitClock, 'Stopping must not reset gait phase and snap the legs');
      for (const bank of banks) {
        const scale = bank.idle[0].sprite.scale;
        assert(Object.values(bank).flat().every(f => f.sprite.scale === scale && f.sprite.anchorY === 320), 'All poses share scale and anchor');
        assert(bank.walk.every(f => f.sprite.source.width >= 110 && f.sprite.source.height >= 165), 'Use native-resolution whole figures');
      }
      const normal = gameArt.frames.walk;
      assert(normal[7].sprite.sourceRect[0] < 1210 && normal[8].sprite.sourceRect[2] > 110, 'Last walk poses must retain backpack and legs');
      assert(gameArt.images.guard.sourceRect[1] + gameArt.images.guard.sourceRect[3] < 282, 'Guard boots must not be clipped by the idle row');
      assert(gameArt.guardWalk.every(f => f.sprite.sourceRect[1] + f.sprite.sourceRect[3] < 542), 'Guard walk boots must be complete');
      const rasterAt = x => {
        const c = document.createElement('canvas'); c.width = 512; c.height = 512;
        const ctx = c.getContext('2d'); ctx.scale(2, 2);
        gameArt.painter.draw(ctx, gameArt.frames.idle[0], x, 100);
        return ctx.getImageData(0, 0, 512, 512).data;
      };
      const pixelsA = rasterAt(100.1), pixelsB = rasterAt(100.2);
      assert(pixelsA.every((value, i) => value === pixelsB[i]), 'Subpixel motion must not re-filter the face between backing pixels');
      game.loadLevel(4, false);
      game.moveDock(1, 0);
      assert(game.dock.player.x === 3 && game.dockDisplay().player.x === 2, 'Puzzle logic and visual start remain distinct');
      assert(game.dockTween.duration === .30, 'Walk takes 300ms per cell');
      const movesBeforeSpam = game.dock.moves;
      for (let i=0;i<20;i++) game.moveDock(1,0);
      assert(game.dock.moves === movesBeforeSpam, 'Repeated clicks cannot skip or accelerate the current step');
      game.update(.075); const quarter = game.dockDisplay().player.x;
      assert(Math.abs(quarter - 2.25) < 1e-6, 'Dock actor moves through quarter step');
      game.pause(); game.update(.5);
      assert(game.dockDisplay().player.x === quarter, 'Pause freezes visual tween');
      game.resume(); game.update(.075);
      assert(Math.abs(game.dockDisplay().player.x - 2.5) < 1e-6, 'Resume continues without a jump');
      game.update(.15);
      assert(game.dockDisplay().player.x === 3, 'Tween arrives exactly at its logical cell');
      game.dockTween = null; game.dock.player = {x: 2, y: 2};
      game.moveDock(1, 0);
      assert(game.dockTween.duration === .40, 'Pushing a heavy sack takes 400ms per cell');
      game.update(.20);
      assert(game.dock.boxes[0].x === 4 && Math.abs(game.dockDisplay().boxes[0].x - 3.5) < 1e-6, 'Pushed sacks interpolate with the actor');
      const dockMotion = [];
      for (const rate of [30, 60, 144]) {
        game.loadLevel(4, false); game.input.keys.add('d');
        for (let i = 0; i < rate; i++) game.update(1 / rate);
        game.input.keys.clear();
        const x = game.dockDisplay().player.x;
        assert(Math.abs(x - (2 + 1 / .30)) < 1e-6, 'Held movement stays at the slower walk speed without pauses between steps');
        dockMotion.push({rate, x});
      }
      const pushMotion = [];
      for (const rate of [30,60,144]) {
        game.loadLevel(4,false);game.dock.player={x:2,y:2};game.input.keys.add('d');
        for(let i=0;i<rate;i++)game.update(1/rate);
        game.input.keys.clear();
        const x=game.dockDisplay().player.x;
        assert(Math.abs(x-4.5)<1e-6, 'Held pushing keeps 400ms cadence at every refresh rate');
        pushMotion.push({rate,x});
      }
      game.loadLevel(1, false); game.update(.016); game.render();
      let changes = 0;
      const observer = new MutationObserver(ms => changes += ms.length);
      observer.observe(document.getElementById('hud'), {subtree: true, childList: true, attributes: true, characterData: true});
      const ticks = []; let last = performance.now();
      for (let i = 0; i < 120; i++) { await new Promise(requestAnimationFrame); const now = performance.now(); ticks.push(now - last); last = now; }
      observer.disconnect(); ticks.sort((a, b) => a - b);
      assert(changes <= 2, 'Unchanged HUD must not be rebuilt on every frame');
      return {motion, maxAngleError, uniqueGaitFrames, dockMotion, pushMotion, idleHudMutations: changes, frameIntervalMedianMs: ticks[60], frameIntervalP95Ms: ticks[114], deviceScale: devicePixelRatio};
    }""")
    assert not errors, errors
    print(json.dumps({"result": "PASS", **result, "pageErrors": errors}))
    browser.close()
