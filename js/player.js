class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 28;
    this.height = 28;

    this.speed = 115;
    this.runSpeed = 190;
    this.hp = 100;
    this.maxHp = 100;

    this.direction = "down";
    this.state = "idle";
    this.carryingSupply = false;

    this.dodgeTimer = 0;
    this.invulnerableTimer = 0;
    this.animationTime = 0;
    this.visualAction = null;
    this.lastCarryingSupply = false;
    this.moving = false;
    this.motionBlend = 0;
    this.heading = Math.PI / 2;
    this.facingAngle = this.heading;
  }

  getRect(x = this.x, y = this.y) {
    return {
      x: x - this.width / 2,
      y: y - this.height / 2,
      width: this.width,
      height: this.height
    };
  }

  update(dt, input, collision) {
    if (this.dodgeTimer > 0) this.dodgeTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    if (this.dodgeTimer > 0) return;

    let {x: dx, y: dy} = input.movement();

    if (dx === 0 && dy === 0) {
      this.moving = false;
      this.state = this.carryingSupply ? "carry" : "idle";
      return;
    }

    this.moving = true;

    this.face(dx, dy);

    const running = input.isDown("shift") && !this.carryingSupply;
    const speed = running ? this.runSpeed : this.speed;

    if (this.carryingSupply) {
      this.state = "carry";
    } else {
      this.state = running ? "run" : "walk";
    }

    const before = {x: this.x, y: this.y};
    const nx = this.x + dx * speed * dt;
    const ny = this.y + dy * speed * dt;

    if (!collision.blocks(this.getRect(nx, this.y))) this.x = nx;
    if (!collision.blocks(this.getRect(this.x, ny))) this.y = ny;
    const distance = Math.hypot(this.x - before.x, this.y - before.y);
    this.moving = distance > .0001;
    if (this.moving) { this.animationTime += distance / this.speed; this.visualAction = null; }
    else this.state = this.carryingSupply ? "carry" : "idle";
  }

  startAction(name, duration = .45) { this.visualAction = {name, elapsed: 0, duration}; }
  face(dx, dy) {
    this.heading = Math.atan2(dy, dx);
    // Keep the pose near diagonal boundaries; the travel vector stays continuous.
    const horizontal = Math.abs(dx), vertical = Math.abs(dy);
    if (horizontal > vertical * 1.25) this.direction = dx > 0 ? "right" : "left";
    else if (vertical > horizontal * 1.25) this.direction = dy > 0 ? "down" : "up";
    else if (["up", "down"].includes(this.direction)) this.direction = dy > 0 ? "down" : "up";
    else this.direction = dx > 0 ? "right" : "left";
  }
  updateVisual(dt) {
    this.motionBlend += ((this.moving ? 1 : 0) - this.motionBlend) * (1 - Math.exp(-dt / .07));
    const turn = Math.atan2(Math.sin(this.heading - this.facingAngle), Math.cos(this.heading - this.facingAngle));
    this.facingAngle += turn * (1 - Math.exp(-dt / .08));
    if (this.visualAction) {
      this.visualAction.elapsed += dt;
      if (this.visualAction.elapsed >= this.visualAction.duration) this.visualAction = null;
    }
  }

  dodge(input) {
    if (this.dodgeTimer > 0) return false;
    if (!input.consume("q")) return false;

    this.state = "dodge";
    this.dodgeTimer = .16;
    this.invulnerableTimer = .24;
    return true;
  }

  takeDamage(amount) {
    if (this.invulnerableTimer > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.state = "injured";
    return true;
  }

  recover(amount = 30) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    this.state = "recovery";
  }

  render(ctx) {
    if (this.carryingSupply !== this.lastCarryingSupply) {
      this.startAction(this.carryingSupply ? "pickup" : "place");
      this.lastCarryingSupply = this.carryingSupply;
    }
    let state = this.state, phase = null;
    if (this.visualAction) {
      phase = this.visualAction.elapsed / this.visualAction.duration;
      if (phase < 1) state = this.visualAction.name;
      else { this.visualAction = null; phase = null; }
    }
    ctx.save();
    if (this.invulnerableTimer > 0) ctx.globalAlpha = .65;
    window.gameArt.character(ctx, this.x, this.y, state, this.direction,
      state === "carry" && !this.moving ? 0 : this.animationTime, false, phase, {blend: this.motionBlend, heading: this.facingAngle});
    ctx.restore();
  }
}
