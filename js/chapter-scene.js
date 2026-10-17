// Chapter_1 backgrounds and sprites share world coordinates with interactions.
class ChapterScene extends SceneRenderer {
  constructor(art) { super(art); this.board = {x: 240, y: 155, size: 64}; this.ambient = new Map(); this.backgrounds = new Map(); }
  background(ctx, name) {
    const source = this.art.images[name];
    if (!source) return false;
    const transform = ctx.getTransform(), rx = Math.hypot(transform.a, transform.b), ry = Math.hypot(transform.c, transform.d);
    const w = Math.round(1200 * rx), h = Math.round(700 * ry), key = `${name}:${w}:${h}`;
    let cached = this.backgrounds.get(key);
    if (!cached) {
      cached = document.createElement("canvas"); cached.width = w; cached.height = h;
      const cc = cached.getContext("2d"); cc.imageSmoothingQuality = "high"; cc.drawImage(source, 0, 0, w, h);
      if (this.backgrounds.size >= 6) this.backgrounds.clear();
      this.backgrounds.set(key, cached);
    }
    ctx.drawImage(cached, 0, 0, w / rx, h / ry); return true;
  }
  ambientFor(level, width, height) {
    const key = `${level}:${width}:${height}`;
    if (this.ambient.has(key)) return this.ambient.get(key);
    const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d"), backdrop = this.art.images[GAME_LEVELS[level]?.background || {1: "can_cu", 2: "toa_tau_hoa", 3: "lang_muoi", 4: "ben_thuyen"}[level]];
    if (backdrop) {
      const scale = Math.max(width / backdrop.width, height / backdrop.height);
      ctx.globalAlpha = .32; ctx.filter = "blur(15px)";
      ctx.drawImage(backdrop, (width - backdrop.width * scale) / 2, (height - backdrop.height * scale) / 2, backdrop.width * scale, backdrop.height * scale);
    }
    if (this.ambient.size > 7) this.ambient.clear();
    this.ambient.set(key, canvas); return canvas;
  }
  label(ctx, text, x, y, color = "#f2e3b8", size = 13) {
    ctx.save(); ctx.font = `600 ${size}px \"Times New Roman\"`; ctx.textAlign = "center";
    const width = ctx.measureText(text).width + 20;
    ctx.fillStyle = "#182c24e8"; ctx.beginPath(); ctx.roundRect(x - width / 2, y - size - 4, width, size + 13, 4); ctx.fill();
    ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
  }
  panel(ctx, x, y, w, h, color, stroke = "#b39d70") {
    ctx.fillStyle = color; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  }
  render(ctx, game) {
    if(game.cave){game.caveScene.render(ctx);return;}
    if(game.forest){game.forestScene.render(ctx);return;}
    if(game.river){game.riverScene.render(ctx);return;}
    if (game.prologueRoom) { this.prologue(ctx, game); return; }
    if (game.level === 1) this.camp(ctx, game);
    if (game.level === 2) this.trainScene(ctx, game);
    if (game.level === 3) this.saltFields(ctx, game);
    if (game.level === 4) this.dockScene(ctx, game);
  }
  camp(ctx, game) {
    if (!this.background(ctx, "can_cu")) { ctx.fillStyle = "#767b54"; ctx.fillRect(0, 0, 1200, 700); }
    this.worldObjects(ctx, game);
    this.vignette(ctx, .18);
  }
  worldObjects(ctx, game, draws = []) {
    const target = game.objectiveTarget();
    for (const object of game.objects()) {
      const complete = object.id === "cart" && game.flags.cart || object.id === "villagers" && game.flags.water;
      if (!object.art) this.marker(ctx, object.x, object.y, "", complete, 24);
      draws.push({y: object.y + 14, draw: () => {
        if (object.art) {
          const a = object.art;
          ctx.save(); ctx.translate(a.x, a.bottom); ctx.rotate(a.angle || 0);
          ctx.scale(1, a.squashY || 1);
          ctx.shadowColor = "#1b170d99"; ctx.shadowBlur = 3; ctx.shadowOffsetY = 2;
          this.art.draw(ctx, object.id, 0, 0, a.width); ctx.restore();
        } else if (object.npc) {
          this.art.npc(ctx, object.id === "cart" ? "farmer" : object.id === "villagers" ? "woman" : "bang", object.x, object.y);
        } else if (object.id !== "well") {
          if (this.art.images[object.id]) this.art.draw(ctx, object.id, object.x, object.y + 10, object.id === "tools" ? 38 : 48);
          else {
            ctx.fillStyle = "#e4d3a1"; ctx.beginPath(); ctx.arc(object.x, object.y - 13, 20, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#354735"; ctx.font = "27px \"Times New Roman\""; ctx.textAlign = "center";
            ctx.fillText(object.icon, object.x, object.y - 4);
          }
        }
        const label = complete ? (object.id === "cart" ? "Xe đã sửa ✓" : "Đã mang nước ✓") : object.label;
        this.label(ctx, label, object.art?.x ?? object.x, object.art?.labelY ?? object.y + 45, target?.id === object.id ? "#ffda87" : "#e9e1c7", 11);
      }});
    }
    draws.push({y: game.player.y + 14, draw: () => game.player.render(ctx)});
    draws.sort((a, b) => a.y - b.y).forEach(draw => draw.draw());
    if (target) {
      const x = target.art?.x ?? target.x, y = target.art ? target.art.labelY - 24 : target.y - 66;
      ctx.fillStyle = "#f3cd76"; ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x - 7, y - 12); ctx.lineTo(x + 7, y - 12); ctx.fill();
    }
  }
  vignette(ctx, strength = .3) {
    const shade = ctx.createRadialGradient(600, 330, 170, 600, 350, 740);
    shade.addColorStop(0, "#10231b00"); shade.addColorStop(1, `rgba(7,18,16,${strength})`);
    ctx.fillStyle = shade; ctx.fillRect(0, 0, 1200, 700);
  }
  prologue(ctx, game) {
    this.background(ctx, "room");
    this.art.npc(ctx, "bac", 365, 450, 114);
    this.art.npc(ctx, "bang", 830, 450, 108);
    game.player.render(ctx);
    if (game.state === "gameplay") {
      const object = game.objects()[0];
      this.marker(ctx, object.x, object.y, "", false, 26);
      this.label(ctx, object.label, 365, 500, "#ffdf91", 13);
      for (const [i, id] of ["compass", "notebook"].entries()) {
        const x = 975 + i * 130;
        this.art.draw(ctx, id, x, 150, 42);
        this.label(ctx, game.has(id) ? "Đã nhận ✓" : "Chưa nhận", x, 187, game.has(id) ? "#cfe7b7" : "#e6d2a4", 11);
      }
    }
    if (game.giftTween) {
      const t = game.giftTween, p = t.elapsed / t.duration, ease = p * p * (3 - 2 * p);
      this.art.draw(ctx, t.item, t.from.x + (t.to.x - t.from.x) * ease,
        t.from.y + (t.to.y - t.from.y) * ease - Math.sin(p * Math.PI) * 45, 38);
    }
    const glow = ctx.createRadialGradient(750, 280, 0, 750, 280, 200);
    glow.addColorStop(0, "#f4c45e24"); glow.addColorStop(1, "#00000000");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1200, 700);
    this.vignette(ctx, .36);
    this.label(ctx, "HÀ NỘI · MÙA ĐÔNG 1945", 600, 90, "#f3d59d", 19);
  }
  goldAt(p, train) {
    for (const [i, rect] of CHAPTER_ONE.trainLayout.goldSlots.entries()) if (!train.hidden.includes(i) && this.contains(p, rect)) return i;
    return null;
  }
  contains(p, rect) { return p.x >= rect.x && p.x <= rect.x + rect.width && p.y >= rect.y && p.y <= rect.y + rect.height; }
  inBasket(p) { return this.contains(p, CHAPTER_ONE.trainLayout.basket.hit); }
  objectAt(p, objects) {
    return objects.find(o => {
      if (!o.art) return Math.hypot(o.x - p.x, o.y - p.y) < 55;
      const a = o.art, image = this.art.images[a.id || o.id];
      if (!image) return false;
      const height = a.width * image.height / image.width * (a.squashY || 1);
      return Math.abs(a.x - p.x) < Math.max(28, a.width / 2 + 12) && p.y > Math.min(a.bottom - height - 12, (a.labelY ?? a.bottom) - 20) && p.y < a.bottom + 12;
    });
  }
  seatedPassenger(ctx, id, {x, bottom, height, mirror = false}) {
    const image = this.art.images[id]; if (!image) return;
    const width = height * image.width / image.height;
    ctx.save(); ctx.fillStyle = "#100d0a42"; ctx.beginPath(); ctx.ellipse(x + 4, bottom - 2, width * .3, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, bottom); if (mirror) ctx.scale(-1, 1);
    ctx.drawImage(image, -width / 2, -height, width, height); ctx.restore();
  }
  trainScene(ctx, game) {
    if (!this.background(ctx, "toa_tau_hoa")) { ctx.fillStyle = "#413e35"; ctx.fillRect(0, 0, 1200, 700); }
    const layout = CHAPTER_ONE.trainLayout, basket = layout.basket;
    for (const passenger of layout.passengers.filter(p => p.bottom < 400)) this.seatedPassenger(ctx, passenger.art, passenger);
    this.seatedPassenger(ctx, "trainGrandma", layout.grandma);
    const pose = game.trainDisplay();
    ctx.save(); ctx.translate(pose.x, pose.y); ctx.scale(1.55, 1.55);
    if (pose.seat > 0) {
      const seated = this.art.images.kienSeated;
      const fade = seated ? Math.min(1, pose.seat * 2) : 0;
      if (fade < 1) {
        ctx.save(); ctx.globalAlpha = 1 - fade;
        this.art.painter.sit(ctx, this.art.disguiseFrames.side[0], 0, 0, pose.seat); ctx.restore();
      }
      if (seated) {
        ctx.save(); ctx.globalAlpha = fade;
        this.art.draw(ctx, "kienSeated", 0, 14 + 3 * pose.seat, 76 * seated.width / seated.height); ctx.restore();
      }
    }
    else this.art.character(ctx, 0, 0, pose.walk ? "walk" : "idle", "right", game.trainPose?.elapsed || 0, false, null, {blend: pose.walk ? 1 : 0});
    ctx.restore();
    if (game.train.seated) this.label(ctx, "Kiên · Đang ngồi yên", layout.seat.x, 379, "#d8e6bc", 11);
    const guardX = 1110 - (45 - game.train.remaining) * 7;
    this.art.npc(ctx, game.train.seated ? "guardInspect" : "guardWalk", guardX, 411, 106, 45 - game.train.remaining);
    this.label(ctx, "Lính xét vé đang tới…", guardX, 314, "#f3c18b", 11);
    ctx.save(); ctx.fillStyle = "#120d0955"; ctx.beginPath(); ctx.ellipse(basket.x, basket.bottom - 1, 32, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    this.art.draw(ctx, "basket", basket.x, basket.bottom, basket.width);
    this.label(ctx, `Giỏ cam · ${game.train.hidden.length}/3 thỏi đã giấu`, basket.x, 433, "#ffdc90", 11);
    for (const passenger of layout.passengers.filter(p => p.bottom >= 400)) this.seatedPassenger(ctx, passenger.art, passenger);
    this.label(ctx, "VÀNG TRONG TÚI · CHỌN RỒI CHẠM GIỎ CAM", 438, 534, "#eddbb4", 11);
    for (const [i, slot] of layout.goldSlots.entries()) {
      this.panel(ctx, slot.x, slot.y, slot.width, slot.height, game.selectedGold === i ? "#9b7d37ee" : "#1e3027ee");
      if (!game.train.hidden.includes(i)) this.art.draw(ctx, "goldBar", slot.x + slot.width / 2, slot.y + 39, 44);
      else this.label(ctx, "✓", slot.x + slot.width / 2, slot.y + 29, "#c9e1a5", 16);
    }
    const button = layout.sitButton;
    this.panel(ctx, button.x, button.y, button.width, button.height, game.train.hidden.length === 3 ? "#526645ee" : "#312e26ee");
    ctx.fillStyle = "#f0e6bd"; ctx.font = "bold 16px \"Times New Roman\""; ctx.textAlign = "center";
    ctx.fillText(game.train.seated ? "Đưa giấy từ ba lô ↑" : game.trainPose ? "Đang ngồi xuống…" : "Ngồi vào ghế", button.x + button.width / 2, button.y + 30);
    this.label(ctx, "CHUYẾN TÀU ĐÊM · HÀ NỘI → NAM ĐỊNH", 665, 83, "#eed6a0", 14);
    this.vignette(ctx, .24);
  }
  saltFields(ctx, game) {
    if (!this.background(ctx, "lang_muoi")) { ctx.fillStyle = "#a1b2a6"; ctx.fillRect(0, 0, 1200, 700); }
    this.art.draw(ctx, game.flags.cart ? "cartRepaired" : "cart", 810, 255, 125);
    if (game.flags.cart) this.label(ctx, "✓", 805, 240, "#e1efb7", 16);
    this.worldObjects(ctx, game);
    this.vignette(ctx, .14);
  }
  dockCell(p) { return {x: Math.floor((p.x - this.board.x) / this.board.size), y: Math.floor((p.y - this.board.y) / this.board.size)}; }
  dockCenter(p) { return {x: this.board.x + (p.x + .5) * this.board.size, y: this.board.y + (p.y + .5) * this.board.size}; }
  dockScene(ctx, game) {
    const d = game.dock, b = this.board, display = game.dockDisplay();
    if (!this.background(ctx, "ben_thuyen")) { ctx.fillStyle = "#172f38"; ctx.fillRect(0, 0, 1200, 700); }
    ctx.fillStyle = "#10252c44"; ctx.fillRect(0, 0, 1200, 700);
    ctx.strokeStyle = "#729b9422"; ctx.lineWidth = 2;
    for (let i = 0; i < 45; i++) {
      const x = (i * 137 + d.elapsed * 12) % 1200, y = 100 + i * 73 % 560;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 36, y); ctx.stroke();
    }
    // Physical planks, cargo and sacks replace the opaque placeholder puzzle board.
    ctx.fillStyle = "#07131788"; ctx.fillRect(b.x + 44, b.y + 48, b.size * 8 + 38, b.size * 5 + 38);
    for (let y = 0; y < 7; y++) for (let x = 0; x < 10; x++) {
      const wall = d.at(d.walls, x, y);
      const left = b.x + x * b.size, top = b.y + y * b.size;
      if (wall) {
        this.art.draw(ctx, "cargoCrate", left + b.size / 2, top + b.size, b.size - 3);
      } else {
        ctx.fillStyle = "#66503a"; ctx.fillRect(left, top, b.size, b.size);
        if (this.art.images.dockPlanks) ctx.drawImage(this.art.images.dockPlanks, left, top, b.size, b.size);
        ctx.fillStyle = x >= 7 ? "#caa35b33" : "#1d211e28"; ctx.fillRect(left, top, b.size, b.size);
        ctx.strokeStyle = "#281f1b88"; ctx.lineWidth = 1; ctx.strokeRect(left, top, b.size, b.size);
      }
    }
    d.goals.forEach(g => {
      const p = this.dockCenter(g); ctx.strokeStyle = "#edd595"; ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 23, p.y - 23, 46, 46);
      ctx.fillStyle = "#e9d29d44"; ctx.fillRect(p.x - 22, p.y - 22, 44, 44);
      this.art.draw(ctx, "rope", p.x, p.y + 18, 32, .6);
    });
    display.boxes.forEach(box => {
      const p = this.dockCenter(box), done = d.at(d.goals, box.x, box.y);
      ctx.fillStyle = "#0c17185c"; ctx.beginPath(); ctx.ellipse(p.x + 3, p.y + 23, 23, 8, 0, 0, Math.PI * 2); ctx.fill();
      this.art.draw(ctx, "saltBag", p.x, p.y + 24, 43);
      if (done) {
        ctx.fillStyle = "#344a30"; ctx.beginPath(); ctx.arc(p.x + 19, p.y - 17, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e9d29d"; ctx.font = "bold 12px \"Times New Roman\""; ctx.textAlign = "center"; ctx.fillText("✓", p.x + 19, p.y - 13);
      }
    });
    const beamX = b.x + (d.beamColumn() + .5) * b.size;
    const light = ctx.createLinearGradient(beamX - 32, 0, beamX + 32, 0);
    light.addColorStop(0, "#ffe9ab08"); light.addColorStop(.5, "#ffe9ab66"); light.addColorStop(1, "#ffe9ab08");
    ctx.fillStyle = light; ctx.fillRect(beamX - 32, b.y + 64, 64, 320);
    ctx.strokeStyle = "#efd38d77"; ctx.lineWidth = 1; ctx.strokeRect(beamX - 32, b.y + 64, 64, 320);
    ctx.fillStyle = "#ffe4a31a"; ctx.beginPath(); ctx.moveTo(435, 42); ctx.lineTo(beamX - 32, b.y + 64); ctx.lineTo(beamX + 32, b.y + 64); ctx.closePath(); ctx.fill();
    const p = this.dockCenter(display.player);
    const action = game.dockTween && game.dockTween.elapsed < game.dockTween.duration ? game.dockVisual.state : "idle";
    this.art.character(ctx, p.x, p.y, d.crouched ? "crouch" : action, game.dockFacing || "right", game.dockAnimationTime);
    this.art.npc(ctx, "worker", 175, 538);
    this.art.draw(ctx, "lantern", 1020, 540, 33);
    this.art.draw(ctx, "saltBag", 1070, 555, 44);
    const danger = d.exposed(display.player.x) && !d.crouched;
    this.label(ctx, danger ? "ĐÈN TỚI! C · NGỒI THẤP" : d.crouched ? "ĐANG NẤP · CHỜ ĐÈN ĐI QUA" : "ĐÈN ĐANG QUÉT · HÃY QUAN SÁT", 590, 125, danger ? "#ffb08a" : "#f0d69d", 15);
    this.label(ctx, "BẾN THUYỀN · THÁNG 3/1946", 600, 85, "#eadbb2", 18);
    this.label(ctx, "Khoang thuyền →", 1010, 420, "#e4c78a", 14);
  }
  miniMap(game) {
    const canvas = document.getElementById("miniMapCanvas"), ctx = canvas.getContext("2d");
    ctx.fillStyle = "#293f34"; ctx.fillRect(0, 0, 160, 100);
    if (game.level === 1 && this.art.images.can_cu) ctx.drawImage(this.art.images.can_cu, 0, 0, 160, 100);
    else if (this.art.images[{2: "toa_tau_hoa", 3: "lang_muoi", 4: "ben_thuyen"}[game.level]]) {
      ctx.drawImage(this.art.images[{2: "toa_tau_hoa", 3: "lang_muoi", 4: "ben_thuyen"}[game.level]], 0, 0, 160, 100);
    } else {
      ctx.strokeStyle = "#b2a178"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(10, 60); ctx.lineTo(150, 55); ctx.stroke();
    }
    let player = game.player;
    if (game.level === 4) {
      player = this.dockCenter(game.dockDisplay().player);
      game.dock.goals.forEach(g => { const p = this.dockCenter(g); ctx.fillStyle = "#e4c579"; ctx.fillRect(p.x / 7.5 - 2, p.y / 7 - 2, 4, 4); });
    }
    const target = game.objectiveTarget();
    if (target) { ctx.fillStyle = "#ffd77b"; ctx.beginPath(); ctx.arc(target.x / 7.5, target.y / 7, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = "#fff7db"; ctx.beginPath(); ctx.arc(player.x / 7.5, player.y / 7, 3, 0, Math.PI * 2); ctx.fill();
  }
}
