window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("gameCanvas");
  const input = new Input();
  const ui = new UI();
  const save = new SaveSystem();
  const loading = document.getElementById("loadingStatus");
  const buttons = [document.getElementById("startBtn"), document.getElementById("continueBtn"), document.getElementById("chapter2Btn")];
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
  game.camera.follow(game.player);
  game.startLoop();
  document.getElementById("startBtn").disabled = false;
  document.getElementById("chapter2Btn").disabled = false;
  game.refreshContinue();
  loading.textContent = window.gameArt.failed.length ? "Một số hình ảnh chưa tải được. Hãy tải lại trang." : "Sẵn sàng lên đường";

  // Expose for browser-console debugging during development.
  window.game = game;
});
