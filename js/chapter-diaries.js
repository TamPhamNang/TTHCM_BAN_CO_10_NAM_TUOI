// Chapter-end reader and read-only archive. No save format changes.
class ChapterDiaries {
  constructor(game) {
    this.game = game;
    this.archive = document.getElementById("diaryArchive");
    document.getElementById("diaryArchiveBtn").addEventListener("click", () => this.openArchive());
    document.getElementById("closeDiaryArchiveBtn").addEventListener("click", () => this.closeArchive());
    // Keep native reader scrolling and button activation; game Input must not eat arrows/Space.
    window.addEventListener("keydown", event => {
      const root = !this.archive.hidden ? this.archive : game.state === "chapterEnd" ? document.getElementById("chapterEnd") : null;
      if (!root) return;
      event.stopImmediatePropagation();
      if (event.key === "Escape" && !this.archive.hidden) {
        event.preventDefault(); this.closeArchive();
      }
      if (event.key === "Tab") {
        const focusable = [...root.querySelectorAll("button:not(:disabled), [tabindex='0']")].filter(el => el.getClientRects().length);
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }, true);
  }
  render(chapter, root, content) {
    const entry = CHAPTER_DIARIES.find(item => item.chapter === chapter);
    root.dataset.diaryChapter=String(chapter);
    // Absolute URL also works when this custom property is used by a CSS file in css/.
    root.style.setProperty("--diary-art", `url("${new URL(entry.image, document.baseURI).href}")`);
    content.replaceChildren();
    const title = document.createElement("h2");
    title.textContent = entry.title; title.id = `${content.id}Title`;
    const date = document.createElement("p"); date.className = "diary-date"; date.textContent = entry.date;
    const place = document.createElement("p"); place.className = "diary-place";
    const label = document.createElement("strong"); label.textContent = "Nơi viết: ";
    place.append(label, document.createTextNode(entry.place));
    content.append(title, date, place);
    for (const paragraph of entry.paragraphs) {
      const p = document.createElement("p"); p.textContent = paragraph; content.append(p);
    }
    content.setAttribute("aria-labelledby", title.id);
    content.scrollTop = 0;
  }
  showEnd(chapter) {
    const content = document.getElementById("chapterDiaryContent");
    this.render(chapter, document.getElementById("chapterEnd"), content);
    content.focus({preventScroll: true});
    this.game.input.keys.clear(); this.game.input.justPressed.clear();
  }
  unlocked() {
    const data = this.game.save.load() || this.game;
    return [4, 7, 11, 14].flatMap((last, index) =>
      data.completedLevels.includes(last) || (data.chapterComplete && data.level === last) ? [index + 1] : []);
  }
  openArchive() {
    if (this.game.state !== "menu") return;
    this.previousFocus = document.activeElement;
    const chapters = this.unlocked();
    const nav = document.getElementById("diaryArchiveNav"); nav.replaceChildren();
    const content = document.getElementById("archiveDiaryContent");
    content.hidden = !chapters.length;
    document.getElementById("diaryArchiveEmpty").hidden = !!chapters.length;
    for (let chapter = 1; chapter <= 4; chapter++) {
      const button = document.createElement("button");
      button.type = "button"; button.className = "btn diary-tab";
      button.textContent = `Chương ${chapter}${chapters.includes(chapter) ? "" : " · Chưa mở"}`;
      button.disabled = !chapters.includes(chapter);
      button.addEventListener("click", () => {
        this.render(chapter, this.archive, content);
        for (const tab of nav.children) tab.setAttribute("aria-pressed", String(tab === button));
      });
      nav.append(button);
    }
    if (chapters.length) nav.children[chapters[0] - 1].click();
    else this.archive.style.removeProperty("--diary-art");
    document.getElementById("mainMenu").inert = true;
    this.archive.hidden = false;
    document.getElementById("closeDiaryArchiveBtn").focus();
  }
  closeArchive() {
    this.archive.hidden = true;
    document.getElementById("mainMenu").inert = false;
    this.previousFocus?.focus();
  }
}
