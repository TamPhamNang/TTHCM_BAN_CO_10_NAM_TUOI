class SupperScene extends RiverScene {
  player(ctx){
    const g=this.game,p=g.player,d=g.supper.data;
    const spoon=()=>{
      if(d.phase!=="sprinkle")return;
      const image=window.gameArt.images.supperSpoon;if(!image)return;
      const side=p.direction==="left"?-1:1;
      const bob=p.moving?Math.sin(p.animationTime*Math.PI*3.2)*1.5:0;
      const width=19,height=width*image.height/image.width;
      ctx.save();ctx.translate(p.x+side*23,p.y-47+bob);ctx.scale(side,1);
      // Anchor the end of the handle to the hand, rather than the image centre.
      ctx.rotate(-.35);ctx.drawImage(image,-width*.84,-height*.16,width,height);ctx.restore();
    };
    if(p.direction==="up")spoon();
    p.render(ctx);
    if(p.direction!=="up")spoon();
  }
  effect(ctx,id,x,y,width,frame,opacity=1){
    const frames=window.gameArt.supperFrames[id];if(!frames?.length)return;
    const img=frames[Math.floor(frame)%frames.length];ctx.save();ctx.globalAlpha=opacity;
    ctx.drawImage(img,x-width/2,y-width*img.height/img.width,width,width*img.height/img.width);ctx.restore();
  }
  render(ctx){
    const g=this.game,d=g.supper.data,art=window.gameArt;
    ctx.save();ctx.beginPath();ctx.rect(0,0,1200,700);ctx.clip();
    // Keep the same furniture and paths throughout the meal; warm the moonlit
    // camp with firelight instead of swapping to a different floor plan.
    g.scene.background(ctx,"supperMoon");
    if(["serve","ending","done"].includes(d.phase)){ctx.fillStyle="#ef9a3420";ctx.fillRect(0,0,1200,700);}
    const draws=[];
    // The background already includes the stove and pot at this station.
    const props=[SUPPER_LAYOUT.salt,...g.supper.objects().filter(o=>["supperIngredients","supperSpoon"].includes(o.id)).map(o=>o.art)];
    for(const prop of props)draws.push({y:prop.bottom,draw:()=>{
      ctx.save();ctx.filter="brightness(.86) saturate(.85)";
      art.draw(ctx,prop.id,prop.x,prop.bottom,prop.width);ctx.restore();
    }});
    draws.push({y:g.player.y,draw:()=>this.player(ctx)});
    if(["serve","ending","done"].includes(d.phase)){
      for(const [i,x] of [340,435].entries())draws.push({y:455,draw:()=>art.npc(ctx,i?"farmer":"bang",x,455,143,d.time)});
    }
    const endingIndex=g.dialogue.active?g.dialogue.index:4;
    if(d.phase==="done"||d.phase==="ending"&&endingIndex>=2)draws.push({y:510,draw:()=>art.npc(ctx,"bac",565,510,160,d.time)});
    draws.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    this.effect(ctx,"supperSteam",222,300,66,d.time*12,d.salted ? .7 : .3);
    if(d.phase==="cooking"&&d.elapsed<1.6)this.effect(ctx,"supperSprinkle",224,305,38,Math.min(23,d.elapsed*15));
    if(d.phase==="done"||d.phase==="ending"&&endingIndex>=3){
      const x=g.player.x,y=g.player.y-62;ctx.fillStyle="#f2cf65";ctx.beginPath();
      for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();ctx.fill();
      this.label(ctx,"Dũng sĩ Hậu cần",600,610,"#ffe6a3",23);
    }
    g.scene.vignette(ctx,.16);
    // Show only the current task, keeping the floor and artwork unobstructed.
    const target=g.objectiveTarget();
    if(target){
      const x=target.art?.x??target.x,y=target.art?target.art.bottom- target.art.width*art.images[target.art.id].height/art.images[target.art.id].width-12:target.y-95;
      ctx.fillStyle="#edc985";ctx.beginPath();ctx.moveTo(x,y+5);ctx.lineTo(x-5,y-4);ctx.lineTo(x+5,y-4);ctx.closePath();ctx.fill();
      ctx.save();ctx.font='12px "Times New Roman"';ctx.textAlign="center";ctx.lineWidth=3;ctx.strokeStyle="#271b12";ctx.strokeText(target.label,target.x,target.y+25);ctx.fillStyle="#f4dfb6";ctx.fillText(target.label,target.x,target.y+25);ctx.restore();
    }
    ctx.restore();
  }
}
