// Chapter 2 uses standalone backgrounds and text-free crops from its asset boards.
class RiverScene {
  constructor(game) {this.game=game;}
  render(ctx) {
    const g=this.game,scene=g.scene;
    ctx.save();ctx.beginPath();ctx.rect(0,0,1200,700);ctx.clip();
    scene.background(ctx,GAME_LEVELS[g.level].background);
    if(g.level===5)this.checkpoint(ctx);
    if(g.level===6)this.storm(ctx);
    if(g.level===7)this.reeds(ctx);
    scene.vignette(ctx,.15);
    ctx.restore();
  }
  label(ctx,text,x,y,color="#f2dfb4",size=13){this.game.scene.label(ctx,text,x,y,color,size);}
  pose(ctx,id,x,y,height,lean=0,opacity=1) {
    const image=window.gameArt.images[id];if(!image)return;
    ctx.save();ctx.globalAlpha*=opacity;ctx.translate(x,y+14);ctx.rotate(lean);
    const width=height*image.width/image.height;
    ctx.drawImage(image,-width/2,-height,width,height);ctx.restore();
  }
  wake(ctx,x,y,time,width=42,opacity=.28) {
    ctx.save();ctx.strokeStyle=`rgba(190,219,214,${opacity})`;ctx.lineWidth=1.3;
    for(let i=0;i<3;i++) {
      const p=(time*.65+i/3)%1;
      ctx.globalAlpha=1-p;ctx.beginPath();ctx.ellipse(x,y+p*15,width*(.6+p*.4),4+p*5,0,0,Math.PI);ctx.stroke();
    }ctx.restore();
  }
  dog(ctx,x,y,time,moving=false,returning=false,sniffing=false) {
    const image=window.gameArt.images[sniffing?"riverDogSniff":"riverDog"];if(!image)return;
    const scale=(sniffing?30:49)/image.height,w=image.width,h=image.height,hip=h*.68;
    ctx.save();ctx.translate(x,y+14);ctx.scale(returning?scale:-scale,scale);
    // Swing each pair of legs below the body; the torso covers the cut seam.
    if(moving)for(const side of [-1,1]) {
      const left=side<0?0:w/2,pivot=w*(side<0?.24:.77),stride=Math.sin(time*17)*side;
      ctx.save();ctx.translate(pivot-w/2,hip-h);ctx.rotate(stride*.15);
      ctx.drawImage(image,left,hip-3,w/2,h-hip+3,left-pivot,-3,w/2,h-hip+3);ctx.restore();
    }
    ctx.drawImage(image,0,0,w,moving?hip+3:h,-w/2,-h,w,moving?hip+3:h);ctx.restore();
  }
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
      const river=g.river,d=river.data;
      if(g.level===5 && d.chainOpen) {
        this.pose(ctx,"riverKienRope",g.player.x,g.player.y,64,Math.sin(d.crossing*6)*.025);
      } else if(g.level===5 && d.distraction>44.2) {
        const p=(45-d.distraction)/.8;
        this.pose(ctx,"riverKienThrow",g.player.x,g.player.y,76,Math.sin(p*Math.PI)*-.13);
      } else {
        const crouch=g.level===5?river.crouchBlend:0;
        ctx.globalAlpha=1-crouch;if(crouch<.999)g.player.render(ctx);ctx.globalAlpha=1;
        if(crouch>.001)this.pose(ctx,"riverKienCrouch",g.player.x,g.player.y-(g.player.moving?Math.sin(g.player.animationTime*15)*.7:0),61,Math.sin(g.player.animationTime*10)*.015,crouch);
      }
      ctx.restore();
    }});
    draws.sort((a,b)=>a.y-b.y).forEach(d=>d.draw());
  }
  checkpoint(ctx) {
    const g=this.game,d=g.river.data,art=window.gameArt;
    if(d.chainOpen) {
      const p=Math.min(1,d.crossing/1.8),ease=p*p*(3-2*p);
      ctx.save();ctx.globalAlpha=ease;
      // Only the waterway changes; preserve every bank/dock pixel of the source.
      ctx.beginPath();ctx.moveTo(628,270);ctx.lineTo(716,312);ctx.lineTo(827,341);ctx.lineTo(910,349);ctx.lineTo(1035,337);
      ctx.lineTo(1035,372);ctx.lineTo(910,386);ctx.lineTo(817,382);ctx.lineTo(707,353);ctx.lineTo(628,300);ctx.closePath();ctx.clip();
      g.scene.background(ctx,"riverCheckpointOpen");ctx.restore();
      if(d.crossing<2)this.wake(ctx,815,363,d.crossing,170,.25*(1-p));
      const travel=Math.max(0,Math.min(1,(d.crossing-1.2)/2.8)),t=travel*travel*(3-2*travel);
      this.wake(ctx,765+35*t,555-290*t,d.time,52);
      art.draw(ctx,"riverBoat",765+35*t,562-290*t,125);
    }
    const lure=d.distraction>0?Math.min(1,(45-d.distraction)/2,d.distraction/3):0;
    const dog={x:390+(150-390)*lure,y:310+(290-310)*lure};
    const guard={x:345+(185-345)*lure,y:263+(272-263)*lure};
    if(!lure){
      ctx.save();ctx.fillStyle="#e0b86912";ctx.beginPath();ctx.moveTo(guard.x,guard.y-25);ctx.lineTo(535,380);ctx.lineTo(310,398);ctx.closePath();ctx.fill();ctx.restore();
    }
    const moving=lure>0&&lure<1;
    if(art.riverGuardSprite)art.painter.gait(ctx,art.riverGuardSprite,guard.x,guard.y,d.time*1.5,moving?1:0,{mirror:d.distraction>3,side:true});
    else art.npc(ctx,"riverGuard",guard.x,guard.y,95);
    this.dog(ctx,dog.x,dog.y,d.time,moving,d.distraction<=3,lure===1);
    this.label(ctx,lure>0?"Đang kiểm tra bụi rậm":"Chó đang canh tời",dog.x,dog.y-58,"#efd19d",12);
    if(d.distraction>44.2){const t=(45-d.distraction)/.8,from=g.river.throwFrom||{x:g.player.x,y:g.player.y-28};art.draw(ctx,"bone",from.x+(150-from.x)*t,from.y+(290-from.y)*t-Math.sin(t*Math.PI)*60,28);}
    this.objects(ctx);
    if(d.chainOpen)this.label(ctx,"DÂY CHẮN ĐÃ MỞ",665,360,"#dbeab2",18);
  }
  cargoCover(ctx, a, index) {
    const river=this.game.river,s=river.data.storm,w=a.width,h=a.height;
    const covered=s.covered[index],tied=s.tied[index];
    const flap=covered&&!tied?(Math.sin(river.data.time*5+index)+1)*h*.055:0;
    const points=[[-w*.5,-h*.25-flap],[-w*.06,-h*.53-flap*.5],[w*.48,-h*.19],[w*.5,h*.27],[-w*.05,h*.52],[-w*.5,h*.18]];
    const contour=()=>{ctx.beginPath();points.forEach(([x,y],i)=>ctx[i?"lineTo":"moveTo"](x,y));ctx.closePath();};
    ctx.save();ctx.translate(a.x,a.y);
    if(covered){
      ctx.save();contour();ctx.shadowColor="#0b160dbb";ctx.shadowBlur=6;ctx.shadowOffsetY=4;ctx.fillStyle="#354132";ctx.fill();ctx.restore();
      ctx.save();contour();ctx.clip();
      const spread=river.cargoVisual[index];
      ctx.beginPath();ctx.rect(-w*.55,-h,w*1.1*spread,h*2);ctx.clip();
      const palm=ctx.createLinearGradient(0,-h*.5,0,h*.5);palm.addColorStop(0,"#92915b");palm.addColorStop(.45,"#697446");palm.addColorStop(.5,"#58643b");palm.addColorStop(1,"#35432e");
      ctx.fillStyle=palm;ctx.fillRect(-w,-h,w*2,h*2);
      // Woven palm strips follow the cargo perspective, with a folded front skirt.
      for(let i=-12;i<18;i++){
        ctx.strokeStyle=i%2?"#c4b97a55":"#253b2855";ctx.lineWidth=i%2?2:3;
        ctx.beginPath();ctx.moveTo(i*12,-h);ctx.lineTo(i*12-w*.6,h);ctx.stroke();
      }
      for(let y=-h;y<h;y+=9){ctx.strokeStyle="#d1c18a25";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-w,y);ctx.lineTo(w,y+h*.6);ctx.stroke();}
      ctx.strokeStyle="#c5b47a88";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w*.5,-h*.25-flap);ctx.lineTo(-w*.05,h*.05);ctx.lineTo(w*.48,-h*.19);ctx.stroke();
      ctx.restore();
      contour();ctx.strokeStyle=tied?"#a6ad78":"#ebc76c";ctx.lineWidth=tied?1.5:2.5;ctx.stroke();
      const rope=(from,to)=>{
        ctx.beginPath();ctx.moveTo(...from);ctx.quadraticCurveTo((from[0]+to[0])*.5,(from[1]+to[1])*.5+(tied?0:flap*2+5),...to);
        ctx.strokeStyle="#3b3020";ctx.lineWidth=5;ctx.stroke();ctx.strokeStyle="#ccb17b";ctx.lineWidth=2.5;ctx.stroke();
      };
      if(tied){
        rope([-w*.37,-h*.32],[w*.25,h*.35]);rope([w*.3,-h*.28],[-w*.28,h*.39]);
        ctx.strokeStyle="#dac08a";ctx.lineWidth=2;
        for(const side of [-1,1]){ctx.beginPath();ctx.ellipse(w*.03+side*4,h*.03,5,3,side*.5,0,Math.PI*2);ctx.stroke();}
      }else rope([-w*.37,-h*.32],[-w*.4,h*.42+flap]);
    }else{
      contour();ctx.setLineDash([6,5]);ctx.lineWidth=2;ctx.strokeStyle="#eddca7bb";ctx.stroke();
    }
    ctx.restore();
    this.label(ctx,`${index+1} · ${tied?"Đã che · Buộc chắc":covered?"Đã che · Buộc dây!":"Chạm để che bạt"}`,a.x,a.y+h*.7,covered&&!tied?"#ffdb82":"#f0e4c0",11);
  }
  storm(ctx) {
    const g=this.game,d=g.river.data,s=d.storm,art=window.gameArt;
    for(const [i,a] of GAME_LEVELS[6].cargo.entries()) this.cargoCover(ctx,a,i);
    if(g.river.cargoAction) {
      const a=g.river.cargoAction;
      this.pose(ctx,a.kind==="tie"?"riverKienTie":"riverKienTarp",g.player.x,g.player.y,65,Math.sin(a.elapsed*8)*.025);
    } else g.player.render(ctx);
    // Wind and rain follow the simulation clock, so pausing freezes the weather.
    ctx.save();ctx.strokeStyle="#dae9fa66";ctx.lineWidth=1;
    for(let i=0;i<85;i++) {
      const x=(i*137+d.time*140)%1280-40,y=(i*83+d.time*310)%780-40;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+12,y+25);ctx.stroke();
    }
    const flash=d.time%11;
    if(flash<.38){ctx.fillStyle=`rgba(213,231,250,${Math.sin(flash/.38*Math.PI)*.13})`;ctx.fillRect(0,0,1200,700);}ctx.restore();
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
  reedBoat(ctx,r,time) {
    const moving=r.phase==="sailing",bob=Math.sin(time*2)*1.2;
    // Move the intact boat and full character together; never slice body parts.
    ctx.save();ctx.translate(r.boat.x,r.boat.y+30+bob);
    ctx.rotate(Math.sin(time*2)* (moving?.009:.004));
    window.gameArt.draw(ctx,"riverBoat",0,0,100);
    if(moving){
      const stroke=time/1.6*Math.PI*2;
      this.pose(ctx,"riverKienPole",0,-22,62,Math.sin(stroke)*.045);
    }else if(r.phase==="route"){
      ctx.save();ctx.translate(0,-22);ctx.scale(.67,.67);window.gameArt.character(ctx,0,0,"idle","up",0);ctx.restore();
    }
    ctx.restore();
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
    if(r.phase==="sailing")this.wake(ctx,r.boat.x,r.boat.y+34,d.time,46);
    this.reedBoat(ctx,r,d.time);
    const coating=r.camouflaged?1:r.coating;
    if(coating>0) {
      ctx.save();ctx.globalAlpha=.9;
      ctx.fillStyle="#514a2e";ctx.globalAlpha=coating*.65;
      ctx.beginPath();ctx.ellipse(r.boat.x,r.boat.y+15,44,9,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;
      for(let i=0;i<5;i++){
        const image=art.images.leaves,opacity=Math.max(0,Math.min(1,coating*5-i));
        ctx.globalAlpha=opacity*.95;if(image)ctx.drawImage(image,r.boat.x-52+i*17,r.boat.y-12+(i%2)*6+bob,35,35*image.height/image.width);
      }
      ctx.restore();
    }
    if(r.phase==="camouflaging") {
      if(g.player.moving)g.player.render(ctx);
      else this.pose(ctx,"riverKienMud",g.player.x,g.player.y,67,Math.sin(r.coating*Math.PI*6)*.04);
    }
    if(r.phase==="materials")this.objects(ctx);
    if(["watch","safe"].includes(r.phase)) {
      const progress=1-r.watch/8,x=525+Math.sin(progress*Math.PI)*12,y=205+progress*300;
      this.wake(ctx,x,y+6,d.time,46,.25);
      art.draw(ctx,"riverPatrol",x,y,112);
      ctx.save();ctx.fillStyle="#ffe8ac13";ctx.beginPath();ctx.moveTo(x+40,y-15);ctx.lineTo(x+140,y+20);ctx.lineTo(x+140,y+70);ctx.closePath();ctx.fill();ctx.restore();
      this.label(ctx,"Giữ im lặng…",r.boat.x,r.boat.y+57,"#e9dfbf",14);
    }
    // Slow banks of translucent mist move within the river corridor.
    ctx.save();ctx.beginPath();ctx.rect(460,185,430,410);ctx.clip();
    for(let i=0;i<3;i++) {
      const y=205+i*128+Math.sin(d.time*.12+i)*12,x=520+Math.sin(d.time*.08+i)*95;
      const mist=ctx.createRadialGradient(x,y,10,x,y,200);mist.addColorStop(0,"#dce6df0b");mist.addColorStop(1,"#dce6df00");
      ctx.fillStyle=mist;ctx.fillRect(x-200,y-200,400,400);
    }ctx.restore();
  }
}
