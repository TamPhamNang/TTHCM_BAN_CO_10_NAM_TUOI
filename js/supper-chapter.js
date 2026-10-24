class SupperChapter {
  constructor(game,saved=null){this.game=game;this.data=saved?structuredClone(saved):{phase:"collect",ingredients:false,spoon:false,salted:false,elapsed:0,time:0};}
  snapshot(){return structuredClone(this.data);}
  static valid(d){
    if(!d||!["collect","prepare","scoop","sprinkle","cooking","serve","ending","done"].includes(d.phase))return false;
    if(![d.ingredients,d.spoon,d.salted].every(v=>typeof v==="boolean")||!Number.isFinite(d.elapsed)||d.elapsed<0||d.elapsed>6||!Number.isFinite(d.time)||d.time<0)return false;
    if(d.phase!=="collect"&&!d.ingredients)return false;
    if(["sprinkle","cooking","serve","ending","done"].includes(d.phase)&&!d.spoon)return false;
    return d.salted===["cooking","serve","ending","done"].includes(d.phase);
  }
  finished(){return this.data.phase==="done";}
  hudKey(){return [this.data.phase,this.data.ingredients,this.data.spoon,Math.ceil(this.data.elapsed)].join("|");}
  objective(){return {collect:"Lấy giỏ rau rừng và cá suối anh nuôi đã chuẩn bị.",prepare:"Mang nguyên liệu tới nồi canh.",scoop:"Nhặt muỗng gỗ rồi tới bao muối Văn Lý để xúc muối.",sprinkle:"Mang thìa muối tới nồi canh và rắc vào nồi.",cooking:"Canh đang chín. Hơi ấm lan khắp lán bếp…",serve:"Canh đã chín. Tới bàn ăn mời các chú bộ đội dùng bữa.",ending:"Bác Hồ tới thăm lán trại.",done:"Dũng sĩ Hậu cần · Hành trình đã hoàn thành!"}[this.data.phase];}
  objects(){
    const d=this.data;if(["ending","done"].includes(d.phase))return [];
    const station=(id,x,y,label,art)=>({id,x,y,label,art,hit:{x:x-30,y:y-24,width:60,height:48}});
    return [
      ...(!d.ingredients?[station("supperIngredients",383,438,"Lấy giỏ rau và cá",SUPPER_LAYOUT.ingredients)]:[]),
      ...(!d.spoon?[station("supperSpoon",477,438,"Lấy muỗng gỗ",SUPPER_LAYOUT.spoon)]:[]),
      station("supperPot",235,438,d.phase==="prepare"?"Cho nguyên liệu vào nồi":d.phase==="sprinkle"?"Rắc muối vào canh":"Nồi canh trên bếp",SUPPER_LAYOUT.pot),
      station("supperSalt",936,484,"Xúc muối Văn Lý",SUPPER_LAYOUT.salt),
      ...(d.phase==="serve"?[{id:"supperServe",x:440,y:465,label:"Mời các chú dùng bữa"}]:[])
    ];
  }

  interact(o){
    const g=this.game,d=this.data;
    if(o.id==="supperIngredients"){d.ingredients=true;d.phase="prepare";g.give(o.id);g.player.startAction("pickup");g.notify("Đã lấy giỏ rau và cá. Mang tới nồi canh nhé!");}
    else if(o.id==="supperSpoon"){d.spoon=true;g.give(o.id);g.player.startAction("pickup");g.notify("Đã nhặt muỗng gỗ.");}
    else if(o.id==="supperSalt"){
      if(d.phase!=="scoop")g.notify(d.salted?"Nồi canh đã đủ muối rồi.":"Cho rau và cá vào nồi trước nhé.");
      else if(!d.spoon)g.notify("Cháu cần lấy chiếc muỗng gỗ trước.");
      else {d.phase="sprinkle";g.player.startAction("pickup");g.notify("Muối Văn Lý trắng ngần. Mang thìa muối tới nồi canh!");}
    }else if(o.id==="supperPot"){
      if(d.phase==="prepare"){d.phase="scoop";g.remove("supperIngredients");g.player.startAction("pickup");g.notify("Rau và cá đã vào nồi. Lấy muỗng rồi xúc một ít muối nhé.");}
      else if(d.phase==="sprinkle"){d.phase="cooking";d.salted=true;d.elapsed=0;g.player.startAction("pickup",1.5);g.notify("Từng hạt muối rơi vào nồi canh. Hơi ấm bốc lên…");}
      else g.notify(this.objective());
    }else if(o.id==="supperServe"&&d.phase==="serve"){d.phase="ending";d.elapsed=0;g.remove("supperSpoon");this.ending();}
    this.changed();
  }
  ending(){
    const g=this.game;
    g.say([{speaker:"Chú bộ đội",text:"Canh ngon quá! Cảm ơn anh nuôi, cảm ơn cháu Kiên và cả đoàn đã giữ trọn những hạt muối này."},{speaker:"Nguyễn Lương Bằng",text:"Thưa Bác, muối Văn Lý đã được đưa tới chiến khu và cất vào kho an toàn."},{speaker:"Bác Hồ",text:"Muối Văn Lý ngon lắm! Các chú, các cháu đã vượt bao khó khăn, cùng làm nên một việc lớn."},{speaker:"Bác Hồ",text:"Cháu đã làm rất tốt, Dũng sĩ Hậu cần của Bác!"},{speaker:"Người kể chuyện",text:"Bác cài lên ngực Kiên chiếc huy hiệu ngôi sao. Mỗi hạt muối nhỏ đều mang theo công sức và tấm lòng của cả đoàn. Hãy trân trọng bữa ăn và những người đã làm nên nó."}],()=>{this.data.phase="done";this.changed();g.completeLevel();});
  }
  changed(){this.game.updateHUD();this.game.saveProgress();}
  update(dt){
    const g=this.game,d=this.data;d.time+=dt;
    if(d.phase==="ending"){this.ending();return;}
    if(d.phase==="cooking"){d.elapsed=Math.min(6,d.elapsed+dt);if(d.elapsed===6){d.phase="serve";g.notify("Canh đã chín! Mời các chú bộ đội dùng bữa nhé.");this.changed();}}
    g.updateWalk(dt);
  }
}
