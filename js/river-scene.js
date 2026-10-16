// Chapter 2 uses standalone backgrounds and text-free crops from its asset boards.
class RiverScene {
  constructor(game) {this.game=game;}
  render(ctx) {
    const g=this.game,scene=g.scene;
    scene.background(ctx,GAME_LEVELS[g.level].background);
    if(g.level===5)this.checkpoint(ctx);
    if(g.level===6)this.storm(ctx);
    if(g.level===7)this.reeds(ctx);
    scene.vignette(ctx,.15);
  }
  label(ctx,text,x,y,color="#f2dfb4",size=13){this.game.scene.label(ctx,text,x,y,color,size);}
  objects(ctx,drawPlayer=true) {
    const g=this.game,art=window.gameArt,draws=[];
    for(const object of g.objects()) {
      g.scene.marker(ctx,object.x,object.y,"",false,21);
      draws.push({y:object.y,draw:()=>{
        if(art.images[object.id])art.draw(ctx,object.id,object.x,object.y+8,object.id==="bone"?36:42);
        this.label(ctx,object.label,object.x,object.y+39,"#f6dda4",12);
      }});
    }
    if(drawPlayer)draws.push({y:g.player.y,draw:()=>{
      ctx.save();
      if(g.level===5&&g.river.data.crouched){ctx.translate(0,g.player.y*.12);ctx.scale(1,.88);}
      g.player.render(ctx);ctx.restore();
    }});
    draws.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
  }
  checkpoint(ctx) {
    const g=this.game,d=g.river.data,art=window.gameArt;
    const lure=d.distraction>0?Math.min(1,(45-d.distraction)/2,d.distraction/3):0;
    const dog={x:390+(150-390)*lure,y:310+(290-310)*lure};
    const guard={x:345+(185-345)*lure,y:263+(272-263)*lure};
    if(!lure){
      ctx.save();ctx.fillStyle="#e0b86912";ctx.beginPath();ctx.moveTo(guard.x,guard.y-25);ctx.lineTo(535,380);ctx.lineTo(310,398);ctx.closePath();ctx.fill();ctx.restore();
    }
    art.npc(ctx,"riverGuard",guard.x,guard.y,95);
    art.npc(ctx,"riverDog",dog.x,dog.y,49);
    this.label(ctx,lure>0?"Đang kiểm tra bụi rậm":"Chó đang canh tời",dog.x,dog.y-58,"#efd19d",12);
    if(d.distraction>44.2){const t=(45-d.distraction)/.8;art.draw(ctx,"bone",g.player.x+(150-g.player.x)*t,g.player.y+(290-g.player.y)*t-Math.sin(t*Math.PI)*60,28);}
    this.objects(ctx);
    if(d.chainOpen)this.label(ctx,"DÂY CHẮN ĐÃ MỞ",665,360,"#dbeab2",18);
  }
  storm(ctx) {
    const g=this.game,d=g.river.data,s=d.storm,art=window.gameArt;
    for(const [i,a] of GAME_LEVELS[6].cargo.entries()) {
      ctx.save();ctx.translate(a.x,a.y);
      ctx.strokeStyle=s.tied[i]?"#cee6ac":s.covered[i]?"#f6ce70":"#f4e8c288";
      ctx.lineWidth=s.covered[i]&&!s.tied[i]?3:2;
      if(!s.covered[i])ctx.setLineDash([7,5]);
      ctx.beginPath();ctx.moveTo(-a.width/2,-a.height/2);ctx.lineTo(a.width*.5,-a.height*.18);ctx.lineTo(a.width*.45,a.height*.5);ctx.lineTo(-a.width*.55,a.height*.17);ctx.closePath();
      if(s.covered[i]) {
        ctx.save();ctx.clip();ctx.fillStyle="#455139";ctx.fill();
        if(!s.tied[i])ctx.translate(0,Math.sin(d.time*6+i)*3);
        art.draw(ctx,"riverTarpFlat",0,a.height*.55,a.width*1.25);ctx.restore();
      }
      ctx.stroke();
      if(s.tied[i]){
        ctx.strokeStyle="#c0a56e";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-a.width*.35,-a.height*.4);ctx.lineTo(a.width*.2,a.height*.4);ctx.moveTo(a.width*.35,-a.height*.2);ctx.lineTo(-a.width*.3,a.height*.25);ctx.stroke();
      }
      ctx.restore();
      this.label(ctx,`${i+1} · ${s.tied[i]?"Đã buộc":s.covered[i]?"Buộc lại!":"Chưa che"}`,a.x,a.y+a.height*.7,s.covered[i]&&!s.tied[i]?"#ffcf72":"#f0e4c0",11);
    }
    g.player.render(ctx);
    // Wind and rain follow the simulation clock, so pausing freezes the weather.
    ctx.save();ctx.strokeStyle="#dae9fa66";ctx.lineWidth=1;
    for(let i=0;i<85;i++) {
      const x=(i*137+d.time*140)%1280-40,y=(i*83+d.time*310)%780-40;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y+25);ctx.stroke();
    }
    if(d.time%11<.07){ctx.fillStyle="#d5e7fa20";ctx.fillRect(0,0,1200,700);}ctx.restore();
    g.scene.panel(ctx,120,546,170,79,g.river.selectedTarp?"#62724aee":"#233a2dee");
    art.draw(ctx,"riverTarp",204,599,88);
    this.label(ctx,g.river.selectedTarp?"ĐÃ CHỌN BẠT":"KÉO / CHỌN BẠT",205,618,"#f4dcaa",12);
    if(g.river.dragPoint)art.draw(ctx,"riverTarp",g.river.dragPoint.x,g.river.dragPoint.y+18,75,.8);
  }
  route(ctx,path,color,width=3) {
    if(!path.length)return;
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.beginPath();
    ctx.moveTo(path[0].x,path[0].y);for(const p of path.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();
  }
  reeds(ctx) {
    const g=this.game,river=g.river,d=river.data,r=d.reeds,art=window.gameArt,channel=GAME_LEVELS[7].channel;
    if(r.phase==="route") {
      ctx.save();ctx.setLineDash([2,14]);this.route(ctx,channel,"#f4deb08c",2);ctx.restore();
      channel.slice(1).forEach((p,i)=>{
        ctx.fillStyle=i===channel.length-2?"#e5c371":"#ece3bd99";ctx.beginPath();ctx.arc(p.x,p.y,i===channel.length-2?12:5,0,Math.PI*2);ctx.fill();
      });
      this.label(ctx,"BẮT ĐẦU VẼ TỪ THUYỀN",channel[0].x,channel[0].y+45,"#f7e2ad",14);
      this.label(ctx,"Bãi trú",channel.at(-1).x,channel.at(-1).y-42,"#f7e2ad",14);
      if(river.drawing)this.route(ctx,river.drawing,river.badRoute?"#ec9f7e":"#ffe0a0",4);
    } else if(r.phase==="sailing")this.route(ctx,r.path,"#e7d2a244",2);
    const bob=Math.sin(d.time*2)*1.2;
    art.draw(ctx,"riverBoat",r.boat.x,r.boat.y+30+bob,100);
    if(r.camouflaged) {
      ctx.save();ctx.globalAlpha=.9;
      for(let i=0;i<5;i++){art.draw(ctx,"leaves",r.boat.x-35+i*17,r.boat.y+18+(i%2)*6+bob,35);}
      ctx.restore();
    }
    if(["route","sailing"].includes(r.phase)) {
      ctx.save();ctx.translate(r.boat.x,r.boat.y+8+bob);ctx.scale(.67,.67);art.character(ctx,0,0,"idle","up",0);ctx.restore();
    }
    if(r.phase==="materials")this.objects(ctx);
    if(["watch","safe"].includes(r.phase)) {
      const progress=1-r.watch/8,x=525+Math.sin(progress*Math.PI)*12,y=205+progress*300;
      art.draw(ctx,"riverPatrol",x,y,112);
      ctx.save();ctx.fillStyle="#ffe8ac13";ctx.beginPath();ctx.moveTo(x+40,y-15);ctx.lineTo(x+140,y+20);ctx.lineTo(x+140,y+70);ctx.closePath();ctx.fill();ctx.restore();
      this.label(ctx,"Giữ im lặng…",r.boat.x,r.boat.y+57,"#e9dfbf",14);
    }
  }
}
