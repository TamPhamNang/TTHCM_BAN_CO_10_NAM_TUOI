// Scene-specific proportions, in the fixed 1200 × 700 world. Feet and physics
// stay unchanged; normal sprites, action poses and NPCs share these profiles.
const ACTOR_LAYOUTS = {
  prologue:{player:1.5,npc:1.12,pose:1.5},
  1:{player:1.15,npc:1.2,pose:1.15},
  2:{player:1,npc:1.15,pose:1}, // The train choreographs both sitting poses at 1.55×.
  3:{player:1.1,npc:1.12,pose:1.1},
  4:{player:1,npc:1.12,pose:1}, // Fit the 64px puzzle cells.
  5:{player:1.25,npc:1.1,pose:1.25},
  6:{player:1.3,npc:1.15,pose:1.3},
  7:{player:1.25,npc:1.1,pose:1.25},
  8:{player:1.45,npc:1.2,pose:1.45,group:1.2},
  9:{player:1.4,npc:1.25,pose:1.4},
  10:{player:1.6,npc:1.6,pose:1.6},
  11:{player:1.55,npc:1.3,pose:1.55,group:1.2},
  12:{player:1.65,npc:1.4,pose:1.65},
  13:{player:1.65,npc:1.4,pose:1.65},
  14:{player:1.65,npc:1.35,pose:1.65,relay:1.35},
  15:{player:1.65,npc:1,pose:1.65}
};
