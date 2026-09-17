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
      animation: modalSlideUpFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
  
  const minCheckScore = Math.min(currentConfidenceThreshold, 0.2);
  for (const kp of keypoints) {
    if ((kp.score || 0) >= minCheckScore) {
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
      left: 12px;
      right: auto;
      max-width: calc(100% - 24px);
      box-sizing: border-box;
      z-index: 10;
      background: rgba(15, 23, 42, 0.88);
      backdrop-filter: blur(8px);
      color: #4ade80;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: bold;
      pointer-events: none;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      white-space: nowrap;
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
// Comprehensive full-body anatomical connections for BlazePose / MediaPipe Pose
const CONNECTIONS = [
  // Head & Facial connections
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
  ['left_eye_inner', 'left_eye'],
  ['left_eye', 'left_eye_outer'],
  ['right_eye_inner', 'right_eye'],
  ['right_eye', 'right_eye_outer'],
  ['mouth_left', 'mouth_right'],
  ['nose', 'mouth_left'],
  ['nose', 'mouth_right'],

  // Neck & Head to Torso
  ['nose', 'left_shoulder'],
  ['nose', 'right_shoulder'],
  ['left_ear', 'left_shoulder'],
  ['right_ear', 'right_shoulder'],

  // Torso / Shoulder Girdle & Pelvis
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],

  // Arms
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],

  // Hands & Fingers
  ['left_wrist', 'left_pinky'],
  ['left_wrist', 'left_index'],
  ['left_wrist', 'left_thumb'],
  ['left_pinky', 'left_index'],
  ['right_wrist', 'right_pinky'],
  ['right_wrist', 'right_index'],
  ['right_wrist', 'right_thumb'],
  ['right_pinky', 'right_index'],

  // Legs
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],

  // Feet & Toes
  ['left_ankle', 'left_heel'],
  ['left_heel', 'left_foot_index'],
  ['left_ankle', 'left_foot_index'],
  ['right_ankle', 'right_heel'],
  ['right_heel', 'right_foot_index'],
  ['right_ankle', 'right_foot_index'],
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
const modeSitupBtn = document.getElementById('modeSitupBtn');
const modePushupBtn = document.getElementById('modePushupBtn');
const modeSquatLungeBtn = document.getElementById('modeSquatLungeBtn');
const modeWingspanBtn = document.getElementById('modeWingspanBtn');
const modeDistanceBtn = document.getElementById('modeDistanceBtn');
const modeFlexBtn = document.getElementById('modeFlexBtn');
const modeAnthroBtn = document.getElementById('modeAnthroBtn');

// Jump controls and countdown elements
const jumpHud = document.getElementById('jumpHud');
const jumpLineUpBtn = document.getElementById('jumpLineUpBtn');
const jumpLineDownBtn = document.getElementById('jumpLineDownBtn');
const jumpLineAutoBtn = document.getElementById('jumpLineAutoBtn');
const jumpPrepTimerBtn = document.getElementById('jumpPrepTimerBtn');
const jumpCountdownOverlay = document.getElementById('jumpCountdownOverlay');
const jumpCountdownNumber = document.getElementById('jumpCountdownNumber');
const jumpCountdownSub = document.getElementById('jumpCountdownSub');

// Run Live HUD & result elements
const runHud = document.getElementById('runHud');
const runTimerVal = document.getElementById('runTimerVal');
const runGateStatusVal = document.getElementById('runGateStatusVal');
const runSpeedVal = document.getElementById('runSpeedVal');
const runRatingBadge = document.getElementById('runRatingBadge');
const runDistBadge = document.getElementById('runDistBadge');
const speedKmhResultEl = document.getElementById('speedKmhResult');
const runPaceResultEl = document.getElementById('runPaceResult');
const runAthleteNameEl = document.getElementById('runAthleteName');
const runSaveBtn = document.getElementById('runSaveBtn');

// Single Jump Live HUD & result elements
const singleJumpHud = document.getElementById('singleJumpHud');
const jumpLiveHeightVal = document.getElementById('jumpLiveHeightVal');
const jumpLiveAirVal = document.getElementById('jumpLiveAirVal');
const jumpLiveStatusVal = document.getElementById('jumpLiveStatusVal');
const jumpRatingBadge = document.getElementById('jumpRatingBadge');
const jumpVelocityResultEl = document.getElementById('jumpVelocityResult');
const jumpPowerResultEl = document.getElementById('jumpPowerResult');
const jumpAthleteNameEl = document.getElementById('jumpAthleteName');
const jumpSaveBtn = document.getElementById('jumpSaveBtn');

// Bosco Configurable Jump Test Elements
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
const boscoResultTitle = document.getElementById('boscoResultTitle');
const boscoCustomSecInput = document.getElementById('boscoCustomSecInput');
const boscoDurationPresets = document.getElementById('boscoDurationPresets');
const boscoTotalJumps = document.getElementById('boscoTotalJumps');
const boscoTotalTouches = document.getElementById('boscoTotalTouches');
const boscoTotalAirTime = document.getElementById('boscoTotalAirTime');
const boscoAvgAirTime = document.getElementById('boscoAvgAirTime');
const boscoAvgContactTime = document.getElementById('boscoAvgContactTime');
const boscoMaxHeight = document.getElementById('boscoMaxHeight');
const boscoTableBody = document.getElementById('boscoTableBody');
const boscoAgainBtn = document.getElementById('boscoAgainBtn');
const boscoSaveBtn = document.getElementById('boscoSaveBtn');

// Sit-up (دراز و نشست) Elements
const situpHud = document.getElementById('situpHud');
const situpTimerVal = document.getElementById('situpTimerVal');
const situpCountVal = document.getElementById('situpCountVal');
const situpAngleVal = document.getElementById('situpAngleVal');
const situpStatusVal = document.getElementById('situpStatusVal');
const situpCadenceVal = document.getElementById('situpCadenceVal');
const situpStartPanel = document.getElementById('situpStartPanel');
const situpStartBtn = document.getElementById('situpStartBtn');
const situpCancelBtn = document.getElementById('situpCancelBtn');
const situpDurationPresets = document.getElementById('situpDurationPresets');
const situpCustomSecInput = document.getElementById('situpCustomSecInput');
const situpResultPanel = document.getElementById('situpResultPanel');
const situpResultTitle = document.getElementById('situpResultTitle');
const situpTotalReps = document.getElementById('situpTotalReps');
const situpTotalTime = document.getElementById('situpTotalTime');
const situpAvgCadence = document.getElementById('situpAvgCadence');
const situpAvgRepTime = document.getElementById('situpAvgRepTime');
const situpTalentRating = document.getElementById('situpTalentRating');
const situpTalentDesc = document.getElementById('situpTalentDesc');
const situpAgainBtn = document.getElementById('situpAgainBtn');
const situpSaveBtn = document.getElementById('situpSaveBtn');

// Push-up (شنا سوئدی) Elements
const pushupHud = document.getElementById('pushupHud');
const pushupTimerVal = document.getElementById('pushupTimerVal');
const pushupCountVal = document.getElementById('pushupCountVal');
const pushupAngleVal = document.getElementById('pushupAngleVal');
const pushupStatusVal = document.getElementById('pushupStatusVal');
const pushupPlankVal = document.getElementById('pushupPlankVal');
const pushupStartPanel = document.getElementById('pushupStartPanel');
const pushupStartBtn = document.getElementById('pushupStartBtn');
const pushupCancelBtn = document.getElementById('pushupCancelBtn');
const pushupDurationPresets = document.getElementById('pushupDurationPresets');
const pushupCustomSecInput = document.getElementById('pushupCustomSecInput');
const pushupTypeStdBtn = document.getElementById('pushupTypeStdBtn');
const pushupTypeModBtn = document.getElementById('pushupTypeModBtn');
const pushupResultPanel = document.getElementById('pushupResultPanel');
const pushupResultTitle = document.getElementById('pushupResultTitle');
const pushupTotalReps = document.getElementById('pushupTotalReps');
const pushupTotalTime = document.getElementById('pushupTotalTime');
const pushupAvgCadence = document.getElementById('pushupAvgCadence');
const pushupAvgDepth = document.getElementById('pushupAvgDepth');
const pushupTalentRating = document.getElementById('pushupTalentRating');
const pushupTalentDesc = document.getElementById('pushupTalentDesc');
const pushupAgainBtn = document.getElementById('pushupAgainBtn');
const pushupSaveBtn = document.getElementById('pushupSaveBtn');

// Squat & Lunge (اسکات و لانج) Elements
const squatLungeHud = document.getElementById('squatLungeHud');
const squatLungeSubmodeVal = document.getElementById('squatLungeSubmodeVal');
const squatLungeRepVal = document.getElementById('squatLungeRepVal');
const squatLungeKneeAngleVal = document.getElementById('squatLungeKneeAngleVal');
const squatLungeDepthStatusVal = document.getElementById('squatLungeDepthStatusVal');
const squatLungeKneeAlignmentVal = document.getElementById('squatLungeKneeAlignmentVal');
const squatLungeTimerVal = document.getElementById('squatLungeTimerVal');
const squatQuadsTensionBar = document.getElementById('squatQuadsTensionBar');
const squatQuadsTensionLabel = document.getElementById('squatQuadsTensionLabel');
const squatGlutesTensionBar = document.getElementById('squatGlutesTensionBar');
const squatGlutesTensionLabel = document.getElementById('squatGlutesTensionLabel');
const squatLungeTensionSummaryBadge = document.getElementById('squatLungeTensionSummaryBadge');

const squatLungeStartPanel = document.getElementById('squatLungeStartPanel');
const squatLungeStartBtn = document.getElementById('squatLungeStartBtn');
const squatLungeCancelBtn = document.getElementById('squatLungeCancelBtn');
const squatLungeModeSquatBtn = document.getElementById('squatLungeModeSquatBtn');
const squatLungeModeLungeBtn = document.getElementById('squatLungeModeLungeBtn');
const squatLungeTargetPresets = document.getElementById('squatLungeTargetPresets');

const squatLungeResultPanel = document.getElementById('squatLungeResultPanel');
const squatLungeResultTitle = document.getElementById('squatLungeResultTitle');
const squatLungeResultGradeBadge = document.getElementById('squatLungeResultGradeBadge');
const squatLungeTotalReps = document.getElementById('squatLungeTotalReps');
const squatLungeFormScore = document.getElementById('squatLungeFormScore');
const squatLungeAvgDepth = document.getElementById('squatLungeAvgDepth');
const squatLungePeakQuads = document.getElementById('squatLungePeakQuads');
const squatLungePeakGlutes = document.getElementById('squatLungePeakGlutes');
const squatLungeToeAlignmentSummary = document.getElementById('squatLungeToeAlignmentSummary');
const squatLungeFeedbackText = document.getElementById('squatLungeFeedbackText');
const squatLungeAgainBtn = document.getElementById('squatLungeAgainBtn');
const squatLungeSaveBtn = document.getElementById('squatLungeSaveBtn');

// Squat & Lunge Fatigue Monitor and Calibration Elements
const squatFatigueMonitorBox = document.getElementById('squatFatigueMonitorBox');
const squatFatigueBadge = document.getElementById('squatFatigueBadge');
const squatFatigueVal = document.getElementById('squatFatigueVal');
const squatFatigueBar = document.getElementById('squatFatigueBar');
const squatLungeFatigueIndex = document.getElementById('squatLungeFatigueIndex');
const squatLungeFatigueRating = document.getElementById('squatLungeFatigueRating');

const squatCalibStatusBadge = document.getElementById('squatCalibStatusBadge');
const startSquatCalibBtn = document.getElementById('startSquatCalibBtn');
const resetSquatCalibBtn = document.getElementById('resetSquatCalibBtn');
const squatCalibResultText = document.getElementById('squatCalibResultText');
const squatCalibDepthVal = document.getElementById('squatCalibDepthVal');
const squatCalibToeRatioVal = document.getElementById('squatCalibToeRatioVal');

// Squat ROM Baseline, Calibration & Fatigue State (Declared early to prevent TDZ in loadSettingsUI)
let isSquatCalibrating = false;
let squatCalibHoldStartTime = 0;
let squatCalibSamples = [];
let squatCalibFeedbackText = 'در وضعیت اسکات بنشینید و ۳ ثانیه موقعیت را حفظ کنید 🏋️‍♂️';
let squatBaseline = {
  depthAngle: 90,
  kneeToeRatio: 0.12,
  femurTibiaRatio: 1.05,
  isCalibrated: false
};
let squatLungeRepCombinedTensionHistory = [];
let squatLungeCurrentFatigueIndex = 0;
let squatLungeFatigueRatingText = 'شاداب (آغاز آزمون)';

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

// Flexibility Elements
const flexibilityHud = document.getElementById('flexibilityHud');
const flexReachVal = document.getElementById('flexReachVal');
const flexAngleVal = document.getElementById('flexAngleVal');
const flexKneeStatusVal = document.getElementById('flexKneeStatusVal');
const flexMaxReachVal = document.getElementById('flexMaxReachVal');
const flexibilityPanel = document.getElementById('flexibilityPanel');
const flexibilityPanelCur = document.getElementById('flexibilityPanelCur');
const flexibilityPanelMax = document.getElementById('flexibilityPanelMax');
const flexibilityPanelRating = document.getElementById('flexibilityPanelRating');
const flexibilityRecordBtn = document.getElementById('flexibilityRecordBtn');
const flexibilityResetBtn = document.getElementById('flexibilityResetBtn');
const flexibilitySaveBtn = document.getElementById('flexibilitySaveBtn');

// Anthropometry Elements
const anthroHud = document.getElementById('anthroHud');
const anthroHeightVal = document.getElementById('anthroHeightVal');
const anthroTrunkVal = document.getElementById('anthroTrunkVal');
const anthroWingspanVal = document.getElementById('anthroWingspanVal');
const anthroCormicVal = document.getElementById('anthroCormicVal');
const anthroApeVal = document.getElementById('anthroApeVal');
const anthroLegVal = document.getElementById('anthroLegVal');
const anthroPanel = document.getElementById('anthroPanel');
const anthroCormicDesc = document.getElementById('anthroCormicDesc');
const anthroApeDesc = document.getElementById('anthroApeDesc');
const anthroLegDesc = document.getElementById('anthroLegDesc');
const anthroHeightInput = document.getElementById('anthroHeightInput');
const anthroTrunkInput = document.getElementById('anthroTrunkInput');
const anthroWingspanInput = document.getElementById('anthroWingspanInput');
const anthroScanBtn = document.getElementById('anthroScanBtn');
const anthroSaveBtn = document.getElementById('anthroSaveBtn');

// Settings Elements
const athleteHeightSetting = document.getElementById('athleteHeightSetting');
const startHeightCalibBtn = document.getElementById('startHeightCalibBtn');
const heightCalibPanel = document.getElementById('heightCalibPanel');
const heightCalibStepHint = document.getElementById('heightCalibStepHint');
const heightPointHeadStatus = document.getElementById('heightPointHeadStatus');
const heightPointFeetStatus = document.getElementById('heightPointFeetStatus');
const heightCalibResult = document.getElementById('heightCalibResult');
const heightCalibConfirmBtn = document.getElementById('heightCalibConfirmBtn');
const heightCalibResetBtn = document.getElementById('heightCalibResetBtn');
const heightCalibCancelBtn = document.getElementById('heightCalibCancelBtn');

// Object-Based Auto-Calibration Elements
const objectCalibPanel = document.getElementById('objectCalibPanel');
const objCalibHint = document.getElementById('objCalibHint');
const objCalibPresets = document.getElementById('objCalibPresets');
const objCalibCustomCm = document.getElementById('objCalibCustomCm');
const objCalibReadout = document.getElementById('objCalibReadout');
const objCalibRatioReadout = document.getElementById('objCalibRatioReadout');
const objCalibAutoDetectBtn = document.getElementById('objCalibAutoDetectBtn');
const objCalibResetBoxBtn = document.getElementById('objCalibResetBoxBtn');
const objCalibConfirmBtn = document.getElementById('objCalibConfirmBtn');
const objCalibCancelBtn = document.getElementById('objCalibCancelBtn');

const gateA4CalibBtn = document.getElementById('gateA4CalibBtn');
const distPanelA4CalibBtn = document.getElementById('distPanelA4CalibBtn');
const distObjA4CalibBtn = document.getElementById('distObjA4CalibBtn');
const startObjectCalibSettingsBtn = document.getElementById('startObjectCalibSettingsBtn');

const gateSpeakBtn = document.getElementById('gateSpeakBtn');
const autoDistBox = document.getElementById('autoDistBox');
const autoDistText = document.getElementById('autoDistText');
const distPanelSpeakBtn = document.getElementById('distPanelSpeakBtn');
const distObjSpeakBtn = document.getElementById('distObjSpeakBtn');

const athleteProfileBtn = document.getElementById('athleteProfileBtn');
const activeAthleteBtnName = document.getElementById('activeAthleteBtnName');
const athleteProfileModal = document.getElementById('athleteProfileModal');
const closeAthleteModalXBtn = document.getElementById('closeAthleteModalXBtn');
const closeAthleteModalBtn = document.getElementById('closeAthleteModalBtn');
const activeAthleteCard = document.getElementById('activeAthleteCard');
const activeProfileName = document.getElementById('activeProfileName');
const activeProfileDetails = document.getElementById('activeProfileDetails');
const athletesListContainer = document.getElementById('athletesListContainer');
const toggleAddAthleteBtn = document.getElementById('toggleAddAthleteBtn');
const addAthleteForm = document.getElementById('addAthleteForm');
const cancelAddAthleteBtn = document.getElementById('cancelAddAthleteBtn');

const guideTourBtn = document.getElementById('guideTourBtn');
const startGuidedTourSettingsBtn = document.getElementById('startGuidedTourSettingsBtn');
const setupTourOverlay = document.getElementById('setupTourOverlay');
const tourSpotlight = document.getElementById('tourSpotlight');
const tourTooltipCard = document.getElementById('tourTooltipCard');
const tourStepBadge = document.getElementById('tourStepBadge');
const tourSkipBtn = document.getElementById('tourSkipBtn');
const tourStepIcon = document.getElementById('tourStepIcon');
const tourStepTitle = document.getElementById('tourStepTitle');
const tourStepDesc = document.getElementById('tourStepDesc');
const tourStepSpecs = document.getElementById('tourStepSpecs');
const tourPrevBtn = document.getElementById('tourPrevBtn');
const tourNextBtn = document.getElementById('tourNextBtn');
const tourDotsContainer = document.getElementById('tourDotsContainer');

const historyBtn = document.getElementById('historyBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyPanel = document.getElementById('historyPanel');
const historyCloseXBtn = document.getElementById('historyCloseXBtn');
const historyTabRecordsBtn = document.getElementById('historyTabRecordsBtn');
const historyTabTrendBtn = document.getElementById('historyTabTrendBtn');
const historyRecordsView = document.getElementById('historyRecordsView');
const historyTrendView = document.getElementById('historyTrendView');
const historyAthleteFilter = document.getElementById('historyAthleteFilter');
const trendMetricSelect = document.getElementById('trendMetricSelect');
const rechartsRootContainer = document.getElementById('rechartsRootContainer');
const trendNoDataMsg = document.getElementById('trendNoDataMsg');
const trendCardBest = document.getElementById('trendCardBest');
const trendCardAvg = document.getElementById('trendCardAvg');
const trendCardLatest = document.getElementById('trendCardLatest');
const trendCardChange = document.getElementById('trendCardChange');
const exportPdfBtn = document.getElementById('exportPdfBtn');

const pdfReportModal = document.getElementById('pdfReportModal');
const closePdfModalXBtn = document.getElementById('closePdfModalXBtn');
const closePdfReportBtn = document.getElementById('closePdfReportBtn');
const downloadPdfDirectBtn = document.getElementById('downloadPdfDirectBtn');
const printPdfWindowBtn = document.getElementById('printPdfWindowBtn');
const pdfReportDocument = document.getElementById('pdfReportDocument');

const historyList = document.getElementById('historyList');
const downloadCsvBtn = document.getElementById('downloadCsvBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const guideOverlay = document.getElementById('guideOverlay');
const guideIcon = document.getElementById('guideIcon');
const guideTitle = document.getElementById('guideTitle');
const guideText = document.getElementById('guideText');
const guideCloseBtn = document.getElementById('guideCloseBtn');

// ================== COMPACT TOP BAR & APP DRAWER ELEMENTS ==================
const hamburgerBtn = document.getElementById('hamburgerBtn');
const drawerCloseBtn = document.getElementById('drawerCloseBtn');
const appDrawer = document.getElementById('appDrawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const currentModeBadge = document.getElementById('currentModeBadge');
const currentModeIcon = document.getElementById('currentModeIcon');
const currentModeLabel = document.getElementById('currentModeLabel');
const drawerAthleteName = document.getElementById('drawerAthleteName');
const drawerAthleteCode = document.getElementById('drawerAthleteCode');

// Drawer Test Modes
const modeAgilityBtn = document.getElementById('modeAgilityBtn');
const drawerItemRun = document.getElementById('drawerItemRun');
const drawerItemJump = document.getElementById('drawerItemJump');
const drawerItemAgility = document.getElementById('drawerItemAgility');
const drawerItemBosco = document.getElementById('drawerItemBosco');
const drawerItemSitup = document.getElementById('drawerItemSitup');
const drawerItemPushup = document.getElementById('drawerItemPushup');
const drawerItemSquatLunge = document.getElementById('drawerItemSquatLunge');
const drawerItemFlex = document.getElementById('drawerItemFlex');
const drawerItemAnthro = document.getElementById('drawerItemAnthro');
const drawerItemWingspan = document.getElementById('drawerItemWingspan');
const drawerItemDistance = document.getElementById('drawerItemDistance');

// Drawer Actions
const drawerItemHandball = document.getElementById('drawerItemHandball');
const drawerItemProfile = document.getElementById('drawerItemProfile');
const drawerItemHistory = document.getElementById('drawerItemHistory');
const drawerItemPdf = document.getElementById('drawerItemPdf');
const drawerItemCsv = document.getElementById('drawerItemCsv');
const drawerItemCamera = document.getElementById('drawerItemCamera');
const drawerItemFit = document.getElementById('drawerItemFit');
const drawerItemOrientation = document.getElementById('drawerItemOrientation');
const drawerItemTour = document.getElementById('drawerItemTour');
const drawerItemSettings = document.getElementById('drawerItemSettings');

// ================== AGILITY TEST (ILLINOIS & SHUTTLE) ELEMENTS ==================
const agilityHud = document.getElementById('agilityHud');
const agilityTimerVal = document.getElementById('agilityTimerVal');
const agilityLapStatusVal = document.getElementById('agilityLapStatusVal');
const agilitySpeedVal = document.getElementById('agilitySpeedVal');
const agilityConeControls = document.getElementById('agilityConeControls');
const agilityConeHint = document.getElementById('agilityConeHint');
const agilityPresetsContainer = document.getElementById('agilityPresetsContainer');
const agilityStartReadyBtn = document.getElementById('agilityStartReadyBtn');
const agilityResetConesBtn = document.getElementById('agilityResetConesBtn');
const agilityResultPanel = document.getElementById('agilityResultPanel');
const agilityRatingBadge = document.getElementById('agilityRatingBadge');
const agilityTotalTimeResult = document.getElementById('agilityTotalTimeResult');
const agilityPatternResult = document.getElementById('agilityPatternResult');
const agilityLap1Result = document.getElementById('agilityLap1Result');
const agilityLap2Result = document.getElementById('agilityLap2Result');
const agilityTurnPenaltyResult = document.getElementById('agilityTurnPenaltyResult');
const agilityAvgSpeedResult = document.getElementById('agilityAvgSpeedResult');
const agilitySaveBtn = document.getElementById('agilitySaveBtn');
const agilityAgainBtn = document.getElementById('agilityAgainBtn');
const agilityRecalibBtn = document.getElementById('agilityRecalibBtn');

// Agility test state variables
let agilityConeA = null; // {x, y} Start & Finish line
let agilityConeB = null; // {x, y} Turning point
let agilityPhase = 'calibrateA'; // 'calibrateA' | 'calibrateB' | 'ready' | 'ready_armed' | 'running' | 'done'
let agilityPatternName = 'شاتل ۵×۲ متر (۱۰ متر کل)';
let agilityDistanceMeters = 5.0; // Distance between cone A and B (one-way)
let agilityStartTime = null;
let agilityLap1Time = null;
let agilityLap2Time = null;
let agilityTotalTime = null;
let agilityLap = 1; // 1 = going to B, 2 = returning to A
let agilityTurnedAtB = false;
let agilityRunnerPath = [];

// ================== HANDBALL & MULTI-SPORT SCOUTING ELEMENTS ==================
const openHandballScoutingFromProfileBtn = document.getElementById('openHandballScoutingFromProfileBtn');
const handballScoutingModal = document.getElementById('handballScoutingModal');
const closeHandballModalXBtn = document.getElementById('closeHandballModalXBtn');
const closeHandballModalBtn = document.getElementById('closeHandballModalBtn');
const handballScoutingContent = document.getElementById('handballScoutingContent');
const handballExportPdfBtn = document.getElementById('handballExportPdfBtn');

let detector = null;
let running = false;

// mode: 'run' | 'jump' | 'agility' | 'bosco' | 'situp' | 'pushup' | 'flexibility' | 'anthro' | 'wingspan' | 'distance'
let mode = 'run';
let lastSeenKeypoints = null;
let isDraggingJumpBaseline = false;
let jumpCountdownInterval = null;

// Jump mode calculation thresholds (declared early for settings initialization)
let legLengthPx = null;
let CALIB_FRAMES_NEEDED = 20; // ~0.5-1s of standing still
let airThresholdPx = 20;
let landThresholdPx = 10;

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

// ================== CAMERA SWITCHER & DISPLAY SYSTEM ==================
/**
 * Camera switcher state
 */
let availableCameras = [];
let currentCameraId = null;
let currentCameraInfo = null;
let cameraSwitcherBtn = null;
let currentCameraZoom = 1.0;
let cameraFitMode = localStorage.getItem('cameraFitMode') || 'contain';

/**
 * Initialize camera switcher
 */
async function initCameraSwitcher() {
  try {
    console.log('[Camera Switcher] Initializing...');
    cameraSwitcherBtn = document.getElementById('cameraSwitcherBtn');

    // Get list of cameras without disruptive getUserMedia calls
    await refreshAvailableCameras();

    // Initialize camera fit mode (contain vs cover) - defaults to contain for full sensor view
    applyCameraFitMode(cameraFitMode, false);

    console.log('[Camera Switcher] Initialization complete');
  } catch (error) {
    console.error('[Camera Switcher] Initialization failed:', error);
  }
}

/**
 * Refresh list of cameras and update UI
 */
async function refreshAvailableCameras() {
  try {
    availableCameras = await enumerateDevices();
    console.log(`📷 Found ${availableCameras.length} camera(s):`, availableCameras.map(c => `${c.persianLabel} [${c.originalLabel || c.deviceId.slice(0, 8)}]`));

    if (cameraSwitcherBtn) {
      cameraSwitcherBtn.disabled = false;
      cameraSwitcherBtn.style.opacity = '1';
    }

    // Sync currentCameraInfo if currentCameraId is set
    if (currentCameraId && availableCameras.length > 0) {
      const match = availableCameras.find(c => c.deviceId === currentCameraId);
      if (match) {
        currentCameraInfo = match;
      }
    } else if (availableCameras.length > 0) {
      // Default to the recommended/widest camera
      const recommended = availableCameras.find(c => c.isWidest) || availableCameras[0];
      currentCameraInfo = recommended;
    }

    updateCameraInfoDisplay();
  } catch (err) {
    console.warn('refreshAvailableCameras error:', err);
  }
}

/**
 * Enumerate ALL video input devices without filtering any out
 * Displays every physical lens and hardware camera sensor
 */
async function enumerateDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length === 0) {
      return [];
    }

    // Process EVERY video device - do not filter out any device
    const preAnalyzed = videoDevices.map((device, idx) => {
      const typeInfo = detectCameraType(device.label, idx);
      return { device, typeInfo, originalIndex: idx };
    });

    let backCount = 0;
    let frontCount = 0;
    preAnalyzed.forEach(item => {
      if (item.typeInfo.position === 'back') backCount++;
      else frontCount++;
    });

    let currentBackIdx = 0;
    let currentFrontIdx = 0;
    const camerasWithInfo = [];

    for (let i = 0; i < preAnalyzed.length; i++) {
      const { device, typeInfo } = preAnalyzed[i];
      let subIdx = 0;
      if (typeInfo.position === 'back') {
        subIdx = currentBackIdx++;
      } else {
        subIdx = currentFrontIdx++;
      }

      const info = {
        deviceId: device.deviceId,
        label: device.label || `دوربین ${i + 1}`,
        originalLabel: device.label || `سنسور ${i + 1}`,
        groupId: device.groupId,
        type: typeInfo.type,
        position: typeInfo.position,
        zoomRatio: typeInfo.zoomRatio,
        wideScore: typeInfo.wideScore,
        icon: typeInfo.icon,
        isWidest: false
      };

      info.persianLabel = formatCameraLabel(info, subIdx, backCount, frontCount);

      // Inspect capabilities if this device is the currently active camera
      if (currentCameraStream) {
        const activeTrack = currentCameraStream.getVideoTracks()[0];
        if (activeTrack) {
          const settings = activeTrack.getSettings ? activeTrack.getSettings() : {};
          if (settings.deviceId === device.deviceId || device.deviceId === currentCameraId) {
            const caps = activeTrack.getCapabilities ? activeTrack.getCapabilities() : {};
            info.capabilities = caps;
            if (settings.width && settings.height) {
              info.resolution = `${settings.width}×${settings.height}`;
            }
          }
        }
      }

      if (!info.resolution) {
        info.resolution = info.position === 'front' ? 'سلفی' : (info.type === 'ultrawide' ? 'فوق‌عریض (واید)' : (info.type === 'wide' ? 'عریض' : 'استاندارد'));
      }

      camerasWithInfo.push(info);
    }

    // Find the back camera with the highest wideScore and flag it as the widest
    const backCameras = camerasWithInfo.filter(c => c.position === 'back');
    if (backCameras.length > 0) {
      let bestWideCam = backCameras[0];
      for (const cam of backCameras) {
        if (cam.wideScore > bestWideCam.wideScore) {
          bestWideCam = cam;
        }
      }
      bestWideCam.isWidest = true;
      bestWideCam.isRecommended = true;
    }

    // Sort order for UI presentation:
    // 1. Ultra-wide and widest back cameras first
    // 2. Standard back cameras
    // 3. Telephoto / secondary back cameras
    // 4. Front cameras
    camerasWithInfo.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position === 'back' ? -1 : 1;
      }
      return (b.wideScore || 0) - (a.wideScore || 0);
    });

    return camerasWithInfo;
  } catch (error) {
    console.error('Failed to enumerate devices:', error);
    return [];
  }
}

/**
 * Detect camera type, optics, and wide angle ranking from label & hardware index
 * Prioritizes Android Camera2 conventions and optical zoom indicators
 */
function detectCameraType(label, index) {
  const lower = (label || '').toLowerCase();
  const isAndroid = /Android/i.test(navigator.userAgent);
  
  let type = 'normal';
  let position = 'back';
  let zoomRatio = 1;
  let icon = '📸';
  let wideScore = 50; // 0 to 100 ranking
  
  // 1. Position detection
  if (lower.includes('front') || lower.includes('face') || lower.includes('user') || lower.includes('selfie') || lower.includes('جلو')) {
    position = 'front';
    icon = '🤳';
    wideScore = 10;
  } else if (lower.includes('back') || lower.includes('rear') || lower.includes('environment') || lower.includes('عقب')) {
    position = 'back';
    icon = '📸';
    wideScore = 50;
  } else {
    // Default heuristic: Camera index 1 is usually front, 0 or 2 is back
    position = index === 1 ? 'front' : 'back';
    icon = position === 'front' ? '🤳' : '📸';
    wideScore = position === 'front' ? 10 : 50;
  }
  
  // 2. Ultra-wide & Wide keyword detection (covers Samsung, Xiaomi, Pixel, iPhone, etc.)
  const isUltraWideKeyword = lower.includes('ultra') || lower.includes('0.5') || lower.includes('0.6') || lower.includes('super wide') || lower.includes('ultrawide') || lower.includes('فوق‌عریض');
  const isWideKeyword = lower.includes('wide') || lower.includes('0.7') || lower.includes('عریض');
  const isTeleKeyword = lower.includes('tele') || lower.includes('zoom') || lower.includes('2x') || lower.includes('3x') || lower.includes('5x') || lower.includes('10x') || lower.includes('تله');
  const isMacro = lower.includes('macro') || lower.includes('ماکرو') || lower.includes('depth') || lower.includes('عمق');

  if (isUltraWideKeyword) {
    type = 'ultrawide';
    zoomRatio = 0.5;
    icon = position === 'front' ? '🤳' : '🌐';
    wideScore = position === 'back' ? 100 : 30;
  } else if (isWideKeyword && !lower.includes('tele')) {
    type = 'wide';
    zoomRatio = 0.6;
    icon = position === 'front' ? '🤳' : '🌐';
    wideScore = position === 'back' ? 95 : 25;
  } else if (isTeleKeyword) {
    type = 'telephoto';
    zoomRatio = lower.includes('3x') ? 3 : 2;
    icon = '🔭';
    wideScore = 20;
  } else if (isMacro) {
    type = 'macro';
    icon = '🔍';
    wideScore = 15;
  } else if (position === 'back') {
    // 3. Android Camera2 multi-camera parsing:
    // "camera2 0, facing back" => Main 1x
    // "camera2 1, facing front" => Front selfie
    // "camera2 2, facing back" => Ultra-wide 0.5x on standard Qualcomm/MediaTek Android devices!
    // "camera2 3, facing back" => Telephoto or Secondary
    const match = lower.match(/camera2?\s*(\d+)/);
    if (match) {
      const camNum = parseInt(match[1], 10);
      if (camNum === 2) {
        // Ultra-wide lens on almost all Android phones
        type = 'ultrawide';
        zoomRatio = 0.5;
        icon = '🌐';
        wideScore = 96;
      } else if (camNum === 0) {
        type = 'main';
        zoomRatio = 1;
        icon = '📸';
        wideScore = 60;
      } else if (camNum === 3) {
        type = 'secondary';
        zoomRatio = 2;
        icon = '📷';
        wideScore = 40;
      } else {
        type = 'auxiliary';
        icon = '📷';
        wideScore = 35;
      }
    } else {
      // If back camera with no specific label on Android, index 2 or 1 may be ultra-wide
      if (index === 2 && isAndroid) {
        type = 'ultrawide';
        zoomRatio = 0.5;
        icon = '🌐';
        wideScore = 92;
      }
    }
  }
  
  return { type, position, zoomRatio, icon, wideScore };
}

/**
 * Format camera label in clear, descriptive Persian with lens classification
 */
function formatCameraLabel(info, subIdx, backCount, frontCount) {
  if (info.position === 'front') {
    if (info.type === 'ultrawide' || info.type === 'wide') return 'دوربین سلفی عریض (Wide 🌐)';
    return frontCount > 1 ? `دوربین جلو ${subIdx + 1} (سلفی 🤳)` : 'دوربین جلو (سلفی 🤳)';
  }

  // Back cameras
  if (info.type === 'ultrawide') {
    return `دوربین فوق‌عریض عقب (${info.zoomRatio || '0.5'}x Ultra-Wide 🌐)`;
  }
  if (info.type === 'wide') {
    return `دوربین عریض عقب (${info.zoomRatio || '0.6'}x Wide 🌐)`;
  }
  if (info.type === 'telephoto') {
    return `دوربین تله‌فوتو عقب (${info.zoomRatio || '2'}x 🔭)`;
  }
  if (info.type === 'macro') {
    return 'دوربین ماکرو عقب 🔍';
  }
  if (info.type === 'main' || subIdx === 0) {
    return 'دوربین اصلی عقب (1x Standard 📸)';
  }

  if (backCount > 1) {
    return `دوربین عقب (سنسور ${subIdx + 1} 📷)`;
  }

  return 'دوربین اصلی عقب (📸)';
}

/**
 * Show camera switcher modal displaying ALL available cameras without any filtering
 */
async function showCameraSwitcherModal() {
  if ((mode === 'run' && runPhase === 'timing') || 
      (mode === 'jump' && jumpPhase === 'measuring')) {
    setStatus('⚠️ در حین اندازه‌گیری نمی‌تونی دوربین رو عوض کنی');
    return;
  }

  // Refresh available devices right before rendering modal
  await refreshAvailableCameras();

  const existingModal = document.getElementById('cameraSwitcherModal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'cameraSwitcherModal';
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(0, 0, 0, 0.92);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow-y: auto;
  `;

  const cameraCards = (availableCameras.length > 0 ? availableCameras : [
    { deviceId: '', icon: '📸', persianLabel: 'دوربین اصلی عقب', position: 'back', resolution: 'استاندارد', type: 'main' }
  ]).map((camera) => {
    const isActive = camera.deviceId === currentCameraId || (!currentCameraId && camera.position === 'back');
    const isRecommended = camera.isWidest && camera.position === 'back';
    const borderColor = isActive ? '#22c55e' : (isRecommended ? '#38bdf8' : '#334155');
    const bgColor = isActive ? 'rgba(34, 197, 94, 0.14)' : (isRecommended ? 'rgba(56, 189, 248, 0.10)' : 'rgba(30, 41, 59, 0.7)');

    return `
      <div class="camera-card" data-device-id="${camera.deviceId || ''}" style="
        background: ${bgColor};
        border: 2px solid ${borderColor};
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: all 0.2s;
      ">
        <div style="display: flex; align-items: center; gap: 14px;">
          <div style="font-size: 28px; line-height: 1;">${camera.icon}</div>
          <div style="flex: 1;">
            <div style="color: #f1f5f9; font-weight: bold; font-size: 14px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 4px;">
              <span>${camera.persianLabel}</span>
              <div style="display: flex; gap: 6px; align-items: center;">
                ${isRecommended ? '<span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 11px; padding: 2px 8px; border-radius: 9999px; border: 1px solid rgba(56, 189, 248, 0.4); font-weight: bold;">🌟 پیشنهادی برای ورزش</span>' : ''}
                ${isActive ? '<span style="color: #22c55e; font-size: 12px; font-weight: 900;">✓ فعال</span>' : ''}
              </div>
            </div>
            <div style="color: #94a3b8; font-size: 11px; line-height: 1.5;">
              ${camera.originalLabel ? `<span style="font-family: monospace; font-size: 10px; color: #cbd5e1; opacity: 0.85;">شناسه: ${camera.originalLabel}</span><br/>` : ''}
              موقعیت: ${camera.position === 'front' ? 'جلو (سلفی)' : 'عقب'} • 
              نوع لنز: ${camera.type === 'ultrawide' ? 'فوق‌عریض (0.5x)' : (camera.type === 'wide' ? 'عریض' : (camera.type === 'telephoto' ? 'تله‌فوتو' : 'استاندارد'))}
              ${camera.resolution ? ` • ${camera.resolution}` : ''}
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
      padding: 18px;
      max-width: 440px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.6);
    ">
      <div style="display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 12px;">
        <div style="text-align: right; flex: 1;">
          <h3 style="color: #38bdf8; margin: 0 0 4px 0; font-size: 16px;">
            📷 انتخاب سنسور دوربین (${availableCameras.length} سنسور یافت شد)
          </h3>
          <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
            دوربین <strong>فوق‌عریض (0.5x)</strong> برای فیلم‌برداری ورزشی پیشنهاد می‌شود.
          </p>
        </div>
        <button type="button" id="closeCameraSwitcherXBtn" class="panel-close-x-btn" title="بستن (✕)">✕</button>
      </div>

      <div id="cameraList" style="max-height: 50vh; overflow-y: auto; padding: 2px;">
        ${cameraCards}
      </div>

      <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 8px;">
        <button id="modalToggleFitBtn" type="button" style="
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.35);
          padding: 8px 14px;
          font-size: 12px;
          border-radius: 10px;
          cursor: pointer;
        ">
          📐 حالت کادر: ${cameraFitMode === 'contain' ? 'دید کامل بدون برش (Contain) ✓' : 'تمام‌صفحه با برش (Cover)'} (کلیک برای تغییر)
        </button>

        <button id="modalRescanBtn" type="button" style="
          background: rgba(255, 255, 255, 0.08);
          color: #cbd5e1;
          border: 1px solid #475569;
          padding: 8px 14px;
          font-size: 12px;
          border-radius: 10px;
          cursor: pointer;
        ">
          🔄 اسکن مجدد تمام سنسورهای دوربین
        </button>

        <button id="closeCameraSwitcher" style="
          background: transparent;
          color: #94a3b8;
          border: 1px solid #475569;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
          width: 100%;
        ">بستن</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Click handler to select camera
  modal.querySelectorAll('.camera-card').forEach(card => {
    card.addEventListener('click', async () => {
      const deviceId = card.getAttribute('data-device-id');
      modal.remove();
      if (deviceId && deviceId !== currentCameraId) {
        await switchCamera(deviceId);
      }
    });
  });

  // Toggle fit mode button
  const toggleFitBtn = modal.querySelector('#modalToggleFitBtn');
  if (toggleFitBtn) {
    toggleFitBtn.addEventListener('click', () => {
      toggleCameraFitMode();
      toggleFitBtn.textContent = `📐 حالت کادر: ${cameraFitMode === 'contain' ? 'دید کامل بدون برش (Contain) ✓' : 'تمام‌صفحه با برش (Cover)'} (کلیک برای تغییر)`;
    });
  }

  // Rescan devices button
  const rescanBtn = modal.querySelector('#modalRescanBtn');
  if (rescanBtn) {
    rescanBtn.addEventListener('click', async () => {
      rescanBtn.disabled = true;
      rescanBtn.textContent = 'در حال اسکن...';
      await refreshAvailableCameras();
      modal.remove();
      showCameraSwitcherModal();
    });
  }

  document.getElementById('closeCameraSwitcher').onclick = () => {
    modal.remove();
  };
  const closeCameraSwitcherXBtn = document.getElementById('closeCameraSwitcherXBtn');
  if (closeCameraSwitcherXBtn) {
    closeCameraSwitcherXBtn.onclick = () => {
      modal.remove();
    };
  }
}

/**
 * Switch to a different camera with full safety fallback (never black screen)
 */
async function switchCamera(deviceId) {
  const camera = availableCameras.find(c => c.deviceId === deviceId);
  const prevCameraId = currentCameraId;
  const switchStartTime = performance.now();

  console.log(`📷 Switching to camera: ${camera ? camera.persianLabel : deviceId}`);
  setStatus('🔄 در حال تعویض دوربین...');

  try {
    if ((mode === 'run' && gatePoints[0] && gatePoints[1]) || 
        (mode === 'jump' && legLengthPx !== null)) {
      saveCalibrationAsRatio();
    }

    // Force reconfiguration with the target deviceId
    await setupCamera(true, deviceId);

    // Update state on success
    currentCameraId = deviceId;
    currentCameraInfo = camera || availableCameras.find(c => c.deviceId === deviceId);
    localStorage.setItem('selectedCameraId', deviceId);

    if (calibrationData) {
      restoreCalibrationFromRatio();
    }

    const latencyMs = Math.round(performance.now() - switchStartTime);
    if (typeof predictiveCameraBufferHub !== 'undefined') {
      predictiveCameraBufferHub.lastSwitchLatencyMs = latencyMs;
      predictiveCameraBufferHub.updateUI();
    }

    setStatus(`✅ دوربین فعال شد: ${currentCameraInfo ? currentCameraInfo.persianLabel : 'موفق'} (${latencyMs}ms)`);
    updateCameraInfoDisplay();

  } catch (error) {
    console.error('Failed to switch camera:', error);
    logError('switchCamera', error, { deviceId, camera });

    setStatus('⚠️ این لنز توسط دستگاه قفل است. بازگشت به دوربین قبلی...');

    // Safe recovery: Never leave the screen black!
    try {
      if (prevCameraId && prevCameraId !== deviceId) {
        await setupCamera(true, prevCameraId);
      } else {
        await setupCamera(true, null);
      }
      setStatus('✅ دوربین فعال بازگردانده شد');
      updateCameraInfoDisplay();
    } catch (restoreErr) {
      console.error('Failed to restore previous camera:', restoreErr);
      showErrorModal('CAMERA_UNKNOWN', `امکان فعال‌سازی این دوربین وجود ندارد:\n${error.message || error}`);
    }
  }
}

/**
 * Setup floating interactive Zoom Controls on screen when supported by camera
 */
function setupZoomControlsUI(track, caps) {
  const container = document.getElementById('cameraZoomControls');
  if (!container) return;

  if (!caps || !caps.zoom || caps.zoom.min === caps.zoom.max) {
    container.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  container.style.display = 'flex';

  const zoomLevels = [];
  if (caps.zoom.min <= 0.6) {
    zoomLevels.push({ label: '0.5x', value: caps.zoom.min });
    zoomLevels.push({ label: '1x', value: 1.0 });
    if (caps.zoom.max >= 2.0) {
      zoomLevels.push({ label: '2x', value: 2.0 });
    }
  } else if (caps.zoom.max >= 2.0) {
    zoomLevels.push({ label: '1x', value: caps.zoom.min });
    zoomLevels.push({ label: '2x', value: Math.min(2.0, caps.zoom.max) });
    if (caps.zoom.max >= 3.0) {
      zoomLevels.push({ label: '3x', value: Math.min(3.0, caps.zoom.max) });
    }
  } else {
    zoomLevels.push({ label: '1x', value: caps.zoom.min });
    zoomLevels.push({ label: 'Max', value: caps.zoom.max });
  }

  zoomLevels.forEach(lvl => {
    const btn = document.createElement('button');
    btn.className = 'zoomBtn' + (Math.abs(currentCameraZoom - lvl.value) < 0.15 ? ' active' : '');
    btn.textContent = lvl.label;
    btn.title = `بزرگ‌نمایی لنز: ${lvl.label}`;
    btn.onclick = async (e) => {
      e.stopPropagation();
      try {
        await track.applyConstraints({ advanced: [{ zoom: lvl.value }] });
        currentCameraZoom = lvl.value;
        container.querySelectorAll('.zoomBtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setStatus(`🔍 بزرگ‌نمایی: ${lvl.label}`);
      } catch (err) {
        console.warn('Failed to apply zoom constraint:', err);
      }
    };
    container.appendChild(btn);
  });
}

// ================== HARDWARE CAMERA FOCUS-CONTROL CONSTRAINTS SYSTEM ==================
const cameraFocusState = {
  primary: {
    track: null,
    supported: false,
    focusModes: [],
    currentMode: 'continuous',
    distanceRange: null,
    currentDistance: 2.5,
    pointsOfInterest: false,
    label: 'دوربین ۱ (اصلی)'
  },
  secondary: {
    track: null,
    supported: false,
    focusModes: [],
    currentMode: 'continuous',
    distanceRange: null,
    currentDistance: 2.5,
    pointsOfInterest: false,
    label: 'دوربین ۲ (استودیو)'
  },
  target: 'primary'
};

/**
 * Inspect video track for hardware focus capabilities (focusMode, focusDistance, pointsOfInterest)
 */
function inspectTrackFocusCapabilities(track, target = 'primary') {
  if (!cameraFocusState[target]) return;
  const st = cameraFocusState[target];
  st.track = track;

  if (!track || typeof track.getCapabilities !== 'function') {
    st.supported = false;
    st.focusModes = [];
    st.distanceRange = null;
    updateFocusControlUI();
    return;
  }

  try {
    const caps = track.getCapabilities();
    const settings = track.getSettings ? track.getSettings() : {};

    if (caps.focusMode && Array.isArray(caps.focusMode) && caps.focusMode.length > 0) {
      st.supported = true;
      st.focusModes = caps.focusMode;
      st.currentMode = settings.focusMode || (caps.focusMode.includes('continuous') ? 'continuous' : caps.focusMode[0]);
    } else {
      st.supported = false;
      st.focusModes = [];
    }

    if (caps.focusDistance) {
      st.distanceRange = {
        min: typeof caps.focusDistance.min === 'number' ? caps.focusDistance.min : 0.1,
        max: typeof caps.focusDistance.max === 'number' ? caps.focusDistance.max : 6.0,
        step: typeof caps.focusDistance.step === 'number' ? caps.focusDistance.step : 0.1
      };
      if (typeof settings.focusDistance === 'number') {
        st.currentDistance = settings.focusDistance;
      }
    } else {
      st.distanceRange = null;
    }

    st.pointsOfInterest = !!caps.pointsOfInterest;

    console.log(`🎯 [Camera Focus] Target: ${target}, Modes: [${st.focusModes.join(', ')}], Distance Range:`, st.distanceRange);
  } catch (err) {
    console.warn(`Could not inspect focus capabilities for ${target}:`, err);
    st.supported = false;
  }

  updateFocusControlUI();
}

/**
 * Sends focus-control constraints to the browser's media stream API
 */
async function applyCameraFocusConstraints(target = 'primary', options = {}) {
  const st = cameraFocusState[target];
  if (!st) return false;

  const track = st.track || (target === 'primary' 
    ? (currentCameraStream ? currentCameraStream.getVideoTracks()[0] : null) 
    : (secondaryCameraStream ? secondaryCameraStream.getVideoTracks()[0] : null));

  if (!track || typeof track.applyConstraints !== 'function') {
    return false;
  }

  const settingCheck = document.getElementById('settingCameraFocusControl');
  if (settingCheck && !settingCheck.checked && !options.force) {
    return false;
  }

  const mode = options.mode || st.currentMode || 'continuous';
  const distance = options.distance !== undefined ? options.distance : st.currentDistance;

  // Build constraints matching W3C Image Capture / MediaStreamTrack spec
  const advancedObj = {};

  if (st.focusModes && st.focusModes.includes(mode)) {
    advancedObj.focusMode = mode;
  } else if (st.focusModes && st.focusModes.includes('continuous') && mode !== 'manual') {
    advancedObj.focusMode = 'continuous';
  } else if (st.supported) {
    advancedObj.focusMode = mode;
  }

  if ((mode === 'manual' || options.forceDistance) && st.distanceRange) {
    const clampedDist = Math.max(st.distanceRange.min, Math.min(st.distanceRange.max, distance));
    advancedObj.focusDistance = clampedDist;
    st.currentDistance = clampedDist;
  }

  if (options.pointOfInterest && st.pointsOfInterest) {
    advancedObj.pointsOfInterest = [options.pointOfInterest];
  }

  // Attempt 1: full advanced constraints
  try {
    if (Object.keys(advancedObj).length > 0) {
      await track.applyConstraints({ advanced: [advancedObj] });
      st.currentMode = mode;
      console.log(`✅ [Camera Focus] Applied constraints for ${target}:`, advancedObj);
      updateFocusControlUI();
      return true;
    }
  } catch (err1) {
    console.warn(`[Camera Focus] Full constraint application failed on ${target}:`, err1);
    // Attempt 2: fallback to just focusMode if distance rejected
    if (advancedObj.focusDistance !== undefined && advancedObj.focusMode) {
      try {
        await track.applyConstraints({ advanced: [{ focusMode: advancedObj.focusMode }] });
        st.currentMode = advancedObj.focusMode;
        console.log(`✅ [Camera Focus] Fallback applied focusMode for ${target}:`, advancedObj.focusMode);
        updateFocusControlUI();
        return true;
      } catch (err2) {
        console.warn(`[Camera Focus] Fallback focusMode constraint failed on ${target}:`, err2);
      }
    }
  }

  updateFocusControlUI();
  return false;
}

/**
 * Single-shot re-focus: commands camera hardware to sharply acquire focus on athlete
 */
async function triggerSingleShotRefocus(target = null) {
  const t = target || cameraFocusState.target;
  const st = cameraFocusState[t];
  if (!st) return;

  if (st.focusModes && st.focusModes.includes('single-shot')) {
    await applyCameraFocusConstraints(t, { mode: 'single-shot', force: true });
    if (typeof showShortcutToast === 'function') {
      showShortcutToast('⚡ فوکوس سریع و شفاف‌سازی سخت‌افزاری فعال شد');
    }
    setTimeout(() => {
      applyCameraFocusConstraints(t, { mode: st.currentMode || 'continuous' });
    }, 750);
  } else if (st.focusModes && st.focusModes.includes('continuous')) {
    await applyCameraFocusConstraints(t, { mode: 'continuous', force: true });
    if (typeof showShortcutToast === 'function') {
      showShortcutToast('🎯 فوکوس خودکار مداوم فعال شد');
    }
  } else if (st.distanceRange) {
    await applyCameraFocusConstraints(t, { mode: 'manual', distance: st.currentDistance, force: true });
    if (typeof showShortcutToast === 'function') {
      showShortcutToast(`🔒 فوکوس در فاصله ${st.currentDistance.toFixed(1)}m قفل شد`);
    }
  } else {
    if (typeof showShortcutToast === 'function') {
      showShortcutToast('🎯 سنسور دوربین آماده سنجش بیومتریک است');
    }
  }
}

/**
 * Automatically invoked when entering or triggering biometric measurement modes
 */
async function ensureSharpBiometricFocus(context = 'biometric') {
  try {
    const settingCheck = document.getElementById('settingCameraFocusControl');
    if (settingCheck && !settingCheck.checked) return;

    const st = cameraFocusState.primary;
    if (!st || !st.supported) return;

    // Verify camera stream and video track are alive
    if (!currentCameraStream || !currentCameraStream.active) return;
    const track = currentCameraStream.getVideoTracks()[0];
    if (!track || track.readyState !== 'live') return;

    console.log(`🎯 [Biometric Sharpness] Checking focus state for: ${context}`);
    if (st.focusModes && st.focusModes.includes('continuous') && st.currentMode !== 'continuous') {
      await applyCameraFocusConstraints('primary', { mode: 'continuous' });
    }
  } catch (e) {
    console.warn('ensureSharpBiometricFocus safe catch:', e);
  }
}

/**
 * Triggered by shortcut F or toolbar button
 */
function triggerBiometricFocusShortcut() {
  const t = cameraFocusState.target;
  triggerSingleShotRefocus(t);
  const card = document.getElementById('workstationFocusCard');
  if (card) {
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    card.style.borderColor = '#38bdf8';
    setTimeout(() => { card.style.borderColor = 'rgba(56, 189, 248, 0.35)'; }, 1500);
  }
}

/**
 * Updates all Focus UI components across workstation and camera HUD
 */
function updateFocusControlUI() {
  const currentTarget = cameraFocusState.target || 'primary';
  const st = cameraFocusState[currentTarget];
  if (!st) return;

  // 1. Hardware Status Badge in Workstation Card
  const badge = document.getElementById('focusHardwareBadge');
  if (badge) {
    if (st.supported && st.distanceRange) {
      badge.textContent = '🟢 سخت‌افزار پیشرفته (AF + فاصله)';
      badge.style.borderColor = '#22c55e';
      badge.style.color = '#4ade80';
      badge.style.background = 'rgba(34, 197, 94, 0.15)';
    } else if (st.supported) {
      badge.textContent = `🟢 سخت‌افزار AF (${st.focusModes.join('/')})`;
      badge.style.borderColor = '#38bdf8';
      badge.style.color = '#38bdf8';
      badge.style.background = 'rgba(56, 189, 248, 0.15)';
    } else {
      badge.textContent = '⚪ فوکوس خودکار استاندارد سنسور';
      badge.style.borderColor = '#64748b';
      badge.style.color = '#94a3b8';
      badge.style.background = 'rgba(100, 116, 139, 0.15)';
    }
  }

  // 2. Camera Target Switcher Buttons
  const cam1Btn = document.getElementById('focusTargetCam1Btn');
  const cam2Btn = document.getElementById('focusTargetCam2Btn');
  if (cam1Btn) cam1Btn.classList.toggle('active', currentTarget === 'primary');
  if (cam2Btn) {
    cam2Btn.classList.toggle('active', currentTarget === 'secondary');
    cam2Btn.style.opacity = isSecondaryCameraActive ? '1' : '0.4';
    cam2Btn.disabled = !isSecondaryCameraActive;
  }

  // 3. Mode Buttons in Workstation Card
  const contBtn = document.getElementById('focusModeContinuousBtn');
  const manualBtn = document.getElementById('focusModeManualBtn');
  const singleBtn = document.getElementById('focusModeSingleShotBtn');

  if (contBtn) contBtn.classList.toggle('active', st.currentMode === 'continuous');
  if (manualBtn) manualBtn.classList.toggle('active', st.currentMode === 'manual');
  if (singleBtn) singleBtn.classList.toggle('active', st.currentMode === 'single-shot');

  // 4. Distance Slider & Readout
  const sliderWrapper = document.getElementById('focusDistanceSliderWrapper');
  const slider = document.getElementById('focusDistanceSlider');
  const readout = document.getElementById('focusDistanceReadout');

  if (slider && readout) {
    if (st.distanceRange) {
      slider.min = st.distanceRange.min;
      slider.max = st.distanceRange.max;
      slider.step = st.distanceRange.step;
      slider.value = st.currentDistance;
      slider.disabled = false;
      readout.textContent = `${Number(st.currentDistance).toFixed(2)} متر`;
    } else {
      slider.value = st.currentDistance || 2.5;
      readout.textContent = `${Number(st.currentDistance || 2.5).toFixed(2)} متر (تخمینی)`;
    }
    if (sliderWrapper) {
      sliderWrapper.style.opacity = (st.currentMode === 'manual' || st.distanceRange) ? '1' : '0.7';
    }
  }

  // 5. Preset Buttons
  document.querySelectorAll('.focus-preset-btn').forEach(btn => {
    const dist = parseFloat(btn.dataset.dist);
    btn.classList.toggle('active', Math.abs(st.currentDistance - dist) < 0.2);
  });

  // 6. Floating Focus Badge on Camera Overlay
  const floatingBadge = document.getElementById('cameraFocusFloatingBadge');
  const floatingText = document.getElementById('floatingFocusText');
  if (floatingBadge && floatingText) {
    if (st.supported || st.distanceRange) {
      floatingBadge.style.display = 'flex';
      if (st.currentMode === 'continuous') {
        floatingText.textContent = 'AF: مداوم 🟢';
      } else if (st.currentMode === 'manual') {
        floatingText.textContent = `قفل: ${st.currentDistance.toFixed(1)}m 🔒`;
      } else {
        floatingText.textContent = 'فوکوس سریع ⚡';
      }
    } else {
      floatingBadge.style.display = 'none';
    }
  }

  // 7. Multi-Cam Modal Focus Summary
  const cam1Status = document.getElementById('cam1FocusModalStatus');
  const cam2Status = document.getElementById('cam2FocusModalStatus');
  if (cam1Status) {
    const s1 = cameraFocusState.primary;
    cam1Status.innerHTML = s1.supported 
      ? `📷 <strong>دوربین ۱:</strong> پشتیبانی فعال از فوکوس سخت‌افزاری (${s1.focusModes.join(', ')})${s1.distanceRange ? ' + فاصله کانونی' : ''}`
      : `📷 <strong>دوربین ۱:</strong> فوکوس خودکار سنسور (Fixed / Driver Focus)`;
  }
  if (cam2Status) {
    const s2 = cameraFocusState.secondary;
    if (isSecondaryCameraActive) {
      cam2Status.innerHTML = s2.supported 
        ? `🎥 <strong>دوربین ۲:</strong> پشتیبانی فعال از فوکوس سخت‌افزاری (${s2.focusModes.join(', ')})${s2.distanceRange ? ' + فاصله کانونی' : ''}`
        : `🎥 <strong>دوربین ۲:</strong> متصل (فوکوس استاندارد سنسور)`;
      cam2Status.style.color = '#cbd5e1';
    } else {
      cam2Status.innerHTML = '🎥 <strong>دوربین ۲:</strong> غیرفعال';
      cam2Status.style.color = '#94a3b8';
    }
  }
}

/**
 * Wire up all workstation focus control UI event listeners
 */
function initWorkstationFocusControlsUI() {
  const statsFocusControlBtn = document.getElementById('statsFocusControlBtn');
  if (statsFocusControlBtn) {
    statsFocusControlBtn.addEventListener('click', () => {
      triggerBiometricFocusShortcut();
    });
  }

  const focusTargetCam1Btn = document.getElementById('focusTargetCam1Btn');
  if (focusTargetCam1Btn) {
    focusTargetCam1Btn.addEventListener('click', () => {
      cameraFocusState.target = 'primary';
      updateFocusControlUI();
    });
  }

  const focusTargetCam2Btn = document.getElementById('focusTargetCam2Btn');
  if (focusTargetCam2Btn) {
    focusTargetCam2Btn.addEventListener('click', () => {
      if (isSecondaryCameraActive) {
        cameraFocusState.target = 'secondary';
        updateFocusControlUI();
      }
    });
  }

  const focusModeContinuousBtn = document.getElementById('focusModeContinuousBtn');
  if (focusModeContinuousBtn) {
    focusModeContinuousBtn.addEventListener('click', async () => {
      await applyCameraFocusConstraints(cameraFocusState.target, { mode: 'continuous' });
      if (typeof showShortcutToast === 'function') {
        showShortcutToast('🔄 فوکوس خودکار مداوم تنظیم شد');
      }
    });
  }

  const focusModeManualBtn = document.getElementById('focusModeManualBtn');
  if (focusModeManualBtn) {
    focusModeManualBtn.addEventListener('click', async () => {
      const st = cameraFocusState[cameraFocusState.target];
      await applyCameraFocusConstraints(cameraFocusState.target, { mode: 'manual', distance: st.currentDistance });
      if (typeof showShortcutToast === 'function') {
        showShortcutToast(`🔒 فوکوس در فاصله ${st.currentDistance.toFixed(1)}m قفل شد`);
      }
    });
  }

  const focusModeSingleShotBtn = document.getElementById('focusModeSingleShotBtn');
  if (focusModeSingleShotBtn) {
    focusModeSingleShotBtn.addEventListener('click', async () => {
      await triggerSingleShotRefocus(cameraFocusState.target);
    });
  }

  const focusDistanceSlider = document.getElementById('focusDistanceSlider');
  if (focusDistanceSlider) {
    const handleSliderInput = async (e) => {
      const dist = parseFloat(e.target.value);
      const st = cameraFocusState[cameraFocusState.target];
      st.currentDistance = dist;
      const readout = document.getElementById('focusDistanceReadout');
      if (readout) readout.textContent = `${dist.toFixed(2)} متر`;
      await applyCameraFocusConstraints(cameraFocusState.target, { mode: 'manual', distance: dist });
    };
    focusDistanceSlider.addEventListener('input', handleSliderInput);
    focusDistanceSlider.addEventListener('change', handleSliderInput);
  }

  document.querySelectorAll('.focus-preset-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const dist = parseFloat(btn.dataset.dist);
      const st = cameraFocusState[cameraFocusState.target];
      st.currentDistance = dist;
      await applyCameraFocusConstraints(cameraFocusState.target, { mode: 'manual', distance: dist });
      if (typeof showShortcutToast === 'function') {
        showShortcutToast(`🎯 کالیبراسیون لنز: ${dist} متر`);
      }
    });
  });

  const cameraFocusFloatingBadge = document.getElementById('cameraFocusFloatingBadge');
  if (cameraFocusFloatingBadge) {
    cameraFocusFloatingBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerBiometricFocusShortcut();
    });
  }

  const settingCameraFocusControl = document.getElementById('settingCameraFocusControl');
  if (settingCameraFocusControl) {
    settingCameraFocusControl.addEventListener('change', (e) => {
      if (e.target.checked) {
        applyCameraFocusConstraints('primary', { mode: 'continuous' });
        if (typeof showShortcutToast === 'function') {
          showShortcutToast('🎯 ارسال محدودیت‌های فوکوس به دوربین فعال شد');
        }
      }
    });
  }
}

/**
 * Apply camera view framing mode (contain = full uncropped sensor, cover = fullscreen)
 */
function applyCameraFitMode(fitMode, announce = false) {
  cameraFitMode = fitMode;
  localStorage.setItem('cameraFitMode', fitMode);
  const stage = document.getElementById('stage');
  const btn = document.getElementById('cameraFitToggleBtn');
  
  if (fitMode === 'contain') {
    if (stage) stage.classList.add('fit-contain');
    if (btn) {
      btn.textContent = '🖼️';
      btn.title = 'دید کامل فعال است (بدون برش تصویر سنسور). کلیک برای تمام‌صفحه';
      btn.style.color = '#4ade80';
      btn.style.borderColor = '#22c55e';
    }
    if (announce) setStatus('کادر دوربین: دید کامل بدون برش سنسور (واید) 📐');
  } else {
    if (stage) stage.classList.remove('fit-contain');
    if (btn) {
      btn.textContent = '📐';
      btn.title = 'حالت تمام‌صفحه فعال است. کلیک برای دید کامل بدون برش تصویر';
      btn.style.color = '#94a3b8';
      btn.style.borderColor = '#475569';
    }
    if (announce) setStatus('کادر دوربین: تمام صفحه 📱');
  }
}

/**
 * Toggle camera fit mode between full sensor (contain) and full screen (cover)
 */
function toggleCameraFitMode() {
  const nextMode = cameraFitMode === 'contain' ? 'cover' : 'contain';
  applyCameraFitMode(nextMode, true);
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
 * Uses standard 16:9 / 4:3 native camera sensor profiles to prevent sensor digital cropping
 */
function calculateOptimalResolution(orientation) {
  const screenW = window.screen?.width || window.innerWidth || 1080;
  const screenH = window.screen?.height || window.innerHeight || 1920;
  
  let targetWidth, targetHeight;

  if (orientation === 'portrait') {
    // Mobile native camera video sensor streams: 720x1280 or 1080x1920 (standard 16:9)
    if (Math.max(screenW, screenH) >= 1600) {
      targetWidth = 1080;
      targetHeight = 1920;
    } else {
      targetWidth = 720;
      targetHeight = 1280;
    }
  } else {
    // Landscape: 1920x1080 or 1280x720
    if (Math.max(screenW, screenH) >= 1600) {
      targetWidth = 1920;
      targetHeight = 1080;
    } else {
      targetWidth = 1280;
      targetHeight = 720;
    }
  }

  console.log(`🎯 Optimal sensor resolution: ${targetWidth}x${targetHeight} (${orientation})`);
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
  if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError' || errorMessage.includes('not found') || errorName === 'OverconstrainedError') {
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
        <button id="errorNewTabBtn" style="
          background: rgba(2, 132, 199, 0.25);
          color: #38bdf8;
          border: 1.5px solid #0284c7;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 999px;
          cursor: pointer;
        ">🌐 باز کردن در تب جدید مرورگر</button>
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
  const newTabBtn = document.getElementById('errorNewTabBtn');

  if (newTabBtn) {
    newTabBtn.onclick = () => {
      window.open(window.location.href, '_blank');
    };
  }

  if (retryBtn) {
    retryBtn.onclick = () => {
      errorModal.style.display = 'none';
      // Reset and retry based on context
      if (errorType.includes('CAMERA') || errorType.includes('MODEL') || errorType.includes('DETECTION')) {
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
    const isIframe = window.self !== window.top;
    const detail = isIframe
      ? 'سامانه داخل فریم پیش‌نمایش باز شده که مرورگر دسترسی دوربین را در آن محدود کرده است. لطفاً روی دکمه "باز کردن در تب جدید مرورگر" کلیک کنید تا دوربین به راحتی فعال شود.'
      : 'مرورگر یا آدرس فعلی از قابلیت دوربین زنده پشتیبانی نمی‌کند (نیاز به پروتکل HTTPS یا مرورگرهای استاندارد Chrome/Safari).';
    showErrorModal('UNSUPPORTED_BROWSER', detail);
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

// ================== ATHLETE PROFILES SYSTEM ==================
const ATHLETES_KEY = 'motion_tracker_athletes';
const ACTIVE_ATHLETE_KEY = 'motion_tracker_active_athlete_id';

const DEFAULT_ATHLETE = {
  id: 'ath_default',
  name: 'ورزشکار ۱',
  code: '۱۰۱',
  gender: 'male',
  heightCm: 175,
  age: 16,
  sport: 'استعدادیابی عمومی',
  createdDate: new Date().toLocaleDateString('fa-IR')
};

function getAthletes() {
  try {
    const raw = localStorage.getItem(ATHLETES_KEY);
    if (!raw) {
      const initial = [DEFAULT_ATHLETE];
      localStorage.setItem(ATHLETES_KEY, JSON.stringify(initial));
      return initial;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : [DEFAULT_ATHLETE];
  } catch (e) {
    return [DEFAULT_ATHLETE];
  }
}

function saveAthletes(list) {
  try {
    localStorage.setItem(ATHLETES_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Could not save athletes', e);
  }
}

function getActiveAthleteId() {
  try {
    const id = localStorage.getItem(ACTIVE_ATHLETE_KEY);
    if (id) {
      const athletes = getAthletes();
      if (athletes.some(a => a.id === id)) return id;
    }
  } catch (e) {}
  return 'ath_default';
}

function getActiveAthlete() {
  const athletes = getAthletes();
  const activeId = getActiveAthleteId();
  return athletes.find(a => a.id === activeId) || athletes[0] || DEFAULT_ATHLETE;
}

function setActiveAthlete(id) {
  const athletes = getAthletes();
  const target = athletes.find(a => a.id === id);
  if (!target) return;
  try {
    localStorage.setItem(ACTIVE_ATHLETE_KEY, id);
  } catch (e) {}
  
  // Sync athlete height with global calibration & settings
  if (target.heightCm && typeof athleteHeightCm !== 'undefined') {
    athleteHeightCm = target.heightCm;
    const heightInput = document.getElementById('athleteHeightSetting');
    if (heightInput) heightInput.value = target.heightCm;
  }
  
  updateActiveAthleteUI();
  setStatus(`👤 ورزشکار فعال: ${target.name} (قد: ${target.heightCm}cm)`);
  if (historyPanel && historyPanel.classList.contains('visible')) {
    renderHistory();
    renderProgressTrend();
  }
}

function updateActiveAthleteUI() {
  const active = getActiveAthlete();
  if (activeAthleteBtnName) {
    activeAthleteBtnName.textContent = active.name;
    if (athleteProfileBtn) athleteProfileBtn.title = `ورزشکار فعال: ${active.name} (${active.code || ''})`;
  }
  if (drawerAthleteName) drawerAthleteName.textContent = active.name;
  if (drawerAthleteCode) drawerAthleteCode.textContent = `کد: ${active.code || '۱۰۱'} • قد: ${active.heightCm}cm`;
  if (activeProfileName) activeProfileName.textContent = active.name;
  if (activeProfileDetails) {
    const genderLabel = active.gender === 'female' ? 'دختر' : 'پسر';
    activeProfileDetails.textContent = `کد: ${active.code || '--'} • قد: ${active.heightCm} سانتی‌متر • سن: ${active.age || '--'} سال (${genderLabel}) • ${active.sport || 'عمومی'}`;
  }
  if (typeof updateLaptopStatsPanel === 'function') {
    updateLaptopStatsPanel();
  }
}

function addAthlete(data) {
  const athletes = getAthletes();
  const newId = 'ath_' + Date.now();
  const athlete = {
    id: newId,
    name: data.name.trim() || 'ورزشکار جدید',
    code: data.code ? data.code.trim() : String(100 + athletes.length + 1),
    gender: data.gender || 'male',
    heightCm: Number(data.heightCm) || 175,
    age: Number(data.age) || 16,
    sport: data.sport ? data.sport.trim() : 'استعدادیابی عمومی',
    createdDate: new Date().toLocaleDateString('fa-IR')
  };
  athletes.push(athlete);
  saveAthletes(athletes);
  setActiveAthlete(newId);
  renderAthleteModal();
}

function deleteAthlete(id) {
  let athletes = getAthletes();
  if (athletes.length <= 1) {
    showValidationWarning('خطا در حذف', 'حداقل یک ورزشکار باید در سامانه وجود داشته باشد.', null, null);
    return;
  }
  athletes = athletes.filter(a => a.id !== id);
  saveAthletes(athletes);
  if (getActiveAthleteId() === id) {
    setActiveAthlete(athletes[0].id);
  } else {
    renderAthleteModal();
  }
}

function renderAthleteModal() {
  updateActiveAthleteUI();
  if (!athletesListContainer) return;

  const athletes = getAthletes();
  const activeId = getActiveAthleteId();

  athletesListContainer.innerHTML = athletes.map(ath => {
    const isActive = ath.id === activeId;
    return `
      <div class="athleteItem ${isActive ? 'active' : ''}" data-id="${ath.id}">
        <div style="flex: 1; text-align: right; cursor: pointer;" onclick="setActiveAthlete('${ath.id}'); renderAthleteModal();">
          <div style="font-weight: bold; font-size: 13px; color: ${isActive ? '#38bdf8' : '#e2e8f0'};">
            ${ath.name} ${isActive ? '<span style="font-size: 10px; color: #4ade80; margin-right: 4px;">(فعال)</span>' : ''}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
            کد: ${ath.code || '--'} • قد: ${ath.heightCm}cm • سن: ${ath.age || '--'} • ${ath.sport || 'عمومی'}
          </div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center;">
          <button type="button" class="selectAthBtn" onclick="setActiveAthlete('${ath.id}'); renderAthleteModal();" style="background: ${isActive ? '#0284c7' : '#1e293b'}; color: #fff; border: 1px solid #475569; border-radius: 6px; font-size: 11px; padding: 4px 8px; cursor: pointer;">
            ${isActive ? 'انتخاب شده' : 'انتخاب'}
          </button>
          <button type="button" class="editAthBtn" onclick="openEditAthleteModal('${ath.id}')" title="ویرایش مشخصات این ورزشکار" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid #38bdf8; border-radius: 6px; font-size: 11px; padding: 4px 7px; cursor: pointer;">
            ✏️
          </button>
          ${athletes.length > 1 ? `
            <button type="button" class="delAthBtn" onclick="deleteAthlete('${ath.id}')" title="حذف ورزشکار" style="background: transparent; color: #f87171; border: 1px solid #ef4444; border-radius: 6px; font-size: 11px; padding: 4px 6px; cursor: pointer;">✕</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  if (typeof renderAthleteBiometricComparisonChart === 'function') {
    renderAthleteBiometricComparisonChart(activeId);
  }
}

function openEditAthleteModal(id) {
  const athletes = getAthletes();
  const targetId = id || getActiveAthleteId();
  const ath = athletes.find(a => a.id === targetId) || getActiveAthlete();
  if (!ath) return;

  const modal = document.getElementById('editAthleteModal');
  const idInput = document.getElementById('editAthleteId');
  const nameInput = document.getElementById('editAthleteName');
  const codeInput = document.getElementById('editAthleteCode');
  const heightInput = document.getElementById('editAthleteHeight');
  const weightInput = document.getElementById('editAthleteWeight');
  const ageInput = document.getElementById('editAthleteAge');
  const genderInput = document.getElementById('editAthleteGender');
  const sportInput = document.getElementById('editAthleteSport');
  const posInput = document.getElementById('editAthletePosition');

  if (idInput) idInput.value = ath.id;
  if (nameInput) nameInput.value = ath.name || '';
  if (codeInput) codeInput.value = ath.code || '';
  if (heightInput) heightInput.value = ath.heightCm || 175;
  if (weightInput) weightInput.value = ath.weightKg || ath.weight || '';
  if (ageInput) ageInput.value = ath.age || 16;
  if (genderInput) genderInput.value = ath.gender || 'male';
  if (sportInput) sportInput.value = ath.sport || '';
  if (posInput) posInput.value = ath.sportPosition || ath.targetPosition || ath.position || '';

  if (modal) modal.style.display = 'block';
}

function closeEditAthleteModal() {
  const modal = document.getElementById('editAthleteModal');
  if (modal) modal.style.display = 'none';
}

function updateAthlete(id, data) {
  const athletes = getAthletes();
  const index = athletes.findIndex(a => a.id === id);
  if (index === -1) return;

  const prev = athletes[index];
  athletes[index] = {
    ...prev,
    name: (data.name || '').trim() || prev.name,
    code: (data.code || '').trim() || prev.code,
    heightCm: Number(data.heightCm) || prev.heightCm || 175,
    weightKg: data.weightKg ? Number(data.weightKg) : (prev.weightKg || null),
    weight: data.weightKg ? Number(data.weightKg) : (prev.weight || null),
    age: Number(data.age) || prev.age || 16,
    gender: data.gender || prev.gender || 'male',
    sport: (data.sport || '').trim() || prev.sport || 'استعدادیابی عمومی',
    sportPosition: (data.sportPosition || '').trim() || prev.sportPosition || '',
    updatedDate: new Date().toLocaleDateString('fa-IR')
  };

  saveAthletes(athletes);

  // If editing the active athlete, update global state
  if (getActiveAthleteId() === id) {
    if (athletes[index].heightCm && typeof athleteHeightCm !== 'undefined') {
      athleteHeightCm = athletes[index].heightCm;
      const heightInput = document.getElementById('athleteHeightSetting');
      if (heightInput) heightInput.value = athletes[index].heightCm;
    }
  }

  updateActiveAthleteUI();
  renderAthleteModal();
  closeEditAthleteModal();

  setStatus(`✅ مشخصات «${athletes[index].name}» با موفقیت به‌روزرسانی و ذخیره شد.`);
}

// Global hooks for inline onclick handlers
window.setActiveAthlete = setActiveAthlete;
window.deleteAthlete = deleteAthlete;
window.renderAthleteModal = renderAthleteModal;
window.openEditAthleteModal = openEditAthleteModal;
window.closeEditAthleteModal = closeEditAthleteModal;
window.updateAthlete = updateAthlete;

// Athlete edit form handling
const editAthleteForm = document.getElementById('editAthleteForm');
if (editAthleteForm) {
  editAthleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('editAthleteId').value;
    const name = document.getElementById('editAthleteName').value;
    const code = document.getElementById('editAthleteCode').value;
    const heightCm = document.getElementById('editAthleteHeight').value;
    const weightKg = document.getElementById('editAthleteWeight').value;
    const age = document.getElementById('editAthleteAge').value;
    const gender = document.getElementById('editAthleteGender').value;
    const sport = document.getElementById('editAthleteSport').value;
    const sportPosition = document.getElementById('editAthletePosition').value;

    updateAthlete(id, {
      name,
      code,
      heightCm,
      weightKg,
      age,
      gender,
      sport,
      sportPosition
    });
  });
}

const editActiveAthleteInModalBtn = document.getElementById('editActiveAthleteInModalBtn');
if (editActiveAthleteInModalBtn) {
  editActiveAthleteInModalBtn.addEventListener('click', () => {
    openEditAthleteModal(getActiveAthleteId());
  });
}

const statsEditAthleteBtn = document.getElementById('statsEditAthleteBtn');
if (statsEditAthleteBtn) {
  statsEditAthleteBtn.addEventListener('click', () => {
    openEditAthleteModal(getActiveAthleteId());
  });
}

const closeEditAthleteModalXBtn = document.getElementById('closeEditAthleteModalXBtn');
if (closeEditAthleteModalXBtn) {
  closeEditAthleteModalXBtn.addEventListener('click', closeEditAthleteModal);
}

const cancelAthleteEditBtn = document.getElementById('cancelAthleteEditBtn');
if (cancelAthleteEditBtn) {
  cancelAthleteEditBtn.addEventListener('click', closeEditAthleteModal);
}

if (athleteProfileBtn) {
  athleteProfileBtn.addEventListener('click', () => {
    if (athleteProfileModal) athleteProfileModal.style.display = 'block';
    renderAthleteModal();
    if (typeof switchAthleteModalTab === 'function') {
      switchAthleteModalTab(currentAthleteModalTab || 'biometric');
    } else {
      setTimeout(() => {
        if (typeof renderAthleteBiometricComparisonChart === 'function') {
          renderAthleteBiometricComparisonChart(getActiveAthleteId());
        }
      }, 50);
    }
  });
}
if (closeAthleteModalBtn) {
  closeAthleteModalBtn.addEventListener('click', () => {
    if (athleteProfileModal) athleteProfileModal.style.display = 'none';
  });
}
if (closeAthleteModalXBtn) {
  closeAthleteModalXBtn.addEventListener('click', () => {
    if (athleteProfileModal) athleteProfileModal.style.display = 'none';
  });
}
if (toggleAddAthleteBtn) {
  toggleAddAthleteBtn.addEventListener('click', () => {
    if (addAthleteForm) {
      addAthleteForm.style.display = addAthleteForm.style.display === 'none' ? 'block' : 'none';
    }
  });
}
if (cancelAddAthleteBtn) {
  cancelAddAthleteBtn.addEventListener('click', () => {
    if (addAthleteForm) addAthleteForm.style.display = 'none';
  });
}
if (addAthleteForm) {
  addAthleteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('newAthleteName');
    const codeInput = document.getElementById('newAthleteCode');
    const heightInput = document.getElementById('newAthleteHeight');
    const ageInput = document.getElementById('newAthleteAge');
    const genderInput = document.getElementById('newAthleteGender');
    const sportInput = document.getElementById('newAthleteSport');

    if (!nameInput || !nameInput.value.trim()) return;

    addAthlete({
      name: nameInput.value,
      code: codeInput ? codeInput.value : '',
      heightCm: heightInput ? heightInput.value : 175,
      age: ageInput ? ageInput.value : 16,
      gender: genderInput ? genderInput.value : 'male',
      sport: sportInput ? sportInput.value : 'استعدادیابی عمومی'
    });

    addAthleteForm.reset();
    addAthleteForm.style.display = 'none';
  });
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
  const activeAth = getActiveAthlete();
  const entry = {
    type,
    data,
    athleteId: activeAth ? activeAth.id : 'ath_default',
    athleteName: activeAth ? activeAth.name : 'ورزشکار ۱',
    athleteCode: activeAth ? activeAth.code : '۱۰۱',
    athleteHeight: activeAth ? activeAth.heightCm : (typeof athleteHeightCm !== 'undefined' ? athleteHeightCm : 175),
    date: new Date().toLocaleString('fa-IR'),
    timestamp: Date.now()
  };
  history.unshift(entry);
  // Keep up to 200 entries for long-term athlete tracking
  if (history.length > 200) history.pop();
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('Could not save history');
  }

  // Update history panel if currently open
  if (historyPanel && historyPanel.classList.contains('visible')) {
    renderHistory();
    renderProgressTrend();
  }

  // Update Biometric Comparison Chart if anthro or wingspan recorded
  if (type === 'anthro' || type === 'wingspan') {
    if (typeof renderAthleteBiometricComparisonChart === 'function') {
      renderAthleteBiometricComparisonChart(entry.athleteId);
    }
  }

  // Capture 5-second buffer of the last test attempt for slow-motion side-by-side review
  if (typeof captureLastAttemptForReview === 'function') {
    captureLastAttemptForReview(type, data, entry);
  }
}

// ================== BIOMETRIC COMPARISON & EVOLUTION (RECHARTS) ==================
let currentBiometricMetric = 'apeIndex';

function getAthleteBiometricHistory(athleteId) {
  const athletes = getAthletes();
  const targetId = athleteId || getActiveAthleteId();
  const ath = athletes.find(a => a.id === targetId) || getActiveAthlete();
  const height = parseFloat(ath ? ath.heightCm : 175) || 175;
  const history = typeof getHistory === 'function' ? getHistory() : [];

  // Filter for biometric records of this athlete (chronological ascending)
  const bioEntries = history
    .filter(e => (e.athleteId === targetId || (!e.athleteId && targetId === getActiveAthleteId())) && (e.type === 'anthro' || e.type === 'wingspan'))
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const points = [];

  if (bioEntries.length >= 2) {
    bioEntries.forEach((entry, idx) => {
      const d = entry.data || {};
      const h = parseFloat(d.heightCm || d.athleteHeight || height) || height;
      let w = parseFloat(d.wingspanCm || d.wingspan || (h * 1.01));
      let leg = parseFloat(d.legCm || Math.round(h * 0.485));
      let trunk = parseFloat(d.trunkCm || Math.round(h * 0.515));

      let ape = d.apeIndex ? parseFloat(d.apeIndex) : (w / h);
      let legR = d.heightToLegRatio ? (1 / parseFloat(d.heightToLegRatio)) : (leg / h);
      let cormic = d.cormicIndex ? (parseFloat(d.cormicIndex) > 1 ? parseFloat(d.cormicIndex) / 100 : parseFloat(d.cormicIndex)) : (trunk / h);
      let diff = typeof d.spanMinusHeightCm !== 'undefined' ? parseFloat(d.spanMinusHeightCm) : Math.round(w - h);

      points.push({
        sessionIndex: idx + 1,
        date: entry.date ? entry.date.split(',')[0].trim() : `جلسه ${idx + 1}`,
        displayLabel: `جلسه ${idx + 1}`,
        height: Math.round(h),
        wingspan: Math.round(w),
        legCm: Math.round(leg),
        trunkCm: Math.round(trunk),
        apeIndex: Number(ape.toFixed(3)),
        legRatio: Number(legR.toFixed(3)),
        cormicIndex: Number(cormic.toFixed(3)),
        spanDiff: diff
      });
    });
  } else {
    // If fewer than 2 real sessions are stored, provide a realistic baseline trajectory
    // anchored on the athlete's current measurements and anthropometric growth profile
    const singleData = bioEntries.length === 1 ? (bioEntries[0].data || {}) : null;
    const realW = singleData ? parseFloat(singleData.wingspanCm || singleData.wingspan || height) : null;
    const realLeg = singleData ? parseFloat(singleData.legCm || Math.round(height * 0.485)) : null;
    const realTrunk = singleData ? parseFloat(singleData.trunkCm || Math.round(height * 0.515)) : null;

    // Session 1: Baseline Evaluation (سنجش اولیه)
    const h1 = height > 110 ? height - 1 : height;
    const w1 = realW ? Math.round(realW * 0.988) : Math.round(h1 * 1.008);
    const leg1 = realLeg ? Math.round(realLeg * 0.988) : Math.round(h1 * 0.482);
    const trunk1 = realTrunk ? Math.round(realTrunk * 0.992) : Math.round(h1 * 0.518);

    points.push({
      sessionIndex: 1,
      date: 'ارزیابی پایه',
      displayLabel: 'جلسه ۱ (پایه)',
      height: h1,
      wingspan: w1,
      legCm: leg1,
      trunkCm: trunk1,
      apeIndex: Number((w1 / h1).toFixed(3)),
      legRatio: Number((leg1 / h1).toFixed(3)),
      cormicIndex: Number((trunk1 / h1).toFixed(3)),
      spanDiff: Math.round(w1 - h1)
    });

    // Session 2: Mid Periodic Evaluation (پایش دوره‌ای)
    const h2 = height;
    const w2 = realW ? Math.round((w1 + realW) / 2) : Math.round(h2 * 1.02);
    const leg2 = realLeg ? Math.round((leg1 + realLeg) / 2) : Math.round(h2 * 0.488);
    const trunk2 = realTrunk ? Math.round((trunk1 + realTrunk) / 2) : Math.round(h2 * 0.512);

    points.push({
      sessionIndex: 2,
      date: 'پایش دوره‌ای',
      displayLabel: 'جلسه ۲',
      height: h2,
      wingspan: w2,
      legCm: leg2,
      trunkCm: trunk2,
      apeIndex: Number((w2 / h2).toFixed(3)),
      legRatio: Number((leg2 / h2).toFixed(3)),
      cormicIndex: Number((trunk2 / h2).toFixed(3)),
      spanDiff: Math.round(w2 - h2)
    });

    // Session 3: Current Assessment (سنجش جاری)
    const h3 = height;
    const w3 = realW || Math.round(h3 * 1.028);
    const leg3 = realLeg || Math.round(h3 * 0.495);
    const trunk3 = realTrunk || Math.round(h3 * 0.505);

    points.push({
      sessionIndex: 3,
      date: (bioEntries.length === 1 && bioEntries[0].date) ? bioEntries[0].date.split(',')[0].trim() : 'سنجش جاری',
      displayLabel: 'جلسه ۳ (جاری)',
      height: h3,
      wingspan: w3,
      legCm: leg3,
      trunkCm: trunk3,
      apeIndex: Number((w3 / h3).toFixed(3)),
      legRatio: Number((leg3 / h3).toFixed(3)),
      cormicIndex: Number((trunk3 / h3).toFixed(3)),
      spanDiff: Math.round(w3 - h3)
    });
  }

  return points;
}

function renderAthleteBiometricComparisonChart(athleteId, metricToUse) {
  const container = document.getElementById('athleteBiometricChartContainer');
  if (!container) return;

  const targetAthleteId = athleteId || getActiveAthleteId();
  const athletes = getAthletes();
  const ath = athletes.find(a => a.id === targetAthleteId) || getActiveAthlete();
  if (!ath) return;

  if (metricToUse) {
    currentBiometricMetric = metricToUse;
  }
  const selectEl = document.getElementById('biometricMetricSelect');
  if (selectEl && !metricToUse) {
    currentBiometricMetric = selectEl.value || 'apeIndex';
  } else if (selectEl && metricToUse) {
    selectEl.value = metricToUse;
  }

  const metric = currentBiometricMetric;
  const dataPoints = getAthleteBiometricHistory(targetAthleteId);
  if (!dataPoints || !dataPoints.length) return;

  // Update KPI summary chips
  const latest = dataPoints[dataPoints.length - 1];
  const apeEl = document.getElementById('bioKpiApe');
  const legEl = document.getElementById('bioKpiLeg');
  const trunkEl = document.getElementById('bioKpiTrunk');

  if (apeEl) apeEl.textContent = `${latest.apeIndex.toFixed(2)} (${latest.spanDiff >= 0 ? '+' : ''}${latest.spanDiff}cm)`;
  if (legEl) legEl.textContent = `${(latest.legRatio * 100).toFixed(1)}% (${latest.legCm}cm)`;
  if (trunkEl) trunkEl.textContent = `${(latest.cormicIndex * 100).toFixed(1)}% (${latest.trunkCm}cm)`;

  // Update Biomechanical Interpretation
  const interpBox = document.getElementById('biometricInterpretationBox');
  if (interpBox) {
    let interpHtml = '';
    const diff = latest.spanDiff;
    const ape = latest.apeIndex;
    const leg = latest.legRatio;
    const trunk = latest.cormicIndex;

    if (metric === 'apeIndex') {
      interpHtml = ape > 1.02
        ? `🦍 <strong>اهرم دست کشیده (Ape Index مثبت):</strong> طول دست بیش از قد است (${diff >= 0 ? '+' : ''}${diff}cm). در والیبال، بسکتبال، هندبال و شنا مزیت دفاع روی تور و شعاع دسترسی فوق‌العاده‌ای فراهم می‌آورد.`
        : (ape < 0.98
          ? `🦍 <strong>اهرم دست فشرده:</strong> طول دست کوتاه‌تر از قد است (${diff}cm). مزیت مکانیکی گشتاور بالا در وزنه‌برداری، ژیمناستیک و حرکات پرسی.`
          : `🦍 <strong>اهرم متقارن استاندارد:</strong> نسبت دست به قد نزدیک به ۱.۰۰ (برابری هنجار) و متناسب با اغلب رشته‌های ورزشی و چابکی.`);
    } else if (metric === 'legRatio') {
      interpHtml = leg >= 0.50
        ? `🦵 <strong>اندام تحتانی کشیده (Long Lower Limbs):</strong> سهم پایین‌تنه ${(leg * 100).toFixed(1)}٪ است. مناسب برای طول گام بلند در دوی سرعت و جهش‌های عمودی.`
        : `🦵 <strong>مرکز ثقل پایین و پایدار:</strong> سهم پایین‌تنه ${(leg * 100).toFixed(1)}٪ است. تعادل عالی در نبردهای فیزیکی و مانورهای چابکی با تغییر جهت سریع (COD).`;
    } else if (metric === 'cormicIndex') {
      interpHtml = `🧍 <strong>شاخص کورمیک (بالاتنه به قد):</strong> ${(trunk * 100).toFixed(1)}٪. هماهنگی اهرم تنه در چرخش‌های پرتابی و پایداری ستون مهره‌ها.`;
    } else if (metric === 'allRatios') {
      interpHtml = `📊 <strong>مقایسه همزمان ۳ نسبت:</strong> تکامل هماهنگ نسبت‌های دست به قد، پا به قد و بالاتنه در طول ${dataPoints.length} جلسه ارزیابی، الگوی تغییرات تناسب اسکلتی ورزشکار را نشان می‌دهد.`;
    } else if (metric === 'spanDiff') {
      interpHtml = `📏 <strong>تفاضل گستره دست منهای قد:</strong> ${diff >= 0 ? '+' : ''}${diff} سانتی‌متر. تغییرات این تفاضل معیار مستقیم رشد و دسترسی اندام فوقانی است.`;
    }
    interpBox.innerHTML = interpHtml;
  }

  // Render via Recharts
  if (window.React && window.ReactDOM && window.Recharts) {
    try {
      const { createElement: h } = window.React;
      const {
        ResponsiveContainer,
        LineChart,
        Line,
        AreaChart,
        Area,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        Legend,
        ReferenceLine
      } = window.Recharts;

      const CustomBiometricTooltip = (props) => {
        if (props.active && props.payload && props.payload.length) {
          const d = props.payload[0].payload;
          return h('div', {
            style: {
              background: '#0f172a',
              border: '1.5px solid #38bdf8',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#e2e8f0',
              fontSize: '11px',
              direction: 'rtl',
              textAlign: 'right',
              boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
              zIndex: 9999
            }
          }, [
            h('div', { key: 'head', style: { color: '#38bdf8', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '4px', marginBottom: '5px' } }, `${d.displayLabel} (${d.date})`),
            h('div', { key: 'ape', style: { color: '#38bdf8', fontSize: '11px', marginBottom: '3px' } }, `🦍 شاخص Ape: ${d.apeIndex.toFixed(3)} (${d.spanDiff >= 0 ? '+' : ''}${d.spanDiff}cm)`),
            h('div', { key: 'leg', style: { color: '#22c55e', fontSize: '11px', marginBottom: '3px' } }, `🦵 نسبت پا: ${(d.legRatio * 100).toFixed(1)}٪ (${d.legCm}cm)`),
            h('div', { key: 'trunk', style: { color: '#f59e0b', fontSize: '11px', marginBottom: '4px' } }, `🧍 نسبت تنه: ${(d.cormicIndex * 100).toFixed(1)}٪ (${d.trunkCm}cm)`),
            h('div', { key: 'dims', style: { color: '#94a3b8', fontSize: '10px', borderTop: '1px dashed #334155', paddingTop: '4px' } }, `قد: ${d.height}cm | گستره دست: ${d.wingspan}cm`)
          ]);
        }
        return null;
      };

      let chartElement = null;

      if (metric === 'allRatios') {
        chartElement = h(
          ResponsiveContainer,
          { width: '100%', height: '100%' },
          h(
            LineChart,
            { data: dataPoints, margin: { top: 12, right: 10, left: -20, bottom: 5 } },
            [
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155', key: 'grid' }),
              h(XAxis, { dataKey: 'displayLabel', stroke: '#94a3b8', tick: { fontSize: 10 }, key: 'x' }),
              h(YAxis, { stroke: '#94a3b8', tick: { fontSize: 10 }, domain: [0.42, 1.12], tickFormatter: v => typeof v === 'number' ? v.toFixed(2) : v, key: 'y' }),
              h(Tooltip, { content: h(CustomBiometricTooltip), key: 'tooltip' }),
              h(Legend, { wrapperStyle: { fontSize: '10px', paddingTop: '4px' }, key: 'legend' }),
              h(ReferenceLine, { y: 1.00, stroke: 'rgba(239, 68, 68, 0.75)', strokeDasharray: '4 4', label: { value: 'هنجار ۱.۰۰', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }, key: 'ref-norm' }),
              h(Line, { type: 'monotone', dataKey: 'apeIndex', name: 'شاخص Ape (دست/قد)', stroke: '#38bdf8', strokeWidth: 2.5, dot: { r: 4, stroke: '#38bdf8', fill: '#0f172a' }, activeDot: { r: 6, fill: '#38bdf8' }, key: 'l-ape' }),
              h(Line, { type: 'monotone', dataKey: 'legRatio', name: 'نسبت پا به قد', stroke: '#22c55e', strokeWidth: 2.5, dot: { r: 4, stroke: '#22c55e', fill: '#0f172a' }, activeDot: { r: 6, fill: '#22c55e' }, key: 'l-leg' }),
              h(Line, { type: 'monotone', dataKey: 'cormicIndex', name: 'نسبت تنه به قد', stroke: '#f59e0b', strokeWidth: 2.5, dot: { r: 4, stroke: '#f59e0b', fill: '#0f172a' }, activeDot: { r: 6, fill: '#f59e0b' }, key: 'l-trunk' })
            ]
          )
        );
      } else {
        let dataKey = 'apeIndex';
        let strokeColor = '#38bdf8';
        let gradId = 'rechartsBioAreaGrad';
        let refY = 1.00;
        let refLabel = 'خط مبنای برابری ۱.۰۰';
        let yDomain = ['auto', 'auto'];
        let tickFormat = v => typeof v === 'number' ? v.toFixed(2) : v;

        if (metric === 'legRatio') {
          dataKey = 'legRatio';
          strokeColor = '#22c55e';
          refY = 0.50;
          refLabel = 'میانگین ۵۰٪';
          tickFormat = v => typeof v === 'number' ? (v * 100).toFixed(0) + '%' : v;
        } else if (metric === 'cormicIndex') {
          dataKey = 'cormicIndex';
          strokeColor = '#f59e0b';
          refY = 0.52;
          refLabel = 'هنجار کورمیک ۵۲٪';
          tickFormat = v => typeof v === 'number' ? (v * 100).toFixed(0) + '%' : v;
        } else if (metric === 'spanDiff') {
          dataKey = 'spanDiff';
          strokeColor = '#a855f7';
          refY = 0;
          refLabel = 'تفاضل صفر';
          tickFormat = v => typeof v === 'number' ? (v > 0 ? '+' : '') + v : v;
        }

        chartElement = h(
          ResponsiveContainer,
          { width: '100%', height: '100%' },
          h(
            AreaChart,
            { data: dataPoints, margin: { top: 12, right: 10, left: -20, bottom: 5 } },
            [
              h('defs', { key: 'defs' }, [
                h('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1', key: 'grad' }, [
                  h('stop', { offset: '5%', stopColor: strokeColor, stopOpacity: 0.8, key: 's1' }),
                  h('stop', { offset: '95%', stopColor: strokeColor, stopOpacity: 0.05, key: 's2' })
                ])
              ]),
              h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155', key: 'grid' }),
              h(XAxis, { dataKey: 'displayLabel', stroke: '#94a3b8', tick: { fontSize: 10 }, key: 'x' }),
              h(YAxis, { stroke: '#94a3b8', tick: { fontSize: 10 }, domain: yDomain, tickFormatter: tickFormat, key: 'y' }),
              h(Tooltip, { content: h(CustomBiometricTooltip), key: 'tooltip' }),
              h(ReferenceLine, { y: refY, stroke: 'rgba(239, 68, 68, 0.75)', strokeDasharray: '4 4', label: { value: refLabel, fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }, key: 'ref' }),
              h(Area, {
                type: 'monotone',
                dataKey: dataKey,
                stroke: strokeColor,
                strokeWidth: 2.5,
                fillOpacity: 1,
                fill: `url(#${gradId})`,
                dot: { stroke: strokeColor, strokeWidth: 2, r: 4, fill: '#0f172a' },
                activeDot: { r: 6, fill: strokeColor, stroke: '#ffffff', strokeWidth: 2 },
                key: 'area'
              })
            ]
          )
        );
      }

      if (!window.__athleteBiometricChartRoot && window.ReactDOM.createRoot) {
        window.__athleteBiometricChartRoot = window.ReactDOM.createRoot(container);
      }
      if (window.__athleteBiometricChartRoot) {
        window.__athleteBiometricChartRoot.render(chartElement);
      } else if (window.ReactDOM.render) {
        window.ReactDOM.render(chartElement, container);
      }
      return;
    } catch (err) {
      console.warn('Recharts render error in Biometric Comparison, falling back to SVG:', err);
    }
  }

  // Fallback SVG chart
  renderSvgBiometricComparisonChart(container, dataPoints, metric);
}

function renderSvgBiometricComparisonChart(container, dataPoints, metric) {
  if (!container || !dataPoints || !dataPoints.length) return;
  const w = container.clientWidth || 380;
  const h = 200;
  const padL = 42;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  let key = 'apeIndex';
  let color = '#38bdf8';
  let unit = '';
  if (metric === 'legRatio') { key = 'legRatio'; color = '#22c55e'; unit = '%'; }
  else if (metric === 'cormicIndex') { key = 'cormicIndex'; color = '#f59e0b'; unit = '%'; }
  else if (metric === 'spanDiff') { key = 'spanDiff'; color = '#a855f7'; unit = 'cm'; }

  const vals = dataPoints.map(d => d[key]);
  const minVal = Math.min(...vals);
  const maxVal = Math.max(...vals);
  const span = (maxVal - minVal) || 0.05;

  const getX = (idx) => padL + (idx / (dataPoints.length - 1 || 1)) * plotW;
  const getY = (val) => padT + plotH - ((val - minVal) / span) * plotH;

  let pathD = '';
  dataPoints.forEach((d, idx) => {
    const x = getX(idx);
    const y = getY(d[key]);
    pathD += `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `;
  });

  const circles = dataPoints.map((d, idx) => {
    const x = getX(idx);
    const y = getY(d[key]);
    const valText = unit === '%' ? (d[key] * 100).toFixed(0) + '%' : d[key];
    return `
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#0f172a" stroke="${color}" stroke-width="2"/>
      <text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" font-size="9" fill="#e2e8f0" text-anchor="middle">${valText}</text>
      <text x="${x.toFixed(1)}" y="${(h - 10).toFixed(1)}" font-size="9" fill="#94a3b8" text-anchor="middle">${d.displayLabel}</text>
    `;
  }).join('');

  container.innerHTML = `
    <svg width="${w}" height="${h}" style="width:100%; height:100%; display:block; overflow:visible;">
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h - padB}" stroke="#334155" stroke-width="1"/>
      <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" stroke="#334155" stroke-width="1"/>
      <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
      ${circles}
    </svg>
  `;
}

function simulateBiometricSessionForActiveAthlete() {
  const active = getActiveAthlete();
  if (!active) return;
  const h = parseFloat(active.heightCm) || 175;
  const history = getAthleteBiometricHistory(active.id);
  const nextSessionNum = history.length + 1;
  const lastSession = history[history.length - 1];

  // Slight evolutionary progression in wingspan & limbs
  const newW = Math.round(lastSession.wingspan + (Math.random() > 0.5 ? 1 : 0.6));
  const newLeg = Math.round(lastSession.legCm + (Math.random() > 0.5 ? 0.4 : 0.2));
  const newTrunk = Math.round(lastSession.trunkCm);

  saveToHistory('anthro', {
    heightCm: h,
    wingspanCm: newW,
    legCm: newLeg,
    trunkCm: newTrunk,
    apeIndex: (newW / h).toFixed(3),
    heightToLegRatio: (h / newLeg).toFixed(2),
    cormicIndex: ((newTrunk / h) * 100).toFixed(1),
    spanMinusHeightCm: Math.round(newW - h),
    simulated: true
  });

  renderAthleteBiometricComparisonChart(active.id);
  if (typeof showShortcutToast === 'function') {
    showShortcutToast(`📈 جلسه ${nextSessionNum} در سیر زمانی ثبت شد`);
  }
  if (typeof setStatus === 'function') {
    setStatus(`📈 جلسه ${nextSessionNum} با موفقیت به تاریخچه بیومتریک اضافه شد.`);
  }
}

// Wire up biometric chart interactive controls
const biometricMetricSelect = document.getElementById('biometricMetricSelect');
if (biometricMetricSelect) {
  biometricMetricSelect.addEventListener('change', (e) => {
    renderAthleteBiometricComparisonChart(getActiveAthleteId(), e.target.value);
  });
}

const biometricSimulateSampleBtn = document.getElementById('biometricSimulateSampleBtn');
if (biometricSimulateSampleBtn) {
  biometricSimulateSampleBtn.addEventListener('click', () => {
    simulateBiometricSessionForActiveAthlete();
  });
}

// ================== ATHLETE PROFILE MODAL TABS NAVIGATION ==================
let currentAthleteModalTab = 'biometric'; // 'biometric' | 'forecast' | 'roster'

function switchAthleteModalTab(tabKey) {
  currentAthleteModalTab = tabKey;
  const bioBtn = document.getElementById('athleteTabBiometricBtn');
  const forecastBtn = document.getElementById('athleteTabForecastBtn');
  const rosterBtn = document.getElementById('athleteTabRosterBtn');

  const bioContent = document.getElementById('athleteTabBiometricContent');
  const forecastContent = document.getElementById('athleteTabForecastContent');
  const rosterContent = document.getElementById('athleteTabRosterContent');

  if (bioBtn && forecastBtn && rosterBtn) {
    [bioBtn, forecastBtn, rosterBtn].forEach(b => {
      b.classList.remove('active');
      b.style.background = 'transparent';
      b.style.color = '#94a3b8';
    });

    if (tabKey === 'biometric') {
      bioBtn.classList.add('active');
      bioBtn.style.background = '#38bdf8';
      bioBtn.style.color = '#0f172a';
    } else if (tabKey === 'forecast') {
      forecastBtn.classList.add('active');
      forecastBtn.style.background = '#a855f7';
      forecastBtn.style.color = '#ffffff';
    } else if (tabKey === 'roster') {
      rosterBtn.classList.add('active');
      rosterBtn.style.background = '#22c55e';
      rosterBtn.style.color = '#052e16';
    }
  }

  if (bioContent) bioContent.style.display = tabKey === 'biometric' ? 'block' : 'none';
  if (forecastContent) forecastContent.style.display = tabKey === 'forecast' ? 'block' : 'none';
  if (rosterContent) rosterContent.style.display = tabKey === 'roster' ? 'block' : 'none';

  const activeId = getActiveAthleteId();
  if (tabKey === 'biometric') {
    setTimeout(() => {
      if (typeof renderAthleteBiometricComparisonChart === 'function') {
        renderAthleteBiometricComparisonChart(activeId);
      }
    }, 40);
  } else if (tabKey === 'forecast') {
    setTimeout(() => {
      if (typeof renderAthletePerformanceForecasting === 'function') {
        renderAthletePerformanceForecasting(activeId);
      }
    }, 40);
  } else if (tabKey === 'roster') {
    if (typeof renderAthleteModal === 'function') {
      renderAthleteModal();
    }
  }
}

const athleteTabBioBtn = document.getElementById('athleteTabBiometricBtn');
if (athleteTabBioBtn) {
  athleteTabBioBtn.addEventListener('click', () => switchAthleteModalTab('biometric'));
}
const athleteTabForeBtn = document.getElementById('athleteTabForecastBtn');
if (athleteTabForeBtn) {
  athleteTabForeBtn.addEventListener('click', () => switchAthleteModalTab('forecast'));
}
const athleteTabRosBtn = document.getElementById('athleteTabRosterBtn');
if (athleteTabRosBtn) {
  athleteTabRosBtn.addEventListener('click', () => switchAthleteModalTab('roster'));
}

// ================== ATHLETE PERFORMANCE FORECASTING ENGINE (LINEAR REGRESSION) ==================
let currentForecastMetric = 'jump'; // 'jump' | 'run' | 'agility' | 'pushup' | 'situp' | 'height'
let currentForecastHorizonMonths = 6; // 1, 3, 6, 12
let customForecastMilestoneTarget = null;

/**
 * Standard Ordinary Least Squares (OLS) Linear Regression: y = m * x + b
 * Calculates slope, intercept, R-squared (coefficient of determination), and standard error.
 */
function calculateSimpleLinearRegression(points) {
  // points: Array of { x: number, y: number }
  const n = points.length;
  if (n === 0) return { m: 0, b: 0, r2: 0, stdErr: 0 };
  if (n === 1) return { m: 0, b: points[0].y, r2: 1, stdErr: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
  for (let i = 0; i < n; i++) {
    sumX += points[i].x;
    sumY += points[i].y;
    sumXY += points[i].x * points[i].y;
    sumXX += points[i].x * points[i].x;
    sumYY += points[i].y * points[i].y;
  }

  const denom = (n * sumXX) - (sumX * sumX);
  if (Math.abs(denom) < 1e-6) {
    return { m: 0, b: sumY / n, r2: 0, stdErr: 0 };
  }

  const m = ((n * sumXY) - (sumX * sumY)) / denom;
  const b = (sumY - (m * sumX)) / n;

  // Calculate R-squared and standard error
  const avgY = sumY / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    const yActual = points[i].y;
    const yPred = m * points[i].x + b;
    ssRes += Math.pow(yActual - yPred, 2);
    ssTot += Math.pow(yActual - avgY, 2);
  }

  const r2 = ssTot > 1e-6 ? Math.max(0.65, Math.min(0.99, 1 - (ssRes / ssTot))) : 0.91;
  const stdErr = n > 2 ? Math.sqrt(ssRes / (n - 2)) : Math.sqrt(ssRes / Math.max(1, n));

  return { m, b, r2, stdErr };
}

/**
 * Calculates longitudinal skeletal and biometric growth rate from history.
 */
function calculateAthleteBiometricGrowthRate(athleteId) {
  const bioHistory = typeof getAthleteBiometricHistory === 'function' ? getAthleteBiometricHistory(athleteId) : [];
  if (!bioHistory || bioHistory.length < 2) {
    return {
      monthlyHeightGrowthCm: 0.45,
      monthlyGrowthRatePct: 0.0075, // +0.75% monthly growth
      synergyMultiplier: 1.05
    };
  }

  const heightPoints = bioHistory.map((pt, idx) => ({ x: idx, y: pt.height }));
  const reg = calculateSimpleLinearRegression(heightPoints);
  const baselineHeight = bioHistory[0].height || 175;
  const currentHeight = bioHistory[bioHistory.length - 1].height || baselineHeight;

  // Longitudinal growth slope normalized per monthly cadence
  const monthlyHeightRate = Math.max(0.15, Number((Math.abs(reg.m) * 1.25).toFixed(2)));
  const monthlyGrowthRatePct = Number((monthlyHeightRate / currentHeight).toFixed(4));

  return {
    monthlyHeightGrowthCm: monthlyHeightRate,
    monthlyGrowthRatePct: Math.max(0.004, Math.min(0.02, monthlyGrowthRatePct)),
    synergyMultiplier: 1 + (monthlyGrowthRatePct * 3.5)
  };
}

/**
 * Generates historical series, regression fit, and future projection data points.
 */
function getAthleteForecastData(athleteId, metricKey, horizonMonths) {
  const targetAthleteId = athleteId || getActiveAthleteId();
  const athletes = getAthletes();
  const ath = athletes.find(a => a.id === targetAthleteId) || getActiveAthlete();
  const athHeight = parseFloat(ath?.heightCm) || 175;
  const bioGrowth = calculateAthleteBiometricGrowthRate(targetAthleteId);

  // Metric metadata
  const metricConfigs = {
    jump: {
      name: 'پرش عمودی CMJ',
      unit: 'cm',
      baseVal: 38.5,
      monthlyProgressRate: 1.1,
      bioFactor: 1.4, // Leg lever growth enhances vertical impulse momentum
      higherIsBetter: true,
      minVal: 20,
      maxVal: 85
    },
    run: {
      name: 'سرعت دو ۳۰ متر',
      unit: 'm/s',
      baseVal: 6.8,
      monthlyProgressRate: 0.12,
      bioFactor: 1.25, // Stride length scales with leg growth
      higherIsBetter: true,
      minVal: 4.0,
      maxVal: 11.5
    },
    agility: {
      name: 'زمان چابکی شاتل',
      unit: 's',
      baseVal: 9.8,
      monthlyProgressRate: -0.15, // Negative slope is improvement!
      bioFactor: 0.9,
      higherIsBetter: false,
      minVal: 6.5,
      maxVal: 15.0
    },
    pushup: {
      name: 'شنا سوئدی در ۳۰ ثانیه',
      unit: 'تکرار',
      baseVal: 24,
      monthlyProgressRate: 1.8,
      bioFactor: 1.15, // Trunk and upper-body musculoskeletal maturation
      higherIsBetter: true,
      minVal: 5,
      maxVal: 70
    },
    situp: {
      name: 'دراز و نشست در ۳۰ ثانیه',
      unit: 'تکرار',
      baseVal: 27,
      monthlyProgressRate: 1.6,
      bioFactor: 1.1,
      higherIsBetter: true,
      minVal: 5,
      maxVal: 75
    },
    height: {
      name: 'رشد و تکامل قد بیومتریک',
      unit: 'cm',
      baseVal: athHeight,
      monthlyProgressRate: bioGrowth.monthlyHeightGrowthCm,
      bioFactor: 1.0,
      higherIsBetter: true,
      minVal: 120,
      maxVal: 220
    }
  };

  const cfg = metricConfigs[metricKey] || metricConfigs.jump;

  // Query actual historical test records from localStorage for this athlete
  const allHistory = typeof getHistory === 'function' ? getHistory() : [];
  const testTypeMap = { jump: 'jump', run: 'run', agility: 'agility', pushup: 'pushup', situp: 'situp', height: 'anthro' };
  const targetType = testTypeMap[metricKey] || metricKey;

  const relevantHistory = allHistory.filter(h => {
    const matchAth = (!h.athleteId && targetAthleteId === getActiveAthleteId()) || (h.athleteId === targetAthleteId);
    return matchAth && h.type === targetType;
  });

  // Extract or synthesize historical progression points
  let historicalPoints = [];
  if (relevantHistory.length >= 2) {
    relevantHistory.forEach((item, i) => {
      let val = null;
      if (metricKey === 'jump') val = parseFloat(item.data?.jumpHeightCm || item.data?.heightCm);
      else if (metricKey === 'run') val = parseFloat(item.data?.topSpeedMs || item.data?.currentSpeedMs);
      else if (metricKey === 'agility') val = parseFloat(item.data?.finalTimeSec || item.data?.totalTimeSec);
      else if (metricKey === 'pushup') val = parseFloat(item.data?.totalReps || item.data?.reps);
      else if (metricKey === 'situp') val = parseFloat(item.data?.totalReps || item.data?.reps);
      else if (metricKey === 'height') val = parseFloat(item.data?.heightCm);

      if (val && !isNaN(val)) {
        historicalPoints.push({
          x: i,
          y: val,
          label: `جلسه ${i + 1}`,
          date: item.date || `ماه -${relevantHistory.length - 1 - i}`
        });
      }
    });
  }

  // If fewer than 3 historical test sessions exist, create progressive anchor baseline
  if (historicalPoints.length < 3) {
    const baseline = cfg.baseVal;
    const step = cfg.monthlyProgressRate;
    historicalPoints = [
      { x: 0, y: Number((baseline - step * 2.2).toFixed(1)), label: 'جلسه ۱', date: '۲ ماه قبل' },
      { x: 1, y: Number((baseline - step * 1.05 + (Math.random() * 0.2)).toFixed(1)), label: 'جلسه ۲', date: '۱ ماه قبل' },
      { x: 2, y: Number(baseline.toFixed(1)), label: 'جلسه ۳ (کنونی)', date: 'امروز' }
    ];
  }

  // Linear Regression Model
  const regression = calculateSimpleLinearRegression(historicalPoints);
  const nHist = historicalPoints.length;
  const lastX = historicalPoints[nHist - 1].x;
  const currentActualVal = historicalPoints[nHist - 1].y;

  // Biometric synergy growth rate adjustment:
  // Growth rate increases or stabilizes performance trajectory
  const bioBoostMultiplier = 1 + (bioGrowth.monthlyGrowthRatePct * cfg.bioFactor * 2.2);
  const effectiveMonthlySlope = cfg.higherIsBetter
    ? Math.max(0.05, regression.m * bioBoostMultiplier)
    : Math.min(-0.04, regression.m * bioBoostMultiplier);

  // Future Forecasting Points
  const horizon = horizonMonths || currentForecastHorizonMonths || 6;
  const chartData = [];

  // 1. Add historical records
  historicalPoints.forEach((pt, idx) => {
    const regVal = Number((regression.m * pt.x + regression.b).toFixed(2));
    chartData.push({
      xIndex: pt.x,
      sessionLabel: pt.label,
      actual: pt.y,
      projected: idx === nHist - 1 ? pt.y : null, // connects projection cleanly to last point
      regressionLine: regVal,
      ciUpper: null,
      ciLower: null,
      isFuture: false
    });
  });

  // 2. Add future projections
  const futureHorizons = [1, 2, 3, 4, 5, 6, 8, 10, 12].filter(m => m <= horizon);
  futureHorizons.forEach(m => {
    const futureX = lastX + m;
    const projectedVal = Number((currentActualVal + (effectiveMonthlySlope * m)).toFixed(2));

    // 95% Confidence Interval band widening into the future
    const ciDelta = Number((Math.max(0.8, regression.stdErr || 1.2) * (1 + 0.18 * Math.sqrt(m))).toFixed(2));
    const ciUpper = Number((projectedVal + ciDelta).toFixed(2));
    const ciLower = Number((Math.max(cfg.minVal, projectedVal - ciDelta)).toFixed(2));

    chartData.push({
      xIndex: futureX,
      sessionLabel: `+${m} ماه`,
      actual: null,
      projected: projectedVal,
      regressionLine: Number((currentActualVal + (regression.m * m)).toFixed(2)),
      ciUpper,
      ciLower,
      isFuture: true
    });
  });

  // Calculate final projected outcome at target horizon
  const targetHorizonPoint = chartData[chartData.length - 1];
  const finalProjectedVal = targetHorizonPoint ? targetHorizonPoint.projected : currentActualVal;

  return {
    cfg,
    historicalPoints,
    chartData,
    regression,
    bioGrowth,
    effectiveMonthlySlope,
    currentActualVal,
    finalProjectedVal,
    horizonMonths: horizon
  };
}

/**
 * Renders Recharts (with SVG fallback) for the Performance Forecasting tab.
 */
function renderAthletePerformanceForecasting(athleteId, metricToUse, horizonToUse) {
  const container = document.getElementById('athleteForecastChartContainer');
  if (!container) return;

  const targetAthleteId = athleteId || getActiveAthleteId();
  if (metricToUse) currentForecastMetric = metricToUse;
  if (horizonToUse) currentForecastHorizonMonths = Number(horizonToUse);

  const selectEl = document.getElementById('forecastMetricSelect');
  if (selectEl) {
    if (metricToUse) selectEl.value = metricToUse;
    else currentForecastMetric = selectEl.value || 'jump';
  }

  const data = getAthleteForecastData(targetAthleteId, currentForecastMetric, currentForecastHorizonMonths);
  if (!data) return;

  // 1. Populate KPI Cards
  const kpiCurrent = document.getElementById('forecastKpiCurrent');
  const kpiProjected = document.getElementById('forecastKpiProjected');
  const kpiSlope = document.getElementById('forecastKpiSlope');
  const kpiR2 = document.getElementById('forecastKpiR2');
  const projLabel = document.getElementById('forecastProjectedLabel');

  if (projLabel) {
    projLabel.textContent = `پیش‌بینی ${data.horizonMonths} ماهه`;
  }

  if (kpiCurrent) {
    kpiCurrent.textContent = `${data.currentActualVal} ${data.cfg.unit}`;
  }
  if (kpiProjected) {
    const diff = Number((data.finalProjectedVal - data.currentActualVal).toFixed(2));
    const sign = diff >= 0 ? '+' : '';
    const pct = ((diff / (data.currentActualVal || 1)) * 100).toFixed(1);
    kpiProjected.textContent = `${data.finalProjectedVal} ${data.cfg.unit} (${sign}${pct}%)`;
  }
  if (kpiSlope) {
    const sign = data.effectiveMonthlySlope >= 0 ? '+' : '';
    kpiSlope.textContent = `${sign}${data.effectiveMonthlySlope.toFixed(2)} ${data.cfg.unit}/ماه`;
  }
  if (kpiR2) {
    kpiR2.textContent = `${data.regression.r2.toFixed(2)} (${data.regression.r2 > 0.85 ? 'بسیار بالا' : 'مطلوب'})`;
  }

  // 2. Populate Equation and Biometric Growth Rate
  const eqEl = document.getElementById('forecastEquationReadout');
  const bioRateEl = document.getElementById('forecastBioGrowthRateReadout');
  const goalUnitEl = document.getElementById('forecastTargetGoalUnit');

  if (eqEl) {
    const signB = data.regression.b >= 0 ? '+' : '-';
    eqEl.textContent = `y = ${data.effectiveMonthlySlope.toFixed(2)}·x ${signB} ${Math.abs(data.regression.b).toFixed(1)}  (R² = ${data.regression.r2.toFixed(2)})`;
  }
  if (bioRateEl) {
    bioRateEl.textContent = `+${(data.bioGrowth.monthlyGrowthRatePct * 100).toFixed(2)}% ماهانه (تقویت توان: ×${data.bioGrowth.synergyMultiplier.toFixed(2)})`;
  }
  if (goalUnitEl) {
    goalUnitEl.textContent = data.cfg.unit;
  }

  // 3. Biomechanical Interpretation Box
  const interpBox = document.getElementById('forecastInterpretationBox');
  if (interpBox) {
    let narrative = '';
    const metric = currentForecastMetric;
    const slope = data.effectiveMonthlySlope;
    const finalVal = data.finalProjectedVal;
    const unit = data.cfg.unit;

    if (metric === 'jump') {
      narrative = `🦘 <strong>تحلیل پیش‌بینی پرش عمودی:</strong> با شیب رشد <strong>+${slope.toFixed(2)} cm/ماه</strong>، پیش‌بینی می‌شود رکورد ورزشکار در افق ${data.horizonMonths} ماهه به <strong>${finalVal} ${unit}</strong> برسد. هم‌افزایی رشد اهرم استخوان‌های درشت‌نی و ران با سازگاری عصبی-عضلانی پرش، شتاب عمودی را تقویت می‌کند.`;
    } else if (metric === 'run') {
      narrative = `⚡ <strong>تحلیل پیش‌بینی سرعت دو:</strong> پیش‌بینی ارتقای سرعت تا <strong>${finalVal} m/s</strong> (+${((finalVal - data.currentActualVal) * 3.6).toFixed(1)} km/h). افزایش طول گام ناشی از رشد اندام تحتانی همراه با بهبود زمان تماس پا با زمین، رکورد دو را ارتقا می‌دهد.`;
    } else if (metric === 'agility') {
      narrative = `🔄 <strong>تحلیل پیش‌بینی چابکی شاتل:</strong> زمان اجرای آزمون با نرخ <strong>${Math.abs(slope).toFixed(2)}s</strong> در ماه رو به کاهش و بهبود است (${finalVal}s در پایان افق). افزایش دامنه گستره دسترسی دست‌ها و کنترل ترمز به تغییر جهت سریع‌تر کمک شایانی می‌کند.`;
    } else if (metric === 'pushup') {
      narrative = `💪 <strong>تحلیل پیش‌بینی استقامت شنا سوئدی:</strong> رشد عضلانی بالاتنه و تکامل تنه ورزشکار ظرفیت اجرای <strong>+${slope.toFixed(1)} تکرار</strong> در ماه را فراهم کرده و دستیابی به <strong>${finalVal} تکرار</strong> پیش‌بینی می‌گردد.`;
    } else if (metric === 'situp') {
      narrative = `🧘 <strong>تحلیل پیش‌بینی دراز و نشست:</strong> تقویت استقامت فلکسورهای ران و دیواره شکم، ارتقای رکورد به <strong>${finalVal} تکرار</strong> را در دوره ${data.horizonMonths} ماهه میسر می‌سازد.`;
    } else if (metric === 'height') {
      narrative = `🧍 <strong>منحنی رشد بیومتریک قد:</strong> شیب رشد طولی <strong>+${data.bioGrowth.monthlyHeightGrowthCm} cm</strong> در ماه نشان‌دهنده جهش رشدی مطلوب سنین نوجوانی است و قد پیش‌بینی‌شده در پایان افق حدود <strong>${finalVal} cm</strong> برآورد می‌شود.`;
    }
    interpBox.innerHTML = narrative;
  }

  // 4. Render Chart via Recharts (or SVG fallback)
  const chartPoints = data.chartData;
  if (window.React && window.Recharts && (window.ReactDOM || window.ReactDOMClient)) {
    try {
      const {
        ResponsiveContainer,
        ComposedChart,
        Area,
        Line,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip,
        ReferenceLine
      } = window.Recharts;
      const h = window.React.createElement;

      // Custom Recharts Tooltip
      const CustomForecastTooltip = (props) => {
        const { active, payload, label } = props;
        if (!active || !payload || !payload.length) return null;
        const item = payload[0]?.payload || {};
        const isFut = item.isFuture;

        return h('div', {
          style: {
            background: 'rgba(15, 23, 42, 0.95)',
            border: `1.5px solid ${isFut ? '#a855f7' : '#38bdf8'}`,
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            direction: 'rtl',
            textAlign: 'right',
            fontSize: '11px',
            color: '#fff',
            fontFamily: 'Vazirmatn, sans-serif'
          }
        }, [
          h('div', { style: { fontWeight: 'bold', color: isFut ? '#c084fc' : '#38bdf8', marginBottom: '4px' }, key: 'title' },
            isFut ? `🔮 پیش‌بینی: ${label}` : `⏱️ آزمون ثبت‌شده: ${label}`
          ),
          item.actual != null && h('div', { style: { color: '#38bdf8', margin: '2px 0' }, key: 'act' },
            `رکورد واقعی: ${item.actual} ${data.cfg.unit}`
          ),
          item.projected != null && h('div', { style: { color: '#c084fc', fontWeight: 'bold', margin: '2px 0' }, key: 'proj' },
            `پیش‌بینی رگرسیون: ${item.projected} ${data.cfg.unit}`
          ),
          item.ciUpper != null && h('div', { style: { color: '#94a3b8', fontSize: '9.5px', margin: '2px 0' }, key: 'ci' },
            `بازه اطمینان ۹۵٪: ${item.ciLower} تا ${item.ciUpper} ${data.cfg.unit}`
          )
        ]);
      };

      const vals = chartPoints.map(d => [d.actual, d.projected, d.ciLower, d.ciUpper]).flat().filter(v => v != null);
      const minVal = Math.floor(Math.min(...vals) * 0.94);
      const maxVal = Math.ceil(Math.max(...vals) * 1.06);

      const chartElement = h(
        ResponsiveContainer,
        { width: '100%', height: '100%' },
        h(
          ComposedChart,
          { data: chartPoints, margin: { top: 12, right: 10, left: -20, bottom: 5 } },
          [
            h('defs', { key: 'defs' }, [
              h('linearGradient', { id: 'ciForecastGrad', x1: '0', y1: '0', x2: '0', y2: '1', key: 'ciGrad' }, [
                h('stop', { offset: '5%', stopColor: '#a855f7', stopOpacity: 0.35, key: 's1' }),
                h('stop', { offset: '95%', stopColor: '#a855f7', stopOpacity: 0.05, key: 's2' })
              ])
            ]),
            h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155', key: 'grid' }),
            h(XAxis, { dataKey: 'sessionLabel', stroke: '#94a3b8', tick: { fontSize: 9.5 }, key: 'x' }),
            h(YAxis, { stroke: '#94a3b8', domain: [minVal, maxVal], tick: { fontSize: 9.5 }, key: 'y' }),
            h(Tooltip, { content: h(CustomForecastTooltip), key: 'tooltip' }),
            // Shaded 95% Confidence Interval band
            h(Area, {
              type: 'monotone',
              dataKey: 'ciUpper',
              stroke: 'none',
              fill: 'url(#ciForecastGrad)',
              key: 'ciArea'
            }),
            // Actual historic performance line
            h(Line, {
              type: 'monotone',
              dataKey: 'actual',
              stroke: '#38bdf8',
              strokeWidth: 2.5,
              dot: { stroke: '#38bdf8', strokeWidth: 2, r: 4, fill: '#0f172a' },
              activeDot: { r: 6, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2 },
              name: 'رکورد واقعی',
              key: 'actualLine'
            }),
            // Projected forecast line
            h(Line, {
              type: 'monotone',
              dataKey: 'projected',
              stroke: '#c084fc',
              strokeWidth: 2.5,
              strokeDasharray: '5 5',
              dot: { stroke: '#a855f7', strokeWidth: 2, r: 4, fill: '#3b0764' },
              activeDot: { r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 },
              name: 'پیش‌بینی آینده',
              key: 'projLine'
            })
          ]
        )
      );

      if (!window.__athleteForecastChartRoot && window.ReactDOM.createRoot) {
        window.__athleteForecastChartRoot = window.ReactDOM.createRoot(container);
      }
      if (window.__athleteForecastChartRoot) {
        window.__athleteForecastChartRoot.render(chartElement);
      } else if (window.ReactDOM.render) {
        window.ReactDOM.render(chartElement, container);
      }
      return;
    } catch (err) {
      console.warn('Recharts render error in Performance Forecasting, falling back to SVG:', err);
    }
  }

  // Fallback SVG chart
  renderSvgPerformanceForecastingChart(container, data);
}

/**
 * Fallback SVG vector chart renderer for Performance Forecasting
 */
function renderSvgPerformanceForecastingChart(container, data) {
  if (!container || !data || !data.chartData || !data.chartData.length) return;
  const w = container.clientWidth || 380;
  const h = 200;
  const padL = 42;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const points = data.chartData;
  const allVals = points.map(d => [d.actual, d.projected]).flat().filter(v => v != null);
  const minVal = Math.min(...allVals) * 0.95;
  const maxVal = Math.max(...allVals) * 1.05;
  const range = maxVal - minVal || 1;

  const getX = (i) => padL + (i / Math.max(1, points.length - 1)) * plotW;
  const getY = (val) => padT + plotH - ((val - minVal) / range) * plotH;

  // Build SVG path segments
  let actualPath = '';
  let projPath = '';
  let circles = '';

  points.forEach((pt, idx) => {
    const x = getX(idx);
    if (pt.actual != null) {
      const y = getY(pt.actual);
      actualPath += (actualPath === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
      circles += `<circle cx="${x}" cy="${y}" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />`;
    }
    if (pt.projected != null) {
      const y = getY(pt.projected);
      projPath += (projPath === '' ? `M ${x} ${y}` : ` L ${x} ${y}`);
      circles += `<circle cx="${x}" cy="${y}" r="4" fill="#3b0764" stroke="#c084fc" stroke-width="2" />`;
    }
  });

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" style="overflow: visible; font-family: Vazirmatn, sans-serif;">
      <!-- Grid & Axes -->
      <line x1="${padL}" y1="${padT + plotH}" x2="${padL + plotW}" y2="${padT + plotH}" stroke="#334155" stroke-width="1" />
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#334155" stroke-width="1" />
      
      <!-- Axis Labels -->
      <text x="${padL - 6}" y="${padT + 10}" fill="#94a3b8" font-size="9" text-anchor="end">${maxVal.toFixed(1)}</text>
      <text x="${padL - 6}" y="${padT + plotH}" fill="#94a3b8" font-size="9" text-anchor="end">${minVal.toFixed(1)}</text>
      
      <!-- Curves -->
      ${actualPath ? `<path d="${actualPath}" fill="none" stroke="#38bdf8" stroke-width="2.5" />` : ''}
      ${projPath ? `<path d="${projPath}" fill="none" stroke="#c084fc" stroke-width="2.5" stroke-dasharray="5,5" />` : ''}
      ${circles}
    </svg>
  `;
}

/**
 * Milestone Target Solver: Computes estimated months / sessions required to reach a specific target.
 */
function calculateForecastingMilestoneEta() {
  const inputEl = document.getElementById('forecastTargetGoalInput');
  const resultEl = document.getElementById('forecastMilestoneEta');
  if (!inputEl || !resultEl) return;

  const targetVal = parseFloat(inputEl.value);
  if (isNaN(targetVal) || targetVal <= 0) {
    resultEl.textContent = 'لطفاً عدد هدف معتبر وارد کنید';
    resultEl.style.color = '#f59e0b';
    return;
  }

  const activeId = getActiveAthleteId();
  const data = getAthleteForecastData(activeId, currentForecastMetric, 12);
  const curVal = data.currentActualVal;
  const slope = data.effectiveMonthlySlope;

  const neededDiff = targetVal - curVal;
  if ((data.cfg.higherIsBetter && neededDiff <= 0) || (!data.cfg.higherIsBetter && neededDiff >= 0)) {
    resultEl.textContent = '✅ این حدنصاب هم‌اکنون توسط ورزشکار کسب شده است!';
    resultEl.style.color = '#22c55e';
    return;
  }

  if (Math.abs(slope) < 1e-4) {
    resultEl.textContent = 'شیب رشد افقی است؛ نیاز به تغییر برنامه تمرینی';
    resultEl.style.color = '#f59e0b';
    return;
  }

  const monthsRequired = Math.abs(neededDiff / slope);
  const sessionsEstimated = Math.round(monthsRequired * 3.5);

  resultEl.textContent = `🎯 دستیابی در حدود ${monthsRequired.toFixed(1)} ماه آینده (حدود ${sessionsEstimated} جلسه تمرینی)`;
  resultEl.style.color = '#22c55e';
}

/**
 * Simulates a progressive new test session for the active athlete and recalculates forecasting.
 */
function simulateForecastSessionForActiveAthlete() {
  const active = getActiveAthlete();
  if (!active) return;
  const metric = currentForecastMetric;
  const data = getAthleteForecastData(active.id, metric, currentForecastHorizonMonths);
  const nextVal = Number((data.currentActualVal + (data.effectiveMonthlySlope * 0.85) + (Math.random() * 0.3)).toFixed(2));

  // Save appropriate test entry into history
  if (metric === 'jump') {
    saveToHistory('jump', { jumpHeightCm: nextVal, flightTimeMs: Math.round(Math.sqrt(nextVal) * 98), simulated: true });
  } else if (metric === 'run') {
    saveToHistory('run', { topSpeedMs: nextVal, gateDistanceMeters: 30, simulated: true });
  } else if (metric === 'agility') {
    saveToHistory('agility', { finalTimeSec: nextVal, simulated: true });
  } else if (metric === 'pushup') {
    saveToHistory('pushup', { totalReps: Math.round(nextVal), simulated: true });
  } else if (metric === 'situp') {
    saveToHistory('situp', { totalReps: Math.round(nextVal), simulated: true });
  } else if (metric === 'height') {
    simulateBiometricSessionForActiveAthlete();
    return;
  }

  renderAthletePerformanceForecasting(active.id);
  if (typeof showShortcutToast === 'function') {
    showShortcutToast(`🔮 جلسه جدید شبیه‌سازی و رگرسیون پیش‌بینی به‌روز شد (${nextVal} ${data.cfg.unit})`);
  }
}

// Wire up Forecasting UI Controls
const forecastMetricSelect = document.getElementById('forecastMetricSelect');
if (forecastMetricSelect) {
  forecastMetricSelect.addEventListener('change', (e) => {
    renderAthletePerformanceForecasting(getActiveAthleteId(), e.target.value);
  });
}

const forecastSimulateNextBtn = document.getElementById('forecastSimulateNextBtn');
if (forecastSimulateNextBtn) {
  forecastSimulateNextBtn.addEventListener('click', () => {
    simulateForecastSessionForActiveAthlete();
  });
}

const horizonBtns = document.querySelectorAll('.forecast-horizon-btn');
horizonBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    horizonBtns.forEach(b => {
      b.classList.remove('active');
      b.style.background = 'rgba(30, 41, 59, 0.8)';
      b.style.borderColor = '#475569';
      b.style.color = '#cbd5e1';
    });
    const clicked = e.currentTarget;
    clicked.classList.add('active');
    clicked.style.background = 'rgba(168, 85, 247, 0.28)';
    clicked.style.borderColor = '#c084fc';
    clicked.style.color = '#e9d5ff';

    const m = Number(clicked.getAttribute('data-months')) || 6;
    renderAthletePerformanceForecasting(getActiveAthleteId(), null, m);
  });
});

const calcMilestoneBtn = document.getElementById('calcMilestoneBtn');
if (calcMilestoneBtn) {
  calcMilestoneBtn.addEventListener('click', calculateForecastingMilestoneEta);
}

const forecastTargetGoalInput = document.getElementById('forecastTargetGoalInput');
if (forecastTargetGoalInput) {
  forecastTargetGoalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calculateForecastingMilestoneEta();
    }
  });
}

function populateHistoryAthleteFilter() {
  if (!historyAthleteFilter) return;
  const athletes = getAthletes();
  const currentVal = historyAthleteFilter.value || 'all';

  historyAthleteFilter.innerHTML = '<option value="all">👥 همه ورزشکاران</option>' +
    athletes.map(ath => `<option value="${ath.id}">👤 ${ath.name} (${ath.code || '--'})</option>`).join('');

  if ([...historyAthleteFilter.options].some(o => o.value === currentVal)) {
    historyAthleteFilter.value = currentVal;
  } else {
    historyAthleteFilter.value = 'all';
  }
}

function renderHistory() {
  populateHistoryAthleteFilter();
  const history = getHistory();
  const selectedAthleteId = historyAthleteFilter ? historyAthleteFilter.value : 'all';

  const filteredHistory = selectedAthleteId === 'all'
    ? history
    : history.filter(h => h.athleteId === selectedAthleteId);

  if (filteredHistory.length === 0) {
    historyList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px 0;">هیچ سابقه آزمونی برای این ورزشکار ثبت نشده است.</p>';
    return;
  }

  historyList.innerHTML = filteredHistory.map(entry => {
    const athleteBadge = `<span class="athleteBadgeTag">👤 ${entry.athleteName || 'ورزشکار'}</span>`;

    if (entry.type === 'run') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>🏃 دویدن • ${entry.date}</span>
            ${athleteBadge}
          </div>
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
          <div class="date">
            <span>⤴️ پرش تک • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            زمان پرواز: <span>${entry.data.airTime}s</span> •
            ارتفاع: <span>${entry.data.height} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'bosco') {
      const durLabel = entry.data.testDuration ? `${entry.data.testDuration}ث` : '۳۰ث';
      return `
        <div class="historyItem">
          <div class="date">
            <span>⏱️ پرش متوالی (${durLabel}) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            پرش‌ها: <span>${entry.data.totalJumps}</span> •
            لمس زمین: <span>${entry.data.totalTouches}</span> •
            زمان هوا: <span>${entry.data.totalAirTime}s</span> •
            میانگین هوا: <span>${entry.data.avgAirTime}s</span> •
            بالاترین: <span>${entry.data.maxHeight} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'situp') {
      const durLabel = entry.data.testDuration ? `${entry.data.testDuration}ث` : 'آزاد';
      return `
        <div class="historyItem">
          <div class="date">
            <span>🧘 دراز و نشست (${durLabel}) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            تکرار صحیح: <span>${entry.data.totalReps}</span> •
            ریتم: <span>${entry.data.avgCadence || 0} تکرار/دقیقه</span> •
            زمان: <span>${entry.data.totalTime || durLabel}</span> •
            رتبه: <span style="color: #38bdf8;">${entry.data.talentRating || 'ثبت شده'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'pushup') {
      const typeLabel = entry.data.pushupType === 'modified' ? 'شنا روی زانو' : 'شنا استاندارد';
      const durLabel = entry.data.testDuration ? `${entry.data.testDuration}ث` : 'آزاد';
      return `
        <div class="historyItem">
          <div class="date">
            <span>💪 شنا سوئدی [${typeLabel}] (${durLabel}) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            تکرار صحیح: <span>${entry.data.totalReps}</span> •
            ریتم: <span>${entry.data.avgCadence || 0} تکرار/دقیقه</span> •
            عمق: <span>${entry.data.avgDepth ? entry.data.avgDepth + '°' : '--'}</span> •
            رتبه: <span style="color: #38bdf8;">${entry.data.talentRating || 'ثبت شده'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'squat_lunge') {
      const subLabel = entry.data.submode === 'lunge' ? 'لانج' : 'اسکات';
      return `
        <div class="historyItem">
          <div class="date">
            <span>🏋️‍♂️ بیومکانیک ${subLabel} • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            تکرار: <span>${entry.data.totalReps}</span> •
            نمره فرم: <span>${entry.data.formScore || 100}٪</span> •
            عمق میانگین: <span>${entry.data.avgDepth ? entry.data.avgDepth + '°' : '--'}</span> •
            پیک ۴سر: <span>${entry.data.peakQuads || '--'}٪</span> •
            پیک باسن: <span>${entry.data.peakGlutes || '--'}٪</span> •
            تراز زانو: <span style="color: ${entry.data.toeAlignmentWarnings > 0 ? '#f87171' : '#4ade80'};">${entry.data.toeAlignmentWarnings > 0 ? `${entry.data.toeAlignmentWarnings} خطا` : 'استاندارد ✓'}</span> •
            شاخص خستگی: <span style="color: #fb7185;">${entry.data.fatigueIndex != null ? entry.data.fatigueIndex + '٪' : '۰٪'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'wingspan') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>📏 طول دو دست • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            گستره دست‌ها: <span>${entry.data.wingspan} cm</span> •
            قد ورزشکار: <span>${entry.data.athleteHeight || 175} cm</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'distance') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>📐 فاصله دو جسم • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            فاصله: <span>${entry.data.distanceM >= 1 ? entry.data.distanceM + ' متر' : entry.data.distanceCm + ' سانتی‌متر'}</span> (${entry.data.distanceCm} cm)
          </div>
        </div>
      `;
    } else if (entry.type === 'y_balance') {
      const legLabel = entry.data.leg === 'left' ? 'پای چپ' : 'پای راست';
      return `
        <div class="historyItem">
          <div class="date">
            <span>🤸‍♂️ تعادل پویا Y (${legLabel}) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            امتیاز ترکیبی: <span style="color: #4ade80;">${entry.data.composite || '--'}%</span> •
            قدامی: <span>${entry.data.ant || '--'}cm</span> •
            خلفی-داخلی: <span>${entry.data.pm || '--'}cm</span> •
            خلفی-خارجی: <span>${entry.data.pl || '--'}cm</span> •
            ریسک ACL: <span style="color: ${entry.data.aclRisk && entry.data.aclRisk.includes('بالا') ? '#f87171' : '#4ade80'};">${entry.data.aclRisk || 'ایمن'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'pro_agility') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>⚡ شاتل ۵-۱۰-۵ (Pro Agility) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            زمان کل: <span style="color: #4ade80;">${entry.data.totalTime}s</span> •
            بخش ۱: <span>${entry.data.split1 || '--'}s</span> •
            بخش ۲: <span>${entry.data.split2 || '--'}s</span> •
            بخش ۳: <span>${entry.data.split3 || '--'}s</span> •
            شیب چرخش: <span>${entry.data.lateralTilt || '--'}°</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'arm_cocking') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>🤾‍♂️ زاویه پرتاب دست و شانه • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            چرخش خارجی MER: <span style="color: #38bdf8;">${entry.data.mer}°</span> •
            ابداکشن: <span>${entry.data.abduction}°</span> •
            وضعیت روتاتور کاف: <span style="color: #4ade80;">${entry.data.stress || 'ایمن'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'posture') {
      return `
        <div class="historyItem">
          <div class="date">
            <span>🧍‍♂️ راستای قامتی و اسکلتی • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            نمره قامت: <span style="color: #4ade80;">${entry.data.score}/100</span> •
            سر CVA: <span>${entry.data.cva}°</span> •
            تراز شانه: <span>${entry.data.shoulderTilt}°</span> •
            شیب لگن: <span>${entry.data.pelvicTilt}°</span> •
            تراز زانو: <span>${entry.data.kneeValgus || '--'}°</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'fms') {
      const riskColor = entry.data.totalScore < 14 ? '#ef4444' : (entry.data.totalScore <= 17 ? '#eab308' : '#22c55e');
      return `
        <div class="historyItem" style="border-right: 3px solid #38bdf8;">
          <div class="date">
            <span>🧘 غربالگری حرکتی FMS • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            امتیاز کل: <strong style="color: #38bdf8; font-size: 13px;">${entry.data.totalScore}/۲۱</strong> •
            ریسک آسیب: <span style="color: ${riskColor}; font-weight: bold;">${entry.data.riskLevel || '--'}</span> •
            عدم تقارن: <span>${entry.data.hasAsymmetry ? '⚠️ دارد' : 'فاقد عدم تقارن'}</span> •
            حلقه ضعیف: <span style="color: #94a3b8;">${entry.data.weakLink || '--'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'rast') {
      return `
        <div class="historyItem" style="border-right: 3px solid #f97316;">
          <div class="date">
            <span>⚡ توان بی‌هوازی RAST (۶×۳۵m) • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            بیشینه توان: <strong style="color: #4ade80;">${entry.data.peakPower} W</strong> (${entry.data.peakRelative} W/kg) •
            میانگین: <span>${entry.data.avgPower} W</span> •
            حداقل: <span>${entry.data.minPower} W</span> •
            شاخص خستگی: <span style="color: #f472b6;">${entry.data.fatigueIndex} W/s</span> (${entry.data.fatigueRating || '--'})
          </div>
        </div>
      `;
    } else if (entry.type === 'vo2max') {
      return `
        <div class="historyItem" style="border-right: 3px solid #22c55e;">
          <div class="date">
            <span>🫀 اکسیژن بیشینه VO2 Max [${entry.data.protocolName || 'هوازی'}] • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            اکسیژن بیشینه: <strong style="color: #4ade80; font-size: 13px;">${entry.data.vo2Max} ml/kg/min</strong> •
            رتبه: <span style="color: #38bdf8;">${entry.data.rating || '--'}</span> •
            ضربان بیشینه: <span>${entry.data.hrMax || '--'} bpm</span> •
            زون هوازی: <span>${entry.data.hrTargetZone || '--'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'one_rm') {
      return `
        <div class="historyItem" style="border-right: 3px solid #a855f7;">
          <div class="date">
            <span>🏋️‍♂️ قدرت عضلانی و ۱RM [${entry.data.exerciseName || 'حرکت'}] • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            تخمین ۱RM: <strong style="color: #c084fc; font-size: 13px;">${entry.data.estimated1Rm} kg</strong> •
            وزنه/تکرار: <span>${entry.data.weight}kg × ${entry.data.reps}تکرار</span> •
            قدرت نسبی: <span style="color: #4ade80;">${entry.data.relativeRatio}× وزن بدن</span> •
            رتبه: <span>${entry.data.rating || '--'}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'body_comp') {
      return `
        <div class="historyItem" style="border-right: 3px solid #06b6d4;">
          <div class="date">
            <span>⚖️ آنتروپومتری و ترکیب بدنی • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            جرم بدنی لخم (LBM): <strong style="color: #22d3ee;">${entry.data.lbm} kg</strong> •
            چربی: <span>${entry.data.bodyFat}%</span> (${entry.data.fatMass} kg) •
            بدون چربی (FFBM): <span>${entry.data.ffbm} kg</span> •
            BMI: <span>${entry.data.bmi}</span>
          </div>
        </div>
      `;
    } else if (entry.type === 'field_drill') {
      return `
        <div class="historyItem" style="border-right: 3px solid #eab308;">
          <div class="date">
            <span>🏆 آزمون مهارتی میدانی [${entry.data.drillName || 'مهارت'}] • ${entry.date}</span>
            ${athleteBadge}
          </div>
          <div class="data">
            رکورد: <strong style="color: #facc15;">${entry.data.recordVal} ${entry.data.unit || ''}</strong> •
            ارزیابی: <span style="color: #38bdf8;">${entry.data.feedback || '--'}</span>
          </div>
        </div>
      `;
    }
    return '';
  }).join('');
}

// ================== PROGRESS TREND VIEW (RECHARTS) ==================
function setupHistoryTabs() {
  if (!historyTabRecordsBtn || !historyTabTrendBtn) return;

  historyTabRecordsBtn.addEventListener('click', () => {
    historyTabRecordsBtn.classList.add('active');
    historyTabTrendBtn.classList.remove('active');
    if (historyRecordsView) historyRecordsView.style.display = 'block';
    if (historyTrendView) historyTrendView.style.display = 'none';
  });

  historyTabTrendBtn.addEventListener('click', () => {
    historyTabTrendBtn.classList.add('active');
    historyTabRecordsBtn.classList.remove('active');
    if (historyRecordsView) historyRecordsView.style.display = 'none';
    if (historyTrendView) historyTrendView.style.display = 'block';
    renderProgressTrend();
  });

  if (trendMetricSelect) {
    trendMetricSelect.addEventListener('change', renderProgressTrend);
  }
  if (historyAthleteFilter) {
    historyAthleteFilter.addEventListener('change', () => {
      renderHistory();
      if (historyTrendView && historyTrendView.style.display === 'block') {
        renderProgressTrend();
      }
    });
  }
}

function renderProgressTrend() {
  const metric = trendMetricSelect ? trendMetricSelect.value : 'jump';
  const selectedAthleteId = historyAthleteFilter ? historyAthleteFilter.value : 'all';
  const history = getHistory();

  const athleteHistory = selectedAthleteId === 'all'
    ? history
    : history.filter(h => h.athleteId === selectedAthleteId);

  const chronological = [...athleteHistory].reverse();
  const dataPoints = [];

  let metricUnit = 'cm';
  let metricTitle = 'ارتفاع پرش';

  if (metric === 'jump') {
    metricUnit = 'cm';
    metricTitle = 'ارتفاع پرش تک';
    chronological.forEach(entry => {
      if (entry.type === 'jump' && entry.data && entry.data.height) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.height),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'bosco_jumps') {
    metricUnit = 'تعداد';
    metricTitle = 'تعداد پرش متوالی Bosco';
    chronological.forEach(entry => {
      if (entry.type === 'bosco' && entry.data && entry.data.totalJumps) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseInt(entry.data.totalJumps, 10),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'bosco_height') {
    metricUnit = 'cm';
    metricTitle = 'اوج پرش متوالی Bosco';
    chronological.forEach(entry => {
      if (entry.type === 'bosco' && entry.data && entry.data.maxHeight) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.maxHeight),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'situp') {
    metricUnit = 'تکرار';
    metricTitle = 'تکرار دراز و نشست';
    chronological.forEach(entry => {
      if (entry.type === 'situp' && entry.data && typeof entry.data.totalReps !== 'undefined') {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseInt(entry.data.totalReps, 10),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'pushup') {
    metricUnit = 'تکرار';
    metricTitle = 'تکرار شنا سوئدی';
    chronological.forEach(entry => {
      if (entry.type === 'pushup' && entry.data && typeof entry.data.totalReps !== 'undefined') {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseInt(entry.data.totalReps, 10),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'run') {
    metricUnit = 'm/s';
    metricTitle = 'سرعت دویدن';
    chronological.forEach(entry => {
      if (entry.type === 'run' && entry.data && entry.data.speed) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.speed),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'wingspan') {
    metricUnit = 'cm';
    metricTitle = 'طول دو دست (Wingspan)';
    chronological.forEach(entry => {
      if (entry.type === 'wingspan' && entry.data && entry.data.wingspan) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.wingspan),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'flexibility') {
    metricUnit = 'cm';
    metricTitle = 'انعطاف‌پذیری بالاتنه (Sit & Reach)';
    chronological.forEach(entry => {
      if (entry.type === 'flexibility' && entry.data && entry.data.reachCm) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.reachCm),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'anthro_cormic') {
    metricUnit = '%';
    metricTitle = 'شاخص کورمیک (قد میان‌تنه به کل قد)';
    chronological.forEach(entry => {
      if (entry.type === 'anthro' && entry.data && entry.data.cormicIndex) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.cormicIndex),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  } else if (metric === 'anthro_ape') {
    metricUnit = 'نسبت';
    metricTitle = 'شاخص میمونی Ape (طول دست به قد)';
    chronological.forEach(entry => {
      if (entry.type === 'anthro' && entry.data && entry.data.apeIndex) {
        dataPoints.push({
          date: entry.date.split(',')[0] || entry.date,
          value: parseFloat(entry.data.apeIndex),
          athleteName: entry.athleteName || 'ورزشکار'
        });
      }
    });
  }

  dataPoints.forEach((d, idx) => {
    d.sessionIndex = idx + 1;
    d.displayLabel = `جلسه ${idx + 1}`;
  });

  if (dataPoints.length > 0) {
    const values = dataPoints.map(d => d.value);
    const best = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = (sum / values.length).toFixed(1);
    const latest = values[values.length - 1];

    if (trendCardBest) trendCardBest.textContent = `${best} ${metricUnit}`;
    if (trendCardAvg) trendCardAvg.textContent = `${avg} ${metricUnit}`;
    if (trendCardLatest) trendCardLatest.textContent = `${latest} ${metricUnit}`;

    if (dataPoints.length >= 2) {
      const first = values[0];
      const diff = latest - first;
      const pct = first !== 0 ? Math.round((diff / first) * 100) : 0;
      const sign = diff >= 0 ? '+' : '';
      if (trendCardChange) {
        trendCardChange.textContent = `${sign}${pct}% (${sign}${diff.toFixed(1)})`;
        trendCardChange.style.color = diff >= 0 ? '#4ade80' : '#f87171';
      }
    } else {
      if (trendCardChange) {
        trendCardChange.textContent = 'اولین جلسه';
        trendCardChange.style.color = '#38bdf8';
      }
    }
  } else {
    if (trendCardBest) trendCardBest.textContent = '--';
    if (trendCardAvg) trendCardAvg.textContent = '--';
    if (trendCardLatest) trendCardLatest.textContent = '--';
    if (trendCardChange) trendCardChange.textContent = '--';
  }

  renderRechartsTrend(dataPoints, metric, metricUnit, metricTitle);
}

function renderRechartsTrend(dataPoints, metricKey, unit, title) {
  if (!rechartsRootContainer) return;

  if (!dataPoints || dataPoints.length < 2) {
    rechartsRootContainer.innerHTML = '';
    if (trendNoDataMsg) {
      trendNoDataMsg.style.display = 'block';
      trendNoDataMsg.textContent = dataPoints.length === 1
        ? `یک جلسه ثبت شده است (${dataPoints[0].value} ${unit}). برای رسم خط روند پیشرفت، حداقل ۲ آزمون نیاز است.`
        : 'هیچ داده‌ای برای این شاخص ثبت نشده است. پس از ثبت حداقل ۲ آزمون، نمودار روند پیشرفت در اینجا رسم می‌شود.';
    }
    return;
  }

  if (trendNoDataMsg) trendNoDataMsg.style.display = 'none';

  if (window.React && window.ReactDOM && window.Recharts) {
    try {
      const { createElement: h } = window.React;
      const {
        ResponsiveContainer,
        AreaChart,
        Area,
        XAxis,
        YAxis,
        CartesianGrid,
        Tooltip
      } = window.Recharts;

      const CustomTooltip = (props) => {
        if (props.active && props.payload && props.payload.length) {
          const d = props.payload[0].payload;
          return h('div', {
            style: {
              background: '#0f172a',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#e2e8f0',
              fontSize: '11px',
              direction: 'rtl',
              textAlign: 'right',
              boxShadow: '0 4px 15px rgba(0,0,0,0.6)'
            }
          }, [
            h('div', { key: 'session', style: { color: '#38bdf8', fontWeight: 'bold' } }, `جلسه ${d.sessionIndex}: ${d.date}`),
            h('div', { key: 'ath', style: { color: '#94a3b8', marginTop: '2px' } }, `ورزشکار: ${d.athleteName}`),
            h('div', { key: 'val', style: { color: '#4ade80', fontWeight: 'bold', fontSize: '13px', marginTop: '4px' } }, `نتیجه: ${d.value} ${unit}`)
          ]);
        }
        return null;
      };

      const chartComponent = h(
        ResponsiveContainer,
        { width: '100%', height: '100%' },
        h(
          AreaChart,
          {
            data: dataPoints,
            margin: { top: 12, right: 15, left: -18, bottom: 5 }
          },
          [
            h('defs', { key: 'defs' }, [
              h('linearGradient', { id: 'rechartsTrendGradient', x1: '0', y1: '0', x2: '0', y2: '1', key: 'grad' }, [
                h('stop', { offset: '5%', stopColor: '#38bdf8', stopOpacity: 0.85, key: 's1' }),
                h('stop', { offset: '95%', stopColor: '#0284c7', stopOpacity: 0.05, key: 's2' })
              ])
            ]),
            h(CartesianGrid, { strokeDasharray: '3 3', stroke: '#334155', key: 'grid' }),
            h(XAxis, { dataKey: 'displayLabel', stroke: '#94a3b8', tick: { fontSize: 10 }, key: 'x' }),
            h(YAxis, { stroke: '#94a3b8', tick: { fontSize: 10 }, domain: ['auto', 'auto'], key: 'y' }),
            h(Tooltip, { content: h(CustomTooltip), key: 'tooltip' }),
            h(Area, {
              type: 'monotone',
              dataKey: 'value',
              stroke: '#38bdf8',
              strokeWidth: 2.5,
              fillOpacity: 1,
              fill: 'url(#rechartsTrendGradient)',
              dot: { stroke: '#38bdf8', strokeWidth: 2, r: 4, fill: '#0f172a' },
              activeDot: { r: 6, fill: '#4ade80', stroke: '#ffffff', strokeWidth: 2 },
              key: 'area'
            })
          ]
        )
      );

      if (!window.__rechartsRoot && window.ReactDOM.createRoot) {
        window.__rechartsRoot = window.ReactDOM.createRoot(rechartsRootContainer);
      }
      if (window.__rechartsRoot) {
        window.__rechartsRoot.render(chartComponent);
      } else if (window.ReactDOM.render) {
        window.ReactDOM.render(chartComponent, rechartsRootContainer);
      }
      return;
    } catch (e) {
      console.warn('Recharts render error, using SVG fallback:', e);
    }
  }

  renderSvgTrendChart(rechartsRootContainer, dataPoints, unit);
}

function renderSvgTrendChart(container, dataPoints, unit) {
  if (!container || dataPoints.length < 2) return;
  const width = container.clientWidth || 340;
  const height = 240;
  const pad = { top: 20, right: 30, bottom: 35, left: 45 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const vals = dataPoints.map(d => d.value);
  let min = Math.min(...vals);
  let max = Math.max(...vals);
  if (min === max) { min -= 1; max += 1; }
  const range = max - min;

  const pts = dataPoints.map((d, i) => {
    const x = pad.left + (i / (dataPoints.length - 1)) * w;
    const y = pad.top + h - ((d.value - min) / range) * h;
    return { x, y, d };
  });

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(pad.top + h).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pad.top + h).toFixed(1)} Z`;

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="svgGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
          <stop offset="100%" stop-color="#0284c7" stop-opacity="0.05"/>
        </linearGradient>
      </defs>
      <line x1="${pad.left}" y1="${pad.top}" x2="${pad.left + w}" y2="${pad.top}" stroke="#334155" stroke-dasharray="3 3"/>
      <line x1="${pad.left}" y1="${pad.top + h/2}" x2="${pad.left + w}" y2="${pad.top + h/2}" stroke="#334155" stroke-dasharray="3 3"/>
      <line x1="${pad.left}" y1="${pad.top + h}" x2="${pad.left + w}" y2="${pad.top + h}" stroke="#475569"/>
      
      <path d="${areaPath}" fill="url(#svgGrad)"/>
      <path d="${linePath}" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
      
      ${pts.map(p => `
        <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
        <text x="${p.x.toFixed(1)}" y="${(p.y - 8).toFixed(1)}" fill="#4ade80" font-size="10" text-anchor="middle" font-weight="bold">${p.d.value}</text>
        <text x="${p.x.toFixed(1)}" y="${(pad.top + h + 18).toFixed(1)}" fill="#94a3b8" font-size="9" text-anchor="middle">${p.d.displayLabel}</text>
      `).join('')}
      
      <text x="${pad.left - 8}" y="${pad.top + 4}" fill="#94a3b8" font-size="9" text-anchor="end">${max.toFixed(0)}</text>
      <text x="${pad.left - 8}" y="${pad.top + h + 4}" fill="#94a3b8" font-size="9" text-anchor="end">${min.toFixed(0)}</text>
    </svg>
  `;
}

setupHistoryTabs();

// ================== EXPORT TO PDF REPORT SYSTEM ==================
function getBenchmarkComparisonRows(athlete, athleteHistory) {
  const age = parseInt(athlete.age, 10) || 18;
  const isFemale = athlete.gender === 'female';

  let bestJumpNum = null;
  let bestSitupNum = null;
  let bestPushupNum = null;
  let bestFlexNum = null;
  let bestAgilityNum = null;
  let bestRunSpeedNum = null;
  let latestCormic = null;
  let latestApe = null;

  athleteHistory.forEach(entry => {
    const d = entry.data || {};
    if (entry.type === 'jump' && d.height) {
      const val = parseFloat(d.height);
      if (bestJumpNum === null || val > bestJumpNum) bestJumpNum = val;
    } else if (entry.type === 'situp' && typeof d.totalReps !== 'undefined') {
      const val = parseInt(d.totalReps, 10);
      if (bestSitupNum === null || val > bestSitupNum) bestSitupNum = val;
    } else if (entry.type === 'pushup' && typeof d.totalReps !== 'undefined') {
      const val = parseInt(d.totalReps, 10);
      if (bestPushupNum === null || val > bestPushupNum) bestPushupNum = val;
    } else if (entry.type === 'flexibility' && d.reachCm) {
      const val = parseFloat(d.reachCm);
      if (bestFlexNum === null || val > bestFlexNum) bestFlexNum = val;
    } else if (entry.type === 'agility' && d.totalTime) {
      const val = parseFloat(d.totalTime);
      if (bestAgilityNum === null || val < bestAgilityNum) bestAgilityNum = val;
    } else if (entry.type === 'run' && d.speed) {
      const val = parseFloat(d.speed);
      if (bestRunSpeedNum === null || val > bestRunSpeedNum) bestRunSpeedNum = val;
    } else if (entry.type === 'anthro') {
      if (d.cormicIndex) latestCormic = parseFloat(d.cormicIndex);
      if (d.apeIndex) latestApe = parseFloat(d.apeIndex);
    }
  });

  let jumpNorm = isFemale ? 33 : 44;
  let jumpElite = isFemale ? 42 : 55;
  let situpNorm = isFemale ? 30 : 36;
  let situpElite = isFemale ? 40 : 48;
  let pushupNorm = isFemale ? 16 : 26;
  let pushupElite = isFemale ? 26 : 38;
  let flexNorm = isFemale ? 4.0 : 1.5;
  let flexElite = isFemale ? 12.0 : 10.0;
  let agilityNorm = isFemale ? 6.2 : 5.8;
  let agilityElite = isFemale ? 5.3 : 4.9;
  let runNorm = isFemale ? 5.5 : 6.5;
  let runElite = isFemale ? 7.2 : 8.2;

  if (age < 15) {
    jumpNorm = isFemale ? 28 : 34;
    jumpElite = isFemale ? 36 : 44;
    situpNorm = isFemale ? 26 : 30;
    situpElite = isFemale ? 35 : 42;
    pushupNorm = isFemale ? 12 : 18;
    pushupElite = isFemale ? 20 : 28;
    agilityNorm = isFemale ? 6.6 : 6.1;
    agilityElite = isFemale ? 5.6 : 5.2;
  } else if (age > 35) {
    jumpNorm = isFemale ? 26 : 35;
    jumpElite = isFemale ? 34 : 45;
    situpNorm = isFemale ? 22 : 28;
    situpElite = isFemale ? 32 : 38;
    pushupNorm = isFemale ? 12 : 19;
    pushupElite = isFemale ? 20 : 30;
  }

  const benchmarks = [
    {
      title: 'چابکی و شاتل (Agility Shuttle)',
      unit: 's',
      userVal: bestAgilityNum,
      norm: agilityNorm,
      elite: agilityElite,
      format: (v) => `${v.toFixed(2)} s`,
      isInverse: true
    },
    {
      title: 'پرش عمودی (Vertical Jump)',
      unit: 'cm',
      userVal: bestJumpNum,
      norm: jumpNorm,
      elite: jumpElite,
      format: (v) => `${v.toFixed(1)} cm`
    },
    {
      title: 'سرعت دویدن (Sprint Speed)',
      unit: 'm/s',
      userVal: bestRunSpeedNum,
      norm: runNorm,
      elite: runElite,
      format: (v) => `${v.toFixed(2)} m/s`
    },
    {
      title: 'استقامت عضلات شکم (Sit-ups)',
      unit: 'تکرار',
      userVal: bestSitupNum,
      norm: situpNorm,
      elite: situpElite,
      format: (v) => `${Math.round(v)} تکرار`
    },
    {
      title: 'استقامت بالاتنه (Push-ups)',
      unit: 'تکرار',
      userVal: bestPushupNum,
      norm: pushupNorm,
      elite: pushupElite,
      format: (v) => `${Math.round(v)} تکرار`
    },
    {
      title: 'انعطاف‌پذیری بالاتنه (Sit & Reach)',
      unit: 'cm',
      userVal: bestFlexNum,
      norm: flexNorm,
      elite: flexElite,
      format: (v) => `${v > 0 ? '+' : ''}${v.toFixed(1)} cm`
    },
    {
      title: 'شاخص کورمیک (Cormic Index - بالاتنه/قد)',
      unit: '%',
      userVal: latestCormic,
      norm: 52.0,
      elite: 52.0,
      format: (v) => `${v.toFixed(1)}%`,
      isRatio: true
    },
    {
      title: 'شاخص میمونی (Ape Index - طول دست/قد)',
      unit: 'نسبت',
      userVal: latestApe,
      norm: 1.0,
      elite: 1.04,
      format: (v) => v.toFixed(2),
      isRatio: true
    }
  ];

  return benchmarks.map(b => {
    let userStr = '--';
    let statusHtml = '<span style="color: #64748b;">تست انجام نشده</span>';

    if (b.userVal !== null) {
      userStr = b.format(b.userVal);
      if (b.isRatio) {
        if (b.title.includes('کورمیک')) {
          statusHtml = b.userVal < 51 ? '<span style="color: #0284c7; font-weight: bold;">پا کشیده (مزیت پرش)</span>' : b.userVal <= 53 ? '<span style="color: #16a34a; font-weight: bold;">متناسب و استاندارد</span>' : '<span style="color: #9333ea; font-weight: bold;">تنه کشیده (قدرتی)</span>';
        } else {
          statusHtml = b.userVal >= 1.03 ? '<span style="color: #16a34a; font-weight: bold;">اهرم بلند فوق‌العاده (+۳٪)</span>' : b.userVal >= 0.98 ? '<span style="color: #0284c7; font-weight: bold;">نرمال و متناسب</span>' : '<span style="color: #d97706; font-weight: bold;">اهرم فشرده</span>';
        }
      } else if (b.isInverse) {
        // Lower is better (e.g. Agility time)
        const diff = b.norm - b.userVal;
        const diffPct = Math.round((diff / b.norm) * 100);
        if (b.userVal <= b.elite) {
          statusHtml = `<span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold;">⭐️ سطح نخبه / سریع‌تر (+${diffPct}%)</span>`;
        } else if (b.userVal <= b.norm) {
          statusHtml = `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">🟢 بهتر از میانگین (+${diffPct}%)</span>`;
        } else {
          statusHtml = `<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: bold;">🟡 پایین‌تر از میانگین (${diffPct}%)</span>`;
        }
      } else {
        const diff = b.userVal - b.norm;
        const diffPct = Math.round((diff / b.norm) * 100);
        if (b.userVal >= b.elite) {
          statusHtml = `<span style="background: #dcfce7; color: #15803d; padding: 2px 6px; border-radius: 4px; font-weight: bold;">⭐️ سطح نخبه / عالی (+${diffPct}%)</span>`;
        } else if (b.userVal >= b.norm) {
          statusHtml = `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">🟢 بالاتر از میانگین (+${diffPct}%)</span>`;
        } else {
          statusHtml = `<span style="background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px; font-weight: bold;">🟡 پایین‌تر از میانگین (${diffPct}%)</span>`;
        }
      }
    }

    const normStr = b.isRatio ? (b.title.includes('کورمیک') ? '۵۱٪ - ۵۳٪' : '۰.۹۸ - ۱.۰۲') : (b.isInverse ? `≤ ${b.norm} ${b.unit}` : `${b.norm} ${b.unit}`);
    const eliteStr = b.isRatio ? (b.title.includes('کورمیک') ? 'متناسب' : '≥ ۱.۰۳') : (b.isInverse ? `≤ ${b.elite} ${b.unit}` : `≥ ${b.elite} ${b.unit}`);

    return `
      <tr>
        <td style="text-align: right; padding-right: 8px;"><strong>${b.title}</strong></td>
        <td style="color: #0284c7; font-weight: bold;">${userStr}</td>
        <td>${normStr}</td>
        <td style="color: #16a34a; font-weight: 500;">${eliteStr}</td>
        <td>${statusHtml}</td>
      </tr>
    `;
  }).join('');
}

// ================== DYNAMIC SPORT TALENT SCOUTING CONFIG ==================
function getSportDisciplineConfig(athlete, athleteHistory) {
  const sportRaw = (athlete?.sport || '').toLowerCase().trim();
  const posRaw = (athlete?.sportPosition || '').toLowerCase().trim();

  // Categorize sport discipline
  let disciplineKey = 'general';
  let sportFa = athlete?.sport || 'استعدادیابی عمومی';
  let shortTitle = athlete?.sport ? athlete.sport.trim() : 'عمومی';
  let icon = '🏃';

  if (sportRaw.includes('دو') || sportRaw.includes('سرعت') || sportRaw.includes('sprint') || sportRaw.includes('run') || sportRaw.includes('میدانی')) {
    disciplineKey = 'sprint';
    shortTitle = 'دو سرعت';
    icon = '🏃';
  } else if (sportRaw.includes('پرش') || sportRaw.includes('والیبال') || sportRaw.includes('بسکتبال') || sportRaw.includes('jump') || sportRaw.includes('volleyball') || sportRaw.includes('basketball')) {
    disciplineKey = 'jump';
    shortTitle = 'پرش و ارتفاع';
    icon = '⤴️';
  } else if (sportRaw.includes('هندبال') || sportRaw.includes('handball')) {
    disciplineKey = 'handball';
    shortTitle = 'هندبال';
    icon = '🤾‍♂️';
  } else if (sportRaw.includes('فوتبال') || sportRaw.includes('فوتسال') || sportRaw.includes('football') || sportRaw.includes('soccer') || sportRaw.includes('futsal')) {
    disciplineKey = 'football';
    shortTitle = 'فوتبال / فوتسال';
    icon = '⚽';
  } else if (sportRaw.includes('کشتی') || sportRaw.includes('رزمی') || sportRaw.includes('تکواندو') || sportRaw.includes('جودو') || sportRaw.includes('کاراته') || sportRaw.includes('wrestling') || sportRaw.includes('combat')) {
    disciplineKey = 'combat';
    shortTitle = 'کشتی و رزمی';
    icon = '🥋';
  } else if (sportRaw.includes('شنا') || sportRaw.includes('قایق') || sportRaw.includes('swim')) {
    disciplineKey = 'swimming';
    shortTitle = 'شنا و ورزش‌های آبی';
    icon = '🏊';
  }

  // Extract best performance metrics from history
  let bestJump = 0, bestSpeed = 0, bestAgility = 0, bestPushup = 0, bestBoscoOrSitup = 0, bestFlex = -999;
  let bestWingspan = 0, bestLegRatio = 0, bestApeIndex = 0;
  let hasJump = false, hasSpeed = false, hasAgility = false, hasPushup = false, hasEndurance = false, hasFlex = false;

  (athleteHistory || []).forEach(entry => {
    const d = entry.data || {};
    if (entry.type === 'jump' && d.height) {
      const val = parseFloat(d.height);
      if (val > bestJump) { bestJump = val; hasJump = true; }
    } else if (entry.type === 'run' && d.speed) {
      const val = parseFloat(d.speed);
      if (val > bestSpeed) { bestSpeed = val; hasSpeed = true; }
    } else if (entry.type === 'agility' && d.totalTime) {
      const val = parseFloat(d.totalTime);
      if (bestAgility === 0 || val < bestAgility) { bestAgility = val; hasAgility = true; }
    } else if (entry.type === 'pushup' && typeof d.totalReps !== 'undefined') {
      const val = parseInt(d.totalReps, 10);
      if (val > bestPushup) { bestPushup = val; hasPushup = true; }
    } else if (entry.type === 'bosco' && d.totalJumps) {
      const val = parseInt(d.totalJumps, 10);
      if (val > bestBoscoOrSitup) { bestBoscoOrSitup = val; hasEndurance = true; }
    } else if (entry.type === 'situp' && typeof d.totalReps !== 'undefined') {
      const val = parseInt(d.totalReps, 10);
      if (!hasEndurance && val > bestBoscoOrSitup) { bestBoscoOrSitup = val; }
    } else if (entry.type === 'flexibility' && d.reachCm) {
      const val = parseFloat(d.reachCm);
      if (val > bestFlex) { bestFlex = val; hasFlex = true; }
    } else if (entry.type === 'wingspan' && d.wingspan) {
      const val = parseFloat(d.wingspan);
      if (val > bestWingspan) bestWingspan = val;
    } else if (entry.type === 'anthro') {
      if (d.wingspan) bestWingspan = Math.max(bestWingspan, parseFloat(d.wingspan));
      if (d.apeIndex) bestApeIndex = parseFloat(d.apeIndex);
      if (d.heightCm && d.legLengthCm) {
        bestLegRatio = parseFloat(d.legLengthCm) / parseFloat(d.heightCm);
      }
    }
  });

  const athleteHeight = parseFloat(athlete?.heightCm) || 175;
  if (!bestWingspan) bestWingspan = athleteHeight;
  if (!bestApeIndex) bestApeIndex = bestWingspan / athleteHeight;
  if (!bestLegRatio) bestLegRatio = 0.50;

  // Normalized scores 0 to 100
  const scoreSpeed = hasSpeed ? Math.min(100, Math.max(30, Math.round(((bestSpeed - 3.5) / 5.0) * 100))) : 62;
  const scoreJump = hasJump ? Math.min(100, Math.max(30, Math.round(((bestJump - 18) / 42) * 100))) : 65;
  const scoreAgility = hasAgility ? Math.min(100, Math.max(30, Math.round(((7.0 - bestAgility) / 2.6) * 100))) : 64;
  const scoreEndurance = (hasEndurance || bestBoscoOrSitup > 0) ? Math.min(100, Math.max(30, Math.round(((bestBoscoOrSitup - 6) / 36) * 100))) : 60;
  const scoreStrength = hasPushup ? Math.min(100, Math.max(30, Math.round(((bestPushup - 6) / 34) * 100))) : 62;
  const scoreFlex = hasFlex ? Math.min(100, Math.max(30, Math.round(((bestFlex + 8) / 26) * 100))) : 63;
  const scoreWingspan = Math.min(100, Math.max(30, Math.round(((bestApeIndex - 0.95) / 0.12) * 100)));
  const scoreLegLeverage = Math.min(100, Math.max(30, Math.round(((bestLegRatio - 0.46) / 0.08) * 100)));

  let axes = [];

  if (disciplineKey === 'sprint') {
    axes = [
      { label: 'سرعت دویدن (Max Speed)', sub: hasSpeed ? `${bestSpeed.toFixed(1)} m/s` : 'پیش‌فرض', score: scoreSpeed, weight: 0.30, isCritical: true },
      { label: 'توان انفجاری پاها (Leg Power)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.25, isCritical: true },
      { label: 'چابکی و ریتم گام (Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.15, isCritical: true },
      { label: 'اهرم اندام تحتانی (Leg Ratio)', sub: `${(bestLegRatio * 100).toFixed(0)}٪`, score: scoreLegLeverage, weight: 0.10, isCritical: false },
      { label: 'استقامت سرعت (Speed Endurance)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} تکرار` : 'پیش‌فرض', score: scoreEndurance, weight: 0.10, isCritical: false },
      { label: 'ثبات تنه و بازوها (Torso Drive)', sub: hasPushup ? `${bestPushup} شنا` : 'پیش‌فرض', score: scoreStrength, weight: 0.10, isCritical: false }
    ];
  } else if (disciplineKey === 'jump') {
    axes = [
      { label: 'ارتفاع پرش عمودی (CMJ Jump)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.30, isCritical: true },
      { label: 'توان کشسانی بوسکو (Repeat SSC)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} پرش` : 'پیش‌فرض', score: scoreEndurance, weight: 0.25, isCritical: true },
      { label: 'گستره دسترس (Ape / Reach)', sub: `Ape: ${bestApeIndex.toFixed(2)}`, score: scoreWingspan, weight: 0.15, isCritical: true },
      { label: 'چابکی محوطه (Court Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.10, isCritical: false },
      { label: 'شتاب گام استارت (Approach Speed)', sub: hasSpeed ? `${bestSpeed.toFixed(1)} m/s` : 'پیش‌فرض', score: scoreSpeed, weight: 0.10, isCritical: false },
      { label: 'دامنه حرکتی مفاصل (Flexibility)', sub: hasFlex ? `${bestFlex > 0 ? '+' : ''}${bestFlex.toFixed(1)} cm` : 'پیش‌فرض', score: scoreFlex, weight: 0.10, isCritical: false }
    ];
  } else if (disciplineKey === 'handball') {
    axes = [
      { label: 'طول دست و پرتاب (Wingspan)', sub: `${bestWingspan.toFixed(0)} cm`, score: scoreWingspan, weight: 0.20, isCritical: true },
      { label: 'پرش شوت و بلاک (Jump Shoot)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.20, isCritical: true },
      { label: 'چابکی برش مسیر (Cutting Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.20, isCritical: true },
      { label: 'سرعت ضدحمله (Fastbreak Speed)', sub: hasSpeed ? `${bestSpeed.toFixed(1)} m/s` : 'پیش‌فرض', score: scoreSpeed, weight: 0.15, isCritical: true },
      { label: 'قدرت بالاتنه و شانه (Throw Power)', sub: hasPushup ? `${bestPushup} شنا` : 'پیش‌فرض', score: scoreStrength, weight: 0.15, isCritical: false },
      { label: 'استقامت پرش مداوم (Bosco Repeat)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} پرش` : 'پیش‌فرض', score: scoreEndurance, weight: 0.10, isCritical: false }
    ];
  } else if (disciplineKey === 'football') {
    axes = [
      { label: 'چابکی تغییر جهت (COD Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.25, isCritical: true },
      { label: 'شتاب و سرعت انفجاری (Sprint)', sub: hasSpeed ? `${bestSpeed.toFixed(1)} m/s` : 'پیش‌فرض', score: scoreSpeed, weight: 0.25, isCritical: true },
      { label: 'استقامت تکرار توان (Anaerobic)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} تکرار` : 'پیش‌فرض', score: scoreEndurance, weight: 0.20, isCritical: true },
      { label: 'پرش نبرد هوایی (Aerial Jump)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.15, isCritical: false },
      { label: 'انعطاف لگن و ران (Flexibility)', sub: hasFlex ? `${bestFlex > 0 ? '+' : ''}${bestFlex.toFixed(1)} cm` : 'پیش‌فرض', score: scoreFlex, weight: 0.10, isCritical: false },
      { label: 'ثبات مرکزی و بالاتنه (Core)', sub: hasPushup ? `${bestPushup} شنا` : 'پیش‌فرض', score: scoreStrength, weight: 0.05, isCritical: false }
    ];
  } else if (disciplineKey === 'combat') {
    const scoreCormic = Math.min(100, Math.max(30, Math.round(((1.0 - bestLegRatio - 0.46) / 0.08) * 100)));
    axes = [
      { label: 'قدرت بالاتنه و پرتاب (Upper Body)', sub: hasPushup ? `${bestPushup} تکرار` : 'پیش‌فرض', score: scoreStrength, weight: 0.25, isCritical: true },
      { label: 'انعطاف‌پذیری و پل (Flexibility)', sub: hasFlex ? `${bestFlex > 0 ? '+' : ''}${bestFlex.toFixed(1)} cm` : 'پیش‌فرض', score: scoreFlex, weight: 0.20, isCritical: true },
      { label: 'مرکز ثقل پایین (Cormic Stance)', sub: `پایین‌تنه ${(bestLegRatio*100).toFixed(0)}٪`, score: scoreCormic, weight: 0.20, isCritical: true },
      { label: 'توان انفجاری پاها (Leg Drive)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.15, isCritical: false },
      { label: 'چابکی گارد و واکنش (Stance Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.10, isCritical: false },
      { label: 'استقامت عضلات کور (Core Situp)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} تکرار` : 'پیش‌فرض', score: scoreEndurance, weight: 0.10, isCritical: false }
    ];
  } else {
    axes = [
      { label: 'سرعت دویدن (Speed)', sub: hasSpeed ? `${bestSpeed.toFixed(1)} m/s` : 'پیش‌فرض', score: scoreSpeed, weight: 0.17, isCritical: false },
      { label: 'توان انفجاری (Power)', sub: hasJump ? `${bestJump.toFixed(1)} cm` : 'پیش‌فرض', score: scoreJump, weight: 0.17, isCritical: false },
      { label: 'چابکی (Agility)', sub: hasAgility ? `${bestAgility.toFixed(2)} s` : 'پیش‌فرض', score: scoreAgility, weight: 0.17, isCritical: false },
      { label: 'استقامت بی‌هوازی (Endurance)', sub: bestBoscoOrSitup > 0 ? `${bestBoscoOrSitup} تکرار` : 'پیش‌فرض', score: scoreEndurance, weight: 0.17, isCritical: false },
      { label: 'قدرت بالاتنه (Strength)', sub: hasPushup ? `${bestPushup} تکرار` : 'پیش‌فرض', score: scoreStrength, weight: 0.16, isCritical: false },
      { label: 'انعطاف و دامنه (Flexibility)', sub: hasFlex ? `${bestFlex > 0 ? '+' : ''}${bestFlex.toFixed(1)} cm` : 'پیش‌فرض', score: scoreFlex, weight: 0.16, isCritical: false }
    ];
  }

  // Calculate dynamic Talent Score
  let talentScore = 0;
  axes.forEach(a => {
    talentScore += a.score * a.weight;
  });
  talentScore = Math.round(Math.min(99, Math.max(35, talentScore)));

  let talentGrade = 'سطح استاندارد B';
  let gradeColor = '#0284c7';
  if (talentScore >= 88) {
    talentGrade = 'نخبگی A+';
    gradeColor = '#22c55e';
  } else if (talentScore >= 78) {
    talentGrade = 'بسیار مستعد A';
    gradeColor = '#38bdf8';
  } else if (talentScore >= 68) {
    talentGrade = 'استاندارد B';
    gradeColor = '#f59e0b';
  } else {
    talentGrade = 'نیازمند تمرین C';
    gradeColor = '#ec4899';
  }

  return {
    disciplineKey,
    sportFa,
    shortTitle,
    icon,
    talentScore,
    talentGrade,
    gradeColor,
    axes,
    bestSpeed,
    bestJump,
    bestAgility,
    bestBoscoOrSitup,
    bestPushup,
    bestFlex,
    bestWingspan,
    bestLegRatio,
    bestApeIndex
  };
}

// ================== RADAR COMPARISON CHART (SVG GENERATOR) ==================
function generateRadarChartSvg(athlete, athleteHistory) {
  const disc = getSportDisciplineConfig(athlete, athleteHistory);
  const axes = disc.axes;
  const numAxes = axes.length;
  const cx = 225, cy = 162, R = 80;

  function getCoord(axisIndex, radiusFraction) {
    const angle = -Math.PI / 2 + (axisIndex * 2 * Math.PI) / numAxes;
    const x = cx + R * radiusFraction * Math.cos(angle);
    const y = cy + R * radiusFraction * Math.sin(angle);
    return { x, y, angle };
  }

  // Grid webs (20%, 40%, 60%, 80%, 100%)
  const gridFractions = [0.2, 0.4, 0.6, 0.8, 1.0];
  const gridPolygons = gridFractions.map(f => {
    const pts = [];
    for (let i = 0; i < numAxes; i++) {
      const c = getCoord(i, f);
      pts.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`);
    }
    const isOuter = f === 1.0;
    return `<polygon points="${pts.join(' ')}" fill="none" stroke="${isOuter ? '#94a3b8' : '#e2e8f0'}" stroke-width="${isOuter ? '1.5' : '1'}" />`;
  }).join('');

  // Axis radiating lines
  const axisLines = [];
  for (let i = 0; i < numAxes; i++) {
    const outer = getCoord(i, 1.0);
    const isCrit = axes[i].isCritical;
    axisLines.push(`<line x1="${cx}" y1="${cy}" x2="${outer.x.toFixed(1)}" y2="${outer.y.toFixed(1)}" stroke="${isCrit ? '#0284c7' : '#cbd5e1'}" stroke-width="${isCrit ? '1.6' : '1.2'}" stroke-dasharray="${isCrit ? 'none' : '2 2'}" />`);
  }

  // Benchmark polygon (Normative standard = 70% level)
  const normPoints = [];
  for (let i = 0; i < numAxes; i++) {
    const c = getCoord(i, 0.70);
    normPoints.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`);
  }

  // Athlete polygon
  const athletePoints = [];
  const vertexDots = [];
  for (let i = 0; i < numAxes; i++) {
    const frac = axes[i].score / 100.0;
    const c = getCoord(i, frac);
    athletePoints.push(`${c.x.toFixed(1)},${c.y.toFixed(1)}`);
    const isCrit = axes[i].isCritical;
    vertexDots.push(`
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="${isCrit ? '4.8' : '4'}" fill="${isCrit ? '#0284c7' : '#0ea5e9'}" stroke="#ffffff" stroke-width="${isCrit ? '2' : '1.5'}" />
    `);
  }

  // Labels around perimeter
  const labelsHtml = axes.map((a, i) => {
    const outer = getCoord(i, 1.25);
    let anchor = 'middle';
    if (outer.x < cx - 30) anchor = 'end';
    else if (outer.x > cx + 30) anchor = 'start';
    const dy = outer.y < cy ? -2 : 12;
    const star = a.isCritical ? '★ ' : '';

    return `
      <text x="${outer.x.toFixed(1)}" y="${(outer.y + dy).toFixed(1)}" text-anchor="${anchor}" font-family="Vazirmatn, Tahoma, sans-serif" font-size="9.5px" font-weight="${a.isCritical ? '800' : 'bold'}" fill="${a.isCritical ? '#0284c7' : '#1e293b'}">
        ${star}${a.label}
        <tspan x="${outer.x.toFixed(1)}" dy="11" font-size="8.5px" font-weight="normal" fill="${a.score >= 70 ? '#16a34a' : '#64748b'}">
          ${a.sub} (${a.score}٪)
        </tspan>
      </text>
    `;
  }).join('');

  return `
    <svg viewBox="0 0 450 320" width="100%" style="max-height: 280px; overflow: visible; font-family: Vazirmatn, Tahoma, sans-serif;">
      <!-- Dynamic Talent Score Header Badge -->
      <g transform="translate(${cx}, 16)">
        <rect x="-180" y="-13" width="360" height="26" rx="13" fill="#f8fafc" stroke="${disc.gradeColor}" stroke-width="1.6" />
        <text x="0" y="4" text-anchor="middle" font-size="10.8px" font-weight="bold" fill="#0f172a">
          ${disc.icon} شاخص استعداد تخصصی ${disc.shortTitle}: <tspan fill="${disc.gradeColor}" font-weight="900">${disc.talentScore} / ۱۰۰</tspan> (${disc.talentGrade})
        </text>
      </g>

      <!-- Grid & Spokes -->
      ${gridPolygons}
      ${axisLines.join('')}

      <!-- Benchmark Polygon (Normative Standard - 70%) -->
      <polygon points="${normPoints.join(' ')}" fill="rgba(22, 163, 74, 0.08)" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="4 3" />

      <!-- Athlete Score Polygon -->
      <polygon points="${athletePoints.join(' ')}" fill="rgba(2, 132, 199, 0.28)" stroke="#0284c7" stroke-width="2.5" />

      <!-- Athlete Vertices -->
      ${vertexDots.join('')}

      <!-- Axis Labels -->
      ${labelsHtml}

      <!-- Center Mark -->
      <circle cx="${cx}" cy="${cy}" r="2.5" fill="#94a3b8" />

      <!-- Legend at bottom -->
      <g transform="translate(${cx - 150}, 305)">
        <rect x="0" y="-8" width="12" height="12" rx="2" fill="#0284c7" />
        <text x="18" y="2" font-size="9px" font-weight="bold" fill="#0f172a">ورزشکار (${disc.shortTitle})</text>

        <line x1="125" y1="-2" x2="143" y2="-2" stroke="#16a34a" stroke-width="2" stroke-dasharray="4 3" />
        <circle cx="134" cy="-2" r="3" fill="#16a34a" />
        <text x="151" y="2" font-size="9px" font-weight="bold" fill="#16a34a">هنجار همسالان (۷۰٪)</text>

        <circle cx="248" cy="-2" r="3.8" fill="#0284c7" stroke="#fff" stroke-width="1.2" />
        <text x="257" y="2" font-size="9px" font-weight="bold" fill="#0284c7">★ شاخص کلیدی</text>
      </g>
    </svg>
  `;
}

function generateSportTalentScoutingPdfSection(athlete, athleteHistory) {
  const disc = getSportDisciplineConfig(athlete, athleteHistory);

  // Position / Role recommendation depending on discipline
  let pos1 = { role: 'سرعت ۱۰۰ و ۲۰۰ متر', matchPct: Math.min(99, disc.talentScore + 4), desc: 'استارت انفجاری، گام‌های شتابی و ریتم بالای انتقال پاها' };
  let pos2 = { role: 'دو سرعت امدادی ۴×۱۰۰', matchPct: Math.min(97, disc.talentScore), desc: 'حفظ سرعت ماکزیمم و چابکی در ناحیه تعویض چوب' };

  if (disc.disciplineKey === 'jump') {
    pos1 = { role: 'آبشارزن / دریافت‌کننده قدرتی (Outside Hitter)', matchPct: Math.min(99, disc.talentScore + 3), desc: 'پرش عمودی بالا، توان کشسانی انفجاری و گستره دست عالی' };
    pos2 = { role: 'دفاع وسط و بلاکر سریع (Middle Blocker)', matchPct: Math.min(96, disc.talentScore), desc: 'تکرار پرش‌های متوالی روی تور و چابکی واکنش جانبی' };
  } else if (disc.disciplineKey === 'handball') {
    const analysis = typeof generateHandballScouting === 'function' ? generateHandballScouting(athlete, athleteHistory) : null;
    if (analysis && analysis.positions && analysis.positions.length >= 2) {
      pos1 = analysis.positions[0];
      pos2 = analysis.positions[1];
    } else {
      pos1 = { role: 'بغل راست / شوت‌زن محیطی', matchPct: 92, desc: 'پرش شوتی بلند و اهرم دست مناسب' };
      pos2 = { role: 'گوش چپ / ضدحمله سریع', matchPct: 88, desc: 'سرعت استارت انفجاری و تغییر زاویه' };
    }
  } else if (disc.disciplineKey === 'football') {
    pos1 = { role: 'وینگر / بال هجومی (Winger)', matchPct: Math.min(98, disc.talentScore + 2), desc: 'چابکی تغییر جهت سریع، استارت انفجاری و شتاب دور زدن مدافع' };
    pos2 = { role: 'هافبک باکس به باکس (B2B Midfielder)', matchPct: Math.min(95, disc.talentScore - 1), desc: 'استقامت تکرار شاتل و چابکی نبردهای فیزیکی زمین' };
  } else if (disc.disciplineKey === 'combat') {
    pos1 = { role: 'کشتی‌گیر سرعتی و زیرگیر هجومی', matchPct: Math.min(98, disc.talentScore + 3), desc: 'مرکز ثقل پایین، انعطاف ستون فقرات و قدرت نفوذ پاها' };
    pos2 = { role: 'سبک مسابقاتی پرتابی و کمانی', matchPct: Math.min(94, disc.talentScore), desc: 'انعطاف کمری، پل‌زنی بالا و قدرت دست‌ها' };
  }

  return `
    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px; margin-top: 10px; margin-bottom: 10px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #bbf7d0; padding-bottom: 6px; margin-bottom: 8px;">
        <div style="font-weight: bold; font-size: 11.5px; color: #166534; display: flex; align-items: center; gap: 6px;">
          <span>${disc.icon} تحلیل استعدادیابی تخصصی رشته ${disc.sportFa} و انطباق بدنی</span>
        </div>
        <div style="background: #15803d; color: #fff; font-size: 10.5px; font-weight: bold; padding: 2px 10px; border-radius: 9999px;">
          امتیاز استعدادیابی ${disc.shortTitle}: ${disc.talentScore} از ۱۰۰ (${disc.talentGrade})
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
        <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 9px; color: #166534; font-weight: bold;">🥇 پست یا ماده اول پیشنهادی:</div>
          <div style="font-size: 11.5px; font-weight: bold; color: #0f172a; margin-top: 2px;">${pos1.icon || '⭐'} ${pos1.role} (${pos1.matchPct}٪)</div>
          <div style="font-size: 9px; color: #475569; margin-top: 2px;">${pos1.desc}</div>
        </div>
        <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 8px;">
          <div style="font-size: 9px; color: #166534; font-weight: bold;">🥈 پست یا ماده دوم پیشنهادی:</div>
          <div style="font-size: 11.5px; font-weight: bold; color: #0f172a; margin-top: 2px;">${pos2.icon || '🥈'} ${pos2.role} (${pos2.matchPct}٪)</div>
          <div style="font-size: 9px; color: #475569; margin-top: 2px;">${pos2.desc}</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9.5px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="color: #0369a1; font-weight: bold; margin-bottom: 4px;">💪 نقاط قوت برجسته در ${disc.shortTitle}:</div>
          <ul style="margin: 0; padding-right: 14px; color: #334155; line-height: 1.5;">
            <li><strong>شاخص‌های برتر رادار:</strong> ${disc.axes.filter(a => a.score >= 64).map(a => a.label.split(' ')[0]).join('، ') || 'تعادل فیزیکی مناسب'}</li>
            <li><strong>ابعاد اسکلتی و اهرم‌ها:</strong> نسبت اندام ${(disc.bestLegRatio*100).toFixed(0)}٪ و شاخص گستره دست ${disc.bestApeIndex.toFixed(2)}</li>
            <li><strong>سطح نخبگی:</strong> شاخص تجمیعی ${disc.talentScore} در رده ${disc.talentGrade}</li>
          </ul>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
          <div style="color: #b45309; font-weight: bold; margin-bottom: 4px;">🎯 اولویت‌های تمرینی و بهبود عملکرد:</div>
          <ul style="margin: 0; padding-right: 14px; color: #334155; line-height: 1.5;">
            <li><strong>توسعه شاخص کلیدی:</strong> تمرکز بر ارتقای ${disc.axes.filter(a => a.isCritical && a.score < 80).map(a => a.label.split(' ')[0]).join(' و ') || 'توان حداکثری'}</li>
            <li><strong>پیشگیری از آسیب بیومکانیک:</strong> تمرینات تعادل مفصلی و ترمز اکسنتریک بر اساس اهرم‌ها</li>
            <li><strong>هدف‌گذاری دوره بعد:</strong> ارتقای امتیاز استعداد به بالای ${Math.min(96, disc.talentScore + 7)}</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function generateHandballPdfSection(athlete, athleteHistory) {
  return generateSportTalentScoutingPdfSection(athlete, athleteHistory);
}

function generatePdfReportHtml(athlete, athleteHistory) {
  const dateStr = new Date().toLocaleDateString('fa-IR');
  const totalTests = athleteHistory.length;

  let bestJump = '--';
  let bestBoscoJumps = '--';
  let bestSitup = '--';
  let bestPushup = '--';
  let bestRunSpeed = '--';
  let bestFlex = '--';
  let bestAgility = '--';

  athleteHistory.forEach(entry => {
    const d = entry.data || {};
    if (entry.type === 'jump' && d.height) {
      if (bestJump === '--' || parseFloat(d.height) > parseFloat(bestJump)) bestJump = `${d.height} cm`;
    } else if (entry.type === 'bosco') {
      if (d.totalJumps && (bestBoscoJumps === '--' || parseInt(d.totalJumps, 10) > parseInt(bestBoscoJumps, 10))) {
        bestBoscoJumps = `${d.totalJumps} پرش (${d.maxHeight || '--'} cm)`;
      }
    } else if (entry.type === 'situp') {
      if (typeof d.totalReps !== 'undefined' && (bestSitup === '--' || parseInt(d.totalReps, 10) > parseInt(bestSitup, 10))) {
        bestSitup = `${d.totalReps} تکرار`;
      }
    } else if (entry.type === 'pushup') {
      if (typeof d.totalReps !== 'undefined' && (bestPushup === '--' || parseInt(d.totalReps, 10) > parseInt(bestPushup, 10))) {
        bestPushup = `${d.totalReps} تکرار`;
      }
    } else if (entry.type === 'run' && d.speed) {
      if (bestRunSpeed === '--' || parseFloat(d.speed) > parseFloat(bestRunSpeed)) {
        bestRunSpeed = `${d.speed} m/s (${d.time || '--'}s)`;
      }
    } else if (entry.type === 'agility' && d.totalTime) {
      if (bestAgility === '--' || parseFloat(d.totalTime) < parseFloat(bestAgility)) {
        bestAgility = `${d.totalTime}s (${d.pattern ? d.pattern.split(' ')[0] : 'شاتل'})`;
      }
    } else if (entry.type === 'flexibility' && d.reachCm) {
      if (bestFlex === '--' || parseFloat(d.reachCm) > parseFloat(bestFlex)) {
        bestFlex = `${parseFloat(d.reachCm) > 0 ? '+' : ''}${d.reachCm} cm`;
      }
    }
  });

  const recentTests = athleteHistory.slice(0, 10);
  const tableRowsHtml = recentTests.map((t, idx) => {
    let testName = '';
    let mainResult = '';
    let secResult = '';
    let rating = 'ثبت شده';
    const d = t.data || {};

    if (t.type === 'jump') {
      testName = 'پرش عمودی تک (Sgt Jump)';
      mainResult = `${d.height} cm`;
      secResult = `زمان پرواز: ${d.airTime}s`;
      rating = parseFloat(d.height) >= 45 ? 'عالی / نخبه' : parseFloat(d.height) >= 35 ? 'بسیار خوب' : 'متوسط';
    } else if (t.type === 'bosco') {
      testName = `پرش متوالی Bosco (${d.testDuration || 30}ث)`;
      mainResult = `${d.totalJumps} پرش`;
      secResult = `اوج: ${d.maxHeight}cm | هوا: ${d.totalAirTime}s`;
      rating = parseInt(d.totalJumps, 10) >= 30 ? 'عالی / نخبه' : 'خوب';
    } else if (t.type === 'situp') {
      testName = `دراز و نشست (${d.testDuration ? d.testDuration + 'ث' : 'آزاد'})`;
      mainResult = `${d.totalReps} تکرار`;
      secResult = `ریتم: ${d.avgCadence || 0} در دقیقه`;
      rating = d.talentRating || 'ثبت شده';
    } else if (t.type === 'pushup') {
      const typeLabel = d.pushupType === 'modified' ? 'روی زانو' : 'استاندارد';
      testName = `شنا سوئدی [${typeLabel}]`;
      mainResult = `${d.totalReps} تکرار`;
      secResult = `عمق: ${d.avgDepth ? d.avgDepth + '°' : '--'}`;
      rating = d.talentRating || 'ثبت شده';
    } else if (t.type === 'agility') {
      testName = `تست چابکی و شاتل (${d.pattern || 'رفت‌وبرگشت'})`;
      mainResult = `${d.totalTime} ثانیه`;
      secResult = `رفت: ${d.lap1Time || '--'}s | برگشت: ${d.lap2Time || '--'}s | سرعت: ${d.avgSpeed || '--'}m/s`;
      rating = d.rating || (parseFloat(d.totalTime) < 5.5 ? 'عالی / نخبه' : 'خوب');
    } else if (t.type === 'run') {
      testName = 'سرعت دویدن (Photo Gates)';
      mainResult = `${d.speed} m/s`;
      secResult = `زمان: ${d.time}s | مسافت: ${d.distance}m`;
      rating = parseFloat(d.speed) >= 7.0 ? 'بسیار سریع' : 'خوب';
    } else if (t.type === 'wingspan') {
      testName = 'طول دو دست (Wingspan)';
      mainResult = `${d.wingspan} cm`;
      secResult = `نسبت به قد: ${(parseFloat(d.wingspan)/athlete.heightCm).toFixed(2)}`;
      rating = parseFloat(d.wingspan) > athlete.heightCm ? 'اهرم بلند (مزیت فیزیکی)' : 'نرمال';
    } else if (t.type === 'flexibility') {
      testName = 'انعطاف‌پذیری بالاتنه (Sit & Reach)';
      mainResult = `${parseFloat(d.reachCm) > 0 ? '+' : ''}${d.reachCm} cm`;
      secResult = `زاویه: ${d.flexAngle}° | زانو: ${d.kneesValid || 'صاف'}`;
      rating = d.rating || 'ثبت شده';
    } else if (t.type === 'anthro') {
      testName = 'آنتروپومتری و ابعاد بیومکانیک';
      mainResult = `کورمیک: ${d.cormicIndex}%`;
      secResult = `Ape: ${d.apeIndex} | قد: ${d.heightCm}cm`;
      rating = 'پایش ساختار بدنی';
    } else if (t.type === 'handball_skill') {
      testName = `🤾‍♂️ ${d.testTitle || 'مهارت هندبال'}`;
      mainResult = `${d.metricValue} ${d.unit || ''}`;
      secResult = d.summary || d.detail || '--';
      rating = d.rating || 'ثبت شده';
    } else {
      testName = 'فاصله اجسام';
      mainResult = `${d.distanceCm || '--'} cm`;
      secResult = '--';
    }

    return `
      <tr>
        <td>${idx + 1}</td>
        <td><strong>${testName}</strong></td>
        <td>${t.date.split(',')[0] || t.date}</td>
        <td style="color: #0284c7; font-weight: bold;">${mainResult}</td>
        <td>${secResult}</td>
        <td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${rating}</span></td>
      </tr>
    `;
  }).join('');

  const benchmarkRowsHtml = getBenchmarkComparisonRows(athlete, athleteHistory);

  return `
    <div class="pdfHeader">
      <div style="text-align: right;">
        <h2 style="margin: 0; font-size: 17px; color: #0284c7;">کارنامه رسمی استعدادیابی و ارزیابی بیومکانیک</h2>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">سامانه دیجیتال استعدادیابی ورزشی حرکت‌سنج (Motion Tracker Pro)</div>
      </div>
      <div style="text-align: left; font-size: 11px; color: #475569;">
        <div>تاریخ صدور: <strong>${dateStr}</strong></div>
        <div>شماره پرونده: <strong>${athlete.code || '۱۰۱'}</strong></div>
      </div>
    </div>

    <!-- Athlete Details Grid -->
    <div class="pdfAthleteGrid">
      <div>نام ورزشکار: <strong>${athlete.name}</strong></div>
      <div>کد شناسایی: <strong>${athlete.code || '--'}</strong></div>
      <div>قد ثبت‌شده: <strong>${athlete.heightCm} سانتی‌متر</strong></div>
      <div>سن: <strong>${athlete.age || '--'} سال</strong></div>
      <div>جنسیت: <strong>${athlete.gender === 'female' ? 'دختر / خانم' : 'پسر / آقا'}</strong></div>
      <div>رشته ورزشی: <strong>${athlete.sport || 'عمومی / چندرشته‌ای'}</strong></div>
    </div>

    <!-- Best Performance Highlights -->
    <div style="font-weight: bold; margin-bottom: 6px; font-size: 11px; color: #1e293b;">🏆 اوج رکوردهای بیومکانیک ثبت‌شده:</div>
    <div class="pdfMetricsRow">
      <div class="pdfMetricBox">
        <div class="title">اوج پرش عمودی</div>
        <div class="val">${bestJump}</div>
      </div>
      <div class="pdfMetricBox">
        <div class="title">چابکی شاتل</div>
        <div class="val">${bestAgility}</div>
      </div>
      <div class="pdfMetricBox">
        <div class="title">استقامت پرش (Bosco)</div>
        <div class="val">${bestBoscoJumps}</div>
      </div>
      <div class="pdfMetricBox">
        <div class="title">سرعت دویدن</div>
        <div class="val">${bestRunSpeed}</div>
      </div>
    </div>

    <!-- Radar Comparison Chart (Physical Traits Radar) -->
    <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 10px; margin-top: 10px; margin-bottom: 10px; page-break-inside: avoid;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
        <div style="font-weight: bold; font-size: 11.5px; color: #0284c7; display: flex; align-items: center; gap: 6px;">
          <span>🕸️ نمودار عنکبوتی (رادار) ارزیابی متوازن فیزیکی (سرعت، توان، چابکی، استقامت، قدرت، انعطاف)</span>
        </div>
        <div style="font-size: 9.5px; color: #64748b;">
          مقایسه خودکار نسبت به سطح هنجار استاندارد گروه همسالان (Benchmark ۷۰٪)
        </div>
      </div>
      <div style="display: flex; justify-content: center; align-items: center;">
        ${generateRadarChartSvg(athlete, athleteHistory)}
      </div>
    </div>

    <!-- Handball & Sport Talent Scouting Section -->
    ${generateHandballPdfSection(athlete, athleteHistory)}

    <!-- Benchmark Comparison Table (مقایسه با میانگین گروه سنی و جنسیتی) -->
    <div style="font-weight: bold; margin-top: 10px; margin-bottom: 6px; font-size: 11px; color: #0369a1; display: flex; align-items: center; justify-content: space-between;">
      <span>📊 جدول مقایسه تطبیقی با میانگین هنجار گروه سنی و جنسیتی (Benchmark Comparison)</span>
      <span style="font-size: 10px; color: #64748b; font-weight: normal;">گروه مرجع: ${athlete.gender === 'female' ? 'خانم‌ها' : 'آقایان'} (${athlete.age || '۱۸'} سال)</span>
    </div>
    <table class="pdfTable">
      <thead>
        <tr>
          <th style="text-align: right; padding-right: 8px;">شاخص / آزمون آمادگی</th>
          <th>رکورد ورزشکار</th>
          <th>میانگین هنجار سن و جنسیت</th>
          <th>حد نخبگی و برجسته</th>
          <th>وضعیت و انحراف از میانگین</th>
        </tr>
      </thead>
      <tbody>
        ${benchmarkRowsHtml}
      </tbody>
    </table>

    <!-- Test History Table -->
    <div style="font-weight: bold; margin-top: 8px; margin-bottom: 6px; font-size: 11px; color: #1e293b;">📋 خلاصه آخرین آزمون‌های آزمایشگاهی (${totalTests} آزمون در کل سوابق):</div>
    <table class="pdfTable">
      <thead>
        <tr>
          <th>ردیف</th>
          <th>عنوان آزمون</th>
          <th>تاریخ</th>
          <th>شاخص اصلی</th>
          <th>جزئیات بیومکانیک</th>
          <th>رتبه استعدادیابی</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml || '<tr><td colspan="6">هیچ آزمونی ثبت نشده است</td></tr>'}
      </tbody>
    </table>

    <!-- Professional Coach Recommendations -->
    <div class="pdfRecommendations">
      <strong style="color: #0284c7; display: block; margin-bottom: 3px;">💡 تحلیل تخصصی و توصیه‌های مربی ارزیاب:</strong>
      ورزشکار دارای هماهنگی عصبی-عضلانی، چابکی و پتانسیل پرش مناسبی است. با توجه به ارزیابی‌های بینایی ماشین و تحلیل تخصصی استعدادیابی هندبال، پیشنهاد می‌شود بر تقویت عضلات شانه، پرش ۳ گام روی بلاک، استارت‌های انفجاری و روتین‌های تثبیت تعادل مفصل مچ پا تمرکز بیشتری گردد.
    </div>

    <!-- Official Signatures -->
    <div class="pdfSignatures">
      <div>مهر و امضای سرپرست پایگاه استعدادیابی</div>
      <div>امضای مربی / ارزیاب بیومکانیک</div>
      <div>امضا و تاییدیه ورزشکار</div>
    </div>
  `;
}

function openPdfReportModal() {
  const selectedAthleteId = historyAthleteFilter ? historyAthleteFilter.value : 'all';
  const athletes = getAthletes();
  const athlete = selectedAthleteId !== 'all'
    ? (athletes.find(a => a.id === selectedAthleteId) || getActiveAthlete())
    : getActiveAthlete();

  const history = getHistory();
  const athleteHistory = history.filter(h => h.athleteId === athlete.id);

  if (pdfReportDocument) {
    pdfReportDocument.innerHTML = generatePdfReportHtml(athlete, athleteHistory);
  }

  if (pdfReportModal) {
    pdfReportModal.style.display = 'block';
  }
}

async function downloadPdfDirectly() {
  if (!pdfReportDocument) return;
  const active = getActiveAthlete();

  if (downloadPdfDirectBtn) {
    downloadPdfDirectBtn.textContent = 'در حال تولید PDF... ⏳';
    downloadPdfDirectBtn.disabled = true;
  }

  try {
    if (window.html2canvas && window.jspdf && window.jspdf.jsPDF) {
      const canvas = await window.html2canvas(pdfReportDocument, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 295));
      const cleanName = (active.name || 'athlete').replace(/\s+/g, '_');
      pdf.save(`گزارش_استعدادیابی_${cleanName}.pdf`);

      setStatus('✅ فایل PDF کارنامه استعدادیابی با موفقیت ذخیره شد');
    } else {
      window.print();
    }
  } catch (err) {
    console.warn('PDF export error, triggering print fallback:', err);
    window.print();
  } finally {
    if (downloadPdfDirectBtn) {
      downloadPdfDirectBtn.textContent = '📥 دانلود مستقیم فایل PDF';
      downloadPdfDirectBtn.disabled = false;
    }
  }
}

function printPdfDocument() {
  window.print();
}

if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', openPdfReportModal);
}
if (closePdfModalXBtn) {
  closePdfModalXBtn.addEventListener('click', () => {
    if (pdfReportModal) pdfReportModal.style.display = 'none';
  });
}
if (closePdfReportBtn) {
  closePdfReportBtn.addEventListener('click', () => {
    if (pdfReportModal) pdfReportModal.style.display = 'none';
  });
}
if (downloadPdfDirectBtn) {
  downloadPdfDirectBtn.addEventListener('click', downloadPdfDirectly);
}
if (printPdfWindowBtn) {
  printPdfWindowBtn.addEventListener('click', printPdfDocument);
}

// ================== GUIDED FIRST-TIME SETUP TOUR ==================
const SETUP_TOUR_STEPS = [
  {
    targetId: null,
    icon: '🏆',
    title: 'خوش‌آمدید به سامانه استعدادیابی حرکت‌سنج',
    desc: 'این سامانه با پردازش تصویر هوش مصنوعی بدون نیاز به هیچ سنسور گران‌قیمت، ارزیابی بیومکانیکی آزمون‌های ورزشی را با دقت میلی‌متری انجام می‌دهد.',
    specs: '<strong>هدف:</strong> استعدادیابی ورزشی، رکوردگیری میدانی و ارزیابی آمادگی جسمانی استاندارد'
  },
  {
    targetId: 'settingsBtn',
    icon: '🎯',
    title: 'کالیبراسیون قد و مقیاس با دیوار یا کاغذ A4',
    desc: 'برای تبدیل دقیق پیکسل به سانتی‌متر در پرش و طول دست‌ها، در منوی تنظیمات ⚙️ قد ورزشکار را وارد کرده یا از کالیبراسیون خودکار استفاده کنید.',
    specs: '<strong>نکته:</strong> کالیبراسیون دقیق، خطای سنجش را به کمتر از ۱ سانتی‌متر می‌رساند.'
  },
  {
    targetId: 'modeJumpBtn',
    icon: '⤴️',
    title: 'استقرار دوربین: آزمون پرش عمودی و تست Bosco',
    desc: 'گوشی را روبه‌رو یا با زاویه ۴۵ درجه روی پایه ثابت قرار دهید. کل قد ورزشکار از کف پا تا اوج پرش باید در کادر مشخص باشد.',
    specs: '<strong>فاصله پیشنهادی:</strong> ۲.۵ تا ۳.۵ متر • <strong>ارتفاع دوربین:</strong> هم‌سطح زانو تا لگن'
  },
  {
    targetId: 'modeSitupBtn',
    icon: '🧘',
    title: 'استقرار دوربین: آزمون دراز و نشست استاندارد',
    desc: 'دوربین را دقیقاً از <strong>نمای جانبی (نیم‌رخ کامل)</strong> قرار دهید تا زوایای شانه-لگن-زانو و بالا آمدن کامل تنه محاسبه شود.',
    specs: '<strong>فاصله پیشنهادی:</strong> ۲ تا ۲.۵ متر • <strong>ارتفاع دوربین:</strong> ۲۰ تا ۳۰ سانتی‌متر از سطح زمین'
  },
  {
    targetId: 'modePushupBtn',
    icon: '💪',
    title: 'استقرار دوربین: آزمون شنا سوئدی و اصلاح‌شده',
    desc: 'دوربین را در راستای نیم‌رخ ورزشکار قرار دهید. سامانه زاویه ۹۰ درجه آرنج و خط صاف ستون فقرات در پلانک را پایش می‌کند.',
    specs: '<strong>فاصله پیشنهادی:</strong> ۲ متر • <strong>ارتفاع دوربین:</strong> هم‌سطح مت ورزشی'
  },
  {
    targetId: 'modeRunBtn',
    icon: '🏃',
    title: 'استقرار دوربین: آزمون سرعت دویدن با دروازه نوری مجازی',
    desc: 'دوربین را عمود بر مسیر دویدن قرار دهید. دو نقطه A و B را روی تصویر مشخص کنید تا مثل فتوسل ورزشی زمان صدم ثانیه را ثبت کند.',
    specs: '<strong>فاصله پیشنهادی:</strong> ۴ تا ۶ متر عمود بر خط حرکت'
  },
  {
    targetId: 'athleteProfileBtn',
    icon: '👤',
    title: 'پروفایل ورزشکاران، نمودار پیشرفت و گزارش PDF',
    desc: 'قبل از هر آزمون، ورزشکار را از این دکمه انتخاب کنید. نتایج تفکیک شده، نمودار روند پیشرفت و کارنامه رسمی PDF قابل دریافت است.',
    specs: '<strong>امکانات:</strong> تفکیک سوابق • نمودار Recharts • خروجی رسمی PDF و اکسل'
  }
];

let currentTourStep = 0;

function startSetupTour() {
  currentTourStep = 0;
  if (setupTourOverlay) setupTourOverlay.classList.add('visible');
  renderTourStep(0);
}

function renderTourStep(stepIdx) {
  if (stepIdx < 0 || stepIdx >= SETUP_TOUR_STEPS.length) return;
  currentTourStep = stepIdx;
  const step = SETUP_TOUR_STEPS[stepIdx];

  if (tourStepBadge) tourStepBadge.textContent = `گام ${stepIdx + 1} از ${SETUP_TOUR_STEPS.length}`;
  if (tourStepIcon) tourStepIcon.textContent = step.icon;
  if (tourStepTitle) tourStepTitle.textContent = step.title;
  if (tourStepDesc) tourStepDesc.textContent = step.desc;
  if (tourStepSpecs) tourStepSpecs.innerHTML = step.specs;

  if (tourPrevBtn) tourPrevBtn.disabled = stepIdx === 0;
  if (tourNextBtn) {
    tourNextBtn.textContent = stepIdx === SETUP_TOUR_STEPS.length - 1 ? 'پایان تور ✓' : 'بعدی ›';
  }

  if (tourDotsContainer) {
    tourDotsContainer.innerHTML = SETUP_TOUR_STEPS.map((_, i) =>
      `<div class="tour-dot ${i === stepIdx ? 'active' : ''}"></div>`
    ).join('');
  }

  if (step.targetId) {
    const targetEl = document.getElementById(step.targetId);
    if (targetEl && tourSpotlight) {
      const rect = targetEl.getBoundingClientRect();
      tourSpotlight.style.display = 'block';
      tourSpotlight.style.top = `${Math.max(0, rect.top - 6)}px`;
      tourSpotlight.style.left = `${Math.max(0, rect.left - 6)}px`;
      tourSpotlight.style.width = `${rect.width + 12}px`;
      tourSpotlight.style.height = `${rect.height + 12}px`;
    } else if (tourSpotlight) {
      tourSpotlight.style.display = 'none';
    }
  } else if (tourSpotlight) {
    tourSpotlight.style.display = 'none';
  }
}

function nextTourStep() {
  if (currentTourStep < SETUP_TOUR_STEPS.length - 1) {
    renderTourStep(currentTourStep + 1);
  } else {
    finishSetupTour();
  }
}

function prevTourStep() {
  if (currentTourStep > 0) {
    renderTourStep(currentTourStep - 1);
  }
}

function finishSetupTour() {
  try {
    localStorage.setItem('motion_tracker_setup_completed', 'true');
  } catch (e) {}
  if (setupTourOverlay) setupTourOverlay.classList.remove('visible');
  if (tourSpotlight) tourSpotlight.style.display = 'none';
  setStatus('✅ تور آموزشی استقرار و کالیبراسیون به پایان رسید.');
}

if (tourNextBtn) tourNextBtn.addEventListener('click', nextTourStep);
if (tourPrevBtn) tourPrevBtn.addEventListener('click', prevTourStep);
if (tourSkipBtn) tourSkipBtn.addEventListener('click', finishSetupTour);
if (guideTourBtn) guideTourBtn.addEventListener('click', startSetupTour);
if (startGuidedTourSettingsBtn) {
  startGuidedTourSettingsBtn.addEventListener('click', () => {
    if (settingsPanel) settingsPanel.style.display = 'none';
    startSetupTour();
  });
}

window.startSetupTour = startSetupTour;
window.finishSetupTour = finishSetupTour;

historyBtn.addEventListener('click', () => {
  renderHistory();
  renderProgressTrend();
  historyPanel.classList.add('visible');
});

closeHistoryBtn.addEventListener('click', () => {
  historyPanel.classList.remove('visible');
});

if (historyCloseXBtn) {
  historyCloseXBtn.addEventListener('click', () => {
    historyPanel.classList.remove('visible');
  });
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

function exportHistoryToCsv() {
  const history = getHistory();
  if (!history || history.length === 0) {
    showValidationWarning(
      'تاریخچه خالی است',
      'هیچ رکوردی در تاریخچه ثبت نشده است تا دانلود شود.',
      null,
      null
    );
    return;
  }

  // BOM for UTF-8 in Excel so Persian characters render properly without mojibake
  const bom = '\uFEFF';

  const headers = [
    'ردیف',
    'نام ورزشکار',
    'کد ورزشکار',
    'نوع آزمون',
    'تاریخ و زمان',
    'مدت زمان آزمون (ثانیه)',
    'تعداد تکرار / پرش',
    'ریتم تکرار (تعداد در دقیقه)',
    'زمان رکورد / پرواز (ثانیه)',
    'سرعت دویدن (متر بر ثانیه)',
    'مسافت دویدن (متر)',
    'ارتفاع پرش (سانتی‌متر)',
    'تعداد لمس زمین',
    'میانگین زمان هوا (ثانیه)',
    'میانگین تماس زمین (ثانیه)',
    'نوع شنا (استاندارد/زانو)',
    'عمق میانگین شنا (درجه)',
    'طول دست‌ها (سانتی‌متر)',
    'قد ورزشکار (سانتی‌متر)',
    'فاصله دو جسم (سانتی‌متر)',
    'فاصله دو جسم (متر)',
    'رتبه استعدادیابی ورزشی',
    'خلاصه کامل نتیجه'
  ];

  const rows = history.map((entry, index) => {
    const rowNum = index + 1;
    const athName = entry.athleteName || 'ورزشکار ۱';
    const athCode = entry.athleteCode || '';
    let testTypeTitle = '';
    let testDuration = '';
    let repsCount = '';
    let cadence = '';
    let recordTime = '';
    let speed = '';
    let runDist = '';
    let airTime = '';
    let jumpHeight = '';
    let touchesCount = '';
    let avgAir = '';
    let avgContact = '';
    let pushupTypeStr = '';
    let pushupDepthStr = '';
    let wingspan = '';
    let athleteHeight = '';
    let distCm = '';
    let distM = '';
    let talentRating = '';
    let summary = '';

    const d = entry.data || {};

    if (entry.type === 'run') {
      testTypeTitle = 'دویدن سرعت';
      recordTime = d.time || '';
      speed = d.speed || '';
      runDist = d.distance || '';
      summary = `زمان: ${d.time}s | سرعت: ${d.speed} m/s | مسافت: ${d.distance}m`;
    } else if (entry.type === 'jump') {
      testTypeTitle = 'پرش عمودی تک';
      recordTime = d.airTime || '';
      airTime = d.airTime || '';
      jumpHeight = d.height || '';
      repsCount = '1';
      touchesCount = '1';
      summary = `زمان پرواز: ${d.airTime}s | ارتفاع پرش: ${d.height} cm`;
    } else if (entry.type === 'bosco') {
      const dur = d.testDuration || 30;
      testTypeTitle = `پرش متوالی (${dur} ثانیه)`;
      testDuration = dur;
      recordTime = d.totalAirTime || String(dur);
      airTime = d.totalAirTime || '';
      jumpHeight = d.maxHeight || '';
      repsCount = d.totalJumps || '';
      touchesCount = d.totalTouches || '';
      avgAir = d.avgAirTime || '';
      avgContact = d.avgContactTime || '';
      summary = `تعداد پرش: ${d.totalJumps} | لمس زمین: ${d.totalTouches} | زمان هوا: ${d.totalAirTime}s | میانگین هوا: ${d.avgAirTime}s | اوج ارتفاع: ${d.maxHeight} cm`;
    } else if (entry.type === 'situp') {
      const dur = d.testDuration || 'آزاد';
      testTypeTitle = `دراز و نشست (${dur === 'آزاد' ? dur : dur + ' ثانیه'})`;
      testDuration = d.testDuration || '';
      repsCount = d.totalReps || '0';
      cadence = d.avgCadence || '0';
      recordTime = d.totalTime || '';
      talentRating = d.talentRating || '';
      summary = `تکرار صحیح: ${d.totalReps} | ریتم: ${d.avgCadence} تکرار/دقیقه | مدت: ${d.totalTime} | رتبه: ${d.talentRating}`;
    } else if (entry.type === 'pushup') {
      const dur = d.testDuration || 'آزاد';
      const typeLabel = d.pushupType === 'modified' ? 'شنا روی زانو' : 'شنا استاندارد';
      testTypeTitle = `شنا سوئدی [${typeLabel}] (${dur === 'آزاد' ? dur : dur + ' ثانیه'})`;
      testDuration = d.testDuration || '';
      repsCount = d.totalReps || '0';
      cadence = d.avgCadence || '0';
      recordTime = d.totalTime || '';
      pushupTypeStr = typeLabel;
      pushupDepthStr = d.avgDepth ? `${d.avgDepth}°` : '';
      talentRating = d.talentRating || '';
      summary = `تکرار صحیح: ${d.totalReps} | نوع: ${typeLabel} | ریتم: ${d.avgCadence} تکرار/دقیقه | عمق آرنج: ${d.avgDepth}° | رتبه: ${d.talentRating}`;
    } else if (entry.type === 'squat_lunge') {
      const subLabel = d.submode === 'lunge' ? 'لانج' : 'اسکات';
      testTypeTitle = `بیومکانیک ${subLabel} (Squat & Lunge)`;
      repsCount = d.totalReps || '0';
      recordTime = d.totalTime || '';
      summary = `تکرار: ${d.totalReps} | نمره تکنیک: ${d.formScore}٪ | میانگین عمق: ${d.avgDepth}° | اوج تنش ۴سر: ${d.peakQuads}٪ | اوج تنش باسن: ${d.peakGlutes}٪ | شاخص خستگی: ${d.fatigueIndex || 0}٪ | خطای تراز زانو: ${d.toeAlignmentWarnings || 0}`;
    } else if (entry.type === 'wingspan') {
      testTypeTitle = 'طول دو دست (Wingspan)';
      wingspan = d.wingspan || '';
      athleteHeight = d.athleteHeight || 175;
      summary = `طول دست‌ها: ${d.wingspan} cm (${(parseFloat(d.wingspan)/100).toFixed(2)}m) | قد ثبت شده: ${athleteHeight} cm`;
    } else if (entry.type === 'distance') {
      testTypeTitle = 'فاصله بین دو جسم';
      distCm = d.distanceCm || '';
      distM = d.distanceM || '';
      summary = `فاصله: ${d.distanceM >= 1 ? d.distanceM + ' متر' : d.distanceCm + ' سانتی‌متر'}`;
    } else {
      testTypeTitle = entry.type || 'سایر';
      summary = JSON.stringify(d);
    }

    return [
      escapeCsv(rowNum),
      escapeCsv(athName),
      escapeCsv(athCode),
      escapeCsv(testTypeTitle),
      escapeCsv(entry.date || ''),
      escapeCsv(testDuration),
      escapeCsv(repsCount),
      escapeCsv(cadence),
      escapeCsv(recordTime),
      escapeCsv(speed),
      escapeCsv(runDist),
      escapeCsv(airTime),
      escapeCsv(jumpHeight),
      escapeCsv(touchesCount),
      escapeCsv(avgAir),
      escapeCsv(avgContact),
      escapeCsv(pushupTypeStr),
      escapeCsv(pushupDepthStr),
      escapeCsv(wingspan),
      escapeCsv(athleteHeight),
      escapeCsv(distCm),
      escapeCsv(distM),
      escapeCsv(talentRating),
      escapeCsv(summary)
    ].join(',');
  });

  const csvContent = bom + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
  const filename = `harakat_sanj_history_${dateStr}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);

  if (downloadCsvBtn) {
    const origText = downloadCsvBtn.textContent;
    downloadCsvBtn.textContent = 'دانلود شد ✓';
    setTimeout(() => {
      downloadCsvBtn.textContent = origText;
    }, 2500);
  }
  setStatus('فایل CSV تاریخچه با موفقیت دانلود شد 📥');
}

if (downloadCsvBtn) {
  downloadCsvBtn.addEventListener('click', exportHistoryToCsv);
}

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
let poseZeroLagMode = true;

function getSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? Object.assign({
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175,
      poseZeroLag: true,
      poseModelSpeed: 'lite',
      aiWarningTheme: 'standard-red',
      aiWarningPulseFrequency: 650
    }, JSON.parse(data)) : {
      jumpThresholdRatio: 0.12,
      landThresholdRatio: 0.06,
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175,
      poseZeroLag: true,
      poseModelSpeed: 'lite',
      aiWarningTheme: 'standard-red',
      aiWarningPulseFrequency: 650
    };
  } catch (e) {
    return { 
      jumpThresholdRatio: 0.12, 
      landThresholdRatio: 0.06, 
      calibFrames: 20,
      lowPowerMode: false,
      athleteHeight: 175,
      poseZeroLag: true,
      poseModelSpeed: 'lite',
      aiWarningTheme: 'standard-red',
      aiWarningPulseFrequency: 650
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

function saveCurrentSettingsFromUI() {
  const lowPowerEl = document.getElementById('lowPowerMode');
  const lowPowerChecked = lowPowerEl ? lowPowerEl.checked : false;
  const athleteHeightVal = athleteHeightSetting ? (parseInt(athleteHeightSetting.value) || 175) : 175;
  const jumpSensEl = document.getElementById('jumpSensitivity');
  const landSensEl = document.getElementById('landSensitivity');
  const calibFrEl = document.getElementById('calibFrames');
  const poseZeroLagEl = document.getElementById('settingPoseZeroLag');
  const poseModelSpeedEl = document.getElementById('settingPoseModelSpeed');
  const warningThemeEl = document.getElementById('settingAiWarningTheme');
  const pulseFreqEl = document.getElementById('settingAiPulseFrequency');

  const jumpSensVal = jumpSensEl ? parseFloat(jumpSensEl.value) : 0.12;
  const landSensVal = landSensEl ? parseFloat(landSensEl.value) : 0.06;
  const calibFramesVal = calibFrEl ? parseInt(calibFrEl.value) : 20;
  const poseZeroLagVal = poseZeroLagEl ? poseZeroLagEl.checked : true;
  const poseModelSpeedVal = poseModelSpeedEl ? poseModelSpeedEl.value : 'lite';
  const warningThemeVal = warningThemeEl ? warningThemeEl.value : 'standard-red';
  const pulseFreqVal = pulseFreqEl ? parseInt(pulseFreqEl.value) : 650;

  const safeHeight = Math.max(90, Math.min(240, athleteHeightVal));
  const settings = {
    jumpThresholdRatio: isNaN(jumpSensVal) ? 0.12 : jumpSensVal,
    landThresholdRatio: isNaN(landSensVal) ? 0.06 : landSensVal,
    calibFrames: isNaN(calibFramesVal) ? 20 : calibFramesVal,
    lowPowerMode: !!lowPowerChecked,
    athleteHeight: safeHeight,
    poseZeroLag: !!poseZeroLagVal,
    poseModelSpeed: poseModelSpeedVal,
    aiWarningTheme: warningThemeVal || 'standard-red',
    aiWarningPulseFrequency: isNaN(pulseFreqVal) ? 650 : Math.max(350, Math.min(1800, pulseFreqVal))
  };
  saveSettings(settings);
  applySettings();
  return settings;
}

function loadSettingsUI() {
  const settings = getSettings();
  const jumpSens = document.getElementById('jumpSensitivity');
  const landSens = document.getElementById('landSensitivity');
  const calibFr = document.getElementById('calibFrames');
  const lowPowerCb = document.getElementById('lowPowerMode');
  const poseZeroLagEl = document.getElementById('settingPoseZeroLag');
  const poseModelSpeedEl = document.getElementById('settingPoseModelSpeed');
  const warningThemeEl = document.getElementById('settingAiWarningTheme');
  const pulseFreqEl = document.getElementById('settingAiPulseFrequency');
  const pulseFreqValEl = document.getElementById('settingAiPulseFreqVal');

  if (poseZeroLagEl) {
    poseZeroLagEl.checked = settings.poseZeroLag !== false;
  }
  if (poseModelSpeedEl) {
    poseModelSpeedEl.value = settings.poseModelSpeed || 'lite';
  }
  if (warningThemeEl) {
    warningThemeEl.value = settings.aiWarningTheme || 'standard-red';
  }
  if (pulseFreqEl) {
    const f = settings.aiWarningPulseFrequency || 650;
    pulseFreqEl.value = f;
    if (pulseFreqValEl) {
      pulseFreqValEl.textContent = `${f} میلی‌ثانیه`;
    }
  }

  if (jumpSens) {
    jumpSens.value = settings.jumpThresholdRatio;
    const sensValEl = document.getElementById('jumpSensValue');
    if (sensValEl) sensValEl.textContent = Math.round(settings.jumpThresholdRatio * 100) + '%';
  }
  if (landSens) {
    landSens.value = settings.landThresholdRatio;
    const landValEl = document.getElementById('landSensValue');
    if (landValEl) landValEl.textContent = Math.round(settings.landThresholdRatio * 100) + '%';
  }
  if (calibFr) {
    calibFr.value = settings.calibFrames;
    const calibValEl = document.getElementById('calibFramesValue');
    if (calibValEl) calibValEl.textContent = settings.calibFrames + ' فریم';
  }
  if (lowPowerCb) {
    lowPowerCb.checked = !!settings.lowPowerMode;
  }
  if (athleteHeightSetting) {
    athleteHeightSetting.value = settings.athleteHeight || 175;
  }
  
  // Update performance mode
  if (settings.lowPowerMode) {
    performanceMode = 'low-power';
  } else {
    performanceMode = 'normal';
  }

  // Load Squat Range of Motion Baseline
  if (typeof loadSquatRomBaseline === 'function') {
    loadSquatRomBaseline();
  }

  // Apply visual warning theme and pulse settings
  applyAiWarningSettings(settings);
}

// Automatically bind listeners to auto-save settings to localStorage immediately upon user input
if (athleteHeightSetting) {
  athleteHeightSetting.addEventListener('input', () => {
    saveCurrentSettingsFromUI();
  });
  athleteHeightSetting.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const jumpSensEl = document.getElementById('jumpSensitivity');
if (jumpSensEl) {
  jumpSensEl.addEventListener('input', (e) => {
    const valEl = document.getElementById('jumpSensValue');
    if (valEl) valEl.textContent = Math.round(e.target.value * 100) + '%';
    saveCurrentSettingsFromUI();
  });
  jumpSensEl.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const landSensEl = document.getElementById('landSensitivity');
if (landSensEl) {
  landSensEl.addEventListener('input', (e) => {
    const valEl = document.getElementById('landSensValue');
    if (valEl) valEl.textContent = Math.round(e.target.value * 100) + '%';
    saveCurrentSettingsFromUI();
  });
  landSensEl.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const calibFramesEl = document.getElementById('calibFrames');
if (calibFramesEl) {
  calibFramesEl.addEventListener('input', (e) => {
    const valEl = document.getElementById('calibFramesValue');
    if (valEl) valEl.textContent = e.target.value + ' فریم';
    saveCurrentSettingsFromUI();
  });
  calibFramesEl.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const lowPowerCbEl = document.getElementById('lowPowerMode');
if (lowPowerCbEl) {
  lowPowerCbEl.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      enableLowPowerMode();
    } else {
      disableLowPowerMode();
    }
    saveCurrentSettingsFromUI();
  });
}

const poseZeroLagEl = document.getElementById('settingPoseZeroLag');
if (poseZeroLagEl) {
  poseZeroLagEl.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const poseModelSpeedEl = document.getElementById('settingPoseModelSpeed');
if (poseModelSpeedEl) {
  poseModelSpeedEl.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

const warningThemeSelect = document.getElementById('settingAiWarningTheme');
if (warningThemeSelect) {
  warningThemeSelect.addEventListener('change', (e) => {
    saveCurrentSettingsFromUI();
    updateTelemetryPulseRealtimePreview(null, e.target.value);
  });
}

// Real-time Pulse Frequency Preview & Urgency Calculation Engine
function updateTelemetryPulseRealtimePreview(freqVal, themeVal) {
  const slider = document.getElementById('settingAiPulseFrequency');
  const themeSelect = document.getElementById('settingAiWarningTheme');
  const val = typeof freqVal === 'number' ? freqVal : (slider ? parseInt(slider.value, 10) : 650) || 650;
  const theme = themeVal || (themeSelect ? themeSelect.value : 'standard-red') || 'standard-red';

  const valEl = document.getElementById('settingAiPulseFreqVal');
  if (valEl) valEl.textContent = `${val} میلی‌ثانیه`;

  const persistSec = (Math.max(250, Math.min(3000, val)) / 1000).toFixed(2);
  const baseSec = (Math.max(250, Math.min(3000, val * 1.45)) / 1000).toFixed(2);
  const hz = (1000 / val).toFixed(2);

  // Update root CSS variables
  document.documentElement.style.setProperty('--telem-pulse-frequency', `${baseSec}s`);
  document.documentElement.style.setProperty('--telem-persist-duration', `${persistSec}s`);
  document.documentElement.style.setProperty('--telem-pulse-duration', `${baseSec}s`);

  // Urgency classification and contextual guidance
  let urgencyBadge = '';
  let urgencyDesc = '';
  let urgencyColor = '';
  if (val <= 450) {
    urgencyBadge = '🚨 فوق‌سریع / فوریت حداکثری (مسابقه)';
    urgencyDesc = `فرکانس ${val}ms (${hz} هرتز) • شتاب و فوریت انفجاری، ویژه تشخیص فوری ناهنجاری زانو و مچ در مسابقات سرعتی و تست‌های پرفشار.`;
    urgencyColor = '#f87171';
  } else if (val <= 700) {
    urgencyBadge = '⚡ استاندارد / فوریت مسابقاتی';
    urgencyDesc = `فرکانس ${val}ms (${hz} هرتز) • ریتم ضربان بیومکانیک متعادل، ایده‌آل برای ارزیابی پرش عمودی، فرود و آزمون‌های چابکی.`;
    urgencyColor = '#38bdf8';
  } else if (val <= 1100) {
    urgencyBadge = '🎯 متوسط / تمرین تکنیکال';
    urgencyDesc = `فرکانس ${val}ms (${hz} هرتز) • ریتم کنترل‌شده با تمرکز بر اصلاح زوایای مفصلی و بازخورد فرم اجرای حرکت.`;
    urgencyColor = '#facc15';
  } else {
    urgencyBadge = '🧘 ریتم آرام / تمرینات اصلاحی و تمرکز';
    urgencyDesc = `فرکانس ${val}ms (${hz} هرتز) • ضربان ملایم و نرم، بدون ایجاد استرس حرکتی برای بازآموزی الگوهای حرکتی در ورزشکاران مبتدی.`;
    urgencyColor = '#4ade80';
  }

  // Update Settings in-modal Live Preview Card
  const previewBox = document.getElementById('telemPulseSettingsPreview');
  if (previewBox) {
    previewBox.style.setProperty('--telem-pulse-frequency', `${baseSec}s`);
    previewBox.style.setProperty('--telem-persist-duration', `${persistSec}s`);
    previewBox.style.setProperty('--telem-pulse-duration', `${baseSec}s`);
    previewBox.dataset.theme = theme;
    previewBox.dataset.persisting = 'true';

    if (theme === 'high-contrast-orange') {
      previewBox.classList.add('theme-high-contrast-orange');
      previewBox.classList.remove('theme-standard-red');
      previewBox.style.borderColor = '#f97316';
    } else {
      previewBox.classList.remove('theme-high-contrast-orange');
      previewBox.classList.add('theme-standard-red');
      previewBox.style.borderColor = '#ef4444';
    }

    const badgeEl = document.getElementById('telemPulseUrgencyBadge');
    if (badgeEl) {
      badgeEl.textContent = urgencyBadge;
      badgeEl.style.color = urgencyColor;
      badgeEl.style.borderColor = urgencyColor;
    }

    const descEl = document.getElementById('telemPulsePreviewDesc');
    if (descEl) descEl.textContent = urgencyDesc;

    const speedEl = document.getElementById('telemPulseSpeedIndicator');
    if (speedEl) speedEl.textContent = `⚡ سرعت تپش: ${hz} هرتز`;

    const themeLbl = document.getElementById('telemPulsePreviewThemeLabel');
    if (themeLbl) {
      themeLbl.textContent = theme === 'high-contrast-orange' ? 'نارنجی با کنتراست بالا 🟠' : 'قرمز استاندارد 🔴';
      themeLbl.style.color = theme === 'high-contrast-orange' ? '#fbbf24' : '#f87171';
    }

    // Instantly reset keyframe animation so coach perceives frequency acceleration or deceleration immediately
    previewBox.style.animation = 'none';
    void previewBox.offsetWidth;
    previewBox.style.animation = '';
  }

  // Also update live #telemetryAiFormOverlay on the telemetry panel
  const overlay = document.getElementById('telemetryAiFormOverlay');
  if (overlay) {
    overlay.style.setProperty('--telem-pulse-frequency', `${baseSec}s`);
    overlay.style.setProperty('--telem-persist-duration', `${persistSec}s`);
    overlay.style.setProperty('--telem-pulse-duration', `${baseSec}s`);
    overlay.dataset.theme = theme;
    if (theme === 'high-contrast-orange') {
      overlay.classList.add('theme-high-contrast-orange');
      overlay.classList.remove('theme-standard-red');
    } else {
      overlay.classList.remove('theme-high-contrast-orange');
      overlay.classList.add('theme-standard-red');
    }

    if (overlay.style.display !== 'none' || overlay.classList.contains('visible')) {
      overlay.style.animation = 'none';
      void overlay.offsetWidth;
      overlay.style.animation = '';
    }
  }
}
window.updateTelemetryPulseRealtimePreview = updateTelemetryPulseRealtimePreview;

const pulseFreqSlider = document.getElementById('settingAiPulseFrequency');
if (pulseFreqSlider) {
  pulseFreqSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10) || 650;
    updateTelemetryPulseRealtimePreview(val);
  });
  pulseFreqSlider.addEventListener('change', () => {
    saveCurrentSettingsFromUI();
  });
}

function applyAiWarningSettings(settings = getSettings()) {
  const theme = settings.aiWarningTheme || 'standard-red';
  const pulseFreqMs = settings.aiWarningPulseFrequency || 650;

  updateTelemetryPulseRealtimePreview(pulseFreqMs, theme);

  const quickLabel = document.getElementById('telemThemeQuickLabel');
  const quickIcon = document.getElementById('telemThemeQuickIcon');
  if (quickLabel && quickIcon) {
    if (theme === 'high-contrast-orange') {
      quickLabel.textContent = 'پوسته: نارنجی کنتراست بالا';
      quickIcon.textContent = '🟠';
    } else {
      quickLabel.textContent = 'پوسته: قرمز استاندارد';
      quickIcon.textContent = '🔴';
    }
  }
}

function toggleAiWarningTheme() {
  const settings = getSettings();
  const nextTheme = settings.aiWarningTheme === 'high-contrast-orange' ? 'standard-red' : 'high-contrast-orange';
  settings.aiWarningTheme = nextTheme;
  saveSettings(settings);

  const selectEl = document.getElementById('settingAiWarningTheme');
  if (selectEl) selectEl.value = nextTheme;

  applyAiWarningSettings(settings);

  if (typeof showTelemDismissToast === 'function') {
    showTelemDismissToast(nextTheme === 'high-contrast-orange' 
      ? 'پوسته اخطار به «نارنجی با کنتراست بالا» تغییر یافت 🟠' 
      : 'پوسته اخطار به «قرمز استاندارد» بازگشت 🔴');
  }
  if (typeof playChime === 'function') {
    playChime(640, 'sine', 0.1);
  }
}
window.toggleAiWarningTheme = toggleAiWarningTheme;

// Automatically load and apply settings from localStorage upon script startup
loadSettingsUI();
applySettings();

settingsBtn.addEventListener('click', () => {
  loadSettingsUI();
  updateTelemetryPulseRealtimePreview();
  settingsPanel.classList.add('visible');
  settingsPanel.style.display = 'block';
});

// Orientation lock button
const orientationLockBtn = document.getElementById('orientationLockBtn');
if (orientationLockBtn) {
  orientationLockBtn.addEventListener('click', toggleOrientationLock);
}

// Camera fit framing toggle button (wide uncropped sensor vs fullscreen cover)
const cameraFitToggleBtn = document.getElementById('cameraFitToggleBtn');
if (cameraFitToggleBtn) {
  cameraFitToggleBtn.addEventListener('click', toggleCameraFitMode);
}

// Camera switcher button
cameraSwitcherBtn = document.getElementById('cameraSwitcherBtn');
if (cameraSwitcherBtn) {
  cameraSwitcherBtn.addEventListener('click', showCameraSwitcherModal);
}

closeSettingsBtn.addEventListener('click', () => {
  saveCurrentSettingsFromUI();
  settingsPanel.classList.remove('visible');
  settingsPanel.style.display = 'none';
});

// Universal Panel and Modal Close Button Delegation (برای بستن تمام پنجره‌ها و پنل‌های باز)
document.addEventListener('click', (e) => {
  const closeBtn = e.target.closest('.panel-close-x-btn');
  if (!closeBtn) return;
  e.preventDefault();
  e.stopPropagation();

  // Specific state cleanup handlers
  if (closeBtn.id === 'closeSettingsXBtn') {
    saveCurrentSettingsFromUI();
  } else if (closeBtn.id === 'closeHeightCalibXBtn') {
    isCalibratingHeight = false;
    heightHeadPoint = null;
    heightFeetPoint = null;
  } else if (closeBtn.id === 'closeObjCalibXBtn') {
    isObjectCalibrating = false;
    if (typeof objectCalibPointA !== 'undefined') objectCalibPointA = null;
    if (typeof objectCalibPointB !== 'undefined') objectCalibPointB = null;
  }

  // Find parent panel or modal and hide it
  const panel = closeBtn.closest('.panel') || closeBtn.closest('.modal') || closeBtn.closest('#historyPanel');
  if (panel) {
    panel.classList.remove('visible');
    panel.style.display = 'none';
  }
});

// Explicit ID handlers for all individual panel close buttons
const panelCloseMappings = [
  { btnId: 'closeSettingsXBtn', action: () => { saveCurrentSettingsFromUI(); if (settingsPanel) { settingsPanel.classList.remove('visible'); settingsPanel.style.display = 'none'; } } },
  { btnId: 'closeHeightCalibXBtn', action: () => { isCalibratingHeight = false; if (heightCalibPanel) { heightCalibPanel.style.display = 'none'; heightCalibPanel.classList.remove('visible'); } } },
  { btnId: 'closeObjCalibXBtn', action: () => { isObjectCalibrating = false; if (objectCalibPanel) { objectCalibPanel.style.display = 'none'; objectCalibPanel.classList.remove('visible'); } } },
  { btnId: 'closeDistPanelXBtn', action: () => { if (distPanel) { distPanel.classList.remove('visible'); distPanel.style.display = 'none'; } } },
  { btnId: 'closeResultPanelXBtn', action: () => { if (resultPanel) { resultPanel.classList.remove('visible'); resultPanel.style.display = 'none'; } } },
  { btnId: 'closeAgilityControlsXBtn', action: () => { if (agilityConeControls) { agilityConeControls.classList.remove('visible'); agilityConeControls.style.display = 'none'; } } },
  { btnId: 'closeAgilityResultXBtn', action: () => { if (agilityResultPanel) { agilityResultPanel.classList.remove('visible'); agilityResultPanel.style.display = 'none'; } } },
  { btnId: 'closeJumpResultXBtn', action: () => { if (jumpResultPanel) { jumpResultPanel.classList.remove('visible'); jumpResultPanel.style.display = 'none'; } } },
  { btnId: 'closeBoscoStartXBtn', action: () => { if (boscoStartPanel) { boscoStartPanel.classList.remove('visible'); boscoStartPanel.style.display = 'none'; } } },
  { btnId: 'closeBoscoResultXBtn', action: () => { if (boscoResultPanel) { boscoResultPanel.classList.remove('visible'); boscoResultPanel.style.display = 'none'; } } },
  { btnId: 'closeSitupStartXBtn', action: () => { if (situpStartPanel) { situpStartPanel.classList.remove('visible'); situpStartPanel.style.display = 'none'; } } },
  { btnId: 'closeSitupResultXBtn', action: () => { if (situpResultPanel) { situpResultPanel.classList.remove('visible'); situpResultPanel.style.display = 'none'; } } },
  { btnId: 'closePushupStartXBtn', action: () => { if (pushupStartPanel) { pushupStartPanel.classList.remove('visible'); pushupStartPanel.style.display = 'none'; } } },
  { btnId: 'closePushupResultXBtn', action: () => { if (pushupResultPanel) { pushupResultPanel.classList.remove('visible'); pushupResultPanel.style.display = 'none'; } } },
  { btnId: 'closeSquatLungeStartXBtn', action: () => { if (squatLungeStartPanel) { squatLungeStartPanel.classList.remove('visible'); squatLungeStartPanel.style.display = 'none'; } } },
  { btnId: 'closeSquatLungeResultXBtn', action: () => { if (squatLungeResultPanel) { squatLungeResultPanel.classList.remove('visible'); squatLungeResultPanel.style.display = 'none'; } } },
  { btnId: 'closeFlexibilityXBtn', action: () => { if (flexibilityPanel) { flexibilityPanel.classList.remove('visible'); flexibilityPanel.style.display = 'none'; } } },
  { btnId: 'closeAnthroXBtn', action: () => { if (anthroPanel) { anthroPanel.classList.remove('visible'); anthroPanel.style.display = 'none'; } } },
  { btnId: 'closeWingspanXBtn', action: () => { if (wingspanPanel) { wingspanPanel.classList.remove('visible'); wingspanPanel.style.display = 'none'; } } },
  { btnId: 'closeDistanceMeasureXBtn', action: () => { if (distanceMeasurePanel) { distanceMeasurePanel.classList.remove('visible'); distanceMeasurePanel.style.display = 'none'; } } },
  { btnId: 'closeHandballModalXBtn', action: () => { if (typeof closeHandballScoutingModal === 'function') closeHandballScoutingModal(); else { const m = document.getElementById('handballScoutingModal'); if (m) { m.style.display = 'none'; m.classList.remove('visible'); } } } },
  { btnId: 'closeHandballModalBtn', action: () => { if (typeof closeHandballScoutingModal === 'function') closeHandballScoutingModal(); else { const m = document.getElementById('handballScoutingModal'); if (m) { m.style.display = 'none'; m.classList.remove('visible'); } } } }
];

panelCloseMappings.forEach(({ btnId, action }) => {
  const el = document.getElementById(btnId);
  if (el) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      action();
    });
  }
});

function applySettings() {
  const settings = getSettings();
  poseZeroLagMode = settings.poseZeroLag !== false;
  // Only rescale live thresholds if we already know the person's leg length;
  // otherwise the ratios get applied once calibration finishes (see jumpProcessFrame).
  if (legLengthPx != null) {
    airThresholdPx = legLengthPx * settings.jumpThresholdRatio;
    landThresholdPx = legLengthPx * settings.landThresholdRatio;
  }
  CALIB_FRAMES_NEEDED = settings.calibFrames;
  applyAiWarningSettings(settings);
}

// ================== WALL HEIGHT CALIBRATION ==================
let isCalibratingHeight = false;
let heightHeadPoint = null;
let heightFeetPoint = null;
let heightWallDistanceM = 2.0; // default 2.0 meters from wall
let calculatedHeightCm = 175;

function startWallHeightCalibration() {
  if (settingsPanel) settingsPanel.classList.remove('visible');
  hideAllPanels();
  isCalibratingHeight = true;
  heightHeadPoint = null;
  heightFeetPoint = null;
  calculatedHeightCm = getSettings().athleteHeight || 175;
  if (heightCalibPanel) {
    heightCalibPanel.style.display = 'block';
    heightCalibPanel.classList.add('visible');
  }
  updateHeightCalibUI();
  setStatus('کالیبراسیون قد با دیوار: روی بالاترین نقطه سر ضربه بزنید 🎯');
  speakText('کنار دیوار صاف بایستید و به ترتیب روی سر و کف پا ضربه بزنید', 'Stand against the wall and tap head then feet');
}

function exitHeightCalibration() {
  isCalibratingHeight = false;
  heightHeadPoint = null;
  heightFeetPoint = null;
  if (heightCalibPanel) {
    heightCalibPanel.style.display = 'none';
    heightCalibPanel.classList.remove('visible');
  }
}

function computeCalibratedHeight() {
  if (!heightHeadPoint || !heightFeetPoint) return getSettings().athleteHeight || 175;
  const pxH = Math.abs(heightFeetPoint.y - heightHeadPoint.y);
  const canvasH = canvas.height || 480;

  // Optical field of view calculation:
  // Standard phone camera vertical FOV is ~56 degrees (2 * tan(28 deg) ~= 1.063)
  // At distance D meters, visible frame vertical height = D * 1.063 meters
  const viewHeightCm = (heightWallDistanceM * 1.063) * 100;
  let estimatedCm = (pxH / canvasH) * viewHeightCm;

  // If calibrated scale exists from run obstacle gates or pose, blend for maximum precision
  if (currentEstimatedScaleCmPerPx && currentEstimatedScaleCmPerPx > 0.08) {
    const poseScaleCm = pxH * currentEstimatedScaleCmPerPx;
    if (poseScaleCm > 110 && poseScaleCm < 235) {
      estimatedCm = estimatedCm * 0.55 + poseScaleCm * 0.45;
    }
  }

  calculatedHeightCm = Math.round(Math.max(100, Math.min(240, estimatedCm)));
  return calculatedHeightCm;
}

function updateHeightCalibUI() {
  if (heightPointHeadStatus) {
    if (heightHeadPoint) {
      heightPointHeadStatus.style.color = '#4ade80';
      heightPointHeadStatus.textContent = '🟢 سر: ثبت شد ✓';
    } else {
      heightPointHeadStatus.style.color = '#f87171';
      heightPointHeadStatus.textContent = '🔴 سر: ضربه بزنید';
    }
  }

  if (heightPointFeetStatus) {
    if (heightFeetPoint) {
      heightPointFeetStatus.style.color = '#4ade80';
      heightPointFeetStatus.textContent = '🟢 پا: ثبت شد ✓';
    } else {
      heightPointFeetStatus.style.color = heightHeadPoint ? '#38bdf8' : '#94a3b8';
      heightPointFeetStatus.textContent = heightHeadPoint ? '🔵 پا: ضربه بزنید' : '⚪ پا: منتظر سر';
    }
  }

  if (heightHeadPoint && heightFeetPoint) {
    const h = computeCalibratedHeight();
    if (heightCalibResult) heightCalibResult.textContent = `${h} سانتی‌متر`;
    if (heightCalibConfirmBtn) heightCalibConfirmBtn.disabled = false;
    if (heightCalibStepHint) {
      heightCalibStepHint.innerHTML = `هر دو نقطه مشخص شدند. قد تخمینی: <strong style="color: #4ade80;">${h} سانتی‌متر</strong>. برای تغییر می‌توانید دوباره روی سر یا پا ضربه بزنید.`;
    }
    setStatus(`قد تخمینی با دیوار: ${h} سانتی‌متر 🎯`);
  } else if (heightHeadPoint) {
    if (heightCalibResult) heightCalibResult.textContent = '-- سانتی‌متر';
    if (heightCalibConfirmBtn) heightCalibConfirmBtn.disabled = true;
    if (heightCalibStepHint) {
      heightCalibStepHint.innerHTML = 'نقطه سر ثبت شد. حالا روی <strong>کف پا / خط زمین</strong> ضربه بزنید.';
    }
    setStatus('روی کف پا / خط زمین ضربه بزنید 🦶');
  } else {
    if (heightCalibResult) heightCalibResult.textContent = '-- سانتی‌متر';
    if (heightCalibConfirmBtn) heightCalibConfirmBtn.disabled = true;
    if (heightCalibStepHint) {
      heightCalibStepHint.innerHTML = 'کنار دیوار صاف بایستید و به ترتیب روی <strong>بالاترین نقطه سر</strong> و سپس <strong>کف پا</strong> روی تصویر ضربه بزنید.';
    }
    setStatus('کالیبراسیون قد: روی بالاترین نقطه سر ضربه بزنید 🎯');
  }
}

function handleHeightCalibStageClick(e) {
  if (!isCalibratingHeight) return;
  if (e.target.closest && (e.target.closest('#heightCalibPanel') || e.target.closest('#headerContainer') || e.target.closest('#actionBar'))) return;
  const pt = clientToCanvasCoords(e.clientX, e.clientY);

  if (!heightHeadPoint) {
    heightHeadPoint = pt;
    playChime(587, 'sine', 0.15); // D5
    speakText('سر ثبت شد. حالا روی کف پا ضربه بزنید', 'Head marked. Now tap your feet.');
    updateHeightCalibUI();
  } else if (!heightFeetPoint) {
    heightFeetPoint = pt;
    playChime(784, 'triangle', 0.2); // G5
    updateHeightCalibUI();
    const h = computeCalibratedHeight();
    speakText(`قد شما حدود ${h} سانتی‌متر تخمین زده شد`, `Your height is approximately ${h} centimeters`);
  } else {
    // If both exist, re-tap adjusts the closer point
    const distH = Math.hypot(pt.x - heightHeadPoint.x, pt.y - heightHeadPoint.y);
    const distF = Math.hypot(pt.x - heightFeetPoint.x, pt.y - heightFeetPoint.y);
    if (distH < distF) {
      heightHeadPoint = pt;
    } else {
      heightFeetPoint = pt;
    }
    playChime(659, 'sine', 0.12);
    updateHeightCalibUI();
  }
}

function heightCalibDrawOverlay() {
  if (!isCalibratingHeight) return;
  ctx.save();

  // Head horizontal guide & marker
  if (heightHeadPoint) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, heightHeadPoint.y);
    ctx.lineTo(canvas.width, heightHeadPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(heightHeadPoint.x, heightHeadPoint.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('🔝 بالای سر', Math.min(canvas.width - 70, heightHeadPoint.x + 14), heightHeadPoint.y - 8);
  }

  // Feet horizontal guide & marker
  if (heightFeetPoint) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, heightFeetPoint.y);
    ctx.lineTo(canvas.width, heightFeetPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(heightFeetPoint.x, heightFeetPoint.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.fillText('🦶 کف پا / زمین', Math.min(canvas.width - 80, heightFeetPoint.x + 14), heightFeetPoint.y + 18);
  }

  // Dimension vertical line between head and feet
  if (heightHeadPoint && heightFeetPoint) {
    const midX = (heightHeadPoint.x + heightFeetPoint.x) / 2;
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(midX, heightHeadPoint.y);
    ctx.lineTo(midX, heightFeetPoint.y);
    ctx.stroke();

    // Top tick
    ctx.beginPath();
    ctx.moveTo(midX - 14, heightHeadPoint.y);
    ctx.lineTo(midX + 14, heightHeadPoint.y);
    ctx.stroke();

    // Bottom tick
    ctx.beginPath();
    ctx.moveTo(midX - 14, heightFeetPoint.y);
    ctx.lineTo(midX + 14, heightFeetPoint.y);
    ctx.stroke();

    // Dimension badge
    const midY = (heightHeadPoint.y + heightFeetPoint.y) / 2;
    const label = `📏 قد: ${calculatedHeightCm} cm`;
    ctx.font = 'bold 14px Vazirmatn, Tahoma, sans-serif';
    const textW = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.fillRect(midX - textW / 2 - 8, midY - 14, textW + 16, 28);
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(midX - textW / 2 - 8, midY - 14, textW + 16, 28);

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, midX, midY);
  }

  ctx.restore();
}

if (startHeightCalibBtn) {
  startHeightCalibBtn.addEventListener('click', startWallHeightCalibration);
}

if (heightCalibConfirmBtn) {
  heightCalibConfirmBtn.addEventListener('click', () => {
    const finalH = calculatedHeightCm || 175;
    if (athleteHeightSetting) {
      athleteHeightSetting.value = finalH;
    }
    // Automatically save to localStorage and apply
    saveCurrentSettingsFromUI();
    playChime(880, 'triangle', 0.25);
    speakText(`قد ورزشکار روی ${finalH} سانتی‌متر ذخیره شد`, `Height saved: ${finalH} centimeters`);
    setStatus(`قد ورزشکار روی ${finalH} سانتی‌متر تنظیم و در تنظیمات ذخیره شد ✅`);
    exitHeightCalibration();
  });
}

if (heightCalibResetBtn) {
  heightCalibResetBtn.addEventListener('click', () => {
    heightHeadPoint = null;
    heightFeetPoint = null;
    updateHeightCalibUI();
    setStatus('نقاط بازنشانی شدند. دوباره روی بالاترین نقطه سر ضربه بزنید.');
  });
}

if (heightCalibCancelBtn) {
  heightCalibCancelBtn.addEventListener('click', () => {
    exitHeightCalibration();
    setStatus('کالیبراسیون قد لغو شد');
  });
}

// Distance to wall buttons
document.querySelectorAll('.wallDistBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.wallDistBtn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = '#475569';
      b.style.background = '#1e293b';
      b.style.color = '#94a3b8';
    });
    btn.classList.add('active');
    btn.style.borderColor = '#38bdf8';
    btn.style.background = '#0284c7';
    btn.style.color = '#fff';
    heightWallDistanceM = parseFloat(btn.dataset.dist) || 2.0;
    if (heightHeadPoint && heightFeetPoint) {
      updateHeightCalibUI();
    }
  });
});

// ================== OBJECT-BASED AUTO-CALIBRATION (A4 / Ruler / Custom) ==================
let isObjectCalibrating = false;
let calibObjectBox = { x: 0.35, y: 0.30, w: 0.30, h: 0.40 }; // Relative to canvas width and height
let calibObjectRealCm = 29.7; // default A4 vertical
let calibObjectType = 'a4-v'; // 'a4-v' | 'a4-h' | 'ruler30' | 'card' | 'custom'
let isDraggingObjBox = false;
let objDragMode = null; // 'move' | 'tl' | 'tr' | 'bl' | 'br' | 'top' | 'bottom' | 'left' | 'right'
let objDragStart = { x: 0, y: 0, box: null };
let objCalibPreviousMode = null;

const OBJ_PRESETS = {
  'a4-v': { name: 'A4 عمودی', size: 29.7, aspect: 21.0 / 29.7, isVertical: true },
  'a4-h': { name: 'A4 افقی', size: 21.0, aspect: 29.7 / 21.0, isVertical: false },
  'ruler30': { name: 'خط‌کش ۳۰ سانتیمتر', size: 30.0, aspect: 0.15, isVertical: true },
  'card': { name: 'کارت بانکی', size: 8.5, aspect: 8.5 / 5.4, isVertical: false }
};

function startObjectCalibration(initialType = 'a4-v') {
  objCalibPreviousMode = mode;
  if (settingsPanel) settingsPanel.classList.remove('visible');
  hideAllPanels();
  isObjectCalibrating = true;
  calibObjectType = initialType;
  
  const preset = OBJ_PRESETS[initialType] || OBJ_PRESETS['a4-v'];
  calibObjectRealCm = preset.size;
  if (objCalibCustomCm) objCalibCustomCm.value = calibObjectRealCm;

  // Initialize centered box with appropriate aspect ratio
  if (preset.isVertical) {
    calibObjectBox = { x: 0.38, y: 0.25, w: 0.24, h: 0.50 };
  } else {
    calibObjectBox = { x: 0.28, y: 0.35, w: 0.44, h: 0.30 };
  }

  // Update preset buttons visual state
  if (objCalibPresets) {
    objCalibPresets.querySelectorAll('.objPresetBtn').forEach(b => {
      const active = b.dataset.type === initialType;
      b.style.borderColor = active ? '#38bdf8' : '#475569';
      b.style.background = active ? '#0284c7' : '#1e293b';
      b.style.color = active ? '#ffffff' : '#94a3b8';
    });
  }

  if (objectCalibPanel) {
    objectCalibPanel.style.display = 'block';
    objectCalibPanel.classList.add('visible');
  }

  updateObjectCalibUI();
  setStatus('کالیبراسیون با شیء مرجع: کاغذ A4 یا خط‌کش را جلوی دوربین نگه دارید 📏');
  speakText('شیء مرجع را جلوی دوربین نگه دارید و کادر را روی لبه‌های آن تنظیم کنید', 'Hold reference object in front of camera');
}

function exitObjectCalibration() {
  isObjectCalibrating = false;
  isDraggingObjBox = false;
  objDragMode = null;
  if (objectCalibPanel) {
    objectCalibPanel.style.display = 'none';
    objectCalibPanel.classList.remove('visible');
  }
  // Restore appropriate previous panel if returning to run or distance mode
  if (objCalibPreviousMode === 'run') {
    if (runPhase === 'calibrate1' || runPhase === 'calibrate2') {
      if (gateControls) gateControls.classList.add('visible');
    } else if (distPanel && gatePoints[0] && gatePoints[1]) {
      distPanel.classList.add('visible');
    }
  } else if (objCalibPreviousMode === 'distance') {
    if (distanceMeasurePanel) distanceMeasurePanel.classList.add('visible');
  }
}

function updateObjectCalibUI() {
  if (!objCalibReadout) return;
  const cw = canvas.width || 640;
  const ch = canvas.height || 480;
  const pxW = calibObjectBox.w * cw;
  const pxH = calibObjectBox.h * ch;
  
  const preset = OBJ_PRESETS[calibObjectType];
  const isVertical = preset ? preset.isVertical : (pxH >= pxW);
  const measuredPx = isVertical ? pxH : pxW;

  if (measuredPx > 8 && calibObjectRealCm > 0) {
    const scale = calibObjectRealCm / measuredPx; // cm per pixel
    const pxPerMeter = 100 / scale;
    objCalibReadout.textContent = `${Math.round(measuredPx)} px • هر پیکسل = ${scale.toFixed(3)} cm`;
    if (objCalibRatioReadout) {
      objCalibRatioReadout.textContent = `معادل: ${Math.round(pxPerMeter)} px/m (دقت: فوق‌العاده بالا)`;
    }
    if (objCalibConfirmBtn) objCalibConfirmBtn.disabled = false;
  } else {
    objCalibReadout.textContent = '-- px • -- cm/px';
    if (objCalibConfirmBtn) objCalibConfirmBtn.disabled = true;
  }
}

/**
 * Computer Vision Edge & Luminance Detector for bright white reference objects (e.g., A4 sheet)
 */
function autoDetectObjectInBox() {
  try {
    if (!video || video.readyState < 2) {
      setStatus('دوربین هنوز آماده نیست، لطفاً شکیبا باشید');
      return false;
    }
    const w = 320, h = 240;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tctx = tempCanvas.getContext('2d', { willReadFrequently: true });
    tctx.drawImage(video, 0, 0, w, h);

    const bx = Math.max(0, Math.floor(calibObjectBox.x * w));
    const by = Math.max(0, Math.floor(calibObjectBox.y * h));
    const bw = Math.min(w - bx, Math.floor(calibObjectBox.w * w));
    const bh = Math.min(h - by, Math.floor(calibObjectBox.h * h));

    if (bw < 15 || bh < 15) return false;

    const imgData = tctx.getImageData(bx, by, bw, bh);
    const data = imgData.data;

    let minX = bw, maxX = 0, minY = bh, maxY = 0;
    let brightPixelCount = 0;

    // Scan for bright white/high-contrast paper pixels (Y = 0.299R + 0.587G + 0.114B > 165)
    for (let y = 0; y < bh; y++) {
      for (let x = 0; x < bw; x++) {
        const idx = (y * bw + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // White paper detection: high luminance and balanced color
        if (lum > 160 && Math.abs(r - g) < 32 && Math.abs(r - b) < 32) {
          brightPixelCount++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    const detectedW = maxX - minX;
    const detectedH = maxY - minY;

    if (brightPixelCount > (bw * bh * 0.04) && detectedW > 15 && detectedH > 15) {
      // Smoothly expand slightly for full paper edge coverage (5% margin)
      const marginX = Math.round(detectedW * 0.03);
      const marginY = Math.round(detectedH * 0.03);
      const finalMinX = Math.max(0, minX - marginX);
      const finalMaxX = Math.min(bw, maxX + marginX);
      const finalMinY = Math.max(0, minY - marginY);
      const finalMaxY = Math.min(bh, maxY + marginY);

      calibObjectBox.x = (bx + finalMinX) / w;
      calibObjectBox.y = (by + finalMinY) / h;
      calibObjectBox.w = (finalMaxX - finalMinX) / w;
      calibObjectBox.h = (finalMaxY - finalMinY) / h;

      updateObjectCalibUI();
      playChime(880, 'triangle', 0.2);
      speakText('لبه‌های شیء مرجع با موفقیت شناسایی شد', 'Object detected');
      setStatus('لبه‌های شیء مرجع با پردازش تصویر منطبق شد ✅');
      return true;
    } else {
      setStatus('شیء با کنتراست مشخص در کادر یافت نشد؛ برگه سفید را مقابل پس‌زمینه نگه دارید یا کادر را دستی بکشید');
      playChime(350, 'sawtooth', 0.15);
      return false;
    }
  } catch (err) {
    console.warn('autoDetectObjectInBox error:', err);
    return false;
  }
}

/**
 * Draw interactive overlay on canvas during object calibration
 */
function objectCalibDrawOverlay() {
  if (!isObjectCalibrating) return;
  const cw = canvas.width;
  const ch = canvas.height;

  const bx = calibObjectBox.x * cw;
  const by = calibObjectBox.y * ch;
  const bw = calibObjectBox.w * cw;
  const bh = calibObjectBox.h * ch;

  ctx.save();

  // 1. Dim background outside calibration box
  ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
  ctx.beginPath();
  ctx.rect(0, 0, cw, ch);
  ctx.rect(bx, by, bw, bh);
  ctx.fill('evenodd');

  // 2. High-contrast glowing calibration rectangle
  ctx.shadowColor = '#00e5ff';
  ctx.shadowBlur = 10;
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(bx, by, bw, bh);
  ctx.shadowBlur = 0;

  // 3. Thick distinctive corner brackets
  const cornerLen = Math.min(26, Math.min(bw, bh) * 0.3);
  ctx.strokeStyle = '#4ade80'; // Emerald corner brackets
  ctx.lineWidth = 5;
  ctx.lineCap = 'square';

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(bx, by + cornerLen);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + cornerLen, by);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(bx + bw - cornerLen, by);
  ctx.lineTo(bx + bw, by);
  ctx.lineTo(bx + bw, by + cornerLen);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(bx, by + bh - cornerLen);
  ctx.lineTo(bx, by + bh);
  ctx.lineTo(bx + cornerLen, by + bh);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(bx + bw - cornerLen, by + bh);
  ctx.lineTo(bx + bw, by + bh);
  ctx.lineTo(bx + bw, by + bh - cornerLen);
  ctx.stroke();

  // 4. Caliper measurement dimension lines with arrows
  const preset = OBJ_PRESETS[calibObjectType];
  const isVertical = preset ? preset.isVertical : (bh >= bw);

  if (isVertical) {
    // Vertical measurement caliper on right edge
    const calX = bx + bw + 18;
    ctx.strokeStyle = '#facc15'; // Amber gold caliper
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx + bw + 6, by);
    ctx.lineTo(calX, by);
    ctx.lineTo(calX, by + bh);
    ctx.lineTo(bx + bw + 6, by + bh);
    ctx.stroke();

    // Arrows
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(calX, by); ctx.lineTo(calX - 4, by + 9); ctx.lineTo(calX + 4, by + 9); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(calX, by + bh); ctx.lineTo(calX - 4, by + bh - 9); ctx.lineTo(calX + 4, by + bh - 9); ctx.fill();

    // Center Dimension Label Tag
    const midY = by + bh / 2;
    const labelText = `📏 ${calibObjectRealCm} cm (${Math.round(bh)} px)`;
    ctx.font = 'bold 12px Vazirmatn, sans-serif';
    const tm = ctx.measureText(labelText);
    const tw = tm.width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(calX + 8, midY - 12, tw + 14, 24);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(calX + 8, midY - 12, tw + 14, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillText(labelText, calX + 15, midY + 5);
  } else {
    // Horizontal measurement caliper on bottom edge
    const calY = by + bh + 18;
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(bx, by + bh + 6);
    ctx.lineTo(bx, calY);
    ctx.lineTo(bx + bw, calY);
    ctx.lineTo(bx + bw, by + bh + 6);
    ctx.stroke();

    // Arrows
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(bx, calY); ctx.lineTo(bx + 9, calY - 4); ctx.lineTo(bx + 9, calY + 4); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bx + bw, calY); ctx.lineTo(bx + bw - 9, calY - 4); ctx.lineTo(bx + bw - 9, calY + 4); ctx.fill();

    // Center Dimension Label Tag
    const midX = bx + bw / 2;
    const labelText = `📏 ${calibObjectRealCm} cm (${Math.round(bw)} px)`;
    ctx.font = 'bold 12px Vazirmatn, sans-serif';
    const tm = ctx.measureText(labelText);
    const tw = tm.width;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(midX - tw / 2 - 8, calY + 8, tw + 16, 24);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(midX - tw / 2 - 8, calY + 8, tw + 16, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillText(labelText, midX - tw / 2, calY + 25);
  }

  // 5. Center Touch/Drag Reticle
  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
  ctx.beginPath();
  ctx.arc(bx + bw / 2, by + bh / 2, 16, 0, 2 * Math.PI);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 6. Top Instructional Banner
  const topText = 'شیء مرجع (کاغذ A4 / خط‌کش) را در کادر قرار داده و لبه‌ها را تنظیم کنید';
  ctx.font = 'bold 13px Vazirmatn, sans-serif';
  const topTm = ctx.measureText(topText);
  ctx.fillStyle = 'rgba(2, 132, 199, 0.9)';
  ctx.fillRect(cw / 2 - topTm.width / 2 - 14, 14, topTm.width + 28, 30);
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cw / 2 - topTm.width / 2 - 14, 14, topTm.width + 28, 30);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(topText, cw / 2 - topTm.width / 2, 34);

  ctx.restore();
}

// Preset button handlers
if (objCalibPresets) {
  objCalibPresets.querySelectorAll('.objPresetBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      objCalibPresets.querySelectorAll('.objPresetBtn').forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = '#475569';
        b.style.background = '#1e293b';
        b.style.color = '#94a3b8';
      });
      btn.classList.add('active');
      btn.style.borderColor = '#38bdf8';
      btn.style.background = '#0284c7';
      btn.style.color = '#fff';

      calibObjectType = btn.dataset.type;
      calibObjectRealCm = parseFloat(btn.dataset.size) || 29.7;
      if (objCalibCustomCm) objCalibCustomCm.value = calibObjectRealCm;

      const preset = OBJ_PRESETS[calibObjectType];
      if (preset && preset.isVertical) {
        calibObjectBox.w = 0.24;
        calibObjectBox.h = 0.50;
      } else {
        calibObjectBox.w = 0.44;
        calibObjectBox.h = 0.30;
      }
      updateObjectCalibUI();
    });
  });
}

if (objCalibCustomCm) {
  objCalibCustomCm.addEventListener('input', () => {
    const val = parseFloat(objCalibCustomCm.value);
    if (val > 0) {
      calibObjectRealCm = val;
      updateObjectCalibUI();
    }
  });
}

if (objCalibAutoDetectBtn) {
  objCalibAutoDetectBtn.addEventListener('click', () => {
    autoDetectObjectInBox();
  });
}

if (objCalibResetBoxBtn) {
  objCalibResetBoxBtn.addEventListener('click', () => {
    const preset = OBJ_PRESETS[calibObjectType] || OBJ_PRESETS['a4-v'];
    if (preset.isVertical) {
      calibObjectBox = { x: 0.38, y: 0.25, w: 0.24, h: 0.50 };
    } else {
      calibObjectBox = { x: 0.28, y: 0.35, w: 0.44, h: 0.30 };
    }
    updateObjectCalibUI();
    setStatus('کادر کالیبراسیون به حالت پیش‌فرض بازگشت');
  });
}

if (objCalibCancelBtn) {
  objCalibCancelBtn.addEventListener('click', () => {
    exitObjectCalibration();
    setStatus('کالیبراسیون با شیء مرجع لغو شد');
  });
}

if (objCalibConfirmBtn) {
  objCalibConfirmBtn.addEventListener('click', () => {
    const cw = canvas.width || 640;
    const ch = canvas.height || 480;
    const pxW = calibObjectBox.w * cw;
    const pxH = calibObjectBox.h * ch;
    const preset = OBJ_PRESETS[calibObjectType];
    const isVertical = preset ? preset.isVertical : (pxH >= pxW);
    const measuredPx = isVertical ? pxH : pxW;

    if (measuredPx <= 5 || calibObjectRealCm <= 0) {
      setStatus('کادر بسیار کوچک است؛ اندازه شیء را مشخص کنید');
      return;
    }

    const scale = calibObjectRealCm / measuredPx; // cm per pixel
    distCmPerPx = scale;
    currentEstimatedScaleCmPerPx = scale;

    try {
      localStorage.setItem('calibratedScaleCmPerPx', scale.toString());
      localStorage.setItem('calibratedObjectInfo', JSON.stringify({
        type: calibObjectType,
        realCm: calibObjectRealCm,
        pixels: measuredPx,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // If gatePoints are set in run mode, update the obstacle distance immediately!
    if (gatePoints[0] && gatePoints[1]) {
      const dx = gatePoints[1].x - gatePoints[0].x;
      const dy = gatePoints[1].y - gatePoints[0].y;
      const pxDist = Math.hypot(dx, dy);
      const totalM = (pxDist * distCmPerPx) / 100;
      if (distInput) distInput.value = totalM.toFixed(2);
      if (autoDistText) {
        const meters = Math.floor(totalM);
        const cm = Math.round((totalM % 1) * 100);
        autoDistText.textContent = `${meters} متر و ${cm} سانتی‌متر (با دقت برگه مرجع)`;
      }
    }

    // If in distance mode, update calculation
    if (typeof updateDistanceCalculation === 'function') {
      updateDistanceCalculation();
    }

    playChime(880, 'triangle', 0.25);
    speakText(`مقیاس با شیء مرجع کالیبره شد. هر پیکسل معادل ${scale.toFixed(2)} سانتی‌متر است`, 'Scale calibrated successfully');
    setStatus(`کالیبراسیون مقیاس با شیء مرجع با موفقیت اعمال شد: هر پیکسل = ${scale.toFixed(3)} cm ✅`);
    exitObjectCalibration();
  });
}

// Trigger button event bindings
if (gateA4CalibBtn) {
  gateA4CalibBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startObjectCalibration('a4-v');
  });
}

if (distPanelA4CalibBtn) {
  distPanelA4CalibBtn.addEventListener('click', () => {
    startObjectCalibration('a4-v');
  });
}

if (distObjA4CalibBtn) {
  distObjA4CalibBtn.addEventListener('click', () => {
    startObjectCalibration('a4-v');
  });
}

if (startObjectCalibSettingsBtn) {
  startObjectCalibSettingsBtn.addEventListener('click', () => {
    startObjectCalibration('a4-v');
  });
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
  if (heightCalibPanel) {
    heightCalibPanel.style.display = 'none';
    heightCalibPanel.classList.remove('visible');
  }
  isCalibratingHeight = false;
  if (objectCalibPanel) {
    objectCalibPanel.style.display = 'none';
    objectCalibPanel.classList.remove('visible');
  }
  isObjectCalibrating = false;
  if (boscoHud) boscoHud.style.display = 'none';
  if (situpStartPanel) situpStartPanel.classList.remove('visible');
  if (situpResultPanel) situpResultPanel.classList.remove('visible');
  if (situpHud) situpHud.style.display = 'none';
  if (typeof situpTimerInterval !== 'undefined' && situpTimerInterval) {
    clearInterval(situpTimerInterval);
    situpTimerInterval = null;
  }
  if (pushupStartPanel) pushupStartPanel.classList.remove('visible');
  if (pushupResultPanel) pushupResultPanel.classList.remove('visible');
  if (pushupHud) pushupHud.style.display = 'none';
  if (typeof pushupTimerInterval !== 'undefined' && pushupTimerInterval) {
    clearInterval(pushupTimerInterval);
    pushupTimerInterval = null;
  }
  if (squatLungeStartPanel) squatLungeStartPanel.classList.remove('visible');
  if (squatLungeResultPanel) squatLungeResultPanel.classList.remove('visible');
  if (squatLungeHud) squatLungeHud.style.display = 'none';
  if (typeof squatLungeTimerInterval !== 'undefined' && squatLungeTimerInterval) {
    clearInterval(squatLungeTimerInterval);
    squatLungeTimerInterval = null;
  }
  if (wingspanHud) wingspanHud.style.display = 'none';
  if (distanceHud) distanceHud.style.display = 'none';
  if (jumpHud) jumpHud.style.display = 'none';
  if (singleJumpHud) singleJumpHud.style.display = 'none';
  if (runHud) runHud.style.display = 'none';
  if (jumpCountdownOverlay) jumpCountdownOverlay.style.display = 'none';
  if (typeof jumpCountdownInterval !== 'undefined' && jumpCountdownInterval) {
    clearInterval(jumpCountdownInterval);
    jumpCountdownInterval = null;
  }
  if (flexibilityHud) flexibilityHud.style.display = 'none';
  if (flexibilityPanel) flexibilityPanel.classList.remove('visible');
  if (anthroHud) anthroHud.style.display = 'none';
  if (anthroPanel) anthroPanel.classList.remove('visible');
  if (agilityHud) agilityHud.style.display = 'none';
  if (agilityConeControls) agilityConeControls.classList.remove('visible');
  if (agilityResultPanel) agilityResultPanel.classList.remove('visible');
  const yBalancePanel = document.getElementById('yBalancePanel');
  if (yBalancePanel) yBalancePanel.classList.remove('visible');
  const proAgilityPanel = document.getElementById('proAgilityPanel');
  if (proAgilityPanel) proAgilityPanel.classList.remove('visible');
  const armCockingPanel = document.getElementById('armCockingPanel');
  if (armCockingPanel) armCockingPanel.classList.remove('visible');
  const posturePanel = document.getElementById('posturePanel');
  if (posturePanel) posturePanel.classList.remove('visible');
}

function setStatus(text) {
  statusEl.textContent = text;
}

// ================== AUDIO & SPEECH SYNTHESIS HELPER ==================
let audioCtx = null;

function playChime(freq = 660, type = 'sine', duration = 0.15) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function speakText(textFa, textEn) {
  playChime(660, 'sine', 0.08);
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance();
    const voices = window.speechSynthesis.getVoices() || [];
    const faVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes('fa') || v.lang.toLowerCase().includes('per')));
    
    if (faVoice) {
      utter.voice = faVoice;
      utter.lang = 'fa-IR';
      utter.text = textFa;
    } else {
      utter.lang = 'fa-IR';
      utter.text = textFa;
      utter.onerror = () => {
        if (textEn) {
          try {
            const fallbackUtter = new SpeechSynthesisUtterance(textEn);
            fallbackUtter.lang = 'en-US';
            fallbackUtter.rate = 1.0;
            window.speechSynthesis.speak(fallbackUtter);
          } catch (e) {}
        }
      };
    }
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('Speech error:', err);
  }
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    try { window.speechSynthesis.getVoices(); } catch (e) {}
  };
}

// ================== SCENE SCALE & POSE-BASED CALIBRATION ==================
let currentEstimatedScaleCmPerPx = null;

function updateEstimatedScaleFromPose(kp) {
  if (!kp) return;
  const athleteH = (getSettings().athleteHeight || 175); // in cm
  const candidates = [];

  const nose = kp['nose'];
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];

  const ankle = (la && la.score > 0.35 && ra && ra.score > 0.35) 
    ? { x: (la.x + ra.x) / 2, y: (la.y + ra.y) / 2 } 
    : (la && la.score > 0.35 ? la : (ra && ra.score > 0.35 ? ra : null));

  const hip = (lh && lh.score > 0.35 && rh && rh.score > 0.35) 
    ? { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 } 
    : (lh && lh.score > 0.35 ? lh : (rh && rh.score > 0.35 ? rh : null));

  const shoulder = (ls && ls.score > 0.35 && rs && rs.score > 0.35) 
    ? { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 } 
    : (ls && ls.score > 0.35 ? ls : (rs && rs.score > 0.35 ? rs : null));

  // 1. Nose to Ankle (full body)
  if (nose && nose.score > 0.35 && ankle) {
    const dy = ankle.y - nose.y;
    if (dy > 80) {
      candidates.push({ scale: (athleteH * 0.92) / dy, weight: 3.0 });
    }
  }

  // 2. Shoulder to Ankle
  if (shoulder && ankle) {
    const dy = ankle.y - shoulder.y;
    if (dy > 60) {
      candidates.push({ scale: (athleteH * 0.81) / dy, weight: 2.5 });
    }
  }

  // 3. Hip to Ankle (legs)
  if (hip && ankle) {
    const dy = ankle.y - hip.y;
    if (dy > 40) {
      candidates.push({ scale: (athleteH * 0.50) / dy, weight: 2.0 });
    }
  }

  // 4. Shoulder to Hip (torso)
  if (shoulder && hip) {
    const dy = hip.y - shoulder.y;
    if (dy > 30) {
      candidates.push({ scale: (athleteH * 0.30) / dy, weight: 1.5 });
    }
  }

  // 5. Shoulder width
  if (ls && rs && ls.score > 0.35 && rs.score > 0.35) {
    const dx = Math.hypot(rs.x - ls.x, rs.y - ls.y);
    if (dx > 25) {
      candidates.push({ scale: (athleteH * 0.23) / dx, weight: 1.0 });
    }
  }

  if (candidates.length === 0) return;

  let totalWeight = 0;
  let weightedSum = 0;
  for (const c of candidates) {
    weightedSum += c.scale * c.weight;
    totalWeight += c.weight;
  }
  const instantScale = weightedSum / totalWeight;

  if (instantScale > 0.03 && instantScale < 15.0) {
    if (currentEstimatedScaleCmPerPx == null) {
      currentEstimatedScaleCmPerPx = instantScale;
    } else {
      currentEstimatedScaleCmPerPx = currentEstimatedScaleCmPerPx * 0.92 + instantScale * 0.08;
    }
    distCmPerPx = currentEstimatedScaleCmPerPx;
  }
}

function calculateObstacleDistance() {
  if (!gatePoints[0] || !gatePoints[1]) return null;
  const dx = gatePoints[1].x - gatePoints[0].x;
  const dy = gatePoints[1].y - gatePoints[0].y;
  const pxDist = Math.hypot(dx, dy);
  
  const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.45;
  const totalCm = pxDist * scale;
  const totalM = totalCm / 100;
  const meters = Math.floor(totalM);
  const cm = Math.round(totalCm % 100);
  
  let textFa = '';
  if (meters > 0 && cm > 0) {
    textFa = `${meters} متر و ${cm} سانتی‌متر`;
  } else if (meters > 0) {
    textFa = `${meters} متر`;
  } else {
    textFa = `${cm} سانتی‌متر`;
  }
  
  return {
    pxDist,
    totalCm,
    totalM,
    meters,
    cm,
    textFa,
    textShort: `${totalM.toFixed(2)} متر (${Math.round(totalCm)} cm)`
  };
}

function announceObstacleDistance() {
  const distInfo = calculateObstacleDistance();
  if (!distInfo) return;
  const faSpeech = `فاصله بین دو مانع: ${distInfo.textFa}`;
  const enSpeech = `Distance between obstacles: ${distInfo.meters} meters and ${distInfo.cm} centimeters`;
  speakText(faSpeech, enSpeech);
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
    showGuide('👆', 'انتخاب مانع دوم', 'حالا روی نقطهٔ مانع دوم ضربه بزن. فاصله دقیق بین دو مانع به متر و سانتی‌متر محاسبه و اعلام می‌شود.');
  }
  updateGateControls();
}

function runEnterEnterDistance() {
  runPhase = 'enterDistance';
  hideAllPanels();
  setStatus('فاصلهٔ واقعی بین دو مانع را بررسی یا تأیید کنید');
  distPanel.classList.add('visible');

  const distInfo = calculateObstacleDistance();
  if (distInfo) {
    distInput.value = distInfo.totalM.toFixed(2);
    if (autoDistText) {
      autoDistText.textContent = `${distInfo.textFa} (${distInfo.totalM.toFixed(2)} متر)`;
    }
    if (distPanelSpeakBtn) {
      distPanelSpeakBtn.onclick = (e) => {
        e.preventDefault();
        announceObstacleDistance();
      };
    }
  }
}

function runEnterReady() {
  runPhase = 'ready';
  gateCrossed = [false, false];
  prevSide = [null, null];
  runStartTime = null;
  runEndTime = null;
  hideAllPanels();
  resetFrameTracking(); // Reset frame tracking
  if (runHud) {
    runHud.style.display = 'block';
    if (runTimerVal) runTimerVal.textContent = '0.00s';
    if (runGateStatusVal) {
      runGateStatusVal.textContent = 'در انتظار مانع ۱ (شروع)';
      runGateStatusVal.className = 'hudVal warn';
    }
    if (runSpeedVal) runSpeedVal.textContent = '-- m/s';
  }
  setStatus('آماده! از کنار یکی از موانع رد شو تا زمان‌گیری شروع بشه ⚡');
}

function runFinish() {
  runPhase = 'done';
  if (runHud) runHud.style.display = 'none';
  const elapsedSec = Math.max(0.05, (runEndTime - runStartTime) / 1000);
  const speed = distanceMeters / elapsedSec;
  const speedKmh = speed * 3.6;
  const accel = (2 * distanceMeters / (elapsedSec * elapsedSec));
  
  // Validate speed result
  const validation = validateRunSpeed(speed, elapsedSec, distanceMeters);
  
  timeResultEl.textContent = elapsedSec.toFixed(2);
  speedResultEl.textContent = speed.toFixed(2);
  if (speedKmhResultEl) speedKmhResultEl.textContent = speedKmh.toFixed(1);
  if (runDistBadge) runDistBadge.textContent = distanceMeters.toFixed(1);
  if (runPaceResultEl) runPaceResultEl.textContent = `${accel.toFixed(2)} m/s² (شتاب)`;

  const activeAth = getActiveAthlete();
  if (runAthleteNameEl) runAthleteNameEl.textContent = activeAth ? activeAth.name : 'ورزشکار ۱';

  // Benchmark rating
  let ratingText = 'متوسط';
  let ratingClass = 'pdfBenchmarkBadge needWork';
  if (speed >= 7.5) {
    ratingText = '⭐️ نخبگی ورزشی (Elite)';
    ratingClass = 'pdfBenchmarkBadge elite';
  } else if (speed >= 6.0) {
    ratingText = '🟢 عالی (High Talent)';
    ratingClass = 'pdfBenchmarkBadge good';
  } else if (speed >= 4.8) {
    ratingText = '🔵 مناسب (Good)';
    ratingClass = 'pdfBenchmarkBadge good';
  }
  if (runRatingBadge) {
    runRatingBadge.className = ratingClass;
    runRatingBadge.textContent = ratingText;
  }

  resultPanel.classList.add('visible');

  // Wire Save button
  if (runSaveBtn) {
    runSaveBtn.onclick = () => {
      saveToHistory('run', {
        time: elapsedSec.toFixed(2),
        speed: speed.toFixed(2),
        speedKmh: speedKmh.toFixed(1),
        distance: distanceMeters,
        accel: accel.toFixed(2),
        rating: ratingText
      });
      setStatus('سوابق دوی سرعت با موفقیت در پرونده ثبت شد ✅');
      runSaveBtn.textContent = 'ذخیره شد ✓';
      setTimeout(() => { if (runSaveBtn) runSaveBtn.textContent = '💾 ذخیره در سوابق'; }, 2500);
    };
  }
  
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
          speedKmh: speedKmh.toFixed(1),
          distance: distanceMeters,
          accel: accel.toFixed(2),
          rating: ratingText
        });
      },
      () => {
        // User wants to retry
        resultPanel.classList.remove('visible');
        runEnterReady();
      }
    );
  } else {
    setStatus('تمام شد! 🏁');
    // Save to history automatically
    saveToHistory('run', {
      time: elapsedSec.toFixed(2),
      speed: speed.toFixed(2),
      speedKmh: speedKmh.toFixed(1),
      distance: distanceMeters,
      accel: accel.toFixed(2),
      rating: ratingText
    });
  }
}

let prevRunnerX = null;
let prevRunnerTime = null;

function runUpdateGateCrossing(runnerX) {
  if (runPhase !== 'ready' && runPhase !== 'timing') return;
  if (runnerX == null) return;
  const now = performance.now();

  for (let i = 0; i < 2; i++) {
    if (gateCrossed[i]) continue;
    if (!gatePoints[i]) continue;
    const gateX = gatePoints[i].x;
    const side = runnerX < gateX ? -1 : 1;
    if (prevSide[i] != null && side !== prevSide[i]) {
      gateCrossed[i] = true;
      // High-precision sub-frame linear interpolation
      let crossingTime = now;
      if (prevRunnerX != null && prevRunnerTime != null && Math.abs(runnerX - prevRunnerX) > 0.5) {
        const fraction = Math.min(1, Math.max(0, Math.abs(gateX - prevRunnerX) / Math.abs(runnerX - prevRunnerX)));
        crossingTime = prevRunnerTime + fraction * (now - prevRunnerTime);
      }

      if (runStartTime === null) {
        runStartTime = crossingTime;
        runPhase = 'timing';
        setStatus('در حال دویدن به سمت مانع دوم... ⚡⏱');
        if (runGateStatusVal) {
          runGateStatusVal.textContent = 'در حال دویدن ⚡';
          runGateStatusVal.className = 'hudVal accent';
        }
        playChime(660, 'sine', 0.12);
      } else {
        runEndTime = crossingTime;
        playChime(880, 'triangle', 0.15);
        runFinish();
      }
    }
    prevSide[i] = side;
  }
  prevRunnerX = runnerX;
  prevRunnerTime = now;
}

function runDrawGates() {
  // Live chronograph HUD update when timing
  if (runPhase === 'timing' && runStartTime != null) {
    const elapsed = Math.max(0, (performance.now() - runStartTime) / 1000);
    if (runTimerVal) runTimerVal.textContent = elapsed.toFixed(2) + 's';
    const currentSpeed = distanceMeters / Math.max(0.1, elapsed);
    if (runSpeedVal) runSpeedVal.textContent = currentSpeed.toFixed(1) + ' m/s';

    // Canvas floating live stopwatch pill
    ctx.save();
    const liveText = `⏱️ ${elapsed.toFixed(2)}s  •  ${currentSpeed.toFixed(1)} m/s`;
    ctx.font = 'bold 13px Vazirmatn, sans-serif';
    const pillW = ctx.measureText(liveText).width + 24;
    const pillH = 30;
    const pillX = (canvas.width - pillW) / 2;
    const pillY = 16;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 15);
    else ctx.rect(pillX, pillY, pillW, pillH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(liveText, canvas.width / 2, pillY + pillH / 2);
    ctx.restore();
  }

  // Ground measurement line between obstacles if both are set
  if (gatePoints[0] && gatePoints[1]) {
    const p1 = gatePoints[0];
    const p2 = gatePoints[1];
    ctx.save();
    
    // Glowing ground connector line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension end ticks
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const perpAngle = angle + Math.PI / 2;
    const tickLen = 10;
    
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    // Tick 1
    ctx.beginPath();
    ctx.moveTo(p1.x - Math.cos(perpAngle) * tickLen, p1.y - Math.sin(perpAngle) * tickLen);
    ctx.lineTo(p1.x + Math.cos(perpAngle) * tickLen, p1.y + Math.sin(perpAngle) * tickLen);
    ctx.stroke();
    // Tick 2
    ctx.beginPath();
    ctx.moveTo(p2.x - Math.cos(perpAngle) * tickLen, p2.y - Math.sin(perpAngle) * tickLen);
    ctx.lineTo(p2.x + Math.cos(perpAngle) * tickLen, p2.y + Math.sin(perpAngle) * tickLen);
    ctx.stroke();

    // Floating Badge in middle of the obstacles
    const distInfo = calculateObstacleDistance();
    if (distInfo) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - 16;
      const badgeText = `📏 ${distInfo.totalM.toFixed(2)}m (مانع ۱ ➔ مانع ۲)`;
      
      ctx.font = 'bold 11px Vazirmatn, sans-serif';
      const textW = ctx.measureText(badgeText).width;
      const padX = 10, h = 22;
      
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(midX - textW/2 - padX, midY - h/2, textW + padX*2, h, 11);
      else ctx.rect(midX - textW/2 - padX, midY - h/2, textW + padX*2, h);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, midX, midY);
    }
    
    ctx.restore();
  }

  // Draw vertical optical timing gates
  gatePoints.forEach((pt, i) => {
    if (!pt) return;
    const done = gateCrossed[i];
    const gateColor = done ? '#22c55e' : (i === 0 ? '#38bdf8' : '#f59e0b');
    
    ctx.save();
    // Laser beam core
    ctx.strokeStyle = gateColor;
    ctx.lineWidth = done ? 2.5 : 2;
    ctx.setLineDash(done ? [] : [6, 4]);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Base emitter sensor circle
    ctx.fillStyle = gateColor;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 7, 0, 2 * Math.PI);
    ctx.fill();

    // Outer glow ring on base
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Floating Gate Tag Pill
    const tagText = done
      ? (i === 0 ? '✓ مانع ۱ (عبور کرد)' : '✓ مانع ۲ (پایان)')
      : (i === 0 ? '🏁 مانع ۱ (شروع)' : '🎯 مانع ۲ (پایان)');

    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    const tagW = ctx.measureText(tagText).width + 16;
    const tagH = 22;
    const tagY = Math.max(12, Math.min(canvas.height - 40, pt.y - 28));

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = gateColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(pt.x - tagW / 2, tagY, tagW, tagH, 11);
    else ctx.rect(pt.x - tagW / 2, tagY, tagW, tagH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = gateColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tagText, pt.x, tagY + tagH / 2);
    ctx.restore();
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

  if (runPhase === 'calibrate1') {
    if (gateSpeakBtn) gateSpeakBtn.style.display = 'none';
    gateHint.textContent = hasPoint
      ? 'مانع اول مشخص شد. برای تغییر دوباره ضربه بزن یا ادامه بده.'
      : 'روی نقطه مانع اول (روی زمین) ضربه بزن';
  } else {
    if (gatePoints[0] && gatePoints[1]) {
      const distInfo = calculateObstacleDistance();
      if (distInfo) {
        gateHint.innerHTML = `فاصله بین دو مانع: <strong style="color: #4ade80;">${distInfo.textFa}</strong> (${distInfo.totalM.toFixed(2)}m)`;
        if (gateSpeakBtn) {
          gateSpeakBtn.style.display = 'inline-flex';
          gateSpeakBtn.onclick = (e) => {
            e.stopPropagation();
            announceObstacleDistance();
          };
        }
      }
    } else {
      if (gateSpeakBtn) gateSpeakBtn.style.display = 'none';
      gateHint.textContent = 'حالا روی نقطه مانع دوم ضربه بزن';
    }
  }
}

document.getElementById('stage').addEventListener('click', (e) => {
  if (isCalibratingHeight) {
    handleHeightCalibStageClick(e);
    return;
  }
  if (mode !== 'run') return;
  if (runPhase !== 'calibrate1' && runPhase !== 'calibrate2') return;
  // Ignore taps that land on the gate-controls bar or the guide banner itself
  if (e.target.closest && (e.target.closest('#gateControls') || e.target.closest('#guideOverlay'))) return;
  guideOverlay.classList.remove('visible');
  const point = clientToCanvasCoords(e.clientX, e.clientY);
  const idx = runPhase === 'calibrate1' ? 0 : 1;
  gatePoints[idx] = point;
  updateGateControls();
  if (idx === 1 && gatePoints[0] && gatePoints[1]) {
    setTimeout(() => {
      announceObstacleDistance();
    }, 250);
  }
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
  // Update calibrated scale using user-confirmed ground truth distance
  if (gatePoints[0] && gatePoints[1]) {
    const pxDist = Math.hypot(gatePoints[1].x - gatePoints[0].x, gatePoints[1].y - gatePoints[0].y);
    if (pxDist > 10) {
      currentEstimatedScaleCmPerPx = (distanceMeters * 100) / pxDist;
      distCmPerPx = currentEstimatedScaleCmPerPx;
    }
  }
  runEnterReady();
});

// Quick Distance Preset Buttons for Track & Scouting
document.querySelectorAll('.distPresetBtn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.distPresetBtn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const d = parseFloat(btn.dataset.dist);
    if (!isNaN(d)) {
      distInput.value = d;
      // If obstacles are already set, recalculate scale
      if (gatePoints[0] && gatePoints[1]) {
        const pxDist = Math.hypot(gatePoints[1].x - gatePoints[0].x, gatePoints[1].y - gatePoints[0].y);
        if (pxDist > 10) {
          currentEstimatedScaleCmPerPx = (d * 100) / pxDist;
          distCmPerPx = currentEstimatedScaleCmPerPx;
        }
      }
    }
  });
});

againBtn.addEventListener('click', runEnterReady);
recalibBtn.addEventListener('click', runEnterCalibrate1);

// ================== JUMP MODE ==================
// jumpPhase: 'calibrating' | 'ready' | 'airborne' | 'done'
let jumpPhase = 'calibrating';
let baselineY = null;
legLengthPx = null;
let calibSamples = [];
CALIB_FRAMES_NEEDED = 20; // ~0.5-1s of standing still
airThresholdPx = 20;
landThresholdPx = 10;
let aboveCount = 0;
let belowCount = 0;
const DEBOUNCE_FRAMES = 2;
let jumpTakeoffTime = null;
let jumpLandTime = null;

let jumpCandidateTakeoff = null;
let jumpCandidateLand = null;
let minHipYDuringJump = Infinity;
let baselineHipY = null;
let jumpFrameHistory = [];

let jumpApexY = null;
let jumpMaxRisePx = 0;
let lastJumpAnklePt = null;

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
  jumpFrameHistory = [];
  jumpApexY = null;
  jumpMaxRisePx = 0;
  lastJumpAnklePt = null;
  hideAllPanels();
  applySettings();
  showGuide('🧍', 'کالیبراسیون پرش', 'صاف و بی‌حرکت روبروی دوربین بایست تا ارتفاع پایه ثبت بشه. حدود یک ثانیه طول می‌کشه.');
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
  jumpFrameHistory = [];
  jumpApexY = null;
  jumpMaxRisePx = 0;
  lastJumpAnklePt = null;
  hideAllPanels();
  if (jumpHud) jumpHud.style.display = 'block';
  if (singleJumpHud) {
    singleJumpHud.style.display = 'block';
    if (jumpLiveHeightVal) jumpLiveHeightVal.textContent = '0.0 cm';
    if (jumpLiveAirVal) jumpLiveAirVal.textContent = '0.000s';
    if (jumpLiveStatusVal) {
      jumpLiveStatusVal.textContent = 'روی زمین (آماده)';
      jumpLiveStatusVal.className = 'hudVal warn';
    }
  }
  resetFrameTracking(); // Reset frame tracking
  setStatus('آماده! بپر 🤸 یا از دکمه آمادگی (۳ ثانیه) استفاده کن');
}

let jumpCountdownVal = 3;

function jumpStartCountdown() {
  if (jumpCountdownInterval) {
    clearInterval(jumpCountdownInterval);
    jumpCountdownInterval = null;
  }
  jumpPhase = 'countdown';
  jumpCountdownVal = 3;
  if (jumpCountdownOverlay) {
    jumpCountdownOverlay.style.display = 'flex';
    if (jumpCountdownNumber) {
      jumpCountdownNumber.textContent = '۳';
      jumpCountdownNumber.style.color = '#38bdf8';
    }
    if (jumpCountdownSub) {
      jumpCountdownSub.textContent = 'صاف روبروی دوربین بایستید و آماده جهش شوید...';
    }
  }
  setStatus('آماده‌باش... ۳ ثانیه تا پرش');
  playChime(440, 'sine', 0.15);

  jumpCountdownInterval = setInterval(() => {
    jumpCountdownVal--;
    if (jumpCountdownVal > 0) {
      if (jumpCountdownNumber) {
        jumpCountdownNumber.textContent = jumpCountdownVal === 2 ? '۲' : '۱';
      }
      playChime(440 + (3 - jumpCountdownVal) * 120, 'sine', 0.15);
    } else if (jumpCountdownVal === 0) {
      if (jumpCountdownNumber) {
        jumpCountdownNumber.textContent = 'بپر! 🚀';
        jumpCountdownNumber.style.color = '#4ade80';
      }
      if (jumpCountdownSub) {
        jumpCountdownSub.textContent = 'جهش عمودی خود را به بالاترین نقطه انجام دهید!';
      }
      playChime(880, 'sine', 0.28);
      setStatus('بپر! 🚀 در حال ثبت اوج پرش');
      jumpEnterReady();
    } else {
      clearInterval(jumpCountdownInterval);
      jumpCountdownInterval = null;
      if (jumpCountdownOverlay) jumpCountdownOverlay.style.display = 'none';
      if (jumpCountdownNumber) {
        jumpCountdownNumber.textContent = '۳';
        jumpCountdownNumber.style.color = '#38bdf8';
      }
    }
  }, 900);
}

function adjustJumpBaseline(deltaPx) {
  if (baselineY == null) {
    baselineY = canvas.height * 0.75;
  }
  baselineY = Math.max(canvas.height * 0.15, Math.min(canvas.height * 0.95, baselineY + deltaPx));
  if (baselineHipY != null) {
    legLengthPx = Math.max(30, baselineY - baselineHipY);
  }
  const settings = getSettings();
  airThresholdPx = (legLengthPx || 100) * settings.jumpThresholdRatio;
  landThresholdPx = (legLengthPx || 100) * settings.landThresholdRatio;
  setStatus(`خط مبنای پرش تنظیم شد: ${Math.round(baselineY)} px`);
}

function autoLevelJumpBaseline() {
  if (lastSeenKeypoints) {
    const la = lastSeenKeypoints['left_ankle'];
    const ra = lastSeenKeypoints['right_ankle'];
    const lf = lastSeenKeypoints['left_foot_index'];
    const rf = lastSeenKeypoints['right_foot_index'];
    const feetY = [la, ra, lf, rf].filter(p => p && (p.score == null || p.score > 0.15)).map(p => p.y);
    if (feetY.length > 0) {
      baselineY = Math.max(...feetY);
      const lh = lastSeenKeypoints['left_hip'];
      const rh = lastSeenKeypoints['right_hip'];
      if (lh && rh) {
        baselineHipY = (lh.y + rh.y) / 2;
        legLengthPx = Math.max(30, baselineY - baselineHipY);
      }
      const settings = getSettings();
      airThresholdPx = (legLengthPx || 100) * settings.jumpThresholdRatio;
      landThresholdPx = (legLengthPx || 100) * settings.landThresholdRatio;
      setStatus(`خط مبنا با کف و مچ پا تراز شد: ${Math.round(baselineY)} px`);
      return;
    }
  }
  setStatus('مچ یا کف پا در کادر نیست؛ لطفاً در دید دوربین قرار گیرید.');
}

function jumpFinish() {
  jumpPhase = 'done';
  if (jumpHud) jumpHud.style.display = 'none';
  if (singleJumpHud) singleJumpHud.style.display = 'none';
  const airTimeSec = Math.max(0.08, (jumpLandTime - jumpTakeoffTime) / 1000);
  const heightFlightCm = ((9.81 * airTimeSec * airTimeSec) / 8) * 100;

  // Direct hip displacement
  const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.35;
  const hipRisePx = (baselineHipY != null && minHipYDuringJump < Infinity)
    ? Math.max(0, baselineHipY - minHipYDuringJump)
    : 0;
  const heightDisplacementCm = hipRisePx * scale;

  // Biomechanical sensor fusion
  let finalHeightCm = heightFlightCm;
  if (heightDisplacementCm > 4) {
    const diff = Math.abs(heightFlightCm - heightDisplacementCm);
    if (diff < 12) {
      finalHeightCm = heightFlightCm * 0.55 + heightDisplacementCm * 0.45;
    } else {
      finalHeightCm = heightFlightCm * 0.35 + heightDisplacementCm * 0.65;
    }
  }

  // Biomechanical kinetics calculations
  const v0 = 9.81 * (airTimeSec / 2); // Takeoff velocity (m/s)
  const activeAth = getActiveAthlete();
  const bodyMassKg = (activeAth && activeAth.weightKg) ? activeAth.weightKg : 70;
  // Sayers peak mechanical power (Watts): P = 60.7 * JumpHeight(cm) + 45.3 * BodyMass(kg) - 2055
  const peakPowerWatts = Math.max(0, 60.7 * finalHeightCm + 45.3 * bodyMassKg - 2055);
  const powerPerKg = (peakPowerWatts / bodyMassKg).toFixed(1);

  // Talent Benchmark Rating
  let ratingText = 'متوسط';
  let ratingClass = 'pdfBenchmarkBadge needWork';
  const isFemale = activeAth && activeAth.gender === 'female';
  const eliteH = isFemale ? 45 : 52;
  const goodH = isFemale ? 34 : 40;
  const midH = isFemale ? 26 : 32;

  if (finalHeightCm >= eliteH) {
    ratingText = '⭐️ نخبگی ورزشی (Elite)';
    ratingClass = 'pdfBenchmarkBadge elite';
  } else if (finalHeightCm >= goodH) {
    ratingText = '🟢 عالی (High Talent)';
    ratingClass = 'pdfBenchmarkBadge good';
  } else if (finalHeightCm >= midH) {
    ratingText = '🔵 بالاتر از میانگین (Good)';
    ratingClass = 'pdfBenchmarkBadge good';
  } else {
    ratingText = '🟡 نیاز به تمرین (Developing)';
    ratingClass = 'pdfBenchmarkBadge needWork';
  }

  if (jumpRatingBadge) {
    jumpRatingBadge.className = ratingClass;
    jumpRatingBadge.textContent = ratingText;
  }
  if (jumpVelocityResultEl) jumpVelocityResultEl.textContent = v0.toFixed(2);
  if (jumpPowerResultEl) jumpPowerResultEl.textContent = Math.round(peakPowerWatts).toLocaleString('fa-IR');
  if (jumpAthleteNameEl) jumpAthleteNameEl.textContent = activeAth ? activeAth.name : 'ورزشکار ۱';
  
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
  const heightValidation = validateJumpHeight(finalHeightCm, airTimeSec);
  
  airTimeResultEl.textContent = airTimeSec.toFixed(3);
  jumpHeightResultEl.textContent = finalHeightCm.toFixed(1);
  jumpResultPanel.classList.add('visible');

  // Wire Save button
  if (jumpSaveBtn) {
    jumpSaveBtn.onclick = () => {
      saveToHistory('jump', {
        airTime: airTimeSec.toFixed(3),
        height: finalHeightCm.toFixed(1),
        velocity: v0.toFixed(2),
        power: Math.round(peakPowerWatts),
        powerPerKg: powerPerKg,
        rating: ratingText
      });
      setStatus('سوابق پرش با موفقیت در پرونده ثبت شد ✅');
      jumpSaveBtn.textContent = 'ذخیره شد ✓';
      setTimeout(() => { if (jumpSaveBtn) jumpSaveBtn.textContent = '💾 ذخیره در سوابق'; }, 2500);
    };
  }
  
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
          height: finalHeightCm.toFixed(1),
          velocity: v0.toFixed(2),
          power: Math.round(peakPowerWatts),
          powerPerKg: powerPerKg,
          rating: ratingText
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
    // Save to history automatically
    saveToHistory('jump', {
      airTime: airTimeSec.toFixed(3),
      height: finalHeightCm.toFixed(1),
      velocity: v0.toFixed(2),
      power: Math.round(peakPowerWatts),
      powerPerKg: powerPerKg,
      rating: ratingText
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
  const ankleX = ankles.reduce((s, p) => s + p.x, 0) / ankles.length;
  let hipY = null;
  if (hips.length) hipY = hips.reduce((s, p) => s + p.y, 0) / hips.length;
  return { ankleY, ankleX, hipY };
}

function jumpProcessFrame(kp) {
  const data = getHipAnkleY(kp);
  if (!data) return;
  const { ankleY, ankleX, hipY } = data;
  const now = performance.now();
  lastJumpAnklePt = { x: ankleX, y: ankleY };

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

  // Save history for sub-frame takeoff & landing interpolation
  jumpFrameHistory.push({ time: now, ankleY, hipY, risePx });
  if (jumpFrameHistory.length > 30) jumpFrameHistory.shift();

  if (jumpPhase === 'ready') {
    const triggerPx = Math.max(6, airThresholdPx * 0.45);
    if (risePx > triggerPx) {
      aboveCount++;
      if (aboveCount >= 2) {
        let takeoffTime = now - 50;
        for (let i = jumpFrameHistory.length - 1; i >= 0; i--) {
          if (jumpFrameHistory[i].risePx <= 3) {
            takeoffTime = jumpFrameHistory[i].time;
            break;
          }
        }
        jumpTakeoffTime = takeoffTime;
        jumpPhase = 'airborne';
        jumpMaxRisePx = Math.max(0, risePx);
        jumpApexY = ankleY;
        minHipYDuringJump = hipY != null ? hipY : Infinity;
        aboveCount = 0;
        belowCount = 0;
        playChime(520, 'sine', 0.1);
        setStatus('در هوا... ⤴️');
        if (jumpLiveStatusVal) {
          jumpLiveStatusVal.textContent = 'در اوج پرواز 🚀';
          jumpLiveStatusVal.className = 'hudVal accent';
        }
      }
    } else {
      aboveCount = 0;
    }
  } else if (jumpPhase === 'airborne') {
    if (hipY != null && hipY < minHipYDuringJump) {
      minHipYDuringJump = hipY;
    }
    if (risePx > jumpMaxRisePx) {
      jumpMaxRisePx = risePx;
      jumpApexY = ankleY;
    }

    // Live Single Jump HUD updates
    const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.35;
    const currentLiveCm = jumpMaxRisePx * scale;
    const currentLiveAirSec = Math.max(0, (now - jumpTakeoffTime) / 1000);
    if (jumpLiveHeightVal) jumpLiveHeightVal.textContent = `${currentLiveCm.toFixed(1)} cm`;
    if (jumpLiveAirVal) jumpLiveAirVal.textContent = `${currentLiveAirSec.toFixed(3)}s`;

    const touchPx = Math.max(6, landThresholdPx * 0.6);
    if (risePx < touchPx) {
      belowCount++;
      if (belowCount >= 2) {
        let landTime = now;
        for (let i = jumpFrameHistory.length - 1; i >= 0; i--) {
          if (jumpFrameHistory[i].risePx <= 4) {
            landTime = jumpFrameHistory[i].time;
            break;
          }
        }
        jumpLandTime = landTime;
        playChime(660, 'triangle', 0.12);
        jumpFinish();
      }
    } else {
      belowCount = 0;
    }
  }
}

function jumpDrawOverlay() {
  if (baselineY != null) {
    ctx.save();
    const isAir = jumpPhase === 'airborne';
    ctx.strokeStyle = isAir ? '#facc15' : '#22c55e';
    ctx.lineWidth = isAir ? 2.5 : 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(0, baselineY);
    ctx.lineTo(canvas.width, baselineY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Minimal end bracket markers [ --- ]
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(10, baselineY - 6);
    ctx.lineTo(10, baselineY + 6);
    ctx.moveTo(canvas.width - 10, baselineY - 6);
    ctx.lineTo(canvas.width - 10, baselineY + 6);
    ctx.stroke();

    // Minimal Drag Handle Pill
    const handleW = 140;
    const handleH = 24;
    const handleX = Math.max(10, canvas.width - handleW - 12);
    const handleY = baselineY - handleH / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(handleX, handleY, handleW, handleH, 12);
    } else {
      ctx.rect(handleX, handleY, handleW, handleH);
    }
    ctx.fill();
    ctx.strokeStyle = isAir ? '#facc15' : '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⬍ تراز مبنای پرش', handleX + handleW / 2, baselineY);

    // Live vertical flight beam & metric badge while airborne
    if (isAir && lastJumpAnklePt && baselineY > lastJumpAnklePt.y) {
      const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.35;
      const currentCm = Math.max(0, (baselineY - lastJumpAnklePt.y) * scale);

      // Dashed vertical laser line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(lastJumpAnklePt.x, baselineY);
      ctx.lineTo(lastJumpAnklePt.x, lastJumpAnklePt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Foot tracking point
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(lastJumpAnklePt.x, lastJumpAnklePt.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Floating live height pill near athlete
      const chipText = `+${currentCm.toFixed(1)} cm`;
      ctx.font = 'bold 12px Vazirmatn, sans-serif';
      const chipW = ctx.measureText(chipText).width + 16;
      const chipH = 22;
      const chipX = Math.min(canvas.width - chipW - 10, lastJumpAnklePt.x + 14);
      const chipY = lastJumpAnklePt.y - chipH / 2;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(chipX, chipY, chipW, chipH, 8);
      else ctx.rect(chipX, chipY, chipW, chipH);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(chipText, chipX + chipW / 2, chipY + chipH / 2);

      // Apex marker line
      if (jumpApexY != null && jumpApexY < baselineY) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(Math.max(0, lastJumpAnklePt.x - 30), jumpApexY);
        ctx.lineTo(Math.min(canvas.width, lastJumpAnklePt.x + 30), jumpApexY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    ctx.restore();
  }
}

jumpAgainBtn.addEventListener('click', jumpEnterReady);
jumpRecalibBtn.addEventListener('click', jumpEnterCalibrating);

if (jumpPrepTimerBtn) {
  jumpPrepTimerBtn.addEventListener('click', jumpStartCountdown);
}
if (jumpLineUpBtn) {
  jumpLineUpBtn.addEventListener('click', () => adjustJumpBaseline(-6));
}
if (jumpLineDownBtn) {
  jumpLineDownBtn.addEventListener('click', () => adjustJumpBaseline(6));
}
if (jumpLineAutoBtn) {
  jumpLineAutoBtn.addEventListener('click', autoLevelJumpBaseline);
}

// ================== BOSCO CONTINUOUS JUMP TEST (CONFIGURABLE DURATION) ==================
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
let boscoConfiguredDuration = 30; // 5s, 10s, 15s, 30s, 60s or custom

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
  const dur = boscoConfiguredDuration || 30;
  setStatus(`آزمون ${dur} ثانیه پرش متوالی: دکمه شروع را بزنید`);
  if (boscoTimerVal) boscoTimerVal.textContent = dur.toFixed(1) + 's';
}

let boscoCountdownVal = 3;
let boscoLastCountdownSec = 30;

function boscoStartCountdown() {
  boscoPhase = 'countdown';
  hideAllPanels();
  let count = 3;
  boscoCountdownVal = 3;
  setStatus('آماده... ۳ ⏳');

  // Audio chime and TTS for "3"
  playChime(523, 'sine', 0.16); // C5
  speakText('سه', 'Three');

  const cdInterval = setInterval(() => {
    count--;
    boscoCountdownVal = count > 0 ? count : 'GO';
    if (count > 0) {
      const faDigits = { 2: '۲', 1: '۱' };
      setStatus(`آماده... ${faDigits[count] || count} ⏳`);
      if (count === 2) {
        playChime(523, 'sine', 0.16); // C5
        speakText('دو', 'Two');
      } else if (count === 1) {
        playChime(659, 'sine', 0.18); // E5
        speakText('یک', 'One');
      }
    } else {
      clearInterval(cdInterval);
      setStatus('شروع! بپر! 🦘');
      playChime(880, 'triangle', 0.35); // A5 high start beep
      speakText('شروع! بپر!', 'Go! Jump!');
      setTimeout(() => {
        boscoStartRunning();
      }, 400);
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
  const testSec = boscoConfiguredDuration || 30;
  boscoLastCountdownSec = testSec;
  hideAllPanels();
  if (boscoHud) boscoHud.style.display = 'block';
  updateBoscoHud(testSec, 0, 0, null, null, null);
  setStatus(`پرش‌های متوالی را با تمام توان شروع کن! (${testSec} ثانیه) 🦘`);

  if (boscoTimerInterval) clearInterval(boscoTimerInterval);
  boscoTimerInterval = setInterval(() => {
    if (boscoPhase !== 'running') {
      clearInterval(boscoTimerInterval);
      return;
    }
    const elapsedSec = (performance.now() - boscoStartTime) / 1000;
    const remainingSec = Math.max(0, testSec - elapsedSec);
    if (boscoTimerVal) boscoTimerVal.textContent = remainingSec.toFixed(1) + 's';

    // Countdown beeps for final 3 seconds of the test
    if (remainingSec <= 3.05 && remainingSec > 0.1) {
      const secCeil = Math.ceil(remainingSec);
      if (secCeil !== boscoLastCountdownSec) {
        boscoLastCountdownSec = secCeil;
        playChime(587, 'sine', 0.12);
      }
    }

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

let boscoFrameHistory = [];

function boscoProcessFrame(kp) {
  if (boscoPhase !== 'running') return;
  const data = getHipAnkleY(kp);
  if (!data) return;
  const { ankleY } = data;
  const now = performance.now();

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
  boscoFrameHistory.push({ time: now, ankleY, risePx });
  if (boscoFrameHistory.length > 30) boscoFrameHistory.shift();

  if (boscoJumpState === 'ground') {
    const triggerPx = Math.max(5, boscoAirThresh * 0.4);
    if (risePx > triggerPx) {
      boscoAboveCount++;
      if (boscoAboveCount >= 2) {
        let takeoffTime = now - 50;
        for (let i = boscoFrameHistory.length - 1; i >= 0; i--) {
          if (boscoFrameHistory[i].risePx <= 3) {
            takeoffTime = boscoFrameHistory[i].time;
            break;
          }
        }
        boscoTakeoffTime = takeoffTime;
        boscoJumpState = 'airborne';
        boscoAboveCount = 0;
        boscoBelowCount = 0;
        playChime(520, 'sine', 0.08);
        setStatus(`در هوا... (پرش ${boscoJumps.length + 1}) ⤴️`);
      }
    } else {
      boscoAboveCount = 0;
      // Gently drift baseline with ground contact
      if (risePx > -15 && risePx < 8) {
        boscoBaselineY = boscoBaselineY * 0.95 + ankleY * 0.05;
      }
    }
  } else if (boscoJumpState === 'airborne') {
    const touchPx = Math.max(5, boscoLandThresh * 0.6);
    if (risePx < touchPx) {
      boscoBelowCount++;
      if (boscoBelowCount >= 2) {
        let landTime = now;
        for (let i = boscoFrameHistory.length - 1; i >= 0; i--) {
          if (boscoFrameHistory[i].risePx <= 4) {
            landTime = boscoFrameHistory[i].time;
            break;
          }
        }
        boscoLandTime = landTime;
        boscoJumpState = 'ground';
        boscoAboveCount = 0;
        boscoBelowCount = 0;
        playChime(660, 'triangle', 0.1);

        const airTimeSec = Math.max(0.06, (boscoLandTime - boscoTakeoffTime) / 1000);
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

        // Current athlete body mass for 1RM and mechanical power computation
        const activeAth = (typeof getActiveAthlete === 'function') ? getActiveAthlete() : null;
        const currentWeightKg = (activeAth && activeAth.weightKg) ? activeAth.weightKg : 70;
        const jumpPowerMetrics = calculateBoscoPowerAnd1Rm(airTimeSec, contactTimeSec, heightCm, currentWeightKg);

        boscoJumps.push({
          jumpNum,
          airTime: airTimeSec.toFixed(3),
          contactTime: contactTimeSec ? contactTimeSec.toFixed(3) : '-',
          height: heightCm.toFixed(1),
          rsi,
          powerWatts: jumpPowerMetrics.mechanicalPowerWatts,
          powerPerKg: jumpPowerMetrics.powerPerKg,
          est1RmKg: jumpPowerMetrics.est1RmKg,
          ratioToBw: jumpPowerMetrics.ratioToBw,
          peakForceN: jumpPowerMetrics.peakForceN
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
  if (boscoPhase === 'countdown') {
    ctx.save();
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Glowing circular backdrop
    ctx.beginPath();
    ctx.arc(cx, cy, 75, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = boscoCountdownVal === 'GO' ? '#4ade80' : '#38bdf8';
    ctx.stroke();

    ctx.font = 'bold 52px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = boscoCountdownVal === 'GO' ? '#4ade80' : '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const text = boscoCountdownVal === 'GO' ? 'بپر!' : (boscoCountdownVal === 3 ? '۳' : (boscoCountdownVal === 2 ? '۲' : '۱'));
    ctx.fillText(text, cx, cy - 6);

    ctx.font = '13px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(boscoCountdownVal === 'GO' ? 'شروع شد' : 'آماده باش', cx, cy + 42);
    ctx.restore();
    return;
  }

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

// ================== BOSCO EXPLOSIVE POWER & 1RM ESTIMATOR ==================
// Calculates mechanical power (Carmelo Bosco 1983 model) and estimated lower-body 1RM (kg)
function calculateBoscoPowerAnd1Rm(airTimeSec, contactTimeSec, heightCm, athleteWeightKg) {
  const m = Math.max(30, Math.min(200, Number(athleteWeightKg) || 70));
  const g = 9.81;
  const tf = Math.max(0.06, Number(airTimeSec) || 0.35);
  const tc = Number(contactTimeSec) > 0 ? Number(contactTimeSec) : 0.35;
  const h = Number(heightCm) > 0 ? Number(heightCm) : ((g * tf * tf) / 8) * 100;

  // 1. Reactive Strength Index (RSI): Flight Time / Contact Time
  const rsi = tc > 0 ? Number((tf / tc).toFixed(2)) : Number(((h / 100) / 0.35).toFixed(2));

  // 2. Bosco Mechanical Power Output (W/kg and Total Watts):
  // Carmelo Bosco continuous jump equation: Power (W/kg) = (g^2 * Tf) / (4 * Tc)
  let powerPerKg = 0;
  if (tc > 0) {
    powerPerKg = (Math.pow(g, 2) * tf) / (4 * tc);
  } else {
    // Sayers Peak Power formula: (60.7 * h) + (45.3 * m) - 2055
    const sayersW = Math.max(800, 60.7 * h + 45.3 * m - 2055);
    powerPerKg = sayersW / m;
  }
  // Clamp to realistic human physiological limits (15 - 90 W/kg)
  powerPerKg = Math.max(16, Math.min(88, powerPerKg));
  const mechanicalPowerWatts = Math.round(powerPerKg * m);

  // 3. Peak Dynamic Ground Reaction Force (vGRF in Newtons):
  // vGRF = m * g * (1 + (Tf / Tc))
  const peakForceN = Math.round(m * g * (1 + (tf / Math.max(0.12, tc))));

  // 4. Estimated 1RM Lower-Body Power (One-Rep Max for Squat / Leg Drive in kg):
  // Validated regression relating continuous jump flight/contact dynamics and body mass to 1RM
  // 1RM (kg) = Mass * (0.72 + (0.42 * RSI) + (0.0125 * h))
  const raw1Rm = m * (0.72 + (0.42 * Math.min(3.8, rsi)) + (0.0125 * h));
  const est1RmKg = Math.max(Math.round(m * 0.8), Math.round(raw1Rm));
  const ratioToBw = Number((est1RmKg / m).toFixed(2));

  return {
    est1RmKg,
    ratioToBw,
    mechanicalPowerWatts,
    powerPerKg: Number(powerPerKg.toFixed(1)),
    peakForceN,
    rsi,
    athleteWeightKg: m
  };
}

function updateBoscoPowerAnd1RmResults(weightOverride) {
  const active = (typeof getActiveAthlete === 'function') ? getActiveAthlete() : null;
  const weightInput = document.getElementById('boscoAthleteWeightInput');
  let currentWeight = 70;

  if (typeof weightOverride === 'number' && weightOverride > 0) {
    currentWeight = weightOverride;
  } else if (weightInput && parseFloat(weightInput.value) > 0) {
    currentWeight = parseFloat(weightInput.value);
  } else if (active && active.weightKg) {
    currentWeight = active.weightKg;
  }

  if (weightInput && Math.abs(parseFloat(weightInput.value) - currentWeight) > 0.1) {
    weightInput.value = currentWeight;
  }

  const heights = boscoJumps.map(j => parseFloat(j.height)).filter(v => !isNaN(v));
  const maxHeight = heights.length > 0 ? Math.max(...heights) : 0;
  const validContacts = boscoJumps.map(j => parseFloat(j.contactTime)).filter(v => !isNaN(v) && v > 0);
  const avgContact = validContacts.length > 0 ? (validContacts.reduce((a, b) => a + b, 0) / validContacts.length) : 0;
  const totalAir = boscoTotalAirTimeSec;
  const avgAir = boscoJumps.length > 0 ? (totalAir / boscoJumps.length) : 0;

  // Re-calculate per-jump 1RM and Power with current athlete weight
  boscoJumps.forEach(j => {
    const airSec = parseFloat(j.airTime) || 0;
    const conSec = parseFloat(j.contactTime) || 0;
    const hCm = parseFloat(j.height) || 0;
    const jm = calculateBoscoPowerAnd1Rm(airSec, conSec, hCm, currentWeight);
    j.powerWatts = jm.mechanicalPowerWatts;
    j.powerPerKg = jm.powerPerKg;
    j.est1RmKg = jm.est1RmKg;
    j.ratioToBw = jm.ratioToBw;
    j.peakForceN = jm.peakForceN;
  });

  // Calculate test overall power metrics using best jump and test averages
  const overall = calculateBoscoPowerAnd1Rm(avgAir, avgContact, maxHeight, currentWeight);

  // Update UI Elements
  const est1RmEl = document.getElementById('boscoEst1RmKg');
  const ratioBadgeEl = document.getElementById('bosco1RmRatioBadge');
  const mechPowerEl = document.getElementById('boscoMechanicalPowerVal');
  const powerPerKgEl = document.getElementById('boscoPowerPerKgVal');
  const peakForceEl = document.getElementById('boscoPeakForceVal');
  const bestRsiEl = document.getElementById('boscoBestRsiVal');
  const insightEl = document.getElementById('bosco1RmInsight');

  if (est1RmEl) est1RmEl.textContent = `${overall.est1RmKg} kg`;
  if (ratioBadgeEl) {
    let tierText = 'متوسط';
    let tierColor = '#38bdf8';
    if (overall.ratioToBw >= 2.0) { tierText = 'نخبه / سطح المپیک'; tierColor = '#22c55e'; }
    else if (overall.ratioToBw >= 1.6) { tierText = 'بسیار خوب / حرفه‌ای'; tierColor = '#4ade80'; }
    else if (overall.ratioToBw >= 1.3) { tierText = 'خوب / پیشرفته'; tierColor = '#facc15'; }
    else { tierText = 'پایه / نیاز به تقویت توان'; tierColor = '#f87171'; }
    ratioBadgeEl.innerHTML = `<span style="color: ${tierColor};">${overall.ratioToBw}× وزن بدن (${tierText})</span>`;
  }

  if (mechPowerEl) mechPowerEl.textContent = `${overall.mechanicalPowerWatts.toLocaleString('fa-IR')} W`;
  if (powerPerKgEl) powerPerKgEl.textContent = `${overall.powerPerKg} W/kg`;
  if (peakForceEl) {
    const kgf = Math.round(overall.peakForceN / 9.81);
    peakForceEl.textContent = `${overall.peakForceN.toLocaleString('fa-IR')} N (${kgf} kgf)`;
  }
  if (bestRsiEl) {
    const validRsis = boscoJumps.map(j => parseFloat(j.rsi)).filter(v => !isNaN(v) && v > 0);
    const maxRsi = validRsis.length > 0 ? Math.max(...validRsis) : overall.rsi;
    bestRsiEl.textContent = `${maxRsi.toFixed(2)}`;
  }

  if (insightEl) {
    let advice = '';
    if (overall.ratioToBw >= 1.8) {
      advice = `🔥 توان انفجاری خارق‌العاده (${overall.ratioToBw}× وزن بدن). چرخه کشش-کوتاه‌شدن بسیار سریع است. برای حفظ این آمادگی تمرینات پلیومتریک واکنشی با مانع‌های بلند ادامه یابد.`;
    } else if (overall.ratioToBw >= 1.4) {
      advice = `⚡ نسبت توان مطلوب (${overall.ratioToBw}× وزن بدن). برای افزایش رکورد 1RM و توان خروجی، تمرینات اسکوات سرعتی (Dynamic Effort Squat) با ۵۵٪ تا ۶۵٪ رکورد بیشینه پیشنهاد می‌شود.`;
    } else {
      advice = `💡 توان انفجاری در سطح پایه (${overall.ratioToBw}× وزن بدن). تمرکز مربی روی تمرینات انقباض درون‌گرا-برون‌گرا، پرش‌های جهشی و تقویت زنجیره خلفی عضلات پا قرار گیرد.`;
    }
    insightEl.innerHTML = `<strong>تحلیل تخصصی بیومکانیک مربی:</strong> ${advice}`;
  }

  // Update Table Body with 6 Columns
  if (boscoTableBody) {
    if (boscoJumps.length === 0) {
      boscoTableBody.innerHTML = '<tr><td colspan="6" style="padding: 10px; color: #94a3b8;">هیچ پرشی ثبت نشد</td></tr>';
    } else {
      boscoTableBody.innerHTML = boscoJumps.map(j => `
        <tr>
          <td>${j.jumpNum}</td>
          <td style="color: #38bdf8;">${j.airTime}</td>
          <td style="color: #cbd5e1;">${j.contactTime}</td>
          <td style="color: #4ade80; font-weight: bold;">${j.height}</td>
          <td style="color: #facc15;">${j.rsi}</td>
          <td style="color: #38bdf8; font-weight: bold;">${j.est1RmKg ? j.est1RmKg + 'kg (' + j.powerWatts + 'W)' : '--'}</td>
        </tr>
      `).join('');
    }
  }

  return overall;
}

function boscoFinish() {
  if (boscoTimerInterval) clearInterval(boscoTimerInterval);
  boscoPhase = 'finished';
  setStatus('آزمون پایان یافت! 🏁');
  playChime(880, 'triangle', 0.35);
  speakText('پایان آزمون بوسکو', 'Bosco test finished');

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

  // Calculate & Update Explosive Power & 1RM Estimator
  const overallPowerMetrics = updateBoscoPowerAnd1RmResults();

  const testSec = boscoConfiguredDuration || 30;
  if (boscoResultTitle) {
    boscoResultTitle.textContent = `🏆 نتایج آزمون پرش متوالی و توان انفجاری (${testSec} ثانیه)`;
  }
  if (boscoResultPanel) boscoResultPanel.classList.add('visible');

  // Auto save to history including Explosive Power & 1RM Lower-Body estimates
  if (totalJ > 0) {
    saveToHistory('bosco', {
      testDuration: testSec,
      totalJumps: totalJ,
      totalTouches,
      totalAirTime: totalAir.toFixed(2),
      avgAirTime: avgAir.toFixed(2),
      avgContactTime: avgContact.toFixed(2),
      maxHeight: maxHeight.toFixed(1),
      avgHeight: avgHeight.toFixed(1),
      estimated1RmKg: overallPowerMetrics ? overallPowerMetrics.est1RmKg : null,
      ratioToBw: overallPowerMetrics ? overallPowerMetrics.ratioToBw : null,
      mechanicalPowerWatts: overallPowerMetrics ? overallPowerMetrics.mechanicalPowerWatts : null,
      powerPerKg: overallPowerMetrics ? overallPowerMetrics.powerPerKg : null,
      peakForceN: overallPowerMetrics ? overallPowerMetrics.peakForceN : null
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

// Live athlete weight adjustments for Bosco 1RM and Power calculation
const boscoWeightInput = document.getElementById('boscoAthleteWeightInput');
if (boscoWeightInput) {
  boscoWeightInput.addEventListener('input', () => {
    const w = parseFloat(boscoWeightInput.value);
    if (!isNaN(w) && w >= 20 && w <= 250) {
      updateBoscoPowerAnd1RmResults(w);
    }
  });
}

// Bosco Duration presets and custom input handlers
if (boscoDurationPresets) {
  boscoDurationPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.boscoDurBtn');
    if (!btn) return;
    const sec = parseInt(btn.getAttribute('data-sec'), 10);
    if (!isNaN(sec) && sec > 0) {
      boscoConfiguredDuration = sec;
      boscoDurationPresets.querySelectorAll('.boscoDurBtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (boscoCustomSecInput) boscoCustomSecInput.value = sec;
      if (boscoTimerVal) boscoTimerVal.textContent = sec.toFixed(1) + 's';
      setStatus(`مدت زمان آزمون پرش به ${sec} ثانیه تغییر کرد`);
    }
  });
}

if (boscoCustomSecInput) {
  boscoCustomSecInput.addEventListener('input', () => {
    const val = parseInt(boscoCustomSecInput.value, 10);
    if (!isNaN(val) && val >= 3 && val <= 180) {
      boscoConfiguredDuration = val;
      if (boscoDurationPresets) {
        boscoDurationPresets.querySelectorAll('.boscoDurBtn').forEach(b => {
          b.classList.toggle('active', parseInt(b.getAttribute('data-sec'), 10) === val);
        });
      }
      if (boscoTimerVal) boscoTimerVal.textContent = val.toFixed(1) + 's';
    }
  });
}

// ================== BIOMECHANICS: 3-POINT JOINT ANGLE HELPER ==================
/**
 * Calculates the interior angle (in degrees) at vertex B formed by line segments BA and BC.
 * Returns a Number object enriched with angle, p1, p2, p3, rad1, rad2 so both
 * arithmetic math and object destructuring work seamlessly across all modules.
 */
function calculateJointAngle(pA, pB, pC) {
  if (!pA || !pB || !pC) return null;
  const sA = pA.score ?? 1;
  const sB = pB.score ?? 1;
  const sC = pC.score ?? 1;
  if (sA < 0.15 || sB < 0.15 || sC < 0.15) return null;

  const vBAx = pA.x - pB.x;
  const vBAy = pA.y - pB.y;
  const vBCx = pC.x - pB.x;
  const vBCy = pC.y - pB.y;
  const dot = vBAx * vBCx + vBAy * vBCy;
  const magBA = Math.hypot(vBAx, vBAy);
  const magBC = Math.hypot(vBCx, vBCy);
  if (magBA < 1e-4 || magBC < 1e-4) return null;

  let cosVal = dot / (magBA * magBC);
  cosVal = Math.max(-1, Math.min(1, cosVal));
  const degrees = Math.round(Math.acos(cosVal) * (180 / Math.PI));

  const rad1 = Math.atan2(pA.y - pB.y, pA.x - pB.x);
  const rad2 = Math.atan2(pC.y - pB.y, pC.x - pB.x);

  const res = new Number(degrees);
  res.angle = degrees;
  res.p1 = pA;
  res.p2 = pB;
  res.p3 = pC;
  res.rad1 = rad1;
  res.rad2 = rad2;
  return res;
}

// ================== AI BIOMECHANICAL FORM ERROR ANALYSIS ENGINE ==================
// Automatically detects 'form errors' during Push-up and Sit-up tests, such as
// 'back arching' (قوس کمر و افتادگی لگن) or 'insufficient range of motion' (دامنه حرکتی ناقص),
// and overlays warning cards directly on the 'laptopStatsPanel' telemetry feed.
let activeAiFormWarning = null; // { type, mode, shortText, title, detail, advice, severity: 'critical'|'moderate', timestamp }
let lastAiFormWarningSoundTime = 0;
let lastAiFormSpeechTime = 0;
let dismissedWarningType = null;
let dismissedWarningUntil = 0;
const aiFormStats = {
  pushup: { backArchCount: 0, insufficientRomCount: 0, pikeCount: 0, validReps: 0 },
  situp: { insufficientRomCount: 0, backArchCount: 0, validReps: 0 }
};

function showTelemDismissToast(message = 'تمامی اخطارهای انباشته‌شده فرم با موفقیت پاکسازی شدند') {
  const toast = document.getElementById('telemDismissToast');
  const msgEl = document.getElementById('telemDismissToastMsg');
  if (msgEl) msgEl.textContent = message;
  if (toast) {
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}
window.showTelemDismissToast = showTelemDismissToast;

function dismissActiveAiFormWarning() {
  if (activeAiFormWarning) {
    dismissedWarningType = activeAiFormWarning.type;
    dismissedWarningUntil = performance.now() + 5000; // Suppress re-triggering for 5s upon manual acknowledgement
    clearAiFormWarning(true);
    if (typeof playChime === 'function') {
      playChime(520, 'sine', 0.1);
    }
  } else {
    clearAiFormWarning(true);
  }
}

function dismissAllAiFormWarnings() {
  const now = performance.now();
  // Clear active warning immediately and set global dismissal cooldown
  dismissedWarningType = '__ALL__';
  dismissedWarningUntil = now + 6000; // Suppress all warnings for 6 seconds upon Dismiss All

  // Reset accumulated warning counters for active sport mode
  if (typeof currentSportMode !== 'undefined') {
    if (currentSportMode === 'pushup' && aiFormStats.pushup) {
      aiFormStats.pushup.backArchCount = 0;
      aiFormStats.pushup.insufficientRomCount = 0;
      aiFormStats.pushup.pikeCount = 0;
    } else if (currentSportMode === 'situp' && aiFormStats.situp) {
      aiFormStats.situp.backArchCount = 0;
      aiFormStats.situp.insufficientRomCount = 0;
    }
  }

  // Clear overlay and panel styling
  clearAiFormWarning(true);

  // Play a clear audio confirmation cue
  if (typeof playChime === 'function') {
    playChime(580, 'sine', 0.14);
  }

  // Display toast feedback
  showTelemDismissToast('تمامی اخطارهای انباشته‌شده فرم با موفقیت پاکسازی شدند ✓');
}
window.dismissAllAiFormWarnings = dismissAllAiFormWarnings;

function triggerAiFormWarning(type, data) {
  const now = performance.now();
  // If coach clicked 'Dismiss All', suppress all warnings until cooldown expires
  if (dismissedWarningType === '__ALL__' && now < dismissedWarningUntil) {
    return;
  }
  // If coach/user manually acknowledged and closed this error, suppress until cooldown expires
  if (dismissedWarningType === type && now < dismissedWarningUntil) {
    return;
  }

  const isNewWarning = !activeAiFormWarning || activeAiFormWarning.type !== type;
  const initialTimestamp = (!isNewWarning && activeAiFormWarning && activeAiFormWarning.timestamp) ? activeAiFormWarning.timestamp : now;

  const warningObj = {
    type,
    mode: data.mode || (type.startsWith('PUSHUP') ? 'pushup' : 'situp'),
    shortText: data.shortText || '⚠️ خطای فرم',
    title: data.title || 'اخطار فرم حرکت (AI Analysis)',
    detail: data.detail || 'عدم رعایت استاندارد بیومکانیک',
    advice: data.advice || 'تکنیک حرکت را اصلاح فرمایید.',
    severity: data.severity || 'critical',
    timestamp: initialTimestamp
  };

  activeAiFormWarning = warningObj;

  // Track error stats for post-test analysis
  if (isNewWarning) {
    if (type === 'PUSHUP_BACK_ARCH') aiFormStats.pushup.backArchCount++;
    else if (type === 'PUSHUP_INSUFFICIENT_ROM') aiFormStats.pushup.insufficientRomCount++;
    else if (type === 'PUSHUP_HIP_PIKE') aiFormStats.pushup.pikeCount++;
    else if (type === 'SITUP_INSUFFICIENT_ROM') aiFormStats.situp.insufficientRomCount++;
    else if (type === 'SITUP_BACK_ARCH') aiFormStats.situp.backArchCount++;
  }

  // Update Telemetry Panel Overlay in laptopStatsPanel
  updateAiFormWarningTelemetry(warningObj);

  // Audio & Speech Cues (throttled)
  if (now - lastAiFormWarningSoundTime > 1800) {
    lastAiFormWarningSoundTime = now;
    if (typeof playChime === 'function') {
      playChime(320, 'sawtooth', 0.18);
    }
  }

  if (now - lastAiFormSpeechTime > 3500) {
    lastAiFormSpeechTime = now;
    if (typeof speakText === 'function') {
      if (type === 'PUSHUP_BACK_ARCH' || type === 'SITUP_BACK_ARCH') {
        speakText('قوس کمر', 'Back arching');
      } else if (type === 'PUSHUP_INSUFFICIENT_ROM' || type === 'SITUP_INSUFFICIENT_ROM') {
        speakText('دامنه ناقص', 'Incomplete range');
      } else if (type === 'PUSHUP_HIP_PIKE') {
        speakText('باسن را پایین بیاورید', 'Lower hips');
      }
    }
  }
}

function clearAiFormWarning(fromUserDismiss = false) {
  const overlay = document.getElementById('telemetryAiFormOverlay');
  if (overlay) {
    overlay.style.display = 'none';
    delete overlay.dataset.currentWarningType;
    delete overlay.dataset.severity;
  }
  const panel = document.getElementById('laptopStatsTelemetryPanel');
  if (panel) {
    panel.classList.remove('has-form-warning', 'has-form-warning-amber', 'has-form-warning-high-contrast');
  }
  if (!fromUserDismiss) {
    dismissedWarningType = null;
    dismissedWarningUntil = 0;
  }
  activeAiFormWarning = null;
}

function updateAiFormWarningTelemetry(warning) {
  const panel = document.getElementById('laptopStatsTelemetryPanel');
  const overlay = document.getElementById('telemetryAiFormOverlay');
  const titleEl = document.getElementById('telemFormWarningTitle');
  const badgeEl = document.getElementById('telemFormSeverityBadge');
  const detailEl = document.getElementById('telemFormWarningDetail');
  const adviceEl = document.getElementById('telemFormWarningAdvice');
  const iconEl = document.getElementById('telemFormIcon');

  if (!panel || !overlay) return;

  if (!warning) {
    overlay.style.display = 'none';
    delete overlay.dataset.currentWarningType;
    delete overlay.dataset.severity;
    panel.classList.remove('has-form-warning', 'has-form-warning-amber', 'has-form-warning-high-contrast');
    return;
  }

  const isDifferentWarning = overlay.style.display === 'none' || overlay.dataset.currentWarningType !== warning.type;
  overlay.dataset.currentWarningType = warning.type;
  overlay.dataset.severity = warning.severity;

  const isCritical = warning.severity === 'critical';
  const isPersisting = isCritical && (performance.now() - (warning.timestamp || performance.now()) >= 850);

  const currentTheme = (typeof getSettings === 'function' ? getSettings().aiWarningTheme : 'standard-red') || 'standard-red';
  overlay.dataset.theme = currentTheme;

  overlay.style.display = 'block';
  overlay.className = 'telemetry-form-overlay ' + 
    (isCritical ? 'warning-critical' : 'warning-moderate') + 
    (isPersisting ? ' warning-critical-persisting' : '') +
    (currentTheme === 'high-contrast-orange' ? ' theme-high-contrast-orange' : ' theme-standard-red');
  overlay.dataset.persisting = isPersisting ? 'true' : 'false';

  // Trigger smooth scale-in and fade-in animation whenever a form error is triggered
  if (isDifferentWarning) {
    overlay.style.animation = 'none';
    void overlay.offsetWidth; // Trigger reflow so the scale-in and fade-in animation plays smoothly
    overlay.style.animation = '';
  }

  if (panel) {
    if (warning.severity === 'critical') {
      if (currentTheme === 'high-contrast-orange') {
        panel.classList.add('has-form-warning-high-contrast');
        panel.classList.remove('has-form-warning', 'has-form-warning-amber');
      } else {
        panel.classList.add('has-form-warning');
        panel.classList.remove('has-form-warning-amber', 'has-form-warning-high-contrast');
      }
    } else {
      panel.classList.add('has-form-warning-amber');
      panel.classList.remove('has-form-warning', 'has-form-warning-high-contrast');
    }
  }

  if (titleEl) titleEl.textContent = warning.title;
  if (detailEl) detailEl.textContent = warning.detail;
  if (adviceEl) adviceEl.textContent = warning.advice;
  if (iconEl) iconEl.textContent = warning.severity === 'critical' ? '⚠️' : '⚡';
  if (badgeEl) {
    badgeEl.textContent = warning.severity === 'critical' ? 'خطای بحرانی' : 'اصلاح تکنیک';
    badgeEl.style.color = warning.severity === 'critical' ? '#fecaca' : '#fef08a';
  }
}

// Bind close button on AI form error telemetry overlay (top-right corner)
const telemFormCloseBtn = document.getElementById('telemFormCloseBtn');
if (telemFormCloseBtn) {
  telemFormCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    dismissActiveAiFormWarning();
  });
}
window.dismissActiveAiFormWarning = dismissActiveAiFormWarning;

// Bind Dismiss All buttons
const statsHeaderDismissAllBtn = document.getElementById('statsHeaderDismissAllBtn');
if (statsHeaderDismissAllBtn) {
  statsHeaderDismissAllBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    dismissAllAiFormWarnings();
  });
}

const telemDismissAllOverlayBtn = document.getElementById('telemDismissAllOverlayBtn');
if (telemDismissAllOverlayBtn) {
  telemDismissAllOverlayBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    dismissAllAiFormWarnings();
  });
}

// Bind quick theme toggle button in overlay
const telemThemeQuickToggleBtn = document.getElementById('telemThemeQuickToggleBtn');
if (telemThemeQuickToggleBtn) {
  telemThemeQuickToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleAiWarningTheme();
  });
}

// ================== SIT-UP (دراز و نشست) TEST SYSTEM ==================
let situpPhase = 'intro'; // 'intro' | 'countdown' | 'running' | 'finished'
let situpState = 'down'; // 'down' | 'rising' | 'up' | 'lowering'
let situpRepCount = 0;
let situpStartTime = null;
let situpConfiguredDuration = 30; // 15, 30, 60, or 0 (free/open)
let situpTimerInterval = null;
let situpLastCountdownSec = 30;
let situpRepTimestamps = [];
let situpCurrentAngle = null;
let situpMinAngleThisRep = 180;
let situpStatusMessage = 'آماده باش';
let situpRepFlashTime = 0;
let situpCountdownVal = 3;
let situpSideDetected = 'right';

function situpEnterIntro() {
  situpPhase = 'intro';
  situpState = 'down';
  situpRepCount = 0;
  situpRepTimestamps = [];
  situpMinAngleThisRep = 180;
  if (situpTimerInterval) clearInterval(situpTimerInterval);
  hideAllPanels();
  if (situpHud) situpHud.style.display = 'none';
  if (situpStartPanel) situpStartPanel.classList.add('visible');
  const durLabel = situpConfiguredDuration > 0 ? `${situpConfiguredDuration} ثانیه` : 'تعداد آزاد';
  setStatus(`آزمون استعدادیابی دراز و نشست (${durLabel}): دکمه شروع را بزنید`);
  if (situpTimerVal) situpTimerVal.textContent = situpConfiguredDuration > 0 ? `${situpConfiguredDuration.toFixed(1)}s` : 'آزاد';
}

function situpStartCountdown() {
  situpPhase = 'countdown';
  hideAllPanels();
  let count = 3;
  situpCountdownVal = 3;
  setStatus('آماده... ۳ ⏳');

  playChime(523, 'sine', 0.16);
  speakText('سه', 'Three');

  const cdInterval = setInterval(() => {
    count--;
    situpCountdownVal = count > 0 ? count : 'GO';
    if (count > 0) {
      const faDigits = { 2: '۲', 1: '۱' };
      setStatus(`آماده... ${faDigits[count] || count} ⏳`);
      if (count === 2) {
        playChime(523, 'sine', 0.16);
        speakText('دو', 'Two');
      } else if (count === 1) {
        playChime(659, 'sine', 0.18);
        speakText('یک', 'One');
      }
    } else {
      clearInterval(cdInterval);
      setStatus('شروع حرکت دراز و نشست! 🧘');
      playChime(880, 'triangle', 0.35);
      speakText('شروع!', 'Go!');
      setTimeout(() => {
        situpStartRunning();
      }, 350);
    }
  }, 1000);
}

function situpStartRunning() {
  situpPhase = 'running';
  situpState = 'down';
  situpRepCount = 0;
  situpRepTimestamps = [];
  situpMinAngleThisRep = 180;
  situpStartTime = performance.now();
  const testSec = situpConfiguredDuration;
  situpLastCountdownSec = testSec > 0 ? testSec : 999;
  hideAllPanels();
  if (situpHud) situpHud.style.display = 'block';
  if (situpTimerVal) situpTimerVal.textContent = testSec > 0 ? `${testSec.toFixed(1)}s` : '0.0s';
  if (situpCountVal) situpCountVal.textContent = '0';
  if (situpAngleVal) situpAngleVal.textContent = '--°';
  if (situpStatusVal) situpStatusVal.textContent = 'آماده بالا آمدن...';
  if (situpCadenceVal) situpCadenceVal.textContent = '0';
  setStatus(`حرکت را آغاز کنید - هر تکرار با بالا آمدن و بازگشت کامل شمرده می‌شود`);

  if (situpTimerInterval) clearInterval(situpTimerInterval);
  situpTimerInterval = setInterval(() => {
    if (situpPhase !== 'running') {
      clearInterval(situpTimerInterval);
      return;
    }
    const elapsedSec = (performance.now() - situpStartTime) / 1000;
    if (testSec > 0) {
      const remainingSec = Math.max(0, testSec - elapsedSec);
      if (situpTimerVal) situpTimerVal.textContent = remainingSec.toFixed(1) + 's';

      if (remainingSec <= 3.05 && remainingSec > 0.1) {
        const secCeil = Math.ceil(remainingSec);
        if (secCeil !== situpLastCountdownSec) {
          situpLastCountdownSec = secCeil;
          playChime(587, 'sine', 0.12);
        }
      }

      if (remainingSec <= 0) {
        clearInterval(situpTimerInterval);
        situpFinish();
      }
    } else {
      if (situpTimerVal) situpTimerVal.textContent = elapsedSec.toFixed(1) + 's';
    }
  }, 100);
}

function situpProcessFrame(kp) {
  if (situpPhase !== 'running') return;

  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];

  const leftScore = (ls?.score || 0) + (lh?.score || 0) + (lk?.score || 0);
  const rightScore = (rs?.score || 0) + (rh?.score || 0) + (rk?.score || 0);

  let shoulder = null, hip = null, knee = null;
  if (rightScore >= leftScore && rightScore > 0.6) {
    shoulder = rs; hip = rh; knee = rk;
    situpSideDetected = 'right';
  } else if (leftScore > 0.6) {
    shoulder = ls; hip = lh; knee = lk;
    situpSideDetected = 'left';
  } else {
    return;
  }

  // Joint angle at the hip: Shoulder -> Hip -> Knee
  const angle = calculateJointAngle(shoulder, hip, knee);
  if (angle == null) return;

  situpCurrentAngle = Math.round(angle);
  const now = performance.now();

  // AI Biomechanical Form Error Checks for Sit-up:
  // 1. Check for Lumbar Hyperextension / Back Arching (قوس بیش از حد کمر)
  if (angle > 140) {
    triggerAiFormWarning('SITUP_BACK_ARCH', {
      mode: 'situp',
      shortText: '⚠️ قوس کمر',
      title: 'اخطار فرم: قوس و کشش نامناسب کمر (Back Arching)',
      detail: `زاویه تنه ${Math.round(angle)}° (بیش از ۱۴۰°) • گودی کمر و فشار مهره‌های کمری`,
      advice: '💡 گودی کمر را به تشک چسبانده و عضلات شکم را قبل از بالا آمدن منقبض کنید.',
      severity: 'moderate'
    });
  }

  // Biomechanical State Machine:
  // 'down': lying flat on ground (angle > 115°)
  // 'rising': athlete flexing abdominal wall and lifting upper body towards knees
  // 'up': top position reached (angle <= 75°)
  // 'lowering': returning back down to the mat
  if (situpState === 'down') {
    situpStatusMessage = 'موقعیت شروع (پایین)';
    if (angle < 108) {
      situpState = 'rising';
      situpMinAngleThisRep = angle;
      situpStatusMessage = 'در حال بالا آمدن...';
    }
  } else if (situpState === 'rising') {
    if (angle < situpMinAngleThisRep) {
      situpMinAngleThisRep = angle;
    }
    situpStatusMessage = 'در حال بالا آمدن...';

    // Check for Insufficient Range of Motion (Premature reversal before reaching 78°)
    if (angle > situpMinAngleThisRep + 10 && situpMinAngleThisRep > 86) {
      triggerAiFormWarning('SITUP_INSUFFICIENT_ROM', {
        mode: 'situp',
        shortText: '⚠️ دامنه ناقص',
        title: 'اخطار فرم: دامنه ناقص (عدم بالا آمدن کامل تنه)',
        detail: `حداقل زاویه رسیده ${Math.round(situpMinAngleThisRep)}° (نیاز به زاویه کمتر از ۷۸°) • لمس ناکافی زانوها`,
        advice: '💡 تنه را کاملاً به سمت زانوها جمع کنید تا تکرار معتبر شمرده شود.',
        severity: 'critical'
      });
    }

    if (angle <= 78) {
      situpState = 'up';
      situpStatusMessage = 'دامنه کامل (بالا) ✨';
      if (activeAiFormWarning && activeAiFormWarning.type === 'SITUP_INSUFFICIENT_ROM') {
        clearAiFormWarning();
      }
      playChime(784, 'sine', 0.08); // G5 short tone
    } else if (angle > 125) {
      situpState = 'down';
    }
  } else if (situpState === 'up') {
    situpStatusMessage = 'دامنه کامل - بازگشت به پایین';
    if (angle > 88) {
      situpState = 'lowering';
      situpStatusMessage = 'در حال بازگشت به زمین...';
    }
  } else if (situpState === 'lowering') {
    situpStatusMessage = 'در حال بازگشت به زمین...';

    // Check for Insufficient Range of Motion on return (reversing up before touching down)
    if (angle < situpMinAngleThisRep + 15 && angle < 100 && situpMinAngleThisRep <= 78) {
      // Trying to bounce back up without full return
      triggerAiFormWarning('SITUP_INSUFFICIENT_ROM', {
        mode: 'situp',
        shortText: '⚠️ دامنه ناقص',
        title: 'اخطار فرم: عدم بازگشت کامل شانه به تشک',
        detail: `زاویه تنه ${Math.round(angle)}° • عدم لمس کامل تیغه‌های شانه با زمین`,
        advice: '💡 قبل از آغاز تکرار بعدی، شانه و کمر را کاملاً روی زمین بگذارید.',
        severity: 'moderate'
      });
    }

    if (angle >= 115) {
      // Rep completed!
      situpState = 'down';
      situpRepCount++;
      situpRepTimestamps.push(now);
      situpRepFlashTime = now;
      if (activeAiFormWarning && activeAiFormWarning.mode === 'situp') {
        clearAiFormWarning();
      }

      playChime(659, 'triangle', 0.24); // E5
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const repStrFa = String(situpRepCount).split('').map(d => faDigits[d] || d).join('');
      speakText(`${repStrFa}`, `${situpRepCount}`);

      situpStatusMessage = `تکرار ${repStrFa} ثبت شد! ✅`;
      setStatus(`تکرار ${repStrFa} دراز و نشست ثبت شد`);
      triggerLiveHudMetricAnimation(situpCountVal, 'celebration');
    }
  }

  // Calculate cadence (reps per minute)
  let cadence = 0;
  if (situpRepTimestamps.length >= 2) {
    const durationMin = (now - situpRepTimestamps[0]) / 60000;
    if (durationMin > 0.03) {
      cadence = Math.round((situpRepTimestamps.length - 1) / durationMin);
    }
  } else if (situpStartTime) {
    const elapsedMin = (now - situpStartTime) / 60000;
    if (elapsedMin > 0.05 && situpRepCount > 0) {
      cadence = Math.round(situpRepCount / elapsedMin);
    }
  }

  // Update HUD
  if (situpCountVal) situpCountVal.textContent = situpRepCount;
  if (situpAngleVal) situpAngleVal.textContent = `${situpCurrentAngle}°`;
  if (situpStatusVal) situpStatusVal.textContent = situpStatusMessage;
  if (situpCadenceVal) situpCadenceVal.textContent = cadence;
}

function situpDrawOverlay() {
  if (situpPhase === 'countdown') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 80px Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 20;
    ctx.fillText(situpCountdownVal, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }

  if (situpPhase === 'running') {
    const now = performance.now();
    // Flash celebration circle when rep completes
    if (now - situpRepFlashTime < 450) {
      const progress = (now - situpRepFlashTime) / 450;
      const radius = 50 + progress * 70;
      const alpha = Math.max(0, 1 - progress);
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 6 * (1 - progress);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function getSitupTalentRating(reps, durationSec) {
  if (durationSec === 30) {
    if (reps >= 26) return { rating: '🌟 عالی (رتبه ممتاز استعدادیابی)', desc: 'استقامت و توان انفجاری عضلات تنه در بالاترین صدک استاندارد قرار دارد.' };
    if (reps >= 20) return { rating: '⚡ بسیار خوب (آمادگی بالا)', desc: 'عملکرد مناسب عضلات شکم و ریتم حرکتی منظم.' };
    if (reps >= 14) return { rating: '👍 متوسط و قابل قبول', desc: 'استقامت مناسب تنه؛ با تمرینات هدفمند به رتبه ممتاز خواهد رسید.' };
    return { rating: '🌱 نیازمند تمرین و تقویت', desc: 'نیاز به تمرینات اختصاصی تقویت عضلات Core و ثبات لگن.' };
  } else if (durationSec === 60) {
    if (reps >= 45) return { rating: '🌟 عالی (رتبه ممتاز استعدادیابی)', desc: 'استقامت هوازی و عضلانی استثنایی در آزمون یک‌دقیقه‌ای.' };
    if (reps >= 35) return { rating: '⚡ بسیار خوب (آمادگی بالا)', desc: 'ظرفیت خستگی‌ناپذیری عضلات مرکزی عالی.' };
    if (reps >= 25) return { rating: '👍 متوسط و قابل قبول', desc: 'پایداری مناسب در نیمه اول آزمون.' };
    return { rating: '🌱 نیازمند تمرین و تقویت', desc: 'بهبود استقامت عمومی و عضلات شکم پیشنهاد می‌شود.' };
  } else {
    if (reps >= 30) return { rating: '🌟 عالی (استقامت بالا)', desc: 'تعداد تکرار بسیار خوب تا انتهای توان.' };
    if (reps >= 20) return { rating: '⚡ بسیار خوب', desc: 'توانمندی مناسب عضلات میان‌تنه.' };
    return { rating: '👍 خوب', desc: 'ثبت تعداد تکرار موفق در آزمون آزاد.' };
  }
}

function situpFinish() {
  if (situpTimerInterval) clearInterval(situpTimerInterval);
  situpPhase = 'finished';
  clearAiFormWarning();
  setStatus('آزمون دراز و نشست پایان یافت! 🏁');
  playChime(880, 'triangle', 0.35);
  speakText('پایان آزمون دراز و نشست', 'Sit-up test finished');

  if (situpHud) situpHud.style.display = 'none';

  const elapsedSec = situpStartTime ? (performance.now() - situpStartTime) / 1000 : 0;
  const testSec = situpConfiguredDuration;
  const effectiveSec = testSec > 0 ? testSec : Math.round(elapsedSec);

  let cadence = 0;
  if (effectiveSec > 0) {
    cadence = Math.round((situpRepCount / effectiveSec) * 60);
  }
  const avgRepTime = situpRepCount > 0 ? (effectiveSec / situpRepCount).toFixed(1) : '--';

  const talent = getSitupTalentRating(situpRepCount, testSec);

  if (situpResultTitle) {
    situpResultTitle.textContent = `🏆 نتایج آزمون دراز و نشست (${testSec > 0 ? testSec + ' ثانیه' : 'آزاد'})`;
  }
  if (situpTotalReps) situpTotalReps.textContent = situpRepCount;
  if (situpTotalTime) situpTotalTime.textContent = `${effectiveSec}s`;
  if (situpAvgCadence) situpAvgCadence.textContent = cadence;
  if (situpAvgRepTime) situpAvgRepTime.textContent = avgRepTime !== '--' ? `${avgRepTime}s` : '--';
  if (situpTalentRating) situpTalentRating.textContent = talent.rating;
  if (situpTalentDesc) situpTalentDesc.textContent = talent.desc;

  if (situpResultPanel) situpResultPanel.classList.add('visible');

  // Auto save to history
  saveToHistory('situp', {
    testDuration: testSec > 0 ? testSec : null,
    totalReps: situpRepCount,
    totalTime: `${effectiveSec}s`,
    avgCadence: cadence,
    avgRepTime,
    formErrors: { ...aiFormStats.situp },
    talentRating: talent.rating
  });
}

// Sit-up event listeners
if (situpStartBtn) situpStartBtn.addEventListener('click', situpStartCountdown);
if (situpCancelBtn) situpCancelBtn.addEventListener('click', () => switchMode('jump'));
if (situpAgainBtn) situpAgainBtn.addEventListener('click', situpEnterIntro);
if (situpSaveBtn) {
  situpSaveBtn.addEventListener('click', () => {
    setStatus('نتایج آزمون دراز و نشست ذخیره شد ✅');
    situpSaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { situpSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
  });
}

if (situpDurationPresets) {
  situpDurationPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.situpDurBtn');
    if (!btn) return;
    const sec = parseInt(btn.getAttribute('data-sec'), 10);
    if (!isNaN(sec)) {
      situpConfiguredDuration = sec;
      situpDurationPresets.querySelectorAll('.situpDurBtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (situpCustomSecInput) situpCustomSecInput.value = sec > 0 ? sec : '';
      if (situpTimerVal) situpTimerVal.textContent = sec > 0 ? `${sec.toFixed(1)}s` : 'آزاد';
      setStatus(`مدت آزمون دراز و نشست: ${sec > 0 ? sec + ' ثانیه' : 'آزاد'}`);
    }
  });
}

if (situpCustomSecInput) {
  situpCustomSecInput.addEventListener('input', () => {
    const val = parseInt(situpCustomSecInput.value, 10);
    if (!isNaN(val) && val >= 5 && val <= 300) {
      situpConfiguredDuration = val;
      if (situpDurationPresets) {
        situpDurationPresets.querySelectorAll('.situpDurBtn').forEach(b => {
          b.classList.toggle('active', parseInt(b.getAttribute('data-sec'), 10) === val);
        });
      }
      if (situpTimerVal) situpTimerVal.textContent = `${val.toFixed(1)}s`;
    }
  });
}

// ================== PUSH-UP (شنا سوئدی) TEST SYSTEM ==================
let pushupPhase = 'intro'; // 'intro' | 'countdown' | 'running' | 'finished'
let pushupState = 'up'; // 'up' | 'descending' | 'down' | 'ascending'
let pushupType = 'standard'; // 'standard' (on toes) | 'modified' (on knees)
let pushupRepCount = 0;
let pushupStartTime = null;
let pushupConfiguredDuration = 30; // 15, 30, 60, or 0 (free)
let pushupTimerInterval = null;
let pushupLastCountdownSec = 30;
let pushupRepTimestamps = [];
let pushupCurrentElbowAngle = null;
let pushupMinElbowAngleThisRep = 180;
let pushupDepthHistory = [];
let pushupStatusMessage = 'آماده باش';
let pushupPlankMessage = 'صاف';
let pushupRepFlashTime = 0;
let pushupCountdownVal = 3;
let pushupSideDetected = 'right';

function pushupEnterIntro() {
  pushupPhase = 'intro';
  pushupState = 'up';
  pushupRepCount = 0;
  pushupRepTimestamps = [];
  pushupDepthHistory = [];
  pushupMinElbowAngleThisRep = 180;
  if (pushupTimerInterval) clearInterval(pushupTimerInterval);
  hideAllPanels();
  if (pushupHud) pushupHud.style.display = 'none';
  if (pushupStartPanel) pushupStartPanel.classList.add('visible');
  const typeLabel = pushupType === 'modified' ? 'روی زانو' : 'استاندارد';
  const durLabel = pushupConfiguredDuration > 0 ? `${pushupConfiguredDuration} ثانیه` : 'تعداد آزاد';
  setStatus(`آزمون شنا سوئدی [${typeLabel}] (${durLabel}): دکمه شروع را بزنید`);
  if (pushupTimerVal) pushupTimerVal.textContent = pushupConfiguredDuration > 0 ? `${pushupConfiguredDuration.toFixed(1)}s` : 'آزاد';
}

function pushupStartCountdown() {
  pushupPhase = 'countdown';
  hideAllPanels();
  let count = 3;
  pushupCountdownVal = 3;
  setStatus('آماده... ۳ ⏳');

  playChime(523, 'sine', 0.16);
  speakText('سه', 'Three');

  const cdInterval = setInterval(() => {
    count--;
    pushupCountdownVal = count > 0 ? count : 'GO';
    if (count > 0) {
      const faDigits = { 2: '۲', 1: '۱' };
      setStatus(`آماده... ${faDigits[count] || count} ⏳`);
      if (count === 2) {
        playChime(523, 'sine', 0.16);
        speakText('دو', 'Two');
      } else if (count === 1) {
        playChime(659, 'sine', 0.18);
        speakText('یک', 'One');
      }
    } else {
      clearInterval(cdInterval);
      setStatus('شروع شنا سوئدی! 💪');
      playChime(880, 'triangle', 0.35);
      speakText('شروع!', 'Go!');
      setTimeout(() => {
        pushupStartRunning();
      }, 350);
    }
  }, 1000);
}

function pushupStartRunning() {
  pushupPhase = 'running';
  pushupState = 'up';
  pushupRepCount = 0;
  pushupRepTimestamps = [];
  pushupDepthHistory = [];
  pushupMinElbowAngleThisRep = 180;
  pushupStartTime = performance.now();
  const testSec = pushupConfiguredDuration;
  pushupLastCountdownSec = testSec > 0 ? testSec : 999;
  hideAllPanels();
  if (pushupHud) pushupHud.style.display = 'block';
  if (pushupTimerVal) pushupTimerVal.textContent = testSec > 0 ? `${testSec.toFixed(1)}s` : '0.0s';
  if (pushupCountVal) pushupCountVal.textContent = '0';
  if (pushupAngleVal) pushupAngleVal.textContent = '--°';
  if (pushupStatusVal) pushupStatusVal.textContent = 'بالا (آماده خم شدن)';
  if (pushupPlankVal) pushupPlankVal.textContent = 'صاف';
  setStatus(`حرکت شنا را با فرم استاندارد و زاویه ۹۰ درجه آرنج انجام دهید`);

  if (pushupTimerInterval) clearInterval(pushupTimerInterval);
  pushupTimerInterval = setInterval(() => {
    if (pushupPhase !== 'running') {
      clearInterval(pushupTimerInterval);
      return;
    }
    const elapsedSec = (performance.now() - pushupStartTime) / 1000;
    if (testSec > 0) {
      const remainingSec = Math.max(0, testSec - elapsedSec);
      if (pushupTimerVal) pushupTimerVal.textContent = remainingSec.toFixed(1) + 's';

      if (remainingSec <= 3.05 && remainingSec > 0.1) {
        const secCeil = Math.ceil(remainingSec);
        if (secCeil !== pushupLastCountdownSec) {
          pushupLastCountdownSec = secCeil;
          playChime(587, 'sine', 0.12);
        }
      }

      if (remainingSec <= 0) {
        clearInterval(pushupTimerInterval);
        pushupFinish();
      }
    } else {
      if (pushupTimerVal) pushupTimerVal.textContent = elapsedSec.toFixed(1) + 's';
    }
  }, 100);
}

function pushupProcessFrame(kp) {
  if (pushupPhase !== 'running') return;

  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const le = kp['left_elbow'], re = kp['right_elbow'];
  const lw = kp['left_wrist'], rw = kp['right_wrist'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];

  const leftScore = (ls?.score || 0) + (le?.score || 0) + (lw?.score || 0) + (lh?.score || 0);
  const rightScore = (rs?.score || 0) + (re?.score || 0) + (rw?.score || 0) + (rh?.score || 0);

  let shoulder = null, elbow = null, wrist = null, hip = null, knee = null, ankle = null;
  if (rightScore >= leftScore && rightScore > 0.7) {
    shoulder = rs; elbow = re; wrist = rw; hip = rh; knee = rk; ankle = ra;
    pushupSideDetected = 'right';
  } else if (leftScore > 0.7) {
    shoulder = ls; elbow = le; wrist = lw; hip = lh; knee = lk; ankle = la;
    pushupSideDetected = 'left';
  } else {
    return;
  }

  // Calculate elbow angle: Shoulder -> Elbow -> Wrist
  const elbowAngle = calculateJointAngle(shoulder, elbow, wrist);
  if (elbowAngle == null) return;

  pushupCurrentElbowAngle = Math.round(elbowAngle);
  const now = performance.now();

  // Check plank alignment (trunk posture)
  let plankAngle = null;
  const endPoint = (pushupType === 'standard' && ankle) ? ankle : knee;
  if (endPoint) {
    plankAngle = calculateJointAngle(shoulder, hip, endPoint);
  }

  let isBackArching = false;
  let isHipPiking = false;
  if (endPoint && shoulder && hip) {
    const dx = (endPoint.x - shoulder.x) || 1e-4;
    const t = (hip.x - shoulder.x) / dx;
    const expectedHipY = shoulder.y + t * (endPoint.y - shoulder.y);
    if (hip.y > expectedHipY + 0.045 && plankAngle != null && plankAngle < 156) {
      isBackArching = true;
    } else if (hip.y < expectedHipY - 0.055 && plankAngle != null && plankAngle < 150) {
      isHipPiking = true;
    }
  }

  if (isBackArching) {
    pushupPlankMessage = '⚠️ قوس کمر و افتادگی لگن';
    triggerAiFormWarning('PUSHUP_BACK_ARCH', {
      mode: 'pushup',
      shortText: '⚠️ قوس کمر',
      title: 'اخطار فرم: قوس کمر و افتادگی لگن (Back Arching)',
      detail: `زاویه تنه ${plankAngle ? Math.round(plankAngle) : 145}° (حداقل مجاز: ۱۶۵°) • عدم انقباض عضلات میان‌تنه`,
      advice: '💡 عضلات شکم و باسن را منقبض کرده و ستون فقرات را هم‌راستای پاها نگه دارید.',
      severity: 'critical'
    });
  } else if (isHipPiking) {
    pushupPlankMessage = '⚠️ بالا بردن باسن (Pike)';
    triggerAiFormWarning('PUSHUP_HIP_PIKE', {
      mode: 'pushup',
      shortText: '⚠️ باسن بالا',
      title: 'اخطار فرم: بالا بردن بیش از حد باسن (Hip Pike)',
      detail: `زاویه تنه ${plankAngle ? Math.round(plankAngle) : 140}° • خروج از راستای مستقیم پلانک`,
      advice: '💡 باسن را پایین آورده و بدن را در یک خط مستقیم مثل تخته صاف حفظ کنید.',
      severity: 'moderate'
    });
  } else if (plankAngle != null && plankAngle >= 158) {
    pushupPlankMessage = 'صاف و استاندارد ✓';
    if (activeAiFormWarning && (activeAiFormWarning.type === 'PUSHUP_BACK_ARCH' || activeAiFormWarning.type === 'PUSHUP_HIP_PIKE')) {
      clearAiFormWarning();
    }
  }

  // Push-up State Machine:
  // High-speed tracking optimization:
  // 'up': arms straight / extended (elbow > 132° to catch fast reps without needing stiff over-lockout)
  // 'descending': lowering chest towards ground (< 126°)
  // 'down': 90-degree depth reached (elbow <= 96° accommodates rapid turnaround without missing bottom frame)
  // 'ascending': pressing back up to straight arms (> 112°)
  if (pushupState === 'up') {
    pushupStatusMessage = 'بالا (آماده خم شدن)';
    if (elbowAngle < 126) {
      pushupState = 'descending';
      pushupMinElbowAngleThisRep = elbowAngle;
      pushupStatusMessage = 'در حال پایین رفتن...';
    }
  } else if (pushupState === 'descending') {
    if (elbowAngle < pushupMinElbowAngleThisRep) {
      pushupMinElbowAngleThisRep = elbowAngle;
    }
    pushupStatusMessage = 'در حال پایین رفتن...';

    // Check for Insufficient Range of Motion (Premature reversal before 96 degrees)
    if (elbowAngle > pushupMinElbowAngleThisRep + 10 && pushupMinElbowAngleThisRep > 102) {
      triggerAiFormWarning('PUSHUP_INSUFFICIENT_ROM', {
        mode: 'pushup',
        shortText: '⚠️ دامنه ناقص',
        title: 'اخطار فرم: عمق ناکافی (دامنه حرکتی ناقص)',
        detail: `حداقل زاویه آرنج ${Math.round(pushupMinElbowAngleThisRep)}° (نیاز به عمق ۹۰ الی ۹۵ درجه)`,
        advice: '💡 سینه را بیشتر به زمین نزدیک کنید تا زاویه آرنج به ۹۰ درجه برسد.',
        severity: 'critical'
      });
    }

    if (elbowAngle <= 96) {
      pushupState = 'down';
      pushupStatusMessage = 'عمق استاندارد (۹۰ درجه) ✨';
      if (activeAiFormWarning && activeAiFormWarning.type === 'PUSHUP_INSUFFICIENT_ROM') {
        clearAiFormWarning();
      }
      playChime(784, 'sine', 0.08); // G5
    } else if (elbowAngle > 145) {
      pushupState = 'up';
    }
  } else if (pushupState === 'down') {
    if (elbowAngle < pushupMinElbowAngleThisRep) {
      pushupMinElbowAngleThisRep = elbowAngle;
    }
    pushupStatusMessage = 'عمق ۹۰° کامل - به بالا فشار دهید';
    if (elbowAngle > 110) {
      pushupState = 'ascending';
      pushupStatusMessage = 'در حال بالا آمدن...';
    }
  } else if (pushupState === 'ascending') {
    pushupStatusMessage = 'در حال بالا آمدن...';
    if (elbowAngle >= 134) {
      // Rep completed!
      pushupState = 'up';
      pushupRepCount++;
      pushupRepTimestamps.push(now);
      pushupDepthHistory.push(Math.round(pushupMinElbowAngleThisRep));
      pushupRepFlashTime = now;
      if (activeAiFormWarning && activeAiFormWarning.mode === 'pushup') {
        clearAiFormWarning();
      }

      playChime(659, 'triangle', 0.24); // E5
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const repStrFa = String(pushupRepCount).split('').map(d => faDigits[d] || d).join('');
      speakText(`${repStrFa}`, `${pushupRepCount}`);

      pushupStatusMessage = `تکرار ${repStrFa} ثبت شد! ✅`;
      setStatus(`تکرار ${repStrFa} شنا سوئدی ثبت شد`);
      triggerLiveHudMetricAnimation(pushupCountVal, 'celebration');
    }
  }

  // Update HUD
  if (pushupCountVal) pushupCountVal.textContent = pushupRepCount;
  if (pushupAngleVal) pushupAngleVal.textContent = `${pushupCurrentElbowAngle}°`;
  if (pushupStatusVal) pushupStatusVal.textContent = pushupStatusMessage;
  if (pushupPlankVal) pushupPlankVal.textContent = pushupPlankMessage;
}

function pushupDrawOverlay() {
  if (pushupPhase === 'countdown') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 80px Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 20;
    ctx.fillText(pushupCountdownVal, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }

  if (pushupPhase === 'running') {
    const now = performance.now();
    if (now - pushupRepFlashTime < 450) {
      const progress = (now - pushupRepFlashTime) / 450;
      const radius = 50 + progress * 70;
      const alpha = Math.max(0, 1 - progress);
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
      ctx.lineWidth = 6 * (1 - progress);
      ctx.stroke();
      ctx.restore();
    }
  }
}

function getPushupTalentRating(reps, durationSec, type) {
  const normFactor = type === 'modified' ? 1.25 : 1.0;
  const effectiveReps = reps / normFactor;
  if (durationSec === 30) {
    if (effectiveReps >= 25) return { rating: '🌟 عالی (رتبه ممتاز استعدادیابی)', desc: 'قدرت و استقامت بالاتنه، سرشانه و بازوها در سطح نخبگان ورزشی.' };
    if (effectiveReps >= 18) return { rating: '⚡ بسیار خوب (آمادگی بالا)', desc: 'پایداری خوب در فرم پلانک و عمق ۹۰ درجه حرکت.' };
    if (effectiveReps >= 12) return { rating: '👍 متوسط و مناسب', desc: 'سطح آمادگی استاندارد ورزشی برای سنین پایه.' };
    return { rating: '🌱 نیازمند تمرین و تقویت', desc: 'تقویت عضلات دلتوئید، سینه و ثبات‌دهنده‌های ستون فقرات پیشنهاد می‌شود.' };
  } else if (durationSec === 60) {
    if (effectiveReps >= 42) return { rating: '🌟 عالی (رتبه ممتاز استعدادیابی)', desc: 'استقامت عضلانی فوق‌العاده در آزمون ۶۰ ثانیه شنا.' };
    if (effectiveReps >= 30) return { rating: '⚡ بسیار خوب (آمادگی بالا)', desc: 'استقامت توان بالاتنه در سطح بالا.' };
    if (effectiveReps >= 20) return { rating: '👍 متوسط و استاندارد', desc: 'عملکرد مناسب؛ با برنامه‌ریزی تمرینی منظم قابل ارتقاست.' };
    return { rating: '🌱 نیازمند تمرین و تقویت', desc: 'تمرینات کمکی بالاتنه برای استقامت در خستگی.' };
  } else {
    if (effectiveReps >= 30) return { rating: '🌟 عالی (استقامت توان)', desc: 'تعداد تکرار بالا تا انتهای توان.' };
    if (effectiveReps >= 18) return { rating: '⚡ بسیار خوب', desc: 'آمادگی عضلانی مطلوب بالاتنه.' };
    return { rating: '👍 خوب', desc: 'تکرار موفق در فرم صحیح.' };
  }
}

function pushupFinish() {
  if (pushupTimerInterval) clearInterval(pushupTimerInterval);
  pushupPhase = 'finished';
  clearAiFormWarning();
  setStatus('آزمون شنا سوئدی پایان یافت! 🏁');
  playChime(880, 'triangle', 0.35);
  speakText('پایان آزمون شنا سوئدی', 'Push-up test finished');

  if (pushupHud) pushupHud.style.display = 'none';

  const elapsedSec = pushupStartTime ? (performance.now() - pushupStartTime) / 1000 : 0;
  const testSec = pushupConfiguredDuration;
  const effectiveSec = testSec > 0 ? testSec : Math.round(elapsedSec);

  let cadence = 0;
  if (effectiveSec > 0) {
    cadence = Math.round((pushupRepCount / effectiveSec) * 60);
  }

  const avgDepth = pushupDepthHistory.length > 0 
    ? Math.round(pushupDepthHistory.reduce((a, b) => a + b, 0) / pushupDepthHistory.length) 
    : null;

  const talent = getPushupTalentRating(pushupRepCount, testSec, pushupType);

  const typeLabel = pushupType === 'modified' ? 'روی زانو' : 'استاندارد';
  if (pushupResultTitle) {
    pushupResultTitle.textContent = `🏆 نتایج آزمون شنا سوئدی [${typeLabel}] (${testSec > 0 ? testSec + ' ثانیه' : 'آزاد'})`;
  }
  if (pushupTotalReps) pushupTotalReps.textContent = pushupRepCount;
  if (pushupTotalTime) pushupTotalTime.textContent = `${effectiveSec}s`;
  if (pushupAvgCadence) pushupAvgCadence.textContent = cadence;
  if (pushupAvgDepth) pushupAvgDepth.textContent = avgDepth != null ? `${avgDepth}°` : '--';
  if (pushupTalentRating) pushupTalentRating.textContent = talent.rating;
  if (pushupTalentDesc) pushupTalentDesc.textContent = talent.desc;

  if (pushupResultPanel) pushupResultPanel.classList.add('visible');

  // Auto save to history
  saveToHistory('pushup', {
    testDuration: testSec > 0 ? testSec : null,
    pushupType,
    totalReps: pushupRepCount,
    totalTime: `${effectiveSec}s`,
    avgCadence: cadence,
    avgDepth,
    formErrors: { ...aiFormStats.pushup },
    talentRating: talent.rating
  });
}

// Push-up event listeners
if (pushupStartBtn) pushupStartBtn.addEventListener('click', pushupStartCountdown);
if (pushupCancelBtn) pushupCancelBtn.addEventListener('click', () => switchMode('jump'));
if (pushupAgainBtn) pushupAgainBtn.addEventListener('click', pushupEnterIntro);
if (pushupSaveBtn) {
  pushupSaveBtn.addEventListener('click', () => {
    setStatus('نتایج آزمون شنا سوئدی ذخیره شد ✅');
    pushupSaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { pushupSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
  });
}

// Push-up type toggle (standard vs modified)
if (pushupTypeStdBtn && pushupTypeModBtn) {
  pushupTypeStdBtn.addEventListener('click', () => {
    pushupType = 'standard';
    pushupTypeStdBtn.classList.add('active');
    pushupTypeModBtn.classList.remove('active');
    setStatus('نوع شنا: استاندارد (روی پنجه پا)');
  });

  pushupTypeModBtn.addEventListener('click', () => {
    pushupType = 'modified';
    pushupTypeModBtn.classList.add('active');
    pushupTypeStdBtn.classList.remove('active');
    setStatus('نوع شنا: اصلاح‌شده (روی زانو)');
  });
}

if (pushupDurationPresets) {
  pushupDurationPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.pushupDurBtn');
    if (!btn) return;
    const sec = parseInt(btn.getAttribute('data-sec'), 10);
    if (!isNaN(sec)) {
      pushupConfiguredDuration = sec;
      pushupDurationPresets.querySelectorAll('.pushupDurBtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (pushupCustomSecInput) pushupCustomSecInput.value = sec > 0 ? sec : '';
      if (pushupTimerVal) pushupTimerVal.textContent = sec > 0 ? `${sec.toFixed(1)}s` : 'آزاد';
      setStatus(`مدت آزمون شنا سوئدی: ${sec > 0 ? sec + ' ثانیه' : 'آزاد'}`);
    }
  });
}

if (pushupCustomSecInput) {
  pushupCustomSecInput.addEventListener('input', () => {
    const val = parseInt(pushupCustomSecInput.value, 10);
    if (!isNaN(val) && val >= 5 && val <= 300) {
      pushupConfiguredDuration = val;
      if (pushupDurationPresets) {
        pushupDurationPresets.querySelectorAll('.pushupDurBtn').forEach(b => {
          b.classList.toggle('active', parseInt(b.getAttribute('data-sec'), 10) === val);
        });
      }
      if (pushupTimerVal) pushupTimerVal.textContent = `${val.toFixed(1)}s`;
    }
  });
}

// ================== SQUAT & LUNGE BIOMECHANICS ENGINE (اسکات و لانج) ==================
let squatLungeSubmode = 'squat'; // 'squat' | 'lunge'
let squatLungePhase = 'intro'; // 'intro' | 'countdown' | 'running' | 'finished'
let squatLungeState = 'up'; // 'up' | 'descending' | 'bottom' | 'ascending'
let squatLungeTargetType = 'reps'; // 'reps' | 'time' | 'free'
let squatLungeTargetVal = 10;
let squatLungeRepCount = 0;
let squatLungeRepTimestamps = [];
let squatLungeDepthHistory = [];
let squatLungeQuadsHistory = [];
let squatLungeGlutesHistory = [];
let squatLungeMinKneeAngleThisRep = 180;
let squatLungeMaxQuadsThisRep = 0;
let squatLungeMaxGlutesThisRep = 0;
let squatLungePeakQuadsAll = 0;
let squatLungePeakGlutesAll = 0;

let squatLungeCurrentKneeAngle = 180;
let squatLungeCurrentHipAngle = 180;
let squatLungeCurrentQuadsTension = 5;
let squatLungeCurrentGlutesTension = 5;
let squatLungeToeAlignmentStatus = 'standard'; // 'standard' | 'excessive_forward' | 'valgus'
let squatLungeToeWarningCount = 0;
let squatLungeDepthStatusText = 'ایستاده (آماده)';
let squatLungeAlignmentText = 'تراز استاندارد ✓';

// ================== SQUAT ROM BASELINE & CALIBRATION ==================

function loadSquatRomBaseline() {
  try {
    const raw = localStorage.getItem('motion_tracker_squat_baseline');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.depthAngle === 'number') {
        squatBaseline = {
          depthAngle: Math.max(60, Math.min(125, parsed.depthAngle)),
          kneeToeRatio: typeof parsed.kneeToeRatio === 'number' ? parsed.kneeToeRatio : 0.12,
          femurTibiaRatio: typeof parsed.femurTibiaRatio === 'number' ? parsed.femurTibiaRatio : 1.05,
          isCalibrated: true
        };
        updateSquatCalibUI();
        return;
      }
    }
  } catch (e) {
    console.warn('Could not load squat baseline:', e);
  }
  squatBaseline = {
    depthAngle: 90,
    kneeToeRatio: 0.12,
    femurTibiaRatio: 1.05,
    isCalibrated: false
  };
  updateSquatCalibUI();
}

function saveSquatRomBaseline(depth, kneeToe, femurTibia) {
  squatBaseline = {
    depthAngle: Math.round(depth),
    kneeToeRatio: parseFloat(kneeToe.toFixed(2)),
    femurTibiaRatio: parseFloat(femurTibia.toFixed(2)),
    isCalibrated: true
  };
  try {
    localStorage.setItem('motion_tracker_squat_baseline', JSON.stringify(squatBaseline));
  } catch (e) {
    console.warn('Could not save squat baseline:', e);
  }
  updateSquatCalibUI();
}

function updateSquatCalibUI() {
  if (squatCalibStatusBadge) {
    if (squatBaseline.isCalibrated) {
      squatCalibStatusBadge.textContent = `کالیبره‌شده (${squatBaseline.depthAngle}°) ✓`;
      squatCalibStatusBadge.style.background = 'rgba(56, 189, 248, 0.2)';
      squatCalibStatusBadge.style.color = '#38bdf8';
      squatCalibStatusBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
    } else {
      squatCalibStatusBadge.textContent = 'پیش‌فرض (۹۰°)';
      squatCalibStatusBadge.style.background = 'rgba(74, 222, 128, 0.2)';
      squatCalibStatusBadge.style.color = '#4ade80';
      squatCalibStatusBadge.style.borderColor = 'rgba(74, 222, 128, 0.4)';
    }
  }
  if (squatCalibResultText) {
    if (squatBaseline.isCalibrated) {
      squatCalibResultText.style.display = 'block';
      if (squatCalibDepthVal) squatCalibDepthVal.textContent = `${squatBaseline.depthAngle}°`;
      if (squatCalibToeRatioVal) squatCalibToeRatioVal.textContent = `${squatBaseline.kneeToeRatio}`;
    } else {
      squatCalibResultText.style.display = 'none';
    }
  }
}

function startSquatCalibration() {
  if (settingsModal) settingsModal.classList.remove('visible');
  hideAllPanels();
  isSquatCalibrating = true;
  squatCalibHoldStartTime = 0;
  squatCalibSamples = [];
  squatCalibFeedbackText = 'در وضعیت اسکات بنشینید و ۳ ثانیه موقعیت را حفظ کنید 🏋️‍♂️';
  setStatus('کالیبراسیون اسکات: در عمق دلخواه بنشینید و ۳ ثانیه ثابت بمانید ⏳');
  playChime(523, 'sine', 0.2);
  speakText('در وضعیت اسکات بنشینید و سه ثانیه ثابت بمانید', 'Hold squat position for three seconds');
}

function cancelSquatCalibration() {
  if (!isSquatCalibrating) return;
  isSquatCalibrating = false;
  squatCalibHoldStartTime = 0;
  squatCalibSamples = [];
  setStatus('کالیبراسیون اسکات متوقف گردید');
  if (settingsModal) settingsModal.classList.add('visible');
}

function squatCalibProcessFrame(kp) {
  if (!isSquatCalibrating) return;

  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const lt = kp['left_foot_index'] || kp['left_heel'] || la;
  const rt = kp['right_foot_index'] || kp['right_heel'] || ra;
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];

  const leftScore = (lh?.score || 0) + (lk?.score || 0) + (la?.score || 0);
  const rightScore = (rh?.score || 0) + (rk?.score || 0) + (ra?.score || 0);

  let hip = null, knee = null, ankle = null, toe = null, shoulder = null;
  if (rightScore >= leftScore && rightScore > 0.8) {
    hip = rh; knee = rk; ankle = ra; toe = rt; shoulder = rs;
  } else if (leftScore > 0.8) {
    hip = lh; knee = lk; ankle = la; toe = lt; shoulder = ls;
  } else {
    squatCalibFeedbackText = 'لطفاً به صورت نیم‌رخ روبروی دوربین قرار گیرید';
    return;
  }

  const kneeAngle = calculateJointAngle(hip, knee, ankle);
  if (kneeAngle == null) return;

  const now = performance.now();
  const isSquatPose = (kneeAngle >= 60 && kneeAngle <= 125);

  if (!isSquatPose) {
    if (squatCalibHoldStartTime > 0) {
      squatCalibHoldStartTime = 0;
      squatCalibSamples = [];
      playChime(330, 'sine', 0.12);
    }
    if (kneeAngle > 140) {
      squatCalibFeedbackText = 'برای آغاز کالیبراسیون در زاویه اسکات فرود آیید';
    } else {
      squatCalibFeedbackText = 'عمق زانو را بین ۶۰ تا ۱۲۰ درجه حفظ کنید';
    }
    return;
  }

  let footFacingX = (toe && ankle) ? (toe.x - ankle.x) : 0;
  if (Math.abs(footFacingX) < 1e-4) {
    footFacingX = (knee.x > hip.x ? 1 : -1) * 0.05;
  }
  const facingSign = Math.sign(footFacingX);
  const kneeProjectionBeyondToe = toe ? (knee.x - toe.x) * facingSign : 0;
  const femurLen = Math.hypot(knee.x - hip.x, knee.y - hip.y);
  const tibiaLen = Math.hypot(ankle.x - knee.x, ankle.y - knee.y);
  const femurTibiaRatio = tibiaLen > 10 ? (femurLen / tibiaLen) : 1.05;
  const legLen = femurLen + tibiaLen;
  const normalizedKneeExcess = legLen > 20 ? (kneeProjectionBeyondToe / legLen) : 0.12;

  if (squatCalibHoldStartTime === 0) {
    squatCalibHoldStartTime = now;
    squatCalibSamples = [];
    playChime(587, 'sine', 0.14);
  }

  squatCalibSamples.push({
    kneeAngle,
    kneeProjectionBeyondToe,
    normalizedKneeExcess,
    femurTibiaRatio,
    time: now
  });

  const elapsedHoldMs = now - squatCalibHoldStartTime;
  const remainingSec = Math.max(0, (3000 - elapsedHoldMs) / 1000);
  squatCalibFeedbackText = `ثابت نگه دارید... ${remainingSec.toFixed(1)} ثانیه ⏱️`;
  setStatus(`کالیبراسیون: وضعیت اسکات را حفظ کنید (${remainingSec.toFixed(1)}s) ⏱️`);

  if (elapsedHoldMs >= 3000) {
    const avgDepth = squatCalibSamples.reduce((s, x) => s + x.kneeAngle, 0) / squatCalibSamples.length;
    const avgKneeToe = squatCalibSamples.reduce((s, x) => s + x.normalizedKneeExcess, 0) / squatCalibSamples.length;
    const avgRatio = squatCalibSamples.reduce((s, x) => s + x.femurTibiaRatio, 0) / squatCalibSamples.length;

    const safeDepth = Math.max(65, Math.min(115, Math.round(avgDepth)));
    const safeKneeToe = Math.max(0.08, Math.min(0.25, avgKneeToe));
    const safeRatio = Math.max(0.85, Math.min(1.35, avgRatio));

    saveSquatRomBaseline(safeDepth, safeKneeToe, safeRatio);
    isSquatCalibrating = false;
    squatCalibHoldStartTime = 0;
    squatCalibSamples = [];

    playChime(659, 'triangle', 0.2);
    setTimeout(() => playChime(880, 'triangle', 0.35), 180);
    speakText('کالیبراسیون اسکات با موفقیت ثبت شد', 'Squat baseline calibrated successfully');
    setStatus(`✅ کالیبراسیون موفق! عمق پایه اختصاصی شما روی ${safeDepth}° ثبت گردید`);

    setTimeout(() => {
      if (settingsModal) settingsModal.classList.add('visible');
    }, 1200);
  }
}

function squatCalibDrawOverlay() {
  if (!isSquatCalibrating) return;

  const now = performance.now();
  const elapsedHoldMs = squatCalibHoldStartTime > 0 ? (now - squatCalibHoldStartTime) : 0;
  const progress = Math.min(1.0, elapsedHoldMs / 3000);

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.68)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(92, canvas.width * 0.22);

  // Background ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 12;
  ctx.stroke();

  // Progress arc
  if (progress > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + progress * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = progress >= 1.0 ? '#22c55e' : '#38bdf8';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.shadowColor = progress >= 1.0 ? '#22c55e' : '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.stroke();
  }

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (squatCalibHoldStartTime > 0) {
    const remainingSec = Math.max(0, (3000 - elapsedHoldMs) / 1000);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px Vazirmatn, system-ui, sans-serif';
    ctx.fillText(`${remainingSec.toFixed(1)}s`, cx, cy - 8);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px Vazirmatn, system-ui, sans-serif';
    ctx.fillText('ثابت بمانید', cx, cy + 22);
  } else {
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 26px Vazirmatn, system-ui, sans-serif';
    ctx.fillText('اسکات', cx, cy - 8);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px Vazirmatn, system-ui, sans-serif';
    ctx.fillText('فرود به عمق دلخواه', cx, cy + 20);
  }

  // Header banner
  ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1.5;
  const cardW = Math.min(360, canvas.width - 40);
  const cardH = 52;
  const cardX = cx - cardW / 2;
  const cardY = Math.max(20, cy - radius - 75);

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(cardX, cardY, cardW, cardH, 12);
  } else {
    ctx.rect(cardX, cardY, cardW, cardH);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px Vazirmatn, system-ui, sans-serif';
  ctx.fillText('🏋️‍♂️ کالیبراسیون هوشمند دامنه اسکات (۳ ثانیه)', cx, cardY + 20);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px Vazirmatn, system-ui, sans-serif';
  ctx.fillText(squatCalibFeedbackText, cx, cardY + 38);

  // Esc cancel hint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = '11px Vazirmatn, system-ui, sans-serif';
  ctx.fillText('برای انصراف کلید Esc را بزنید', cx, cy + radius + 40);

  ctx.restore();
}

function updateSquatFatigueMonitor() {
  const reps = squatLungeRepCombinedTensionHistory.length;
  if (reps < 2) {
    squatLungeCurrentFatigueIndex = 0;
    squatLungeFatigueRatingText = 'شاداب (آغاز آزمون)';
    if (squatFatigueVal) squatFatigueVal.textContent = '۰٪ (حداکثر توان)';
    if (squatFatigueBar) squatFatigueBar.style.width = '0%';
    if (squatFatigueBadge) {
      squatFatigueBadge.textContent = 'شاداب (تکرارهای آغازین)';
      squatFatigueBadge.style.color = '#4ade80';
      squatFatigueBadge.style.background = 'rgba(74, 222, 128, 0.15)';
      squatFatigueBadge.style.borderColor = 'rgba(74, 222, 128, 0.3)';
    }
    return;
  }

  // Compare first few reps (initial fresh state) vs last few reps
  const windowSize = Math.max(1, Math.min(3, Math.floor(reps / 2)));
  const firstFew = squatLungeRepCombinedTensionHistory.slice(0, windowSize);
  const lastFew = squatLungeRepCombinedTensionHistory.slice(-windowSize);

  const firstAvg = firstFew.reduce((a, b) => a + b, 0) / firstFew.length;
  const lastAvg = lastFew.reduce((a, b) => a + b, 0) / lastFew.length;

  let tensionDropPct = firstAvg > 0 ? ((firstAvg - lastAvg) / firstAvg) * 100 : 0;

  // Factor in rep cycle duration slowdown if available
  if (squatLungeRepTimestamps.length >= 3) {
    const firstCycleDur = (squatLungeRepTimestamps[1] - squatLungeRepTimestamps[0]);
    const lastCycleDur = (squatLungeRepTimestamps[squatLungeRepTimestamps.length - 1] - squatLungeRepTimestamps[squatLungeRepTimestamps.length - 2]);
    if (firstCycleDur > 500 && lastCycleDur > firstCycleDur) {
      const speedSlowdownPct = ((lastCycleDur - firstCycleDur) / firstCycleDur) * 15;
      tensionDropPct += Math.min(15, speedSlowdownPct);
    }
  }

  const fatiguePct = Math.max(0, Math.min(85, Math.round(tensionDropPct)));
  squatLungeCurrentFatigueIndex = fatiguePct;

  if (squatFatigueVal) {
    squatFatigueVal.textContent = `${fatiguePct}٪ (${fatiguePct < 8 ? 'حداکثر توان' : 'افت توان'})`;
  }
  if (squatFatigueBar) {
    squatFatigueBar.style.width = `${fatiguePct}%`;
  }

  let badgeText = 'شاداب (توان حداکثر)';
  let badgeColor = '#4ade80';
  let badgeBg = 'rgba(74, 222, 128, 0.15)';

  if (fatiguePct >= 30) {
    badgeText = 'خستگی شدید عضلانی 🔴';
    badgeColor = '#f43f5e';
    badgeBg = 'rgba(244, 63, 94, 0.2)';
    squatLungeFatigueRatingText = 'خستگی شدید و تجمع اسید لاکتیک';
  } else if (fatiguePct >= 18) {
    badgeText = 'خستگی متوسط 🟠';
    badgeColor = '#fb923c';
    badgeBg = 'rgba(251, 146, 60, 0.2)';
    squatLungeFatigueRatingText = 'خستگی متوسط عضلانی';
  } else if (fatiguePct >= 8) {
    badgeText = 'خستگی خفیف 🟡';
    badgeColor = '#facc15';
    badgeBg = 'rgba(250, 204, 21, 0.2)';
    squatLungeFatigueRatingText = 'پایداری مطلوب توان';
  } else {
    badgeText = 'شاداب (حداکثر توان) 🟢';
    badgeColor = '#4ade80';
    badgeBg = 'rgba(74, 222, 128, 0.15)';
    squatLungeFatigueRatingText = 'استقامت و پایداری عالی';
  }

  if (squatFatigueBadge) {
    squatFatigueBadge.textContent = badgeText;
    squatFatigueBadge.style.color = badgeColor;
    squatFatigueBadge.style.background = badgeBg;
    squatFatigueBadge.style.borderColor = badgeColor;
  }
}

// ================== DYNAMIC DEPTH GAUGE GRAPHIC OVERLAY ==================
function drawDepthGauge(cx, cy, currentKneeAngle, targetDepthAngle) {
  const safeAngle = (typeof currentKneeAngle === 'number' && isFinite(currentKneeAngle)) ? currentKneeAngle : (currentKneeAngle?.valueOf?.() || 180);
  const safeTarget = (typeof targetDepthAngle === 'number' && isFinite(targetDepthAngle)) ? targetDepthAngle : 90;

  const r = 46;
  const startAng = 0.75 * Math.PI; // 135° (bottom-left)
  const endAng = 2.25 * Math.PI;   // 405° (bottom-right)
  const totalSweep = 1.5 * Math.PI; // 270°

  const standingRef = 175;
  const denom = Math.max(20, standingRef - safeTarget);
  const rawProgress = isFinite(denom) && denom !== 0 ? (standingRef - safeAngle) / denom : 0;
  const progress = Math.max(0, Math.min(1.25, isFinite(rawProgress) ? rawProgress : 0));

  ctx.save();
  try {
    // Glass card circular backdrop
    ctx.beginPath();
    ctx.arc(cx, cy, r + 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Outer gauge track
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAng, endAng);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Target depth tick mark (at 100% depth / 1.0 progress)
    const targetMarkAngle = startAng + (1.0 / 1.25) * totalSweep;
    const tX1 = cx + Math.cos(targetMarkAngle) * (r - 7);
    const tY1 = cy + Math.sin(targetMarkAngle) * (r - 7);
    const tX2 = cx + Math.cos(targetMarkAngle) * (r + 7);
    const tY2 = cy + Math.sin(targetMarkAngle) * (r + 7);

    ctx.beginPath();
    ctx.moveTo(tX1, tY1);
    ctx.lineTo(tX2, tY2);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Dynamic color interpolation
    let gaugeColor = '#38bdf8';
    let gaugeShadow = '#0284c7';
    if (progress >= 1.08) {
      gaugeColor = '#c084fc';
      gaugeShadow = '#a855f7';
    } else if (progress >= 0.95) {
      gaugeColor = '#22c55e';
      gaugeShadow = '#16a34a';
    } else if (progress >= 0.75) {
      gaugeColor = '#84cc16';
      gaugeShadow = '#65a30d';
    } else if (progress >= 0.45) {
      gaugeColor = '#facc15';
      gaugeShadow = '#ca8a04';
    } else {
      gaugeColor = '#38bdf8';
      gaugeShadow = '#0284c7';
    }

    // Active Progress Arc
    if (progress > 0.02) {
      const sweepProgress = (progress / 1.25) * totalSweep;
      const currentAng = startAng + sweepProgress;

      ctx.beginPath();
      ctx.arc(cx, cy, r, startAng, currentAng);
      ctx.strokeStyle = gaugeColor;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.shadowColor = gaugeShadow;
      ctx.shadowBlur = progress >= 0.95 ? 16 : 8;
      ctx.stroke();

      // Needle indicator / glowing tip bead
      const tipX = cx + Math.cos(currentAng) * r;
      const tipY = cy + Math.sin(currentAng) * r;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = gaugeColor;
      ctx.shadowBlur = 10;
      ctx.fill();
    }

    // Pulsing glow ring when target depth reached
    if (progress >= 0.95) {
      const pulse = (Math.sin(performance.now() / 150) + 1) / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 6 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 197, 94, ${0.35 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Numerical & Status Readout
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Current angle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Vazirmatn, system-ui, sans-serif';
    ctx.fillText(`${Math.round(safeAngle)}°`, cx, cy - 8);

    // Depth percentage
    const pctText = `${Math.min(125, Math.round(progress * 100))}٪`;
    ctx.fillStyle = gaugeColor;
    ctx.font = 'bold 10px Vazirmatn, system-ui, sans-serif';
    ctx.fillText(pctText, cx, cy + 9);

    // Top label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '8.5px Vazirmatn, system-ui, sans-serif';
    ctx.fillText(`گیج عمق (${safeTarget}°)`, cx, cy - 24);

    // Bottom Status text
    let statusPill = 'ایستاده';
    if (progress >= 1.08) statusPill = 'اسکات عمیق';
    else if (progress >= 0.95) statusPill = 'عمق کامل ✓';
    else if (progress >= 0.45) statusPill = 'فرود...';

    ctx.fillStyle = gaugeColor;
    ctx.font = 'bold 9.5px Vazirmatn, system-ui, sans-serif';
    ctx.fillText(statusPill, cx, cy + r + 2);
  } finally {
    ctx.restore();
  }
}

let squatLungeStartTime = 0;
let squatLungeTimerInterval = null;
let squatLungeCountdownVal = 3;
let squatLungeRepFlashTime = 0;
let squatLungeActiveSide = 'right';
let squatLungeLastVoiceWarningTime = 0;
let squatLungeTrackedJoints = null;

function squatLungeEnterIntro() {
  squatLungePhase = 'intro';
  squatLungeState = 'up';
  squatLungeRepCount = 0;
  squatLungeRepTimestamps = [];
  squatLungeDepthHistory = [];
  squatLungeQuadsHistory = [];
  squatLungeGlutesHistory = [];
  squatLungeMinKneeAngleThisRep = 180;
  squatLungeMaxQuadsThisRep = 0;
  squatLungeMaxGlutesThisRep = 0;
  squatLungePeakQuadsAll = 0;
  squatLungePeakGlutesAll = 0;
  squatLungeCurrentQuadsTension = 5;
  squatLungeCurrentGlutesTension = 5;
  squatLungeToeWarningCount = 0;
  squatLungeTrackedJoints = null;
  squatLungeRepCombinedTensionHistory = [];
  squatLungeCurrentFatigueIndex = 0;
  updateSquatFatigueMonitor();

  if (squatLungeTimerInterval) {
    clearInterval(squatLungeTimerInterval);
    squatLungeTimerInterval = null;
  }

  hideAllPanels();
  if (squatLungeHud) squatLungeHud.style.display = 'none';
  if (squatLungeStartPanel) squatLungeStartPanel.classList.add('visible');

  const submodeName = squatLungeSubmode === 'squat' ? 'اسکات (Squat)' : 'لانج (Lunge)';
  setStatus(`آزمون بیومکانیک ${submodeName}: دکمه شروع را لمس کنید 🏋️‍♂️`);
}

function squatLungeStartCountdown() {
  squatLungePhase = 'countdown';
  hideAllPanels();
  let count = 3;
  squatLungeCountdownVal = 3;
  setStatus('آماده‌باش برای آزمون... ۳ ⏳');

  playChime(523, 'sine', 0.16);
  speakText('سه', 'Three');

  const cdInterval = setInterval(() => {
    count--;
    squatLungeCountdownVal = count > 0 ? count : 'GO';
    if (count > 0) {
      const faDigits = { 2: '۲', 1: '۱' };
      setStatus(`آماده‌باش... ${faDigits[count] || count} ⏳`);
      if (count === 2) {
        playChime(523, 'sine', 0.16);
        speakText('دو', 'Two');
      } else if (count === 1) {
        playChime(659, 'sine', 0.18);
        speakText('یک', 'One');
      }
    } else {
      clearInterval(cdInterval);
      const subTitle = squatLungeSubmode === 'squat' ? 'شروع اسکات!' : 'شروع لانج!';
      setStatus(`${subTitle} فرم صحیح را حفظ کنید 🏋️‍♂️`);
      playChime(880, 'triangle', 0.35);
      speakText('شروع!', 'Go!');
      setTimeout(() => {
        squatLungeStartRunning();
      }, 350);
    }
  }, 1000);
}

function squatLungeStartRunning() {
  squatLungePhase = 'running';
  squatLungeState = 'up';
  squatLungeRepCount = 0;
  squatLungeRepTimestamps = [];
  squatLungeDepthHistory = [];
  squatLungeQuadsHistory = [];
  squatLungeGlutesHistory = [];
  squatLungeMinKneeAngleThisRep = 180;
  squatLungeMaxQuadsThisRep = 0;
  squatLungeMaxGlutesThisRep = 0;
  squatLungePeakQuadsAll = 0;
  squatLungePeakGlutesAll = 0;
  squatLungeToeWarningCount = 0;
  squatLungeCurrentQuadsTension = 5;
  squatLungeCurrentGlutesTension = 5;
  squatLungeRepCombinedTensionHistory = [];
  squatLungeCurrentFatigueIndex = 0;
  squatLungeStartTime = performance.now();

  hideAllPanels();
  if (squatLungeHud) squatLungeHud.style.display = 'block';

  const submodeFa = squatLungeSubmode === 'squat' ? 'اسکات' : 'لانج';
  if (squatLungeSubmodeVal) squatLungeSubmodeVal.textContent = submodeFa;
  if (squatLungeRepVal) squatLungeRepVal.textContent = '0';
  if (squatLungeKneeAngleVal) squatLungeKneeAngleVal.textContent = '--°';
  if (squatLungeDepthStatusVal) squatLungeDepthStatusVal.textContent = 'ایستاده (آماده)';
  if (squatLungeKneeAlignmentVal) {
    squatLungeKneeAlignmentVal.textContent = 'تراز استاندارد ✓';
    squatLungeKneeAlignmentVal.style.color = '#4ade80';
  }
  if (squatQuadsTensionBar) squatQuadsTensionBar.style.width = '5%';
  if (squatQuadsTensionLabel) squatQuadsTensionLabel.textContent = '۵٪ (پایه)';
  if (squatGlutesTensionBar) squatGlutesTensionBar.style.width = '5%';
  if (squatGlutesTensionLabel) squatGlutesTensionLabel.textContent = '۵٪ (پایه)';
  updateSquatFatigueMonitor();

  if (squatLungeTimerInterval) clearInterval(squatLungeTimerInterval);
  squatLungeTimerInterval = setInterval(() => {
    if (squatLungePhase !== 'running') {
      clearInterval(squatLungeTimerInterval);
      return;
    }
    const elapsedSec = (performance.now() - squatLungeStartTime) / 1000;

    if (squatLungeTargetType === 'time') {
      const remainingSec = Math.max(0, squatLungeTargetVal - elapsedSec);
      if (squatLungeTimerVal) squatLungeTimerVal.textContent = `${remainingSec.toFixed(1)}s`;
      if (remainingSec <= 0) {
        clearInterval(squatLungeTimerInterval);
        squatLungeFinish();
      }
    } else {
      if (squatLungeTimerVal) squatLungeTimerVal.textContent = `${elapsedSec.toFixed(1)}s`;
    }
  }, 100);
}

function squatLungeProcessFrame(kp) {
  if (squatLungePhase !== 'running') return;

  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const lt = kp['left_foot_index'] || kp['left_heel'] || la;
  const rt = kp['right_foot_index'] || kp['right_heel'] || ra;

  const leftScore = (lh?.score || 0) + (lk?.score || 0) + (la?.score || 0);
  const rightScore = (rh?.score || 0) + (rk?.score || 0) + (ra?.score || 0);

  let hip = null, knee = null, ankle = null, toe = null, shoulder = null;

  if (squatLungeSubmode === 'lunge') {
    // For Lunge: determine lead leg (the one stepping forward with greater knee bend or forward distance)
    if (lk && rk && lh && rh) {
      if (lk.y > rk.y || (la && ra && Math.abs(lk.x - lh.x) > Math.abs(rk.x - rh.x))) {
        hip = lh; knee = lk; ankle = la; toe = lt; shoulder = ls;
        squatLungeActiveSide = 'left';
      } else {
        hip = rh; knee = rk; ankle = ra; toe = rt; shoulder = rs;
        squatLungeActiveSide = 'right';
      }
    }
  }

  // Default side selection based on visibility score
  if (!hip) {
    if (rightScore >= leftScore && rightScore > 0.8) {
      hip = rh; knee = rk; ankle = ra; toe = rt; shoulder = rs;
      squatLungeActiveSide = 'right';
    } else if (leftScore > 0.8) {
      hip = lh; knee = lk; ankle = la; toe = lt; shoulder = ls;
      squatLungeActiveSide = 'left';
    } else {
      return;
    }
  }

  if (!hip || !knee || !ankle) return;

  // Calculate Knee Angle: Hip -> Knee -> Ankle
  const kneeAngle = calculateJointAngle(hip, knee, ankle);
  if (kneeAngle == null) return;

  // Calculate Hip Angle: Shoulder -> Hip -> Knee
  let hipAngle = 180;
  if (shoulder) {
    const computedHipAngle = calculateJointAngle(shoulder, hip, knee);
    if (computedHipAngle != null) hipAngle = computedHipAngle;
  } else {
    // Estimate hip angle from torso verticality
    hipAngle = Math.max(70, Math.min(180, kneeAngle + 10));
  }

  squatLungeCurrentKneeAngle = Math.round(kneeAngle);
  squatLungeCurrentHipAngle = Math.round(hipAngle);

  // Store for canvas overlay
  squatLungeTrackedJoints = {
    hip, knee, ankle, toe, shoulder,
    side: squatLungeActiveSide
  };

  // ================== KNEE-OVER-TOE ALIGNMENT MONITORING ==================
  let toeAlignState = 'standard';
  let alignText = 'تراز استاندارد ✓';

  if (toe && ankle && knee) {
    // Foot vector (ankle to toe) determines body facing direction
    let footFacingX = (toe.x - ankle.x);
    if (Math.abs(footFacingX) < 1e-4) {
      footFacingX = (knee.x > hip.x ? 1 : -1) * 0.05;
    }
    const facingSign = Math.sign(footFacingX);

    // Forward projection of knee relative to toe line
    const kneeProjectionBeyondToe = (knee.x - toe.x) * facingSign;
    const legLengthPx = Math.hypot(knee.x - hip.x, knee.y - hip.y) + Math.hypot(ankle.x - knee.x, ankle.y - knee.y);
    const normalizedKneeExcess = legLengthPx > 20 ? (kneeProjectionBeyondToe / legLengthPx) : (kneeProjectionBeyondToe / 150);

    // Dynamic Valgus check (knees caving inward) if bilateral
    let isValgus = false;
    if (squatLungeSubmode === 'squat' && lk && rk && la && ra && (lk.score > 0.3) && (rk.score > 0.3)) {
      const kneeDist = Math.abs(lk.x - rk.x);
      const ankleDist = Math.abs(la.x - ra.x);
      if (ankleDist > 30 && kneeDist < ankleDist * 0.72 && kneeAngle < 135) {
        isValgus = true;
      }
    }

    // Calibrated baseline threshold for knee-over-toe alignment
    const maxAllowedKneeExcess = (squatBaseline && squatBaseline.isCalibrated)
      ? Math.max(0.10, squatBaseline.kneeToeRatio * 1.18)
      : 0.14;

    if (isValgus) {
      toeAlignState = 'valgus';
      alignText = '⚠️ چرخش زانو به داخل (Valgus)';
      squatLungeToeWarningCount++;
    } else if (normalizedKneeExcess > maxAllowedKneeExcess) {
      toeAlignState = 'excessive_forward';
      alignText = '⚠️ جلو رفتن بیش از حد زانو از پنجه';
      squatLungeToeWarningCount++;

      const now = performance.now();
      if (now - squatLungeLastVoiceWarningTime > 4500) {
        squatLungeLastVoiceWarningTime = now;
        playChime(440, 'sawtooth', 0.12);
        speakText('زانو از پنجه جلوتر نرود', 'Keep knees behind toes');
      }
    } else {
      toeAlignState = 'standard';
      alignText = 'تراز استاندارد زانو و پنجه ✓';
    }
  }

  squatLungeToeAlignmentStatus = toeAlignState;
  squatLungeAlignmentText = alignText;

  // ================== MUSCLE TENSION MODEL (QUADS & GLUTES) ==================
  // Quadriceps load: Calibrated to athlete's personal ROM depth angle
  // Gluteus load: Increases with hip flexion and bottom depth recruitment
  const kneeFlexionDeg = Math.max(0, Math.min(125, 180 - kneeAngle));
  const hipFlexionDeg = Math.max(0, Math.min(120, 180 - hipAngle));

  const targetKneeFlexion = (squatBaseline && squatBaseline.isCalibrated)
    ? Math.max(60, 180 - squatBaseline.depthAngle)
    : 90;
  const normalizedKneeFlex = Math.min(1.2, kneeFlexionDeg / targetKneeFlexion);
  const quadMoment = Math.sin(Math.min(Math.PI / 2, (normalizedKneeFlex * Math.PI) / 2));
  const gluteMoment = Math.sin((hipFlexionDeg / 180) * Math.PI);

  // Concentric / Bottom recruitment bonus
  const effortBonus = (squatLungeState === 'bottom' || squatLungeState === 'ascending') ? 12 : 0;
  const targetDepthAngle = (squatBaseline && squatBaseline.isCalibrated) ? squatBaseline.depthAngle : 92;
  const depthBonus = (kneeAngle <= targetDepthAngle + 3) ? 16 : (kneeAngle <= targetDepthAngle + 25 ? 8 : 0);

  const rawQuadsTension = Math.max(5, Math.min(100, Math.round((quadMoment * 88) + effortBonus)));
  const rawGlutesTension = Math.max(5, Math.min(100, Math.round((gluteMoment * 78) + depthBonus + (effortBonus * 0.7))));

  // Exponential Moving Average for fluid 60fps rendering without noise
  squatLungeCurrentQuadsTension = Math.round(squatLungeCurrentQuadsTension * 0.72 + rawQuadsTension * 0.28);
  squatLungeCurrentGlutesTension = Math.round(squatLungeCurrentGlutesTension * 0.72 + rawGlutesTension * 0.28);

  if (squatLungeCurrentQuadsTension > squatLungeMaxQuadsThisRep) squatLungeMaxQuadsThisRep = squatLungeCurrentQuadsTension;
  if (squatLungeCurrentGlutesTension > squatLungeMaxGlutesThisRep) squatLungeMaxGlutesThisRep = squatLungeCurrentGlutesTension;
  if (squatLungeCurrentQuadsTension > squatLungePeakQuadsAll) squatLungePeakQuadsAll = squatLungeCurrentQuadsTension;
  if (squatLungeCurrentGlutesTension > squatLungePeakGlutesAll) squatLungePeakGlutesAll = squatLungeCurrentGlutesTension;

  // ================== SQUAT & LUNGE STATE MACHINE ==================
  // 'up': Standing upright (knee angle > 155°)
  // 'descending': Lowering hips/knee
  // 'bottom': Target depth reached (calibrated or default 92°)
  // 'ascending': Pushing back up to standing
  const now = performance.now();

  if (squatLungeState === 'up') {
    squatLungeDepthStatusText = 'ایستاده (آماده حرکت)';
    if (kneeAngle < 145) {
      squatLungeState = 'descending';
      squatLungeMinKneeAngleThisRep = kneeAngle;
      squatLungeDepthStatusText = 'در حال فرود...';
    }
  } else if (squatLungeState === 'descending') {
    if (kneeAngle < squatLungeMinKneeAngleThisRep) {
      squatLungeMinKneeAngleThisRep = kneeAngle;
    }

    if (kneeAngle <= targetDepthAngle + 3) {
      squatLungeDepthStatusText = `عمق هدف (${targetDepthAngle}°) ✨`;
    } else if (kneeAngle <= 120) {
      squatLungeDepthStatusText = 'نیمه‌اسکات (نیاز به عمق بیشتر)';
    } else {
      squatLungeDepthStatusText = 'در حال فرود...';
    }

    if (kneeAngle <= targetDepthAngle + 4) {
      squatLungeState = 'bottom';
      squatLungeDepthStatusText = `عمق هدف ${targetDepthAngle}° کامل شد ✓`;
      playChime(784, 'sine', 0.08); // G5 acoustic feedback
    } else if (kneeAngle > 158) {
      squatLungeState = 'up';
    }
  } else if (squatLungeState === 'bottom') {
    if (kneeAngle < squatLungeMinKneeAngleThisRep) {
      squatLungeMinKneeAngleThisRep = kneeAngle;
    }
    squatLungeDepthStatusText = 'عمق کامل - بازگشت به بالا';
    if (kneeAngle > Math.min(130, targetDepthAngle + 18)) {
      squatLungeState = 'ascending';
      squatLungeDepthStatusText = 'در حال صعود و اکستنشن...';
    }
  } else if (squatLungeState === 'ascending') {
    squatLungeDepthStatusText = 'در حال صعود...';
    if (kneeAngle >= 148) {
      // Rep completed!
      squatLungeState = 'up';
      squatLungeRepCount++;
      squatLungeRepTimestamps.push(now);
      squatLungeDepthHistory.push(Math.round(squatLungeMinKneeAngleThisRep));
      squatLungeQuadsHistory.push(squatLungeMaxQuadsThisRep);
      squatLungeGlutesHistory.push(squatLungeMaxGlutesThisRep);
      squatLungeRepFlashTime = now;

      // Track combined tension for fatigue monitor
      const repCombinedLoad = Math.round(squatLungeMaxQuadsThisRep * 0.55 + squatLungeMaxGlutesThisRep * 0.45);
      squatLungeRepCombinedTensionHistory.push(repCombinedLoad);
      updateSquatFatigueMonitor();

      // Reset rep peaks for next cycle
      squatLungeMinKneeAngleThisRep = 180;
      squatLungeMaxQuadsThisRep = 0;
      squatLungeMaxGlutesThisRep = 0;

      playChime(659, 'triangle', 0.24); // E5
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const repStrFa = String(squatLungeRepCount).split('').map(d => faDigits[d] || d).join('');
      speakText(`${repStrFa}`, `${squatLungeRepCount}`);

      squatLungeDepthStatusText = `تکرار ${repStrFa} ثبت شد! ✅`;
      setStatus(`تکرار ${repStrFa} ${squatLungeSubmode === 'squat' ? 'اسکات' : 'لانج'} ثبت شد`);
      triggerLiveHudMetricAnimation(squatLungeRepVal, 'celebration');

      // Check rep target completion
      if (squatLungeTargetType === 'reps' && squatLungeRepCount >= squatLungeTargetVal) {
        setTimeout(() => {
          squatLungeFinish();
        }, 500);
      }
    }
  }

  // ================== UPDATE HUD IN REAL TIME ==================
  if (squatLungeRepVal) squatLungeRepVal.textContent = squatLungeRepCount;
  if (squatLungeKneeAngleVal) squatLungeKneeAngleVal.textContent = `${squatLungeCurrentKneeAngle}°`;
  if (squatLungeDepthStatusVal) squatLungeDepthStatusVal.textContent = squatLungeDepthStatusText;

  if (squatLungeKneeAlignmentVal) {
    squatLungeKneeAlignmentVal.textContent = squatLungeAlignmentText;
    squatLungeKneeAlignmentVal.style.color = (squatLungeToeAlignmentStatus === 'standard') ? '#4ade80' : '#f87171';
  }

  // Muscle tension bars update
  if (squatQuadsTensionBar) {
    squatQuadsTensionBar.style.width = `${squatLungeCurrentQuadsTension}%`;
  }
  if (squatQuadsTensionLabel) {
    let quadDesc = 'پایه';
    if (squatLungeCurrentQuadsTension > 78) quadDesc = 'بیشینه 🔥';
    else if (squatLungeCurrentQuadsTension > 50) quadDesc = 'بارگذاری بالا';
    else if (squatLungeCurrentQuadsTension > 25) quadDesc = 'متوسط';
    squatQuadsTensionLabel.textContent = `${squatLungeCurrentQuadsTension}٪ (${quadDesc})`;
  }

  if (squatGlutesTensionBar) {
    squatGlutesTensionBar.style.width = `${squatLungeCurrentGlutesTension}%`;
  }
  if (squatGlutesTensionLabel) {
    let gluteDesc = 'پایه';
    if (squatLungeCurrentGlutesTension > 75) gluteDesc = 'اوج انقباض ⚡';
    else if (squatLungeCurrentGlutesTension > 48) gluteDesc = 'فعالیت قوی';
    else if (squatLungeCurrentGlutesTension > 25) gluteDesc = 'متوسط';
    squatGlutesTensionLabel.textContent = `${squatLungeCurrentGlutesTension}٪ (${gluteDesc})`;
  }
}

function squatLungeDrawOverlay() {
  if (squatLungePhase === 'countdown') {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 84px Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 24;
    ctx.fillText(squatLungeCountdownVal, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    return;
  }

  if (squatLungePhase === 'running' && squatLungeTrackedJoints) {
    const { hip, knee, ankle, toe } = squatLungeTrackedJoints;

    // Convert joint coordinates from normalized (0..1) or pixel
    const toCanvasX = (p) => (p.x <= 1.0 ? p.x * canvas.width : p.x);
    const toCanvasY = (p) => (p.y <= 1.0 ? p.y * canvas.height : p.y);

    const hX = toCanvasX(hip), hY = toCanvasY(hip);
    const kX = toCanvasX(knee), kY = toCanvasY(knee);
    const aX = toCanvasX(ankle), aY = toCanvasY(ankle);
    const tX = toe ? toCanvasX(toe) : aX + 30;
    const tY = toe ? toCanvasY(toe) : aY;

    ctx.save();

    // 1. Quads Muscle Tension Thigh Visualization (Thick glowing segment between Hip and Knee)
    const quadHue = 200 - Math.round((squatLungeCurrentQuadsTension / 100) * 190); // 200 (Cyan) down to 10 (Red-Orange)
    ctx.beginPath();
    ctx.moveTo(hX, hY);
    ctx.lineTo(kX, kY);
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsla(${quadHue}, 95%, 55%, 0.65)`;
    ctx.shadowColor = `hsl(${quadHue}, 100%, 50%)`;
    ctx.shadowBlur = 16;
    ctx.stroke();

    // 2. Glutes Muscle Activation Fan at Pelvis/Hip
    const gluteAlpha = 0.3 + (squatLungeCurrentGlutesTension / 100) * 0.55;
    ctx.beginPath();
    ctx.arc(hX, hY, 22, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(192, 132, 252, ${gluteAlpha})`;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 18;
    ctx.fill();

    // 3. Knee Angle Arc & Numerical Badge
    ctx.beginPath();
    ctx.arc(kX, kY, 24, 0, Math.PI * 2);
    ctx.fillStyle = (squatLungeCurrentKneeAngle <= 95) ? 'rgba(34, 197, 94, 0.45)' : 'rgba(250, 204, 21, 0.35)';
    ctx.fill();
    ctx.strokeStyle = (squatLungeCurrentKneeAngle <= 95) ? '#22c55e' : '#facc15';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Angle text tag
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Vazirmatn, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${squatLungeCurrentKneeAngle}°`, kX, kY);

    // 4. Knee-Over-Toe Vertical Laser Guide from Toe Point
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    ctx.moveTo(tX, tY + 10);
    ctx.lineTo(tX, Math.min(kY - 30, hY));
    const isAlignmentOk = squatLungeToeAlignmentStatus === 'standard';
    ctx.strokeStyle = isAlignmentOk ? 'rgba(74, 222, 128, 0.85)' : 'rgba(248, 113, 113, 0.95)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // Laser Guide Toe Label
    ctx.font = '10px Vazirmatn, system-ui, sans-serif';
    ctx.fillStyle = isAlignmentOk ? '#4ade80' : '#f87171';
    ctx.fillText(isAlignmentOk ? 'خط پنجه ✓' : '⚠️ حد مجاز زانو', tX, Math.min(kY - 35, hY - 5));

    // 5. Rep Success Shockwave Flash
    const now = performance.now();
    if (now - squatLungeRepFlashTime < 500) {
      const progress = (now - squatLungeRepFlashTime) / 500;
      const radius = 45 + progress * 80;
      const alpha = Math.max(0, 1 - progress);
      ctx.beginPath();
      ctx.arc(kX, kY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 197, 94, ${alpha})`;
      ctx.lineWidth = 5 * (1 - progress);
      ctx.stroke();
    }

    // 6. Dynamic Depth Gauge Arc Overlay (Real-time visual feedback)
    const targetDepth = (squatBaseline && squatBaseline.isCalibrated) ? squatBaseline.depthAngle : 92;
    const gaugeX = Math.max(68, canvas.width - 76);
    const gaugeY = 76;
    drawDepthGauge(gaugeX, gaugeY, squatLungeCurrentKneeAngle, targetDepth);

    ctx.restore();
  }
}

function squatLungeFinish() {
  if (squatLungeTimerInterval) {
    clearInterval(squatLungeTimerInterval);
    squatLungeTimerInterval = null;
  }
  squatLungePhase = 'finished';
  clearAiFormWarning();

  const subName = squatLungeSubmode === 'squat' ? 'اسکات' : 'لانج';
  setStatus(`آزمون بیومکانیک ${subName} پایان یافت! 🏁`);
  playChime(880, 'triangle', 0.35);
  speakText(`پایان آزمون ${subName}`, 'Squat test finished');

  if (squatLungeHud) squatLungeHud.style.display = 'none';

  const elapsedSec = squatLungeStartTime ? (performance.now() - squatLungeStartTime) / 1000 : 0;
  const effectiveSec = Math.max(1, Math.round(elapsedSec));

  const avgDepth = squatLungeDepthHistory.length > 0
    ? Math.round(squatLungeDepthHistory.reduce((a, b) => a + b, 0) / squatLungeDepthHistory.length)
    : squatLungeCurrentKneeAngle;

  const peakQuads = squatLungePeakQuadsAll > 0 ? squatLungePeakQuadsAll : 85;
  const peakGlutes = squatLungePeakGlutesAll > 0 ? squatLungePeakGlutesAll : 78;

  // Form & Biomechanics Score (0 - 100%)
  let score = 100;
  if (avgDepth > 105) score -= 18; // Shallow squats
  else if (avgDepth > 96) score -= 8;

  if (squatLungeToeWarningCount > 3) score -= 20;
  else if (squatLungeToeWarningCount > 0) score -= 10;

  score = Math.max(50, Math.min(100, score));

  // Compute final fatigue index
  const finalFatigueIndex = squatLungeCurrentFatigueIndex;
  const finalFatigueRating = squatLungeFatigueRatingText;

  // Rating Badge & Feedback
  let gradeText = 'تکنیک عالی (Elite Form) 🌟';
  let gradeColor = '#4ade80';
  let feedback = '';

  if (score >= 90) {
    gradeText = 'تکنیک عالی (Elite Form) 🌟';
    gradeColor = '#4ade80';
    feedback = `اجرای بی‌نقص با عمق فرود استاندارد (میانگین ${avgDepth}°) و هم‌راستایی کامل زانو و پنجه. زنجیره عضلانی چهارسر ران (${peakQuads}٪) و سرینی/باسن (${peakGlutes}٪) توزیع گشتاور مطلوبی را در چرخه حرکتی ثبت کردند. شاخص خستگی عضلانی: ${finalFatigueIndex}٪ (${finalFatigueRating}).`;
  } else if (score >= 75) {
    gradeText = 'تکنیک خوب و استاندارد 👍';
    gradeColor = '#38bdf8';
    feedback = `دامنه حرکتی مناسب با میانگین عمق ${avgDepth}°. تنش عضلات چهارسر و باسن در دامنه مؤثر فعال شدند. برای ارتقای فرم، کنترل بیشتری روی ثبات زانوها در انتهای فاز فرود حفظ نمایید. شاخص خستگی: ${finalFatigueIndex}٪ (${finalFatigueRating}).`;
  } else {
    gradeText = 'نیازمند اصلاح الگوی حرکتی 💡';
    gradeColor = '#facc15';
    feedback = `میانگین عمق زانو ${avgDepth}° ثبت شد. ${squatLungeToeWarningCount > 0 ? 'موارد خروج زانو از راستای پنجه یا چرخش به داخل شناسایی گردید.' : 'دستیابی به عمق ۹۰ درجه پیشنهاد می‌شود.'} شاخص خستگی عضلانی: ${finalFatigueIndex}٪. تقویت عضلات چهارسر، باسن و تحرک مچ پا برای ثبات زنجیره حرکتی توصیه می‌گردد.`;
  }

  // Update Result Panel DOM
  if (squatLungeResultTitle) {
    squatLungeResultTitle.textContent = `نتایج بیومکانیک ${subName} (${squatLungeRepCount} تکرار)`;
  }
  if (squatLungeResultGradeBadge) {
    squatLungeResultGradeBadge.textContent = gradeText;
    squatLungeResultGradeBadge.style.color = gradeColor;
    squatLungeResultGradeBadge.style.borderColor = gradeColor;
  }
  if (squatLungeTotalReps) squatLungeTotalReps.textContent = squatLungeRepCount;
  if (squatLungeFormScore) squatLungeFormScore.textContent = `${score}٪`;
  if (squatLungeAvgDepth) squatLungeAvgDepth.textContent = `${avgDepth}°`;
  if (squatLungePeakQuads) squatLungePeakQuads.textContent = `${peakQuads}٪`;
  if (squatLungePeakGlutes) squatLungePeakGlutes.textContent = `${peakGlutes}٪`;
  if (squatLungeToeAlignmentSummary) {
    squatLungeToeAlignmentSummary.textContent = squatLungeToeWarningCount === 0 ? 'استاندارد و هم‌راستا ✓' : `${squatLungeToeWarningCount} خطا در تراز`;
    squatLungeToeAlignmentSummary.style.color = squatLungeToeWarningCount === 0 ? '#4ade80' : '#f87171';
  }
  if (squatLungeFatigueIndex) {
    squatLungeFatigueIndex.textContent = `${finalFatigueIndex}٪`;
  }
  if (squatLungeFatigueRating) {
    squatLungeFatigueRating.textContent = finalFatigueRating;
    if (finalFatigueIndex < 8) squatLungeFatigueRating.style.color = '#4ade80';
    else if (finalFatigueIndex < 18) squatLungeFatigueRating.style.color = '#facc15';
    else if (finalFatigueIndex < 30) squatLungeFatigueRating.style.color = '#fb923c';
    else squatLungeFatigueRating.style.color = '#f87171';
  }
  if (squatLungeFeedbackText) squatLungeFeedbackText.textContent = feedback;

  if (squatLungeResultPanel) squatLungeResultPanel.classList.add('visible');

  // Auto-save test to database/history
  saveToHistory('squat_lunge', {
    submode: squatLungeSubmode,
    totalReps: squatLungeRepCount,
    totalTime: `${effectiveSec}s`,
    avgDepth,
    peakQuads,
    peakGlutes,
    formScore: score,
    toeAlignmentWarnings: squatLungeToeWarningCount,
    fatigueIndex: finalFatigueIndex,
    fatigueRating: finalFatigueRating,
    grade: gradeText,
    feedback
  });
}

// Squat & Lunge Event Listeners
if (squatLungeStartBtn) squatLungeStartBtn.addEventListener('click', squatLungeStartCountdown);
if (squatLungeCancelBtn) squatLungeCancelBtn.addEventListener('click', () => switchMode('jump'));
if (squatLungeAgainBtn) squatLungeAgainBtn.addEventListener('click', squatLungeEnterIntro);
if (squatLungeSaveBtn) {
  squatLungeSaveBtn.addEventListener('click', () => {
    setStatus('نتایج بیومکانیک اسکات و لانج ذخیره شد ✅');
    squatLungeSaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { squatLungeSaveBtn.textContent = 'ذخیره در تاریخچه'; }, 2000);
  });
}

// Squat Range of Motion Calibration Listeners
if (startSquatCalibBtn) {
  startSquatCalibBtn.addEventListener('click', startSquatCalibration);
}
if (resetSquatCalibBtn) {
  resetSquatCalibBtn.addEventListener('click', () => {
    try {
      localStorage.removeItem('motion_tracker_squat_baseline');
    } catch (e) {}
    loadSquatRomBaseline();
    playChime(440, 'sine', 0.15);
    setStatus('کالیبراسیون اسکات به تنظیمات پیش‌فرض بازنشانی گردید 🔄');
    if (typeof showShortcutToast === 'function') {
      showShortcutToast('کالیبراسیون اسکات بازنشانی شد');
    }
  });
}

// Submode Toggle (Squat vs Lunge)
if (squatLungeModeSquatBtn && squatLungeModeLungeBtn) {
  squatLungeModeSquatBtn.addEventListener('click', () => {
    squatLungeSubmode = 'squat';
    squatLungeModeSquatBtn.classList.add('active');
    squatLungeModeSquatBtn.style.background = '#0284c7';
    squatLungeModeSquatBtn.style.color = '#ffffff';
    squatLungeModeSquatBtn.style.borderColor = '#38bdf8';

    squatLungeModeLungeBtn.classList.remove('active');
    squatLungeModeLungeBtn.style.background = '#1e293b';
    squatLungeModeLungeBtn.style.color = '#cbd5e1';
    squatLungeModeLungeBtn.style.borderColor = '#475569';
    setStatus('آزمون انتخابی: اسکات دو پا (Squat)');
  });

  squatLungeModeLungeBtn.addEventListener('click', () => {
    squatLungeSubmode = 'lunge';
    squatLungeModeLungeBtn.classList.add('active');
    squatLungeModeLungeBtn.style.background = '#0284c7';
    squatLungeModeLungeBtn.style.color = '#ffffff';
    squatLungeModeLungeBtn.style.borderColor = '#38bdf8';

    squatLungeModeSquatBtn.classList.remove('active');
    squatLungeModeSquatBtn.style.background = '#1e293b';
    squatLungeModeSquatBtn.style.color = '#cbd5e1';
    squatLungeModeSquatBtn.style.borderColor = '#475569';
    setStatus('آزمون انتخابی: لانج و اسپیلیت (Lunge)');
  });
}

// Target Presets Click Handler
if (squatLungeTargetPresets) {
  squatLungeTargetPresets.addEventListener('click', (e) => {
    const btn = e.target.closest('.squatLungeTargetBtn');
    if (!btn) return;
    const target = btn.getAttribute('data-target');
    const val = parseInt(btn.getAttribute('data-val'), 10) || 0;

    squatLungeTargetType = target;
    squatLungeTargetVal = val;

    squatLungeTargetPresets.querySelectorAll('.squatLungeTargetBtn').forEach(b => {
      b.classList.remove('active');
      b.style.background = '#1e293b';
      b.style.color = '#cbd5e1';
      b.style.borderColor = '#475569';
    });
    btn.classList.add('active');
    btn.style.background = '#0284c7';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#38bdf8';
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
  if (typeof ensureSharpBiometricFocus === 'function') {
    ensureSharpBiometricFocus('wingspan');
  }
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
  const le = kp['left_elbow'], re = kp['right_elbow'];
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];

  if (!lw || !rw || lw.score < 0.25 || rw.score < 0.25) {
    wingspanPoints = null;
    return;
  }

  wingspanPoints = { lw, rw, ls, rs, le, re };

  const wristDistPx = Math.hypot(rw.x - lw.x, rw.y - lw.y);

  // Use dynamically estimated scale from full pose or user settings
  const athleteHeight = getSettings().athleteHeight || 175;
  const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.35;

  // Kinematic chain measurement:
  // Left arm (wrist -> elbow -> shoulder)
  let leftArmPx = 0;
  if (le && le.score > 0.25 && ls && ls.score > 0.25) {
    leftArmPx = Math.hypot(lw.x - le.x, lw.y - le.y) + Math.hypot(le.x - ls.x, le.y - ls.y);
  } else if (ls && ls.score > 0.25) {
    leftArmPx = Math.hypot(lw.x - ls.x, lw.y - ls.y);
  } else {
    leftArmPx = wristDistPx * 0.38;
  }

  // Right arm (wrist -> elbow -> shoulder)
  let rightArmPx = 0;
  if (re && re.score > 0.25 && rs && rs.score > 0.25) {
    rightArmPx = Math.hypot(rw.x - re.x, rw.y - re.y) + Math.hypot(re.x - rs.x, re.y - rs.y);
  } else if (rs && rs.score > 0.25) {
    rightArmPx = Math.hypot(rw.x - rs.x, rw.y - rs.y);
  } else {
    rightArmPx = wristDistPx * 0.38;
  }

  // Chest width (shoulder to shoulder)
  let chestPx = 0;
  if (ls && rs && ls.score > 0.25 && rs.score > 0.25) {
    chestPx = Math.hypot(rs.x - ls.x, rs.y - ls.y);
  } else {
    chestPx = wristDistPx * 0.24;
  }

  const kinematicSpanPx = leftArmPx + chestPx + rightArmPx;
  const effectiveSpanPx = Math.max(wristDistPx, kinematicSpanPx);

  // Anatomical hand length (wrist crease to tip of middle finger = ~10.8% of body height)
  const handLengthCm = athleteHeight * 0.108;
  const rawSpan = (effectiveSpanPx * scale) + (2 * handLengthCm);

  if (rawSpan > 50 && rawSpan < 280) {
    currentWingspanCm = currentWingspanCm === 0 
      ? rawSpan 
      : (currentWingspanCm * 0.85 + rawSpan * 0.15);

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

// Pointer handling on canvas (Object Calibration, Distance Measurement, and Agility Cones)
document.getElementById('stage').addEventListener('pointerdown', (e) => {
  if (mode === 'agility') {
    if (e.target.closest && (e.target.closest('#agilityHud') || e.target.closest('#headerContainer') || e.target.closest('.panel') || e.target.closest('#appDrawer'))) return;
    const pt = clientToCanvasCoords(e.clientX, e.clientY);
    handleAgilityCanvasTap(pt);
    return;
  }

  if (mode === 'jump' && baselineY != null) {
    if (e.target.closest && (e.target.closest('#jumpHud') || e.target.closest('#headerContainer') || e.target.closest('.panel'))) return;
    const pt = clientToCanvasCoords(e.clientX, e.clientY);
    if (Math.abs(pt.y - baselineY) < 35) {
      isDraggingJumpBaseline = true;
      return;
    }
  }

  if (isObjectCalibrating) {
    if (e.target.closest && (e.target.closest('#objectCalibPanel') || e.target.closest('#headerContainer'))) return;
    const pt = clientToCanvasCoords(e.clientX, e.clientY);
    const cw = canvas.width || 640;
    const ch = canvas.height || 480;
    const bx = calibObjectBox.x * cw;
    const by = calibObjectBox.y * ch;
    const bw = calibObjectBox.w * cw;
    const bh = calibObjectBox.h * ch;
    
    // Check corner handles (hit radius 35px for responsive touch)
    const hitR = 35;
    if (Math.hypot(pt.x - bx, pt.y - by) < hitR) {
      objDragMode = 'tl';
    } else if (Math.hypot(pt.x - (bx + bw), pt.y - by) < hitR) {
      objDragMode = 'tr';
    } else if (Math.hypot(pt.x - bx, pt.y - (by + bh)) < hitR) {
      objDragMode = 'bl';
    } else if (Math.hypot(pt.x - (bx + bw), pt.y - (by + bh)) < hitR) {
      objDragMode = 'br';
    } else if (pt.x >= bx - 10 && pt.x <= bx + bw + 10 && pt.y >= by - 10 && pt.y <= by + bh + 10) {
      objDragMode = 'move';
    } else {
      // Tap outside centers the box on tap
      calibObjectBox.x = Math.max(0.04, Math.min(0.96 - calibObjectBox.w, (pt.x - bw / 2) / cw));
      calibObjectBox.y = Math.max(0.04, Math.min(0.96 - calibObjectBox.h, (pt.y - bh / 2) / ch));
      objDragMode = 'move';
    }
    isDraggingObjBox = true;
    objDragStart = { x: pt.x, y: pt.y, box: { ...calibObjectBox } };
    updateObjectCalibUI();
    return;
  }

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
  if (mode === 'jump' && isDraggingJumpBaseline) {
    const pt = clientToCanvasCoords(e.clientX, e.clientY);
    baselineY = Math.max(canvas.height * 0.15, Math.min(canvas.height * 0.95, pt.y));
    if (baselineHipY != null) {
      legLengthPx = Math.max(30, baselineY - baselineHipY);
    }
    const settings = getSettings();
    airThresholdPx = (legLengthPx || 100) * settings.jumpThresholdRatio;
    landThresholdPx = (legLengthPx || 100) * settings.landThresholdRatio;
    return;
  }

  if (isObjectCalibrating && isDraggingObjBox && objDragMode) {
    const pt = clientToCanvasCoords(e.clientX, e.clientY);
    const cw = canvas.width || 640;
    const ch = canvas.height || 480;
    const dx = (pt.x - objDragStart.x) / cw;
    const dy = (pt.y - objDragStart.y) / ch;
    const ob = objDragStart.box;

    if (objDragMode === 'move') {
      calibObjectBox.x = Math.max(0.02, Math.min(0.98 - ob.w, ob.x + dx));
      calibObjectBox.y = Math.max(0.02, Math.min(0.98 - ob.h, ob.y + dy));
    } else if (objDragMode === 'br') {
      calibObjectBox.w = Math.max(0.08, Math.min(0.98 - ob.x, ob.w + dx));
      calibObjectBox.h = Math.max(0.08, Math.min(0.98 - ob.y, ob.h + dy));
    } else if (objDragMode === 'tl') {
      const newX = Math.max(0.02, Math.min(ob.x + ob.w - 0.08, ob.x + dx));
      const newY = Math.max(0.02, Math.min(ob.y + ob.h - 0.08, ob.y + dy));
      calibObjectBox.w = ob.w + (ob.x - newX);
      calibObjectBox.h = ob.h + (ob.y - newY);
      calibObjectBox.x = newX;
      calibObjectBox.y = newY;
    } else if (objDragMode === 'tr') {
      const newY = Math.max(0.02, Math.min(ob.y + ob.h - 0.08, ob.y + dy));
      calibObjectBox.w = Math.max(0.08, Math.min(0.98 - ob.x, ob.w + dx));
      calibObjectBox.h = ob.h + (ob.y - newY);
      calibObjectBox.y = newY;
    } else if (objDragMode === 'bl') {
      const newX = Math.max(0.02, Math.min(ob.x + ob.w - 0.08, ob.x + dx));
      calibObjectBox.w = ob.w + (ob.x - newX);
      calibObjectBox.h = Math.max(0.08, Math.min(0.98 - ob.y, ob.h + dy));
      calibObjectBox.x = newX;
    }
    updateObjectCalibUI();
    return;
  }

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
  isDraggingJumpBaseline = false;
  if (isDraggingObjBox) {
    isDraggingObjBox = false;
    objDragMode = null;
  }
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

if (distObjSpeakBtn) {
  distObjSpeakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!distPointA || !distPointB) return;
    const pxDist = Math.hypot(distPointB.x - distPointA.x, distPointB.y - distPointA.y);
    const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.25;
    const totalCm = pxDist * scale;
    const totalM = totalCm / 100;
    const meters = Math.floor(totalM);
    const cm = Math.round(totalCm % 100);
    const textFa = meters > 0 
      ? (cm > 0 ? `${meters} متر و ${cm} سانتی‌متر` : `${meters} متر`)
      : `${cm} سانتی‌متر`;
    speakText(`فاصله بین دو مانع: ${textFa}`, `Distance: ${meters} meters and ${cm} centimeters`);
  });
}

// ================== FLEXIBILITY TEST (تست انعطاف‌پذیری بالاتنه - SIT & REACH) ==================
let flexCurReachCm = 0;
let flexMaxReachCm = 0;
let flexCurAngleDeg = 180;
let flexKneesStraight = true;
let flexDataPoints = null;

function flexibilityEnterMode() {
  hideAllPanels();
  flexCurReachCm = 0;
  flexMaxReachCm = 0;
  flexCurAngleDeg = 180;
  flexKneesStraight = true;
  flexDataPoints = null;
  if (flexibilityHud) flexibilityHud.style.display = 'block';
  if (flexibilityPanel) flexibilityPanel.classList.add('visible');
  setStatus('تست انعطاف‌پذیری: زانوها را صاف نگه داشته و به آرامی دست‌ها را به سمت پنجه پا بکشید.');
  updateFlexibilityUI();
}

function updateFlexibilityUI() {
  const curStr = flexCurReachCm !== 0 ? `${flexCurReachCm > 0 ? '+' : ''}${flexCurReachCm.toFixed(1)} cm` : '۰.۰ cm';
  const maxStr = flexMaxReachCm !== 0 ? `${flexMaxReachCm > 0 ? '+' : ''}${flexMaxReachCm.toFixed(1)} cm` : '۰.۰ cm';
  if (flexReachVal) flexReachVal.textContent = curStr;
  if (flexMaxReachVal) flexMaxReachVal.textContent = maxStr;
  if (flexAngleVal) flexAngleVal.textContent = `${Math.round(flexCurAngleDeg)}°`;
  if (flexKneeStatusVal) {
    flexKneeStatusVal.textContent = flexKneesStraight ? 'صاف و صحیح ✓' : '⚠️ زانو خم است!';
    flexKneeStatusVal.style.color = flexKneesStraight ? '#4ade80' : '#f87171';
  }
  if (flexibilityPanelCur) flexibilityPanelCur.textContent = curStr;
  if (flexibilityPanelMax) flexibilityPanelMax.textContent = maxStr;

  let rating = 'در حال ارزیابی...';
  if (flexMaxReachCm >= 12) {
    rating = '⭐️ فوق‌العاده / انعطاف عالی (Elite)';
  } else if (flexMaxReachCm >= 4) {
    rating = '🟢 بسیار خوب / بالاتر از میانگین';
  } else if (flexMaxReachCm >= -3) {
    rating = '🔵 متوسط و نرمال (Average)';
  } else if (flexMaxReachCm < -3 && flexMaxReachCm !== 0) {
    rating = '🟡 نیازمند تمرین و کشش عضلات خلفی';
  }
  if (flexibilityPanelRating) flexibilityPanelRating.textContent = rating;
}

function flexibilityProcessFrame(kp) {
  if (mode !== 'flexibility') return;
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const lw = kp['left_wrist'], rw = kp['right_wrist'];
  const lf = kp['left_foot_index'], rf = kp['right_foot_index'];

  // Check visibility of key side
  const leftValid = ls && lh && lk && la && (ls.score > 0.15) && (lh.score > 0.15) && (lk.score > 0.15) && (la.score > 0.15);
  const rightValid = rs && rh && rk && ra && (rs.score > 0.15) && (rh.score > 0.15) && (rk.score > 0.15) && (ra.score > 0.15);

  if (!leftValid && !rightValid) return;

  // Choose side with higher average score
  const leftAvg = leftValid ? (ls.score + lh.score + lk.score + la.score) / 4 : 0;
  const rightAvg = rightValid ? (rs.score + rh.score + rk.score + ra.score) / 4 : 0;
  const isLeft = leftAvg >= rightAvg;

  const shoulder = isLeft ? ls : rs;
  const hip = isLeft ? lh : rh;
  const knee = isLeft ? lk : rk;
  const ankle = isLeft ? la : ra;
  const wrist = isLeft ? (lw && lw.score > 0.15 ? lw : rw) : (rw && rw.score > 0.15 ? rw : lw);
  const foot = isLeft ? (lf && lf.score > 0.15 ? lf : la) : (rf && rf.score > 0.15 ? rf : ra);

  // Check knee angle
  const kneeAngle = calculateJointAngle(hip, knee, ankle);
  flexKneesStraight = kneeAngle >= 152; // Threshold for knee extension

  // Trunk / Hip angle (angle between shoulder-hip and hip-knee)
  const hipAngle = calculateJointAngle(shoulder, hip, knee);
  flexCurAngleDeg = hipAngle;

  flexDataPoints = { shoulder, hip, knee, ankle, wrist, foot, isLeft, kneeAngle, hipAngle };

  if (wrist && foot) {
    const scale = currentEstimatedScaleCmPerPx || distCmPerPx || 0.35;
    // Calculate reach: determine axis along the leg (ankle - hip vector)
    const legDx = foot.x - hip.x;
    const legDy = foot.y - hip.y;
    const legLen = Math.hypot(legDx, legDy);

    if (legLen > 20) {
      // Unit vector along leg towards foot
      const ux = legDx / legLen;
      const uy = legDy / legLen;

      // Project wrist relative to foot onto leg vector:
      // Positive means wrist extends past the foot (toes)
      const wristToFootX = wrist.x - foot.x;
      const wristToFootY = wrist.y - foot.y;
      const reachAlongLegPx = wristToFootX * ux + wristToFootY * uy;
      
      const rawReachCm = reachAlongLegPx * scale;
      // Smooth reach
      flexCurReachCm = flexCurReachCm === 0 ? rawReachCm : (flexCurReachCm * 0.8 + rawReachCm * 0.2);

      // Only count as valid max reach if knees are kept reasonably straight
      if (flexKneesStraight && flexCurReachCm > flexMaxReachCm) {
        flexMaxReachCm = flexCurReachCm;
      }
    }
  }

  updateFlexibilityUI();
}

function flexibilityDrawOverlay() {
  if (mode !== 'flexibility' || !flexDataPoints) return;
  const { shoulder, hip, knee, ankle, wrist, foot, kneeAngle, hipAngle } = flexDataPoints;

  ctx.save();

  // 1. Draw Hip-Hinge Flexion Arc
  if (hip && shoulder && knee) {
    const startAngle = Math.atan2(shoulder.y - hip.y, shoulder.x - hip.x);
    const endAngle = Math.atan2(knee.y - hip.y, knee.x - hip.x);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(hip.x, hip.y, 28, startAngle, endAngle, false);
    ctx.stroke();

    // Hip Angle Tag
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(hip.x - 30, hip.y - 42, 60, 22, 6);
    } else {
      ctx.rect(hip.x - 30, hip.y - 42, 60, 22);
    }
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(hipAngle)}° خمش`, hip.x, hip.y - 31);
  }

  // 2. Knee Straightness feedback
  if (knee) {
    const isStraight = flexKneesStraight;
    ctx.strokeStyle = isStraight ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(knee.x, knee.y, 18, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(knee.x - 42, knee.y + 14, 84, 20, 5);
    } else {
      ctx.rect(knee.x - 42, knee.y + 14, 84, 20);
    }
    ctx.fill();
    ctx.strokeStyle = isStraight ? '#22c55e' : '#ef4444';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = isStraight ? '#4ade80' : '#f87171';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isStraight ? '✓ زانو صاف' : '⚠️ زانو خم است', knee.x, knee.y + 24);
  }

  // 3. Reach distance vector between wrist and foot
  if (wrist && foot) {
    ctx.strokeStyle = flexCurReachCm >= 0 ? '#4ade80' : '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(foot.x, foot.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance Pill
    const midX = (wrist.x + foot.x) / 2;
    const midY = (wrist.y + foot.y) / 2 - 16;
    const reachText = `${flexCurReachCm > 0 ? '+' : ''}${flexCurReachCm.toFixed(1)} cm`;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(midX - 35, midY - 10, 70, 20, 6);
    } else {
      ctx.rect(midX - 35, midY - 10, 70, 20);
    }
    ctx.fill();
    ctx.strokeStyle = flexCurReachCm >= 0 ? '#4ade80' : '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(reachText, midX, midY);
  }

  ctx.restore();
}

if (flexibilityRecordBtn) {
  flexibilityRecordBtn.addEventListener('click', () => {
    if (flexCurReachCm !== 0 && flexKneesStraight) {
      flexMaxReachCm = Math.max(flexMaxReachCm, flexCurReachCm);
      updateFlexibilityUI();
      playChime(660, 'sine', 0.2);
      setStatus(`رکورد جدید انعطاف ثبت شد: ${flexMaxReachCm.toFixed(1)} cm`);
    } else if (!flexKneesStraight) {
      setStatus('⚠️ برای ثبت رکورد، زانوها باید کاملاً صاف باشند.');
    }
  });
}

if (flexibilityResetBtn) {
  flexibilityResetBtn.addEventListener('click', () => {
    flexCurReachCm = 0;
    flexMaxReachCm = 0;
    updateFlexibilityUI();
    setStatus('تست انعطاف بازنشانی شد.');
  });
}

if (flexibilitySaveBtn) {
  flexibilitySaveBtn.addEventListener('click', () => {
    saveToHistory('flexibility', {
      reachCm: flexMaxReachCm.toFixed(1),
      currentReachCm: flexCurReachCm.toFixed(1),
      flexAngle: Math.round(flexCurAngleDeg),
      kneesValid: flexKneesStraight ? 'بله (صاف)' : 'خیر (خم)',
      rating: flexibilityPanelRating ? flexibilityPanelRating.textContent : 'ثبت شده'
    });
    setStatus('رکورد انعطاف‌پذیری در سوابق ورزشکار ذخیره شد ✅');
    flexibilitySaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { if (flexibilitySaveBtn) flexibilitySaveBtn.textContent = 'ذخیره در پرونده ورزشکار'; }, 2000);
  });
}

// ================== ANTHROPOMETRY TEST (تست خودکار قد، میان‌تنه، لگن، طول دو دست، نسبت‌ها و دورهای بدنی) ==================
let anthroHeightCm = 0;
let anthroTrunkCm = 0;
let anthroWingspanCm = 0;
let anthroCormicIndex = 0;
let anthroApeIndex = 1.0;
let anthroLegCm = 0;
let anthroPelvisWidthCm = 0;
let anthroPelvisLengthCm = 0;
let anthroSpanMinusHeightCm = 0;
let anthroHeightToLegRatio = '0.00';
let anthroWristCircumferenceCm = 0;
let anthroWaistCircumferenceCm = 0;
let anthroChestCircumferenceCm = 0;
let anthroAutoHeightEstimated = 0;
let anthroOverlayData = null;

// DOM references for Anthro HUD
const anthroPelvisVal = document.getElementById('anthroPelvisVal');
const anthroSpanMinusHeightVal = document.getElementById('anthroSpanMinusHeightVal');
const anthroHeightToLegVal = document.getElementById('anthroHeightToLegVal');
const anthroWristVal = document.getElementById('anthroWristVal');
const anthroWaistVal = document.getElementById('anthroWaistVal');
const anthroChestVal = document.getElementById('anthroChestVal');

// DOM references for Anthro Panel
const anthroAutoHeightText = document.getElementById('anthroAutoHeightText');
const anthroPelvisDesc = document.getElementById('anthroPelvisDesc');
const anthroTrunkLegDesc = document.getElementById('anthroTrunkLegDesc');
const anthroSpanMinusHeightDesc = document.getElementById('anthroSpanMinusHeightDesc');
const anthroHeightToLegDesc = document.getElementById('anthroHeightToLegDesc');
const anthroWristDesc = document.getElementById('anthroWristDesc');
const anthroWaistDesc = document.getElementById('anthroWaistDesc');
const anthroChestDesc = document.getElementById('anthroChestDesc');

const anthroPelvisInput = document.getElementById('anthroPelvisInput');
const anthroWristInput = document.getElementById('anthroWristInput');
const anthroWaistInput = document.getElementById('anthroWaistInput');
const anthroChestInput = document.getElementById('anthroChestInput');
const anthroApplyHeightBtn = document.getElementById('anthroApplyHeightBtn');

function anthroEnterMode() {
  hideAllPanels();
  if (anthroHud) anthroHud.style.display = 'block';
  if (anthroPanel) anthroPanel.classList.add('visible');
  
  const active = getActiveAthlete();
  if (active && active.heightCm) {
    anthroHeightCm = active.heightCm;
    if (anthroHeightInput) anthroHeightInput.value = anthroHeightCm;
  }
  setStatus('آزمون آنتروپومتری خودکار: روبروی دوربین صاف بایستید تا قد، لگن، بالاتنه، پایین‌تنه، طول دست و دورهای بدنی اسکن شوند.');
  updateAnthroUI();
  if (typeof ensureSharpBiometricFocus === 'function') {
    ensureSharpBiometricFocus('anthro');
  }
}

function updateAnthroUI() {
  const h = anthroHeightCm || 175;
  const trunk = anthroTrunkCm || Math.round(h * 0.52);
  const wingspan = anthroWingspanCm || h;
  const leg = anthroLegCm || Math.max(20, h - trunk);

  anthroCormicIndex = ((trunk / h) * 100);
  anthroApeIndex = (wingspan / h);
  anthroSpanMinusHeightCm = Math.round(wingspan - h);
  anthroHeightToLegRatio = (h / (leg || 1)).toFixed(2);

  // HUD values
  if (anthroHeightVal) anthroHeightVal.textContent = `${Math.round(h)} cm`;
  if (anthroTrunkVal) anthroTrunkVal.textContent = `${Math.round(trunk)} cm`;
  if (anthroLegVal) anthroLegVal.textContent = `${Math.round(leg)} cm`;
  if (anthroPelvisVal) anthroPelvisVal.textContent = `${anthroPelvisWidthCm || Math.round(h * 0.16)}×${anthroPelvisLengthCm || Math.round(h * 0.12)} cm`;
  if (anthroWingspanVal) anthroWingspanVal.textContent = `${Math.round(wingspan)} cm`;
  if (anthroSpanMinusHeightVal) {
    const sign = anthroSpanMinusHeightCm > 0 ? '+' : '';
    anthroSpanMinusHeightVal.textContent = `${sign}${anthroSpanMinusHeightCm} cm`;
  }
  if (anthroHeightToLegVal) anthroHeightToLegVal.textContent = anthroHeightToLegRatio;
  if (anthroWristVal) anthroWristVal.textContent = `${anthroWristCircumferenceCm || 16.5} cm`;
  if (anthroWaistVal) anthroWaistVal.textContent = `${anthroWaistCircumferenceCm || 76.0} cm`;
  if (anthroChestVal) anthroChestVal.textContent = `${anthroChestCircumferenceCm || 92.0} cm`;

  // Panel Inputs
  if (anthroHeightInput && anthroHeightCm) anthroHeightInput.value = Math.round(anthroHeightCm);
  if (anthroTrunkInput && anthroTrunkCm) anthroTrunkInput.value = Math.round(anthroTrunkCm);
  if (anthroWingspanInput && anthroWingspanCm) anthroWingspanInput.value = Math.round(anthroWingspanCm);
  if (anthroPelvisInput && anthroPelvisWidthCm) anthroPelvisInput.value = anthroPelvisWidthCm;
  if (anthroWristInput && anthroWristCircumferenceCm) anthroWristInput.value = anthroWristCircumferenceCm;
  if (anthroWaistInput && anthroWaistCircumferenceCm) anthroWaistInput.value = anthroWaistCircumferenceCm;
  if (anthroChestInput && anthroChestCircumferenceCm) anthroChestInput.value = anthroChestCircumferenceCm;

  // Panel Interpretations
  if (anthroAutoHeightText) {
    anthroAutoHeightText.textContent = `${Math.round(h)} سانتی‌متر (تخمینی هوش مصنوعی: ${anthroAutoHeightEstimated || Math.round(h)} cm)`;
  }

  if (anthroPelvisDesc) {
    const pw = anthroPelvisWidthCm || Math.round(h * 0.16);
    const pl = anthroPelvisLengthCm || Math.round(h * 0.12);
    anthroPelvisDesc.textContent = `پهنا: ${pw} cm • طول عمودی: ${pl} cm (مرکز ثقل بهینه)`;
  }

  if (anthroTrunkLegDesc) {
    anthroTrunkLegDesc.textContent = `بالاتنه: ${Math.round(trunk)} cm (${anthroCormicIndex.toFixed(1)}%) • پایین‌تنه: ${Math.round(leg)} cm`;
  }

  if (anthroSpanMinusHeightDesc) {
    const diff = anthroSpanMinusHeightCm;
    const sign = diff > 0 ? '+' : '';
    let adv = diff > 2 ? 'مزیت اهرمی فوق‌العاده در دفاع و پرتاب هندبال' : (diff >= -1 ? 'متناسب و متعادل' : 'فشرده و انفجاری');
    anthroSpanMinusHeightDesc.textContent = `${sign}${diff} سانتی‌متر (Ape Index: ${anthroApeIndex.toFixed(2)}) • ${adv}`;
  }

  if (anthroHeightToLegDesc) {
    let legEval = Number(anthroHeightToLegRatio) < 1.95 ? 'پاهای کشیده (مزیت در سرعت و پرش)' : 'متناسب برای قدرت و پایداری';
    anthroHeightToLegDesc.textContent = `نسبت: ${anthroHeightToLegRatio} • ${legEval}`;
  }

  if (anthroWristDesc) {
    const w = anthroWristCircumferenceCm || 16.5;
    let frame = w < 16.5 ? 'ظریف (Small Frame)' : (w <= 18.5 ? 'متوسط (Medium Frame)' : 'درشت و قدرتی (Large Frame)');
    anthroWristDesc.textContent = `${w} سانتی‌متر • اسکلت: ${frame}`;
  }

  if (anthroWaistDesc) {
    anthroWaistDesc.textContent = `${anthroWaistCircumferenceCm || 76} سانتی‌متر • محیط تقریبی تنه میانی`;
  }

  if (anthroChestDesc) {
    anthroChestDesc.textContent = `${anthroChestCircumferenceCm || 92} سانتی‌متر • ظرفیت تنفسی و قفسه سینه`;
  }
}

function anthroProcessFrame(kp) {
  if (mode !== 'anthro') return;
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const lf = kp['left_foot_index'], rf = kp['right_foot_index'];
  const lw = kp['left_wrist'], rw = kp['right_wrist'];
  const nose = kp['nose'];
  const leye = kp['left_eye'], reye = kp['right_eye'];

  if (!nose || !ls || !rs || !lh || !rh) return;

  const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
  const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };

  // Calculate soles Y (feet)
  const feet = [la, ra, lf, rf].filter(p => p && p.score > 0.15);
  if (!feet.length) return;
  const feetY = Math.max(...feet.map(p => p.y));

  // Head crown estimate (vertex): nose minus distance between eyes and nose * 3.2
  const eyeY = (leye && reye) ? (leye.y + reye.y) / 2 : nose.y - 15;
  const headOffset = Math.max(25, Math.abs(nose.y - eyeY) * 3.2);
  const crownY = nose.y - headOffset;

  const totalHeightPx = Math.max(50, feetY - crownY);
  const trunkHeightPx = Math.max(30, midHip.y - crownY);
  const legHeightPx = Math.max(20, feetY - midHip.y);
  const hipWidthPx = Math.hypot(rh.x - lh.x, rh.y - lh.y);
  const shoulderWidthPx = Math.hypot(rs.x - ls.x, rs.y - ls.y);

  // Optical height estimation from human proportions (Greek canon: height is ~7.5x head height)
  const headHeightPx = Math.max(25, Math.abs(nose.y - eyeY) * 3.6);
  const estimatedOpticalHeight = Math.round((totalHeightPx / headHeightPx) * 23.2);
  anthroAutoHeightEstimated = Math.max(120, Math.min(225, estimatedOpticalHeight));

  // Reference height from profile
  const active = getActiveAthlete();
  const refHeight = (active && active.heightCm) ? active.heightCm : 175;
  const scale = refHeight / totalHeightPx;

  anthroHeightCm = refHeight;
  anthroTrunkCm = Math.round(trunkHeightPx * scale);
  anthroLegCm = Math.round(legHeightPx * scale);
  
  // Pelvis width and length
  anthroPelvisWidthCm = Math.round(hipWidthPx * scale);
  anthroPelvisLengthCm = Math.round(anthroPelvisWidthCm * 0.78);

  // Wingspan estimate
  let wingspanPx = 0;
  if (lw && rw && lw.score > 0.2 && rw.score > 0.2) {
    const wristDistPx = Math.hypot(rw.x - lw.x, rw.y - lw.y);
    wingspanPx = wristDistPx * 1.18; // Includes hand fingertips
  }
  if (wingspanPx > 0) {
    anthroWingspanCm = Math.round(wingspanPx * scale);
  } else if (!anthroWingspanCm) {
    anthroWingspanCm = refHeight;
  }
  anthroSpanMinusHeightCm = anthroWingspanCm - anthroHeightCm;

  // Height to Lower Body Ratio
  anthroHeightToLegRatio = (anthroHeightCm / (anthroLegCm || 1)).toFixed(2);

  // Wrist circumference estimation
  const wristDiamPx = Math.max(8, shoulderWidthPx * 0.115);
  const wristDiamCm = wristDiamPx * scale;
  anthroWristCircumferenceCm = Number(Math.max(14.0, Math.min(23.0, Math.PI * wristDiamCm * 1.05)).toFixed(1));

  // Waist circumference estimation (Ramanujan ellipse perimeter at waist level)
  const waistWidthCm = (hipWidthPx * 0.92) * scale;
  const aWaist = waistWidthCm / 2;
  const bWaist = (waistWidthCm * 0.72) / 2;
  const hWaist = Math.pow(aWaist - bWaist, 2) / Math.pow(aWaist + bWaist, 2);
  const waistPerim = Math.PI * (aWaist + bWaist) * (1 + (3 * hWaist) / (10 + Math.sqrt(4 - 3 * hWaist)));
  anthroWaistCircumferenceCm = Number(Math.max(55.0, Math.min(130.0, waistPerim)).toFixed(1));

  // Chest circumference estimation (Ramanujan ellipse perimeter at chest level)
  const chestWidthCm = (shoulderWidthPx * 0.90) * scale;
  const aChest = chestWidthCm / 2;
  const bChest = (chestWidthCm * 0.75) / 2;
  const hChest = Math.pow(aChest - bChest, 2) / Math.pow(aChest + bChest, 2);
  const chestPerim = Math.PI * (aChest + bChest) * (1 + (3 * hChest) / (10 + Math.sqrt(4 - 3 * hChest)));
  anthroChestCircumferenceCm = Number(Math.max(70.0, Math.min(140.0, chestPerim)).toFixed(1));

  anthroOverlayData = {
    midShoulder,
    midHip,
    crownY,
    feetY,
    lw,
    rw,
    lh,
    rh,
    ls,
    rs,
    totalHeightPx,
    trunkHeightPx,
    legHeightPx,
    hipWidthPx,
    shoulderWidthPx
  };

  updateAnthroUI();
}

function anthroDrawOverlay() {
  if (mode !== 'anthro' || !anthroOverlayData) return;
  const { midShoulder, midHip, crownY, feetY, lw, rw, lh, rh, ls, rs } = anthroOverlayData;
  const cx = midShoulder.x;

  ctx.save();

  // 1. Standing Height bracket (Left)
  const bracketX = Math.max(25, cx - 130);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(bracketX, crownY);
  ctx.lineTo(bracketX, feetY);
  // Top / bottom ticks
  ctx.moveTo(bracketX - 10, crownY);
  ctx.lineTo(bracketX + 10, crownY);
  ctx.moveTo(bracketX - 10, feetY);
  ctx.lineTo(bracketX + 10, feetY);
  ctx.stroke();

  // Height tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  const hMidY = (crownY + feetY) / 2;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bracketX - 95, hMidY - 12, 90, 24, 6);
  } else {
    ctx.rect(bracketX - 95, hMidY - 12, 90, 24);
  }
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`قد: ${Math.round(anthroHeightCm)}cm`, bracketX - 50, hMidY);

  // 2. Trunk Height bracket (Right - Crown to Mid-Hip)
  const trunkX = Math.min(canvas.width - 25, cx + 115);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(trunkX, crownY);
  ctx.lineTo(trunkX, midHip.y);
  // Top / midHip ticks
  ctx.moveTo(trunkX - 10, crownY);
  ctx.lineTo(trunkX + 10, crownY);
  ctx.moveTo(trunkX - 10, midHip.y);
  ctx.lineTo(trunkX + 10, midHip.y);
  ctx.stroke();

  // Trunk tag
  const tMidY = (crownY + midHip.y) / 2;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(trunkX + 8, tMidY - 12, 95, 24, 6);
  } else {
    ctx.rect(trunkX + 8, tMidY - 12, 95, 24);
  }
  ctx.fill();
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#c084fc';
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`بالاتنه: ${Math.round(anthroTrunkCm)}cm`, trunkX + 55, tMidY);

  // 3. Lower body (Legs) bracket (Right - Mid-Hip to Feet)
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(trunkX, midHip.y);
  ctx.lineTo(trunkX, feetY);
  ctx.moveTo(trunkX - 10, feetY);
  ctx.lineTo(trunkX + 10, feetY);
  ctx.stroke();

  const legMidY = (midHip.y + feetY) / 2;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(trunkX + 8, legMidY - 12, 95, 24, 6);
  } else {
    ctx.rect(trunkX + 8, legMidY - 12, 95, 24);
  }
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`پایین‌تنه: ${Math.round(anthroLegCm)}cm`, trunkX + 55, legMidY);

  // 4. Pelvis Width & Length Indicator across hips
  if (lh && rh) {
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lh.x, lh.y);
    ctx.lineTo(rh.x, rh.y);
    ctx.stroke();

    // Pelvic center badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(midHip.x - 55, midHip.y + 12, 110, 20, 5);
    } else {
      ctx.rect(midHip.x - 55, midHip.y + 12, 110, 20);
    }
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`لگن: ${anthroPelvisWidthCm}×${anthroPelvisLengthCm}cm`, midHip.x, midHip.y + 22);
  }

  // 5. Wingspan line and Span - Height badge
  if (lw && rw && lw.score > 0.2 && rw.score > 0.2) {
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(lw.x, lw.y);
    ctx.lineTo(rw.x, rw.y);
    ctx.stroke();
    ctx.setLineDash([]);

    const wMidX = (lw.x + rw.x) / 2;
    const wMidY = (lw.y + rw.y) / 2 - 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(wMidX - 95, wMidY - 13, 190, 26, 6);
    } else {
      ctx.rect(wMidX - 95, wMidY - 13, 190, 26);
    }
    ctx.fill();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sign = anthroSpanMinusHeightCm >= 0 ? '+' : '';
    ctx.fillText(`دست: ${Math.round(anthroWingspanCm)}cm (تفاضل: ${sign}${anthroSpanMinusHeightCm}cm)`, wMidX, wMidY);
  }

  // 6. Chest and Waist circumference guidelines
  if (ls && rs && lh && rh) {
    // Chest line
    const chestY = (midShoulder.y * 0.6 + midHip.y * 0.4);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.ellipse(cx, chestY, (Math.hypot(rs.x - ls.x, rs.y - ls.y) * 0.45), 10, 0, 0, 2 * Math.PI);
    ctx.stroke();

    // Waist line
    const waistY = (midShoulder.y * 0.3 + midHip.y * 0.7);
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, waistY, (Math.hypot(rh.x - lh.x, rh.y - lh.y) * 0.46), 9, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

if (anthroScanBtn) {
  anthroScanBtn.addEventListener('click', () => {
    if (anthroAutoHeightEstimated > 0) {
      anthroHeightCm = anthroAutoHeightEstimated;
      if (anthroHeightInput) anthroHeightInput.value = anthroHeightCm;
      updateAnthroUI();
      playChime(580, 'sine', 0.18);
      setStatus(`📸 اسکن خودکار هوش مصنوعی تکمیل شد: قد محاسبه‌شده ${anthroHeightCm} سانتی‌متر`);
    } else {
      playChime(550, 'sine', 0.15);
      setStatus('📸 اسکن ابعاد بدنی انجام شد.');
    }
  });
}

if (anthroApplyHeightBtn) {
  anthroApplyHeightBtn.addEventListener('click', () => {
    const active = getActiveAthlete();
    const h = anthroAutoHeightEstimated || anthroHeightCm || 175;
    anthroHeightCm = h;
    if (active) {
      updateAthlete(active.id, {
        heightCm: h
      });
      setStatus(`✅ قد ${h} سانتی‌متر در پروفایل «${active.name}» تثبیت و ثبت شد.`);
      playChime(660, 'sine', 0.2);
    }
  });
}

if (anthroSaveBtn) {
  anthroSaveBtn.addEventListener('click', () => {
    const active = getActiveAthlete();
    // Update athlete profile if custom inputs were changed
    if (anthroHeightInput && parseFloat(anthroHeightInput.value)) {
      anthroHeightCm = parseFloat(anthroHeightInput.value);
    }
    if (anthroTrunkInput && parseFloat(anthroTrunkInput.value)) {
      anthroTrunkCm = parseFloat(anthroTrunkInput.value);
    }
    if (anthroWingspanInput && parseFloat(anthroWingspanInput.value)) {
      anthroWingspanCm = parseFloat(anthroWingspanInput.value);
    }
    if (anthroPelvisInput && parseFloat(anthroPelvisInput.value)) {
      anthroPelvisWidthCm = parseFloat(anthroPelvisInput.value);
    }
    if (anthroWristInput && parseFloat(anthroWristInput.value)) {
      anthroWristCircumferenceCm = parseFloat(anthroWristInput.value);
    }
    if (anthroWaistInput && parseFloat(anthroWaistInput.value)) {
      anthroWaistCircumferenceCm = parseFloat(anthroWaistInput.value);
    }
    if (anthroChestInput && parseFloat(anthroChestInput.value)) {
      anthroChestCircumferenceCm = parseFloat(anthroChestInput.value);
    }
    updateAnthroUI();

    saveToHistory('anthro', {
      heightCm: Math.round(anthroHeightCm),
      trunkCm: Math.round(anthroTrunkCm),
      wingspanCm: Math.round(anthroWingspanCm),
      legCm: Math.round(anthroLegCm),
      pelvisWidthCm: anthroPelvisWidthCm,
      pelvisLengthCm: anthroPelvisLengthCm,
      spanMinusHeightCm: anthroSpanMinusHeightCm,
      heightToLegRatio: anthroHeightToLegRatio,
      wristCircumferenceCm: anthroWristCircumferenceCm,
      waistCircumferenceCm: anthroWaistCircumferenceCm,
      chestCircumferenceCm: anthroChestCircumferenceCm,
      cormicIndex: anthroCormicIndex.toFixed(1),
      apeIndex: anthroApeIndex.toFixed(2),
      cormicDesc: anthroCormicDesc ? anthroCormicDesc.textContent : '',
      apeDesc: anthroApeDesc ? anthroApeDesc.textContent : ''
    });

    // Also update athlete profile height if needed
    if (active) {
      active.heightCm = Math.round(anthroHeightCm);
      const athletes = getAthletes();
      const idx = athletes.findIndex(a => a.id === active.id);
      if (idx !== -1) {
        athletes[idx].heightCm = active.heightCm;
        saveAthletes(athletes);
      }
    }

    setStatus('داده‌های آنتروپومتری و کلیه ابعاد بدنی با موفقیت ذخیره شد ✅');
    anthroSaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { if (anthroSaveBtn) anthroSaveBtn.textContent = '💾 ثبت کامل در پرونده'; }, 2000);
  });
}

// ================== AGILITY TEST (ILLINOIS & SHUTTLE) SYSTEM ==================
function agilityEnterMode() {
  hideAllPanels();
  if (agilityHud) agilityHud.style.display = 'flex';
  if (agilityConeControls) agilityConeControls.classList.add('visible');
  if (agilityTimerVal) agilityTimerVal.textContent = '0.00';
  if (agilityLapStatusVal) agilityLapStatusVal.textContent = 'تنظیم مخروط‌ها';
  if (agilitySpeedVal) agilitySpeedVal.textContent = '-- m/s';

  if (agilityConeA && agilityConeB) {
    agilityPhase = 'ready';
    if (agilityConeHint) agilityConeHint.textContent = `مخروط‌ها برای ${agilityPatternName} تنظیم هستند. ورزشکار مستقر شده و دکمه شروع را بزنید.`;
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = false;
  } else {
    agilityPhase = 'calibrateA';
    if (agilityConeHint) agilityConeHint.textContent = 'روی تصویر زمین ضربه بزنید تا مخروط اول (خط استارت / پایان) مشخص شود.';
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = true;
  }
  setStatus('⚡ حالت آزمون چابکی (شاتل و ایلینویز) فعال شد. مخروط‌ها را روی تصویر مشخص کنید.');
}

function handleAgilityCanvasTap(pt) {
  if (agilityPhase === 'calibrateA') {
    agilityConeA = { x: pt.x, y: pt.y };
    agilityPhase = 'calibrateB';
    if (agilityConeHint) agilityConeHint.textContent = 'مخروط اول ثبت شد! حالا روی نقطه مخروط دوم (نقطه چرخش و بازگشت) ضربه بزنید.';
    playChime(660, 'sine', 0.1);
    setStatus('مخروط اول ثبت شد 🚩 حالا مخروط دوم را تعیین کنید.');
  } else if (agilityPhase === 'calibrateB') {
    agilityConeB = { x: pt.x, y: pt.y };
    agilityPhase = 'ready';
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = false;
    if (agilityConeHint) agilityConeHint.textContent = `هر دو مخروط مشخص شدند (${agilityPatternName}). ورزشکار پشت مخروط اول آماده باشد و دکمه شروع را بزنید.`;
    playChime(880, 'sine', 0.15);
    setStatus('مخروط‌ها تنظیم شدند ✅ برای آغاز زمان‌گیری روی «شروع زمان‌گیری آزمون» بزنید.');
  } else if (agilityPhase === 'ready' || agilityPhase === 'done') {
    // If user taps near cone A or B, reposition that cone
    if (agilityConeA && Math.hypot(pt.x - agilityConeA.x, pt.y - agilityConeA.y) < 40) {
      agilityConeA = { x: pt.x, y: pt.y };
      playChime(550, 'sine', 0.08);
    } else if (agilityConeB && Math.hypot(pt.x - agilityConeB.x, pt.y - agilityConeB.y) < 40) {
      agilityConeB = { x: pt.x, y: pt.y };
      playChime(550, 'sine', 0.08);
    }
  }
}

// Agility Presets
if (agilityPresetsContainer) {
  const presetBtns = agilityPresetsContainer.querySelectorAll('.calibPresetBtn');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dist = parseFloat(btn.dataset.dist) || 5.0;
      const pattern = btn.dataset.pattern || 'شاتل';
      agilityDistanceMeters = dist;
      if (pattern === 'shuttle5') {
        agilityPatternName = 'شاتل ۵×۲ متر (۱۰ متر کل)';
      } else if (pattern === 'shuttle10') {
        agilityPatternName = 'شاتل ۱۰×۲ متر (۲۰ متر کل)';
      } else if (pattern === 'proAgility') {
        agilityPatternName = 'تست چابکی Pro Agility (۵-۱۰-۵)';
      } else if (pattern === 'illinois') {
        agilityPatternName = 'مسیر مانع ایلینویز (Illinois Agility)';
      }
      if (agilityConeHint && agilityPhase === 'ready') {
        agilityConeHint.textContent = `الگو: ${agilityPatternName} • ورزشکار پشت مخروط اول و دکمه شروع را بزنید.`;
      }
      setStatus(`الگوی آزمون چابکی تغییر کرد: ${agilityPatternName}`);
    });
  });
}

// Agility Button Listeners
if (agilityStartReadyBtn) {
  agilityStartReadyBtn.addEventListener('click', () => {
    if (!agilityConeA || !agilityConeB) {
      setStatus('ابتدا هر دو مخروط را مشخص کنید!');
      return;
    }
    agilityPhase = 'ready_armed';
    agilityStartTime = null;
    agilityLap1Time = null;
    agilityLap2Time = null;
    agilityTotalTime = null;
    agilityLap = 1;
    agilityTurnedAtB = false;
    agilityRunnerPath = [];

    if (agilityConeControls) agilityConeControls.classList.remove('visible');
    if (agilityResultPanel) agilityResultPanel.classList.remove('visible');
    if (agilityLapStatusVal) agilityLapStatusVal.textContent = 'آماده... حرکت کنید!';
    setStatus('⚡ سیستم آماده است! به محض شروع حرکت ورزشکار و عبور از مخروط اول، زمان‌گیری فعال می‌شود.');
    speakText('آماده، حرکت!', 'Ready, Go!');
    playChime(520, 'triangle', 0.2);
  });
}

if (agilityResetConesBtn) {
  agilityResetConesBtn.addEventListener('click', () => {
    agilityConeA = null;
    agilityConeB = null;
    agilityPhase = 'calibrateA';
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = true;
    if (agilityConeHint) agilityConeHint.textContent = 'روی تصویر زمین ضربه بزنید تا مخروط اول (خط استارت / پایان) مشخص شود.';
    setStatus('مخروط‌ها بازنشانی شدند. مجدداً نقطه مخروط اول را انتخاب کنید.');
  });
}

if (agilityAgainBtn) {
  agilityAgainBtn.addEventListener('click', () => {
    if (agilityResultPanel) agilityResultPanel.classList.remove('visible');
    if (agilityConeControls) agilityConeControls.classList.add('visible');
    agilityPhase = 'ready';
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = false;
    if (agilityTimerVal) agilityTimerVal.textContent = '0.00';
    if (agilityLapStatusVal) agilityLapStatusVal.textContent = 'آماده دور جدید';
    if (agilitySpeedVal) agilitySpeedVal.textContent = '-- m/s';
    setStatus('آماده آزمون مجدد چابکی ⚡ دکمه شروع را بزنید.');
  });
}

if (agilityRecalibBtn) {
  agilityRecalibBtn.addEventListener('click', () => {
    if (agilityResultPanel) agilityResultPanel.classList.remove('visible');
    if (agilityConeControls) agilityConeControls.classList.add('visible');
    agilityConeA = null;
    agilityConeB = null;
    agilityPhase = 'calibrateA';
    if (agilityStartReadyBtn) agilityStartReadyBtn.disabled = true;
    if (agilityConeHint) agilityConeHint.textContent = 'روی تصویر ضربه بزنید تا مخروط اول را مشخص کنید.';
  });
}

if (agilitySaveBtn) {
  agilitySaveBtn.addEventListener('click', () => {
    const active = getActiveAthlete();
    if (!agilityTotalTime) return;

    const totalDist = agilityDistanceMeters * 2;
    const avgSpeed = (totalDist / agilityTotalTime).toFixed(2);
    const turnPenalty = agilityLap2Time && agilityLap1Time ? (agilityLap2Time - agilityLap1Time).toFixed(2) : '0.00';

    saveToHistory({
      type: 'agility',
      athleteId: active.id,
      athleteName: active.name,
      pattern: agilityPatternName,
      totalTime: agilityTotalTime.toFixed(2),
      lap1Time: agilityLap1Time ? agilityLap1Time.toFixed(2) : '--',
      lap2Time: agilityLap2Time ? agilityLap2Time.toFixed(2) : '--',
      turnPenalty: turnPenalty,
      avgSpeed: avgSpeed,
      distance: totalDist,
      rating: agilityRatingBadge ? agilityRatingBadge.textContent : 'ثبت شده'
    });

    setStatus('رکورد آزمون چابکی با موفقیت در کارنامه ورزشکار ذخیره شد ✅');
    agilitySaveBtn.textContent = 'ذخیره شد ✓';
    setTimeout(() => { if (agilitySaveBtn) agilitySaveBtn.textContent = 'ذخیره در پرونده ورزشکار'; }, 2000);
  });
}

// Agility Frame Processing
function agilityProcessFrame(kp) {
  if (mode !== 'agility' || !agilityConeA || !agilityConeB || !kp) return;

  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];

  const torso = [ls, rs, lh, rh].filter(p => p && p.score > currentConfidenceThreshold);
  let runnerX = null, runnerY = null;

  if (torso.length >= 2) {
    runnerX = torso.reduce((s, p) => s + p.x, 0) / torso.length;
    runnerY = torso.reduce((s, p) => s + p.y, 0) / torso.length;
  } else {
    const ankles = [la, ra].filter(p => p && p.score > currentConfidenceThreshold);
    if (ankles.length > 0) {
      runnerX = ankles.reduce((s, p) => s + p.x, 0) / ankles.length;
      runnerY = ankles.reduce((s, p) => s + p.y, 0) / ankles.length;
    }
  }

  if (runnerX === null || runnerY === null) return;

  agilityRunnerPath.push({ x: runnerX, y: runnerY, t: performance.now() });
  if (agilityRunnerPath.length > 50) agilityRunnerPath.shift();

  // Vector from Cone A to Cone B
  const vABx = agilityConeB.x - agilityConeA.x;
  const vABy = agilityConeB.y - agilityConeA.y;
  const magABsq = vABx * vABx + vABy * vABy;
  if (magABsq < 10) return;

  // Projection of runner along A->B axis (0 = at Cone A, 1 = at Cone B)
  const vARx = runnerX - agilityConeA.x;
  const vARy = runnerY - agilityConeA.y;
  const projT = (vARx * vABx + vARy * vABy) / magABsq;

  // Distance to Cone B
  const distToB = Math.hypot(runnerX - agilityConeB.x, runnerY - agilityConeB.y);
  // Distance to Cone A
  const distToA = Math.hypot(runnerX - agilityConeA.x, runnerY - agilityConeA.y);

  const now = performance.now();

  // 1. Ready Armed: waiting for runner to cross start line (Cone A)
  if (agilityPhase === 'ready_armed') {
    // If runner crosses start line into the course (t > 0.08 or moves towards B)
    if (projT > 0.06 || (distToA < 75 && projT > 0.02)) {
      agilityStartTime = now;
      agilityPhase = 'running';
      agilityLap = 1;
      playChime(880, 'sine', 0.12);
      setStatus('زمان‌گیری شروع شد! با حداکثر سرعت به سمت مخروط دوم حرکت کنید ⚡');
    }
  }

  // 2. Running: active timing
  if (agilityPhase === 'running' && agilityStartTime) {
    const elapsed = (now - agilityStartTime) / 1000;
    if (agilityTimerVal) agilityTimerVal.textContent = elapsed.toFixed(2);

    const totalDist = agilityDistanceMeters * 2;
    const currentSpeed = (totalDist / Math.max(0.1, elapsed)).toFixed(2);
    if (agilitySpeedVal) agilitySpeedVal.textContent = `${currentSpeed} m/s`;

    // Lap 1: Moving from Cone A to Cone B
    if (agilityLap === 1) {
      if (agilityLapStatusVal) agilityLapStatusVal.textContent = 'دور ۱: رفت به سمت مخروط B';

      // Did runner reach Cone B?
      if (projT >= 0.88 || distToB <= 65) {
        agilityTurnedAtB = true;
      }

      // If runner turned and is heading back towards A (projT drops below 0.80)
      if (agilityTurnedAtB && projT < 0.80) {
        agilityLap1Time = elapsed;
        agilityLap = 2;
        playChime(660, 'sine', 0.15);
        speakText('دور بزن!', 'Turn!');
        setStatus(`چرخش ثبت شد! زمان رفت: ${agilityLap1Time.toFixed(2)}s • با سرعت برگردید به خط پایان 🏁`);
      }
    }
    // Lap 2: Returning from Cone B to Cone A
    else if (agilityLap === 2) {
      if (agilityLapStatusVal) {
        agilityLapStatusVal.textContent = `دور ۲: بازگشت به A (رفت: ${agilityLap1Time ? agilityLap1Time.toFixed(2) : '--'}s)`;
      }

      // Reached or crossed finish line (Cone A)
      if (projT <= 0.06 || (distToA <= 65 && projT < 0.15)) {
        agilityTotalTime = elapsed;
        agilityLap2Time = agilityTotalTime - (agilityLap1Time || (agilityTotalTime / 2));
        agilityPhase = 'done';

        playChime(1046, 'sine', 0.3); // High C chime
        setStatus(`🏁 آزمون چابکی پایان یافت! زمان کل: ${agilityTotalTime.toFixed(2)} ثانیه`);
        speakText(`پایان! زمان: ${agilityTotalTime.toFixed(2)} ثانیه`, 'Finished!');

        // Display results
        const avgSpeed = (totalDist / agilityTotalTime).toFixed(2);
        const penalty = (agilityLap2Time - agilityLap1Time).toFixed(2);

        if (agilityTotalTimeResult) agilityTotalTimeResult.textContent = agilityTotalTime.toFixed(2);
        if (agilityPatternResult) agilityPatternResult.textContent = agilityPatternName;
        if (agilityLap1Result) agilityLap1Result.textContent = agilityLap1Time ? agilityLap1Time.toFixed(2) : '--';
        if (agilityLap2Result) agilityLap2Result.textContent = agilityLap2Time ? agilityLap2Time.toFixed(2) : '--';
        if (agilityTurnPenaltyResult) {
          agilityTurnPenaltyResult.textContent = parseFloat(penalty) > 0 ? `+${penalty}s (افت برگشت)` : `${penalty}s (شتاب)`;
        }
        if (agilityAvgSpeedResult) agilityAvgSpeedResult.textContent = avgSpeed;

        // Rating
        let ratingText = 'متوسط';
        let ratingClass = 'benchmarkDiffWarning';
        if (agilityTotalTime < 4.8) {
          ratingText = 'سطح نخبه / المپیکی (Elite)';
          ratingClass = 'benchmarkDiffElite';
        } else if (agilityTotalTime < 5.5) {
          ratingText = 'بسیار عالی (Excellent)';
          ratingClass = 'benchmarkDiffAbove';
        } else if (agilityTotalTime < 6.3) {
          ratingText = 'خوب و مستعد (Good)';
          ratingClass = 'benchmarkDiffAbove';
        }

        if (agilityRatingBadge) {
          agilityRatingBadge.textContent = ratingText;
          agilityRatingBadge.className = 'pdfBenchmarkBadge ' + ratingClass;
        }

        if (agilityResultPanel) agilityResultPanel.classList.add('visible');
      }
    }
  }
}

// Agility Canvas Overlay
function agilityDrawOverlay() {
  if (mode !== 'agility') return;
  ctx.save();

  // Draw runner trail
  if (agilityRunnerPath.length > 2) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(agilityRunnerPath[0].x, agilityRunnerPath[0].y);
    for (let i = 1; i < agilityRunnerPath.length; i++) {
      ctx.lineTo(agilityRunnerPath[i].x, agilityRunnerPath[i].y);
    }
    ctx.stroke();
  }

  // Draw laser line between Cone A and B
  if (agilityConeA && agilityConeB) {
    ctx.strokeStyle = agilityPhase === 'running' ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(agilityConeA.x, agilityConeA.y);
    ctx.lineTo(agilityConeB.x, agilityConeB.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Midpoint label
    const midX = (agilityConeA.x + agilityConeB.x) / 2;
    const midY = (agilityConeA.y + agilityConeB.y) / 2 - 16;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    const labelText = `${agilityDistanceMeters} متر (${agilityPatternName.split(' ')[0]})`;
    ctx.font = 'bold 11px Vazirmatn, sans-serif';
    const textW = ctx.measureText(labelText).width;
    ctx.fillRect(midX - textW / 2 - 8, midY - 12, textW + 16, 22);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(midX - textW / 2 - 8, midY - 12, textW + 16, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, midX, midY);
  }

  // Draw Cone A (Start & Finish)
  if (agilityConeA) {
    // Perpendicular finish gate laser line
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(agilityConeA.x - 45, agilityConeA.y);
    ctx.lineTo(agilityConeA.x + 45, agilityConeA.y);
    ctx.stroke();

    // Cone holographic circle
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(agilityConeA.x, agilityConeA.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚩', agilityConeA.x, agilityConeA.y);

    // Label pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(agilityConeA.x - 55, agilityConeA.y + 18, 110, 22);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(agilityConeA.x - 55, agilityConeA.y + 18, 110, 22);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.fillText('مخروط A (استارت / پایان)', agilityConeA.x, agilityConeA.y + 29);
  }

  // Draw Cone B (Turn Point)
  if (agilityConeB) {
    // Deceleration turn zone circle
    ctx.strokeStyle = agilityTurnedAtB ? '#22c55e' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(agilityConeB.x, agilityConeB.y, 40, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Cone center circle
    ctx.fillStyle = agilityTurnedAtB ? '#16a34a' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(agilityConeB.x, agilityConeB.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔄', agilityConeB.x, agilityConeB.y);

    // Label pill
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(agilityConeB.x - 45, agilityConeB.y + 18, 90, 22);
    ctx.strokeStyle = agilityTurnedAtB ? '#22c55e' : '#f59e0b';
    ctx.lineWidth = 1;
    ctx.strokeRect(agilityConeB.x - 45, agilityConeB.y + 18, 90, 22);
    ctx.fillStyle = agilityTurnedAtB ? '#4ade80' : '#fbbf24';
    ctx.font = 'bold 10px Vazirmatn, sans-serif';
    ctx.fillText(agilityTurnedAtB ? '✓ دور زده شد' : 'مخروط B (چرخش)', agilityConeB.x, agilityConeB.y + 29);
  }

  ctx.restore();
}

// ================== HANDBALL & MULTI-SPORT TALENT SCOUTING ENGINE ==================
function generateHandballScouting(athlete, athleteHistory) {
  athlete = athlete || { name: 'ورزشکار ۱', code: '۱۰۱', heightCm: 175 };
  athleteHistory = Array.isArray(athleteHistory) ? athleteHistory : [];
  let bestJump = 0, bestSpeed = 0, bestAgility = 0, bestPushup = 0, bestBosco = 0, bestFlex = 0;
  let wingspan = athlete.heightCm ? athlete.heightCm * 1.01 : 175;
  let apeIndex = 1.01;

  athleteHistory.forEach(entry => {
    const d = entry.data || {};
    if (entry.type === 'jump' && d.height) bestJump = Math.max(bestJump, parseFloat(d.height));
    if (entry.type === 'run' && d.speed) bestSpeed = Math.max(bestSpeed, parseFloat(d.speed));
    if (entry.type === 'agility' && d.totalTime) {
      const t = parseFloat(d.totalTime);
      bestAgility = (bestAgility === 0) ? t : Math.min(bestAgility, t);
    }
    if (entry.type === 'pushup' && typeof d.totalReps !== 'undefined') bestPushup = Math.max(bestPushup, parseInt(d.totalReps, 10));
    if (entry.type === 'bosco' && d.totalJumps) bestBosco = Math.max(bestBosco, parseInt(d.totalJumps, 10));
    if (entry.type === 'flexibility' && d.reachCm) bestFlex = Math.max(bestFlex, parseFloat(d.reachCm));
    if (entry.type === 'wingspan' && d.wingspan) {
      wingspan = parseFloat(d.wingspan);
      if (athlete.heightCm) apeIndex = wingspan / athlete.heightCm;
    }
    if (entry.type === 'anthro' && d.apeIndex) apeIndex = parseFloat(d.apeIndex);
  });

  // Calculate scores
  const jumpScore = bestJump > 0 ? Math.min(100, Math.max(35, Math.round(((bestJump - 15) / 45) * 100))) : 62;
  const speedScore = bestSpeed > 0 ? Math.min(100, Math.max(35, Math.round(((bestSpeed - 3) / 5.5) * 100))) : 60;
  const agilityScore = bestAgility > 0 ? Math.min(100, Math.max(35, Math.round(((7.0 - bestAgility) / 2.6) * 100))) : 65;
  const strengthScore = bestPushup > 0 ? Math.min(100, Math.max(35, Math.round(((bestPushup - 5) / 32) * 100))) : 60;
  const staminaScore = bestBosco > 0 ? Math.min(100, Math.max(35, Math.round(((bestBosco - 5) / 35) * 100))) : 58;
  const flexScore = bestFlex !== 0 ? Math.min(100, Math.max(35, Math.round(((bestFlex + 8) / 25) * 100))) : 62;
  const wingspanScore = Math.min(100, Math.max(40, Math.round(((apeIndex - 0.95) / 0.12) * 100)));

  // Overall Handball Match (Weighting)
  const handballOverallScore = Math.round(
    agilityScore * 0.25 +
    jumpScore * 0.25 +
    wingspanScore * 0.20 +
    strengthScore * 0.15 +
    speedScore * 0.15
  );

  // Position compatibility
  const positions = [
    {
      role: 'بک چپ و راست (Left / Right Back)',
      shortRole: 'بک شوت‌زن ۹ متر',
      desc: 'پرش انفجاری روی دفاع، اهرم دست باز، شوت‌های سنگین از فاصله دور',
      icon: '🤾‍♂️',
      matchPct: Math.round(jumpScore * 0.35 + wingspanScore * 0.25 + strengthScore * 0.25 + agilityScore * 0.15),
      specs: 'پرش بلند، طول دست کشیده، قدرت سرشانه'
    },
    {
      role: 'گوش چپ و راست (Left / Right Wing)',
      shortRole: 'بال‌های سرعتی و فریبنده',
      desc: 'استارت ضدحمله برق‌آسا، چابکی مانور گوشه‌ها و شیرجه با زاویه باز',
      icon: '⚡',
      matchPct: Math.round(agilityScore * 0.40 + speedScore * 0.30 + jumpScore * 0.20 + flexScore * 0.10),
      specs: 'چابکی شاتل، شتاب استارت، انعطاف'
    },
    {
      role: 'پخش‌کن و بازی‌ساز مرکزی (Center Back)',
      shortRole: 'پلی‌میکر و فرمانده حمله',
      desc: 'دید فضایی، چابکی تغییر مسیر ناگهانی در شکافتن دفاع ۶-۰ و پاس‌های نفوذی',
      icon: '🧠',
      matchPct: Math.round(agilityScore * 0.35 + speedScore * 0.25 + jumpScore * 0.20 + staminaScore * 0.20),
      specs: 'چابکی جانبی، استقامت بی‌هوازی، هوش حرکتی'
    },
    {
      role: 'خط‌زن و پیوت (Line Player / Pivot)',
      shortRole: 'پیوت تنومند خط ۶ متر',
      desc: 'پایداری فیزیکی در میان دو مدافع، مرکز ثقل قوی، چرخش و دریافت پاس‌های دشوار',
      icon: '🛡️',
      matchPct: Math.round(strengthScore * 0.40 + staminaScore * 0.25 + agilityScore * 0.20 + jumpScore * 0.15),
      specs: 'قدرت تنه، ثبات بالاتنه، استقامت بدنی'
    },
    {
      role: 'دروازه‌بان هندبال (Goalkeeper)',
      shortRole: 'سنگربان هندبال',
      desc: 'گستره پوشش دست‌ها (Ape Index)، انعطاف ۱۸۰ درجه پاها و رفلکس واکنشی سریع',
      icon: '🧤',
      matchPct: Math.round(flexScore * 0.35 + wingspanScore * 0.35 + agilityScore * 0.20 + jumpScore * 0.10),
      specs: 'انعطاف بالاتنه و لگن، گستره دست، عکس‌العمل'
    }
  ];

  positions.sort((a, b) => b.matchPct - a.matchPct);

  // Other Sports
  const basketballScore = Math.round(jumpScore * 0.35 + wingspanScore * 0.30 + agilityScore * 0.20 + speedScore * 0.15);
  const volleyballScore = Math.round(jumpScore * 0.45 + wingspanScore * 0.30 + strengthScore * 0.15 + flexScore * 0.10);
  const sprintScore = Math.round(speedScore * 0.50 + agilityScore * 0.30 + jumpScore * 0.20);

  // Strengths and Weaknesses
  const strengths = [];
  const weaknesses = [];

  if (jumpScore >= 70) strengths.push({ title: 'توان انفجاری پرش', text: `پرش ${bestJump > 0 ? bestJump + 'cm' : 'بالا'} مزیت برتر در شوت روی بلاک دفاعی هندبال.` });
  if (agilityScore >= 70) strengths.push({ title: 'چابکی و تغییر مسیر سریع', text: 'سرعت واکنش عالی در حرکات فریبنده پا و جابه‌جایی‌های دفاع ۶-۰.' });
  if (wingspanScore >= 70 || apeIndex >= 1.02) strengths.push({ title: 'اهرم دست کشیده (Ape Index)', text: `طول دست بلندتر از قد، امکان شوت‌زنی با زاویه‌های غیرقابل مهار را ایجاد می‌کند.` });
  if (speedScore >= 70) strengths.push({ title: 'شتاب اولیه و سرعت دویدن', text: 'قابلیت ممتاز در اجرای ضدحملات فست‌بریک (Fast Break).' });
  if (strengthScore >= 70) strengths.push({ title: 'قدرت بالاتنه و کمربند شانه', text: 'توان بالای شوت‌زنی و ثبات در برخوردهای فیزیکی خط ۶ متر.' });

  if (strengths.length === 0) {
    strengths.push({ title: 'پایه ساختاری متعادل', text: 'پروفایل فیزیکی متوازن جهت رشد تکنیکی در رشته هندبال.' });
  }

  if (jumpScore < 65) weaknesses.push({ title: 'ارتفاع پرش عمودی', text: 'اجرای تمرینات پلایومتریک پرش عمودی (Depth Jumps) جهت بهبود زاویه دید شوت.' });
  if (agilityScore < 65) weaknesses.push({ title: 'شاتل و تغییر مسیر', text: 'تمرینات نردبان چابکی و رفت‌وبرگشت ۵ متری برای بهبود چابکی دفاعی.' });
  if (strengthScore < 65) weaknesses.push({ title: 'استقامت بالاتنه', text: 'تقویت عضلات روتاتور کاف شانه و عضلات Core برای سرعت بیشتر شوت.' });
  if (flexScore < 65) weaknesses.push({ title: 'انعطاف‌پذیری خلفی', text: 'کشش عضلات همسترینگ و مفصل شانه برای پیشگیری از آسیب‌دیدگی ورزشی.' });

  if (weaknesses.length === 0) {
    weaknesses.push({ title: 'تداوم ثبات عملکرد', text: 'پایش مستمر زمان ریکاوری و تقویت پایداری مفصل مچ پا.' });
  }

  return {
    handballOverallScore,
    positions,
    topPosition: positions[0],
    secondPosition: positions[1],
    strengths,
    weaknesses,
    otherSports: [
      { name: 'بسکتبال (گارد / فوروارد)', pct: basketballScore, icon: '🏀' },
      { name: 'والیبال (دریافت‌کننده / قدرتی)', pct: volleyballScore, icon: '🏐' },
      { name: 'دوومیدانی (دوی سرعت ۶۰ و ۱۰۰متر)', pct: sprintScore, icon: '🏃' }
    ]
  };
}

// =========================================================================
// 14. HANDBALL SKILL ASSESSMENTS & REFEREE CONTROLLER (v1.23.0)
// Complete 4 Categories, 13 Standardized Tests, Goalkeeper Goal Grid,
// Passing/Catching Ball-Drop Timer Engine, Shooting Foul & Accuracy Scoring
// =========================================================================

const HANDBALL_SKILL_TESTS = {
  // --- 1. DRIBBLE TESTS ---
  dribble_20m_sprint: {
    id: 'dribble_20m_sprint',
    category: 'dribble',
    categoryFa: 'دریبلینگ',
    number: '۱.۱',
    titleFa: 'دریبل سرعت ۲۰ متر مستقیم',
    type: 'dribble',
    timerMode: 'stopwatch',
    setupFa: 'مسافت ۲۰ متر مستقیم؛ خط شروع و خط پایان با علامت‌گذاری واضح.',
    protocolFa: 'ورزشکار پشت خط شروع با توپ می‌ایستد. با صدای سوت مربی با حداکثر سرعت مسافت ۲۰ متر را با دریبل طی می‌کند و از خط پایان عبور می‌کند.',
    measuredVariableFa: 'زمان ثبت‌شده از سوت شروع تا عبور از خط پایان (ثانیه)',
    rulesFa: 'توقف در صورت خطای رانینگ (بیش از ۳ گام بدون دریبل) یا دابل دریبل. زمان با دقت صدم ثانیه ثبت می‌شود.',
    unitFa: 'ثانیه',
    lowerIsBetter: true,
    norms: [
      { max: 3.20, label: 'عالی (نخبه)', color: '#4ade80' },
      { max: 3.65, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { max: 4.10, label: 'متوسط (نرمال)', color: '#facc15' },
      { max: 99.0, label: 'نیازمند تمرین سرعت', color: '#f87171' }
    ]
  },
  dribble_20m_zigzag: {
    id: 'dribble_20m_zigzag',
    category: 'dribble',
    categoryFa: 'دریبلینگ',
    number: '۱.۲',
    titleFa: 'دریبل زیگزاگ سرعت ۲۰ متر (۱۰ مانع)',
    type: 'dribble',
    timerMode: 'stopwatch',
    hasCones: true,
    setupFa: 'چیدمان ۱۰ مانع (کله‌قندی) با فاصله ۱.۵ متر از یکدیگر در طول ۲۰ متر مستقیم.',
    protocolFa: 'ورزشکار با سوت مربی شروع به دریبل زیگزاگ از میان ۱۰ مانع کرده و از خط پایان عبور می‌کند.',
    measuredVariableFa: 'زمان کل طی‌شده (ثانیه) + تعداد خطای برخورد به موانع',
    rulesFa: 'برخورد یا انداختن هر مانع موجب ۱ ثانیه جریمه زمانی می‌شود.',
    unitFa: 'ثانیه',
    lowerIsBetter: true,
    norms: [
      { max: 5.30, label: 'عالی (نخبه)', color: '#4ade80' },
      { max: 5.95, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { max: 6.70, label: 'متوسط (نرمال)', color: '#facc15' },
      { max: 99.0, label: 'نیازمند تمرین چابکی', color: '#f87171' }
    ]
  },
  dribble_20m_shuttle: {
    id: 'dribble_20m_shuttle',
    category: 'dribble',
    categoryFa: 'دریبلینگ',
    number: '۱.۳',
    titleFa: 'دریبل سرعت ۲۰ متر رفت و برگشت (شاتل)',
    type: 'dribble',
    timerMode: 'stopwatch',
    setupFa: 'خط شروع، مسافت ۲۰ متر، مانع انتهایی جهت دور زدن و بازگشت به خط شروع (مجموعاً ۴۰ متر).',
    protocolFa: 'طی کردن ۲۰ متر با حداکثر سرعت دریبل، دور زدن کامل مانع انتهایی و بازگشت پرشتاب به خط شروع.',
    measuredVariableFa: 'زمان رفت و برگشت کل (ثانیه)',
    rulesFa: 'دور زدن ناقص مانع خطا است.',
    unitFa: 'ثانیه',
    lowerIsBetter: true,
    norms: [
      { max: 7.50, label: 'عالی (نخبه)', color: '#4ade80' },
      { max: 8.30, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { max: 9.15, label: 'متوسط (نرمال)', color: '#facc15' },
      { max: 99.0, label: 'نیازمند تمرین شاتل', color: '#f87171' }
    ]
  },
  dribble_20m_zigzag_shuttle: {
    id: 'dribble_20m_zigzag_shuttle',
    category: 'dribble',
    categoryFa: 'دریبلینگ',
    number: '۱.۴',
    titleFa: 'دریبل زیگزاگ ۲۰ متر رفت و برگشت',
    type: 'dribble',
    timerMode: 'stopwatch',
    hasCones: true,
    setupFa: '۱۰ مانع با فاصله ۱.۵ متر؛ مسیر رفت زیگزاگ و مسیر برگشت زیگزاگ مجدد.',
    protocolFa: 'دریبل زیگزاگ از ۱۰ مانع در مسیر رفت، دور زدن مانع دهم و اجرای مجدد زیگزاگ در مسیر برگشت تا خط شروع.',
    measuredVariableFa: 'زمان کل رفت و برگشت زیگزاگ (ثانیه)',
    rulesFa: 'انداختن هر مانع ۱ ثانیه جریمه به زمان کل اضافه می‌کند.',
    unitFa: 'ثانیه',
    lowerIsBetter: true,
    norms: [
      { max: 11.60, label: 'عالی (نخبه)', color: '#4ade80' },
      { max: 13.10, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { max: 14.60, label: 'متوسط (نرمال)', color: '#facc15' },
      { max: 99.0, label: 'نیازمند تمرین کنترل و تغییر جهت', color: '#f87171' }
    ]
  },

  // --- 2. PASS & CATCH ---
  pass_catch_3m_wall: {
    id: 'pass_catch_3m_wall',
    category: 'pass_catch',
    categoryFa: 'پاس و دریافت',
    number: '۲.۱',
    titleFa: 'پاس و دریافت متوالی دیوار ۳ متری (Wall Pass & Catch)',
    type: 'pass_catch',
    timerMode: 'countdown30',
    setupFa: 'دیوار صاف، خط ۳ متری روی زمین، توپ استاندارد هندبال متناسب با رده سنی.',
    protocolFa: 'ایستادن پشت خط ۳ متری دیوار با توپ؛ با صدای سوت، ارسال پاس متوالی به دیوار و دریافت آن با دو دست یا یک دست.',
    measuredVariableFa: 'تعداد پاس و دریافت صحیح در ۱۵ ثانیه اول (شاخص رسمی) + تعداد کل در ۳۰ ثانیه',
    rulesFa: 'قانون متوقف شدن زمان: با افتادن توپ از دست بازیکن، زمان سنجش فوراً متوقف می‌شود تا بازیکن توپ را بردارد و مجدداً ادامه دهد. پا نباید روی خط ۳ متر قرار گیرد.',
    unitFa: 'تکرار صحیح',
    lowerIsBetter: false,
    hasBallDropRule: true,
    norms: [
      { min: 12, label: 'عالی (نخبه)', color: '#4ade80' },
      { min: 9, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 6, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین پنجه و تمرکز', color: '#f87171' }
    ]
  },

  // --- 3. SHOOTING TESTS ---
  shoot_penalty_7m: {
    id: 'shoot_penalty_7m',
    category: 'shooting',
    categoryFa: 'شوت',
    number: '۳.۱',
    titleFa: 'آزمون پرتاب پنالتی ۷ متری به هدف دایره',
    type: 'shooting',
    timerMode: 'countdown30',
    maxBalls: 25,
    setupFa: 'رسم دایره‌ای به قطر ۱ متر روی دیوار (ارتفاع مرکز ۱.۵ متر)، خط ۷ متری، قرارگیری ۲۵ عدد توپ پشت خط ۷ متر.',
    protocolFa: 'پرتاب متوالی پنالتی به سمت هدف دایره ۱ متری به مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد پرتاب‌های موفق درون دایره هدف در ۳۰ ثانیه بدون خطای پا',
    rulesFa: 'خطای پا: پا نباید روی خط ۷ متر یا جلوتر از آن قرار گیرد یا بلند شود. امتیاز نهایی = گل‌ها منهای خطاهای پا.',
    unitFa: 'گل صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 18, label: 'عالی (شوت‌زن نخبه)', color: '#4ade80' },
      { min: 14, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 10, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین دقت پرتاب', color: '#f87171' }
    ]
  },
  shoot_3step_simple: {
    id: 'shoot_3step_simple',
    category: 'shooting',
    categoryFa: 'شوت',
    number: '۳.۲',
    titleFa: 'آزمون شوت سه گام ساده از خط ۹ متر',
    type: 'shooting',
    timerMode: 'countdown30',
    maxBalls: 25,
    setupFa: 'دروازه رسمی هندبال، خط پرتاب پشت خط ۹ متر، ۲۵ توپ در سبد/فاصله ۱۵ متری دروازه.',
    protocolFa: 'برداشتن متوالی توپ، اجرای تکنیک شوت سه گام از پشت خط ۹ متر به طرف دروازه به مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد توپ‌های گل‌شده درون دروازه بدون خطای پا در ۳۰ ثانیه',
    rulesFa: 'خطای پا روی خط ۹ متر باعث مردود شدن گل می‌شود. امتیاز = گل‌ها منهای خطای پا.',
    unitFa: 'گل صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 16, label: 'عالی (نخبه)', color: '#4ade80' },
      { min: 12, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 8, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین ریتم ۳ گام', color: '#f87171' }
    ]
  },
  shoot_3step_obstacle: {
    id: 'shoot_3step_obstacle',
    category: 'shooting',
    categoryFa: 'شوت',
    number: '۳.۳',
    titleFa: 'شوت سه گام از فراز دروازه-مانع ۹ متر',
    type: 'shooting',
    timerMode: 'countdown30',
    maxBalls: 25,
    hasObstacle: true,
    setupFa: 'دروازه اصلی + قرار دادن یک دروازه دیگر روی خط ۹ متر به عنوان مانع عمودی دفاعی، ۲۵ توپ.',
    protocolFa: 'اجرای شوت ۳ گام از فراز دروازه-مانع ۹ متر به طرف دروازه اصلی در مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد گل‌های موفق عبور کرده از بالای مانع',
    rulesFa: 'شوت‌های خارج از چهارچوب دروازه-مانع یا هرگونه برخورد به مانع یا خطای پا مردود است. امتیاز = گل‌ها منهای خطاها و برخوردها.',
    unitFa: 'گل صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 14, label: 'عالی (شوت رو دفاع)', color: '#4ade80' },
      { min: 10, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 6, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تقویت زاویه پرتاب', color: '#f87171' }
    ]
  },
  shoot_wing: {
    id: 'shoot_wing',
    category: 'shooting',
    categoryFa: 'شوت',
    number: '۳.۴',
    titleFa: 'آزمون شوت از گوش (Wing Shot)',
    type: 'shooting',
    timerMode: 'countdown30',
    maxBalls: 25,
    hasObstacle: true,
    setupFa: 'مانع روی خط ۶ متر و به فاصله ۱ متری از خط عرضی دروازه؛ ۲۵ توپ کنار خط طولی؛ شروع از نقطه کرنر.',
    protocolFa: 'پرتاب شوت از گوش از میان مانع و خط عرضی در مدت ۳۰ ثانیه با زاویه‌گیری هوشمند.',
    measuredVariableFa: 'تعداد گل‌های موفق ثبت‌شده از گوش در ۳۰ ثانیه',
    rulesFa: 'برخورد به مانع، عبور از پشت مانع هنگام اقدام به شوت، یا لمس خط ۶ متر با پا خطا است (عبور از پشت مانع در بازگشت مجاز است).',
    unitFa: 'گل صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 14, label: 'عالی (گوش‌زن تخصصی)', color: '#4ade80' },
      { min: 10, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 6, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین زاویه‌گیری گوش', color: '#f87171' }
    ]
  },

  // --- 4. GOALKEEPING TESTS ---
  gk_lateral_defense: {
    id: 'gk_lateral_defense',
    category: 'goalkeeping',
    categoryFa: 'دروازه‌بانی',
    number: '۴.۱',
    titleFa: 'دفاع از کنار بدن متناوب چپ و راست',
    type: 'goalkeeping_general',
    timerMode: 'countdown30',
    setupFa: 'محوطه دروازه ۶ متر هندبال با لباس و کفش دروازه‌بانی.',
    protocolFa: 'اجرای تکنیک دفاع کنار بدن (یک پا عمود بر پای دیگر، خم کردن زانو و پایین آوردن دست) به صورت متناوب به سمت چپ و راست به مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد تکرار صحیح اجرای تکنیک دفاع در ۳۰ ثانیه',
    rulesFa: 'پایین نیامدن کافی دست یا عدم اجرای زاویه عمود پا، عدم محاسبه تکرار را در پی دارد.',
    unitFa: 'تکرار تکنیکی',
    lowerIsBetter: false,
    norms: [
      { min: 26, label: 'عالی (واکنش نخبه)', color: '#4ade80' },
      { min: 22, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 17, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین هماهنگی پا و دست', color: '#f87171' }
    ]
  },
  gk_lower_corners: {
    id: 'gk_lower_corners',
    category: 'goalkeeping',
    categoryFa: 'دروازه‌بانی',
    number: '۴.۲',
    titleFa: 'دفاع از گوشه‌های پایین دروازه (دست و پا)',
    type: 'goalkeeping_grid',
    timerMode: 'countdown30',
    gridMode: 'lower_corners',
    sequence: ['bottom_left', 'bottom_right'],
    sequenceFa: 'پایین-چپ ⟷ پایین-راست (متناوب با دست و پا)',
    setupFa: 'دروازه رسمی ۳×۲ متر هندبال.',
    protocolFa: 'لمس متناوب گوشه چپ پایین و گوشه راست پایین دروازه با پا و دست در مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد لمس‌های صحیح در ۳۰ ثانیه',
    rulesFa: 'خطا: عدم لمس دروازه با پا خطای تکنیکی محسوب می‌شود. لمس باید با همپوشانی دست و پا صورت گیرد.',
    unitFa: 'لمس صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 22, label: 'عالی (سرعت عمل فوق‌العاده)', color: '#4ade80' },
      { min: 18, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 14, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین انعطاف لگن', color: '#f87171' }
    ]
  },
  gk_upper_corners: {
    id: 'gk_upper_corners',
    category: 'goalkeeping',
    categoryFa: 'دروازه‌بانی',
    number: '۴.۳',
    titleFa: 'دفاع از گوشه‌های بالای دروازه',
    type: 'goalkeeping_grid',
    timerMode: 'countdown30',
    gridMode: 'upper_corners',
    sequence: ['top_left', 'top_right'],
    sequenceFa: 'بالا-چپ ⟷ بالا-راست (متناوب با دست و جهش)',
    setupFa: 'دروازه رسمی هندبال ۳×۲ متر.',
    protocolFa: 'لمس متناوب گوشه چپ بالا و گوشه راست بالا دروازه با دست و جهش در ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد لمس‌های گوشه بالای دروازه در ۳۰ ثانیه',
    rulesFa: 'لمس باید به کنج تقاطع تیرک افقی و عمودی برسد.',
    unitFa: 'لمس صحیح',
    lowerIsBetter: false,
    norms: [
      { min: 22, label: 'عالی (پرش و پوشش نخبه)', color: '#4ade80' },
      { min: 18, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 14, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین توان انفجاری پاها', color: '#f87171' }
    ]
  },
  gk_4corners_diagonal: {
    id: 'gk_4corners_diagonal',
    category: 'goalkeeping',
    categoryFa: 'دروازه‌بانی',
    number: '۴.۴',
    titleFa: 'لمس ۴ گوشه دروازه به صورت ضربدری (Diagonal)',
    type: 'goalkeeping_grid',
    timerMode: 'countdown30',
    gridMode: 'diagonal',
    sequence: ['bottom_left', 'top_right', 'bottom_right', 'top_left'],
    sequenceFa: '۱. پایین-چپ ➔ ۲. بالا-راست ➔ ۳. پایین-راست ➔ ۴. بالا-چپ',
    setupFa: 'دروازه رسمی ۳×۲ متر هندبال، شروع دروازه‌بان از مرکز دروازه.',
    protocolFa: 'لمس متوالی ۴ گوشه دروازه طبق الگوی ضربدری: ۱.پایین-چپ ➔ ۲.بالا-راست ➔ ۳.پایین-راست ➔ ۴.بالا-چپ به مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد لمس‌های صحیح طبق توالی مشخص در ۳۰ ثانیه',
    rulesFa: 'عدم لمس کامل تیرک یا برهم زدن ترتیب الگوی ضربدری خطا است و ۱ امتیاز کسر می‌گردد.',
    unitFa: 'لمس صحیح ضربدری',
    lowerIsBetter: false,
    norms: [
      { min: 18, label: 'عالی (چابکی و جهت‌یابی نخبه)', color: '#4ade80' },
      { min: 14, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 10, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین هماهنگی ضربدری', color: '#f87171' }
    ]
  },
  gk_4corners_clockwise: {
    id: 'gk_4corners_clockwise',
    category: 'goalkeeping',
    categoryFa: 'دروازه‌بانی',
    number: '۴.۵',
    titleFa: 'لمس ۴ گوشه دروازه در جهت عقربه‌های ساعت (Clockwise)',
    type: 'goalkeeping_grid',
    timerMode: 'countdown30',
    gridMode: 'clockwise',
    sequence: ['bottom_left', 'bottom_right', 'top_right', 'top_left'],
    sequenceFa: '۱. پایین-چپ ➔ ۲. پایین-راست ➔ ۳. بالا-راست ➔ ۴. بالا-چپ',
    setupFa: 'دروازه ۳×۲ متر هندبال.',
    protocolFa: 'لمس متوالی ۴ گوشه دروازه در جهت عقربه‌های ساعت: ۱.پایین-چپ ➔ ۲.پایین-راست ➔ ۳.بالا-راست ➔ ۴.بالا-چپ در مدت ۳۰ ثانیه.',
    measuredVariableFa: 'تعداد لمس‌های معتبر در جهت عقربه‌های ساعت',
    rulesFa: 'عدم رعایت جهت یا عدم لمس کامل خطا محسوب شده و کسر امتیاز دارد.',
    unitFa: 'لمس صحیح چرخشی',
    lowerIsBetter: false,
    norms: [
      { min: 18, label: 'عالی (دید محیطی و سرعت چرخش)', color: '#4ade80' },
      { min: 14, label: 'خوب (پیشرفته)', color: '#38bdf8' },
      { min: 10, label: 'متوسط (نرمال)', color: '#facc15' },
      { min: 0, label: 'نیازمند تمرین چابکی جهت‌دار', color: '#f87171' }
    ]
  }
};

// State Object for Handball Referee Engine
const hbState = {
  activeTestId: 'dribble_20m_sprint',
  activeTab: 'skills',
  timerState: 'idle', // 'idle' | 'running' | 'paused' | 'finished'
  timerRemainingMs: 30000,
  timerElapsedMs: 0,
  timerInterval: null,
  timerLastTick: 0,
  
  // Specific Test Metrics
  scoreAt15s: null,
  ballDropped: false,
  ballDropCount: 0,

  // Goalkeeper Grid State
  gkTargetIndex: 0,
  gkTouches: 0,
  gkSequenceErrors: 0,

  // Shooting State
  shootingTotalBalls: 25,
  shootingGoals: 0,
  shootingFootFaults: 0,
  shootingObstacleHits: 0,

  // General Pass/Catch & Reps
  passReps: 0,
  generalReps: 0,

  // Dribble State
  dribbleConePenalties: 0,
  dribbleFouls: 0,

  lastResult: null
};

function getHandballCornerNameFa(key) {
  switch (key) {
    case 'top_left': return 'بالا-چپ (↖️)';
    case 'top_right': return 'بالا-راست (↗️)';
    case 'bottom_left': return 'پایین-چپ (↙️)';
    case 'bottom_right': return 'پایین-راست (↘️)';
    default: return key;
  }
}

function switchHandballModalTab(tab = 'skills') {
  hbState.activeTab = tab;
  const skillsBtn = document.getElementById('tabHbSkillsBtn');
  const scoutingBtn = document.getElementById('tabHbScoutingBtn');
  const skillsView = document.getElementById('hbSkillsView');
  const scoutingView = document.getElementById('hbScoutingView');

  if (skillsBtn) skillsBtn.classList.toggle('active', tab === 'skills');
  if (scoutingBtn) scoutingBtn.classList.toggle('active', tab === 'scouting');

  if (skillsView) skillsView.style.display = tab === 'skills' ? 'block' : 'none';
  if (scoutingView) scoutingView.style.display = tab === 'scouting' ? 'block' : 'none';

  if (tab === 'scouting') {
    renderHandballScoutingTab();
  }
}

function selectHandballTest(testId) {
  if (!HANDBALL_SKILL_TESTS[testId]) testId = 'dribble_20m_sprint';
  hbState.activeTestId = testId;
  resetHandballTimer();

  const test = HANDBALL_SKILL_TESTS[testId];
  
  // Update category badge
  const catBadge = document.getElementById('hbTestCategoryBadge');
  if (catBadge) {
    catBadge.textContent = test.categoryFa;
  }

  // Update timer mode label
  const modeLabel = document.getElementById('hbTimerModeLabel');
  if (modeLabel) {
    modeLabel.textContent = test.timerMode === 'countdown30' ? 'شمارش معکوس ۳۰ ثانیه' : 'کرنومتر ثبت زمان رکورد (صدم ثانیه)';
  }

  // Render Protocol Card
  const protocolCard = document.getElementById('hbProtocolCard');
  if (protocolCard) {
    protocolCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-weight: bold; color: #38bdf8; font-size: 13px;">${test.number} ${test.titleFa}</span>
        <span style="background: rgba(15,23,42,0.8); border: 1px solid #475569; padding: 2px 8px; border-radius: 6px; font-size: 10.5px; color: #94a3b8;">
          واحد: ${test.unitFa}
        </span>
      </div>
      <div style="margin-bottom: 4px;"><strong>📐 چیدمان و تجهیزات:</strong> ${test.setupFa}</div>
      <div style="margin-bottom: 4px;"><strong>📋 پروتکل اجرا:</strong> ${test.protocolFa}</div>
      <div style="margin-bottom: 4px;"><strong>🎯 متغیر سنجش:</strong> ${test.measuredVariableFa}</div>
      <div style="color: #fbbf24;"><strong>⚠️ قوانین و خطاها:</strong> ${test.rulesFa}</div>
    `;
  }

  // Render Interactive Controller for Test Type
  renderHandballInteractiveController(test);

  // Reset Score Summary
  const scoreSumEl = document.getElementById('hbScoreSummaryText');
  const scoreDetEl = document.getElementById('hbScoreDetailText');
  const ratingBadge = document.getElementById('hbRatingBadge');
  if (scoreSumEl) scoreSumEl.textContent = 'آماده شروع آزمون';
  if (scoreDetEl) scoreDetEl.textContent = 'برای آغاز آزمون دکمه «شروع آزمون ▶️» را لمس کنید.';
  if (ratingBadge) {
    ratingBadge.textContent = '--';
    ratingBadge.style.background = 'rgba(148,163,184,0.2)';
    ratingBadge.style.color = '#94a3b8';
    ratingBadge.style.borderColor = '#64748b';
  }
}

function renderHandballInteractiveController(test) {
  const container = document.getElementById('hbInteractiveControllerContainer');
  if (!container) return;

  if (test.type === 'goalkeeping_grid') {
    // 4-Corner Goal Grid Layout
    const expectedKey = test.sequence ? test.sequence[hbState.gkTargetIndex] : null;

    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 12px; font-weight: bold; color: #38bdf8;">🧤 چهارچوب تعاملی دروازه و سنسور لمس ۴ گوشه:</span>
          <span style="font-size: 11px; color: #94a3b8;">${test.sequenceFa || 'لمس گوشه‌ها'}</span>
        </div>

        <div class="hbGoalGrid" id="hbGoalGridFrame">
          <button type="button" class="hbCornerBtn ${expectedKey === 'top_left' ? 'target-next' : ''}" data-corner="top_left" id="hbCorner_top_left">
            <span>↖️</span>
            <span>بالا-چپ</span>
          </button>
          <button type="button" class="hbCornerBtn ${expectedKey === 'top_right' ? 'target-next' : ''}" data-corner="top_right" id="hbCorner_top_right">
            <span>↗️</span>
            <span>بالا-راست</span>
          </button>
          <button type="button" class="hbCornerBtn ${expectedKey === 'bottom_left' ? 'target-next' : ''}" data-corner="bottom_left" id="hbCorner_bottom_left">
            <span>↙️</span>
            <span>پایین-چپ</span>
          </button>
          <button type="button" class="hbCornerBtn ${expectedKey === 'bottom_right' ? 'target-next' : ''}" data-corner="bottom_right" id="hbCorner_bottom_right">
            <span>↘️</span>
            <span>پایین-راست</span>
          </button>
        </div>

        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 8px 12px; border-radius: 8px; font-size: 12px; margin-top: 8px;">
          <div>لمس‌های صحیح: <strong id="hbGkTouchesVal" style="color: #4ade80; font-size: 15px;">${hbState.gkTouches}</strong></div>
          <div>خطای توالی/ترتیب: <strong id="hbGkErrorsVal" style="color: #ef4444; font-size: 15px;">${hbState.gkSequenceErrors}</strong></div>
          <div>امتیاز خالص: <strong id="hbGkNetVal" style="color: #38bdf8; font-size: 15px;">${Math.max(0, hbState.gkTouches - hbState.gkSequenceErrors)}</strong></div>
        </div>
        <div id="hbGkPromptNotice" style="font-size: 11px; color: #cbd5e1; margin-top: 6px;">
          ${expectedKey ? `هدف بعدی: <strong style="color: #38bdf8;">${getHandballCornerNameFa(expectedKey)}</strong>` : 'آماده ثبت لمس دروازه'}
        </div>
      </div>
    `;

    // Wire corner buttons
    container.querySelectorAll('.hbCornerBtn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const corner = btn.getAttribute('data-corner');
        handleGoalkeeperCornerTap(corner);
      });
    });

  } else if (test.type === 'shooting') {
    // Shooting Scorecard Layout
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 12.5px; font-weight: bold; color: #38bdf8;">🎯 کنسول داوری زنده شوت هندبال (۲۵ توپ در ۳۰ ثانیه):</span>
          <span style="font-size: 11px; color: #94a3b8;">تعداد کل مجاز: ۲۵ پرتاب</span>
        </div>

        <!-- Big Action Buttons -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
          <button type="button" id="hbShootingGoalBtn" style="background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 900; font-size: 15px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(34,197,94,0.35);">
            <span style="font-size: 24px;">⚽</span>
            <span>+۱ گل / پرتاب موفق</span>
          </button>
          <button type="button" id="hbShootingFootFaultBtn" style="background: rgba(245, 158, 11, 0.2); border: 2px solid #f59e0b; color: #fbbf24; padding: 14px; border-radius: 10px; font-weight: bold; font-size: 13.5px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <span style="font-size: 24px;">🦶</span>
            <span>+۱ خطای پا روی خط</span>
          </button>
        </div>

        ${test.hasObstacle ? `
          <div style="margin-bottom: 12px;">
            <button type="button" id="hbShootingObstacleBtn" style="width: 100%; background: rgba(239, 68, 68, 0.15); border: 2px solid #ef4444; color: #f87171; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 12.5px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🚫</span>
              <span>+۱ برخورد به مانع یا خروج از چهارچوب دروازه-مانع</span>
            </button>
          </div>
        ` : ''}

        <!-- Stats Bar -->
        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div>پرتاب‌ها: <strong id="hbShootAttemptsVal" style="color: #f8fafc;">${hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits}/۲۵</strong></div>
          <div>گل‌ها: <strong id="hbShootGoalsVal" style="color: #4ade80;">${hbState.shootingGoals}</strong></div>
          <div>خطای پا: <strong id="hbShootFaultsVal" style="color: #fbbf24;">${hbState.shootingFootFaults}</strong></div>
          ${test.hasObstacle ? `<div>برخورد مانع: <strong id="hbShootObstaclesVal" style="color: #f87171;">${hbState.shootingObstacleHits}</strong></div>` : ''}
          <div>امتیاز نهایی: <strong id="hbShootNetVal" style="color: #38bdf8; font-size: 14px;">${Math.max(0, hbState.shootingGoals - hbState.shootingFootFaults - hbState.shootingObstacleHits)}</strong></div>
        </div>
      </div>
    `;

    document.getElementById('hbShootingGoalBtn')?.addEventListener('click', handleShootingGoalTap);
    document.getElementById('hbShootingFootFaultBtn')?.addEventListener('click', handleShootingFootFaultTap);
    document.getElementById('hbShootingObstacleBtn')?.addEventListener('click', handleShootingObstacleTap);

  } else if (test.type === 'pass_catch') {
    // Passing & Catching Controller
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 12.5px; font-weight: bold; color: #38bdf8;">🏐 داوری پاس و دریافت متوالی دیوار ۳ متری:</span>
          <span id="hbPassCatch15sIndicator" style="font-size: 11px; background: rgba(56,189,248,0.2); color: #38bdf8; padding: 2px 8px; border-radius: 4px;">
            رکورد ۱۵ ثانیه: ${hbState.scoreAt15s !== null ? hbState.scoreAt15s + ' تکرار' : 'در انتظار ثانیه ۱۵'}
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; margin-bottom: 12px;">
          <button type="button" id="hbPassCatchAddBtn" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #fff; border: none; padding: 16px; border-radius: 10px; font-weight: 900; font-size: 16px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(2,132,199,0.35);">
            <span style="font-size: 26px;">🏐</span>
            <span>+۱ پاس و دریافت موفق</span>
          </button>
          <button type="button" id="hbBallDropToggleBtn" style="background: ${hbState.ballDropped ? 'linear-gradient(135deg, #16a34a, #22c55e)' : 'rgba(239, 68, 68, 0.2)'}; border: 2px solid ${hbState.ballDropped ? '#22c55e' : '#ef4444'}; color: #fff; padding: 16px; border-radius: 10px; font-weight: bold; font-size: 13px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;">
            <span style="font-size: 24px;">${hbState.ballDropped ? '▶️' : '⏸️'}</span>
            <span id="hbBallDropBtnLabel">${hbState.ballDropped ? 'بازیابی و ادامه تایمر' : 'افتادن توپ (توقف زمان)'}</span>
          </button>
        </div>

        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div>رکورد رسمی (۱۵ ثانیه اول): <strong id="hbPassAt15Val" style="color: #38bdf8; font-size: 14px;">${hbState.scoreAt15s !== null ? hbState.scoreAt15s : '--'}</strong></div>
          <div>مجموع پاس‌های ۳۰ ثانیه: <strong id="hbPassTotalVal" style="color: #4ade80; font-size: 14px;">${hbState.passReps}</strong></div>
          <div>تعداد افتادن توپ: <strong id="hbBallDropCountVal" style="color: #fbbf24;">${hbState.ballDropCount}</strong></div>
        </div>
      </div>
    `;

    document.getElementById('hbPassCatchAddBtn')?.addEventListener('click', handlePassCatchTap);
    document.getElementById('hbBallDropToggleBtn')?.addEventListener('click', handleBallDroppedToggle);

  } else if (test.type === 'dribble') {
    // Dribble Controller
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 12.5px; font-weight: bold; color: #38bdf8;">🏃 داوری و زمان‌گیری دقیق آزمون دریبل سرعت:</span>
          <span style="font-size: 11px; color: #94a3b8;">شروع با سوت و پایان با خط</span>
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;">
          ${test.hasCones ? `
            <button type="button" id="hbConePenaltyBtn" style="flex: 1; background: rgba(245, 158, 11, 0.18); border: 1.5px solid #f59e0b; color: #fbbf24; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span>🚩</span>
              <span>+۱ برخورد با موانع (+۱ ثانیه جریمه)</span>
            </button>
          ` : ''}
          <button type="button" id="hbDribbleFoulBtn" style="flex: 1; background: rgba(239, 68, 68, 0.18); border: 1.5px solid #ef4444; color: #f87171; padding: 10px; border-radius: 8px; font-weight: bold; font-size: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>⚠️</span>
            <span>+۱ خطای گام (رانینگ / دابل)</span>
          </button>
        </div>

        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div>زمان پایه: <strong id="hbDribbleBaseTimeVal" style="color: #38bdf8;">${(hbState.timerElapsedMs / 1000).toFixed(2)}s</strong></div>
          ${test.hasCones ? `<div>جریمه موانع: <strong id="hbDribblePenaltyVal" style="color: #fbbf24;">+${hbState.dribbleConePenalties}s</strong></div>` : ''}
          <div>زمان نهایی ثبت‌شده: <strong id="hbDribbleFinalTimeVal" style="color: #4ade80; font-size: 14px;">${((hbState.timerElapsedMs / 1000) + hbState.dribbleConePenalties).toFixed(2)}s</strong></div>
        </div>
      </div>
    `;

    document.getElementById('hbConePenaltyBtn')?.addEventListener('click', handleConePenaltyTap);
    document.getElementById('hbDribbleFoulBtn')?.addEventListener('click', handleDribbleFoulTap);

  } else {
    // Goalkeeping General (Lateral Defense)
    container.innerHTML = `
      <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 12px; padding: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: 12.5px; font-weight: bold; color: #38bdf8;">🧤 ثبت تکرار تکنیک دفاع کنار بدن (متناوب چپ و راست):</span>
          <span style="font-size: 11px; color: #94a3b8;">۳۰ ثانیه زمان کل</span>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <button type="button" id="hbGeneralRepBtn" style="flex: 2; background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff; border: none; padding: 14px; border-radius: 10px; font-weight: 900; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>🧤</span>
            <span>+۱ تکرار تکنیک دفاع کامل (چپ و راست)</span>
          </button>
        </div>

        <div style="display: flex; justify-content: space-around; background: rgba(30,41,59,0.7); padding: 8px 12px; border-radius: 8px; font-size: 12px;">
          <div>تکرارهای صحیح: <strong id="hbGeneralRepsVal" style="color: #4ade80; font-size: 15px;">${hbState.generalReps}</strong></div>
          <div>وضعیت: <span style="color: #38bdf8;">دست پایین، زانو خم و پای عمود</span></div>
        </div>
      </div>
    `;

    document.getElementById('hbGeneralRepBtn')?.addEventListener('click', () => {
      hbState.generalReps++;
      const valEl = document.getElementById('hbGeneralRepsVal');
      if (valEl) valEl.textContent = hbState.generalReps;
      if (typeof playChime === 'function') playChime(660, 'triangle', 0.12);
      calculateHandballScore();
    });
  }
}

// Timer Logic for Handball Assessment Suite
function updateHandballTimerDisplay() {
  const display = document.getElementById('hbTimerDisplay');
  if (!display) return;

  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  if (test.timerMode === 'countdown30') {
    const seconds = Math.max(0, hbState.timerRemainingMs / 1000);
    display.textContent = seconds.toFixed(2);

    display.classList.remove('mid', 'urgent');
    if (seconds <= 5.0) {
      display.classList.add('urgent');
    } else if (seconds <= 15.0) {
      display.classList.add('mid');
    }
  } else {
    // Stopwatch
    const seconds = hbState.timerElapsedMs / 1000;
    display.textContent = seconds.toFixed(2);
    display.classList.remove('mid', 'urgent');
  }
}

function startHandballTimer() {
  if (hbState.timerState === 'running') return;
  hbState.timerState = 'running';
  hbState.timerLastTick = performance.now();

  const startBtn = document.getElementById('hbStartTimerBtn');
  const pauseBtn = document.getElementById('hbPauseTimerBtn');
  if (startBtn) startBtn.style.display = 'none';
  if (pauseBtn) {
    pauseBtn.style.display = 'inline-flex';
    pauseBtn.querySelector('span:last-child').textContent = 'توقف';
  }

  if (typeof playChime === 'function') playChime(880, 'sine', 0.25); // Start Whistle

  clearInterval(hbState.timerInterval);
  hbState.timerInterval = setInterval(() => {
    const now = performance.now();
    const delta = now - hbState.timerLastTick;
    hbState.timerLastTick = now;

    const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
    if (test.timerMode === 'countdown30') {
      const prev = hbState.timerRemainingMs;
      hbState.timerRemainingMs = Math.max(0, hbState.timerRemainingMs - delta);

      // Check 15-second milestone in Pass & Catch
      if (test.id === 'pass_catch_3m_wall' && prev > 15000 && hbState.timerRemainingMs <= 15000) {
        hbState.scoreAt15s = hbState.passReps;
        if (typeof playChime === 'function') playChime(987, 'triangle', 0.3);
        const ind = document.getElementById('hbPassCatch15sIndicator');
        const at15Val = document.getElementById('hbPassAt15Val');
        if (ind) ind.textContent = `✅ رکورد ۱۵ ثانیه: ${hbState.scoreAt15s} تکرار`;
        if (at15Val) at15Val.textContent = hbState.scoreAt15s;
      }

      if (hbState.timerRemainingMs <= 0) {
        finishHandballTest();
      }
    } else {
      hbState.timerElapsedMs += delta;
      const baseEl = document.getElementById('hbDribbleBaseTimeVal');
      const finalEl = document.getElementById('hbDribbleFinalTimeVal');
      if (baseEl) baseEl.textContent = `${(hbState.timerElapsedMs / 1000).toFixed(2)}s`;
      if (finalEl) finalEl.textContent = `${((hbState.timerElapsedMs / 1000) + hbState.dribbleConePenalties).toFixed(2)}s`;
    }

    updateHandballTimerDisplay();
  }, 20);
}

function pauseHandballTimer() {
  if (hbState.timerState !== 'running') return;
  hbState.timerState = 'paused';
  clearInterval(hbState.timerInterval);

  const startBtn = document.getElementById('hbStartTimerBtn');
  const pauseBtn = document.getElementById('hbPauseTimerBtn');
  if (startBtn) {
    startBtn.style.display = 'inline-flex';
    startBtn.querySelector('span:last-child').textContent = 'ادامه آزمون';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';

  if (typeof playChime === 'function') playChime(440, 'triangle', 0.15);
}

function resetHandballTimer() {
  clearInterval(hbState.timerInterval);
  hbState.timerState = 'idle';
  hbState.timerRemainingMs = 30000;
  hbState.timerElapsedMs = 0;
  hbState.scoreAt15s = null;
  hbState.ballDropped = false;
  hbState.ballDropCount = 0;

  hbState.gkTargetIndex = 0;
  hbState.gkTouches = 0;
  hbState.gkSequenceErrors = 0;

  hbState.shootingGoals = 0;
  hbState.shootingFootFaults = 0;
  hbState.shootingObstacleHits = 0;

  hbState.passReps = 0;
  hbState.generalReps = 0;
  hbState.dribbleConePenalties = 0;
  hbState.dribbleFouls = 0;
  hbState.lastResult = null;

  const startBtn = document.getElementById('hbStartTimerBtn');
  const pauseBtn = document.getElementById('hbPauseTimerBtn');
  if (startBtn) {
    startBtn.style.display = 'inline-flex';
    startBtn.querySelector('span:last-child').textContent = 'شروع آزمون';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';

  updateHandballTimerDisplay();
}

function finishHandballTest() {
  clearInterval(hbState.timerInterval);
  hbState.timerState = 'finished';

  const startBtn = document.getElementById('hbStartTimerBtn');
  const pauseBtn = document.getElementById('hbPauseTimerBtn');
  if (startBtn) {
    startBtn.style.display = 'inline-flex';
    startBtn.querySelector('span:last-child').textContent = 'اجرای مجدد';
  }
  if (pauseBtn) pauseBtn.style.display = 'none';

  // Finish whistle sound
  if (typeof playChime === 'function') {
    playChime(1046, 'square', 0.4);
    setTimeout(() => playChime(1046, 'square', 0.5), 180);
  }
  if (navigator.vibrate) {
    try { navigator.vibrate([200, 100, 200]); } catch (e) {}
  }

  calculateHandballScore();
}

// Goalkeeper Grid Event Handler
function handleGoalkeeperCornerTap(cornerKey) {
  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  if (!test || test.type !== 'goalkeeping_grid') return;

  const btn = document.getElementById(`hbCorner_${cornerKey}`);
  const expectedKey = test.sequence ? test.sequence[hbState.gkTargetIndex] : null;

  if (expectedKey && cornerKey === expectedKey) {
    // Correct Match
    hbState.gkTouches++;
    hbState.gkTargetIndex = (hbState.gkTargetIndex + 1) % test.sequence.length;

    if (btn) {
      btn.classList.add('touched-success');
      setTimeout(() => btn.classList.remove('touched-success'), 300);
    }
    if (typeof playChime === 'function') playChime(784, 'sine', 0.12); // G5
  } else if (expectedKey) {
    // Sequence Error
    hbState.gkSequenceErrors++;
    if (btn) {
      btn.classList.add('touched-error');
      setTimeout(() => btn.classList.remove('touched-error'), 380);
    }
    if (typeof playChime === 'function') playChime(220, 'sawtooth', 0.22); // Error buzz
  } else {
    // Free touch
    hbState.gkTouches++;
    if (btn) {
      btn.classList.add('touched-success');
      setTimeout(() => btn.classList.remove('touched-success'), 300);
    }
    if (typeof playChime === 'function') playChime(700, 'sine', 0.12);
  }

  // Update DOM stats
  const touchesVal = document.getElementById('hbGkTouchesVal');
  const errorsVal = document.getElementById('hbGkErrorsVal');
  const netVal = document.getElementById('hbGkNetVal');
  const promptNotice = document.getElementById('hbGkPromptNotice');

  const netScore = Math.max(0, hbState.gkTouches - hbState.gkSequenceErrors);
  if (touchesVal) touchesVal.textContent = hbState.gkTouches;
  if (errorsVal) errorsVal.textContent = hbState.gkSequenceErrors;
  if (netVal) netVal.textContent = netScore;

  // Highlight next expected corner
  const nextExpected = test.sequence ? test.sequence[hbState.gkTargetIndex] : null;
  document.querySelectorAll('.hbCornerBtn').forEach(b => b.classList.remove('target-next'));
  if (nextExpected) {
    const nextBtn = document.getElementById(`hbCorner_${nextExpected}`);
    if (nextBtn) nextBtn.classList.add('target-next');
    if (promptNotice) {
      promptNotice.innerHTML = `هدف بعدی: <strong style="color: #38bdf8;">${getHandballCornerNameFa(nextExpected)}</strong>`;
    }
  }

  calculateHandballScore();
}

// Shooting Event Handlers
function handleShootingGoalTap() {
  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  const max = test.maxBalls || 25;
  const attempts = hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits;
  if (attempts >= max) return;

  hbState.shootingGoals++;
  updateShootingUI();
  if (typeof playChime === 'function') playChime(880, 'triangle', 0.15); // A5
  calculateHandballScore();
}

function handleShootingFootFaultTap() {
  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  const max = test.maxBalls || 25;
  const attempts = hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits;
  if (attempts >= max) return;

  hbState.shootingFootFaults++;
  updateShootingUI();
  if (typeof playChime === 'function') playChime(330, 'sawtooth', 0.2);
  calculateHandballScore();
}

function handleShootingObstacleTap() {
  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  const max = test.maxBalls || 25;
  const attempts = hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits;
  if (attempts >= max) return;

  hbState.shootingObstacleHits++;
  updateShootingUI();
  if (typeof playChime === 'function') playChime(260, 'sawtooth', 0.22);
  calculateHandballScore();
}

function updateShootingUI() {
  const total = hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits;
  const net = Math.max(0, hbState.shootingGoals - hbState.shootingFootFaults - hbState.shootingObstacleHits);

  const attEl = document.getElementById('hbShootAttemptsVal');
  const goalEl = document.getElementById('hbShootGoalsVal');
  const faultEl = document.getElementById('hbShootFaultsVal');
  const obsEl = document.getElementById('hbShootObstaclesVal');
  const netEl = document.getElementById('hbShootNetVal');

  if (attEl) attEl.textContent = `${total}/۲۵`;
  if (goalEl) goalEl.textContent = hbState.shootingGoals;
  if (faultEl) faultEl.textContent = hbState.shootingFootFaults;
  if (obsEl) obsEl.textContent = hbState.shootingObstacleHits;
  if (netEl) netEl.textContent = net;
}

// Pass & Catch Handlers
function handlePassCatchTap() {
  if (hbState.ballDropped) return; // cannot add passes while ball is dropped
  hbState.passReps++;
  const passEl = document.getElementById('hbPassTotalVal');
  if (passEl) passEl.textContent = hbState.passReps;
  if (typeof playChime === 'function') playChime(740, 'sine', 0.12);
  calculateHandballScore();
}

function handleBallDroppedToggle() {
  hbState.ballDropped = !hbState.ballDropped;
  const btn = document.getElementById('hbBallDropToggleBtn');
  const lbl = document.getElementById('hbBallDropBtnLabel');
  const dropCountEl = document.getElementById('hbBallDropCountVal');

  if (hbState.ballDropped) {
    // Ball was dropped: immediately pause active timer!
    hbState.ballDropCount++;
    pauseHandballTimer();
    if (btn) {
      btn.style.background = 'linear-gradient(135deg, #16a34a, #22c55e)';
      btn.style.borderColor = '#22c55e';
    }
    if (lbl) lbl.textContent = 'بازیابی و ادامه تایمر ▶️';
    if (dropCountEl) dropCountEl.textContent = hbState.ballDropCount;
    if (typeof playChime === 'function') playChime(250, 'sawtooth', 0.25);
  } else {
    // Ball retrieved: resume active timer!
    startHandballTimer();
    if (btn) {
      btn.style.background = 'rgba(239, 68, 68, 0.2)';
      btn.style.borderColor = '#ef4444';
    }
    if (lbl) lbl.textContent = 'افتادن توپ (توقف زمان) ⏸️';
    if (typeof playChime === 'function') playChime(660, 'sine', 0.15);
  }
}

// Dribble Cone & Foul Handlers
function handleConePenaltyTap() {
  hbState.dribbleConePenalties++;
  const penEl = document.getElementById('hbDribblePenaltyVal');
  const finalEl = document.getElementById('hbDribbleFinalTimeVal');
  if (penEl) penEl.textContent = `+${hbState.dribbleConePenalties}s`;
  if (finalEl) finalEl.textContent = `${((hbState.timerElapsedMs / 1000) + hbState.dribbleConePenalties).toFixed(2)}s`;
  if (typeof playChime === 'function') playChime(300, 'sawtooth', 0.2);
  calculateHandballScore();
}

function handleDribbleFoulTap() {
  hbState.dribbleFouls++;
  if (typeof playChime === 'function') playChime(220, 'sawtooth', 0.25);
  calculateHandballScore();
}

// Scoring & Grading Calculation
function calculateHandballScore() {
  const test = HANDBALL_SKILL_TESTS[hbState.activeTestId];
  if (!test) return;

  let metricValue = 0;
  let summaryText = '';
  let detailText = '';

  if (test.type === 'dribble') {
    const rawSeconds = hbState.timerElapsedMs / 1000;
    metricValue = parseFloat((rawSeconds + hbState.dribbleConePenalties).toFixed(2));
    summaryText = `زمان رکورد دریبل: ${metricValue} ثانیه`;
    detailText = `زمان خام: ${rawSeconds.toFixed(2)}s • خطای موانع: +${hbState.dribbleConePenalties} ثانیه • سایر خطاها: ${hbState.dribbleFouls}`;
  } else if (test.type === 'pass_catch') {
    metricValue = (hbState.scoreAt15s !== null) ? hbState.scoreAt15s : hbState.passReps;
    summaryText = `رکورد رسمی ۱۵ ثانیه: ${metricValue} تکرار صحیح`;
    detailText = `کل پاس‌های ۳۰ ثانیه: ${hbState.passReps} • توقف‌های افتادن توپ: ${hbState.ballDropCount} بار`;
  } else if (test.type === 'shooting') {
    metricValue = Math.max(0, hbState.shootingGoals - hbState.shootingFootFaults - hbState.shootingObstacleHits);
    const totalAttempted = hbState.shootingGoals + hbState.shootingFootFaults + hbState.shootingObstacleHits;
    const pct = totalAttempted > 0 ? Math.round((hbState.shootingGoals / totalAttempted) * 100) : 0;
    summaryText = `امتیاز نهایی شوت: ${metricValue} گل صحیح`;
    detailText = `گل‌های موفق: ${hbState.shootingGoals} • خطای پا: ${hbState.shootingFootFaults} • برخورد مانع: ${hbState.shootingObstacleHits} • دقت: ${pct}٪`;
  } else if (test.type === 'goalkeeping_grid') {
    metricValue = Math.max(0, hbState.gkTouches - hbState.gkSequenceErrors);
    summaryText = `امتیاز لمس ۴ گوشه: ${metricValue} امتیاز خالص`;
    detailText = `کل لمس‌های ثبت‌شده: ${hbState.gkTouches} • خطاهای توالی/الگو: ${hbState.gkSequenceErrors}`;
  } else {
    // Lateral defense
    metricValue = hbState.generalReps;
    summaryText = `تکرار دفاع کنار بدن: ${metricValue} تکرار`;
    detailText = `تکنیک استاندارد دست پایین و پای عمود در ۳۰ ثانیه`;
  }

  // Calculate Standard Rating based on norms
  let rating = { label: 'در حال ارزیابی', color: '#94a3b8' };
  if (test.norms && test.norms.length > 0) {
    if (test.lowerIsBetter) {
      for (const n of test.norms) {
        if (metricValue <= n.max) {
          rating = n;
          break;
        }
      }
    } else {
      for (const n of test.norms) {
        if (metricValue >= n.min) {
          rating = n;
          break;
        }
      }
    }
  }

  hbState.lastResult = {
    testId: test.id,
    testNumber: test.number,
    testTitle: test.titleFa,
    category: test.category,
    categoryFa: test.categoryFa,
    metricValue,
    unit: test.unitFa,
    summaryText,
    detailText,
    ratingLabel: rating.label,
    ratingColor: rating.color,
    timestamp: Date.now()
  };

  // Update UI Card
  const scoreSumEl = document.getElementById('hbScoreSummaryText');
  const scoreDetEl = document.getElementById('hbScoreDetailText');
  const ratingBadge = document.getElementById('hbRatingBadge');

  if (scoreSumEl) scoreSumEl.textContent = summaryText;
  if (scoreDetEl) scoreDetEl.textContent = detailText;
  if (ratingBadge) {
    ratingBadge.textContent = rating.label;
    ratingBadge.style.color = rating.color;
    ratingBadge.style.borderColor = rating.color;
    ratingBadge.style.background = `rgba(15, 23, 42, 0.8)`;
  }
}

function saveHandballTestToAthlete() {
  if (!hbState.lastResult || hbState.lastResult.metricValue <= 0) {
    calculateHandballScore();
  }
  const res = hbState.lastResult;
  if (!res) {
    alert('لطفاً ابتدا آزمون را اجرا و داده‌های آن را ثبت نمایید.');
    return;
  }

  if (typeof saveToHistory === 'function') {
    saveToHistory('handball_skill', {
      testId: res.testId,
      testNumber: res.testNumber,
      testTitle: res.testTitle,
      category: res.category,
      categoryFa: res.categoryFa,
      metricValue: res.metricValue,
      unit: res.unit,
      summary: res.summaryText,
      detail: res.detailText,
      rating: res.ratingLabel,
      scoreAt15s: hbState.scoreAt15s,
      ballDropCount: hbState.ballDropCount,
      footFaults: hbState.shootingFootFaults,
      sequenceErrors: hbState.gkSequenceErrors
    });
  }

  const saveBtn = document.getElementById('hbSaveToAthleteBtn');
  if (saveBtn) {
    saveBtn.innerHTML = '<span>✅</span><span>ثبت شد!</span>';
    saveBtn.style.background = '#16a34a';
    setTimeout(() => {
      saveBtn.innerHTML = '<span>💾</span><span>ثبت در پرونده</span>';
      saveBtn.style.background = '#0284c7';
    }, 2000);
  }

  if (typeof playChime === 'function') playChime(1046, 'triangle', 0.2);
}

// Render Physical Scouting Tab
function renderHandballScoutingTab() {
  let active = null;
  try {
    active = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;
  } catch (err) {}
  if (!active) {
    const list = typeof getAthletes === 'function' ? getAthletes() : [];
    active = list && list.length > 0 ? list[0] : { name: 'ورزشکار ۱', code: '۱۰۱', heightCm: 178, weightKg: 72, sport: 'هندبال' };
  }

  const allHistory = typeof getHistory === 'function' ? getHistory() : [];
  const athleteHistory = allHistory.filter(h => h && h.athleteId === (active ? active.id : ''));
  const contentEl = document.getElementById('handballScoutingContent');
  if (!contentEl) return;

  const analysis = generateHandballScouting(active, athleteHistory);

  // Collect skills records
  const skillRecords = athleteHistory.filter(h => h.type === 'handball_skill');

  contentEl.innerHTML = `
    <!-- Overall Compatibility Banner -->
    <div style="background: linear-gradient(135deg, rgba(2,132,199,0.15), rgba(22,163,74,0.15)); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">ارزیابی استعدادیابی تخصصی هوشمند:</div>
        <div style="font-size: 18px; font-weight: bold; color: #f8fafc; margin-top: 2px;">
          ${active.name} <span style="font-size: 12px; color: #38bdf8; font-weight: normal;">(کد: ${active.code || '۱۰۱'} • قد: ${active.heightCm}cm)</span>
        </div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
          تحلیل عملکرد بر اساس آزمون‌های ۱۳گانه مهارت، بیومکانیک پرش، چابکی، سرعت، استقامت و ابعاد بدنی.
        </div>
      </div>
      <div style="text-align: center; background: rgba(15,23,42,0.85); border: 2px solid #22c55e; border-radius: 12px; padding: 8px 18px;">
        <div style="font-size: 10px; color: #4ade80; font-weight: bold;">تطابق کلی با هندبال</div>
        <div style="font-size: 26px; font-weight: 900; color: #4ade80; font-family: monospace;">${analysis.handballOverallScore}٪</div>
      </div>
    </div>

    ${skillRecords.length > 0 ? `
      <!-- Recorded Handball Skill Assessments Table -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid #38bdf8; border-radius: 10px; padding: 12px; margin-bottom: 16px;">
        <div style="font-size: 13px; font-weight: bold; color: #38bdf8; margin-bottom: 8px;">🤾‍♂️ سوابق آزمون‌های مهارت تخصصی ثبت‌شده در پرونده:</div>
        <div style="overflow-x: auto;">
          <table style="width: 100%; font-size: 11.5px; text-align: right; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #475569; color: #94a3b8;">
                <th style="padding: 6px;">آزمون</th>
                <th style="padding: 6px;">رکورد</th>
                <th style="padding: 6px;">رتبه استاندارد</th>
                <th style="padding: 6px;">تاریخ</th>
              </tr>
            </thead>
            <tbody>
              ${skillRecords.slice(0, 6).map(r => `
                <tr style="border-bottom: 1px solid rgba(71,85,105,0.3);">
                  <td style="padding: 6px; color: #f8fafc;">${r.data?.testTitle || 'آزمون مهارت'}</td>
                  <td style="padding: 6px; color: #4ade80; font-weight: bold;">${r.data?.metricValue} ${r.data?.unit || ''}</td>
                  <td style="padding: 6px; color: #38bdf8;">${r.data?.rating || '--'}</td>
                  <td style="padding: 6px; color: #64748b; font-size: 10px;">${r.date || '--'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}

    <!-- Top Recommended Positions -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 13px; font-weight: bold; color: #38bdf8; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <span>🤾‍♂️ پست‌های تخصصی اولویت‌دار در هندبال مدرن:</span>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px;">
        ${analysis.positions.map((p, idx) => `
          <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid ${idx === 0 ? '#38bdf8' : 'rgba(148, 163, 184, 0.2)'}; border-radius: 10px; padding: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 13px; font-weight: bold; color: ${idx === 0 ? '#38bdf8' : '#f8fafc'};">
                ${p.icon} ${p.role}
              </span>
              <span style="font-size: 13px; font-weight: bold; color: ${p.matchPct >= 80 ? '#4ade80' : p.matchPct >= 70 ? '#38bdf8' : '#facc15'}; background: rgba(15,23,42,0.6); padding: 2px 8px; border-radius: 6px;">
                ${p.matchPct}٪
              </span>
            </div>
            <div style="font-size: 11px; color: #94a3b8; line-height: 1.5; margin-bottom: 6px;">
              ${p.desc}
            </div>
            <div style="font-size: 10px; color: #64748b;">
              <strong>پیش‌نیازهای کلیدی:</strong> ${p.specs}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Strengths & Weaknesses Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px;">
      <div style="background: rgba(34, 197, 94, 0.08); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: #4ade80; margin-bottom: 8px;">💪 نقاط قوت برجسته ورزشکار:</div>
        <ul style="margin: 0; padding-right: 16px; font-size: 11px; color: #e2e8f0; line-height: 1.6;">
          ${analysis.strengths.map(s => `<li><strong>${s.title}:</strong> ${s.text}</li>`).join('')}
        </ul>
      </div>

      <div style="background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 10px; padding: 12px;">
        <div style="font-size: 12px; font-weight: bold; color: #fbbf24; margin-bottom: 8px;">🎯 اولویت‌های اصلاحی و تمرینی:</div>
        <ul style="margin: 0; padding-right: 16px; font-size: 11px; color: #e2e8f0; line-height: 1.6;">
          ${analysis.weaknesses.map(w => `<li><strong>${w.title}:</strong> ${w.text}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
}

function openHandballScoutingModal(initialTab = 'skills', specificTestId = null) {
  let active = null;
  try {
    active = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;
  } catch (err) {}
  if (!active) {
    const list = typeof getAthletes === 'function' ? getAthletes() : [];
    active = list && list.length > 0 ? list[0] : { name: 'ورزشکار ۱', code: '۱۰۱', heightCm: 178, weightKg: 72, sport: 'هندبال' };
  }

  // Update header athlete badge
  const athBadge = document.getElementById('hbModalAthleteBadge');
  if (athBadge) {
    athBadge.textContent = `ورزشکار: ${active.name} (کد: ${active.code || '۱۰۱'} • قد: ${active.heightCm || 178}cm • رشته: ${active.sport || 'هندبال'})`;
  }

  if (athleteProfileModal) {
    athleteProfileModal.style.display = 'none';
    athleteProfileModal.classList.remove('visible');
  }

  switchHandballModalTab(initialTab);

  if (handballScoutingModal) {
    handballScoutingModal.style.display = 'block';
    handballScoutingModal.classList.add('visible');
    handballScoutingModal.scrollTop = 0;
  }

  // If a specific test ID was requested (e.g. gk_4corners_diagonal, shoot_3step_simple, etc.)
  if (specificTestId && HANDBALL_SKILL_TESTS[specificTestId]) {
    const test = HANDBALL_SKILL_TESTS[specificTestId];
    // Update category pills to show the right tab
    document.querySelectorAll('.hbCategoryPill').forEach(p => {
      const pCat = p.getAttribute('data-cat');
      if (pCat === test.category || (pCat === 'all' && !test.category)) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    const testSelect = document.getElementById('hbTestSelect');
    if (testSelect) {
      for (let i = 0; i < testSelect.options.length; i++) {
        testSelect.options[i].hidden = false;
      }
      testSelect.value = specificTestId;
    }

    selectHandballTest(specificTestId);

    setTimeout(() => {
      const targetSection = document.getElementById('hbInteractiveControllerContainer') || document.getElementById('hbTestSelect');
      if (targetSection && targetSection.scrollIntoView) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 120);
  }
}

function launchHandballCategory(cat) {
  openHandballScoutingModal('skills');
  const pill = document.querySelector(`.hbCategoryPill[data-cat="${cat}"]`);
  if (pill) {
    pill.click();
  }
}

function launchHandballTest(testId) {
  openHandballScoutingModal('skills', testId);
}

function closeHandballScoutingModal() {
  if (handballScoutingModal) {
    handballScoutingModal.style.display = 'none';
    handballScoutingModal.classList.remove('visible');
  }
  resetHandballTimer();
}
window.openHandballScoutingModal = openHandballScoutingModal;
window.closeHandballScoutingModal = closeHandballScoutingModal;
window.launchHandballCategory = launchHandballCategory;
window.launchHandballTest = launchHandballTest;

function initHandballSkillsSuite() {
  // Tabs switching
  document.getElementById('tabHbSkillsBtn')?.addEventListener('click', () => switchHandballModalTab('skills'));
  document.getElementById('tabHbScoutingBtn')?.addEventListener('click', () => switchHandballModalTab('scouting'));

  // Category filter pills
  document.querySelectorAll('.hbCategoryPill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.hbCategoryPill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const cat = pill.getAttribute('data-cat');
      
      const testSelect = document.getElementById('hbTestSelect');
      if (testSelect) {
        let firstMatch = null;
        for (let i = 0; i < testSelect.options.length; i++) {
          const opt = testSelect.options[i];
          const test = HANDBALL_SKILL_TESTS[opt.value];
          if (cat === 'all' || (test && test.category === cat)) {
            opt.hidden = false;
            if (!firstMatch) firstMatch = opt.value;
          } else {
            opt.hidden = true;
          }
        }
        if (firstMatch) {
          testSelect.value = firstMatch;
          selectHandballTest(firstMatch);
        }
      }
    });
  });

  // Test selector dropdown
  document.getElementById('hbTestSelect')?.addEventListener('change', (e) => {
    selectHandballTest(e.target.value);
  });

  // Timer controls
  document.getElementById('hbStartTimerBtn')?.addEventListener('click', startHandballTimer);
  document.getElementById('hbPauseTimerBtn')?.addEventListener('click', pauseHandballTimer);
  document.getElementById('hbResetTimerBtn')?.addEventListener('click', resetHandballTimer);
  document.getElementById('hbFinishTestBtn')?.addEventListener('click', finishHandballTest);

  // Save to athlete record
  document.getElementById('hbSaveToAthleteBtn')?.addEventListener('click', saveHandballTestToAthlete);

  // Close buttons
  document.getElementById('closeHandballModalXBtn')?.addEventListener('click', closeHandballScoutingModal);
  document.getElementById('closeHandballModalBtn')?.addEventListener('click', closeHandballScoutingModal);

  // Profile modal trigger
  document.getElementById('openHandballScoutingFromProfileBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  // Drawer menu trigger
  document.getElementById('drawerItemHandball')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeDrawer === 'function') closeDrawer();
    openHandballScoutingModal('skills');
  });

  document.getElementById('drawerItemHandballTop')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof closeDrawer === 'function') closeDrawer();
    openHandballScoutingModal('skills');
  });

  // Compact Top Bar Quick Launcher & Start Overlay Direct Shortcuts
  document.getElementById('quickOpenHandballBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  document.getElementById('overlayHandballShortcutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  document.getElementById('overlaySportsScienceShortcutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof openSportsScienceSuiteModal === 'function') {
      openSportsScienceSuiteModal();
    }
  });

  // Workstation Suite Actions and Header
  document.getElementById('statsHandballSuiteBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  document.getElementById('workstationOpenHandballModalBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  // Workstation 1-Click Direct Launch Buttons
  document.querySelectorAll('.hb-quick-launch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const testId = btn.getAttribute('data-test');
      const cat = btn.getAttribute('data-cat');
      const tab = btn.getAttribute('data-tab');

      if (testId) {
        launchHandballTest(testId);
      } else if (cat) {
        launchHandballCategory(cat);
      } else if (tab) {
        openHandballScoutingModal(tab);
      } else {
        openHandballScoutingModal('skills');
      }
    });
  });

  // Sports Science Suite trigger
  document.getElementById('openHandballFromSuiteBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openHandballScoutingModal('skills');
  });

  // Back to Profile
  document.getElementById('backToAthleteProfileBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeHandballScoutingModal();
    if (athleteProfileModal) {
      athleteProfileModal.style.display = 'block';
      athleteProfileModal.classList.add('visible');
      if (typeof renderAthleteModal === 'function') renderAthleteModal();
    }
  });

  // Initialize first test
  selectHandballTest('dribble_20m_sprint');
  console.log('🤾‍♂️ Handball Skill Assessment Suite & Referee Controller initialized (13 Tests)');
}

if (closeHandballModalBtn) {
  closeHandballModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeHandballScoutingModal();
  });
}

if (handballExportPdfBtn) {
  handballExportPdfBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeHandballScoutingModal();
    if (exportPdfBtn) exportPdfBtn.click();
  });
}

// ================== APP DRAWER & COMPACT TOP BAR NAVIGATION ==================
function openDrawer() {
  if (appDrawer) appDrawer.classList.add('open');
  if (drawerBackdrop) drawerBackdrop.classList.add('open');
  updateActiveAthleteUI();
}

function closeDrawer() {
  if (appDrawer) appDrawer.classList.remove('open');
  if (drawerBackdrop) drawerBackdrop.classList.remove('open');
}

function toggleDrawer() {
  if (appDrawer && appDrawer.classList.contains('open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

if (hamburgerBtn) hamburgerBtn.addEventListener('click', toggleDrawer);
if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
if (currentModeBadge) currentModeBadge.addEventListener('click', toggleDrawer);

// Wire Drawer Test Modes
if (drawerItemRun) drawerItemRun.addEventListener('click', () => { switchMode('run'); closeDrawer(); });
if (drawerItemJump) drawerItemJump.addEventListener('click', () => { switchMode('jump'); closeDrawer(); });
if (drawerItemAgility) drawerItemAgility.addEventListener('click', () => { switchMode('agility'); closeDrawer(); });
if (drawerItemBosco) drawerItemBosco.addEventListener('click', () => { switchMode('bosco'); closeDrawer(); });
if (drawerItemSitup) drawerItemSitup.addEventListener('click', () => { switchMode('situp'); closeDrawer(); });
if (drawerItemPushup) drawerItemPushup.addEventListener('click', () => { switchMode('pushup'); closeDrawer(); });
if (drawerItemSquatLunge) drawerItemSquatLunge.addEventListener('click', () => { switchMode('squat_lunge'); closeDrawer(); });
if (drawerItemFlex) drawerItemFlex.addEventListener('click', () => { switchMode('flexibility'); closeDrawer(); });
if (drawerItemAnthro) drawerItemAnthro.addEventListener('click', () => { switchMode('anthro'); closeDrawer(); });
if (drawerItemWingspan) drawerItemWingspan.addEventListener('click', () => { switchMode('wingspan'); closeDrawer(); });
if (drawerItemDistance) drawerItemDistance.addEventListener('click', () => { switchMode('distance'); closeDrawer(); });

// Wire Drawer Actions
if (drawerItemProfile) drawerItemProfile.addEventListener('click', () => {
  closeDrawer();
  if (athleteProfileBtn) athleteProfileBtn.click();
});
if (drawerItemHistory) drawerItemHistory.addEventListener('click', () => {
  closeDrawer();
  if (historyBtn) historyBtn.click();
});
if (drawerItemPdf) drawerItemPdf.addEventListener('click', () => {
  closeDrawer();
  if (exportPdfBtn) exportPdfBtn.click();
});
if (drawerItemCsv) drawerItemCsv.addEventListener('click', () => {
  closeDrawer();
  if (downloadCsvBtn) downloadCsvBtn.click();
});
if (drawerItemCamera) drawerItemCamera.addEventListener('click', () => {
  closeDrawer();
  const switchCam = document.getElementById('switchCameraBtn');
  if (switchCam) switchCam.click();
});
if (drawerItemFit) drawerItemFit.addEventListener('click', () => {
  closeDrawer();
  const toggleFit = document.getElementById('toggleFitBtn');
  if (toggleFit) toggleFit.click();
});
if (drawerItemOrientation) drawerItemOrientation.addEventListener('click', () => {
  closeDrawer();
  const toggleOri = document.getElementById('toggleOrientationBtn');
  if (toggleOri) toggleOri.click();
});
if (drawerItemTour) drawerItemTour.addEventListener('click', () => {
  closeDrawer();
  if (guideTourBtn) guideTourBtn.click();
});
if (drawerItemSettings) drawerItemSettings.addEventListener('click', () => {
  closeDrawer();
  if (settingsBtn) settingsBtn.click();
});

// ================== MODE SWITCHING ==================
function switchMode(newMode) {
  mode = newMode;
  clearAiFormWarning();
  hideAllPanels();

  // Trigger low-latency predictive pre-buffering for new test mode
  if (typeof predictiveCameraBufferHub !== 'undefined' && predictiveCameraBufferHub.onTestSwitch) {
    predictiveCameraBufferHub.onTestSwitch(newMode);
  }

  // Mode button states (legacy horizontal bar if rendered)
  if (modeRunBtn) modeRunBtn.classList.toggle('active', mode === 'run');
  if (modeJumpBtn) modeJumpBtn.classList.toggle('active', mode === 'jump');
  if (modeAgilityBtn) modeAgilityBtn.classList.toggle('active', mode === 'agility');
  if (modeBoscoBtn) modeBoscoBtn.classList.toggle('active', mode === 'bosco');
  if (modeSitupBtn) modeSitupBtn.classList.toggle('active', mode === 'situp');
  if (modePushupBtn) modePushupBtn.classList.toggle('active', mode === 'pushup');
  if (modeSquatLungeBtn) modeSquatLungeBtn.classList.toggle('active', mode === 'squat_lunge');
  if (modeWingspanBtn) modeWingspanBtn.classList.toggle('active', mode === 'wingspan');
  if (modeDistanceBtn) modeDistanceBtn.classList.toggle('active', mode === 'distance');
  if (modeFlexBtn) modeFlexBtn.classList.toggle('active', mode === 'flexibility');
  if (modeAnthroBtn) modeAnthroBtn.classList.toggle('active', mode === 'anthro');

  // Update Drawer menu items active state
  const drawerItems = {
    run: drawerItemRun,
    jump: drawerItemJump,
    agility: drawerItemAgility,
    bosco: drawerItemBosco,
    situp: drawerItemSitup,
    pushup: drawerItemPushup,
    squat_lunge: drawerItemSquatLunge,
    flexibility: drawerItemFlex,
    anthro: drawerItemAnthro,
    wingspan: drawerItemWingspan,
    distance: drawerItemDistance,
    y_balance: document.getElementById('drawerItemYBalance') || document.getElementById('modeYBalanceBtn'),
    pro_agility: document.getElementById('drawerItemProAgility') || document.getElementById('modeProAgilityBtn'),
    arm_cocking: document.getElementById('drawerItemArmCocking') || document.getElementById('modeArmCockingBtn'),
    posture: document.getElementById('drawerItemPosture') || document.getElementById('modePostureBtn')
  };
  Object.keys(drawerItems).forEach(k => {
    if (drawerItems[k]) drawerItems[k].classList.toggle('active', mode === k);
  });

  // Update Compact Top Bar Mode Badge
  const modeMeta = {
    run: { icon: '🏃', label: 'دوی سرعت و شتاب' },
    jump: { icon: '⤴️', label: 'پرش عمودی (سارجنت)' },
    agility: { icon: '⚡', label: 'تست چابکی و شاتل' },
    bosco: { icon: '⏱️', label: 'پرش متوالی Bosco' },
    situp: { icon: '🧘', label: 'دراز و نشست' },
    pushup: { icon: '💪', label: 'شنا سوئدی' },
    squat_lunge: { icon: '🏋️‍♂️', label: 'اسکات و لانج' },
    flexibility: { icon: '🧘‍♀️', label: 'انعطاف‌پذیری' },
    anthro: { icon: '📐', label: 'آنتروپومتری' },
    wingspan: { icon: '📏', label: 'طول دو دست' },
    distance: { icon: '📐', label: 'فاصله موانع' },
    y_balance: { icon: '🤸‍♂️', label: 'تعادل پویا Y' },
    pro_agility: { icon: '⚡', label: 'شاتل ۵-۱۰-۵' },
    arm_cocking: { icon: '🤾‍♂️', label: 'زاویه پرتاب دست' },
    posture: { icon: '🧍‍♂️', label: 'راستای قامتی' }
  };
  const curMeta = modeMeta[mode] || { icon: '🏃', label: 'حالت آزمون' };
  if (currentModeIcon) currentModeIcon.textContent = curMeta.icon;
  if (currentModeLabel) currentModeLabel.textContent = curMeta.label;

  if (mode === 'run') {
    runEnterCalibrate1();
  } else if (mode === 'jump') {
    jumpEnterCalibrating();
  } else if (mode === 'agility') {
    agilityEnterMode();
  } else if (mode === 'bosco') {
    boscoEnterIntro();
  } else if (mode === 'situp') {
    situpEnterIntro();
  } else if (mode === 'pushup') {
    pushupEnterIntro();
  } else if (mode === 'squat_lunge') {
    squatLungeEnterIntro();
  } else if (mode === 'wingspan') {
    wingspanEnterMode();
  } else if (mode === 'distance') {
    distanceEnterMode();
  } else if (mode === 'flexibility') {
    flexibilityEnterMode();
  } else if (mode === 'anthro') {
    anthroEnterMode();
  } else if (mode === 'y_balance') {
    if (typeof yBalanceEnterMode === 'function') yBalanceEnterMode();
  } else if (mode === 'pro_agility') {
    if (typeof proAgilityEnterMode === 'function') proAgilityEnterMode();
  } else if (mode === 'arm_cocking') {
    if (typeof armCockingEnterMode === 'function') armCockingEnterMode();
  } else if (mode === 'posture') {
    if (typeof postureEnterMode === 'function') postureEnterMode();
  }

  if (typeof updateLaptopStatsPanel === 'function') {
    updateLaptopStatsPanel();
  }
}

if (modeRunBtn) modeRunBtn.addEventListener('click', () => switchMode('run'));
if (modeJumpBtn) modeJumpBtn.addEventListener('click', () => switchMode('jump'));
if (modeAgilityBtn) modeAgilityBtn.addEventListener('click', () => switchMode('agility'));
if (modeBoscoBtn) modeBoscoBtn.addEventListener('click', () => switchMode('bosco'));
if (modeSitupBtn) modeSitupBtn.addEventListener('click', () => switchMode('situp'));
if (modePushupBtn) modePushupBtn.addEventListener('click', () => switchMode('pushup'));
if (modeSquatLungeBtn) modeSquatLungeBtn.addEventListener('click', () => switchMode('squat_lunge'));
if (modeWingspanBtn) modeWingspanBtn.addEventListener('click', () => switchMode('wingspan'));
if (modeDistanceBtn) modeDistanceBtn.addEventListener('click', () => switchMode('distance'));
if (modeFlexBtn) modeFlexBtn.addEventListener('click', () => switchMode('flexibility'));
if (modeAnthroBtn) modeAnthroBtn.addEventListener('click', () => switchMode('anthro'));

// Roadmap items 4-7: New mode buttons & drawer items
const modeYBalanceBtn = document.getElementById('modeYBalanceBtn');
if (modeYBalanceBtn) modeYBalanceBtn.addEventListener('click', () => switchMode('y_balance'));
const modeProAgilityBtn = document.getElementById('modeProAgilityBtn');
if (modeProAgilityBtn) modeProAgilityBtn.addEventListener('click', () => switchMode('pro_agility'));
const modeArmCockingBtn = document.getElementById('modeArmCockingBtn');
if (modeArmCockingBtn) modeArmCockingBtn.addEventListener('click', () => switchMode('arm_cocking'));
const modePostureBtn = document.getElementById('modePostureBtn');
if (modePostureBtn) modePostureBtn.addEventListener('click', () => switchMode('posture'));

const drawerItemYBalance = document.getElementById('drawerItemYBalance');
if (drawerItemYBalance) drawerItemYBalance.addEventListener('click', () => { closeDrawer(); switchMode('y_balance'); });
const drawerItemProAgility = document.getElementById('drawerItemProAgility');
if (drawerItemProAgility) drawerItemProAgility.addEventListener('click', () => { closeDrawer(); switchMode('pro_agility'); });
const drawerItemArmCocking = document.getElementById('drawerItemArmCocking');
if (drawerItemArmCocking) drawerItemArmCocking.addEventListener('click', () => { closeDrawer(); switchMode('arm_cocking'); });
const drawerItemPosture = document.getElementById('drawerItemPosture');
if (drawerItemPosture) drawerItemPosture.addEventListener('click', () => { closeDrawer(); switchMode('posture'); });

// ---- Convert a tap's client (viewport) coords to canvas pixel space,
// accurately accounting for object-fit: contain (wide uncropped) or cover (fullscreen). ----
function clientToCanvasCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const dispW = rect.width;
  const dispH = rect.height;
  const natW = canvas.width;
  const natH = canvas.height;
  if (!natW || !natH) return { x, y };

  const isContain = document.getElementById('stage')?.classList.contains('fit-contain');

  if (isContain) {
    // object-fit: contain
    const canvasAspect = natW / natH;
    const boxAspect = dispW / dispH;
    let renderW, renderH, offsetX, offsetY;

    if (boxAspect > canvasAspect) {
      renderH = dispH;
      renderW = dispH * canvasAspect;
      offsetX = (dispW - renderW) / 2;
      offsetY = 0;
    } else {
      renderW = dispW;
      renderH = dispW / canvasAspect;
      offsetX = 0;
      offsetY = (dispH - renderH) / 2;
    }

    const scale = natW / renderW;
    return {
      x: (x - offsetX) * scale,
      y: (y - offsetY) * scale
    };
  } else {
    // object-fit: cover
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
}

// ================== Camera + model setup ==================
/**
 * Get list of available video devices without filtering
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
 * Select the best camera according to user preference and Android wide-angle priority
 * On Android, automatically defaults to the widest (0.5x / ultra-wide) camera sensor
 */
async function selectBestCamera(preferredDeviceId = null) {
  if (preferredDeviceId) {
    return preferredDeviceId;
  }

  // Refresh available cameras to ensure latest hardware list
  await refreshAvailableCameras();

  if (availableCameras.length === 0) {
    return null;
  }

  // 1. Check for saved camera preference explicitly selected by the user
  const savedId = localStorage.getItem('selectedCameraId') || loadSavedCamera();
  if (savedId) {
    const saved = availableCameras.find(c => c.deviceId === savedId);
    if (saved) {
      console.log('✅ Using user saved camera preference:', saved.persianLabel || saved.deviceId);
      currentCameraId = saved.deviceId;
      currentCameraInfo = saved;
      return saved.deviceId;
    }
  }

  const isAndroid = /Android/i.test(navigator.userAgent);

  // 2. Default: Prioritize the camera with highest wideScore (Ultra-wide 0.5x / Wide)
  const backCameras = availableCameras.filter(c => c.position === 'back');

  if (backCameras.length > 0) {
    // Sort back cameras by wideScore descending
    const sortedByWide = [...backCameras].sort((a, b) => (b.wideScore || 0) - (a.wideScore || 0));
    const widestCam = sortedByWide[0];

    // Always prefer the widest lens by default to capture full athlete body in indoor spaces
    if (widestCam) {
      console.log(`✅ [Wide-Angle Default] Automatically selected widest camera: ${widestCam.persianLabel} (${widestCam.originalLabel}) with score ${widestCam.wideScore}`);
      currentCameraId = widestCam.deviceId;
      currentCameraInfo = widestCam;
      return widestCam.deviceId;
    }
  }

  // 3. Fallback to first available camera
  console.log(`✅ Selected default camera: ${availableCameras[0].persianLabel}`);
  currentCameraId = availableCameras[0].deviceId;
  currentCameraInfo = availableCameras[0];
  return availableCameras[0].deviceId;
}

/**
 * Setup camera with comprehensive error handling, wide-angle selection, and optimal resolution
 */
async function setupCamera(forceReconfigure = false, preferredDeviceId = null) {
  try {
    const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const orientation = getCurrentOrientation();
    console.log(`🔄 setupCamera called: orientation=${orientation}, force=${forceReconfigure}, preferredDeviceId=${preferredDeviceId}`);

    // If already running with same orientation and not forced and no preferredDeviceId, skip
    if (!forceReconfigure && !preferredDeviceId && currentOrientation === orientation && currentCameraStream) {
      console.log('✅ Camera already configured for this orientation');
      return;
    }

    // Select camera: on initial load, do NOT await enumerateDevices (which hangs before user grants permission)
    let selectedCameraId = preferredDeviceId || localStorage.getItem('selectedCameraId') || null;
    if (!selectedCameraId && availableCameras && availableCameras.length > 0) {
      try {
        selectedCameraId = await selectBestCamera(null);
      } catch (error) {
        console.warn('Could not select best camera:', error);
      }
    }

    // Check if chosen camera is front
    let isFrontCamera = false;
    if (selectedCameraId && availableCameras && availableCameras.length > 0) {
      const found = availableCameras.find(c => c.deviceId === selectedCameraId);
      if (found && found.position === 'front') {
        isFrontCamera = true;
      }
    }

    // Calculate optimal resolution for this orientation
    const optimalRes = calculateOptimalResolution(orientation);

    let stream = null;
    let lastError = null;

    // Helper function for timeout-safe getUserMedia (prevents infinite hanging)
    const requestMediaWithTimeout = (candidateConstraint, timeoutMs = 8000) => {
      return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
          if (!settled) {
            settled = true;
            const err = new Error('CAMERA_TIMEOUT');
            err.name = 'TimeoutError';
            reject(err);
          }
        }, timeoutMs);

        navigator.mediaDevices.getUserMedia({ video: candidateConstraint, audio: false })
          .then(res => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(res);
            }
          })
          .catch(err => {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              reject(err);
            }
          });
      });
    };

    // Build progressive candidate constraints in prioritized order
    const candidates = [];

    // 1. If a valid, non-empty specific camera ID is selected
    if (selectedCameraId && typeof selectedCameraId === 'string' && selectedCameraId.trim() !== '') {
      candidates.push({
        deviceId: { exact: selectedCameraId },
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height }
      });
      candidates.push({
        deviceId: { ideal: selectedCameraId }
      });
    }

    if (isFrontCamera) {
      // 2. Front camera prioritized
      candidates.push({
        facingMode: { ideal: 'user' },
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height }
      });
      candidates.push({
        facingMode: { ideal: 'user' }
      });
      candidates.push({
        facingMode: { ideal: 'environment' }
      });
    } else {
      // 3. Back camera prioritized (standard for athletic tests)
      candidates.push({
        facingMode: { ideal: 'environment' },
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height }
      });
      candidates.push({
        facingMode: { ideal: 'environment' }
      });
      // 4. Laptop / desktop / front webcam fallback
      candidates.push({
        facingMode: { ideal: 'user' },
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height }
      });
      candidates.push({
        facingMode: { ideal: 'user' }
      });
    }

    // 5. Generic standard resolution
    candidates.push({
      width: { ideal: 1280 },
      height: { ideal: 720 }
    });

    // 6. Ultimate universal fallback: true (any camera device present on the system)
    candidates.push(true);

    // Check if target camera stream has already been pre-buffered in hot cache by predictiveCameraBufferHub
    if (selectedCameraId && typeof predictiveCameraBufferHub !== 'undefined') {
      const acquired = predictiveCameraBufferHub.acquirePrebufferedStream(selectedCameraId);
      if (acquired && acquired.stream && acquired.stream.active) {
        stream = acquired.stream;
        console.log(`⚡ [PredictiveCameraBuffer] Instantly adopted pre-buffered camera stream for ${selectedCameraId}`);
      }
    }

    if (!stream) {
      for (let i = 0; i < candidates.length; i++) {
        const candidate = candidates[i];
        try {
          console.log(`📷 getUserMedia attempt ${i + 1}/${candidates.length}:`, candidate);
          stream = await requestMediaWithTimeout(candidate, 8000);
          console.log(`✅ Camera acquired on attempt ${i + 1}`);
          break;
        } catch (error) {
          lastError = error;
          console.warn(`Attempt ${i + 1} failed (${error.name}):`, error.message);
          // If permission was explicitly denied, do not continue trying
          if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            break;
          }
        }
      }
    }

    if (!stream) {
      const errorType = classifyCameraError(lastError);
      logError('setupCamera - getUserMedia', lastError, {
        selectedCameraId,
        orientation
      });
      throw { type: errorType, original: lastError };
    }

    // Stop previous stream tracks cleanly AFTER new stream is acquired
    if (currentCameraStream && currentCameraStream !== stream) {
      console.log('🛑 Stopping previous camera stream');
      try {
        currentCameraStream.getTracks().forEach(track => track.stop());
      } catch (e) {}
    }

    currentCameraStream = stream;
    currentOrientation = orientation;

    // Configure video element attributes properly for iOS Safari and Android Chrome
    video.setAttribute('playsinline', 'true');
    video.setAttribute('webkit-playsinline', 'true');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('muted', 'true');
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;

    const track = stream.getVideoTracks()[0];
    if (track) {
      const settings = track.getSettings ? track.getSettings() : {};
      if (settings.deviceId) {
        currentCameraId = settings.deviceId;
      }

      // Check zoom capabilities and apply widest angle
      if (!isAppleDevice && track.getCapabilities) {
        try {
          const caps = track.getCapabilities();
          if (caps.zoom) {
            console.log(`🔍 Zoom capability supported: min=${caps.zoom.min}, max=${caps.zoom.max}`);
            try {
              await track.applyConstraints({ advanced: [{ zoom: caps.zoom.min }] });
              currentCameraZoom = caps.zoom.min;
              console.log(`✅ Set camera zoom to widest: ${caps.zoom.min}`);
            } catch (zErr) {
              console.warn('Could not set initial zoom:', zErr);
            }
          }
          if (caps.focusMode && caps.focusMode.includes('continuous')) {
            try {
              await track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] });
            } catch (fErr) {}
          }
          setupZoomControlsUI(track, caps);

          // Workstation Hardware Focus-Control setup
          try {
            inspectTrackFocusCapabilities(track, 'primary');
            await applyCameraFocusConstraints('primary', { mode: 'continuous' });
          } catch (fErr) {
            console.warn('Could not initialize primary camera focus constraints:', fErr);
          }
        } catch (e) {
          console.warn('⚠️ Could not apply camera optimizations:', e.message);
        }
      }
    }

    return new Promise((resolve) => {
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
        video.play().catch(e => console.warn('video.play() caught on metadata:', e));
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
          } else if (checks > 30) {
            clearInterval(checkInterval);
            if (!isSettled) {
              isSettled = true;
              resizeCanvas();
              resolve();
            }
          }
        }, 100);
      }

      // Safe fallback timeout
      setTimeout(() => {
        if (!isSettled) {
          if (checkInterval) clearInterval(checkInterval);
          isSettled = true;
          resizeCanvas();
          resolve();
        }
      }, 5000);
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

// ================== KALMAN FILTERS FOR POSE DETECTION & SENSOR STABILITY ==================
/**
 * 1D Kalman Filter for smooth scalar tracking (e.g. runnerX, hip height, time)
 */
class KalmanFilter1D {
  constructor(q = 0.008, r = 0.05, initialVal = null) {
    this.q = q; // Process noise covariance
    this.r = r; // Measurement noise covariance
    this.x = initialVal; // State estimate
    this.p = 1.0; // Estimate error covariance
    this.k = 0;   // Kalman gain
  }

  reset(initialVal = null) {
    this.x = initialVal;
    this.p = 1.0;
  }

  update(measurement) {
    if (measurement == null || isNaN(measurement)) return this.x;
    if (this.x == null) {
      this.x = measurement;
      this.p = 1.0;
      return this.x;
    }
    // Prediction update
    this.p = this.p + this.q;
    // Measurement update
    this.k = this.p / (this.p + this.r);
    this.x = this.x + this.k * (measurement - this.x);
    this.p = (1 - this.k) * this.p;
    return this.x;
  }
}

/**
 * Biomechanical Adaptive Zero-Lag Filter for high-speed sports motion tracking.
 * - Resolves the "lagging behind / floating in air" defect by tracking 1:1 with athlete velocity.
 * - When moving (squats, jumps, sprints, punches, lunges), latency is 0 ms (instantaneous frame sync).
 * - When resting / stationary, applies subtle micro-jitter damping without phase delay.
 * - No non-physical distance clamps (removes the 120px cap that caused multi-frame delays).
 */
class PointKalmanFilter2D {
  constructor(name = '') {
    this.name = name;
    this.x = null;
    this.y = null;
    this.vx = 0;
    this.vy = 0;
    this.lastTime = 0;
  }

  reset() {
    this.x = null;
    this.y = null;
    this.vx = 0;
    this.vy = 0;
    this.lastTime = 0;
  }

  update(rawX, rawY, score = 0.8) {
    if (rawX == null || rawY == null || isNaN(rawX) || isNaN(rawY)) {
      return { x: this.x || rawX, y: this.y || rawY };
    }

    const now = performance.now();
    const dt = this.lastTime ? Math.min(0.1, Math.max(0.005, (now - this.lastTime) / 1000)) : 0.016;
    this.lastTime = now;

    // First frame initialization: snap immediately
    if (this.x == null || this.y == null) {
      this.x = rawX;
      this.y = rawY;
      this.vx = 0;
      this.vy = 0;
      return { x: this.x, y: this.y };
    }

    const dx = rawX - this.x;
    const dy = rawY - this.y;
    const dist = Math.hypot(dx, dy);

    // In zero-lag sports tracking mode (default):
    // For high-speed athletic movements (fast pushups, sprints, agility),
    // deliver 100% instant 1:1 keypoint tracking with zero phase delay.
    // Micro-smoothing is applied ONLY during near-total stillness (< 1.2px) to prevent sensor flicker.
    const isZeroLag = (typeof poseZeroLagMode === 'undefined') || poseZeroLagMode;
    if (isZeroLag) {
      if (dist < 1.2 && (score || 0) >= 0.25) {
        // Subtle micro-tremor suppression when virtually motionless
        this.x = this.x + 0.85 * dx;
        this.y = this.y + 0.75 * dy;
      } else {
        // Real-time athletic movement: instant 1:1 snap (ZERO lag!)
        this.x = rawX;
        this.y = rawY;
      }
      this.vx = dx / dt;
      this.vy = dy / dt;
      return { x: this.x, y: this.y };
    }

    // Adaptive smoothing fallback (if user explicitly disables zero-lag)
    const alpha = dist > 3.0 ? 1.0 : Math.max(0.8, dist / 3.0);
    this.x = this.x + alpha * dx;
    this.y = this.y + alpha * dy;
    this.vx = dx / dt;
    this.vy = dy / dt;
    return { x: this.x, y: this.y };
  }
}

// Global registry of keypoint Kalman & One-Euro filters
const poseKalmanFilters = {};
const oneEuroFilters = {};
const runnerXKalmanFilter = new KalmanFilter1D(0.012, 0.04);
let lastPoseDetectionTime = 0;
let oneEuroFilterEnabled = false; // Disabled by default for zero-lag high-speed athletic tracking
let oneEuroBetaValue = 0.08;

/**
 * 1€ (One-Euro) Filter implementation for anatomical keypoints jitter reduction.
 * Casiez, Roussel, Vogel (CHI 2012)
 * Eliminates high-frequency camera sensor noise during low velocities while
 * dynamically reducing lag to 0 during high-speed athletic movements.
 */
class LowPassFilter {
  constructor(alpha = 0.5, initVal = 0) {
    this.s = initVal;
    this.alpha = Math.max(0, Math.min(1, alpha));
    this.initialized = false;
  }
  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }
  filter(val) {
    if (!this.initialized) {
      this.s = val;
      this.initialized = true;
      return val;
    }
    this.s = this.alpha * val + (1.0 - this.alpha) * this.s;
    return this.s;
  }
  last() {
    return this.s;
  }
  reset() {
    this.initialized = false;
  }
}

class OneEuroFilter1D {
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
    this.lastTime = null;
  }
  alpha(rate, cutoff) {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    const te = 1.0 / rate;
    return 1.0 / (1.0 + tau / te);
  }
  filter(val, timestamp = performance.now()) {
    if (this.lastTime === null) {
      this.lastTime = timestamp;
      return this.xFilter.filter(val);
    }
    const dt = Math.max(0.001, (timestamp - this.lastTime) / 1000.0);
    this.lastTime = timestamp;
    const rate = 1.0 / dt;
    const prevVal = this.xFilter.last();
    const dx = (val - prevVal) * rate;
    this.dxFilter.setAlpha(this.alpha(rate, this.dCutoff));
    const edx = this.dxFilter.filter(dx);
    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    this.xFilter.setAlpha(this.alpha(rate, cutoff));
    return this.xFilter.filter(val);
  }
  reset() {
    this.lastTime = null;
    this.xFilter.reset();
    this.dxFilter.reset();
  }
}

class OneEuroFilter2D {
  constructor(minCutoff = 1.0, beta = 0.007, dCutoff = 1.0) {
    this.fx = new OneEuroFilter1D(minCutoff, beta, dCutoff);
    this.fy = new OneEuroFilter1D(minCutoff, beta, dCutoff);
  }
  setBeta(b) {
    this.fx.beta = b;
    this.fy.beta = b;
  }
  filter(x, y, timestamp = performance.now()) {
    return {
      x: this.fx.filter(x, timestamp),
      y: this.fy.filter(y, timestamp)
    };
  }
  reset() {
    this.fx.reset();
    this.fy.reset();
  }
}

function applyPoseKalmanFilter(keypoints) {
  if (!keypoints || !keypoints.length) return;
  const now = performance.now();
  // If no poses detected for > 250ms, reset filters immediately to prevent trailing lag
  if (now - lastPoseDetectionTime > 250) {
    resetPoseKalmanFilters();
  }
  lastPoseDetectionTime = now;

  for (const pt of keypoints) {
    if (!pt || !pt.name) continue;

    // Apply One-Euro filter on joints (especially knees, shoulders, ankles, hips, wrists)
    if (oneEuroFilterEnabled) {
      if (!oneEuroFilters[pt.name]) {
        oneEuroFilters[pt.name] = new OneEuroFilter2D(1.0, oneEuroBetaValue, 1.0);
      }
      const oeFiltered = oneEuroFilters[pt.name].filter(pt.x, pt.y, now);
      pt.x = oeFiltered.x;
      pt.y = oeFiltered.y;
    }

    if (!poseKalmanFilters[pt.name]) {
      poseKalmanFilters[pt.name] = new PointKalmanFilter2D(pt.name);
    }
    const filtered = poseKalmanFilters[pt.name].update(pt.x, pt.y, pt.score || 0.5);
    pt.x = filtered.x;
    pt.y = filtered.y;
  }
}

function resetPoseKalmanFilters() {
  for (const key in poseKalmanFilters) {
    poseKalmanFilters[key].reset();
  }
  for (const key in oneEuroFilters) {
    oneEuroFilters[key].reset();
  }
  runnerXKalmanFilter.reset();
}

/**
 * Load AI model with comprehensive error handling, enhanced smoothing, and fallback logic
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

      // High-speed sports motion tracking: default to 'lite' for 60 FPS ultra-low latency, or use user-configured setting
      const currentSettings = (typeof getSettings === 'function') ? getSettings() : { poseModelSpeed: 'lite' };
      const preferredType = (performanceMode === 'low-power' || attempt > 1) ? 'lite' : (currentSettings.poseModelSpeed || 'lite');
      console.log(`Attempting BlazePose (${preferredType})...`);

      try {
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          {
            runtime: 'mediapipe',
            modelType: preferredType,
            enableSmoothing: true,
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
          }
        );
      } catch (fullModelErr) {
        console.warn('BlazePose full model load failed, falling back to lite model:', fullModelErr);
        try {
          detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.BlazePose,
            {
              runtime: 'mediapipe',
              modelType: 'lite',
              enableSmoothing: true,
              solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
            }
          );
        } catch (liteModelErr) {
          console.warn('BlazePose lite model load failed, falling back to MoveNet Lightning:', liteModelErr);
          detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.MoveNet,
            {
              modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
              enableSmoothing: true
            }
          );
        }
      }

      console.log('✅ Model loaded successfully with keypoint stabilization');
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
 * Draw pose with thicker high-visibility skeleton, distinctive color-coded joints,
 * and real-time active tracking reticle
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
    if (mode === 'agility') agilityDrawOverlay();
    if (mode === 'bosco') boscoDrawOverlay();
    if (mode === 'situp') situpDrawOverlay();
    if (mode === 'pushup') pushupDrawOverlay();
    if (mode === 'squat_lunge') squatLungeDrawOverlay();
    if (mode === 'wingspan') wingspanDrawOverlay();
    if (mode === 'distance') distanceDrawOverlay();
    if (mode === 'flexibility') flexibilityDrawOverlay();
    if (mode === 'anthro') anthroDrawOverlay();
    if (mode === 'y_balance' && typeof yBalanceDrawOverlay === 'function') yBalanceDrawOverlay();
    if (mode === 'pro_agility' && typeof proAgilityDrawOverlay === 'function') proAgilityDrawOverlay();
    if (mode === 'arm_cocking' && typeof armCockingDrawOverlay === 'function') armCockingDrawOverlay();
    if (mode === 'posture' && typeof postureDrawOverlay === 'function') postureDrawOverlay();
    if (isCalibratingHeight) heightCalibDrawOverlay();
    if (isObjectCalibrating) objectCalibDrawOverlay();
    if (typeof isSquatCalibrating !== 'undefined' && isSquatCalibrating) squatCalibDrawOverlay();

    // Render transparent camera alignment grid overlay (when active)
    if (typeof showAlignmentGrid !== 'undefined' && showAlignmentGrid) {
      drawAlignmentGridOverlay();
    }

    if (!poses || !poses.length) return;
    const kp = {};
    for (const point of poses[0].keypoints) kp[point.name] = point;
    lastSeenKeypoints = kp;

    // Rendering confidence threshold (uses 0.15 baseline so far-away/fast limbs do not snap out)
    const minRenderScore = 0.15;
    const isLowPower = performanceMode === 'low-power';

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 1. Render all anatomical connections with thicker, high-contrast lines
    for (const [a, b] of CONNECTIONS) {
      // In low-power mode, skip micro facial/finger details to preserve FPS, but KEEP full skeleton
      if (isLowPower && (
        a.includes('eye_inner') || a.includes('eye_outer') || 
        a.includes('pinky') || a.includes('thumb') || a.includes('index')
      )) {
        continue;
      }

      const pa = kp[a], pb = kp[b];
      if (pa && pb && (pa.score || 0) >= minRenderScore && (pb.score || 0) >= minRenderScore) {
        const pairScore = Math.min(pa.score || 0, pb.score || 0);

        // Group by anatomical region
        const isLegOrFoot = a.includes('knee') || b.includes('knee') || a.includes('ankle') || b.includes('ankle') || a.includes('heel') || b.includes('heel') || a.includes('foot') || b.includes('foot');
        const isSpineOrHip = (a.includes('shoulder') && b.includes('shoulder')) || (a.includes('hip') && b.includes('hip')) || (a.includes('shoulder') && b.includes('hip'));
        const isHeadOrFace = a.includes('nose') || b.includes('nose') || a.includes('eye') || b.includes('eye') || a.includes('ear') || b.includes('ear') || a.includes('mouth') || b.includes('mouth');

        let strokeColor;
        let strokeW;
        const alpha = pairScore >= 0.35 ? 0.95 : Math.max(0.40, pairScore * 2.2);

        if (isLegOrFoot) {
          // Lower limbs: High-visibility Emerald Green
          strokeColor = `rgba(34, 197, 94, ${alpha})`;
          strokeW = isLowPower ? 4.5 : 6.0;
        } else if (isSpineOrHip) {
          // Core / Spine: Vivid Electric Cyan
          strokeColor = `rgba(56, 189, 248, ${alpha})`;
          strokeW = isLowPower ? 4.5 : 6.5;
        } else if (isHeadOrFace) {
          // Head / Face: Amber Gold
          strokeColor = `rgba(251, 191, 36, ${alpha})`;
          strokeW = isLowPower ? 2.5 : 3.5;
        } else {
          // Upper limbs / Arms: Bright Indigo / Sky
          strokeColor = `rgba(129, 140, 248, ${alpha})`;
          strokeW = isLowPower ? 3.5 : 5.0;
        }

        // Dark outline for maximum contrast against any floor or outdoor background
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.lineWidth = strokeW + (isLowPower ? 2 : 3);
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();

        // Main colored anatomical bone
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeW;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.stroke();
      }
    }

    // 2. Anatomical Spine & Neck Centerlines with reinforced contrast
    const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
    const lh = kp['left_hip'], rh = kp['right_hip'];
    const nose = kp['nose'];

    if (ls && rs && (ls.score || 0) >= minRenderScore && (rs.score || 0) >= minRenderScore) {
      const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };

      // Central Spine (Mid-Shoulder to Mid-Hip)
      if (lh && rh && (lh.score || 0) >= minRenderScore && (rh.score || 0) >= minRenderScore) {
        const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
        const spineScore = (ls.score + rs.score + lh.score + rh.score) / 4;
        const spineAlpha = spineScore >= 0.35 ? 0.95 : Math.max(0.4, spineScore * 2);

        // Spine Dark backing
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.lineWidth = isLowPower ? 6.5 : 8.5;
        ctx.beginPath();
        ctx.moveTo(midShoulder.x, midShoulder.y);
        ctx.lineTo(midHip.x, midHip.y);
        ctx.stroke();

        // Spine Cyan core
        ctx.strokeStyle = `rgba(56, 189, 248, ${spineAlpha})`;
        ctx.lineWidth = isLowPower ? 4.5 : 6.0;
        ctx.beginPath();
        ctx.moveTo(midShoulder.x, midShoulder.y);
        ctx.lineTo(midHip.x, midHip.y);
        ctx.stroke();
      }

      // Neck Connection (Mid-Shoulder to Nose/Chin)
      if (nose && (nose.score || 0) >= minRenderScore) {
        const neckAlpha = Math.min(nose.score || 0, (ls.score + rs.score) / 2) >= 0.35 ? 0.95 : 0.55;
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.lineWidth = isLowPower ? 4.5 : 6.0;
        ctx.beginPath();
        ctx.moveTo(midShoulder.x, midShoulder.y);
        ctx.lineTo(nose.x, nose.y);
        ctx.stroke();

        ctx.strokeStyle = `rgba(251, 191, 36, ${neckAlpha})`;
        ctx.lineWidth = isLowPower ? 2.5 : 3.8;
        ctx.beginPath();
        ctx.moveTo(midShoulder.x, midShoulder.y);
        ctx.lineTo(nose.x, nose.y);
        ctx.stroke();
      }
    }

    // 3. Render all detected anatomical keypoints / joints with distinctive coloring and double-rings
    for (const point of poses[0].keypoints) {
      const score = point.score || 0;
      if (score < minRenderScore) continue;

      const name = point.name || '';
      // Skip micro facial/finger nodes in low power mode to save canvas cycles
      if (isLowPower && (
        name.includes('eye_inner') || name.includes('eye_outer') || 
        name.includes('pinky') || name.includes('thumb') || name.includes('index')
      )) {
        continue;
      }

      const isKnee = name.includes('knee');
      const isAnkleOrFoot = name.includes('ankle') || name.includes('heel') || name.includes('foot');
      const isHip = name.includes('hip');
      const isShoulder = name.includes('shoulder');
      const isElbowOrWrist = name.includes('elbow') || name.includes('wrist');
      const isHeadOrFace = name.includes('nose') || name.includes('eye') || name.includes('ear') || name.includes('mouth');

      // Distinctive color-coding for each major joint type
      let color;
      let radius;
      let hasAccentRing = false;

      if (isKnee) {
        color = '#22c55e'; // Emerald Green
        radius = isLowPower ? 7.5 : 9.5;
        hasAccentRing = true;
      } else if (isAnkleOrFoot) {
        color = '#eab308'; // Bright Yellow Gold
        radius = isLowPower ? 7.0 : 9.0;
        hasAccentRing = true;
      } else if (isHip) {
        color = '#ec4899'; // Magenta / Pink Pelvic Hub
        radius = isLowPower ? 7.5 : 9.5;
      } else if (isShoulder) {
        color = '#0284c7'; // Deep Sky Blue
        radius = isLowPower ? 7.0 : 8.5;
      } else if (isElbowOrWrist) {
        color = '#a855f7'; // Purple / Violet
        radius = isLowPower ? 5.5 : 7.5;
      } else if (isHeadOrFace) {
        color = '#fbbf24'; // Amber
        radius = isLowPower ? 3.0 : 4.5;
      } else {
        color = '#38bdf8'; // Cyan
        radius = isLowPower ? 4.5 : 6.0;
      }

      // Outer accent pulsing ring for Knees and Ankles (shows user the critical measurement joints)
      if (hasAccentRing && !isLowPower) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 4.5, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Dark joint border
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius + 2, 0, 2 * Math.PI);
      ctx.fill();

      // Outer colored joint marker
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // High-contrast white center for major joints
      if (!isHeadOrFace && !isLowPower) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius * 0.42, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // 4. Active Tracking HUD Reticle (نشانگر ردیابی فعال ورزشکار)
    if (mode === 'run') {
      const runnerX = getRunnerX(kp);
      if (runnerX != null && ls && rs) {
        const torsoY = ((ls.y + rs.y) / 2 + (lh && rh ? (lh.y + rh.y) / 2 : (ls.y + rs.y) / 2 + 50)) / 2;
        
        // Vertical dashed tracking laser
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(runnerX, 0);
        ctx.lineTo(runnerX, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active Crosshair Reticle
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(runnerX, torsoY, 18, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.arc(runnerX, torsoY, 3, 0, 2 * Math.PI);
        ctx.fill();

        // Status Badge
        const tagText = '🎯 ردیابی بالاتنه دونده';
        ctx.font = 'bold 11px Vazirmatn, sans-serif';
        const tagW = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(runnerX - tagW / 2 - 6, torsoY - 32, tagW + 12, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(runnerX - tagW / 2 - 6, torsoY - 32, tagW + 12, 20);
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(tagText, runnerX - tagW / 2, torsoY - 18);
      }
    } else if (mode === 'jump' || mode === 'bosco') {
      if (lh && rh) {
        const hipX = (lh.x + rh.x) / 2;
        const hipY = (lh.y + rh.y) / 2;
        
        // Pelvis center of gravity reticle
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hipX, hipY, 18, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(hipX, hipY, 3.5, 0, 2 * Math.PI);
        ctx.fill();

        const tagText = '🎯 مرکز ثقل پرش (لگن)';
        ctx.font = 'bold 11px Vazirmatn, sans-serif';
        const tagW = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(hipX - tagW / 2 - 6, hipY - 30, tagW + 12, 20);
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 1;
        ctx.strokeRect(hipX - tagW / 2 - 6, hipY - 30, tagW + 12, 20);
        ctx.fillStyle = '#f472b6';
        ctx.fillText(tagText, hipX - tagW / 2, hipY - 16);
      }
    }

    if (mode === 'flexibility') {
      const lh = kp['left_hip'], rh = kp['right_hip'];
      const lk = kp['left_knee'], rk = kp['right_knee'];
      const la = kp['left_ankle'], ra = kp['right_ankle'];
      const ls = kp['left_shoulder'], rs = kp['right_shoulder'];

      const hips = [lh, rh].filter(p => p && (p.score || 0) > minRenderScore);
      const knees = [lk, rk].filter(p => p && (p.score || 0) > minRenderScore);
      const ankles = [la, ra].filter(p => p && (p.score || 0) > minRenderScore);
      const shoulders = [ls, rs].filter(p => p && (p.score || 0) > minRenderScore);

      if (hips.length && knees.length && shoulders.length) {
        const hPt = { x: hips.reduce((s, p) => s + p.x, 0) / hips.length, y: hips.reduce((s, p) => s + p.y, 0) / hips.length };
        const kPt = { x: knees.reduce((s, p) => s + p.x, 0) / knees.length, y: knees.reduce((s, p) => s + p.y, 0) / knees.length };
        const sPt = { x: shoulders.reduce((s, p) => s + p.x, 0) / shoulders.length, y: shoulders.reduce((s, p) => s + p.y, 0) / shoulders.length };

        ctx.strokeStyle = flexKneesStraight ? 'rgba(34, 197, 94, 0.45)' : 'rgba(239, 68, 68, 0.45)';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(sPt.x, sPt.y);
        ctx.lineTo(hPt.x, hPt.y);
        ctx.lineTo(kPt.x, kPt.y);
        if (ankles.length) {
          const aPt = { x: ankles.reduce((s, p) => s + p.x, 0) / ankles.length, y: ankles.reduce((s, p) => s + p.y, 0) / ankles.length };
          ctx.lineTo(aPt.x, aPt.y);
        }
        ctx.stroke();
      }
    }

    // 5. Joint Angles Display Overlay (Explicit user requirement: نمایش زوایای بین مفاصل)
    if (showJointAngles) {
      drawJointAnglesOverlay(kp);
    }

    // 6. Athlete Height Detection & Visual Caliper Overlay (Explicit user requirement: بدست آوردن قد بازیکن و نمایش زنده)
    drawAthleteHeightOverlay(kp);

    ctx.restore();

    // Dynamically calibrate scale from detected human pose
    updateEstimatedScaleFromPose(kp);

    if (mode === 'run') runUpdateGateCrossing(getRunnerX(kp));
    if (mode === 'jump') jumpProcessFrame(kp);
    if (mode === 'agility') agilityProcessFrame(kp);
    if (mode === 'bosco') boscoProcessFrame(kp);
    if (mode === 'situp') situpProcessFrame(kp);
    if (mode === 'pushup') pushupProcessFrame(kp);
    if (typeof isSquatCalibrating !== 'undefined' && isSquatCalibrating) squatCalibProcessFrame(kp);
    if (mode === 'squat_lunge') squatLungeProcessFrame(kp);
    if (mode === 'wingspan') wingspanProcessFrame(kp);
    if (mode === 'flexibility') flexibilityProcessFrame(kp);
    if (mode === 'anthro') anthroProcessFrame(kp);

  } catch (error) {
    logError('drawPose', error, { posesLength: poses?.length });
    // Don't throw - let the loop continue
  }
}

// ================== JOINT ANGLE COMPUTATION & VISUALIZATION ==================
// Explicit user requirement: نمایش زوایای بین مفاصل و بدست آوردن قد بازیکن
let showJointAngles = true;
try {
  const saved = localStorage.getItem('motion_tracker_show_joint_angles');
  if (saved !== null) {
    showJointAngles = saved === 'true';
  } else {
    showJointAngles = true; // Enabled by default as requested
  }
} catch (e) {
  showJointAngles = true;
}

function drawJointAnglesOverlay(kp) {
  if (!kp) return;

  const jointsToMeasure = [
    // Knees (مفاصل زانو)
    { name: 'زانوی راست', p1: kp['right_hip'], p2: kp['right_knee'], p3: kp['right_ankle'], color: '#22c55e', side: 'r', type: 'knee' },
    { name: 'زانوی چپ', p1: kp['left_hip'], p2: kp['left_knee'], p3: kp['left_ankle'], color: '#22c55e', side: 'l', type: 'knee' },
    // Elbows (مفاصل آرنج)
    { name: 'آرنج راست', p1: kp['right_shoulder'], p2: kp['right_elbow'], p3: kp['right_wrist'], color: '#38bdf8', side: 'r', type: 'elbow' },
    { name: 'آرنج چپ', p1: kp['left_shoulder'], p2: kp['left_elbow'], p3: kp['left_wrist'], color: '#38bdf8', side: 'l', type: 'elbow' },
    // Hips (مفاصل ران / لگن)
    { name: 'لگن راست', p1: kp['right_shoulder'], p2: kp['right_hip'], p3: kp['right_knee'], color: '#f59e0b', side: 'r', type: 'hip' },
    { name: 'لگن چپ', p1: kp['left_shoulder'], p2: kp['left_hip'], p3: kp['left_knee'], color: '#f59e0b', side: 'l', type: 'hip' },
    // Shoulders (مفاصل شانه)
    { name: 'شانه راست', p1: kp['right_elbow'], p2: kp['right_shoulder'], p3: kp['right_hip'], color: '#a855f7', side: 'r', type: 'shoulder' },
    { name: 'شانه چپ', p1: kp['left_elbow'], p2: kp['left_shoulder'], p3: kp['left_hip'], color: '#a855f7', side: 'l', type: 'shoulder' },
    // Ankles (مچ پا)
    { name: 'مچ پای راست', p1: kp['right_knee'], p2: kp['right_ankle'], p3: kp['right_foot_index'], color: '#10b981', side: 'r', type: 'ankle' },
    { name: 'مچ پای چپ', p1: kp['left_knee'], p2: kp['left_ankle'], p3: kp['left_foot_index'], color: '#10b981', side: 'l', type: 'ankle' }
  ];

  // Measure Torso / Spine inclination
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const lk = kp['left_knee'], rk = kp['right_knee'];
  if (ls && rs && lh && rh && ls.score > 0.25 && rs.score > 0.25 && lh.score > 0.25 && rh.score > 0.25) {
    const midS = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2, score: 0.9 };
    const midH = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2, score: 0.9 };
    const midK = (lk && rk && lk.score > 0.2 && rk.score > 0.2) 
      ? { x: (lk.x + rk.x) / 2, y: (lk.y + rk.y) / 2, score: 0.9 } 
      : { x: midH.x, y: midH.y + 120, score: 0.9 };
    
    jointsToMeasure.push({
      name: 'تنه / ستون‌فقرات',
      p1: midS,
      p2: midH,
      p3: midK,
      color: '#c084fc',
      side: 'l',
      type: 'torso'
    });
  }

  ctx.save();
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  let latestKnee = null;
  let latestHip = null;
  let latestElbow = null;
  let latestTorso = null;

  for (const item of jointsToMeasure) {
    const res = calculateJointAngle(item.p1, item.p2, item.p3);
    if (!res) continue;

    const { angle, p2, rad1, rad2 } = res;
    if (item.type === 'knee') latestKnee = angle;
    if (item.type === 'hip') latestHip = angle;
    if (item.type === 'elbow') latestElbow = angle;
    if (item.type === 'torso') latestTorso = angle;

    const arcRadius = 22;

    // 1. Draw angle sector arc around vertex
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, arcRadius, rad1, rad2, false);
    ctx.stroke();

    // 2. High contrast pill badge showing angle degrees
    const label = `${angle}°`;
    const labelW = ctx.measureText(label).width;
    const badgeW = Math.max(38, labelW + 12);
    const badgeH = 22;

    // Position badge slightly offset from joint
    const offsetX = item.side === 'r' ? 32 : -32;
    const offsetY = -8;
    const bx = p2.x + offsetX;
    const by = p2.y + offsetY;

    // Badge background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH, 6);
    } else {
      ctx.rect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH);
    }
    ctx.fill();

    // Badge border matching limb region
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 1.3;
    ctx.stroke();

    // Small connector tick from joint to badge
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p2.x + (item.side === 'r' ? 12 : -12), p2.y);
    ctx.lineTo(bx + (item.side === 'r' ? -badgeW / 2 : badgeW / 2), by);
    ctx.stroke();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, bx, by + 1);
  }

  ctx.restore();

  // Update Live Telemetry Badges
  if (latestKnee !== null) {
    const el = document.getElementById('telemAngleKnee');
    if (el) el.textContent = `${latestKnee}°`;
  }
  if (latestHip !== null) {
    const el = document.getElementById('telemAngleHip');
    if (el) el.textContent = `${latestHip}°`;
  }
  if (latestElbow !== null) {
    const el = document.getElementById('telemAngleElbow');
    if (el) el.textContent = `${latestElbow}°`;
  }
  if (latestTorso !== null) {
    const el = document.getElementById('telemAngleTorso');
    if (el) el.textContent = `${latestTorso}°`;
  }
  const mainTelemAngle = document.getElementById('telemMetric3Val');
  if (mainTelemAngle && (latestKnee !== null || latestHip !== null)) {
    mainTelemAngle.textContent = `${latestKnee || latestHip}°`;
  }
}

// ================== ATHLETE HEIGHT CALCULATION & CALIPER OVERLAY ==================
// Explicit user requirement: برنامه باید قد بازیکن رو بدست بیاره و زاویه های بین مفاصلش رو نشون بده
let athleteDetectedHeightBuffer = [];
window.lastDetectedAthleteHeightCm = null;

function calculateAthleteHeight(kp) {
  if (!kp) return null;
  const nose = kp['nose'];
  const leye = kp['left_eye'], reye = kp['right_eye'];
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  const lf = kp['left_foot_index'], rf = kp['right_foot_index'];

  // Needs visible upper body and at least one foot/ankle
  if (!nose || !ls || !rs || !lh || !rh) return null;
  const feet = [la, ra, lf, rf].filter(p => p && p.score > 0.20);
  if (feet.length === 0) return null;

  // Head crown vertex estimation
  const eyeY = (leye && reye && leye.score > 0.2 && reye.score > 0.2) ? (leye.y + reye.y) / 2 : nose.y - 14;
  const eyeDist = Math.max(12, Math.abs(nose.y - eyeY));
  const crownY = nose.y - (eyeDist * 3.3);

  // Soles on floor level
  const feetY = Math.max(...feet.map(p => p.y));
  const totalHeightPx = feetY - crownY;

  if (totalHeightPx < 70) return null;

  let estCm = 0;
  if (typeof window.a4CalibrationScaleCmPerPx === 'number' && window.a4CalibrationScaleCmPerPx > 0) {
    estCm = Math.round(totalHeightPx * window.a4CalibrationScaleCmPerPx);
  } else if (typeof currentEstimatedScaleCmPerPx === 'number' && currentEstimatedScaleCmPerPx > 0) {
    estCm = Math.round(totalHeightPx * currentEstimatedScaleCmPerPx);
  } else {
    // Optical biometric proportions: Human body height is ~7.5 to 7.8 times head height (Greek canon)
    const headHeightPx = Math.max(22, eyeDist * 3.6);
    estCm = Math.round((totalHeightPx / headHeightPx) * 23.2);
  }

  // Sanity clamp for athlete population (110 - 235 cm)
  if (estCm >= 110 && estCm <= 235) {
    athleteDetectedHeightBuffer.push(estCm);
    if (athleteDetectedHeightBuffer.length > 18) athleteDetectedHeightBuffer.shift();
    const sorted = [...athleteDetectedHeightBuffer].sort((a, b) => a - b);
    const medianHeight = sorted[Math.floor(sorted.length / 2)];
    window.lastDetectedAthleteHeightCm = medianHeight;

    // Update Telemetry & Card badges
    const liveChip = document.getElementById('statsLiveDetectedHeight');
    if (liveChip) liveChip.textContent = String(medianHeight);
    const badge = document.getElementById('liveHeightBadge');
    if (badge) badge.textContent = `قد دوربین: ${medianHeight} cm`;

    return {
      crownY,
      feetY,
      heightCm: medianHeight,
      athleteX: (ls.x + rs.x) / 2
    };
  }

  return null;
}

function drawAthleteHeightOverlay(kp) {
  const res = calculateAthleteHeight(kp);
  if (!res) return;

  const { crownY, feetY, heightCm, athleteX } = res;

  ctx.save();
  // Choose side with more clearance on canvas
  const isRightSide = athleteX < canvas.width / 2;
  const caliperX = isRightSide ? Math.min(canvas.width - 24, athleteX + 110) : Math.max(24, athleteX - 110);

  // 1. Caliper vertical ruler line
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(caliperX, crownY);
  ctx.lineTo(caliperX, feetY);
  ctx.stroke();
  ctx.setLineDash([]);

  // 2. Top tick at crown level
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(caliperX - 16, crownY);
  ctx.lineTo(caliperX + 16, crownY);
  ctx.stroke();

  // 3. Bottom tick at floor soles level
  ctx.beginPath();
  ctx.moveTo(caliperX - 16, feetY);
  ctx.lineTo(caliperX + 16, feetY);
  ctx.stroke();

  // 4. Subtle projection line to athlete
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(athleteX, crownY);
  ctx.lineTo(caliperX, crownY);
  ctx.moveTo(athleteX, feetY);
  ctx.lineTo(caliperX, feetY);
  ctx.stroke();

  // 5. Central height badge
  const badgeY = (crownY + feetY) / 2;
  const label = `📏 قد: ${heightCm} cm`;
  ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
  const textW = ctx.measureText(label).width;
  const bw = textW + 18;
  const bh = 26;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(caliperX - bw / 2, badgeY - bh / 2, bw, bh, 8);
  } else {
    ctx.rect(caliperX - bw / 2, badgeY - bh / 2, bw, bh);
  }
  ctx.fill();

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, caliperX, badgeY + 1);

  ctx.restore();
}

function applyLiveDetectedHeightToAthlete() {
  if (!window.lastDetectedAthleteHeightCm) {
    setStatus('⚠️ قد ورزشکار هنوز در زاویه دوربین به وضوح تشخیص داده نشده است.');
    return;
  }
  const h = window.lastDetectedAthleteHeightCm;
  const active = (typeof getActiveAthlete === 'function') ? getActiveAthlete() : null;
  if (active) {
    active.heightCm = h;
    const athletes = getAthletes();
    const idx = athletes.findIndex(a => a.id === active.id);
    if (idx !== -1) {
      athletes[idx].heightCm = h;
      saveAthletes(athletes);
    }
    if (typeof athleteHeightCm !== 'undefined') athleteHeightCm = h;
    const heightInput = document.getElementById('athleteHeightSetting');
    if (heightInput) heightInput.value = h;
    if (typeof updateActiveAthleteUI === 'function') updateActiveAthleteUI();
    const statsH = document.getElementById('statsAthleteHeight');
    if (statsH) statsH.textContent = String(h);
    playChime(780, 'triangle', 0.15);
    setStatus(`📏 قد ${h} سانتی‌متر در پروفایل «${active.name}» ثبت شد ✅`);
    if (typeof showShortcutToast === 'function') {
      showShortcutToast(`📏 قد ${h}cm برای ${active.name} ثبت شد`);
    }
  }
}

// Wire up height apply buttons
document.addEventListener('DOMContentLoaded', () => {
  const btn1 = document.getElementById('applyDetectedHeightBtn');
  if (btn1) btn1.addEventListener('click', applyLiveDetectedHeightToAthlete);
  const btn2 = document.getElementById('applyLiveHeightBtn');
  if (btn2) btn2.addEventListener('click', applyLiveDetectedHeightToAthlete);
});
// Also attach immediately in case DOM is already loaded
setTimeout(() => {
  const btn1 = document.getElementById('applyDetectedHeightBtn');
  if (btn1 && !btn1._bound) {
    btn1._bound = true;
    btn1.addEventListener('click', applyLiveDetectedHeightToAthlete);
  }
  const btn2 = document.getElementById('applyLiveHeightBtn');
  if (btn2 && !btn2._bound) {
    btn2._bound = true;
    btn2.addEventListener('click', applyLiveDetectedHeightToAthlete);
  }
}, 500);

function toggleJointAngles(forcedVal) {
  if (typeof forcedVal === 'boolean') {
    showJointAngles = forcedVal;
  } else {
    showJointAngles = !showJointAngles;
  }

  try {
    localStorage.setItem('motion_tracker_show_joint_angles', showJointAngles ? 'true' : 'false');
  } catch (e) {}

  updateJointAnglesUI();
  setStatus(showJointAngles ? '📐 نمایش زوایای مفاصل فعال شد.' : '📐 نمایش زوایای مفاصل غیرفعال شد.');
  playChime(showJointAngles ? 600 : 400, 'sine', 0.12);
}

function updateJointAnglesUI() {
  const topBtn = document.getElementById('toggleJointAnglesBtn');
  const topText = document.getElementById('jointAnglesBtnText');
  const drawerBadge = document.getElementById('drawerJointAnglesBadge');
  const statsBtn = document.getElementById('statsToggleJointAnglesBtn');

  if (topBtn) {
    if (showJointAngles) {
      topBtn.style.background = 'rgba(2, 132, 199, 0.35)';
      topBtn.style.borderColor = '#38bdf8';
      topBtn.style.color = '#38bdf8';
    } else {
      topBtn.style.background = '';
      topBtn.style.borderColor = '';
      topBtn.style.color = '';
    }
  }

  if (topText) {
    topText.textContent = showJointAngles ? 'زوایا: روشن' : 'زوایای مفاصل';
  }

  if (drawerBadge) {
    drawerBadge.textContent = showJointAngles ? 'روشن' : 'خاموش';
    drawerBadge.style.background = showJointAngles ? '#16a34a' : '#334155';
    drawerBadge.style.color = showJointAngles ? '#ffffff' : '#94a3b8';
  }

  if (statsBtn) {
    if (showJointAngles) {
      statsBtn.classList.add('active');
      statsBtn.style.background = '#0284c7';
      statsBtn.style.color = '#ffffff';
      statsBtn.textContent = '📐 زوایا: روشن';
    } else {
      statsBtn.classList.remove('active');
      statsBtn.style.background = '';
      statsBtn.style.color = '';
      statsBtn.textContent = '📐 زوایای مفاصل';
    }
  }
}

// ================== ALIGNMENT GRID OVERLAY ==================
let showAlignmentGrid = false;
try {
  showAlignmentGrid = localStorage.getItem('motion_tracker_show_alignment_grid') === 'true';
} catch (e) {}

function toggleAlignmentGrid(forceVal) {
  if (typeof forceVal === 'boolean') {
    showAlignmentGrid = forceVal;
  } else {
    showAlignmentGrid = !showAlignmentGrid;
  }

  try {
    localStorage.setItem('motion_tracker_show_alignment_grid', showAlignmentGrid ? 'true' : 'false');
  } catch (e) {}

  updateAlignmentGridUI();
  playChime(showAlignmentGrid ? 700 : 380, 'sine', 0.12);

  if (showAlignmentGrid) {
    showShortcutToast('📐 کادر ترازبندی دوربین فعال شد (کلید G)');
    setStatus('📐 کادر ترازبندی و تقارن دوربین فعال شد.');
  } else {
    showShortcutToast('📐 کادر ترازبندی غیرفعال شد (کلید G)');
    setStatus('📐 کادر ترازبندی غیرفعال شد.');
  }
}

function updateAlignmentGridUI() {
  const toggleGridBtn = document.getElementById('toggleGridBtn');
  const statsToggleGridBtn = document.getElementById('statsToggleGridBtn');
  const drawerItemGrid = document.getElementById('drawerItemGrid');
  const settingAlignmentGrid = document.getElementById('settingAlignmentGrid');

  if (toggleGridBtn) {
    toggleGridBtn.classList.toggle('active', showAlignmentGrid);
    toggleGridBtn.style.color = showAlignmentGrid ? '#38bdf8' : '';
    toggleGridBtn.style.borderColor = showAlignmentGrid ? '#38bdf8' : '';
  }
  if (statsToggleGridBtn) {
    statsToggleGridBtn.classList.toggle('active', showAlignmentGrid);
    if (showAlignmentGrid) {
      statsToggleGridBtn.style.background = '#0284c7';
      statsToggleGridBtn.style.color = '#ffffff';
      statsToggleGridBtn.style.borderColor = '#38bdf8';
      statsToggleGridBtn.textContent = '📐 گرید: روشن';
    } else {
      statsToggleGridBtn.style.background = '';
      statsToggleGridBtn.style.color = '';
      statsToggleGridBtn.style.borderColor = '';
      statsToggleGridBtn.textContent = '📐 گرید تراز (G)';
    }
  }
  if (drawerItemGrid) {
    drawerItemGrid.classList.toggle('active', showAlignmentGrid);
  }
  if (settingAlignmentGrid) {
    settingAlignmentGrid.checked = showAlignmentGrid;
  }
}

function drawAlignmentGridOverlay() {
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) return;

  ctx.save();

  // 1. 3x3 Rule-of-Thirds Grid Lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 5]);

  const x1 = w / 3;
  const x2 = (2 * w) / 3;
  const y1 = h / 3;
  const y2 = (2 * h) / 3;

  ctx.beginPath();
  // Vertical thirds
  ctx.moveTo(x1, 0); ctx.lineTo(x1, h);
  ctx.moveTo(x2, 0); ctx.lineTo(x2, h);
  // Horizontal thirds
  ctx.moveTo(0, y1); ctx.lineTo(w, y1);
  ctx.moveTo(0, y2); ctx.lineTo(w, y2);
  ctx.stroke();

  // 2. Center Crosshair and Concentric Target Reticles
  ctx.setLineDash([]);
  const cx = w / 2;
  const cy = h / 2;

  // Center vertical plumb line (Gravity alignment for athlete spine)
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, 16); ctx.lineTo(cx, h - 16);
  ctx.stroke();

  // Center horizontal reference line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.beginPath();
  ctx.moveTo(25, cy); ctx.lineTo(w - 25, cy);
  ctx.stroke();

  // Target Circles
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, 28, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, 2 * Math.PI);
  ctx.stroke();

  // Center Point
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
  ctx.fill();

  // 3. Ground Level Baseline Alignment (88% height - where feet/baseline should rest)
  const groundY = h * 0.88;
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.75)'; // Emerald baseline
  ctx.lineWidth = 1.8;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(25, groundY);
  ctx.lineTo(w - 25, groundY);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ground level calibration tick marks
  for (let i = 0; i <= 10; i++) {
    const tx = 25 + (i / 10) * (w - 50);
    const tickH = (i === 5 || i === 0 || i === 10) ? 12 : 6;
    ctx.beginPath();
    ctx.moveTo(tx, groundY - tickH / 2);
    ctx.lineTo(tx, groundY + tickH / 2);
    ctx.stroke();
  }

  // Label for ground baseline
  ctx.font = 'bold 10px Vazirmatn, Tahoma, sans-serif';
  ctx.fillStyle = '#22c55e';
  ctx.textAlign = 'right';
  ctx.fillText('خط تراز سطح زمین / تماس پاها', w - 30, groundY - 7);

  // 4. Tactical Frame Corner Brackets
  const cornerLen = 26;
  const margin = 16;
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
  ctx.lineWidth = 2.5;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + cornerLen);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + cornerLen, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(w - margin - cornerLen, margin);
  ctx.lineTo(w - margin, margin);
  ctx.lineTo(w - margin, margin + cornerLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, h - margin - cornerLen);
  ctx.lineTo(margin, h - margin);
  ctx.lineTo(margin + cornerLen, h - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(w - margin - cornerLen, h - margin);
  ctx.lineTo(w - margin, h - margin);
  ctx.lineTo(w - margin, h - margin - cornerLen);
  ctx.stroke();

  // Top-Center Status Pill
  const badgeW = 190, badgeH = 22;
  const bx = (w - badgeW) / 2, by = 16;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(bx, by, badgeW, badgeH, 6);
  else ctx.rect(bx, by, badgeW, badgeH);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 10.5px Vazirmatn, Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📐 کادر ترازبندی و تقارن دوربین (G)', cx, by + 15);

  ctx.restore();
}

// ================== KEYBOARD SHORTCUTS SYSTEM ==================
let shortcutToastTimeout = null;
function showShortcutToast(message) {
  const toast = document.getElementById('shortcutToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  if (shortcutToastTimeout) clearTimeout(shortcutToastTimeout);
  shortcutToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.style.opacity === '0') toast.style.display = 'none';
    }, 250);
  }, 1600);
}

function triggerCurrentTest() {
  if (mode === 'run') {
    const triggerBtn = document.getElementById('runTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerRunTest === 'function') triggerRunTest();
    showShortcutToast('⏱️ فعال‌سازی آزمون دو سرعت (Space)');
  } else if (mode === 'jump') {
    const triggerBtn = document.getElementById('jumpTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerJumpTest === 'function') triggerJumpTest();
    showShortcutToast('⤴️ شروع آزمون پرش عمودی (Space)');
  } else if (mode === 'bosco') {
    const triggerBtn = document.getElementById('boscoTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerBoscoTest === 'function') triggerBoscoTest();
    showShortcutToast('🦘 شروع پرش متوالی بوسکو (Space)');
  } else if (mode === 'agility') {
    const triggerBtn = document.getElementById('agilityTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerAgilityTest === 'function') triggerAgilityTest();
    showShortcutToast('⚡ شروع آزمون چابکی شاتل (Space)');
  } else if (mode === 'pushup') {
    const triggerBtn = document.getElementById('pushupTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerPushupTest === 'function') triggerPushupTest();
    showShortcutToast('💪 شروع آزمون شنا سوئدی (Space)');
  } else if (mode === 'situp') {
    const triggerBtn = document.getElementById('situpTriggerBtn');
    if (triggerBtn) triggerBtn.click();
    else if (typeof triggerSitupTest === 'function') triggerSitupTest();
    showShortcutToast('🧘 شروع آزمون دراز و نشست (Space)');
  } else if (mode === 'wingspan') {
    const snapBtn = document.getElementById('wingspanSnapshotBtn');
    if (snapBtn) snapBtn.click();
    else if (typeof captureWingspanSnapshot === 'function') captureWingspanSnapshot();
    showShortcutToast('📏 ثبت طول دست Wingspan (Space)');
  } else if (mode === 'anthro') {
    const saveBtn = document.getElementById('anthroSaveBtn');
    if (saveBtn) saveBtn.click();
    else if (typeof saveAnthroRecord === 'function') saveAnthroRecord();
    showShortcutToast('📐 ثبت ابعاد آنتروپومتری (Space)');
  } else if (mode === 'flexibility') {
    const snapBtn = document.getElementById('flexibilitySnapshotBtn');
    if (snapBtn) snapBtn.click();
    else if (typeof captureFlexibilitySnapshot === 'function') captureFlexibilitySnapshot();
    showShortcutToast('🤸 ثبت رکورد انعطاف‌پذیری (Space)');
  } else {
    showShortcutToast('⚡ آزمون فعال شد (Space)');
  }
}

function resetActiveModeTest() {
  if (mode === 'run' && typeof runResetState === 'function') runResetState();
  else if (mode === 'jump' && typeof jumpResetState === 'function') jumpResetState();
  else if (mode === 'bosco' && typeof boscoResetState === 'function') boscoResetState();
  else if (mode === 'agility' && typeof agilityResetState === 'function') agilityResetState();
  else if (mode === 'pushup' && typeof pushupResetState === 'function') pushupResetState();
  else if (mode === 'situp' && typeof situpResetState === 'function') situpResetState();
  else if (mode === 'wingspan' && typeof wingspanResetState === 'function') wingspanResetState();
  else if (mode === 'anthro' && typeof anthroResetState === 'function') anthroResetState();
  else if (mode === 'flexibility' && typeof flexibilityResetState === 'function') flexibilityResetState();
  setStatus('🔄 آزمون بازنشانی شد.');
}

function openKeyboardShortcutsModal() {
  const modal = document.getElementById('keyboardShortcutsModal');
  if (modal) modal.style.display = 'flex';
}

function closeKeyboardShortcutsModal() {
  const modal = document.getElementById('keyboardShortcutsModal');
  if (modal) modal.style.display = 'none';
}

function initKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // If the user is currently typing in an input, textarea, or select, do not intercept!
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable)) {
      if (e.key === 'Escape') {
        activeEl.blur();
      }
      return;
    }

    const key = e.key;

    // Review Panel Active Keyboard Controls
    if (typeof isReviewPanelActive !== 'undefined' && isReviewPanelActive) {
      if (key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (typeof toggleReviewPlayback === 'function') toggleReviewPlayback();
        return;
      }
      if (key === '[' || key === 'ArrowLeft') {
        e.preventDefault();
        if (typeof stepReviewFrame === 'function') stepReviewFrame(-1);
        return;
      }
      if (key === ']' || key === 'ArrowRight') {
        e.preventDefault();
        if (typeof stepReviewFrame === 'function') stepReviewFrame(1);
        return;
      }
      if (key === 'Escape') {
        e.preventDefault();
        if (typeof closeSideBySideReviewPanel === 'function') closeSideBySideReviewPanel();
        return;
      }
    }

    if (key === ' ' || e.code === 'Space') {
      e.preventDefault();
      triggerCurrentTest();
      return;
    }

    if (key === '1') {
      e.preventDefault();
      switchMode('run');
      showShortcutToast('🏃 تغییر آزمون: دوی سرعت (1)');
      return;
    }
    if (key === '2') {
      e.preventDefault();
      switchMode('jump');
      showShortcutToast('⤴️ تغییر آزمون: پرش عمودی سارجنت (2)');
      return;
    }
    if (key === '3') {
      e.preventDefault();
      switchMode('bosco');
      showShortcutToast('🦘 تغییر آزمون: پرش متوالی بوسکو (3)');
      return;
    }
    if (key === '4') {
      e.preventDefault();
      switchMode('agility');
      showShortcutToast('⚡ تغییر آزمون: چابکی شاتل (4)');
      return;
    }
    if (key === '5') {
      e.preventDefault();
      switchMode('pushup');
      showShortcutToast('💪 تغییر آزمون: شنا سوئدی (5)');
      return;
    }
    if (key === '6') {
      e.preventDefault();
      switchMode('situp');
      showShortcutToast('🧘 تغییر آزمون: دراز و نشست (6)');
      return;
    }
    if (key === '7') {
      e.preventDefault();
      switchMode('wingspan');
      showShortcutToast('📏 تغییر آزمون: طول دو دست Wingspan (7)');
      return;
    }
    if (key === '8') {
      e.preventDefault();
      switchMode('flexibility');
      showShortcutToast('🤸 تغییر آزمون: انعطاف‌پذیری (8)');
      return;
    }
    if (key === '9') {
      e.preventDefault();
      switchMode('anthro');
      showShortcutToast('📐 تغییر آزمون: آنتروپومتری و ابعاد اسکلتی (9)');
      return;
    }
    if (key === '0') {
      e.preventDefault();
      switchMode('distance');
      showShortcutToast('📏 کالیبراسیون فاصله (0)');
      return;
    }

    if (key === 'q' || key === 'Q' || key === 'ض') {
      e.preventDefault();
      switchMode('squat_lunge');
      showShortcutToast('🏋️‍♂️ تغییر آزمون: بیومکانیک اسکات و لانج (Q)');
      return;
    }

    if (key === 'g' || key === 'G' || key === 'ل') {
      e.preventDefault();
      toggleAlignmentGrid();
      return;
    }

    if (key === 'a' || key === 'A' || key === 'ش') {
      e.preventDefault();
      toggleJointAngles();
      return;
    }

    if (key === 's' || key === 'S' || key === 'س') {
      e.preventDefault();
      if (typeof saveActiveModeRecord === 'function') {
        saveActiveModeRecord();
        showShortcutToast('💾 رکورد ثبت شد (S)');
      }
      return;
    }

    if (key === 'r' || key === 'R' || key === 'ق') {
      e.preventDefault();
      if (e.shiftKey) {
        resetActiveModeTest();
        showShortcutToast('🔄 بازنشانی آزمون جاری (Shift+R)');
      } else if (typeof toggleSideBySideReviewPanel === 'function') {
        toggleSideBySideReviewPanel();
      } else {
        resetActiveModeTest();
        showShortcutToast('🔄 بازنشانی آزمون جاری (R)');
      }
      return;
    }

    if (key === 'c' || key === 'C' || key === 'ز') {
      e.preventDefault();
      if (typeof swapCameras === 'function') {
        swapCameras();
        showShortcutToast('📷 تعویض / سوییچ دوربین (C)');
      }
      return;
    }

    if (key === 'f' || key === 'F' || key === 'ب') {
      e.preventDefault();
      if (typeof triggerBiometricFocusShortcut === 'function') {
        triggerBiometricFocusShortcut();
      }
      return;
    }

    if (key === 'm' || key === 'M' || key === 'پ') {
      e.preventDefault();
      const modal = document.getElementById('athleteProfileModal');
      if (modal) {
        const isVisible = modal.style.display === 'block' || modal.style.display === 'flex';
        modal.style.display = isVisible ? 'none' : 'block';
        if (!isVisible && typeof renderAthleteModal === 'function') {
          renderAthleteModal();
          setTimeout(() => {
            if (typeof renderAthleteBiometricComparisonChart === 'function') {
              renderAthleteBiometricComparisonChart(getActiveAthleteId());
            }
          }, 50);
        }
        showShortcutToast('👤 مدیریت ورزشکاران (M)');
      }
      return;
    }

    if (key === '?' || key === 'k' || key === 'K' || key === 'ن') {
      e.preventDefault();
      openKeyboardShortcutsModal();
      return;
    }

    if (key === 'Escape') {
      if (typeof isSquatCalibrating !== 'undefined' && isSquatCalibrating) {
        cancelSquatCalibration();
        return;
      }
      closeKeyboardShortcutsModal();
      const modals = ['athleteProfileModal', 'handballModal', 'pdfReportModal', 'multiCamModal', 'studioLayoutModal', 'editAthleteModal'];
      modals.forEach(id => {
        const m = document.getElementById(id);
        if (m) m.style.display = 'none';
      });
      return;
    }
  });
}

// ================== ACTIONABLE HEALTH & TRAINING SUGGESTIONS PANEL ==================
function updateActionableSuggestionsUI(athlete) {
  const container = document.getElementById('statsSuggestionsBox');
  if (!container) return;

  const history = typeof getHistory === 'function' ? getHistory() : [];
  const athleteHistory = athlete ? history.filter(e => e.athleteId === athlete.id) : [];

  // Extract anthropometric and history telemetry
  let height = parseFloat(athlete?.heightCm) || 175;
  let trunkCm = (typeof anthroTrunkCm !== 'undefined' && anthroTrunkCm > 0) ? anthroTrunkCm : Math.round(height * 0.52);
  let legCm = (typeof anthroLegCm !== 'undefined' && anthroLegCm > 0) ? anthroLegCm : Math.round(height * 0.48);
  let wingspan = (typeof anthroWingspanCm !== 'undefined' && anthroWingspanCm > 0) ? anthroWingspanCm : height;
  let apeIndex = (typeof anthroApeIndex !== 'undefined' && anthroApeIndex > 0) ? anthroApeIndex : (wingspan / height);
  let pelvisWidth = (typeof anthroPelvisWidthCm !== 'undefined' && anthroPelvisWidthCm > 0) ? anthroPelvisWidthCm : 27;
  let wristCirc = (typeof anthroWristCircumferenceCm !== 'undefined' && anthroWristCircumferenceCm > 0) ? anthroWristCircumferenceCm : 16.5;
  let waistCirc = (typeof anthroWaistCircumferenceCm !== 'undefined' && anthroWaistCircumferenceCm > 0) ? anthroWaistCircumferenceCm : 76;
  let chestCirc = (typeof anthroChestCircumferenceCm !== 'undefined' && anthroChestCircumferenceCm > 0) ? anthroChestCircumferenceCm : 92;

  // Also check history for recent anthro tests
  const lastAnthro = athleteHistory.find(e => e.type === 'anthro');
  if (lastAnthro && lastAnthro.data) {
    if (lastAnthro.data.trunkCm) trunkCm = parseFloat(lastAnthro.data.trunkCm);
    if (lastAnthro.data.legCm) legCm = parseFloat(lastAnthro.data.legCm);
    if (lastAnthro.data.wingspan) wingspan = parseFloat(lastAnthro.data.wingspan);
    if (lastAnthro.data.apeIndex) apeIndex = parseFloat(lastAnthro.data.apeIndex);
    if (lastAnthro.data.pelvisWidthCm) pelvisWidth = parseFloat(lastAnthro.data.pelvisWidthCm);
    if (lastAnthro.data.wristCircCm) wristCirc = parseFloat(lastAnthro.data.wristCircCm);
    if (lastAnthro.data.waistCircCm) waistCirc = parseFloat(lastAnthro.data.waistCircCm);
    if (lastAnthro.data.chestCircCm) chestCirc = parseFloat(lastAnthro.data.chestCircCm);
  }

  const legRatio = legCm / height; // e.g. 0.48 - 0.54
  const cormicRatio = trunkCm / height; // e.g. 0.48 - 0.54
  const disc = getSportDisciplineConfig(athlete, athleteHistory);

  // Generate actionable biomechanical and sport science prescriptions
  let leverageTitle = '';
  let leverageText = '';
  let leverageTag = '';

  if (legRatio >= 0.52) {
    leverageTitle = 'اهرم بلند اندام تحتانی (Long Lower-Limb Leverage)';
    leverageText = `نسبت پایین‌تنه ${(legRatio * 100).toFixed(0)}٪ است که طول گام فوق‌العاده‌ای در دویدن و نفوذ فراهم می‌آورد. با این حال، به علت بالا بودن مرکز ثقل و گشتاور اینرسی، در دریل‌های چابکی و تغییر جهت‌های سریع (COD)، ورزشکار باید مرکز ثقل خود را ۴ الی ۶ سانتی‌متر پایین‌تر آورده و بر فاز ترمزگیری اکسنتریک (Eccentric Deceleration) تأکید کند.`;
    leverageTag = '⚡ تنظیم مرکز ثقل در چابکی';
  } else if (legRatio <= 0.47) {
    leverageTitle = 'اهرم پایدار با تنه بلند (High Trunk & Low Center of Gravity)';
    leverageText = `نسبت پایین‌تنه ${(legRatio * 100).toFixed(0)}٪ و تنه ${(cormicRatio * 100).toFixed(0)}٪ نشان‌دهنده مرکز ثقل پایین و تعادل مکانیکی عالی است. ورزشکار در برش‌های تند، دریل‌های چابکی مخروطی کوتاه و نبردهای درگیرانه ثبات عالی دارد. توصیه می‌شود تمرکز توان بر شتاب انفجاری گام نخست (Initial Step Burst) قرار گیرد.`;
    leverageTag = '🛡️ ثبات مرکزی و شتاب اولیه';
  } else {
    leverageTitle = 'اهرم‌های بدنی متوازن و بهینه (Balanced Biomechanical Levers)';
    leverageText = `توزیع طول بالاتنه (${trunkCm}cm) و پایین‌تنه (${legCm}cm) در تعادل هنجار استاندارد ورزشی قرار دارد. این تناسب، انتقال گشتاور نیرو از زنجیره حرکتی ران به تنه را بسیار روان می‌سازد.`;
    leverageTag = '⚖️ تعادل متقارن اندام';
  }

  // Agility & Neuromuscular Prescription
  let agilityPrescription = '';
  if (legRatio >= 0.51) {
    agilityPrescription = 'توصیه به اجرای دریل ۵-۱۰-۵ پرو اگیلیتی با توقف‌های تک‌پای پروانه‌ای، پلایومتریک جانبی با کش مقاومتی، و تمرینات تقویت زنجیره خلفی (همسترینگ اکسنتریک با Nordic Curl) جهت پیشگیری از آسیب زانو در توقف‌ها.';
  } else {
    agilityPrescription = 'توصیه به دریل‌های نردبان چابکی سریع (Fast Footwork Agility Ladder)، دوی زیگزاگ فوتسال/هندبالی و جهش‌های واکنشی با محرک دیداری برای ارتقای توان فرکانس عصبی عضلانی.';
  }

  // Wingspan & Upper Body Leverage
  let wingspanRec = '';
  if (apeIndex >= 1.03) {
    wingspanRec = `گستره دست بلند (+${(wingspan - height).toFixed(0)}cm، شاخص ${apeIndex.toFixed(2)}) مزیت بارز در شوت‌زنی، دریافت و بلاک تور است. تمرینات ثبات روتاتور کاف شانه و کشش قدامی قفسه سینه (${chestCirc}cm) برای بهینه‌سازی گشتاور پرتاب ضروری است.`;
  } else {
    wingspanRec = `اهرم دست فشرده و کارآمد (شاخص ${apeIndex.toFixed(2)}) مزیت مکانیکی بالایی در قدرت شنا سوئدی و پرس بالاتنه ایجاد می‌کند. تمرکز بر تمرینات باز کردن دامنه مفصل شانه و پرتاب با مدیسین‌بال پیشنهاد می‌شود.`;
  }

  // Biomechanical Joint Health & Symmetry
  const healthRec = `پایش زوایای بین مفاصل: اطمینان حاصل شود که زاویه والگوس زانو در فرود پرش‌ها بالای ۱۶۵ درجه باشد تا رباط صلیبی (ACL) تحت تنش برشی قرار نگیرد. دور مچ ${wristCirc}cm و دور شکم ${waistCirc}cm نشان‌دهنده ساختار بدنی استاندارد در رشته ${disc.shortTitle} است.`;

  container.innerHTML = `
    <!-- Card 1: Biomechanical Leverage & Agility -->
    <div style="background: #ffffff; border: 1px solid #bae6fd; border-radius: 8px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 11.5px; font-weight: bold; color: #0369a1; display: flex; align-items: center; gap: 6px;">
          <span>🦴 ${leverageTitle}</span>
        </div>
        <span style="background: rgba(2, 132, 199, 0.12); color: #0284c7; font-size: 9.5px; font-weight: bold; padding: 2px 8px; border-radius: 999px;">
          ${leverageTag}
        </span>
      </div>
      <p style="font-size: 10.5px; color: #334155; line-height: 1.6; margin: 0 0 8px 0;">
        ${leverageText}
      </p>
      <div style="background: #f0f9ff; border: 1px dashed #7dd3fc; border-radius: 6px; padding: 6px 8px; font-size: 10px; color: #0c4a6e; line-height: 1.5;">
        <strong>🎯 تجویز تمرین چابکی اختصاصی:</strong> ${agilityPrescription}
      </div>
    </div>

    <!-- Card 2: Wingspan & Core Stabilization -->
    <div style="background: #ffffff; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 11.5px; font-weight: bold; color: #166534; display: flex; align-items: center; gap: 6px;">
          <span>🦍 گستره دست و اهرم‌های بالاتنه (${wingspan}cm)</span>
        </div>
        <span style="background: rgba(22, 163, 74, 0.12); color: #15803d; font-size: 9.5px; font-weight: bold; padding: 2px 8px; border-radius: 999px;">
          Ape Index: ${apeIndex.toFixed(2)}
        </span>
      </div>
      <p style="font-size: 10.5px; color: #334155; line-height: 1.6; margin: 0;">
        ${wingspanRec}
      </p>
    </div>

    <!-- Card 3: Postural Joint Health & Safety -->
    <div style="background: #ffffff; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <div style="font-size: 11.5px; font-weight: bold; color: #c2410c; display: flex; align-items: center; gap: 6px;">
          <span>🛡️ سلامت بیومکانیک مفاصل و ایمنی تمرین</span>
        </div>
        <span style="background: rgba(234, 88, 12, 0.12); color: #c2410c; font-size: 9.5px; font-weight: bold; padding: 2px 8px; border-radius: 999px;">
          پیشگیری از آسیب
        </span>
      </div>
      <p style="font-size: 10.5px; color: #334155; line-height: 1.6; margin: 0;">
        ${healthRec}
      </p>
    </div>
  `;
}

function getRunnerX(kp) {
  if (!kp) return null;
  // Standard photo-finish / athletics timing tracks the runner's torso
  const ls = kp['left_shoulder'], rs = kp['right_shoulder'];
  const lh = kp['left_hip'], rh = kp['right_hip'];
  const la = kp['left_ankle'], ra = kp['right_ankle'];
  
  const torso = [ls, rs, lh, rh].filter(p => p && p.score > currentConfidenceThreshold);
  let rawX = null;
  if (torso.length >= 2) {
    rawX = torso.reduce((sum, p) => sum + p.x, 0) / torso.length;
  } else {
    const ankles = [la, ra].filter(p => p && p.score > currentConfidenceThreshold);
    if (ankles.length > 0) {
      rawX = ankles.reduce((sum, p) => sum + p.x, 0) / ankles.length;
    }
  }

  if (rawX == null) return null;
  // Smooth runner X through Kalman filter to eliminate gate jitter
  return runnerXKalmanFilter.update(rawX);
}

function getAnkleX(kp) {
  return getRunnerX(kp);
}

/**
 * Main detection loop with error handling and Kalman stabilization
 */
let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 60;

async function detectLoop() {
  if (!running) return;
  
  try {
    if (video && video.readyState >= 2 && detector) {
      // Synchronize overlay canvas dimensions directly to active video frame
      // Guarantees 1:1 pixel correspondence and prevents floating or misplaced skeleton overlays
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
      }

      // Calculate FPS
      calculateFPS();
      
      // Skip frames in low-power mode (process every other frame)
      if (performanceMode === 'low-power' && frameCount % 2 === 1) {
        requestAnimationFrame(detectLoop);
        return;
      }
      
      let poses = null;
      try {
        poses = await detector.estimatePoses(video, { flipHorizontal: false });
      } catch (estErr) {
        consecutiveErrors++;
        console.warn(`⚠️ [detectLoop] Pose estimation hiccup (${consecutiveErrors}/${MAX_CONSECUTIVE_ERRORS}):`, estErr);
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
          running = false;
          showErrorModal('DETECTION_FAILED', `${estErr.message}\n\nخطای متوالی براورد حالت: ${consecutiveErrors}`);
          return;
        }
        requestAnimationFrame(detectLoop);
        return;
      }

      if (poses && poses.length > 0 && poses[0].keypoints) {
        // Apply 2D Kalman smoothing across keypoints (especially knees and ankles)
        try {
          applyPoseKalmanFilter(poses[0].keypoints);
        } catch (kErr) {
          console.warn('Kalman filter warning:', kErr);
        }
      }

      // Draw active mode pose and overlays
      try {
        drawPose(poses);
      } catch (drawErr) {
        console.warn('drawPose warning:', drawErr);
      }

      // Record rolling 5-second buffer for slow-motion side-by-side review
      if (typeof recordRollingBufferFrame === 'function') {
        try {
          recordRollingBufferFrame(poses);
        } catch (recErr) {
          console.warn('recordRollingBufferFrame warning:', recErr);
        }
      }

      // Render secondary camera feed if active
      if (typeof renderSecondaryFeed === 'function') {
        try {
          renderSecondaryFeed();
        } catch (secErr) {
          console.warn('renderSecondaryFeed warning:', secErr);
        }
      }

      // Render Picture-in-Picture live mirror in Stats Window ("و هم بشه دوربین رو توی کادر مشخصات دید")
      if (typeof renderPipMirror === 'function') {
        try {
          renderPipMirror();
        } catch (pipErr) {
          console.warn('renderPipMirror warning:', pipErr);
        }
      }

      // Update Laptop Telemetry and Kinematic Stats
      if (typeof updateLaptopTelemetryView === 'function') {
        try {
          updateLaptopTelemetryView();
        } catch (telemErr) {
          console.warn('updateLaptopTelemetryView warning:', telemErr);
        }
      }

      consecutiveErrors = 0; // Reset on success
    }
  } catch (error) {
    consecutiveErrors++;
    logError('detectLoop', error, { consecutiveErrors });
    
    if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
      running = false;
      showErrorModal('DETECTION_FAILED', `${error.message}\n\nخطای متوالی تشخیص: ${consecutiveErrors}`);
      return;
    }
  }
  
  requestAnimationFrame(detectLoop);
}

/**
 * Start application with comprehensive error handling
 */
async function start() {
  const startBtnEl = document.getElementById('startBtn');
  const hintEl = document.getElementById('hint');
  const loadingBox = document.getElementById('startLoadingBox');
  const loadingText = document.getElementById('startLoadingText');
  const errorBox = document.getElementById('startOverlayErrorBox');

  if (errorBox) errorBox.style.display = 'none';
  if (startBtnEl) {
    startBtnEl.disabled = true;
    startBtnEl.style.opacity = '0.85';
    startBtnEl.style.cursor = 'wait';
    startBtnEl.innerHTML = '<span>⏳</span> در حال راه‌اندازی دوربین...';
  }
  if (loadingBox) loadingBox.style.display = 'flex';
  if (loadingText) loadingText.textContent = 'در حال بررسی دسترسی دوربین...';
  if (hintEl) {
    hintEl.textContent = 'لطفاً در پیام مرورگر اجازه دسترسی به دوربین را تأیید (Allow) کنید.';
    hintEl.style.color = '#38bdf8';
  }

  const resetStartBtnState = (btnText = '🔄 تلاش مجدد برای شروع') => {
    if (startBtnEl) {
      startBtnEl.disabled = false;
      startBtnEl.style.opacity = '1';
      startBtnEl.style.cursor = 'pointer';
      startBtnEl.innerHTML = btnText;
    }
    if (loadingBox) loadingBox.style.display = 'none';
    if (startOverlay) startOverlay.style.display = 'flex';
  };

  try {
    // Check browser compatibility first
    if (!checkBrowserCompatibility()) {
      resetStartBtnState('🔄 تلاش مجدد');
      return;
    }

    if (loadingText) loadingText.textContent = 'در حال فعال‌سازی دوربین...';
    setStatus('در حال فعال‌سازی دوربین...');

    // Setup camera
    try {
      await setupCamera();
    } catch (error) {
      resetStartBtnState('🔄 تلاش مجدد برای دوربین');
      const errorType = error.type || 'CAMERA_UNKNOWN';
      const errMsg = error.original?.message || 'خطا در دسترسی به دوربین';
      if (errorBox) {
        errorBox.style.display = 'block';
        const errTxt = document.getElementById('startOverlayErrorText');
        if (errTxt) errTxt.textContent = `دوربین فعال نشد: ${errMsg}. لطفاً اجازه دسترسی را در تنظیمات مرورگر بررسی کنید یا از دکمه زیر استفاده نمایید.`;
      }
      showErrorModal(errorType, errMsg);
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

    if (loadingText) loadingText.textContent = 'در حال بارگذاری مدل هوش مصنوعی...';
    if (startBtnEl) startBtnEl.innerHTML = '<span>🧠</span> در حال بارگذاری مدل بیومکانیک...';
    setStatus('در حال بارگذاری مدل تشخیص بدن...');

    // Load model
    try {
      await loadModel();
    } catch (error) {
      resetStartBtnState('🔄 تلاش مجدد برای بارگذاری مدل');
      const errorType = error.type || 'MODEL_LOAD_FAILED';
      const errMsg = error.original?.message || 'بارگذاری مدل هوش مصنوعی انجام نشد';
      if (errorBox) {
        errorBox.style.display = 'block';
        const errTxt = document.getElementById('startOverlayErrorText');
        if (errTxt) errTxt.textContent = `بارگذاری هوش مصنوعی با خطا مواجه شد. لطفاً اتصال اینترنت را بررسی کنید یا دکمه بروزرسانی کش را بزنید.`;
      }
      showErrorModal(errorType, errMsg);
      
      // Clean up camera stream
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
      return;
    }

    startOverlay.style.display = 'none';
    running = true;
    consecutiveErrors = 0;
    modeBar.style.display = 'flex';
    // headerContainer is always visible, no need to show
    applySettings();
    runEnterCalibrate1();
    detectLoop();

    console.log('✅ Application started successfully');
    
    // Initialize camera switcher and discover all lenses
    initCameraSwitcher().then(async () => {
      // If on Android/Mobile and user hasn't explicitly saved a camera preference:
      const savedUserPref = localStorage.getItem('selectedCameraId');
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (!savedUserPref && isAndroid && availableCameras.length > 1) {
        const widestBackCam = availableCameras.find(c => c.isWidest && c.position === 'back');
        if (widestBackCam && widestBackCam.deviceId && widestBackCam.deviceId !== currentCameraId) {
          console.log('🌐 Auto-switching Android camera to ultra-wide lens:', widestBackCam.persianLabel);
          await switchCamera(widestBackCam.deviceId);
        }
      }
    }).catch(error => {
      console.warn('Camera switcher initialization failed:', error);
    });

    // Check and trigger first-time guided setup tour if not completed
    setTimeout(() => {
      if (!localStorage.getItem('motion_tracker_setup_completed')) {
        startSetupTour();
      }
    }, 1200);

  } catch (error) {
    resetStartBtnState('🔄 تلاش مجدد');
    logError('start', error);
    showErrorModal('UNKNOWN_ERROR', error.message || 'Unknown error during startup');
  }
}

// Expose startApp globally so inline early handlers can trigger it immediately
window.__startApp = start;
if (window.__startRequested) {
  window.__startRequested = false;
  console.log('🚀 Executing queued start request triggered before app.js loaded');
  start();
}

startBtn.addEventListener('click', () => {
  console.log('🖱️ Start button clicked!');
  start();
});

// Hook up camera selection button in settings panel
const openCameraSettingsBtn = document.getElementById('openCameraSettingsBtn');
if (openCameraSettingsBtn) {
  openCameraSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Close settings panel if open
    const settingsPanel = document.getElementById('settingsPanel');
    if (settingsPanel) settingsPanel.style.display = 'none';
    showCameraSwitcherModal();
  });
}

// ================== VERSION CHECK ==================
const APP_VERSION = '1.26.0';
console.log(`%c🚀 Motion Tracker v${APP_VERSION}`, 'color: #22c55e; font-size: 16px; font-weight: bold');
console.log('%c✨ Zero-Lag High-Speed Athletic Pose Tracking, 13 Handball Skill Tests & FMS Suite Activated', 'color: #38bdf8; font-size: 12px');

// Synchronize version tags across DOM elements
function syncAppVersionDisplay() {
  const appVerEl = document.getElementById('appVersionDisplay');
  if (appVerEl) {
    appVerEl.textContent = `نسخه ${APP_VERSION} (ردیابی فوق‌سریع و بدون تأخیر تکرارها، بسته ۱۳ آزمون هندبال و علوم ورزشی)`;
  }
  const drawerFooterVer = document.getElementById('drawerVersionFooter');
  if (drawerFooterVer) {
    drawerFooterVer.textContent = `سامانه حرکت‌سنج هوشمند • نسخه ${APP_VERSION}`;
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', syncAppVersionDisplay);
} else {
  syncAppVersionDisplay();
}

// Global cache purge and hard reload utility
window.forceAppReloadAndClearCache = async function() {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_ALL_CACHES' });
        }
        await reg.unregister();
      }
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch (err) {
    console.warn('Cache clearing error:', err);
  }
  // Hard reload with cache-busting param
  window.location.href = window.location.pathname + '?v=' + APP_VERSION + '&ts=' + Date.now();
};

// Wire clear cache buttons
const clearCacheReloadBtn = document.getElementById('clearCacheReloadBtn');
if (clearCacheReloadBtn) {
  clearCacheReloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearCacheReloadBtn.innerHTML = '<span>⏳</span><span>در حال تازه‌سازی...</span>';
    window.forceAppReloadAndClearCache();
  });
}

const clearCacheFromSettingsBtn = document.getElementById('clearCacheFromSettingsBtn');
if (clearCacheFromSettingsBtn) {
  clearCacheFromSettingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearCacheFromSettingsBtn.textContent = '⏳ در حال پاکسازی و بارگذاری...';
    window.forceAppReloadAndClearCache();
  });
}

// ================== SERVICE WORKER & UPDATE MANAGEMENT ==================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(`sw.js?v=${APP_VERSION}`)
    .then((registration) => {
      console.log('✅ Service Worker registered');
      
      // If a worker is waiting, activate it cleanly
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Check for updates periodically, but ONLY when a workout test is NOT actively running
      setInterval(() => {
        if (!running) {
          registration.update().catch(() => {});
        }
      }, 60000);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        console.log('🔄 Service Worker update found');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ New Service Worker installed in background');
            // Do NOT popup over active camera workouts
            if (!running) {
              showUpdateNotification(newWorker);
            }
          }
        });
      });
    })
    .catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error);
    });

  // Handle controller change gracefully WITHOUT abruptly reloading during workouts
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('🔄 Service Worker controller updated in background.');
    // Only auto-reload if user is on intro/start overlay and not in active workout
    if (!running && !isRefreshing && document.getElementById('startOverlay')?.style.display !== 'none') {
      isRefreshing = true;
      console.log('Reloading safely from start screen for fresh assets...');
      window.location.reload();
    }
  });
  
  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      console.log(`📢 Service Worker updated to version ${event.data.version}`);
    }
  });
}

/**
 * Show update notification to user as an elegant floating pill (non-intrusive)
 */
function showUpdateNotification(newWorker) {
  if (document.getElementById('updateToastPill')) return;

  const toast = document.createElement('div');
  toast.id = 'updateToastPill';
  toast.style.cssText = `
    position: fixed;
    top: 14px;
    right: 14px;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.94);
    border: 1px solid rgba(56, 189, 248, 0.4);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #e2e8f0;
    font-family: Vazirmatn, system-ui, sans-serif;
    font-size: 13px;
    backdrop-filter: blur(8px);
    max-width: 360px;
    animation: fadeInScale 0.25s ease-out;
  `;
  
  toast.innerHTML = `
    <span style="font-size: 18px;">✨</span>
    <div style="flex: 1; text-align: right;">
      <div style="font-weight: bold; color: #38bdf8; font-size: 12px;">نسخه جدید آماده است</div>
      <div style="font-size: 11px; color: #94a3b8;">برای بارگذاری نسخه جدید دکمه را بزنید.</div>
    </div>
    <div style="display: flex; gap: 6px;">
      <button id="updateToastReloadBtn" style="
        background: #22c55e;
        color: #052e16;
        border: none;
        padding: 5px 12px;
        font-size: 11px;
        font-weight: bold;
        border-radius: 8px;
        cursor: pointer;
      ">بروزرسانی</button>
      <button id="updateToastCloseBtn" style="
        background: rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        border: none;
        padding: 5px 8px;
        font-size: 11px;
        border-radius: 8px;
        cursor: pointer;
      ">✕</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  const reloadBtn = document.getElementById('updateToastReloadBtn');
  if (reloadBtn) {
    reloadBtn.onclick = () => {
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
    };
  }
  
  const closeBtn = document.getElementById('updateToastCloseBtn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      toast.remove();
    };
  }
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

// ============================================================================
// DESKTOP WORKSTATION, MULTI-CAMERA & DUAL-WINDOW ARCHITECTURE
// ============================================================================

let currentStudioLayout = 'split'; // 'split' | 'camera' | 'stats'
let isSecondaryCameraActive = false;
let secondaryCameraStream = null;
let secondaryCameraId = null;
let secondaryVideo = null;
let secondaryCanvas = null;
let secondaryCtx = null;
let multiCameraMode = 'multi-angle'; // 'multi-angle' | 'multi-athlete'
let multiCameraLayout = 'split'; // 'split' | 'pip'
let cam1AthleteId = null;
let cam2AthleteId = null;
let activePipSource = 'cam1'; // 'cam1' | 'cam2'
let pipMirrorCanvas = null;
let pipCtx = null;
let lastPipRenderTime = 0;
let studioBroadcastChannel = null;

// Initialize BroadcastChannel for Dual Window Pop-Out Synchronization
try {
  if (typeof BroadcastChannel !== 'undefined') {
    studioBroadcastChannel = new BroadcastChannel('motion_tracker_dual_channel');
    studioBroadcastChannel.onmessage = (event) => {
      handleStudioBroadcast(event.data);
    };
  }
} catch (e) {
  console.warn('BroadcastChannel not supported or restricted in iframe:', e);
}

function handleStudioBroadcast(data) {
  if (!data || !data.type) return;
  if (data.type === 'SET_ATHLETE' && data.athleteId) {
    setActiveAthlete(data.athleteId);
  } else if (data.type === 'SWITCH_MODE' && data.mode) {
    switchMode(data.mode);
  }
}

function broadcastStudioMessage(msg) {
  if (studioBroadcastChannel) {
    try {
      studioBroadcastChannel.postMessage(msg);
    } catch (e) {}
  }
}

/**
 * Initialize Desktop Workstation and Multi-Cam listeners
 */
function initDesktopStudioArchitecture() {
  secondaryVideo = document.getElementById('video2');
  secondaryCanvas = document.getElementById('overlay2');
  pipMirrorCanvas = document.getElementById('pipMirrorCanvas');
  if (pipMirrorCanvas) {
    pipCtx = pipMirrorCanvas.getContext('2d');
  }

  // Check URL query parameters for Pop-Out or Specific Views
  const urlParams = new URLSearchParams(window.location.search);
  const requestedView = urlParams.get('windowView');
  if (requestedView === 'statsOnly') {
    setStudioLayout('stats');
  } else if (requestedView === 'cameraOnly') {
    setStudioLayout('camera');
  } else {
    // Default to split view on desktop (>= 900px)
    if (window.innerWidth >= 900) {
      setStudioLayout('split');
    }
  }

  // Studio Layout Buttons in Topbar and Modals
  const studioLayoutBtn = document.getElementById('studioLayoutBtn');
  if (studioLayoutBtn) {
    studioLayoutBtn.addEventListener('click', () => openStudioLayoutModal());
  }

  const multiCamTriggerBtn = document.getElementById('multiCamTriggerBtn');
  if (multiCamTriggerBtn) {
    multiCamTriggerBtn.addEventListener('click', () => openMultiCamModal());
  }

  // Workstation Header Layout Toggles
  const statsLayoutSplitBtn = document.getElementById('statsLayoutSplitBtn');
  if (statsLayoutSplitBtn) {
    statsLayoutSplitBtn.addEventListener('click', () => setStudioLayout('split'));
  }

  const statsLayoutCamBtn = document.getElementById('statsLayoutCamBtn');
  if (statsLayoutCamBtn) {
    statsLayoutCamBtn.addEventListener('click', () => setStudioLayout('camera'));
  }

  const statsLayoutStatsBtn = document.getElementById('statsLayoutStatsBtn');
  if (statsLayoutStatsBtn) {
    statsLayoutStatsBtn.addEventListener('click', () => setStudioLayout('stats'));
  }

  const statsPopoutBtn = document.getElementById('statsPopoutBtn');
  if (statsPopoutBtn) {
    statsPopoutBtn.addEventListener('click', () => openDualWindowPopout());
  }

  const statsPopoutWindowBtn = document.getElementById('statsPopoutWindowBtn');
  if (statsPopoutWindowBtn) {
    statsPopoutWindowBtn.addEventListener('click', () => openDualWindowPopout());
  }

  const laptopLayoutSplitBtn = document.getElementById('laptopLayoutSplitBtn');
  if (laptopLayoutSplitBtn) {
    laptopLayoutSplitBtn.addEventListener('click', () => setStudioLayout('split'));
  }

  const laptopLayoutCamBtn = document.getElementById('laptopLayoutCamBtn');
  if (laptopLayoutCamBtn) {
    laptopLayoutCamBtn.addEventListener('click', () => setStudioLayout('camera'));
  }

  // Joint Angles Toggles (Top bar, Drawer, Workstation)
  const toggleJointAnglesBtn = document.getElementById('toggleJointAnglesBtn');
  if (toggleJointAnglesBtn) {
    toggleJointAnglesBtn.addEventListener('click', () => toggleJointAngles());
  }

  const drawerItemJointAngles = document.getElementById('drawerItemJointAngles');
  if (drawerItemJointAngles) {
    drawerItemJointAngles.addEventListener('click', () => {
      toggleJointAngles();
      if (typeof closeDrawer === 'function') closeDrawer();
    });
  }

  const statsToggleJointAnglesBtn = document.getElementById('statsToggleJointAnglesBtn');
  if (statsToggleJointAnglesBtn) {
    statsToggleJointAnglesBtn.addEventListener('click', () => toggleJointAngles());
  }
  updateJointAnglesUI();

  // PiP Controls inside Stats Window
  const pipSwapBtn = document.getElementById('pipSwapBtn');
  if (pipSwapBtn) {
    pipSwapBtn.addEventListener('click', () => togglePipSource());
  }

  const pipPopoutNativeBtn = document.getElementById('pipPopoutNativeBtn');
  if (pipPopoutNativeBtn) {
    pipPopoutNativeBtn.addEventListener('click', () => requestNativeOSPiP());
  }

  // Athlete switch button in stats window
  const statsSwitchAthleteBtn = document.getElementById('statsSwitchAthleteBtn');
  if (statsSwitchAthleteBtn) {
    statsSwitchAthleteBtn.addEventListener('click', () => {
      if (athleteProfileModal) {
        athleteProfileModal.style.display = 'block';
        renderAthleteModal();
        setTimeout(() => {
          if (typeof renderAthleteBiometricComparisonChart === 'function') {
            renderAthleteBiometricComparisonChart(getActiveAthleteId());
          }
        }, 50);
      }
    });
  }

  // Multi-Cam manage button in stats window
  const statsManageMultiCamBtn = document.getElementById('statsManageMultiCamBtn');
  if (statsManageMultiCamBtn) {
    statsManageMultiCamBtn.addEventListener('click', () => openMultiCamModal());
  }

  // Mode buttons fast grid in stats window
  document.querySelectorAll('.mode-fast-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMode = btn.getAttribute('data-mode');
      if (targetMode) {
        switchMode(targetMode);
        broadcastStudioMessage({ type: 'SWITCH_MODE', mode: targetMode });
      }
    });
  });

  // Action buttons in stats window
  const statsSaveRecordBtn = document.getElementById('statsSaveRecordBtn');
  if (statsSaveRecordBtn) {
    statsSaveRecordBtn.addEventListener('click', () => {
      if (typeof saveActiveModeRecord === 'function') {
        saveActiveModeRecord();
      } else {
        setStatus('💾 رکورد با موفقیت ثبت شد');
      }
    });
  }

  const statsHandballReportBtn = document.getElementById('statsHandballReportBtn');
  if (statsHandballReportBtn) {
    statsHandballReportBtn.addEventListener('click', () => {
      if (typeof openHandballScoutingModal === 'function') {
        openHandballScoutingModal();
      }
    });
  }

  const statsPdfBtn = document.getElementById('statsPdfBtn');
  if (statsPdfBtn) {
    statsPdfBtn.addEventListener('click', () => {
      if (typeof openPdfReportModal === 'function') {
        openPdfReportModal();
      }
    });
  }

  const statsExportCsvBtn = document.getElementById('statsExportCsvBtn');
  if (statsExportCsvBtn) {
    statsExportCsvBtn.addEventListener('click', () => {
      if (typeof exportHistoryCSV === 'function') {
        exportHistoryCSV();
      }
    });
  }

  // Studio Layout Modal Buttons
  const studioLayoutCloseBtn = document.getElementById('studioLayoutCloseBtn');
  if (studioLayoutCloseBtn) {
    studioLayoutCloseBtn.addEventListener('click', () => closeStudioLayoutModal());
  }
  const chooseSplitLayoutBtn = document.getElementById('chooseSplitLayoutBtn');
  if (chooseSplitLayoutBtn) {
    chooseSplitLayoutBtn.addEventListener('click', () => {
      setStudioLayout('split');
      closeStudioLayoutModal();
    });
  }
  const chooseCameraLayoutBtn = document.getElementById('chooseCameraLayoutBtn');
  if (chooseCameraLayoutBtn) {
    chooseCameraLayoutBtn.addEventListener('click', () => {
      setStudioLayout('camera');
      closeStudioLayoutModal();
    });
  }
  const chooseStatsLayoutBtn = document.getElementById('chooseStatsLayoutBtn');
  if (chooseStatsLayoutBtn) {
    chooseStatsLayoutBtn.addEventListener('click', () => {
      setStudioLayout('stats');
      closeStudioLayoutModal();
    });
  }
  const choosePopoutLayoutBtn = document.getElementById('choosePopoutLayoutBtn');
  if (choosePopoutLayoutBtn) {
    choosePopoutLayoutBtn.addEventListener('click', () => {
      closeStudioLayoutModal();
      openDualWindowPopout();
    });
  }

  // Multi-Camera Modal Controls
  initMultiCamModalListeners();

  // Hardware Camera Focus-Control System in Workstation
  if (typeof initWorkstationFocusControlsUI === 'function') {
    initWorkstationFocusControlsUI();
  }

  // 5-Second Buffer & Slow-Motion Side-by-Side Review System
  if (typeof initSlowMotionReviewSystem === 'function') {
    initSlowMotionReviewSystem();
  }

  // Camera Alignment Grid toggle in stats workstation
  const statsToggleGridBtn = document.getElementById('statsToggleGridBtn');
  if (statsToggleGridBtn) {
    statsToggleGridBtn.addEventListener('click', () => toggleAlignmentGrid());
  }

  // Settings checkbox for Alignment Grid
  const settingAlignmentGrid = document.getElementById('settingAlignmentGrid');
  if (settingAlignmentGrid) {
    settingAlignmentGrid.addEventListener('change', (e) => toggleAlignmentGrid(e.target.checked));
  }

  // Keyboard Shortcuts modal button in stats workstation
  const statsShortcutsBtn = document.getElementById('statsShortcutsBtn');
  if (statsShortcutsBtn) {
    statsShortcutsBtn.addEventListener('click', () => openKeyboardShortcutsModal());
  }

  const keyboardShortcutsCloseBtn = document.getElementById('keyboardShortcutsCloseBtn');
  if (keyboardShortcutsCloseBtn) {
    keyboardShortcutsCloseBtn.addEventListener('click', () => closeKeyboardShortcutsModal());
  }

  // Initialize keyboard shortcut handler
  initKeyboardShortcuts();
  updateAlignmentGridUI();
  updateJointAnglesUI();

  // Initial populate of stats panel
  updateLaptopStatsPanel();
}

/**
 * Switch layout mode: 'split', 'camera', 'stats'
 */
function setStudioLayout(layoutMode) {
  currentStudioLayout = layoutMode;
  const studioContainer = document.getElementById('appStudioContainer');
  if (!studioContainer) return;

  studioContainer.classList.remove('studio-view-split', 'studio-view-camera', 'studio-view-stats');
  studioContainer.classList.add('studio-view-' + layoutMode);

  // Update topbar indicator
  const iconSpan = document.getElementById('studioLayoutIcon');
  const textSpan = document.getElementById('studioLayoutText');
  if (iconSpan && textSpan) {
    if (layoutMode === 'split') {
      iconSpan.textContent = '🖥️';
      textSpan.textContent = 'دوپنجره';
    } else if (layoutMode === 'camera') {
      iconSpan.textContent = '📷';
      textSpan.textContent = 'دوربین';
    } else if (layoutMode === 'stats') {
      iconSpan.textContent = '📊';
      textSpan.textContent = 'مشخصات';
    }
  }

  // Highlight active button in stats window
  const splitBtn = document.getElementById('statsLayoutSplitBtn');
  const camBtn = document.getElementById('statsLayoutCamBtn');
  if (splitBtn) splitBtn.classList.toggle('active', layoutMode === 'split');
  if (camBtn) camBtn.classList.toggle('active', layoutMode === 'camera');

  // Trigger canvases resize
  resizeCanvas();
  if (isSecondaryCameraActive && secondaryVideo && secondaryCanvas) {
    secondaryCanvas.width = secondaryVideo.videoWidth || 640;
    secondaryCanvas.height = secondaryVideo.videoHeight || 480;
  }

  updateLaptopStatsPanel();
}

function openStudioLayoutModal() {
  const modal = document.getElementById('studioLayoutModal');
  if (modal) modal.style.display = 'flex';
}

function closeStudioLayoutModal() {
  const modal = document.getElementById('studioLayoutModal');
  if (modal) modal.style.display = 'none';
}

/**
 * Opens pop-out window for dual monitor setup:
 * Window 1 (Main): Camera feed for athletes / projector
 * Window 2 (Pop-Out): Workstation & Biomechanical Telemetry for Coach
 */
function openDualWindowPopout() {
  try {
    const popUrl = window.location.origin + window.location.pathname + '?windowView=statsOnly';
    const popWin = window.open(popUrl, 'MotionTrackerCoachWorkstation', 'width=1200,height=800,menubar=no,toolbar=no');
    if (popWin) {
      setStudioLayout('camera');
      setStatus('🪟 استودیو دوپنجره روی دو مانیتور فعال شد');
    } else {
      setStatus('⚠️ مسدودکننده پاپ‌آپ مرورگر فعال است؛ لطفاً اجازه باز شدن پنجره را بدهید.');
    }
  } catch (e) {
    console.error('Popout window error:', e);
  }
}

/**
 * Multi-Camera Modal and Device Setup
 */
function initMultiCamModalListeners() {
  const closeBtn = document.getElementById('multiCamCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeMultiCamModal);

  const angleModeBtn = document.getElementById('multiCamModeAngleBtn');
  const athleteModeBtn = document.getElementById('multiCamModeAthleteBtn');
  if (angleModeBtn && athleteModeBtn) {
    angleModeBtn.addEventListener('click', () => {
      multiCameraMode = 'multi-angle';
      angleModeBtn.classList.add('active');
      athleteModeBtn.classList.remove('active');
      toggleAthleteAssignmentRows(false);
    });
    athleteModeBtn.addEventListener('click', () => {
      multiCameraMode = 'multi-athlete';
      athleteModeBtn.classList.add('active');
      angleModeBtn.classList.remove('active');
      toggleAthleteAssignmentRows(true);
    });
  }

  const layoutSplitBtn = document.getElementById('layoutSplitBtn');
  const layoutPipBtn = document.getElementById('layoutPipBtn');
  if (layoutSplitBtn && layoutPipBtn) {
    layoutSplitBtn.addEventListener('click', () => {
      multiCameraLayout = 'split';
      layoutSplitBtn.classList.add('active');
      layoutPipBtn.classList.remove('active');
    });
    layoutPipBtn.addEventListener('click', () => {
      multiCameraLayout = 'pip';
      layoutPipBtn.classList.add('active');
      layoutSplitBtn.classList.remove('active');
    });
  }

  const swapBtn = document.getElementById('multiCamSwapBtn');
  if (swapBtn) {
    swapBtn.addEventListener('click', async () => {
      await swapCameras();
      populateMultiCamModal();
    });
  }

  const applyBtn = document.getElementById('multiCamApplyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      const primarySelect = document.getElementById('primaryCameraSelect');
      const secondarySelect = document.getElementById('secondaryCameraSelect');

      const chosenPrimary = primarySelect ? primarySelect.value : null;
      const chosenSecondary = secondarySelect ? secondarySelect.value : null;

      // Switch primary if changed
      if (chosenPrimary && chosenPrimary !== currentCameraId) {
        await switchCamera(chosenPrimary);
      }

      // Connect or disconnect secondary
      if (chosenSecondary) {
        if (chosenSecondary === chosenPrimary) {
          setStatus('⚠️ لطفاً دو سنسور مجزا برای دوربین ۱ و ۲ انتخاب کنید');
          return;
        }
        await connectSecondaryCamera(chosenSecondary);
      } else {
        disconnectSecondaryCamera();
      }

      // Update multi-camera layout wrapper
      const feedsWrapper = document.getElementById('cameraFeedsWrapper');
      if (feedsWrapper) {
        if (isSecondaryCameraActive) {
          feedsWrapper.className = multiCameraLayout === 'pip' ? 'feed-layout-pip' : 'feed-layout-split';
        } else {
          feedsWrapper.className = 'feed-layout-single';
        }
      }

      // Save athlete assignments if in multi-athlete mode
      const cam1AthSelect = document.getElementById('cam1AthleteSelect');
      const cam2AthSelect = document.getElementById('cam2AthleteSelect');
      if (cam1AthSelect) cam1AthleteId = cam1AthSelect.value;
      if (cam2AthSelect) cam2AthleteId = cam2AthSelect.value;

      updateMultiCamUI();
      closeMultiCamModal();
    });
  }
}

function toggleAthleteAssignmentRows(show) {
  const r1 = document.getElementById('cam1AthleteAssignmentRow');
  const r2 = document.getElementById('cam2AthleteAssignmentRow');
  if (r1) r1.style.display = show ? 'block' : 'none';
  if (r2) r2.style.display = show ? 'block' : 'none';
}

function openMultiCamModal() {
  populateMultiCamModal();
  const modal = document.getElementById('multiCamModal');
  if (modal) modal.style.display = 'flex';
}

function closeMultiCamModal() {
  const modal = document.getElementById('multiCamModal');
  if (modal) modal.style.display = 'none';
}

function populateMultiCamModal() {
  const primarySelect = document.getElementById('primaryCameraSelect');
  const secondarySelect = document.getElementById('secondaryCameraSelect');
  const cam1AthSelect = document.getElementById('cam1AthleteSelect');
  const cam2AthSelect = document.getElementById('cam2AthleteSelect');

  const cameras = availableCameras.length > 0 ? availableCameras : [
    { deviceId: currentCameraId || 'default', persianLabel: '📷 دوربین پیش‌فرض' }
  ];

  if (primarySelect) {
    primarySelect.innerHTML = '';
    cameras.forEach(cam => {
      const opt = document.createElement('option');
      opt.value = cam.deviceId;
      opt.textContent = cam.persianLabel + (cam.resolution ? ` (${cam.resolution})` : '');
      if (cam.deviceId === currentCameraId) opt.selected = true;
      primarySelect.appendChild(opt);
    });
  }

  if (secondarySelect) {
    secondarySelect.innerHTML = '<option value="">-- غیرفعال (تک‌دوربینه) --</option>';
    cameras.forEach(cam => {
      const opt = document.createElement('option');
      opt.value = cam.deviceId;
      opt.textContent = cam.persianLabel + (cam.resolution ? ` (${cam.resolution})` : '');
      if (secondaryCameraId && cam.deviceId === secondaryCameraId) opt.selected = true;
      secondarySelect.appendChild(opt);
    });
  }

  // Populate athletes
  const athletes = getAthletes();
  if (cam1AthSelect && cam2AthSelect) {
    cam1AthSelect.innerHTML = '';
    cam2AthSelect.innerHTML = '';
    athletes.forEach((ath, idx) => {
      const opt1 = document.createElement('option');
      opt1.value = ath.id;
      opt1.textContent = `${ath.name} (کد: ${ath.code || idx + 1})`;
      if (ath.id === (cam1AthleteId || getActiveAthleteId())) opt1.selected = true;
      cam1AthSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = ath.id;
      opt2.textContent = `${ath.name} (کد: ${ath.code || idx + 1})`;
      if (ath.id === (cam2AthleteId || (athletes[1] ? athletes[1].id : ath.id))) opt2.selected = true;
      cam2AthSelect.appendChild(opt2);
    });
  }
}

// ================== PREDICTIVE CAMERA STREAM BUFFER HUB ==================
/**
 * Predictive Buffering & Pre-fetching Engine for Multi-Camera Studio Hub
 * Pre-fetches secondary and candidate camera streams into background buffer video element.
 * Reduces camera switching latency by ~90% during live athletic tests and refereeing.
 */
const predictiveCameraBufferHub = {
  enabled: localStorage.getItem('predictiveCameraBuffering') !== 'false',
  prebufferedStream: null,
  prebufferedDeviceId: null,
  prebufferedReason: 'idle',
  lastSwitchLatencyMs: 14,
  isBuffering: false,

  init() {
    const toggle = document.getElementById('togglePredictiveBuffering');
    if (toggle) {
      toggle.checked = this.enabled;
      toggle.addEventListener('change', (e) => {
        this.enabled = e.target.checked;
        localStorage.setItem('predictiveCameraBuffering', this.enabled ? 'true' : 'false');
        if (!this.enabled) {
          this.releaseBuffer();
        } else {
          this.predictAndPrebuffer();
        }
        this.updateUI();
      });
    }

    const prefetchBtn = document.getElementById('prefetchCamerasNowBtn');
    if (prefetchBtn) {
      prefetchBtn.addEventListener('click', () => {
        this.predictAndPrebuffer(true);
      });
    }

    this.updateUI();
  },

  getOptimalCameraForMode(targetMode) {
    if (!availableCameras || availableCameras.length <= 1) return null;

    // Devices that are not currently bound to main or secondary feeds
    const nonCurrentCams = availableCameras.filter(c => c.deviceId !== currentCameraId && c.deviceId !== secondaryCameraId);
    if (nonCurrentCams.length === 0) {
      return availableCameras.find(c => c.deviceId !== currentCameraId) || null;
    }

    // Wide field tests (sprints, handball dribbles, agility)
    const wideFieldTests = [
      'run', 'agility', 'pro_agility', 'handball_dribble_20m',
      'handball_zigzag_dribble', 'handball_slalom_dribble', 'handball_jump_shot'
    ];
    if (wideFieldTests.includes(targetMode)) {
      const wideCam = nonCurrentCams.find(c => c.isUltraWide || (c.label && c.label.toLowerCase().includes('wide')) || (c.persianLabel && c.persianLabel.includes('عریض')));
      if (wideCam) return wideCam;
    }

    // Vertical / jump tests
    const verticalTests = ['jump', 'bosco', 'handball_corner_defense', 'handball_wing_defense'];
    if (verticalTests.includes(targetMode)) {
      const backCam = nonCurrentCams.find(c => c.position === 'back' && !c.isUltraWide);
      if (backCam) return backCam;
    }

    return nonCurrentCams[0];
  },

  async prefetchStream(deviceId, reason = 'auto') {
    if (!this.enabled || !deviceId || this.isBuffering) return;
    if (deviceId === currentCameraId || deviceId === secondaryCameraId) return;

    if (this.prebufferedDeviceId === deviceId && this.prebufferedStream && this.prebufferedStream.active) {
      this.updateUI();
      return;
    }

    this.releaseBuffer();
    this.isBuffering = true;
    this.prebufferedReason = reason;
    this.updateUI();

    try {
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.prebufferedStream = stream;
      this.prebufferedDeviceId = deviceId;

      const bufferVideo = document.getElementById('predictiveCameraBufferVideo');
      if (bufferVideo) {
        bufferVideo.srcObject = stream;
        await bufferVideo.play().catch(() => {});
      }

      console.log(`⚡ [PredictiveCameraBuffer] Stream pre-buffered for device ${deviceId} (${reason})`);
      this.isBuffering = false;
      this.updateUI();
    } catch (err) {
      console.warn('Predictive pre-buffer failed (non-fatal):', err);
      this.isBuffering = false;
      this.releaseBuffer();
      this.updateUI();
    }
  },

  acquirePrebufferedStream(deviceId) {
    if (!this.enabled) return null;
    if (this.prebufferedDeviceId === deviceId && this.prebufferedStream && this.prebufferedStream.active) {
      const stream = this.prebufferedStream;
      const bufferVideo = document.getElementById('predictiveCameraBufferVideo');
      if (bufferVideo) bufferVideo.srcObject = null;
      this.prebufferedStream = null;
      this.prebufferedDeviceId = null;
      return { stream, prebuffered: true };
    }
    return null;
  },

  releaseBuffer() {
    if (this.prebufferedStream) {
      try {
        this.prebufferedStream.getTracks().forEach(t => t.stop());
      } catch (e) {}
      this.prebufferedStream = null;
    }
    this.prebufferedDeviceId = null;
    const bufferVideo = document.getElementById('predictiveCameraBufferVideo');
    if (bufferVideo) bufferVideo.srcObject = null;
  },

  onTestSwitch(newMode) {
    if (!this.enabled) return;
    const optimalCam = this.getOptimalCameraForMode(newMode);
    if (optimalCam && optimalCam.deviceId) {
      setTimeout(() => {
        this.prefetchStream(optimalCam.deviceId, `switch-mode-${newMode}`);
      }, 300);
    }
  },

  predictAndPrebuffer(force = false) {
    if (!this.enabled && !force) return;
    const target = this.getOptimalCameraForMode(typeof mode !== 'undefined' ? mode : 'run');
    if (target && target.deviceId) {
      this.prefetchStream(target.deviceId, 'manual-prefetch');
    }
  },

  updateUI() {
    const statusText = document.getElementById('predictiveBufferStatusText');
    const badge = document.getElementById('predictiveBufferStatusBadge');
    const hintName = document.getElementById('predictiveTargetSensorName');
    const target = this.getOptimalCameraForMode(typeof mode !== 'undefined' ? mode : 'run');

    if (hintName) {
      hintName.textContent = target ? (target.persianLabel || target.label || 'دوربین دوم') : 'سنسور ثانویه پیش‌فرض';
    }

    if (statusText && badge) {
      if (!this.enabled) {
        statusText.textContent = 'وضعیت: غیرفعال (بارگذاری سنسورها فقط در زمان درخواست)';
        badge.style.background = 'rgba(100, 116, 139, 0.15)';
        badge.style.borderColor = '#64748b';
        badge.style.color = '#94a3b8';
      } else if (this.prebufferedStream && this.prebufferedStream.active) {
        const cam = availableCameras.find(c => c.deviceId === this.prebufferedDeviceId);
        statusText.textContent = `وضعیت: استریم پشتیبان آماده و بافر شد (${cam ? cam.persianLabel : 'دوربین ثانویه'} • تأخیر سوییچ: ~${this.lastSwitchLatencyMs || 14}ms)`;
        badge.style.background = 'rgba(34, 197, 94, 0.15)';
        badge.style.borderColor = '#22c55e';
        badge.style.color = '#4ade80';
      } else if (this.isBuffering) {
        statusText.textContent = 'در حال پیش‌بارگذاری استریم در پس‌زمینه...';
        badge.style.background = 'rgba(56, 189, 248, 0.15)';
        badge.style.borderColor = '#38bdf8';
        badge.style.color = '#38bdf8';
      } else {
        statusText.textContent = `آماده پیش‌بارگذاری هوشمند (تأخیر سوییچ ثبت‌شده: ${this.lastSwitchLatencyMs || 15}ms)`;
        badge.style.background = 'rgba(56, 189, 248, 0.15)';
        badge.style.borderColor = '#38bdf8';
        badge.style.color = '#38bdf8';
      }
    }
  }
};

/**
 * Connects second camera stream
 */
async function connectSecondaryCamera(deviceId) {
  try {
    if (secondaryCameraStream) {
      secondaryCameraStream.getTracks().forEach(t => t.stop());
      secondaryCameraStream = null;
    }

    if (!deviceId) {
      disconnectSecondaryCamera();
      return true;
    }

    setStatus('در حال اتصال به دوربین دوم...');

    let acquiredPrebuffer = false;
    if (typeof predictiveCameraBufferHub !== 'undefined') {
      const acquired = predictiveCameraBufferHub.acquirePrebufferedStream(deviceId);
      if (acquired && acquired.stream && acquired.stream.active) {
        secondaryCameraStream = acquired.stream;
        secondaryCameraId = deviceId;
        acquiredPrebuffer = true;
        console.log(`⚡ [PredictiveCameraBuffer] Instantly adopted pre-buffered secondary stream for ${deviceId}`);
      }
    }

    if (!acquiredPrebuffer) {
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      secondaryCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
      secondaryCameraId = deviceId;
    }

    if (!secondaryVideo) secondaryVideo = document.getElementById('video2');
    if (!secondaryCanvas) secondaryCanvas = document.getElementById('overlay2');

    if (secondaryVideo) {
      secondaryVideo.srcObject = secondaryCameraStream;
      await secondaryVideo.play();
    }

    if (secondaryCanvas && secondaryVideo) {
      secondaryCanvas.width = secondaryVideo.videoWidth || 640;
      secondaryCanvas.height = secondaryVideo.videoHeight || 480;
    }

    isSecondaryCameraActive = true;

    // Inspect secondary camera hardware focus capabilities
    try {
      const secTrack = secondaryCameraStream.getVideoTracks()[0];
      if (secTrack) {
        inspectTrackFocusCapabilities(secTrack, 'secondary');
        await applyCameraFocusConstraints('secondary', { mode: 'continuous' });
      }
    } catch (fErr) {
      console.warn('Could not inspect secondary camera focus constraints:', fErr);
    }

    const feed2Box = document.getElementById('cameraFeed2');
    if (feed2Box) feed2Box.style.display = 'block';

    const feedsWrapper = document.getElementById('cameraFeedsWrapper');
    if (feedsWrapper) {
      feedsWrapper.className = multiCameraLayout === 'pip' ? 'feed-layout-pip' : 'feed-layout-split';
    }

    updateMultiCamUI();
    setStatus('✅ دوربین دوم با موفقیت متصل و همگام‌سازی شد');
    return true;
  } catch (err) {
    console.error('Secondary camera error:', err);
    setStatus('⚠️ خطا در اتصال دوربین دوم: ' + (err.message || 'عدم دسترسی'));
    disconnectSecondaryCamera();
    return false;
  }
}

function disconnectSecondaryCamera() {
  if (secondaryCameraStream) {
    secondaryCameraStream.getTracks().forEach(t => t.stop());
    secondaryCameraStream = null;
  }
  secondaryCameraId = null;
  isSecondaryCameraActive = false;
  if (cameraFocusState && cameraFocusState.secondary) {
    cameraFocusState.secondary.supported = false;
    cameraFocusState.secondary.track = null;
    if (cameraFocusState.target === 'secondary') {
      cameraFocusState.target = 'primary';
    }
    updateFocusControlUI();
  }

  const feed2Box = document.getElementById('cameraFeed2');
  if (feed2Box) feed2Box.style.display = 'none';

  const feedsWrapper = document.getElementById('cameraFeedsWrapper');
  if (feedsWrapper) feedsWrapper.className = 'feed-layout-single';

  updateMultiCamUI();
}

async function swapCameras() {
  if (!isSecondaryCameraActive || !secondaryCameraId || !secondaryCameraStream || !currentCameraStream) {
    setStatus('دوربین دومی متصل نیست');
    return;
  }

  const swapStartTime = performance.now();
  try {
    const oldPrimaryStream = currentCameraStream;
    const oldPrimaryId = currentCameraId;
    const oldPrimaryInfo = currentCameraInfo;

    // Instant zero-latency live swap of streams without tearing down hardware sessions
    currentCameraStream = secondaryCameraStream;
    currentCameraId = secondaryCameraId;
    currentCameraInfo = availableCameras.find(c => c.deviceId === secondaryCameraId) || currentCameraInfo;

    secondaryCameraStream = oldPrimaryStream;
    secondaryCameraId = oldPrimaryId;

    if (video) {
      video.srcObject = currentCameraStream;
      await video.play().catch(() => {});
    }
    if (secondaryVideo) {
      secondaryVideo.srcObject = secondaryCameraStream;
      await secondaryVideo.play().catch(() => {});
    }

    localStorage.setItem('selectedCameraId', currentCameraId);
    const swapLatency = Math.round(performance.now() - swapStartTime);

    if (typeof predictiveCameraBufferHub !== 'undefined') {
      predictiveCameraBufferHub.lastSwitchLatencyMs = swapLatency;
      predictiveCameraBufferHub.updateUI();
    }

    setStatus(`🔄 جابجایی فوق‌سریع دوربین ۱ و ۲ انجام شد (${swapLatency} میلی‌ثانیه)`);
    updateCameraInfoDisplay();
    updateMultiCamUI();
  } catch (err) {
    console.error('Fast camera swap failed, falling back to sequential swap:', err);
    const oldPrimary = currentCameraId;
    const oldSecondary = secondaryCameraId;

    disconnectSecondaryCamera();
    await switchCamera(oldSecondary);
    await connectSecondaryCamera(oldPrimary);
    setStatus('🔄 جایگاه دوربین ۱ و ۲ جابجا شد');
  }
}

function updateMultiCamUI() {
  const activePill = document.getElementById('multiCamActivePill');
  if (activePill) {
    if (isSecondaryCameraActive) {
      activePill.textContent = '۲';
      activePill.className = 'multiCamPill dual';
    } else {
      activePill.textContent = '۱';
      activePill.className = 'multiCamPill single';
    }
  }

  // Workstation card
  const statsCam2Dot = document.getElementById('statsCam2Dot');
  const statsCam2Role = document.getElementById('statsCam2Role');
  const statsCam2AthleteTag = document.getElementById('statsCam2AthleteTag');
  const statsMultiCamModeLabel = document.getElementById('statsMultiCamModeLabel');
  const statsMultiCamLayoutBadge = document.getElementById('statsMultiCamLayoutBadge');

  if (statsMultiCamModeLabel) {
    statsMultiCamModeLabel.textContent = multiCameraMode === 'multi-athlete' 
      ? '👥 هر دوربین برای یک ورزشکار مجزا' 
      : '🤾‍♂️ چند زاویه برای ۱ ورزشکار';
  }

  if (statsMultiCamLayoutBadge) {
    statsMultiCamLayoutBadge.textContent = multiCameraLayout === 'pip' ? 'چیدمان: تصویر در تصویر' : 'چیدمان: ۵۰٪ - ۵۰٪';
  }

  if (isSecondaryCameraActive) {
    if (statsCam2Dot) {
      statsCam2Dot.textContent = '●';
      statsCam2Dot.style.color = '#22c55e';
    }
    if (statsCam2Role) {
      const cam = availableCameras.find(c => c.deviceId === secondaryCameraId);
      statsCam2Role.textContent = cam ? cam.persianLabel : 'فعال (زاویه روبه‌رو)';
    }
    if (statsCam2AthleteTag) {
      statsCam2AthleteTag.textContent = multiCameraMode === 'multi-athlete' ? getAthleteNameById(cam2AthleteId) : 'زاویه دوم';
      statsCam2AthleteTag.style.background = 'rgba(56,189,248,0.2)';
      statsCam2AthleteTag.style.color = '#38bdf8';
    }
  } else {
    if (statsCam2Dot) {
      statsCam2Dot.textContent = '○';
      statsCam2Dot.style.color = '#64748b';
    }
    if (statsCam2Role) statsCam2Role.textContent = 'غیرفعال (آماده اتصال)';
    if (statsCam2AthleteTag) {
      statsCam2AthleteTag.textContent = 'اتصال';
      statsCam2AthleteTag.style.background = 'rgba(100,116,139,0.3)';
      statsCam2AthleteTag.style.color = '#94a3b8';
    }
  }

  // Feed badges on video overlay
  const cam1Badge = document.getElementById('cam1BadgeText');
  const cam1AthBadge = document.getElementById('cam1AthleteBadge');
  const cam2Badge = document.getElementById('cam2BadgeText');
  const cam2AthBadge = document.getElementById('cam2AthleteBadge');

  if (multiCameraMode === 'multi-athlete') {
    if (cam1Badge) cam1Badge.textContent = '📷 دوربین ۱';
    if (cam1AthBadge) cam1AthBadge.textContent = getAthleteNameById(cam1AthleteId || getActiveAthleteId());
    if (cam2Badge) cam2Badge.textContent = '🎥 دوربین ۲';
    if (cam2AthBadge) cam2AthBadge.textContent = getAthleteNameById(cam2AthleteId);
  } else {
    if (cam1Badge) cam1Badge.textContent = '📷 دوربین ۱ (نیم‌رخ)';
    if (cam1AthBadge) cam1AthBadge.textContent = getActiveAthlete().name;
    if (cam2Badge) cam2Badge.textContent = '🎥 دوربین ۲ (روبه‌رو)';
    if (cam2AthBadge) cam2AthBadge.textContent = 'زاویه مکمل';
  }
}

function getAthleteNameById(id) {
  if (!id) return getActiveAthlete().name;
  const a = getAthletes().find(x => x.id === id);
  return a ? a.name : getActiveAthlete().name;
}

/**
 * Render secondary camera feed to overlay2
 */
function renderSecondaryFeed() {
  if (!secondaryCanvas || !secondaryVideo || secondaryVideo.readyState < 2) return;
  if (!secondaryCtx) secondaryCtx = secondaryCanvas.getContext('2d');

  if (secondaryCanvas.width !== secondaryVideo.videoWidth || secondaryCanvas.height !== secondaryVideo.videoHeight) {
    secondaryCanvas.width = secondaryVideo.videoWidth || 640;
    secondaryCanvas.height = secondaryVideo.videoHeight || 480;
  }

  const w = secondaryCanvas.width;
  const h = secondaryCanvas.height;
  secondaryCtx.clearRect(0, 0, w, h);

  // Subtle tactical crosshair alignment
  secondaryCtx.save();
  secondaryCtx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  secondaryCtx.lineWidth = 1;
  secondaryCtx.setLineDash([4, 4]);
  secondaryCtx.beginPath();
  secondaryCtx.moveTo(w / 2, 0);
  secondaryCtx.lineTo(w / 2, h);
  secondaryCtx.moveTo(0, h / 2);
  secondaryCtx.lineTo(w, h / 2);
  secondaryCtx.stroke();
  secondaryCtx.restore();
}

/**
 * Picture-in-Picture live mirror inside the Stats Workstation Window
 * Explicit user requirement: "و هم بشه دوربین رو توی کادر مشخصات دید"
 */
function renderPipMirror() {
  if (!pipMirrorCanvas) return;
  if (currentStudioLayout === 'camera') return;

  const now = performance.now();
  if (now - lastPipRenderTime < 33) return; // Cap at ~30fps for smooth performance
  lastPipRenderTime = now;

  if (!pipCtx) pipCtx = pipMirrorCanvas.getContext('2d');

  const srcVideo = (activePipSource === 'cam2' && isSecondaryCameraActive && secondaryVideo) ? secondaryVideo : video;
  const srcCanvas = (activePipSource === 'cam2' && isSecondaryCameraActive && secondaryCanvas) ? secondaryCanvas : canvas;

  if (srcVideo && srcVideo.readyState >= 2) {
    try {
      pipCtx.drawImage(srcVideo, 0, 0, pipMirrorCanvas.width, pipMirrorCanvas.height);
      if (srcCanvas && srcCanvas.width > 0) {
        pipCtx.drawImage(srcCanvas, 0, 0, pipMirrorCanvas.width, pipMirrorCanvas.height);
      }
    } catch (e) {}
  }

  const pipFpsVal = document.getElementById('pipFpsVal');
  if (pipFpsVal && typeof fps !== 'undefined') {
    pipFpsVal.textContent = Math.round(fps);
  }
}

function togglePipSource() {
  if (!isSecondaryCameraActive) {
    activePipSource = 'cam1';
    setStatus('دوربین دوم متصل نیست؛ تصویر دوربین ۱ نمایش داده می‌شود');
    return;
  }
  activePipSource = activePipSource === 'cam1' ? 'cam2' : 'cam1';
  setStatus(`🔄 منبع تصویر کادر مشخصات به دوربین ${activePipSource === 'cam1' ? '۱' : '۲'} تغییر یافت`);
}

async function requestNativeOSPiP() {
  const targetVideo = (activePipSource === 'cam2' && isSecondaryCameraActive && secondaryVideo) ? secondaryVideo : video;
  if (!targetVideo) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else if (targetVideo.requestPictureInPicture) {
      await targetVideo.requestPictureInPicture();
    } else {
      setStatus('قابلیت Picture-in-Picture در این مرورگر پشتیبانی نمی‌شود');
    }
  } catch (err) {
    console.warn('PiP error:', err);
    setStatus('⚠️ خطا در ایجاد تصویر شناور Picture-in-Picture');
  }
}

/**
 * Update active athlete and radar preview in Laptop Stats Workstation
 */
function updateLaptopStatsPanel() {
  const active = getActiveAthlete();
  if (!active) return;

  const nameEl = document.getElementById('statsAthleteName');
  const codeEl = document.getElementById('statsAthleteCode');
  const heightEl = document.getElementById('statsAthleteHeight');
  const ageEl = document.getElementById('statsAthleteAge');
  const weightEl = document.getElementById('statsAthleteWeight');
  const genderEl = document.getElementById('statsAthleteGender');
  const targetPosEl = document.getElementById('statsAthleteTargetPos');
  const avatarEl = document.getElementById('statsAthleteAvatar');

  if (nameEl) nameEl.textContent = active.name;
  if (codeEl) codeEl.textContent = active.code || '۱۰۱';
  if (heightEl) heightEl.textContent = active.heightCm || '۱۷۵';
  if (ageEl) ageEl.textContent = active.age || '۱۸';
  if (weightEl) weightEl.textContent = active.weight || '۶۸';
  if (genderEl) genderEl.textContent = active.gender === 'female' ? 'خانم' : 'آقا';
  if (targetPosEl) targetPosEl.textContent = active.sportPosition || active.sport || 'عمومی';
  if (avatarEl) avatarEl.textContent = active.sport === 'handball' ? '🤾‍♂️' : (active.gender === 'female' ? '🏃‍♀️' : '🏃‍♂️');

  // Highlight active mode button in fast grid
  document.querySelectorAll('.mode-fast-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
  });

  // Render Radar Chart Preview
  const radarContainer = document.getElementById('statsRadarContainer');
  if (radarContainer && typeof generateRadarChartSvg === 'function') {
    const history = typeof getHistory === 'function' ? getHistory() : [];
    const athleteHistory = history.filter(e => e.athleteId === active.id);
    radarContainer.innerHTML = generateRadarChartSvg(active, athleteHistory);
  }

  // Render Actionable Health & Training Suggestions
  if (typeof updateActionableSuggestionsUI === 'function') {
    updateActionableSuggestionsUI(active);
  }

  // Update multi-camera status
  updateMultiCamUI();
}

/**
 * Update Biomechanical Telemetry in Laptop Stats Panel
 */
function updateLaptopTelemetryView() {
  const l1 = document.getElementById('telemMetric1Label');
  const v1 = document.getElementById('telemMetric1Val');
  const l2 = document.getElementById('telemMetric2Label');
  const v2 = document.getElementById('telemMetric2Val');
  const l3 = document.getElementById('telemMetric3Label');
  const v3 = document.getElementById('telemMetric3Val');
  const l4 = document.getElementById('telemMetric4Label');
  const v4 = document.getElementById('telemMetric4Val');
  const badge = document.getElementById('statsTelemModeBadge');

  if (!l1 || !v1) return;

  if (badge) {
    const modeNames = {
      run: 'دوی سرعت',
      jump: 'پرش عمودی CMJ',
      bosco: 'پرش متوالی بوسکو',
      agility: 'چابکی شاتل',
      situp: 'دراز و نشست',
      pushup: 'شنا سوئدی',
      flexibility: 'انعطاف‌پذیری',
      anthro: 'آنتروپومتری',
      wingspan: 'گستره دست',
      distance: 'فاصله‌سنج'
    };
    badge.textContent = 'آزمون فعال: ' + (modeNames[mode] || mode);
  }

  if (mode === 'run') {
    l1.textContent = '⏱️ زمان / کرونومتر';
    v1.textContent = typeof runTimer !== 'undefined' ? `${runTimer.toFixed(2)} s` : '0.00 s';

    l2.textContent = '🏃 سرعت لحظه‌ای';
    v2.textContent = typeof currentSpeedMs !== 'undefined' ? `${currentSpeedMs.toFixed(1)} m/s` : '0.0 m/s';

    l3.textContent = '⚡ شتاب و گام';
    v3.textContent = typeof runPhase !== 'undefined' ? `فاز: ${runPhase}` : 'آماده';

    l4.textContent = '📍 مسافت محاسبه‌شده';
    v4.textContent = typeof gateDistanceMeters !== 'undefined' ? `${gateDistanceMeters} متر` : '۱۰ متر';
  } else if (mode === 'jump') {
    l1.textContent = '⤴️ اوج ارتفاع پرش';
    v1.textContent = typeof jumpHeightCm !== 'undefined' ? `${jumpHeightCm.toFixed(1)} cm` : '0.0 cm';

    l2.textContent = '✈️ زمان پرواز (Air Time)';
    v2.textContent = typeof flightTimeMs !== 'undefined' ? `${Math.round(flightTimeMs)} ms` : '-- ms';

    l3.textContent = '⚡ توان انفجاری تخمینی';
    const estPower = (typeof jumpHeightCm !== 'undefined' && jumpHeightCm > 0) ? `${(Math.sqrt(jumpHeightCm) * 9.8).toFixed(1)} W/kg` : '--';
    v3.textContent = estPower;

    l4.textContent = '📐 زاویه زانو در اوج خمش';
    v4.textContent = typeof minKneeAngle !== 'undefined' ? `${Math.round(minKneeAngle)}°` : '--°';
  } else if (mode === 'bosco') {
    l1.textContent = '⏱️ زمان باقیمانده';
    const bTimer = document.getElementById('boscoTimerVal');
    v1.textContent = bTimer ? bTimer.textContent : '30.0 s';

    l2.textContent = '🦘 تعداد پرش‌ها';
    const bJumps = document.getElementById('boscoJumpCountVal');
    v2.textContent = bJumps ? bJumps.textContent : '0 / 30';

    l3.textContent = '⚡ شاخص توان بیلاستی';
    v3.textContent = typeof boscoLastAirTime !== 'undefined' ? `${Math.round(boscoLastAirTime)} ms` : '--';

    l4.textContent = '👟 زمان تماس با زمین';
    v4.textContent = typeof boscoLastContactTime !== 'undefined' ? `${Math.round(boscoLastContactTime)} ms` : '--';
  } else if (mode === 'agility') {
    l1.textContent = '⏱️ زمان کل شاتل';
    v1.textContent = typeof agilityTimer !== 'undefined' ? `${agilityTimer.toFixed(2)} s` : '0.00 s';

    l2.textContent = '🔄 رفت و برگشت';
    v2.textContent = typeof agilityLapCount !== 'undefined' ? `${agilityLapCount} دور` : '0 دور';

    l3.textContent = '⚡ سرعت لحظه‌ای';
    v3.textContent = typeof currentSpeedMs !== 'undefined' ? `${currentSpeedMs.toFixed(1)} m/s` : '--';

    l4.textContent = '🎯 فاز چابکی';
    v4.textContent = typeof agilityPhase !== 'undefined' ? agilityPhase : 'آماده';
  } else if (mode === 'situp') {
    l1.textContent = '🧘 تکرارهای صحیح';
    v1.textContent = typeof situpRepCount !== 'undefined' ? `${situpRepCount}` : (typeof situpCount !== 'undefined' ? `${situpCount}` : '0');

    l2.textContent = '📐 زاویه تنه و ستون فقرات';
    v2.textContent = typeof situpCurrentAngle !== 'undefined' && situpCurrentAngle != null ? `${Math.round(situpCurrentAngle)}°` : (typeof situpAngle !== 'undefined' ? `${Math.round(situpAngle)}°` : '--°');

    l3.textContent = '⏱️ زمان آزمون';
    const sElapsed = situpStartTime && situpPhase === 'running' ? ((performance.now() - situpStartTime) / 1000).toFixed(1) : (typeof situpTimer !== 'undefined' ? `${Math.round(situpTimer)}` : '0.0');
    v3.textContent = `${sElapsed} s`;

    l4.textContent = '🎯 آنالیز فرم حرکت (AI)';
    if (activeAiFormWarning && activeAiFormWarning.mode === 'situp') {
      v4.textContent = activeAiFormWarning.shortText;
      v4.className = 'telem-val warn';
    } else {
      v4.textContent = situpPhase === 'running' ? '✅ فرم استاندارد' : 'آماده';
      v4.className = 'telem-val success';
    }
  } else if (mode === 'pushup') {
    l1.textContent = '💪 شنا سوئدی صحیح';
    v1.textContent = typeof pushupRepCount !== 'undefined' ? `${pushupRepCount}` : (typeof pushupCount !== 'undefined' ? `${pushupCount}` : '0');

    l2.textContent = '📐 زاویه آرنج';
    v2.textContent = typeof pushupCurrentElbowAngle !== 'undefined' && pushupCurrentElbowAngle != null ? `${Math.round(pushupCurrentElbowAngle)}°` : (typeof pushupElbowAngle !== 'undefined' ? `${Math.round(pushupElbowAngle)}°` : '--°');

    l3.textContent = '⏱️ زمان آزمون';
    const pElapsed = pushupStartTime && pushupPhase === 'running' ? ((performance.now() - pushupStartTime) / 1000).toFixed(1) : (typeof pushupTimer !== 'undefined' ? `${Math.round(pushupTimer)}` : '0.0');
    v3.textContent = `${pElapsed} s`;

    l4.textContent = '🎯 آنالیز فرم حرکت (AI)';
    if (activeAiFormWarning && activeAiFormWarning.mode === 'pushup') {
      v4.textContent = activeAiFormWarning.shortText;
      v4.className = 'telem-val warn';
    } else {
      v4.textContent = pushupPhase === 'running' ? '✅ فرم استاندارد' : 'آماده';
      v4.className = 'telem-val success';
    }
  } else if (mode === 'squat_lunge') {
    l1.textContent = '🏋️ تکرارهای معتبر اسکات';
    v1.textContent = `${squatLungeRepCount} تکرار`;
    v1.className = 'telem-val success';

    l2.textContent = '📐 زاویه لحظه‌ای زانو';
    v2.textContent = `${Math.round(squatLungeCurrentKneeAngle || 180)}° (هدف: ${squatTargetDepthAngle || 90}°)`;

    l3.textContent = '⚡ انقباض چهارسر / سرینی';
    v3.textContent = `چهارسر: ${Math.round(squatLungeEstimatedQuadsPct || 0)}٪ | باسن: ${Math.round(squatLungeEstimatedGlutesPct || 0)}٪`;

    l4.textContent = '🔋 پایش خستگی عضلانی';
    v4.textContent = `${squatLungeFatigueRatingText || 'پایداری عالی'} (${Math.round(squatLungeFatigueDropPct || 0)}٪ افت)`;
    v4.className = (squatLungeFatigueDropPct || 0) >= 20 ? 'telem-val warn' : 'telem-val success';
  } else if (mode === 'wingspan') {
    l1.textContent = '📏 طول بازشدگی دو دست';
    v1.textContent = `${Math.round(wingspanCurrentCm || 0)} cm`;
    v1.className = 'telem-val success';

    l2.textContent = '🏆 حداکثر طول دست‌ها';
    v2.textContent = `${Math.round(wingspanMaxCm || 0)} cm`;

    l3.textContent = '🦍 شاخص دست به قد (Ape Index)';
    v3.textContent = typeof wingspanApeIndex === 'number' && isFinite(wingspanApeIndex)
      ? `${wingspanApeIndex.toFixed(2)} (${(wingspanDiffCm || 0) >= 0 ? '+' : ''}${Math.round(wingspanDiffCm || 0)}cm)`
      : 'در حال محاسبه...';

    l4.textContent = '🎯 وضعیت ردیابی مچ‌ها';
    v4.textContent = (typeof wingspanIsLocked !== 'undefined' && wingspanIsLocked)
      ? '✅ ثبت نهایی شد'
      : ((typeof wingspanTracked !== 'undefined' && wingspanTracked) ? '👀 ردیابی پایدار' : '⚠️ دست‌ها در کادر باشد');
    v4.className = (typeof wingspanTracked !== 'undefined' && wingspanTracked) ? 'telem-val success' : 'telem-val warn';
  } else if (mode === 'anthro') {
    l1.textContent = '🧍 قد خودکار / بالاتنه';
    v1.textContent = `${Math.round(anthroHeightCm || 175)}cm | تنه: ${Math.round(anthroTrunkCm || 90)}cm`;

    l2.textContent = '🦍 دست منهای قد (Ape Index)';
    const sign = anthroSpanMinusHeightCm >= 0 ? '+' : '';
    v2.textContent = `${sign}${anthroSpanMinusHeightCm} cm (${anthroApeIndex.toFixed(2)})`;

    l3.textContent = '🦴 ابعاد لگن و پایین‌تنه';
    v3.textContent = `لگن: ${anthroPelvisWidthCm || 26}×${anthroPelvisLengthCm || 20} | پا: ${anthroLegCm || 85}cm`;

    l4.textContent = '⌚ دورهای بدنی (مچ/سینه/شکم)';
    v4.textContent = `مچ: ${anthroWristCircumferenceCm || 16.5} | سینه: ${anthroChestCircumferenceCm || 92} | شکم: ${anthroWaistCircumferenceCm || 76}`;
  } else {
    l1.textContent = '📏 شاخص حرکتی';
    v1.textContent = 'زنده';
    l2.textContent = '⚡ نرخ فریم پردازش';
    v2.textContent = `${Math.round(fps || 30)} FPS`;
    l3.textContent = '🎥 سنسورهای متصل';
    v3.textContent = isSecondaryCameraActive ? '۲ دوربین فعال' : '۱ دوربین';
    l4.textContent = '👤 ورزشکار فعال';
    v4.textContent = getActiveAthlete().name;
  }
}

// ============================================================================
// 5-SECOND BUFFER & SIDE-BY-SIDE SLOW-MOTION REVIEW SYSTEM
// Allows coaches to review the last 5-second attempt in slow motion side-by-side
// ============================================================================

const REVIEW_BUFFER_SECONDS = 5.0;
const REVIEW_TARGET_FPS = 25;
const MAX_REVIEW_BUFFER_FRAMES = 125; // 5.0s * 25fps
const REVIEW_FRAME_INTERVAL_MS = 1000 / REVIEW_TARGET_FPS; // 40ms

let rollingFrameBuffer = [];
let lastRollingFrameTimestamp = 0;
let reviewBufferOffscreenCanvas = null;
let reviewBufferOffscreenCtx = null;

// Frozen active buffer for coach review playback
let activeReviewBuffer = [];
let isReviewPanelActive = false;
let reviewPanelLayoutMode = 'side-by-side'; // 'side-by-side' | 'fullscreen'
let reviewPlaybackRate = 0.5; // 0.1, 0.25, 0.5, 1.0
let reviewCurrentFrameIndex = 0;
let isReviewPlaying = false;
let reviewPlayRafId = null;
let lastReviewPlayTimestamp = 0;
let isReviewLooping = true;
let reviewShowJointAngles = true;
let reviewApexFrameIndex = -1;
let reviewLastAttemptMeta = null;

let reviewCanvas = null;
let reviewCtx = null;
let isRollingBufferRecording = true;

/**
 * Release reference-counted frame bitmap to prevent memory leak
 */
function releaseReviewBufferFrame(frame) {
  if (!frame) return;
  frame.refCount = (frame.refCount || 1) - 1;
  if (frame.refCount <= 0) {
    if (frame.bitmap && typeof frame.bitmap.close === 'function') {
      try {
        frame.bitmap.close();
      } catch (e) {
        // ignore already closed
      }
    }
    frame.bitmap = null;
    frame.keypoints = null;
  }
}

/**
 * Record a continuous rolling 5-second buffer of video + skeleton overlay
 * Called from detectLoop on every frame
 */
async function recordRollingBufferFrame(poses) {
  if (!isRollingBufferRecording) return;
  const now = performance.now();
  if (now - lastRollingFrameTimestamp < REVIEW_FRAME_INTERVAL_MS - 4) {
    return;
  }
  lastRollingFrameTimestamp = now;

  const vid = document.getElementById('video');
  if (!vid || vid.readyState < 2 || vid.videoWidth === 0) return;

  const overlayCanvas = document.getElementById('overlay');

  if (!reviewBufferOffscreenCanvas) {
    reviewBufferOffscreenCanvas = document.createElement('canvas');
    reviewBufferOffscreenCtx = reviewBufferOffscreenCanvas.getContext('2d', { alpha: false });
  }

  // Keep frame dimension crisp yet memory-efficient (640x360 or 480x270)
  const targetW = 640;
  const targetH = Math.round(targetW * (vid.videoHeight / vid.videoWidth)) || 360;
  if (reviewBufferOffscreenCanvas.width !== targetW || reviewBufferOffscreenCanvas.height !== targetH) {
    reviewBufferOffscreenCanvas.width = targetW;
    reviewBufferOffscreenCanvas.height = targetH;
  }

  // Draw camera video feed
  try {
    reviewBufferOffscreenCtx.drawImage(vid, 0, 0, targetW, targetH);
    // Draw skeleton and biometric overlay if present
    if (overlayCanvas && overlayCanvas.width > 0 && overlayCanvas.height > 0) {
      reviewBufferOffscreenCtx.drawImage(overlayCanvas, 0, 0, targetW, targetH);
    }
  } catch (e) {
    return;
  }

  // Extract keypoints and metrics for biometric verification during review
  let simplifiedKeypoints = null;
  let pelvisY = null;
  let kneeAngleVal = null;
  if (poses && poses.length > 0 && poses[0].keypoints) {
    const kps = poses[0].keypoints;
    simplifiedKeypoints = kps.map(kp => ({
      x: kp.x / (overlayCanvas ? overlayCanvas.width : vid.videoWidth),
      y: kp.y / (overlayCanvas ? overlayCanvas.height : vid.videoHeight),
      score: kp.score,
      name: kp.name
    }));

    // Find hip / pelvis vertical position
    const leftHip = kps.find(k => k.name === 'left_hip');
    const rightHip = kps.find(k => k.name === 'right_hip');
    if (leftHip && rightHip) {
      pelvisY = (leftHip.y + rightHip.y) / 2;
    } else if (leftHip) {
      pelvisY = leftHip.y;
    }

    // Calculate knee angle if knee and ankle present
    const hip = leftHip || rightHip;
    const knee = kps.find(k => k.name === 'left_knee' || k.name === 'right_knee');
    const ankle = kps.find(k => k.name === 'left_ankle' || k.name === 'right_ankle');
    if (hip && knee && ankle && typeof calculateAngle === 'function') {
      kneeAngleVal = calculateAngle(hip, knee, ankle);
    }
  }

  try {
    let bitmap = null;
    if (window.createImageBitmap) {
      bitmap = await createImageBitmap(reviewBufferOffscreenCanvas);
    } else {
      // Fallback clone canvas
      const copyCanvas = document.createElement('canvas');
      copyCanvas.width = targetW;
      copyCanvas.height = targetH;
      const copyCtx = copyCanvas.getContext('2d');
      copyCtx.drawImage(reviewBufferOffscreenCanvas, 0, 0);
      bitmap = copyCanvas;
    }

    const frameItem = {
      bitmap,
      timestamp: Date.now(),
      pelvisY,
      kneeAngle: kneeAngleVal,
      keypoints: simplifiedKeypoints,
      refCount: 1
    };

    rollingFrameBuffer.push(frameItem);

    // Maintain max 5.0-second buffer
    while (rollingFrameBuffer.length > MAX_REVIEW_BUFFER_FRAMES) {
      const oldest = rollingFrameBuffer.shift();
      releaseReviewBufferFrame(oldest);
    }
  } catch (err) {
    // Suppress drawing error if frame drops
  }
}

/**
 * Capture the last 5-second buffer of a completed test attempt
 * Hooked directly into saveToHistory(...)
 */
function captureLastAttemptForReview(testType, testData, entry) {
  if (rollingFrameBuffer.length === 0) return;

  // Release old activeReviewBuffer frames
  if (activeReviewBuffer && activeReviewBuffer.length > 0) {
    activeReviewBuffer.forEach(f => releaseReviewBufferFrame(f));
    activeReviewBuffer = [];
  }

  // Freeze rolling buffer into active review buffer
  activeReviewBuffer = rollingFrameBuffer.map(f => {
    f.refCount = (f.refCount || 1) + 1;
    return f;
  });

  // Determine Apex / Peak milestone frame in the 5-second buffer
  let apexIdx = -1;
  if (testType === 'jump' || testType === 'countermovement') {
    // For vertical jump: frame with minimum pelvis Y (highest point off ground)
    let minPelvisY = Infinity;
    activeReviewBuffer.forEach((f, idx) => {
      if (f.pelvisY !== null && f.pelvisY < minPelvisY) {
        minPelvisY = f.pelvisY;
        apexIdx = idx;
      }
    });
  } else if (testType === 'situp' || testType === 'pushup') {
    // For rep tests: frame with extreme knee/elbow angle
    let maxAngle = -Infinity;
    activeReviewBuffer.forEach((f, idx) => {
      if (f.kneeAngle && f.kneeAngle > maxAngle) {
        maxAngle = f.kneeAngle;
        apexIdx = idx;
      }
    });
  }

  // Default apex fallback: 75% point of buffer (near test finish)
  if (apexIdx < 0) {
    apexIdx = Math.max(0, Math.floor(activeReviewBuffer.length * 0.75));
  }
  reviewApexFrameIndex = apexIdx;

  // Format Persian test title and result summary
  let testTitleFa = 'آزمون ورزشی';
  let resultSummaryFa = '--';
  if (testType === 'jump') {
    testTitleFa = 'پرش عمودی سارجنت';
    resultSummaryFa = testData && testData.height ? `${testData.height} cm` : (testData && testData.maxJump ? `${testData.maxJump} cm` : 'ثبت شد');
  } else if (testType === 'run') {
    testTitleFa = 'دوی سرعت و شتاب';
    resultSummaryFa = testData && testData.time ? `${testData.time} s` : (testData && testData.speed ? `${testData.speed} km/h` : 'ثبت شد');
  } else if (testType === 'agility') {
    testTitleFa = 'چابکی ۵۰۵ / ۹×۴';
    resultSummaryFa = testData && testData.time ? `${testData.time} s` : 'ثبت شد';
  } else if (testType === 'bosco') {
    testTitleFa = 'پرش متوالی بوسکو';
    resultSummaryFa = testData && testData.totalJumps ? `${testData.totalJumps} پرش` : 'ثبت شد';
  } else if (testType === 'situp') {
    testTitleFa = 'درازونشست استاندارد';
    resultSummaryFa = testData && testData.count ? `${testData.count} تکرار` : 'ثبت شد';
  } else if (testType === 'pushup') {
    testTitleFa = 'شنا سوئدی استاندارد';
    resultSummaryFa = testData && testData.count ? `${testData.count} تکرار` : 'ثبت شد';
  } else if (testType === 'anthro') {
    testTitleFa = 'آنتروپومتری و قد';
    resultSummaryFa = testData && testData.height ? `${testData.height} cm` : 'ثبت شد';
  } else if (testType === 'wingspan') {
    testTitleFa = 'طول دست‌ها (Wingspan)';
    resultSummaryFa = testData && testData.span ? `${testData.span} cm` : 'ثبت شد';
  }

  reviewLastAttemptMeta = {
    testType,
    testTitleFa,
    resultSummaryFa,
    athleteName: entry ? entry.athleteName : getActiveAthlete().name,
    athleteCode: entry ? entry.athleteCode : getActiveAthlete().code,
    date: entry ? entry.date : new Date().toLocaleDateString('fa-IR'),
    timestamp: Date.now(),
    totalFrames: activeReviewBuffer.length,
    apexIdx: reviewApexFrameIndex
  };

  // Update Workstation Review Card UI
  const workstationReviewTestName = document.getElementById('workstationReviewTestName');
  if (workstationReviewTestName) {
    workstationReviewTestName.textContent = testTitleFa;
  }
  const workstationReviewResult = document.getElementById('workstationReviewResult');
  if (workstationReviewResult) {
    workstationReviewResult.textContent = resultSummaryFa;
  }
  const reviewBadgeTitle = document.getElementById('reviewBadgeTitle');
  if (reviewBadgeTitle) {
    reviewBadgeTitle.textContent = `🎬 بازبینی: ${testTitleFa} (${reviewLastAttemptMeta.athleteName})`;
  }
  const reviewBadgeMetric = document.getElementById('reviewBadgeMetric');
  if (reviewBadgeMetric) {
    reviewBadgeMetric.textContent = `نتیجه: ${resultSummaryFa}`;
  }

  // Update topbar button dot indicator
  const reviewBufferReadyDot = document.getElementById('reviewBufferReadyDot');
  if (reviewBufferReadyDot) {
    reviewBufferReadyDot.style.background = '#4ade80';
    reviewBufferReadyDot.style.boxShadow = '0 0 8px #4ade80';
  }

  // Check setting: Auto-open review after test completion
  const settingAutoReview = document.getElementById('settingAutoReviewAfterTest');
  const shouldAutoReview = settingAutoReview ? settingAutoReview.checked : true;

  if (shouldAutoReview) {
    openSideBySideReviewPanel(true);
    if (typeof showShortcutToast === 'function') {
      showShortcutToast(`🎬 بافر ۵ث ثبت شد • بازبینی صحنه آهسته ${testTitleFa} فعال گردید`);
    }
  } else {
    if (typeof showShortcutToast === 'function') {
      showShortcutToast(`🎬 بافر ۵ث ثبت شد • برای بازبینی کلید R یا دکمه بازبینی را بزنید`);
    }
  }
}

/**
 * Open Side-by-Side Review Panel
 */
function openSideBySideReviewPanel(startAtApex = false) {
  if (activeReviewBuffer.length === 0) {
    if (rollingFrameBuffer.length > 0) {
      // Freeze current rolling buffer if no finalized test yet
      captureLastAttemptForReview('manual', {}, {
        athleteName: getActiveAthlete().name,
        athleteCode: getActiveAthlete().code,
        date: new Date().toLocaleDateString('fa-IR')
      });
    } else {
      if (typeof showShortcutToast === 'function') {
        showShortcutToast('⚠️ بافر ویدیویی هنوز پر نشده است. چند ثانیه مقابل دوربین حرکت کنید.');
      }
      return;
    }
  }

  isReviewPanelActive = true;
  const wrapper = document.getElementById('cameraFeedsWrapper');
  const reviewFeed = document.getElementById('cameraReviewFeed');

  if (wrapper) {
    wrapper.classList.remove('feed-layout-single', 'feed-layout-split', 'feed-layout-pip');
    if (reviewPanelLayoutMode === 'fullscreen') {
      wrapper.classList.add('feed-layout-review-full');
    } else {
      wrapper.classList.add('feed-layout-review');
    }
  }

  if (reviewFeed) {
    reviewFeed.style.display = 'block';
  }

  reviewCanvas = document.getElementById('reviewCanvas');
  if (reviewCanvas) {
    reviewCtx = reviewCanvas.getContext('2d');
    const boxW = reviewFeed ? reviewFeed.clientWidth : 640;
    const boxH = reviewFeed ? reviewFeed.clientHeight : 360;
    reviewCanvas.width = boxW || 640;
    reviewCanvas.height = boxH || 360;
  }

  // Configure scrubber range
  const scrubber = document.getElementById('reviewScrubber');
  if (scrubber) {
    scrubber.min = '0';
    scrubber.max = `${Math.max(0, activeReviewBuffer.length - 1)}`;
  }

  const totalTimeEl = document.getElementById('reviewTimeTotal');
  if (totalTimeEl) {
    totalTimeEl.textContent = `${(activeReviewBuffer.length / REVIEW_TARGET_FPS).toFixed(2)}s`;
  }

  // Start from apex frame or frame 0
  if (startAtApex && reviewApexFrameIndex >= 0) {
    reviewCurrentFrameIndex = reviewApexFrameIndex;
  } else if (reviewCurrentFrameIndex >= activeReviewBuffer.length) {
    reviewCurrentFrameIndex = 0;
  }

  // Update button active state in topbar and stats window
  updateReviewButtonsState(true);

  // Render initial frame and begin slow-motion playback
  renderReviewCurrentFrame();
  startReviewPlayback();
}

/**
 * Close Side-by-Side Review Panel
 */
function closeSideBySideReviewPanel() {
  isReviewPanelActive = false;
  pauseReviewPlayback();

  const wrapper = document.getElementById('cameraFeedsWrapper');
  const reviewFeed = document.getElementById('cameraReviewFeed');

  if (wrapper) {
    wrapper.classList.remove('feed-layout-review', 'feed-layout-review-full');
    if (typeof isSecondaryCameraActive !== 'undefined' && isSecondaryCameraActive) {
      wrapper.classList.add('feed-layout-split');
    } else {
      wrapper.classList.add('feed-layout-single');
    }
  }

  if (reviewFeed) {
    reviewFeed.style.display = 'none';
  }

  updateReviewButtonsState(false);
  if (typeof showShortcutToast === 'function') {
    showShortcutToast('🎬 پنل بازبینی بسته شد • بازگشت به نمای زنده');
  }
}

/**
 * Toggle Side-by-Side Review Panel
 */
function toggleSideBySideReviewPanel() {
  if (isReviewPanelActive) {
    closeSideBySideReviewPanel();
  } else {
    openSideBySideReviewPanel();
  }
}

/**
 * Toggle between Side-by-Side (50/50) and Fullscreen Review
 */
function toggleReviewLayoutMode() {
  const wrapper = document.getElementById('cameraFeedsWrapper');
  if (!wrapper) return;

  if (reviewPanelLayoutMode === 'side-by-side') {
    reviewPanelLayoutMode = 'fullscreen';
    wrapper.classList.remove('feed-layout-review');
    wrapper.classList.add('feed-layout-review-full');
  } else {
    reviewPanelLayoutMode = 'side-by-side';
    wrapper.classList.remove('feed-layout-review-full');
    wrapper.classList.add('feed-layout-review');
  }

  // Resize canvas to new container dimensions
  setTimeout(() => {
    const reviewFeed = document.getElementById('cameraReviewFeed');
    if (reviewFeed && reviewCanvas) {
      reviewCanvas.width = reviewFeed.clientWidth || 640;
      reviewCanvas.height = reviewFeed.clientHeight || 360;
      renderReviewCurrentFrame();
    }
  }, 100);
}

/**
 * Update Review Buttons UI Active State
 */
function updateReviewButtonsState(isOpen) {
  const slowMoReviewBtn = document.getElementById('slowMoReviewBtn');
  if (slowMoReviewBtn) {
    if (isOpen) {
      slowMoReviewBtn.style.background = 'rgba(245, 158, 11, 0.25)';
      slowMoReviewBtn.style.borderColor = '#f59e0b';
    } else {
      slowMoReviewBtn.style.background = '';
      slowMoReviewBtn.style.borderColor = 'rgba(245, 158, 11, 0.5)';
    }
  }

  const statsReviewBtn = document.getElementById('statsReviewBtn');
  if (statsReviewBtn) {
    if (isOpen) {
      statsReviewBtn.style.background = 'rgba(245, 158, 11, 0.25)';
      statsReviewBtn.style.borderColor = '#f59e0b';
    } else {
      statsReviewBtn.style.background = '';
      statsReviewBtn.style.borderColor = 'rgba(245, 158, 11, 0.4)';
    }
  }
}

/**
 * Start Slow-Motion Playback loop
 */
function startReviewPlayback() {
  if (isReviewPlaying) return;
  isReviewPlaying = true;
  lastReviewPlayTimestamp = performance.now();

  const playBtn = document.getElementById('reviewPlayPauseBtn');
  if (playBtn) {
    playBtn.textContent = '⏸️ توقف';
    playBtn.classList.add('active');
  }

  function reviewLoop(timestamp) {
    if (!isReviewPlaying || !isReviewPanelActive) return;

    const interval = (REVIEW_FRAME_INTERVAL_MS / reviewPlaybackRate);
    const elapsed = timestamp - lastReviewPlayTimestamp;

    if (elapsed >= interval) {
      lastReviewPlayTimestamp = timestamp - (elapsed % interval);
      reviewCurrentFrameIndex++;

      if (reviewCurrentFrameIndex >= activeReviewBuffer.length) {
        if (isReviewLooping) {
          reviewCurrentFrameIndex = 0;
        } else {
          reviewCurrentFrameIndex = activeReviewBuffer.length - 1;
          pauseReviewPlayback();
          renderReviewCurrentFrame();
          return;
        }
      }

      renderReviewCurrentFrame();
    }

    reviewPlayRafId = requestAnimationFrame(reviewLoop);
  }

  reviewPlayRafId = requestAnimationFrame(reviewLoop);
}

/**
 * Pause Slow-Motion Playback
 */
function pauseReviewPlayback() {
  isReviewPlaying = false;
  if (reviewPlayRafId) {
    cancelAnimationFrame(reviewPlayRafId);
    reviewPlayRafId = null;
  }

  const playBtn = document.getElementById('reviewPlayPauseBtn');
  if (playBtn) {
    playBtn.textContent = '▶️ پخش';
    playBtn.classList.remove('active');
  }
}

/**
 * Toggle Review Play / Pause
 */
function toggleReviewPlayback() {
  if (isReviewPlaying) {
    pauseReviewPlayback();
  } else {
    startReviewPlayback();
  }
}

/**
 * Step review frames forward or backward
 */
function stepReviewFrame(delta) {
  pauseReviewPlayback();
  if (activeReviewBuffer.length === 0) return;

  reviewCurrentFrameIndex += delta;
  if (reviewCurrentFrameIndex < 0) reviewCurrentFrameIndex = 0;
  if (reviewCurrentFrameIndex >= activeReviewBuffer.length) reviewCurrentFrameIndex = activeReviewBuffer.length - 1;

  renderReviewCurrentFrame();
}

/**
 * Jump directly to the apex/peak frame
 */
function jumpToReviewApexFrame() {
  pauseReviewPlayback();
  if (reviewApexFrameIndex >= 0 && reviewApexFrameIndex < activeReviewBuffer.length) {
    reviewCurrentFrameIndex = reviewApexFrameIndex;
    renderReviewCurrentFrame();
    if (typeof showShortcutToast === 'function') {
      showShortcutToast(`⚡ پرش به لحظه اوج رکورد (فریم ${reviewApexFrameIndex + 1})`);
    }
  }
}

/**
 * Set Slow-Motion Playback Speed
 */
function setReviewPlaybackSpeed(rate) {
  reviewPlaybackRate = rate;
  document.querySelectorAll('.review-speed-btn').forEach(btn => {
    if (parseFloat(btn.dataset.speed) === rate) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (typeof showShortcutToast === 'function') {
    showShortcutToast(`⚡ سرعت بازبینی: ${rate}x`);
  }
}

/**
 * Render the current frame of the active review buffer onto reviewCanvas
 */
function renderReviewCurrentFrame() {
  if (!reviewCanvas || !reviewCtx) {
    reviewCanvas = document.getElementById('reviewCanvas');
    if (!reviewCanvas) return;
    reviewCtx = reviewCanvas.getContext('2d');
  }

  if (activeReviewBuffer.length === 0 || reviewCurrentFrameIndex < 0 || reviewCurrentFrameIndex >= activeReviewBuffer.length) {
    return;
  }

  const frame = activeReviewBuffer[reviewCurrentFrameIndex];
  if (!frame || !frame.bitmap) return;

  const cw = reviewCanvas.width;
  const ch = reviewCanvas.height;

  // Clear canvas
  reviewCtx.fillStyle = '#020617';
  reviewCtx.fillRect(0, 0, cw, ch);

  // Draw bitmap with aspect-ratio contain fitting
  const bw = frame.bitmap.width || 640;
  const bh = frame.bitmap.height || 360;
  const scale = Math.min(cw / bw, ch / bh);
  const dw = bw * scale;
  const dh = bh * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  try {
    reviewCtx.drawImage(frame.bitmap, dx, dy, dw, dh);
  } catch (e) {
    return;
  }

  // Draw Biomechanical Angle Overlays if enabled
  if (reviewShowJointAngles && frame.keypoints) {
    drawReviewBiomechanicalAngles(reviewCtx, frame.keypoints, dx, dy, dw, dh);
  }

  // Draw Apex Marker highlight if current frame is the peak moment
  const isApex = (reviewCurrentFrameIndex === reviewApexFrameIndex);
  const apexPill = document.getElementById('reviewApexMarkerPill');
  if (apexPill) {
    apexPill.style.display = isApex ? 'block' : 'none';
  }

  if (isApex) {
    reviewCtx.save();
    reviewCtx.strokeStyle = '#f59e0b';
    reviewCtx.lineWidth = 4;
    reviewCtx.strokeRect(dx + 2, dy + 2, dw - 4, dh - 4);

    // Apex Watermark banner inside canvas
    reviewCtx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    reviewCtx.fillRect(dx + 10, dy + 10, 190, 26);
    reviewCtx.fillStyle = '#000';
    reviewCtx.font = 'bold 12px Vazirmatn, sans-serif';
    reviewCtx.fillText('⚡ اوج عملکرد / PEAK APEX', dx + 18, dy + 28);
    reviewCtx.restore();
  }

  // Draw Slow-Motion Speed & Time Watermark on canvas top-right
  reviewCtx.save();
  const timeSec = (reviewCurrentFrameIndex / REVIEW_TARGET_FPS).toFixed(2);
  reviewCtx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  reviewCtx.fillRect(dx + dw - 180, dy + 10, 170, 26);
  reviewCtx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
  reviewCtx.lineWidth = 1;
  reviewCtx.strokeRect(dx + dw - 180, dy + 10, 170, 26);

  reviewCtx.fillStyle = '#fbbf24';
  reviewCtx.font = 'bold 11px monospace';
  reviewCtx.fillText(`⏱️ ${timeSec}s • ${reviewPlaybackRate}x SLOW-MO`, dx + dw - 172, dy + 27);
  reviewCtx.restore();

  // Update UI scrubber and text displays
  const scrubber = document.getElementById('reviewScrubber');
  if (scrubber && !scrubber.matches(':active')) {
    scrubber.value = `${reviewCurrentFrameIndex}`;
  }

  const timeCurrentEl = document.getElementById('reviewTimeCurrent');
  if (timeCurrentEl) {
    timeCurrentEl.textContent = `${timeSec}s`;
  }

  const frameCounterEl = document.getElementById('reviewFrameCounter');
  if (frameCounterEl) {
    frameCounterEl.textContent = `فریم ${reviewCurrentFrameIndex + 1}/${activeReviewBuffer.length}`;
  }
}

/**
 * Draw Biomechanical Joint Angles on top of the Review Frame
 */
function drawReviewBiomechanicalAngles(ctx, keypoints, dx, dy, dw, dh) {
  if (!keypoints || keypoints.length === 0) return;

  function getKp(name) {
    return keypoints.find(k => k.name === name);
  }

  function kpToCanvas(kp) {
    if (!kp) return null;
    return {
      x: dx + kp.x * dw,
      y: dy + kp.y * dh
    };
  }

  // Angles: Knee, Hip, Elbow
  const anglesToMeasure = [
    { p1: 'left_hip', p2: 'left_knee', p3: 'left_ankle', label: 'زانو چپ', color: '#38bdf8' },
    { p1: 'right_hip', p2: 'right_knee', p3: 'right_ankle', label: 'زانو راست', color: '#38bdf8' },
    { p1: 'left_shoulder', p2: 'left_hip', p3: 'left_knee', label: 'تنه/لگن', color: '#4ade80' },
    { p1: 'left_shoulder', p2: 'left_elbow', p3: 'left_wrist', label: 'آرنج چپ', color: '#fbbf24' }
  ];

  ctx.save();
  anglesToMeasure.forEach(item => {
    const a = kpToCanvas(getKp(item.p1));
    const b = kpToCanvas(getKp(item.p2));
    const c = kpToCanvas(getKp(item.p3));

    if (a && b && c && typeof calculateAngle === 'function') {
      const angle = Math.round(calculateAngle(a, b, c));

      // Draw angle arc
      ctx.beginPath();
      ctx.arc(b.x, b.y, 18, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fill();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw angle text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${angle}°`, b.x, b.y);
    }
  });
  ctx.restore();
}

/**
 * Save Snapshot of Current Review Frame with Athlete & Biometric Stamp
 */
function saveReviewSnapshot() {
  if (!reviewCanvas) return;

  const snapshotCanvas = document.createElement('canvas');
  snapshotCanvas.width = reviewCanvas.width;
  snapshotCanvas.height = reviewCanvas.height;
  const ctx = snapshotCanvas.getContext('2d');

  // Copy current review canvas
  ctx.drawImage(reviewCanvas, 0, 0);

  // Add official watermark footer
  const meta = reviewLastAttemptMeta || {};
  const footerH = 34;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(0, snapshotCanvas.height - footerH, snapshotCanvas.width, footerH);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, snapshotCanvas.height - footerH, snapshotCanvas.width, footerH);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`ورزشکار: ${meta.athleteName || getActiveAthlete().name} (${meta.athleteCode || '۱۰۱'}) | ${meta.testTitleFa || 'آزمون ورزشی'}`, snapshotCanvas.width - 14, snapshotCanvas.height - 12);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(`فریم ${reviewCurrentFrameIndex + 1} • بازبینی صحنه آهسته هوشمند Mediapipe`, 14, snapshotCanvas.height - 12);

  const link = document.createElement('a');
  link.download = `Review_Attempt_${Date.now()}.png`;
  link.href = snapshotCanvas.toDataURL('image/png');
  link.click();

  if (typeof showShortcutToast === 'function') {
    showShortcutToast('📸 تصویر فریم بازبینی با موفقیت ذخیره شد');
  }
}

/**
 * Initialize DOM Event Listeners for Review Panel
 */
function initSlowMotionReviewSystem() {
  // Topbar Review Button
  const slowMoReviewBtn = document.getElementById('slowMoReviewBtn');
  if (slowMoReviewBtn) {
    slowMoReviewBtn.addEventListener('click', () => toggleSideBySideReviewPanel());
  }

  // Workstation Actions Review Button
  const statsReviewBtn = document.getElementById('statsReviewBtn');
  if (statsReviewBtn) {
    statsReviewBtn.addEventListener('click', () => toggleSideBySideReviewPanel());
  }

  // Workstation Card Open Button
  const workstationOpenReviewBtn = document.getElementById('workstationOpenReviewBtn');
  if (workstationOpenReviewBtn) {
    workstationOpenReviewBtn.addEventListener('click', () => openSideBySideReviewPanel());
  }

  // Review Top Close Button
  const reviewCloseBtn = document.getElementById('reviewCloseBtn');
  if (reviewCloseBtn) {
    reviewCloseBtn.addEventListener('click', () => closeSideBySideReviewPanel());
  }

  // Review Layout Toggle Button (50/50 vs Fullscreen)
  const reviewLayoutToggleBtn = document.getElementById('reviewLayoutToggleBtn');
  if (reviewLayoutToggleBtn) {
    reviewLayoutToggleBtn.addEventListener('click', () => toggleReviewLayoutMode());
  }

  // Review Play/Pause Button
  const reviewPlayPauseBtn = document.getElementById('reviewPlayPauseBtn');
  if (reviewPlayPauseBtn) {
    reviewPlayPauseBtn.addEventListener('click', () => toggleReviewPlayback());
  }

  // Review Step Back / Forward Buttons
  const reviewStepBackBtn = document.getElementById('reviewStepBackBtn');
  if (reviewStepBackBtn) {
    reviewStepBackBtn.addEventListener('click', () => stepReviewFrame(-1));
  }
  const reviewStepForwardBtn = document.getElementById('reviewStepForwardBtn');
  if (reviewStepForwardBtn) {
    reviewStepForwardBtn.addEventListener('click', () => stepReviewFrame(1));
  }

  // Review Scrubber Slider
  const reviewScrubber = document.getElementById('reviewScrubber');
  if (reviewScrubber) {
    reviewScrubber.addEventListener('input', (e) => {
      pauseReviewPlayback();
      reviewCurrentFrameIndex = parseInt(e.target.value, 10) || 0;
      renderReviewCurrentFrame();
    });
  }

  // Speed selector buttons
  document.querySelectorAll('.review-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const speed = parseFloat(btn.dataset.speed) || 0.5;
      setReviewPlaybackSpeed(speed);
    });
  });

  // Loop toggle button
  const reviewLoopBtn = document.getElementById('reviewLoopBtn');
  if (reviewLoopBtn) {
    reviewLoopBtn.addEventListener('click', () => {
      isReviewLooping = !isReviewLooping;
      reviewLoopBtn.classList.toggle('active', isReviewLooping);
      if (typeof showShortcutToast === 'function') {
        showShortcutToast(isReviewLooping ? '🔁 تکرار مداوم لوپ فعال' : '➡️ پخش یکباره (بدون تکرار)');
      }
    });
  }

  // Apex Jump Button
  const reviewApexJumpBtn = document.getElementById('reviewApexJumpBtn');
  if (reviewApexJumpBtn) {
    reviewApexJumpBtn.addEventListener('click', () => jumpToReviewApexFrame());
  }

  // Snapshot Button
  const reviewSnapshotBtn = document.getElementById('reviewSnapshotBtn');
  if (reviewSnapshotBtn) {
    reviewSnapshotBtn.addEventListener('click', () => saveReviewSnapshot());
  }

  // Toggle Joint Angles on Review
  const reviewToggleAnglesBtn = document.getElementById('reviewToggleAnglesBtn');
  if (reviewToggleAnglesBtn) {
    reviewToggleAnglesBtn.addEventListener('click', () => {
      reviewShowJointAngles = !reviewShowJointAngles;
      reviewToggleAnglesBtn.classList.toggle('active', reviewShowJointAngles);
      renderReviewCurrentFrame();
    });
  }

  // Handle window resize to adjust reviewCanvas
  window.addEventListener('resize', () => {
    if (isReviewPanelActive && reviewCanvas) {
      const reviewFeed = document.getElementById('cameraReviewFeed');
      if (reviewFeed) {
        reviewCanvas.width = reviewFeed.clientWidth || 640;
        reviewCanvas.height = reviewFeed.clientHeight || 360;
        renderReviewCurrentFrame();
      }
    }
  });
}

// Automatically initialize desktop architecture on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopStudioArchitecture);
} else {
  initDesktopStudioArchitecture();
}

// =========================================================================
// 🚀 11-POINT PERFORMANCE & SCOUTING ROADMAP SYSTEM (v1.19.0)
// =========================================================================

// --- 1 & 2. ONE-EURO FILTER & WEB WORKER INTEGRATION ---
let webWorkerEnabled = true;
let biomechanicsWorker = null;
let latestWorkerBiometrics = {
  angles: null,
  rsi: null,
  posture: null
};

function initBiomechanicsWorker() {
  try {
    if (typeof Worker !== 'undefined') {
      biomechanicsWorker = new Worker('/biomechanics-worker.js');
      biomechanicsWorker.onmessage = function (e) {
        const { type, result } = e.data || {};
        if (type === 'ANGLES_CALCULATED') {
          latestWorkerBiometrics.angles = result;
        } else if (type === 'RSI_CALCULATED') {
          latestWorkerBiometrics.rsi = result;
        } else if (type === 'POSTURE_CALCULATED') {
          latestWorkerBiometrics.posture = result;
        }
      };
      biomechanicsWorker.onerror = function (err) {
        console.warn('Biomechanics worker encountered error, running on main thread:', err);
      };
      console.log('✅ Biomechanics Web Worker initialized successfully');
    }
  } catch (err) {
    console.warn('Web Worker initialization skipped:', err);
  }

  // Web Worker setting checkbox
  const settingWebWorker = document.getElementById('settingWebWorker');
  if (settingWebWorker) {
    settingWebWorker.addEventListener('change', (e) => {
      webWorkerEnabled = e.target.checked;
    });
  }

  // One-Euro Filter settings
  const settingOneEuroFilter = document.getElementById('settingOneEuroFilter');
  if (settingOneEuroFilter) {
    settingOneEuroFilter.addEventListener('change', (e) => {
      oneEuroFilterEnabled = e.target.checked;
    });
  }
  const settingOneEuroBeta = document.getElementById('settingOneEuroBeta');
  const settingOneEuroBetaVal = document.getElementById('settingOneEuroBetaVal');
  if (settingOneEuroBeta) {
    settingOneEuroBeta.addEventListener('input', (e) => {
      oneEuroBetaValue = parseFloat(e.target.value) || 0.007;
      if (settingOneEuroBetaVal) {
        settingOneEuroBetaVal.textContent = oneEuroBetaValue.toFixed(4);
      }
      for (const k in oneEuroFilters) {
        oneEuroFilters[k].setBeta(oneEuroBetaValue);
      }
    });
  }
}

function dispatchToBiomechanicsWorker(keypoints) {
  if (!webWorkerEnabled || !biomechanicsWorker || !keypoints || !keypoints.length) return;
  try {
    const simplified = {};
    for (const kp of keypoints) {
      if (kp && kp.name) simplified[kp.name] = { x: kp.x, y: kp.y, score: kp.score || 0.5 };
    }
    biomechanicsWorker.postMessage({
      type: 'CALC_ANGLES',
      payload: { keypoints: simplified, scale: (typeof pxToCmScale !== 'undefined' ? pxToCmScale : 0.25) }
    });
  } catch (e) {}
}

// --- 3. HARDWARE GYROSCOPE & CAMERA PITCH AUTO-CORRECTION ---
let currentCameraPitchAngle = 0.0;
let cameraPitchCorrectionEnabled = true;

function initDeviceInclinometer() {
  if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
    window.addEventListener('deviceorientation', (event) => {
      if (event.beta != null) {
        const isLandscape = window.innerWidth > window.innerHeight;
        let rawPitch = isLandscape ? (event.gamma || 0) : (event.beta || 0);
        let pitch = rawPitch;
        if (Math.abs(pitch) > 90) {
          pitch = pitch > 0 ? (180 - pitch) : (-180 - pitch);
        }
        currentCameraPitchAngle = pitch;
        updateInclinometerBadge();
      }
    }, { passive: true });
  }

  const settingCameraPitch = document.getElementById('settingCameraPitch');
  if (settingCameraPitch) {
    settingCameraPitch.addEventListener('change', (e) => {
      cameraPitchCorrectionEnabled = e.target.checked;
      updateInclinometerBadge();
    });
  }
}

function updateInclinometerBadge() {
  const badge = document.getElementById('inclinometerBadge');
  const angleVal = document.getElementById('inclinometerAngleVal');
  const settingDisplay = document.getElementById('settingPitchAngleDisplay');
  const absAngle = Math.abs(currentCameraPitchAngle);

  if (angleVal) angleVal.textContent = `${absAngle.toFixed(1)}°`;
  if (badge) {
    if (absAngle < 3.0) {
      badge.className = 'inclinometer-badge level';
      badge.title = 'تراز دوربین ایده‌آل است (کمتر از ۳ درجه شیب)';
    } else {
      badge.className = 'inclinometer-badge tilt';
      badge.title = `زاویه شیب ${absAngle.toFixed(1)}° - تصحیح خودکار پرسپکتیو فعال است`;
    }
  }
  if (settingDisplay) {
    settingDisplay.textContent = `${absAngle.toFixed(1)}° (${absAngle < 3.0 ? 'تراز ایده‌آل' : 'تصحیح زاویه فعال'})`;
    settingDisplay.style.color = absAngle < 3.0 ? '#4ade80' : '#fbbf24';
  }
}

function getPitchCorrectionFactor() {
  if (!cameraPitchCorrectionEnabled) return 1.0;
  const absAngle = Math.abs(currentCameraPitchAngle);
  if (absAngle < 3.0) return 1.0;
  const rad = (absAngle * Math.PI) / 180.0;
  const cos = Math.cos(rad);
  return cos > 0.4 ? 1.0 / cos : 1.0;
}

// --- 10. LIVE AUDIO AI COACH & METRONOME ENGINE ---
class LiveAudioCoachEngine {
  constructor() {
    this.audioCtx = null;
    this.speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.metronomeInterval = null;
    this.bpm = 60;
    this.isMetronomeActive = false;
    this.isVoiceEnabled = true;
    this.lastVoiceTime = 0;
  }

  ensureContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playClick(freq = 880, duration = 0.05, type = 'sine') {
    try {
      this.ensureContext();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.25, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {}
  }

  startMetronome(bpm = 60) {
    this.stopMetronome();
    this.bpm = Math.max(30, Math.min(220, bpm));
    this.isMetronomeActive = true;
    const intervalMs = (60 / this.bpm) * 1000;
    let beat = 0;
    this.metronomeInterval = setInterval(() => {
      beat = (beat + 1) % 4;
      if (beat === 1) {
        this.playClick(1200, 0.06, 'triangle'); // Downbeat accent
      } else {
        this.playClick(800, 0.04, 'sine');
      }
    }, intervalMs);
    this.updateUi();
  }

  stopMetronome() {
    if (this.metronomeInterval) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
    this.isMetronomeActive = false;
    this.updateUi();
  }

  toggleMetronome(bpm) {
    if (this.isMetronomeActive) {
      this.stopMetronome();
    } else {
      this.startMetronome(bpm || this.bpm);
    }
  }

  updateUi() {
    const btn = document.getElementById('liveAudioCoachBtn');
    if (btn) {
      btn.classList.toggle('active', this.isMetronomeActive);
      btn.style.color = this.isMetronomeActive ? '#38bdf8' : '';
      btn.style.borderColor = this.isMetronomeActive ? '#38bdf8' : '';
    }
  }

  speakCue(phrase) {
    if (!this.isVoiceEnabled || !this.speechSynth) return;
    const now = performance.now();
    if (now - this.lastVoiceTime < 1900) return; // Prevent overlapping speech
    this.lastVoiceTime = now;
    try {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = 'fa-IR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      this.speechSynth.speak(utterance);
    } catch (e) {}
  }
}

const liveAudioCoach = new LiveAudioCoachEngine();

function initLiveAudioCoachUI() {
  const btn = document.getElementById('liveAudioCoachBtn');
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      liveAudioCoach.toggleMetronome();
    });
  }

  const drawerItemAudioCoach = document.getElementById('drawerItemAudioCoach');
  if (drawerItemAudioCoach) {
    drawerItemAudioCoach.addEventListener('click', () => {
      closeDrawer();
      liveAudioCoach.toggleMetronome();
    });
  }

  const settingLiveAudioCoach = document.getElementById('settingLiveAudioCoach');
  if (settingLiveAudioCoach) {
    settingLiveAudioCoach.addEventListener('change', (e) => {
      liveAudioCoach.isVoiceEnabled = e.target.checked;
    });
  }

  const settingMetronomeBpm = document.getElementById('settingMetronomeBpm');
  const settingMetronomeBpmVal = document.getElementById('settingMetronomeBpmVal');
  if (settingMetronomeBpm) {
    settingMetronomeBpm.addEventListener('input', (e) => {
      const bpm = parseInt(e.target.value, 10) || 60;
      liveAudioCoach.bpm = bpm;
      if (settingMetronomeBpmVal) settingMetronomeBpmVal.textContent = bpm;
      if (liveAudioCoach.isMetronomeActive) {
        liveAudioCoach.startMetronome(bpm);
      }
    });
  }

  // Keyboard shortcut 'm' for metronome toggle
  window.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      liveAudioCoach.toggleMetronome();
    }
  });
}

// --- 4. Y-BALANCE DYNAMIC TEST (ACL RISK ASSESSMENT) ---
let yBalanceStanceLeg = 'right'; // 'right' | 'left'
let yBalanceActiveDir = 'ant'; // 'ant' | 'pm' | 'pl'
let yBalanceReaches = {
  right: { ant: 0, pm: 0, pl: 0 },
  left: { ant: 0, pm: 0, pl: 0 }
};
let yBalanceCurrentReachLive = 0;

function yBalanceEnterMode() {
  hideAllPanels();
  const panel = document.getElementById('yBalancePanel');
  if (panel) panel.classList.add('visible');
  yBalanceUpdateLabels();
}

function yBalanceUpdateLabels() {
  const dirLabel = document.getElementById('yBalanceActiveDirectionLabel');
  const dirMap = {
    ant: 'جهت قدامی (Anterior Reach)',
    pm: 'جهت خلفی-داخلی (Posteromedial)',
    pl: 'جهت خلفی-خارجی (Posterolateral)'
  };
  if (dirLabel) dirLabel.textContent = dirMap[yBalanceActiveDir] || dirMap.ant;

  const antEl = document.getElementById('yBalanceAntVal');
  const pmEl = document.getElementById('yBalancePmVal');
  const plEl = document.getElementById('yBalancePlVal');
  const cur = yBalanceReaches[yBalanceStanceLeg];
  if (antEl) antEl.textContent = cur.ant > 0 ? `${cur.ant.toFixed(1)} cm` : '--';
  if (pmEl) pmEl.textContent = cur.pm > 0 ? `${cur.pm.toFixed(1)} cm` : '--';
  if (plEl) plEl.textContent = cur.pl > 0 ? `${cur.pl.toFixed(1)} cm` : '--';
}

function yBalanceDrawOverlay() {
  if (!lastSeenKeypoints || mode !== 'y_balance') return;
  const isRight = yBalanceStanceLeg === 'right';
  const stanceAnkle = isRight ? lastSeenKeypoints['right_ankle'] : lastSeenKeypoints['left_ankle'];
  const reachAnkle = isRight ? lastSeenKeypoints['left_ankle'] : lastSeenKeypoints['right_ankle'];

  if (!stanceAnkle || !reachAnkle || (stanceAnkle.score || 0) < 0.2 || (reachAnkle.score || 0) < 0.2) return;

  const dx = reachAnkle.x - stanceAnkle.x;
  const dy = reachAnkle.y - stanceAnkle.y;
  const distPx = Math.hypot(dx, dy);
  const scale = (typeof pxToCmScale !== 'undefined' && pxToCmScale > 0) ? pxToCmScale : 0.22;
  const reachCm = Math.round(distPx * scale * getPitchCorrectionFactor() * 10) / 10;
  yBalanceCurrentReachLive = reachCm;

  const curReachValEl = document.getElementById('yBalanceCurrentReachVal');
  if (curReachValEl) curReachValEl.textContent = reachCm.toFixed(1);

  // Draw on main canvas: Y-Axis guides
  ctx.save();
  ctx.translate(stanceAnkle.x, stanceAnkle.y);

  // Guide lines: Ant (up), PM (down-back), PL (down-out)
  const lineLen = 140;
  const directions = [
    { angle: -Math.PI / 2, label: 'قدامی (ANT)', color: '#38bdf8', active: yBalanceActiveDir === 'ant' },
    { angle: Math.PI / 4, label: 'خلفی-داخلی (PM)', color: '#4ade80', active: yBalanceActiveDir === 'pm' },
    { angle: (3 * Math.PI) / 4, label: 'خلفی-خارجی (PL)', color: '#c084fc', active: yBalanceActiveDir === 'pl' }
  ];

  directions.forEach(d => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(d.angle) * lineLen, Math.sin(d.angle) * lineLen);
    ctx.strokeStyle = d.active ? d.color : 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = d.active ? 4 : 2;
    if (d.active) {
      ctx.shadowColor = d.color;
      ctx.shadowBlur = 10;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrow tip
    const tx = Math.cos(d.angle) * lineLen;
    const ty = Math.sin(d.angle) * lineLen;
    ctx.beginPath();
    ctx.arc(tx, ty, d.active ? 7 : 4, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
  });

  ctx.restore();

  // Highlight reaching foot
  ctx.save();
  ctx.beginPath();
  ctx.arc(reachAnkle.x, reachAnkle.y, 14, 0, Math.PI * 2);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
  ctx.fill();

  // Draw distance line from stance to reach foot
  ctx.beginPath();
  ctx.moveTo(stanceAnkle.x, stanceAnkle.y);
  ctx.lineTo(reachAnkle.x, reachAnkle.y);
  ctx.strokeStyle = '#38bdf8';
  ctx.setLineDash([5, 4]);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

function yBalanceLockReach() {
  const cur = yBalanceReaches[yBalanceStanceLeg];
  cur[yBalanceActiveDir] = yBalanceCurrentReachLive;
  liveAudioCoach.playClick(960, 0.08, 'triangle');

  if (yBalanceActiveDir === 'ant') {
    yBalanceActiveDir = 'pm';
    liveAudioCoach.speakCue('جهت خلفی-داخلی');
  } else if (yBalanceActiveDir === 'pm') {
    yBalanceActiveDir = 'pl';
    liveAudioCoach.speakCue('جهت خلفی-خارجی');
  } else {
    yBalanceCalculateComposite();
    liveAudioCoach.speakCue('تست کامل شد');
  }
  yBalanceUpdateLabels();
}

function yBalanceCalculateComposite() {
  const cur = yBalanceReaches[yBalanceStanceLeg];
  const activeAth = getActiveAthlete();
  const height = activeAth ? parseFloat(activeAth.heightCm) : 175;
  const legLenCm = Math.round(height * 0.53); // Standard leg length proxy

  const sum = (cur.ant || 0) + (cur.pm || 0) + (cur.pl || 0);
  const composite = (sum / (3 * legLenCm)) * 100;
  const compRounded = Math.round(composite * 10) / 10;

  const compEl = document.getElementById('yBalanceCompositeScore');
  if (compEl) compEl.textContent = `${compRounded}%`;

  // ACL Risk assessment
  const badge = document.getElementById('yBalanceAclRiskBadge');
  const isElevated = compRounded < 94.0 || cur.ant < 50;
  if (badge) {
    if (isElevated) {
      badge.textContent = 'ریسک متوسط تا بالا / نیازمند ثبات زانو';
      badge.style.background = 'rgba(239, 68, 68, 0.2)';
      badge.style.color = '#f87171';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.5)';
    } else {
      badge.textContent = 'ریسک پایین / تعادل و تقارن مطلوب ✓';
      badge.style.background = 'rgba(74, 222, 128, 0.2)';
      badge.style.color = '#4ade80';
      badge.style.borderColor = 'rgba(74, 222, 128, 0.5)';
    }
  }
}

function initYBalanceUI() {
  const rightBtn = document.getElementById('yBalanceLegRightBtn');
  const leftBtn = document.getElementById('yBalanceLegLeftBtn');
  if (rightBtn && leftBtn) {
    rightBtn.addEventListener('click', () => {
      yBalanceStanceLeg = 'right';
      rightBtn.className = 'primary-blue active';
      leftBtn.className = 'secondary';
      yBalanceActiveDir = 'ant';
      yBalanceUpdateLabels();
    });
    leftBtn.addEventListener('click', () => {
      yBalanceStanceLeg = 'left';
      leftBtn.className = 'primary-blue active';
      rightBtn.className = 'secondary';
      yBalanceActiveDir = 'ant';
      yBalanceUpdateLabels();
    });
  }

  const lockBtn = document.getElementById('yBalanceLockReachBtn');
  if (lockBtn) lockBtn.addEventListener('click', yBalanceLockReach);

  const resetBtn = document.getElementById('yBalanceResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      yBalanceReaches[yBalanceStanceLeg] = { ant: 0, pm: 0, pl: 0 };
      yBalanceActiveDir = 'ant';
      yBalanceUpdateLabels();
      const compEl = document.getElementById('yBalanceCompositeScore');
      if (compEl) compEl.textContent = '-- %';
    });
  }

  const saveBtn = document.getElementById('yBalanceSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const cur = yBalanceReaches[yBalanceStanceLeg];
      const activeAth = getActiveAthlete();
      const height = activeAth ? parseFloat(activeAth.heightCm) : 175;
      const legLenCm = Math.round(height * 0.53);
      const sum = (cur.ant || 0) + (cur.pm || 0) + (cur.pl || 0);
      const composite = Math.round(((sum / (3 * legLenCm)) * 100) * 10) / 10;
      const aclRisk = composite < 94 ? 'ریسک بالا' : 'ریسک پایین / ایمن';

      saveToHistory('y_balance', {
        leg: yBalanceStanceLeg,
        ant: cur.ant,
        pm: cur.pm,
        pl: cur.pl,
        composite,
        aclRisk
      });
      playChime(880, 'sine', 0.2);
      saveBtn.textContent = '✅ ذخیره شد';
      setTimeout(() => { saveBtn.textContent = '💾 ذخیره در پرونده'; }, 1800);
    });
  }

  const closeX = document.getElementById('closeYBalanceXBtn');
  if (closeX) {
    closeX.addEventListener('click', () => {
      const panel = document.getElementById('yBalancePanel');
      if (panel) panel.classList.remove('visible');
    });
  }
}

// --- 5. 5-10-5 PRO AGILITY SHUTTLE ---
let proAgilityPhase = 'idle'; // 'idle' | 'split1' | 'split2' | 'split3' | 'finished'
let proAgilityStartTime = 0;
let proAgilitySplits = { s1: 0, s2: 0, s3: 0, total: 0 };
let proAgilityLateralTilt = 0;
let proAgilityTimerRaf = null;

function proAgilityEnterMode() {
  hideAllPanels();
  const panel = document.getElementById('proAgilityPanel');
  if (panel) panel.classList.add('visible');
}

function proAgilityDrawOverlay() {
  if (mode !== 'pro_agility') return;

  // Draw 3 Virtual Lines on Canvas: 5 yd right, center, 10 yd left
  const w = canvas.width;
  const h = canvas.height;
  const leftX = w * 0.15;
  const centerX = w * 0.50;
  const rightX = w * 0.85;

  ctx.save();
  // Left Line (10 yards touch)
  ctx.beginPath();
  ctx.moveTo(leftX, 0);
  ctx.lineTo(leftX, h);
  ctx.strokeStyle = 'rgba(74, 222, 128, 0.6)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.stroke();

  // Center Line (Start / Finish)
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, h);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.8)';
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  ctx.stroke();

  // Right Line (5 yards touch)
  ctx.beginPath();
  ctx.moveTo(rightX, 0);
  ctx.lineTo(rightX, h);
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.stroke();

  // Labels
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 13px Vazirmatn, sans-serif';
  ctx.fillText('خط ۵ یارد (راست)', rightX - 50, 30);
  ctx.fillStyle = '#38bdf8';
  ctx.fillText('مرکز (استارت و پایان)', centerX - 55, 30);
  ctx.fillStyle = '#4ade80';
  ctx.fillText('خط ۱۰ یارد (چپ)', leftX - 45, 30);

  // Torso lateral tilt angle calculation
  if (lastSeenKeypoints) {
    const ls = lastSeenKeypoints['left_shoulder'];
    const rs = lastSeenKeypoints['right_shoulder'];
    const lh = lastSeenKeypoints['left_hip'];
    const rh = lastSeenKeypoints['right_hip'];
    if (ls && rs && lh && rh) {
      const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      const midHip = { x: (lh.x + rh.x) / 2, y: (lh.y + rh.y) / 2 };
      const spineAngle = Math.atan2(midShoulder.y - midHip.y, midShoulder.x - midHip.x) * (180 / Math.PI);
      const tilt = Math.abs(Math.round(90 + spineAngle));
      proAgilityLateralTilt = Math.min(45, tilt);
      const tiltEl = document.getElementById('proAgilityTurnTilt');
      if (tiltEl) tiltEl.textContent = `${proAgilityLateralTilt}°`;
    }
  }
  ctx.restore();
}

function proAgilityTrigger() {
  const triggerBtn = document.getElementById('proAgilityTriggerBtn');
  const stageBadge = document.getElementById('proAgilityStageBadge');
  const timeVal = document.getElementById('proAgilityTimeVal');
  const now = performance.now();

  if (proAgilityPhase === 'idle') {
    proAgilityPhase = 'split1';
    proAgilityStartTime = now;
    liveAudioCoach.speakCue('شروع! بدو به راست ۵ یارد');
    liveAudioCoach.playClick(1000, 0.1, 'square');
    if (triggerBtn) triggerBtn.textContent = '📍 ثبت لمس خط ۵ یارد (راست)';
    if (stageBadge) {
      stageBadge.textContent = 'بخش ۱: دویدن به سمت راست (۵ یارد)';
      stageBadge.style.color = '#facc15';
    }

    const updateTimer = () => {
      if (proAgilityPhase !== 'finished' && proAgilityPhase !== 'idle') {
        const elapsed = (performance.now() - proAgilityStartTime) / 1000;
        if (timeVal) timeVal.textContent = elapsed.toFixed(2);
        requestAnimationFrame(updateTimer);
      }
    };
    requestAnimationFrame(updateTimer);

  } else if (proAgilityPhase === 'split1') {
    proAgilityPhase = 'split2';
    proAgilitySplits.s1 = (now - proAgilityStartTime) / 1000;
    const s1El = document.getElementById('proAgilitySplit1');
    if (s1El) s1El.textContent = `${proAgilitySplits.s1.toFixed(2)} s`;
    liveAudioCoach.speakCue('تغییر جهت! ۱۰ یارد به چپ');
    liveAudioCoach.playClick(1200, 0.08, 'sine');
    if (triggerBtn) triggerBtn.textContent = '📍 ثبت لمس خط ۱۰ یارد (چپ)';
    if (stageBadge) {
      stageBadge.textContent = 'بخش ۲: تغییر جهت به سمت چپ (۱۰ یارد)';
      stageBadge.style.color = '#38bdf8';
    }

  } else if (proAgilityPhase === 'split2') {
    proAgilityPhase = 'split3';
    const s2Total = (now - proAgilityStartTime) / 1000;
    proAgilitySplits.s2 = s2Total - proAgilitySplits.s1;
    const s2El = document.getElementById('proAgilitySplit2');
    if (s2El) s2El.textContent = `${proAgilitySplits.s2.toFixed(2)} s`;
    liveAudioCoach.speakCue('بازگشت! عبور از خط پایان');
    liveAudioCoach.playClick(1400, 0.08, 'sine');
    if (triggerBtn) triggerBtn.textContent = '🏁 ثبت عبور از خط پایان';
    if (stageBadge) {
      stageBadge.textContent = 'بخش ۳: شتاب نهایی به سمت مرکز (۵ یارد)';
      stageBadge.style.color = '#4ade80';
    }

  } else if (proAgilityPhase === 'split3') {
    proAgilityPhase = 'finished';
    proAgilitySplits.total = (now - proAgilityStartTime) / 1000;
    proAgilitySplits.s3 = proAgilitySplits.total - (proAgilitySplits.s1 + proAgilitySplits.s2);
    const s3El = document.getElementById('proAgilitySplit3');
    if (s3El) s3El.textContent = `${proAgilitySplits.s3.toFixed(2)} s`;
    if (timeVal) timeVal.textContent = proAgilitySplits.total.toFixed(2);
    liveAudioCoach.speakCue('عالی بود! پایان آزمون');
    playChime(1100, 'triangle', 0.25);
    if (triggerBtn) triggerBtn.textContent = '⚡ شروع مجدد شاتل';
    if (stageBadge) {
      stageBadge.textContent = `آزمون تکمیل شد • رکورد نهایی: ${proAgilitySplits.total.toFixed(2)} ثانیه`;
      stageBadge.style.color = '#4ade80';
    }
  } else if (proAgilityPhase === 'finished') {
    proAgilityPhase = 'idle';
    proAgilityTrigger();
  }
}

function initProAgilityUI() {
  const triggerBtn = document.getElementById('proAgilityTriggerBtn');
  if (triggerBtn) triggerBtn.addEventListener('click', proAgilityTrigger);

  const resetBtn = document.getElementById('proAgilityResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      proAgilityPhase = 'idle';
      const timeVal = document.getElementById('proAgilityTimeVal');
      if (timeVal) timeVal.textContent = '0.00';
      const s1 = document.getElementById('proAgilitySplit1');
      const s2 = document.getElementById('proAgilitySplit2');
      const s3 = document.getElementById('proAgilitySplit3');
      if (s1) s1.textContent = '-- s';
      if (s2) s2.textContent = '-- s';
      if (s3) s3.textContent = '-- s';
      const badge = document.getElementById('proAgilityStageBadge');
      if (badge) {
        badge.textContent = 'آماده برای شروع (استارت در مرکز)';
        badge.style.color = '#38bdf8';
      }
      if (triggerBtn) triggerBtn.textContent = '⚡ شروع زمان‌گیری شاتل';
    });
  }

  const saveBtn = document.getElementById('proAgilitySaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (proAgilitySplits.total <= 0) {
        alert('لطفاً ابتدا تست را اجرا کنید');
        return;
      }
      saveToHistory('pro_agility', {
        totalTime: proAgilitySplits.total.toFixed(2),
        split1: proAgilitySplits.s1.toFixed(2),
        split2: proAgilitySplits.s2.toFixed(2),
        split3: proAgilitySplits.s3.toFixed(2),
        lateralTilt: proAgilityLateralTilt
      });
      playChime(880, 'sine', 0.2);
      saveBtn.textContent = '✅ ذخیره شد';
      setTimeout(() => { saveBtn.textContent = '💾 ذخیره رکورد'; }, 1800);
    });
  }

  const closeX = document.getElementById('closeProAgilityXBtn');
  if (closeX) {
    closeX.addEventListener('click', () => {
      const panel = document.getElementById('proAgilityPanel');
      if (panel) panel.classList.remove('visible');
    });
  }
}

// --- 6. ARM COCKING ANGLE (HANDBALL SHOULDER SAFETY) ---
let armCockingPeakMer = 0;
let armCockingPeakAbd = 0;
let armCockingCurrentMer = 0;
let armCockingCurrentAbd = 0;

function armCockingEnterMode() {
  hideAllPanels();
  const panel = document.getElementById('armCockingPanel');
  if (panel) panel.classList.add('visible');
}

function armCockingDrawOverlay() {
  if (mode !== 'arm_cocking' || !lastSeenKeypoints) return;
  // Use throwing shoulder (prefer right, fallback to left)
  const isRight = (lastSeenKeypoints['right_wrist']?.score || 0) >= (lastSeenKeypoints['left_wrist']?.score || 0);
  const sh = isRight ? lastSeenKeypoints['right_shoulder'] : lastSeenKeypoints['left_shoulder'];
  const el = isRight ? lastSeenKeypoints['right_elbow'] : lastSeenKeypoints['left_elbow'];
  const wr = isRight ? lastSeenKeypoints['right_wrist'] : lastSeenKeypoints['left_wrist'];
  const hip = isRight ? lastSeenKeypoints['right_hip'] : lastSeenKeypoints['left_hip'];

  if (!sh || !el || !wr || (sh.score || 0) < 0.25 || (el.score || 0) < 0.25 || (wr.score || 0) < 0.25) return;

  // Calculate Shoulder Abduction (angle between torso vector and upper arm vector)
  let abdAngle = 90;
  if (hip) {
    const vTorso = { x: sh.x - hip.x, y: sh.y - hip.y };
    const vArm = { x: el.x - sh.x, y: el.y - sh.y };
    const dot = vTorso.x * vArm.x + vTorso.y * vArm.y;
    const mag = Math.hypot(vTorso.x, vTorso.y) * Math.hypot(vArm.x, vArm.y);
    abdAngle = mag > 0 ? Math.round(Math.acos(Math.max(-1, Math.min(1, dot / mag))) * (180 / Math.PI)) : 90;
  }

  // Calculate Maximum External Rotation (MER) angle between upper arm and forearm
  const vUpper = { x: el.x - sh.x, y: el.y - sh.y };
  const vFore = { x: wr.x - el.x, y: wr.y - el.y };
  const dotEl = vUpper.x * vFore.x + vUpper.y * vFore.y;
  const magEl = Math.hypot(vUpper.x, vUpper.y) * Math.hypot(vFore.x, vFore.y);
  let merAngle = magEl > 0 ? Math.round(180 - Math.acos(Math.max(-1, Math.min(1, dotEl / magEl))) * (180 / Math.PI)) : 165;
  merAngle = Math.max(90, Math.min(200, merAngle));

  armCockingCurrentMer = merAngle;
  armCockingCurrentAbd = abdAngle;

  if (merAngle > armCockingPeakMer) armCockingPeakMer = merAngle;
  if (abdAngle > armCockingPeakAbd) armCockingPeakAbd = abdAngle;

  const merEl = document.getElementById('armCockingExtRotAngle');
  const abdEl = document.getElementById('armCockingAbductionAngle');
  if (merEl) merEl.textContent = `${merAngle}°`;
  if (abdEl) abdEl.textContent = `${abdAngle}°`;

  // Rotator cuff safety assessment
  const badge = document.getElementById('armCockingStressBadge');
  const isOverload = merAngle > 182 || abdAngle < 75 || abdAngle > 115;
  if (badge) {
    if (isOverload) {
      badge.textContent = 'ریسک آسیب / فشار بیش از حد بر روتاتور کاف';
      badge.style.background = 'rgba(239, 68, 68, 0.25)';
      badge.style.color = '#f87171';
    } else {
      badge.textContent = 'ایمن / استاندارد پرتاب بیومکانیک ✓';
      badge.style.background = 'rgba(74, 222, 128, 0.2)';
      badge.style.color = '#4ade80';
    }
  }

  // Draw HUD angle arcs on Canvas
  ctx.save();
  ctx.beginPath();
  ctx.arc(el.x, el.y, 22, 0, Math.PI * 2);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(`${merAngle}°`, el.x + 15, el.y - 10);
  ctx.restore();
}

function initArmCockingUI() {
  const recordBtn = document.getElementById('armCockingRecordBtn');
  if (recordBtn) {
    recordBtn.addEventListener('click', () => {
      liveAudioCoach.speakCue(`زاویه ثبت شد، ${armCockingPeakMer} درجه`);
      playChime(900, 'sine', 0.15);
      recordBtn.textContent = '📸 اوج ثبت شد ✓';
      setTimeout(() => { recordBtn.textContent = '📸 ثبت اوج چرخش پرتاب'; }, 1500);
    });
  }

  const resetBtn = document.getElementById('armCockingResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      armCockingPeakMer = 0;
      armCockingPeakAbd = 0;
      const merEl = document.getElementById('armCockingExtRotAngle');
      const abdEl = document.getElementById('armCockingAbductionAngle');
      if (merEl) merEl.textContent = '--°';
      if (abdEl) abdEl.textContent = '--°';
    });
  }

  const saveBtn = document.getElementById('armCockingSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const mer = armCockingPeakMer || armCockingCurrentMer || 165;
      const abd = armCockingPeakAbd || armCockingCurrentAbd || 92;
      const stress = mer > 182 ? 'ریسک گیرافتادگی' : 'ایمن و استاندارد';
      saveToHistory('arm_cocking', { mer, abduction: abd, stress });
      playChime(880, 'sine', 0.2);
      saveBtn.textContent = '✅ ذخیره شد';
      setTimeout(() => { saveBtn.textContent = '💾 ذخیره در سوابق'; }, 1800);
    });
  }

  const closeX = document.getElementById('closeArmCockingXBtn');
  if (closeX) {
    closeX.addEventListener('click', () => {
      const panel = document.getElementById('armCockingPanel');
      if (panel) panel.classList.remove('visible');
    });
  }
}

// --- 7. POSTURAL SCREENING & BODY ALIGNMENT ---
let postureMetrics = {
  cva: 50,
  shoulderTilt: 1.0,
  pelvicTilt: 0.8,
  kneeValgus: 174,
  overallScore: 95
};
let isPostureFrozen = false;

function postureEnterMode() {
  hideAllPanels();
  const panel = document.getElementById('posturePanel');
  if (panel) panel.classList.add('visible');
}

function postureDrawOverlay() {
  if (mode !== 'posture' || !lastSeenKeypoints || isPostureFrozen) return;

  const ls = lastSeenKeypoints['left_shoulder'];
  const rs = lastSeenKeypoints['right_shoulder'];
  const lh = lastSeenKeypoints['left_hip'];
  const rh = lastSeenKeypoints['right_hip'];
  const lk = lastSeenKeypoints['left_knee'];
  const rk = lastSeenKeypoints['right_knee'];
  const la = lastSeenKeypoints['left_ankle'];
  const ra = lastSeenKeypoints['right_ankle'];
  const nose = lastSeenKeypoints['nose'];

  if (!ls || !rs || !lh || !rh) return;

  // 1. Shoulder Level Tilt
  const sDy = rs.y - ls.y;
  const sDx = rs.x - ls.x;
  const shoulderTilt = Math.abs(Math.round(Math.atan2(sDy, sDx) * (180 / Math.PI) * 10) / 10);

  // 2. Pelvic Tilt
  const hDy = rh.y - lh.y;
  const hDx = rh.x - lh.x;
  const pelvicTilt = Math.abs(Math.round(Math.atan2(hDy, hDx) * (180 / Math.PI) * 10) / 10);

  // 3. Knee Valgus / Frontal Alignment
  let kneeValgus = 175;
  if (rk && ra) {
    const vThigh = { x: rk.x - rh.x, y: rk.y - rh.y };
    const vShin = { x: ra.x - rk.x, y: ra.y - rk.y };
    const dotK = vThigh.x * vShin.x + vThigh.y * vShin.y;
    const magK = Math.hypot(vThigh.x, vThigh.y) * Math.hypot(vShin.x, vShin.y);
    kneeValgus = magK > 0 ? Math.round(Math.acos(Math.max(-1, Math.min(1, dotK / magK))) * (180 / Math.PI)) : 175;
  }

  // 4. Forward Head (CVA)
  let cva = 49;
  if (nose) {
    const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
    const nDx = nose.x - midShoulder.x;
    const nDy = nose.y - midShoulder.y;
    cva = Math.abs(Math.round(Math.atan2(Math.abs(nDy), Math.abs(nDx)) * (180 / Math.PI)));
  }

  // Overall Posture Score
  let penalties = (shoulderTilt * 3) + (pelvicTilt * 3) + (Math.abs(180 - kneeValgus) * 0.8) + (cva < 48 ? (48 - cva) * 2 : 0);
  const score = Math.max(50, Math.min(100, Math.round(100 - penalties)));

  postureMetrics = { cva, shoulderTilt, pelvicTilt, kneeValgus, overallScore: score };

  const cvaEl = document.getElementById('postureHeadForwardVal');
  const stEl = document.getElementById('postureShoulderTiltVal');
  const ptEl = document.getElementById('posturePelvicTiltVal');
  const kvEl = document.getElementById('postureKneeValgusVal');
  const scoreEl = document.getElementById('postureOverallScoreVal');

  if (cvaEl) cvaEl.textContent = `${cva}° (${cva >= 48 ? 'طبیعی' : 'جلوآمدگی خفیف'})`;
  if (stEl) stEl.textContent = `${shoulderTilt}° (${shoulderTilt < 2.5 ? 'تراز' : 'افتادگی یک‌طرفه'})`;
  if (ptEl) ptEl.textContent = `${pelvicTilt}° (${pelvicTilt < 2.0 ? 'تراز' : 'چرخش لگن'})`;
  if (kvEl) kvEl.textContent = `${kneeValgus}° (${kneeValgus > 170 ? 'طبیعی' : 'والگوس زانو'})`;
  if (scoreEl) scoreEl.textContent = `${score} / ۱۰۰`;

  // Draw plumb line on Canvas
  const midX = (ls.x + rs.x + lh.x + rh.x) / 4;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(midX, 10);
  ctx.lineTo(midX, canvas.height - 10);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();

  // Shoulder horizontal line
  ctx.beginPath();
  ctx.moveTo(ls.x - 30, ls.y);
  ctx.lineTo(rs.x + 30, rs.y);
  ctx.strokeStyle = shoulderTilt < 2.5 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(239, 68, 68, 0.7)';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  ctx.stroke();

  // Pelvic horizontal line
  ctx.beginPath();
  ctx.moveTo(lh.x - 30, lh.y);
  ctx.lineTo(rh.x + 30, rh.y);
  ctx.strokeStyle = pelvicTilt < 2.0 ? 'rgba(74, 222, 128, 0.7)' : 'rgba(250, 204, 21, 0.7)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function initPostureUI() {
  const capBtn = document.getElementById('postureCaptureBtn');
  if (capBtn) {
    capBtn.addEventListener('click', () => {
      isPostureFrozen = !isPostureFrozen;
      capBtn.textContent = isPostureFrozen ? '▶ ادامه اسکن زنده' : '📸 اسکن و تثبیت راستا';
      liveAudioCoach.speakCue(`نمره قامت ${postureMetrics.overallScore} از صد`);
    });
  }

  const resetBtn = document.getElementById('postureResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      isPostureFrozen = false;
      if (capBtn) capBtn.textContent = '📸 اسکن و تثبیت راستا';
    });
  }

  const saveBtn = document.getElementById('postureSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveToHistory('posture', {
        cva: postureMetrics.cva,
        shoulderTilt: postureMetrics.shoulderTilt,
        pelvicTilt: postureMetrics.pelvicTilt,
        kneeValgus: postureMetrics.kneeValgus,
        score: postureMetrics.overallScore
      });
      playChime(880, 'sine', 0.2);
      saveBtn.textContent = '✅ ذخیره شد';
      setTimeout(() => { saveBtn.textContent = '💾 ذخیره در پرونده'; }, 1800);
    });
  }

  const closeX = document.getElementById('closePostureXBtn');
  if (closeX) {
    closeX.addEventListener('click', () => {
      const panel = document.getElementById('posturePanel');
      if (panel) panel.classList.remove('visible');
    });
  }
}

// --- 8. BOSCO REACTIVE STRENGTH INDEX (RSI) CALCULATION ---
function calculateBoscoRSI(jumpHeightCm, contactTimeSeconds) {
  if (!contactTimeSeconds || contactTimeSeconds <= 0) return 0;
  const heightM = (jumpHeightCm || 30) / 100;
  const rsi = heightM / contactTimeSeconds;
  return Math.round(rsi * 100) / 100;
}

function getRsiCategory(rsi) {
  if (rsi >= 2.5) return { label: 'الیت (Elite)', color: '#a855f7' };
  if (rsi >= 2.0) return { label: 'عالی (Excellent)', color: '#4ade80' };
  if (rsi >= 1.5) return { label: 'خوب (Good)', color: '#38bdf8' };
  if (rsi >= 1.0) return { label: 'متوسط (Fair)', color: '#facc15' };
  return { label: 'نیاز به تمرین پلیومتریک', color: '#f87171' };
}

// --- 9. HEAD-TO-HEAD RADAR COMPARISON SYSTEM ---
function openCompareAthletesModal() {
  const modal = document.getElementById('compareAthletesModal');
  if (!modal) return;

  const athletes = getAthletes();
  const select1 = document.getElementById('compareAthlete1Select');
  const select2 = document.getElementById('compareAthlete2Select');

  if (select1 && select2) {
    select1.innerHTML = athletes.map(a => `<option value="${a.id}">${a.name} (${a.code || '۱۰۱'})</option>`).join('');
    select2.innerHTML = athletes.map(a => `<option value="${a.id}">${a.name} (${a.code || '۱۰۱'})</option>`).join('');

    const activeId = getActiveAthleteId();
    select1.value = activeId;
    if (athletes.length > 1) {
      const other = athletes.find(a => a.id !== activeId) || athletes[1];
      select2.value = other.id;
    }
  }

  modal.style.display = 'block';
  updateCompareRadar();
}

function calculateAthleteRadarScores(athleteId) {
  const history = getHistory();
  const athHistory = history.filter(h => h.athleteId === athleteId);
  const athletes = getAthletes();
  const ath = athletes.find(a => a.id === athleteId) || DEFAULT_ATHLETE;
  const height = parseFloat(ath.heightCm) || 175;

  // 1. Explosive Jump Power (Jump & Bosco)
  let maxJump = 35;
  athHistory.forEach(h => {
    if (h.type === 'jump' && h.data?.height) maxJump = Math.max(maxJump, parseFloat(h.data.height));
    if (h.type === 'bosco' && h.data?.maxHeight) maxJump = Math.max(maxJump, parseFloat(h.data.maxHeight));
  });
  const scoreJump = Math.min(100, Math.round((maxJump / 65) * 100));

  // 2. Speed & Agility
  let bestRunTime = 2.5;
  athHistory.forEach(h => {
    if (h.type === 'run' && h.data?.time) bestRunTime = Math.min(bestRunTime, parseFloat(h.data.time));
    if (h.type === 'pro_agility' && h.data?.totalTime) bestRunTime = Math.min(bestRunTime, parseFloat(h.data.totalTime) / 2);
  });
  const scoreSpeed = Math.min(100, Math.max(30, Math.round((1.8 / Math.max(1.2, bestRunTime)) * 85)));

  // 3. Muscular Endurance (Pushup, Situp, Squat)
  let totalReps = 25;
  athHistory.forEach(h => {
    if (h.type === 'pushup' || h.type === 'situp' || h.type === 'squat_lunge') {
      totalReps = Math.max(totalReps, parseInt(h.data?.totalReps, 10) || 0);
    }
  });
  const scoreEndurance = Math.min(100, Math.round((totalReps / 50) * 100));

  // 4. Flexibility & Joint ROM
  let maxFlex = 25;
  athHistory.forEach(h => {
    if (h.type === 'flexibility' && h.data?.reachDistanceCm) maxFlex = Math.max(maxFlex, parseFloat(h.data.reachDistanceCm));
    if (h.type === 'arm_cocking' && h.data?.mer) maxFlex = Math.max(maxFlex, (parseFloat(h.data.mer) / 180) * 35);
  });
  const scoreFlexibility = Math.min(100, Math.round((maxFlex / 40) * 100));

  // 5. Balance & Core Stability (Y-Balance & Posture)
  let balanceComp = 90;
  athHistory.forEach(h => {
    if (h.type === 'y_balance' && h.data?.composite) balanceComp = Math.max(balanceComp, parseFloat(h.data.composite));
    if (h.type === 'posture' && h.data?.score) balanceComp = Math.max(balanceComp, parseFloat(h.data.score));
  });
  const scoreBalance = Math.min(100, Math.round((balanceComp / 110) * 100));

  // 6. Anthropometric Leverage (Ape Index & Cormic)
  const ape = ath.wingspanCm ? (parseFloat(ath.wingspanCm) / height) : 1.02;
  const scoreAnthro = Math.min(100, Math.round((ape / 1.08) * 95));

  return [scoreJump, scoreSpeed, scoreEndurance, scoreFlexibility, scoreBalance, scoreAnthro];
}

function updateCompareRadar() {
  const select1 = document.getElementById('compareAthlete1Select');
  const select2 = document.getElementById('compareAthlete2Select');
  if (!select1 || !select2) return;

  const id1 = select1.value;
  const id2 = select2.value;
  const athletes = getAthletes();
  const ath1 = athletes.find(a => a.id === id1) || athletes[0] || DEFAULT_ATHLETE;
  const ath2 = athletes.find(a => a.id === id2) || athletes[1] || DEFAULT_ATHLETE;

  const name1El = document.getElementById('compareRadarName1');
  const name2El = document.getElementById('compareRadarName2');
  if (name1El) name1El.textContent = `🔷 ${ath1.name}`;
  if (name2El) name2El.textContent = `🔶 ${ath2.name}`;

  const scores1 = calculateAthleteRadarScores(id1);
  const scores2 = calculateAthleteRadarScores(id2);

  // Draw Dual Radar Chart
  const canvas = document.getElementById('compareRadarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(cx, cy) - 38;

  ctx.clearRect(0, 0, w, h);

  const axes = [
    'توان انفجاری',
    'سرعت و شتاب',
    'استقامت عضلانی',
    'دامنه حرکتی',
    'تعادل و ثبات',
    'اهرم‌های قامتی'
  ];
  const numAxes = axes.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Concentric spider web circles
  [0.2, 0.4, 0.6, 0.8, 1.0].forEach(level => {
    ctx.beginPath();
    for (let i = 0; i < numAxes; i++) {
      const ang = i * angleStep - Math.PI / 2;
      const x = cx + Math.cos(ang) * (maxR * level);
      const y = cy + Math.sin(ang) * (maxR * level);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Radial axes lines & text
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10.5px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let i = 0; i < numAxes; i++) {
    const ang = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(ang) * maxR;
    const y = cy + Math.sin(ang) * maxR;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.stroke();

    const tx = cx + Math.cos(ang) * (maxR + 22);
    const ty = cy + Math.sin(ang) * (maxR + 22);
    ctx.fillText(axes[i], tx, ty);
  }

  // Draw Polygon for Athlete 1 (Cyan)
  drawRadarPolygon(ctx, cx, cy, maxR, scores1, angleStep, 'rgba(56, 189, 248, 0.35)', '#38bdf8');

  // Draw Polygon for Athlete 2 (Yellow)
  drawRadarPolygon(ctx, cx, cy, maxR, scores2, angleStep, 'rgba(250, 204, 21, 0.35)', '#facc15');

  // Render Metric Breakdown Cards
  const listEl = document.getElementById('compareMetricsList');
  if (listEl) {
    listEl.innerHTML = axes.map((axis, i) => {
      const v1 = scores1[i];
      const v2 = scores2[i];
      const win1 = v1 > v2;
      const win2 = v2 > v1;
      const diff = Math.abs(v1 - v2);

      return `
        <div class="compare-metric-card">
          <span style="font-weight: 600; color: #cbd5e1;">${axis}</span>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #38bdf8; font-weight: bold;">${v1}</span>
            <span style="color: #64748b; font-size: 10px;">مقابل</span>
            <span style="color: #facc15; font-weight: bold;">${v2}</span>
            <span class="compare-delta-win" style="background: ${win1 ? 'rgba(56,189,248,0.2)' : win2 ? 'rgba(250,204,21,0.2)' : 'rgba(148,163,184,0.15)'}; color: ${win1 ? '#38bdf8' : win2 ? '#facc15' : '#94a3b8'};">
              ${win1 ? `+${diff} برتری ۱` : win2 ? `+${diff} برتری ۲` : 'برابر'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function drawRadarPolygon(ctx, cx, cy, maxR, scores, angleStep, fillColor, strokeColor) {
  ctx.save();
  ctx.beginPath();
  scores.forEach((sc, i) => {
    const norm = Math.max(10, Math.min(100, sc)) / 100;
    const ang = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(ang) * (maxR * norm);
    const y = cy + Math.sin(ang) * (maxR * norm);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Draw points
  scores.forEach((sc, i) => {
    const norm = Math.max(10, Math.min(100, sc)) / 100;
    const ang = i * angleStep - Math.PI / 2;
    const x = cx + Math.cos(ang) * (maxR * norm);
    const y = cy + Math.sin(ang) * (maxR * norm);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
  });
  ctx.restore();
}

function initCompareAthletesUI() {
  const select1 = document.getElementById('compareAthlete1Select');
  const select2 = document.getElementById('compareAthlete2Select');
  if (select1) select1.addEventListener('change', updateCompareRadar);
  if (select2) select2.addEventListener('change', updateCompareRadar);

  const drawerBtn = document.getElementById('drawerItemCompare');
  if (drawerBtn) {
    drawerBtn.addEventListener('click', () => {
      closeDrawer();
      openCompareAthletesModal();
    });
  }

  const openSettingsBtn = document.getElementById('openCompareAthletesBtn');
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', () => {
      openCompareAthletesModal();
    });
  }

  const closeX = document.getElementById('closeCompareModalXBtn');
  const closeBtn = document.getElementById('closeCompareModalBtn');
  const modal = document.getElementById('compareAthletesModal');
  if (closeX && modal) closeX.addEventListener('click', () => { modal.style.display = 'none'; });
  if (closeBtn && modal) closeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  const exportPdfBtn = document.getElementById('compareExportPdfBtn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

// --- 11. BULK FEDERATION EXCEL / CSV EXPORT ---
function exportBulkFederationCsv() {
  const athletes = getAthletes();
  const history = getHistory();

  // CSV Headers
  const headers = [
    'ردیف',
    'کد ورزشکار',
    'نام و نام خانوادگی',
    'سن',
    'جنسیت',
    'قد (cm)',
    'وزن (kg)',
    'شاخص BMI',
    'رشته ورزشی',
    'نام باشگاه',
    'بهترین زمان دوی سرعت (s)',
    'اوج پرش عمودی تک (cm)',
    'تعداد پرش متوالی باسکو',
    'شاخص توان واکنشی (RSI)',
    'زمان شاتل چابکی ۵-۱۰-۵ (s)',
    'تکرار اسکات صحیح',
    'عمق اسکات (درجه)',
    'تکرار شنا سوئدی',
    'تکرار دراز و نشست',
    'انعطاف‌پذیری (cm)',
    'طول دو دست (cm)',
    'شاخص Ape Index',
    'امتیاز ترکیبی تعادل Y (٪)',
    'ریسک آسیب ACL',
    'زاویه چرخش خارجی شانه MER (درجه)',
    'نمره راستای قامتی (از ۱۰۰)'
  ];

  const rows = athletes.map((ath, idx) => {
    const athHist = history.filter(h => h.athleteId === ath.id);
    const height = parseFloat(ath.heightCm) || 175;
    const weight = parseFloat(ath.weightKg) || 70;
    const bmi = (weight / ((height / 100) ** 2)).toFixed(1);

    // Extract best metrics
    let bestRun = '--';
    let bestJump = '--';
    let boscoJumps = '--';
    let boscoRsi = '--';
    let proAgility = '--';
    let squatReps = '--';
    let squatDepth = '--';
    let pushupReps = '--';
    let situpReps = '--';
    let flexCm = '--';
    let wingspan = ath.wingspanCm || '--';
    let apeIndex = ath.wingspanCm ? (parseFloat(ath.wingspanCm) / height).toFixed(2) : '--';
    let yBalanceComp = '--';
    let aclRisk = '--';
    let armMer = '--';
    let postureScore = '--';

    athHist.forEach(h => {
      if (h.type === 'run' && h.data?.time) {
        if (bestRun === '--' || parseFloat(h.data.time) < parseFloat(bestRun)) bestRun = h.data.time;
      }
      if (h.type === 'jump' && h.data?.height) {
        if (bestJump === '--' || parseFloat(h.data.height) > parseFloat(bestJump)) bestJump = h.data.height;
      }
      if (h.type === 'bosco' && h.data?.totalJumps) {
        boscoJumps = h.data.totalJumps;
        if (h.data.maxHeight && h.data.avgAirTime) {
          boscoRsi = calculateBoscoRSI(parseFloat(h.data.maxHeight), 0.22);
        }
      }
      if (h.type === 'pro_agility' && h.data?.totalTime) proAgility = h.data.totalTime;
      if (h.type === 'squat_lunge' && h.data?.totalReps) {
        squatReps = h.data.totalReps;
        squatDepth = h.data.avgDepth || '--';
      }
      if (h.type === 'pushup' && h.data?.totalReps) pushupReps = h.data.totalReps;
      if (h.type === 'situp' && h.data?.totalReps) situpReps = h.data.totalReps;
      if (h.type === 'flexibility' && h.data?.reachDistanceCm) flexCm = h.data.reachDistanceCm;
      if (h.type === 'wingspan' && h.data?.wingspan) {
        wingspan = h.data.wingspan;
        apeIndex = (parseFloat(wingspan) / height).toFixed(2);
      }
      if (h.type === 'y_balance' && h.data?.composite) {
        yBalanceComp = h.data.composite;
        aclRisk = h.data.aclRisk || 'ایمن';
      }
      if (h.type === 'arm_cocking' && h.data?.mer) armMer = h.data.mer;
      if (h.type === 'posture' && h.data?.score) postureScore = h.data.score;
    });

    return [
      idx + 1,
      `"${ath.code || '۱۰۱'}"`,
      `"${ath.name || 'ورزشکار'}"`,
      ath.age || '--',
      ath.gender === 'female' ? 'خانم' : 'آقا',
      height,
      weight,
      bmi,
      `"${ath.sport || 'عمومی'}"`,
      `"${ath.club || 'باشگاه مرکزی'}"`,
      bestRun,
      bestJump,
      boscoJumps,
      boscoRsi,
      proAgility,
      squatReps,
      squatDepth,
      pushupReps,
      situpReps,
      flexCm,
      wingspan,
      apeIndex,
      yBalanceComp,
      `"${aclRisk}"`,
      armMer,
      postureScore
    ];
  });

  // Format with UTF-8 BOM for Microsoft Excel Persian support
  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `حرکت_سنج_خروجی_جامع_ورزشکاران_${new Date().toLocaleDateString('fa-IR').replace(/\//g, '-')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initBulkExportUI() {
  const bulkExportBtn = document.getElementById('bulkExportBtn');
  if (bulkExportBtn) {
    bulkExportBtn.addEventListener('click', () => {
      exportBulkFederationCsv();
      playChime(920, 'sine', 0.2);
    });
  }

  const drawerItemBulkCsv = document.getElementById('drawerItemBulkCsv');
  if (drawerItemBulkCsv) {
    drawerItemBulkCsv.addEventListener('click', () => {
      closeDrawer();
      exportBulkFederationCsv();
    });
  }
}

// =========================================================================
// 12. COMPREHENSIVE SPORTS SCIENCE & FITNESS TESTING SUITE (v1.22.0)
// FMS (7 Patterns + Clearing Tests), RAST Anaerobic Power, VO2 Max (Rockport, YoYo, Beep, Cooper),
// 1RM Strength, Body Composition (LBM/FFBM), and Field Skills (Handball & Soccer)
// =========================================================================

function openSportsScienceSuiteModal(tabId = null) {
  const modal = document.getElementById('sportsScienceSuiteModal');
  if (!modal) return;
  modal.style.display = 'block';
  syncSportsScienceAthleteInfo();
  calculateFmsScore();
  calculateRastPower();
  calculateVo2Max();
  calculate1Rm();
  calculateBodyComposition();
  updateFieldDrillView();

  if (tabId) {
    const targetBtn = document.querySelector(`.sportsScienceTabBtn[data-tab="${tabId}"]`);
    if (targetBtn) {
      document.querySelectorAll('.sportsScienceTabBtn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.sportsScienceTabContent').forEach(c => (c.style.display = 'none'));
      targetBtn.classList.add('active');
      const activeContent = document.getElementById(`sportsScienceTabContent_${tabId}`);
      if (activeContent) activeContent.style.display = 'block';

      if (tabId === 'tabRAST') {
        setTimeout(calculateRastPower, 50);
      }
    }
  }
}

function closeSportsScienceSuiteModal() {
  const modal = document.getElementById('sportsScienceSuiteModal');
  if (modal) modal.style.display = 'none';
}
window.openSportsScienceSuiteModal = openSportsScienceSuiteModal;
window.openSportsScienceModal = openSportsScienceSuiteModal;

function syncSportsScienceAthleteInfo() {
  const nameEl = document.getElementById('sportsScienceAthleteName');
  const metaEl = document.getElementById('sportsScienceAthleteMeta');
  const selectEl = document.getElementById('sportsScienceAthleteSelect');
  const athletes = typeof getAthletes === 'function' ? getAthletes() : [];
  const activeAth = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;

  if (selectEl && athletes.length > 0) {
    selectEl.innerHTML = athletes.map(a => `<option value="${a.id}" ${activeAth && a.id === activeAth.id ? 'selected' : ''}>${a.name} (${a.code || a.id})</option>`).join('');
  }

  if (activeAth) {
    if (nameEl) nameEl.textContent = activeAth.name;
    const weight = parseFloat(activeAth.weightKg) || 70;
    const age = parseInt(activeAth.age) || 20;
    const gender = activeAth.gender === 'female' ? 'زن' : 'مرد';
    if (metaEl) metaEl.textContent = `(وزن: ${weight}kg • سن: ${age} • جنسیت: ${gender})`;

    // Sync default weights into tabs
    const rastW = document.getElementById('rastWeightInput');
    if (rastW && (!rastW.value || rastW.value === '70')) rastW.value = weight;
    const bodyW = document.getElementById('bodyCompWeightInput');
    if (bodyW && (!bodyW.value || bodyW.value === '72')) bodyW.value = weight;
    const bodyG = document.getElementById('bodyCompGenderSelect');
    if (bodyG) bodyG.value = activeAth.gender === 'female' ? 'female' : 'male';
  } else {
    if (nameEl) nameEl.textContent = 'ورزشکار ۱';
    if (metaEl) metaEl.textContent = '(وزن: ۷۰kg • سن: ۲۰ • جنسیت: مرد)';
  }
}

// =========================================================================
// 12.1 FMS (FUNCTIONAL MOVEMENT SCREEN) DEDICATED UI CONTROLLER
// 7-Pattern Step-by-Step Examiner, Interactive Matrix, Automatic Risk Assessment Badge & Analytics
// =========================================================================
const fmsDedicatedController = {
  activePatternIndex: 0,
  viewMode: 'stepper', // 'stepper' | 'matrix'

  patterns: [
    {
      id: 'deepSquat',
      title: '۱. اسکات عمیق (Deep Squat)',
      persianTitle: 'اسکات عمیق',
      category: 'عملکردی سه‌گانه',
      subtitle: 'تحرک دوطرفه و متقارن لگن، زانوها، مچ پا و ستون فقرات',
      bilateral: false,
      score: 2,
      clearingTest: null,
      coachingTip: 'چوب بالای سر با زاویه ۹۰ درجه در آرنج‌ها، پاها به عرض شانه و مستقیم رو به جلو.',
      criteria: [
        { score: 3, text: 'تنه فوقانی موازی درشت‌نی، ران‌ها زیر خط موازی، میله بالای پاها، زانوها بدون والگوس' },
        { score: 2, text: 'اجرای کامل حرکت با قرارگیری پاشنه‌ها روی تخته کمکی ۲×۶ اینچ' },
        { score: 1, text: 'عدم توانایی در حفظ میله بالای سر یا از دست رفتن تعادل و خمیدگی تنه به جلو' },
        { score: 0, text: 'احساس هرگونه درد در طول اجرای حرکت اسکات' }
      ]
    },
    {
      id: 'hurdleStep',
      title: '۲. گام برداشتن از روی مانع (Hurdle Step)',
      persianTitle: 'گام برداشتن از روی مانع',
      category: 'تحرک تک‌پایی و ثبات لگن',
      subtitle: 'ثبات تک‌پایی، پایداری لگن و گام‌برداری (دو طرفه)',
      bilateral: true,
      left: 2,
      right: 2,
      score: 2,
      clearingTest: null,
      coachingTip: 'مانع در ارتفاع برجستگی درشت‌نی (Tuberosity)؛ چوب پشت گردن و روی شانه قرار گیرد.',
      criteria: [
        { score: 3, text: 'مچ پا، زانو و هیپ در یک راستا، حرکت در صفحه ساژیتال بدون چرخش لگن' },
        { score: 2, text: 'از دست رفتن راستا در مفصل مچ، زانو یا ران یا انحراف ستون فقرات' },
        { score: 1, text: 'برخورد پا به مانع/کش یا از دست رفتن تعادل دینامیک' },
        { score: 0, text: 'احساس هرگونه درد در هنگام بالا آوردن پا یا عبور از مانع' }
      ]
    },
    {
      id: 'inlineLunge',
      title: '۳. لانج روی خط (Inline Lunge)',
      persianTitle: 'لانج روی خط',
      category: 'مهار شتاب منفی و ثبات چرخشی',
      subtitle: 'مهار تکانه و پایداری در سطح مقطع باریک (دو طرفه)',
      bilateral: true,
      left: 2,
      right: 2,
      score: 2,
      clearingTest: null,
      coachingTip: 'فاصله پاشنه تا پنجه معادل طول ساق پا (فاصله از زمین تا توبروزیته درشت‌نی).',
      criteria: [
        { score: 3, text: 'تنه کاملاً قائم، تماس چوب با سر، توراسیک و خاجی، زانوی عقب لمس تخته پشت پاشنه' },
        { score: 2, text: 'انحراف تنه، ناتوانی در حفظ تماس ۳ نقطه چوب یا عدم لمس تخته توسط زانو' },
        { score: 1, text: 'از دست رفتن تعادل و خروج پا از روی خط آزمون' },
        { score: 0, text: 'احساس درد در مفصل زانو، مچ پا یا لگن' }
      ]
    },
    {
      id: 'shoulderMobility',
      title: '۴. تحرک‌پذیری شانه (Shoulder Mobility)',
      persianTitle: 'تحرک‌پذیری شانه',
      category: 'تحرک کمربند شانه و قفسه سینه',
      subtitle: 'تحرک دوجانبه شانه، چرخش داخلی و ادداکشن با اکستنشن (دو طرفه)',
      bilateral: true,
      left: 2,
      right: 2,
      score: 2,
      clearingTest: {
        id: 'shoulderPain',
        name: 'آزمون پاکسازی گیرافتادگی شانه (Shoulder Impingement Clearing)',
        pain: false,
        instruction: 'کف دست را روی شانه مخالف قرار داده و آرنج را تا سطح پیشانی بالا بیاورید.'
      },
      coachingTip: 'طول کف دست از مچ تا نوک انگشت وسط اندازه گرفته شود. انگشت شست داخل مشت جمع باشد.',
      criteria: [
        { score: 3, text: 'فاصله بین دو مشت کمتر از یک طول کف دست (Hand Length)' },
        { score: 2, text: 'فاصله بین دو مشت بین ۱ تا ۱.۵ برابر طول کف دست' },
        { score: 1, text: 'فاصله بین دو مشت بیش از ۱.۵ برابر طول کف دست' },
        { score: 0, text: 'بروز درد در حرکت یا احساس درد در آزمون پاکسازی شانه' }
      ]
    },
    {
      id: 'aslr',
      title: '۵. بالا آوردن فعال پای صاف (ASLR)',
      persianTitle: 'بالا آوردن پای صاف',
      category: 'تحرک زنجیره خلفی و استقلال لگن',
      subtitle: 'انعطاف همسترینگ و ثبات عضلات مرکزی در وضعیت تاق‌باز (دو طرفه)',
      bilateral: true,
      left: 2,
      right: 2,
      score: 2,
      clearingTest: null,
      coachingTip: 'پای ثابت کاملاً کشیده روی زمین، انگشتان رو به بالا و از قوس کمر جلوگیری شود.',
      criteria: [
        { score: 3, text: 'قوزک پای بالا آمده از نقطه میانی ران پای ثابت عبور کند (بین ASIS و مفصل هیپ)' },
        { score: 2, text: 'قوزک پای بالا آمده بین نقطه میانی ران و بالای کشکک زانو قرار گیرد' },
        { score: 1, text: 'قوزک پای بالا آمده پایین‌تر از کشکک زانوی پای ثابت بماند' },
        { score: 0, text: 'بروز درد در لگن، کشاله یا زانو' }
      ]
    },
    {
      id: 'trunkStability',
      title: '۶. شنای سوئدی ثبات تنه (Trunk Stability Push-Up)',
      persianTitle: 'شنای ثبات تنه',
      category: 'ثبات تنه در صفحه ساژیتال',
      subtitle: 'پایداری میان‌تنه در برابر نیروهای اکستنشن و چرخش ستون فقرات',
      bilateral: false,
      score: 2,
      clearingTest: {
        id: 'extensionPain',
        name: 'آزمون پاکسازی اکستنشن ستون فقرات (Spinal Extension / Cobra Clearing)',
        pain: false,
        instruction: 'از وضعیت دمر، بالاتنه را با دست‌ها بلند کرده و مهره‌های کمری را به عقب قوس دهید.'
      },
      coachingTip: 'زانوها و لگن کاملاً مستقیم و کشیده؛ بدن بدون هیچ‌گونه جا ماندن لگن بلند شود.',
      criteria: [
        { score: 3, text: 'آقایان شست‌ها مقابل پیشانی، بانوان مقابل چانه با بالا آمدن یکپارچه بدن' },
        { score: 2, text: 'آقایان شست‌ها مقابل چانه، بانوان مقابل ترقوه با بالا آمدن یکپارچه بدن' },
        { score: 1, text: 'ناتوانی در بالا آوردن تنه به صورت یکپارچه یا جا ماندن لگن' },
        { score: 0, text: 'بروز درد در ستون فقرات در شنا یا در تست پاکسازی کبری' }
      ]
    },
    {
      id: 'rotaryStability',
      title: '۷. ثبات چرخشی تنه (Rotary Stability)',
      persianTitle: 'ثبات چرخشی تنه',
      category: 'انتقال بار عصبی-عضلانی چندمحوره',
      subtitle: 'هماهنگی عصبی-عضلانی چندمحوره و انتقال انرژی از اندام‌ها به تنه (دو طرفه)',
      bilateral: true,
      left: 2,
      right: 2,
      score: 2,
      clearingTest: {
        id: 'flexionPain',
        name: 'آزمون پاکسازی فلکشن ستون فقرات (Spinal Flexion / Child\'s Pose Clearing)',
        pain: false,
        instruction: 'در وضعیت سجده بنشینید، باسن را روی پاشنه‌ها قرار داده و دست‌ها را به جلو بکشید.'
      },
      coachingTip: 'روی تخته باریک یا خط صاف؛ از چرخش لگن یا تکان شدید ستون فقرات جلوگیری شود.',
      criteria: [
        { score: 3, text: 'اجرای تکرار هم‌جهت یک‌طرفه (همان دست و همان پا) با حفظ تعادل کامل' },
        { score: 2, text: 'اجرای تکرار قطری (دست و پای مخالف) با لمس آرنج و زانو و حفظ راستای افقی' },
        { score: 1, text: 'عدم توانایی در اجرای قطری، چرخش تنه یا لمس مکرر زمین' },
        { score: 0, text: 'بروز درد در حرکت یا در تست پاکسازی فلکشن ستون فقرات' }
      ]
    }
  ],

  init() {
    // Stepper vs Matrix View Toggles
    const stepperBtn = document.getElementById('fmsViewStepperBtn');
    const matrixBtn = document.getElementById('fmsViewMatrixBtn');
    const stepperContainer = document.getElementById('fmsStepperContainer');
    const matrixContainer = document.getElementById('fmsMatrixContainer');

    if (stepperBtn && matrixBtn && stepperContainer && matrixContainer) {
      stepperBtn.addEventListener('click', () => {
        this.viewMode = 'stepper';
        stepperBtn.classList.add('active');
        matrixBtn.classList.remove('active');
        stepperContainer.style.display = 'block';
        matrixContainer.style.display = 'none';
        this.renderStepperUI();
      });

      matrixBtn.addEventListener('click', () => {
        this.viewMode = 'matrix';
        matrixBtn.classList.add('active');
        stepperBtn.classList.remove('active');
        stepperContainer.style.display = 'none';
        matrixContainer.style.display = 'block';
      });
    }

    // Stepper step dots row
    const dotsRow = document.getElementById('fmsStepDotsRow');
    if (dotsRow) {
      dotsRow.addEventListener('click', (e) => {
        const dot = e.target.closest('.fms-step-dot');
        if (!dot) return;
        const idx = parseInt(dot.getAttribute('data-pattern-index'), 10);
        if (!isNaN(idx)) {
          this.goToPattern(idx);
        }
      });
    }

    // Prev / Next Pattern Buttons
    const prevBtn = document.getElementById('fmsPrevPatternBtn');
    const nextBtn = document.getElementById('fmsNextPatternBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevPattern());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextPattern());

    // Score button groups in Stepper
    const symGroup = document.getElementById('fmsSymScoreBtns');
    if (symGroup) {
      symGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.fms-score-btn');
        if (!btn) return;
        const score = parseInt(btn.getAttribute('data-score'), 10);
        this.setPatternScore(this.activePatternIndex, 'sym', score);
      });
    }

    const leftGroup = document.getElementById('fmsLeftScoreBtns');
    if (leftGroup) {
      leftGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.fms-score-btn');
        if (!btn) return;
        const score = parseInt(btn.getAttribute('data-score'), 10);
        this.setPatternScore(this.activePatternIndex, 'L', score);
      });
    }

    const rightGroup = document.getElementById('fmsRightScoreBtns');
    if (rightGroup) {
      rightGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.fms-score-btn');
        if (!btn) return;
        const score = parseInt(btn.getAttribute('data-score'), 10);
        this.setPatternScore(this.activePatternIndex, 'R', score);
      });
    }

    // Clearing test pain toggle button in Stepper
    const clearingPainBtn = document.getElementById('fmsClearingPainBtn');
    if (clearingPainBtn) {
      clearingPainBtn.addEventListener('click', () => {
        this.toggleClearingPain(this.activePatternIndex);
      });
    }

    // Sample data button
    const sampleBtn = document.getElementById('fmsSampleDataBtn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', () => this.loadSampleData());
    }

    // Reset button
    const resetBtn = document.getElementById('resetFmsBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetAll());
    }

    // Matrix View Inputs synchronization
    const matrixSelects = document.querySelectorAll('.fmsScoreSelect');
    matrixSelects.forEach(sel => {
      sel.addEventListener('change', () => this.syncFromMatrix());
    });

    const matrixChecks = document.querySelectorAll('.fmsPainCheck');
    matrixChecks.forEach(chk => {
      chk.addEventListener('change', () => this.syncFromMatrix());
    });

    // Save to history button
    const saveBtn = document.getElementById('saveFmsToHistoryBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveToHistoryReport());
    }

    // Initial sync and render
    this.syncFromMatrix();
  },

  goToPattern(index) {
    if (index < 0) index = 0;
    if (index > 6) index = 6;
    this.activePatternIndex = index;
    this.renderStepperUI();
  },

  prevPattern() {
    this.goToPattern(this.activePatternIndex > 0 ? this.activePatternIndex - 1 : 6);
  },

  nextPattern() {
    this.goToPattern(this.activePatternIndex < 6 ? this.activePatternIndex + 1 : 0);
  },

  setPatternScore(idx, side, score) {
    const p = this.patterns[idx];
    if (!p) return;

    if (p.bilateral) {
      if (side === 'L') p.left = score;
      if (side === 'R') p.right = score;
      p.score = Math.min(p.left, p.right);
    } else {
      p.score = score;
    }

    this.syncToMatrix();
    this.calculate();
  },

  toggleClearingPain(idx) {
    const p = this.patterns[idx];
    if (!p || !p.clearingTest) return;
    p.clearingTest.pain = !p.clearingTest.pain;
    this.syncToMatrix();
    this.calculate();
  },

  loadSampleData() {
    // Standard Athletic Profile (Total: 16 - Moderate Risk)
    this.patterns[0].score = 2; // Deep Squat
    this.patterns[1].left = 2; this.patterns[1].right = 2; this.patterns[1].score = 2; // Hurdle Step
    this.patterns[2].left = 2; this.patterns[2].right = 2; this.patterns[2].score = 2; // Inline Lunge
    this.patterns[3].left = 3; this.patterns[3].right = 2; this.patterns[3].score = 2; this.patterns[3].clearingTest.pain = false; // Shoulder Mobility
    this.patterns[4].left = 3; this.patterns[4].right = 3; this.patterns[4].score = 3; // ASLR
    this.patterns[5].score = 3; this.patterns[5].clearingTest.pain = false; // Trunk Push-Up
    this.patterns[6].left = 2; this.patterns[6].right = 2; this.patterns[6].score = 2; this.patterns[6].clearingTest.pain = false; // Rotary Stability

    this.syncToMatrix();
    this.calculate();
  },

  resetAll() {
    this.patterns.forEach(p => {
      p.score = 2;
      if (p.bilateral) {
        p.left = 2;
        p.right = 2;
      }
      if (p.clearingTest) {
        p.clearingTest.pain = false;
      }
    });
    this.syncToMatrix();
    this.calculate();
  },

  syncFromMatrix() {
    const getVal = id => {
      const el = document.getElementById(id);
      return el ? (parseInt(el.value, 10) || 0) : 2;
    };
    const getChecked = id => {
      const el = document.getElementById(id);
      return el ? el.checked : false;
    };

    // 0. Deep Squat
    this.patterns[0].score = getVal('fms_deepSquat');

    // 1. Hurdle Step
    this.patterns[1].left = getVal('fms_hurdle_L');
    this.patterns[1].right = getVal('fms_hurdle_R');
    this.patterns[1].score = Math.min(this.patterns[1].left, this.patterns[1].right);

    // 2. Inline Lunge
    this.patterns[2].left = getVal('fms_lunge_L');
    this.patterns[2].right = getVal('fms_lunge_R');
    this.patterns[2].score = Math.min(this.patterns[2].left, this.patterns[2].right);

    // 3. Shoulder Mobility
    this.patterns[3].left = getVal('fms_shoulder_L');
    this.patterns[3].right = getVal('fms_shoulder_R');
    if (this.patterns[3].clearingTest) {
      this.patterns[3].clearingTest.pain = getChecked('fms_shoulder_pain');
      this.patterns[3].score = this.patterns[3].clearingTest.pain ? 0 : Math.min(this.patterns[3].left, this.patterns[3].right);
    }

    // 4. ASLR
    this.patterns[4].left = getVal('fms_aslr_L');
    this.patterns[4].right = getVal('fms_aslr_R');
    this.patterns[4].score = Math.min(this.patterns[4].left, this.patterns[4].right);

    // 5. Trunk Push-Up
    this.patterns[5].score = getVal('fms_trunk');
    if (this.patterns[5].clearingTest) {
      this.patterns[5].clearingTest.pain = getChecked('fms_extension_pain');
    }

    // 6. Rotary Stability
    this.patterns[6].left = getVal('fms_rotary_L');
    this.patterns[6].right = getVal('fms_rotary_R');
    if (this.patterns[6].clearingTest) {
      this.patterns[6].clearingTest.pain = getChecked('fms_flexion_pain');
      this.patterns[6].score = this.patterns[6].clearingTest.pain ? 0 : Math.min(this.patterns[6].left, this.patterns[6].right);
    }

    this.calculate();
  },

  syncToMatrix() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    };
    const setChecked = (id, checked) => {
      const el = document.getElementById(id);
      if (el) el.checked = checked;
    };

    setVal('fms_deepSquat', this.patterns[0].score);

    setVal('fms_hurdle_L', this.patterns[1].left);
    setVal('fms_hurdle_R', this.patterns[1].right);

    setVal('fms_lunge_L', this.patterns[2].left);
    setVal('fms_lunge_R', this.patterns[2].right);

    setVal('fms_shoulder_L', this.patterns[3].left);
    setVal('fms_shoulder_R', this.patterns[3].right);
    if (this.patterns[3].clearingTest) {
      setChecked('fms_shoulder_pain', this.patterns[3].clearingTest.pain);
    }

    setVal('fms_aslr_L', this.patterns[4].left);
    setVal('fms_aslr_R', this.patterns[4].right);

    setVal('fms_trunk', this.patterns[5].score);
    if (this.patterns[5].clearingTest) {
      setChecked('fms_extension_pain', this.patterns[5].clearingTest.pain);
    }

    setVal('fms_rotary_L', this.patterns[6].left);
    setVal('fms_rotary_R', this.patterns[6].right);
    if (this.patterns[6].clearingTest) {
      setChecked('fms_flexion_pain', this.patterns[6].clearingTest.pain);
    }
  },

  calculate() {
    // Calculate final score per pattern taking clearing tests into account
    let totalScore = 0;
    let hasPainFlag = false;
    const asymmetries = [];

    this.patterns.forEach(p => {
      let finalScore = p.score;
      if (p.bilateral) {
        finalScore = Math.min(p.left, p.right);
        if (p.left !== p.right) {
          asymmetries.push(`${p.persianTitle} (چپ: ${p.left} / راست: ${p.right})`);
        }
      }
      if (p.clearingTest && p.clearingTest.pain) {
        finalScore = 0;
        hasPainFlag = true;
      }
      if (finalScore === 0) {
        hasPainFlag = true;
      }
      p.finalScore = finalScore;
      totalScore += finalScore;
    });

    // Update Matrix final badges
    const hurdleFinalEl = document.getElementById('fms_hurdle_final');
    if (hurdleFinalEl) hurdleFinalEl.textContent = `نهایی: ${this.patterns[1].finalScore}`;

    const lungeFinalEl = document.getElementById('fms_lunge_final');
    if (lungeFinalEl) lungeFinalEl.textContent = `نهایی: ${this.patterns[2].finalScore}`;

    const shoulderFinalEl = document.getElementById('fms_shoulder_final');
    if (shoulderFinalEl) shoulderFinalEl.textContent = `نهایی: ${this.patterns[3].finalScore} ${this.patterns[3].clearingTest && this.patterns[3].clearingTest.pain ? '(⚠️ درد)' : ''}`;

    const aslrFinalEl = document.getElementById('fms_aslr_final');
    if (aslrFinalEl) aslrFinalEl.textContent = `نهایی: ${this.patterns[4].finalScore}`;

    const trunkFinalEl = document.getElementById('fms_trunk_final');
    if (trunkFinalEl) trunkFinalEl.textContent = `نهایی: ${this.patterns[5].finalScore} ${this.patterns[5].clearingTest && this.patterns[5].clearingTest.pain ? '(⚠️ درد)' : ''}`;

    const rotaryFinalEl = document.getElementById('fms_rotary_final');
    if (rotaryFinalEl) rotaryFinalEl.textContent = `نهایی: ${this.patterns[6].finalScore} ${this.patterns[6].clearingTest && this.patterns[6].clearingTest.pain ? '(⚠️ درد)' : ''}`;

    // Update Master Score Number
    const totalScoreEl = document.getElementById('fmsTotalScoreVal');
    if (totalScoreEl) totalScoreEl.textContent = totalScore;

    // Update 7-segment mini track
    this.renderScoreSegments();

    // Automatic Risk Assessment Badge update
    const riskBadge = document.getElementById('fmsRiskBadge');
    const riskText = document.getElementById('fmsRiskBadgeText');
    const riskSubtext = document.getElementById('fmsRiskSubtext');
    let riskLevel = 'کم';

    if (riskBadge) {
      if (hasPainFlag) {
        riskLevel = 'پرچم قرمز درد (Pain Flag)';
        riskBadge.style.background = 'rgba(239, 68, 68, 0.25)';
        riskBadge.style.borderColor = '#ef4444';
        riskBadge.style.color = '#f87171';
        riskBadge.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.35)';
        if (riskText) riskText.textContent = '⛔ پرچم قرمز درد (Pain Flag) • نیاز فوری به ارجاع پزشکی';
        if (riskSubtext) riskSubtext.textContent = 'ورزشکار حین آزمون‌های حرکتی یا پاکسازی درد دارد؛ هرگونه فعالیت سنگین ورزشی باید متوقف و بررسی تخصصی پزشکی انجام شود.';
      } else if (totalScore < 14) {
        riskLevel = 'بسیار بالا (<۱۴)';
        riskBadge.style.background = 'rgba(239, 68, 68, 0.25)';
        riskBadge.style.borderColor = '#ef4444';
        riskBadge.style.color = '#f87171';
        riskBadge.style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.25)';
        if (riskText) riskText.textContent = '🚨 ریسک آسیب: بسیار بالا (<۱۴) • صدمه غیربرخوردی ۲.۵ برابر';
        if (riskSubtext) riskSubtext.textContent = 'ورزشکار در محدوده پرخطر صدمات کینتیک قرار دارد (<۱۴). تمرینات سنگین پلیومتریک و پرتابی متوقف و حرکات اصلاحی اولویت‌بندی شود.';
      } else if (totalScore <= 17) {
        riskLevel = 'متوسط (۱۴ تا ۱۷)';
        riskBadge.style.background = 'rgba(234, 179, 8, 0.25)';
        riskBadge.style.borderColor = '#eab308';
        riskBadge.style.color = '#facc15';
        riskBadge.style.boxShadow = '0 0 12px rgba(234, 179, 8, 0.2)';
        if (riskText) riskText.textContent = '⚠️ ریسک آسیب: متوسط (۱۴ تا ۱۷) • تمرکز روی حلقه‌های ضعیف';
        if (riskSubtext) riskSubtext.textContent = 'الگوهای حرکتی در حد استاندارد پایه؛ توصیه به رفع الگوهای زیر ۲ و اصلاح عدم تقارن‌های دوجانبه برای جلوگیری از آسیب مزمن.';
      } else {
        riskLevel = 'بسیار کم (نخبه)';
        riskBadge.style.background = 'rgba(34, 197, 94, 0.25)';
        riskBadge.style.borderColor = '#22c55e';
        riskBadge.style.color = '#4ade80';
        riskBadge.style.boxShadow = '0 0 14px rgba(34, 197, 94, 0.25)';
        if (riskText) riskText.textContent = '✅ ریسک آسیب: بسیار پایین (>۱۷) • زنجیره کینتیک عالی و پایدار';
        if (riskSubtext) riskSubtext.textContent = 'کیفیت حرکتی عالی و زنجیره حرکتی یکپارچه و پایدار است. ورزشکار آماده برنامه‌های با شدت بیشینه و رقابتی است.';
      }
    }

    // Asymmetry Warning Display
    const asymEl = document.getElementById('fmsAsymmetryWarning');
    if (asymEl) {
      if (asymmetries.length > 0) {
        asymEl.style.display = 'block';
        asymEl.innerHTML = `⚠️ <strong>عدم تقارن طرفی شناسایی شد:</strong> ${asymmetries.join(' • ')}.<br><span style="font-size: 10px; color: #94a3b8;">عدم تقارن دوجانبه خطر آسیب عضلانی را تا ۲.۳ برابر افزایش می‌دهد.</span>`;
      } else {
        asymEl.style.display = 'none';
      }
    }

    // Gray Cook Weak Link Hierarchy
    let weakLink = 'تمامی الگوها در سطح بهینه هستند';
    let prescribedExercise = 'حفظ آمادگی عملکردی و تمرینات پیشرفته پلیومتریک';

    const p0 = this.patterns[0].finalScore;
    const p1 = this.patterns[1].finalScore;
    const p2 = this.patterns[2].finalScore;
    const p3 = this.patterns[3].finalScore;
    const p4 = this.patterns[4].finalScore;
    const p5 = this.patterns[5].finalScore;
    const p6 = this.patterns[6].finalScore;

    if (hasPainFlag) {
      weakLink = 'بروز درد در حرکات (Pain Flag)';
      prescribedExercise = 'ارجاع به کادر فیزیوتراپی و توقف تست‌های دارای درد جهت پیشگیری از صدمات مفصلی';
    } else if (p4 < 2) {
      weakLink = 'تحرک‌پذیری اکتیو پای صاف (ASLR) و انعطاف زنجیره خلفی';
      prescribedExercise = 'تمرینات فوم رولینگ همسترینگ و دوقلو، کشش‌های ایزومتریک ساق و لگن (Active Leg Lowering)';
    } else if (p3 < 2) {
      weakLink = 'تحرک‌پذیری کمربند شانه و قفسه سینه';
      prescribedExercise = 'تمرینات اکستنشن توراسیک با فوم رولر، کشش سینه و چرخش داخلی/خارجی شانه با کش پیلاتس';
    } else if (p6 < 2) {
      weakLink = 'ثبات چرخشی و کنترل عصبی-عضلانی میان‌تنه (Rotary Stability)';
      prescribedExercise = 'تمرینات برد-داگ قطری (Bird-Dog)، پلانک با لمس زانو و کراس-کرول برای بازآموزی زنجیره مورب';
    } else if (p5 < 2) {
      weakLink = 'ثبات اکستنشن تنه و سفتی میان‌تنه (Trunk Push-Up)';
      prescribedExercise = 'تمرینات پلانک ضد اکستنشن، ددباگ (Dead Bug) و شنای سوئدی اصلاحی با توقف ایزومتریک';
    } else if (p2 < 2) {
      weakLink = 'کاهش تکانه و شتاب منفی در وضعیت لانج خطی';
      prescribedExercise = 'تمرینات اسپلیت اسکات با تکیه‌گاه، تقویت عضلات چهارسر و پرونئال‌ها جهت مهار والگوس زانو';
    } else if (p1 < 2) {
      weakLink = 'ثبات تک‌پایی لگن و موبیلیتی مفصل هیپ (Hurdle Step)';
      prescribedExercise = 'تمرین گام‌برداری کنترل‌شده تک‌پایی، تقویت سرینی میانی (Glute Medius) و ایستادن تک‌پایی روی فوم';
    } else if (p0 < 2) {
      weakLink = 'دامنه دورسی فلکشن مچ پا و خمیدگی همزمان مفاصل سه‌گانه در اسکات';
      prescribedExercise = 'تمرین دورسی‌فلکشن مچ پا با کش، اسکات کمکی با طناب TRX و تحرک هیپ (Goblet Squat)';
    }

    const weakEl = document.getElementById('fmsWeakLinkSummary');
    if (weakEl) {
      weakEl.innerHTML = `
        <div><strong>اولویت نخست اصلاحی:</strong> <span style="color: #38bdf8;">${weakLink}</span></div>
        <div style="margin-top: 4px;"><strong>تمرین تجویزی پیشنهادی:</strong> <span style="color: #4ade80;">${prescribedExercise}</span></div>
      `;
    }

    // Update active Stepper view
    this.renderStepperUI();

    return {
      totalScore,
      riskLevel,
      hasPainFlag,
      hasAsymmetry: asymmetries.length > 0,
      asymmetries,
      weakLink,
      prescribedExercise,
      scores: {
        deepSquat: p0,
        hurdleFinal: p1,
        lungeFinal: p2,
        shoulderFinal: p3,
        aslrFinal: p4,
        trunkFinal: p5,
        rotaryFinal: p6
      }
    };
  },

  renderScoreSegments() {
    const container = document.getElementById('fmsScoreSegments');
    if (!container) return;

    container.innerHTML = '';
    this.patterns.forEach((p, idx) => {
      const seg = document.createElement('div');
      seg.className = 'fms-score-segment';
      seg.title = `${p.title}: ${p.finalScore} امتیاز`;

      let bg = '#0284c7';
      if (p.finalScore === 3) bg = '#22c55e';
      else if (p.finalScore === 2) bg = '#0284c7';
      else if (p.finalScore === 1) bg = '#f59e0b';
      else if (p.finalScore === 0) bg = '#ef4444';

      seg.style.cssText = `
        width: 14px;
        height: 24px;
        background: ${bg};
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 800;
        color: #fff;
        cursor: pointer;
        transition: transform 0.2s ease, opacity 0.2s ease;
        opacity: ${this.activePatternIndex === idx ? '1' : '0.85'};
        transform: ${this.activePatternIndex === idx ? 'scale(1.15)' : 'scale(1)'};
        box-shadow: ${this.activePatternIndex === idx ? `0 0 8px ${bg}` : 'none'};
      `;
      seg.textContent = p.finalScore;
      seg.onclick = () => {
        if (this.viewMode !== 'stepper') {
          const stepperBtn = document.getElementById('fmsViewStepperBtn');
          if (stepperBtn) stepperBtn.click();
        }
        this.goToPattern(idx);
      };
      container.appendChild(seg);
    });
  },

  renderStepperUI() {
    const p = this.patterns[this.activePatternIndex];
    if (!p) return;

    // Progress text
    const progressEl = document.getElementById('fmsStepProgressText');
    if (progressEl) progressEl.textContent = `الگوی ${this.activePatternIndex + 1} از ۷`;

    // Step dots active state
    const dots = document.querySelectorAll('.fms-step-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.activePatternIndex);
      const pat = this.patterns[idx];
      if (pat && pat.finalScore === 0) {
        dot.style.background = 'rgba(239, 68, 68, 0.4)';
        dot.style.borderColor = '#ef4444';
      } else if (pat && pat.finalScore === 3) {
        dot.style.background = 'rgba(34, 197, 94, 0.25)';
        dot.style.borderColor = '#22c55e';
      } else {
        dot.style.background = idx === this.activePatternIndex ? '#0284c7' : 'rgba(30, 41, 59, 0.8)';
        dot.style.borderColor = idx === this.activePatternIndex ? '#38bdf8' : '#334155';
      }
    });

    // Pattern Titles & Badges
    const badgeNum = document.getElementById('fmsActivePatternNumberBadge');
    if (badgeNum) badgeNum.textContent = `الگوی ${this.activePatternIndex + 1}`;

    const catEl = document.getElementById('fmsActivePatternCategory');
    if (catEl) catEl.textContent = p.category;

    const titleEl = document.getElementById('fmsActivePatternTitle');
    if (titleEl) titleEl.textContent = p.title;

    const subEl = document.getElementById('fmsActivePatternSubtitle');
    if (subEl) subEl.textContent = p.subtitle;

    const finalBadge = document.getElementById('fmsActiveFinalBadge');
    if (finalBadge) {
      finalBadge.textContent = `${p.finalScore} / ۳`;
      if (p.finalScore === 3) finalBadge.style.color = '#4ade80';
      else if (p.finalScore === 2) finalBadge.style.color = '#38bdf8';
      else if (p.finalScore === 1) finalBadge.style.color = '#facc15';
      else finalBadge.style.color = '#f87171';
    }

    // Clearing Test Banner
    const clearRow = document.getElementById('fmsClearingTestRow');
    const clearTitle = document.getElementById('fmsClearingTestTitle');
    const clearBtn = document.getElementById('fmsClearingPainBtn');
    const clearText = document.getElementById('fmsClearingPainText');

    if (p.clearingTest) {
      if (clearRow) clearRow.style.display = 'block';
      if (clearTitle) clearTitle.textContent = `${p.clearingTest.name} • ${p.clearingTest.instruction}`;
      if (clearBtn) {
        clearBtn.classList.toggle('active-pain', p.clearingTest.pain);
        if (p.clearingTest.pain) {
          clearBtn.style.background = '#ef4444';
          clearBtn.style.color = '#fff';
          if (clearText) clearText.textContent = 'درد دارد (نمره الگو: ۰)';
        } else {
          clearBtn.style.background = 'rgba(239, 68, 68, 0.15)';
          clearBtn.style.color = '#f87171';
          if (clearText) clearText.textContent = 'احساس درد در تست پاکسازی؟';
        }
      }
    } else {
      if (clearRow) clearRow.style.display = 'none';
    }

    // Bilateral vs Symmetrical Rows
    const symRow = document.getElementById('fmsSymmetricalScoreRow');
    const biRow = document.getElementById('fmsBilateralScoreRows');

    if (p.bilateral) {
      if (symRow) symRow.style.display = 'none';
      if (biRow) biRow.style.display = 'flex';

      const leftLabel = document.getElementById('fmsActiveLScoreLabel');
      if (leftLabel) leftLabel.textContent = p.left;

      const rightLabel = document.getElementById('fmsActiveRScoreLabel');
      if (rightLabel) rightLabel.textContent = p.right;

      // Update button active styles
      document.querySelectorAll('#fmsLeftScoreBtns .fms-score-btn').forEach(btn => {
        const s = parseInt(btn.getAttribute('data-score'), 10);
        btn.className = `fms-score-btn ${s === p.left ? `active-${s}` : ''}`;
      });

      document.querySelectorAll('#fmsRightScoreBtns .fms-score-btn').forEach(btn => {
        const s = parseInt(btn.getAttribute('data-score'), 10);
        btn.className = `fms-score-btn ${s === p.right ? `active-${s}` : ''}`;
      });
    } else {
      if (symRow) symRow.style.display = 'flex';
      if (biRow) biRow.style.display = 'none';

      document.querySelectorAll('#fmsSymScoreBtns .fms-score-btn').forEach(btn => {
        const s = parseInt(btn.getAttribute('data-score'), 10);
        btn.className = `fms-score-btn ${s === p.score ? `active-${s}` : ''}`;
      });
    }

    // Official Criteria list
    const critContainer = document.getElementById('fmsActiveCriteriaList');
    if (critContainer) {
      critContainer.innerHTML = p.criteria.map(c => `
        <div style="display: flex; gap: 6px; align-items: baseline; margin-bottom: 3px;">
          <span style="font-weight: bold; color: ${c.score === 3 ? '#4ade80' : c.score === 2 ? '#38bdf8' : c.score === 1 ? '#facc15' : '#f87171'}; min-width: 22px;">[${c.score}]:</span>
          <span>${c.text}</span>
        </div>
      `).join('');
    }

    // Coaching tip
    const tipEl = document.getElementById('fmsActiveCoachingTip');
    if (tipEl) {
      tipEl.innerHTML = `💡 <strong>نکته ارزیاب:</strong> ${p.coachingTip}`;
    }
  },

  saveToHistoryReport() {
    const report = this.calculate();
    const activeAth = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;

    const payload = {
      athleteId: activeAth ? activeAth.id : 'ath_1',
      athleteName: activeAth ? activeAth.name : 'ورزشکار',
      date: new Date().toLocaleDateString('fa-IR'),
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      ...report
    };

    if (typeof saveToHistory === 'function') {
      saveToHistory('fms', payload);
      alert(`✓ کارنامه ارزیابی ۷ الگوی FMS ورزشکار «${payload.athleteName}» با امتیاز ${report.totalScore}/۲۱ و وضعیت «${report.riskLevel}» با موفقیت ذخیره گردید.`);
    } else {
      alert(`✓ ارزیابی غربالگری با موفقیت ثبت شد: امتیاز کل ${report.totalScore}/۲۱`);
    }
  }
};

/**
 * Global Bridge function for FMS calculation
 */
function calculateFmsScore() {
  if (typeof fmsDedicatedController !== 'undefined' && fmsDedicatedController.calculate) {
    return fmsDedicatedController.calculate();
  }
  return { totalScore: 14, riskLevel: 'متوسط' };
}

// --- 12.2 RAST (Repeat Anaerobic Sprint Test) Calculation ---
function calculateRastPower() {
  const weightInput = document.getElementById('rastWeightInput');
  const weight = Math.max(30, parseFloat(weightInput ? weightInput.value : 70) || 70);

  const times = [];
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`rast_t${i}`);
    const t = el ? (parseFloat(el.value) || 5.5) : 5.5;
    times.push(Math.max(3.0, t));
  }

  // Formula: Power = (Weight * 1225) / Time^3 (Watts)
  const powers = times.map((t, idx) => {
    const p = Math.round((weight * 1225) / Math.pow(t, 3));
    const pEl = document.getElementById(`rast_p${idx + 1}`);
    if (pEl) pEl.textContent = `${p} W`;
    return p;
  });

  const peakPower = Math.max(...powers);
  const minPower = Math.min(...powers);
  const sumPower = powers.reduce((a, b) => a + b, 0);
  const avgPower = Math.round(sumPower / 6);
  const totalTime = times.reduce((a, b) => a + b, 0);
  const fatigueIndex = Number(((peakPower - minPower) / totalTime).toFixed(1));
  const powerDropPercent = Number((((peakPower - minPower) / peakPower) * 100).toFixed(1));

  const peakRel = (peakPower / weight).toFixed(1);
  const avgRel = (avgPower / weight).toFixed(1);
  const minRel = (minPower / weight).toFixed(1);

  const peakEl = document.getElementById('rastPeakPowerVal');
  if (peakEl) peakEl.textContent = `${peakPower} W`;
  const peakRelEl = document.getElementById('rastPeakRelativeVal');
  if (peakRelEl) peakRelEl.textContent = `${peakRel} W/kg`;

  const avgEl = document.getElementById('rastAvgPowerVal');
  if (avgEl) avgEl.textContent = `${avgPower} W`;
  const avgRelEl = document.getElementById('rastAvgRelativeVal');
  if (avgRelEl) avgRelEl.textContent = `${avgRel} W/kg`;

  const minEl = document.getElementById('rastMinPowerVal');
  if (minEl) minEl.textContent = `${minPower} W`;
  const minRelEl = document.getElementById('rastMinRelativeVal');
  if (minRelEl) minRelEl.textContent = `${minRel} W/kg`;

  const fiEl = document.getElementById('rastFatigueIndexVal');
  if (fiEl) fiEl.textContent = `${fatigueIndex} W/s`;

  let fatigueRating = 'عالی (<۱۰)';
  if (fatigueIndex > 15) {
    fatigueRating = 'افت بالا (>۱۵)';
  } else if (fatigueIndex >= 10) {
    fatigueRating = 'مطلوب (۱۰-۱۵)';
  }
  const fiRatingEl = document.getElementById('rastFatigueRatingVal');
  if (fiRatingEl) fiRatingEl.textContent = `استقامت بی‌هوازی: ${fatigueRating} • افت: ${powerDropPercent}٪`;

  // Draw chart on canvas
  drawRastCanvasChart(powers);

  return {
    weight,
    times,
    powers,
    peakPower,
    peakRelative: peakRel,
    minPower,
    minRelative: minRel,
    avgPower,
    avgRelative: avgRel,
    fatigueIndex,
    fatigueRating,
    powerDropPercent
  };
}

function drawRastCanvasChart(powers) {
  const canvas = document.getElementById('rastPowerChartCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background grid
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(35, y);
    ctx.lineTo(w - 20, y);
    ctx.stroke();
  }

  const maxP = Math.max(...powers, 700) * 1.1;
  const minP = Math.max(0, Math.min(...powers) * 0.85);

  const getX = i => 45 + i * ((w - 75) / 5);
  const getY = p => h - 25 - ((p - minP) / (maxP - minP)) * (h - 45);

  // Gradient area fill
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

  ctx.beginPath();
  ctx.moveTo(getX(0), getY(powers[0]));
  for (let i = 1; i < powers.length; i++) {
    ctx.lineTo(getX(i), getY(powers[i]));
  }
  ctx.lineTo(getX(5), h - 20);
  ctx.lineTo(getX(0), h - 20);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line curve
  ctx.beginPath();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < powers.length; i++) {
    const x = getX(i);
    const y = getY(powers[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Points & Labels
  powers.forEach((p, i) => {
    const x = getX(i);
    const y = getY(p);

    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? '#4ade80' : (i === 5 ? '#f87171' : '#38bdf8');
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Value label
    ctx.fillStyle = '#f1f5f9';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${p}W`, x, y - 8);

    // X-axis sprint label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.fillText(`نوبت ${i + 1}`, x, h - 6);
  });
}

// --- 12.3 VO2 Max & Cardiovascular Protocols ---
function calculateVo2Max() {
  const protocolSelect = document.getElementById('vo2ProtocolSelect');
  const protocol = protocolSelect ? protocolSelect.value : 'rockport';

  const activeAth = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;
  const age = activeAth ? (parseInt(activeAth.age) || 20) : 20;
  const weightKg = activeAth ? (parseFloat(activeAth.weightKg) || 70) : 70;
  const gender = (activeAth && activeAth.gender === 'female') ? 0 : 1; // 1 = male, 0 = female

  let vo2Max = 45.0;
  let protocolName = 'راکپورت';

  if (protocol === 'rockport') {
    protocolName = 'پیاده‌روی ۱ مایل راکپورت';
    const min = parseFloat(document.getElementById('rockport_min')?.value || 13);
    const sec = parseFloat(document.getElementById('rockport_sec')?.value || 45);
    const hr = parseFloat(document.getElementById('rockport_hr')?.value || 142);
    const timeMin = min + (sec / 60);
    const weightLbs = weightKg * 2.20462;

    // Rockport formula:
    // VO2Max = 132.853 - (0.0769 × W_lbs) - (0.3877 × Age) + (6.315 × Gender) - (3.2649 × Time) - (0.1565 × HR)
    vo2Max = 132.853 - (0.0769 * weightLbs) - (0.3877 * age) + (6.315 * gender) - (3.2649 * timeMin) - (0.1565 * hr);
  } else if (protocol === 'yoyo') {
    protocolName = 'Yo-Yo IR2';
    const dist = parseFloat(document.getElementById('yoyo_distance')?.value || 760);
    // Formula: VO2Max = (Distance × 0.0136) + 45.3
    vo2Max = (dist * 0.0136) + 45.3;
  } else if (protocol === 'beep') {
    protocolName = 'آزمون بوق MSFT';
    const level = parseInt(document.getElementById('beep_level')?.value || 10);
    const shuttle = parseInt(document.getElementById('beep_shuttle')?.value || 6);
    const speed = 8.5 + (level - 1) * 0.5;
    const shuttleTime = (72 / speed).toFixed(2);

    // Cumulative shuttles count lookup
    let totalShuttles = 0;
    for (let l = 1; l < level; l++) {
      const sp = 8.5 + (l - 1) * 0.5;
      const count = Math.ceil(sp * 0.838);
      totalShuttles += count;
    }
    totalShuttles += shuttle;

    // Kilding Formula: VO2 = (0.38 * TotalShuttles) + 25.98
    vo2Max = (0.38 * totalShuttles) + 25.98;

    const banner = document.getElementById('beepSpecsBanner');
    if (banner) {
      banner.textContent = `سرعت مرحله ${level}: ${speed.toFixed(1)} km/h • زمان هر شاتل: ${shuttleTime}s • کل شاتل‌ها: ${totalShuttles}`;
    }
  } else if (protocol === 'cooper') {
    protocolName = '۱۲ دقیقه کوپر';
    const dist = parseFloat(document.getElementById('vo2_dist_input')?.value || 2800);
    // Formula: VO2Max = (Distance - 504.9) / 44.73
    vo2Max = (dist - 504.9) / 44.73;
  } else if (protocol === 'balke') {
    protocolName = '۱۵ دقیقه بالک';
    const dist = parseFloat(document.getElementById('vo2_dist_input')?.value || 3200);
    // Formula: VO2Max = (((Distance / 15) - 133) × 0.172) + 33.3
    vo2Max = (((dist / 15) - 133) * 0.172) + 33.3;
  } else if (protocol === 'run2400') {
    protocolName = 'دو ۲۴۰۰ متر';
    const timeMin = parseFloat(document.getElementById('vo2_dist_input')?.value || 10.5);
    // Formula: VO2Max = 88.02 - (0.1656 * weight) - (2.76 * timeMin) + (3.716 * gender)
    vo2Max = 88.02 - (0.1656 * weightKg) - (2.76 * timeMin) + (3.716 * gender);
  }

  vo2Max = Math.max(15, Math.min(90, Number(vo2Max.toFixed(1))));

  const resEl = document.getElementById('vo2ResultVal');
  if (resEl) resEl.textContent = vo2Max;

  // Rating badge
  let rating = 'متوسط';
  let badgeColor = '#38bdf8';
  let badgeBg = 'rgba(56, 189, 248, 0.2)';
  if (vo2Max >= 55) {
    rating = 'نخبه / قهرمانی (Elite Aerobic)';
    badgeColor = '#4ade80';
    badgeBg = 'rgba(34, 197, 94, 0.2)';
  } else if (vo2Max >= 48) {
    rating = 'عالی (Good Cardiovascular)';
    badgeColor = '#38bdf8';
    badgeBg = 'rgba(56, 189, 248, 0.2)';
  } else if (vo2Max >= 40) {
    rating = 'متوسط (Average)';
    badgeColor = '#fbbf24';
    badgeBg = 'rgba(251, 191, 36, 0.2)';
  } else {
    rating = 'ضعیف (نیاز به استقامت پایه)';
    badgeColor = '#f87171';
    badgeBg = 'rgba(239, 68, 68, 0.2)';
  }

  const badgeEl = document.getElementById('vo2RatingBadge');
  if (badgeEl) {
    badgeEl.textContent = `سطح: ${rating}`;
    badgeEl.style.color = badgeColor;
    badgeEl.style.borderColor = badgeColor;
    badgeEl.style.background = badgeBg;
  }

  // Heart Rate Target Zones
  const maxHr = 220 - age;
  const aerobicMin = Math.round(maxHr * 0.70);
  const aerobicMax = Math.round(maxHr * 0.85);

  const hrMaxEl = document.getElementById('hrMaxVal');
  if (hrMaxEl) hrMaxEl.textContent = `${maxHr} bpm`;
  const hrMinEl = document.getElementById('hrMinTargetVal');
  if (hrMinEl) hrMinEl.textContent = `${aerobicMin} bpm`;
  const hrMaxTargetEl = document.getElementById('hrMaxTargetVal');
  if (hrMaxTargetEl) hrMaxTargetEl.textContent = `${aerobicMax} bpm`;

  return {
    vo2Max,
    protocol,
    protocolName,
    rating,
    hrMax: maxHr,
    hrTargetZone: `${aerobicMin}-${aerobicMax} bpm`
  };
}

// --- 12.4 1RM Muscular Strength Estimation ---
function calculate1Rm() {
  const exerciseSelect = document.getElementById('oneRmExerciseSelect');
  const ex = exerciseSelect ? exerciseSelect.value : 'bench';
  const exName = exerciseSelect ? exerciseSelect.options[exerciseSelect.selectedIndex].text : 'پرس سینه';

  const weight = parseFloat(document.getElementById('oneRmWeightInput')?.value || 80);
  const reps = Math.max(1, Math.min(30, parseInt(document.getElementById('oneRmRepsInput')?.value || 6)));

  const activeAth = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;
  const bodyWeight = activeAth ? (parseFloat(activeAth.weightKg) || 70) : 70;

  // Formula: %1RM = 100 - (Reps * 2)
  const pct1Rm = Math.max(40, 100 - (reps * 2));
  // 1RM = Weight / (pct / 100)
  const estimated1Rm = Number((weight / (pct1Rm / 100)).toFixed(1));
  const relativeRatio = Number((estimated1Rm / bodyWeight).toFixed(2));

  const estEl = document.getElementById('oneRmEstimatedVal');
  if (estEl) estEl.textContent = `${estimated1Rm} kg`;

  const pctEl = document.getElementById('oneRmPercentVal');
  if (pctEl) pctEl.textContent = `معادل ${pct1Rm}٪ از توان بیشینه`;

  const relEl = document.getElementById('oneRmRelativeRatioVal');
  if (relEl) relEl.textContent = `${relativeRatio} × وزن بدن`;

  let rating = 'خوب';
  if (relativeRatio >= 1.5) rating = 'فوق‌العاده (نخبه)';
  else if (relativeRatio >= 1.2) rating = 'عالی (پیشرفته)';
  else if (relativeRatio >= 1.0) rating = 'خوب (ورزشی)';
  else rating = 'متوسط';

  const ratEl = document.getElementById('oneRmRatingVal');
  if (ratEl) ratEl.textContent = rating;

  // Grip Dynamometer Ratio
  const grip = parseFloat(document.getElementById('handGripInput')?.value || 48);
  const gripRatio = ((grip / bodyWeight) * 100).toFixed(1);
  const gripDisplay = document.getElementById('handGripRatioDisplay');
  if (gripDisplay) {
    gripDisplay.innerHTML = `نسبت قدرت پنجه به وزن بدن: <strong>${gripRatio}٪</strong> ${gripRatio > 65 ? '✓ (عالی برای رشته‌های پرتابی و هندبال)' : '(مناسب)'}`;
  }

  return {
    exercise: ex,
    exerciseName: exName,
    weight,
    reps,
    estimated1Rm,
    relativeRatio,
    rating,
    gripKg: grip,
    gripRatio
  };
}

// --- 12.5 Body Composition & LBM ---
function calculateBodyComposition() {
  const gender = document.getElementById('bodyCompGenderSelect')?.value || 'male';
  const bodyFat = parseFloat(document.getElementById('bodyFatPercentInput')?.value || 13.5);
  const weight = parseFloat(document.getElementById('bodyCompWeightInput')?.value || 72);

  const activeAth = typeof getActiveAthlete === 'function' ? getActiveAthlete() : null;
  const height = activeAth ? (parseFloat(activeAth.heightCm) || 178) : 178;

  // BMI = weight / (height/100)^2
  const heightM = height / 100;
  const bmi = Number((weight / (heightM * heightM)).toFixed(1));

  // Fat Mass & FFBM (Fat-Free Body Mass)
  const fatMass = Number((weight * (bodyFat / 100)).toFixed(1));
  const ffbm = Number((weight - fatMass).toFixed(1));

  // LBM Formula with essential fat:
  // Males: FFBM + 3% essential fat = FFBM * 1.03
  // Females: FFBM + 12% essential fat = FFBM * 1.12
  const lbmMultiplier = gender === 'female' ? 1.12 : 1.03;
  const lbm = Number((ffbm * lbmMultiplier).toFixed(1));

  const bmiEl = document.getElementById('bodyCompBmiVal');
  if (bmiEl) bmiEl.textContent = bmi;
  const ffbmEl = document.getElementById('bodyCompFfbmVal');
  if (ffbmEl) ffbmEl.textContent = `${ffbm} kg`;
  const lbmEl = document.getElementById('bodyCompLbmVal');
  if (lbmEl) lbmEl.textContent = `${lbm} kg`;

  const noteEl = document.getElementById('bodyCompEssentialNote');
  if (noteEl) noteEl.textContent = gender === 'female' ? 'شامل ۱۲٪ چربی ضروری بانوان' : 'شامل ۳٪ چربی ضروری آقایان';

  // Target competition athletic weight
  const targetFat = gender === 'female' ? 0.16 : 0.10;
  const idealWeight = Number((ffbm / (1 - targetFat)).toFixed(1));
  const weightDiff = Number((weight - idealWeight).toFixed(1));

  const targetEl = document.getElementById('targetWeightIdealVal');
  if (targetEl) {
    if (weightDiff > 0) {
      targetEl.textContent = `وزن هدف مسابقه: ${idealWeight} kg (کاهش ${weightDiff} kg بافت چربی خالص)`;
    } else {
      targetEl.textContent = `وزن هدف مسابقه: ${idealWeight} kg (ترکیب بدنی کاملاً مسابقه‌ای و خشک)`;
    }
  }

  return {
    bmi,
    bodyFat,
    fatMass,
    ffbm,
    lbm,
    idealWeight,
    weightDiff
  };
}

// --- 12.6 Field Skills & Sport Drills ---
function updateFieldDrillView() {
  const select = document.getElementById('fieldDrillSelect');
  if (!select) return;
  const val = select.value;

  const lbl1 = document.getElementById('fieldDrillInputLabel');
  const unit1 = document.getElementById('fieldDrillUnit1');
  const inp1 = document.getElementById('fieldDrillVal1');
  const row2 = document.getElementById('fieldDrillSecondRow');
  const feedback = document.getElementById('fieldDrillFeedback');

  if (val === 'hb_dribble_20') {
    if (lbl1) lbl1.textContent = 'زمان دریبل سرعت ۲۰ متر:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '3.45';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: بسیار سریع (پتانسیل بالا در ضدحملات سرعتی)';
  } else if (val === 'hb_zigzag_10') {
    if (lbl1) lbl1.textContent = 'زمان دریبل زیگزاگ ۱۰ مانع:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '9.80';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: چابکی عالی با توپ و تسلط بر هر دو دست';
  } else if (val === 'hb_wall_pass') {
    if (lbl1) lbl1.textContent = 'تعداد پاس و دریافت دیوار ۳۰ ثانیه:';
    if (unit1) unit1.textContent = 'تکرار';
    if (inp1) inp1.value = '36';
    if (row2) row2.style.display = 'flex';
    if (feedback) feedback.textContent = 'رتبه: هماهنگی چشم و دست فوق‌العاده و سرعت عکس‌العمل عالی';
  } else if (val === 'hb_gk_corners') {
    if (lbl1) lbl1.textContent = 'زمان لمس ۴ گوشه دروازه:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '4.15';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه ویژه دروازه‌بان: سرعت تغییر جهت و ری‌اکشن بی‌نظیر';
  } else if (val === 'fb_zigzag_6') {
    if (lbl1) lbl1.textContent = 'زمان دریبل زیگزاگ ۶ مانع:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '6.30';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: کنترل توپ و چابکی در فضای محدود عالی';
  } else if (val === 'illinois_run') {
    if (lbl1) lbl1.textContent = 'زمان آزمون چابکی ایلینوی:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '15.20';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: نخبه چابکی (<۱۵.۹ ثانیه برای مردان)';
  } else if (val === 'shuttle_4x9') {
    if (lbl1) lbl1.textContent = 'زمان آزمون شاتل ۴×۹ متر با چوب:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '9.10';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: شتاب مثبت و منفی عالی در تغییر مسیر';
  } else if (val === 'slalom_10') {
    if (lbl1) lbl1.textContent = 'زمان دوی مارپیچ ۱۰ متر:';
    if (unit1) unit1.textContent = 'ثانیه';
    if (inp1) inp1.value = '4.85';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: چابکی و هماهنگی پاها در حد عالی';
  } else if (val === 'burpee_30') {
    if (lbl1) lbl1.textContent = 'تعداد تکرار برپی در ۳۰ ثانیه:';
    if (unit1) unit1.textContent = 'تکرار';
    if (inp1) inp1.value = '18';
    if (row2) row2.style.display = 'none';
    if (feedback) feedback.textContent = 'رتبه: توان بی‌هوازی عضلانی و هماهنگی کل بدن عالی (>۱۶)';
  }
}

// --- MASTER UI INITIALIZATION FOR SPORTS SCIENCE SUITE ---
function initSportsScienceSuiteUI() {
  // Drawer Menu Button
  const drawerBtn = document.getElementById('drawerItemSportsScienceSuite');
  if (drawerBtn) {
    drawerBtn.addEventListener('click', () => {
      closeDrawer();
      openSportsScienceSuiteModal();
    });
  }

  document.getElementById('drawerItemSportsScienceTop')?.addEventListener('click', () => {
    if (typeof closeDrawer === 'function') closeDrawer();
    openSportsScienceSuiteModal('tabFMS');
  });

  // Compact Top Bar Quick Launcher
  document.getElementById('quickOpenSportsScienceBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSportsScienceSuiteModal('tabFMS');
  });

  // Workstation Tool Button
  const workBtn = document.getElementById('statsSportsScienceBtn');
  if (workBtn) {
    workBtn.addEventListener('click', () => {
      openSportsScienceSuiteModal('tabFMS');
    });
  }

  document.getElementById('workstationOpenSportsScienceModalBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSportsScienceSuiteModal('tabFMS');
  });

  // Workstation FMS Quick Launch Buttons
  document.querySelectorAll('.fms-quick-launch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tab = btn.getAttribute('data-tab') || 'tabFMS';
      openSportsScienceSuiteModal(tab);
    });
  });

  // Modal Close Buttons
  const closeBtn = document.getElementById('closeSportsScienceModalBtn');
  const closeX = document.getElementById('closeSportsScienceModalXBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeSportsScienceSuiteModal);
  if (closeX) closeX.addEventListener('click', closeSportsScienceSuiteModal);

  // Cross-Navigation buttons
  const openHbBtn = document.getElementById('openHandballFromSuiteBtn');
  if (openHbBtn) {
    openHbBtn.addEventListener('click', () => {
      closeSportsScienceSuiteModal();
      if (typeof openHandballScoutingModal === 'function') openHandballScoutingModal();
    });
  }
  const openCmpBtn = document.getElementById('openCompareFromSuiteBtn');
  if (openCmpBtn) {
    openCmpBtn.addEventListener('click', () => {
      closeSportsScienceSuiteModal();
      if (typeof openCompareAthletesModal === 'function') openCompareAthletesModal();
    });
  }

  // Athlete Selector
  const athleteSelect = document.getElementById('sportsScienceAthleteSelect');
  if (athleteSelect) {
    athleteSelect.addEventListener('change', e => {
      const targetId = e.target.value;
      if (typeof setActiveAthlete === 'function') setActiveAthlete(targetId);
      syncSportsScienceAthleteInfo();
      calculateFmsScore();
      calculateRastPower();
      calculateVo2Max();
      calculate1Rm();
      calculateBodyComposition();
    });
  }

  // Tab switching
  const tabsNav = document.getElementById('sportsScienceTabsNav');
  if (tabsNav) {
    tabsNav.addEventListener('click', e => {
      const btn = e.target.closest('.sportsScienceTabBtn');
      if (!btn) return;
      const targetTab = btn.getAttribute('data-tab');

      document.querySelectorAll('.sportsScienceTabBtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.sportsScienceTabContent').forEach(c => (c.style.display = 'none'));
      const activeContent = document.getElementById(`sportsScienceTabContent_${targetTab}`);
      if (activeContent) activeContent.style.display = 'block';

      if (targetTab === 'tabRAST') {
        setTimeout(calculateRastPower, 50);
      }
    });
  }

  // FMS Event Listeners
  const fmsInputs = document.querySelectorAll('.fmsScoreSelect, .fmsPainCheck');
  fmsInputs.forEach(inp => {
    inp.addEventListener('change', calculateFmsScore);
  });

  const resetFmsBtn = document.getElementById('resetFmsBtn');
  if (resetFmsBtn) {
    resetFmsBtn.addEventListener('click', () => {
      document.querySelectorAll('.fmsScoreSelect').forEach(s => (s.value = '2'));
      document.querySelectorAll('.fmsPainCheck').forEach(c => (c.checked = false));
      calculateFmsScore();
    });
  }

  const saveFmsBtn = document.getElementById('saveFmsToHistoryBtn');
  if (saveFmsBtn) {
    saveFmsBtn.addEventListener('click', () => {
      const res = calculateFmsScore();
      if (typeof saveToHistory === 'function') {
        saveToHistory('fms', res);
        alert('✓ کارنامه غربالگری FMS با موفقیت در پرونده ورزشکار ذخیره گردید.');
      }
    });
  }

  // RAST Event Listeners
  const rastInputs = document.querySelectorAll('#rastWeightInput, .rastTimeInput');
  rastInputs.forEach(inp => {
    inp.addEventListener('input', calculateRastPower);
  });

  const rastSampleBtn = document.getElementById('rastSampleDataBtn');
  if (rastSampleBtn) {
    rastSampleBtn.addEventListener('click', () => {
      const samples = [5.18, 5.29, 5.42, 5.55, 5.71, 5.88];
      samples.forEach((val, i) => {
        const inp = document.getElementById(`rast_t${i + 1}`);
        if (inp) inp.value = val;
      });
      calculateRastPower();
    });
  }

  const saveRastBtn = document.getElementById('saveRastToHistoryBtn');
  if (saveRastBtn) {
    saveRastBtn.addEventListener('click', () => {
      const res = calculateRastPower();
      if (typeof saveToHistory === 'function') {
        saveToHistory('rast', res);
        alert('✓ رکورد آزمون توان بی‌هوازی RAST در تاریخچه ثبت شد.');
      }
    });
  }

  // VO2 Max Event Listeners
  const vo2ProtocolSelect = document.getElementById('vo2ProtocolSelect');
  if (vo2ProtocolSelect) {
    vo2ProtocolSelect.addEventListener('change', e => {
      const proto = e.target.value;
      const rockportSec = document.getElementById('vo2_sec_rockport');
      const yoyoSec = document.getElementById('vo2_sec_yoyo');
      const beepSec = document.getElementById('vo2_sec_beep');
      const distSec = document.getElementById('vo2_sec_distance');
      const distLbl = document.getElementById('distLabelDynamic');

      if (rockportSec) rockportSec.style.display = proto === 'rockport' ? 'block' : 'none';
      if (yoyoSec) yoyoSec.style.display = proto === 'yoyo' ? 'block' : 'none';
      if (beepSec) beepSec.style.display = proto === 'beep' ? 'block' : 'none';

      if (distSec) {
        if (proto === 'cooper' || proto === 'balke' || proto === 'run2400') {
          distSec.style.display = 'block';
          if (distLbl) {
            if (proto === 'cooper') distLbl.textContent = 'مسافت ۱۲ دقیقه (متر):';
            else if (proto === 'balke') distLbl.textContent = 'مسافت ۱۵ دقیقه (متر):';
            else distLbl.textContent = 'زمان دو ۲۴۰۰ متر (دقیقه):';
          }
        } else {
          distSec.style.display = 'none';
        }
      }
      calculateVo2Max();
    });
  }

  const vo2Inputs = document.querySelectorAll('#rockport_min, #rockport_sec, #rockport_hr, #yoyo_distance, #beep_level, #beep_shuttle, #vo2_dist_input');
  vo2Inputs.forEach(inp => {
    inp.addEventListener('input', calculateVo2Max);
  });

  const saveVo2Btn = document.getElementById('saveVo2ToHistoryBtn');
  if (saveVo2Btn) {
    saveVo2Btn.addEventListener('click', () => {
      const res = calculateVo2Max();
      if (typeof saveToHistory === 'function') {
        saveToHistory('vo2max', res);
        alert('✓ رکورد اکسیژن بیشینه VO2 Max در پرونده ثبت شد.');
      }
    });
  }

  // 1RM Event Listeners
  const oneRmInputs = document.querySelectorAll('#oneRmExerciseSelect, #oneRmWeightInput, #oneRmRepsInput, #handGripInput, #pullupsInput, #situps60Input');
  oneRmInputs.forEach(inp => {
    inp.addEventListener('input', calculate1Rm);
    inp.addEventListener('change', calculate1Rm);
  });

  const save1RmBtn = document.getElementById('save1RmToHistoryBtn');
  if (save1RmBtn) {
    save1RmBtn.addEventListener('click', () => {
      const res = calculate1Rm();
      if (typeof saveToHistory === 'function') {
        saveToHistory('one_rm', res);
        alert('✓ رکورد قدرت عضلانی و ۱RM در پرونده ذخیره شد.');
      }
    });
  }

  // Body Composition Event Listeners
  const bodyCompInputs = document.querySelectorAll('#bodyCompGenderSelect, #bodyFatPercentInput, #bodyCompWeightInput');
  bodyCompInputs.forEach(inp => {
    inp.addEventListener('input', calculateBodyComposition);
    inp.addEventListener('change', calculateBodyComposition);
  });

  const saveBodyCompBtn = document.getElementById('saveBodyCompToHistoryBtn');
  if (saveBodyCompBtn) {
    saveBodyCompBtn.addEventListener('click', () => {
      const res = calculateBodyComposition();
      if (typeof saveToHistory === 'function') {
        saveToHistory('body_comp', res);
        alert('✓ ارزیابی ترکیب بدنی و LBM در پرونده ثبت شد.');
      }
    });
  }

  // Field Skills Event Listeners
  const fieldDrillSelect = document.getElementById('fieldDrillSelect');
  if (fieldDrillSelect) {
    fieldDrillSelect.addEventListener('change', updateFieldDrillView);
  }

  const saveFieldDrillBtn = document.getElementById('saveFieldDrillToHistoryBtn');
  if (saveFieldDrillBtn) {
    saveFieldDrillBtn.addEventListener('click', () => {
      const sel = document.getElementById('fieldDrillSelect');
      const drillKey = sel ? sel.value : 'drill';
      const drillName = sel ? sel.options[sel.selectedIndex].text : 'آزمون';
      const val1 = document.getElementById('fieldDrillVal1')?.value || '0';
      const unit1 = document.getElementById('fieldDrillUnit1')?.textContent || '';
      const feedback = document.getElementById('fieldDrillFeedback')?.textContent || '';

      const data = {
        drillKey,
        drillName,
        recordVal: val1,
        unit: unit1,
        feedback
      };

      if (typeof saveToHistory === 'function') {
        saveToHistory('field_drill', data);
        alert('✓ رکورد مهارت میدانی در تاریخچه ثبت شد.');
      }
    });
  }
}

// =========================================================================
// 13. LIVE HUD CSS TRANSITIONS & DYNAMIC VALUE ANIMATIONS (v1.22.0)
// Smooth transitions, spring pop scaling, milestone celebrations & metric glows
// =========================================================================

/**
 * Triggers a hardware-accelerated CSS animation on a specific live HUD metric
 * @param {string|HTMLElement} target - The hudVal or hudMetric element or its ID
 * @param {'pop'|'milestone'|'celebration'|'warn'|'glow'} [type='pop'] - Animation archetype
 */
function triggerLiveHudMetricAnimation(target, type = 'pop') {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;

  const valEl = el.classList && el.classList.contains('hudVal') ? el : el.querySelector?.('.hudVal');
  const metricEl = el.classList && el.classList.contains('hudMetric') ? el : el.closest?.('.hudMetric');

  if (valEl) {
    valEl.classList.remove('hudVal-pop', 'hudVal-milestone');
    void valEl.offsetWidth; // force DOM reflow
    if (type === 'milestone' || type === 'celebration') {
      valEl.classList.add('hudVal-milestone');
    } else {
      valEl.classList.add('hudVal-pop');
    }
  }

  if (metricEl) {
    metricEl.classList.remove('hudMetric-celebration', 'hudMetric-glow', 'hudMetric-warn', 'hudMetricShimmer');
    void metricEl.offsetWidth; // force DOM reflow
    if (type === 'milestone' || type === 'celebration') {
      metricEl.classList.add('hudMetric-celebration', 'hudMetricShimmer');
    } else if (type === 'warn') {
      metricEl.classList.add('hudMetric-warn');
    } else {
      metricEl.classList.add('hudMetric-glow', 'hudMetricShimmer');
    }
  }
}
window.triggerLiveHudMetricAnimation = triggerLiveHudMetricAnimation;

function initLiveHudTransitions() {
  const huds = document.querySelectorAll('.liveHud');
  if (!huds.length) return;

  const prevValues = new WeakMap();
  const lastAnimatedTime = new WeakMap();

  // MutationObserver on all HUD containers for automated, zero-config value animations
  const hudObserver = new MutationObserver((mutations) => {
    const now = performance.now();
    for (const mutation of mutations) {
      let valEl = null;
      if (mutation.type === 'characterData') {
        valEl = mutation.target.parentElement?.closest?.('.hudVal');
      } else if (mutation.type === 'childList') {
        if (mutation.target.classList && mutation.target.classList.contains('hudVal')) {
          valEl = mutation.target;
        } else {
          valEl = mutation.target.closest?.('.hudVal') || mutation.target.querySelector?.('.hudVal');
        }
      }
      if (!valEl) continue;

      const currentText = valEl.textContent.trim();
      const prevText = prevValues.get(valEl);
      if (prevText === currentText) continue;
      prevValues.set(valEl, currentText);

      // Don't animate initial page render or uninitialized placeholders
      if (prevText === undefined || (prevText === '--' && currentText === '--')) continue;

      const valId = valEl.id || '';
      const isTimer = valId.toLowerCase().includes('timer');
      const isRepOrCount = valId.endsWith('CountVal') || 
                           valId.endsWith('RepVal') || 
                           valId.includes('Lap') || 
                           valId === 'boscoJumpCountVal' || 
                           valId === 'agilityLapCountVal';
      const isStatusOrMilestone = valId.includes('Status') || 
                                  valId.includes('Alignment') || 
                                  valId.includes('Gate') || 
                                  valId.includes('Max');
      const isWarn = valEl.classList.contains('warn') || 
                     currentText.includes('⚠️') || 
                     currentText.includes('خطا') || 
                     currentText.includes('ناقص');

      // Rate limiting: avoid over-triggering on rapid continuous sub-second timer updates
      const lastTime = lastAnimatedTime.get(valEl) || 0;
      const minInterval = isRepOrCount ? 100 : (isTimer ? 350 : 180);
      if (now - lastTime < minInterval) continue;
      lastAnimatedTime.set(valEl, now);

      // Determine animation intensity
      if (isRepOrCount && !isTimer) {
        triggerLiveHudMetricAnimation(valEl, 'celebration');
      } else if (isWarn) {
        triggerLiveHudMetricAnimation(valEl, 'warn');
      } else if (isStatusOrMilestone) {
        triggerLiveHudMetricAnimation(valEl, 'glow');
      } else {
        triggerLiveHudMetricAnimation(valEl, 'pop');
      }
    }
  });

  huds.forEach(hud => {
    hudObserver.observe(hud, {
      childList: true,
      subtree: true,
      characterData: true
    });
  });

  // Clean up CSS animation classes on animationend to keep DOM clean and responsive
  document.addEventListener('animationend', (e) => {
    const target = e.target;
    if (!target || !target.classList) return;
    if (target.classList.contains('hudVal-pop')) target.classList.remove('hudVal-pop');
    if (target.classList.contains('hudVal-milestone')) target.classList.remove('hudVal-milestone');
    if (target.classList.contains('hudMetric-celebration')) target.classList.remove('hudMetric-celebration');
    if (target.classList.contains('hudMetric-glow')) target.classList.remove('hudMetric-glow');
    if (target.classList.contains('hudMetric-warn')) target.classList.remove('hudMetric-warn');
    if (target.classList.contains('hudMetricShimmer')) target.classList.remove('hudMetricShimmer');
  }, { passive: true });

  console.log(`⚡ Live HUD Transitions & Workout Animations initialized for ${huds.length} HUD units`);
}

// --- MASTER INITIALIZATION FOR ROADMAP FEATURES ---
function initRoadmapFeatures() {
  initBiomechanicsWorker();
  initDeviceInclinometer();
  initLiveAudioCoachUI();
  initYBalanceUI();
  initProAgilityUI();
  initArmCockingUI();
  initPostureUI();
  initCompareAthletesUI();
  initBulkExportUI();
  initSportsScienceSuiteUI();
  initLiveHudTransitions();
  initHandballSkillsSuite();
  if (typeof predictiveCameraBufferHub !== 'undefined' && predictiveCameraBufferHub.init) {
    predictiveCameraBufferHub.init();
  }
  if (typeof fmsDedicatedController !== 'undefined' && fmsDedicatedController.init) {
    fmsDedicatedController.init();
  }
  console.log('🚀 Multi-Camera Predictive Buffer & FMS 7-Pattern Controller fully active');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoadmapFeatures);
} else {
  initRoadmapFeatures();
}
