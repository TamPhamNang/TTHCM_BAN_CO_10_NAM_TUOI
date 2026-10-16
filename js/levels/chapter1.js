// Story source: GDD.md, detailed Part 1. Durations and puzzle size are tunable.
const CHAPTER_ONE = {
  title: "Mật lệnh mùa đông",
  prologue: [
    {speaker: "Tháng 11/1945 · Hà Nội", text: "Gió mùa đông bắc tràn về. Trong căn phòng đơn sơ, Bác Hồ và đồng chí Nguyễn Lương Bằng đang bàn việc bên tấm bản đồ. Kiên, cậu lính trẻ 15 tuổi, đứng nghiêm bên cửa."},
    {speaker: "Bác Hồ", text: "Chú Bằng, chú phải lo cho kỳ được số muối này mang lên Việt Bắc."},
    {speaker: "Nguyễn Lương Bằng · Sao Đỏ", text: "Thưa Bác, 2 vạn tấn là một con số khổng lồ, cháu e là nhân lực..."},
    {speaker: "Bác Hồ", text: "Ta có cả một dân tộc cơ mà. Cháu Kiên, cháu có dám cùng bác Bằng làm nhiệm vụ này không?"},
    {speaker: "Kiên", text: "Dạ, có ạ!"},
    {speaker: "Bác Hồ", text: "Bác tặng cháu cuốn sổ tay và chiếc la bàn đồng. Cuốn sổ ghi những điều cần thiết, khi nào khó khăn quá hãy mở ra. La bàn sẽ giúp cháu không lạc hướng."}
  ],
  items: {
    compass: {name: "La bàn đồng", icon: "◈", description: "Món quà của Bác, giúp Kiên xác định phương hướng."},
    notebook: {name: "Sổ tay của Bác", icon: "▤", description: "Chạm để xem gợi ý cho màn hiện tại."},
    disguise: {name: "Áo nông dân", icon: "♟", description: "Bộ đồ cải trang thành cậu bé phụ việc buôn vải."},
    pass: {name: "Giấy thông hành", icon: "▧", description: "Giấy thông hành giả dùng khi lính gác kiểm tra."},
    gold: {name: "Túi tiền vàng", icon: "◆", description: "Quỹ cách mạng để mua muối. Phải giữ thật kín đáo."},
    tools: {name: "Dụng cụ sửa xe", icon: "⚒", description: "Dùng để sửa bánh xe kéo muối của bác diêm dân."},
    bucket: {name: "Gàu nước", icon: "♜", description: "Mang đến giếng để múc nước cho bà con."},
    water: {name: "Gàu nước đầy", icon: "≈", description: "Nước giếng mát lành cho các cô chú đang nghỉ trưa."}
  },
  trainLayout: {
    standing: {x: 606, y: 392}, seat: {x: 638, y: 323},
    grandma: {x: 855, bottom: 364, height: 126},
    basket: {x: 937, bottom: 387, width: 73, hit: {x: 891, y: 295, width: 94, height: 103}},
    goldSlots: Array.from({length: 3}, (_, i) => ({x: 318 + i * 84, y: 550, width: 70, height: 44})),
    sitButton: {x: 628, y: 550, width: 235, height: 48},
    passengers: [
      {art: "trainPassengerMan", x: 168, bottom: 365, height: 130},
      {art: "trainPassengerMother", x: 321, bottom: 365, height: 126, mirror: true},
      {art: "trainPassengerFarmer", x: 1029, bottom: 365, height: 129},
      {art: "trainPassengerMerchant", x: 470, bottom: 513, height: 138},
      {art: "trainPassengerWoman", x: 746, bottom: 513, height: 136, mirror: true}
    ]
  },
  levels: [null,
    {
      name: "Nhiệm vụ đầu tiên", place: "Hà Nội", date: "Tháng 11/1945", spawn: {x: 600, y: 420},
      intro: [{speaker: "Nguyễn Lương Bằng", text: "Kiên, hãy tìm bộ áo nông dân, giấy thông hành và túi tiền vàng trong căn cứ. Chuẩn bị đủ rồi gặp bác ở lối ra để lên tàu."}],
      objects: [
        {id: "disguise", x: 835, y: 284, label: "Áo nông dân · Giường nghỉ", icon: "♟", art: {x: 826, bottom: 235, width: 40, squashY: .55, angle: .08, labelY: 183}},
        {id: "pass", x: 455, y: 435, label: "Giấy thông hành · Bàn trà", icon: "▧", art: {x: 456, bottom: 375, width: 27, squashY: .45, angle: -.16, labelY: 333}},
        {id: "gold", x: 238, y: 481, label: "Túi tiền vàng · Hòm kho", icon: "◆", art: {x: 169, bottom: 456, width: 31, labelY: 405}},
        {id: "departure", x: 840, y: 590, label: "Bác Lương Bằng · Lên tàu", npc: true}
      ],
      hint: "Cháu nhớ đi nhẹ, nói khẽ, cẩn thận đừng đánh rơi đồ nhé. Áo ở giường nghỉ phía đông nhà chính, giấy trên bàn trà giữa sân, túi vàng trên hòm kho phía tây nam. Đến sát mép bàn, giường hoặc hòm để lấy đồ. Đủ ba món thì gặp bác Bằng ở cổng phía đông nam.",
      collisionZones: [
        {x: 0, y: 0, width: 1200, height: 80},
        {x: 80, y: 60, width: 620, height: 220},
        {x: 720, y: 80, width: 180, height: 170},
        {x: 950, y: 240, width: 250, height: 160},
        {x: 30, y: 330, width: 190, height: 135},
        {x: 370, y: 360, width: 140, height: 50},
        {x: 0, y: 560, width: 765, height: 140},
        {x: 940, y: 540, width: 260, height: 160},
        {x: 0, y: 80, width: 50, height: 480}
      ]
    },
    {
      name: "Qua mắt lính xét vé", place: "Tàu đi Nam Định", date: "Tháng 12/1945", spawn: {x: 606, y: 392}, timeLimit: 45,
      intro: [{speaker: "Nguyễn Lương Bằng", text: "Lính gác đang tới kiểm tra! Hãy giấu ba thỏi vàng xuống đáy thúng cam của bà cụ, rồi ngồi yên và chuẩn bị giấy thông hành."}],
      hint: "Chạm từng thỏi vàng rồi chạm thúng cam, hoặc kéo vàng vào thúng. Giấu đủ ba thỏi, chọn Ngồi yên, sau đó mở ba lô và đưa đúng Giấy thông hành. Thời gian dừng khi mở sổ, ba lô hoặc tạm dừng."
    },
    {
      name: "Thuyết phục đồng bào", place: "Vựa muối Văn Lý", date: "Tháng 1/1946", spawn: {x: 440, y: 310},
      intro: [{speaker: "Nguyễn Lương Bằng", text: "Đã tới Văn Lý. Bà con còn dè dặt với người lạ. Cháu hãy hỏi thăm, giúp mọi người sửa xe và lấy nước trước khi ngỏ lời mua muối."}],
      objects: [
        {id: "tools", x: 210, y: 160, label: "Dụng cụ sửa xe", icon: "⚒"},
        {id: "cart", x: 880, y: 225, label: "Bác diêm dân · Xe hỏng", npc: true},
        {id: "bucket", x: 310, y: 260, label: "Gàu nước", icon: "♜"},
        {id: "well", x: 410, y: 220, label: "Giếng làng", icon: "≈"},
        {id: "villagers", x: 660, y: 230, label: "Cô chú nghỉ trưa", npc: true},
        {id: "agreement", x: 550, y: 310, label: "Bác Lương Bằng · Gom muối", npc: true}
      ],
      hint: "Lấy dụng cụ ở mái lán phía tây bắc rồi đến bác có xe hỏng phía đông. Lấy gàu cạnh đường phía tây, múc nước ở giếng làng rồi mang cho cô chú nghỉ trưa ở giữa sân. Giúp đủ hai việc, gặp bác Bằng tại lối xuống ruộng muối.",
      collisionZones: [
        {x: 0, y: 0, width: 1200, height: 70},
        {x: 100, y: 0, width: 200, height: 130},
        {x: 480, y: 0, width: 300, height: 160},
        {x: 865, y: 0, width: 240, height: 120},
        {x: 0, y: 355, width: 1200, height: 345},
        {x: 0, y: 0, width: 95, height: 355},
        {x: 1120, y: 0, width: 80, height: 355}
      ]
    },
    {
      name: "Đêm bốc vác bí mật", place: "Bến thuyền Văn Lý", date: "Tháng 3/1946", spawn: {x: 2, y: 5},
      movement: {walkDuration: .30, pushDuration: .40},
      intro: [{speaker: "Nguyễn Lương Bằng", text: "Phải chuyển muối xuống thuyền trước bình minh. Đẩy ba bao vào ba ô khoang đánh dấu. Khi đèn quét qua, hãy ngồi thấp và chờ. Nếu đẩy nhầm, cháu có thể lùi một bước."}],
      hint: "Đứng bên trái mỗi bao để đẩy sang phải tới ô khoang. Đi vòng qua lối trống để đổi hàng. Đèn quét theo cột: khi có cảnh báo, chạm Ngồi thấp (C) và chờ đèn đi qua. Z lùi một bước, R xếp lại màn.",
      board: ["##########", "#        #", "#  $   . #", "#  $   . #", "#  $   . #", "#        #", "##########"]
    }
  ]
};

class DockPuzzle {
  constructor(saved = null) {
    this.walls = []; this.goals = []; this.boxes = [];
    CHAPTER_ONE.levels[4].board.forEach((row, y) => [...row].forEach((cell, x) => {
      if (cell === "#") this.walls.push({x, y});
      if (cell === ".") this.goals.push({x, y});
      if (cell === "$") this.boxes.push({x, y});
    }));
    this.player = {...CHAPTER_ONE.levels[4].spawn};
    this.history = []; this.moves = 0; this.elapsed = 0; this.crouched = false;
    if (saved) Object.assign(this, saved);
  }
  at(points, x, y) { return points.some(p => p.x === x && p.y === y); }
  beamColumn() { const phase = Math.floor(this.elapsed / 2) % 14; return 1 + (phase <= 7 ? phase : 14 - phase); }
  exposed(x = this.player.x) { return Math.abs(x - this.beamColumn()) <= .5; }
  move(dx, dy) {
    if (this.crouched || Math.abs(dx) + Math.abs(dy) !== 1) return false;
    const x = this.player.x + dx, y = this.player.y + dy;
    if (x < 0 || x >= 10 || y < 0 || y >= 7 || this.at(this.walls, x, y)) return false;
    const box = this.boxes.find(p => p.x === x && p.y === y);
    if (box && (this.at(this.walls, x + dx, y + dy) || this.at(this.boxes, x + dx, y + dy))) return false;
    this.history.push({player: {...this.player}, boxes: this.boxes.map(p => ({...p})), moves: this.moves});
    if (this.history.length > 200) this.history.shift();
    if (box) { box.x += dx; box.y += dy; }
    this.player = {x, y}; this.moves++;
    return true;
  }
  undo() { const last = this.history.pop(); if (last) Object.assign(this, last); }
  solved() { return this.goals.every(g => this.at(this.boxes, g.x, g.y)); }
  snapshot() {
    return {player: {...this.player}, boxes: this.boxes.map(p => ({...p})), history: this.history,
      moves: this.moves, elapsed: this.elapsed, crouched: this.crouched};
  }
}
