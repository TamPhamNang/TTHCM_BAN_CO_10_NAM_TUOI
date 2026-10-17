# Nhật ký hành trình của Kiên

Nội dung gốc của cả năm trang nằm trong [chapter-diaries-content.js](../js/chapter-diaries-content.js). Mỗi trang gồm số chương, tiêu đề, ngày viết, nơi viết và các đoạn kể. Giữ nguyên nội dung người dùng cung cấp, chỉ bỏ ký hiệu Markdown/escape do sao chép. Lời kể Chương 3 giữ tên bác Lương Bằng theo bản nhật ký được yêu cầu; gameplay màn 10 vẫn theo kịch bản chi tiết của GDD hiện có.

## Đã tích hợp

- Kết thúc màn 4: tự mở trang nhật ký số 1, tháng 3/1946, bến Văn Lý.
- Kết thúc màn 7: tự mở trang nhật ký số 2, tháng 7/1946, ngã ba sông Hạc.
- Kết thúc màn 11: tự mở trang nhật ký số 3, tháng 10/1946, đường lên Việt Bắc.
- Kết thúc màn 14: tự mở trang nhật ký số 4, tháng 12/1946, kho muối Việt Bắc.
- Trang 5 đã lưu đầy đủ nội dung trong mã nguồn, chờ triển khai gameplay tương ứng.

Nhật ký xuất hiện khi hoàn tất cả chương. Các màn trung gian vẫn giữ luồng tổng kết và chuyển màn. Người chơi cuộn đọc toàn văn rồi chọn tiếp tục, về menu hoặc chơi lại. Chương 3 có nút đi tiếp sang Chương 4; Chương 4 chưa có nút đi sang Chương 5. Không có thời gian đếm ngược khi đọc và không tự chuyển chương.

Ở menu chính, **Nhật ký hành trình** cho phép đọc lại trang của chương đã hoàn thành. Các trang chưa mở bị khóa. Đọc/chọn trang/đóng kho nhật ký không sửa bản lưu, vật phẩm hoặc màn đang chơi. Nếu trình duyệt không cho lưu, vẫn đọc lại được các chương vừa hoàn tất trong phiên hiện tại.

## Hình ảnh và chữ

Sử dụng nguyên các ảnh người dùng thêm vào dự án:

- `assets/images/Chapter_1/nhat_ky_cuoi_chuong1.png`
- `assets/images/Chapter_2/nhat_ky_cuoi_chuong2.png`
- `assets/images/chapter_3/nhat_ky_cuoi_chuong3.png`
- `assets/images/chapter_4/truyen_ket_chuong4.png`

Chữ là HTML dùng Times New Roman, hiển thị trực tiếp trên vùng giấy trống ở giữa ảnh nền, không có lớp nền trắng hoặc viền khung nội dung. Vùng văn bản cuộn độc lập, nút cuối trang luôn nằm ngoài vùng cuộn. Bàn phím hỗ trợ Tab, mũi tên, Page Up/Down, Home/End, Space; Esc đóng kho nhật ký. Dữ liệu lưu v2 không đổi, bản lưu đã hoàn tất chương sẽ mở đúng trang khi chọn **Tiếp tục**.

## Kiểm thử

Chạy máy chủ HTTP rồi chạy `python tests/chapter_diaries_browser.py`. Kiểm tra đủ năm nội dung, toàn văn hiển thị ở ba chương, tải ảnh, tạm ngưng nhiệm vụ khi đọc, tiếp tục/tải lại, khóa trang, đọc lại không đổi localStorage, focus/bàn phím và màn hình 390×844, 844×390. Ảnh kiểm tra ghi vào thư mục tạm của hệ điều hành.
