// GDD Part 4: November–early December 1946. All lettering remains live text.
const CHAPTER_FOUR = {
  title:"Nước rút trên chiến khu",
  items:{
    caveKnife:{name:"Dao phát quang",icon:"╱",description:"Đạo cụ để mở lối dây leo vào hang sau khi đã khảo sát dấu vết."},
    caveBamboo:{name:"Tre nứa làm sạp",icon:"≋",description:"Gom đủ ba bó tre để dựng sạp cao, cách nền hang ẩm."},
    cavePalm:{name:"Lá cọ lót sạp",icon:"♧",description:"Lót trên mặt tre đã ghép và buộc chắc để bảo vệ muối."},
    caveTools:{name:"Dụng cụ làm sạp",icon:"◇",description:"Búa gỗ, cưa và dây buộc dùng để lắp sạp chống ẩm."}
  },
  buildSteps:["Dựng chân cao","Ghép mặt tre","Buộc dây chắc","Lót lá cọ"],
  workshop:{x:860,bottom:515,width:300,scaleY:.70},
  relay:{duration:210,batch:5,total:100,flight:7.4,cadence:1,stationDelay:.6,cycle:1,receiveAt:.12,releaseAt:.6,
    people:[{x:540,y:537},{x:650,y:507},{x:760,y:477},{x:870,y:447},{x:980,y:417}]},
  levels:{
    12:{name:"Dấu vết hang dơi",place:"Lối mòn Việt Bắc",date:"Tháng 11/1946",background:"caveTrail",spawn:{x:510,y:555},
      intro:[{speaker:"Nhật ký của Kiên",text:"Tháng 11 năm 1946. Đoàn đã tới Việt Bắc, nhưng còn phải tìm nơi khô ráo giấu muối."},{speaker:"Nguyễn Lương Bằng",text:"Cháu xem la bàn, lần theo đàn kiến và dấu phân dơi khô. Tìm dao phát quang, khảo sát đủ dấu vết rồi mới mở lối vào hang nhé."}],
      hint:"Mở La bàn (Q), nhìn dấu chỉ trên lối mòn và chọn hướng Đông Bắc. Nhặt dao trên tảng đá thấp; quan sát đàn kiến và dấu phân dơi. Tới dây leo trước cửa hang, tương tác rồi nhấn Phát quang ba lần. Mỗi lần chờ Kiên làm xong; không cần căn lực.",
      collisionZones:[{x:0,y:0,width:1200,height:420},{x:0,y:420,width:150,height:280},{x:1060,y:420,width:140,height:280},{x:150,y:630,width:910,height:70}]},
    13:{name:"Xây lán chống ẩm",place:"Xưởng tre trong hang",date:"Giữa tháng 11/1946",background:"caveWorkshop",spawn:{x:595,y:545},
      intro:[{speaker:"Nguyễn Lương Bằng",text:"Khí hậu núi rất ẩm, không thể để muối trực tiếp trên đất. Ta dựng sạp cao và lót kín mặt sạp nhé."},{speaker:"Kiên",text:"Cháu gom ba bó tre, lá cọ và dụng cụ. Cháu sẽ dựng chân, ghép mặt, buộc dây rồi lót lá cho thật chắc!"}],
      hint:"Lấy ba bó tre trên nền khô bên trái, bộ dụng cụ cạnh bàn và cuộn lá cọ bên phải. Tới chỗ dựng sạp trên nền khô bên phải hang. Chọn đúng thứ tự: dựng chân cao → ghép mặt tre → buộc dây → lót lá cọ. Chọn sai chỉ được nhắc để thử lại, không mất vật liệu.",
      collisionZones:[{x:0,y:0,width:1200,height:365},{x:0,y:365,width:150,height:335},{x:1080,y:365,width:120,height:335},{x:150,y:625,width:930,height:75}]},
    14:{name:"Cuộc đua với bình minh",place:"Cửa hang Việt Bắc",date:"Đầu tháng 12/1946",background:"caveDawn",spawn:{x:760,y:477},
      intro:[{speaker:"Nguyễn Lương Bằng",text:"Còn một trăm bao muối ngoài cửa hang! Cả tổ vào hàng, chuyền đều tay trước khi trời sáng."},{speaker:"Kiên",text:"Cháu đứng giữa nhận rồi chuyền tiếp. Mỗi lượt tổ đưa vào năm bao; khi mọi người sẵn sàng cháu mới bắt đầu. Không cần nhấn thật nhanh đâu ạ!"}],
      hint:"Chọn Bắt đầu khi sẵn sàng. E/Space hoặc nút chính lần lượt Đón 5 bao rồi Chuyền 5 bao; đợi cả lượt tới sạp rồi tiếp tục. Có 210 giây cho 100 bao. Không có vùng căn lực; đọc sổ hoặc tạm dừng sẽ dừng đồng hồ."}
  }
};
Object.assign(CHAPTER_ONE.items,CHAPTER_FOUR.items);
for(const [id,spec] of Object.entries(CHAPTER_FOUR.levels))GAME_LEVELS[Number(id)]=spec;
const CHAPTER_FOUR_ART={
  revision:16,
  files:{
    caveTrail:"chuong_4_man_12_background_loi_mon_vao_hang_viet_bac",caveWorkshop:"chuong_4_man_13_background_chua_dung_sap_v2",caveDawn:"chuong_4_man_14_background_cua_hang_luc_binh_minh",
    caveKnife:"chuong_4_man_12_item_dao_phat_quang_va_bao_vai",caveTracks:"chuong_4_man_12_item_dau_phan_doi_va_vet_chan_thu",caveCompass:"chuong_4_man_12_item_la_ban_dong_cua_kien",
    caveBamboo:"chuong_4_man_13_item_bo_tre_nua",cavePalm:"chuong_4_man_13_item_cuon_la_co_lot_sap",caveTools:"chuong_4_man_13_prop_bo_dung_cu_lam_sap_bua_go_cua_va_day_buoc",cavePlatform:"chuong_4_man_13_prop_sap_tre_chong_am",
    caveVines:"Rèm dây leo rừng nhiệt đới lộng lẫy",caveLight:"chuong_4_man_14_fg_tia_sang_binh_minh_xuyen_cua_hang",caveStock:"chuong_4_man_14_prop_chong_bao_muoi_xep_cho_chuyen_tay",caveKien:"chuong_4_sprite_kien_24fps_tim_hang_chat_tre_chuyen_muoi",
    cavePlatformLegs:"chan_sap_tre",cavePlatformDeck:"ghep_mat_tre",cavePlatformRopes:"buoc_day_chac",cavePlatformPalm:"lot_la_co",
    relayKien:"chuong_4_man_14_sprite_vi_tri_01_kien_nhan_va_chuyen_bao_30fps",
    relayPorter:"chuong_4_man_14_sprite_vi_tri_02_nhan_cong_chuyen_bao_30fps",
    relayLoader:"chuong_4_man_14_sprite_vi_tri_03_nhan_cong_xep_bao_vao_dong_30fps",
    relayMiddle:"huong_4_man_14_sprite_vi_tri_05_nhan_cong_trung_gian_chuyen_bao_30fps",
    relayLast:"chuong_4_man_14_sprite_vi_tri_06_nhan_cong_nhan_bao_cuoi_hang_30fps"
  },
  // Row separators follow the supplied artwork, not a uniform square grid.
  relaySheets:{
    relayKien:{rows:[0,238,472,699,923,1145],receive:5,release:23,idle:29},
    relayPorter:{rows:[0,232,458,685,913,1145],receive:6,release:23,idle:29},
    relayLoader:{rows:[0,259,489,728,946,1145],receive:8,release:29,idle:0},
    relayMiddle:{rows:[0,265,525,785,1055],receive:3,release:19,idle:23},
    relayLast:{rows:[0,242,491,730,945,1145],receive:2,release:24,idle:29}
  },
  relayRoles:["relayLoader","relayPorter","relayKien","relayMiddle","relayLast"],
  // Keep every stage on its original common canvas so scale and ground stay stable.
  platformStages:["cavePlatformLegs","cavePlatformDeck","cavePlatformRopes","cavePlatformPalm"],
  regions:{caveKienCompass:[0,0,236,294],caveKienStand:[0,298,235,266],caveKienCut:[0,571,242,248],caveKienCarry:[0,820,240,265]}
};
