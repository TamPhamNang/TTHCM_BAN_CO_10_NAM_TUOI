Được. Từ đây ta chuyển từ **giai đoạn lựa chọn thiết kế** sang **giai đoạn dựng kiến trúc kỹ thuật HTML5**.

Tôi sẽ giữ nguyên các quyết định C1–C85 và **không tự thêm nội dung cốt truyện**. Trước mắt chưa viết gameplay code hoàn chỉnh; ta dựng bộ khung để sau này thêm từng màn mà không phải sửa lại kiến trúc.

# HTML5 Game Architecture v0.1

## 1. Công nghệ

| Thành phần            | Công nghệ             |
| --------------------- | --------------------- |
| Gameplay              | **HTML5 Canvas**      |
| Logic                 | **JavaScript ES6+**   |
| UI / Menu             | **HTML5 + Bootstrap** |
| Styling               | **CSS**               |
| Nhân vật / background | PNG / WebP            |
| PV / cinematic        | MP4 / WebM            |
| Âm thanh              | MP3 / OGG / WAV       |
| Lưu game              | `localStorage`        |

Không cần framework game lớn ở phiên bản đầu. Cấu trúc thuần HTML5 + JS sẽ dễ kiểm soát và phù hợp với game 20–30 phút.

---

# 2. Cấu trúc thư mục

Tôi đề xuất cấu trúc chính:

```text
game/
│
├── index.html
│
├── css/
│   ├── style.css
│   ├── game.css
│   └── ui.css
│
├── js/
│   ├── main.js
│   ├── game.js
│   ├── input.js
│   ├── camera.js
│   ├── player.js
│   ├── npc.js
│   ├── collision.js
│   ├── interaction.js
│   ├── mission.js
│   ├── checkpoint.js
│   ├── danger.js
│   ├── dialogue.js
│   ├── audio.js
│   ├── video.js
│   ├── save.js
│   ├── ui.js
│   └── levels/
│       ├── level1.js
│       ├── level2.js
│       ├── level3.js
│       ├── level4.js
│       └── level5.js
│
├── data/
│   ├── missions.json
│   ├── dialogues.json
│   └── levels.json
│
└── assets/
    ├── characters/
    ├── npcs/
    ├── environments/
    ├── objects/
    ├── effects/
    ├── audio/
    └── video/
```

Điểm quan trọng là **data được tách khỏi code**.

Ví dụ sau này muốn đổi thời gian nhiệm vụ M4, ta ưu tiên sửa dữ liệu thay vì sửa logic JavaScript.

---

# 3. Kiến trúc tổng thể

Game sẽ có một **Game State Machine**.

```text
                    ┌─────────────┐
                    │ MAIN_MENU   │
                    └──────┬──────┘
                           │
                     Bắt đầu/Tiếp tục
                           │
                           ▼
                    ┌─────────────┐
                    │  CINEMATIC  │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  GAMEPLAY   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           PAUSE        FAILED      COMPLETE
              │            │            │
              │            ▼            ▼
              │        CHECKPOINT    NEXT LEVEL
              │
              └──────────► GAMEPLAY
```

Ngoài ra còn có:

```text
SETTINGS
DIALOGUE
MISSION_COMPLETE
```

Nhưng chúng là các trạng thái/UI overlay phục vụ state chính.

---

# 4. `main.js`

Đây là điểm khởi động game.

Nhiệm vụ của `main.js` rất đơn giản:

```text
Khởi tạo Canvas
      ↓
Load dữ liệu
      ↓
Load assets
      ↓
Khởi tạo Game
      ↓
Chạy Game Loop
```

Nó **không nên chứa logic nhiệm vụ M3/M4**, nếu không file sẽ nhanh chóng trở thành một file khổng lồ.

---

# 5. Game Loop

Trái tim của game là:

```javascript
function gameLoop(timestamp) {
    update(timestamp);
    render();

    requestAnimationFrame(gameLoop);
}
```

Trong đó:

### `update()`

Xử lý:

* keyboard
* movement
* collision
* animation
* NPC
* interaction
* mission
* timer
* danger
* HP
* checkpoint
* trạng thái game

### `render()`

Vẽ:

```text
Background
     ↓
Objects
     ↓
NPC
     ↓
Player
     ↓
Effects
```

Sau đó UI HTML/Bootstrap được hiển thị ở lớp phía trên Canvas.

---

# 6. Player

`player.js` quản lý toàn bộ nhân vật chính.

Có thể có cấu trúc:

```javascript
class Player {
    x;
    y;

    direction;
    state;

    hp;
    maxHp;

    speed;
    runSpeed;

    carryingSupply;

    update();
    move();
    interact();
    pickupSupply();
    deliverSupply();
    dodge();
    takeDamage();
    recover();
    render();
}
```

### State

```text
IDLE
WALK
RUN
PICKUP
CARRY
PLACE
INJURED
RECOVERY
DODGE
```

### Direction

```text
UP
DOWN
LEFT
RIGHT
```

Như vậy C32 + C39 + C40 đã được chuyển trực tiếp thành hệ thống animation.

---

# 7. Input

`input.js` chịu trách nhiệm:

```text
WASD → di chuyển
E    → tương tác
Shift → chạy
Space → dodge
Esc  → pause
```

Quan trọng: `input.js` **không tự quyết định nhiệm vụ**.

Nó chỉ nói:

> Người chơi vừa nhấn E.

Sau đó `interaction.js` mới quyết định:

> E đang được dùng để nói chuyện, nhặt hàng hay giao hàng?

Cách này giúp hệ thống không bị rối.

---

# 8. Camera

`camera.js` xử lý C46:

> Camera bám nhân vật liên tục.

Ví dụ logic:

```javascript
camera.x = player.x - canvas.width / 2;
camera.y = player.y - canvas.height / 2;
```

Sau đó giới hạn camera theo kích thước map.

```text
Map
┌───────────────────────────────┐
│                               │
│       ┌───────────────┐       │
│       │    CAMERA     │       │
│       │       P       │       │
│       └───────────────┘       │
│                               │
└───────────────────────────────┘
```

---

# 9. Collision

`collision.js` quản lý những vùng mà nhân vật không được đi xuyên qua.

Không cần đưa collision vào chính ảnh background.

Ta có thể định nghĩa:

```javascript
const collisionZones = [
    {
        x: 120,
        y: 300,
        width: 200,
        height: 50
    }
];
```

Trong game thật:

```text
Background
████████████████████████

Collision
     ┌──────────────┐
     │   WALL       │
     └──────────────┘

Player
       ●
```

Collision **vô hình** trong game bình thường.

Debug Mode mới hiện:

```text
┌──────────────┐
│ COLLISION    │
└──────────────┘
```

---

# 10. Mission System

Đây sẽ là một trong những module quan trọng nhất.

`mission.js` quản lý:

```text
Tên nhiệm vụ
Mục tiêu
Timer
Supply
Mission zones
Completion
Failure
```

Ví dụ dữ liệu:

```javascript
{
    id: "level3_main",
    name: "...",
    objective: "...",
    timeLimit: 180,
    checkpoint: "cp_01"
}
```

Ta **chưa điền nội dung cụ thể** vì phần đó vẫn thuộc thiết kế game của bạn.

---

# 11. Mission Zone

Mission zone là vùng vô hình trên map.

Ví dụ:

```javascript
{
    type: "delivery",
    x: 800,
    y: 450,
    width: 100,
    height: 100
}
```

Khi player đi vào:

```text
Player
   ↓
Có nằm trong zone?
   ↓
YES
   ↓
Đủ điều kiện?
   ↓
YES
   ↓
Hoàn thành bước
```

Với C20 và C21:

> Vào vùng + nhấn E khi cần tương tác / animation giao hàng theo loại zone.

---

# 12. Supply System

M3/M4 sẽ sử dụng hệ thống vật tư.

Player có:

```javascript
carryingSupply = null;
```

Khi nhặt:

```text
E
↓
Pickup
↓
Animation PICKUP
↓
carryingSupply = true
↓
Animation CARRY
```

Khi giao:

```text
Đến zone
↓
E / điều kiện giao
↓
Animation PLACE
↓
Âm thanh
↓
Supply complete
```

Đặc biệt theo C26:

> Khi đang mang hàng mà gặp nguy hiểm, **không được bỏ hàng**.

---

# 13. Danger System

`danger.js` xử lý các vùng nguy hiểm và đợt không kích.

Có thể có:

```text
DANGER_IDLE
DANGER_WARNING
DANGER_ACTIVE
DANGER_END
```

Khi bắt đầu đợt không kích:

```text
WARNING
↓
Siren
↓
Screen shake
↓
Flash
↓
Danger active
```

Nếu nhân vật không ở shelter:

```text
Damage
↓
HP giảm
```

Nếu HP = 0:

```text
INJURED / DOWN
↓
FAIL
↓
CHECKPOINT
```

---

# 14. Shelter

Shelter chỉ là một loại zone đặc biệt:

```javascript
{
    type: "shelter",
    x: ...,
    y: ...,
    width: ...,
    height: ...
}
```

Game kiểm tra:

```javascript
playerInsideShelter
```

khi đợt không kích xảy ra.

Không cần xây hệ thống shelter phức tạp.

---

# 15. Checkpoint

`checkpoint.js` lưu:

```text
checkpoint ID
player position
mission progress
supply progress
```

Khi thất bại:

```text
FAIL
 ↓
Load checkpoint
 ↓
Restore state
 ↓
GAMEPLAY
```

Điều này đáp ứng C59.

---

# 16. Save System

`save.js` sử dụng:

```javascript
localStorage
```

Dữ liệu tổng thể có thể có dạng:

```javascript
{
    currentLevel: 3,
    completedLevels: [1, 2],
    checkpoint: "level3_cp01"
}
```

Sau này có thể mở rộng.

C61 yêu cầu **lưu toàn bộ tiến trình**, nên hệ thống Save không chỉ lưu checkpoint hiện tại.

---

# 17. Dialogue System

`dialogue.js` quản lý hộp thoại phía dưới màn hình.

Ví dụ:

```text
┌──────────────────────────────────────────────┐
│ Nhân vật:                                    │
│ Nội dung hội thoại...                        │
│                                              │
│                                      [E]     │
└──────────────────────────────────────────────┘
```

Dữ liệu hội thoại tách riêng:

```json
{
    "dialogue_id": "example_01",
    "speaker": "NPC",
    "text": "..."
}
```

Tạm thời chỉ thiết kế **hệ thống**, chưa điền lời thoại lịch sử.

---

# 18. NPC

`npc.js` quản lý NPC đơn giản theo C51.

NPC có thể:

```text
IDLE
WALK
INTERACT
```

Nhưng không cần AI phức tạp.

Mỗi NPC có:

```javascript
{
    id,
    x,
    y,
    dialogueId,
    interactionRadius
}
```

Khi player đến gần:

```text
Player
   ↓
Trong interaction radius?
   ↓
Hiện "E - Nói"
```

---

# 19. UI

`ui.js` quản lý HUD:

```text
Mission
Objective
Timer
HP
Supply
Interaction prompt
Mission complete
Pause menu
```

Bootstrap chủ yếu phục vụ phần UI HTML, còn gameplay vẫn nằm trên Canvas.

---

# 20. Video System

`video.js` quản lý PV.

Các trạng thái:

```text
VIDEO_START
VIDEO_PLAYING
VIDEO_ENDED
```

Khi video kết thúc:

```javascript
video.addEventListener("ended", () => {
    nextState();
});
```

PV:

```text
assets/video/
├── opening.mp4
└── ending.mp4
```

Sau này M1 và cinematic cuối có thể dùng các file tương ứng.

---

# 21. Audio System

`audio.js` quản lý:

```text
BGM
SFX
```

Ví dụ:

```text
assets/audio/
├── bgm.mp3
├── footsteps.wav
├── running.wav
├── pickup.wav
├── place.wav
├── siren.wav
└── danger.wav
```

BGM xuyên suốt game theo C69.

---

# 22. Level System

Mỗi màn sẽ có file riêng:

```text
level1.js
level2.js
level3.js
level4.js
level5.js
```

Nhưng file level **không nên chứa toàn bộ engine**.

Nó chỉ mô tả:

```text
Background
Player spawn
NPC
Collision
Mission zones
Shelter
Danger zones
Checkpoint
Mission ID
```

Ví dụ:

```javascript
const level3 = {
    id: "level3",

    background: "...",

    playerSpawn: {
        x: 100,
        y: 200
    },

    collisionZones: [],

    missionZones: [],

    shelterZones: [],

    dangerZones: [],

    checkpoints: []
};
```

---

# 23. Kiến trúc 5 màn hiện tại

Không tự thêm nội dung mới, chỉ chuyển những gì bạn đã chốt thành cấu trúc:

```text
LEVEL 1
└── Cinematic
    └── Không gameplay

LEVEL 2
└── Tutorial
    └── Doanh trại
    └── Nhận nhiệm vụ đầu tiên

LEVEL 3
└── Vận chuyển
    └── 1 kiện hàng
    └── Đường có nhánh + vật cản

LEVEL 4
└── Vận chuyển dưới nguy hiểm
    └── 3 điểm tiếp tế
    └── Một đợt không kích lớn
    └── Shelter / danger

LEVEL 5
└── Sau trận chiến
    └── Trở về đơn vị
    └── Hội thoại với đồng đội
    └── Sau đó dẫn tới phần kết cinematic
```

**Chưa bổ sung nội dung nhiệm vụ cụ thể ngoài những gì bạn đã chọn.**

---

# 24. Kiến trúc cuối cùng

Toàn bộ game có thể hình dung:

```text
                         index.html
                             │
                             ▼
                          main.js
                             │
                             ▼
                         Game Engine
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
      INPUT               UPDATE                RENDER
        │                    │                    │
        │        ┌───────────┼───────────┐        │
        │        │           │           │        │
        │        ▼           ▼           ▼        │
        │      Player     Mission      Danger     │
        │        │           │           │        │
        │        ▼           ▼           ▼        │
        │    Collision   Checkpoint     HP        │
        │        │           │           │        │
        └────────┴───────────┴───────────┴────────┘
                             │
                             ▼
                            UI
                             │
             ┌───────────────┼──────────────┐
             ▼               ▼              ▼
          Dialogue        Video           Audio
```