class DialogueSystem {
  constructor(ui, input) {
    this.ui = ui;
    this.input = input;
    this.active = false;
    this.lines = [];
    this.index = 0;
    this.onComplete = null;
  }

  start(lines, onComplete = null) {
    this.lines = lines;
    this.index = 0;
    this.onComplete = onComplete;
    this.active = true;
    this.showCurrent();
  }

  showCurrent() {
    const line = this.lines[this.index];
    this.ui.showDialogue(line.speaker, line.text);
  }

  update() {
    if (!this.active) return;

    if (this.input.consume(" ")) {
      this.index++;
      if (this.index >= this.lines.length) {
        this.active = false;
        this.ui.hideDialogue();
        if (this.onComplete) this.onComplete();
      } else {
        this.showCurrent();
      }
    }
  }
}
