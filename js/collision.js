class CollisionSystem {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.zones = [];
  }

  setZones(zones) { this.zones = zones || []; }

  blocks(rect) {
    if (rect.x < 0 || rect.y < 0 || rect.x + rect.width > this.width || rect.y + rect.height > this.height) return true;
    return this.zones.some(z => rect.x < z.x + z.width && rect.x + rect.width > z.x && rect.y < z.y + z.height && rect.y + rect.height > z.y);
  }

  clearPath(a, b, half = 14) {
    if (this.blocks({x: b.x - half, y: b.y - half, width: half * 2, height: half * 2})) return false;
    const dx = b.x - a.x, dy = b.y - a.y;
    // Intersect a segment with each footprint expanded by the player's radius.
    // This also prevents diagonal routes from cutting through building corners.
    return !this.zones.some(z => {
      let lo = 0, hi = 1;
      for (const [origin, delta, min, max] of [[a.x, dx, z.x - half, z.x + z.width + half], [a.y, dy, z.y - half, z.y + z.height + half]]) {
        if (Math.abs(delta) < 1e-9) { if (origin <= min || origin >= max) return false; }
        else {
          let t0 = (min - origin) / delta, t1 = (max - origin) / delta;
          if (t0 > t1) [t0, t1] = [t1, t0];
          lo = Math.max(lo, t0); hi = Math.min(hi, t1);
          if (lo >= hi) return false;
        }
      }
      return lo < hi;
    });
  }

  renderDebug(ctx) {
    ctx.save();
    ctx.strokeStyle = "rgba(255,80,80,.8)";
    ctx.fillStyle = "rgba(255,80,80,.12)";
    for (const z of this.zones) {
      ctx.fillRect(z.x, z.y, z.width, z.height);
      ctx.strokeRect(z.x, z.y, z.width, z.height);
    }
    ctx.restore();
  }
}
