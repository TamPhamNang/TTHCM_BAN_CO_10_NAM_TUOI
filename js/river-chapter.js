// Self-contained state and interactions for Chapter 2; Chapter 1 rules stay intact.
class RiverChapter {
  constructor(game, saved = null) {
    this.game = game;
    this.data = saved ? JSON.parse(JSON.stringify(saved)) : {
      time:0, alert:0, crouched:false, distraction:0, boneUsed:false, knots:[1,2,3], chainOpen:false,
      storm:{remaining:40, integrity:100, covered:[false,false,false,false], tied:[false,false,false,false], gust:6, gustIndex:0},
      reeds:{phase:"route", path:[], distance:0, boat:{...CHAPTER_TWO.levels[7].channel[0]}, remaining:45, watch:8, camouflaged:false}
    };
    this.selectedTarp = false; this.dragPoint = null; this.drawing = null; this.actorTween = null;
  }
  snapshot() { return JSON.parse(JSON.stringify(this.data)); }
  static valid(d) {
    const finite = (n,min,max) => Number.isFinite(n) && n>=min && n<=max;
    const point = p => p && finite(p.x,0,1200) && finite(p.y,0,700);
    const bool4 = a => Array.isArray(a) && a.length===4 && a.every(v=>typeof v==="boolean");
    if (!d || !finite(d.time,0,1e8) || !finite(d.alert,0,100) || !finite(d.distraction,0,45) || typeof d.crouched!=="boolean" || typeof d.boneUsed!=="boolean" || typeof d.chainOpen!=="boolean") return false;
    if (!Array.isArray(d.knots) || d.knots.length!==3 || !d.knots.every(n=>Number.isInteger(n)&&n>=0&&n<4)) return false;
    const s=d.storm,r=d.reeds;
    return s && bool4(s.covered) && bool4(s.tied) && s.tied.every((v,i)=>!v||s.covered[i]) && finite(s.remaining,0,40) && finite(s.integrity,0,100) && finite(s.gust,0,6) && Number.isInteger(s.gustIndex) && s.gustIndex>=0
      && r && ["route","sailing","materials","watch","safe"].includes(r.phase) && Array.isArray(r.path) && r.path.length<=1200 && r.path.every(point) && point(r.boat) && finite(r.distance,0,20000) && finite(r.remaining,0,45) && finite(r.watch,0,8) && typeof r.camouflaged==="boolean"
      && (r.phase!=="sailing" || r.path.length>=2);
  }
  hudKey() {
    const d=this.data,s=d.storm,r=d.reeds;
    return [Math.floor(d.alert),d.crouched,Math.ceil(d.distraction),d.knots,d.chainOpen,s.covered,s.tied,Math.ceil(s.integrity),r.phase,r.camouflaged,this.selectedTarp,Math.ceil(r.watch)].join("|");
  }
  objective() {
    const g=this.game,d=this.data,s=d.storm,r=d.reeds;
    if(g.level===5) return d.chainOpen ? "Dây chắn đã mở. Đưa thuyền qua trạm." : d.distraction>0 ? `Chó và lính đang ở bụi rậm (${Math.ceil(d.distraction)}s). Đến tời, gỡ ba khóa dây.` : g.has("bone") ? "Tới bụi rậm phía tây, ném xương để dụ chó đi xa." : "Nhặt khúc xương cạnh đường. C để đi thấp và giữ im lặng.";
    if(g.level===6) return `Che bạt ${s.covered.filter(Boolean).length}/4 · Buộc chặt ${s.tied.filter(Boolean).length}/4. Giữ muối khô đến hết cơn bão.`;
    return r.phase==="route" ? "Vẽ đường từ thuyền qua các chấm trên luồng nước tới bãi trú." : r.phase==="sailing" ? "Đang dùng sào tre đưa thuyền men theo luồng nước…" : r.phase==="materials" ? "Lấy bùn và lá ven bờ, rồi tương tác với thuyền để ngụy trang." : "Thuyền đã phủ kín. Chờ ca-nô tuần tra đi qua.";
  }
  objects() {
    const g=this.game,d=this.data;
    if(g.level===5) return [
      ...(!g.has("bone") && !d.boneUsed ? [{id:"bone",x:270,y:438,label:"Khúc xương cạnh đường"}] : []),
      {id:"lure",x:210,y:350,label:"Bụi rậm · Ném xương"},
      {id:"winch",x:540,y:330,label:"Tời xích · Gỡ dây chắn"}
    ];
    if(g.level===7 && d.reeds.phase==="materials") return [
      ...(!g.has("mud") ? [{id:"mud",x:355,y:440,label:"Bùn ven bờ"}] : []),
      ...(!g.has("leaves") ? [{id:"leaves",x:275,y:270,label:"Lá ngụy trang"}] : []),
      {id:"camouflage",x:385,y:285,label:"Thuyền · Phủ bùn và lá"}
    ];
    return [];
  }
  interact(object) {
    const g=this.game,d=this.data;
    if(["bone","mud","leaves"].includes(object.id)) { g.give(object.id);g.player.startAction("pickup");g.notify(`Đã nhặt ${CHAPTER_ONE.items[object.id].name.toLowerCase()}.`); }
    if(object.id==="lure") {
      if(d.distraction>0) { g.notify("Chó và lính đang kiểm tra bụi cây. Tới tời xích nhé."); return; }
      if(!g.has("bone")) { g.notify("Tìm khúc xương cạnh đường trước nhé."); return; }
      g.remove("bone");d.boneUsed=true;d.distraction=45;d.alert=0;g.player.startAction("talk",.7);
      g.notify("Khúc xương đã thu hút chú chó. Tranh thủ tới tời xích!");
    }
    if(object.id==="winch") {
      if(d.distraction<=0) {g.notify("Chó đang canh tời. Hãy dụ chó và lính đi xa trước.");return;}
      this.openKnots();
    }
    if(object.id==="camouflage") {
      if(!g.has("mud") || !g.has("leaves")) {g.notify("Cần lấy đủ bùn và lá để che kín mạn thuyền.");return;}
      g.remove("mud");g.remove("leaves");d.reeds.camouflaged=true;d.reeds.phase="watch";g.player.moving=false;
      g.say([{speaker:"Kiên",text:"Bùn đã che màu gỗ, lá cũng phủ kín mạn thuyền. Mọi người nằm thấp, chờ ca-nô đi qua nhé!"}]);
    }
    g.updateHUD();g.saveProgress();
  }
  openKnots() {
    const g=this.game,body=document.createElement("div"),intro=document.createElement("p"),row=document.createElement("div");
    body.className="rope-puzzle";intro.textContent="Xoay từng khóa dây để cả ba mũi tên cùng chỉ lên. Mỗi lần chọn xoay một phần tư vòng.";row.className="rope-locks";
    for(let i=0;i<3;i++) {
      const button=document.createElement("button"),arrow=document.createElement("span"),name=document.createElement("strong");
      button.className="rope-lock";button.setAttribute("aria-label",`Xoay khóa dây ${i+1}`);button.dataset.lock=i;
      arrow.textContent="↑";name.textContent=`Khóa ${i+1}`;button.append(arrow,name);
      const paint=()=>{arrow.style.transform=`rotate(${this.data.knots[i]*90}deg)`;button.classList.toggle("aligned",this.data.knots[i]===0);button.setAttribute("aria-pressed",String(this.data.knots[i]===0));};
      button.addEventListener("click",()=>{
        this.data.knots[i]=(this.data.knots[i]+1)%4;paint();g.saveProgress();
        if(this.data.knots.every(n=>n===0)) {
          this.data.chainOpen=true;g.closeJournal();g.say([{speaker:"Kiên",text:"Các khóa dây đã thẳng! Cháu mở tời, hạ dây xích để thuyền qua."},
            {speaker:"Nguyễn Lương Bằng",text:"Khéo lắm, Kiên! Cả đoàn đã qua trạm an toàn."}],()=>g.completeLevel());g.saveProgress();
        }
      });paint();row.append(button);
    }
    body.append(intro,row);g.openJournal("Gỡ rối dây tời",body);
  }
  toggleCrouch() { if(this.game.level===5) {this.data.crouched=!this.data.crouched;this.game.updateHUD();this.game.saveProgress();} }
  cargoAt(p) {return GAME_LEVELS[6].cargo.findIndex(a=>Math.abs(p.x-a.x)<=a.width*.65 && Math.abs(p.y-a.y)<=a.height*.7);}
  tarpAt(p) {return p.x>=120&&p.x<=290&&p.y>=546&&p.y<=625;}
  pointerDown(p,event) {
    const g=this.game,r=this.data.reeds;
    if(g.level===6) {
      if(this.tarpAt(p)) {this.selectedTarp=true;this.dragPoint=p;g.canvas.setPointerCapture(event.pointerId);g.updateHUD();return true;}
      const i=this.cargoAt(p);if(i>=0) this.handleCargo(i);return true;
    }
    if(g.level===7 && r.phase==="route") {
      if(Math.hypot(p.x-r.boat.x,p.y-r.boat.y)>55) {g.notify("Bắt đầu vẽ từ chiếc thuyền ở cuối luồng nước nhé.");return true;}
      this.drawing=[{...r.boat}];this.badRoute=false;g.canvas.setPointerCapture(event.pointerId);return true;
    }
    if(g.level===7 && r.phase!=="materials") return true;
    return false;
  }
  pointerMove(p) {
    if(this.dragPoint) this.dragPoint=p;
    if(this.drawing) {
      const last=this.drawing.at(-1);
      if(Math.hypot(p.x-last.x,p.y-last.y)<6)return;
      if(this.drawing.length>=1200 || !this.waterSegment(last,p)) {this.badRoute=true;return;}
      this.drawing.push(p);this.badRoute=false;
    }
  }
  pointerUp(p) {
    if(this.dragPoint) {this.dragPoint=null;const i=this.cargoAt(p);if(i>=0)this.handleCargo(i);}
    if(this.drawing) {
      this.pointerMove(p);const path=this.drawing;this.drawing=null;
      const channel=GAME_LEVELS[7].channel;let next=1;
      for(const point of path) if(next<channel.length && Math.hypot(point.x-channel[next].x,point.y-channel[next].y)<58)next++;
      if(this.badRoute || next!==channel.length) {this.game.notify("Đường cần theo đủ các chấm và tránh rặng lau. Vẽ lại từ thuyền nhé.");return;}
      this.data.reeds.path=path;this.data.reeds.phase="sailing";this.data.reeds.distance=0;this.game.saveProgress();this.game.updateHUD();
    }
  }
  cancelPointer() {this.dragPoint=null;this.drawing=null;}
  waterSegment(a,b) {
    const length=Math.hypot(b.x-a.x,b.y-a.y),steps=Math.max(1,Math.ceil(length/5)),channel=GAME_LEVELS[7].channel;
    for(let i=0;i<=steps;i++) {
      const p={x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps};
      if(!channel.some((q,j)=>j>0 && RiverChapter.segmentDistance(p,channel[j-1],q)<=48))return false;
    }return true;
  }
  static segmentDistance(p,a,b) {
    const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);
  }
  handleCargo(i) {
    const s=this.data.storm,g=this.game;
    if(!s.covered[i]) {
      if(!this.selectedTarp){g.notify("Chọn tấm bạt bên trái rồi chạm khoang để che nhé.");return;}
      s.covered[i]=true;this.selectedTarp=false;g.notify(`Đã phủ khoang ${i+1}. Chạm lần nữa để buộc dây.`);
    } else {s.tied[i]=true;g.notify(`Dây khoang ${i+1} đã buộc chặt.`);}
    const cargo=GAME_LEVELS[6].cargo[i];
    this.actorTween={from:{x:g.player.x,y:g.player.y},to:{x:cargo.x-40,y:cargo.y+32},elapsed:0,duration:.65};
    g.updateHUD();g.saveProgress();
  }
  update(dt) {
    const g=this.game,d=this.data,s=d.storm,r=d.reeds;d.time+=dt;
    if(g.level===5) {
      if(g.input.consume("c"))this.toggleCrouch();
      const speed=g.player.speed,run=g.player.runSpeed;
      if(d.crouched){g.player.speed=68;g.player.runSpeed=68;}
      g.updateWalk(dt);g.player.speed=speed;g.player.runSpeed=run;
      if(g.state!=="gameplay")return;
      if(d.distraction>0) {
        d.distraction=Math.max(0,d.distraction-dt);
        if(d.distraction===0&&!d.chainOpen){d.boneUsed=false;g.notify("Chó đã quay lại. Có thể tìm thêm xương để dụ chó lần nữa.");}
      }
      const danger=d.distraction<=0 && Math.hypot(g.player.x-370,g.player.y-280)<175;
      d.alert=Math.max(0,Math.min(100,d.alert+dt*(danger?(d.crouched?9:g.input.isDown("shift")?60:35):-25)));
      if(d.alert>=100)g.fail("Chó đã phát hiện tiếng động. Đi thấp bằng C, dụ chó ra bụi rậm rồi mới tới tời. Cháu có thể thử lại từ bến.");
    }
    if(g.level===6) {
      if(this.actorTween) {
        const t=this.actorTween;t.elapsed=Math.min(t.duration,t.elapsed+dt);const p=t.elapsed/t.duration;
        const before={x:g.player.x,y:g.player.y};g.player.x=t.from.x+(t.to.x-t.from.x)*p;g.player.y=t.from.y+(t.to.y-t.from.y)*p;
        g.player.face(t.to.x-t.from.x,t.to.y-t.from.y);g.player.animationTime+=Math.hypot(g.player.x-before.x,g.player.y-before.y)/g.player.speed;
        g.player.moving=p<1;g.player.state=p<1?"run":"idle";if(p>=1)this.actorTween=null;
      }
      s.remaining=Math.max(0,s.remaining-dt);s.gust-=dt;
      if(s.gust<=0) {
        s.gust=6;const tied=s.tied.map((v,i)=>v?i:-1).filter(i=>i>=0);
        if(tied.length){const i=tied[s.gustIndex%tied.length];s.tied[i]=false;s.gustIndex++;g.notify(`Gió làm lỏng dây khoang ${i+1}! Chạm khoang vàng để buộc lại.`);}
      }
      const wet=s.covered.filter(v=>!v).length*1.5+s.tied.filter((v,i)=>s.covered[i]&&!v).length;
      s.integrity=Math.max(0,s.integrity-dt*wet);
      if(s.integrity<=0)g.fail("Nước đã ngấm vào hàng. Che bạt từng khoang rồi buộc ngay; khoang vàng cần buộc lại sau cơn gió.");
      else if(s.remaining===0) {
        if(s.tied.every(Boolean))g.say([{speaker:"Kiên",text:"Mưa đã nhẹ hạt! Bốn khoang đều che kín, số muối vẫn an toàn."},{speaker:"Nguyễn Lương Bằng",text:"Cả đoàn đã vượt qua cơn bão. Phía trước là bãi lau, cháu quan sát giúp bác nhé."}],()=>g.completeLevel());
        else g.fail("Bão vừa qua nhưng vẫn còn khoang chưa buộc kín. Thử lại và ưu tiên khoang màu vàng nhé.");
      }
    }
    if(g.level===7) {
      if(r.phase==="sailing") {
        r.distance+=dt*100;let remaining=r.distance;let arrived=true;
        for(let i=1;i<r.path.length;i++) {
          const a=r.path[i-1],b=r.path[i],length=Math.hypot(b.x-a.x,b.y-a.y);
          if(remaining<=length){const t=remaining/(length||1);r.boat={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};arrived=false;break;}remaining-=length;
        }
        if(arrived){r.boat={...r.path.at(-1)};r.phase="materials";Object.assign(g.player,GAME_LEVELS[7].spawn);g.say([{speaker:"Kiên",text:"Thuyền đã vào bãi lau. Cháu lên bờ lấy bùn và lá phủ mạn thuyền, mọi người chờ cháu nhé."}]);g.saveProgress();}
      } else if(r.phase==="materials") {
        g.updateWalk(dt);if(g.state!=="gameplay")return;
        r.remaining=Math.max(0,r.remaining-dt);
        if(!r.remaining)g.fail("Ca-nô tới trước khi thuyền được che kín. Vẽ đường vào bãi, lấy đủ bùn và lá rồi phủ lên thuyền nhé.");
      } else if(r.phase==="watch") {
        r.watch=Math.max(0,r.watch-dt);
        if(!r.watch){r.phase="safe";g.say([{speaker:"Kiên",text:"Ca-nô đã đi qua rồi! Họ không thấy chiếc thuyền trong bãi lau."},{speaker:"Nguyễn Lương Bằng",text:"Cháu nhanh trí lắm. Đoàn thuyền và những bao muối đã an toàn, chúng ta chuẩn bị lên đường tới Tuyên Quang."}],()=>g.completeLevel());}
      }
    }
  }
  updateHUD() {
    const g=this.game,d=this.data,s=d.storm,r=d.reeds;
    const status=document.getElementById("riverStatus"),action=document.getElementById("riverActionBtn");
    status.classList.toggle("d-none",g.level<5);document.getElementById("riverActions").classList.toggle("d-none",g.level<5||g.state!=="gameplay");
    if(g.level<5)return;
    document.getElementById("fieldHelp").textContent=g.level===5?"C · Đi thấp / đứng lên. E · Tương tác. Dụ chó ra xa trước khi tới tời.":g.level===6?"Chọn / kéo bạt vào khoang. Chạm khoang đã che để buộc dây.":r.phase==="materials"?"Nhặt bùn và lá ven bờ, rồi tương tác với thuyền để phủ kín.":"Giữ và kéo từ thuyền, theo các chấm dẫn đường trên luồng nước.";
    let text,value,label;
    if(g.level===5){text=d.distraction>0?`Chó ở bụi rậm · ${Math.ceil(d.distraction)} giây`:d.crouched?"Đang đi thấp · Ít tiếng động":"Cẩn thận tiếng bước chân";value=d.alert;label="Mức phát hiện";action.textContent=d.crouched?"C · Đứng lên":"C · Đi thấp";}
    if(g.level===6){text=this.selectedTarp?"Đã chọn bạt · Chạm khoang chưa che":"Chạm khoang vàng để buộc lại";value=s.integrity;label="Muối còn khô";action.textContent=this.selectedTarp?"Đã chọn bạt":"Lấy tấm bạt";}
    if(g.level===7){text=r.phase==="route"?"Giữ và kéo từ thuyền để vẽ đường":r.phase==="sailing"?"Đang tiến vào bãi lau":r.phase==="materials"?`Ca-nô tới sau ${Math.ceil(r.remaining)} giây`:`Chờ ca-nô qua · ${Math.ceil(r.watch)} giây`;value=r.camouflaged?100:(g.has("mud")?40:0)+(g.has("leaves")?40:0);label="Ngụy trang";action.textContent=r.phase==="route"?"Vẽ lại đường":r.phase==="materials"?"Tương tác · E":"Đang ẩn nấp";}
    document.getElementById("riverStatusText").textContent=text;document.getElementById("riverMeterLabel").textContent=`${label}: ${Math.ceil(value)}%`;
    document.getElementById("riverMeter").value=value;
    action.disabled=g.level===7&&!["route","materials"].includes(r.phase);
    document.getElementById("freeControls").classList.toggle("d-none",g.state!=="gameplay"||!(g.level===5||g.level===7&&r.phase==="materials"));
  }
  action() {
    if(this.game.state!=="gameplay")return;
    if(this.game.level===5)this.toggleCrouch();
    if(this.game.level===6){this.selectedTarp=true;this.game.updateHUD();}
    if(this.game.level===7){if(this.data.reeds.phase==="route"){this.drawing=null;this.game.notify("Vẽ từ thuyền qua các chấm đến bãi trú nhé.");}else{const object=this.game.nearObject();if(object)this.game.interact(object);else this.game.notify("Đến gần bùn, lá hoặc thuyền để tương tác.");}}
  }
}
