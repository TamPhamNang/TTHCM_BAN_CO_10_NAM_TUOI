// Source sheets are illustrated rows, not evenly spaced grids. Discover complete
// figures before registering them to a common foot anchor at native resolution.
class SpriteClips {
  static splitRow(art, image, rect) {
    const canvas = art.extract(image, rect, {components: false, tolerance: 18, maxSize: 2048, trim: false});
    const ctx = canvas.getContext("2d", {willReadFrequently: true});
    const {width: w, height: h} = canvas, pixels = ctx.getImageData(0, 0, w, h).data;
    const seen = new Uint8Array(w * h), queue = new Int32Array(w * h), pieces = [];
    for (let start = 0; start < w * h; start++) {
      if (seen[start] || pixels[start * 4 + 3] < 32) continue;
      let head = 0, tail = 0, left = w, right = 0, top = h, bottom = 0;
      queue[tail++] = start; seen[start] = 1;
      while (head < tail) {
        const i = queue[head++], x = i % w, y = Math.floor(i / w);
        left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
        for (const n of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i >= w ? i - w : -1, i < w * (h - 1) ? i + w : -1]) {
          if (n >= 0 && !seen[n] && pixels[n * 4 + 3] >= 32) { seen[n] = 1; queue[tail++] = n; }
        }
      }
      if (tail > 1800 && bottom - top > h * .42 && right - left < 250) {
        pieces.push({left, right, top, bottom, indices: queue.slice(0, tail)});
      }
    }
    pieces.sort((a, b) => a.left - b.left);
    return pieces.map(piece => {
      const frame = document.createElement("canvas"); frame.width = piece.right - piece.left + 7; frame.height = piece.bottom - piece.top + 7;
      const fc = frame.getContext("2d"), output = fc.createImageData(frame.width, frame.height);
      for (const i of piece.indices) {
        const x = i % w - piece.left + 3, y = Math.floor(i / w) - piece.top + 3, dest = (y * frame.width + x) * 4;
        output.data.set(pixels.subarray(i * 4, i * 4 + 4), dest);
      }
      fc.putImageData(output, 0, 0);
      frame.sourceRect = [rect[0] + piece.left, rect[1] + piece.top, piece.right - piece.left + 1, piece.bottom - piece.top + 1];
      return frame;
    });
  }
  static register(frame, referenceHeight, displayHeight = 76) {
    const ctx = frame.getContext("2d", {willReadFrequently: true}), {width: w, height: h} = frame;
    const pixels = ctx.getImageData(0, 0, w, h).data, centers = [];
    // Register the trunk, rather than the enclosing box (a moving arm or bag
    // changes that box). A fixed scale applies to every pose in the same costume.
    for (let y = Math.floor(h * .48); y < Math.floor(h * .7); y++) {
      let left = w, right = 0;
      for (let x = 0; x < w; x++) if (pixels[(y * w + x) * 4 + 3] > 128) { left = Math.min(left, x); right = x; }
      if (right > left) centers.push((left + right) / 2);
    }
    centers.sort((a, b) => a - b);
    const root = Math.round(centers[Math.floor(centers.length / 2)] ?? w / 2);
    const normalized = document.createElement("canvas"); normalized.width = 320; normalized.height = 340;
    const x = 160 - root, y = 320 - (h - 3);
    normalized.getContext("2d").drawImage(frame, x, y);
    normalized.sprite = {anchorX: 160, anchorY: 320, scale: displayHeight / (referenceHeight - 6),
      bounds: {x, y, width: w, height: h}, source: frame, sourceRect: frame.sourceRect};
    return normalized;
  }
  static bank(raw, displayHeight = 76) {
    const reference = raw.idle[0].height;
    return Object.fromEntries(Object.entries(raw).map(([name, frames]) => [name, frames.map(f => SpriteClips.register(f, reference, displayHeight))]));
  }
}

class SpritePainter {
  constructor() { this.scaled = new WeakMap(); }
  warm(resolution, frames) {
    const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
    ctx.scale(resolution, resolution);
    for (const frame of new Set(frames)) if (frame?.sprite) this.draw(ctx, frame, 0, 0);
  }
  draw(ctx, image, x, y, {mirror = false, bob = 0} = {}) {
    const meta = image.sprite;
    if (!meta) return;
    const matrix = ctx.getTransform(), resolution = Math.hypot(matrix.a, matrix.b);
    const pixelsPerSource = meta.scale * resolution, width = Math.max(1, Math.round(image.width * pixelsPerSource));
    const height = Math.max(1, Math.round(image.height * pixelsPerSource)), key = `${width}:${height}`;
    let variants = this.scaled.get(image);
    if (!variants) { variants = new Map(); this.scaled.set(image, variants); }
    let cached = variants.get(key);
    if (!cached) {
      cached = document.createElement("canvas"); cached.width = width; cached.height = height;
      const cc = cached.getContext("2d"); cc.imageSmoothingEnabled = true; cc.imageSmoothingQuality = "high";
      cc.drawImage(image, 0, 0, width, height);
      if (variants.size >= 4) variants.clear();
      variants.set(key, cached);
    }
    ctx.save();
    if (Math.abs(matrix.b) < .00001 && Math.abs(matrix.c) < .00001 && matrix.a > 0 && matrix.d > 0) {
      // Copy at whole backing pixels. Re-filtering a cached frame at fractional
      // coordinates made the same face alternately sharp/soft while moving.
      const px = Math.round(x * matrix.a + matrix.e), py = Math.round((y + 14 + bob) * matrix.d + matrix.f);
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(px, py); if (mirror) ctx.scale(-1, 1);
      ctx.drawImage(cached, -Math.round(meta.anchorX * pixelsPerSource), -Math.round(meta.anchorY * pixelsPerSource));
    } else {
      ctx.translate(x, y + 14 + bob); if (mirror) ctx.scale(-1, 1);
      ctx.drawImage(cached, -meta.anchorX * meta.scale, -meta.anchorY * meta.scale, width / resolution, height / resolution);
    }
    ctx.restore();
  }
  sit(ctx, image, x, y, progress = 1) {
    const m = image.sprite, b = m.bounds, p = Math.max(0, Math.min(1, progress));
    // Cut below the hands so they stay attached to the jacket while knees bend.
    const hip = b.y + b.height * .73, knee = b.y + b.height * .86, bottom = b.y + b.height;
    ctx.save(); ctx.translate(x, y + 14 + 6.5 * p); ctx.scale(m.scale, m.scale); ctx.translate(-m.anchorX, -m.anchorY);
    for (const side of [-1, 1]) {
      const left = side < 0 ? b.x : m.anchorX, right = side < 0 ? m.anchorX : b.x + b.width;
      const pivot = m.anchorX + side * b.width * .13;
      ctx.save(); ctx.translate(pivot, hip); ctx.rotate(-1.2 * p);
      ctx.drawImage(image, left, hip - 4, right - left, knee - hip + 7, left - pivot, -4, right - left, knee - hip + 7);
      ctx.translate(0, knee - hip); ctx.rotate(1.2 * p);
      ctx.drawImage(image, left, knee - 3, right - left, bottom - knee + 3, left - pivot, -3, right - left, bottom - knee + 3);
      ctx.restore();
    }
    ctx.drawImage(image, b.x, b.y, b.width, hip - b.y + 4, b.x, b.y, b.width, hip - b.y + 4);
    ctx.restore();
  }
  gait(ctx, image, x, y, phase, blend = 1, {mirror = false, side: profile = false, heading = null, running = false} = {}) {
    const m = image.sprite, b = m.bounds, hip = b.y + Math.round(b.height * .66);
    if (blend < .002) { this.draw(ctx, image, x, y, {mirror}); return; }
    const matrix = ctx.getTransform();
    if (Math.abs(matrix.b) < .00001 && Math.abs(matrix.c) < .00001 && matrix.a > 0 && matrix.d > 0) {
      x += (Math.round(x * matrix.a + matrix.e) - (x * matrix.a + matrix.e)) / matrix.a;
      y += (Math.round((y + 14) * matrix.d + matrix.f) - ((y + 14) * matrix.d + matrix.f)) / matrix.d;
    }
    const cycle = phase * Math.PI * 2, bounce = (1 - Math.cos(cycle * 2)) * (running ? .8 : .4) * blend;
    const lateral = heading === null ? Number(profile) : Math.abs(Math.cos(heading));
    ctx.save(); ctx.translate(x, y + 14 - bounce); if (mirror) ctx.scale(-1, 1);
    ctx.scale(m.scale, m.scale); ctx.translate(-m.anchorX, -m.anchorY);
    // Hip and knee transforms are evaluated every render, not on a 12fps timer.
    // Overlap the cut edges beneath the jacket to keep the silhouette closed.
    for (const side of [-1, 1]) {
      const left = side < 0 ? b.x : m.anchorX, right = side < 0 ? m.anchorX : b.x + b.width;
      const pivot = m.anchorX + side * b.width * .15, stride = Math.sin(cycle) * side * blend;
      const knee = Math.round(b.y + b.height * .83), bottom = b.y + b.height;
      ctx.save(); ctx.translate(pivot, hip);
      ctx.rotate(stride * (.09 + lateral * (running ? .28 : .18)));
      ctx.translate(0, profile ? 0 : stride * 2.3);
      ctx.drawImage(image, left, hip - 4, right - left, knee - hip + 7,
        left - pivot, -4, right - left, knee - hip + 7);
      ctx.translate(0, knee - hip); ctx.rotate(Math.max(0, -stride) * (profile ? .34 : .08));
      ctx.drawImage(image, left, knee - 3, right - left, bottom - knee + 3,
        left - pivot, -3, right - left, bottom - knee + 3); ctx.restore();
    }
    ctx.translate(m.anchorX, hip); ctx.rotate(Math.sin(cycle) * .012 * blend);
    ctx.drawImage(image, b.x, b.y, b.width, hip - b.y + 4, b.x - m.anchorX, b.y - hip, b.width, hip - b.y + 4);
    ctx.restore();
  }
}
