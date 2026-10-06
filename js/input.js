class Input {
  constructor() {
    this.keys = new Set();
    this.justPressed = new Set();

    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (!this.keys.has(key)) this.justPressed.add(key);
      this.keys.add(key);

      if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
        e.preventDefault();
      }
    });

    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
  }

  isDown(key) {
    return this.keys.has(key.toLowerCase());
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
