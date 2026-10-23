window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("gameCanvas");
  const input = new Input();
  const ui = new UI();
  const save = new SaveSystem();
  const loading = document.getElementById("loadingStatus");
  const buttons = ["startBtn","continueBtn","chapter2Btn","chapter3Btn","chapter4Btn","chapter5Btn"].map(id=>document.getElementById(id));
  buttons.forEach(button => button.disabled = true);
  window.gameArt = new ChapterAssets();
  try {
    await window.gameArt.load((done, total) => {
      loading.textContent = `Đang chuẩn bị hành trình… ${done}/${total}`;
    });
  } catch {
    loading.textContent = "Không thể chuẩn bị đồ họa. Hãy mở game qua máy chủ HTTP theo assets/README.md.";
    loading.setAttribute("role", "alert");
    return;
  }
  const game = new ChapterGame(canvas, input, ui, save);
  game.diaries = new ChapterDiaries(game);
  document.getElementById("diaryArchiveBtn").disabled = false;
  game.camera.follow(game.player);
  game.startLoop();
  document.getElementById("startBtn").disabled = false;
  document.getElementById("chapter2Btn").disabled = false;
  document.getElementById("chapter3Btn").disabled = false;
  document.getElementById("chapter4Btn").disabled = false;
  document.getElementById("chapter5Btn").disabled=false;
  game.refreshContinue();
  loading.textContent = window.gameArt.failed.length ? "Một số hình ảnh chưa tải được. Hãy tải lại trang." : "Sẵn sàng lên đường";

  // Expose for browser-console debugging during development.
  window.game = game;
});
