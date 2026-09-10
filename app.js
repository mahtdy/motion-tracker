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

// ================== OUT-OF-FRAME TRACKING SYSTEM ==================
/**
 * Out-of-frame detection settings
 */
const FRAME_TRACKING_SETTINGS = {
  minKeypointsVisible: 3, // حداقل 3 keypoint باید visible باشه
  minConfidence: 0.3, // حداقل confidence score
  outOfFrameTimeout: 2000, // 2 ثانیه (ms) قبل از pause کردن timing
  warningCooldown: 3000, // 3 ثانیه فاصله بین warning ها
  edgeMargin: 0.05 // 5% margin از لبه‌های صفحه
};

/**
 * Frame tracking state
 */
let isInFrame = true;
let lastInFrameTime = performance.now();
let outOfFrameStartTime = null;
let timingPaused = false;
let pausedElapsedTime = 0;
let lastWarningTime = 0;
let frameIndicatorElement = null;

/**
 * Check if pose is in frame
 */
function isPoseInFrame(keypoints) {
  if (!keypoints || keypoints.length === 0) {
    return false;
  }
  
  // Count visible keypoints
  let visibleCount = 0;
  let totalX = 0;
  let totalY = 0;
  
  const margin = {
    left: canvas.width * FRAME_TRACKING_SETTINGS.edgeMargin,
    right: canvas.width * (1 - FRAME_TRACKING_SETTINGS.edgeMargin),
    top: canvas.height * FRAME_TRACKING_SETTINGS.edgeMargin,
    bottom: canvas.height * (1 - FRAME_TRACKING_SETTINGS.edgeMargin)
  };
  
  for (const kp of keypoints) {
    if (kp.score > currentConfidenceThreshold) {
      // Check if keypoint is within frame with margin
      if (kp.x >= margin.left && kp.x <= margin.right &&
          kp.y >= margin.top && kp.y <= margin.bottom) {
        visibleCount++;
        totalX += kp.x;
        totalY += kp.y;
      }
    }
  }
  
  return visibleCount >= FRAME_TRACKING_SETTINGS.minKeypointsVisible;
}

/**
 * Handle out-of-frame detection
 */
function handleFrameTracking(poses) {
  const now = performance.now();
  const wasInFrame = isInFrame;
  
  // Check current frame status
  if (poses && poses.length > 0) {
    isInFrame = isPoseInFrame(poses[0].keypoints);
  } else {
    isInFrame = false;
  }
  
  // Update indicators
  updateFrameIndicator(isInFrame);
  
  // Handle state changes
  if (isInFrame && !wasInFrame) {
    // Just came back into frame
    lastInFrameTime = now;
    outOfFrameStartTime = null;
    
    // Resume timing if it was paused
    if (timingPaused) {
      resumeTiming();
    }
  } else if (!isInFrame && wasInFrame) {
    // Just went out of frame
    outOfFrameStartTime = now;
    
    // Show warning (with cooldown)
    if (now - lastWarningTime > FRAME_TRACKING_SETTINGS.warningCooldown) {
      showFrameWarning();
      lastWarningTime = now;
    }
  } else if (!isInFrame && outOfFrameStartTime) {
    // Still out of frame - check timeout
    const outOfFrameDuration = now - outOfFrameStartTime;
    
    if (outOfFrameDuration > FRAME_TRACKING_SETTINGS.outOfFrameTimeout) {
      // Been out too long - pause timing if active
      if ((mode === 'run' && runPhase === 'timing') || 
          (mode === 'jump' && jumpPhase === 'measuring')) {
        if (!timingPaused) {
          pauseTiming();
        }
      }
    }
  }
}

/**
 * Show frame warning
 */
function showFrameWarning() {
  // Don't show during calibration or results
  if (mode === 'run') {
    if (runPhase === 'calibrate1' || runPhase === 'calibrate2' || 
        runPhase === 'enterDistance' || runPhase === 'done') {
      return;
    }
  } else if (mode === 'jump') {
    if (jumpPhase === 'calibrating' || jumpPhase === 'done') {
      return;
    }
  }
  
  setStatus('⚠️ در کادر دوربین بمون!');
  
  // Reset status after 2 seconds
  setTimeout(() => {
    if (isInFrame) {
      if (mode === 'run' && runPhase === 'ready') {
        setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
      } else if (mode === 'run' && runPhase === 'timing') {
        setStatus('در حال دویدن... ⏱');
      } else if (mode === 'jump' && jumpPhase === 'ready') {
        setStatus('آماده! بپر 🤸');
      } else if (mode === 'jump' && jumpPhase === 'measuring') {
        setStatus('در حال اندازه‌گیری... 📊');
      }
    }
  }, 2000);
}

/**
 * Pause timing
 */
function pauseTiming() {
  timingPaused = true;
  
  if (mode === 'run' && runPhase === 'timing' && runStartTime) {
    // Save elapsed time before pause
    pausedElapsedTime = performance.now() - runStartTime;
    setStatus('⏸ متوقف شد - در کادر برگرد!');
  } else if (mode === 'jump' && jumpPhase === 'measuring') {
    setStatus('⏸ متوقف شد - در کادر برگرد!');
  }
  
  console.warn('⏸ Timing paused - pose out of frame for too long');
}

/**
 * Resume timing
 */
function resumeTiming() {
  timingPaused = false;
  
  if (mode === 'run' && runPhase === 'timing') {
    // Adjust start time to account for paused duration
    runStartTime = performance.now() - pausedElapsedTime;
    pausedElapsedTime = 0;
    setStatus('▶️ ادامه... در حال دویدن ⏱');
    
    // Reset status after 1 second
    setTimeout(() => {
      if (runPhase === 'timing') {
        setStatus('در حال دویدن... ⏱');
      }
    }, 1000);
  } else if (mode === 'jump' && jumpPhase === 'measuring') {
    setStatus('▶️ ادامه... در حال اندازه‌گیری 📊');
    
    setTimeout(() => {
      if (jumpPhase === 'measuring') {
        setStatus('در حال اندازه‌گیری... 📊');
      }
    }, 1000);
  }
  
  console.log('▶️ Timing resumed - pose back in frame');
}

/**
 * Create/update frame indicator
 */
function updateFrameIndicator(inFrame) {
  if (!frameIndicatorElement) {
    frameIndicatorElement = document.createElement('div');
    frameIndicatorElement.id = 'frameIndicator';
    frameIndicatorElement.style.cssText = `
      position: absolute;
      top: calc(env(safe-area-inset-top, 16px) + 8px);
      left: calc(100% - 120px);
      z-index: 4;
      background: rgba(15, 23, 42, 0.75);
      color: #4ade80;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    document.getElementById('stage').appendChild(frameIndicatorElement);
  }
  
  if (inFrame) {
    frameIndicatorElement.style.color = '#4ade80';
    frameIndicatorElement.style.borderLeft = '3px solid #4ade80';
    frameIndicatorElement.innerHTML = '✓ در کادر';
  } else {
    frameIndicatorElement.style.color = '#ef4444';
    frameIndicatorElement.style.borderLeft = '3px solid #ef4444';
    frameIndicatorElement.innerHTML = '✗ خارج از کادر';
  }
}

/**
 * Reset frame tracking state
 */
function resetFrameTracking() {
  isInFrame = true;
  lastInFrameTime = performance.now();
  outOfFrameStartTime = null;
  timingPaused = false;
  pausedElapsedTime = 0;
  lastWarningTime = 0;
}

// ================== LOW LIGHT DETECTION & QUALITY SYSTEM ==================
/**
 * Low light detection settings
 */
const LIGHT_DETECTION_SETTINGS = {
  checkInterval: 3000, // بررسی هر 3 ثانیه
  lowLightThreshold: 0.35, // اگر میانگین confidence زیر 35% بود
  normalConfidenceThreshold: 0.3,
  lowLightConfidenceThreshold: 0.2, // در نور کم relaxed می‌شه
  warningCooldown: 10000, // 10 ثانیه بین هشدارها
  qualityGood: 0.5, // بالای 50% = خوب
  qualityMedium: 0.35, // 35-50% = متوسط
  // زیر 35% = ضعیف
};

/**
 * Light detection state
 */
let isLowLight = false;
let lastLightCheckTime = 0;
let lastLightWarningTime = 0;
let confidenceHistory = [];
let currentConfidenceThreshold = LIGHT_DETECTION_SETTINGS.normalConfidenceThreshold;
let detectionQuality = 'good'; // 'good' | 'medium' | 'poor'
let qualityIndicatorElement = null;

/**
 * Detect ambient light level based on pose confidence
 */
function detectLightLevel(poses) {
  const now = performance.now();
  
  // بررسی هر 3 ثانیه
  if (now - lastLightCheckTime < LIGHT_DETECTION_SETTINGS.checkInterval) {
    return;
  }
  
  lastLightCheckTime = now;
  
  if (!poses || poses.length === 0) {
    return;
  }
  
  // محاسبه میانگین confidence
  const keypoints = poses[0].keypoints;
  const validKeypoints = keypoints.filter(kp => kp.score > 0.1);
  
  if (validKeypoints.length === 0) {
    return;
  }
  
  const avgConfidence = validKeypoints.reduce((sum, kp) => sum + kp.score, 0) / validKeypoints.length;
  
  // ذخیره در history (آخرین 10 بررسی)
  confidenceHistory.push(avgConfidence);
  if (confidenceHistory.length > 10) {
    confidenceHistory.shift();
  }
  
  // محاسبه میانگین کلی
  const overallAvg = confidenceHistory.reduce((a, b) => a + b) / confidenceHistory.length;
  
  // تعیین quality
  if (overallAvg >= LIGHT_DETECTION_SETTINGS.qualityGood) {
    detectionQuality = 'good';
  } else if (overallAvg >= LIGHT_DETECTION_SETTINGS.qualityMedium) {
    detectionQuality = 'medium';
  } else {
    detectionQuality = 'poor';
  }
  
  // تشخیص نور کم
  const wasLowLight = isLowLight;
  isLowLight = overallAvg < LIGHT_DETECTION_SETTINGS.lowLightThreshold;
  
  // آپدیت threshold
  if (isLowLight) {
    currentConfidenceThreshold = LIGHT_DETECTION_SETTINGS.lowLightConfidenceThreshold;
  } else {
    currentConfidenceThreshold = LIGHT_DETECTION_SETTINGS.normalConfidenceThreshold;
  }
  
  // نمایش هشدار اگر تازه وارد نور کم شدیم
  if (isLowLight && !wasLowLight) {
    if (now - lastLightWarningTime > LIGHT_DETECTION_SETTINGS.warningCooldown) {
      showLowLightWarning(overallAvg);
      lastLightWarningTime = now;
    }
  }
  
  // آپدیت quality indicator
  updateQualityIndicator();
  
  console.log(`💡 Light check: avg=${(overallAvg * 100).toFixed(0)}%, lowLight=${isLowLight}, quality=${detectionQuality}, threshold=${currentConfidenceThreshold}`);
}

/**
 * Show low light warning
 */
function showLowLightWarning(avgConfidence) {
  // Don't show during calibration or results
  if (mode === 'run') {
    if (runPhase === 'calibrate1' || runPhase === 'calibrate2' || 
        runPhase === 'enterDistance' || runPhase === 'done') {
      return;
    }
  } else if (mode === 'jump') {
    if (jumpPhase === 'calibrating' || jumpPhase === 'done') {
      return;
    }
  }
  
  const modal = document.createElement('div');
  modal.id = 'lowLightModal';
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
      <div style="font-size: 48px; margin-bottom: 16px;">💡</div>
      <h3 style="color: #f59e0b; margin-bottom: 12px; font-size: 18px;">نور محیط کمه!</h3>
      <p style="color: #94a3b8; margin-bottom: 16px; line-height: 1.6; font-size: 14px;">
        کیفیت تشخیص: ${(avgConfidence * 100).toFixed(0)}%<br><br>
        برای دقت بهتر:
      </p>
      <ul style="color: #cbd5e1; text-align: right; margin: 0 0 20px 0; padding: 0 20px; line-height: 1.8; font-size: 13px;">
        <li>چراغ اتاق رو روشن کن</li>
        <li>به محیط روشن‌تری برو</li>
        <li>از نور طبیعی استفاده کن</li>
        <li>مطمئن شو نور از پشت سر میاد</li>
      </ul>
      <button id="lowLightOkBtn" style="
        background: #22c55e;
        color: #052e16;
        border: none;
        padding: 14px 24px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 999px;
        cursor: pointer;
        width: 100%;
        min-height: 44px;
      ">متوجه شدم</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('lowLightOkBtn').onclick = () => {
    modal.remove();
  };
  
  // Auto-close after 8 seconds
  setTimeout(() => {
    if (document.body.contains(modal)) {
      modal.remove();
    }
  }, 8000);
}

/**
 * Create/update quality indicator
 */
function updateQualityIndicator() {
  if (!qualityIndicatorElement) {
    qualityIndicatorElement = document.createElement('div');
    qualityIndicatorElement.id = 'qualityIndicator';
    qualityIndicatorElement.style.cssText = `
      position: absolute;
      top: calc(env(safe-area-inset-top, 16px) + 32px);
      left: calc(100% - 140px);
      z-index: 4;
      background: rgba(15, 23, 42, 0.75);
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: bold;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    document.getElementById('stage').appendChild(qualityIndicatorElement);
  }
  
  let icon, text, color, borderColor;
  
  if (detectionQuality === 'good') {
    icon = '●●●';
    text = 'کیفیت عالی';
    color = '#4ade80';
    borderColor = '#4ade80';
  } else if (detectionQuality === 'medium') {
    icon = '●●○';
    text = 'کیفیت متوسط';
    color = '#facc15';
    borderColor = '#facc15';
  } else {
    icon = '●○○';
    text = 'کیفیت ضعیف';
    color = '#ef4444';
    borderColor = '#ef4444';
  }
  
  qualityIndicatorElement.style.color = color;
  qualityIndicatorElement.style.borderLeft = `3px solid ${borderColor}`;
  qualityIndicatorElement.innerHTML = `${icon} ${text}`;
}

/**
 * Reset light detection state
 */
function resetLightDetection() {
  isLowLight = false;
  confidenceHistory = [];
  currentConfidenceThreshold = LIGHT_DETECTION_SETTINGS.normalConfidenceThreshold;
  detectionQuality = 'good';
  lastLightCheckTime = 0;
  lastLightWarningTime = 0;
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
const headerContainer = document.getElementById('headerContainer');
const actionBar = document.getElementById('actionBar');

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

// New Modes Buttons
const modeBoscoBtn = document.getElementById('modeBoscoBtn');
const modeWingspanBtn = document.getElementById('modeWingspanBtn');
const modeDistanceBtn = document.getElementById('modeDistanceBtn');

// Bosco 30-sec Test Elements
const boscoHud = document.getElementById('boscoHud');
const boscoTimerVal = document.getElementById('boscoTimerVal');
const boscoJumpCountVal = document.getElementById('boscoJumpCountVal');
const boscoGroundTouchVal = document.getElementById('boscoGroundTouchVal');
const boscoLastAirVal = document.getElementById('boscoLastAirVal');
const boscoLastContactVal = document.getElementById('boscoLastContactVal');
const boscoLastHeightVal = document.getElementById('boscoLastHeightVal');
const boscoStartPanel = document.getElementById('boscoStartPanel');
const boscoStartBtn = document.getElementById('boscoStartBtn');
const boscoCancelBtn = document.getElementById('boscoCancelBtn');
const boscoResultPanel = document.getElementById('boscoResultPanel');
const boscoTotalJumps = document.getElementById('boscoTotalJumps');
const boscoTotalTouches = document.getElementById('boscoTotalTouches');
const boscoTotalAirTime = document.getElementById('boscoTotalAirTime');
const boscoAvgAirTime = document.getElementById('boscoAvgAirTime');
const boscoAvgContactTime = document.getElementById('boscoAvgContactTime');
const boscoMaxHeight = document.getElementById('boscoMaxHeight');
const boscoTableBody = document.getElementById('boscoTableBody');
const boscoAgainBtn = document.getElementById('boscoAgainBtn');
const boscoSaveBtn = document.getElementById('boscoSaveBtn');

// Wingspan (طول دست‌ها) Elements
const wingspanHud = document.getElementById('wingspanHud');
const wingspanCurrentVal = document.getElementById('wingspanCurrentVal');
const wingspanMaxVal = document.getElementById('wingspanMaxVal');
const wingspanPanel = document.getElementById('wingspanPanel');
const wingspanPanelCur = document.getElementById('wingspanPanelCur');
const wingspanPanelMax = document.getElementById('wingspanPanelMax');
const wingspanRecordBtn = document.getElementById('wingspanRecordBtn');
const wingspanResetBtn = document.getElementById('wingspanResetBtn');
const wingspanSaveBtn = document.getElementById('wingspanSaveBtn');

// Distance Between Objects Elements
const distanceHud = document.getElementById('distanceHud');
const distObjectsVal = document.getElementById('distObjectsVal');
const distScaleVal = document.getElementById('distScaleVal');
const distanceMeasurePanel = document.getElementById('distanceMeasurePanel');
const distanceMeasureResult = document.getElementById('distanceMeasureResult');
const distancePixelInfo = document.getElementById('distancePixelInfo');
const refDistanceInput = document.getElementById('refDistanceInput');
const applyCalibScaleBtn = document.getElementById('applyCalibScaleBtn');
const distanceResetBtn = document.getElementById('distanceResetBtn');
const distanceSaveBtn = document.getElementById('distanceSaveBtn');

// Settings Elements
const athleteHeightSetting = document.getElementById('athleteHeightSetting');

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
  // Update new FPS display in action bar
  const fpsDisplay = document.getElementById('fpsDisplay');
  
  if (fpsDisplay) {
    // Update color based on FPS
    let color = '#4ade80'; // Green
    let bgColor = 'rgba(74, 222, 128, 0.1)';
    let borderColor = 'rgba(74, 222, 128, 0.3)';
    
    if (currentFPS < 15) {
      color = '#ef4444'; // Red
      bgColor = 'rgba(239, 68, 68, 0.1)';
      borderColor = 'rgba(239, 68, 68, 0.3)';
    } else if (currentFPS < 25) {
      color = '#f59e0b'; // Orange
      bgColor = 'rgba(245, 158, 11, 0.1)';
      borderColor = 'rgba(245, 158, 11, 0.3)';
    } else if (currentFPS < 40) {
      color = '#facc15'; // Yellow
      bgColor = 'rgba(250, 204, 21, 0.1)';
      borderColor = 'rgba(250, 204, 21, 0.3)';
    }
    
    fpsDisplay.style.color = color;
    fpsDisplay.style.background = bgColor;
    fpsDisplay.style.borderColor = borderColor;
    fpsDisplay.textContent = `FPS ${currentFPS.toFixed(0)}`;
    
    // Add performance mode indicator
    if (performanceMode === 'low-power') {
      fpsDisplay.textContent += ' ⚡';
    }
  }
}

// ================== CAMERA SWITCHER SYSTEM ==================
/**
 * Camera switcher state
 */
let availableCameras = [];
let currentCameraId = null;
let currentCameraInfo = null;
let cameraSwitcherBtn = null;

/**
 * Initialize camera switcher
 */
async function initCameraSwitcher() {
  try {
    console.log('[Camera Switcher] Initializing...');
    
    // Get list of cameras
    availableCameras = await enumerateDevices();
    
    console.log(`📷 Found ${availableCameras.length} camera(s)`);
    
    // Enable/disable camera switcher button
    if (cameraSwitcherBtn) {
      if (availableCameras.length > 1) {
        cameraSwitcherBtn.disabled = false;
        cameraSwitcherBtn.style.opacity = '1';
        console.log('[Camera Switcher] Button enabled');
      } else {
        cameraSwitcherBtn.disabled = true;
        cameraSwitcherBtn.style.opacity = '0.5';
        console.log('[Camera Switcher] Button disabled (only 1 camera)');
      }
    } else {
      console.warn('[Camera Switcher] Button not found');
    }
    
    // Update camera info display
    updateCameraInfoDisplay();
    
    console.log('[Camera Switcher] Initialization complete');
    
  } catch (error) {
    console.error('[Camera Switcher] Initialization failed:', error);
  }
}

/**
 * Enumerate all video input devices
 */
async function enumerateDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // Get detailed info for each camera
    const camerasWithInfo = [];
    
    for (const device of videoDevices) {
      const info = await getCameraInfo(device);
      camerasWithInfo.push(info);
    }
    
    // Sort: back cameras first, then by zoom (wide > normal > tele)
    camerasWithInfo.sort((a, b) => {
      // Back cameras before front
      if (a.position !== b.position) {
        return a.position === 'back' ? -1 : 1;
      }
      // Wide angle first (lower zoom = wider)
      return (a.zoomRatio || 1) - (b.zoomRatio || 1);
    });
    
    return camerasWithInfo;
  } catch (error) {
    console.error('Failed to enumerate devices:', error);
    return [];
  }
}

/**
 * Get camera information
 */
async function getCameraInfo(device) {
  const info = {
    deviceId: device.deviceId,
    label: device.label || 'دوربین ناشناس',
    originalLabel: device.label,
    groupId: device.groupId
  };
  
  // Detect camera type from label
  const type = detectCameraType(device.label);
  info.type = type.type;
  info.position = type.position;
  info.zoomRatio = type.zoomRatio;
  info.icon = type.icon;
  
  // Format label in Persian
  info.persianLabel = formatCameraLabel(info);
  
  // Try to get capabilities (may require permission)
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: device.deviceId } }
    });
    
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    
    info.capabilities = {
      width: capabilities.width || {},
      height: capabilities.height || {},
      zoom: capabilities.zoom || {},
      focusMode: capabilities.focusMode || []
    };
    
    // Get current settings
    const settings = track.getSettings();
    info.resolution = `${settings.width || '?'}x${settings.height || '?'}`;
    
    // Stop the test stream
    track.stop();
    stream.getTracks().forEach(t => t.stop());
    
  } catch (error) {
    console.warn('Could not get camera capabilities:', error);
    info.capabilities = {};
    info.resolution = 'نامشخص';
  }
  
  return info;
}

/**
 * Detect camera type from label
 */
function detectCameraType(label) {
  const lower = label.toLowerCase();
  
  let type = 'normal';
  let position = 'back';
  let zoomRatio = 1;
  let icon = '📸';
  
  // Detect position
  if (lower.includes('front') || lower.includes('face') || lower.includes('user')) {
    position = 'front';
    icon = '📷';
  }
  
  // Detect zoom/type
  if (lower.includes('wide') || lower.includes('ultra') || lower.includes('0.5')) {
    type = 'wide';
    zoomRatio = 0.5;
    icon = position === 'front' ? '📷' : '🌐';
  } else if (lower.includes('tele') || lower.includes('zoom') || lower.includes('2x') || lower.includes('3x')) {
    type = 'telephoto';
    zoomRatio = lower.includes('3x') ? 3 : 2;
    icon = '🔭';
  }
  
  return { type, position, zoomRatio, icon };
}

/**
 * Format camera label in Persian
 */
function formatCameraLabel(info) {
  const parts = [];
  
  // Position
  if (info.position === 'front') {
    parts.push('دوربین جلو');
  } else {
    parts.push('دوربین عقب');
  }
  
  // Type
  if (info.type === 'wide') {
    parts.push('واید');
    if (info.zoomRatio) {
      parts.push(`${info.zoomRatio}x`);
    }
  } else if (info.type === 'telephoto') {
    parts.push('تله‌فوتو');
    if (info.zoomRatio) {
      parts.push(`${info.zoomRatio}x`);
    }
  } else if (info.zoomRatio && info.zoomRatio !== 1) {
    parts.push(`${info.zoomRatio}x`);
  }
  
  return parts.join(' ');
}

/**
 * Show camera switcher modal
 */
function showCameraSwitcherModal() {
  // Don't allow switching during timing
  if ((mode === 'run' && runPhase === 'timing') || 
      (mode === 'jump' && jumpPhase === 'measuring')) {
    setStatus('⚠️ در حین اندازه‌گیری نمی‌تونی دوربین رو عوض کنی');
    setTimeout(() => {
      if (mode === 'run' && runPhase === 'timing') {
        setStatus('در حال دویدن... ⏱');
      } else if (mode === 'jump' && jumpPhase === 'measuring') {
        setStatus('در حال اندازه‌گیری... 📊');
      }
    }, 2000);
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'cameraSwitcherModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    overflow-y: auto;
  `;
  
  const cameraCards = availableCameras.map((camera, index) => {
    const isActive = camera.deviceId === currentCameraId;
    const borderColor = isActive ? '#22c55e' : '#475569';
    const bgColor = isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(30, 41, 59, 0.6)';
    
    return `
      <div class="camera-card" data-device-id="${camera.deviceId}" style="
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 32px;">${camera.icon}</div>
          <div style="flex: 1;">
            <div style="color: #e2e8f0; font-weight: bold; font-size: 15px; margin-bottom: 4px;">
              ${camera.persianLabel}
              ${isActive ? '<span style="color: #22c55e;">✓</span>' : ''}
            </div>
            <div style="color: #94a3b8; font-size: 12px;">
              ${camera.position === 'front' ? 'جلو' : 'عقب'} • 
              ${camera.resolution}
              ${camera.zoomRatio ? ` • ${camera.zoomRatio}x` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  modal.innerHTML = `
    <div style="
      background: #1e293b;
      border: 2px solid #334155;
      border-radius: 20px;
      padding: 20px;
      max-width: 400px;
      width: 100%;
      max-height: 80vh;
      overflow-y: auto;
    ">
      <h3 style="color: #4ade80; margin-bottom: 16px; font-size: 18px; text-align: center;">
        📷 انتخاب دوربین
      </h3>
      <div id="cameraList">
        ${cameraCards}
      </div>
      <button id="closeCameraSwitcher" style="
        background: transparent;
        color: #94a3b8;
        border: 2px solid #475569;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: bold;
        border-radius: 999px;
        cursor: pointer;
        width: 100%;
        min-height: 44px;
        margin-top: 12px;
      ">بستن</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add click handlers for camera cards
  document.querySelectorAll('.camera-card').forEach(card => {
    card.addEventListener('click', () => {
      const deviceId = card.getAttribute('data-device-id');
      switchCamera(deviceId);
      modal.remove();
    });
    
    // Hover effect
    card.addEventListener('mouseenter', () => {
      if (card.getAttribute('data-device-id') !== currentCameraId) {
        card.style.background = 'rgba(51, 65, 85, 0.6)';
      }
    });
    card.addEventListener('mouseleave', () => {
      if (card.getAttribute('data-device-id') !== currentCameraId) {
        card.style.background = 'rgba(30, 41, 59, 0.6)';
      }
    });
  });
  
  document.getElementById('closeCameraSwitcher').onclick = () => {
    modal.remove();
  };
}

/**
 * Switch to a different camera
 */
async function switchCamera(deviceId) {
  const camera = availableCameras.find(c => c.deviceId === deviceId);
  
  if (!camera) {
    console.error('Camera not found:', deviceId);
    return;
  }
  
  console.log(`📷 Switching to camera: ${camera.persianLabel}`);
  setStatus('🔄 در حال تعویض دوربین...');
  
  try {
    // Save calibration if exists
    if ((mode === 'run' && gatePoints[0] && gatePoints[1]) || 
        (mode === 'jump' && legLengthPx !== null)) {
      saveCalibrationAsRatio();
    }
    
    // Stop current stream
    if (video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    
    // Save selected camera
    currentCameraId = deviceId;
    currentCameraInfo = camera;
    localStorage.setItem('selectedCameraId', deviceId);
    
    // Setup camera with new deviceId
    await setupCamera(false, deviceId);
    
    // Try to restore calibration
    if (calibrationData) {
      const restored = restoreCalibrationFromRatio();
      if (restored) {
        setStatus(`✅ دوربین عوض شد - کالیبراسیون حفظ شد`);
      } else {
        setStatus(`✅ دوربین عوض شد`);
        
        // Reset calibration
        if (mode === 'run' && runPhase !== 'calibrate1') {
          setTimeout(() => {
            showValidationWarning(
              'کالیبراسیون از دست رفت',
              'با تعویض دوربین، کالیبراسیون قبلی از دست رفت.\n\nلطفاً دوباره کالیبراسیون کن.',
              () => {
                if (mode === 'run') runEnterCalibrate1();
              },
              null
            );
          }, 1000);
        } else if (mode === 'jump' && jumpPhase !== 'calibrating') {
          setTimeout(() => {
            showValidationWarning(
              'کالیبراسیون از دست رفت',
              'با تعویض دوربین، کالیبراسیون قبلی از دست رفت.\n\nلطفاً دوباره کالیبراسیون کن.',
              () => {
                if (mode === 'jump') jumpEnterCalibrating();
              },
              null
            );
          }, 1000);
        }
      }
    } else {
      setStatus(`✅ دوربین عوض شد: ${camera.persianLabel}`);
    }
    
    // Update camera info display
    updateCameraInfoDisplay();
    
    setTimeout(() => {
      if (mode === 'run' && runPhase === 'ready') {
        setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
      } else if (mode === 'jump' && jumpPhase === 'ready') {
        setStatus('آماده! بپر 🤸');
      }
    }, 3000);
    
  } catch (error) {
    console.error('Failed to switch camera:', error);
    logError('switchCamera', error, { deviceId, camera });
    
    showErrorModal('CAMERA_UNKNOWN', `Failed to switch to camera: ${camera.persianLabel}\n\n${error.message}`);
    
    // Try to restore previous camera
    if (currentCameraId && currentCameraId !== deviceId) {
      console.log('Attempting to restore previous camera');
      try {
        await setupCamera(false, currentCameraId);
      } catch (restoreError) {
        console.error('Failed to restore previous camera:', restoreError);
      }
    }
  }
}

/**
 * Update camera info display
 */
function updateCameraInfoDisplay() {
  let displayElement = document.getElementById('cameraInfoDisplay');
  
  if (!displayElement) {
    displayElement = document.createElement('div');
    displayElement.id = 'cameraInfoDisplay';
    displayElement.style.cssText = `
      position: absolute;
      bottom: calc(env(safe-area-inset-bottom, 16px) + 16px);
      left: 16px;
      z-index: 4;
      background: rgba(15, 23, 42, 0.75);
      color: #94a3b8;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      border-left: 3px solid #3b82f6;
    `;
    document.getElementById('stage').appendChild(displayElement);
  }
  
  if (currentCameraInfo) {
    displayElement.textContent = `${currentCameraInfo.icon} ${currentCameraInfo.persianLabel}`;
  } else {
    displayElement.textContent = '📷 دوربین پیش‌فرض';
  }
}

/**
 * Load saved camera preference
 */
function loadSavedCamera() {
  try {
    const savedId = localStorage.getItem('selectedCameraId');
    if (savedId) {
      console.log('📷 Found saved camera ID:', savedId);
      return savedId;
    }
  } catch (error) {
    console.warn('Failed to load saved camera:', error);
  }
  return null;
}

// ================== ORIENTATION & CALIBRATION MANAGEMENT ==================
let currentOrientation = null; // 'portrait' | 'landscape'
let currentCameraStream = null;
let isReconfiguring = false;
let orientationLocked = false; // برای lock کردن orientation
let lastOrientationAngle = window.orientation || 0;
let calibrationData = null; // ذخیره calibration به صورت ratio

/**
 * Save calibration data as ratios (relative to canvas size)
 */
function saveCalibrationAsRatio() {
  if (mode === 'run') {
    if (gatePoints[0] && gatePoints[1]) {
      calibrationData = {
        type: 'run',
        gate1: {
          x: gatePoints[0].x / canvas.width,
          y: gatePoints[0].y / canvas.height
        },
        gate2: {
          x: gatePoints[1].x / canvas.width,
          y: gatePoints[1].y / canvas.height
        },
        distance: distanceMeters
      };
      console.log('💾 Saved run calibration as ratio:', calibrationData);
    }
  } else if (mode === 'jump') {
    if (legLengthPx !== null) {
      calibrationData = {
        type: 'jump',
        legLengthRatio: legLengthPx / canvas.height,
        airThresholdRatio: airThresholdPx / canvas.height,
        landThresholdRatio: landThresholdPx / canvas.height
      };
      console.log('💾 Saved jump calibration as ratio:', calibrationData);
    }
  }
}

/**
 * Restore calibration data from ratios
 */
function restoreCalibrationFromRatio() {
  if (!calibrationData) return false;
  
  if (calibrationData.type === 'run' && mode === 'run') {
    gatePoints[0] = {
      x: calibrationData.gate1.x * canvas.width,
      y: calibrationData.gate1.y * canvas.height
    };
    gatePoints[1] = {
      x: calibrationData.gate2.x * canvas.width,
      y: calibrationData.gate2.y * canvas.height
    };
    distanceMeters = calibrationData.distance;
    console.log('✅ Restored run calibration from ratio');
    return true;
  } else if (calibrationData.type === 'jump' && mode === 'jump') {
    legLengthPx = calibrationData.legLengthRatio * canvas.height;
    airThresholdPx = calibrationData.airThresholdRatio * canvas.height;
    landThresholdPx = calibrationData.landThresholdRatio * canvas.height;
    console.log('✅ Restored jump calibration from ratio');
    return true;
  }
  
  return false;
}

/**
 * Check if orientation change is minor (less than threshold)
 */
function isMinorOrientationChange() {
  const currentAngle = window.orientation || 0;
  const angleDiff = Math.abs(currentAngle - lastOrientationAngle);
  
  // Consider changes less than 10 degrees as minor
  const isMinor = angleDiff < 10 && angleDiff > 0;
  
  console.log(`📐 Orientation angle: ${lastOrientationAngle}° → ${currentAngle}° (diff: ${angleDiff}°, minor: ${isMinor})`);
  
  lastOrientationAngle = currentAngle;
  return isMinor;
}

/**
 * Show orientation change confirmation modal
 */
function showOrientationChangeConfirmation(onConfirm, onCancel) {
  const modal = document.createElement('div');
  modal.id = 'orientationModal';
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
      border: 2px solid #3b82f6;
      border-radius: 20px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      color: #e2e8f0;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">🔄</div>
      <h3 style="color: #3b82f6; margin-bottom: 12px; font-size: 18px;">تغییر جهت صفحه</h3>
      <p style="color: #94a3b8; margin-bottom: 20px; line-height: 1.6; font-size: 14px;">
        جهت صفحه تغییر کرد. کالیبراسیون فعلی پاک می‌شه.<br><br>
        می‌خوای ادامه بدی؟
      </p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="orientationConfirmBtn" style="
          background: #22c55e;
          color: #052e16;
          border: none;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-height: 44px;
        ">✓ تایید و ادامه</button>
        <button id="orientationCancelBtn" style="
          background: transparent;
          color: #94a3b8;
          border: 2px solid #475569;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-height: 44px;
        ">✗ انصراف (حفظ کالیبراسیون)</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('orientationConfirmBtn').onclick = () => {
    modal.remove();
    onConfirm();
  };
  
  document.getElementById('orientationCancelBtn').onclick = () => {
    modal.remove();
    if (onCancel) onCancel();
  };
}

/**
 * Toggle orientation lock
 */
function toggleOrientationLock() {
  orientationLocked = !orientationLocked;
  
  const lockBtn = document.getElementById('orientationLockBtn');
  if (lockBtn) {
    if (orientationLocked) {
      lockBtn.textContent = '🔒';
      lockBtn.style.background = '#22c55e';
      lockBtn.style.color = '#052e16';
      setStatus('🔒 جهت صفحه قفل شد');
    } else {
      lockBtn.textContent = '🔓';
      lockBtn.style.background = 'rgba(30, 41, 59, 0.9)';
      lockBtn.style.color = '#94a3b8';
      setStatus('🔓 جهت صفحه آزاد شد');
    }
    
    setTimeout(() => {
      if (mode === 'run' && runPhase === 'ready') {
        setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
      } else if (mode === 'run' && runPhase === 'timing') {
        setStatus('در حال دویدن... ⏱');
      } else if (mode === 'jump' && jumpPhase === 'ready') {
        setStatus('آماده! بپر 🤸');
      }
    }, 2000);
  }
  
  console.log(`🔒 Orientation lock: ${orientationLocked ? 'ENABLED' : 'DISABLED'}`);
}

// ================== ORIENTATION & RESOLUTION MANAGEMENT ==================

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
    } else if (entry.type === 'jump') {
      return `
        <div class="historyItem">
          <div class="date">⤴️ پرش تک • ${entry.date}</div>
          <div class="data">
            زمان پرواز: <span>${entry.data.airTime}s</span> •
            ارتفاع: <span>${entry.data.height} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'bosco') {
      return `
        <div class="historyItem">
          <div class="date">⏱️ آزمون ۳۰ث پرش • ${entry.date}</div>
          <div class="data">
            پرش‌ها: <span>${entry.data.totalJumps}</span> •
            لمس زمین: <span>${entry.data.totalTouches}</span> •
            زمان هوا: <span>${entry.data.totalAirTime}s</span> •
            میانگین پرواز: <span>${entry.data.avgAirTime}s</span> •
            بالاترین: <span>${entry.data.maxHeight} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'wingspan') {
      return `
        <div class="historyItem">
          <div class="date">📏 طول دو دست • ${entry.date}</div>
          <div class="data">
            گستره دست‌ها: <span>${entry.data.wingspan} cm</span> •
            قد ورزشکار: <span>${entry.data.athleteHeight || 175} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'distance') {
      return `
        <div class="historyItem">
          <div class="date">📐 فاصله دو جسم • ${entry.date}</div>
          <div class="data">
            فاصله: <span>${entry.data.distanceM >= 1 ? entry.data.distanceM + ' متر' : entry.data.distanceCm + ' سانتی‌متر'}</span> (${entry.data.distanceCm} cm)
          </div>
        </div>
      `;
    }
    return '';
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
    return data ? Object.assign({
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175
    }, JSON.parse(data)) : {
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175
    };
  } catch (e) {
    return { 
      jumpThresholdRatio: 0.12, 
      landThresholdRatio: 0.06, 
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175
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
  if (athleteHeightSetting) {
    athleteHeightSetting.value = settings.athleteHeight || 175;
  }
  
  // Update performance mode
  if (settings.lowPowerMode) {
    performanceMode = 'low-power';
  }
}

settingsBtn.addEventListener('click', () => {
  loadSettingsUI();
  settingsPanel.classList.add('visible');
});

// Orientation lock button
const orientationLockBtn = document.getElementById('orientationLockBtn');
if (orientationLockBtn) {
  orientationLockBtn.addEventListener('click', toggleOrientationLock);
}

// Camera switcher button
cameraSwitcherBtn = document.getElementById('cameraSwitcherBtn');
if (cameraSwitcherBtn) {
  cameraSwitcherBtn.addEventListener('click', showCameraSwitcherModal);
}

closeSettingsBtn.addEventListener('click', () => {
  const lowPowerChecked = document.getElementById('lowPowerMode').checked;
  const athleteHeightVal = athleteHeightSetting ? (parseInt(athleteHeightSetting.value) || 175) : 175;
  const settings = {
    jumpThresholdRatio: parseFloat(document.getElementById('jumpSensitivity').value),
    landThresholdRatio: parseFloat(document.getElementById('landSensitivity').value),
    calibFrames: parseInt(document.getElementById('calibFrames').value),
    lowPowerMode: lowPowerChecked,
    athleteHeight: athleteHeightVal
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
  if (boscoStartPanel) boscoStartPanel.classList.remove('visible');
  if (boscoResultPanel) boscoResultPanel.classList.remove('visible');
  if (wingspanPanel) wingspanPanel.classList.remove('visible');
  if (distanceMeasurePanel) distanceMeasurePanel.classList.remove('visible');
  if (boscoHud) boscoHud.style.display = 'none';
  if (wingspanHud) wingspanHud.style.display = 'none';
  if (distanceHud) distanceHud.style.display = 'none';
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
  resetFrameTracking(); // Reset frame tracking
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

let jumpCandidateTakeoff = null;
let jumpCandidateLand = null;
let minHipYDuringJump = Infinity;
let baselineHipY = null;

function jumpEnterCalibrating() {
  jumpPhase = 'calibrating';
  calibSamples = [];
  baselineY = null;
  baselineHipY = null;
  legLengthPx = null;
  aboveCount = 0;
  belowCount = 0;
  jumpCandidateTakeoff = null;
  jumpCandidateLand = null;
  minHipYDuringJump = Infinity;
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
  jumpCandidateTakeoff = null;
  jumpCandidateLand = null;
  minHipYDuringJump = Infinity;
  hideAllPanels();
  resetFrameTracking(); // Reset frame tracking
  setStatus('آماده! بپر 🤸');
}

function jumpFinish() {
  jumpPhase = 'done';
  const airTimeSec = Math.max(0.05, (jumpLandTime - jumpTakeoffTime) / 1000);
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
  
  airTimeResultEl.textContent = airTimeSec.toFixed(3);
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
          airTime: airTimeSec.toFixed(3),
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
    setStatus('تمام شد! 🎯');
    // Save to history
    saveToHistory('jump', {
      airTime: airTimeSec.toFixed(3),
      height: heightCm.toFixed(1)
    });
  }
}

function getHipAnkleY(kp) {
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const hips = [lh, rh].filter(p => p && p.score > currentConfidenceThreshold);
  const ankles = [la, ra].filter(p => p && p.score > currentConfidenceThreshold);
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
        baselineHipY = avgHipY;
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
      if (aboveCount === 0) {
        jumpCandidateTakeoff = performance.now();
      }
      aboveCount++;
      if (aboveCount >= DEBOUNCE_FRAMES) {
        jumpTakeoffTime = jumpCandidateTakeoff || performance.now();
        jumpPhase = 'airborne';
        minHipYDuringJump = hipY != null ? hipY : Infinity;
        setStatus('در هوا... ⤴️');
      }
    } else {
      aboveCount = 0;
      jumpCandidateTakeoff = null;
    }
  } else if (jumpPhase === 'airborne') {
    if (hipY != null && hipY < minHipYDuringJump) {
      minHipYDuringJump = hipY;
    }
    if (risePx < landThresholdPx) {
      if (belowCount === 0) {
        jumpCandidateLand = performance.now();
      }
      belowCount++;
      if (belowCount >= DEBOUNCE_FRAMES) {
        jumpLandTime = jumpCandidateLand || performance.now();
        jumpFinish();
      }
    } else {
      belowCount = 0;
      jumpCandidateLand = null;
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

// ================== BOSCO 30-SECOND CONTINUOUS JUMP TEST ==================
let boscoPhase = 'intro'; // 'intro' | 'countdown' | 'running' | 'finished'
let boscoJumps = [];
let boscoJumpState = 'ground'; // 'ground' | 'airborne'
let boscoTakeoffTime = null;
let boscoLandTime = null;
let boscoLastLandTime = null;
let boscoStartTime = null;
let boscoTimerInterval = null;
let boscoAboveCount = 0;
let boscoBelowCount = 0;
let boscoCandidateTakeoff = null;
let boscoCandidateLand = null;
let boscoGroundTouches = 0;
let boscoTotalAirTimeSec = 0;
let boscoBaselineY = null;
let boscoLegLengthPx = null;
let boscoAirThresh = null;
let boscoLandThresh = null;

function boscoEnterIntro() {
  boscoPhase = 'intro';
  boscoJumps = [];
  boscoGroundTouches = 0;
  boscoTotalAirTimeSec = 0;
  boscoLastLandTime = null;
  if (boscoTimerInterval) clearInterval(boscoTimerInterval);
  hideAllPanels();
  if (boscoHud) boscoHud.style.display = 'none';
  if (boscoStartPanel) boscoStartPanel.classList.add('visible');
  setStatus('آزمون ۳۰ ثانیه پرش: دکمه شروع را بزنید');
}

function boscoStartCountdown() {
  boscoPhase = 'countdown';
  hideAllPanels();
  let count = 3;
  setStatus(`آماده... ${count} ⏳`);
  const cdInterval = setInterval(() => {
    count--;
    if (count > 0) {
      setStatus(`آماده... ${count} ⏳`);
    } else {
      clearInterval(cdInterval);
      boscoStartRunning();
    }
  }, 1000);
}

function boscoStartRunning() {
  boscoPhase = 'running';
  boscoJumps = [];
  boscoJumpState = 'ground';
  boscoGroundTouches = 0;
  boscoTotalAirTimeSec = 0;
  boscoLastLandTime = null;
  boscoTakeoffTime = null;
  boscoAboveCount = 0;
  boscoBelowCount = 0;
  boscoStartTime = performance.now();
  hideAllPanels();
  if (boscoHud) boscoHud.style.display = 'block';
  updateBoscoHud(30, 0, 0, null, null, null);
  setStatus('پرش‌های متوالی را با تمام توان شروع کن! 🦘');

  if (boscoTimerInterval) clearInterval(boscoTimerInterval);
  boscoTimerInterval = setInterval(() => {
    if (boscoPhase !== 'running') {
      clearInterval(boscoTimerInterval);
      return;
    }
    const elapsedSec = (performance.now() - boscoStartTime) / 1000;
    const remainingSec = Math.max(0, 30.0 - elapsedSec);
    if (boscoTimerVal) boscoTimerVal.textContent = remainingSec.toFixed(1) + 's';
    if (remainingSec <= 0) {
      clearInterval(boscoTimerInterval);
      boscoFinish();
    }
  }, 100);
}

function updateBoscoHud(remTime, jumpsCount, touchesCount, lastAir, lastContact, lastHeight) {
  if (boscoTimerVal && remTime != null) boscoTimerVal.textContent = typeof remTime === 'number' ? remTime.toFixed(1) + 's' : remTime;
  if (boscoJumpCountVal) boscoJumpCountVal.textContent = `${jumpsCount} / 30`;
  if (boscoGroundTouchVal) boscoGroundTouchVal.textContent = touchesCount;
  if (boscoLastAirVal && lastAir != null) boscoLastAirVal.textContent = `${lastAir}s`;
  if (boscoLastContactVal && lastContact != null) boscoLastContactVal.textContent = `${lastContact}s`;
  if (boscoLastHeightVal && lastHeight != null) boscoLastHeightVal.textContent = `${lastHeight} cm`;
}

function boscoProcessFrame(kp) {
  if (boscoPhase !== 'running') return;
  const data = getHipAnkleY(kp);
  if (!data) return;
  const { ankleY } = data;

  // Dynamically calibrate or maintain baseline
  if (baselineY != null) {
    boscoBaselineY = baselineY;
    boscoLegLengthPx = legLengthPx;
    boscoAirThresh = airThresholdPx;
    boscoLandThresh = landThresholdPx;
  } else {
    if (boscoBaselineY == null) {
      boscoBaselineY = ankleY;
      boscoLegLengthPx = canvas.height * 0.25;
      const settings = getSettings();
      boscoAirThresh = boscoLegLengthPx * settings.jumpThresholdRatio;
      boscoLandThresh = boscoLegLengthPx * settings.landThresholdRatio;
    }
  }

  const risePx = boscoBaselineY - ankleY;

  if (boscoJumpState === 'ground') {
    if (risePx > boscoAirThresh) {
      if (boscoAboveCount === 0) {
        boscoCandidateTakeoff = performance.now();
      }
      boscoAboveCount++;
      if (boscoAboveCount >= 2) {
        boscoTakeoffTime = boscoCandidateTakeoff || performance.now();
        boscoJumpState = 'airborne';
        boscoAboveCount = 0;
        let contactTimeSec = 0;
        if (boscoLastLandTime) {
          contactTimeSec = Math.max(0.01, (boscoTakeoffTime - boscoLastLandTime) / 1000);
        }
        setStatus(`در هوا... (پرش ${boscoJumps.length + 1}) ⤴️`);
      }
    } else {
      boscoAboveCount = 0;
      // Gently drift baseline with ground contact
      if (risePx > -20 && risePx < 10) {
        boscoBaselineY = boscoBaselineY * 0.95 + ankleY * 0.05;
      }
    }
  } else if (boscoJumpState === 'airborne') {
    if (risePx < boscoLandThresh) {
      if (boscoBelowCount === 0) {
        boscoCandidateLand = performance.now();
      }
      boscoBelowCount++;
      if (boscoBelowCount >= 2) {
        boscoLandTime = boscoCandidateLand || performance.now();
        boscoJumpState = 'ground';
        boscoBelowCount = 0;

        const airTimeSec = Math.max(0.05, (boscoLandTime - boscoTakeoffTime) / 1000);
        const heightCm = ((9.81 * airTimeSec * airTimeSec) / 8) * 100;
        let contactTimeSec = 0;
        if (boscoLastLandTime) {
          contactTimeSec = Math.max(0.02, (boscoTakeoffTime - boscoLastLandTime) / 1000);
        }
        boscoLastLandTime = boscoLandTime;
        boscoGroundTouches++;
        boscoTotalAirTimeSec += airTimeSec;

        const rsi = contactTimeSec > 0 ? (airTimeSec / contactTimeSec).toFixed(2) : '-';
        const jumpNum = boscoJumps.length + 1;

        boscoJumps.push({
          jumpNum,
          airTime: airTimeSec.toFixed(3),
          contactTime: contactTimeSec ? contactTimeSec.toFixed(3) : '-',
          height: heightCm.toFixed(1),
          rsi
        });

        updateBoscoHud(
          null,
          boscoJumps.length,
          boscoGroundTouches,
          airTimeSec.toFixed(2),
          contactTimeSec ? contactTimeSec.toFixed(2) : '--',
          heightCm.toFixed(1)
        );

        setStatus(`پرش ${jumpNum} ثبت شد (${heightCm.toFixed(1)} cm)`);

        if (boscoJumps.length >= 30) {
          boscoFinish();
        }
      }
    } else {
      boscoBelowCount = 0;
    }
  }
}

function boscoDrawOverlay() {
  if (boscoPhase === 'running' && boscoBaselineY != null) {
    ctx.strokeStyle = boscoJumpState === 'airborne' ? '#facc15' : '#22c55e';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, boscoBaselineY);
    ctx.lineTo(canvas.width, boscoBaselineY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function boscoFinish() {
  if (boscoTimerInterval) clearInterval(boscoTimerInterval);
  boscoPhase = 'finished';
  setStatus('آزمون پایان یافت! 🏁');

  if (boscoHud) boscoHud.style.display = 'none';

  const totalJ = boscoJumps.length;
  const totalTouches = boscoGroundTouches;
  const totalAir = boscoTotalAirTimeSec;
  const avgAir = totalJ > 0 ? (totalAir / totalJ) : 0;

  const validContacts = boscoJumps.map(j => parseFloat(j.contactTime)).filter(v => !isNaN(v) && v > 0);
  const avgContact = validContacts.length > 0 ? (validContacts.reduce((a, b) => a + b, 0) / validContacts.length) : 0;

  const heights = boscoJumps.map(j => parseFloat(j.height)).filter(v => !isNaN(v));
  const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;
  const avgHeight = heights.length > 0 ? (heights.reduce((a, b) => a + b, 0) / heights.length) : 0;

  if (boscoTotalJumps) boscoTotalJumps.textContent = totalJ;
  if (boscoTotalTouches) boscoTotalTouches.textContent = totalTouches;
  if (boscoTotalAirTime) boscoTotalAirTime.textContent = totalAir.toFixed(2) + 's';
  if (boscoAvgAirTime) boscoAvgAirTime.textContent = avgAir.toFixed(2) + 's';
  if (boscoAvgContactTime) boscoAvgContactTime.textContent = avgContact > 0 ? avgContact.toFixed(2) + 's' : '--';
  if (boscoMaxHeight) boscoMaxHeight.textContent = maxHeight.toFixed(1) + ' cm';

  if (boscoTableBody) {
    if (boscoJumps.length === 0) {
      boscoTableBody.innerHTML = '<tr><td colspan="5" style="padding: 10px; color: #94a3b8;">هیچ پرشی ثبت نشد</td></tr>';
    } else {
      boscoTableBody.innerHTML = boscoJumps.map(j => `
        <tr>
          <td>${j.jumpNum}</td>
          <td style="color: #38bdf8;">${j.airTime}</td>
          <td style="color: #cbd5e1;">${j.contactTime}</td>
          <td style="color: #4ade80; font-weight: bold;">${j.height}</td>
          <td style="color: #facc15;">${j.rsi}</td>
        </tr>
      `).join('');
    }
  }

  if (boscoResultPanel) boscoResultPanel.classList.add('visible');

  // Auto save to history
  if (totalJ > 0) {
    saveToHistory('bosco', {
      totalJumps: totalJ,
      totalTouches,
      totalAirTime: totalAir.toFixed(2),
      avgAirTime: avgAir.toFixed(2),
      avgContactTime: avgContact.toFixed(2),
      maxHeight: maxHeight.toFixed(1),
      avgHeight: avgHeight.toFixed(1)
    });
  }
}

if (boscoStartBtn) boscoStartBtn.addEventListener('click', boscoStartCountdown);
if (boscoCancelBtn) boscoCancelBtn.addEventListener('click', () => switchMode('jump'));
if (boscoAgainBtn) boscoAgainBtn.addEventListener('click', boscoEnterIntro);
if (boscoSaveBtn) {
  boscoSaveBtn.addEventListener('click', () => {
    setStatus('نتایج آزمون پرش ذخیره شد ✅');
    boscoSaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { boscoSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
  });
}

// ================== WINGSPAN (طول دو دست) ==================
let currentWingspanCm = 0;
let maxWingspanCm = 0;
let wingspanPoints = null;

function wingspanEnterMode() {
  hideAllPanels();
  currentWingspanCm = 0;
  wingspanPoints = null;
  if (wingspanHud) wingspanHud.style.display = 'block';
  if (wingspanPanel) wingspanPanel.classList.add('visible');
  setStatus('روبروی دوربین با دست‌های کاملاً باز بایستید 📏');
  updateWingspanUI();
}

function updateWingspanUI() {
  const curStr = currentWingspanCm > 0 ? `${currentWingspanCm.toFixed(0)} cm (${(currentWingspanCm/100).toFixed(2)} m)` : '--';
  const maxStr = maxWingspanCm > 0 ? `${maxWingspanCm.toFixed(0)} cm (${(maxWingspanCm/100).toFixed(2)} m)` : '--';
  if (wingspanCurrentVal) wingspanCurrentVal.textContent = curStr;
  if (wingspanMaxVal) wingspanMaxVal.textContent = maxStr;
  if (wingspanPanelCur) wingspanPanelCur.textContent = curStr;
  if (wingspanPanelMax) wingspanPanelMax.textContent = maxStr;
}

function wingspanProcessFrame(kp) {
  if (mode !== 'wingspan') return;
  const lw = kp['left_wrist'], rw = kp['right_wrist'];
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const nose = kp['nose'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];

  if (!lw || !rw || lw.score < 0.25 || rw.score < 0.25) {
    wingspanPoints = null;
    return;
  }

  wingspanPoints = { lw, rw, ls, rs };

  const wristDistPx = Math.hypot(rw.x - lw.x, rw.y - lw.y);

  // Height-based scale calibration
  const athleteHeight = getSettings().athleteHeight || 175;
  let cmPerPx = 0.25; // default fallback

  if (nose && (la || ra)) {
    const ankleY = (la && la.score > 0.25 && ra && ra.score > 0.25) ? (la.y + ra.y) / 2 : (la ? la.y : ra.y);
    const bodyHeightPx = ankleY - nose.y;
    if (bodyHeightPx > 60) {
      cmPerPx = athleteHeight / (bodyHeightPx * 1.08);
    }
  } else if (ls && rs && ls.score > 0.3 && rs.score > 0.3) {
    const shoulderPx = Math.hypot(rs.x - ls.x, rs.y - ls.y);
    if (shoulderPx > 20) {
      const shoulderCm = athleteHeight * 0.23;
      cmPerPx = shoulderCm / shoulderPx;
    }
  }

  // Wingspan from fingertip to fingertip is approx wrist distance * 1.15
  const rawSpan = wristDistPx * cmPerPx * 1.15;
  if (rawSpan > 40 && rawSpan < 260) {
    currentWingspanCm = currentWingspanCm === 0 ? rawSpan : (currentWingspanCm * 0.8 + rawSpan * 0.2);
    if (currentWingspanCm > maxWingspanCm) {
      maxWingspanCm = currentWingspanCm;
    }
    updateWingspanUI();
  }
}

function wingspanDrawOverlay() {
  if (mode !== 'wingspan' || !wingspanPoints) return;
  const { lw, rw } = wingspanPoints;

  // Draw glowing wingspan line
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lw.x, lw.y);
  ctx.lineTo(rw.x, rw.y);
  ctx.stroke();

  // Wrist circles
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(lw.x, lw.y, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rw.x, rw.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Measurement badge
  if (currentWingspanCm > 0) {
    const midX = (lw.x + rw.x) / 2;
    const midY = (lw.y + rw.y) / 2 - 25;
    const text = `طول دست‌ها: ${currentWingspanCm.toFixed(0)} cm (${(currentWingspanCm/100).toFixed(2)} m)`;
    ctx.font = 'bold 14px Tahoma, sans-serif';
    const tw = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(midX - tw / 2 - 8, midY - 14, tw + 16, 26);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(midX - tw / 2 - 8, midY - 14, tw + 16, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY);
  }
  ctx.restore();
}

if (wingspanRecordBtn) {
  wingspanRecordBtn.addEventListener('click', () => {
    if (currentWingspanCm > 0) {
      maxWingspanCm = Math.max(maxWingspanCm, currentWingspanCm);
      updateWingspanUI();
      setStatus(`رکورد طول دست‌ها ثبت شد: ${currentWingspanCm.toFixed(0)} cm`);
    }
  });
}

if (wingspanResetBtn) {
  wingspanResetBtn.addEventListener('click', () => {
    maxWingspanCm = 0;
    updateWingspanUI();
    setStatus('رکورد صفر شد');
  });
}

if (wingspanSaveBtn) {
  wingspanSaveBtn.addEventListener('click', () => {
    const val = maxWingspanCm > 0 ? maxWingspanCm : currentWingspanCm;
    if (val > 0) {
      saveToHistory('wingspan', {
        wingspan: val.toFixed(0),
        athleteHeight: getSettings().athleteHeight || 175
      });
      setStatus('طول دست‌ها در تاریخچه ذخیره شد ✅');
      wingspanSaveBtn.textContent = 'ذخیره شد ✓';
      setTimeout(() => { wingspanSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
    }
  });
}

// ================== DISTANCE BETWEEN TWO OBJECTS ==================
let distPointA = null;
let distPointB = null;
let draggingDistPoint = null; // 'A' | 'B' | null
let isDraggingDist = false;
let distCmPerPx = 0.25; // default calibrated scale
let distMeasuredCm = 0;
let distMeasuredM = 0;

function distanceEnterMode() {
  hideAllPanels();
  if (distanceHud) distanceHud.style.display = 'block';
  if (distanceMeasurePanel) distanceMeasurePanel.classList.add('visible');
  setStatus('روی دو نقطه یا دو جسم ضربه بزنید یا نشانگرهای A و B را بکشید 📐');
  
  // Initialize default points if not set
  if (!distPointA || !distPointB) {
    const w = canvas.width || 640;
    const h = canvas.height || 480;
    distPointA = { x: w * 0.3, y: h * 0.5 };
    distPointB = { x: w * 0.7, y: h * 0.5 };
  }
  updateDistanceCalculation();
}

function updateDistanceCalculation() {
  if (!distPointA || !distPointB) return;
  const pxDist = Math.hypot(distPointB.x - distPointA.x, distPointB.y - distPointA.y);
  distMeasuredCm = pxDist * distCmPerPx;
  distMeasuredM = distMeasuredCm / 100;

  const resStr = distMeasuredM >= 1
    ? `${distMeasuredM.toFixed(2)} متر (${distMeasuredCm.toFixed(0)} cm)`
    : `${distMeasuredCm.toFixed(1)} سانتی‌متر`;

  if (distanceMeasureResult) distanceMeasureResult.textContent = resStr;
  if (distObjectsVal) distObjectsVal.textContent = resStr;
  if (distancePixelInfo) {
    distancePixelInfo.textContent = `فاصله پیکسلی: ${pxDist.toFixed(0)} px • مقیاس: ${(1/distCmPerPx).toFixed(2)} px/cm`;
  }
}

function distanceDrawOverlay() {
  if (mode !== 'distance' || !distPointA || !distPointB) return;
  ctx.save();

  // Line between A and B
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(distPointA.x, distPointA.y);
  ctx.lineTo(distPointB.x, distPointB.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Point A (Blue circle)
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.arc(distPointA.x, distPointA.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', distPointA.x, distPointA.y);

  // Point B (Green circle)
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(distPointB.x, distPointB.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillText('B', distPointB.x, distPointB.y);

  // Midpoint distance badge
  const midX = (distPointA.x + distPointB.x) / 2;
  const midY = (distPointA.y + distPointB.y) / 2 - 20;
  const label = distMeasuredM >= 1
    ? `${distMeasuredM.toFixed(2)}m (${distMeasuredCm.toFixed(0)}cm)`
    : `${distMeasuredCm.toFixed(1)}cm`;

  ctx.font = 'bold 13px Tahoma, sans-serif';
  const textWidth = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(midX - textWidth / 2 - 8, midY - 12, textWidth + 16, 24);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(midX - textWidth / 2 - 8, midY - 12, textWidth + 16, 24);

  ctx.fillStyle = '#4ade80';
  ctx.fillText(label, midX, midY);

  ctx.restore();
}

// Distance touch / drag handling on canvas
document.getElementById('stage').addEventListener('pointerdown', (e) => {
  if (mode !== 'distance') return;
  if (e.target.closest && (e.target.closest('#distanceMeasurePanel') || e.target.closest('#headerContainer') || e.target.closest('#distanceHud'))) return;
  const pt = clientToCanvasCoords(e.clientX, e.clientY);
  if (!distPointA || !distPointB) return;
  const distToA = Math.hypot(pt.x - distPointA.x, pt.y - distPointA.y);
  const distToB = Math.hypot(pt.x - distPointB.x, pt.y - distPointB.y);
  if (distToA < 40) {
    draggingDistPoint = 'A';
    isDraggingDist = true;
  } else if (distToB < 40) {
    draggingDistPoint = 'B';
    isDraggingDist = true;
  } else {
    // Tap anywhere else to place closest or alternate
    if (distToA <= distToB) {
      distPointA = pt;
      draggingDistPoint = 'A';
    } else {
      distPointB = pt;
      draggingDistPoint = 'B';
    }
    isDraggingDist = true;
    updateDistanceCalculation();
  }
});

window.addEventListener('pointermove', (e) => {
  if (mode !== 'distance' || !isDraggingDist || !draggingDistPoint) return;
  const pt = clientToCanvasCoords(e.clientX, e.clientY);
  if (draggingDistPoint === 'A') {
    distPointA = pt;
  } else if (draggingDistPoint === 'B') {
    distPointB = pt;
  }
  updateDistanceCalculation();
});

window.addEventListener('pointerup', () => {
  isDraggingDist = false;
  draggingDistPoint = null;
});

if (applyCalibScaleBtn) {
  applyCalibScaleBtn.addEventListener('click', () => {
    const refCm = parseFloat(refDistanceInput.value) || 100;
    if (!distPointA || !distPointB) return;
    const pxDist = Math.hypot(distPointB.x - distPointA.x, distPointB.y - distPointA.y);
    if (pxDist > 10) {
      distCmPerPx = refCm / pxDist;
      updateDistanceCalculation();
      if (distScaleVal) distScaleVal.textContent = `کالیبره: ${refCm}cm = ${pxDist.toFixed(0)}px`;
      setStatus(`مقیاس کالیبره شد: هر پیکسل = ${distCmPerPx.toFixed(3)} cm ✅`);
    }
  });
}

if (distanceResetBtn) {
  distanceResetBtn.addEventListener('click', () => {
    const w = canvas.width || 640;
    const h = canvas.height || 480;
    distPointA = { x: w * 0.35, y: h * 0.5 };
    distPointB = { x: w * 0.65, y: h * 0.5 };
    updateDistanceCalculation();
    setStatus('نقاط A و B بازنشانی شدند');
  });
}

if (distanceSaveBtn) {
  distanceSaveBtn.addEventListener('click', () => {
    if (distMeasuredCm > 0) {
      saveToHistory('distance', {
        distanceCm: distMeasuredCm.toFixed(1),
        distanceM: distMeasuredM.toFixed(2)
      });
      setStatus('فاصله دو جسم در تاریخچه ذخیره شد ✅');
      distanceSaveBtn.textContent = 'ذخیره شد ✓';
      setTimeout(() => { distanceSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
    }
  });
}

// ================== MODE SWITCHING ==================
function switchMode(newMode) {
  mode = newMode;
  hideAllPanels();
  modeRunBtn.classList.toggle('active', mode === 'run');
  modeJumpBtn.classList.toggle('active', mode === 'jump');
  if (modeBoscoBtn) modeBoscoBtn.classList.toggle('active', mode === 'bosco');
  if (modeWingspanBtn) modeWingspanBtn.classList.toggle('active', mode === 'wingspan');
  if (modeDistanceBtn) modeDistanceBtn.classList.toggle('active', mode === 'distance');

  if (mode === 'run') {
    runEnterCalibrate1();
  } else if (mode === 'jump') {
    jumpEnterCalibrating();
  } else if (mode === 'bosco') {
    boscoEnterIntro();
  } else if (mode === 'wingspan') {
    wingspanEnterMode();
  } else if (mode === 'distance') {
    distanceEnterMode();
  }
}

modeRunBtn.addEventListener('click', () => switchMode('run'));
modeJumpBtn.addEventListener('click', () => switchMode('jump'));
if (modeBoscoBtn) modeBoscoBtn.addEventListener('click', () => switchMode('bosco'));
if (modeWingspanBtn) modeWingspanBtn.addEventListener('click', () => switchMode('wingspan'));
if (modeDistanceBtn) modeDistanceBtn.addEventListener('click', () => switchMode('distance'));

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
async function selectBestCamera(preferredDeviceId = null) {
  const cameras = await getAvailableCameras();
  
  if (cameras.length === 0) {
    return null;
  }

  console.log(`📷 Found ${cameras.length} camera(s):`, cameras.map(c => ({
    id: c.deviceId,
    label: c.label || 'Unknown'
  })));
  
  // If preferred device ID is provided, try to use it
  if (preferredDeviceId) {
    const preferred = cameras.find(c => c.deviceId === preferredDeviceId);
    if (preferred) {
      console.log('✅ Using preferred camera:', preferred.label || preferred.deviceId);
      currentCameraId = preferred.deviceId;
      return preferred.deviceId;
    } else {
      console.warn('⚠️ Preferred camera not found, falling back to auto-select');
    }
  }
  
  // Check for saved camera preference
  const savedId = loadSavedCamera();
  if (savedId) {
    const saved = cameras.find(c => c.deviceId === savedId);
    if (saved) {
      console.log('✅ Using saved camera:', saved.label || saved.deviceId);
      currentCameraId = saved.deviceId;
      return saved.deviceId;
    } else {
      console.warn('⚠️ Saved camera not found, falling back to auto-select');
    }
  }

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
    currentCameraId = wideBackCamera.deviceId;
    return wideBackCamera.deviceId;
  }

  // Fall back to any back camera
  if (backCameras.length > 0) {
    console.log('✅ Selected back camera:', backCameras[0].label || backCameras[0].deviceId);
    return backCameras[0].deviceId;
  }

  // If labels are empty (iOS before permission) or no back camera detected,
  // return null so getUserMedia uses facingMode: 'environment' natively
  console.log('⚠️ No specific back camera labeled, falling back to facingMode environment');
  return null;
}

/**
 * Setup camera with comprehensive error handling, wide-angle selection, and optimal resolution
 */
async function setupCamera(forceReconfigure = false, preferredDeviceId = null) {
  try {
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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
      selectedCameraId = await selectBestCamera(preferredDeviceId);
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
        if (attemptCount === 1 && constraints.video.deviceId) {
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

    // Configure video element attributes properly for iOS Safari
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('muted', 'true');
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;

    const track = stream.getVideoTracks()[0];

    // Check supported resolutions
    const supportedRes = await getSupportedResolutions(track);
    if (supportedRes) {
      console.log('📊 Supported resolutions:', supportedRes);
    }

    // Do NOT apply advanced constraints on Apple devices as WebKit crashes/blanks the camera stream
    if (!isAppleDevice && track && track.getCapabilities) {
      try {
        const caps = track.getCapabilities();
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
        console.warn('⚠️ Could not apply camera optimizations:', e.message);
      }
    }

    return new Promise((resolve, reject) => {
      let isSettled = false;
      let checkInterval = null;

      const finishReady = () => {
        if (isSettled) return;
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          isSettled = true;
          if (checkInterval) clearInterval(checkInterval);
          resizeCanvas();
          console.log(`🎥 Video loaded: ${video.videoWidth}x${video.videoHeight}`);
          resolve();
        }
      };

      video.onloadedmetadata = () => {
        video.play().catch(e => console.warn('video.play() caught:', e));
        finishReady();
      };
      video.oncanplay = finishReady;
      video.onplaying = finishReady;

      video.srcObject = stream;
      video.play().catch(e => console.warn('video.play() caught on srcObject:', e));

      // Fast check if already available
      if (video.readyState >= 2 && video.videoWidth > 0) {
        finishReady();
      } else {
        let checks = 0;
        checkInterval = setInterval(() => {
          checks++;
          if (video.readyState >= 2 && video.videoWidth > 0) {
            finishReady();
          } else if (checks > 35) {
            clearInterval(checkInterval);
            if (!isSettled) {
              isSettled = true;
              resizeCanvas();
              resolve();
            }
          }
        }, 100);
      }

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!isSettled) {
          if (checkInterval) clearInterval(checkInterval);
          isSettled = true;
          resizeCanvas();
          resolve();
        }
      }, 10000);
    });

  } catch (error) {
    throw error;
  }
}

function resizeCanvas() {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  } else if (!canvas.width || !canvas.height) {
    canvas.width = window.innerWidth || 640;
    canvas.height = window.innerHeight || 480;
  }
}

// ---- Detect real orientation/frame-size changes and handle smooth reconfiguration ----
/**
 * Refresh canvas and reconfigure camera on orientation change
 */
async function refreshCanvasForOrientation() {
  // Check if orientation is locked
  if (orientationLocked) {
    console.log('🔒 Orientation locked, ignoring change');
    return;
  }
  
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
    // Check if it's a minor orientation change
    if (isMinorOrientationChange()) {
      console.log('📐 Minor orientation change detected, preserving calibration');
      
      // Just save and restore calibration
      saveCalibrationAsRatio();
      resizeCanvas();
      
      if (restoreCalibrationFromRatio()) {
        setStatus('✅ کالیبراسیون حفظ شد');
        setTimeout(() => {
          if (mode === 'run' && runPhase === 'ready') {
            setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
          } else if (mode === 'jump' && jumpPhase === 'ready') {
            setStatus('آماده! بپر 🤸');
          }
        }, 2000);
        return;
      }
    }
    
    isReconfiguring = true;
    
    console.log(`🔄 Orientation changed: ${currentOrientation} → ${newOrientation}`);
    
    // Save calibration before reconfiguring
    const hadCalibration = (mode === 'run' && gatePoints[0] && gatePoints[1]) || 
                          (mode === 'jump' && legLengthPx !== null);
    
    if (hadCalibration) {
      saveCalibrationAsRatio();
    }
    
    setStatus(`در حال تنظیم برای ${newOrientation === 'portrait' ? 'حالت عمودی' : 'حالت افقی'}...`);

    try {
      // Reconfigure camera for new orientation
      await setupCamera(true);
      resizeCanvas();

      // Ask user if they want to reset calibration
      if (hadCalibration && calibrationData) {
        showOrientationChangeConfirmation(
          // User confirmed - reset calibration
          () => {
            calibrationData = null;
            if (mode === 'run' && runPhase !== 'calibrate1') {
              console.log('🔄 Resetting run calibration due to orientation change');
              runEnterCalibrate1();
            } else if (mode === 'jump' && jumpPhase !== 'calibrating') {
              console.log('🔄 Resetting jump calibration due to orientation change');
              jumpEnterCalibrating();
            }
          },
          // User cancelled - try to restore calibration
          () => {
            if (restoreCalibrationFromRatio()) {
              setStatus('✅ کالیبراسیون بازیابی شد');
              setTimeout(() => {
                if (mode === 'run' && runPhase === 'ready') {
                  setStatus('آماده! از کنار یکی از موانع رد شو تا زمان شروع بشه');
                } else if (mode === 'jump' && jumpPhase === 'ready') {
                  setStatus('آماده! بپر 🤸');
                }
              }, 2000);
            } else {
              // Failed to restore, reset
              if (mode === 'run') {
                runEnterCalibrate1();
              } else if (mode === 'jump') {
                jumpEnterCalibrating();
              }
            }
          }
        );
      } else {
        // No calibration to save, just reset
        if (mode === 'run' && runPhase !== 'calibrate1') {
          runEnterCalibrate1();
        } else if (mode === 'jump' && jumpPhase !== 'calibrating') {
          jumpEnterCalibrating();
        }
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
    // Save and try to restore calibration
    saveCalibrationAsRatio();
    
    if (!restoreCalibrationFromRatio()) {
      // Failed to restore, reset if we're mid-process
      if (mode === 'run' && runPhase !== 'calibrate1' && runPhase !== 'ready' && runPhase !== 'timing') {
        console.log('⚠️ Canvas resized, resetting calibration');
        runEnterCalibrate1();
      } else if (mode === 'jump' && jumpPhase !== 'calibrating' && jumpPhase !== 'ready') {
        console.log('⚠️ Canvas resized, resetting calibration');
        jumpEnterCalibrating();
      }
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

    // Handle frame tracking
    handleFrameTracking(poses);
    
    // Detect light level
    detectLightLevel(poses);

    if (mode === 'run') runDrawGates();
    if (mode === 'jump') jumpDrawOverlay();
    if (mode === 'bosco') boscoDrawOverlay();
    if (mode === 'wingspan') wingspanDrawOverlay();
    if (mode === 'distance') distanceDrawOverlay();

    if (!poses || !poses.length) return;
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

    // Use dynamic confidence threshold based on light level
    const confidenceThreshold = currentConfidenceThreshold;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = performanceMode === 'low-power' ? 2 : 3;
    
    for (const [a, b] of connectionsToRender) {
      const pa = kp[a], pb = kp[b];
      if (pa && pb && pa.score > confidenceThreshold && pb.score > confidenceThreshold) {
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
        if (point && point.score > confidenceThreshold) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    } else {
      // Draw all keypoints in normal mode
      for (const point of poses[0].keypoints) {
        if (point.score > confidenceThreshold) {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }

    if (mode === 'run') runUpdateGateCrossing(getAnkleX(kp));
    if (mode === 'jump') jumpProcessFrame(kp);
    if (mode === 'bosco') boscoProcessFrame(kp);
    if (mode === 'wingspan') wingspanProcessFrame(kp);

  } catch (error) {
    logError('drawPose', error, { posesLength: poses?.length });
    // Don't throw - let the loop continue
  }
}

function getAnkleX(kp) {
  const l = kp['left_ankle'], r = kp['right_ankle'];
  const validL = l && l.score > currentConfidenceThreshold;
  const validR = r && r.score > currentConfidenceThreshold;
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
    // headerContainer is always visible, no need to show
    applySettings();
    runEnterCalibrate1();
    detectLoop();

    console.log('✅ Application started successfully');
    
    // Initialize camera switcher after everything is ready
    initCameraSwitcher().catch(error => {
      console.warn('Camera switcher initialization failed:', error);
    });

  } catch (error) {
    logError('start', error);
    showErrorModal('UNKNOWN_ERROR', error.message || 'Unknown error during startup');
  }
}

startBtn.addEventListener('click', () => {
  console.log('🖱️ Start button clicked!');
  start();
});

// ================== VERSION CHECK ==================
console.log('%c🚀 Motion Tracker v1.5.1', 'color: #22c55e; font-size: 16px; font-weight: bold');
console.log('%c✨ Cards: Tighter spacing, compact layout', 'color: #3b82f6; font-size: 12px');

// ================== SERVICE WORKER & UPDATE MANAGEMENT ==================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then((registration) => {
      console.log('✅ Service Worker registered');
      
      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60000);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 Service Worker update found');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ New Service Worker installed, showing update notification');
            showUpdateNotification(newWorker);
          }
        });
      });
    })
    .catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error);
      // Non-critical, don't show error modal
    });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log(`📢 Service Worker updated to version ${event.data.version}`);
    }
  });
}

/**
 * Show update notification to user
 */
function showUpdateNotification(newWorker) {
  const modal = document.createElement('div');
  modal.id = 'updateModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="
      background: #1e293b;
      border: 2px solid #3b82f6;
      border-radius: 20px;
      padding: 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      color: #e2e8f0;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">✨</div>
      <h3 style="color: #3b82f6; margin-bottom: 12px; font-size: 18px;">نسخه جدید موجوده!</h3>
      <p style="color: #94a3b8; margin-bottom: 20px; line-height: 1.6; font-size: 14px;">
        یک نسخه جدید از حرکت‌سنج آماده است.<br>
        برای استفاده از آخرین بهبودها، صفحه رو بارگذاری مجدد کن.
      </p>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="updateReloadBtn" style="
          background: #22c55e;
          color: #052e16;
          border: none;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-height: 44px;
        ">🔄 بارگذاری مجدد</button>
        <button id="updateLaterBtn" style="
          background: transparent;
          color: #94a3b8;
          border: 2px solid #475569;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          min-height: 44px;
        ">بعداً</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('updateReloadBtn').onclick = () => {
    // Tell service worker to skip waiting
    if (newWorker) {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Reload page
    window.location.reload();
  };
  
  document.getElementById('updateLaterBtn').onclick = () => {
    modal.remove();
  };
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
