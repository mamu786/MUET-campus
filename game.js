// ============================================================================
// SISWARUN: MUET CHRONICLES — 3D Cel-Shaded Engine (Jet Set Radio / PS2 Style)
// Fixed: Bug-free 3D Clipping, 4-Directional Turning & Multi-Room BGM Synth!
// ============================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const INK = "#0f172a";

// ----------------------------------------------------------------------------
// MULTI-ROOM WEB AUDIO SYNTHESIZER (Different BGM for Outdoor + Each Room!)
// ----------------------------------------------------------------------------
const soundEngine = {
  ctx: null,
  enabled: true,
  playing: false,
  stepIndex: 0,
  timer: null,

  tracks: {
    outdoor: {
      name: "🎵 BGM: Jet Set Campus Funk",
      tempo: 190,
      bass: [110, 110, 146.8, 130.8, 164.8, 146.8, 130.8, 98.0],
      lead: [440, 0, 523.2, 587.3, 659.2, 587.3, 523.2, 392.0],
      wave: "sawtooth",
    },
    hepa: {
      name: "🎵 BGM: Siswa Pop Beats (HEPA)",
      tempo: 210,
      bass: [130.8, 164.8, 196.0, 164.8, 146.8, 174.6, 220.0, 174.6],
      lead: [523.2, 659.2, 784.0, 659.2, 587.3, 698.4, 880.0, 698.4],
      wave: "square",
    },
    dewan: {
      name: "🎵 BGM: Exam Hall Tension (Dewan 3A)",
      tempo: 250,
      bass: [98.0, 0, 110.0, 0, 116.5, 0, 110.0, 0],
      lead: [392.0, 440.0, 466.1, 440.0, 349.2, 392.0, 440.0, 392.0],
      wave: "triangle",
    },
    kafe: {
      name: "🎵 BGM: Mamak Chill Bossa (Kafe)",
      tempo: 240,
      bass: [146.8, 220.0, 164.8, 246.9, 174.6, 261.6, 164.8, 220.0],
      lead: [587.3, 523.2, 493.8, 440.0, 523.2, 493.8, 440.0, 392.0],
      wave: "sine",
    },
    library: {
      name: "🎵 BGM: Lo-Fi Study Beats (Library)",
      tempo: 300,
      bass: [110.0, 130.8, 146.8, 130.8, 98.0, 110.0, 130.8, 110.0],
      lead: [440.0, 392.0, 329.6, 293.6, 329.6, 392.0, 440.0, 329.6],
      wave: "sine",
    },
  },

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.playing) {
      this.playing = true;
      this.scheduleNextStep();
    }
  },

  scheduleNextStep() {
    if (!this.playing) return;
    const track = this.tracks[state.zone] || this.tracks.outdoor;
    document.getElementById("mode-sublabel").textContent = this.enabled
      ? track.name
      : "🔇 BGM Muted";

    if (this.enabled && this.ctx && this.ctx.state === "running") {
      const idx = this.stepIndex % track.bass.length;
      const bFreq = track.bass[idx];
      const lFreq = track.lead[idx];

      if (bFreq > 0) this.playTone(bFreq, "triangle", 0.045, track.tempo * 0.0009);
      if (lFreq > 0) this.playTone(lFreq, track.wave, 0.028, track.tempo * 0.0007);
    }

    this.stepIndex++;
    this.timer = setTimeout(() => this.scheduleNextStep(), track.tempo);
  },

  playTone(freq, type, vol, duration) {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  },

  playDoorSfx() {
    if (!this.ctx) this.init();
    this.playTone(523.25, "sine", 0.08, 0.14);
    setTimeout(() => this.playTone(783.99, "sine", 0.08, 0.22), 110);
  },

  // Satisfying tactile UI Hover tick!
  playHoverSfx() {
    if (!this.ctx) return;
    this.playTone(980, "sine", 0.018, 0.035);
  },

  // Punchy 2-note mechanical pop when clicking any button!
  playClickSfx() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.065);
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  },

  // Juicy bubble-pop sound when clicking phrase chips or Idea Cards!
  playChipSfx() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.08);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  },

  // Victory fanfare chord when submitting MUET Part 1 / Part 2 or unlocking cards!
  playSuccessSfx() {
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      setTimeout(() => this.playTone(f, "triangle", 0.08, 0.22), idx * 75);
    });
  },

  // Snappy close swoosh when closing a modal
  playCloseSfx() {
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.09);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  },

  toggle() {
    this.init();
    this.enabled = !this.enabled;
    const lbl = document.getElementById("hud-bgm-label");
    if (lbl) lbl.textContent = this.enabled ? "ON" : "OFF";
  },
};

// ----------------------------------------------------------------------------
// GAME STATE & ZONES
// ----------------------------------------------------------------------------
const state = {
  zone: "outdoor", // 'outdoor' | 'hepa' | 'dewan' | 'kafe' | 'library'
  xp: 120,
  coins: 15.0,
  tier: "untested", // 'foundation' | 'intermediate' | 'advanced'
  tierLabel: "🎯 TAKE QUIZ",
  unlockedCards: [],
  completedDiag: false,
  completedGrammar: false,
  completedCohesive: false,
  completedPart1: false,
  completedPeel: false,
  completedPart2: false,
  titleVisible: true,
};

// 1. DIAGNOSTIC PLACEMENT QUIZ QUESTIONS (Tests Grammar, Cohesive Devices, & PEEL Idea Dev)
const DIAG_QUESTIONS = [
  {
    q: "1. [Grammar & Structure] Which sentence is grammatically correct for an email?",
    opts: [
      "Me and my friend very excite to joining the festival.",
      "I am thrilled to co-organize the upcoming Campus Wellness Festival with you.",
      "The festival are going to be very fun for student.",
    ],
    ans: 1,
  },
  {
    q: "2. [Cohesive Devices] 'The Charity Fun Run promotes physical fitness. __________, it allows students to de-stress outdoors.'",
    opts: ["However", "Furthermore", "Despite"],
    ans: 1,
  },
  {
    q: "3. [Part 2 Idea Development] How should you develop the point 'Cashless payment is convenient' in a body paragraph?",
    opts: [
      "Repeat the word 'convenient' three times in different ways.",
      "Explain WHY it saves time, give a real campus EXAMPLE (e.g. Kafe Siswa QR pay), and link to the outcome.",
      "List 10 different e-wallet apps without explaining any of them.",
    ],
    ans: 1,
  },
];

// 2. STAGE 1A: GRAMMAR & SENTENCE STRUCTURE FIXER
const GRAMMAR_CHALLENGES = [
  {
    q: "Broken Draft #1 (Note 1 - Excitement): 'I very happy hear about Wellness Festival and want help you.'",
    opts: [
      "I am thrilled to hear about the Campus Wellness Festival and cannot wait to team up with you!",
      "Hearing the festival make me very happy for helping you.",
      "I so excited for the Campus Wellness Festival next month.",
    ],
    ans: 0,
  },
  {
    q: "Broken Draft #2 (Note 2 - Preference): 'I think Charity Fun Run more better because student sitting in class all day.'",
    opts: [
      "Charity Fun Run is more good because students tired.",
      "I strongly prefer the Charity Fun Run because it allows students to exercise outdoors after sitting in lectures all day.",
      "Between two activity, Fun Run is best for student.",
    ],
    ans: 1,
  },
  {
    q: "Broken Draft #3 (Note 3 - Suggestion): 'Why we not give free merit point for attract freshies join?'",
    opts: [
      "We should giving merit point so freshies coming.",
      "To attract more first-year students, I suggest offering free e-merit points and food vouchers.",
      "For attract first-year student, let give free voucher.",
    ],
    ans: 1,
  },
];

// 3. STAGE 1B: COHESIVE DEVICE BRIDGE
const COHESIVE_CHALLENGES = [
  {
    q: "1. [Introducing a Topic/Note]: '__________ the daytime activity, I reckon we should host the Charity Fun Run.'",
    opts: ["With regard to", "In conclusion", "On the contrary"],
    ans: 0,
  },
  {
    q: "2. [Giving a Reason]: 'The Fun Run will be a huge hit among students. __________ it lets them unwind with friends outdoors.'",
    opts: ["Nevertheless,", "This is mainly because", "In contrast,"],
    ans: 1,
  },
  {
    q: "3. [Adding a Suggestion]: '__________ offering e-merit points, we can also promote the event through viral TikTok reels.'",
    opts: ["Besides", "However", "Consequently"],
    ans: 0,
  },
];

// 4. PEEL IDEA SNOWBALL BUILDER (At Library with Mei Ling)
const PEEL_STEPS = [
  {
    step: "P — POINT (Topic Sentence)",
    prompt: "Start your paragraph with a clear Point supporting cashless campuses:",
    opts: [
      "First and foremost, transitioning to a cashless ecosystem significantly streamlines daily transactions on campus.",
      "First and foremost, cashless is very good for university students every day.",
    ],
    best: 0,
  },
  {
    step: "E — EXPLANATION (Why / How does this happen?)",
    prompt: "Now expand the idea! WHY does cashless speed up transactions?",
    opts: [
      "This is because students and vendors no longer need to fumble for physical banknotes or count small change.",
      "Because money is paper and digital is on the phone.",
    ],
    best: 0,
  },
  {
    step: "E — EXAMPLE (Where / Concrete Malaysian Campus Example)",
    prompt: "Make it concrete! Give a specific example on campus:",
    opts: [
      "For example, many people use Touch 'n Go eWallet.",
      "For instance, at Kafe Siswa during the peak 1:00 PM lunch hour, scanning a DuitNow QR code takes less than three seconds.",
    ],
    best: 1,
  },
  {
    step: "L — LINK (What is the positive impact / result?)",
    prompt: "Link it back to the student's campus life:",
    opts: [
      "Consequently, this eliminates long queues and ensures undergraduates are never late for their afternoon lectures.",
      "So, that is why cashless is fast.",
    ],
    best: 0,
  },
];

const IDEA_CARDS = {
  makcik: {
    id: "makcik",
    title: "💳 Fast Queue & Hygiene (Makcik Kiah's Point)",
    vocab: ["streamline", "contactless", "hygienic", "queue congestion"],
    snippet:
      "For instance, at bustling university cafeterias like Kafe Siswa, contactless QR payments streamline transactions during peak lunch hours and eliminate the hassle of handling loose change. ",
  },
  oyen: {
    id: "oyen",
    title: "📶 Wi-Fi Dead Zones & Inclusivity (Oyen's Secret Note)",
    vocab: ["infrastructure", "contingency", "systemic outage", "inclusive"],
    snippet:
      "However, relying exclusively on digital transactions can backfire when campus Wi-Fi experiences a systemic outage, leaving students stranded without a contingency plan to purchase daily necessities. ",
  },
  aiman: {
    id: "aiman",
    title: "📊 Financial Literacy & Budgeting (Student Council Data)",
    vocab: ["financial literacy", "transparent", "expenditure", "accountability"],
    snippet:
      "Moreover, e-wallets automatically log every ringgit spent on textbooks and meals, fostering stronger financial literacy and accountability among undergraduates living on PTPTN or scholarship allowances. ",
  },
};

// ----------------------------------------------------------------------------
// 3D CAMPUS DISTRICTS & DOORS
// ----------------------------------------------------------------------------
const WORLD_MIN_X = -380;
const WORLD_MAX_X = 560;

const DOORS_3D = [
  { id: "hepa", name: "🏢 PUSAT PELAJAR HEPA (CLUB HUB)", x: -210, z: 185, width: 65 },
  { id: "dewan", name: "🏛️ DEWAN KULIAH 3A (ESSAY ARENA)", x: 10, z: 185, width: 70 },
  { id: "kafe", name: "🍛 KAFE SISWA & MAMAK CORNER", x: 230, z: 185, width: 65 },
  { id: "library", name: "📚 PERPUSTAKAAN TUN SRI LANANG", x: 430, z: 185, width: 65 },
];

// ----------------------------------------------------------------------------
// 3D PLAYER & NPCs (With Smooth 4-Direction Facing & Velocity Inertia!)
// ----------------------------------------------------------------------------
const player = {
  x: 10,
  z: 52,
  vx: 0,
  vz: 0,
  speedX: 155,
  speedZ: 110,
  dir: "up", // 'up' | 'down' | 'left' | 'right'
  walk: 0,
  isMoving: false,
  name: "You (Siswa)",
  colors: {
    torso: "#e11d48",
    accent: "#38bdf8",
    pants: "#0f172a",
    shoes: "#facc15",
    skin: "#f3c6a0",
    hair: "#0f172a",
    bag: "#991b1b",
  },
};

const oyen = {
  id: "oyen",
  name: "🐱 Oyen (Campus King)",
  zone: "outdoor",
  x: 68,
  z: 115,
  walk: 0,
  dir: "left",
  followPlayer: false,
};

const NPCS = [
  {
    id: "guard",
    zone: "outdoor",
    name: "Abang Guard (Pos Kawalan)",
    badge: "👮 GUARD",
    x: -65,
    z: 120,
    dir: "down",
    colors: { torso: "#38bdf8", accent: "#facc15", pants: "#0f172a", shoes: "#f8fafc", skin: "#d9a066", hair: "#0f172a" },
  },
  {
    id: "busker",
    zone: "outdoor",
    name: "Danial (Jet-Set Busker)",
    badge: "🎸 BUSKER",
    x: 125,
    z: 115,
    dir: "down",
    colors: { torso: "#facc15", accent: "#e11d48", pants: "#1e293b", shoes: "#38bdf8", skin: "#eab676", hair: "#0f172a" },
  },
  {
    id: "aiman",
    zone: "hepa",
    name: "Aiman (Presiden Kelab)",
    badge: "📱 PART 1 QUEST",
    x: 0,
    z: 145,
    dir: "down",
    colors: { torso: "#2dd4bf", accent: "#facc15", pants: "#0f172a", shoes: "#f8fafc", skin: "#eab676", hair: "#0f172a" },
  },
  {
    id: "prof",
    zone: "dewan",
    name: "Prof. Dr. Razak",
    badge: "🏛️ PART 2 EXAM",
    x: 0,
    z: 150,
    dir: "down",
    colors: { torso: "#facc15", accent: "#e11d48", pants: "#0f172a", shoes: "#1e293b", skin: "#e5b887", hair: "#475569" },
  },
  {
    id: "makcik",
    zone: "kafe",
    name: "Makcik Kiah (Queen of Kafe)",
    badge: "💡 IDEA CARD",
    x: 0,
    z: 145,
    dir: "down",
    colors: { torso: "#fb7185", accent: "#fef08a", pants: "#0f172a", shoes: "#f8fafc", skin: "#eab676", hair: "#f43f5e" },
  },
  {
    id: "mei",
    zone: "library",
    name: "Mei Ling (Debate Captain)",
    badge: "📘 PEEL MENTOR",
    x: 0,
    z: 145,
    dir: "down",
    colors: { torso: "#38bdf8", accent: "#facc15", pants: "#0f172a", shoes: "#facc15", skin: "#fde2c4", hair: "#0f172a" },
  },
];

// ----------------------------------------------------------------------------
// 3D PERSPECTIVE CAMERA WITH NEAR-PLANE CLIPPING (Fixes Road/Floor Disappearing Bug!)
// ----------------------------------------------------------------------------
const FOV = 360;
const NEAR_Z = 6;

function proj3D(wx, wy, wz, cam) {
  const rx = wx - cam.x;
  const ry = wy - cam.y;
  const rz = wz - cam.z;
  if (rz <= 2) return null;
  const sc = FOV / rz;
  return {
    x: canvas.width * 0.5 + rx * sc,
    y: canvas.height * 0.48 - ry * sc,
    sc,
  };
}

// Clips 3D polygon against camera near plane so road & floor NEVER vanish when walking forward!
function clipPolygonNearPlane(pts, cam) {
  const out = [];
  const minWz = cam.z + NEAR_Z;

  for (let i = 0; i < pts.length; i++) {
    const cur = pts[i];
    const prev = pts[(i + pts.length - 1) % pts.length];
    const curIn = cur[2] >= minWz;
    const prevIn = prev[2] >= minWz;

    if (curIn !== prevIn) {
      const t = (minWz - prev[2]) / (cur[2] - prev[2]);
      out.push([
        prev[0] + t * (cur[0] - prev[0]),
        prev[1] + t * (cur[1] - prev[1]),
        minWz,
      ]);
    }
    if (curIn) {
      out.push(cur);
    }
  }
  return out;
}

function quad3D(pts, fill, stroke = INK, lw = 2.6, cam) {
  const clipped = clipPolygonNearPlane(pts, cam);
  if (clipped.length < 3) return;

  const p2 = [];
  for (const pt of clipped) {
    const pr = proj3D(pt[0], pt[1], pt[2], cam);
    if (!pr) return;
    p2.push(pr);
  }
  ctx.beginPath();
  ctx.moveTo(p2[0].x, p2[0].y);
  for (let i = 1; i < p2.length; i++) ctx.lineTo(p2[i].x, p2[i].y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function box3D(cx, cy, cz, w, h, d, cFront, cTop, cSide, cam, lw = 2.6) {
  const x1 = cx - w / 2;
  const x2 = cx + w / 2;
  const y1 = cy;
  const y2 = cy + h;
  const z1 = cz - d / 2;
  const z2 = cz + d / 2;

  quad3D([[x1, y2, z1], [x2, y2, z1], [x2, y2, z2], [x1, y2, z2]], cTop, INK, lw, cam);
  if (cam.x < x1) {
    quad3D([[x1, y1, z1], [x1, y2, z1], [x1, y2, z2], [x1, y1, z2]], cSide, INK, lw, cam);
  } else if (cam.x > x2) {
    quad3D([[x2, y1, z1], [x2, y2, z1], [x2, y2, z2], [x2, y1, z2]], cSide, INK, lw, cam);
  }
  quad3D([[x1, y1, z1], [x2, y1, z1], [x2, y2, z1], [x1, y2, z1]], cFront, INK, lw, cam);
}

function label3D(wx, wy, wz, text, bgCol, textCol, cam) {
  if (wz < cam.z + NEAR_Z) return;
  const pr = proj3D(wx, wy, wz, cam);
  if (!pr) return;
  ctx.save();
  ctx.font = `900 ${Math.max(9, Math.round(11 * pr.sc * 0.35))}px 'Segoe UI', sans-serif`;
  ctx.textAlign = "center";
  const tw = ctx.measureText(text).width + 14;
  const th = 20;
  if (bgCol) {
    ctx.fillStyle = bgCol;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 2.4;
    ctx.fillRect(pr.x - tw / 2, pr.y - th / 2, tw, th);
    ctx.strokeRect(pr.x - tw / 2, pr.y - th / 2, tw, th);
  }
  ctx.fillStyle = textCol || INK;
  ctx.fillText(text, pr.x, pr.y + 4);
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 4-DIRECTIONAL CEL-SHADED CHARACTER RENDERER (Turns Left, Right, Up & Down!)
// ----------------------------------------------------------------------------
function drawCelShadedCharacter(char, wx, wz, isMoving, walkCycle, cam, isPlayer = false) {
  if (wz < cam.z + NEAR_Z) return;
  const pr = proj3D(wx, 0, wz, cam);
  if (!pr) return;

  const sc = pr.sc * 0.29;
  const dir = char.dir || "down";
  const s = isMoving ? Math.sin(walkCycle) : 0;
  const c = isMoving ? Math.cos(walkCycle) : 0;
  const bob = isMoving ? Math.abs(s) * 3.0 : Math.sin(performance.now() / 350) * 1.2;
  const col = char.colors;

  ctx.save();
  ctx.translate(pr.x, pr.y);
  ctx.scale(sc, sc);

  // 1. Ground Shadow
  ctx.fillStyle = "rgba(15, 23, 42, 0.42)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 23, 7.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  ctx.lineJoin = "round";

  // =========================================================================
  // CASE A: WALKING LEFT OR RIGHT (True Side-Profile Pose with Horizontal Stride!)
  // =========================================================================
  if (dir === "left" || dir === "right") {
    const flip = dir === "right" ? 1 : -1;
    ctx.save();
    ctx.scale(flip, 1); // +X is always "forward" in local profile space!

    // Dynamic forward lean when running!
    if (isMoving) ctx.rotate(0.06);

    const strideA = s * 13;
    const strideB = -s * 13;
    const liftA = Math.max(0, c) * 6;
    const liftB = Math.max(0, -c) * 6;

    // 1. BACK ARM (Swings opposite to front leg)
    ctx.fillStyle = col.torso;
    ctx.save();
    ctx.translate(0, -68 - bob);
    ctx.rotate(strideB * 0.045);
    ctx.fillRect(-4, 0, 8, 25);
    ctx.strokeRect(-4, 0, 8, 25);
    ctx.fillStyle = col.skin;
    ctx.beginPath();
    ctx.arc(0, 27, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 2. BACK LEG (Steps forward & backward horizontally with knee bend!)
    ctx.fillStyle = col.pants;
    ctx.beginPath();
    ctx.moveTo(-4, -40 - bob);
    ctx.lineTo(5, -40 - bob);
    ctx.lineTo(5 + strideB, -7 - liftB);
    ctx.lineTo(-4 + strideB, -7 - liftB);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Back Shoe (Pointing forward!)
    ctx.fillStyle = col.shoes;
    ctx.fillRect(-4 + strideB, -7 - liftB, 14, 7.5);
    ctx.strokeRect(-4 + strideB, -7 - liftB, 14, 7.5);

    // 3. FRONT LEG (Steps horizontally across!)
    ctx.fillStyle = col.pants;
    ctx.beginPath();
    ctx.moveTo(-4, -40 - bob);
    ctx.lineTo(5, -40 - bob);
    ctx.lineTo(5 + strideA, -7 - liftA);
    ctx.lineTo(-4 + strideA, -7 - liftA);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Front Shoe (Toe pointing in walking direction!)
    ctx.fillStyle = col.shoes;
    ctx.fillRect(-4 + strideA, -7 - liftA, 14, 7.5);
    ctx.strokeRect(-4 + strideA, -7 - liftA, 14, 7.5);

    // 4. SIDE-PROFILE TORSO & HOODIE
    ctx.fillStyle = col.torso;
    ctx.fillRect(-9, -72 - bob, 18, 33);
    ctx.strokeRect(-9, -72 - bob, 18, 33);
    // Cyan Streetwear Side Stripe
    ctx.fillStyle = col.accent;
    ctx.fillRect(-2, -72 - bob, 6, 33);
    ctx.strokeRect(-2, -72 - bob, 6, 33);

    // Red Crossbody Bag slung on hip/back
    if (isPlayer) {
      ctx.fillStyle = col.bag;
      ctx.fillRect(-15, -52 - bob, 14, 16);
      ctx.strokeRect(-15, -52 - bob, 14, 16);
    }

    // 5. SIDE-PROFILE HEAD, NOSE & EYES LOOKING FORWARD!
    ctx.fillStyle = col.skin;
    ctx.beginPath();
    ctx.arc(2, -85 - bob, 11.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Hair swept back
    ctx.fillStyle = col.hair;
    ctx.beginPath();
    ctx.arc(-1, -87 - bob, 12.5, Math.PI * 0.45, Math.PI * 1.85);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side-profile Eye looking forward
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(8, -85 - bob, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 6. FRONT ARM (Swings boldly across chest!)
    ctx.fillStyle = col.torso;
    ctx.save();
    ctx.translate(0, -68 - bob);
    ctx.rotate(strideA * 0.05);
    ctx.fillRect(-4, 0, 8, 25);
    ctx.strokeRect(-4, 0, 8, 25);
    ctx.fillStyle = col.skin;
    ctx.beginPath();
    ctx.arc(0, 27, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  } else {
    // =========================================================================
    // CASE B: WALKING UP (AWAY) OR DOWN (TOWARD CAMERA)
    // =========================================================================
    const liftL = isMoving ? Math.max(0, c) * 7 : 0;
    const liftR = isMoving ? Math.max(0, -c) * 7 : 0;

    // Segmented Legs
    ctx.fillStyle = col.pants;
    ctx.fillRect(-10, -40 - bob, 9, 18);
    ctx.strokeRect(-10, -40 - bob, 9, 18);
    ctx.fillRect(-10, -23 - liftL, 8.5, 17);
    ctx.strokeRect(-10, -23 - liftL, 8.5, 17);
    ctx.fillStyle = col.shoes;
    ctx.fillRect(-11, -7 - liftL, 11.5, 7.5);
    ctx.strokeRect(-11, -7 - liftL, 11.5, 7.5);

    ctx.fillStyle = col.pants;
    ctx.fillRect(2, -40 - bob, 9, 18);
    ctx.strokeRect(2, -40 - bob, 9, 18);
    ctx.fillRect(2, -23 - liftR, 8.5, 17);
    ctx.strokeRect(2, -23 - liftR, 8.5, 17);
    ctx.fillStyle = col.shoes;
    ctx.fillRect(1, -7 - liftR, 11.5, 7.5);
    ctx.strokeRect(1, -7 - liftR, 11.5, 7.5);

    // Swinging Arms
    const armL = s * 10;
    const armR = -s * 10;
    ctx.fillStyle = col.torso;
    ctx.fillRect(-19, -70 - bob + armL * 0.5, 7.5, 26);
    ctx.strokeRect(-19, -70 - bob + armL * 0.5, 7.5, 26);
    ctx.fillRect(12, -70 - bob + armR * 0.5, 7.5, 26);
    ctx.strokeRect(12, -70 - bob + armR * 0.5, 7.5, 26);

    ctx.fillStyle = col.skin;
    ctx.beginPath();
    ctx.arc(-15, -42 - bob + armL * 0.6, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(16, -42 - bob + armR * 0.6, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Torso
    ctx.fillStyle = col.torso;
    ctx.beginPath();
    ctx.moveTo(-13.5, -72 - bob);
    ctx.lineTo(13.5, -72 - bob);
    ctx.lineTo(10, -40 - bob);
    ctx.lineTo(-10, -40 - bob);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = col.accent;
    ctx.fillRect(-5, -72 - bob, 10, 9);
    ctx.strokeRect(-5, -72 - bob, 10, 9);

    if (isPlayer) {
      ctx.fillStyle = col.bag;
      const bagX = dir === "up" ? -18 : 5;
      ctx.fillRect(bagX, -52 - bob, 15, 16);
      ctx.strokeRect(bagX, -52 - bob, 15, 16);
    }

    // Head & Face (If facing DOWN toward camera, show eyes & face!)
    if (dir === "down") {
      ctx.fillStyle = col.skin;
      ctx.beginPath();
      ctx.arc(0, -85 - bob, 11.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Top hair bangs
      ctx.fillStyle = col.hair;
      ctx.beginPath();
      ctx.arc(0, -88 - bob, 12.2, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(-4, -84 - bob, 2, 0, Math.PI * 2);
      ctx.arc(4, -84 - bob, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Facing UP (Back of head)
      ctx.fillStyle = col.hair;
      ctx.beginPath();
      ctx.arc(0, -86 - bob, 12.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Floating Badge for NPCs
  if (!isPlayer && char.badge) {
    const floatY = Math.sin(performance.now() / 220) * 4;
    ctx.fillStyle = "#facc15";
    ctx.fillRect(-46, -124 - bob + floatY, 92, 20);
    ctx.strokeRect(-46, -124 - bob + floatY, 92, 20);
    ctx.fillStyle = INK;
    ctx.font = "900 10px 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(char.badge, 0, -110 - bob + floatY);
  }

  ctx.restore();
}

// 3D Cel-Shaded Oyen Cat (Also flips Left/Right!)
function drawCelShadedOyen(wx, wz, cam) {
  if (wz < cam.z + NEAR_Z) return;
  const pr = proj3D(wx, 0, wz, cam);
  if (!pr) return;
  const sc = pr.sc * 0.28;
  const s = Math.sin(oyen.walk) * 5;
  const flip = oyen.dir === "left" ? -1 : 1;

  ctx.save();
  ctx.translate(pr.x, pr.y);
  ctx.scale(sc, sc);

  ctx.fillStyle = "rgba(15,23,42,0.38)";
  ctx.beginPath();
  ctx.ellipse(0, 2, 16, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.scale(flip, 1);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.6;

  ctx.fillStyle = "#ea580c";
  ctx.fillRect(-10 + s, -9, 5, 9);
  ctx.strokeRect(-10 + s, -9, 5, 9);
  ctx.fillRect(-3 - s, -9, 5, 9);
  ctx.strokeRect(-3 - s, -9, 5, 9);
  ctx.fillRect(4 + s, -9, 5, 9);
  ctx.strokeRect(4 + s, -9, 5, 9);

  ctx.fillStyle = "#fb923c";
  ctx.fillRect(-13, -21, 26, 13);
  ctx.strokeRect(-13, -21, 26, 13);
  ctx.fillRect(5, -31, 14, 13);
  ctx.strokeRect(5, -31, 14, 13);
  ctx.restore();

  ctx.fillStyle = "#facc15";
  ctx.fillRect(-26, -52, 52, 16);
  ctx.strokeRect(-26, -52, 52, 16);
  ctx.fillStyle = INK;
  ctx.font = "900 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("🐱 OYEN", 0, -41);

  ctx.restore();
}

// ----------------------------------------------------------------------------
// OUTDOOR 3D CEL-SHADED CAMPUS BOULEVARD
// ----------------------------------------------------------------------------
function renderOutdoor3D(cam) {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.5);
  sky.addColorStop(0, "#0284c7");
  sky.addColorStop(0.6, "#38bdf8");
  sky.addColorStop(1, "#bae6fd");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#84cc16";
  ctx.fillRect(0, canvas.height * 0.48, canvas.width, canvas.height * 0.52);

  // 3D Asphalt Boulevard Road (Now uses Near-Plane Clipping so it NEVER disappears!)
  quad3D(
    [
      [-620, 0, -80],
      [820, 0, -80],
      [820, 0, 105],
      [-620, 0, 105],
    ],
    "#334155",
    INK,
    2.6,
    cam
  );

  // Paved Courtyards
  DOORS_3D.forEach((d) => {
    quad3D(
      [
        [d.x - 65, 0, 105],
        [d.x + 65, 0, 105],
        [d.x + 55, 0, 225],
        [d.x - 55, 0, 225],
      ],
      "#cbd5e1",
      INK,
      2.6,
      cam
    );
  });

  // 3D Zebra Crossings
  [-210, 10, 230, 430].forEach((zxCenter) => {
    for (let i = -2; i <= 2; i++) {
      const zx = zxCenter + i * 22;
      quad3D(
        [
          [zx - 6, 0.2, 12],
          [zx + 6, 0.2, 12],
          [zx + 6, 0.2, 98],
          [zx - 6, 0.2, 98],
        ],
        "#f8fafc",
        INK,
        2.2,
        cam
      );
    }
  });

  // (A) WEST: PUSAT PELAJAR HEPA
  box3D(-210, 0, 230, 155, 92, 55, "#fb7185", "#f43f5e", "#e11d48", cam);
  box3D(-210, 36, 198, 95, 16, 6, "#facc15", "#fde047", "#eab308", cam);
  box3D(-210, 0, 200, 46, 35, 3, INK, INK, INK, cam);
  label3D(-210, 62, 198, "🏢 HEPA HUB (PART 1)", "#facc15", INK, cam);

  // (B) CENTER: DEWAN KULIAH 3A
  box3D(10, 0, 245, 195, 115, 55, "#e2e8f0", "#94a3b8", "#cbd5e1", cam);
  box3D(10, 0, 205, 155, 48, 35, "#2dd4bf", "#14b8a6", "#0d9488", cam);
  box3D(10, 36, 186, 85, 15, 4, "#facc15", "#fde047", "#eab308", cam);
  box3D(10, 0, 187, 46, 34, 2, INK, INK, INK, cam);
  box3D(-48, 65, 216, 18, 42, 3, "#fb7185", "#f43f5e", "#e11d48", cam);
  box3D(68, 65, 216, 18, 42, 3, "#fb7185", "#f43f5e", "#e11d48", cam);
  label3D(10, 62, 185, "🏛️ DEWAN KULIAH 3A (PART 2)", "#facc15", INK, cam);

  // (C) EAST: KAFE SISWA & MAMAK
  box3D(230, 0, 225, 150, 82, 50, "#fde047", "#facc15", "#eab308", cam);
  box3D(230, 36, 196, 90, 15, 5, "#fb7185", "#f43f5e", "#e11d48", cam);
  box3D(230, 0, 198, 46, 34, 3, INK, INK, INK, cam);
  label3D(230, 60, 195, "🍛 KAFE SISWA (IDEA CARD)", "#fb7185", "#ffffff", cam);

  // (D) FAR EAST: PERPUSTAKAAN TUN SRI LANANG
  box3D(430, 0, 230, 150, 95, 50, "#38bdf8", "#0ea5e9", "#0284c7", cam);
  box3D(430, 36, 198, 90, 15, 5, "#facc15", "#fde047", "#eab308", cam);
  box3D(430, 0, 200, 46, 34, 3, INK, INK, INK, cam);
  label3D(430, 62, 198, "📚 LIBRARY (PEEL LAB)", "#facc15", INK, cam);

  // Trees & Bollards
  [-310, -110, 120, 330, 520].forEach((tx) => {
    box3D(tx, 0, 130, 8, 32, 8, "#78350f", "#78350f", "#451a03", cam);
    box3D(tx, 28, 130, 34, 28, 34, "#15803d", "#22c55e", "#166534", cam);
  });

  [-145, -75, 95, 165, 305].forEach((bx) => {
    box3D(bx, 0, 108, 6, 16, 6, "#1e242b", "#facc15", "#0f172a", cam);
  });
}

// ----------------------------------------------------------------------------
// INTERIOR 3D CEL-SHADED ROOMS
// ----------------------------------------------------------------------------
function renderInterior3D(zoneId, cam) {
  const roomThemes = {
    hepa: { sky: "#be185d", floor: "#fbcfe8", wall: "#fb7185", accent: "#facc15", title: "🏢 HEPA STUDENT HUB — MUET PART 1" },
    dewan: { sky: "#0f172a", floor: "#cbd5e1", wall: "#2dd4bf", accent: "#facc15", title: "🏛️ DEWAN KULIAH 3A — MUET PART 2 ARENA" },
    kafe: { sky: "#b45309", floor: "#fef08a", wall: "#facc15", accent: "#fb7185", title: "🍛 KAFE SISWA & GERAI MAKCIK KIAH" },
    library: { sky: "#0369a1", floor: "#e0f2fe", wall: "#38bdf8", accent: "#facc15", title: "📚 PERPUSTAKAAN — PEEL & VOCAB LAB" },
  };
  const rt = roomThemes[zoneId];

  ctx.fillStyle = rt.sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 3D Interior Floor Slab (Clipped smoothly against near plane!)
  quad3D([[-140, 0, -40], [140, 0, -40], [140, 0, 210], [-140, 0, 210]], rt.floor, INK, 2.8, cam);

  box3D(0, 0, 215, 280, 95, 12, rt.wall, rt.accent, rt.wall, cam);
  box3D(0, 28, 206, 140, 45, 4, "#0f172a", "#334155", "#0f172a", cam);
  label3D(0, 52, 202, rt.title, "#facc15", INK, cam);

  box3D(-75, 0, 130, 55, 18, 28, "#f8fafc", rt.accent, "#94a3b8", cam);
  box3D(75, 0, 130, 55, 18, 28, "#f8fafc", rt.accent, "#94a3b8", cam);

  // Exit Mat at front of room
  quad3D([[-45, 0.3, 14], [45, 0.3, 14], [45, 0.3, 34], [-45, 0.3, 34]], "#facc15", INK, 2.6, cam);
  label3D(0, 8, 30, "⬇️ WALK BACK (S) TO EXIT TO STREET", "#facc15", INK, cam);
}

// ----------------------------------------------------------------------------
// INPUT, 3D MOVEMENT & DOOR TRANSITIONS
// ----------------------------------------------------------------------------
const keys = {};
let activeModal = false;
let nearestTarget = null;
let lastOutdoorX = 10;

window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  soundEngine.init();

  if (
    ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code) &&
    !activeModal &&
    state.titleVisible
  ) {
    setTitleOverlay(false);
  }

  if ((e.code === "KeyE" || e.code === "Space") && !activeModal) {
    if (document.activeElement && document.activeElement.tagName === "TEXTAREA") return;
    e.preventDefault();
    tryInteract();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

window.addEventListener("pointerdown", () => soundEngine.init(), { once: true });

const bgmBtn = document.getElementById("btn-bgm");
if (bgmBtn) {
  bgmBtn.addEventListener("click", () => soundEngine.toggle());
}

// ============================================================================
// MOBILE / TOUCHSCREEN CONTROLS (D-Pad Buttons + Direct Canvas Drag-to-Walk!)
// ============================================================================
document.querySelectorAll("#touch-controls [data-key]").forEach((btn) => {
  const k = btn.dataset.key;
  const press = (e) => {
    e.preventDefault();
    soundEngine.init();
    keys[k] = true;
    btn.classList.add("pressed");
    if (!activeModal && state.titleVisible) setTitleOverlay(false);
  };
  const release = (e) => {
    e.preventDefault();
    keys[k] = false;
    btn.classList.remove("pressed");
  };
  btn.addEventListener("pointerdown", press);
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointercancel", release);
  btn.addEventListener("pointerleave", release);
});

const touchTalkBtn = document.getElementById("btn-touch-talk");
if (touchTalkBtn) {
  touchTalkBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    soundEngine.init();
    soundEngine.playClickSfx();
    if (!activeModal && state.titleVisible) setTitleOverlay(false);
    tryInteract();
  });
}

// Direct Canvas Touch / Swipe Joystick (Drag finger anywhere on canvas to walk!)
let touchDrag = { active: false, startX: 0, startY: 0, dx: 0, dz: 0 };

canvas.addEventListener("pointerdown", (e) => {
  if (activeModal) return;
  soundEngine.init();
  touchDrag.active = true;
  touchDrag.startX = e.clientX;
  touchDrag.startY = e.clientY;
  touchDrag.dx = 0;
  touchDrag.dz = 0;
});

canvas.addEventListener("pointermove", (e) => {
  if (!touchDrag.active || activeModal) return;
  const diffX = e.clientX - touchDrag.startX;
  const diffY = e.clientY - touchDrag.startY;
  if (Math.hypot(diffX, diffY) > 12) {
    if (state.titleVisible) setTitleOverlay(false);
    touchDrag.dx = Math.max(-1, Math.min(1, diffX / 45));
    touchDrag.dz = Math.max(-1, Math.min(1, -diffY / 45));
  } else {
    touchDrag.dx = 0;
    touchDrag.dz = 0;
  }
});

window.addEventListener("pointerup", () => {
  touchDrag.active = false;
  touchDrag.dx = 0;
  touchDrag.dz = 0;
});
window.addEventListener("pointercancel", () => {
  touchDrag.active = false;
  touchDrag.dx = 0;
  touchDrag.dz = 0;
});

function setTitleOverlay(show) {
  state.titleVisible = show;
  const overlay = document.getElementById("title-overlay");
  const sw = document.getElementById("hud-switch");
  if (show) {
    overlay.classList.remove("minimized");
    sw.classList.remove("active");
  } else {
    overlay.classList.add("minimized");
    sw.classList.add("active");
  }
}

document.getElementById("btn-start-game").addEventListener("click", () => {
  soundEngine.init();
  setTitleOverlay(false);
  if (!state.completedDiag) {
    openDiagnosticQuiz();
  }
});
document.getElementById("btn-toggle-title").addEventListener("click", () => setTitleOverlay(!state.titleVisible));

document.getElementById("btn-mode-cycle").addEventListener("click", () => {
  soundEngine.init();
  openDiagnosticQuiz();
});

function enterZone(newZone, label) {
  state.zone = newZone;
  soundEngine.stepIndex = 0;
  soundEngine.playDoorSfx();
  closeDialogue();

  const banner = document.getElementById("zone-banner");
  banner.textContent = label;
  banner.classList.remove("hidden");
  setTimeout(() => banner.classList.add("hidden"), 2200);

  document.getElementById("current-zone-label").textContent = label;

  if (newZone === "outdoor") {
    player.x = lastOutdoorX;
    player.z = 140;
    player.dir = "down";
  } else {
    player.x = 0;
    player.z = 48;
    player.dir = "up";
    if (oyen.followPlayer) {
      oyen.x = -28;
      oyen.z = 42;
    }
  }
}

function update(dt) {
  if (activeModal) return;

  let dx = 0;
  let dz = 0;
  if (keys["KeyA"] || keys["ArrowLeft"]) dx -= 1;
  if (keys["KeyD"] || keys["ArrowRight"]) dx += 1;
  if (keys["KeyW"] || keys["ArrowUp"]) dz += 1;
  if (keys["KeyS"] || keys["ArrowDown"]) dz -= 1;

  if (dx === 0 && dz === 0 && touchDrag.active) {
    dx = touchDrag.dx;
    dz = touchDrag.dz;
  }

  if (dx !== 0 || dz !== 0) {
    const len = Math.hypot(dx, dz);
    dx /= len;
    dz /= len;

    // Immediately update character facing direction so pressing A/Left turns Left!
    if (Math.abs(dx) >= Math.abs(dz)) {
      player.dir = dx < 0 ? "left" : "right";
    } else {
      player.dir = dz > 0 ? "up" : "down";
    }

    const isSprint = keys["ShiftLeft"] || keys["ShiftRight"];
    const mult = isSprint ? 1.55 : 1;

    if (state.zone === "outdoor") {
      player.x = Math.max(WORLD_MIN_X, Math.min(WORLD_MAX_X, player.x + dx * player.speedX * mult * dt));
      player.z = Math.max(20, Math.min(182, player.z + dz * player.speedZ * mult * dt));

      const pct = ((player.x - WORLD_MIN_X) / (WORLD_MAX_X - WORLD_MIN_X)) * 88 + 6;
      document.getElementById("mm-player-dot").style.left = `${pct}%`;

      if (player.z >= 170 && dz > 0) {
        for (const d of DOORS_3D) {
          if (Math.abs(player.x - d.x) < d.width * 0.55) {
            lastOutdoorX = d.x;
            enterZone(d.id, d.name);
            return;
          }
        }
      }
    } else {
      player.x = Math.max(-105, Math.min(105, player.x + dx * player.speedX * mult * dt));
      player.z = Math.max(20, Math.min(175, player.z + dz * player.speedZ * mult * dt));

      if (player.z <= 28 && dz < 0 && Math.abs(player.x) < 55) {
        enterZone("outdoor", "🗺️ CAMPUS BOULEVARD (3D CEL-SHADED)");
        return;
      }
    }

    player.isMoving = true;
    player.walk += dt * (isSprint ? 16 : 11);
  } else {
    player.isMoving = false;
  }

  // Oyen 3D Companion AI
  if (oyen.followPlayer) {
    oyen.zone = state.zone;
    const dist = Math.hypot(player.x - oyen.x, player.z - oyen.z);
    if (dist > 28) {
      const ox = (player.x - oyen.x) / dist;
      const oz = (player.z - oyen.z) / dist;
      oyen.x += ox * 120 * dt;
      oyen.z += oz * 90 * dt;
      oyen.dir = ox < 0 ? "left" : "right";
      oyen.walk += dt * 14;
    }
  }

  // Check proximity to NPCs
  nearestTarget = null;
  let minDist = 44;

  for (const npc of NPCS) {
    if (npc.zone !== state.zone) continue;
    const d = Math.hypot(player.x - npc.x, player.z - npc.z);
    if (d < minDist) {
      minDist = d;
      nearestTarget = npc;
    }
  }

  if (oyen.zone === state.zone) {
    const od = Math.hypot(player.x - oyen.x, player.z - oyen.z);
    if (od < minDist) nearestTarget = oyen;
  }

  const promptEl = document.getElementById("interact-prompt");
  if (nearestTarget) {
    promptEl.innerHTML = `Press <kbd>E</kbd> or <kbd>Space</kbd> to talk to <b>${nearestTarget.name}</b>`;
    promptEl.classList.remove("hidden");
  } else {
    promptEl.classList.add("hidden");
  }
}

// ----------------------------------------------------------------------------
// DIALOGUE & MUET QUEST HANDLERS
// ----------------------------------------------------------------------------
const dlgBox = document.getElementById("dialogue-box");
const dlgAvatar = document.getElementById("dlg-avatar");
const dlgName = document.getElementById("dlg-name");
const dlgText = document.getElementById("dlg-text");
const dlgActions = document.getElementById("dlg-actions");

function showDialogue(avatar, name, text, buttons) {
  soundEngine.playClickSfx();
  dlgAvatar.textContent = avatar;
  dlgName.textContent = name;
  dlgText.innerHTML = text;
  dlgActions.innerHTML = "";

  for (const b of buttons) {
    const btn = document.createElement("button");
    btn.className = `dlg-btn ${b.secondary ? "secondary" : ""}`;
    btn.textContent = b.label;
    btn.onmouseenter = () => soundEngine.playHoverSfx();
    btn.onclick = () => {
      soundEngine.playClickSfx();
      b.onClick();
    };
    dlgActions.appendChild(btn);
  }
  dlgBox.classList.remove("hidden");
}

function closeDialogue() {
  dlgBox.classList.add("hidden");
}

function unlockCard(cardKey) {
  if (!state.unlockedCards.includes(cardKey)) {
    state.unlockedCards.push(cardKey);
    state.xp += 35;
    soundEngine.playSuccessSfx();
    updateHUD();
    renderEssayCards();
  }
}

function tryInteract() {
  if (!nearestTarget) return;

  if (nearestTarget.id === "aiman") {
    unlockCard("aiman");
    showDialogue(
      "🧑‍💻",
      "Aiman (Presiden Kelab - Inside HEPA Hub)",
      `Welcome inside <b>Pusat Pelajar HEPA</b>! Before we send our official reply email for the <i>Campus Wellness Festival</i>, complete the <b>3-Stage Quest Chain</b>:<br/>• <b>Stage 1A:</b> Fix broken grammar &amp; sentence structure.<br/>• <b>Stage 1B:</b> Connect sentences with Cohesive Devices.<br/>• <b>Stage 1C:</b> Write your 100-word reply email!`,
      [
        {
          label: "📱 Launch Part 1 Quest Chain (Stages 1A -> 1B -> 1C)",
          onClick: () => {
            closeDialogue();
            renderPart1Challenges();
            openModal("modal-part1");
          },
        },
        { label: "Kejap lagi bro", secondary: true, onClick: closeDialogue },
      ]
    );
  } else if (nearestTarget.id === "makcik") {
    unlockCard("makcik");
    showDialogue(
      "🧕",
      "Makcik Kiah (Inside Kafe Siswa)",
      `Selamat datang ke <b>Kafe Siswa</b> sayang! Tenang kan lagu Bossa dekat kafe Makcik?<br/><br/>For Prof. Razak's <b>Cashless Campus</b> essay: Makcik prefers QR Pay because it's <b>hygienic</b> and <b>streamlines queue congestion</b>! <i>(✨ Unlocked Idea Card: Fast Queue &amp; Hygiene!)</i>`,
      [
        {
          label: "🧋 Beli Teh Tarik (RM 2.50 -> +25 XP)",
          onClick: () => {
            if (state.coins >= 2.5) {
              state.coins -= 2.5;
              state.xp += 25;
              updateHUD();
              dlgText.innerHTML = `Segar biji mata! Gunakan point Makcik dalam esei Dewan Kuliah 3A nanti tau!`;
            } else {
              dlgText.innerHTML = `Duit SiswaPay tak cukup dik! Siapkan email Aiman dulu!`;
            }
          },
        },
        { label: "Terima kasih Makcik!", secondary: true, onClick: closeDialogue },
      ]
    );
  } else if (nearestTarget.id === "oyen") {
    unlockCard("oyen");
    oyen.followPlayer = true;
    showDialogue(
      "🐱",
      "Oyen (Campus King)",
      `<b>Purr-meow!</b> 🐾 Oyen drops a crumpled Wi-Fi complaint slip at your yellow sneakers!<br/><br/><i>(✨ Unlocked Counter-Argument Card: Wi-Fi Dead Zones &amp; Contingency! Oyen will now follow you everywhere!)</i>`,
      [{ label: "🐾 Jom Oyen, ikut aku!", onClick: closeDialogue }]
    );
  } else if (nearestTarget.id === "mei") {
    showDialogue(
      "👩‍🎓",
      "Mei Ling (Debate Captain - Inside Library)",
      `Welcome to <b>Perpustakaan Tun Sri Lanang</b>! Struggling to expand your ideas in <b>MUET Part 2</b>?<br/><br/>Let's use my <b>⛄ PEEL Idea Snowball Trainer</b>! I'll show you how to turn 1 short idea into a 70-word Band 5.0 paragraph step-by-step (Point -> Why -> Campus Example -> Link)!`,
      [
        {
          label: "⛄ Launch PEEL Idea Snowball Lab",
          onClick: () => {
            closeDialogue();
            renderPeelSnowballLab();
            openModal("modal-peel");
          },
        },
        {
          label: "📓 Open Field Notebook",
          secondary: true,
          onClick: () => {
            closeDialogue();
            openNotebook();
          },
        },
      ]
    );
  } else if (nearestTarget.id === "guard") {
    showDialogue(
      "👮",
      "Abang Guard (Pos Kawalan)",
      `Selamat pagi Siswa! Kalau kau belum ambil <b>🎯 Diagnostic Placement Quiz</b>, tekan butang bawah ni supaya sistem boleh sesuaikan bantuan penulisan ikut tahap kau (Foundation, Intermediate, atau Advanced)!`,
      [
        {
          label: "🎯 Ambil Diagnostic Placement Quiz",
          onClick: () => {
            closeDialogue();
            openDiagnosticQuiz();
          },
        },
        { label: "Mantap Abang Guard!", secondary: true, onClick: closeDialogue },
      ]
    );
  } else if (nearestTarget.id === "busker") {
    showDialogue(
      "🎸",
      "Danial (Jet-Set Busker)",
      `🎵 <i>"Jet Set Campus Vibe!"</i> Tip untuk Part 2: Jangan masuk Dewan Kuliah 3A tangan kosong! Singgah <b>Kafe Siswa</b> &amp; <b>Library (Mei Ling)</b> dulu untuk bina perenggan PEEL kau!`,
      [{ label: "Gempak bro!", onClick: closeDialogue }]
    );
  } else if (nearestTarget.id === "prof") {
    showDialogue(
      "👨‍🏫",
      "Prof. Dr. Razak (Inside Dewan Kuliah 3A)",
      `Welcome inside <b>Dewan Kuliah 3A</b>! Today's MUET Part 2 Extended Essay motion is:<br/><i>"Universities in Malaysia should go 100% cashless on campus."</i><br/><br/>You have collected <b>${state.unlockedCards.length}/3 Campus Idea Cards</b> and your PEEL Snowball status is <b>${state.completedPeel ? "✅ Ready" : "⚠️ Not built yet (Visit Mei Ling at Library!)"}</b>.`,
      [
        {
          label: "🏛️ Start MUET Part 2 Essay",
          onClick: () => {
            closeDialogue();
            renderEssayCards();
            openModal("modal-part2");
          },
        },
        { label: "Let me visit Library / Kafe first", secondary: true, onClick: closeDialogue },
      ]
    );
  }
}

// ----------------------------------------------------------------------------
// MODALS & LIVE MUET RUBRIC CHECKERS
// ----------------------------------------------------------------------------
function openModal(id) {
  activeModal = true;
  document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
  soundEngine.playCloseSfx();
  activeModal = false;
  document.getElementById(id).classList.add("hidden");
}

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => closeModal(btn.dataset.close));
});

// Global tactile hover & click sound effects for all UI buttons and pills!
document.querySelectorAll("button, .ward-btn, .ward-pill, .explore-toggle-pill").forEach((el) => {
  el.addEventListener("mouseenter", () => soundEngine.playHoverSfx());
  el.addEventListener("click", () => {
    if (el.classList.contains("phrase-chip")) {
      soundEngine.playChipSfx();
    } else if (!el.hasAttribute("data-close")) {
      soundEngine.playClickSfx();
    }
  });
});

document.querySelectorAll(".phrase-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const target = document.getElementById(chip.dataset.target);
    const textToInsert = chip.dataset.text.replace(/\\n/g, "\n");
    target.value += textToInsert;
    target.dispatchEvent(new Event("input"));
    target.focus();
  });
});

// ============================================================================
// 1. DIAGNOSTIC PLACEMENT QUIZ LOGIC (Auto-calibrates Foundation / Interm / Pro)
// ============================================================================
function openDiagnosticQuiz() {
  const box = document.getElementById("diag-questions-box");
  box.innerHTML = "";
  document.getElementById("diag-result-box").classList.add("hidden");

  DIAG_QUESTIONS.forEach((item, qIdx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    let optsHtml = `<div class="quiz-q">${item.q}</div><div class="quiz-options">`;
    item.opts.forEach((optText, oIdx) => {
      optsHtml += `
        <label class="quiz-opt-label">
          <input type="radio" name="diag-q-${qIdx}" value="${oIdx}" />
          <span>${optText}</span>
        </label>
      `;
    });
    optsHtml += `</div>`;
    card.innerHTML = optsHtml;
    box.appendChild(card);
  });

  openModal("modal-diagnostic");
}

document.getElementById("btn-finish-diag").addEventListener("click", () => {
  let score = 0;
  DIAG_QUESTIONS.forEach((item, qIdx) => {
    const sel = document.querySelector(`input[name="diag-q-${qIdx}"]:checked`);
    if (sel && Number(sel.value) === item.ans) score++;
  });

  state.completedDiag = true;
  document.getElementById("q-diag").classList.add("done");

  if (score <= 1) {
    state.tier = "foundation";
    state.tierLabel = "🌱 FOUNDATION (GUIDED)";
  } else if (score === 2) {
    state.tier = "intermediate";
    state.tierLabel = "🔥 INTERMEDIATE (BAND 4)";
  } else {
    state.tier = "advanced";
    state.tierLabel = "👑 ADVANCED (BAND 5 PRO)";
  }

  applyTierScaffolding();
  soundEngine.playSuccessSfx();

  const resBox = document.getElementById("diag-result-box");
  resBox.classList.remove("hidden");
  resBox.innerHTML = `
    <strong>🎯 Diagnostic Score: ${score} / 3 — Assigned Tier: ${state.tierLabel}</strong><br/>
    • ${
      state.tier === "foundation"
        ? "We've enabled <b>Full Guided Cloze Templates + Phrase Chips</b> to help you build confidence sentence by sentence!"
        : state.tier === "intermediate"
        ? "We've enabled <b>Cohesive Device Prompts &amp; PEEL Starters</b> to push your writing to Band 4.0+!"
        : "Impressive! You've unlocked <b>Band 5.0 Pro Challenge Mode</b>—show off your independent writing skills!"
    }
  `;

  setTimeout(() => {
    closeModal("modal-diagnostic");
  }, 2200);
});

function applyTierScaffolding() {
  document.getElementById("btn-mode-cycle").textContent = state.tierLabel;
  document.getElementById("mode-label").textContent = state.tierLabel;
  document.getElementById("tier-tag").textContent = "CALIBRATED!";

  const banner = document.getElementById("part1-tier-banner");
  const title = document.getElementById("part1-tier-title");
  const chips = document.getElementById("part1-chips-box");
  const tmplBtn = document.getElementById("btn-load-template-p1");

  if (state.tier === "foundation") {
    banner.classList.remove("hidden");
    chips.classList.remove("hidden");
    tmplBtn.classList.remove("hidden");
    title.textContent = "🌱 Foundation Mode: Click 'Load Guided Cloze Template' or use Phrase Chips below!";
  } else if (state.tier === "intermediate") {
    banner.classList.remove("hidden");
    chips.classList.remove("hidden");
    tmplBtn.classList.add("hidden");
    title.textContent = "🔥 Intermediate Mode: Use the Phrase & Cohesive Linker Chips to structure your email!";
  } else if (state.tier === "advanced") {
    banner.classList.remove("hidden");
    chips.classList.add("hidden");
    tmplBtn.classList.add("hidden");
    title.textContent = "👑 Pro Mode (Band 4.5 - 5.0): Write your 100-word reply independently using at least 3 cohesive devices!";
  }
}

document.getElementById("btn-load-template-p1").addEventListener("click", () => {
  soundEngine.playChipSfx();
  p1Input.value = `Hi Aiman,\n\nI am thrilled to hear about the upcoming Campus Wellness Festival and I cannot wait to help you organize it!\n\nWith regard to the daytime activity, I strongly prefer the Charity Fun Run. This is mainly because it allows students to exercise and de-stress outdoors after sitting in lectures all day.\n\nFurthermore, to attract more first-year students, I suggest offering free e-merit points and food vouchers for everyone who registers.\n\nLet's meet at Kafe Siswa later to discuss this further!\n\nBest wishes,\nAlex`;
  p1Input.dispatchEvent(new Event("input"));
});

// ============================================================================
// 2. MUET PART 1: 3-STAGE QUEST CHAIN (1A Grammar -> 1B Cohesive -> 1C Email)
// ============================================================================
window.switchPart1Stage = function (stageNum) {
  soundEngine.playClickSfx();
  [1, 2, 3].forEach((n) => {
    document.getElementById(`tab-p1-s${n}`).classList.toggle("active", n === stageNum);
    document.getElementById(`p1-stage-${n}`).classList.toggle("hidden", n !== stageNum);
  });
};

function renderPart1Challenges() {
  // Stage 1A: Grammar Fixer
  const gList = document.getElementById("grammar-fixer-list");
  gList.innerHTML = "";
  GRAMMAR_CHALLENGES.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    let html = `<div class="quiz-q">${item.q}</div><div class="quiz-options">`;
    item.opts.forEach((opt, oIdx) => {
      html += `
        <label class="quiz-opt-label">
          <input type="radio" name="gram-q-${idx}" value="${oIdx}" />
          <span>${opt}</span>
        </label>
      `;
    });
    html += `</div>`;
    card.innerHTML = html;
    gList.appendChild(card);
  });

  // Stage 1B: Cohesive Device Bridge
  const cList = document.getElementById("cohesive-fixer-list");
  cList.innerHTML = "";
  COHESIVE_CHALLENGES.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    let html = `<div class="quiz-q">${item.q}</div><div class="quiz-options">`;
    item.opts.forEach((opt, oIdx) => {
      html += `
        <label class="quiz-opt-label">
          <input type="radio" name="coh-q-${idx}" value="${oIdx}" />
          <span><b>${opt}</b></span>
        </label>
      `;
    });
    html += `</div>`;
    card.innerHTML = html;
    cList.appendChild(card);
  });
}

document.getElementById("btn-Verify-grammar").addEventListener("click", () => {
  let correct = 0;
  GRAMMAR_CHALLENGES.forEach((item, idx) => {
    const sel = document.querySelector(`input[name="gram-q-${idx}"]:checked`);
    if (sel && Number(sel.value) === item.ans) correct++;
  });

  const fb = document.getElementById("grammar-feedback");
  fb.classList.remove("hidden");
  if (correct === GRAMMAR_CHALLENGES.length) {
    soundEngine.playSuccessSfx();
    if (!state.completedGrammar) {
      state.completedGrammar = true;
      state.xp += 40;
      updateHUD();
    }
    fb.innerHTML = `✅ <b>Perfect Grammar &amp; Sentence Structure (3/3)!</b> +40 XP earned! Proceeding to Stage 1B (Cohesive Devices)...`;
    setTimeout(() => window.switchPart1Stage(2), 1100);
  } else {
    fb.innerHTML = `⚠️ You got <b>${correct}/3</b> correct. Look closely at subject-verb agreement and complete sentence structure!`;
  }
});

document.getElementById("btn-verify-cohesive").addEventListener("click", () => {
  let correct = 0;
  COHESIVE_CHALLENGES.forEach((item, idx) => {
    const sel = document.querySelector(`input[name="coh-q-${idx}"]:checked`);
    if (sel && Number(sel.value) === item.ans) correct++;
  });

  const fb = document.getElementById("cohesive-feedback");
  fb.classList.remove("hidden");
  if (correct === COHESIVE_CHALLENGES.length) {
    soundEngine.playSuccessSfx();
    if (!state.completedCohesive) {
      state.completedCohesive = true;
      state.xp += 40;
      updateHUD();
    }
    fb.innerHTML = `✅ <b>Awesome Cohesive Linking (3/3)!</b> +40 XP earned! Opening Stage 1C (Final Email Reply)...`;
    setTimeout(() => window.switchPart1Stage(3), 1100);
  } else {
    fb.innerHTML = `⚠️ You got <b>${correct}/3</b> correct. Match the cohesive device to its function (Topic, Reason, Addition)!`;
  }
});

// ============================================================================
// 3. PEEL IDEA SNOWBALL LAB (With Mei Ling at Library)
// ============================================================================
function renderPeelSnowballLab() {
  const container = document.getElementById("peel-builder-steps");
  container.innerHTML = "";

  PEEL_STEPS.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    let html = `<div class="quiz-q">⛄ ${item.step}: <span style="font-weight:600;color:#475569;">${item.prompt}</span></div><div class="quiz-options">`;
    item.opts.forEach((opt, oIdx) => {
      html += `
        <label class="quiz-opt-label">
          <input type="radio" name="peel-step-${idx}" value="${oIdx}" ${oIdx === item.best ? "checked" : ""} onchange="updateSnowballPreview()" />
          <span>${opt}</span>
        </label>
      `;
    });
    html += `</div>`;
    card.innerHTML = html;
    container.appendChild(card);
  });

  window.updateSnowballPreview();
}

window.updateSnowballPreview = function () {
  soundEngine.playChipSfx();
  const sentences = [];
  PEEL_STEPS.forEach((item, idx) => {
    const sel = document.querySelector(`input[name="peel-step-${idx}"]:checked`);
    if (sel) {
      sentences.push(item.opts[Number(sel.value)]);
    }
  });
  const fullPara = sentences.join(" ");
  const words = fullPara.trim() ? fullPara.trim().split(/\s+/).length : 0;
  document.getElementById("snowball-preview").textContent = fullPara;
  document.getElementById("snowball-word-count").textContent = words;
};

document.getElementById("btn-save-snowball").addEventListener("click", () => {
  soundEngine.playSuccessSfx();
  const para = document.getElementById("snowball-preview").textContent;

  IDEA_CARDS.peel_snowball = {
    id: "peel_snowball",
    title: "⛄ Developed PEEL Body Paragraph (Built at Library)",
    vocab: ["First and foremost", "streamlines", "For instance", "Consequently"],
    snippet: para + "\n\n",
  };

  if (!state.unlockedCards.includes("peel_snowball")) {
    state.unlockedCards.push("peel_snowball");
  }

  if (!state.completedPeel) {
    state.completedPeel = true;
    state.xp += 60;
    document.getElementById("q-peel").classList.add("done");
    updateHUD();
  }

  document.getElementById("peel-status-msg").textContent =
    "✅ Saved to your Idea Cards & inserted into your Part 2 Essay Editor!";
  p2Input.value += para + "\n\n";
  p2Input.dispatchEvent(new Event("input"));
});

const p1Input = document.getElementById("part1-input");
p1Input.addEventListener("input", () => {
  const text = p1Input.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById("p1-word-count").textContent = `${words} / 100 words`;

  const n1 = /thrilled|excited|happy|glad|great|love|can't wait|cannot wait|awesome/i.test(text);
  const n2 = /fun run|workshop|mental health|prefer|choose|reckon|because|since/i.test(text);
  const n3 = /promote|poster|tiktok|social media|merit|voucher|free|food|attract|freshies|suggest/i.test(text);
  const coh = (text.match(/with regard to|furthermore|moreover|besides|this is mainly because|however|in addition|therefore|consequently/gi) || []).length;

  toggleCheckPill("p1-note1-check", n1, "Note 1");
  toggleCheckPill("p1-note2-check", n2, "Note 2");
  toggleCheckPill("p1-note3-check", n3, "Note 3");

  const cEl = document.getElementById("p1-cohesive-check");
  if (cEl) {
    cEl.textContent = `🔗 Linkers: ${coh}`;
    cEl.className = `check-pill ${coh >= 2 ? "ok" : ""}`;
  }
});

function toggleCheckPill(id, ok, label) {
  const el = document.getElementById(id);
  el.className = `check-pill ${ok ? "ok" : ""}`;
  el.textContent = `${ok ? "✅" : "⬜"} ${label}`;
}

document.getElementById("btn-submit-part1").addEventListener("click", () => {
  soundEngine.playSuccessSfx();
  const text = p1Input.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const n1 = /thrilled|excited|happy|glad|great|love|can't wait|awesome/i.test(text);
  const n2 = /fun run|workshop|mental health|prefer|choose|reckon|because|since/i.test(text);
  const n3 = /promote|poster|tiktok|social media|merit|voucher|free|food|attract|freshies/i.test(text);

  const notesMet = [n1, n2, n3].filter(Boolean).length;
  let bandScore = "Band 3.5";
  if (words >= 95 && notesMet === 3) bandScore = "Band 5.0 (Cemerlang!)";
  else if (words >= 60 && notesMet >= 2) bandScore = "Band 4.0 (Syabas!)";

  const fb = document.getElementById("part1-feedback");
  fb.classList.remove("hidden");
  fb.innerHTML = `
    <strong>📊 MUET Part 1 Evaluation: ${bandScore}</strong><br/>
    • <b>Word Count:</b> ${words} words ${words >= 100 ? "✅" : "⚠️ (Aim for 100+ words)"}<br/>
    • <b>Task Fulfilment:</b> ${notesMet}/3 prompt notes covered.<br/>
    • <b>Reward:</b> +80 XP &amp; +RM 10.00 SiswaPay!
  `;

  if (!state.completedPart1 && notesMet >= 2) {
    state.completedPart1 = true;
    state.xp += 80;
    state.coins += 10;
    document.getElementById("q-task1").classList.add("done");
    updateHUD();
  }
});

const p2Input = document.getElementById("part2-input");
p2Input.addEventListener("input", () => {
  const text = p2Input.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  document.getElementById("p2-word-count").textContent = `${words} / 250 words`;

  const linkers = (text.match(/first and foremost|furthermore|moreover|nevertheless|however|in conclusion|for instance|consequently/gi) || []).length;
  const vocab = (text.match(/streamline|contactless|hygienic|congestion|infrastructure|contingency|outage|literacy|accountability|ecosystem|mitigate/gi) || []).length;

  const lEl = document.getElementById("p2-linker-count");
  lEl.textContent = `🔗 Linkers: ${linkers}`;
  lEl.className = `check-pill ${linkers >= 3 ? "ok" : ""}`;

  const vEl = document.getElementById("p2-vocab-count");
  vEl.textContent = `💎 Vocab: ${vocab}`;
  vEl.className = `check-pill ${vocab >= 3 ? "ok" : ""}`;
});

function renderEssayCards() {
  const container = document.getElementById("essay-cards-list");
  container.innerHTML = "";
  if (state.unlockedCards.length === 0) {
    container.innerHTML = `<div class="small-hint">Explore the 3D street &amp; enter <b>Kafe Siswa</b> or <b>HEPA Hub</b> to collect Idea Cards!</div>`;
    return;
  }

  for (const key of state.unlockedCards) {
    const c = IDEA_CARDS[key];
    const div = document.createElement("div");
    div.className = "idea-card-item";
    div.innerHTML = `<strong>${c.title}</strong><br/><span style="font-size:11px;color:#0369a1;">Vocab: ${c.vocab.join(", ")}</span>`;
    div.onmouseenter = () => soundEngine.playHoverSfx();
    div.onclick = () => {
      soundEngine.playChipSfx();
      p2Input.value += c.snippet;
      p2Input.dispatchEvent(new Event("input"));
      p2Input.focus();
    };
    container.appendChild(div);
  }
}

document.getElementById("btn-submit-part2").addEventListener("click", () => {
  soundEngine.playSuccessSfx();
  const text = p2Input.value.trim();
  const words = text ? text.split(/\s+/).length : 0;
  const linkers = (text.match(/first and foremost|furthermore|moreover|nevertheless|however|in conclusion|for instance|consequently/gi) || []).length;
  const vocab = (text.match(/streamline|contactless|hygienic|congestion|infrastructure|contingency|outage|literacy|accountability|ecosystem|mitigate/gi) || []).length;

  const fb = document.getElementById("part2-feedback");
  fb.classList.remove("hidden");
  fb.innerHTML = `
    <strong>🎓 Prof. Razak's Assessment:</strong><br/>
    • <b>Length:</b> ${words} words ${words >= 250 ? "✅ (250+ target met!)" : "💡 (Add more PEEL elaboration to reach 250 words)"}<br/>
    • <b>Cohesive Devices:</b> ${linkers} used | <b>C1/C2 Vocab:</b> ${vocab} used.<br/>
    • <b>Reward:</b> +150 XP &amp; RM 20.00 Dean's List Bonus!
  `;

  if (!state.completedPart2 && words >= 40) {
    state.completedPart2 = true;
    state.xp += 150;
    state.coins += 20;
    document.getElementById("q-task2").classList.add("done");
    updateHUD();
  }
});

function openNotebook() {
  const nb = document.getElementById("notebook-content");
  nb.innerHTML = "";
  Object.values(IDEA_CARDS).forEach((card) => {
    const unlocked = state.unlockedCards.includes(card.id);
    const el = document.createElement("div");
    el.className = "topic-card";
    el.innerHTML = unlocked
      ? `<h4>✅ ${card.title}</h4><p style="margin:6px 0;">${card.snippet}</p><p style="color:#0369a1;font-size:12px;"><b>Key Vocab:</b> ${card.vocab.join(", ")}</p>`
      : `<h4>🔒 Locked Idea Card</h4><p>Walk along the 3D boulevard and enter campus buildings to unlock this card!</p>`;
    nb.appendChild(el);
  });
  openModal("modal-notebook");
}

document.getElementById("btn-notebook").addEventListener("click", openNotebook);
document.getElementById("btn-how").addEventListener("click", openNotebook);

function updateHUD() {
  document.getElementById("hud-cards-pill").textContent = `${state.unlockedCards.length} / 3`;
  document.getElementById("hud-rm-pill").textContent = `RM ${state.coins.toFixed(2)}`;
  document.getElementById("hud-xp-pill").textContent = `${state.xp} XP`;
  document.getElementById("q-card-num").textContent = Math.min(2, state.unlockedCards.length);
  if (state.unlockedCards.length >= 2) {
    document.getElementById("q-cards").classList.add("done");
  }
}

// ----------------------------------------------------------------------------
// MAIN 3D CAMERA & DEPTH-SORTED RENDER LOOP
// ----------------------------------------------------------------------------
let lastTime = performance.now();

function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(dt);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cam = {
    x: player.x * 0.82,
    y: 42,
    z: player.z - 98,
  };

  if (state.zone === "outdoor") {
    renderOutdoor3D(cam);
  } else {
    renderInterior3D(state.zone, cam);
  }

  const entities = [
    ...NPCS.filter((n) => n.zone === state.zone).map((n) => ({
      type: "npc",
      z: n.z,
      obj: n,
    })),
    ...(oyen.zone === state.zone ? [{ type: "oyen", z: oyen.z, obj: oyen }] : []),
    { type: "player", z: player.z, obj: player },
  ].sort((a, b) => b.z - a.z);

  for (const ent of entities) {
    if (ent.type === "player") {
      drawCelShadedCharacter(player, player.x, player.z, player.isMoving, player.walk, cam, true);
    } else if (ent.type === "npc") {
      drawCelShadedCharacter(ent.obj, ent.obj.x, ent.obj.z, false, 0, cam, false);
    } else if (ent.type === "oyen") {
      drawCelShadedOyen(oyen.x, oyen.z, cam);
    }
  }

  // Subtle PS2 Scanline Finish
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  for (let y = 0; y < canvas.height; y += 4) {
    ctx.fillRect(0, y, canvas.width, 1);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
