// ================== VALIDATION SYSTEM ==================
/**
 * Validation constants and settings
 */
const VALIDATION_SETTINGS = {
  minGateDistancePercent: 0.20, // حداقل 20% عرض صفحه
  minDistance: 0.1, // حداقل 0.1 متر
  maxDistance: 100, // حداکثر 100 متر
  maxJumpAirTime: 2.0, // حداکثر 2 ثانیه
  maxRealisticSpeed: 15, // حداکثر سرعت منطقی (m/s) - رکورد جهان ~12.4 m/s
  minRealisticSpeed: 0.5, // حداقل سرعت منطقی (m/s)
  maxJumpHeight: 150, // حداکثر ارتفاع پرش منطقی (cm) - رکورد جهان ~63cm
  minJumpHeight: 1 // حداقل ارتفاع پرش (cm)
};

/**
 * Validate gate points distance
 */
function validateGatePoints(point1, point2) {
  if (!point1 || !point2) {
    return { valid: false, message: 'هر دو نقطه باید مشخص شده باشند' };
  }
  
  const distance = Math.abs(point1.x - point2.x);
  const minDistance = canvas.width * VALIDATION_SETTINGS.minGateDistancePercent;
  
  if (distance < minDistance) {
    return {
      valid: false,
      message: `فاصله بین دو مانع خیلی کمه! لطفاً دو نقطه رو دورتر از هم انتخاب کن.\n\nفاصله فعلی: ${Math.round(distance)}px\nحداقل فاصله: ${Math.round(minDistance)}px`
    };
  }
  
  return { valid: true };
}

/**
 * Validate distance input
 */
function validateDistance(distance) {
  const num = parseFloat(distance);
  
  if (isNaN(num)) {
    return { valid: false, message: 'لطفاً یک عدد معتبر وارد کن' };
  }
  
  if (num <= VALIDATION_SETTINGS.minDistance) {
    return {
      valid: false,
      message: `فاصله نباید کمتر از ${VALIDATION_SETTINGS.minDistance} متر باشه`
    };
  }
  
  if (num > VALIDATION_SETTINGS.maxDistance) {
    return {
      valid: false,
      message: `فاصله نباید بیشتر از ${VALIDATION_SETTINGS.maxDistance} متر باشه`
    };
  }
  
  return { valid: true, value: num };
}

/**
 * Validate jump air time
 */
function validateJumpAirTime(airTime) {
  if (airTime > VALIDATION_SETTINGS.maxJumpAirTime) {
    return {
      valid: false,
      warning: true,
      message: `⚠️ زمان پرواز غیرمنطقیه!\n\nزمان اندازه‌گیری شده: ${airTime.toFixed(2)}s\nحداکثر منطقی: ${VALIDATION_SETTINGS.maxJumpAirTime}s\n\nاحتمالاً مشکلی در تشخیص پیش اومده. دوباره امتحان کن.`
    };
  }
  
  return { valid: true };
}

/**
 * Validate run speed result
 */
function validateRunSpeed(speed, time, distance) {
  const warnings = [];
  
  // Check if speed is unrealistically high
  if (speed > VALIDATION_SETTINGS.maxRealisticSpeed) {
    warnings.push(`⚠️ سرعت غیرمنطقی: ${speed.toFixed(2)} m/s\n\nرکورد جهان دو سرعت: ~12.4 m/s (Usain Bolt)\nسرعت اندازه‌گیری شده شما بیشتر از حد معمول است.`);
  }
  
  // Check if speed is unrealistically low
  if (speed < VALIDATION_SETTINGS.minRealisticSpeed) {
    warnings.push(`⚠️ سرعت خیلی کم: ${speed.toFixed(2)} m/s\n\nاحتمالاً مشکلی در اندازه‌گیری زمان پیش اومده.`);
  }
  
  // Check if time is too short (might be false trigger)
  if (time < 0.3) {
    warnings.push(`⚠️ زمان خیلی کوتاه: ${time.toFixed(2)}s\n\nممکنه trigger اشتباهی اتفاق افتاده باشه.`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings: warnings
  };
}

/**
 * Validate jump height result
 */
function validateJumpHeight(height, airTime) {
  const warnings = [];
  
  if (height > VALIDATION_SETTINGS.maxJumpHeight) {
    warnings.push(`⚠️ ارتفاع غیرمنطقی: ${height.toFixed(0)} cm\n\nرکورد جهان پرش عمودی: ~63 cm\nارتفاع اندازه‌گیری شده شما بیشتر از حد معمول است.`);
  }
  
  if (height < VALIDATION_SETTINGS.minJumpHeight) {
    warnings.push(`⚠️ ارتفاع خیلی کم: ${height.toFixed(0)} cm\n\nاحتمالاً مشکلی در تشخیص پیش اومده.`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings: warnings
  };
}

/**
 * Show validation warning modal
 */
function showValidationWarning(title, message, onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.id = 'validationModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="
      background: #1e293b;
      border: 2px solid #f59e0b;
      border-radius: 20px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      color: #e2e8f0;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
      <h3 style="color: #f59e0b; margin-bottom: 12px; font-size: 18px;">${title}</h3>
      <p style="color: #94a3b8; margin-bottom: 20px; line-height: 1.6; font-size: 14px; white-space: pre-line;">${message}</p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${onConfirm ? `
          <button id="validationConfirmBtn" style="
            background: #22c55e;
            color: #052e16;
            border: none;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 999px;
            cursor: pointer;
            min-height: 44px;
          ">ادامه با این نتیجه</button>
        ` : ''}
        <button id="validationCancelBtn" style="
          background: ${onConfirm ? 'transparent' : '#22c55e'};
          color: ${onConfirm ? '#94a3b8' : '#052e16'};
          border: ${onConfirm ? '2px solid #475569' : 'none'};
          padding: ${onConfirm ? '12px 24px' : '14px 24px'};
          font-size: ${onConfirm ? '14px' : '16px'};
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-height: 44px;
        ">${onConfirm ? 'دوباره تلاش کن' : 'متوجه شدم'}</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const confirmBtn = document.getElementById('validationConfirmBtn');
  const cancelBtn = document.getElementById('validationCancelBtn');
  
  if (confirmBtn && onConfirm) {
    confirmBtn.onclick = () => {
      modal.remove();
      onConfirm();
    };
  }
  
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      modal.remove();
      if (onCancel) onCancel();
    };
  }
}

// ================== SKELETON DRAWING SETUP ==================
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

// ================== PERFORMANCE MONITORING SYSTEM ==================
let performanceMode = 'normal'; // 'normal' | 'low-power'
let fpsHistory = [];
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFPS = 60;
let lowFPSWarningShown = false;

/**
 * Calculate current FPS
 */
function calculateFPS() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  
  if (delta > 0) {
    const fps = 1000 / delta;
    fpsHistory.push(fps);
    
    // Keep last 30 frames
    if (fpsHistory.length > 30) {
      fpsHistory.shift();
    }
    
    // Calculate average FPS
    if (fpsHistory.length >= 10) {
      currentFPS = fpsHistory.reduce((a, b) => a + b) / fpsHistory.length;
    }
  }
  
  frameCount++;
  
  // Check FPS every 60 frames (~1 second)
  if (frameCount % 60 === 0) {
    checkPerformance();
  }
}

/**
 * Check performance and show warning if needed
 */
function checkPerformance() {
  console.log(`⚡ Current FPS: ${currentFPS.toFixed(1)}`);
  
  // Update FPS indicator if exists
  updateFPSIndicator();
  
  // Show warning if FPS is too low
  if (currentFPS < 15 && !lowFPSWarningShown && performanceMode === 'normal') {
    lowFPSWarningShown = true;
    showLowFPSWarning();
  }
  
  // Auto-enable low-power mode if FPS drops below 10
  if (currentFPS < 10 && performanceMode === 'normal') {
    console.warn('⚠️ Performance critical! Auto-enabling low-power mode');
    enableLowPowerMode(true);
  }
}

/**
 * Show low FPS warning
 */
function showLowFPSWarning() {
  const warning = document.createElement('div');
  warning.id = 'fpsWarning';
  warning.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9998;
    background: rgba(15, 23, 42, 0.98);
    border: 2px solid #f59e0b;
    border-radius: 20px;
    padding: 24px;
    max-width: 90%;
    width: 360px;
    text-align: center;
    color: #e2e8f0;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  `;
  
  warning.innerHTML = `
    <div style="font-size: 40px; margin-bottom: 12px;">⚡</div>
    <h3 style="color: #f59e0b; margin-bottom: 12px; font-size: 18px;">عملکرد ضعیف تشخیص داده شد</h3>
    <p style="color: #94a3b8; margin-bottom: 16px; font-size: 14px; line-height: 1.6;">
      FPS فعلی: ${currentFPS.toFixed(1)}<br>
      برای بهبود عملکرد، حالت کم‌مصرف رو فعال کن.
    </p>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <button id="enableLowPowerBtn" style="
        background: #22c55e;
        color: #052e16;
        border: none;
        padding: 12px 20px;
        font-size: 15px;
        font-weight: bold;
        border-radius: 999px;
        cursor: pointer;
        min-height: 44px;
      ">⚡ فعال‌سازی حالت کم‌مصرف</button>
      <button id="dismissFPSWarningBtn" style="
        background: transparent;
        color: #94a3b8;
        border: 2px solid #475569;
        padding: 10px 20px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 999px;
        cursor: pointer;
        min-height: 44px;
      ">ادامه با حالت عادی</button>
    </div>
  `;
  
  document.body.appendChild(warning);
  
  document.getElementById('enableLowPowerBtn').onclick = () => {
    warning.remove();
    enableLowPowerMode();
  };
  
  document.getElementById('dismissFPSWarningBtn').onclick = () => {
    warning.remove();
  };
}

/**
 * Enable/disable low-power mode
 */
function enableLowPowerMode(auto = false) {
  performanceMode = 'low-power';
  console.log('⚡ Low-power mode enabled' + (auto ? ' (auto)' : ''));
  
  // Update settings
  const settings = getSettings();
  settings.lowPowerMode = true;
  saveSettings(settings);
  
  // Update UI
  updatePerformanceModeUI();
  
  // Show notification
  if (!auto) {
    setStatus('حالت کم‌مصرف فعال شد ⚡');
    setTimeout(() => {
      if (mode === 'run' && runPhase === 'ready') {
        setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
      } else if (mode === 'jump' && jumpPhase === 'ready') {
        setStatus('آماده! بپر 🤸');
      }
    }, 2000);
  }
}

function disableLowPowerMode() {
  performanceMode = 'normal';
  console.log('⚡ Low-power mode disabled');
  
  // Update settings
  const settings = getSettings();
  settings.lowPowerMode = false;
  saveSettings(settings);
  
  // Update UI
  updatePerformanceModeUI();
  
  // Reset warning flag
  lowFPSWarningShown = false;
  
  setStatus('حالت عادی فعال شد');
  setTimeout(() => {
    if (mode === 'run' && runPhase === 'ready') {
      setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
    } else if (mode === 'jump' && jumpPhase === 'ready') {
      setStatus('آماده! بپر 🤸');
    }
  }, 2000);
}

/**
 * Update performance mode UI elements
 */
function updatePerformanceModeUI() {
  const checkbox = document.getElementById('lowPowerMode');
  if (checkbox) {
    checkbox.checked = performanceMode === 'low-power';
  }
}

/**
 * Create/update FPS indicator
 */
function updateFPSIndicator() {
  let indicator = document.getElementById('fpsIndicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'fpsIndicator';
    indicator.style.cssText = `
      position: absolute;
      top: calc(env(safe-area-inset-top, 16px) + 8px);
      left: calc(100% - 80px);
      z-index: 4;
      background: rgba(15, 23, 42, 0.75);
      color: #4ade80;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
    `;
    document.getElementById('stage').appendChild(indicator);
  }
  
  // Update color based on FPS
  let color = '#4ade80'; // Green
  if (currentFPS < 15) {
    color = '#ef4444'; // Red
  } else if (currentFPS < 25) {
    color = '#f59e0b'; // Orange
  } else if (currentFPS < 40) {
    color = '#facc15'; // Yellow
  }
  
  indicator.style.color = color;
  indicator.textContent = `${currentFPS.toFixed(0)} FPS`;
  
  // Add performance mode indicator
  if (performanceMode === 'low-power') {
    indicator.textContent += ' ⚡';
  }
}

// ================== ORIENTATION & RESOLUTION MANAGEMENT ==================
let currentOrientation = null; // 'portrait' | 'landscape'
let currentCameraStream = null;
let isReconfiguring = false;

/**
 * Detect current orientation
 */
function getCurrentOrientation() {
  return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
}

/**
 * Calculate optimal resolution based on screen and orientation
 */
function calculateOptimalResolution(orientation) {
  const screenW = window.screen.width;
  const screenH = window.screen.height;
  const aspectRatio = Math.min(screenW, screenH) / Math.max(screenW, screenH);
  
  console.log(`📐 Screen: ${screenW}x${screenH}, Aspect: ${aspectRatio.toFixed(2)}`);

  let targetWidth, targetHeight;

  if (orientation === 'portrait') {
    // Portrait: taller than wide
    // Common ratios: 16:9 (1.78), 18:9 (2.0), 19.5:9 (2.17), 20:9 (2.22)
    if (aspectRatio >= 0.55) {
      // Ultra-tall phones (20:9, 21:9)
      targetWidth = 1080;
      targetHeight = Math.round(1080 / aspectRatio);
    } else if (aspectRatio >= 0.50) {
      // Modern phones (18:9, 19.5:9)
      targetWidth = 1080;
      targetHeight = 1920;
    } else {
      // Older phones (16:9)
      targetWidth = 1080;
      targetHeight = 1920;
    }
  } else {
    // Landscape: wider than tall
    if (aspectRatio >= 0.55) {
      targetWidth = 1920;
      targetHeight = 1080;
    } else {
      targetWidth = Math.round(1080 / aspectRatio);
      targetHeight = 1080;
    }
  }

  // Ensure we don't request resolution higher than screen
  targetWidth = Math.min(targetWidth, Math.max(screenW, screenH));
  targetHeight = Math.min(targetHeight, Math.max(screenW, screenH));

  console.log(`🎯 Optimal resolution: ${targetWidth}x${targetHeight} (${orientation})`);

  return { width: targetWidth, height: targetHeight };
}

/**
 * Get supported camera resolutions (if available)
 */
async function getSupportedResolutions(track) {
  try {
    if (!track || !track.getCapabilities) return null;
    
    const caps = track.getCapabilities();
    if (!caps.width || !caps.height) return null;

    return {
      width: { min: caps.width.min, max: caps.width.max },
      height: { min: caps.height.min, max: caps.height.max }
    };
  } catch (error) {
    console.warn('Could not get camera capabilities:', error);
    return null;
  }
}

// ================== ERROR HANDLING SYSTEM ==================
/**
 * Error types and their Persian user-friendly messages
 */
const ERROR_MESSAGES = {
  CAMERA_PERMISSION_DENIED: {
    title: '❌ دسترسی دوربین رد شد',
    message: 'لطفاً در تنظیمات مرورگر، دسترسی به دوربین رو فعال کن و دوباره امتحان کن.',
    recoverable: true
  },
  CAMERA_NOT_FOUND: {
    title: '📷 دوربین یافت نشد',
    message: 'دوربینی در دستگاه پیدا نشد. مطمئن شو که دوربین به درستی متصل و فعال هست.',
    recoverable: true
  },
  CAMERA_IN_USE: {
    title: '🔒 دوربین در حال استفاده',
    message: 'دوربین توسط برنامه دیگری استفاده می‌شه. لطفاً اون رو ببند و دوباره تلاش کن.',
    recoverable: true
  },
  CAMERA_UNKNOWN: {
    title: '⚠️ خطای دوربین',
    message: 'مشکلی در فعال‌سازی دوربین پیش اومد. لطفاً دوباره تلاش کن.',
    recoverable: true
  },
  MODEL_LOAD_FAILED: {
    title: '🧠 خطا در بارگذاری مدل',
    message: 'مدل هوش مصنوعی بارگذاری نشد. اتصال اینترنت رو بررسی کن و دوباره امتحان کن.',
    recoverable: true
  },
  MODEL_INIT_FAILED: {
    title: '⚙️ خطا در راه‌اندازی مدل',
    message: 'مشکلی در راه‌اندازی سیستم تشخیص بدن پیش اومد. لطفاً صفحه رو رفرش کن.',
    recoverable: true
  },
  DETECTION_FAILED: {
    title: '🔍 خطا در تشخیص',
    message: 'تشخیص حرکت با مشکل مواجه شد. دوباره شروع کن.',
    recoverable: true
  },
  WEBGL_NOT_SUPPORTED: {
    title: '🎮 WebGL پشتیبانی نمی‌شه',
    message: 'مرورگر یا دستگاه شما از WebGL پشتیبانی نمی‌کنه که برای اجرای این برنامه ضروریه.',
    recoverable: false
  },
  UNSUPPORTED_BROWSER: {
    title: '🌐 مرورگر پشتیبانی نمی‌شه',
    message: 'لطفاً از مرورگر Chrome، Safari، Firefox یا Edge استفاده کن.',
    recoverable: false
  },
  UNKNOWN_ERROR: {
    title: '❓ خطای ناشناخته',
    message: 'مشکل پیش‌بینی نشده‌ای رخ داد. لطفاً دوباره تلاش کن.',
    recoverable: true
  }
};

/**
 * Log error to console with context
 */
function logError(context, error, additionalInfo = {}) {
  console.group(`🔴 Error in ${context}`);
  console.error('Error object:', error);
  console.error('Error message:', error?.message || 'No message');
  console.error('Error stack:', error?.stack || 'No stack');
  if (Object.keys(additionalInfo).length > 0) {
    console.error('Additional info:', additionalInfo);
  }
  console.groupEnd();
}

/**
 * Classify camera errors
 */
function classifyCameraError(error) {
  const errorName = error?.name || '';
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
    return 'CAMERA_PERMISSION_DENIED';
  }
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
    return 'CAMERA_NOT_FOUND';
  }
  if (errorName === 'NotReadableError' || errorName === 'TrackStartError' || errorMessage.includes('in use')) {
    return 'CAMERA_IN_USE';
  }
  return 'CAMERA_UNKNOWN';
}

/**
 * Show error modal with retry option
 */
function showErrorModal(errorType, technicalDetails = null) {
  const errorInfo = ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  // Hide any existing panels
  hideAllPanels();
  guideOverlay.classList.remove('visible');
  
  // Create or get error modal
  let errorModal = document.getElementById('errorModal');
  if (!errorModal) {
    errorModal = document.createElement('div');
    errorModal.id = 'errorModal';
    errorModal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    `;
    document.body.appendChild(errorModal);
  }

  errorModal.innerHTML = `
    <div style="
      background: #1e293b;
      border: 2px solid #ef4444;
      border-radius: 20px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      color: #e2e8f0;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">${errorInfo.title.split(' ')[0]}</div>
      <h3 style="color: #ef4444; margin-bottom: 12px; font-size: 18px;">${errorInfo.title.substring(2)}</h3>
      <p style="color: #94a3b8; margin-bottom: 20px; line-height: 1.6; font-size: 14px;">${errorInfo.message}</p>
      ${technicalDetails ? `
        <details style="margin-bottom: 20px; text-align: right;">
          <summary style="color: #64748b; cursor: pointer; font-size: 12px; margin-bottom: 8px;">جزئیات فنی</summary>
          <pre style="
            background: #0f172a;
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            text-align: left;
            font-size: 11px;
            color: #94a3b8;
            border: 1px solid #334155;
          ">${technicalDetails}</pre>
        </details>
      ` : ''}
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${errorInfo.recoverable ? `
          <button id="errorRetryBtn" style="
            background: #22c55e;
            color: #052e16;
            border: none;
            padding: 14px 24px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 999px;
            cursor: pointer;
          ">🔄 تلاش مجدد</button>
        ` : ''}
        <button id="errorCloseBtn" style="
          background: transparent;
          color: #94a3b8;
          border: 2px solid #475569;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
        ">${errorInfo.recoverable ? 'بستن' : 'متوجه شدم'}</button>
      </div>
    </div>
  `;

  const retryBtn = document.getElementById('errorRetryBtn');
  const closeBtn = document.getElementById('errorCloseBtn');

  if (retryBtn) {
    retryBtn.onclick = () => {
      errorModal.style.display = 'none';
      // Reset and retry based on context
      if (errorType.includes('CAMERA')) {
        retryStart();
      } else if (errorType.includes('MODEL')) {
        retryStart();
      } else {
        window.location.reload();
      }
    };
  }

  closeBtn.onclick = () => {
    errorModal.style.display = 'none';
    if (!errorInfo.recoverable) {
      startOverlay.style.display = 'flex';
      startBtn.textContent = 'بازگشت به صفحه اصلی';
    }
  };

  errorModal.style.display = 'flex';
}

/**
 * Retry starting the application
 */
function retryStart() {
  // Reset UI
  startOverlay.style.display = 'flex';
  startBtn.textContent = 'شروع مجدد';
  document.getElementById('hint').textContent = 'برای شروع، اجازهٔ دسترسی به دوربین رو بده. مدل تشخیص بدن کاملاً روی گوشی اجرا می‌شه.';
  
  // Reset state
  running = false;
  detector = null;
  
  // Stop any existing video stream
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

/**
 * Check browser compatibility
 */
function checkBrowserCompatibility() {
  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    logError('Browser Check', new Error('getUserMedia not supported'));
    showErrorModal('UNSUPPORTED_BROWSER', 'navigator.mediaDevices.getUserMedia is not available');
    return false;
  }

  // Check WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      logError('Browser Check', new Error('WebGL not supported'));
      showErrorModal('WEBGL_NOT_SUPPORTED', 'WebGL context could not be created');
      return false;
    }
  } catch (e) {
    logError('Browser Check', e);
    showErrorModal('WEBGL_NOT_SUPPORTED', e.message);
    return false;
  }

  return true;
}

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
  const history = getHistory();
  const count = history.length;
  
  if (count === 0) {
    showValidationWarning(
      'تاریخچه خالی است',
      'هیچ رکوردی برای پاک کردن وجود نداره.',
      null,
      null
    );
    return;
  }
  
  showValidationWarning(
    'پاک کردن تاریخچه',
    `آیا از پاک کردن همه ${count} رکورد مطمئن هستی؟\n\nاین عمل قابل بازگشت نیست!`,
    () => {
      // User confirmed - delete all
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
      setStatus('✅ تاریخچه پاک شد');
      setTimeout(() => {
        if (mode === 'run' && runPhase === 'ready') {
          setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
        } else if (mode === 'jump' && jumpPhase === 'ready') {
          setStatus('آماده! بپر 🤸');
        }
      }, 2000);
    },
    null
  );
});

// ================== SETTINGS SYSTEM ==================
const SETTINGS_KEY = 'motion_tracker_settings';

function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20,
      lowPowerMode: false
    };
  } catch (e) {
    return { 
      jumpThresholdRatio: 0.12, 
      landThresholdRatio: 0.06, 
      calibFrames: 20,
      lowPowerMode: false
    };
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
  document.getElementById('lowPowerMode').checked = settings.lowPowerMode || false;
  
  // Update performance mode
  if (settings.lowPowerMode) {
    performanceMode = 'low-power';
  }
}

settingsBtn.addEventListener('click', () => {
  loadSettingsUI();
  settingsPanel.classList.add('visible');
});

closeSettingsBtn.addEventListener('click', () => {
  const lowPowerChecked = document.getElementById('lowPowerMode').checked;
  const settings = {
    jumpThresholdRatio: parseFloat(document.getElementById('jumpSensitivity').value),
    landThresholdRatio: parseFloat(document.getElementById('landSensitivity').value),
    calibFrames: parseInt(document.getElementById('calibFrames').value),
    lowPowerMode: lowPowerChecked
  };
  saveSettings(settings);
  
  // Apply performance mode change
  if (lowPowerChecked && performanceMode === 'normal') {
    enableLowPowerMode();
  } else if (!lowPowerChecked && performanceMode === 'low-power') {
    disableLowPowerMode();
  }
  
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
  
  // Validate speed result
  const validation = validateRunSpeed(speed, elapsedSec, distanceMeters);
  
  timeResultEl.textContent = elapsedSec.toFixed(2);
  speedResultEl.textContent = speed.toFixed(2);
  resultPanel.classList.add('visible');
  
  if (!validation.valid && validation.warnings.length > 0) {
    // Show warning but allow continuing
    setStatus('⚠️ نتیجه نامعقول!');
    showValidationWarning(
      'نتیجه غیرمنطقی',
      validation.warnings.join('\n\n'),
      () => {
        // User confirmed - save anyway
        setStatus('تمام شد!');
        saveToHistory('run', {
          time: elapsedSec.toFixed(2),
          speed: speed.toFixed(2),
          distance: distanceMeters
        });
      },
      () => {
        // User wants to retry
        resultPanel.classList.remove('visible');
        runEnterReady();
      }
    );
  } else {
    setStatus('تمام شد!');
    // Save to history
    saveToHistory('run', {
      time: elapsedSec.toFixed(2),
      speed: speed.toFixed(2),
      distance: distanceMeters
    });
  }
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
    // Validate gate points before proceeding
    const validation = validateGatePoints(gatePoints[0], gatePoints[1]);
    if (!validation.valid) {
      showValidationWarning(
        'فاصله موانع کافی نیست',
        validation.message,
        null,
        () => {
          // Go back to calibrate2 so user can fix
          runEnterCalibrate2(false);
        }
      );
      return;
    }
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
  const val = distInput.value;
  
  // Validate distance
  const validation = validateDistance(val);
  if (!validation.valid) {
    showValidationWarning(
      'فاصله نامعتبر',
      validation.message,
      null,
      null
    );
    return;
  }
  
  distanceMeters = validation.value;
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
  const heightCm = heightMeters * 100;
  
  // Validate air time
  const airTimeValidation = validateJumpAirTime(airTimeSec);
  if (!airTimeValidation.valid) {
    setStatus('⚠️ زمان غیرمنطقی!');
    showValidationWarning(
      'زمان پرواز غیرمنطقی',
      airTimeValidation.message,
      null,
      () => {
        // Retry
        jumpEnterReady();
      }
    );
    return;
  }
  
  // Validate jump height
  const heightValidation = validateJumpHeight(heightCm, airTimeSec);
  
  airTimeResultEl.textContent = airTimeSec.toFixed(2);
  jumpHeightResultEl.textContent = heightCm.toFixed(1);
  jumpResultPanel.classList.add('visible');
  
  if (!heightValidation.valid && heightValidation.warnings.length > 0) {
    // Show warning but allow continuing
    setStatus('⚠️ نتیجه نامعقول!');
    showValidationWarning(
      'ارتفاع غیرمنطقی',
      heightValidation.warnings.join('\n\n'),
      () => {
        // User confirmed - save anyway
        setStatus('تمام شد!');
        saveToHistory('jump', {
          airTime: airTimeSec.toFixed(2),
          height: heightCm.toFixed(1)
        });
      },
      () => {
        // User wants to retry
        jumpResultPanel.classList.remove('visible');
        jumpEnterReady();
      }
    );
  } else {
    setStatus('تمام شد!');
    // Save to history
    saveToHistory('jump', {
      airTime: airTimeSec.toFixed(2),
      height: heightCm.toFixed(1)
    });
  }
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
/**
 * Get list of available video devices
 */
async function getAvailableCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    logError('getAvailableCameras', error);
    return [];
  }
}

/**
 * Find the best wide-angle camera
 * Prefers back camera with ultra-wide or wide-angle
 */
async function selectBestCamera() {
  const cameras = await getAvailableCameras();
  
  if (cameras.length === 0) {
    return null;
  }

  console.log(`📷 Found ${cameras.length} camera(s):`, cameras.map(c => ({
    id: c.deviceId,
    label: c.label || 'Unknown'
  })));

  // Try to find back camera with wide-angle indicators in label
  const wideAngleKeywords = ['wide', 'ultra', '0.5', '0.6', '0.7', 'back'];
  const backCameras = cameras.filter(camera => {
    const label = (camera.label || '').toLowerCase();
    return label.includes('back') || label.includes('rear') || label.includes('environment');
  });

  // Among back cameras, prefer ones with wide-angle keywords
  const wideBackCamera = backCameras.find(camera => {
    const label = (camera.label || '').toLowerCase();
    return wideAngleKeywords.some(keyword => label.includes(keyword));
  });

  if (wideBackCamera) {
    console.log('✅ Selected wide-angle back camera:', wideBackCamera.label || wideBackCamera.deviceId);
    return wideBackCamera.deviceId;
  }

  // Fall back to any back camera
  if (backCameras.length > 0) {
    console.log('✅ Selected back camera:', backCameras[0].label || backCameras[0].deviceId);
    return backCameras[0].deviceId;
  }

  // Fall back to first available camera
  console.log('⚠️ Using first available camera:', cameras[0].label || cameras[0].deviceId);
  return cameras[0].deviceId;
}

/**
 * Setup camera with comprehensive error handling, wide-angle selection, and optimal resolution
 */
async function setupCamera(forceReconfigure = false) {
  try {
    const orientation = getCurrentOrientation();
    console.log(`🔄 setupCamera called: ${orientation}, force: ${forceReconfigure}`);

    // If already running with same orientation and not forced, skip
    if (!forceReconfigure && currentOrientation === orientation && currentCameraStream) {
      console.log('✅ Camera already configured for this orientation');
      return;
    }

    // Try to select the best camera (wide-angle if available)
    let selectedCameraId = null;
    try {
      selectedCameraId = await selectBestCamera();
    } catch (error) {
      console.warn('Could not enumerate cameras, using default:', error);
    }

    // Calculate optimal resolution for this orientation
    const optimalRes = calculateOptimalResolution(orientation);

    // Build constraints with preference for wide-angle and optimal resolution
    const constraints = {
      video: {
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height },
        facingMode: { ideal: 'environment' },
        // Prefer deviceId if we found a specific camera
        ...(selectedCameraId && { deviceId: { exact: selectedCameraId } })
      },
      audio: false,
    };

    console.log('📷 Requesting camera with constraints:', constraints);

    let stream;
    let attemptCount = 0;
    const maxAttempts = 3;

    // Try multiple strategies to get the best camera
    while (!stream && attemptCount < maxAttempts) {
      attemptCount++;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log(`✅ Camera acquired on attempt ${attemptCount}`);
        break;
      } catch (error) {
        console.warn(`Attempt ${attemptCount} failed:`, error.message);

        // If exact deviceId failed, try without it
        if (attemptCount === 1 && selectedCameraId) {
          delete constraints.video.deviceId;
          console.log('Retrying without exact deviceId...');
          continue;
        }

        // If that failed, try with relaxed resolution
        if (attemptCount === 2) {
          constraints.video = {
            width: { min: 640, ideal: optimalRes.width },
            height: { min: 480, ideal: optimalRes.height },
            facingMode: { ideal: 'environment' }
          };
          console.log('Retrying with relaxed constraints...');
          continue;
        }

        // Last attempt failed
        const errorType = classifyCameraError(error);
        logError('setupCamera - getUserMedia', error, { 
          constraints,
          attemptCount,
          selectedCameraId,
          orientation
        });
        throw { type: errorType, original: error };
      }
    }

    if (!stream) {
      throw { 
        type: 'CAMERA_UNKNOWN', 
        original: new Error('Failed to acquire camera after multiple attempts') 
      };
    }

    // Stop previous stream if exists
    if (currentCameraStream) {
      console.log('🛑 Stopping previous camera stream');
      currentCameraStream.getTracks().forEach(track => track.stop());
    }

    currentCameraStream = stream;
    currentOrientation = orientation;
    video.srcObject = stream;
    const track = stream.getVideoTracks()[0];

    // Check supported resolutions
    const supportedRes = await getSupportedResolutions(track);
    if (supportedRes) {
      console.log('📊 Supported resolutions:', supportedRes);
    }

    // Log camera capabilities
    if (track && track.getCapabilities) {
      try {
        const caps = track.getCapabilities();
        console.log('📊 Camera capabilities:', {
          zoom: caps.zoom ? `${caps.zoom.min} - ${caps.zoom.max}` : 'N/A',
          focusMode: caps.focusMode || 'N/A',
          width: caps.width ? `${caps.width.min} - ${caps.width.max}` : 'N/A',
          height: caps.height ? `${caps.height.min} - ${caps.height.max}` : 'N/A'
        });

        // Apply optimal settings for wide-angle view
        const constraintsToApply = {};
        
        // Reset zoom to minimum (widest view)
        if (caps.zoom) {
          constraintsToApply.zoom = caps.zoom.min;
          console.log(`🔍 Setting zoom to minimum: ${caps.zoom.min}`);
        }

        // Set focus mode to continuous if available
        if (caps.focusMode && caps.focusMode.includes('continuous')) {
          constraintsToApply.focusMode = 'continuous';
        }

        // Apply constraints if we have any
        if (Object.keys(constraintsToApply).length > 0) {
          await track.applyConstraints({ advanced: [constraintsToApply] });
          console.log('✅ Applied camera optimizations:', constraintsToApply);
        }

      } catch (e) {
        // Non-critical - some browsers don't support all capabilities
        console.warn('⚠️ Could not apply camera optimizations:', e.message);
      }
    }

    // Log final track settings
    const settings = track.getSettings();
    const actualAspectRatio = (settings.width / settings.height).toFixed(2);
    const requestedAspectRatio = (optimalRes.width / optimalRes.height).toFixed(2);
    
    console.log('📷 Final camera settings:', {
      deviceId: settings.deviceId,
      width: settings.width,
      height: settings.height,
      facingMode: settings.facingMode,
      aspectRatio: actualAspectRatio,
      requestedAspectRatio: requestedAspectRatio,
      match: actualAspectRatio === requestedAspectRatio ? '✅' : '⚠️'
    });

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        console.log(`🎥 Video loaded: ${video.videoWidth}x${video.videoHeight}`);
        video.play()
          .then(() => {
            console.log('▶️ Video playing');
            resolve();
          })
          .catch((err) => {
            logError('setupCamera - video.play', err);
            reject({ type: 'CAMERA_UNKNOWN', original: err });
          });
      };
      
      // Timeout after 10 seconds
      setTimeout(() => {
        reject({ 
          type: 'CAMERA_UNKNOWN', 
          original: new Error('Camera setup timeout after 10 seconds') 
        });
      }, 10000);
    });

  } catch (error) {
    throw error;
  }
}

function resizeCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
}

// ---- Detect real orientation/frame-size changes and handle smooth reconfiguration ----
/**
 * Refresh canvas and reconfigure camera on orientation change
 */
async function refreshCanvasForOrientation() {
  if (isReconfiguring) {
    console.log('⏳ Already reconfiguring, skipping...');
    return;
  }

  const prevW = canvas.width;
  const prevH = canvas.height;
  const newOrientation = getCurrentOrientation();

  resizeCanvas();
  const changed = canvas.width !== prevW || canvas.height !== prevH;

  console.log(`🔄 Orientation check: ${currentOrientation} → ${newOrientation}, Canvas: ${prevW}x${prevH} → ${canvas.width}x${canvas.height}, Changed: ${changed}`);

  // If orientation actually changed (not just a small resize)
  if (newOrientation !== currentOrientation && running) {
    isReconfiguring = true;
    
    console.log(`🔄 Orientation changed: ${currentOrientation} → ${newOrientation}`);
    setStatus(`در حال تنظیم برای ${newOrientation === 'portrait' ? 'حالت عمودی' : 'حالت افقی'}...`);

    try {
      // Reconfigure camera for new orientation
      await setupCamera(true);
      resizeCanvas();

      // Reset calibration since pixel coordinates changed
      if (mode === 'run' && runPhase !== 'calibrate1') {
        console.log('🔄 Resetting run calibration due to orientation change');
        runEnterCalibrate1();
      } else if (mode === 'jump' && jumpPhase !== 'calibrating') {
        console.log('🔄 Resetting jump calibration due to orientation change');
        jumpEnterCalibrating();
      }

      console.log('✅ Orientation reconfiguration complete');
      
    } catch (error) {
      console.error('❌ Failed to reconfigure camera:', error);
      logError('refreshCanvasForOrientation', error);
      
      // Show error but don't crash
      setStatus('خطا در تنظیم دوربین. لطفاً دوباره شروع کنید.');
    } finally {
      isReconfiguring = false;
    }
  } else if (changed && running) {
    // Canvas size changed but orientation didn't (minor resize)
    // Just reset calibration if we're mid-process
    if (mode === 'run' && runPhase !== 'calibrate1' && runPhase !== 'ready' && runPhase !== 'timing') {
      console.log('⚠️ Canvas resized, resetting calibration');
      runEnterCalibrate1();
    } else if (mode === 'jump' && jumpPhase !== 'calibrating' && jumpPhase !== 'ready') {
      console.log('⚠️ Canvas resized, resetting calibration');
      jumpEnterCalibrating();
    }
  }
}

/**
 * Load AI model with comprehensive error handling and retry logic
 */
async function loadModel() {
  const maxRetries = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Loading model (attempt ${attempt}/${maxRetries})...`);
      
      // Check if TensorFlow.js is loaded
      if (typeof poseDetection === 'undefined') {
        throw new Error('TensorFlow.js libraries not loaded. Check your internet connection.');
      }

      detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        {
          runtime: 'mediapipe',
          modelType: 'lite',
          solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
        }
      );

      console.log('✅ Model loaded successfully');
      return; // Success!

    } catch (error) {
      lastError = error;
      logError(`loadModel - attempt ${attempt}`, error, {
        attempt,
        maxRetries,
        tfLoaded: typeof tf !== 'undefined',
        poseDetectionLoaded: typeof poseDetection !== 'undefined'
      });

      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  throw { type: 'MODEL_LOAD_FAILED', original: lastError };
}

// ================== Drawing / main loop ==================
/**
 * Draw pose with error handling
 */
function drawPose(poses) {
  try {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mode === 'run') runDrawGates();
    if (mode === 'jump') jumpDrawOverlay();

    if (!poses.length) return;
    const kp = {};
    for (const point of poses[0].keypoints) kp[point.name] = point;

    // Essential keypoints for performance mode
    const essentialKeypoints = [
      'left_hip', 'right_hip',
      'left_knee', 'right_knee',
      'left_ankle', 'right_ankle'
    ];
    
    // Essential connections for performance mode
    const essentialConnections = [
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    // Choose connections based on performance mode
    const connectionsToRender = performanceMode === 'low-power' 
      ? essentialConnections 
      : CONNECTIONS;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = performanceMode === 'low-power' ? 2 : 3;
    
    for (const [a, b] of connectionsToRender) {
      const pa = kp[a], pb = kp[b];
      if (pa && pb && pa.score > 0.3 && pb.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }
    
    ctx.fillStyle = '#4ade80';
    
    // Draw only essential keypoints in low-power mode
    if (performanceMode === 'low-power') {
      for (const keypointName of essentialKeypoints) {
        const point = kp[keypointName];
        if (point && point.score > 0.3) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else {
      // Draw all keypoints in normal mode
      for (const point of poses[0].keypoints) {
        if (point.score > 0.3) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    if (mode === 'run') runUpdateGateCrossing(getAnkleX(kp));
    if (mode === 'jump') jumpProcessFrame(kp);

  } catch (error) {
    logError('drawPose', error, { posesLength: poses?.length });
    // Don't throw - let the loop continue
  }
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

/**
 * Main detection loop with error handling
 */
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 10;

async function detectLoop() {
  if (!running) return;
  
  try {
    if (video.readyState >= 2 && detector) {
      // Calculate FPS
      calculateFPS();
      
      // Skip frames in low-power mode (process every other frame)
      if (performanceMode === 'low-power' && frameCount % 2 === 1) {
        requestAnimationFrame(detectLoop);
        return;
      }
      
      const poses = await detector.estimatePoses(video, { flipHorizontal: false });
      drawPose(poses);
      consecutiveErrors = 0; // Reset on success
    }
  } catch (error) {
    consecutiveErrors++;
    logError('detectLoop', error, { consecutiveErrors });
    
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      running = false;
      showErrorModal('DETECTION_FAILED', `${error.message}\n\nConsecutive errors: ${consecutiveErrors}`);
      return;
    }
  }
  
  requestAnimationFrame(detectLoop);
}

/**
 * Start application with comprehensive error handling
 */
async function start() {
  try {
    // Check browser compatibility first
    if (!checkBrowserCompatibility()) {
      return;
    }

    startOverlay.style.display = 'none';
    setStatus('در حال فعال‌سازی دوربین...');

    // Setup camera
    try {
      await setupCamera();
    } catch (error) {
      const errorType = error.type || 'CAMERA_UNKNOWN';
      showErrorModal(errorType, error.original?.message || 'Unknown camera error');
      return;
    }

    resizeCanvas();

    // Enhanced orientation change listeners
    let orientationChangeTimer = null;

    window.addEventListener('resize', () => {
      // Debounce resize events to avoid multiple rapid calls
      clearTimeout(orientationChangeTimer);
      orientationChangeTimer = setTimeout(() => {
        refreshCanvasForOrientation();
      }, 300);
    });

    window.addEventListener('orientationchange', () => {
      // Handle orientation change with delays for camera stabilization
      console.log('🔄 orientationchange event fired');
      clearTimeout(orientationChangeTimer);
      orientationChangeTimer = setTimeout(() => {
        refreshCanvasForOrientation();
      }, 500);
    });

    // Modern orientation API (if available)
    if (screen.orientation && screen.orientation.addEventListener) {
      screen.orientation.addEventListener('change', () => {
        console.log('🔄 screen.orientation.change event fired');
        clearTimeout(orientationChangeTimer);
        orientationChangeTimer = setTimeout(() => {
          refreshCanvasForOrientation();
        }, 500);
      });
    }

    setStatus('در حال بارگذاری مدل تشخیص بدن...');

    // Load model
    try {
      await loadModel();
    } catch (error) {
      const errorType = error.type || 'MODEL_LOAD_FAILED';
      showErrorModal(errorType, error.original?.message || 'Model loading failed');
      
      // Clean up camera stream
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      return;
    }

    running = true;
    consecutiveErrors = 0;
    modeBar.style.display = 'flex';
    topActions.style.display = 'flex';
    applySettings();
    runEnterCalibrate1();
    detectLoop();

    console.log('✅ Application started successfully');

  } catch (error) {
    logError('start', error);
    showErrorModal('UNKNOWN_ERROR', error.message || 'Unknown error during startup');
  }
}

startBtn.addEventListener('click', () => {
  start();
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => console.log('✅ Service Worker registered'))
    .catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error);
      // Non-critical, don't show error modal
    });
}

// ================== GLOBAL ERROR HANDLERS ==================
// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logError('Unhandled Promise Rejection', event.reason);
  console.warn('Unhandled rejection prevented from crashing app');
  event.preventDefault(); // Prevent default browser behavior
});

// Catch global errors
window.addEventListener('error', (event) => {
  logError('Global Error', event.error, {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Log initial load
console.log('✅ Motion Tracker loaded successfully');
console.log('Browser:', navigator.userAgent);
console.log('Screen:', window.innerWidth + 'x' + window.innerHeight);
