# Đồ họa Chương 1

Nguồn ảnh trong `assets/images/Chapter_1/` được giữ nguyên. Game cắt và tách nền bằng Canvas trong bộ nhớ, không xuất đè các PNG nguồn. `js/chapter-atlas.js` khai báo tên bảng, vùng `[x, y, width, height]` theo đúng kích thước gốc, chế độ giữ nền và ngưỡng tách nền riêng cho vùng cần thiết.

## Bảng nguồn

| Bảng | Phần sử dụng |
| --- | --- |
| Bảng tài sản Chương 1 Việt Nam 1940s.png | Dây thừng, ô vật phẩm, chân dung Bác, sổ gợi ý mở hai trang. |
| Bộ asset Chương 1_ Hành trình Việt Nam.png | Căn phòng mở đầu, dụng cụ, một thỏi vàng, bao muối, thùng gỗ, xe đã sửa, đèn, đồng hồ, biểu tượng ba lô/sổ tay/la bàn. |
| Bộ tài sản game Chương 1 Việt Nam 1945.png | Ván sàn, bản đồ nhiệm vụ, giấy thoại trống, biểu tượng tạm dừng. |
| Bộ tài sản game Chương 1 Việt Nam.png | Tham chiếu hướng đi, ngồi thấp và đẩy; các hình nhỏ không còn bị phóng lớn làm hoạt ảnh chính. |
| Bảng Tài Sản Chuyến Tàu Mùa Đông.png | Bà lão ngồi và 5 hành khách: người đội mũ phớt, người mẹ bế em bé, nông dân, thương nhân và hành khách nữ. |

Các nền độc lập `can_cu.png`, `toa_tau_hoa.png`, `lang_muoi.png`, `ben_thuyen.png` vẫn cung cấp ảnh độ phân giải cao cho bốn màn. `map_tro_truyen_dau_chuong.png` cung cấp nền phòng họp mở đầu; vùng phòng nhỏ trong bảng là nguồn dự phòng. Các sheet `nhan_vat_phu.png`, `linh_canh.png`, `animation_nhan_vat_chinh.png` và `nhan_vat_chinh_cai_trang.png` cung cấp các nhân vật và hành động còn lại.

## Thay đổi hiển thị

- Màn 1 đặt áo nằm trên giường nghỉ, giấy thông hành nằm phẳng trên bàn trà và túi vàng trên hòm kho. `art` khai báo vị trí/tỷ lệ mặt đồ vật riêng với tọa độ tiếp cận; vùng nhấp theo hình vẽ, Kiên dừng ở mép nội thất để nhặt. Các ảnh nguồn và đồ đã nhặt trong bản lưu được giữ nguyên.
- Màn 2 căn chân bà lão với sàn dưới ghế, giỏ cam ở cạnh chân; hành khách ngồi ở dãy sau và dãy trước, vẽ theo lớp để giữ chiều sâu. `CHAPTER_ONE.trainLayout` dùng chung cho vẽ, vùng thả vàng, nút ngồi và vị trí nhân vật.
- Kiên đi tới ghế rồi ngồi xuống trong một giây. Tư thế cuối dùng ảnh riêng có nền trong suốt, tạo bằng imagegen tích hợp từ ảnh Kiên cải trang; [nguồn, đường dẫn và prompt](kien-seated-asset.md). Tạm dừng đóng băng chuyển động; tải lại giữ tư thế đã ngồi. Lính bắt đầu hỏi giấy sau khi Kiên ngồi xong.
- Mở đầu dùng tranh căn phòng riêng. Sau hội thoại, người chơi điều khiển Kiên đến gặp Bác, nhận riêng từng món quà và cảm ơn Bác. Có mục tiêu, nút tương tác và trạng thái hai món đã nhận; quà di chuyển từ Bác tới Kiên. HUD được ẩn khi đang đọc hội thoại mở đầu.
- Kiên dùng hình nguyên vẹn từ sheet gốc lớn. Các vùng trong hàng được tách theo hình thay cho chia cột đều; cả trang phục dùng một tỷ lệ và điểm neo chung. Trên tàu và ở làng muối, Kiên mặc đồ cải trang; tại bến đêm sử dụng lại trang phục lính cùng tư thế đẩy/ngồi thấp từ sheet lớn.
- Lính xét vé dùng chuỗi đi riêng và tư thế kiểm tra khi Kiên đưa giấy. Dụng cụ sửa xe và vàng dùng hình cắt từ bảng; xe sau khi sửa có hình xe nguyên vẹn.
- Bến thuyền dùng sàn ván và các thùng gỗ bao quanh, bao muối có hình riêng, vùng đích buộc dây và ánh đèn quét. Tọa độ ô, chỗ đẩy và điều kiện thắng giữ nguyên.
- Khung thoại, thông báo, sổ tay, ô vật phẩm và thanh công cụ dùng phần ảnh trong bảng; chữ nhiệm vụ/hội thoại/gợi ý vẫn là HTML. Phần chữ ví dụ in sẵn trên trang gợi ý được che trước khi đặt chữ động.
- Nền mờ ngoài khung cảnh trên màn hình dọc được tạo một lần cho mỗi màn/kích thước, tránh tính hiệu ứng mờ lại trong từng frame.

## Lưu ý cắt ảnh

Các bảng là ảnh minh họa có nhãn và khoảng cách không đều, không phải sprite atlas có lưới xuất sẵn. Các vùng cắt cần được kiểm tra bằng mắt khi thay ảnh nguồn. Không dùng một ngưỡng xóa nền cho mọi ảnh: quần áo màu xanh đậm gần màu nền có thể bị xóa nhầm; biểu tượng tạm dừng có hai vạch rời cần giữ nhiều thành phần. Giấy thoại phải lấy vùng trống để không chồng tên/lời thoại ví dụ lên chữ động.

## Nhịp hoạt ảnh và độ nét

`js/animation.js` tách các hình đầy đủ trong từng hàng ở kích thước nguồn, sau đó đặt chúng trên canvas chung với điểm neo thân/chân và hệ số tỷ lệ cố định. Không kéo từng hình lên cùng chiều cao: tư thế cúi sẽ thấp xuống tự nhiên, không bị phóng lớn cả đầu/thân. Bitmap hiển thị được chuẩn bị theo DPR và tỷ lệ khung cảnh, lưu đệm và đặt trên pixel vật lý nguyên để tránh mặt nhân vật luân phiên nét/mờ theo tọa độ lẻ; không phóng các mẫu 37 × 61 px từ bảng tổng hợp thành hoạt ảnh chính nữa.

Các hình trong hàng đi ngang phần lớn lặp cùng một thế chân với tỷ lệ đầu/thân khác nhau, không tạo thành chu kỳ bước đều. Kiên hiện dùng một tư thế gốc lớn cho mỗi góc nhìn trước/sau/nghiêng, chuyển động khớp hông và gối cùng nhịp thân được tính liên tục mỗi lần vẽ. Áp dụng cho cả trang phục lính và cải trang; biên cắt có phần chồng dưới áo và ở gối. Không trộn mờ các ảnh để tránh bóng đôi. Nhịp bước theo quãng đường thực sự đi được, không đặt lại pha khi dừng. Độ lớn bước chuyển theo góc hướng di chuyển. Đây là hoạt ảnh ghép khớp từ ảnh 2D, nguồn chưa có bộ hình nhân vật xoay đủ 360°.

Điều khiển analog nhận vector liên tục 360°, có vùng chết và tốc độ theo độ kéo. Chuột/chạm chọn điểm đến chính xác, tìm đường qua các góc vật cản đã nới theo kích thước Kiên; không chia lưới đường đi. Mỗi lần cập nhật tiêu hết quãng đường, kể cả khi qua điểm rẽ. Phím WASD/mũi tên có các tổ hợp hướng của bàn phím. Ở bến, đi bộ mất 300 ms mỗi ô và đẩy bao mất 400 ms mỗi ô, cấu hình tại `CHAPTER_ONE.levels[4].movement`. Phần thời gian dư được giữ lại khi giữ phím; nhấp/chạm liên tục không ngắt bước đang chạy để tăng tốc. Vị trí và luật Sokoban vẫn dùng ô nguyên. HUD chỉ thay đổi khi dữ liệu đổi, nền tĩnh và sprite được lưu đệm theo kích thước hiển thị.

Kiểm thử: `python tests/chapter1_browser.py` xác nhận luồng chơi 4 màn và bố cục nhỏ. `python tests/chapter1_animation.py` kiểm tra tính đều của chuyển động ở 30/60/144 lần cập nhật mỗi giây, nội suy người/bao muối, tạm dừng, điểm neo/tỷ lệ và HUD. Số đo thời gian khung hình là kết quả cục bộ, không phải cam kết FPS. [Vòng xem hoạt ảnh](chapter1-animation-preview.gif) được tạo bằng `tests/capture_chapter1_animation.py` và cùng bộ vẽ của game.
