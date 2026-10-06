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
