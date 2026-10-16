class SceneRenderer {
  constructor(art) {
    this.art = art;
    this.terrain = new Map();
    this.layouts = {
      2: [...M2_MAP.buildings.map(b => [b.art, b.x, b.y, b.width]), ...M2_MAP.props],
      3: [
        ["nha_kho_2", 465, 280, 175], ["khu_nghi_ngoi", 675, 510, 175],
        ["coc_chi_duong", 210, 260, 52], ["thung_go", 340, 135, 50],
        ["bao_tai", 550, 260, 80], ["bao_tai", 850, 540, 100],
        ["cong_chinh", 1080, 210, 195], ["cot_den_duong", 1100, 520, 42]
      ],
      4: [
        ["bao_tai", 263, 135, 125], ["thung_go", 535, 420, 82],
        ["nha_kho_2", 805, 270, 195], ["bao_tai", 985, 485, 180],
        ["bo_dam", 135, 185, 62], ["cot_den_duong", 1120, 550, 42],
        ["coc_chi_duong", 420, 590, 46]
      ],
      5: [
        ["don_vi", 1000, 238, 310], ["khu_nghi_ngoi", 610, 195, 280],
        ["khu_bep", 610, 550, 280], ["cong_chinh", 200, 575, 230],
        ["cot_co", 880, 375, 63], ["ghe_go", 745, 425, 92],
        ["bo_dam", 1100, 380, 55], ["bang_thong_tin", 390, 270, 90],
        ["cot_den_duong", 380, 465, 42]
      ]
    };
  }

  terrainFor(level) {
    if (this.terrain.has(level)) return this.terrain.get(level);
    const canvas = document.createElement("canvas"); canvas.width = 1200; canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (level === 2 && this.art.images[M2_MAP.background]) {
      // Share one world-coordinate mapping between the background, buildings and minimap.
      ctx.drawImage(this.art.images[M2_MAP.background], 0, 0, canvas.width, canvas.height);
      this.terrain.set(level, canvas);
      return canvas;
    }
    let seed = level * 731 + 19;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    ctx.fillStyle = "#606442"; ctx.fillRect(0, 0, 1200, 700);
    const glow = ctx.createRadialGradient(650, 340, 70, 600, 350, 730);
    glow.addColorStop(0, "#85805a"); glow.addColorStop(1, "#35452e");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1200, 700);
    for (let i = 0; i < 9500; i++) {
      ctx.fillStyle = ["#a29464", "#434e32", "#73754b", "#8d875a"][Math.floor(random() * 4)];
      ctx.globalAlpha = .08 + random() * .18;
      ctx.fillRect(random() * 1200, random() * 700, 1 + random() * 6, 1 + random() * 3);
    }
    ctx.globalAlpha = 1;
    const road = (points, width) => {
      for (const [stroke, extra] of [["rgba(37,43,25,.2)", 18], ["#8d8059", 7], ["#a3946c", 0]]) {
        ctx.strokeStyle = stroke; ctx.lineWidth = width + extra; ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
      }
    };
    if (level === 2) {
      const yard = M2_MAP.courtyard;
      const dust = ctx.createRadialGradient(yard.x, yard.y, 30, yard.x, yard.y, yard.radiusX);
      dust.addColorStop(0, "#b0a078"); dust.addColorStop(1, "#8e835d");
      ctx.fillStyle = dust; ctx.beginPath();
      ctx.ellipse(yard.x, yard.y, yard.radiusX, yard.radiusY, 0, 0, Math.PI * 2); ctx.fill();
      M2_MAP.roads.forEach(path => road(path.points, path.width));
    } else {
      road([[0, 350], [370, 350], [600, 325], [850, 350], [1200, 300]], 85);
    }
    if (level === 4) {
      road([[130, 350], [290, 180], [430, 205], [650, 520], [1040, 540], [1050, 280]], 55);
      road([[545, 305], [545, 365]], 50);
    } else if (level !== 2) {
      road([[380, 170], [380, 525]], 50);
      road([[750, 190], [750, 525]], 48);
      road([[1040, 180], [1040, 500]], 52);
    }
    for (let i = 0; i < 2200; i++) {
      const x = random() * 1200, y = random() * 700;
      ctx.globalAlpha = .12; ctx.fillStyle = random() > .5 ? "#e2cf9b" : "#302f20";
      ctx.beginPath(); ctx.ellipse(x, y, 1 + random() * 2, .6 + random(), 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 80; i++) {
      const x = i < 40 ? i * 31 : (i - 40) * 31;
      const y = i < 40 ? 15 + random() * 24 : 675 + random() * 25;
      this.tree(ctx, x, y, .7 + random() * .5);
    }
    if (level === 2) {
      for (let i = 0; i < 22; i++) {
        this.tree(ctx, 15 + random() * 22, 55 + i * 29, .75 + random() * .25);
        this.tree(ctx, 1175 + random() * 22, 55 + i * 29, .75 + random() * .25);
      }
      this.fence(ctx, 70, 72, 1130, 72);
      this.fence(ctx, 70, 72, 70, 658);
      this.fence(ctx, 1130, 72, 1130, 658);
    }
    this.terrain.set(level, canvas); return canvas;
  }

  fence(ctx, x1, y1, x2, y2) {
    const length = Math.hypot(x2 - x1, y2 - y1), count = Math.ceil(length / 12);
    ctx.save();
    ctx.strokeStyle = "#3c3826"; ctx.lineWidth = 6;
    for (const rise of [10, 24]) {
      ctx.beginPath(); ctx.moveTo(x1, y1 - rise); ctx.lineTo(x2, y2 - rise); ctx.stroke();
      ctx.strokeStyle = "#87754a"; ctx.lineWidth = 2; ctx.stroke(); ctx.strokeStyle = "#3c3826"; ctx.lineWidth = 6;
    }
    for (let i = 0; i <= count; i++) {
      const x = x1 + (x2 - x1) * i / count, y = y1 + (y2 - y1) * i / count;
      ctx.fillStyle = i % 3 ? "#756344" : "#8b7851"; ctx.strokeStyle = "#353725"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x - 3, y - 31);
      ctx.lineTo(x, y - 36); ctx.lineTo(x + 3, y - 31); ctx.lineTo(x + 3, y); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "#b09967"; ctx.beginPath(); ctx.moveTo(x - 1, y - 29); ctx.lineTo(x - 1, y - 4); ctx.stroke();
    }
    ctx.restore();
  }

  tree(ctx, x, y, scale = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(17,28,17,.24)"; ctx.beginPath(); ctx.ellipse(4, 14, 34, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#443f29"; ctx.fillRect(-4, -15, 8, 30);
    ctx.strokeStyle = "#263321"; ctx.lineWidth = 2;
    for (const [dx, dy, r, color] of [[0, -32, 31, "#2d412b"], [-19, -24, 23, "#3e512f"],
      [19, -29, 24, "#506039"], [0, -44, 22, "#65713e"]]) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill();
      for (let i = 0; i < 40; i++) {
        const angle = i * 2.399, distance = Math.sqrt(i / 40) * r;
        const lx = dx + Math.cos(angle) * distance, ly = dy + Math.sin(angle) * distance;
        ctx.fillStyle = ["#34452a", "#4b5b32", "#65703a", "#858747", "#92934f"][i % 5];
        ctx.beginPath(); ctx.ellipse(lx, ly, 3 + i % 4, 2 + i % 3, angle, 0, Math.PI * 2); ctx.stroke(); ctx.fill();
      }
    }
    ctx.restore();
  }

  marker(ctx, x, y, label, complete = false, radius = 29) {
    const pulse = Math.sin(performance.now() / 330) * 3;
    ctx.save(); ctx.strokeStyle = complete ? "#a5b790" : "#ecd08a"; ctx.fillStyle = complete ? "rgba(131,157,102,.16)" : "rgba(240,198,103,.12)";
    ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y + 12, radius + pulse, (radius + pulse) * .4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    if (label) {
      ctx.font = "600 11px \"Times New Roman\""; ctx.textAlign = "center";
      const w = ctx.measureText(label).width + 22;
      ctx.fillStyle = "rgba(22,36,27,.88)"; ctx.fillRect(x - w / 2, y - 77, w, 23);
      ctx.fillStyle = "#eee0b7"; ctx.fillText(label, x, y - 61);
    }
    ctx.restore();
  }

  render(ctx, game) {
    const level = game.level, time = performance.now() / 1000;
    ctx.drawImage(this.terrainFor(level), 0, 0);
    const drawables = (this.layouts[level] || []).map(([name, x, y, width]) => ({y, draw: () => this.art.draw(ctx, name, x, y, width)}));
    if (level === 2) {
      const guard = M2_MAP.guard;
      drawables.push({y: guard.y + 14, draw: () => this.art.character(ctx, guard.x, guard.y, "idle", "left", time, true)});
    }
    const target = game.objectiveTarget();
    if (target) this.marker(ctx, target.x, target.y, target.label);
    if (level === 3 && game.deliveryZone) {
      const z = game.deliveryZone;
      ctx.fillStyle = "rgba(228,200,127,.09)"; ctx.fillRect(z.x, z.y, z.width, z.height);
      if (game.supply?.active) drawables.push({y: game.supply.y + 15,
        draw: () => this.art.draw(ctx, "thung_go", game.supply.x, game.supply.y + 15, 45)});
      this.art.draw(ctx, "bao_tai", 1100, 430, 85);
    }
    if (level === 4 && game.m4) {
      const m = game.m4, s = m.shelter;
      ctx.fillStyle = "#3e4932"; ctx.fillRect(s.x, s.y, s.width, s.height);
      ctx.strokeStyle = "#a2ab7a"; ctx.lineWidth = 3; ctx.strokeRect(s.x, s.y, s.width, s.height);
      this.art.draw(ctx, "bao_tai", s.x + 36, s.y + 18, 72);
      this.art.draw(ctx, "bao_tai", s.x + 111, s.y + 18, 72);
      ctx.font = "600 11px \"Times New Roman\""; ctx.fillStyle = "#ede4c5"; ctx.textAlign = "center";
      ctx.fillText("HẦM TRÚ ẨN", s.x + s.width / 2, s.y + 51); ctx.textAlign = "left";
      m.points.forEach((p, i) => {
        this.marker(ctx, p.x, p.y, p.done ? "ĐÃ TIẾP TẾ" : `ĐIỂM ${i + 1}`, p.done, 25);
        drawables.push({y: p.y + 16, draw: () => this.art.draw(ctx, p.done ? "thung_go" : "bao_tai", p.x, p.y + 16, 54)});
      });
    }
    if (level === 2) drawables.push({y: game.officer.y + 14, draw: () => {
      this.art.character(ctx, game.officer.x, game.officer.y, "idle", "down", time, true);
      this.npcBadge(ctx, game.officer.x, game.officer.y, "CÁN BỘ PHỤ TRÁCH");
    }});
    if (level === 5 && game.m5Comrade?.active) drawables.push({y: game.m5Comrade.y + 14,
      draw: () => { this.art.character(ctx, game.m5Comrade.x, game.m5Comrade.y, "idle", "left", time, true);
        this.npcBadge(ctx, game.m5Comrade.x, game.m5Comrade.y, "ĐỒNG ĐỘI"); }});
    drawables.push({y: game.player.y + 14, draw: () => game.player.render(ctx)});
    drawables.sort((a, b) => a.y - b.y).forEach(item => item.draw());
    if (level === 2) this.m2Labels(ctx);
    if (target?.label) this.marker(ctx, target.x, target.y, target.label);
    if (level === 4 && game.m4?.raidStarted) {
      ctx.fillStyle = "rgba(227,187,99,.15)"; ctx.fillRect(0, 0, 1200, 700);
      for (let i = 0; i < 7; i++) {
        const x = (time * 75 + i * 177) % 1200, y = 100 + (i * 93) % 470;
        ctx.fillStyle = "rgba(52,45,30,.18)"; ctx.beginPath(); ctx.ellipse(x, y, 28, 13, 0, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  npcBadge(ctx, x, y, label) {
    ctx.save(); ctx.font = "600 10px \"Times New Roman\""; ctx.textAlign = "center";
    ctx.fillStyle = "#f2e4bc"; ctx.shadowColor = "#15251a"; ctx.shadowBlur = 4;
    ctx.fillText(label, x, y + 38); ctx.restore();
  }

  m2Labels(ctx) {
    // The unit already has a painted sign; keep the area around its officer unobstructed.
    const labels = M2_MAP.buildings.filter(b => b.id !== "unit").map(b => [b.label, b.x, b.y + 22]);
    labels.push(["SÂN", 600, 455], ["CỔNG CHÍNH", 605, 520], ["CHÒI GÁC", 750, 480]);
    ctx.save(); ctx.font = "600 10px \"Times New Roman\""; ctx.textAlign = "center";
    labels.forEach(([text, x, y]) => {
      const width = ctx.measureText(text).width + 16;
      ctx.fillStyle = "rgba(29,44,30,.82)"; ctx.fillRect(x - width / 2, y - 13, width, 20);
      ctx.fillStyle = "#e6ddba"; ctx.fillText(text, x, y);
    });
    ctx.restore();
  }

  miniMap(game) {
    const canvas = document.getElementById("miniMapCanvas"), ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 160, 100);
    const sx = 160 / 1200, sy = 100 / 700;
    ctx.fillStyle = "#33442d"; ctx.fillRect(0, 0, 160, 100);
    if (game.level === 2) {
      ctx.drawImage(this.terrainFor(2), 0, 0, 160, 100);
    } else {
      ctx.strokeStyle = "#9c8c62"; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(0, 50); ctx.lineTo(160, 45); ctx.stroke();
    }
    ctx.fillStyle = "#938664";
    for (const z of game.collision.zones) ctx.fillRect(z.x * sx, z.y * sy, Math.max(3, z.width * sx), Math.max(3, z.height * sy));
    const target = game.objectiveTarget();
    if (target) {ctx.fillStyle = "#e8bf63"; ctx.beginPath(); ctx.arc(target.x * sx, target.y * sy, 4, 0, Math.PI * 2); ctx.fill();}
    ctx.fillStyle = "#f4efcf"; ctx.beginPath(); ctx.arc(game.player.x * sx, game.player.y * sy, 3, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(238,225,185,.45)"; ctx.lineWidth = 1;
    ctx.strokeRect(game.camera.x * sx, game.camera.y * sy,
      Math.min(1200, game.camera.viewWidth) * sx, Math.min(700, game.camera.viewHeight) * sy);
    document.getElementById("mapLevel").textContent = `M${game.level} · ${game.level === 2 || game.level === 5 ? "DOANH TRẠI" : "TRẬN ĐỊA"}`;
  }
}
