// Touch UI delegates to the same chapter actions as keyboard/desktop controls.
class MobileControls {
  constructor(game){
    this.game=game;
    this.overlay=document.getElementById("rotateDevice");
    this.panel=document.getElementById("mobileActions");
    this.primary=document.getElementById("mobilePrimary");
    this.secondary=document.getElementById("mobileSecondary");
    this.extra=document.getElementById("mobileExtra");
    this.run=document.getElementById("mobileRun");
    this.primary.addEventListener("click",()=>this.invoke("primary"));
    this.secondary.addEventListener("click",()=>this.invoke("secondary"));
    this.extra.addEventListener("click",()=>this.invoke("extra"));
    this.run.addEventListener("pointerdown",event=>{
      if(this.blocked||game.state!=="gameplay")return;
      event.preventDefault();this.run.setPointerCapture(event.pointerId);
      game.input.touchKeys.add("shift");this.run.setAttribute("aria-pressed","true");
    });
    for(const name of ["pointerup","pointercancel","lostpointercapture"])this.run.addEventListener(name,()=>this.releaseRun());
    window.addEventListener("blur",()=>this.releaseRun());
    this.resize();
  }
  releaseRun(){this.game.input.touchKeys.delete("shift");this.run.setAttribute("aria-pressed","false");}
  resize(){
    // Responsive browser frames may expose a mouse and zero touch points.
    // Re-evaluate on every resize so rotating/resizing the emulator also works.
    const touch=matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0;
    const phoneFrame=innerWidth<=767||(innerWidth<=1024&&innerHeight<=600);
    this.enabled=touch||phoneFrame;
    const blocked=this.enabled&&innerHeight>innerWidth;
    document.documentElement.classList.toggle("mobile-device",this.enabled);
    document.documentElement.classList.toggle("mobile-portrait",blocked);
    this.overlay.hidden=!blocked;
    if(blocked!==this.blocked){
      this.releaseRun();this.game.input.keys.clear();this.game.input.justPressed.clear();this.game.input.resetAnalog();
      this.game.river?.cancelPointer();
    }
    this.blocked=blocked;this.sync();
  }
  walking(){
    const g=this.game;
    return [1,3,15].includes(g.level)||g.level===5&&!g.river.data.chainOpen||
      g.level===7&&g.river.data.reeds.phase==="materials"||
      g.level===10&&["search","ready"].includes(g.forest.data.camp.phase)||
      g.level===12&&g.cave.data.trail.phase==="search"||
      g.level===13&&g.cave.data.build.phase==="collect";
  }
  button(element,config){
    element.hidden=!config;
    if(!config)return;
    const source=config.source&&document.getElementById(config.source);
    const label=config.label??source?.textContent??"Tương tác";
    // Touch labels describe actions without keyboard bindings.
    const text=label.replace(/\s*·\s*(?:E\s*\/\s*Space|E|C|Q|Z|R)\b/g,"").replace(/^(?:C|Q|Z|R)\s*·\s*/,"");
    if(element.textContent!==text)element.textContent=text;
    element.disabled=config.disabled??source?.disabled??false;
    if(config.pressed!==undefined)element.setAttribute("aria-pressed",String(config.pressed));
    else element.removeAttribute("aria-pressed");
  }
  static touchText(text){
    return text.replace(/E\s*\/\s*Space hoặc nút Đẩy/g,"nút Đẩy")
      .replace(/theo nhịp E\s*\/\s*Space/g,"bằng nút Đẩy xe")
      .replace(/E\s*\/\s*Space/g,"nút thao tác")
      .replace(/\bC\s*\/\s*Chèn đá/g,"Chèn đá")
      .replace(/\s*·\s*(?:E|C|Q|Z|R)\b/g,"")
      .replace(/^(?:E|C|Q|Z|R)\s*·\s*/,"").replace(/\s*\/\s*C\b/g,"");
  }
  sync(){
    const g=this.game,playing=this.enabled&&!this.blocked&&g.state==="gameplay";
    this.panel.hidden=!playing;
    if(!playing){this.releaseRun();return;}
    const walking=this.walking();
    for(const id of ["objective","forestRhythmText"]){
      const el=document.getElementById(id),text=MobileControls.touchText(el.textContent);
      if(el.textContent!==text)el.textContent=text;
    }
    document.getElementById("freeControls").classList.toggle("d-none",!walking);
    this.run.hidden=!walking;
    if(!walking)this.releaseRun();
    let primary=walking?{label:"Tương tác",action:()=>{
      const near=g.nearObject();if(near)g.interact(near);else g.notify("Tới gần người hoặc đồ vật để tương tác nhé.");
    }}:null,secondary=null,extra=null;
    if(g.level===2)primary={label:g.train.seated?"Đã ngồi yên":"Ngồi vào ghế",disabled:g.train.hidden.length<3||g.train.seated,action:()=>g.sitTrain()};
    if(g.level===4){
      primary={source:"crouchBtn",pressed:g.dock.crouched};
      secondary={source:"undoBtn",label:"Lùi bước"};extra={source:"resetDockBtn",label:"Xếp lại"};
    }
    if(g.level===5)secondary={source:"riverActionBtn",pressed:g.river.data.crouched};
    if([6,7].includes(g.level)&&!walking)primary={source:"riverActionBtn"};
    if(g.level===8)primary={source:"forestDepartBtn",label:"Lên đường"};
    if(g.level===9||g.level===10&&!walking||g.level===11)primary={source:"forestPrimaryBtn"};
    if([9,11].includes(g.level))secondary={source:"forestSecondaryBtn"};
    if(g.level===11)extra={label:"Đổi nhóm",action:()=>{const a=g.forest.data.air;a.selected=(a.selected+1)%3;g.updateHUD();}};
    if([12,13,14].includes(g.level)){
      if(walking)secondary={source:"cavePrimaryBtn"};else primary={source:"cavePrimaryBtn"};
    }
    this.actions={primary,secondary,extra};
    this.button(this.primary,primary);this.button(this.secondary,secondary);this.button(this.extra,extra);
  }
  invoke(name){
    if(!this.enabled||this.blocked||this.game.state!=="gameplay")return;
    this.sync();const config=this.actions[name];if(!config)return;
    if(config.source)document.getElementById(config.source).click();else if(!config.disabled)config.action?.();
    this.sync();
  }
}
