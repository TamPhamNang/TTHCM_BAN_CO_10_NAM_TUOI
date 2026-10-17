// GDD Part 3, detailed story: August–October 1946. Source PNGs stay untouched.
const CHAPTER_THREE = {
  title: "Xuyên rừng mùa thu",
  items: {
    forestHerb: {name:"Lá Thanh Hao",icon:"♧",description:"Cây lá nhỏ, xẻ mảnh giống hình trong sổ tay; vật phẩm cốt truyện màn cứu thương."},
    forestWood: {name:"Củi khô",icon:"≋",description:"Dùng nhóm bếp nhỏ để nấu nước lá tại trại."},
    forestFlint: {name:"Đá đánh lửa",icon:"◇",description:"Gõ đều ba lần để nhóm bếp nấu nước lá."},
    forestMedicine: {name:"Bát nước lá",icon:"◡",description:"Mang tới bác Hai đang nghỉ trong lán."}
  },
  carriers: [
    {id:"horse",name:"Ngựa thồ",capacity:4,art:"forestHorse",x:930,y:425,width:110},
    {id:"bike",name:"Xe đạp thồ",capacity:2,art:"forestBike",x:445,y:355,width:110},
    {id:"porter",name:"Chú dân công",capacity:2,art:"forestPorter",x:645,y:375,width:81},
    {id:"woman",name:"Chị dân công",capacity:1,art:"forestWoman",x:770,y:405,width:68}
  ],
  levels: {
    8:{name:"Chia muối lên đường",place:"Bến Tuyên Quang",date:"Tháng 8/1946",background:"forestHarbor",spawn:{x:590,y:385},
      intro:[{speaker:"Nguyễn Lương Bằng",text:"Thuyền không đi tiếp được nữa. Chúng ta chuyển muối lên ngựa, xe thồ và quang gánh để vào rừng."},
        {speaker:"Kiên",text:"Cháu chia chín bao đại diện: ngựa bốn, xe hai, chú dân công hai, chị dân công một. Cháu sẽ kiểm tra để không ai mang quá sức!"}],
      hint:"Dùng + để chuyển từng bao từ kho lên phương tiện, − để lấy lại. Ngựa chở 4, xe 2, chú dân công 2 và chị dân công 1 bao. Chia đủ 9 bao, đúng sức chở rồi chọn Lên đường. Đây là số bao đại diện cho bài toán trong game."},
    9:{name:"Đẩy xe lên đèo",place:"Đường đèo Việt Bắc",date:"Tháng 9/1946",background:"forestHill",spawn:{x:300,y:555},
      intro:[{speaker:"Bác Hai",text:"Đường trơn quá, xe muối cứ trượt lùi. Kiên giúp bác giữ xe với!"},
        {speaker:"Kiên",text:"Cháu đẩy cùng bác! Nhấn E, Space hoặc nút Đẩy khi vạch ở vùng xanh. Cứ chậm, đều tay thôi. Khi xe trượt, chạm hòn đá sáng ven đường hoặc C để chèn bánh ngay."}],
      hint:"Nhấn E/Space hoặc nút Đẩy để bắt đầu; mỗi lần đẩy, vạch trở về đầu. Chờ vạch vào vùng xanh rộng rồi nhấn tiếp, khoảng nửa giây đến một giây rưỡi. Nhấn muộn vẫn đẩy được; nhấn dồn không tăng lực. Thấy cảnh báo trượt thì chọn một hòn đá sáng gần xe hoặc C để chèn; có ba giây để giữ xe. Đá đã dùng ở lại trên đường.",
      route:[{x:285,y:555},{x:535,y:485},{x:860,y:420},{x:1025,y:360},{x:925,y:315},{x:720,y:300},{x:940,y:235},{x:1080,y:160}],
      stones:[{x:490,y:485},{x:870,y:395},{x:900,y:265}]},
    10:{name:"Đêm trong rừng vắng",place:"Trại nghỉ trong rừng",date:"Tháng 10/1946",background:"forestNight",spawn:{x:620,y:455},
      intro:[{speaker:"Nguyễn Lương Bằng",text:"Bác Hai đang sốt, phải nghỉ trong lán. Cháu soi đèn tìm cây Thanh Hao theo hình trong sổ; lấy củi khô và đá đánh lửa, nấu nước lá rồi mang cho bác ấy nhé."},
        {speaker:"Kiên",text:"Cháu sẽ đối chiếu hình cây trong sổ Bác tặng, rồi về nhóm bếp nấu nước lá ạ."}],
      hint:"Di chuột/ngón tay để soi vùng sáng, hoặc đưa Kiên đi quanh trại. Tìm cây ở mép rừng phía đông, đối chiếu lá nhỏ xẻ mảnh trong hình. Lấy củi ở đống củi đông nam, đá đánh lửa trên gốc cây gần bếp; tới nồi và gõ ba nhịp. Đợi nước lá nấu xong rồi tới bác Hai.",
      collisionZones:[{x:0,y:0,width:1200,height:335},{x:0,y:335,width:255,height:365},{x:1080,y:335,width:120,height:365},{x:255,y:580,width:825,height:120},{x:255,y:335,width:180,height:45}]},
    11:{name:"Bóng chim sắt",place:"Đường rừng Việt Bắc",date:"Cuối tháng 10/1946",background:"forestRoad",spawn:{x:500,y:470},
      intro:[{speaker:"Kiên",text:"Có tiếng máy bay phía trước! Cháu sẽ thổi còi báo động và hướng dẫn đoàn vào những tán cây lớn."},
        {speaker:"Nguyễn Lương Bằng",text:"Khi bóng máy bay tới, cháu có năm giây. Thổi còi bằng E, chọn từng nhóm rồi chọn chỗ núp hoặc nhấn C. Đợi máy bay qua hẳn rồi mới ra hiệu đi tiếp."}],
      hint:"Máy bay xuất hiện sau vài giây. E/Space để thổi còi; chạm nhóm hoặc Q để chọn, chạm gốc cây còn trống hoặc C để đưa nhóm đó vào núp. Cần cả ba nhóm vào chỗ trong 5 giây. Chờ máy bay qua, nhấn Đi tiếp. Máy bay quay lại một lần nữa, hãy quan sát bóng và làm tương tự.",
      groups:[{x:490,y:445,art:"forestHorse",name:"Ngựa thồ",width:100},{x:655,y:480,art:"forestBike",name:"Xe thồ",width:95},{x:825,y:520,art:"forestPorter",name:"Dân công",width:74}],
      shelters:[{x:230,y:385,name:"Gốc cổ thụ"},{x:335,y:355,name:"Sau tảng đá"},{x:420,y:345,name:"Tán cây rậm"}]}
  }
};
Object.assign(CHAPTER_ONE.items,CHAPTER_THREE.items);
for(const [id,spec] of Object.entries(CHAPTER_THREE.levels))GAME_LEVELS[Number(id)]=spec;

const CHAPTER_THREE_ART={
  files:{
    forestHarbor:"chuong_3_man_8_background_ben_tuyen_quang",forestHill:"chuong_3_man_9_background_duong_deo_tron_truot",forestNight:"chuong_3_man_10_background_dem_trong_rung",forestRoad:"chuong_3_background_duong_rung_viet_bac",
    forestHorse:"chuong_3_man_8_item_ngua_tho_cho_muoi",forestBike:"chuong_3_man_8_item_xe_dap_tho_cho_muoi",forestYoke:"chuong_3_man_8_item_quang_ganh_muoi",forestHerb:"chuong_3_man_10_item_cay_thanh_hao",
    forestKit:"chuong_3_man_10_item_cui_kho_noi_nau_va_da_danh_lua",forestPeople:"chuong_3_sprite_dan_cong_ngua_xe_tho",forestKien:"chuong_3_sprite_kien_hanh_dong_van_chuyen",forestBranches:"chuong_3_man_11_prop_dong_canh_la_nguy_trang",forestAllocationBoard:"chuong_3_man_8_ui_phan_bo_van_chuyen_muoi"
  },
  regions:{
    forestPorter:{source:"forestPeople",rect:[0,78,198,238]},forestWoman:{source:"forestPeople",rect:[0,339,180,249]},
    forestHorseWalk:{source:"forestPeople",rect:[0,609,235,205]},forestBikeWalk:{source:"forestPeople",rect:[0,836,188,229]},
    forestPush:{source:"forestKien",rect:[4,454,276,169]},forestCarry:{source:"forestKien",rect:[0,624,187,175]},forestWhistle:{source:"forestKien",rect:[0,799,179,174]},forestHide:{source:"forestKien",rect:[0,975,201,111]},
    forestWood:{source:"forestKit",rect:[5,390,618,531]},
    forestFlint:{source:"forestKit",rect:[365,790,525,300],outline:[[400,810],[541,827],[630,872],[669,909],[692,894],[728,894],[776,918],[839,968],[871,1016],[852,1041],[773,1061],[713,1058],[680,1034],[635,1002],[624,989],[580,1028],[548,1042],[501,1040],[449,1019],[405,981],[382,945],[374,910],[384,864]]},
    forestPot:{source:"forestKit",rect:[650,220,587,765]}
  }
};
