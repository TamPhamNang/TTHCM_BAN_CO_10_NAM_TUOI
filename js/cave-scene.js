// Chapter 4 keeps the supplied painted backgrounds and intact character poses.
class CaveScene extends RiverScene {
  render(ctx){
    const g=this.game;ctx.save();ctx.beginPath();ctx.rect(0,0,1200,700);ctx.clip();
    g.scene.background(ctx,GAME_LEVELS[g.level].background);
    if(g.level===12)this.trail(ctx);if(g.level===13)this.workshop(ctx);if(g.level===14)this.relay(ctx);
    g.scene.vignette(ctx,.12);ctx.restore();
  }
  items(ctx,drawPlayer=true){
    const g=this.game,draws=[];
    for(const o of g.cave.objects()){
      if(o.art)draws.push({y:o.y,draw:()=>window.gameArt.draw(ctx,o.art.id,o.art.x,o.art.bottom,o.art.width)});
      g.scene.marker(ctx,o.x,o.y,"",false,18);
      this.label(ctx,o.label,o.x,o.y+29,"#f7e1b2",12);
    }
    if(drawPlayer)draws.push({y:g.player.y,draw:()=>{
      const t=g.cave.data.trail,b=g.cave.data.build,time=g.cave.data.time;
      if(g.level===12&&t.phase==="clearing")this.pose(ctx,"caveKienCut",g.player.x,g.player.y,76,t.workLeft>0?Math.sin((.6-t.workLeft)/.6*Math.PI)*-.13:0);
      else if(g.level===12&&t.compass&&!g.player.moving)this.pose(ctx,"caveKienCompass",g.player.x,g.player.y,76,Math.sin(time*1.4)*.008);
      else if(g.level===13&&b.phase==="collect"&&b.bamboo.some(Boolean))this.pose(ctx,"caveKienCarry",g.player.x,g.player.y-(g.player.moving?Math.sin(time*9)*.7:0),76);
      else g.player.render(ctx);
    }});
    draws.sort((a,b)=>a.y-b.y).forEach(item=>item.draw());
  }
  trail(ctx){
    const d=this.game.cave.data,t=d.trail;
    const clearing=t.cleared/3+(t.workLeft>0?(1-t.workLeft/.6)/3:0);
    if(clearing<1){
      ctx.save();ctx.globalAlpha=1-clearing;
      window.gameArt.draw(ctx,"caveVines",865+Math.sin(d.time*1.6)*.6,458,310);
      ctx.restore();
    }
    // A readable compass cue on the ground, matching the journal's directions.
    ctx.save();ctx.translate(535,450);ctx.strokeStyle="#dfcf9a99";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,14);ctx.lineTo(0,-15);ctx.moveTo(-14,0);ctx.lineTo(14,0);ctx.stroke();ctx.restore();
    this.label(ctx,"Bắc ↑ · Lối khô ↗",535,427,"#f2d69b",12);
    for(let i=0;i<12;i++){
      const p=(d.time*.08+i/12)%1,x=497+p*90,y=521-Math.sin(p*Math.PI)*12;
      ctx.fillStyle="#33281b";ctx.beginPath();ctx.ellipse(x,y,1.7,.9,-.25,0,Math.PI*2);ctx.fill();
    }
    if(t.clues[1])window.gameArt.draw(ctx,"caveTracks",758,466,94);
    if(t.clues[1])for(let i=0;i<2;i++){
      const x=845+Math.sin(d.time*.7+i*2)*45,y=260+Math.sin(d.time+i)*18,flap=Math.sin(d.time*10+i)*4;
      ctx.fillStyle="#272820";ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-9,y-4-flap);ctx.lineTo(x-4,y+3);ctx.lineTo(x,y+2);ctx.lineTo(x+4,y+3);ctx.lineTo(x+9,y-4-flap);ctx.closePath();ctx.fill();
    }
    this.items(ctx);
  }
  platform(ctx,step){
    if(step===0)return;
    const p=CHAPTER_FOUR.workshop;
    ctx.save();ctx.translate(p.x,p.bottom);ctx.scale(1,p.scaleY);
    window.gameArt.draw(ctx,CHAPTER_FOUR_ART.platformStages[step-1],0,0,p.width);
    ctx.restore();
  }
  workshop(ctx){
    const g=this.game,b=g.cave.data.build,d=g.cave.data;
    this.platform(ctx,b.step);
    this.items(ctx,b.phase!=="building");
    if(b.phase==="building"){
      const working=b.workLeft>0;
      this.pose(ctx,"caveKienCarry",g.player.x,g.player.y,76,working?Math.sin(d.time*8)*.025:0);
      if(working)for(let i=0;i<6;i++){ctx.fillStyle="#d7c48a99";ctx.beginPath();ctx.arc(790+i*10,440+Math.sin(d.time*9+i)*8,1.5,0,Math.PI*2);ctx.fill();}
      this.label(ctx,working?"Đang làm…":CHAPTER_FOUR.buildSteps[b.step]||"Sạp đã sẵn sàng",860,545,"#eed49a",13);
    }
    // Slow water glints stay at the damp edge, away from the raised platform.
    ctx.save();ctx.strokeStyle=`rgba(180,201,194,${.12+Math.sin(d.time*2)*.04})`;ctx.lineWidth=2;
    for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(990+i*20,574+i*12,14+Math.sin(d.time+i)*2,3,0,0,Math.PI*2);ctx.stroke();}ctx.restore();
  }
  // All actors and loose handoff bags share this one choreography clock.
  relayPose(index,elapsed){
    const spec=CHAPTER_FOUR.relay,id=CHAPTER_FOUR_ART.relayRoles[index],sheet=CHAPTER_FOUR_ART.relaySheets[id];
    const local=elapsed-index*spec.stationDelay,bag=Math.floor(local/spec.cadence);
    if(bag<0||bag>=spec.batch)return {id,frame:sheet.idle,phase:null};
    const phase=Math.floor((local-bag*spec.cadence)*30+1e-7)/30;
    let frame;
    if(phase<spec.receiveAt)frame=Math.floor(phase/spec.receiveAt*sheet.receive);
    else if(phase<spec.releaseAt)frame=sheet.receive+Math.floor((phase-spec.receiveAt)/(spec.releaseAt-spec.receiveAt)*(sheet.release-sheet.receive));
    else frame=id==="relayLoader"?sheet.idle:sheet.release+Math.floor((phase-spec.releaseAt)/(spec.cycle-spec.releaseAt)*(sheet.idle-sheet.release));
    return {id,frame,phase};
  }
  relayActor(ctx,id,frame,x,y,height){
    height*=window.gameArt.actorLayout?.relay??1;
    const image=window.gameArt.relayFrames[id]?.[frame];if(!image)return;
    const scale=height/210;
    ctx.save();ctx.fillStyle="#10231b44";ctx.beginPath();ctx.ellipse(x,y+13,17,4,0,0,Math.PI*2);ctx.fill();
    ctx.translate(x,y+14);ctx.scale(scale,scale);ctx.drawImage(image,-200,-280);ctx.restore();
  }
  relay(ctx){
    const g=this.game,r=g.cave.data.relay,spec=CHAPTER_FOUR.relay,art=window.gameArt;
    const dawn=1-r.remaining/spec.duration,elapsed=r.flight*spec.flight;
    ctx.save();ctx.fillStyle=`rgba(8,19,31,${.28*(1-dawn)})`;ctx.fillRect(0,0,1200,700);ctx.restore();
    const people=spec.people;
    // The rear line waits clear of the active receiving hands.
    for(let i=4;i>=0;i--){const p=people[i];this.relayActor(ctx,"relayPorter",29,p.x-22,p.y-48,72-i*2);}
    if(r.delivered<100)art.draw(ctx,"caveStock",470,557,96*(1-r.delivered/100*.25));
    for(let i=4;i>=0;i--){
      const p=people[i],pose=this.relayPose(i,r.flight>0?elapsed:-10);
      if(i===2&&r.held)pose.frame=CHAPTER_FOUR_ART.relaySheets[pose.id].receive+4;
      this.relayActor(ctx,pose.id,pose.frame,p.x,p.y,90-i*2);
    }
    if(r.flight>0)for(let bag=0;bag<spec.batch;bag++)for(let i=0;i<people.length-1;i++){
      const start=bag*spec.cadence+i*spec.stationDelay+spec.releaseAt;
      const u=(elapsed-start)/spec.receiveAt;if(u<0||u>=1)continue;
      const a=people[i],b=people[i+1],scale=art.actorLayout?.relay??1,ay=a.y+14-(90-i*2)*scale*.55,by=b.y+14-(88-i*2)*scale*.55;
      // Sprite-held bags are already painted into the sheets. Only bridge the empty hands.
      art.draw(ctx,"saltBag",a.x+24*scale+(b.x-16*scale-a.x-24*scale)*u,ay+(by-ay)*u-Math.sin(u*Math.PI)*3,27*scale);
    }
    const settled=r.flight>0?Math.max(0,Math.min(spec.batch,Math.floor((elapsed-4*spec.stationDelay-spec.cycle)/spec.cadence)+1)):0;
    for(let i=0;i<Math.min(12,(r.delivered+settled)/5);i++)art.draw(ctx,"saltBag",1020+(i%4)*22,415-Math.floor(i/4)*14,27);
    ctx.save();ctx.globalAlpha=dawn*.35;const light=art.images.caveLight;if(light)ctx.drawImage(light,0,0,1200,700);ctx.restore();
    this.label(ctx,r.phase==="ready"?"CẢ TỔ CHỜ HIỆU LỆNH":r.flight>0?"ĐANG CHUYỀN TỚI SẠP":r.held?"E · CHUYỀN TIẾP":"E · ĐÓN BAO",760,552,"#f5dfae",14);
  }
}
