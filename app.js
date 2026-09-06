// ================== Skeleton drawing setup ==================
const CONNECTIONS = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
];

const video = document.getElementById('video');
const canvas = document.getElementById('overlay');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const modeBar = document.getElementById('modeBar');
const modeRunBtn = document.getElementById('modeRunBtn');
const modeJumpBtn = document.getElementById('modeJumpBtn');
const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const topActions = document.getElementById('topActions');

const distPanel = document.getElementById('distPanel');
const distInput = document.getElementById('distInput');
const confirmDistBtn = document.getElementById('confirmDistBtn');
const backToGatesBtn = document.getElementById('backToGatesBtn');
const resultPanel = document.getElementById('resultPanel');
const timeResultEl = document.getElementById('timeResult');
const speedResultEl = document.getElementById('speedResult');
const againBtn = document.getElementById('againBtn');
const recalibBtn = document.getElementById('recalibBtn');

const gateControls = document.getElementById('gateControls');
const gateHint = document.getElementById('gateHint');
const gateBackBtn = document.getElementById('gateBackBtn');
const gateNextBtn = document.getElementById('gateNextBtn');

const jumpResultPanel = document.getElementById('jumpResultPanel');
const airTimeResultEl = document.getElementById('airTimeResult');
const jumpHeightResultEl = document.getElementById('jumpHeightResult');
const jumpAgainBtn = document.getElementById('jumpAgainBtn');
const jumpRecalibBtn = document.getElementById('jumpRecalibBtn');

const historyBtn = document.getElementById('historyBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const guideOverlay = document.getElementById('guideOverlay');
const guideIcon = document.getElementById('guideIcon');
const guideTitle = document.getElementById('guideTitle');
const guideText = document.getElementById('guideText');
const guideCloseBtn = document.getElementById('guideCloseBtn');

let detector = null;
let running = false;

// mode: 'run' | 'jump'
let mode = 'run';

// ================== HISTORY SYSTEM ==================
const HISTORY_KEY = 'motion_tracker_history';

function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveToHistory(type, data) {
  const history = getHistory();
  const entry = {
    type,
    data,
    date: new Date().toLocaleString('fa-IR'),
    timestamp: Date.now()
  };
  history.unshift(entry);
  // Keep last 50 entries
  if (history.length > 50) history.pop();
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save history');
  }
}

function renderHistory() {
  const history = getHistory();
  if (history.length === 0) {
    historyList.innerHTML = '<p style="color: #94a3b8; text-align: center;">هنوز اندازه‌گیری‌ای ثبت نشده</p>';
    return;
  }

  historyList.innerHTML = history.map(entry => {
    if (entry.type === 'run') {
      return `
        <div class="historyItem">
          <div class="date">🏃 دویدن • ${entry.date}</div>
          <div class="data">
            زمان: <span>${entry.data.time}s</span> •
            سرعت: <span>${entry.data.speed} m/s</span> •
            فاصله: <span>${entry.data.distance}m</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="historyItem">
          <div class="date">⤴️ پرش • ${entry.date}</div>
          <div class="data">
            زمان پرواز: <span>${entry.data.airTime}s</span> •
            ارتفاع: <span>${entry.data.height} cm</span>
          </div>
        </div>
      `;
    }
  }).join('');
}

historyBtn.addEventListener('click', () => {
  renderHistory();
  historyPanel.classList.add('visible');
});

closeHistoryBtn.addEventListener('click', () => {
  historyPanel.classList.remove('visible');
});

clearHistoryBtn.addEventListener('click', () => {
  if (confirm('آیا از پاک کردن همه تاریخچه مطمئن هستید؟')) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
});

// ================== SETTINGS SYSTEM ==================
const SETTINGS_KEY = 'motion_tracker_settings';

function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20
    };
  } catch (e) {
    return { jumpThresholdRatio: 0.12, landThresholdRatio: 0.06, calibFrames: 20 };
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Could not save settings');
  }
}

function loadSettingsUI() {
  const settings = getSettings();
  document.getElementById('jumpSensitivity').value = settings.jumpThresholdRatio;
  document.getElementById('landSensitivity').value = settings.landThresholdRatio;
  document.getElementById('calibFrames').value = settings.calibFrames;
  document.getElementById('jumpSensValue').textContent = Math.round(settings.jumpThresholdRatio * 100) + '%';
  document.getElementById('landSensValue').textContent = Math.round(settings.landThresholdRatio * 100) + '%';
  document.getElementById('calibFramesValue').textContent = settings.calibFrames + ' فریم';
}

settingsBtn.addEventListener('click', () => {
  loadSettingsUI();
  settingsPanel.classList.add('visible');
});

closeSettingsBtn.addEventListener('click', () => {
  const settings = {
    jumpThresholdRatio: parseFloat(document.getElementById('jumpSensitivity').value),
    landThresholdRatio: parseFloat(document.getElementById('landSensitivity').value),
    calibFrames: parseInt(document.getElementById('calibFrames').value)
  };
  saveSettings(settings);
  applySettings();
  settingsPanel.classList.remove('visible');
});

document.getElementById('jumpSensitivity').addEventListener('input', (e) => {
  document.getElementById('jumpSensValue').textContent = Math.round(e.target.value * 100) + '%';
});

document.getElementById('landSensitivity').addEventListener('input', (e) => {
  document.getElementById('landSensValue').textContent = Math.round(e.target.value * 100) + '%';
});

document.getElementById('calibFrames').addEventListener('input', (e) => {
  document.getElementById('calibFramesValue').textContent = e.target.value + ' فریم';
});

function applySettings() {
  const settings = getSettings();
  // Only rescale live thresholds if we already know the person's leg length;
  // otherwise the ratios get applied once calibration finishes (see jumpProcessFrame).
  if (legLengthPx != null) {
    airThresholdPx = legLengthPx * settings.jumpThresholdRatio;
    landThresholdPx = legLengthPx * settings.landThresholdRatio;
  }
  CALIB_FRAMES_NEEDED = settings.calibFrames;
}

// ================== GUIDE SYSTEM ==================
function showGuide(icon, title, text) {
  guideIcon.textContent = icon;
  guideTitle.textContent = title;
  guideText.textContent = text;
  guideOverlay.classList.add('visible');
}

guideCloseBtn.addEventListener('click', () => {
  guideOverlay.classList.remove('visible');
});

function hideAllPanels() {
  distPanel.classList.remove('visible');
  resultPanel.classList.remove('visible');
  jumpResultPanel.classList.remove('visible');
  gateControls.classList.remove('visible');
}

function setStatus(text) {
  statusEl.textContent = text;
}

// ================== RUN MODE ==================
// runPhase: 'calibrate1' | 'calibrate2' | 'enterDistance' | 'ready' | 'timing' | 'done'
let runPhase = 'calibrate1';
let gatePoints = [null, null];
let distanceMeters = 5;
let gateCrossed = [false, false];
let prevSide = [null, null];
let runStartTime = null;
let runEndTime = null;

function runEnterCalibrate1() {
  runPhase = 'calibrate1';
  gatePoints = [null, null];
  gateCrossed = [false, false];
  prevSide = [null, null];
  runStartTime = null;
  runEndTime = null;
  hideAllPanels();
  showGuide('👆', 'انتخاب مانع اول', 'روی نقطه‌ای از تصویر که مانع اول (روی زمین) قرار داره ضربه بزن. اگه اشتباه زدی، کافیه دوباره ضربه بزنی تا نقطه عوض بشه.');
  updateGateControls();
}

function runEnterCalibrate2(showGuideOverlay = true) {
  runPhase = 'calibrate2';
  hideAllPanels();
  if (showGuideOverlay) {
    showGuide('👆', 'انتخاب مانع دوم', 'حالا روی نقطهٔ مانع دوم ضربه بزن. اگه اشتباه زدی دوباره ضربه بزن. فاصله بین این دو نقطه رو بعداً وارد می‌کنی.');
  }
  updateGateControls();
}

function runEnterEnterDistance() {
  runPhase = 'enterDistance';
  hideAllPanels();
  setStatus('فاصلهٔ واقعی رو وارد کن و تأیید بزن');
  distPanel.classList.add('visible');
}

function runEnterReady() {
  runPhase = 'ready';
  gateCrossed = [false, false];
  prevSide = [null, null];
  runStartTime = null;
  runEndTime = null;
  hideAllPanels();
  setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
}

function runFinish() {
  runPhase = 'done';
  const elapsedSec = (runEndTime - runStartTime) / 1000;
  const speed = distanceMeters / elapsedSec;
  timeResultEl.textContent = elapsedSec.toFixed(2);
  speedResultEl.textContent = speed.toFixed(2);
  resultPanel.classList.add('visible');
  setStatus('تمام شد!');

  // Save to history
  saveToHistory('run', {
    time: elapsedSec.toFixed(2),
    speed: speed.toFixed(2),
    distance: distanceMeters
  });
}

function runUpdateGateCrossing(ankleX) {
  if (runPhase !== 'ready' && runPhase !== 'timing') return;
  if (ankleX == null) return;

  for (let i = 0; i < 2; i++) {
    if (gateCrossed[i]) continue;
    if (!gatePoints[i]) continue;
    const gateX = gatePoints[i].x;
    const side = ankleX < gateX ? -1 : 1;
    if (prevSide[i] != null && side !== prevSide[i]) {
      gateCrossed[i] = true;
      if (runStartTime === null) {
        runStartTime = performance.now();
        runPhase = 'timing';
        setStatus('در حال دویدن... ⏱');
      } else {
        runEndTime = performance.now();
        runFinish();
      }
    }
    prevSide[i] = side;
  }
}

function runDrawGates() {
  gatePoints.forEach((pt, i) => {
    if (!pt) return;
    const done = gateCrossed[i];
    ctx.strokeStyle = done ? '#22c55e' : '#f87171';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, canvas.height);
    ctx.stroke();

    ctx.fillStyle = done ? '#22c55e' : '#f87171';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 8, 0, 2 * Math.PI);
    ctx.fill();
  });
}

// ---- Gate calibration controls (allows correcting a mis-tapped point) ----
function updateGateControls() {
  if (runPhase !== 'calibrate1' && runPhase !== 'calibrate2') {
    gateControls.classList.remove('visible');
    return;
  }
  gateControls.classList.add('visible');
  const idx = runPhase === 'calibrate1' ? 0 : 1;
  const hasPoint = !!gatePoints[idx];
  gateNextBtn.disabled = !hasPoint;
  gateNextBtn.textContent = runPhase === 'calibrate1' ? 'ادامه' : 'ادامه و وارد کردن فاصله';
  gateBackBtn.style.display = runPhase === 'calibrate2' ? 'block' : 'none';
  gateHint.textContent = hasPoint
    ? 'برای اصلاح، دوباره روی تصویر ضربه بزن یا ادامه بده'
    : 'روی تصویر ضربه بزن تا نقطهٔ مانع ثبت بشه';
}

document.getElementById('stage').addEventListener('click', (e) => {
  if (mode !== 'run') return;
  if (runPhase !== 'calibrate1' && runPhase !== 'calibrate2') return;
  // Ignore taps that land on the gate-controls bar or the guide banner itself,
  // so dismissing the guide (or tapping its buttons) never gets misread as
  // placing an obstacle point.
  if (e.target.closest && (e.target.closest('#gateControls') || e.target.closest('#guideOverlay'))) return;
  // A real tap on the video means the person no longer needs the guide banner.
  guideOverlay.classList.remove('visible');
  const point = clientToCanvasCoords(e.clientX, e.clientY);
  const idx = runPhase === 'calibrate1' ? 0 : 1;
  gatePoints[idx] = point;
  updateGateControls();
});

gateNextBtn.addEventListener('click', () => {
  if (runPhase === 'calibrate1') {
    // If the second gate point was already set before going back, skip re-showing the guide.
    runEnterCalibrate2(!gatePoints[1]);
  } else if (runPhase === 'calibrate2') {
    runEnterEnterDistance();
  }
});

gateBackBtn.addEventListener('click', () => {
  runPhase = 'calibrate1';
  setStatus('برای اصلاح، دوباره روی مانع اول ضربه بزن یا ادامه بده');
  updateGateControls();
});

backToGatesBtn.addEventListener('click', () => {
  // Keep both existing points so the person can just fix the one that's wrong.
  runEnterCalibrate2(false);
});

confirmDistBtn.addEventListener('click', () => {
  const val = parseFloat(distInput.value);
  distanceMeters = (val > 0) ? val : 5;
  runEnterReady();
});

againBtn.addEventListener('click', runEnterReady);
recalibBtn.addEventListener('click', runEnterCalibrate1);

// ================== JUMP MODE ==================
// jumpPhase: 'calibrating' | 'ready' | 'airborne' | 'done'
let jumpPhase = 'calibrating';
let baselineY = null;
let legLengthPx = null;
let calibSamples = [];
let CALIB_FRAMES_NEEDED = 20; // ~0.5-1s of standing still
let airThresholdPx = 20;
let landThresholdPx = 10;
let aboveCount = 0;
let belowCount = 0;
const DEBOUNCE_FRAMES = 2;
let jumpTakeoffTime = null;
let jumpLandTime = null;

function jumpEnterCalibrating() {
  jumpPhase = 'calibrating';
  calibSamples = [];
  baselineY = null;
  legLengthPx = null;
  aboveCount = 0;
  belowCount = 0;
  hideAllPanels();
  applySettings();
  showGuide('🧍', 'کالیبراسیون پرش', 'صاف و بی‌حرکت بایست تا ارتفاع پایه ثبت بشه. حدود یک ثانیه طول می‌کشه.');
}

function jumpEnterReady() {
  jumpPhase = 'ready';
  aboveCount = 0;
  belowCount = 0;
  jumpTakeoffTime = null;
  jumpLandTime = null;
  hideAllPanels();
  setStatus('آماده! بپر 🤸');
}

function jumpFinish() {
  jumpPhase = 'done';
  const airTimeSec = (jumpLandTime - jumpTakeoffTime) / 1000;
  const heightMeters = (9.81 * airTimeSec * airTimeSec) / 8;
  airTimeResultEl.textContent = airTimeSec.toFixed(2);
  jumpHeightResultEl.textContent = (heightMeters * 100).toFixed(1);
  jumpResultPanel.classList.add('visible');
  setStatus('تمام شد!');

  // Save to history
  saveToHistory('jump', {
    airTime: airTimeSec.toFixed(2),
    height: (heightMeters * 100).toFixed(1)
  });
}

function getHipAnkleY(kp) {
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const hips = [lh, rh].filter(p => p && p.score > 0.3);
  const ankles = [la, ra].filter(p => p && p.score > 0.3);
  if (!ankles.length) return null;
  const ankleY = ankles.reduce((s, p) => s + p.y, 0) / ankles.length;
  let hipY = null;
  if (hips.length) hipY = hips.reduce((s, p) => s + p.y, 0) / hips.length;
  return { ankleY, hipY };
}

function jumpProcessFrame(kp) {
  const data = getHipAnkleY(kp);
  if (!data) return;
  const { ankleY, hipY } = data;

  if (jumpPhase === 'calibrating') {
    calibSamples.push({ ankleY, hipY });
    if (calibSamples.length >= CALIB_FRAMES_NEEDED) {
      baselineY = calibSamples.reduce((s, d) => s + d.ankleY, 0) / calibSamples.length;
      if (calibSamples[0].hipY != null) {
        const avgHipY = calibSamples.reduce((s, d) => s + (d.hipY || 0), 0) / calibSamples.length;
        legLengthPx = Math.max(30, baselineY - avgHipY);
      } else {
        legLengthPx = canvas.height * 0.25;
      }
      // Use the user's saved sensitivity settings, not hardcoded defaults.
      const settings = getSettings();
      airThresholdPx = legLengthPx * settings.jumpThresholdRatio;
      landThresholdPx = legLengthPx * settings.landThresholdRatio;
      jumpEnterReady();
    }
    return;
  }

  if (baselineY == null) return;
  const risePx = baselineY - ankleY; // positive when feet are above ground level

  if (jumpPhase === 'ready') {
    if (risePx > airThresholdPx) {
      aboveCount++;
      if (aboveCount >= DEBOUNCE_FRAMES) {
        jumpTakeoffTime = performance.now();
        jumpPhase = 'airborne';
        setStatus('در هوا... ⤴️');
      }
    } else {
      aboveCount = 0;
    }
  } else if (jumpPhase === 'airborne') {
    if (risePx < landThresholdPx) {
      belowCount++;
      if (belowCount >= DEBOUNCE_FRAMES) {
        jumpLandTime = performance.now();
        jumpFinish();
      }
    } else {
      belowCount = 0;
    }
  }
}

function jumpDrawOverlay() {
  if (baselineY != null) {
    ctx.strokeStyle = jumpPhase === 'airborne' ? '#facc15' : '#22c55e';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(canvas.width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

jumpAgainBtn.addEventListener('click', jumpEnterReady);
jumpRecalibBtn.addEventListener('click', jumpEnterCalibrating);

// ================== MODE SWITCHING ==================
function switchMode(newMode) {
  mode = newMode;
  hideAllPanels();
  modeRunBtn.classList.toggle('active', mode === 'run');
  modeJumpBtn.classList.toggle('active', mode === 'jump');
  if (mode === 'run') {
    runEnterCalibrate1();
  } else {
    jumpEnterCalibrating();
  }
}

modeRunBtn.addEventListener('click', () => switchMode('run'));
modeJumpBtn.addEventListener('click', () => switchMode('jump'));

// ---- Convert a tap's client (viewport) coords to canvas pixel space,
// accounting for object-fit: cover cropping/scaling. ----
function clientToCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const dispW = rect.width;
  const dispH = rect.height;
  const natW = canvas.width;
  const natH = canvas.height;
  if (!natW || !natH) return { x, y };

  const dispAspect = dispW / dispH;
  const natAspect = natW / natH;
  let scale, offsetX = 0, offsetY = 0;
  if (natAspect > dispAspect) {
    scale = dispH / natH;
    offsetX = (dispW - natW * scale) / 2;
  } else {
    scale = dispW / natW;
    offsetY = (dispH - natH * scale) / 2;
  }
  return { x: (x - offsetX) / scale, y: (y - offsetY) / scale };
}

// ================== Camera + model setup ==================
async function setupCamera() {
  const isPortrait = window.innerHeight >= window.innerWidth;
  const constraints = {
    video: {
      facingMode: { ideal: 'environment' },
      // Match the requested resolution's orientation to the phone's actual
      // orientation, so object-fit: cover doesn't have to crop a wide
      // landscape frame down to a narrow strip (which looks like extreme zoom).
      width: { ideal: isPortrait ? 1080 : 1920 },
      height: { ideal: isPortrait ? 1920 : 1080 },
    },
    audio: false,
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;

  // Some phones (especially multi-lens Android devices) default the back
  // camera to a non-1x lens or apply digital zoom, which looks "zoomed in"
  // with no way to undo it from the video element. Where the browser exposes
  // a zoom capability, explicitly reset it to its minimum (widest) value.
  const track = stream.getVideoTracks()[0];
  if (track && track.getCapabilities) {
    try {
      const caps = track.getCapabilities();
      if (caps.zoom) {
        await track.applyConstraints({ advanced: [{ zoom: caps.zoom.min }] });
      }
    } catch (e) {
      // Not all browsers/devices support programmatic zoom control; safe to ignore.
    }
  }

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      video.play();
      resolve();
    };
  });
}

function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

// ---- Detect real orientation/frame-size changes and invalidate stale
// calibration (gate points / jump baseline) since their pixel coordinates
// no longer correspond to the new frame layout. ----
function refreshCanvasForOrientation() {
  const prevW = canvas.width;
  const prevH = canvas.height;
  resizeCanvas();
  const changed = canvas.width !== prevW || canvas.height !== prevH;
  if (!changed || !running) return;

  if (mode === 'run' && runPhase !== 'calibrate1') {
    setStatus('چرخش گوشی تشخیص داده شد؛ لطفاً موانع رو دوباره تنظیم کن');
    runEnterCalibrate1();
  } else if (mode === 'jump' && jumpPhase !== 'calibrating') {
    setStatus('چرخش گوشی تشخیص داده شد؛ در حال کالیبراسیون مجدد...');
    jumpEnterCalibrating();
  }
}

async function loadModel() {
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.BlazePose,
    {
      runtime: 'mediapipe',
      modelType: 'lite',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
    }
  );
}

// ================== Drawing / main loop ==================
function drawPose(poses) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (mode === 'run') runDrawGates();
  if (mode === 'jump') jumpDrawOverlay();

  if (!poses.length) return;
  const kp = {};
  for (const point of poses[0].keypoints) kp[point.name] = point;

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  for (const [a, b] of CONNECTIONS) {
    const pa = kp[a], pb = kp[b];
    if (pa && pb && pa.score > 0.3 && pb.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#4ade80';
  for (const point of poses[0].keypoints) {
    if (point.score > 0.3) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  if (mode === 'run') runUpdateGateCrossing(getAnkleX(kp));
  if (mode === 'jump') jumpProcessFrame(kp);
}

function getAnkleX(kp) {
  const l = kp['left_ankle'], r = kp['right_ankle'];
  const validL = l && l.score > 0.3;
  const validR = r && r.score > 0.3;
  if (validL && validR) return (l.x + r.x) / 2;
  if (validL) return l.x;
  if (validR) return r.x;
  return null;
}

async function detectLoop() {
  if (!running) return;
  if (video.readyState >= 2) {
    const poses = await detector.estimatePoses(video, { flipHorizontal: false });
    drawPose(poses);
  }
  requestAnimationFrame(detectLoop);
}

async function start() {
  startOverlay.style.display = 'none';
  setStatus('در حال فعال‌سازی دوربین...');
  await setupCamera();
  resizeCanvas();

  window.addEventListener('resize', refreshCanvasForOrientation);
  window.addEventListener('orientationchange', () => {
    // videoWidth/videoHeight often update a few hundred ms after the rotation event.
    setTimeout(refreshCanvasForOrientation, 300);
    setTimeout(refreshCanvasForOrientation, 800);
  });
  if (screen.orientation && screen.orientation.addEventListener) {
    screen.orientation.addEventListener('change', () => {
      setTimeout(refreshCanvasForOrientation, 300);
    });
  }

  setStatus('در حال بارگذاری مدل تشخیص بدن...');
  await loadModel();

  running = true;
  modeBar.style.display = 'flex';
  topActions.style.display = 'flex';
  applySettings();
  runEnterCalibrate1();
  detectLoop();
}

startBtn.addEventListener('click', () => {
  start().catch((err) => {
    setStatus('خطا: ' + err.message);
    console.error(err);
  });
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
