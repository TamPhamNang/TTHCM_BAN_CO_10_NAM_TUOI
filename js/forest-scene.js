// Native Chapter 3 artwork, with continuous transforms driven by simulation time.
class ForestScene extends RiverScene {
  render(ctx) {
    const g=this.game;ctx.save();ctx.beginPath();ctx.rect(0,0,1200,700);ctx.clip();
    g.scene.background(ctx,GAME_LEVELS[g.level].background);
    if(g.level===8)this.harbor(ctx);
    if(g.level===9)this.hill(ctx);
    if(g.level===10)this.camp(ctx);
    if(g.level===11)this.airRaid(ctx);
    g.scene.vignette(ctx,g.level===10?.12:.15);ctx.restore();
  }
  harbor(ctx) {
    const g=this.game,p=g.forest.data.pack,art=window.gameArt;
    const travel=p.phase==="loading"?0:p.departure/3;
    const draws=CHAPTER_THREE.carriers.map((carrier,i)=>{
      const x=carrier.x+(675-carrier.x)*travel,y=carrier.y+(160-carrier.y)*travel;
      return {y,draw:()=>{
        ctx.save();ctx.globalAlpha=1-travel*.45;
        const bob=travel>0?Math.sin(g.forest.data.time*9+i)*1.2:0;
        const image=art.images[carrier.art],width=carrier.width*(1-travel*.22);
        if(image)ctx.drawImage(image,x-width/2,y-width*image.height/image.width+bob,width,width*image.height/image.width);
        ctx.restore();if(travel===0)this.label(ctx,`${carrier.name}: ${p.loads[i]}/${carrier.capacity}`,x,y+25,"#f6e3ae",13);
      }};
    });
    draws.push({y:g.player.y,draw:()=>g.player.render(ctx)});draws.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
    const transfer=g.forest.transfer;
    if(transfer){const carrier=CHAPTER_THREE.carriers[transfer.carrier],t=Math.min(1,transfer.elapsed/.45),from=transfer.delta>0?{x:520,y:242}:carrier,to=transfer.delta>0?carrier:{x:520,y:242};art.draw(ctx,"saltBag",from.x+(to.x-from.x)*t,from.y+(to.y-from.y)*t-Math.sin(t*Math.PI)*70,30);}
  }
  cart(ctx,point) {
    const image=window.gameArt.images.forestPush;if(!image)return;
    const d=this.game.forest.data,h=d.hill,w=image.width,height=image.height,scale=105/height,split=w*.4,hip=height*.73;
    const walking=h.velocity>.003&&!h.slipping,cycle=d.time*12;
    ctx.save();ctx.translate(point.x,point.y+12-(walking?Math.sin(cycle*2)*.6:0));ctx.rotate(Math.max(-.12,Math.min(.12,point.heading*.15)));
    if(Math.cos(point.heading)<0)ctx.scale(-1,1);ctx.scale(scale,scale);ctx.translate(-w/2,-height);
    // The cart stays rigid while Kiên's legs move beneath his jacket.
    ctx.drawImage(image,split-2,0,w-split+2,height,split-2,0,w-split+2,height);
    for(const side of [-1,1]){
      const left=side<0?0:split/2,pivot=split*(side<0?.25:.75);
      ctx.save();ctx.translate(pivot,hip);ctx.rotate(walking?Math.sin(cycle)*side*.11:0);
      ctx.drawImage(image,left,hip-3,split/2,height-hip+3,left-pivot,-3,split/2,height-hip+3);ctx.restore();
    }
    ctx.drawImage(image,0,0,split+3,hip+4,0,0,split+3,hip+4);ctx.restore();
  }
  hill(ctx) {
    const g=this.game,f=g.forest,h=f.data.hill,point=f.cartPoint(),spec=GAME_LEVELS[9];
    for(const [i,p] of spec.stones.entries()){
      if(h.stones[i])continue;
      const close=Math.hypot(p.x-point.x,p.y-point.y)<280;
      if(h.slipping&&close){ctx.save();ctx.strokeStyle="#ffe4a0";ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+6,24+Math.sin(f.data.time*7)*2,12,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
      window.gameArt.draw(ctx,"forestFlint",p.x,p.y+8,42);
      if(h.slipping&&close)this.label(ctx,"CHÈN BÁNH",p.x,p.y-25,"#ffe1a0",12);
    }
    if(h.lastChock!==null){const chock=ForestChapter.along(spec.route,h.lastChock);window.gameArt.draw(ctx,"forestFlint",chock.x-35,chock.y+7,28);}
    this.cart(ctx,point);
    this.label(ctx,h.slipping?"XE TRƯỢT! C · CHÈN ĐÁ":h.braced?"BÁNH XE ĐÃ GIỮ CHẮC":"E · ĐẨY ĐỀU THEO NHỊP",point.x,point.y+39,h.slipping?"#ffbb8a":"#f3dfae",14);
    // The readable DOM gauge beside the button resets on each accepted push.
  }
  campObjects(ctx) {
    const g=this.game,c=g.forest.data.camp,draws=[];
    for(const object of g.forest.objects()){
      if(!object.art)continue;
      const art=object.art;draws.push({y:art.bottom,draw:()=>{window.gameArt.draw(ctx,art.id,art.x,art.bottom,art.width);g.scene.marker(ctx,object.x,object.y,"",false,17);this.label(ctx,object.id==="forestHerb"?"Đối chiếu cây":object.id==="forestWood"?"Củi khô":"Đá đánh lửa",object.x,object.y+28,"#e4d39c",12);}});
    }
    if(!c.herb&&!c.revealed)draws.push({y:397,draw:()=>window.gameArt.draw(ctx,"forestHerb",989,397,57)});
    if(c.phase==="serving"){
      const t=Math.min(1,c.served/.9);draws.push({y:420,draw:()=>{
        const x=g.player.x+(335-g.player.x)*t,y=g.player.y+(412-g.player.y)*t,handoff=Math.max(0,(c.served-.9)/1.1);
        window.gameArt.character(ctx,x,y,t<1?"walk":"idle","left",c.served,false,null,{blend:t<1?1:0});
        window.gameArt.draw(ctx,"forestMedicine",x-18+19*handoff,y-28-32*handoff,25);
      }});
    }else draws.push({y:g.player.y,draw:()=>g.player.render(ctx)});
    draws.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
  }
  camp(ctx) {
    const g=this.game,f=g.forest,c=f.data.camp,art=window.gameArt;
    // The tent and campfire are already part of the supplied background.
    art.npc(ctx,"trainPassengerFarmer",324,359,68);
    this.label(ctx,c.phase==="healed"?"Bác Hai đã đỡ mệt":"Bác Hai đang nghỉ",324,385,"#e4d3a9",12);
    art.draw(ctx,"forestPot",461,398,48);
    if(["brewing","ready","serving","healed"].includes(c.phase)){
      ctx.save();ctx.strokeStyle="#e7d6ba88";ctx.lineWidth=2;
      for(let i=0;i<3;i++){const t=(f.data.time*.7+i/3)%1,x=450+i*9+Math.sin(t*6+i)*4;ctx.globalAlpha=1-t;ctx.beginPath();ctx.moveTo(x,365-t*28);ctx.quadraticCurveTo(x+8,354-t*28,x,345-t*28);ctx.stroke();}ctx.restore();
      const glow=ctx.createRadialGradient(460,395,1,460,395,44);glow.addColorStop(0,"#edab4e33");glow.addColorStop(1,"#edab4e00");ctx.fillStyle=glow;ctx.fillRect(416,351,88,88);
    }
    if(f.pulse>0&&c.phase==="lighting"){
      ctx.save();ctx.strokeStyle="#ffe0a0";for(let i=0;i<7;i++){const angle=i*2.4,length=(.3-f.pulse)*80;ctx.beginPath();ctx.moveTo(462,378);ctx.lineTo(462+Math.cos(angle)*length,378+Math.sin(angle)*length);ctx.stroke();}ctx.restore();
    }
    this.campObjects(ctx);
    // One cached mask canvas per scene. The hole reveals the actual map artwork.
    if(!this.darkness){this.darkness=document.createElement("canvas");this.darkness.width=1200;this.darkness.height=700;}
    const mask=this.darkness.getContext("2d");mask.globalCompositeOperation="source-over";mask.clearRect(0,0,1200,700);mask.fillStyle="#020a10b8";mask.fillRect(0,0,1200,700);
    mask.globalCompositeOperation="destination-out";
    for(const [x,y,radius,opacity] of [[f.light.x,f.light.y,145,1],[440,375,180,.8],[330,345,105,.65]]){
      const light=mask.createRadialGradient(x,y,25,x,y,radius);light.addColorStop(0,`rgba(0,0,0,${opacity})`);light.addColorStop(1,"#0000");mask.fillStyle=light;mask.beginPath();mask.arc(x,y,radius,0,Math.PI*2);mask.fill();
    }
    ctx.drawImage(this.darkness,0,0);
    if(c.phase==="ready")this.label(ctx,"NƯỚC LÁ ĐÃ SẴN SÀNG → BÁC HAI",472,457,"#edd29b",13);
  }
  planeShadow(ctx,time,opacity=.2) {
    const t=(time%6)/6;ctx.save();ctx.translate(-220+t*1650,230+t*250);ctx.rotate(.25);ctx.scale(1.4,1.4);ctx.fillStyle=`rgba(12,20,24,${opacity})`;
    ctx.beginPath();ctx.moveTo(0,-100);ctx.lineTo(11,-18);ctx.lineTo(125,25);ctx.lineTo(125,42);ctx.lineTo(12,15);ctx.lineTo(10,67);ctx.lineTo(45,86);ctx.lineTo(45,97);ctx.lineTo(0,85);ctx.lineTo(-45,97);ctx.lineTo(-45,86);ctx.lineTo(-10,67);ctx.lineTo(-12,15);ctx.lineTo(-125,42);ctx.lineTo(-125,25);ctx.lineTo(-11,-18);ctx.closePath();ctx.fill();ctx.restore();
  }
  airRaid(ctx) {
    const g=this.game,f=g.forest,a=f.data.air,art=window.gameArt,spec=GAME_LEVELS[11];
    for(const [i,shelter] of spec.shelters.entries()){
      ctx.save();ctx.strokeStyle=a.groups.some(group=>group.cover===i)?"#8fa477":"#d9d099bb";ctx.lineWidth=2;ctx.setLineDash([4,6]);ctx.beginPath();ctx.ellipse(shelter.x,shelter.y+7,47,21,-.12,0,Math.PI*2);ctx.stroke();ctx.restore();
      this.label(ctx,shelter.name,shelter.x,shelter.y-90,"#decfa8",12);
    }
    const groups=a.groups.map((group,i)=>({group,i,point:f.groupPoint(i)}));
    groups.sort((a,b)=>a.point.y-b.point.y).forEach(({group,i,point})=>{
      const specGroup=spec.groups[i],hidden=group.progress===1;
      const width=specGroup.width*(hidden?.85:1),image=art.images[specGroup.art];
      ctx.save();ctx.globalAlpha=hidden?.38:1;
      if(image)ctx.drawImage(image,point.x-width/2,point.y-width*image.height/image.width+(group.cover>=0&&!hidden?Math.sin(f.data.time*11+i):0),width,width*image.height/image.width);ctx.restore();
      if(hidden)art.draw(ctx,"forestBranches",point.x,point.y+10,90);
      if(a.selected===i&&!hidden&&a.phase==="alarm")g.scene.marker(ctx,point.x,point.y,"",false,28);
      this.label(ctx,`${i+1} · ${hidden?"Đã nấp":group.cover>=0?"Đang vào núp":specGroup.name}`,point.x,point.y+28,hidden?"#b9cba2":"#ecd7a7",12);
    });
    if(a.whistled&&a.shelterTime<.6)this.pose(ctx,"forestWhistle",g.player.x,g.player.y,76);
    else if(a.whistled&&a.shelterTime<1.6){const t=a.shelterTime-.6;art.character(ctx,g.player.x+(285-g.player.x)*t,g.player.y+(405-g.player.y)*t,"run","left",a.shelterTime);}
    else if(["alarm","flyover","resume"].includes(a.phase)&&a.whistled)this.pose(ctx,"forestHide",285,405,45,Math.sin(f.data.time)*.006);
    else g.player.render(ctx);
    if(["alarm","flyover"].includes(a.phase))this.planeShadow(ctx,a.phase==="alarm"?5-a.remaining:5+7-a.watch,a.phase==="alarm"?.25:.16);
    if(a.phase==="alarm")this.label(ctx,a.whistled?"CHỌN NHÓM → CHỌN GỐC CÂY / C":"E · THỔI CÒI BÁO ĐỘNG!",675,590,"#ffd098",18);
    if(a.phase==="flyover")this.label(ctx,"GIỮ YÊN · MÁY BAY ĐANG QUA",675,590,"#e9dbb2",16);
  }
}
