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

## Hoàn thiện sau mốc 2d129d7

- Màn 5 dùng tư thế đi thấp, ném xương và thao tác dây từ `prite_kien_hanh_dong_ven_song.png`. Xương bay từ vị trí ném cố định; lính/chó có nhịp bước liên tục khi tới bụi rậm. Giải xong tời sẽ thấy dây chắn biến mất khỏi mặt nước và thuyền đi qua trong 4 giây. [Nguồn ảnh mở xích và prompt](chapter2-open-chain-asset.md).
- Màn 6 dùng bạt lá cọ được vẽ riêng bằng Canvas theo khối hàng: mặt trên, mép rủ, sợi đan, nếp gấp, dây chéo và nút buộc. Vị trí/vùng bấm bám các chồng hàng trong nền. Thấy rõ ba trạng thái chưa che, đã che nhưng lỏng dây và buộc chắc; góc bạt chưa buộc bị gió giật. Có hiệu ứng trải bạt, tư thế trải/buộc và chớp sáng chuyển cường độ liên tục. Kiên chạy tới khoang theo tốc độ 190 đơn vị/giây. Thao tác che/buộc được ghi nhận ngay để điều khiển vẫn đáp ứng khi sửa nhiều khoang.
- Chu kỳ gió giữ phần thời gian dư và tính nước ngấm trước/sau đúng thời điểm gió. Không phát sinh một dây bung mới đúng lúc đồng hồ kết thúc. Kiểm tra ở 30/60/144 lần cập nhật/giây cho cùng kết quả.
- Màn 7 sửa vùng atlas chống sào và trát bùn để lấy trọn một tư thế, không cắt ngang hai nhân vật liền nhau. Thuyền và người chống sào chuyển động chung một điểm neo, có chu kỳ nghiêng người 1,6 giây, nhấp nhô/vệt nước và sương nhẹ. Giữ nguyên thiết kế ảnh nguồn. Chuyển động được tính liên tục theo thời gian và vẽ bằng requestAnimationFrame; kiểm tra 48 hình khác nhau ở tần suất lấy mẫu 24 hình/giây. Có thao tác trát bùn/phủ lá trong 1,6 giây trước khi tuần tra tới. Tải lại tiếp tục được cảnh phủ thuyền hoặc mở xích đang chạy. Nét vẽ bị hủy khi mất con trỏ/tạm dừng; ngón tay thứ hai không sửa nét của ngón đang giữ.
- Bản lưu v2 cũ vẫn dùng được; bản lưu mới kiểm tra cả đường đi trong luồng nước và trạng thái ngụy trang. Không thay đổi khóa lưu hay mã gameplay Chương 1.

`python tests/chapter2_dynamics.py` kiểm tra nhịp gió/thuyền/xích ở ba tốc độ cập nhật, hạn cuối cơn bão, tốc độ chạy, tạm dừng thao tác, dữ liệu lưu sai và quyền giữ con trỏ. `chapter2_browser.py` kiểm tra chơi hết màn, tải lại giữa hai hoạt cảnh mới và font Times New Roman.

[Bản xem hoạt ảnh Chương 2](chapter2-animation-preview.webp) được dựng từ chính bộ vẽ game bằng `python tests/capture_chapter2_animation.py`, gồm mở xích, bạt trong gió, chống sào và phủ thuyền/tuần tra. Đây là ảnh xem trước **25 khung hình/giây** (40 ms/hình); game vẫn cập nhật theo thời gian thực của trình duyệt. `tests/stage_6_7_9_fixes.py` đo nhịp hiển thị thực tế Màn 7 trong Chrome cục bộ và kiểm tra tối thiểu 24 FPS ở môi trường chạy thử; kết quả này phụ thuộc thiết bị. [Ảnh tổng hợp](chapter2-preview.jpg) có thể tạo riêng bằng `python tests/capture_chapters_preview.py --chapter 2`, giữ bản xem Chương 1.
