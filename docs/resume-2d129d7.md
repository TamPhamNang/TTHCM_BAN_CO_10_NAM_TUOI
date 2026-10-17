# Đối chiếu và tiếp tục từ 2d129d7

Ngày kiểm tra: 17/10/2026. Mốc lưu `2d129d7` — `Luu tien do chuong 1 va chuong 2`; thư mục làm việc sạch khi bắt đầu. Đã đối chiếu GDD, README, tài liệu kiến trúc/đồ họa, tập tin nạp trong index, các mô-đun gameplay, lưu game, atlas và kiểm thử. `js/game.js` và tài liệu Architecture v0.1 là prototype tham khảo, không phải luồng game đang nạp.

| Tình trạng tại mốc lưu | Hạng mục |
| --- | --- |
| Đã hoàn thành | Tên Hạt Muối Trường Kỳ; Chương 1 với tương tác nhận quà, vật phẩm theo nội thất, bố cục tàu/hành khách/ngồi, điều hướng liên tục, nhịp đi/đẩy bến thuyền 300/400 ms. |
| Đã hoàn thành | Times New Roman trên DOM/Canvas và ba SVG thay chữ mẫu trong ảnh UI; giữ PNG nguồn. |
| Đã chạy được, còn hoàn thiện | Màn 5–7: nhặt xương/dụ chó/gỡ dây, che/buộc bạt giữa bão, vẽ luồng/lấy vật liệu/ngụy trang; chuyển chương và lưu/khôi phục. |
| Còn dở | Mở tời chưa xóa dây chắn trong ảnh; tư thế hành động chưa dùng sheet Chương 2; bạt và ngụy trang đổi trạng thái tức thì; thiếu kiểm tra nhịp gió ở nhiều tốc độ cập nhật và hủy kéo/đa điểm. |
| Chưa thực hiện, ngoài phạm vi đợt này | Gameplay Chương 3–5. Ảnh Chương 3 đã nằm trong commit, giữ nguyên. |

Phần tiếp tục hoàn thiện được mô tả ở [Chương 2](chapter2.md). Chỉ bổ sung hoạt ảnh, sửa nhịp gió/con trỏ, mở rộng kiểm tra bản lưu và kiểm thử; không viết lại Chương 1, không reset/revert hay sửa lịch sử Git.

Kiểm tra hồi quy: `chapter1_browser.py`, `chapter1_animation.py`, `chapter1_layout.py`, `chapter2_browser.py`, `chapter2_dynamics.py`. Ảnh chụp màn và số đo thời gian là kiểm tra tại môi trường Chrome cục bộ; không cam kết tốc độ khung hình trên mọi thiết bị.

Kết quả sau triển khai: cả 5 bộ kiểm thử **PASS**, không có lỗi JavaScript trong trình duyệt. Nhịp bão sau 12 giây giống nhau ở 30/60/144 lần cập nhật: còn 28 giây, độ khô 94%, cùng hai dây bị lỏng; thuyền đi 100 đơn vị sau 1 giây, cảnh mở xích tiến 2 giây sau đúng 2 giây. Kiểm tra chơi xuyên màn đã tải lại giữa cảnh mở xích và phủ thuyền, thử thất bại/chơi lại, giữ font Times New Roman và kiểm tra bố cục 390 × 844 / 844 × 390. Đã kiểm tra trực quan [ảnh tổng hợp](chapter2-preview.jpg) và [hoạt ảnh](chapter2-animation-preview.webp).

Ảnh/hoạt ảnh xem trước Chương 1 và các PNG Chương 1, Chương 3 không thay đổi so với `2d129d7`. HEAD vẫn ở `2d129d7`; phần tiếp tục được lưu trong các tập tin làm việc, chưa tạo commit mới.
