# Hạt Muối Trường Kỳ

Game web phiêu lưu giải đố 6+, chuyển thể theo [GDD.md](GDD.md). Người chơi vào vai Kiên, cậu lính trẻ trong đội công tác của đồng chí Nguyễn Lương Bằng.

## Chạy game

Tại thư mục dự án:

```sh
python -m http.server 8000
```

Mở `http://localhost:8000`. Dùng HTTP để trình duyệt xử lý ảnh Canvas và lưu game đúng cách. Game không cần Bootstrap CDN, npm hay bước build.

## Chương 1 · Mật lệnh mùa đông

1. **Nhiệm vụ đầu tiên**: xem mở đầu, điều khiển Kiên đến gần Bác Hồ, tương tác để nhận riêng la bàn và sổ tay rồi cảm ơn Bác; tìm áo nông dân, giấy thông hành, túi vàng; gặp bác Bằng để lên tàu.
2. **Qua mắt lính xét vé**: trong 45 giây chơi, chọn/kéo 3 thỏi vàng vào thúng cam, ngồi yên, chọn giấy thông hành từ ba lô.
3. **Thuyết phục đồng bào**: tìm dụng cụ sửa xe; lấy gàu, múc nước giếng, mang cho bà con; sau đó thỏa thuận gom muối.
4. **Đêm bốc vác bí mật**: giải Sokoban 3 bao muối; ngồi thấp khi đèn quét; có lùi bước và xếp lại. Kết thúc tại màn tổng kết Chương 1.

Chương 2–5 (màn 5–15) chưa triển khai. Thông số 45 giây, chu kỳ đèn và số bao đại diện là lựa chọn gameplay cho bản này; không phải số lượng mô phỏng toàn bộ chiến dịch. Hội thoại được rút gọn/chuyển thể từ GDD.

## Điều khiển

- Chạm/nhấp đồ vật hoặc nhân vật: Kiên tự tìm đường và tương tác. Chạm nền để đi tới.
- Kéo cần tròn 360° ở góc trái hoặc dùng cần analog tay cầm: đi theo góc và tốc độ kéo. Thả cần để dừng. Điểm đến bằng chuột giữ tọa độ tự do, đường đi vòng qua vật cản.
- WASD / mũi tên: di chuyển. Shift: đi nhanh. E / Space: tương tác và tiếp hội thoại.
- I: ba lô. H: sổ tay gợi ý. Esc: đóng sổ / tạm dừng.
- Bến thuyền: WASD / mũi tên, nút hướng hoặc chạm ô kề Kiên. C: ngồi thấp/đứng lên, Z: lùi bước, R: xếp lại.
- Nhịp bến thuyền: đi một ô trong 0,30 giây, đẩy bao trong 0,40 giây. Giữ phím để đi liên tục; nhấp nhanh không bỏ qua hoạt ảnh của bước đang thực hiện.
- Thời gian dừng trong hội thoại, ba lô, sổ tay, menu tạm dừng và khi trang mất focus.

## Lưu game và mã nguồn

Tiến trình được lưu mỗi giây và sau các tương tác: vật phẩm, việc đã giúp bà con, thời gian tàu, vị trí, bao muối, lịch sử lùi bước, màn hoàn thành. Nút **Tiếp tục** phục hồi tiến trình. **Bắt đầu** / **Chơi lại Chương 1** đặt lại bản lưu của game này. Bản lưu prototype cũ được giữ ở khóa riêng, không chuyển sang cốt truyện mới.

- `js/levels/chapter1.js`: cốt truyện, vật phẩm, cấu hình 4 màn, mô hình Sokoban.
- `js/chapter-game.js`: luồng Chương 1, nhiệm vụ, ba lô, tìm đường, lưu/phục hồi.
- `js/chapter-assets.js`: nạp bộ ảnh hiện có trong `assets/images/Chapter_1/`, tách nhân vật và vật phẩm từ sheet trong bộ nhớ; giữ nguyên ảnh nguồn.
- `js/animation.js`: tách từng hình nguyên vẹn theo vùng liên thông trong hàng, đăng ký điểm neo thân/chân, giữ tỷ lệ chung và lưu bitmap ở độ phân giải hiển thị.
- `js/chapter-atlas.js`: tên 5 bảng tài sản và tọa độ cắt từng vùng; `css/chapter-art.css`: giao diện dùng khung giấy, biểu tượng và sổ tay từ bảng.
- `js/chapter-scene.js`: cảnh mở đầu, tàu, ruộng muối, bến thuyền; dùng nền căn cứ, nhân vật và vật phẩm từ bộ ảnh Chương 1.
- `js/game.js`: prototype trước đây, được giữ để tham khảo, không còn được nạp trong `index.html`.
- `Architecture v0.1.md`: tài liệu kiến trúc prototype trước GDD hiện tại, giữ nguyên để tham khảo.

Mở đầu là cảnh Canvas có hội thoại, di chuyển và nhận quà bằng tương tác; quà bay từ Bác đến Kiên trước khi vào ba lô. Tiến trình lưu riêng từng món đã nhận, có thể tiếp tục giữa cảnh. Chưa có phim/giọng đọc thu sẵn. Khi trình duyệt chặn lưu trữ, game vẫn chạy và hiển thị trạng thái không lưu được.

## Kiểm thử

Khi máy chủ HTTP đang chạy, dùng `python tests/chapter1_browser.py` (cần Python Playwright và Chrome; có thể đặt `GAME_URL`, `CHROME_PATH`). Kiểm thử đi xuyên 4 màn, điều kiện vật phẩm, chọn/kéo vàng, tạm dừng/hết giờ, đưa sai giấy tờ, đèn quét, lùi bước, lưu/tải lại từng giai đoạn và bố cục màn hình nhỏ. Ảnh kiểm tra được ghi vào thư mục tạm của hệ điều hành.

Kiểm tra đồ họa còn xác nhận đủ 5 bảng nguồn, các vùng atlas, sprite đi từ các bảng gốc lớn còn nguyên thân người và trang phục đúng theo màn. [Ghi chú đồ họa Chương 1](docs/chapter1-art.md) mô tả nguồn và cách sử dụng.

`python tests/chapter1_layout.py` kiểm tra vị trí nhặt trên nội thất, đường tiếp cận cả ba vật phẩm, bà lão và 5 hành khách từ bảng tàu mùa đông, vùng thả vàng, chuyển động tới ghế/ngồi xuống, tạm dừng và tải lại tư thế ngồi. Ảnh dựng hai màn được xuất vào thư mục tạm của hệ điều hành để kiểm tra bố cục.

`python tests/chapter1_animation.py` kiểm tra chuyển động ở 30/60/144 lần cập nhật mỗi giây, 24 góc analog, điểm đến không bị ép vào ô, tránh góc vật cản, bước chân liên tục, nội suy người/bao muối, tạm dừng, tỷ lệ/điểm neo chung và số thay đổi HUD khi đứng yên. Kiểm thử trình duyệt còn kéo/thả cần bằng con trỏ, nhận từng món quà, tải lại giữa hai món và tạm dừng lúc trao quà. Kết quả thời gian khung hình chỉ là số đo ở môi trường kiểm thử, không phải cam kết FPS trên mọi thiết bị.

`python tests/capture_chapter1_animation.py` tạo [vòng xem hoạt ảnh](docs/chapter1-animation-preview.gif) bằng chính bộ vẽ runtime, để xem động thay vì chỉ kiểm tra ảnh tĩnh.
