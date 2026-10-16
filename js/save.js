class SaveSystem {
  constructor(key = "hat_muoi_truong_ky_chapter1_v2") {
    this.key = key;
  }

  save(data) {
    try { localStorage.setItem(this.key, JSON.stringify(data)); return true; }
    catch { return false; }
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem(this.key));
      return this.valid(data) ? data : null;
    } catch {
      return null;
    }
  }

  clear() {
    try { localStorage.removeItem(this.key); } catch { /* Gameplay remains available. */ }
  }

  valid(data) {
    if (!data || data.version !== 2 || !Number.isInteger(data.level) || data.level < 1 || data.level > 4) return false;
    if (typeof data.stageComplete !== "boolean" || typeof data.chapterComplete !== "boolean") return false;
    const point = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
    const cell = p => point(p) && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x > 0 && p.x < 9 && p.y > 0 && p.y < 6;
    if (!point(data.player) || data.player.x < 0 || data.player.x > 1200 || data.player.y < 0 || data.player.y > 700) return false;
    if (!Array.isArray(data.inventory) || !data.inventory.every(id => Object.hasOwn(CHAPTER_ONE.items, id))) return false;
    if (!data.flags || typeof data.flags !== "object" || Array.isArray(data.flags)) return false;
    if (!Array.isArray(data.completedLevels) || !data.completedLevels.every(n => Number.isInteger(n) && n >= 1 && n <= 4)) return false;
    const t = data.train, d = data.dock;
    if (!t || !Array.isArray(t.hidden) || t.hidden.length > 3 || new Set(t.hidden).size !== t.hidden.length || !t.hidden.every(n => [0, 1, 2].includes(n)) || !Number.isFinite(t.remaining) || t.remaining < 0 || t.remaining > 45 || typeof t.seated !== "boolean") return false;
    if (t.seated && t.hidden.length !== 3) return false;
    if (!d || !cell(d.player) || !Array.isArray(d.boxes) || d.boxes.length !== 3 || !d.boxes.every(cell)) return false;
    const unique = boxes => new Set(boxes.map(p => `${p.x},${p.y}`)).size === 3;
    if (!unique(d.boxes) || d.boxes.some(p => p.x === d.player.x && p.y === d.player.y)) return false;
    if (!Number.isInteger(d.moves) || d.moves < 0 || !Number.isFinite(d.elapsed) || d.elapsed < 0 || typeof d.crouched !== "boolean") return false;
    if (!Array.isArray(d.history) || d.history.length > 200 || !d.history.every(h => cell(h.player) && Array.isArray(h.boxes) && h.boxes.length === 3 && h.boxes.every(cell) && unique(h.boxes) && Number.isInteger(h.moves) && h.moves >= 0)) return false;
    return true;
  }
}
