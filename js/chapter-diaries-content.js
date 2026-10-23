// Nội dung do người dùng cung cấp. Giữ nguyên lời kể; Chương 5 chờ gameplay.
const CHAPTER_DIARIES = [
  {
    chapter: 1, title: "TRANG NHẬT KÝ SỐ 1",
    date: "Ngày... tháng 3 năm 1946.",
    place: "Dưới khoang thuyền bồng bềnh trên bến Văn Lý.",
    image: "assets/images/Chapter_1/nhat_ky_cuoi_chuong1.png",
    paragraphs: [
      "Đêm nay, trăng ngoài biển sáng quá, nhưng đoàn thuyền của chúng mình phải đậu trong bóng tối.",
      "Nhìn những bao muối trắng xóa chất đầy khoang thuyền, mình vẫn còn thấy hồi hộp như lúc đứng trước Bác Hồ ở Hà Nội. Nhớ lúc Bác quàng chiếc khăn ấm lên cổ mình và bảo: 'Ta có cả một dân tộc cơ mà', tự nhiên mình thấy chẳng sợ tên lính gác Pháp nào sất! Lúc trên tàu hỏa về Nam Định, giấu mấy thỏi vàng cách mạng xuống đáy thúng cam của bà cụ mà tim mình đập thình thịch. May mà mình nhanh trí đưa đúng tờ giấy thông hành!",
      "Về đến Văn Lý, thấy các cô chú diêm dân làm muối vất vả mà thương lắm. Mình giúp một bác sửa xe kéo, kéo nước cho mọi người uống, thế là các cô chú cười xòa, gật đầu bán hết muối cho bộ đội Cụ Hồ ngay. Đêm nay, vác bao muối trên vai nặng trĩu, rát cả lưng, đèn pha của đồn giặc cứ quét qua quét lại trên đầu, nhưng không ai thốt lên một tiếng nào. Bác Lương Bằng bảo, đây là 'kho báu trắng' của cách mạng.",
      "Chiếc la bàn Bác Hồ tặng đang chỉ hướng Bắc. Ngày mai, thuyền sẽ nhổ neo..."
    ]
  },
  {
    chapter: 2, title: "TRANG NHẬT KÝ SỐ 2",
    date: "Ngày... tháng 7 năm 1946.",
    place: "Trong bãi lau sậy ven ngã ba sông Hạc.",
    image: "assets/images/Chapter_2/nhat_ky_cuoi_chuong2.png",
    paragraphs: [
      "Sông nước mùa này dữ dội thật. Chiếc áo trấn thủ của mình chưa kịp khô đã lại ướt sũng.",
      "Chặng đường ngược sông Đáy đúng là đau tim! Nhớ cái đoạn đi qua trạm gác Vân Đình, con chó cảnh khuyển của giặc cứ nhe nanh sủa. May mà mình nhặt được khúc xương ném ra xa dụ nó đi chỗ khác, rồi rón rén tháo tung sợi xích cho thuyền qua. Lúc ấy chỉ sợ nó quay lại ngoạm cho một cái.",
      "Nhưng sợ nhất vẫn là cơn dông chiều qua. Bác Lương Bằng hét lớn: 'Muối dính nước là tan hết!'. Thế là cả đội lao ra boong thuyền, bám chặt lấy mép bạt lá cọ. Gió giật tung cả bạt, mưa quất rát mặt, mình phải dùng hết sức buộc chặt từng sợi dây thừng lại. Chỉ một chút nữa thôi là công sức của bao nhiêu người hòa hết vào nước sông.",
      "Ban nãy, thuyền suýt bị ca-nô địch phát hiện. Mình vội đẩy thuyền nấp vào bãi lau sậy, lấy bùn trát kín. Tàu giặc lướt qua rầm rầm cách có vài sải tay, mình nín thở đến mức đỏ bừng cả mặt.",
      "Thoát nạn rồi. Chỉ mong chặng đường phía trước bớt bão giông."
    ]
  },
  {
    chapter: 3, title: "TRANG NHẬT KÝ SỐ 3",
    date: "Ngày... tháng 10 năm 1946.",
    place: "Cạnh đống lửa nhỏ giữa rừng sâu, đường lên Việt Bắc.",
    image: "assets/images/chapter_3/nhat_ky_cuoi_chuong3.png",
    paragraphs: [
      "Thuyền cạn dòng rồi, cả đội phải chuyển muối lên bờ.",
      "Hôm ở bến Tuyên Quang, mình làm 'toán trưởng' chia hàng. Chú ngựa thì gánh 4 bao, bác gánh thồ thì 2 bao. Mình chia đều sao cho ai cũng đi được đường dài. Đường rừng dốc ngược, trơn trượt vô cùng. Hôm qua bác Hai đẩy xe cút kít bị tuột dốc, mình phải lao ra sau lưng nghiến răng giữ lại, vơ vội hòn đá chèn bánh xe. Xong việc, hai bác cháu nhìn nhau cười mà mặt mũi lấm lem bùn đất.",
      "Rừng mùa thu đẹp nhưng độc quá. Đêm nọ bác Lương Bằng lên cơn sốt rét run cầm cập. Mình vội mở Sổ tay của Bác Hồ ra xem, rồi cầm đèn pin soi tìm được đúng cây lá Thanh Hao hăng hăng đem về nấu nước. Nhìn bác uống xong đỡ mệt, mình vui lắm.",
      "Mấy hôm nay máy bay Pháp (mình hay gọi là chim sắt) lượn vòng vòng suốt. Cứ nghe tiếng 'u u' là mình lại thổi còi cho cả đoàn nấp vào gốc cây cổ thụ. Chặng đường sắp về đến đích rồi, cố lên đôi chân ơi!"
    ]
  },
  {
    chapter: 4, title: "TRANG NHẬT KÝ SỐ 4",
    date: "Ngày... tháng 12 năm 1946.",
    place: "Trước cửa một hang đá lớn tại căn cứ địa Việt Bắc.",
    image: "assets/images/chapter_4/truyen_ket_chuong4.png",
    paragraphs: [
      "Chúng mình làm được rồi!!! 2 vạn tấn muối đã lên đến chiến khu Việt Bắc!",
      "Gió mùa đông thổi lạnh buốt thấu xương, nhưng trong lòng mình lại thấy nóng bừng. Trưa nọ, nhờ cái la bàn của Bác Hồ và đi theo đàn kiến, bầy dơi, mình đã tìm được cái hang đá vôi khô ráo khổng lồ này. Cả mấy ngày trời, mình làm 'thợ mộc nhí', chẻ nứa, chặt tre làm cái sàn cao để muối không bị chạm xuống mặt đất ẩm. Bác Lương Bằng xoa đầu khen mình khéo tay.",
      "Đêm qua là đêm căng thẳng nhất. Trời sắp sáng mà vẫn còn 100 bao muối ngoài bìa rừng. Máy bay địch có thể tới bất cứ lúc nào. Mình đứng giữa hàng người dài dằng dặc, đón từng bao muối nặng từ tay người trước, chuyền nhanh sang tay người sau. Tay đau rát, mồ hôi vã ra như tắm nhưng tay ai cũng thoăn thoắt nhịp nhàng. Khi bao muối cuối cùng vừa yên vị trên sạp tre thì mặt trời ló rạng.",
      "Nhìn ngọn núi muối trắng tinh giấu kỹ trong lòng đất mẹ, tự nhiên mình thấy muốn khóc vì vui sướng."
    ]
  },
  {
    image:"assets/images/chapter_5/chuyen_ket_chuong5.png",
    chapter: 5, title: "TRANG NHẬT KÝ SỐ 5",
    date: "Đêm ngày 19 tháng 12 năm 1946.",
    place: "Lán trại quân nuôi, dưới ánh lửa hồng.",
    paragraphs: [
      "Hôm nay, đài phát thanh vừa đọc Lời kêu gọi Toàn quốc kháng chiến của Bác Hồ. Từ phía Hà Nội xa xôi, mình nghe văng vẳng có tiếng đại bác dội về. Giặc Pháp đã chặn mọi con đường, chúng định làm bộ đội ta chết đói, chết phù thũng vì thiếu muối. Nhưng chúng nhầm to rồi!",
      "Chiều nay, mình phụ anh nuôi nấu ăn. Bữa cơm chiến khu chỉ có rau rừng và cá suối, nhưng khi mình tự tay xúc thìa muối Văn Lý trắng ngần rắc vào nồi canh, mùi thơm bay lên ấm cả lán trại. Các chú bộ đội húp canh, ai cũng khen ngon và vỗ vai bảo: 'Ăn đậm đà thế này, vác súng nhẹ tênh!'.",
      "Và niềm vui lớn nhất đời mình đã đến... Bác Hồ tới thăm căn cứ! Bác mặc áo kaki, đi dép lốp. Bác nếm thử canh rồi khen muối Văn Lý ngon lắm. Bác còn tự tay cài lên ngực áo mình chiếc huy hiệu hình ngôi sao lấp lánh và gọi mình là 'Dũng sĩ Hậu cần'.",
      "Bây giờ thì mình đã hiểu thế nào là 'đánh trường kỳ'. Kháng chiến còn dài, còn gian khổ, nhưng có gạo, có muối, có Bác Hồ chỉ đường, nhất định chúng mình sẽ chiến thắng!"
    ]
  }
];
