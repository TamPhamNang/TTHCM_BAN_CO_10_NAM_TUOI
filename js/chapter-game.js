// Chapter controller. The earlier prototype in game.js is retained as a reference.
class ChapterGame {
  constructor(canvas, input, ui, save) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d");
    this.input = input; this.ui = ui; this.save = save;
    this.player = new Player(600, 330);
    this.collision = new CollisionSystem(1200, 700);
    this.camera = new Camera(1200, 700, 1200, 700);
    this.dialogue = new DialogueSystem(ui, input);
    this.scene = new ChapterScene(window.gameArt);
    this.state = "menu"; this.level = 1; this.inventory = []; this.flags = {};
    this.completedLevels = []; this.lastTime = 0; this.saveClock = 0;
    this.travel = []; this.selectedGold = null; this.train = {hidden: [], remaining: 45, seated: false};
    this.dock = new DockPuzzle(); this.bindMenu(); this.resize();
    window.addEventListener("resize", () => this.resize());
    window.addEventListener("blur", () => { if (["gameplay", "seating"].includes(this.state)) this.pause(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden && ["gameplay", "seating"].includes(this.state)) this.pause(); });
    window.addEventListener("pagehide", () => { if (this.state !== "menu") this.saveProgress(); });
    this.canvas.addEventListener("pointerdown", event => this.pointerDown(event));
    this.canvas.addEventListener("pointerup", event => this.pointerUp(event));
    this.canvas.addEventListener("pointermove", event => { if(this.state==="gameplay")this.river?.pointerMove(this.worldPoint(event)); });
    this.canvas.addEventListener("pointercancel", () => this.river?.cancelPointer());
  }
  bindMenu() {
    const on = (id, fn) => document.getElementById(id).addEventListener("click", fn);
    on("startBtn", () => this.startNew()); on("continueBtn", () => this.continueGame());
    on("chapter2Btn", () => this.startChapterTwo());on("nextChapterBtn", () => this.startChapterTwo());
    on("riverActionBtn", () => this.river?.action());
    on("aboutBtn", () => this.ui.message("Hạt Muối Trường Kỳ · Phiêu lưu giải đố 6+. Vào vai Kiên trong hành trình đưa muối Văn Lý lên Việt Bắc. Bản hiện tại: Chương 1 và 2, màn 1–7. Cốt truyện và hội thoại chuyển thể theo GDD."));
    on("resumeBtn", () => this.resume()); on("checkpointBtn", () => this.restartCheckpoint());
    on("exitBtn", () => this.returnToMenu()); on("nextBtn", () => this.nextLevel());
    on("replayBtn", () => this.startNew()); on("chapterMenuBtn", () => this.returnToMenu());
    on("bagBtn", () => this.openBag()); on("hintBtn", () => this.openHint());
    on("pauseBtn", () => this.pause()); on("closeJournalBtn", () => this.closeJournal());
    on("dialogueNextBtn", () => this.advanceDialogue());
    on("interactBtn", () => {
      const near = this.nearObject();
      if (near) this.interact(near);
      else this.notify("Đến gần người hoặc đồ vật để tương tác nhé.");
    });
    on("crouchBtn", () => this.toggleCrouch()); on("undoBtn", () => this.undoDock());
    on("resetDockBtn", () => this.restartCheckpoint());
    document.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("click", () => {
      const [dx, dy] = button.dataset.direction.split(",").map(Number);
      if (this.state === "gameplay" && this.level === 4) this.moveDock(dx, dy);
    }));
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = "high";
    this.viewScale = Math.min(w / 1200, h / 700);
    this.viewOffsetX = (w - 1200 * this.viewScale) / 2;
    this.viewOffsetY = (h - 700 * this.viewScale) / 2;
    this.camera.resize(1200, 700); this.camera.follow(this.player);
    window.gameArt.warm(dpr * this.viewScale);
  }
  refreshContinue() { document.getElementById("continueBtn").disabled = !this.save.load(); }
  startNew() {
    this.save.clear(); this.inventory = []; this.flags = {}; this.completedLevels = [];
    this.loadLevel(1, false); this.startPrologue();
  }
  startChapterTwo() {
    const data=this.state==="menu"?this.save.load():null;
    if(data){this.inventory=[...data.inventory];this.flags={...data.flags};this.completedLevels=[...data.completedLevels];}
    this.flags.prologue=true;this.give("compass");this.give("notebook");this.remove("bone");this.remove("mud");this.remove("leaves");
    this.loadLevel(5);this.saveProgress();
  }
  startPrologue() {
    this.prologueRoom = true;
    this.collision.setZones([{x: 0, y: 0, width: 1200, height: 340}, {x: 460, y: 340, width: 340, height: 145}]);
    if (!this.flags.giftVisit) { Object.assign(this.player, {x: 950, y: 520}); this.player.face(-1, 0); this.player.facingAngle = this.player.heading; }
    if (this.flags.giftVisit) this.activateGifts();
    else this.say(CHAPTER_ONE.prologue, () => { this.flags.giftVisit = true; this.activateGifts(); }, "prologue");
    this.saveProgress();
  }
  activateGifts() {
    this.state = "gameplay"; this.dialogueKind = "prologue";
    this.updateHUD(); this.saveProgress();
  }
  receiveGift() {
    if (this.giftTween) return;
    const item = ["compass", "notebook"].find(id => !this.has(id));
    if (!item) {
      this.say([{speaker: "Kiên", text: "Cháu cảm ơn Bác! Cháu sẽ giữ gìn la bàn, đọc sổ tay và cùng bác Bằng hoàn thành nhiệm vụ ạ."},
        {speaker: "Bác Hồ", text: "Cháu nhớ giữ gìn sức khỏe, đi đường cẩn thận nhé."}], () => {
        this.flags.prologue = true; this.prologueRoom = false;
        this.loadLevel(1); this.saveProgress();
      }, "prologue");
      return;
    }
    this.player.face(365 - this.player.x, 450 - this.player.y);
    this.say([{speaker: "Bác Hồ", text: item === "compass" ? "Cháu nhận chiếc la bàn đồng này nhé. La bàn sẽ giúp cháu không lạc hướng trên đường đi." : "Còn đây là cuốn sổ tay. Khi gặp việc khó, cháu hãy mở sổ ra xem nhé."}], () => {
      this.activateGifts(); this.player.startAction("talk", .8);
      this.giftTween = {item, elapsed: 0, duration: .8, from: {x: 395, y: 410}, to: {x: this.player.x, y: this.player.y - 42}};
    }, "prologue");
  }
  continueGame() {
    const data = this.save.load();
    if (!data) { this.ui.message("Chưa có tiến trình Chương 1 đã lưu."); return; }
    this.inventory = data.inventory; this.flags = data.flags; this.completedLevels = data.completedLevels;
    this.loadLevel(data.level, false);
    this.player.x = data.player.x; this.player.y = data.player.y;
    if (this.flags.prologue && [1, 3, 5, 7].includes(this.level) && this.collision.blocks(this.player.getRect())) Object.assign(this.player, GAME_LEVELS[this.level].spawn);
    this.train = data.train; this.dock = new DockPuzzle(data.dock);
    if(this.level>=5)this.river=new RiverChapter(this,data.river);
    if (this.level === 2) Object.assign(this.player, this.train.seated ? CHAPTER_ONE.trainLayout.seat : CHAPTER_ONE.trainLayout.standing);
    if (data.chapterComplete) this.finishChapter();
    else if (data.stageComplete) this.completeLevel();
    else if (!this.flags.prologue) this.startPrologue();
    else if (this.dock.solved() && this.level === 4) this.completeLevel();
    else if (this.flags.trainPassed && this.level === 2) this.completeLevel();
    else if(this.level===5&&this.river.data.chainOpen || this.level===6&&this.river.data.storm.remaining===0&&this.river.data.storm.tied.every(Boolean) || this.level===7&&this.river.data.reeds.phase==="safe")this.completeLevel();
    else this.activateLevel();
  }
  loadLevel(level, intro = true) {
    this.prologueRoom = false; this.giftTween = null; this.trainPose = null; this.input.resetAnalog();
    this.level = level; this.stageComplete = false; this.chapterComplete = false;
    const spec = GAME_LEVELS[level];
    this.player = new Player(spec.spawn.x, spec.spawn.y);
    this.travel = []; this.pendingObject = null; this.selectedGold = null;
    this.train = {hidden: [], remaining: CHAPTER_ONE.levels[2].timeLimit, seated: false};
    this.dock = new DockPuzzle(); this.exposure = 0; this.dockCarry = 0; this.dockTween = null; this.dockVisual = null; this.dockAnimationTime = 0;
    this.dialogue.active = false; this.dialogueKind = null;
    this.ui.hideMenu(); this.ui.hidePause(); this.ui.hideComplete(); this.ui.hideDialogue(); this.ui.hidePrompt();
    document.getElementById("journal").classList.add("d-none");
    document.getElementById("chapterEnd").classList.add("d-none");
    this.collision.setZones(spec.collisionZones || []);
    this.river=level>=5?new RiverChapter(this):null;
    this.riverScene=level>=5?new RiverScene(this):null;
    if(level===7)this.give("bamboo");
    if (intro) this.say(spec.intro, () => this.activateLevel());
    else this.state = "gameplay";
    this.updateHUD();
  }
  activateLevel() { this.state = "gameplay"; this.dialogueKind = null; this.updateHUD(); this.saveProgress(); }
  say(lines, done = () => this.activateLevel(), kind = null) {
    this.state = "dialogue"; this.dialogueKind = kind || (this.prologueRoom ? "prologue" : null); this.travel = []; this.input.resetAnalog(); this.ui.hidePrompt();
    this.player.moving = false; this.player.state = "idle";
    this.dialogue.start(lines, done);
  }
  advanceDialogue() {
    if (this.state !== "dialogue" || !this.dialogue.active) return;
    this.dialogue.index++;
    if (this.dialogue.index >= this.dialogue.lines.length) {
      this.dialogue.active = false; this.ui.hideDialogue();
      if (this.dialogue.onComplete) this.dialogue.onComplete();
    } else this.dialogue.showCurrent();
  }
  has(item) { return this.inventory.includes(item); }
  give(item) { if (!this.has(item)) this.inventory.push(item); }
  remove(item) { this.inventory = this.inventory.filter(id => id !== item); }
  objects() {
    if(this.river)return this.river.objects();
    if (this.prologueRoom) return [{id: "bac", npc: true, x: 365, y: 450,
      label: !this.has("compass") ? "Bác Hồ · Nhận la bàn" : !this.has("notebook") ? "Bác Hồ · Nhận sổ tay" : "Cảm ơn Bác · Lên đường"}];
    return (GAME_LEVELS[this.level].objects || []).filter(o => {
      if (["disguise", "pass", "gold", "tools"].includes(o.id)) return !this.has(o.id) && !(o.id === "tools" && this.flags.cart);
      if (o.id === "bucket") return !this.has("bucket") && !this.has("water") && !this.flags.water;
      return true;
    });
  }
  nearObject() {
    return this.objects().find(o => Math.hypot(o.x - this.player.x, o.y - this.player.y) < (o.art ? 38 : 78));
  }
  interact(object) {
    if (this.state !== "gameplay" || !this.objects().some(o => o.id === object.id)) return;
    if(this.river){this.river.interact(object);return;}
    if (this.prologueRoom) { this.receiveGift(); return; }
    this.player.startAction(object.npc ? "talk" : "pickup");
    if (this.level === 1) {
      if (object.id === "departure") {
        if (!["disguise", "pass", "gold"].every(id => this.has(id))) {
          this.say([{speaker: "Nguyễn Lương Bằng", text: "Cháu kiểm tra ba lô nhé: phải có đủ áo nông dân, giấy thông hành và túi tiền vàng rồi mới lên tàu được."}]);
        } else this.say([{speaker: "Kiên", text: "Cháu đã chuẩn bị đủ đồ. Cháu sẵn sàng lên đường!"},
          {speaker: "Nguyễn Lương Bằng", text: "Tốt lắm. Cháu thay áo cải trang, chúng ta đi Nam Định."}], () => this.completeLevel());
      } else { this.give(object.id); this.notify(`Đã cất ${object.label.toLowerCase()} vào ba lô.`); }
    } else if (this.level === 3) {
      switch (object.id) {
        case "tools": case "bucket": this.give(object.id); this.notify(`Đã nhặt ${object.label.toLowerCase()}.`); break;
        case "cart":
          if (this.flags.cart) this.say([{speaker: "Bác diêm dân", text: "Xe chạy tốt rồi, cảm ơn cháu!"}]);
          else if (!this.has("tools")) this.say([{speaker: "Bác diêm dân", text: "Bánh xe của bác bị hỏng. Cháu tìm giúp bộ dụng cụ ở mái lán kia được không?"}]);
          else {
            this.flags.cart = true; this.remove("tools");
            this.say([{speaker: "Kiên", text: "Để cháu giữ bánh xe và lắp lại trục cho bác ạ!"}, {speaker: "Bác diêm dân", text: "Chú bộ đội nhỏ khéo tay quá! Xe đã chạy lại được rồi."}]);
          } break;
        case "well":
          if (this.has("bucket")) { this.remove("bucket"); this.give("water"); this.notify("Đã múc đầy nước giếng. Mang đến cho cô chú nhé!"); }
          else this.notify(this.has("water") ? "Gàu đã đầy nước rồi." : "Cháu cần lấy gàu nước cạnh đường trước.");
          break;
        case "villagers":
          if (this.flags.water) this.say([{speaker: "Cô diêm dân", text: "Nước mát lắm, cảm ơn cháu Kiên!"}]);
          else if (!this.has("water")) this.say([{speaker: "Cô diêm dân", text: "Nắng quá, cô chú khát nước. Cháu giúp lấy gàu và múc ít nước giếng nhé."}]);
          else {
            this.remove("water"); this.flags.water = true;
            this.say([{speaker: "Kiên", text: "Mời cô chú uống nước, nghỉ tay một chút ạ."}, {speaker: "Cô diêm dân", text: "Cháu chu đáo quá. Bà con quý tấm lòng của cháu lắm!"}]);
          } break;
        case "agreement":
          if (!this.flags.cart || !this.flags.water) this.say([{speaker: "Nguyễn Lương Bằng", text: "Cháu hãy giúp bác sửa xe và mang nước cho cô chú. Lòng tin bắt đầu từ những việc nhỏ."}]);
          else this.say([{speaker: "Bác diêm dân", text: "Bộ đội của Cụ Hồ hả? Được, mua bao nhiêu bà con cũng gom đủ!"}, {speaker: "Nguyễn Lương Bằng", text: "Cảm ơn bà con. Chúng ta cùng chuẩn bị chuyển muối xuống bến thuyền trong đêm."}], () => this.completeLevel());
          break;
      }
    }
    this.updateHUD(); this.saveProgress();
  }
  notify(text) { this.ui.stepComplete(text); }
  objective() {
    if(this.river)return this.river.objective();
    if (this.prologueRoom) return !this.has("compass") ? "Đến gần Bác Hồ, chọn tương tác để nhận la bàn." : !this.has("notebook") ? "Tương tác với Bác để nhận cuốn sổ tay." : "Đã nhận đủ hai món quà. Cảm ơn Bác trước khi lên đường.";
    if (this.level === 1) {
      const count = ["disguise", "pass", "gold"].filter(id => this.has(id)).length;
      return count < 3 ? `Tìm áo nông dân, giấy thông hành và túi tiền vàng (${count}/3).` : "Đã đủ đồ. Gặp bác Lương Bằng ở lối ra phía nam.";
    }
    if (this.level === 2) return this.train.hidden.length < 3 ? `Giấu vàng dưới đáy thúng cam (${this.train.hidden.length}/3).` : this.train.seated ? "Lính gác hỏi giấy tờ. Mở ba lô, chọn giấy thông hành." : "Vàng đã giấu kín. Chọn Ngồi yên để chờ kiểm tra.";
    if (this.level === 3) return this.flags.cart && this.flags.water ? "Bà con đã tin tưởng. Gặp bác Lương Bằng để gom muối." : `Giúp diêm dân: sửa xe ${this.flags.cart ? "✓" : "○"} · mang nước ${this.flags.water ? "✓" : "○"}.`;
    return `Đẩy muối vào khoang (${this.dock.goals.filter(g => this.dock.at(this.dock.boxes, g.x, g.y)).length}/3). ${this.dock.moves} bước · ${this.dock.crouched ? "Đang ngồi thấp" : "Chú ý đèn pha"}.`;
  }
  objectiveTarget() {
    if(this.river){const objects=this.river.objects();return this.level===5&&this.river.data.distraction>0?objects.find(o=>o.id==="winch"):objects[0];}
    if (this.level === 1) return this.objects().find(o => o.id !== "departure") || this.objects()[0];
    if (this.level === 3) {
      const id = !this.flags.cart ? (this.has("tools") ? "cart" : "tools") : !this.flags.water ? (this.has("water") ? "villagers" : this.has("bucket") ? "well" : "bucket") : "agreement";
      return this.objects().find(o => o.id === id);
    }
    return null;
  }
  updateHUD() {
    const riverTimer=this.level===6?this.river?.data.storm.remaining:this.level===7&&this.river?.data.reeds.phase==="materials"?this.river.data.reeds.remaining:null;
    this.ui.setTimer(riverTimer??this.train.remaining, this.level===2||riverTimer!==null);
    const key = [this.level, this.state, !!this.prologueRoom, this.inventory.join(","), !!this.flags.cart, !!this.flags.water,
      this.completedLevels.join(","), this.train.hidden.length, this.train.seated, this.dock.moves, this.dock.crouched,this.river?.hudKey()].join("|");
    if (key === this.hudKey) return;
    this.hudKey = key;
    const spec = GAME_LEVELS[this.level];
    window.gameArt.setCostume([2, 3].includes(this.level) && this.has("disguise"));
    this.ui.setMission(this.prologueRoom ? "Mở đầu · Món quà của Bác" : `M${this.level} — ${spec.name}`, this.objective());
    this.ui.hud.classList.toggle("prologue-room", !!this.prologueRoom);
    this.ui.hud.classList.toggle("train-room", this.level === 2);
    this.ui.hud.classList.toggle("river-room",this.level>=5);
    document.getElementById("freeControls").classList.toggle("d-none", ![1, 3].includes(this.level) || this.state !== "gameplay");
    document.getElementById("mapLevel").textContent = `M${this.level} · ${spec.place.toLocaleUpperCase("vi")}`;
    const chapter=this.level>=5?2:1,total=chapter===1?4:3,count=this.completedLevels.filter(n=>chapter===1?n<=4:n>=5).length;
    document.getElementById("chapterProgress").textContent = `${spec.date} · Chương ${chapter} · ${count}/${total} màn`;
    document.getElementById("bagCount").textContent = this.inventory.length;
    document.getElementById("dockControls").classList.toggle("d-none", this.level !== 4 || this.state !== "gameplay");
    document.getElementById("crouchBtn").textContent = this.dock.crouched ? "C · Đứng lên" : "C · Ngồi thấp";
    document.getElementById("crouchBtn").setAttribute("aria-pressed", String(this.dock.crouched));
    document.getElementById("fieldHelp").textContent = this.level === 4 ? "Chạm ô kề Kiên hoặc dùng WASD / mũi tên để đẩy bao." : this.level === 2 ? "Chọn / kéo thỏi vàng vào thúng cam. Đưa giấy tờ từ ba lô." : "Kéo cần 360° hoặc chạm điểm đến. WASD / mũi tên · Shift chạy · E / Space tương tác.";
    if(this.river)this.river.updateHUD();
    else {document.getElementById("riverStatus").classList.add("d-none");document.getElementById("riverActions").classList.add("d-none");}
  }
  worldPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {x: (event.clientX - rect.left - this.viewOffsetX) / this.viewScale,
      y: (event.clientY - rect.top - this.viewOffsetY) / this.viewScale};
  }
  pointerDown(event) {
    if (this.state !== "gameplay") return;
    const p = this.worldPoint(event);
    if(this.river?.pointerDown(p,event))return;
    if (this.level === 2) {
      const gold = this.scene.goldAt(p, this.train);
      if (gold !== null) { this.selectedGold = gold; this.canvas.setPointerCapture(event.pointerId); return; }
      if (this.scene.inBasket(p)) { this.hideGold(); return; }
      if (this.scene.contains(p, CHAPTER_ONE.trainLayout.sitButton)) this.sitTrain();
      return;
    }
    if (this.level === 4) {
      const cell = this.scene.dockCell(p), dx = cell.x - this.dock.player.x, dy = cell.y - this.dock.player.y;
      if (Math.abs(dx) + Math.abs(dy) === 1) this.moveDock(dx, dy);
      return;
    }
    const obj = this.scene.objectAt(p, this.objects());
    if (obj && Math.hypot(obj.x - this.player.x, obj.y - this.player.y) < (obj.art ? 38 : 78)) this.interact(obj);
    else this.walkTo(obj || p, obj);
  }
  pointerUp(event) {
    if(this.state==="gameplay")this.river?.pointerUp(this.worldPoint(event));
    if (this.state === "gameplay" && this.level === 2 && this.selectedGold !== null && this.scene.inBasket(this.worldPoint(event))) this.hideGold();
  }
  hideGold() {
    if (this.selectedGold === null) { this.notify("Chọn một thỏi vàng trước nhé."); return; }
    if (!this.train.hidden.includes(this.selectedGold)) this.train.hidden.push(this.selectedGold);
    this.selectedGold = null;
    this.notify(this.train.hidden.length === 3 ? "Đã giấu đủ vàng. Hãy ngồi yên và chuẩn bị giấy tờ." : "Đã giấu một thỏi vàng dưới thúng cam.");
    this.updateHUD(); this.saveProgress();
  }
  sitTrain() {
    if (this.state !== "gameplay" || this.level !== 2 || this.train.seated) return;
    if (this.train.hidden.length < 3) { this.notify("Phải giấu kín cả ba thỏi vàng trước nhé."); return; }
    this.state = "seating"; this.trainPose = {elapsed: 0, duration: 1};
    this.ui.hidePrompt(); this.updateHUD();
    this.saveProgress();
  }
  trainDisplay() {
    const layout = CHAPTER_ONE.trainLayout, tween = this.trainPose;
    if (!tween) return {...(this.train.seated ? layout.seat : layout.standing), seat: this.train.seated ? 1 : 0, walk: false};
    const progress = tween.elapsed / tween.duration, approach = Math.min(1, progress / .55);
    const bend = Math.max(0, (progress - .55) / .45);
    return {x: layout.standing.x + (layout.seat.x - layout.standing.x) * approach,
      y: layout.standing.y + (layout.seat.y - layout.standing.y) * approach,
      seat: bend * bend * (3 - 2 * bend), walk: approach < 1};
  }
  // Visibility graph: straight travel at any angle, detouring only at obstacles.
  walkTo(target, object = null) {
    if (this.giftTween) return;
    this.travel = []; this.pendingObject = null;
    const start = {x: this.player.x, y: this.player.y};
    const valid = p => !this.collision.blocks(this.player.getRect(p.x, p.y));
    const ends = object ? Array.from({length: 32}, (_, i) => {
      const angle = Math.atan2(start.y - target.y, start.x - target.x) + i * Math.PI / 16;
      const radius = object.art ? 12 : 60;
      return {x: target.x + Math.cos(angle) * radius, y: target.y + Math.sin(angle) * radius};
    }).filter(valid) : valid(target) ? [{x: target.x, y: target.y}] : [];
    const nodes = [start, ...ends];
    for (const z of this.collision.zones) {
      for (const x of [z.x - 16, z.x + z.width + 16]) for (const y of [z.y - 16, z.y + z.height + 16]) {
        const p = {x, y}; if (valid(p)) nodes.push(p);
      }
    }
    const distance = nodes.map(() => Infinity), previous = [], visited = new Set();
    distance[0] = 0;
    let end = -1;
    while (visited.size < nodes.length) {
      let current = -1;
      for (let i = 0; i < nodes.length; i++) if (!visited.has(i) && (current < 0 || distance[i] < distance[current])) current = i;
      if (current < 0 || !Number.isFinite(distance[current])) break;
      if (current > 0 && current <= ends.length) { end = current; break; }
      visited.add(current);
      for (let i = 1; i < nodes.length; i++) {
        if (visited.has(i)) continue;
        const next = distance[current] + Math.hypot(nodes[i].x - nodes[current].x, nodes[i].y - nodes[current].y);
        if (next < distance[i] && this.collision.clearPath(nodes[current], nodes[i])) {
          distance[i] = next; previous[i] = current;
        }
      }
    }
    if (end < 0) { this.notify("Chưa tới được vị trí đó. Cháu thử chọn lối đi bên cạnh nhé."); return; }
    for (let i = end; i !== 0; i = previous[i]) this.travel.unshift(nodes[i]);
    this.pendingObject = object;
  }
  updateWalk(dt) {
    const axis = this.input.movement(), manual = Math.hypot(axis.x, axis.y) > .001;
    if (manual) { this.travel = []; this.pendingObject = null; }
    if (!this.travel.length) this.player.update(dt, this.input, this.collision);
    else {
      const running = this.input.isDown("shift"), speed = running ? this.player.runSpeed : this.player.speed;
      let budget = speed * dt, moved = 0;
      // Spend the full frame's distance, even when crossing multiple path nodes.
      // Throwing away the remainder produced a tiny stop at every 20px boundary.
      while (budget > .00001 && this.travel.length) {
        const next = this.travel[0], dx = next.x - this.player.x, dy = next.y - this.player.y, distance = Math.hypot(dx, dy);
        if (distance < .00001) { this.travel.shift(); continue; }
        this.player.face(dx, dy);
        const amount = Math.min(distance, budget);
        this.player.x += dx / distance * amount; this.player.y += dy / distance * amount;
        moved += amount; budget -= amount;
        if (distance <= amount + .00001) this.travel.shift();
      }
      this.player.moving = moved > .00001; this.player.state = this.player.moving ? (running ? "run" : "walk") : "idle";
      this.player.animationTime += moved / this.player.speed;
      if (moved) this.player.visualAction = null;
      if (!this.travel.length && this.pendingObject) { const object = this.pendingObject; this.pendingObject = null; this.interact(object); }
    }
    if (this.state !== "gameplay") return;
    const near = this.nearObject();
    if (near) {
      this.ui.showPrompt(`E / Space — ${near.label}`);
      if (this.input.consume("e") || this.input.consume(" ")) this.interact(near);
    } else this.ui.hidePrompt();
  }
  update(dt) {
    if (!["pause", "journal", "menu"].includes(this.state)) {
      this.player.updateVisual(dt);
      this.dockCarry = 0;
      if (this.dockTween && !this.dock.crouched) {
        const amount = Math.max(0, Math.min(dt, this.dockTween.duration - this.dockTween.elapsed));
        this.dockAnimationTime += amount; this.dockTween.elapsed += amount;
        this.dockCarry = dt - amount;
      }
    }
    if (this.input.consume("escape")) {
      if (this.state === "journal") this.closeJournal();
      else if (this.state === "pause") this.resume();
      else if (["gameplay", "dialogue", "seating"].includes(this.state)) this.pause();
      return;
    }
    if (this.state === "seating") {
      this.trainPose.elapsed = Math.min(this.trainPose.duration, this.trainPose.elapsed + dt);
      if (this.trainPose.elapsed >= this.trainPose.duration) {
        this.train.seated = true; this.trainPose = null;
        Object.assign(this.player, CHAPTER_ONE.trainLayout.seat);
        this.say([{speaker: "Lính xét vé", text: "Cậu bé kia, đưa giấy thông hành đây!"}], () => { this.activateLevel(); this.openBag(); });
        this.saveProgress();
      }
      return;
    }
    if (this.state === "dialogue") {
      if (this.input.consume(" ") || this.input.consume("e")) this.advanceDialogue();
      return;
    }
    if (this.state !== "gameplay") return;
    if (this.input.consume("h")) { this.openHint(); return; }
    if (this.input.consume("i")) { this.openBag(); return; }
    if (this.giftTween) {
      this.giftTween.elapsed = Math.min(this.giftTween.duration, this.giftTween.elapsed + dt);
      if (this.giftTween.elapsed >= this.giftTween.duration) {
        const item = this.giftTween.item; this.giftTween = null; this.give(item);
        this.notify(`Đã nhận ${CHAPTER_ONE.items[item].name.toLowerCase()} từ Bác.`);
        this.updateHUD(); this.saveProgress();
      }
      return;
    }
    if (this.level === 1 || this.level === 3) this.updateWalk(dt);
    if (this.level === 2) {
      this.train.remaining = Math.max(0, this.train.remaining - dt);
      if (!this.train.remaining) { this.fail("Lính gác đã tới trước khi Kiên chuẩn bị xong. Thử lại: giấu vàng, ngồi yên rồi đưa giấy thông hành."); return; }
    }
    if (this.level === 4) this.updateDock(dt);
    if(this.river)this.river.update(dt);
    this.saveClock += dt;
    if (this.saveClock >= 1) { this.saveClock = 0; this.saveProgress(); }
    this.updateHUD();
  }
  toggleCrouch() {
    if (this.state !== "gameplay" || this.level !== 4) return;
    this.dock.crouched = !this.dock.crouched; this.updateHUD(); this.saveProgress();
  }
  moveDock(dx, dy) {
    if (this.state !== "gameplay" || this.level !== 4) return false;
    if (this.dockTween && this.dockTween.elapsed < this.dockTween.duration - 1e-9) return false;
    const from = this.dockDisplay();
    const pushing = this.dock.at(this.dock.boxes, this.dock.player.x + dx, this.dock.player.y + dy);
    if (this.dock.move(dx, dy)) {
      this.dockFacing = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";
      this.dockVisual = {state: pushing ? "push" : "walk"};
      const timing = CHAPTER_ONE.levels[4].movement;
      this.dockTween = {elapsed: 0, duration: pushing ? timing.pushDuration : timing.walkDuration, from,
        to: {player: {...this.dock.player}, boxes: this.dock.boxes.map(p => ({...p}))}};
      if (this.dock.solved()) this.say([{speaker: "Kiên", text: "Ba khoang đã xếp gọn muối! Mọi người có thể cho thuyền rời bến."}, {speaker: "Nguyễn Lương Bằng", text: "Làm tốt lắm, Kiên. Hành trình trên sông còn dài, chúng ta cùng bảo vệ số muối này."}], () => this.completeLevel());
      this.updateHUD(); return true;
    }
    return false;
  }
  dockDisplay() {
    const tween = this.dockTween;
    if (!tween || tween.elapsed >= tween.duration) return {player: {...this.dock.player}, boxes: this.dock.boxes.map(p => ({...p}))};
    const t = tween.elapsed / tween.duration;
    const lerp = (a, b) => ({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t});
    return {player: lerp(tween.from.player, tween.to.player), boxes: tween.to.boxes.map((p, i) => lerp(tween.from.boxes[i], p))};
  }
  undoDock() { if (this.state === "gameplay" && this.level === 4) { this.dock.undo(); this.dockTween = null; this.exposure = 0; this.saveProgress(); this.updateHUD(); } }
  updateDock(dt) {
    if (this.input.consume("c")) this.toggleCrouch();
    if (this.input.consume("z")) this.undoDock();
    if (this.input.consume("r")) { this.restartCheckpoint(); return; }
    const directions = [["w", "arrowup", 0, -1], ["s", "arrowdown", 0, 1], ["a", "arrowleft", -1, 0], ["d", "arrowright", 1, 0]];
    const dir = directions.find(([a, b]) => this.input.isDown(a) || this.input.isDown(b));
    if (dir) {
      const carry = this.dockTween ? this.dockCarry : dt;
      if (this.moveDock(dir[2], dir[3])) {
        this.dockTween.elapsed = Math.min(carry, this.dockTween.duration);
        this.dockAnimationTime += this.dockTween.elapsed;
      }
    }
    if (this.state !== "gameplay") return;
    this.dock.elapsed += dt;
    this.exposure = this.dock.exposed(this.dockDisplay().player.x) && !this.dock.crouched ? this.exposure + dt : 0;
    if (this.exposure > 1.1) this.fail("Ánh đèn đã phát hiện chuyển động. Ngồi thấp bằng C khi đèn tới gần; cháu được thử lại từ đầu bến.");
  }
  openJournal(title, content) {
    if (this.state !== "gameplay") return;
    this.state = "journal"; this.input.resetAnalog(); this.travel = []; this.pendingObject = null; this.ui.hidePrompt();
    this.river?.cancelPointer();
    document.getElementById("journalTitle").textContent = title;
    document.getElementById("journal").dataset.view = content.classList.contains("hint-pages") ? "hint" : "bag";
    document.getElementById("journalContent").replaceChildren(content);
    document.getElementById("journal").classList.remove("d-none");
    document.getElementById("closeJournalBtn").focus(); this.updateHUD();
  }
  openHint() {
    if (this.prologueRoom && !this.has("notebook")) { this.notify("Đến gặp Bác để nhận cuốn sổ tay nhé."); return; }
    const body = document.createElement("div"), label = document.createElement("p"), hint = document.createElement("p");
    body.className = "hint-pages";
    label.className = "notebook-caption"; label.textContent = "Lời nhắc trong sổ Bác tặng";
    hint.textContent = GAME_LEVELS[this.level].hint;
    body.append(label, hint); this.openJournal("Sổ tay của Bác", body);
  }
  openBag() {
    const body = document.createElement("div"); body.className = "inventory-grid";
    this.inventory.forEach(id => {
      const item = CHAPTER_ONE.items[id], button = document.createElement("button");
      button.className = "inventory-item";
      const icon = document.createElement("span"), name = document.createElement("strong"), description = document.createElement("small");
      icon.textContent = item.icon; name.textContent = item.name; description.textContent = item.description;
      if (window.gameArt.images[id]) { icon.textContent = ""; icon.style.backgroundImage = `url("${window.gameArt.images[id].toDataURL()}")`; icon.className = "item-art"; }
      button.append(icon, name, description);
      button.addEventListener("click", () => this.selectItem(id)); body.append(button);
    });
    this.openJournal(this.level === 2 && this.train.seated ? "Chọn giấy tờ đưa cho lính gác" : "Ba lô của Kiên", body);
  }
  selectItem(id) {
    if (this.level === 2 && this.train.seated && this.state === "journal") {
      if (id !== "pass") { this.notify("Đây chưa phải giấy thông hành. Bình tĩnh chọn lại nhé."); return; }
      this.closeJournal(); this.flags.trainPassed = true;
      this.say([{speaker: "Kiên", text: "Dạ, giấy thông hành của cháu đây ạ."}, {speaker: "Lính xét vé", text: "Được rồi. Ngồi yên đấy."}, {speaker: "Nguyễn Lương Bằng", text: "Lính gác đã đi qua. Thu lại vàng an toàn, chúng ta sắp tới Nam Định rồi."}], () => this.completeLevel());
      this.saveProgress();
    } else if (id === "notebook") { this.closeJournal(); this.openHint(); }
    else this.notify(CHAPTER_ONE.items[id].description);
  }
  closeJournal() {
    if (this.state !== "journal") return;
    document.getElementById("journal").classList.add("d-none"); this.state = "gameplay"; this.updateHUD();
  }
  pause() {
    if (!["gameplay", "dialogue", "seating"].includes(this.state)) return;
    this.input.resetAnalog(); this.beforePause = this.state; this.state = "pause"; this.ui.showPause(); this.saveProgress(); this.updateHUD();
    this.river?.cancelPointer();
  }
  resume() { if (this.state !== "pause") return; this.state = this.beforePause || "gameplay"; this.ui.hidePause(); this.updateHUD(); }
  restartCheckpoint() {
    if (this.prologueRoom) { this.ui.hidePause(); this.startPrologue(); return; }
    const level = this.level;
    if (level === 1) { this.inventory = ["compass", "notebook"]; this.flags = {prologue: true}; }
    if (level === 2) delete this.flags.trainPassed;
    if (level === 3) {
      this.inventory = this.inventory.filter(id => !["tools", "bucket", "water"].includes(id));
      delete this.flags.cart; delete this.flags.water;
    }
    if(level>=5){this.remove("bone");this.remove("mud");this.remove("leaves");}
    this.loadLevel(level); this.saveProgress();
  }
  fail(reason) {
    this.state = "failed"; this.ui.hidePrompt();
    document.getElementById("completeTitle").textContent = "Thử lại nhé, Kiên!";
    this.ui.showComplete(reason); document.getElementById("nextBtn").textContent = "Chơi lại màn này"; this.updateHUD();
  }
  completeLevel() {
    if (!this.completedLevels.includes(this.level)) this.completedLevels.push(this.level);
    this.stageComplete = true; this.state = "complete"; this.ui.hideDialogue(); this.ui.hidePrompt();
    if (this.level === 4 || this.level === 7) { this.finishChapter(); return; }
    document.getElementById("completeTitle").textContent = "Nhiệm vụ hoàn thành";
    this.ui.showComplete(`Màn ${this.level}: ${GAME_LEVELS[this.level].name}. Tiến trình đã được ghi lại.`);
    document.getElementById("nextBtn").textContent = `Tiếp tục · Màn ${this.level + 1}`;
    this.updateHUD(); this.saveProgress();
  }
  nextLevel() { if (this.state === "failed") this.restartCheckpoint(); else if (this.state === "complete" && this.level < 7) { this.loadLevel(this.level + 1); this.saveProgress(); } }
  finishChapter() {
    this.chapterComplete = true; this.state = "chapterEnd";
    this.ui.hideComplete(); this.ui.hideDialogue(); this.ui.hidePrompt();
    const second=this.level>=5;
    document.getElementById("chapterEndProgress").textContent=second?"ĐÃ HOÀN THÀNH 3 / 3 MÀN":"ĐÃ HOÀN THÀNH 4 / 4 MÀN";
    document.getElementById("chapterEndTitle").textContent=`${second?CHAPTER_TWO.title:CHAPTER_ONE.title} đã hoàn thành!`;
    document.getElementById("chapterEndSummary").textContent=second?"Kiên đã mở dây chắn, bảo vệ muối giữa bão và giấu thuyền trong bãi lau an toàn.":"Kiên đã chuẩn bị hành trang, qua trạm kiểm tra, giúp bà con Văn Lý và đưa muối xuống thuyền an toàn.";
    document.getElementById("chapterEndNote").textContent=second?"Phía trước là Chương 3: Xuyên rừng mùa thu. Chương này chưa triển khai.":"Tiếp tục Chương 2: Ngược dòng mùa mưa bão, gồm màn 5–7.";
    document.getElementById("nextChapterBtn").classList.toggle("d-none",second);
    document.getElementById("chapterEnd").classList.remove("d-none"); this.updateHUD(); this.saveProgress();
  }
  returnToMenu() {
    this.saveProgress(); this.dialogue.active = false; this.state = "menu";
    this.ui.hidePause(); this.ui.hideDialogue(); this.ui.hideComplete(); this.ui.hidePrompt();
    document.getElementById("chapterEnd").classList.add("d-none"); document.getElementById("journal").classList.add("d-none");
    this.ui.showMenu(); this.refreshContinue(); this.updateHUD();
  }
  saveProgress() {
    const ok = this.save.save({version: 2, level: this.level, inventory: [...this.inventory], flags: {...this.flags},
      completedLevels: [...this.completedLevels], player: {x: this.player.x, y: this.player.y},
      train: {...this.train, hidden: [...this.train.hidden]}, dock: this.dock.snapshot(),
      river:this.river?.snapshot()??null,
      stageComplete: !!this.stageComplete, chapterComplete: !!this.chapterComplete});
    document.getElementById("saveStatus").textContent = ok ? "Tự động lưu tiến trình" : "Trình duyệt không cho lưu · giữ trang để chơi tiếp";
  }
  render() {
    const ctx = this.ctx, w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#142620"; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(this.scene.ambientFor(this.level, w, h), 0, 0);
    ctx.save(); ctx.translate(this.viewOffsetX, this.viewOffsetY); ctx.scale(this.viewScale, this.viewScale);
    this.scene.render(ctx, this); ctx.restore(); if (!this.prologueRoom) this.scene.miniMap(this);
    const hidden = (this.prologueRoom && this.state === "dialogue") || ["menu", "chapterEnd", "complete", "failed"].includes(this.state);
    if (this.ui.hud.classList.contains("d-none") !== hidden) this.ui.hud.classList.toggle("d-none", hidden);
  }
  frame(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000 || 0, .05);
    this.lastTime = timestamp; this.update(dt); this.render(); this.input.endFrame();
    requestAnimationFrame(time => this.frame(time));
  }
  startLoop() { requestAnimationFrame(time => { this.lastTime = time; this.frame(time); }); }
}
