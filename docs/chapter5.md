# Chương 5 · Chung cuộc — Đêm lịch sử

Màn 15, **Bữa cơm có muối**, diễn ra trong lán bếp chiến khu đêm 19/12/1946. Nối tự động sau khi đọc hết nhật ký Chương 4 hoặc vào trực tiếp bằng nút Chơi Chương 5 ở menu.

Lấy giỏ rau rừng và cá suối anh nuôi đã chuẩn bị → mang tới nồi → lấy muỗng → xúc muối Văn Lý → rắc vào nồi → chờ 6 giây → mời bộ đội dùng bữa. Giỏ rau/cá là một ảnh ghép sẵn, vì vậy gameplay dùng thao tác lấy chung nguyên liệu; không tách ảnh thành hai vật phẩm giả. Chọn sai bước chỉ nhắc lại mục tiêu. Không giới hạn thời gian.

Đoạn kết có bộ đội dùng bữa, bác Bằng báo cáo, Bác Hồ tới thăm và trao huy hiệu ngôi sao. Sau hội thoại tự chuyển tới toàn văn nhật ký số 5. Trang này kết thúc hành trình và mở lại được ở kho nhật ký.

## Mã và ảnh

- `js/levels/chapter5.js`: nội dung, bố trí, vật phẩm và tên ảnh.
- `js/supper-chapter.js`: thứ tự nhiệm vụ, thời gian nấu, lưu/khôi phục và đoạn kết.
- `js/supper-scene.js`: nền trăng/ánh lửa, nhân vật, hơi nước, rắc muối và huy hiệu.
- `js/chapter-assets.js`: nạp 9 ảnh từ thư mục bộ tài sản mới, không ghi đè nguồn.

Đã kiểm tra alpha và xem trực quan hai sheet: mỗi sheet có **24 khung (6 cột × 4 hàng)**; nhãn 30 FPS trong tên gốc không phải số khung. Ranh giới cắt dùng các khoảng trong suốt thực tế, giữ canvas neo chung cho mỗi khung. Hơi nước phát 12 FPS; rắc muối dùng 24 khung trong 1,6 giây. Chữ giao diện luôn dùng Times New Roman, không dùng chữ mẫu trong bảng UI.

Giữ phiên bản/khóa lưu v2, bổ sung `supper` chỉ bắt buộc cho màn 15. Bản lưu Chương 1–4 vẫn hợp lệ. Lưu được khi cầm thìa muối, đang nấu hoặc đang xem đoạn kết; tải lại đoạn kết phát hội thoại từ đầu. Nấu canh dừng khi mở sổ, ba lô, tạm dừng hoặc mất focus.

## Kiểm tra

Cập nhật bố cục 24/10/2026: giỏ và muỗng đặt trên bàn bếp, bao muối cạnh kho; dùng nồi có sẵn trong nền để tránh chồng hai bếp. UI dùng màu gỗ và ánh đèn dịu, ẩn bản đồ nhỏ, chỉ đánh dấu mục tiêu hiện tại. Giữ nguyên nền lán khi dùng bữa và phủ ánh sáng ấm để bố cục vật cản không đổi. Bếp, bàn, thùng, kho muối và các chồng củi có vùng va chạm theo chân vật thể; điểm đứng tương tác tách khỏi vị trí ảnh. Bản lưu cũ nằm trong vật cản được đưa về điểm xuất phát an toàn.

`python tests/chapter5_layout.py` kiểm tra va chạm khi đi bằng bàn phím, bấm trực tiếp vào ảnh trên bàn, toàn bộ đường đi tới các trạm và khôi phục bản lưu cũ. Ảnh bố cục: `docs/chapter5-preview.png`.

Tỉ lệ nhân vật M15: Kiên phóng 1,65 lần quanh chân; người lớn cao 143–160 px để cân với bàn bếp. Muỗng cầm rộng 19 px, neo ở đầu cán vào tay, đổi bên theo hướng và dao động nhẹ theo bước chân; bỏ muỗng lớn nổi riêng trên nồi. Huy hiệu đặt lại theo vị trí ngực mới.

`python tests/chapter5_browser.py` kiểm tra thứ tự nhiệm vụ, tương tác bằng con trỏ và đường đi thực, tự chuyển mọi màn/chương, tải lại giữa chuyển cảnh/nấu/đoạn kết, tạm dừng, bản lưu sai/cũ, nhật ký số 5, kho đọc lại, bố cục 390×844 và 844×390, lỗi JavaScript/HTTP. Các bộ browser cũ dùng `tests/transition_helpers.py` để đi theo luồng tự chuyển mới.

Kết quả ngày 23/10/2026: toàn bộ 13 bộ kiểm thử đạt. Đã xem ảnh màn chơi, đoạn kết và nhật ký trên máy tính/điện thoại. `git diff --check` đạt.
