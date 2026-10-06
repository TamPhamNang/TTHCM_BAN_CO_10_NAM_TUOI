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
    this.animationTime += dt;
    if (this.dodgeTimer > 0) this.dodgeTimer -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    if (this.dodgeTimer > 0) return;

    let dx = 0, dy = 0;

    if (input.isDown("w")) dy -= 1;
    if (input.isDown("s")) dy += 1;
    if (input.isDown("a")) dx -= 1;
    if (input.isDown("d")) dx += 1;

    if (dx === 0 && dy === 0) {
      this.moving = false;
      this.state = this.carryingSupply ? "carry" : "idle";
      return;
    }

    this.moving = true;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? "right" : "left";
    } else {
      this.direction = dy > 0 ? "down" : "up";
    }

    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;

    const running = input.isDown("shift") && !this.carryingSupply;
    const speed = running ? this.runSpeed : this.speed;

    if (this.carryingSupply) {
      this.state = "carry";
    } else {
      this.state = running ? "run" : "walk";
    }

    const nx = this.x + dx * speed * dt;
    const ny = this.y + dy * speed * dt;

    if (!collision.blocks(this.getRect(nx, this.y))) this.x = nx;
    if (!collision.blocks(this.getRect(this.x, ny))) this.y = ny;
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
      this.visualAction = {name: this.carryingSupply ? "pickup" : "place", start: performance.now(), duration: 650};
      this.lastCarryingSupply = this.carryingSupply;
    }
    let state = this.state, phase = null;
    if (this.visualAction) {
      phase = (performance.now() - this.visualAction.start) / this.visualAction.duration;
      if (phase < 1) state = this.visualAction.name;
      else { this.visualAction = null; phase = null; }
    }
    ctx.save();
    if (this.invulnerableTimer > 0) ctx.globalAlpha = .65;
    window.gameArt.character(ctx, this.x, this.y, state, this.direction,
      state === "carry" && !this.moving ? 0 : this.animationTime, false, phase);
    ctx.restore();
  }
}
