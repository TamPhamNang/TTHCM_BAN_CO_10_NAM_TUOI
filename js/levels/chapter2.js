// Chapter 2 follows GDD.md, Part 2: May–July 1946. All labels are live text.
const CHAPTER_TWO = {
  title: "Ngược dòng mùa mưa bão",
  items: {
    bone: {name: "Khúc xương", icon: "◇", description: "Ném vào bụi rậm để đưa chó và lính gác ra xa tời xích."},
    bamboo: {name: "Sào tre", icon: "╱", description: "Dùng để đưa thuyền theo luồng nước vào bãi lau."},
    mud: {name: "Bùn ven bờ", icon: "●", description: "Trát lên mạn thuyền để che màu gỗ sáng."},
    leaves: {name: "Lá ngụy trang", icon: "♧", description: "Phủ cùng bùn lên thuyền để hòa với lau sậy."}
  },
  levels: {
    5: {
      name: "Lính gác cảnh khuyển", place: "Trạm gác sông Đáy", date: "Tháng 5/1946", background: "riverCheckpoint", spawn: {x: 420, y: 566},
      intro: [{speaker: "Nhật ký của Kiên", text: "Tháng 5/1946. Cháu đã lên thuyền. Sông Đáy rộng quá Bác ạ, nhưng phía trước có dây xích chắn ngang dòng nước..."},
        {speaker: "Nguyễn Lương Bằng", text: "Kiên, cháu lên bờ mở tời xích. Nhặt khúc xương, ném vào bụi rậm để dụ chó và lính ra xa. C giúp cháu đi thấp, ít gây tiếng động."}],
      hint: "Tìm khúc xương cạnh đường lên trạm, tới bụi rậm phía tây rồi ném xương. Khi chó và lính đi kiểm tra, đến tời xích ở mép bến. Xoay ba khóa dây để các mũi tên đều chỉ lên. Nếu chó quay lại, cháu có thể tìm thêm xương và thử tiếp.",
      collisionZones: [{x:0,y:0,width:1200,height:195},{x:585,y:195,width:615,height:505},{x:0,y:620,width:1200,height:80},
        {x:0,y:195,width:75,height:425},{x:75,y:195,width:210,height:65},{x:500,y:390,width:85,height:150},{x:75,y:490,width:125,height:130}]
    },
    6: {
      name: "Trận cuồng phong", place: "Giữa dòng sông Hồng", date: "Tháng 6/1946", background: "riverStorm", spawn: {x:555,y:355},
      intro: [{speaker:"Nguyễn Lương Bằng",text:"Muối dính nước là tan hết! Cháu lấy bạt lá cọ che bốn khoang rồi buộc lại. Gió sẽ giật bung dây: thấy khoang báo vàng thì buộc lại ngay nhé."},
        {speaker:"Kiên",text:"Cháu rõ rồi ạ! Kéo bạt vào khoang, hoặc chọn bạt rồi chạm khoang. Cháu sẽ giữ hàng khô cho tới khi cơn bão đi qua."}],
      hint:"Chọn hoặc kéo bạt ở góc trái xuống từng khoang đánh dấu. Chạm khoang đã che để buộc dây. Gió cứ vài giây lại làm lỏng một khoang; chạm khoang màu vàng để buộc lại. Bảo vệ hàng trong 40 giây. Mở sổ hoặc tạm dừng để nghỉ, đồng hồ sẽ dừng.",
      cargo: [{x:330,y:282,width:160,height:108},{x:475,y:237,width:136,height:92},{x:690,y:300,width:150,height:102},{x:920,y:477,width:220,height:136}]
    },
    7: {
      name:"Bãi lau sậy ngụy trang",place:"Ngã ba Hạc",date:"Tháng 7/1946",background:"riverReeds",spawn:{x:350,y:360},
      intro:[{speaker:"Nguyễn Lương Bằng",text:"Có ca-nô tuần tra phía trước! Dùng sào tre đưa thuyền men theo luồng nước vào bãi lau. Cháu vẽ đường từ thuyền, qua các chấm dẫn đường, đến chỗ trú nhé."},
        {speaker:"Kiên",text:"Vào bãi lau rồi cháu sẽ lên bờ lấy bùn và lá cây, phủ kín mạn thuyền trước khi ca-nô tới."}],
      hint:"Giữ chuột hoặc ngón tay ở thuyền rồi vẽ theo các chấm trên luồng nước tới điểm trú. Tránh cắt qua các rặng lau. Khi thuyền tới bãi, lấy bùn và lá ven bờ rồi chạm thuyền để ngụy trang. Sau đó đứng yên chờ ca-nô đi qua.",
      channel:[{x:535,y:500},{x:505,y:430},{x:480,y:350},{x:475,y:270},{x:440,y:245}],
      collisionZones:[{x:0,y:0,width:1200,height:210},{x:0,y:210,width:180,height:490},{x:440,y:210,width:760,height:490},{x:180,y:500,width:260,height:200}]
    }
  }
};
Object.assign(CHAPTER_ONE.items, CHAPTER_TWO.items);
const GAME_LEVELS = [...CHAPTER_ONE.levels];
for (const [id, spec] of Object.entries(CHAPTER_TWO.levels)) GAME_LEVELS[Number(id)] = spec;

const CHAPTER_TWO_ART = {
  files: {riverCheckpoint:"tram_gac_ven_song",riverCheckpointOpen:"tram_gac_mo_xich_v1",riverStorm:"tran_cuong_phong",riverReeds:"bai_lau_say",bone:"khuc_xuong",riverTarp:"bat_la_co",bamboo:"sao_tre",riverActors:"sprite_linh_gac_va_cho_nghiep_vu",riverKien:"prite_kien_hanh_dong_ven_song",riverBoard:"Bảng tài nguyên game Chương 2",riverJourney:"Bộ tài nguyên Chương 2_ Hành trình trên sông Đáy"},
  regions: {
    riverGuard:{source:"riverActors",rect:[260,3,101,154],tolerance:22},
    riverDog:{source:"riverActors",rect:[246,674,117,83],tolerance:22},
    riverDogSniff:{source:"riverActors",rect:[255,760,119,55],tolerance:24},
    riverKienCrouch:{source:"riverKien",rect:[157,10,126,126],tolerance:28},
    riverKienThrow:{source:"riverKien",rect:[370,145,125,137],tolerance:28},
    riverKienRope:{source:"riverKien",rect:[708,409,123,118],tolerance:28},
    riverKienTarp:{source:"riverKien",rect:[441,535,146,122],tolerance:28},
    riverKienTie:{source:"riverKien",rect:[417,665,131,123],tolerance:28},
    riverKienPole:{source:"riverKien",rect:[148,789,136,139],tolerance:28},
    riverKienMud:{source:"riverKien",rect:[137,932,143,145],tolerance:28},
    riverBoat:{source:"riverJourney",rect:[6,937,125,79],tolerance:24},
    riverPatrol:{source:"riverJourney",rect:[810,654,194,86],tolerance:24},
    mud:{source:"riverJourney",rect:[1281,501,67,63],tolerance:24},
    leaves:{source:"riverJourney",rect:[1442,495,76,73],tolerance:24},
    riverReedClump:{source:"riverBoard",rect:[1320,571,88,82],tolerance:28},
    riverKnot:{source:"riverBoard",rect:[331,570,66,82],tolerance:24},
    riverTarpFlat:{source:"riverJourney",rect:[708,495,95,73],tolerance:24}
  }
};
