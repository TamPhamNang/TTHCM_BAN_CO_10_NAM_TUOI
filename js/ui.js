class UI {
  constructor() {
    this.hud = document.getElementById("hud");
    this.missionName = document.getElementById("missionName");
    this.objective = document.getElementById("objective");
    this.timerPanel = document.getElementById("timerPanel");
    this.timer = document.getElementById("timer");
    this.hpBar = document.getElementById("hpBar");
    this.hpText = document.getElementById("hpText");
    this.supplyPanel = document.getElementById("supplyPanel");
    this.supplyName = document.getElementById("supplyName");
    this.prompt = document.getElementById("interactionPrompt");
    this.dialogue = document.getElementById("dialogue");
    this.speaker = document.getElementById("speaker");
    this.dialogueText = document.getElementById("dialogueText");
    this.complete = document.getElementById("missionComplete");
    this.pause = document.getElementById("pauseMenu");
    this.mainMenu = document.getElementById("mainMenu");
    this.menuMessage = document.getElementById("menuMessage");
  }

  setMission(name, objective) {
    this.missionName.textContent = name;
    this.objective.textContent = objective;
  }

  setTimer(seconds, visible = true) {
    if (this.timerPanel.classList.contains("d-none") === visible) this.timerPanel.classList.toggle("d-none", !visible);
    if (!visible) return;
    const safe = Math.max(0, Math.ceil(seconds));
    const min = String(Math.floor(safe / 60)).padStart(2, "0");
    const sec = String(safe % 60).padStart(2, "0");
    const label = `${min}:${sec}`;
    if (this.timer.textContent !== label) this.timer.textContent = label;
  }

  setHP(hp, max) {
    const ratio = Math.max(0, hp / max);
    this.hpBar.style.width = `${ratio * 100}%`;
    this.hpText.textContent = `${Math.ceil(hp)} / ${max}`;
  }

  setSupply(active, name = "") {
    this.supplyPanel.classList.toggle("d-none", !active);
    this.supplyName.textContent = name;
  }

  showPrompt(text = "Space — Tương tác") {
    if (this.prompt.textContent !== text) this.prompt.textContent = text;
    if (this.prompt.classList.contains("d-none")) this.prompt.classList.remove("d-none");
  }

  hidePrompt() {
    if (!this.prompt.classList.contains("d-none")) this.prompt.classList.add("d-none");
  }

  showDialogue(speaker, text) {
    document.getElementById("dialoguePortrait").classList.toggle("soldier-portrait", speaker !== "Cán bộ phụ trách");
    document.getElementById("dialoguePortrait").classList.toggle("bac-portrait", speaker === "Bác Hồ");
    const portrait = speaker.includes("Bác Hồ") ? "bac" : speaker.includes("Nguyễn") ? "bang" : speaker.includes("Lính") ? "guard" : speaker.includes("Bác Hai") ? "trainPassengerFarmer" : speaker.includes("diêm dân") ? (speaker.startsWith("Cô") ? "woman" : "farmer") : null;
    const art = portrait === "bac" ? window.gameArt?.images.portraitBac : portrait ? window.gameArt?.images[portrait] : window.gameArt?.playerPortrait?.();
    if (art) document.getElementById("dialoguePortrait").style.backgroundImage = `url("${art.toDataURL()}")`;
    this.speaker.textContent = speaker;
    this.dialogueText.textContent = text;
    this.dialogue.classList.remove("d-none");
  }

  hideDialogue() {
    this.dialogue.classList.add("d-none");
  }

  showComplete(text) {
    document.getElementById("completeText").textContent = text;
    this.complete.classList.remove("d-none");
  }

  hideComplete() {
    this.complete.classList.add("d-none");
  }

  showPause() {
    this.pause.classList.remove("d-none");
  }

  hidePause() {
    this.pause.classList.add("d-none");
  }

  showMenu() {
    this.mainMenu.classList.remove("d-none");
  }

  hideMenu() {
    this.mainMenu.classList.add("d-none");
  }

  message(text) {
    this.menuMessage.textContent = text;
  }

  airRaid() {
    this.showDanger("CẢNH BÁO KHÔNG KÍCH");
    this.flashAndShake();
  }

  showDanger(text) {
    const el = document.createElement("div");
    el.className = "danger-notice";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  stepComplete(text) {
    document.querySelectorAll(".step-notice").forEach(el => el.remove());
    const el = document.createElement("div");
    el.className = "step-notice";
    el.setAttribute("role", "status");
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2400);
  }

  flashAndShake() {
    const flash = document.createElement("div");
    flash.className = "flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 220);

    document.getElementById("game-shell").classList.remove("screen-shake");
    void document.getElementById("game-shell").offsetWidth;
    document.getElementById("game-shell").classList.add("screen-shake");
  }
}
