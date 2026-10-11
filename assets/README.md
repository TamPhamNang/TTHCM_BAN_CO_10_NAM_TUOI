# Bộ đồ họa

Toàn bộ ảnh nằm trong `assets/images/`, gồm ảnh nhân vật, công trình, HUD, bản đồ
và ảnh xem trước. Video nằm trong `assets/video/`.

Các PNG gốc được giữ nguyên. `js/assets.js` tải ảnh, tách nền theo vùng nối với biên,
cắt sprite theo tọa độ riêng của từng hàng và lưu kết quả trong bộ nhớ trình duyệt.
Hai bảng animation là ảnh tham chiếu có khoảng cách không đều, không phải lưới sprite cố định.

- `animation.png`: nhân vật vận chuyển, đi/chạy, nhặt, mang, đặt hàng, bị thương và hồi phục.
- `animation2.png`: các hướng nhìn của NPC mang bộ đàm.
- Nhà, cổng, cờ, bảng thông tin, đèn, ghế, bao tải, thùng và bộ đàm: dùng trong cảnh M2–M5.
- Các ảnh HUD: lấy chân dung và biểu tượng; nội dung nhiệm vụ/hội thoại vẫn là chữ HTML động.
- `mini_map.png`: mẫu phong cách; bản đồ trong game được vẽ từ vị trí và vùng va chạm thực tế.

`js/scene.js` quản lý bố trí cảnh, nền đường/đất/cây, thứ tự vẽ theo độ sâu,
điểm mục tiêu và bản đồ nhỏ. Camera chỉ được áp dụng một lần ở `Game.render()`.

Bản đồ M2 được cấu hình tại `js/levels/level2.js`, theo bản tổng thể doanh trại:
kho phía tây bắc, Đơn vị phía bắc trung tâm, sinh hoạt/quân sự phía đông bắc,
bếp/nghỉ phía đông nam, liên lạc/hậu cần phía tây nam, sân giữa và cổng chính phía nam.
Chòi gác nằm bên phải cổng. Điểm xuất phát ở khu sinh hoạt; cán bộ đứng trước nhà Đơn vị.
Vị trí công trình, đường đi, vùng va chạm và bản đồ nhỏ dùng chung cấu hình này.
Nền địa hình M2 sử dụng `assets/images/map_M2.png`, ánh xạ vào thế giới 1200 × 700.
Ảnh nền mới đã có cây, đường đất, hàng rào, cổng đóng và chòi gác; game thêm các công trình
và nhân vật. Vùng va chạm của hàng rào/cổng/chòi gác được cấu hình theo ảnh, không vẽ chồng lại.
Ảnh nền được tải với phiên bản `M2_MAP.revision` để tránh dùng ảnh cũ trong cache trình duyệt.
Minimap dùng cùng ảnh nền. Các đường cấu hình chỉ phục vụ nền dự phòng khi ảnh không tải được.

Bảng vận chuyển có chuỗi đi/chạy nhìn ngang. Khi di chuyển lên/xuống, game dùng
tư thế trước/sau cùng chuyển động nhún; chưa có chuỗi đi/chạy đủ bốn hướng trong bộ ảnh gốc.

Chạy qua HTTP để trình duyệt cho phép đọc pixel Canvas:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Mở `http://127.0.0.1:8765`. WASD: di chuyển; Shift: chạy; Q: né;
Space: tương tác / tiếp tục hội thoại; Esc: tạm dừng; F3: xem vùng va chạm.
