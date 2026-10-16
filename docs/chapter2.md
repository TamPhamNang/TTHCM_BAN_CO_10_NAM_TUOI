# Chương 2 · Ngược dòng mùa mưa bão

Theo GDD.md, Phần 2, tháng 5–7/1946. Chương 2 nối sau màn 4 và có lối vào trực tiếp từ menu để chơi thử. Chương 1 vẫn dùng dữ liệu, hành trang và khóa lưu hiện có.

| Màn | Cơ chế | Nguồn ảnh chính |
| --- | --- | --- |
| 5 · Lính gác cảnh khuyển | Nhặt xương; tới bụi rậm ném xương; chó và lính đi kiểm tra trong 45 giây; đi thấp giảm tiếng động; gỡ ba khóa tời. | `tram_gac_ven_song.png`, `sprite_linh_gac_va_cho_nghiep_vu.png`, `khuc_xuong.png` |
| 6 · Trận cuồng phong | Kéo hoặc chọn bạt để che 4 khoang; chạm để buộc; gió mỗi 6 giây làm lỏng một dây; hàng bị ướt khi hở; bảo vệ trong 40 giây. | `tran_cuong_phong.png`, `bat_la_co.png`, vùng bạt phẳng trong bảng tài nguyên |
| 7 · Bãi lau sậy | Vẽ theo luồng nước, kiểm tra toàn bộ đoạn vẽ và thứ tự điểm dẫn; thuyền chạy theo đường; lấy bùn và lá trên bờ; ngụy trang rồi chờ tuần tra. | `bai_lau_say.png`, `sao_tre.png`, thuyền/ca-nô/bùn/lá trong hai bảng |

Các thời lượng và số khoang là lựa chọn gameplay. Không có chiến đấu. Bị phát hiện, hàng ngấm nước hoặc hết thời gian sẽ cho thử lại màn. Mở sổ/ba lô, tạm dừng và chuyển sang ứng dụng khác đóng băng thời gian. Câu đố dây không chạy đồng hồ phát hiện để người chơi nhỏ tuổi có thời gian suy nghĩ.

## Lưu và tiếp tục

Giữ phiên bản lưu 2, thêm trường `river` cho màn 5–7. Bản lưu Chương 1 cũ không cần trường mới và vẫn mở được. Trường mới chứa khóa dây đã xoay, mức phát hiện, thời gian dụ chó, bạt/dây/độ khô, đường thuyền, quãng đường, vật liệu và giai đoạn ngụy trang. `SaveSystem` kiểm tra phạm vi, kiểu dữ liệu và giới hạn chiều dài đường trước khi nạp. Hoạt ảnh nhặt/drag tạm thời không ghi vào bản lưu; tiến trình nhiệm vụ đã thực hiện được giữ.

## Font và ảnh chứa chữ

- CSS khai báo Times New Roman đầu tiên cho thân trang, tiêu đề, hội thoại, sổ và điều khiển. Canvas đặt font Times New Roman ở từng nơi vẽ chữ, gồm cả bộ vẽ prototype còn lưu trong mã nguồn.
- `assets/ui/pass-times.svg` thay giấy thông hành bằng chữ đúng dấu và font khai báo trực tiếp trong SVG. Nội dung là đạo cụ trong game.
- `assets/ui/notebook-pages.svg` và `parchment.svg` là nền trống, giữ nội dung trong HTML để cùng dùng một font và không còn chữ mẫu lẫn vào sổ/khung thoại.
- Các board PNG là nguồn minh họa tham chiếu; game chỉ cắt hình không chứa tiêu đề, tên file hoặc nhãn in sẵn. Không cần nhận dạng chữ hay phóng chữ trong ảnh lên để đọc.

## Kiểm tra

`python tests/chapter2_browser.py` chạy qua cả ba màn bằng giao diện và logic thời gian thực. Đồng thời xác nhận font đã được Canvas chấp nhận, font của các phần tử DOM, đường vẽ bị chặn khi đi xuyên lau, kéo/thả trên khoang đúng tọa độ, giữ tiến trình qua reload và bản lưu v2 cũ. Ảnh kiểm tra được ghi vào thư mục tạm với tên `chapter2-*.png`.

Chạy thêm `chapter1_browser.py`, `chapter1_animation.py`, `chapter1_layout.py` để xác nhận Chương 1 và nhịp bến thuyền 300/400 ms được giữ.
