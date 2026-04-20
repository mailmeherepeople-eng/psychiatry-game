// Clinic map. Each room is drawn in world coords (WORLD.width x WORLD.height).
// Side view: the player walks along a horizontal floor strip near the bottom.
//
// Coordinate conventions:
//   - obstacles & doors are plain AABBs (x, y, w, h)
//   - player.x is center x, player.y is the feet y (bottom of the sprite)
//   - walkable floor is WORLD.floor.y1 .. WORLD.floor.y2 (player feet must stay in range)

export const WORLD = {
  width: 960,
  height: 540,
  floor: { y1: 380, y2: 500 },
  // Horizontal lane the player walks along by default (clear of every obstacle
  // whose bottom is at or above the back-wall line y1).
  walkLane: { y1: 458, y2: 500 },
};

export const PLAYER = {
  w: 38,
  h: 72,
  speed: 340,
  color: '#2c3340',
  skin: '#d4b896',
  hair: '#2a1f1a',
};

export const ROOMS = {
  reception: {
    id: 'reception',
    label: 'Reception',
    palette: {
      wallTop:   '#c3a97a',
      wallMid:   '#9e8558',
      floor:     '#6b5136',
      floorDark: '#4a371f',
      accent:    '#e2c690',
    },
    obstacles: [
      { x: 380, y: 252, w: 260, h: 128, label: 'Reception Desk', type: 'desk' },
      { x: 150, y: 324, w: 210, h: 56,  label: 'Waiting Sofa',   type: 'sofa' },
    ],
    doors: [
      { x: 830, y: 230, w: 96,  h: 170, to: 'corridor', spawn: { x: 180, y: 482 }, label: 'Corridor' },
      { x: 670, y: 230, w: 90,  h: 170, to: 'kitchen',  spawn: { x: 180, y: 482 }, label: 'Kitchen' },
    ],
    npcs: [
      { id: 'nurse-priya', x: 510, y: 410, color: '#3a7b7b', label: 'Priya', role: 'Head Nurse' },
    ],
    decor: [
      { kind: 'entry-door', x: 60, y: 220 },
      { kind: 'sign', x: 265, y: 182, text: 'Welcome' },
      { kind: 'plant', x: 905, y: 430 },
      { kind: 'wall-art', x: 740, y: 150 },
    ],
    spawn: { x: 60, y: 482 },
  },

  corridor: {
    id: 'corridor',
    label: 'Corridor',
    palette: {
      wallTop:   '#bfb396',
      wallMid:   '#8e836a',
      floor:     '#5b4a30',
      floorDark: '#3d2e1a',
      accent:    '#d6c7a0',
    },
    obstacles: [
      { x: 210, y: 326, w: 120, h: 54,  label: 'Bench',  type: 'sofa' },
      { x: 680, y: 330, w: 80,  h: 50,  label: 'Plant',  type: 'plant' },
    ],
    doors: [
      { x: 30,  y: 230, w: 88, h: 170, to: 'reception',     spawn: { x: 790, y: 482 }, label: 'Reception' },
      { x: 440, y: 230, w: 92, h: 170, to: 'office',        spawn: { x: 160, y: 482 }, label: 'Office' },
      { x: 840, y: 230, w: 88, h: 170, to: 'patient-room',  spawn: { x: 160, y: 482 }, label: 'Interview Room' },
    ],
    npcs: [],
    decor: [
      { kind: 'wall-art', x: 370, y: 150 },
      { kind: 'sign', x: 610, y: 160, text: 'This Way' },
    ],
    spawn: { x: 160, y: 482 },
  },

  'patient-room': {
    id: 'patient-room',
    label: 'Interview Room',
    palette: {
      wallTop:   '#aeb4bc',
      wallMid:   '#7f858f',
      floor:     '#50525a',
      floorDark: '#33343a',
      accent:    '#cdd3dc',
    },
    obstacles: [
      { x: 360, y: 260, w: 230, h: 120, label: "Doctor's Desk", type: 'desk' },
    ],
    doors: [
      { x: 30, y: 230, w: 88, h: 170, to: 'corridor', spawn: { x: 800, y: 482 }, label: 'Corridor' },
    ],
    npcs: [
      { id: 'patient-maya', x: 740, y: 405, color: '#6b4b7a', label: 'Maya', role: 'Patient', triggersCase: true },
    ],
    decor: [
      { kind: 'clock', x: 480, y: 150 },
      { kind: 'sign', x: 200, y: 180, text: 'Quiet Please' },
    ],
    spawn: { x: 160, y: 482 },
  },

  kitchen: {
    id: 'kitchen',
    label: 'Staff Kitchen',
    palette: {
      wallTop:   '#d2c49a',
      wallMid:   '#a3965e',
      floor:     '#685030',
      floorDark: '#463220',
      accent:    '#e9dcb0',
    },
    obstacles: [
      { x: 160, y: 240, w: 760, h: 60, label: 'Counter',      type: 'counter' },
      { x: 400, y: 332, w: 220, h: 48, label: 'Break Table',  type: 'table' },
      { x: 210, y: 198, w: 70,  h: 42, label: 'Coffee Maker', type: 'appliance' },
      { x: 760, y: 198, w: 70,  h: 42, label: 'Microwave',    type: 'appliance' },
    ],
    doors: [
      { x: 30, y: 230, w: 88, h: 170, to: 'reception', spawn: { x: 640, y: 482 }, label: 'Reception' },
    ],
    npcs: [],
    decor: [
      { kind: 'poster', x: 510, y: 150, text: 'Wash the\nmugs.' },
    ],
    spawn: { x: 160, y: 482 },
  },

  office: {
    id: 'office',
    label: 'Your Office',
    palette: {
      wallTop:   '#b2b8a8',
      wallMid:   '#808678',
      floor:     '#4d4a3a',
      floorDark: '#302e22',
      accent:    '#d4d9c6',
    },
    obstacles: [
      { x: 380, y: 248, w: 280, h: 132, label: 'Your Desk',  type: 'desk' },
      { x: 70,  y: 212, w: 160, h: 168, label: 'Bookshelf',  type: 'bookshelf' },
      { x: 700, y: 290, w: 70,  h: 90,  label: 'Filing',     type: 'appliance' },
    ],
    doors: [
      { x: 830, y: 230, w: 88, h: 170, to: 'corridor', spawn: { x: 500, y: 482 }, label: 'Corridor' },
    ],
    npcs: [],
    decor: [
      { kind: 'sign', x: 510, y: 170, text: 'Dr. Kuroi' },
    ],
    spawn: { x: 800, y: 482 },
  },
};
