// Original illustrations remain untouched. Cutouts and animation frames are cached in memory.
class GameAssets {
  constructor() { this.images = {}; this.frames = {}; this.failed = []; }

  async load(onProgress = () => {}) {
    const files = ["animation", "animation2", "don_vi", "khu_bep", "khu_nghi_ngoi", "nha_kho_2",
      "thung_go", "bao_tai", "bo_dam", "bang_thong_tin", "cong_chinh", "cot_co",
      "cot_den_duong", "coc_chi_duong", "ghe_go", "mini_map", "clock", "vat_pham",
      "HUD_loi_thoai_nhiem_vu", "hub_nhiem_vu_moi", "hub_tim_can_bo_cap_tren", "button_E_noi_chuyen", "map_M2"];
    let done = 0;
    await Promise.all(files.map(async name => {
      try {
        const image = await new Promise((resolve, reject) => {
          const img = new Image(); img.onload = () => resolve(img); img.onerror = reject;
          img.src = `assets/${name}.png${name === "map_M2" ? `?v=${M2_MAP.revision}` : ""}`;
        });
        this.images[name] = image;
      } catch { this.failed.push(name); }
      onProgress(++done, files.length);
    }));
    const props = files.slice(2, 15);
    for (const name of props) {
      if (this.images[name]) this.images[name] = this.cutout(this.images[name], null, "gray", 640);
    }
    const gate = this.images.cong_chinh;
    if (gate) {
      // Separate the gate and the tower so M2 can place them according to its site plan.
      this.images.m2_gate = this.trim(this.crop(gate, [0, 0, gate.width * .72, gate.height]));
      this.images.m2_watchtower = this.trim(this.crop(gate, [gate.width * .72, 0, gate.width * .28, gate.height]));
    }
    this.prepareFrames();
    this.prepareUI();
  }

  crop(image, rect, maxSize = 640) {
    const [x, y, w, h] = rect || [0, 0, image.width, image.height];
    const scale = Math.min(1, maxSize / Math.max(w, h));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(w * scale)); canvas.height = Math.max(1, Math.round(h * scale));
    canvas.getContext("2d").drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  trim(canvas) {
    const {width: w, height: h} = canvas;
    const d = canvas.getContext("2d").getImageData(0, 0, w, h).data;
    let left = w, right = 0, top = h, bottom = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) {
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
    return left <= right ? this.crop(canvas, [left, top, right - left + 1, bottom - top + 1]) : canvas;
  }

  cutout(image, rect, mode, maxSize = 200) {
    const canvas = this.crop(image, rect, maxSize), ctx = canvas.getContext("2d", {willReadFrequently: true});
    const w = canvas.width, h = canvas.height, pixels = ctx.getImageData(0, 0, w, h), d = pixels.data;
    // Flood only background connected to the boundary; enclosed gray details stay intact.
    const visited = new Uint8Array(w * h), queue = new Int32Array(w * h);
    let head = 0, tail = 0;
    const background = i => {
      const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
      if (mode === "gray") return Math.max(r, g, b) - Math.min(r, g, b) < 19 && r > 65 && r < 195;
      return Math.max(Math.abs(r - 110), Math.abs(g - 120), Math.abs(b - 104)) < 21
        && g - r >= 5 && g - b >= 8 && g - b < 30;
    };
    const enqueue = i => {
      if (!visited[i] && background(i)) { visited[i] = 1; queue[tail++] = i; }
    };
    for (let x = 0; x < w; x++) { enqueue(x); enqueue((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { enqueue(y * w); enqueue(y * w + w - 1); }
    while (head < tail) {
      const i = queue[head++], x = i % w;
      d[i * 4 + 3] = 0;
      if (x > 0) enqueue(i - 1); if (x < w - 1) enqueue(i + 1);
      if (i >= w) enqueue(i - w); if (i < w * (h - 1)) enqueue(i + w);
    }
    if (mode === "green") {
      // Reference sheets have uneven spacing. Discard clipped fragments of neighboring poses.
      const seen = new Uint8Array(w * h), components = [];
      for (let start = 0; start < w * h; start++) {
        if (seen[start] || d[start * 4 + 3] === 0) continue;
        head = 0; tail = 0; queue[tail++] = start; seen[start] = 1;
        while (head < tail) {
          const i = queue[head++], x = i % w;
          for (const neighbor of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1,
            i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1]) {
            if (neighbor >= 0 && !seen[neighbor] && d[neighbor * 4 + 3] > 0) {
              seen[neighbor] = 1; queue[tail++] = neighbor;
            }
          }
        }
        components.push(Array.from(queue.subarray(0, tail)));
      }
      components.sort((a, b) => b.length - a.length);
      // A padded cell may contain a piece of a neighbor. Keep its principal character only.
      for (const component of components.slice(1)) for (const i of component) d[i * 4 + 3] = 0;
    }
    ctx.putImageData(pixels, 0, 0);
    let left = w, top = h, right = 0, bottom = 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 0) {
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
    }
    return left <= right ? this.crop(canvas, [left, top, right - left + 1, bottom - top + 1], maxSize) : canvas;
  }

  prepareFrames() {
    const sheet = this.images.animation, radio = this.images.animation2;
    if (sheet) {
      const row = (name, y, height, boundaries) => {
        this.frames[name] = boundaries.slice(0, -1).map((start, i) =>
          this.cutout(sheet, [start, y, boundaries[i + 1] - start, height], "green"));
      };
      this.frames.idle = [this.cutout(sheet, [165, 8, 83, 151], "green")];
      this.frames.side = [this.cutout(sheet, [810, 8, 95, 151], "green")];
      this.frames.back = [this.cutout(sheet, [600, 8, 87, 151], "green")];
      row("walk", 164, 135, Array.from({length: 14}, (_, i) => 140 + i * (1290 / 13)));
      row("run", 306, 136, [140, 250, 360, 475, 585, 700, 810, 930, 1045, 1175, 1295, 1430]);
      row("pickup", 449, 122, [145, 250, 370, 489, 615, 735, 847, 955, 1054, 1149, 1235, 1328, 1430]);
      // The last two carry reference poses are empty-handed, so exclude them.
      row("carry", 575, 131, [145, 250, 360, 475, 580, 690, 810, 925, 1035, 1142]);
      row("place", 711, 122, [145, 260, 370, 495, 615, 740, 860, 980, 1100, 1210, 1325, 1440]);
      row("injured", 836, 109, [140, 246, 361, 482, 613, 760, 902, 1070, 1256, 1440]);
      row("recovery", 949, 123, [140, 305, 468, 590, 717, 824, 932, 1026, 1127, 1228, 1323, 1440]);
    }
    if (radio) {
      const xs = [168, 310, 454, 594, 742, 886, 1030, 1176];
      this.frames.npc = xs.map(x => this.cutout(radio, [x, 12, 132, 155], "green"));
      this.frames.salute = [this.cutout(radio, [153, 886, 137, 180], "green")];
    }
  }

  prepareUI() {
    const put = (name, source, rect) => {
      if (!this.images[source]) return;
      const canvas = this.crop(this.images[source], rect);
      this.images[name] = canvas;
      document.documentElement.style.setProperty(`--art-${name}`, `url("${canvas.toDataURL()}")`);
    };
    put("portrait", "HUD_loi_thoai_nhiem_vu", [112, 290, 448, 368]);
    put("soldier", "hub_tim_can_bo_cap_tren", [468, 358, 222, 211]);
    put("mission", "hub_nhiem_vu_moi", [326, 302, 264, 305]);
    put("talk", "button_E_noi_chuyen", [694, 195, 782, 302]);
    put("supply", "vat_pham", [57, 302, 296, 296]);
    put("health", "vat_pham", [1320, 302, 298, 296]);
    put("compass", "mini_map", [70, 58, 1113, 1064]);
    put("clock", "clock", [230, 220, 800, 820]);
  }

  draw(ctx, name, x, bottom, width, opacity = 1) {
    const img = this.images[name]; if (!img) return;
    const height = width * img.height / img.width;
    ctx.save(); ctx.globalAlpha = opacity;
    ctx.drawImage(img, x - width / 2, bottom - height, width, height); ctx.restore();
  }

  character(ctx, x, y, state = "idle", direction = "down", time = 0, npc = false, phase = null) {
    let frames = this.frames[state] || this.frames.idle;
    if (npc) frames = this.frames.npc;
    if (!frames?.length) {
      ctx.fillStyle = "#d8cba7"; ctx.beginPath(); ctx.arc(x, y - 24, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#394735"; ctx.fillRect(x - 10, y - 16, 20, 30); return;
    }
    // The transport sheet has side-view locomotion; use front/back poses for vertical travel.
    if (!npc && ["idle", "walk", "run"].includes(state)) {
      if (direction === "up" && this.frames.back) frames = this.frames.back;
      if (direction === "down" && this.frames.idle) frames = this.frames.idle;
      if (state === "idle" && ["left", "right"].includes(direction) && this.frames.side) frames = this.frames.side;
    }
    let index = phase !== null ? Math.min(frames.length - 1, Math.floor(phase * frames.length))
      : Math.floor(time * (state === "run" ? 13 : 8)) % frames.length;
    if (npc) index = direction === "up" ? 3 : direction === "left" ? 2 : direction === "right" ? 5 : 0;
    const img = frames[index % frames.length];
    const height = npc ? 76 : 68, width = height * img.width / img.height;
    ctx.save();
    ctx.fillStyle = "rgba(18,28,17,.28)"; ctx.beginPath(); ctx.ellipse(x, y + 13, 18, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, y + 14);
    if (direction === "left" && !npc) ctx.scale(-1, 1);
    if (state === "dodge") { ctx.rotate(direction === "left" ? -.3 : .3); ctx.globalAlpha = .65; }
    const bob = ["walk", "run", "carry"].includes(state) ? Math.sin(time * 16) * 1.2 : 0;
    ctx.drawImage(img, -width / 2, -height + bob, width, height); ctx.restore();
  }
}
