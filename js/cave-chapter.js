class CaveChapter {
  constructor(game,saved=null){
    this.game=game;
    this.data=saved?structuredClone(saved):{
      time:0,
      trail:{compass:false,clues:[false,false],knife:false,phase:"search",cleared:0,workLeft:0},
      build:{bamboo:[false,false,false],palm:false,tools:false,step:0,workLeft:0,phase:"collect"},
      relay:{tempo:2,phase:"ready",remaining:CHAPTER_FOUR.relay.duration,delivered:0,held:false,flight:0}
    };
    // Retain normalized in-flight progress and the fraction of daylight in older saves.
    if(this.data.relay.tempo===undefined){this.data.relay.remaining*=CHAPTER_FOUR.relay.duration/90;this.data.relay.tempo=2;}
    this.buildUI();
  }
  snapshot(){return structuredClone(this.data);}
  static valid(d){
    const n=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max,b=v=>typeof v==="boolean",arr=(a,length)=>Array.isArray(a)&&a.length===length&&a.every(b);
    if(!d||!n(d.time,0,1e8))return false;
    const t=d.trail,c=d.build,r=d.relay;
    if(!t||!b(t.compass)||!b(t.knife)||!arr(t.clues,2)||!["search","clearing","open"].includes(t.phase)||!Number.isInteger(t.cleared)||!n(t.cleared,0,3)||!n(t.workLeft,0,.6))return false;
    if(t.phase!=="search"&&(!t.compass||!t.knife||!t.clues.every(Boolean)))return false;
    if(t.phase==="open"&&(t.cleared!==3||t.workLeft!==0)||t.phase!=="open"&&t.cleared===3||t.phase==="search"&&(t.cleared!==0||t.workLeft!==0))return false;
    if(!c||!arr(c.bamboo,3)||!b(c.palm)||!b(c.tools)||!Number.isInteger(c.step)||!n(c.step,0,4)||!n(c.workLeft,0,.8)||!["collect","building","ready"].includes(c.phase))return false;
    if((c.step>0||c.workLeft>0||c.phase!=="collect")&&(!c.bamboo.every(Boolean)||!c.palm||!c.tools))return false;
    if(c.phase==="ready"&&(c.step!==4||c.workLeft!==0)||c.phase!=="ready"&&c.step===4||c.phase==="collect"&&(c.step!==0||c.workLeft!==0))return false;
    const duration=r?.tempo===undefined?90:CHAPTER_FOUR.relay.duration;
    if(r?.tempo!==undefined&&r.tempo!==2)return false;
    if(!r||!["ready","running","done"].includes(r.phase)||!n(r.remaining,0,duration)||!Number.isInteger(r.delivered)||!n(r.delivered,0,100)||r.delivered%5!==0||!b(r.held)||!n(r.flight,0,1))return false;
    if(r.held&&r.flight>0||r.phase==="ready"&&(r.delivered!==0||r.remaining!==duration||r.held||r.flight!==0))return false;
    return r.phase==="done"?r.delivered===100&&!r.held&&r.flight===0:r.delivered<100;
  }
  finished(){return this.game.level===12?this.data.trail.phase==="open":this.game.level===13?this.data.build.phase==="ready":this.data.relay.phase==="done";}
  timer(){return this.game.level===14&&this.data.relay.phase==="running"?this.data.relay.remaining:null;}
  hudKey(){const d=this.data;return [JSON.stringify(d.trail),JSON.stringify(d.build),d.relay.phase,d.relay.delivered,d.relay.held,d.relay.flight>0,Math.ceil(d.relay.remaining)].join("|");}
  objective(){
    const d=this.data;
    if(this.game.level===12)return d.trail.phase==="clearing"?`Phát quang dây leo ${d.trail.cleared}/3 · Không cần căn lực.`:`La bàn ${d.trail.compass?"✓":"○"} · Dấu vết ${d.trail.clues.filter(Boolean).length}/2 · Dao ${d.trail.knife?"✓":"○"}. Khảo sát rồi mở lối vào hang.`;
    if(this.game.level===13)return d.build.phase==="collect"?`Gom tre ${d.build.bamboo.filter(Boolean).length}/3 · Dụng cụ ${d.build.tools?"✓":"○"} · Lá cọ ${d.build.palm?"✓":"○"}.`:`Dựng sạp chống ẩm ${d.build.step}/4 · ${CHAPTER_FOUR.buildSteps[d.build.step]||"Hoàn thành"}.`;
    return `Đưa ${d.relay.delivered}/100 bao muối vào hang trước bình minh. Đón rồi chuyền, không cần căn lực.`;
  }
  objects(){
    const t=this.data.trail,b=this.data.build;
    if(this.game.level===12)return [
      ...(!t.knife?[{id:"caveKnife",x:325,y:487,label:"Dao phát quang",art:{id:"caveKnife",x:325,bottom:486,width:58}}]:[]),
      ...(!t.clues[0]?[{id:"caveAnts",x:530,y:520,label:"Quan sát đàn kiến"}]:[]),
      ...(!t.clues[1]?[{id:"caveBatClue",x:758,y:466,label:"Dấu phân dơi khô",art:{id:"caveTracks",x:758,bottom:466,width:94}}]:[]),
      {id:"caveEntrance",x:875,y:452,label:t.phase==="clearing"?"Phát quang dây leo":"Khảo sát cửa hang"}
    ];
    if(this.game.level===13)return [
      ...[{x:245,y:476},{x:340,y:525},{x:455,y:531}].flatMap((p,i)=>b.bamboo[i]?[]:[{id:`caveBamboo${i}`,...p,label:`Bó tre ${i+1}`,art:{id:"caveBamboo",x:p.x,bottom:p.y,width:75}}]),
      ...(!b.tools?[{id:"caveTools",x:410,y:402,label:"Dụng cụ làm sạp",art:{id:"caveTools",x:410,bottom:402,width:85}}]:[]),
      ...(!b.palm?[{id:"cavePalm",x:930,y:538,label:"Cuộn lá cọ",art:{id:"cavePalm",x:930,bottom:538,width:79}}]:[]),
      {id:"caveBench",x:760,y:495,label:"Dựng sạp chống ẩm"}
    ];
    return [];
  }
  interact(object){
    const g=this.game,t=this.data.trail,b=this.data.build;
    if(object.id==="caveKnife"){t.knife=true;g.give("caveKnife");g.player.startAction("pickup");g.notify("Đã lấy dao. Quan sát đủ hai dấu vết rồi mở lối nhé.");}
    else if(object.id==="caveAnts"){t.clues[0]=true;g.say([{speaker:"Kiên",text:"Đàn kiến mang thức ăn theo lối đất khô lên cửa hang. Cháu sẽ ghi lại dấu này."}]);}
    else if(object.id==="caveBatClue"){t.clues[1]=true;g.say([{speaker:"Kiên",text:"Có dấu phân dơi khô trên lối đá. Gần đây chắc có hang rộng, lại không bị ngập nước!"}]);}
    else if(object.id==="caveEntrance"){
      if(!t.compass||!t.knife||!t.clues.every(Boolean)){g.notify("Cần xem la bàn, quan sát cả đàn kiến và dấu dơi, rồi lấy dao trước nhé.");return;}
      t.phase="clearing";this.cut();
    }else if(object.id.startsWith("caveBamboo")){const i=Number(object.id.at(-1));b.bamboo[i]=true;g.give("caveBamboo");g.player.startAction("pickup");g.notify(`Đã gom ${b.bamboo.filter(Boolean).length}/3 bó tre.`);}
    else if(object.id==="caveTools"||object.id==="cavePalm"){b[object.id==="caveTools"?"tools":"palm"]=true;g.give(object.id);g.player.startAction("pickup");g.notify(`Đã lấy ${object.label.toLowerCase()}.`);}
    else if(object.id==="caveBench"){
      if(!b.bamboo.every(Boolean)||!b.palm||!b.tools){g.notify("Gom đủ ba bó tre, dụng cụ và lá cọ rồi hãy dựng sạp nhé.");return;}
      b.phase="building";g.player.moving=false;g.player.state="idle";g.notify("Chọn từng bước dựng sạp ở bảng bên trái. Cháu cứ làm lần lượt nhé.");
    }
    this.changed();
  }
  compass(){
    const g=this.game;if(g.state!=="gameplay")return;
    const body=document.createElement("div"),image=document.createElement("img"),text=document.createElement("p"),choices=document.createElement("div");
    body.className="cave-compass";image.src=window.gameArt.images.caveCompass.toDataURL();image.alt="La bàn đồng của Kiên: Bắc ở trên, Đông ở bên phải";
    text.textContent="Kim chỉ Bắc ở trên. Lối đất khô và cửa hang nằm phía trên, bên phải: đó là hướng nào?";choices.className="cave-compass-choices";
    for(const direction of ["Tây Bắc","Đông Bắc","Đông Nam","Tây Nam"]){
      const button=document.createElement("button");button.className="btn btn-outline-light";button.dataset.compass=direction;button.textContent=direction;
      button.addEventListener("click",()=>{
        if(direction!=="Đông Bắc"){g.notify("Thử nhìn lại nhé: Bắc ở trên, Đông bên phải.");return;}
        this.data.trail.compass=true;g.closeJournal();g.notify("Đúng rồi, hướng Đông Bắc. Tiếp tục quan sát dấu vết trên lối mòn nhé.");this.changed();
      });choices.append(button);
    }
    body.append(image,text,choices);g.openJournal("La bàn của Kiên · Tìm hướng vào hang",body);
  }
  cut(){const t=this.data.trail;if(t.phase!=="clearing"||t.workLeft>0)return;t.workLeft=.6;this.game.player.moving=false;this.changed();}
  buildUI(){
    const grid=document.getElementById("caveBuildChoices");grid.replaceChildren();
    CHAPTER_FOUR.buildSteps.forEach((label,i)=>{const button=document.createElement("button");button.className="btn btn-outline-light";button.dataset.build=i;button.textContent=label;button.addEventListener("click",()=>this.build(i));grid.append(button);});
  }
  build(step){
    const g=this.game,b=this.data.build;if(g.state!=="gameplay"||g.level!==13||b.phase!=="building"||b.workLeft>0)return;
    if(step!==b.step){g.notify(`Bước tiếp theo là: ${CHAPTER_FOUR.buildSteps[b.step]}. Không mất vật liệu, cháu thử lại nhé.`);return;}
    b.workLeft=.8;g.player.moving=false;this.changed();
  }
  primary(){
    const g=this.game;if(g.state!=="gameplay")return;
    if(g.level===12){if(this.data.trail.phase==="clearing")this.cut();else this.compass();}
    if(g.level===13){const object=this.objects().find(o=>o.id==="caveBench");g.walkTo(object,object);}
    if(g.level===14){
      const r=this.data.relay;
      if(r.phase==="ready"){r.phase="running";g.notify("Cả tổ sẵn sàng! Đón rồi chuyền từng lượt năm bao nhé.");}
      else if(r.phase==="running"&&r.flight===0){if(!r.held)r.held=true;else{r.held=false;r.flight=1e-8;}}
      this.changed();
    }
  }
  changed(){this.game.updateHUD();this.game.saveProgress();}
  update(dt){
    const g=this.game,d=this.data,t=d.trail,b=d.build,r=d.relay;d.time+=dt;
    if(g.level===12){
      if(t.phase==="search"){
        g.updateWalk(dt);if(g.state!=="gameplay")return;
        if(g.input.consume("q"))this.compass();
      }else if(t.phase==="clearing"){
        if(g.input.consume("e")||g.input.consume(" "))this.cut();
        if(t.workLeft>0){t.workLeft=Math.max(0,t.workLeft-dt);if(t.workLeft<1e-9){t.workLeft=0;t.cleared++;
          if(t.cleared===3){t.phase="open";g.say([{speaker:"Kiên",text:"Mở được lối rồi! Hang đá vôi rộng, nền cao và khô ráo. Đoàn có thể cất muối ở đây ạ!"},{speaker:"Nguyễn Lương Bằng",text:"Tốt lắm! Ta kiểm tra bên trong rồi dựng sạp để cách muối khỏi nền đất ẩm."}],()=>g.completeLevel());}
          this.changed();
        }}
      }
    }
    if(g.level===13){
      if(b.phase==="collect")g.updateWalk(dt);
      if(b.workLeft>0){b.workLeft=Math.max(0,b.workLeft-dt);if(b.workLeft<1e-9){b.workLeft=0;b.step++;
        if(b.step===4){b.phase="ready";g.remove("caveBamboo");g.remove("cavePalm");g.say([{speaker:"Kiên",text:"Chân sạp đã kê cao, mặt tre ghép kín, dây buộc chắc và lá cọ lót đủ rồi ạ."},{speaker:"Nguyễn Lương Bằng",text:"Cháu khéo tay lắm. Sạp sẽ giữ muối cách nền ẩm. Chuẩn bị đón những bao cuối cùng vào hang!"}],()=>g.completeLevel());}
        this.changed();
      }}
    }
    if(g.level===14){
      if(g.input.consume("e")||g.input.consume(" "))this.primary();
      let left=dt;
      while(left>1e-9&&r.phase==="running"&&g.state==="gameplay"){
        const step=Math.min(left,r.remaining,r.flight>0?(1-r.flight)*CHAPTER_FOUR.relay.flight:Infinity);
        r.remaining=Math.max(0,r.remaining-step);if(r.flight>0)r.flight=Math.min(1,r.flight+step/CHAPTER_FOUR.relay.flight);left-=step;
        // Arrival wins a tie with sunrise; do not reject a bag that arrived on time.
        const arrived=r.flight>=1-1e-9;
        if(arrived){r.flight=0;r.delivered+=5;}
        if(r.delivered===100){r.phase="done";g.say([{speaker:"Kiên",text:"Bao cuối cùng đã lên sạp! Đủ một trăm bao, không còn hàng ngoài bìa rừng nữa!"},{speaker:"Nguyễn Lương Bằng",text:"Cả đoàn đã làm được! Kho muối nằm an toàn trong chiến khu, vừa kịp lúc bình minh."}],()=>g.completeLevel());}
        else if(r.remaining<=1e-9){r.remaining=0;g.fail("Trời đã sáng mà vẫn còn muối ngoài cửa hang. Cháu thử lại nhé: đón rồi chuyền đều tay, đợi cả lượt lên sạp mới đón lượt tiếp theo.");}
        if(arrived||g.state!=="gameplay")this.changed();
      }
    }
  }
  updateHUD(){
    const g=this.game,t=this.data.trail,b=this.data.build,r=this.data.relay,playing=g.state==="gameplay";
    document.getElementById("caveStatus").classList.remove("d-none");
    document.getElementById("caveActions").classList.toggle("d-none",!playing);
    document.getElementById("caveBuildPanel").classList.toggle("d-none",!playing||g.level!==13||b.phase!=="building");
    document.getElementById("freeControls").classList.toggle("d-none",!playing||!(g.level===12&&t.phase==="search"||g.level===13&&b.phase==="collect"));
    const button=document.getElementById("cavePrimaryBtn");button.disabled=false;
    let value,text,label;
    if(g.level===12){value=t.phase==="search"?(Number(t.compass)+Number(t.knife)+t.clues.filter(Boolean).length)/4*70:70+t.cleared*10;label="Khảo sát hang";text=t.phase==="clearing"?`Phát quang ${t.cleared}/3 · Chờ từng nhát xong`:"Quan sát lối khô · La bàn chỉ Bắc ở trên";button.textContent=t.phase==="clearing"?"Phát quang · E / Space":"Xem la bàn · Q";button.disabled=t.workLeft>0;}
    if(g.level===13){value=b.phase==="collect"?(b.bamboo.filter(Boolean).length+Number(b.palm)+Number(b.tools))/5*40:40+b.step*15;label="Sạp chống ẩm";text=b.phase==="collect"?"Gom vật liệu trên nền khô, rồi tới sạp":"Chọn từng bước · Không cần căn lực";button.textContent="Tới chỗ dựng sạp";button.disabled=b.phase!=="collect";
      for(const [i,choice] of [...document.getElementById("caveBuildChoices").children].entries()){choice.disabled=i<b.step||b.workLeft>0;choice.textContent=`${i<b.step?"✓ ":""}${CHAPTER_FOUR.buildSteps[i]}`;}
    }
    if(g.level===14){value=r.delivered;label="Muối đã vào hang";text=r.phase==="ready"?"Chọn Bắt đầu khi đã sẵn sàng":r.flight>0?"Cả tổ đang chuyền 5 bao tới sạp":r.held?"Đã đón bao · Chuyền tiếp nhé":"Đón bao từ người phía trước";button.textContent=r.phase==="ready"?"Vào vị trí · Bắt đầu":r.flight>0?"Đang chuyền tới sạp…":r.held?"Chuyền 5 bao · E / Space":"Đón 5 bao · E / Space";button.disabled=r.flight>0||r.phase==="done";}
    document.getElementById("caveMeterLabel").textContent=g.level===14?`${label}: ${r.delivered}/100 bao`:`${label}: ${Math.round(value)}%`;
    document.getElementById("caveMeter").value=value;document.getElementById("caveStatusText").textContent=text;
    document.getElementById("fieldHelp").textContent=g.level===12?"Chạm dấu vết để đi tới · Q mở la bàn · E tương tác":g.level===13?"Gom tre, dụng cụ, lá cọ · Tới sạp rồi chọn bước lắp":"E / Space · Đón rồi chuyền · Chờ lượt tới sạp · Có thể tạm dừng";
  }
}
