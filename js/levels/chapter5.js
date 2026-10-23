// Finale, adapted from the detailed GDD. Supplied source art stays intact.
const CHAPTER_FIVE = {
  title: "Chung cuộc · Đêm lịch sử",
  items: {
    supperIngredients: {name:"Giỏ rau rừng và cá suối",icon:"♧",description:"Nguyên liệu anh nuôi đã chuẩn bị cho bữa cơm chiến khu."},
    supperSpoon: {name:"Muỗng gỗ",icon:"◡",description:"Dùng muỗng xúc một ít muối Văn Lý rồi mang tới nồi canh."}
  },
  levels: {15: {
    name:"Bữa cơm có muối",place:"Lán bếp chiến khu",date:"Đêm 19/12/1946",background:"supperMoon",spawn:{x:600,y:555},
    intro:[{speaker:"Đài phát thanh",text:"Lời kêu gọi Toàn quốc kháng chiến vang lên. Tại chiến khu, kho muối đã an toàn; cả đoàn chuẩn bị bữa cơm trong đêm."},{speaker:"Anh nuôi",text:"Kiên giúp anh nhé! Lấy giỏ rau rừng và cá suối đã chuẩn bị, mang tới nồi canh. Đừng quên chiếc muỗng và chút muối Văn Lý của chúng ta."}],
    hint:"Lấy giỏ rau và cá ở bên trái, mang tới nồi canh. Nhặt muỗng gỗ, tới bao muối bên phải xúc muối rồi quay về nồi để rắc. Chờ canh chín, mời các chú bộ đội dùng bữa. Chạm đồ vật để Kiên đi tới hoặc dùng WASD và E.",
    collisionZones:[{x:0,y:0,width:1200,height:405},{x:0,y:645,width:1200,height:55},{x:0,y:405,width:100,height:240},{x:1110,y:405,width:90,height:240}]
  }}
};
Object.assign(CHAPTER_ONE.items,CHAPTER_FIVE.items);
Object.assign(GAME_LEVELS,CHAPTER_FIVE.levels);
const CHAPTER_FIVE_ART = {
  folder:"assets/images/chapter_5/chuong_5_man_15_9_assets_moi_da_dat_ten/",
  files:{supperMoon:"background_lan_bep_chien_khu_duoi_trang",supperWarm:"background_bep_trai_chien_khu_am_ap",supperPot:"prop_noi_canh_ca_suoi_tren_bep_lua",supperSalt:"item_bao_muoi_van_ly_mo_mieng",supperSpoon:"item_muong_go_xuc_muoi_trang",supperIngredients:"item_gio_rau_rung_va_ca_suoi",supperPanel:"ui_bang_nhiem_vu_nau_canh",supperSteam:"fx_hoi_nuoc_boc_len_sprite_sheet",supperSprinkle:"fx_hat_muoi_rac_vao_noi_sprite_sheet"},
  // Both sheets contain 24 visible frames, six columns and four unequal rows.
  sheets:{supperSteam:{xs:[0,249,491,729,970,1207,1448],ys:[0,259,517,791,1086]},supperSprinkle:{xs:[0,251,495,733,976,1206,1448],ys:[0,249,487,805,1086]}}
};
