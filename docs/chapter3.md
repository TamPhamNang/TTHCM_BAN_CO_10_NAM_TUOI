# Chương 3 · Xuyên rừng mùa thu

Triển khai màn 8–11 theo phần kịch bản chi tiết trong GDD, tháng 8 đến cuối tháng 10/1946. Đọc hết nhật ký Màn 7 sẽ tự chuyển sang Chương 3; menu có lối vào trực tiếp. Chương 1–2 và tiến trình đang lưu được giữ lại. Đọc hết nhật ký Chương 3 sẽ tự sang [Chương 4](chapter4.md), màn 12–14. Chương 5 đã có gameplay màn 15.

| Màn | Gameplay | Hoạt ảnh và hiệu ứng |
| --- | --- | --- |
| 8 · Chia muối lên đường | Chia/hoàn trả từng bao, giới hạn sức chở, kiểm tra đủ 9 bao. | Bao bay từ kho tới phương tiện, đoàn xuất phát dần vào đường rừng. |
| 9 · Đẩy xe lên đèo | E/Space theo nhịp, giới hạn nhấn dồn, xe trượt và chọn đá gần để chèn trong 3 giây, thất bại/thử lại. | Chân Kiên chuyển liên tục dưới thân áo, xe giữ hình cứng, tiến/lùi theo đường đèo, đá sáng khi dùng được. |
| 10 · Đêm trong rừng vắng | Soi vùng sáng nhỏ, so hình lá trong sổ, chọn cây đúng/sai; lấy củi/đá, nhóm bếp ba nhịp, nấu nước lá và mang tới bác Hai. | Mặt nạ tối có vùng sáng động, ánh lửa, tia lửa, hơi nước và chuyển nước lá tới lán. |
| 11 · Bóng chim sắt | Thổi còi, chọn ba nhóm và ba chỗ núp; cả đoàn phải tới trong 5 giây. Chờ máy bay qua, ra hiệu đi tiếp; lặp một lượt tuần tra. | Tư thế thổi còi/chạy/nằm thấp, nhóm di chuyển vào tán cây, phủ cành lá, bóng máy bay quét trên đường, tiếng còi ngắn khi trình duyệt cho phép âm thanh. |

## Quyết định theo GDD

Phần mô tả ngắn và phần kịch bản chi tiết có khác nhau ở số bao quang gánh và người bị sốt. Bài toán dùng ngựa 4, xe 2, chú dân công 2, chị dân công 1: kết hợp các sức chở được nêu trong hai phần, giữ tổng 9 bao đại diện. Màn 10 theo kịch bản chi tiết: bác Hai dân công được Kiên chăm sóc. Nội dung nhận dạng cây/nấu nước lá là hành động cốt truyện, không có công thức hay liều dùng ngoài đời.

Chu kỳ trượt 5,5 giây, cửa sổ chèn 3 giây, thời gian nấu 6 giây và hai lượt tuần tra là thông số gameplay. Nhấn đẩy cách dưới 0,32 giây không tăng lực; khoảng **0,35–1,6 giây** cho nhịp tốt. Thanh nhịp nằm ngay trên nút Đẩy, trở về đầu sau mỗi lần đẩy được chấp nhận, có vùng xanh rộng và hướng dẫn chờ/nhấn. Lần đầu có đủ lực; nhấn muộn vẫn có lực. Trần vận tốc 0,12 và lực 0,08/0,06 giúp nhịp chậm hơn qua được màn trước khi dùng hết đá; giữ khả năng đọc bản lưu cũ. Chuyển động xe dùng tích phân suy giảm vận tốc; đồng hồ trượt và báo động tiêu hết phần thời gian dư qua các mốc, không cộng thời gian di chuyển sau hạn nấp.

## Ảnh nguồn và font

`js/levels/chapter3.js` khai báo nguồn và các vùng cắt; `js/chapter-assets.js` nạp ảnh trong `assets/images/chapter_3/`. Bốn nền độc lập, ngựa/xe/quang gánh/cây, sheet dân công và sheet Kiên đã có sẵn được sử dụng trực tiếp. Sheet có alpha nên giữ cạnh lá và trang phục, không tẩy nền lại hoặc ghi đè PNG. Dùng một tư thế nguyên vẹn cho mỗi thao tác và nội suy chuyển động thay vì lật nhanh các hình có tỷ lệ khác nhau. Bác Hai ngồi trong lán dùng tư thế nông dân ngồi từ bảng tàu Chương 1.

Bảng UI chia tải được nạp làm tham chiếu; giao diện phân bổ dùng hình phương tiện và chữ HTML để cùng sử dụng Times New Roman. Không đưa chữ mẫu trong bảng vào phần chơi. Tất cả nhãn Canvas, nút, đối thoại và sổ vẫn dùng Times New Roman.

Vùng đá đánh lửa có đường viền cắt riêng để loại phần củi/nồi liền kề trong ảnh bộ bếp. Bát nước lá và bóng máy bay dùng nét Canvas, không chứa chữ nhúng; lúc phục vụ, Kiên cầm bát thay cho tư thế mang bao muối.

## Lưu và điều khiển

Bổ sung trường `forest`, giữ phiên bản/khóa lưu v2. Bản lưu Chương 1–2 không cần trường mới. `ForestChapter.valid` kiểm tra sức chở, tiến độ/đá chèn, nguyên liệu/giai đoạn bếp, chỗ núp không trùng và các đồng hồ. Lưu được giữa lúc đoàn xuất phát, xe bị trượt, đang nấu/chăm sóc, nhóm đang di chuyển hoặc máy bay đang qua. Thời gian đóng băng khi mở sổ/ba lô, tạm dừng và khi mất focus.

Màn 8: nút +/− và Kiểm tra · Lên đường. Màn 9: E/Space đẩy, C hoặc chạm đá sáng để chèn. Màn 10: chuột/chạm soi đèn, đi tới bằng cần 360°/WASD/chọn điểm; E tương tác, H xem hình cây. Màn 11: E còi/đi tiếp, Q/chạm nhóm để chọn, C/chạm chỗ núp để ra hiệu.

## Kiểm thử và bản xem

- `python tests/chapter3_browser.py`: chơi qua bốn màn bằng UI và cập nhật thời gian thực, có nhánh sai/thất bại, tải lại giữa giai đoạn, tạm dừng và kiểm tra màn hình 390 × 844 / 844 × 390.
- `python tests/chapter3_dynamics.py`: xe, trượt, xuất phát và báo động ở 30/60/144 lần cập nhật/giây; không nhận lệnh núp muộn; giữ trạng thái khi tạm dừng; dữ liệu lưu sai; phím và con trỏ.
- `python tests/stage_6_7_9_fixes.py`: bạt Màn 6 thực sự phủ lên vùng hàng, lấy mẫu chống sào ở 24 FPS và đo nhịp trình duyệt, chơi qua Màn 9 với nhịp 0,55 / 1 / 1,5 giây, không cộng lực khi nhấn dồn, căn lực bám lần nhấn, nhấn muộn/tạm dừng/lưu game và thanh nhịp trên điện thoại.
- Chạy lại ba bộ `chapter1_*` và hai bộ `chapter2_*` để kiểm tra hồi quy. Chương 2 tự nối Chương 3 sau khi đọc hết nhật ký.
- `python tests/capture_chapter3_preview.py --animate`: xuất [ảnh tổng hợp](chapter3-preview.jpg) và [hoạt ảnh từ bộ vẽ runtime](chapter3-animation-preview.webp). Bản xem hoạt ảnh 25 khung hình/giây; tốc độ game theo thời gian thực của trình duyệt.

Kết quả tại môi trường Chrome cục bộ ngày 17/10/2026: cả **7 bộ kiểm thử** (3 Chương 1, 2 Chương 2, 2 Chương 3) đều **PASS**, không ghi nhận lỗi JavaScript. Đã xem ảnh màn chơi, phục vụ nước lá, bố cục dọc/ngang và khung hình trong bản xem hoạt ảnh. `git diff --check` đạt; các PNG nguồn Chương 1/3 và bản xem Chương 1 không thay đổi. Thay đổi Chương 2 đang có trước khi bắt đầu được giữ lại. HEAD vẫn ở `2d129d7`, chưa tạo commit mới.
