class ChapterAssets extends GameAssets {
  async load(onProgress = () => {}) {
    const files = ["animation_nhan_vat_chinh", "nhan_vat_phu", "can_cu", "aos", "giay_thong_hanh", "la_ban", "so_tay", "tien", "tui_do", "khung_hoi_thoai",
      "toa_tau_hoa", "lang_muoi", "ben_thuyen", "map_tro_truyen_dau_chuong", "xe_muoi_hong", "xo_nuoc", "ro_cam", "thoi_vang", "linh_canh", "nhan_vat_chinh_cai_trang", "kien_ngoi_toa_tau_v1",
      ...Object.values(CHAPTER_ATLAS.boards)];
    let done = 0;
    const total = files.length + Object.keys(CHAPTER_TWO_ART.files).length + Object.keys(CHAPTER_THREE_ART.files).length + Object.keys(CHAPTER_FOUR_ART.files).length + 3;
    const tick = () => onProgress(++done, total);
    await Promise.all(files.map(async name => {
      try {
        this.images[name] = await new Promise((resolve, reject) => {
          const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
          image.src = `assets/images/Chapter_1/${encodeURIComponent(name)}.png?v=${CHAPTER_ATLAS.revision}`;
        });
      } catch { this.failed.push(name); }
      tick();
    }));
    for (const [id, name] of Object.entries({disguise: "aos", pass: "giay_thong_hanh", compass: "la_ban", notebook: "so_tay", gold: "tien",
      cart: "xe_muoi_hong", bucket: "xo_nuoc", basket: "ro_cam", goldBar: "thoi_vang"})) {
      if (this.images[name]) this.images[id] = this.extract(this.images[name]);
    }
    const sheet = this.images.animation_nhan_vat_chinh;
    if (sheet) {
      const row = (y, h) => SpriteClips.splitRow(this, sheet, [130, y, 1318, h]);
      const idle = row(0, 211), talk = row(567, 184), pickup = row(755, 158);
      const walk = row(210, 187);
      this.frames = SpriteClips.bank({idle: [idle[0]], side: [idle[3]], back: [idle[7]], walk, run: row(392, 174),
        talk: talk.slice(0, 3), pickup: [idle[0], talk[1], idle[0]], carry: row(915, 164),
        crouch: [pickup[1]], push: walk.slice(3, 6)});
    }
    const npc = this.images.nhan_vat_phu;
    if (npc) {
      for (const [id, rect] of Object.entries({
        bac: [118, 52, 135, 285], bang: [845, 52, 140, 285],
        guard: [118, 370, 145, 295], grandma: [840, 380, 155, 295],
        farmer: [112, 710, 150, 305], woman: [840, 720, 165, 300]
      })) this.images[id] = this.extract(npc, rect);
    }
    if (this.images.linh_canh) {
      const guard = this.images.linh_canh;
      const idle = SpriteClips.splitRow(this, guard, [130, 0, 1318, 282]);
      this.guardWalk = SpriteClips.splitRow(this, guard, [130, 282, 1318, 260]).map(f => SpriteClips.register(f, idle[0].height, 86));
      this.images.guard = idle[0];
      this.images.guardInspect = SpriteClips.splitRow(this, guard, [130, 542, 1318, 262])[1];
    }
    const disguiseSheet = this.images.nhan_vat_chinh_cai_trang;
    if (disguiseSheet) {
      const row = (y, h) => SpriteClips.splitRow(this, disguiseSheet, [130, y, 1318, h]);
      const idle = row(0, 264), talk = row(520, 250);
      this.images.worker = idle[0];
      this.disguiseFrames = SpriteClips.bank({idle: [idle[0]], side: [idle[3]], back: [idle[7]], walk: row(270, 246),
        talk: talk.slice(0, 3), pickup: [idle[0], talk[1], idle[0]], carry: row(780, 260)});
    }
    this.prepareAtlas();
    await this.prepareRiverArt(tick);
    await this.prepareForestArt(tick);
    await this.prepareCaveArt(tick);
    await this.prepareTypefaceArt(tick);
    if (this.images.kien_ngoi_toa_tau_v1) this.images.kienSeated = this.trim(this.crop(this.images.kien_ngoi_toa_tau_v1, null, 1024));
    if (this.images.map_tro_truyen_dau_chuong) {
      this.images.room = this.images.map_tro_truyen_dau_chuong;
      this.atlasSources.room = {file: "map_tro_truyen_dau_chuong.png", rect: null};
    }
    this.painter = new SpritePainter();
    this.images.water = this.images.bucket;
    for (const [key, source] of Object.entries({mission: "mapPaper", compass: "compass", clock: "stationClock", portrait: "bang", soldier: "idle", bac: "bac"})) {
      const canvas = source === "idle" ? this.frames.idle?.[0].sprite.source : this.images[source];
      if (canvas) document.documentElement.style.setProperty(`--art-${key}`, `url("${canvas.toDataURL()}")`);
    }
  }
  prepareAtlas() {
    this.atlasSources = {};
    for (const [id, region] of Object.entries(CHAPTER_ATLAS.regions)) {
      const filename = CHAPTER_ATLAS.boards[region.board], source = this.images[filename];
      if (!source) continue;
      this.images[id] = region.raw ? this.crop(source, region.rect) : this.extract(source, region.rect, region);
      this.atlasSources[id] = {file: `${filename}.png`, rect: region.rect};
    }
    // Remove baked example text from the right page, retaining the illustrated left page.
    const book = this.images.uiHintBook;
    if (book) {
      const ctx = book.getContext("2d"), page = ctx.createLinearGradient(120, 0, 250, 0);
      page.addColorStop(0, "#e3c794"); page.addColorStop(.5, "#f1dcaf"); page.addColorStop(1, "#e6ce9d");
      ctx.fillStyle = page; ctx.fillRect(120, 9, 130, 78);
    }
    for (const [id, image] of Object.entries(this.images)) {
      if (id.startsWith("ui") || id.startsWith("portrait") || id === "mapPaper") {
        document.documentElement.style.setProperty(`--art-${id}`, `url("${image.toDataURL()}")`);
      }
    }
  }
  async prepareRiverArt(tick) {
    await Promise.all(Object.entries(CHAPTER_TWO_ART.files).map(async ([id, name]) => {
      try {
        this.images[id] = await new Promise((resolve, reject) => {
          const image = new Image(); image.onload = () => resolve(image); image.onerror = reject;
          image.src = `assets/images/Chapter_2/${encodeURIComponent(name)}.png?v=8`;
        });
      } catch { this.failed.push(name); }
      tick();
    }));
    for (const id of ["bone", "riverTarp", "bamboo"]) if (this.images[id]) this.images[id] = this.extract(this.images[id]);
    for (const [id, region] of Object.entries(CHAPTER_TWO_ART.regions)) {
      if (this.images[region.source]) this.images[id] = this.extract(this.images[region.source], region.rect, region);
    }
    if(this.images.riverGuard)this.riverGuardSprite=SpriteClips.register(this.images.riverGuard,this.images.riverGuard.height+6,95);
  }
  async prepareTypefaceArt(tick) {
    // Vector replacements have live Times New Roman text or deliberately blank
    // paper. No generated lettering from the reference boards enters the UI.
    for (const [id, filename] of Object.entries({pass:"pass-times",uiHintBook:"notebook-pages",uiPaper:"parchment"})) {
      try {
        const image = await new Promise((resolve, reject) => {
          const img = new Image(); img.onload = () => resolve(img); img.onerror = reject;
          img.src = `assets/ui/${filename}.svg?v=8`;
        });
        this.images[id] = this.crop(image, null, 1200);
        if (id.startsWith("ui")) document.documentElement.style.setProperty(`--art-${id}`, `url("${this.images[id].toDataURL()}")`);
      } catch { this.failed.push(filename); }
      tick();
    }
  }
  async prepareForestArt(tick) {
    await Promise.all(Object.entries(CHAPTER_THREE_ART.files).map(async([id,name])=>{
      try{
        this.images[id]=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=`assets/images/chapter_3/${encodeURIComponent(name)}.png?v=${id==="forestBike"?15:10}`;});
      }catch{this.failed.push(name);}tick();
    }));
    // These files already contain alpha. Crop directly to preserve fine leaf edges.
    for(const [id,region] of Object.entries(CHAPTER_THREE_ART.regions))if(this.images[region.source]){
      const frame=this.crop(this.images[region.source],region.rect,900);
      if(region.outline){
        // Trace the visible stones in the combined kit, excluding the wood/pot.
        const ctx=frame.getContext("2d");ctx.globalCompositeOperation="destination-in";ctx.beginPath();
        region.outline.forEach(([x,y],i)=>ctx[i?"lineTo":"moveTo"](x-region.rect[0],y-region.rect[1]));ctx.closePath();ctx.fill();ctx.globalCompositeOperation="source-over";
      }
      this.images[id]=this.trim(frame);
    }
    for(const id of ["forestHorse","forestBike","forestYoke","forestHerb","forestBranches"])if(this.images[id])this.images[id]=this.trim(this.crop(this.images[id],null,1100));
    // A small code-native bowl icon distinguishes the serving from the large pot.
    const bowl=document.createElement("canvas");bowl.width=96;bowl.height=80;
    const bc=bowl.getContext("2d"),clay=bc.createLinearGradient(0,32,0,72);clay.addColorStop(0,"#dabd88");clay.addColorStop(1,"#8a6241");
    bc.lineWidth=3;bc.strokeStyle="#49382b";bc.fillStyle=clay;bc.beginPath();bc.moveTo(13,36);bc.bezierCurveTo(16,75,80,75,83,36);bc.closePath();bc.fill();bc.stroke();
    bc.fillStyle="#b2aa69";bc.beginPath();bc.ellipse(48,36,35,10,0,0,Math.PI*2);bc.fill();bc.stroke();
    bc.strokeStyle="#eee0bfaa";bc.lineWidth=2;
    for(const x of [35,49,63]){bc.beginPath();bc.moveTo(x,22);bc.bezierCurveTo(x-7,17,x+7,12,x,6);bc.stroke();}
    this.images.forestMedicine=bowl;
  }
  async prepareCaveArt(tick) {
    await Promise.all(Object.entries(CHAPTER_FOUR_ART.files).map(async([id,name])=>{
      try { this.images[id]=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=`assets/images/chapter_4/${encodeURIComponent(name)}.png?v=${CHAPTER_FOUR_ART.revision}`;}); }
      catch { this.failed.push(name); } tick();
    }));
    for(const [id,rect] of Object.entries(CHAPTER_FOUR_ART.regions))if(this.images.caveKien)this.images[id]=this.trim(this.crop(this.images.caveKien,rect,800));
    for(const id of ["caveKnife","caveTracks","caveCompass","caveBamboo","cavePalm","caveTools","cavePlatform","caveStock"])if(this.images[id])this.images[id]=this.trim(this.crop(this.images[id],null,1100));
    this.relayFrames={};
    for(const [id,sheet] of Object.entries(CHAPTER_FOUR_ART.relaySheets)){
      const source=this.images[id];if(!source)continue;
      this.relayFrames[id]=[];
      for(let row=0;row<sheet.rows.length-1;row++)for(let col=0;col<6;col++){
        const frame=this.crop(source,[col*229,sheet.rows[row],229,sheet.rows[row+1]-sheet.rows[row]],400);
        const fc=frame.getContext("2d",{willReadFrequently:true}),pixels=fc.getImageData(0,0,frame.width,frame.height).data;
        let top=frame.height,bottom=0,sum=0,count=0;
        for(let y=0;y<frame.height;y++)for(let x=0;x<frame.width;x++)if(pixels[(y*frame.width+x)*4+3]>100){top=Math.min(top,y);bottom=Math.max(bottom,y);}
        // Register the head and feet; a bag extending sideways must not move the body.
        for(let y=top;y<Math.min(bottom,top+22);y++)for(let x=0;x<frame.width;x++)if(pixels[(y*frame.width+x)*4+3]>100){sum+=x;count++;}
        const canvas=document.createElement("canvas");canvas.width=400;canvas.height=300;
        canvas.getContext("2d").drawImage(frame,200-(count?sum/count:114.5),280-bottom);
        this.relayFrames[id].push(canvas);
      }
    }
  }
  setCostume(disguised) { this.disguised = !!disguised; }
  warm(resolution) {
    this.painter.warm(resolution, [...Object.values(this.frames).flat(), ...Object.values(this.disguiseFrames).flat(), ...this.guardWalk]);
  }
  playerPortrait() { return (this.disguised ? this.disguiseFrames?.idle[0] : this.frames.idle?.[0])?.sprite.source; }
  character(ctx, x, y, state = "idle", direction = "down", time = 0, npc = false, phase = null, motion = null) {
    if (npc) { this.npc(ctx, "bang", x, y); return; }
    const bank = this.disguised && this.disguiseFrames ? this.disguiseFrames : this.frames;
    const locomotion = ["idle", "walk", "run"].includes(state), moving = ["walk", "run"].includes(state);
    // The illustrated walk row repeats one stride with changing proportions.
    // A continuous joint cycle on one registered pose avoids those silhouette jumps.
    const frames = locomotion ? (direction === "up" ? bank.back : direction === "down" ? bank.idle : bank.side) : bank[state] || bank.idle;
    const image = frames?.[phase === null ? 0 : Math.min(frames.length - 1, Math.floor(phase * frames.length))];
    if (!image?.sprite) return;
    ctx.save(); ctx.fillStyle = "#10231b40"; ctx.beginPath(); ctx.ellipse(x, y + 13, 17, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const blend = motion?.blend ?? (moving ? 1 : 0), stride = time * 1.6;
    if (locomotion) this.painter.gait(ctx, image, x, y, stride, blend, {mirror: direction === "left", side: ["left", "right"].includes(direction), heading: motion?.heading, running: state === "run"});
    else this.painter.draw(ctx, image, x, y, {mirror: direction === "left", bob: moving ? Math.sin(stride * Math.PI * 4) * .35 : 0});
  }
  // Remove only the flat border-connected sheet backdrop; leave enclosed artwork intact.
  extract(image, rect = null, options = {}) {
    const canvas = this.crop(image, rect, options.maxSize ?? 420), ctx = canvas.getContext("2d", {willReadFrequently: true});
    const w = canvas.width, h = canvas.height, pixels = ctx.getImageData(0, 0, w, h), d = pixels.data;
    const corners = [0, w - 1, (h - 1) * w, w * h - 1];
    const sample = [0, 1, 2].map(c => corners.map(i => d[i * 4 + c]).sort((a, b) => a - b)[1]);
    const visited = new Uint8Array(w * h), queue = new Int32Array(w * h); let head = 0, tail = 0;
    const enqueue = i => {
      if (visited[i] || Math.max(...sample.map((v, c) => Math.abs(d[i * 4 + c] - v))) > (options.tolerance ?? 34)) return;
      visited[i] = 1; queue[tail++] = i;
    };
    for (let x = 0; x < w; x++) { enqueue(x); enqueue((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { enqueue(y * w); enqueue(y * w + w - 1); }
    while (head < tail) {
      const i = queue[head++], x = i % w; d[i * 4 + 3] = 0;
      if (x > 0) enqueue(i - 1); if (x < w - 1) enqueue(i + 1);
      if (i >= w) enqueue(i - w); if (i < w * (h - 1)) enqueue(i + w);
    }
    if (rect && options.components !== false) {
      // Sheets include labels and neighboring poses. Keep the main connected figure.
      const seen = new Uint8Array(w * h); let largest = [];
      for (let start = 0; start < w * h; start++) {
        if (seen[start] || !d[start * 4 + 3]) continue;
        head = 0; tail = 0; queue[tail++] = start; seen[start] = 1;
        while (head < tail) {
          const i = queue[head++], x = i % w;
          for (const n of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1]) {
            if (n >= 0 && !seen[n] && d[n * 4 + 3]) { seen[n] = 1; queue[tail++] = n; }
          }
        }
        if (tail > largest.length) largest = Array.from(queue.subarray(0, tail));
      }
      const keep = new Uint8Array(w * h); largest.forEach(i => keep[i] = 1);
      for (let i = 0; i < w * h; i++) if (!keep[i]) d[i * 4 + 3] = 0;
    }
    ctx.putImageData(pixels, 0, 0); return options.trim === false ? canvas : this.trim(canvas);
  }
  npc(ctx, id, x, y, height = 80, time = 0) {
    const image = id === "guardWalk" && this.guardWalk?.length ? this.guardWalk[Math.floor(time * 12) % this.guardWalk.length] : this.images[id];
    if (!image) {
      ctx.fillStyle = "#cbb68a"; ctx.fillRect(x - 9, y - 35, 18, 45); return;
    }
    if (image.sprite) { this.painter.draw(ctx, image, x, y, {mirror: id === "guardWalk"}); return; }
    const width = height * image.width / image.height;
    ctx.save(); ctx.fillStyle = "#14241944"; ctx.beginPath(); ctx.ellipse(x, y + 12, height * .22, height * .065, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(x, y + 14); if (id === "guardInspect") ctx.scale(-1, 1);
    ctx.drawImage(image, -width / 2, -height, width, height);
    ctx.restore();
  }
}
