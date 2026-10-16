# Bộ đồ họa

## Bản đang chạy · Hạt Muối Trường Kỳ

Game hiện nạp ảnh từ `assets/images/Chapter_1/` bằng `js/chapter-assets.js`:

- `can_cu.png`: nền căn cứ màn 1; vị trí vật phẩm và va chạm cấu hình trong `js/levels/chapter1.js`.
- `map_tro_truyen_dau_chuong.png`: nền phòng họp mở đầu có bản đồ, đèn dầu và bàn làm việc.
- `animation_nhan_vat_chinh.png`: các hàng idle, walk, run, interact, pickup, carry của Kiên.
- `nhan_vat_phu.png`: Bác Hồ, Nguyễn Lương Bằng, lính xét vé, bà cụ, diêm dân nam/nữ.
- `aos.png`, `giay_thong_hanh.png`, `la_ban.png`, `so_tay.png`, `tien.png`: vật phẩm trong cảnh và ba lô.
- `tui_do.png`, `khung_hoi_thoai.png`: ảnh tham chiếu giao diện; game dùng chữ HTML động để đọc được trên màn hình nhỏ.
- `toa_tau_hoa.png`, `lang_muoi.png`, `ben_thuyen.png`: nền màn 2–4.
- `xe_muoi_hong.png`, `xo_nuoc.png`, `ro_cam.png`, `thoi_vang.png`: xe cần sửa, gàu nước, thúng cam và vàng tương tác.
- `linh_canh.png`: sheet đứng, đi và kiểm tra giấy tờ của lính xét vé.
- `nhan_vat_chinh_cai_trang.png`: trang phục dân thường của Kiên trên tàu và tại làng muối; dùng lại một tư thế cho nhân vật phụ ở bến.

Game cũng nạp cả 4 bảng tổng hợp: `Bảng tài sản Chương 1 Việt Nam 1940s.png`, `Bộ asset Chương 1_ Hành trình Việt Nam.png`, `Bộ tài sản game Chương 1 Việt Nam 1945.png`, `Bộ tài sản game Chương 1 Việt Nam.png`. Tọa độ cắt nằm trong `js/chapter-atlas.js`. Các vùng bao muối, dụng cụ, vàng đơn, thùng gỗ, sàn, khung giấy, sổ tay và biểu tượng đã được đưa vào game. Hoạt ảnh chính dùng hình nguyên vẹn từ sheet gốc lớn, được tách và đăng ký điểm neo bởi `js/animation.js`; hình nhỏ trong bảng chỉ còn là tham chiếu hướng/tư thế. Xem thêm `docs/chapter1-art.md`.

Ảnh nguồn được giữ nguyên. Cắt nền và sprite diễn ra trong bộ nhớ Canvas. Cảnh tàu, ruộng muối, bến thuyền được vẽ bằng `js/chapter-scene.js` và ghép nhân vật từ bộ ảnh này. Chạy qua HTTP theo README ở thư mục gốc.

## Chương 2 và chữ Times New Roman

`js/levels/chapter2.js` khai báo ảnh nguồn trong `assets/images/Chapter_2/`: `tram_gac_ven_song.png`, `tran_cuong_phong.png`, `bai_lau_say.png`, xương, sào, bạt và sheet lính/chó. Hai bảng tổng hợp cung cấp thuyền, ca-nô, bùn, lá và bạt đã trải. Các vùng có nhãn/chữ mẫu được loại khỏi vùng cắt. Cảnh và cơ chế ở `js/river-scene.js`, `js/river-chapter.js`.

`assets/ui/pass-times.svg` thay giấy thông hành có chữ in sẵn; các dòng tiếng Việt dùng Times New Roman. `notebook-pages.svg` và `parchment.svg` cung cấp nền sạch cho sổ/khung giấy, mọi nội dung đặt bằng HTML/Canvas Times New Roman. Ảnh gốc được giữ nguyên, không còn dùng phần chữ sinh sẵn làm chữ giao diện.

## Ghi chép bộ ảnh prototype trước đây

Phần bên dưới mô tả bộ ảnh cũ và prototype `js/game.js`, không phải đường dẫn tài nguyên của Chương 1 hiện tại.

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
