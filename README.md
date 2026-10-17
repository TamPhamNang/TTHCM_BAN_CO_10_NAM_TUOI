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

## Chương 2 · Ngược dòng mùa mưa bão

5. **Lính gác cảnh khuyển**: nhặt xương, dụ chó và lính ra bụi rậm, đi thấp để giảm tiếng động, xoay ba khóa dây để mở tời xích.
6. **Trận cuồng phong**: kéo/chọn bạt lá cọ che bốn khoang, buộc dây, sửa dây bị gió giật và giữ hàng khô trong 40 giây.
7. **Bãi lau sậy ngụy trang**: vẽ đường theo luồng nước, dùng sào đưa thuyền vào bãi trú; lên bờ lấy bùn và lá để phủ thuyền, chờ ca-nô đi qua.

Sau màn tổng kết Chương 1, chọn **Tiếp tục · Chương 2**. Nút **Chơi Chương 2** trong menu cho phép vào thẳng màn 5; giữ danh sách màn đã hoàn thành và hành trang chung, bắt đầu lại tiến trình hiện tại của Chương 2. Nút **Tiếp tục** khôi phục đúng màn và giai đoạn đang chơi.

## Chương 3 · Xuyên rừng mùa thu

8. **Chia muối lên đường**: chuyển 9 bao đại diện cho ngựa (4), xe thồ (2), chú dân công (2) và chị dân công (1); lấy lại bao đã chia, kiểm tra rồi cho đoàn xuất phát.
9. **Đẩy xe lên đèo**: nhấn E/Space hoặc nút Đẩy khi vạch ở vùng xanh rộng; vạch bắt đầu lại sau mỗi lần đẩy. Nhịp khoảng 0,5–1,5 giây đều qua được màn; nhấn muộn vẫn có lực. Xe trượt thì chạm đá sáng gần xe hoặc C để chèn trong 3 giây. Nhấn dồn không tăng tốc.
10. **Đêm trong rừng vắng**: soi đèn tìm cây, đối chiếu hình lá trong sổ, lấy củi và đá đánh lửa, gõ ba nhịp nhóm bếp; đợi nấu xong rồi mang nước lá tới bác Hai. Theo bản kịch bản chi tiết của GDD, người cần chăm sóc là bác Hai dân công.
11. **Bóng chim sắt**: E thổi còi; chạm nhóm hoặc Q để chọn, chạm gốc cây còn trống hoặc C để ra hiệu vào núp. Cả ba nhóm phải tới chỗ trong 5 giây. Chờ máy bay qua rồi ra hiệu đi tiếp; có hai lượt tuần tra.

Chọn **Tiếp tục · Chương 3** sau màn tổng kết Chương 2, hoặc **Chơi Chương 3** ở menu. **Tiếp tục** khôi phục đúng màn, bao đã chia, xe/đá chèn, giai đoạn nấu nước lá và nhóm đang vào núp. Các thời lượng, chu kỳ đèn/gió và số bao đại diện là thông số gameplay, không mô phỏng số lượng toàn bộ chiến dịch. Hội thoại được rút gọn/chuyển thể từ GDD.

## Chương 4 · Nước rút trên chiến khu

12. **Dấu vết hang dơi**: Q/nút La bàn chọn hướng Đông Bắc, tìm dao, quan sát đàn kiến và dấu phân dơi, tới cửa hang phát quang ba lần.
13. **Xây lán chống ẩm**: gom ba bó tre, dụng cụ, lá cọ; tới chỗ dựng sạp, chọn dựng chân → ghép mặt → buộc dây → lót lá. Không mất vật liệu khi chọn sai.
14. **Cuộc đua với bình minh**: chủ động Bắt đầu, E/Space/nút chính đón rồi chuyền từng lượt năm bao; đủ 100 bao lên sạp trong 210 giây. Mỗi lượt kéo dài 7,4 giây, đồng bộ với năm bảng sprite mới. Không cần căn lực; có thể tạm dừng và tiếp tục giữa lượt đang chuyền.

Chọn **Tiếp tục · Chương 4** sau nhật ký Chương 3 hoặc **Chơi Chương 4** trong menu. Tự lưu vật liệu, dấu vết, thao tác đang làm và thời gian bình minh. [Chi tiết Chương 4](docs/chapter4.md). Chương 5/màn 15 chưa triển khai.

## Điều khiển

Cuối Chương 1–4, **nhật ký của Kiên** tự mở để kể lại hành trình bằng toàn bộ nội dung đã cung cấp. Dùng nút **Nhật ký hành trình** ở menu chính để đọc lại chương đã hoàn thành. Chữ dùng Times New Roman, đọc bằng cuộn/chạm hoặc bàn phím; thời gian nhiệm vụ dừng khi đọc. Đã lưu đủ năm trang, trang 5 chờ gameplay tương ứng. [Nội dung gốc](js/chapter-diaries-content.js), [tài liệu nhật ký](docs/chapter-diaries.md).

- Chạm/nhấp đồ vật hoặc nhân vật: Kiên tự tìm đường và tương tác. Chạm nền để đi tới.
- Kéo cần tròn 360° ở góc trái hoặc dùng cần analog tay cầm: đi theo góc và tốc độ kéo. Thả cần để dừng. Điểm đến bằng chuột giữ tọa độ tự do, đường đi vòng qua vật cản.
- WASD / mũi tên: di chuyển. Shift: đi nhanh. E / Space: tương tác và tiếp hội thoại.
- I: ba lô. H: sổ tay gợi ý. Esc: đóng sổ / tạm dừng.
- Bến thuyền: WASD / mũi tên, nút hướng hoặc chạm ô kề Kiên. C: ngồi thấp/đứng lên, Z: lùi bước, R: xếp lại.
- Nhịp bến thuyền: đi một ô trong 0,30 giây, đẩy bao trong 0,40 giây. Giữ phím để đi liên tục; nhấp nhanh không bỏ qua hoạt ảnh của bước đang thực hiện.
- Trạm gác: C hoặc nút **Đi thấp** giảm tốc và mức phát hiện. Tương tác với bụi rậm để ném xương, tới tời để mở câu đố dây.
- Bão: kéo bạt từ ô bạt đến khoang, hoặc chọn **Lấy tấm bạt** rồi chạm khoang. Chạm khoang đã che để buộc/siết lại dây.
- Bãi lau: giữ chuột/ngón tay từ thuyền và vẽ theo chấm dẫn đường. Sau khi cập bãi, dùng điều khiển di chuyển và tương tác để lấy bùn, lá và phủ thuyền.
- Thời gian dừng trong hội thoại, ba lô, sổ tay, menu tạm dừng và khi trang mất focus.

## Lưu game và mã nguồn

Tiến trình được lưu mỗi giây và sau các tương tác: vật phẩm, việc đã giúp bà con, thời gian tàu, vị trí, bao muối, lịch sử lùi bước, màn hoàn thành. Nút **Tiếp tục** phục hồi tiến trình. **Bắt đầu** / **Chơi lại Chương 1** đặt lại bản lưu của game này. Bản lưu prototype cũ được giữ ở khóa riêng, không chuyển sang cốt truyện mới.

- `js/levels/chapter1.js`: cốt truyện, vật phẩm, cấu hình 4 màn, mô hình Sokoban.
- `js/levels/chapter2.js`: nội dung màn 5–7, luồng nước, khoang hàng và vùng cắt tài sản Chương 2.
- `js/river-chapter.js`, `js/river-scene.js`: trạng thái, lén lút, dây tời, bão, vẽ đường/ngụy trang và cảnh Chương 2.
- `js/levels/chapter3.js`: nội dung màn 8–11, sức chở, đường đèo, vị trí đá/chỗ núp và vùng cắt ảnh Chương 3.
- `js/forest-chapter.js`, `js/forest-scene.js`: chia tải, nhịp đẩy, soi đèn/nhận dạng cây, nấu/chăm sóc, báo động/ẩn nấp và hoạt ảnh Chương 3.
- `js/levels/chapter4.js`, `js/cave-chapter.js`, `js/cave-scene.js`: khảo sát hang, dựng sạp, chuyền đủ 100 bao, đồng hồ bình minh và hoạt ảnh Chương 4.
- `js/chapter-game.js`: luồng bốn chương, nhiệm vụ, ba lô, tìm đường, lưu/phục hồi.
- `js/chapter-assets.js`: nạp bộ ảnh hiện có trong `assets/images/Chapter_1/`, tách nhân vật và vật phẩm từ sheet trong bộ nhớ; giữ nguyên ảnh nguồn.
- `js/animation.js`: tách từng hình nguyên vẹn theo vùng liên thông trong hàng, đăng ký điểm neo thân/chân, giữ tỷ lệ chung và lưu bitmap ở độ phân giải hiển thị.
- `js/chapter-atlas.js`: tên 5 bảng tài sản và tọa độ cắt từng vùng; `css/chapter-art.css`: giao diện dùng khung giấy, biểu tượng và sổ tay từ bảng.
- `js/chapter-scene.js`: cảnh mở đầu, tàu, ruộng muối, bến thuyền; dùng nền căn cứ, nhân vật và vật phẩm từ bộ ảnh Chương 1.
- `js/game.js`: prototype trước đây, được giữ để tham khảo, không còn được nạp trong `index.html`.
- `Architecture v0.1.md`: tài liệu kiến trúc prototype trước GDD hiện tại, giữ nguyên để tham khảo.

Mở đầu là cảnh Canvas có hội thoại, di chuyển và nhận quà bằng tương tác; quà bay từ Bác đến Kiên trước khi vào ba lô. Tiến trình lưu riêng từng món đã nhận, có thể tiếp tục giữa cảnh. Chưa có phim/giọng đọc thu sẵn. Khi trình duyệt chặn lưu trữ, game vẫn chạy và hiển thị trạng thái không lưu được.

## Phông chữ và ảnh chứa chữ

Giao diện HTML, nút và chữ Canvas dùng **Times New Roman**; CSS có Times/serif dự phòng khi thiết bị không có font này. Không chép font có bản quyền từ Windows vào dự án. Ba tài sản vector mới trong `assets/ui/` thay phần chữ in sẵn: `pass-times.svg` chứa giấy thông hành tiếng Việt đúng dấu bằng Times New Roman, `notebook-pages.svg` là trang sổ trống để đặt chữ động, `parchment.svg` là nền giấy trống. Ảnh PNG gốc được giữ để tham chiếu, các vùng chữ mẫu trong bảng không xuất hiện trong giao diện chơi. [Ghi chú Chương 2 và tài sản](docs/chapter2.md).

## Kiểm thử

`python tests/chapter4_browser.py` và `python tests/chapter4_dynamics.py` kiểm tra ba màn Chương 4, thao tác thật, lưu/tải, nhật ký, bố cục nhỏ, dữ liệu sai và đồng hồ ở 24/30/60/144 lần cập nhật mỗi giây.

`python tests/chapter_diaries_browser.py` kiểm tra nhật ký Chương 1–3, tải lại bản lưu cuối chương, đọc lại không sửa tiến trình, tải ảnh, cuộn bàn phím và bố cục điện thoại dọc/ngang.

Khi máy chủ HTTP đang chạy, dùng `python tests/chapter1_browser.py` (cần Python Playwright và Chrome; có thể đặt `GAME_URL`, `CHROME_PATH`). Kiểm thử đi xuyên 4 màn, điều kiện vật phẩm, chọn/kéo vàng, tạm dừng/hết giờ, đưa sai giấy tờ, đèn quét, lùi bước, lưu/tải lại từng giai đoạn và bố cục màn hình nhỏ. Ảnh kiểm tra được ghi vào thư mục tạm của hệ điều hành.

Kiểm tra đồ họa còn xác nhận đủ 5 bảng nguồn, các vùng atlas, sprite đi từ các bảng gốc lớn còn nguyên thân người và trang phục đúng theo màn. [Ghi chú đồ họa Chương 1](docs/chapter1-art.md) mô tả nguồn và cách sử dụng.

`python tests/chapter1_layout.py` kiểm tra vị trí nhặt trên nội thất, đường tiếp cận cả ba vật phẩm, bà lão và 5 hành khách từ bảng tàu mùa đông, vùng thả vàng, chuyển động tới ghế/ngồi xuống, tạm dừng và tải lại tư thế ngồi. Ảnh dựng hai màn được xuất vào thư mục tạm của hệ điều hành để kiểm tra bố cục.

`python tests/chapter1_animation.py` kiểm tra chuyển động ở 30/60/144 lần cập nhật mỗi giây, 24 góc analog, điểm đến không bị ép vào ô, tránh góc vật cản, bước chân liên tục, nội suy người/bao muối, tạm dừng, tỷ lệ/điểm neo chung và số thay đổi HUD khi đứng yên. Kiểm thử trình duyệt còn kéo/thả cần bằng con trỏ, nhận từng món quà, tải lại giữa hai món và tạm dừng lúc trao quà. Kết quả thời gian khung hình chỉ là số đo ở môi trường kiểm thử, không phải cam kết FPS trên mọi thiết bị.

`python tests/capture_chapter1_animation.py` tạo [vòng xem hoạt ảnh](docs/chapter1-animation-preview.gif) bằng chính bộ vẽ runtime, để xem động thay vì chỉ kiểm tra ảnh tĩnh.

`python tests/chapter2_browser.py` kiểm tra Times New Roman thực tế trên DOM/Canvas, ảnh giấy mới, chơi xuyên màn 5–7, phát hiện/đi thấp, câu đố dây, kéo/thả bạt, gió, thất bại/thử lại, đường đi sai/đúng, thu vật liệu/ngụy trang, tạm dừng, lưu/tải và bố cục dọc/ngang. Giữ tương thích bản lưu v2 Chương 1 không có trường `river`.

`python tests/chapter2_dynamics.py` kiểm tra thời gian gió, thuyền và mở xích ở 30/60/144 lần cập nhật/giây, tốc độ chạy trên boong, thao tác bị tạm dừng, hủy kéo/đa điểm và dữ liệu lưu Chương 2. Xem [tiến độ đối chiếu commit 2d129d7](docs/resume-2d129d7.md) và [các hiệu ứng đã hoàn thiện](docs/chapter2.md).

`python tests/chapter3_browser.py` chơi xuyên bốn màn, quá tải/hoàn trả, nhịp đẩy/chèn đá/thất bại, nhận dạng cây đúng/sai, nhóm bếp/nấu/chăm sóc, hai lượt máy bay, lưu/tải/tạm dừng và bố cục điện thoại dọc/ngang. `python tests/chapter3_dynamics.py` kiểm tra nhịp ở 30/60/144 lần cập nhật/giây, lệnh nấp sát hạn, dữ liệu lưu sai và phím E/C/con trỏ. [Tài liệu Chương 3](docs/chapter3.md), [ảnh tổng hợp](docs/chapter3-preview.jpg).
