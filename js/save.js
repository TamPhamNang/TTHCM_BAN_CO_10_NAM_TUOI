class SaveSystem {
  constructor(key = "historical_air_defense_save_v1") {
    this.key = key;
  }

  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key));
    } catch {
      return null;
    }
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
