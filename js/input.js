class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();
    this.analog = {x: 0, y: 0};
    const stick = document.getElementById("moveStick"), knob = document.getElementById("moveKnob");
    if (stick) {
      const move = event => {
        const r = stick.getBoundingClientRect(), radius = r.width * .34;
        let x = (event.clientX - r.left - r.width / 2) / radius;
        let y = (event.clientY - r.top - r.height / 2) / radius;
        const length = Math.hypot(x, y);
        if (length > 1) { x /= length; y /= length; }
        this.analog = length < .08 ? {x: 0, y: 0} : {x, y};
        knob.style.transform = `translate(${x * radius}px, ${y * radius}px)`;
      };
      stick.addEventListener("pointerdown", event => {
        event.preventDefault(); this.stickPointer = event.pointerId;
        stick.setPointerCapture(event.pointerId); move(event);
      });
      stick.addEventListener("pointermove", event => { if (event.pointerId === this.stickPointer) move(event); });
      for (const name of ["pointerup", "pointercancel", "lostpointercapture"]) stick.addEventListener(name, () => this.resetAnalog());
    }

    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) this.justPressed.add(key);
      this.keys.add(key);

      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
      }
    });

    window.addEventListener("blur", () => { this.keys.clear(); this.justPressed.clear(); this.resetAnalog(); });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  isDown(key) {
    return this.keys.has(key.toLowerCase());
  }

  resetAnalog() {
    this.analog = {x: 0, y: 0}; this.stickPointer = null;
    const knob = document.getElementById("moveKnob");
    if (knob) knob.style.transform = "translate(0px, 0px)";
  }

  movement() {
    if (Math.hypot(this.analog.x, this.analog.y) > .01) return this.analog;
    const pad = navigator.getGamepads?.()[0];
    if (pad && Math.hypot(pad.axes[0], pad.axes[1]) > .18) {
      const length = Math.hypot(pad.axes[0], pad.axes[1]);
      const strength = Math.min(1, (length - .18) / .82);
      return {x: pad.axes[0] / length * strength, y: pad.axes[1] / length * strength};
    }
    let x = Number(this.isDown("d") || this.isDown("arrowright")) - Number(this.isDown("a") || this.isDown("arrowleft"));
    let y = Number(this.isDown("s") || this.isDown("arrowdown")) - Number(this.isDown("w") || this.isDown("arrowup"));
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    return {x, y};
  }

  consume(key) {
    key = key.toLowerCase();
    const value = this.justPressed.has(key);
    this.justPressed.delete(key);
    return value;
  }

  endFrame() {
    this.justPressed.clear();
  }
}
