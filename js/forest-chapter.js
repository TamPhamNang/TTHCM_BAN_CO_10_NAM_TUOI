// Chapter 3 is isolated from the river and Chapter 1 puzzle state.
class ForestChapter {
  constructor(game,saved=null) {
    this.game=game;
    this.data=saved?JSON.parse(JSON.stringify(saved)):{
      time:0,
      pack:{loads:[0,0,0,0],phase:"loading",departure:0},
      hill:{progress:.08,velocity:0,lastPush:-10,slipIn:5.5,slipping:false,slipLeft:3,stones:[false,false,false],braced:false,phase:"push",lastChock:null},
      camp:{phase:"search",revealed:false,herb:false,wood:false,flint:false,sparks:0,lastSpark:-10,brew:0,served:0},
      air:{phase:"approach",wait:3,remaining:5,watch:7,wave:1,whistled:false,shelterTime:0,groups:[0,1,2].map(()=>({cover:-1,progress:0})),selected:0}
    };
    this.light={x:game.player.x,y:game.player.y-60};this.transfer=null;this.pulse=0;
    if(game.level===8)this.buildPackUI();
  }
  snapshot(){return JSON.parse(JSON.stringify(this.data));}
  static advance(value,step,limit){const next=Math.min(limit,value+step);return next>=limit-1e-9?limit:next;}
  static valid(d) {
    const n=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
    const integer=(v,min,max)=>Number.isInteger(v)&&n(v,min,max);
    const bool=v=>typeof v==="boolean";
    if(!d||!n(d.time,0,1e8))return false;
    const p=d.pack,h=d.hill,c=d.camp,a=d.air;
    if(!p||!["loading","departing","done"].includes(p.phase)||!n(p.departure,0,3)||!Array.isArray(p.loads)||p.loads.length!==4||!p.loads.every((v,i)=>integer(v,0,CHAPTER_THREE.carriers[i].capacity)))return false;
    if(p.phase!=="loading"&&!p.loads.every((v,i)=>v===CHAPTER_THREE.carriers[i].capacity))return false;
    if(!h||!n(h.progress,0,1)||!n(h.velocity,0,.12)||!n(h.lastPush,-10,d.time)||!n(h.slipIn,0,5.5)||!n(h.slipLeft,0,3)||!bool(h.slipping)||!bool(h.braced)||!["push","crested"].includes(h.phase))return false;
    if(!Array.isArray(h.stones)||h.stones.length!==3||!h.stones.every(bool)||h.lastChock!==null&&!n(h.lastChock,0,1)||h.phase==="crested"&&h.progress!==1)return false;
    if(!c||!["search","lighting","brewing","ready","serving","healed"].includes(c.phase)||![c.revealed,c.herb,c.wood,c.flint].every(bool)||!integer(c.sparks,0,3)||!n(c.lastSpark,-10,d.time)||!n(c.brew,0,6)||!n(c.served,0,2))return false;
    if(c.phase!=="search"&&![c.herb,c.wood,c.flint].every(Boolean)||["brewing","ready","serving","healed"].includes(c.phase)&&c.sparks!==3||["ready","serving","healed"].includes(c.phase)&&c.brew!==6)return false;
    if(!a||!["approach","alarm","flyover","resume","clear"].includes(a.phase)||!n(a.wait,0,4)||!n(a.remaining,0,5)||!n(a.watch,0,7)||!integer(a.wave,1,2)||!bool(a.whistled)||!n(a.shelterTime,0,1.6)||!integer(a.selected,0,2))return false;
    if(!Array.isArray(a.groups)||a.groups.length!==3||!a.groups.every(g=>g&&integer(g.cover,-1,2)&&n(g.progress,0,1)&&(g.cover!==-1||g.progress===0)))return false;
    const assigned=a.groups.filter(g=>g.cover>=0).map(g=>g.cover);
    if(new Set(assigned).size!==assigned.length)return false;
    if(["flyover","resume","clear"].includes(a.phase)&&(!a.whistled||!a.groups.every(g=>g.progress===1)))return false;
    return a.phase!=="clear"||a.wave===2;
  }
  finished(){const d=this.data;return this.game.level===8?d.pack.phase==="done":this.game.level===9?d.hill.phase==="crested":this.game.level===10?d.camp.phase==="healed":d.air.phase==="clear";}
  timer(){return this.game.level===9&&this.data.hill.slipping?this.data.hill.slipLeft:this.game.level===11&&this.data.air.phase==="alarm"?this.data.air.remaining:null;}
  hudKey(){const d=this.data,p=d.pack,h=d.hill,c=d.camp,a=d.air;return [p.loads,p.phase,h.phase,Math.floor(h.progress*100),h.slipping,h.braced,Math.floor(h.slipLeft*10),h.stones,c.phase,c.revealed,c.herb,c.wood,c.flint,c.sparks,Math.floor(c.brew),a.phase,a.wave,a.whistled,a.selected,a.groups.map(g=>g.cover),Math.ceil(a.remaining*10),Math.ceil(a.watch)].join("|");}
  objective() {
    const g=this.game,d=this.data;
    if(g.level===8)return d.pack.phase==="loading"?`Chia đủ 9 bao theo sức chở (${d.pack.loads.reduce((a,b)=>a+b,0)}/9). Ngựa 4 · Xe 2 · Chú 2 · Chị 1.`:"Đoàn dân công đã nhận đủ muối và đang lên đường vào rừng.";
    if(g.level===9)return d.hill.slipping?"XE ĐANG TRƯỢT! Chạm đá sáng gần xe hoặc C để chèn bánh.":`Đẩy xe theo nhịp E / Space. Đã vượt ${Math.floor(d.hill.progress*100)}% đường đèo.`;
    if(g.level===10){const c=d.camp;return c.phase==="search"?`Tìm đúng cây trong sổ, củi khô và đá đánh lửa (${[c.herb,c.wood,c.flint].filter(Boolean).length}/3).`:c.phase==="lighting"?`Đánh lửa ba nhịp (${c.sparks}/3).`:c.phase==="brewing"?"Đang nấu nước lá. Đợi hơi nước bốc lên rồi mang tới bác Hai.":c.phase==="ready"?"Nước lá đã sẵn sàng. Mang tới bác Hai đang nghỉ bên lán.":"Kiên đang giúp bác Hai uống nước lá và nghỉ ngơi.";}
    const a=d.air;return a.phase==="approach"?"Đoàn đang đi trong rừng. Quan sát bóng máy bay và chuẩn bị thổi còi.":a.phase==="alarm"?`E thổi còi · Chọn nhóm rồi C để nấp (${a.groups.filter(g=>g.progress===1).length}/3).`:a.phase==="flyover"?"Cả đoàn đã núp kín. Giữ yên, chờ máy bay qua hẳn.":"Máy bay đã qua. Ra hiệu cho cả đoàn đi tiếp.";
  }
  buildPackUI() {
    const grid=document.getElementById("forestLoadGrid");grid.replaceChildren();
    CHAPTER_THREE.carriers.forEach((carrier,i)=>{
      const card=document.createElement("div"),image=document.createElement("img"),name=document.createElement("strong"),controls=document.createElement("div"),count=document.createElement("output");
      card.className="forest-load-card";image.src=window.gameArt.images[carrier.art].toDataURL();image.alt="";
      name.textContent=`${carrier.name} · Tối đa ${carrier.capacity}`;count.id=`forestLoad${i}`;count.setAttribute("aria-label",`Số bao của ${carrier.name}`);
      for(const delta of [-1,1]){const button=document.createElement("button");button.className="btn btn-outline-light";button.textContent=delta<0?"−":"+";button.dataset.carrier=i;button.dataset.delta=delta;button.setAttribute("aria-label",`${delta<0?"Bớt":"Thêm"} một bao · ${carrier.name}`);button.addEventListener("click",()=>this.allocate(i,delta));controls.append(button);if(delta<0)controls.append(count);}
      card.append(image,name,controls);grid.append(card);
    });
  }
  allocate(i,delta) {
    const g=this.game,p=this.data.pack,c=CHAPTER_THREE.carriers[i];
    if(g.state!=="gameplay"||g.level!==8||p.phase!=="loading"||!c||![1,-1].includes(delta))return;
    const next=p.loads[i]+delta;
    if(next<0)return;
    if(next>c.capacity){g.notify(`${c.name} chỉ mang được ${c.capacity} bao. Cháu chia sang người khác nhé.`);return;}
    p.loads[i]=next;this.transfer={carrier:i,delta,elapsed:0};this.changed();
  }
  objects() {
    if(this.game.level!==10)return [];
    const c=this.data.camp;
    return [
      ...(!c.herb&&c.revealed?[{id:"forestHerb",x:963,y:416,label:"Đối chiếu cây với sổ tay",art:{id:"forestHerb",x:989,bottom:397,labelY:444,width:57}}]:[]),
      ...(!c.wood?[{id:"forestWood",x:982,y:500,label:"Nhặt củi khô",art:{id:"forestWood",x:1035,bottom:515,labelY:528,width:78}}]:[]),
      ...(!c.flint?[{id:"forestFlint",x:525,y:446,label:"Lấy đá đánh lửa",art:{id:"forestFlint",x:520,bottom:425,labelY:474,width:34}}]:[]),
      {id:"forestCook",x:472,y:421,label:c.phase==="lighting"?"Gõ đá nhóm bếp":"Nồi nấu nước lá"},
      {id:"forestPatient",npc:true,x:350,y:408,label:"Bác Hai · Mang nước lá"}
    ];
  }
  interact(object) {
    const g=this.game,c=this.data.camp;
    if(object.id==="forestHerb"){this.chooseHerb();return;}
    if(object.id==="forestWood"||object.id==="forestFlint"){
      c[object.id==="forestWood"?"wood":"flint"]=true;g.give(object.id);g.player.startAction("pickup");g.notify(`Đã lấy ${CHAPTER_THREE.items[object.id].name.toLowerCase()}.`);
    }
    if(object.id==="forestCook") {
      if(c.phase==="search"){
        if(![c.herb,c.wood,c.flint].every(Boolean)){g.notify("Cần đủ cây đã đối chiếu, củi khô và đá đánh lửa trước nhé.");return;}
        c.phase="lighting";g.travel=[];g.notify("Gõ ba nhịp E hoặc nút Đánh lửa để nhóm bếp nhỏ.");
      } else if(c.phase==="lighting")this.spark();
      else g.notify(c.phase==="brewing"?"Nước lá đang nấu, cháu đợi một chút nhé.":"Mang bát nước lá tới bác Hai nhé.");
    }
    if(object.id==="forestPatient") {
      if(c.phase!=="ready"){g.notify("Bác Hai đang nghỉ. Hãy nấu nước lá rồi mang lại cho bác nhé.");return;}
      c.phase="serving";c.served=0;g.remove("forestMedicine");g.travel=[];g.player.moving=false;
    }
    this.changed();
  }
  chooseHerb() {
    const g=this.game,body=document.createElement("div"),intro=document.createElement("p"),choices=document.createElement("div");
    intro.textContent="Đối chiếu hình trong sổ: cây cần tìm có lá nhỏ, xẻ mảnh. Chọn hình phù hợp nhé.";choices.className="forest-herb-choices";
    [{id:"round",art:"leaves",name:"Lá to, tròn"},{id:"herb",art:"forestHerb",name:"Lá nhỏ, xẻ mảnh"},{id:"reed",art:"riverReedClump",name:"Lá dài như lau"}].forEach(choice=>{
      const button=document.createElement("button"),image=document.createElement("img"),label=document.createElement("strong");
      button.className="btn btn-outline-light";button.dataset.herb=choice.id;image.src=window.gameArt.images[choice.art].toDataURL();image.alt="";label.textContent=choice.name;button.append(image,label);
      button.addEventListener("click",()=>{
        if(choice.id!=="herb"){g.notify("Lá chưa giống hình trong sổ. Cháu quan sát lại nhé.");return;}
        this.data.camp.herb=true;g.give("forestHerb");g.closeJournal();g.player.startAction("pickup");g.notify("Đã tìm đúng cây theo hình trong sổ.");this.changed();
      });choices.append(button);
    });body.append(intro,choices);g.openJournal("Nhận dạng cây trong sổ tay",body);
  }
  scan(point) {
    this.light={x:Math.max(0,Math.min(1200,point.x)),y:Math.max(0,Math.min(700,point.y))};
    if(!this.data.camp.revealed&&Math.hypot(point.x-989,point.y-380)<105){this.data.camp.revealed=true;this.changed();}
  }
  pointerMove(point){if(this.game.level===10)this.scan(point);}
  pointerDown(point) {
    const g=this.game;
    if(g.level===10){this.scan(point);return false;}
    if(g.level===9){const i=GAME_LEVELS[9].stones.findIndex(p=>Math.hypot(p.x-point.x,p.y-point.y)<45);if(i>=0)this.chock(i);return true;}
    if(g.level===11){
      const spec=GAME_LEVELS[11],a=this.data.air;
      const cover=spec.shelters.findIndex(p=>Math.hypot(p.x-point.x,p.y-point.y)<50);
      if(cover>=0){this.orderGroup(a.selected,cover);return true;}
      const group=spec.groups.findIndex((p,i)=>{const q=this.groupPoint(i);return Math.hypot(q.x-point.x,q.y-point.y)<65;});
      if(group>=0){a.selected=group;this.game.updateHUD();}return true;
    }
    return true;
  }
  changed(){this.game.updateHUD();this.game.saveProgress();}
  primary() {
    const g=this.game,d=this.data;if(g.state!=="gameplay")return;
    if(g.level===8){
      if(d.pack.phase!=="loading")return;
      if(!d.pack.loads.every((v,i)=>v===CHAPTER_THREE.carriers[i].capacity)){g.notify("Chưa chia đủ 9 bao theo sức chở. Cháu kiểm tra lại nhé.");return;}
      d.pack.phase="departing";this.changed();
    }
    if(g.level===9)this.push();
    if(g.level===10){if(d.camp.phase==="lighting")this.spark();else{const o=g.nearObject();if(o)g.interact(o);else g.notify("Tới gần cây, dụng cụ, nồi hoặc bác Hai để tương tác nhé.");}}
    if(g.level===11){
      const a=d.air;
      if(a.phase==="alarm"&&!a.whistled){a.whistled=true;g.player.startAction("talk",.65);this.whistleSound();g.notify("Đã báo động! Chọn từng nhóm rồi ra hiệu vào gốc cây.");this.changed();}
      else if(a.phase==="resume"){
        if(a.wave===2){a.phase="clear";g.say([{speaker:"Kiên",text:"Máy bay đã đi xa rồi! Mọi người ra khỏi chỗ núp, chúng ta tiếp tục vào chiến khu nhé."},{speaker:"Nguyễn Lương Bằng",text:"Cháu quan sát và báo động kịp thời lắm. Cả đoàn và số muối đã vượt rừng an toàn."}],()=>g.completeLevel());}
        else{a.wave++;a.phase="approach";a.wait=4;a.remaining=5;a.watch=7;a.whistled=false;a.shelterTime=0;a.groups=[0,1,2].map(()=>({cover:-1,progress:0}));a.selected=0;g.notify("Cả đoàn đi tiếp. Máy bay có thể quay lại, cháu tiếp tục quan sát nhé.");}
        this.changed();
      }
    }
  }
  secondary() {
    if(this.game.state!=="gameplay")return;
    if(this.game.level===9){const i=this.nearStone();if(i>=0)this.chock(i);else this.game.notify("Chọn một hòn đá chưa dùng, ở gần xe nhé.");}
    if(this.game.level===11){const a=this.data.air,cover=GAME_LEVELS[11].shelters.findIndex((_,i)=>!a.groups.some(g=>g.cover===i));if(cover>=0)this.orderGroup(a.selected,cover);}
  }
  push() {
    const h=this.data.hill;if(this.game.state!=="gameplay"||h.phase!=="push"||h.slipping)return false;
    const interval=this.data.time-h.lastPush;if(interval<.32)return;
    // A broad window rewards a comfortable pace; a late press still moves the cart.
    const good=h.lastPush<0||interval>=.35&&interval<=1.6;
    h.lastPush=this.data.time;h.braced=false;h.velocity=Math.min(.12,h.velocity+(good?.08:.06));this.pulse=.45;
    this.pushFeedback=good?"Đẩy tốt! Chờ vạch vào vùng xanh rồi nhấn tiếp.":"Xe đã tiến · Nhấn chậm, đều tay nhé.";
    this.changed();return true;
  }
  pushTiming() {
    const h=this.data.hill,elapsed=h.lastPush<0?0:Math.max(0,this.data.time-h.lastPush);
    return {elapsed,position:Math.min(1,elapsed/1.8),ready:h.lastPush<0||elapsed>=.35&&elapsed<=1.6};
  }
  updateRhythm() {
    const box=document.getElementById("forestRhythm"),cursor=document.getElementById("forestRhythmCursor"),text=document.getElementById("forestRhythmText");
    const h=this.data.hill,timing=this.pushTiming();
    cursor.style.setProperty("--rhythm-position",`${Math.min(99,Math.max(1,timing.position*100))}%`);
    box.dataset.ready=String(timing.ready);box.dataset.slipping=String(h.slipping);
    const message=h.slipping?"Xe trượt! Nhấn C / Chèn đá.":this.pulse>0&&this.pushFeedback?this.pushFeedback:h.lastPush<0?"Nhấn E / Space hoặc nút Đẩy để bắt đầu.":timing.elapsed<.35?"Chờ một chút · Không cần nhấn nhanh.":timing.ready?"Vào vùng xanh rồi · Nhấn Đẩy!":"Nhấn Đẩy để bắt đầu lại nhịp.";
    if(text.textContent!==message)text.textContent=message;
  }
  nearStone(){const point=this.cartPoint();return GAME_LEVELS[9].stones.map((p,i)=>({i,d:Math.hypot(p.x-point.x,p.y-point.y)})).filter(p=>!this.data.hill.stones[p.i]&&p.d<280).sort((a,b)=>a.d-b.d)[0]?.i??-1;}
  chock(i) {
    const h=this.data.hill,g=this.game,p=GAME_LEVELS[9].stones[i],cart=this.cartPoint();
    if(!p||h.stones[i]||!h.slipping){g.notify("Đợi lúc xe trượt rồi chèn đá sáng cạnh đường nhé.");return;}
    if(Math.hypot(p.x-cart.x,p.y-cart.y)>280){g.notify("Hòn đá này ở xa xe. Chọn hòn đá sáng gần hơn nhé.");return;}
    h.stones[i]=true;h.slipping=false;h.braced=true;h.lastChock=h.progress;h.slipIn=5.5;h.slipLeft=3;h.velocity=0;g.notify("Đã chèn chắc bánh xe! Cháu lấy lại nhịp đẩy nhé.");this.changed();
  }
  static along(route,distance) {
    const lengths=route.slice(1).map((p,i)=>Math.hypot(p.x-route[i].x,p.y-route[i].y)),total=lengths.reduce((a,b)=>a+b,0);
    let left=Math.max(0,Math.min(1,distance))*total;
    for(let i=0;i<lengths.length;i++){if(left<=lengths[i]){const t=left/(lengths[i]||1),a=route[i],b=route[i+1];return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,heading:Math.atan2(b.y-a.y,b.x-a.x)};}left-=lengths[i];}
    return {...route.at(-1),heading:0};
  }
  cartPoint(){return ForestChapter.along(GAME_LEVELS[9].route,this.data.hill.progress);}
  spark(){const c=this.data.camp;if(c.phase!=="lighting"||this.data.time-c.lastSpark<.25)return;c.lastSpark=this.data.time;c.sparks++;this.pulse=.3;if(c.sparks===3){c.phase="brewing";this.game.remove("forestHerb");this.game.remove("forestWood");this.game.notify("Bếp đã cháy. Nước lá đang nấu, cháu đợi một chút nhé.");}this.changed();}
  groupPoint(i) {
    const a=this.data.air,group=a.groups[i],origin=GAME_LEVELS[11].groups[i];
    if(group.cover<0)return {x:origin.x,y:origin.y};
    const target=GAME_LEVELS[11].shelters[group.cover];return ForestChapter.along([origin,{x:470,y:430},target],group.progress);
  }
  groupDuration(i) {
    const group=this.data.air.groups[i];if(group.cover<0)return 1;
    const origin=GAME_LEVELS[11].groups[i],target=GAME_LEVELS[11].shelters[group.cover];
    return Math.max(1.1,(Math.hypot(origin.x-470,origin.y-430)+Math.hypot(target.x-470,target.y-430))/240);
  }
  orderGroup(i,cover) {
    const a=this.data.air,g=this.game;
    if(a.phase!=="alarm"||!a.whistled){g.notify("Thổi còi E báo động trước khi ra hiệu cho đoàn nhé.");return;}
    if(a.groups[i].cover>=0)return;
    if(a.groups.some(group=>group.cover===cover)){g.notify("Gốc cây đã có nhóm vào núp. Chọn chỗ còn trống nhé.");return;}
    a.groups[i].cover=cover;const next=a.groups.findIndex(group=>group.cover<0);if(next>=0)a.selected=next;this.changed();
  }
  whistleSound() {
    try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;const audio=new Audio(),osc=audio.createOscillator(),gain=audio.createGain();osc.type="sine";osc.frequency.setValueAtTime(1300,audio.currentTime);osc.frequency.linearRampToValueAtTime(1700,audio.currentTime+.18);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.35);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.36);osc.onended=()=>audio.close().catch(()=>{});}catch{/* Visual alarm remains available when audio is blocked. */}
  }
  update(dt) {
    const g=this.game,d=this.data;d.time+=dt;this.pulse=Math.max(0,this.pulse-dt);
    if(this.transfer){this.transfer.elapsed+=dt;if(this.transfer.elapsed>=.45)this.transfer=null;}
    if(g.level===8&&d.pack.phase==="departing"){
      d.pack.departure=ForestChapter.advance(d.pack.departure,dt,3);
      if(d.pack.departure===3){d.pack.phase="done";g.say([{speaker:"Kiên",text:"Muối đã chia vừa sức, không còn bao nào ở bến. Cháu đã kiểm tra dây buộc, cả đoàn sẵn sàng lên đường!"}],()=>g.completeLevel());}
    }
    if(g.level===9){
      if(g.input.consume("e")||g.input.consume(" "))this.primary();if(g.input.consume("c"))this.secondary();
      const h=d.hill;
      let left=dt;
      while(left>1e-9&&g.state==="gameplay"&&h.phase==="push"){
        const step=Math.min(left,h.slipping?h.slipLeft:h.slipIn);
        if(h.slipping){h.progress=Math.max(0,h.progress-.045*step);h.slipLeft=Math.max(0,h.slipLeft-step);}
        else{h.progress=Math.min(1,h.progress+h.velocity*1.4*(1-Math.exp(-step/1.4)));h.velocity*=Math.exp(-step/1.4);h.slipIn=Math.max(0,h.slipIn-step);}
        left-=step;
        if(h.progress>=1){h.phase="crested";g.say([{speaker:"Bác Hai",text:"Lên tới đỉnh rồi! Nhờ cháu đẩy đều và chèn bánh kịp lúc, muối vẫn nguyên vẹn."},{speaker:"Kiên",text:"Bác nghỉ tay nhé. Cháu sẽ kiểm tra lại dây buộc trước khi đoàn đi tiếp."}],()=>g.completeLevel());}
        else if(h.slipping&&h.slipLeft<=1e-9){g.fail("Xe bị trượt quá lâu. Đẩy đều tay; khi có cảnh báo, chạm đá sáng gần xe hoặc nhấn C trong ba giây để chèn bánh nhé.");}
        else if(!h.slipping&&h.slipIn<=1e-9){h.slipping=true;h.slipIn=0;h.slipLeft=3;h.velocity=0;g.notify("XE TRƯỢT! Chạm hòn đá sáng gần xe hoặc C ngay nhé.");}
      }
      this.updateRhythm();
    }
    if(g.level===10){
      const c=d.camp;
      if(["search","ready"].includes(c.phase)){
        g.updateWalk(dt);if(g.state!=="gameplay")return;
        if(g.player.moving)this.scan({x:g.player.x+Math.cos(g.player.heading)*65,y:g.player.y+Math.sin(g.player.heading)*65});
      }else if(c.phase==="lighting"){if(g.input.consume("e")||g.input.consume(" "))this.spark();}
      else if(c.phase==="brewing"){
        c.brew=ForestChapter.advance(c.brew,dt,6);
        if(c.brew===6){c.phase="ready";g.give("forestMedicine");g.notify("Nước lá đã nấu xong. Mang tới bác Hai đang nghỉ bên lán nhé.");this.changed();}
      }else if(c.phase==="serving"){
        c.served=ForestChapter.advance(c.served,dt,2);
        if(c.served===2){c.phase="healed";g.say([{speaker:"Bác Hai",text:"Cảm ơn cháu Kiên. Bác đã thấy đỡ mệt, nghỉ thêm một lát rồi sẽ đi cùng đoàn."},{speaker:"Nguyễn Lương Bằng",text:"Cháu chăm sóc bác Hai chu đáo lắm. Sáng mai chúng ta cùng lên đường."}],()=>g.completeLevel());}
      }
    }
    if(g.level===11){
      if(g.input.consume("e")||g.input.consume(" "))this.primary();if(g.input.consume("c"))this.secondary();
      const a=d.air;
      if(g.input.consume("q")){a.selected=(a.selected+1)%3;g.updateHUD();}
      // Spend only the time before each phase boundary. A late order must not
      // receive a whole long frame of movement after the five-second deadline.
      let left=dt;
      while(left>1e-9&&g.state==="gameplay"){
        if(a.phase==="approach"){
          const step=Math.min(left,a.wait);a.wait=Math.max(0,a.wait-step);left-=step;
          if(a.wait<=1e-9){a.wait=0;a.phase="alarm";a.remaining=5;g.ui.showDanger("MÁY BAY! 5 GIÂY ĐỂ VÀO NÚP");this.changed();}
        }else if(a.phase==="alarm"){
          const step=Math.min(left,a.remaining);left-=step;
          if(a.whistled)a.shelterTime=ForestChapter.advance(a.shelterTime,step,1.6);
          a.groups.forEach((group,i)=>{if(group.cover>=0)group.progress=ForestChapter.advance(group.progress,step/this.groupDuration(i),1);});a.remaining=Math.max(0,a.remaining-step);
          if(a.remaining<=1e-9){
            a.remaining=0;
            if(a.whistled&&a.groups.every(group=>group.progress===1)){a.phase="flyover";a.watch=7;this.changed();}
            else g.fail("Đoàn chưa vào núp kịp. E thổi còi, chọn từng nhóm rồi C để ra hiệu. Cần cả ba nhóm tới chỗ núp trong năm giây nhé.");
          }
        }else if(a.phase==="flyover"){
          const step=Math.min(left,a.watch);a.watch=Math.max(0,a.watch-step);left-=step;
          if(a.watch<=1e-9){a.watch=0;a.phase="resume";g.notify("Máy bay đã đi xa. Cháu ra hiệu cho cả đoàn đi tiếp nhé.");this.changed();}
        }else break;
      }
    }
  }
  updateHUD() {
    const g=this.game,d=this.data,p=d.pack,h=d.hill,c=d.camp,a=d.air;
    document.getElementById("forestStatus").classList.remove("d-none");
    const playing=g.state==="gameplay";
    document.getElementById("forestAllocation").classList.toggle("d-none",!playing||g.level!==8||p.phase!=="loading");
    document.getElementById("forestActions").classList.toggle("d-none",!playing||g.level===8||g.level===10&&["search","ready"].includes(c.phase));
    document.getElementById("freeControls").classList.toggle("d-none",!playing||g.level!==10||!["search","ready"].includes(c.phase));
    const primary=document.getElementById("forestPrimaryBtn"),secondary=document.getElementById("forestSecondaryBtn");
    document.getElementById("forestRhythm").classList.toggle("d-none",g.level!==9);
    if(g.level===9)this.updateRhythm();
    primary.disabled=false;secondary.classList.toggle("d-none",![9,11].includes(g.level));secondary.disabled=false;
    let label,value,text;
    if(g.level===8){value=p.loads.reduce((a,b)=>a+b,0)/9*100;label="Muối đã chia";text=p.phase==="loading"?"Đúng sức chở · Không để sót bao":"Cả đoàn đang lên đường";p.loads.forEach((v,i)=>{document.getElementById(`forestLoad${i}`).textContent=`${v}/${CHAPTER_THREE.carriers[i].capacity}`;});document.getElementById("forestRemaining").textContent=`Còn ${9-p.loads.reduce((a,b)=>a+b,0)} bao ở bến`;}
    if(g.level===9){value=h.progress*100;label="Đường đèo đã vượt";text=h.slipping?`Xe trượt! Còn ${h.slipLeft.toFixed(1)} giây để chèn`:h.braced?"Bánh đã chèn chắc · Lấy lại nhịp đẩy":"Nhấn khi vạch nằm trong vùng xanh";primary.textContent="Đẩy xe · E / Space";primary.disabled=h.slipping;secondary.textContent="Chèn đá · C";secondary.disabled=!h.slipping;}
    if(g.level===10){value=c.phase==="search"?[c.herb,c.wood,c.flint].filter(Boolean).length/3*50:c.phase==="lighting"?50+c.sparks*5:c.phase==="brewing"?65+c.brew/6*25:100;label="Chăm sóc bác Hai";text=c.phase==="search"?"Soi đèn và đối chiếu cây trong sổ":c.phase==="brewing"?`Đang nấu · ${Math.ceil(6-c.brew)} giây`:c.phase==="ready"?"Mang bát nước lá tới bác Hai":"Nhóm bếp, nấu nước lá và chăm sóc bác Hai";primary.textContent=c.phase==="lighting"?`Đánh lửa ${c.sparks}/3 · E`:c.phase==="brewing"?"Đang nấu nước lá":c.phase==="serving"?"Đang chăm sóc bác Hai":"Tương tác · E";primary.disabled=["brewing","serving","healed"].includes(c.phase);}
    if(g.level===11){value=a.groups.filter(group=>group.progress===1).length/3*100;label="Đoàn đã vào núp";text=a.phase==="alarm"?`Lượt ${a.wave}/2 · Còn ${a.remaining.toFixed(1)} giây`:a.phase==="flyover"?`Chờ máy bay qua · ${Math.ceil(a.watch)} giây`:a.phase==="resume"?"Đã an toàn · Ra hiệu đi tiếp":"Quan sát bóng máy bay trên đường";primary.textContent=a.phase==="resume"?"Ra hiệu đi tiếp · E":a.whistled?"Đã thổi còi":"Thổi còi · E";primary.disabled=!["alarm","resume"].includes(a.phase)||a.phase==="alarm"&&a.whistled;secondary.textContent=`Nấp: ${GAME_LEVELS[11].groups[a.selected].name} · C`;secondary.disabled=a.phase!=="alarm"||!a.whistled||a.groups.every(group=>group.cover>=0);}
    document.getElementById("forestMeterLabel").textContent=`${label}: ${Math.ceil(value)}%`;document.getElementById("forestMeter").value=value;document.getElementById("forestStatusText").textContent=text;
    document.getElementById("fieldHelp").textContent=g.level===8?"Chia từng bao theo sức chở rồi chọn Lên đường.":g.level===9?"E / Space · Đẩy theo nhịp. C / chạm đá · Chèn lúc xe trượt.":g.level===10?"Soi đèn, đi lại bằng cần 360°, chạm đồ vật để tương tác. H xem hình cây.":"E · Còi / Đi tiếp. Q / chạm nhóm · Chọn. C / chạm gốc cây · Nấp.";
  }
}
