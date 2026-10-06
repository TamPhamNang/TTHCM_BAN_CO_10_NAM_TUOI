window.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("gameCanvas");
  const input = new Input();
  const ui = new UI();
  const save = new SaveSystem();
  const loading = document.getElementById("loadingStatus");
  const buttons = [document.getElementById("startBtn"), document.getElementById("continueBtn")];
  buttons.forEach(button => button.disabled = true);
  window.gameArt = new GameAssets();
  try {
    await window.gameArt.load((done, total) => {
      loading.textContent = `Đang chuẩn bị doanh trại… ${done}/${total}`;
    });
  } catch {
    loading.textContent = "Không thể chuẩn bị đồ họa. Hãy mở game qua máy chủ HTTP theo assets/README.md.";
    loading.setAttribute("role", "alert");
    return;
  }
  const game = new Game(canvas, input, ui, save);
  game.camera.follow(game.player);
  game.startLoop();
  buttons.forEach(button => button.disabled = false);
  loading.textContent = window.gameArt.failed.length ? "Một số hình ảnh chưa tải được. Hãy tải lại trang." : "Sẵn sàng lên đường";

  // Expose for browser-console debugging during development.
  window.game = game;
});
