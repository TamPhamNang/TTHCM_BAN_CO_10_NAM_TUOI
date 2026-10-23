# Chương 4 · Nước rút trên chiến khu

Triển khai ba màn 12–14 theo GDD, từ tháng 11 đến đầu tháng 12/1946. Vào từ nút Tiếp tục sau nhật ký Chương 3 hoặc **Chơi Chương 4** ở menu chính. Chương 5/màn 15 đã triển khai; đọc hết nhật ký Chương 4 để tự tiếp tục.

| Màn | Gameplay | Hoạt ảnh và hình ảnh |
| --- | --- | --- |
| 12 · Dấu vết hang dơi | Chọn hướng Đông Bắc từ la bàn; nhặt dao; quan sát kiến và dấu phân dơi khô; tới cửa hang và phát quang ba lần. | Kim chỉ hướng, kiến bò, dơi bay, dây leo mở dần, tư thế Kiên cầm la bàn/phát quang. |
| 13 · Xây lán chống ẩm | Gom ba bó tre, dụng cụ và lá cọ; tới chỗ dựng sạp; dựng chân → ghép mặt → buộc dây → lót lá. Chọn sai được nhắc, không mất tài nguyên. | Nền ban đầu chưa có sạp. Bốn lớp dựng cùng vị trí trên nền khô bên phải, thu chiều sâu theo phối cảnh; Kiên đứng tại chỗ vừa đi tới. |
| 14 · Cuộc đua với bình minh | Chọn Bắt đầu; E/Space hoặc nút chính lần lượt đón/chuyền. Mỗi lượt tổ chuyền năm bao trong 7,4 giây; đủ 100 bao trong 210 giây. | Năm bảng sprite mới, lấy mẫu 30 FPS; tư thế nhận, ôm, chuyền và xếp bao dùng chung thời gian với đoạn bao rời tay. Hai hàng dân công và ánh bình minh sáng dần. |

Thời gian, ba bó tre, ba lần phát quang và lượt năm bao là thông số gameplay. Màn 14 vẫn đếm đủ 100 bao cuối cùng; năm bao mỗi lượt được vẽ riêng trên đường chuyền. Không có vùng căn lực hoặc phạt nhịp nhấn. Đợi lượt đang chuyền tới sạp rồi mới đón lượt sau. Đồng hồ chỉ chạy sau khi chọn Bắt đầu; tạm dừng, mất focus, ba lô và sổ tay dừng thời gian. Bao cuối tới đúng hạn được tính thành công.

## Tài sản và chữ

`js/levels/chapter4.js` khai báo nền, vật phẩm, vùng cắt và kịch bản. `js/chapter-assets.js` nạp ảnh trong `assets/images/chapter_4/`. Các PNG gốc được giữ nguyên; ảnh có alpha được cắt trực tiếp trong bộ nhớ, không tẩy lại nền hoặc đổi tỷ lệ giữa các hình liên tiếp. Tư thế la bàn, phát quang, ôm tre được lấy nguyên vẹn từ bảng Kiên; Màn 14 sử dụng năm bảng sprite chuyền muối riêng của Chương 4. Nhãn, câu hỏi la bàn và hướng dẫn dựng sạp là chữ HTML/Canvas dùng Times New Roman.

Đã cập nhật bộ ảnh mới: `Rèm dây leo rừng nhiệt đới lộng lẫy.png` thay rèm vẽ tạm ở Màn 12. Bốn bước Màn 13 lần lượt dùng `chan_sap_tre.png`, `ghep_mat_tre.png`, `buoc_day_chac.png`, `lot_la_co.png`, giữ chung kích thước khung và vị trí chạm đất. Bỏ hình sạp tham chiếu mờ trước khi dựng; [nền hang chưa dựng sạp](chapter4-workshop-background-v2.md) là biến thể riêng, không ghi đè nguồn. Sau bước cuối giữ ảnh sạp đã lót lá. Phiên bản tải ảnh Chương 4 là 16.

Màn 14 cắt riêng từng hàng của năm sheet vị trí 01/02/03/05/06, vì độ cao hàng không bằng nhau. Neo đầu/chân từng tư thế để bao chìa ngang không kéo lệch nhân vật. Sheet 05 có 24 hình, các sheet còn lại có 30 hình; tất cả phát theo đồng hồ 30 FPS. Chỉ vẽ bao rời trong khoảng chuyển giữa hai bàn tay, tránh nhân đôi bao đã nằm trong sprite. Bản lưu cũ giữ số bao, trạng thái đón/chuyền và tỷ lệ thời gian còn lại khi chuyển sang thời lượng mới.

`js/cave-chapter.js` quản lý tiến trình; `js/cave-scene.js` vẽ cảnh, hoạt ảnh liên tục theo thời gian; `css/cave-art.css` bố trí điều khiển và bảng dựng sạp trên máy tính/điện thoại. Không đưa bảng chữ mẫu trong ảnh UI vào gameplay.

## Lưu và nhật ký

Giữ khóa/phiên bản lưu v2, bổ sung `cave` chỉ bắt buộc ở màn 12–14. Bản lưu cũ Chương 1–3 không cần trường này. Lưu đủ hướng đã chọn, dấu vết, đồ đã nhặt, tiến độ phát quang/lắp sạp, bao đang giữ/đang chuyền, số bao tới kho và thời gian bình minh. Khi khôi phục giữa đoạn kết, tiến trình đã xong sẽ đi tới tổng kết thay vì yêu cầu làm lại.

Sau màn 14, tự mở **Trang nhật ký số 4**, nguyên văn nội dung người dùng đã cung cấp, với nền `truyen_ket_chuong4.png`. Chữ nằm trực tiếp trên vùng trống giữa ảnh, không có nền trắng. Menu Nhật ký hành trình mở lại được trang 4 sau khi hoàn thành; xem lại không sửa tiến trình.

## Kiểm thử

- `python tests/chapter4_browser.py`: chuyển từ bản lưu Chương 3 cũ, chơi xuyên ba màn bằng chuột/phím/nút thật, các điều kiện chặn, chọn sai, lưu/tải giữa thao tác, tạm dừng, hết giờ/thử lại, nhật ký và bố cục 390×844 / 844×390.
- `python tests/chapter4_dynamics.py`: nhịp 24/30/60/144 lần cập nhật mỗi giây, phát quang/dựng sạp/chuyền bao, bao cuối đúng hoặc trễ hạn, đóng băng thời gian và từ chối bản lưu sai.
- `python tests/chapter4_asset_fixes.py`: không vẽ sạp ở bước 0, giới hạn vị trí bốn bước, đủ khung hình từ năm sheet, bàn giao bao cùng nhịp và chuyển bản lưu cũ.
- Các bộ Chương 1–3 và nhật ký tiếp tục kiểm tra tương thích sau khi nối chương mới. Ảnh kiểm tra ghi trong thư mục tạm với tiền tố `chapter4-`.

[Ảnh tổng hợp Chương 4](chapter4-preview.jpg) và [bản xem hoạt ảnh 30 FPS](chapter4-animation-preview.webp) được tạo từ bộ vẽ runtime bằng `python tests/capture_chapter4_preview.py --animate`, gồm 240 khung với thời lượng 33/33/34 ms. Sau sửa Màn 13/14, ba bộ kiểm thử Chương 4 đều đạt: luồng chơi, động lực/thời gian và tài sản/hoạt ảnh; không ghi nhận lỗi JavaScript. Ảnh nguồn và lịch sử Git được giữ nguyên.
