# Tỉ lệ nhân vật và điều khiển cảm ứng

Ngày cập nhật: 24/10/2026.

`js/actor-layout.js` tập trung tỉ lệ của Kiên, nhân vật phụ, nhóm dân công và hàng chuyền muối theo phối cảnh từng màn M1–M15. Sprite đi lại, tư thế hành động và ảnh nhân vật ghép dùng cùng hồ sơ màn. Phóng quanh bàn chân; tọa độ di chuyển, đường đi và vùng va chạm giữ nguyên. M2 giữ bố trí ngồi/đứng riêng của toa tàu; M4 vừa ô đẩy bao; M15 giữ Kiên 1,65 lần và muỗng nhỏ neo vào tay. Các tư thế la bàn, chặt dây leo và mang tre ở M12–M13 có cùng chiều cao tham chiếu với tư thế đứng.

Ảnh rà soát: [15 màn](characters-preview.jpg), [các tư thế hành động](characters-actions.jpg).

`js/mobile-controls.js` nhận thiết bị có cảm ứng, con trỏ coarse hoặc khung điện thoại giả lập (rộng tối đa 767 px khi dọc; tối đa 1024×600 khi ngang). Khung responsive không bật mô phỏng cảm ứng vẫn được nhận diện lại mỗi lần đổi kích thước. Ở chiều dọc, lớp nhắc xoay ngang che trò chơi, chặn thao tác và dừng đồng hồ, hoạt ảnh, chuyển màn cùng thời gian đọc nhật ký. CSS hiện hướng dẫn ngay trước khi ảnh và JavaScript tải xong. Xoay ngang để tiếp tục đúng trạng thái; không thay đổi bản lưu. Khi xoay máy, cần di chuyển, nút chạy và thao tác kéo được hủy để tránh kẹt điều khiển.

Ở chiều ngang, cần 360° ở bên trái; các nút thao tác cảm ứng ở bên phải thay đổi theo màn và giai đoạn. Giữ nút Chạy đồng thời với cần bằng hai ngón. M4 có phím hướng, Ngồi thấp, Lùi bước và Xếp lại; M5 đi thấp; M6 chọn bạt; M8 chia bao và Lên đường; M9 Đẩy xe/Chèn đá; M11 Thổi còi, Đổi nhóm và Nấp; M12–M13 La bàn/Phát quang hoặc tới sạp; M14 Đón/Chuyền bao. Chạm đồ vật, kéo bạt, vẽ đường thuyền, chọn vật phẩm trong ba lô và chọn bước lắp sạp vẫn dùng trực tiếp trên màn hình. Ba lô, Sổ tay và Tạm dừng đặt phía trên. Nút chính tối thiểu 44 px; CSS tính vùng an toàn của thiết bị.

Ảnh giao diện: [nhắc xoay ngang](mobile-rotate.png), [đẩy xe](mobile-m9.png), [lán bếp](mobile-m15.png).

Kiểm tra bằng Chromium/Playwright:

- `python tests/mobile_controls.py`: cảm ứng M1–M15, đóng băng ở chiều dọc, các nút theo màn, chia đủ 9 bao, hai ngón di chuyển/chạy, hủy thao tác khi xoay, điện thoại 568×320 đến 896×414 và máy tính bảng 1024×768/1024×1366, giao diện desktop độc lập.
- `python tests/capture_actor_sizes.py`: xuất ảnh toàn bộ màn và các tư thế đặc thù để kiểm tra trực quan.
- Các bộ `chapter1_browser.py` đến `chapter5_browser.py`: hồi quy luồng chơi, lưu/tải, tương tác, hoạt ảnh và giao diện.
