class Game {
  constructor(canvas, input, ui, save) {
    this.canvas = canvas; this.ctx = canvas.getContext("2d");
    this.input = input; this.ui = ui; this.save = save;
    this.state = "menu";
    this.worldWidth = 1200; this.worldHeight = 700;
    this.player = new Player(M2_MAP.spawn.x, M2_MAP.spawn.y);
    this.collision = new CollisionSystem(this.worldWidth, this.worldHeight);
    this.camera = new Camera(canvas.width, canvas.height, this.worldWidth, this.worldHeight);
    this.dialogue = new DialogueSystem(ui, input);
    this.lastTime = 0; this.debug = false; this.level = 2;
    this.tutorialComplete = false; this.interactionRange = 70;
    this.officer = {...M2_MAP.officer,radius:28,active:true};
    this.m5Comrade = {x:760,y:350,active:false};
    this.spawn = {...M2_MAP.spawn}; this.checkpoint = {...this.spawn};
    this.missionCompleteTimer = null;
    this.scene = new SceneRenderer(window.gameArt);
    this.bindMenu(); this.resize(); window.addEventListener("resize",()=>this.resize());
  }
  bindMenu() {
    document.getElementById("startBtn").addEventListener("click",()=>this.startNew());
    document.getElementById("continueBtn").addEventListener("click",()=>this.continueGame());
    document.getElementById("aboutBtn").addEventListener("click",()=>this.ui.message("Prototype HTML5 về game lịch sử. Nội dung cốt truyện sẽ được bổ sung theo thiết kế đã chốt."));
    document.getElementById("resumeBtn").addEventListener("click",()=>this.resume());
    document.getElementById("checkpointBtn").addEventListener("click",()=>this.restartCheckpoint());
    document.getElementById("settingsBtn").addEventListener("click",()=>this.ui.message("Cài đặt sẽ được xây ở phiên bản tiếp theo."));
    document.getElementById("exitBtn").addEventListener("click",()=>this.returnToMenu());
  }
  resize() {
    const w = window.innerWidth, h = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(w * dpr); this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = `${w}px`; this.canvas.style.height = `${h}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.viewScale = Math.max(.75, Math.min(w / this.worldWidth, h / this.worldHeight));
    this.viewOffsetX = Math.max(0, (w - this.worldWidth * this.viewScale) / 2);
    this.viewOffsetY = Math.max(0, (h - this.worldHeight * this.viewScale) / 2);
    this.camera.resize(w / this.viewScale, h / this.viewScale);
    this.camera.follow(this.player);
  }
  startNew(){this.save.clear();this.player=new Player(this.spawn.x,this.spawn.y);this.checkpoint={...this.spawn};this.tutorialComplete=false;this.ui.hideMenu();this.startGameplay();}
  continueGame(){const data=this.save.load();if(!data){this.ui.message("Chưa có tiến trình đã lưu.");return;}this.level=data.currentLevel||2;this.player=new Player(data.player?.x??this.spawn.x,data.player?.y??this.spawn.y);this.player.hp=data.player?.hp??100;this.checkpoint=data.checkpoint??{...this.spawn};this.tutorialComplete=!!data.tutorialComplete;this.ui.hideMenu();if(this.level===4)this.startLevel4();else if(this.level===5)this.startLevel5();else this.startGameplay();}
  startGameplay() {
    this.level = 2; this.state = "gameplay";
    this.ui.hidePause(); this.ui.hideComplete(); this.ui.hideDialogue(); this.ui.hidePrompt();
    this.ui.setMission("M2 — Làm quen đơn vị", "Khám phá doanh trại và tìm cán bộ tại nhà Đơn vị.");
    this.ui.setTimer(0, false); this.ui.setSupply(false);
    this.collision.setZones(M2_MAP.collisionZones);
    // Old saves can point into a relocated building or outside the new camp fence.
    const usable = point => point && point.x >= 90 && point.x <= 1110 && point.y >= 95 && point.y <= 640
      && !this.collision.blocks(this.player.getRect(point.x, point.y));
    if (!usable(this.player)) { this.player.x = this.spawn.x; this.player.y = this.spawn.y; }
    if (!usable(this.checkpoint)) this.checkpoint = {...this.spawn};
    this.camera.follow(this.player);
  }
  update(dt){
    if(this.state==="menu")return;
    if(this.input.consume("escape")){if(this.state==="gameplay")this.pause();else if(this.state==="pause")this.resume();return;}
    if(this.state==="pause"||this.state==="complete"||this.state==="fail")return;
    if(this.state==="dialogue"){this.dialogue.update();return;}
    if(this.state!=="gameplay")return;
    if(this.input.consume("f3"))this.debug=!this.debug;
    if(this.level===3){this.updateLevel3(dt);return;}
    if(this.level===4){this.updateLevel4(dt);return;}
    if(this.level===5){this.updateLevel5(dt);return;}
    this.player.dodge(this.input);this.player.update(dt,this.input,this.collision);this.handleInteraction();this.camera.follow(this.player);this.ui.setHP(this.player.hp,this.player.maxHp);this.autoSave();
  }
  handleInteraction(){const d=Math.hypot(this.player.x-this.officer.x,this.player.y-this.officer.y);if(d<=this.interactionRange&&this.officer.active&&!this.dialogue.active){this.ui.showPrompt("Space — Nói chuyện");if(this.input.consume(" "))this.startMissionDialogue();}else this.ui.hidePrompt();}
  startMissionDialogue(){this.state="dialogue";this.ui.hidePrompt();this.dialogue.start([{speaker:"Cán bộ phụ trách",text:"Đồng chí mới được điều động đến đơn vị phải không?"},{speaker:"Cán bộ phụ trách",text:"Trước hết hãy làm quen với khu vực và nắm các thao tác cơ bản."},{speaker:"Cán bộ phụ trách",text:"Tốt. Bây giờ đồng chí nhận nhiệm vụ đầu tiên."}],()=>{this.tutorialComplete=true;this.saveProgress();this.showCompleteThen(this.startLevel3.bind(this));});}
  showCompleteThen(next){this.state="complete";this.ui.showComplete("Nhiệm vụ hoàn thành");clearTimeout(this.missionCompleteTimer);this.missionCompleteTimer=setTimeout(()=>{this.ui.hideComplete();next();},1100);}
  startLevel3(){this.state="gameplay";this.player=new Player(110,350);this.checkpoint={x:110,y:350};this.level=3;this.player.carryingSupply=false;this.ui.setMission("M3 — Vận chuyển vật tư","Nhận kiện hàng và đưa đến vị trí được chỉ định.");this.ui.setTimer(180,true);this.ui.setSupply(false);this.ui.hidePrompt();this.supply={x:240,y:350,active:true};this.deliveryZone={x:980,y:350,width:100,height:100};this.level3StartTime=performance.now();this.collision.setZones([{x:0,y:0,width:1200,height:70},{x:0,y:630,width:1200,height:70},{x:400,y:225,width:135,height:55},{x:610,y:465,width:140,height:45}]);this.saveProgress();}
  updateLevel3(dt){this.player.dodge(this.input);this.player.update(dt,this.input,this.collision);const remaining=Math.max(0,180-(performance.now()-this.level3StartTime)/1000);this.ui.setTimer(remaining,true);if(remaining<=0){this.failMission("Hết thời gian.",this.checkpoint);return;}if(this.supply?.active){const d=Math.hypot(this.player.x-this.supply.x,this.player.y-this.supply.y);if(d<=55){this.ui.showPrompt("Space — Nhặt");if(this.input.consume(" ")){this.player.carryingSupply=true;this.supply.active=false;this.ui.setSupply(true,"Kiện hàng");this.ui.setMission("M3 — Vận chuyển vật tư","Đưa kiện hàng đến vị trí được chỉ định.");}}else this.ui.hidePrompt();}else if(this.player.carryingSupply){const z=this.deliveryZone;const inside=this.player.x>=z.x&&this.player.x<=z.x+z.width&&this.player.y>=z.y&&this.player.y<=z.y+z.height;if(inside){this.ui.showPrompt("Space — Đặt hàng");if(this.input.consume(" ")){this.player.carryingSupply=false;this.ui.setSupply(false);this.ui.hidePrompt();this.ui.setMission("M3 — Vận chuyển vật tư","Đã giao kiện hàng.");this.checkpoint={x:110,y:350};this.saveProgress();this.showCompleteThen(this.startLevel4.bind(this));}}else this.ui.hidePrompt();}this.camera.follow(this.player);this.ui.setHP(this.player.hp,this.player.maxHp);}
  startLevel4(){this.state="gameplay";this.level=4;this.player=new Player(105,350);this.player.hp=100;this.player.carryingSupply=false;this.checkpoint={x:105,y:350};this.ui.hideComplete();this.ui.setMission("M4 — Tiếp tế trong không kích","Hoàn thành 3 điểm tiếp tế theo đúng thứ tự.");this.ui.setTimer(240,true);this.ui.setSupply(false);this.ui.hidePrompt();this.m4={start:performance.now(),lastRaid:false,raidStarted:false,raidTimer:0,raidDuration:8,step:0,points:[{x:300,y:145,done:false},{x:650,y:520,done:false},{x:1010,y:250,done:false}],shelter:{x:470,y:250,width:150,height:75}};this.collision.setZones([{x:0,y:0,width:1200,height:55},{x:0,y:645,width:1200,height:55},{x:210,y:80,width:105,height:55},{x:500,y:360,width:70,height:60},{x:730,y:215,width:150,height:55},{x:900,y:430,width:170,height:55}]);this.saveProgress();}
  updateLevel4(dt){this.player.dodge(this.input);this.player.update(dt,this.input,this.collision);const m=this.m4;const remaining=Math.max(0,240-(performance.now()-m.start)/1000);this.ui.setTimer(remaining,true);if(remaining<=0){this.failMission("Hết thời gian.",this.checkpoint);return;}
    // Prototype timing for the single major air-raid wave; this timing is adjustable.
    if(!m.raidStarted&&(performance.now()-m.start)/1000>=35){m.raidStarted=true;m.raidTimer=m.raidDuration;this.ui.airRaid();}
    if(m.raidStarted&&m.raidTimer>0){m.raidTimer-=dt;const s=m.shelter;const inside=this.player.x>=s.x&&this.player.x<=s.x+s.width&&this.player.y>=s.y&&this.player.y<=s.y+s.height;if(!inside&&!m.lastRaid){if(this.player.takeDamage(25)){this.ui.flashAndShake();this.ui.showDanger("Không ở trong hầm trú ẩn — mất 25 HP");}}m.lastRaid=true;}else if(m.raidStarted&&m.raidTimer<=0){m.raidStarted=false;m.lastRaid=false;}
    const point=m.points[m.step];if(point&&!point.done){const d=Math.hypot(this.player.x-point.x,this.player.y-point.y);if(d<65){this.ui.showPrompt("Space — Giao vật tư");if(this.input.consume(" ")){point.done=true;m.step++;this.ui.hidePrompt();this.ui.setMission("M4 — Tiếp tế trong không kích",m.step<3?`Tiếp tục đến điểm tiếp tế ${m.step+1}/3.`:"Đã hoàn thành 3 điểm tiếp tế.");this.ui.stepComplete(`Điểm tiếp tế ${m.step}/3 hoàn thành`);this.checkpoint={x:this.player.x,y:this.player.y};this.saveProgress();if(m.step>=3)this.showCompleteThen(()=>this.startLevel5Prototype());}}else this.ui.hidePrompt();}
    if(this.player.hp<=0){this.failMission("Bạn đã gục xuống.",this.checkpoint);return;}this.camera.follow(this.player);this.ui.setHP(this.player.hp,this.player.maxHp);
  }
  startLevel5Prototype(){this.startLevel5();}
  startLevel5(){this.state="gameplay";this.level=5;this.m5DialogueDone=false;this.m5ReturnReached=false;this.m5Comrade={x:760,y:350,active:true};this.ui.setTimer(0,false);this.ui.setSupply(false);this.ui.hideDialogue();this.ui.hideComplete();this.ui.setMission("M5 — Trở về đơn vị","Trở về đơn vị và gặp đồng đội.");this.player=new Player(180,350);this.checkpoint={x:180,y:350};this.collision.setZones([{x:0,y:0,width:1200,height:70},{x:0,y:630,width:1200,height:70},{x:480,y:150,width:250,height:45},{x:480,y:505,width:250,height:45},{x:870,y:185,width:260,height:53}]);this.m5ReturnZone={x:940,y:245,width:100,height:100};this.saveProgress();}
  updateLevel5(dt){this.player.dodge(this.input);this.player.update(dt,this.input,this.collision);if(!this.m5DialogueDone){const z=this.m5ReturnZone;const inside=this.player.x>=z.x&&this.player.x<=z.x+z.width&&this.player.y>=z.y&&this.player.y<=z.y+z.height;if(inside){this.ui.showPrompt("Space — Trở về đơn vị");if(this.input.consume(" ")){this.ui.hidePrompt();this.m5ReturnReached=true;this.ui.setMission("M5 — Trở về đơn vị","Nói chuyện với đồng đội về những gì vừa trải qua trong trận chiến.");}}else this.ui.hidePrompt();if(this.m5ReturnReached){const d=Math.hypot(this.player.x-this.m5Comrade.x,this.player.y-this.m5Comrade.y);if(d<=this.interactionRange&&this.m5Comrade.active){this.ui.showPrompt("Space — Nói chuyện");if(this.input.consume(" "))this.startM5Dialogue();}else this.ui.hidePrompt();}}this.camera.follow(this.player);this.ui.setHP(this.player.hp,this.player.maxHp);}
  startM5Dialogue(){this.state="dialogue";this.ui.hidePrompt();this.dialogue.start([{speaker:"Đồng đội",text:"Đồng chí vừa từ ngoài trận địa về phải không?"},{speaker:"Chiến sĩ",text:"Ừ. Trận chiến vừa rồi rất căng thẳng, nhưng anh em vẫn giữ vững nhiệm vụ."},{speaker:"Đồng đội",text:"Chúng ta cùng ngồi lại. Còn nhiều điều cần nhìn lại sau trận chiến."}],()=>{this.m5DialogueDone=true;this.m5Comrade.active=false;this.saveProgress();this.startEndingPV();});}
  startEndingPV(){
    this.state="endingPV";
    this.ui.hideDialogue();this.ui.hidePrompt();this.ui.hideComplete();this.ui.hidePause();
    const overlay=document.getElementById("endingPV"),video=document.getElementById("endingVideo"),fade=document.getElementById("pvFade"),placeholder=document.getElementById("pvPlaceholder");
    overlay.classList.remove("d-none");fade.classList.remove("fade-out");placeholder.classList.add("d-none");
    video.classList.remove("d-none");video.src="assets/video/ending.mp4";
    const finish=()=>{overlay.classList.add("d-none");this.state="ending";this.ui.message("PV kết thúc đã hoàn thành.");};
    video.onended=finish;
    video.onerror=()=>{video.classList.add("d-none");placeholder.classList.remove("d-none");setTimeout(()=>fade.classList.add("fade-out"),150);};
    video.play().then(()=>{setTimeout(()=>fade.classList.add("fade-out"),80);}).catch(()=>{video.classList.add("d-none");placeholder.classList.remove("d-none");setTimeout(()=>fade.classList.add("fade-out"),150);});
  }
  failMission(reason,checkpoint){clearTimeout(this.missionCompleteTimer);this.state="complete";this.ui.showComplete(`Thất bại — ${reason}`);setTimeout(()=>{this.ui.hideComplete();this.player=new Player(checkpoint.x,checkpoint.y);this.player.hp=100;this.state="gameplay";this.ui.setMission(this.level===4?"M4 — Tiếp tế trong không kích":"M3 — Vận chuyển vật tư",this.level===4?`Tiếp tục đến điểm tiếp tế ${this.m4.step+1}/3.` : "Nhận kiện hàng và đưa đến vị trí được chỉ định.");},1100);}
  pause(){this.state="pause";this.ui.showPause();}
  resume(){this.state="gameplay";this.ui.hidePause();}
  restartCheckpoint(){clearTimeout(this.missionCompleteTimer);this.ui.hidePause();this.ui.hideComplete();if(this.level===4){this.player=new Player(this.checkpoint.x,this.checkpoint.y);this.player.hp=100;this.state="gameplay";}else if(this.level===3){this.startLevel3();}else if(this.level===5){this.startLevel5();}else{this.player=new Player(this.checkpoint.x,this.checkpoint.y);this.state="gameplay";}}
  returnToMenu(){this.saveProgress();this.state="menu";this.ui.hidePause();this.ui.hideDialogue();this.ui.hideComplete();this.ui.showMenu();}
  saveProgress(){this.save.save({currentLevel:this.level,tutorialComplete:this.tutorialComplete,checkpoint:this.checkpoint,player:{x:this.player.x,y:this.player.y,hp:this.player.hp}});}
  autoSave(){}
  objectiveTarget() {
    if (this.level === 2) return {x: this.officer.x, y: this.officer.y, label: "GẶP CÁN BỘ"};
    if (this.level === 3 && this.supply && this.deliveryZone) return this.supply.active
      ? {x: this.supply.x, y: this.supply.y, label: "NHẶT KIỆN HÀNG"}
      : {x: this.deliveryZone.x + 50, y: this.deliveryZone.y + 50, label: "GIAO VẬT TƯ"};
    if (this.level === 4 && this.m4) {
      if (this.m4.raidStarted) return {x: 545, y: 295, label: "TRÚ ẨN"};
      const point = this.m4.points[this.m4.step];
      return point ? {x: point.x, y: point.y, label: ""} : null;
    }
    if (this.level === 5 && this.m5ReturnZone) return this.m5ReturnReached
      ? {x: this.m5Comrade.x, y: this.m5Comrade.y, label: "GẶP ĐỒNG ĐỘI"}
      : {x: this.m5ReturnZone.x + 50, y: this.m5ReturnZone.y + 50, label: "TRỞ VỀ ĐƠN VỊ"};
    return null;
  }
  render() {
    const ctx = this.ctx, w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = "#1e3026"; ctx.fillRect(0, 0, w, h);
    ctx.save();
    ctx.translate(this.viewOffsetX, this.viewOffsetY); ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-this.camera.x, -this.camera.y);
    this.scene.render(ctx, this);
    if (this.debug) this.collision.renderDebug(ctx);
    ctx.restore();
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * .25, w / 2, h / 2, Math.max(w, h) * .7);
    vignette.addColorStop(0, "rgba(11,24,16,0)"); vignette.addColorStop(1, "rgba(11,24,16,.45)");
    ctx.fillStyle = vignette; ctx.fillRect(0, 0, w, h);
    this.scene.miniMap(this);
    this.ui.hud.classList.toggle("d-none", this.state === "menu" || this.state === "endingPV" || this.state === "ending");
  }
  frame(timestamp){const dt=Math.min((timestamp-this.lastTime)/1000||0,.05);this.lastTime=timestamp;this.update(dt);this.render();this.input.endFrame();requestAnimationFrame(t=>this.frame(t));}
  startLoop(){requestAnimationFrame(t=>{this.lastTime=t;this.frame(t);});}
}
