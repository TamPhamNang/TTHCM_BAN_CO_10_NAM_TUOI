class SupperScene extends RiverScene {
  effect(ctx,id,x,y,width,frame,opacity=1){
    const frames=window.gameArt.supperFrames[id];if(!frames?.length)return;
    const img=frames[Math.floor(frame)%frames.length];ctx.save();ctx.globalAlpha=opacity;
    ctx.drawImage(img,x-width/2,y-width*img.height/img.width,width,width*img.height/img.width);ctx.restore();
  }
  render(ctx){
    const g=this.game,d=g.supper.data,art=window.gameArt;
    ctx.save();ctx.beginPath();ctx.rect(0,0,1200,700);ctx.clip();
    g.scene.background(ctx,["serve","ending","done"].includes(d.phase)?"supperWarm":"supperMoon");
    const draws=[{y:535,draw:()=>art.draw(ctx,"supperPot",705,535,173)},{y:550,draw:()=>art.draw(ctx,"supperSalt",930,550,105)}];
    for(const o of g.supper.objects()){
      if(o.art)draws.push({y:o.y,draw:()=>art.draw(ctx,o.art.id,o.art.x,o.art.bottom,o.art.width)});
      g.scene.marker(ctx,o.x,o.y,"",false,17);this.label(ctx,o.label,o.x,o.y+27,"#fff0cc",12);
    }
    draws.push({y:g.player.y,draw:()=>{g.player.render(ctx);if(d.phase==="sprinkle")art.draw(ctx,"supperSpoon",g.player.x+25,g.player.y-25,45);}});
    if(["serve","ending","done"].includes(d.phase)){
      for(const [i,x] of [340,435].entries())draws.push({y:455,draw:()=>art.npc(ctx,i?"farmer":"bang",x,455,87,d.time)});
    }
    const endingIndex=g.dialogue.active?g.dialogue.index:4;
    if(d.phase==="done"||d.phase==="ending"&&endingIndex>=2)draws.push({y:510,draw:()=>art.npc(ctx,"bac",565,510,102,d.time)});
    draws.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    this.effect(ctx,"supperSteam",705,442,105,d.time*12,d.salted ? .7 : .3);
    if(d.phase==="cooking"&&d.elapsed<1.6){art.draw(ctx,"supperSpoon",740,377,70);this.effect(ctx,"supperSprinkle",710,440,90,Math.min(23,d.elapsed*15));}
    if(d.phase==="done"||d.phase==="ending"&&endingIndex>=3){
      const x=g.player.x,y=g.player.y-32;ctx.fillStyle="#f2cf65";ctx.beginPath();
      for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();ctx.fill();
      this.label(ctx,"Dũng sĩ Hậu cần",600,610,"#ffe6a3",23);
    }
    g.scene.vignette(ctx,.16);ctx.restore();
  }
}
