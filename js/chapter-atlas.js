// Pixel rectangles refer to the original source boards, not resized previews.
// Existing standalone PNGs remain the primary high-resolution scene/character art.
const CHAPTER_ATLAS = {
  revision: 6,
  boards: {
    overview: "Bảng tài sản Chương 1 Việt Nam 1940s",
    journey: "Bộ asset Chương 1_ Hành trình Việt Nam",
    period: "Bộ tài sản game Chương 1 Việt Nam 1945",
    sprites: "Bộ tài sản game Chương 1 Việt Nam",
    winterTrain: "Bảng Tài Sản Chuyến Tàu Mùa Đông"
  },
  regions: {
    trainGrandma: {board: "winterTrain", rect: [1569, 227, 59, 86], tolerance: 54},
    trainPassengerMan: {board: "winterTrain", rect: [295, 483, 62, 121], tolerance: 54},
    trainPassengerMother: {board: "winterTrain", rect: [378, 486, 65, 119], tolerance: 54},
    trainPassengerFarmer: {board: "winterTrain", rect: [849, 485, 65, 120], tolerance: 54},
    trainPassengerMerchant: {board: "winterTrain", rect: [521, 484, 62, 119], tolerance: 54},
    trainPassengerWoman: {board: "winterTrain", rect: [1101, 486, 67, 118], tolerance: 54},
    room: {board: "journey", rect: [508, 284, 232, 105], raw: true},
    tools: {board: "journey", rect: [1446, 165, 74, 80]},
    goldBar: {board: "journey", rect: [1181, 172, 70, 65]},
    saltBag: {board: "journey", rect: [1175, 282, 77, 86]},
    cargoCrate: {board: "journey", rect: [1354, 283, 80, 82]},
    cartRepaired: {board: "journey", rect: [1275, 677, 89, 69]},
    oilLamp: {board: "journey", rect: [588, 416, 39, 65]},
    lantern: {board: "journey", rect: [1455, 278, 65, 92]},
    stationClock: {board: "journey", rect: [269, 664, 47, 72]},
    rope: {board: "overview", rect: [1380, 200, 62, 71]},
    dockPlanks: {board: "period", rect: [943, 826, 82, 43], raw: true},
    mapPaper: {board: "period", rect: [94, 660, 89, 73]},
    saltPile: {board: "journey", rect: [1369, 682, 77, 45]},
    uiBag: {board: "journey", rect: [1230, 862, 61, 55]},
    uiNotebook: {board: "journey", rect: [1304, 862, 57, 55]},
    uiCompass: {board: "journey", rect: [1372, 860, 56, 58]},
    uiPause: {board: "period", rect: [1414, 879, 45, 36], components: false},
    uiSlot: {board: "overview", rect: [826, 910, 60, 61], raw: true},
    uiPaper: {board: "period", rect: [1064, 823, 169, 32], raw: true},
    uiHintBook: {board: "overview", rect: [1258, 904, 259, 97], raw: true},
    portraitBac: {board: "overview", rect: [459, 911, 75, 84]},
    portraitKien: {board: "journey", rect: [395, 33, 81, 72], raw: true},
    poseCrouch: {board: "sprites", rect: [302, 430, 38, 64], tolerance: 14},
    posePush: {board: "sprites", rect: [114, 515, 54, 62], tolerance: 14}
  }
};
