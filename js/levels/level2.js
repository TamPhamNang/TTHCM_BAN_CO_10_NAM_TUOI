// M2 site plan: north is up. Buildings, paths and collision share this layout.
const M2_MAP = {
  revision: 4,
  background: "map_M2",
  spawn: {x: 970, y: 300},
  officer: {x: 600, y: 285},
  guard: {x: 700, y: 610},
  courtyard: {x: 605, y: 435, radiusX: 160, radiusY: 102},
  buildings: [
    {id: "warehouse", art: "nha_kho_2", label: "KHO", x: 205, y: 210, width: 210,
      footprint: {x: 120, y: 153, width: 170, height: 57}},
    {id: "unit", art: "don_vi", label: "ĐƠN VỊ", x: 600, y: 245, width: 285,
      footprint: {x: 485, y: 190, width: 230, height: 55}},
    {id: "quarters", art: "khu_nghi_ngoi", label: "SINH HOẠT / QUÂN SỰ", x: 975, y: 205, width: 220,
      footprint: {x: 882, y: 155, width: 185, height: 50}},
    {id: "kitchen", art: "khu_bep", label: "BẾP / NGHỈ", x: 995, y: 490, width: 230,
      footprint: {x: 900, y: 435, width: 190, height: 55}},
    {id: "logistics", art: "khu_nghi_ngoi", label: "LIÊN LẠC / HẬU CẦN", x: 230, y: 475, width: 220,
      footprint: {x: 138, y: 425, width: 185, height: 50}}
  ],
  props: [
    ["bang_thong_tin", 750, 262, 86], ["cot_co", 800, 450, 60],
    ["ghe_go", 465, 365, 70], ["ghe_go", 545, 365, 70],
    ["ghe_go", 735, 385, 72], ["ghe_go", 725, 505, 70],
    ["ghe_go", 170, 535, 66], ["bo_dam", 255, 525, 55],
    ["coc_chi_duong", 370, 310, 45],
    ["cot_den_duong", 475, 575, 38], ["cot_den_duong", 865, 320, 38],
    ["thung_go", 125, 253, 34], ["thung_go", 166, 259, 37],
    ["thung_go", 205, 255, 33], ["thung_go", 295, 519, 38],
    ["bao_tai", 280, 259, 62], ["bao_tai", 1090, 532, 65]
  ],
  roads: [
    {points: [[600, 700], [600, 585], [605, 435], [600, 278]], width: 65},
    {points: [[430, 350], [448, 500], [605, 555], [800, 520], [840, 410], [800, 320], [600, 280], [430, 350]], width: 42},
    {points: [[430, 350], [290, 285], [205, 220]], width: 44},
    {points: [[800, 320], [940, 275], [975, 218]], width: 44},
    {points: [[840, 410], [960, 520], [1000, 515]], width: 44},
    {points: [[448, 500], [335, 530], [230, 515]], width: 42}
  ],
  fenceZones: [
    // Fence, closed gate and tower are painted into map_M2.png; only their collision is added.
    {x: 50, y: 80, width: 1098, height: 12},
    {x: 50, y: 80, width: 12, height: 575},
    {x: 1136, y: 80, width: 12, height: 575},
    {x: 50, y: 647, width: 490, height: 14},
    {x: 675, y: 647, width: 473, height: 14},
    {x: 538, y: 612, width: 15, height: 49},
    {x: 662, y: 612, width: 15, height: 49},
    {x: 553, y: 625, width: 109, height: 36},
    {x: 720, y: 609, width: 65, height: 51}
  ],
  propZones: [
    {x: 715, y: 243, width: 70, height: 19},
    {x: 445, y: 350, width: 40, height: 15},
    {x: 525, y: 350, width: 40, height: 15},
    {x: 710, y: 370, width: 50, height: 15},
    {x: 705, y: 490, width: 40, height: 15},
    {x: 790, y: 435, width: 16, height: 15},
    {x: 239, y: 508, width: 34, height: 17},
    {x: 1066, y: 515, width: 48, height: 17}
  ]
};

M2_MAP.collisionZones = [
  ...M2_MAP.buildings.map(building => building.footprint),
  ...M2_MAP.fenceZones, ...M2_MAP.propZones
];
