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
      <div style="text-align: center; margin-bottom: 12px;">
        <h3 style="color: #38bdf8; margin-bottom: 4px; font-size: 17px;">
          📷 انتخاب سنسور دوربین (${availableCameras.length} سنسور یافت شد)
        </h3>
        <p style="color: #94a3b8; font-size: 11px; line-height: 1.5; margin: 0;">
          برای حل مشکل زوم زیاد در فضاهای بسته و فیلم‌برداری ورزشی، دوربین <strong>فوق‌عریض (0.5x)</strong> به صورت پیش‌فرض فعال می‌شود.
        </p>
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
}

/**
 * Switch to a different camera with full safety fallback (never black screen)
 */
async function switchCamera(deviceId) {
  const camera = availableCameras.find(c => c.deviceId === deviceId);
  const prevCameraId = currentCameraId;

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

    setStatus(`✅ دوربین فعال شد: ${currentCameraInfo ? currentCameraInfo.persianLabel : 'موفق'}`);
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
    renderAthleteModal();
    if (athleteProfileModal) athleteProfileModal.style.display = 'block';
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
    } else {
      testName = 'فاصله اجسام';
      mainResult = `${d.distanceCm} cm`;
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

function saveCurrentSettingsFromUI() {
  const lowPowerEl = document.getElementById('lowPowerMode');
  const lowPowerChecked = lowPowerEl ? lowPowerEl.checked : false;
  const athleteHeightVal = athleteHeightSetting ? (parseInt(athleteHeightSetting.value) || 175) : 175;
  const jumpSensEl = document.getElementById('jumpSensitivity');
  const landSensEl = document.getElementById('landSensitivity');
  const calibFrEl = document.getElementById('calibFrames');

  const jumpSensVal = jumpSensEl ? parseFloat(jumpSensEl.value) : 0.12;
  const landSensVal = landSensEl ? parseFloat(landSensEl.value) : 0.06;
  const calibFramesVal = calibFrEl ? parseInt(calibFrEl.value) : 20;

  const safeHeight = Math.max(90, Math.min(240, athleteHeightVal));
  const settings = {
    jumpThresholdRatio: isNaN(jumpSensVal) ? 0.12 : jumpSensVal,
    landThresholdRatio: isNaN(landSensVal) ? 0.06 : landSensVal,
    calibFrames: isNaN(calibFramesVal) ? 20 : calibFramesVal,
    lowPowerMode: !!lowPowerChecked,
    athleteHeight: safeHeight
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

// Automatically load and apply settings from localStorage upon script startup
loadSettingsUI();
applySettings();

settingsBtn.addEventListener('click', () => {
  loadSettingsUI();
  settingsPanel.classList.add('visible');
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

  const testSec = boscoConfiguredDuration || 30;
  if (boscoResultTitle) {
    boscoResultTitle.textContent = `🏆 نتایج آزمون پرش متوالی (${testSec} ثانیه)`;
  }
  if (boscoResultPanel) boscoResultPanel.classList.add('visible');

  // Auto save to history
  if (totalJ > 0) {
    saveToHistory('bosco', {
      testDuration: testSec,
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
 * Uses the dot product of normalized 2D vector rays.
 */
function calculateJointAngle(pA, pB, pC) {
  if (!pA || !pB || !pC) return null;
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
  return Math.acos(cosVal) * (180 / Math.PI);
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

  // Biomechanical State Machine:
  // 'down': lying flat on ground (angle > 115°)
  // 'rising': athlete flexing abdominal wall and lifting upper body towards knees
  // 'up': top position reached (angle <= 75°)
  // 'lowering': returning back down to the mat
  if (situpState === 'down') {
    situpStatusMessage = 'موقعیت شروع (پایین)';
    if (angle < 105) {
      situpState = 'rising';
      situpMinAngleThisRep = angle;
      situpStatusMessage = 'در حال بالا آمدن...';
    }
  } else if (situpState === 'rising') {
    if (angle < situpMinAngleThisRep) {
      situpMinAngleThisRep = angle;
    }
    situpStatusMessage = 'در حال بالا آمدن...';
    if (angle <= 75) {
      situpState = 'up';
      situpStatusMessage = 'دامنه کامل (بالا) ✨';
      playChime(784, 'sine', 0.08); // G5 short tone
    } else if (angle > 125) {
      situpState = 'down';
    }
  } else if (situpState === 'up') {
    situpStatusMessage = 'دامنه کامل - بازگشت به پایین';
    if (angle > 90) {
      situpState = 'lowering';
      situpStatusMessage = 'در حال بازگشت به زمین...';
    }
  } else if (situpState === 'lowering') {
    situpStatusMessage = 'در حال بازگشت به زمین...';
    if (angle >= 120) {
      // Rep completed!
      situpState = 'down';
      situpRepCount++;
      situpRepTimestamps.push(now);
      situpRepFlashTime = now;

      playChime(659, 'triangle', 0.24); // E5
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const repStrFa = String(situpRepCount).split('').map(d => faDigits[d] || d).join('');
      speakText(`${repStrFa}`, `${situpRepCount}`);

      situpStatusMessage = `تکرار ${repStrFa} ثبت شد! ✅`;
      setStatus(`تکرار ${repStrFa} دراز و نشست ثبت شد`);
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
  if (pushupType === 'standard' && ankle) {
    plankAngle = calculateJointAngle(shoulder, hip, ankle);
  } else if (knee) {
    plankAngle = calculateJointAngle(shoulder, hip, knee);
  }

  if (plankAngle != null) {
    if (plankAngle < 135) {
      pushupPlankMessage = 'لگن افتاده / باسن بالا';
    } else {
      pushupPlankMessage = 'صاف و استاندارد ✓';
    }
  }

  // Push-up State Machine:
  // 'up': arms straight / extended (elbow > 140°)
  // 'descending': lowering chest towards ground
  // 'down': 90-degree depth reached (elbow <= 92°)
  // 'ascending': pressing back up to straight arms
  if (pushupState === 'up') {
    pushupStatusMessage = 'بالا (آماده خم شدن)';
    if (elbowAngle < 125) {
      pushupState = 'descending';
      pushupMinElbowAngleThisRep = elbowAngle;
      pushupStatusMessage = 'در حال پایین رفتن...';
    }
  } else if (pushupState === 'descending') {
    if (elbowAngle < pushupMinElbowAngleThisRep) {
      pushupMinElbowAngleThisRep = elbowAngle;
    }
    pushupStatusMessage = 'در حال پایین رفتن...';
    if (elbowAngle <= 92) {
      pushupState = 'down';
      pushupStatusMessage = 'عمق استاندارد (۹۰ درجه) ✨';
      playChime(784, 'sine', 0.08); // G5
    } else if (elbowAngle > 145) {
      pushupState = 'up';
    }
  } else if (pushupState === 'down') {
    if (elbowAngle < pushupMinElbowAngleThisRep) {
      pushupMinElbowAngleThisRep = elbowAngle;
    }
    pushupStatusMessage = 'عمق ۹۰° کامل - به بالا فشار دهید';
    if (elbowAngle > 115) {
      pushupState = 'ascending';
      pushupStatusMessage = 'در حال بالا آمدن...';
    }
  } else if (pushupState === 'ascending') {
    pushupStatusMessage = 'در حال بالا آمدن...';
    if (elbowAngle >= 142) {
      // Rep completed!
      pushupState = 'up';
      pushupRepCount++;
      pushupRepTimestamps.push(now);
      pushupDepthHistory.push(Math.round(pushupMinElbowAngleThisRep));
      pushupRepFlashTime = now;

      playChime(659, 'triangle', 0.24); // E5
      const faDigits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      const repStrFa = String(pushupRepCount).split('').map(d => faDigits[d] || d).join('');
      speakText(`${repStrFa}`, `${pushupRepCount}`);

      pushupStatusMessage = `تکرار ${repStrFa} ثبت شد! ✅`;
      setStatus(`تکرار ${repStrFa} شنا سوئدی ثبت شد`);
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

function calculateJointAngle(pA, pCenter, pB) {
  if (!pA || !pCenter || !pB) return 180;
  const v1 = { x: pA.x - pCenter.x, y: pA.y - pCenter.y };
  const v2 = { x: pB.x - pCenter.x, y: pB.y - pCenter.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.hypot(v1.x, v1.y);
  const mag2 = Math.hypot(v2.x, v2.y);
  if (mag1 === 0 || mag2 === 0) return 180;
  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cos) * 180) / Math.PI;
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

function openHandballScoutingModal() {
  const active = getActiveAthlete();
  const athletes = getAthletes();
  const allHistory = getHistory();
  const athleteHistory = allHistory.filter(h => h.athleteId === active.id);

  if (!handballScoutingContent) return;

  const analysis = generateHandballScouting(active, athleteHistory);

  handballScoutingContent.innerHTML = `
    <!-- Overall Compatibility Banner -->
    <div style="background: linear-gradient(135deg, rgba(2,132,199,0.15), rgba(22,163,74,0.15)); border: 1.5px solid #38bdf8; border-radius: 12px; padding: 14px; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
      <div>
        <div style="font-size: 11px; color: #94a3b8; font-weight: bold;">ارزیابی استعدادیابی تخصصی هوشمند:</div>
        <div style="font-size: 18px; font-weight: bold; color: #f8fafc; margin-top: 2px;">
          ${active.name} <span style="font-size: 12px; color: #38bdf8; font-weight: normal;">(کد: ${active.code || '۱۰۱'} • قد: ${active.heightCm}cm)</span>
        </div>
        <div style="font-size: 12px; color: #cbd5e1; margin-top: 4px;">
          تحلیل عملکرد بر اساس داده‌های بیومکانیک پرش، چابکی، سرعت، استقامت و ابعاد بدنی.
        </div>
      </div>
      <div style="text-align: center; background: rgba(15,23,42,0.85); border: 2px solid #22c55e; border-radius: 12px; padding: 8px 18px;">
        <div style="font-size: 10px; color: #4ade80; font-weight: bold;">تطابق کلی با هندبال</div>
        <div style="font-size: 26px; font-weight: 900; color: #4ade80; font-family: monospace;">${analysis.handballOverallScore}٪</div>
      </div>
    </div>

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

    <!-- Multi-Sport Comparison -->
    <div style="background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 10px; padding: 12px; margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: bold; color: #94a3b8; margin-bottom: 8px;">🌐 مقایسه پتانسیل در سایر رشته‌های ورزشی:</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px;">
        ${analysis.otherSports.map(s => `
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 8px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: #f8fafc;">${s.icon} ${s.name}</span>
            <span style="font-size: 12px; font-weight: bold; color: #38bdf8;">${s.pct}٪</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Suggested Microcycle Drills -->
    <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid #38bdf8; border-radius: 10px; padding: 12px;">
      <div style="font-size: 12px; font-weight: bold; color: #38bdf8; margin-bottom: 8px;">📋 برنامه تمرینی ریزدوره (Microcycle) تخصصی هندبال:</div>
      <div style="font-size: 11px; color: #cbd5e1; line-height: 1.6;">
        <div><strong>• جلسه ۱ (پلایومتریک و پرش شوت):</strong> پرش جعبه ۵۰cm + شوت ۳ گام از منطقه بک با حداکثر سرعت رهایی توپ (۴ ست × ۶ تکرار).</div>
        <div><strong>• جلسه ۲ (چابکی دفاعی و شاتل):</strong> دوی شاتل مخروط ۵×۲ متر با تغییر مسیر جانبی دفاع ۶-۰ + استارت ۲۰ متر ضدحمله (۵ دور).</div>
        <div><strong>• جلسه ۳ (کمربند شانه و Core):</strong> تمرینات کش مقاومتی برای روتاتور کاف، شنا سوئدی سرعتی و پلانک جانبی جهت استحکام بالاتنه در نبردهای فیزیکی.</div>
      </div>
    </div>
  `;

  if (handballScoutingModal) handballScoutingModal.classList.add('visible');
}

if (openHandballScoutingFromProfileBtn) {
  openHandballScoutingFromProfileBtn.addEventListener('click', () => {
    if (athleteProfileModal) athleteProfileModal.classList.remove('visible');
    openHandballScoutingModal();
  });
}

if (drawerItemHandball) {
  drawerItemHandball.addEventListener('click', () => {
    closeDrawer();
    openHandballScoutingModal();
  });
}

if (closeHandballModalXBtn) {
  closeHandballModalXBtn.addEventListener('click', () => {
    if (handballScoutingModal) handballScoutingModal.classList.remove('visible');
  });
}

if (closeHandballModalBtn) {
  closeHandballModalBtn.addEventListener('click', () => {
    if (handballScoutingModal) handballScoutingModal.classList.remove('visible');
  });
}

if (handballExportPdfBtn) {
  handballExportPdfBtn.addEventListener('click', () => {
    if (handballScoutingModal) handballScoutingModal.classList.remove('visible');
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
  hideAllPanels();

  // Mode button states (legacy horizontal bar if rendered)
  if (modeRunBtn) modeRunBtn.classList.toggle('active', mode === 'run');
  if (modeJumpBtn) modeJumpBtn.classList.toggle('active', mode === 'jump');
  if (modeAgilityBtn) modeAgilityBtn.classList.toggle('active', mode === 'agility');
  if (modeBoscoBtn) modeBoscoBtn.classList.toggle('active', mode === 'bosco');
  if (modeSitupBtn) modeSitupBtn.classList.toggle('active', mode === 'situp');
  if (modePushupBtn) modePushupBtn.classList.toggle('active', mode === 'pushup');
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
    flexibility: drawerItemFlex,
    anthro: drawerItemAnthro,
    wingspan: drawerItemWingspan,
    distance: drawerItemDistance
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
    flexibility: { icon: '🧘‍♀️', label: 'انعطاف‌پذیری' },
    anthro: { icon: '📐', label: 'آنتروپومتری' },
    wingspan: { icon: '📏', label: 'طول دو دست' },
    distance: { icon: '📐', label: 'فاصله موانع' }
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
  } else if (mode === 'wingspan') {
    wingspanEnterMode();
  } else if (mode === 'distance') {
    distanceEnterMode();
  } else if (mode === 'flexibility') {
    flexibilityEnterMode();
  } else if (mode === 'anthro') {
    anthroEnterMode();
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
if (modeWingspanBtn) modeWingspanBtn.addEventListener('click', () => switchMode('wingspan'));
if (modeDistanceBtn) modeDistanceBtn.addEventListener('click', () => switchMode('distance'));
if (modeFlexBtn) modeFlexBtn.addEventListener('click', () => switchMode('flexibility'));
if (modeAnthroBtn) modeAnthroBtn.addEventListener('click', () => switchMode('anthro'));

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

    // Try to select camera
    let selectedCameraId = preferredDeviceId;
    if (!selectedCameraId) {
      try {
        selectedCameraId = await selectBestCamera(null);
      } catch (error) {
        console.warn('Could not select best camera:', error);
      }
    }

    // Check if chosen camera is front
    let isFrontCamera = false;
    if (selectedCameraId && availableCameras.length > 0) {
      const found = availableCameras.find(c => c.deviceId === selectedCameraId);
      if (found && found.position === 'front') {
        isFrontCamera = true;
      }
    }

    // Calculate optimal resolution for this orientation
    const optimalRes = calculateOptimalResolution(orientation);

    let stream = null;
    let lastError = null;

    // Build progressive candidate constraints in prioritized order
    const candidates = [];

    // 1. If a specific camera ID is selected
    if (selectedCameraId) {
      candidates.push({
        deviceId: { ideal: selectedCameraId },
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
      // 3. Back camera prioritized (typical for mobile sports measurement)
      candidates.push({
        facingMode: { ideal: 'environment' },
        width: { ideal: optimalRes.width },
        height: { ideal: optimalRes.height }
      });
      candidates.push({
        facingMode: { ideal: 'environment' }
      });
      // 4. Laptop / desktop / single webcam fallback: front/user camera
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

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      try {
        console.log(`📷 getUserMedia attempt ${i + 1}/${candidates.length}:`, candidate);
        stream = await navigator.mediaDevices.getUserMedia({ video: candidate, audio: false });
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
 * 2D Kalman Filter with position and velocity states for smooth joint tracking
 * Incorporates dynamic confidence-based noise scaling to prevent knee/ankle jitter
 */
class PointKalmanFilter2D {
  constructor(name = '') {
    this.name = name;
    this.isLowerLimb = name.includes('knee') || name.includes('ankle') || name.includes('heel') || name.includes('foot');
    this.q = this.isLowerLimb ? 0.003 : 0.006; // Lower process noise for knees and ankles
    this.baseR = this.isLowerLimb ? 0.08 : 0.05;
    this.x = null;
    this.y = null;
    this.vx = 0;
    this.vy = 0;
    this.px = 1.0;
    this.py = 1.0;
    this.lastTime = 0;
  }

  reset() {
    this.x = null;
    this.y = null;
    this.vx = 0;
    this.vy = 0;
    this.px = 1.0;
    this.py = 1.0;
    this.lastTime = 0;
  }

  update(rawX, rawY, score = 0.8) {
    if (rawX == null || rawY == null || isNaN(rawX) || isNaN(rawY)) {
      return { x: this.x, y: this.y };
    }

    const now = performance.now();
    const dt = this.lastTime ? Math.min(0.1, Math.max(0.01, (now - this.lastTime) / 1000)) : 0.033;
    this.lastTime = now;

    if (this.x == null || this.y == null) {
      this.x = rawX;
      this.y = rawY;
      this.vx = 0;
      this.vy = 0;
      return { x: this.x, y: this.y };
    }

    // Dynamic measurement noise: lower score => higher measurement noise (trust motion model more)
    const safeScore = Math.max(0.05, Math.min(1.0, score));
    const r = this.baseR / (safeScore * safeScore);

    // Non-physical jump rejection: if point jumped > 140px in a single frame, heavily damp it
    const distSq = (rawX - this.x) * (rawX - this.x) + (rawY - this.y) * (rawY - this.y);
    const maxJumpPx = this.isLowerLimb ? 120 : 160;
    let effectiveX = rawX;
    let effectiveY = rawY;
    if (distSq > maxJumpPx * maxJumpPx) {
      const dist = Math.sqrt(distSq);
      effectiveX = this.x + ((rawX - this.x) / dist) * maxJumpPx;
      effectiveY = this.y + ((rawY - this.y) / dist) * maxJumpPx;
    }

    // Predict state with velocity
    const predX = this.x + this.vx * dt;
    const predY = this.y + this.vy * dt;
    const predPx = this.px + this.q;
    const predPy = this.py + this.q;

    // Kalman Gain
    const kx = predPx / (predPx + r);
    const ky = predPy / (predPy + r);

    // Update state
    const newX = predX + kx * (effectiveX - predX);
    const newY = predY + ky * (effectiveY - predY);

    // Update velocity
    this.vx = (newX - this.x) / dt;
    this.vy = (newY - this.y) / dt;

    this.x = newX;
    this.y = newY;
    this.px = (1 - kx) * predPx;
    this.py = (1 - ky) * predPy;

    return { x: this.x, y: this.y };
  }
}

// Global registry of keypoint Kalman filters
const poseKalmanFilters = {};
const runnerXKalmanFilter = new KalmanFilter1D(0.012, 0.04);
let lastPoseDetectionTime = 0;

function applyPoseKalmanFilter(keypoints) {
  if (!keypoints || !keypoints.length) return;
  const now = performance.now();
  // If no poses detected for > 600ms, reset filters to prevent trailing lag
  if (now - lastPoseDetectionTime > 600) {
    resetPoseKalmanFilters();
  }
  lastPoseDetectionTime = now;

  for (const pt of keypoints) {
    if (!pt || !pt.name) continue;
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

      // Try 'full' model for higher joint precision on non-low-power devices, fallback to 'lite'
      const preferredType = (performanceMode !== 'low-power' && attempt === 1) ? 'full' : 'lite';
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
        detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          {
            runtime: 'mediapipe',
            modelType: 'lite',
            enableSmoothing: true,
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404',
          }
        );
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
    if (mode === 'wingspan') wingspanDrawOverlay();
    if (mode === 'distance') distanceDrawOverlay();
    if (mode === 'flexibility') flexibilityDrawOverlay();
    if (mode === 'anthro') anthroDrawOverlay();
    if (isCalibratingHeight) heightCalibDrawOverlay();
    if (isObjectCalibrating) objectCalibDrawOverlay();

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

    ctx.restore();

    // Dynamically calibrate scale from detected human pose
    updateEstimatedScaleFromPose(kp);

    if (mode === 'run') runUpdateGateCrossing(getRunnerX(kp));
    if (mode === 'jump') jumpProcessFrame(kp);
    if (mode === 'agility') agilityProcessFrame(kp);
    if (mode === 'bosco') boscoProcessFrame(kp);
    if (mode === 'situp') situpProcessFrame(kp);
    if (mode === 'pushup') pushupProcessFrame(kp);
    if (mode === 'wingspan') wingspanProcessFrame(kp);
    if (mode === 'flexibility') flexibilityProcessFrame(kp);
    if (mode === 'anthro') anthroProcessFrame(kp);

  } catch (error) {
    logError('drawPose', error, { posesLength: poses?.length });
    // Don't throw - let the loop continue
  }
}

// ================== JOINT ANGLE COMPUTATION & VISUALIZATION ==================
let showJointAngles = false;
try {
  showJointAngles = localStorage.getItem('motion_tracker_show_joint_angles') === 'true';
} catch (e) {}

function calculateJointAngle(p1, p2, p3) {
  if (!p1 || !p2 || !p3) return null;
  const s1 = p1.score || 0;
  const s2 = p2.score || 0;
  const s3 = p3.score || 0;
  if (s1 < 0.20 || s2 < 0.20 || s3 < 0.20) return null;

  const rad1 = Math.atan2(p1.y - p2.y, p1.x - p2.x);
  const rad2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
  let diff = Math.abs(rad1 - rad2);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;
  const degrees = Math.round((diff * 180) / Math.PI);
  return { angle: degrees, p1, p2, p3, rad1, rad2 };
}

function drawJointAnglesOverlay(kp) {
  if (!kp) return;

  const jointsToMeasure = [
    // Knees (مفاصل زانو)
    { name: 'زانوی راست', p1: kp['right_hip'], p2: kp['right_knee'], p3: kp['right_ankle'], color: '#22c55e', side: 'r' },
    { name: 'زانوی چپ', p1: kp['left_hip'], p2: kp['left_knee'], p3: kp['left_ankle'], color: '#22c55e', side: 'l' },
    // Elbows (مفاصل آرنج)
    { name: 'آرنج راست', p1: kp['right_shoulder'], p2: kp['right_elbow'], p3: kp['right_wrist'], color: '#38bdf8', side: 'r' },
    { name: 'آرنج چپ', p1: kp['left_shoulder'], p2: kp['left_elbow'], p3: kp['left_wrist'], color: '#38bdf8', side: 'l' },
    // Hips (مفاصل ران / لگن)
    { name: 'لگن راست', p1: kp['right_shoulder'], p2: kp['right_hip'], p3: kp['right_knee'], color: '#f59e0b', side: 'r' },
    { name: 'لگن چپ', p1: kp['left_shoulder'], p2: kp['left_hip'], p3: kp['left_knee'], color: '#f59e0b', side: 'l' },
    // Shoulders (مفاصل شانه)
    { name: 'شانه راست', p1: kp['right_elbow'], p2: kp['right_shoulder'], p3: kp['right_hip'], color: '#a855f7', side: 'r' },
    { name: 'شانه چپ', p1: kp['left_elbow'], p2: kp['left_shoulder'], p3: kp['left_hip'], color: '#a855f7', side: 'l' },
    // Ankles (مچ پا)
    { name: 'مچ پای راست', p1: kp['right_knee'], p2: kp['right_ankle'], p3: kp['right_foot_index'], color: '#10b981', side: 'r' },
    { name: 'مچ پای چپ', p1: kp['left_knee'], p2: kp['left_ankle'], p3: kp['left_foot_index'], color: '#10b981', side: 'l' }
  ];

  ctx.save();
  ctx.font = 'bold 11px Vazirmatn, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const item of jointsToMeasure) {
    const res = calculateJointAngle(item.p1, item.p2, item.p3);
    if (!res) continue;

    const { angle, p2, rad1, rad2 } = res;
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
}

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
      resetActiveModeTest();
      showShortcutToast('🔄 بازنشانی آزمون جاری (R)');
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

    if (key === 'm' || key === 'M' || key === 'پ') {
      e.preventDefault();
      const modal = document.getElementById('athleteProfileModal');
      if (modal) {
        modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        if (modal.style.display === 'flex' && typeof renderAthleteModal === 'function') {
          renderAthleteModal();
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
      if (poses && poses.length > 0 && poses[0].keypoints) {
        // Apply 2D Kalman smoothing across keypoints (especially knees and ankles)
        applyPoseKalmanFilter(poses[0].keypoints);
      }
      drawPose(poses);

      // Render secondary camera feed if active
      if (typeof renderSecondaryFeed === 'function') {
        renderSecondaryFeed();
      }

      // Render Picture-in-Picture live mirror in Stats Window ("و هم بشه دوربین رو توی کادر مشخصات دید")
      if (typeof renderPipMirror === 'function') {
        renderPipMirror();
      }

      // Update Laptop Telemetry and Kinematic Stats
      if (typeof updateLaptopTelemetryView === 'function') {
        updateLaptopTelemetryView();
      }

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
    logError('start', error);
    showErrorModal('UNKNOWN_ERROR', error.message || 'Unknown error during startup');
  }
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
const APP_VERSION = '1.5.3';
console.log(`%c🚀 Motion Tracker v${APP_VERSION}`, 'color: #22c55e; font-size: 16px; font-weight: bold');
console.log('%c✨ Wide-Angle Default & Complete Human Body Skeleton Enabled', 'color: #38bdf8; font-size: 12px');

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
      
      // If a worker is waiting, activate it immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Check for updates
      registration.update();
      setInterval(() => {
        registration.update();
      }, 30000);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        console.log('🔄 Service Worker update found');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✨ New Service Worker installed, auto-activating...');
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            showUpdateNotification(newWorker);
          }
        });
      });
    })
    .catch((error) => {
      console.warn('⚠️ Service Worker registration failed:', error);
    });

  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      isRefreshing = true;
      console.log('🔄 Controller changed to new version, refreshing...');
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
        athleteProfileModal.style.display = 'flex';
        renderAthletesList();
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

  // Joint Angles toggle in stats workstation
  const statsToggleJointAnglesBtn = document.getElementById('statsToggleJointAnglesBtn');
  if (statsToggleJointAnglesBtn) {
    statsToggleJointAnglesBtn.addEventListener('click', () => toggleJointAngles());
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

  const feed2Box = document.getElementById('cameraFeed2');
  if (feed2Box) feed2Box.style.display = 'none';

  const feedsWrapper = document.getElementById('cameraFeedsWrapper');
  if (feedsWrapper) feedsWrapper.className = 'feed-layout-single';

  updateMultiCamUI();
}

async function swapCameras() {
  if (!isSecondaryCameraActive || !secondaryCameraId) {
    setStatus('دوربین دومی متصل نیست');
    return;
  }
  const oldPrimary = currentCameraId;
  const oldSecondary = secondaryCameraId;

  disconnectSecondaryCamera();
  await switchCamera(oldSecondary);
  await connectSecondaryCamera(oldPrimary);
  setStatus('🔄 جایگاه دوربین ۱ و ۲ جابجا شد');
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
    v1.textContent = typeof situpCount !== 'undefined' ? `${situpCount}` : '0';

    l2.textContent = '📐 زاویه تنه و ستون فقرات';
    v2.textContent = typeof situpAngle !== 'undefined' ? `${Math.round(situpAngle)}°` : '--°';

    l3.textContent = '⏱️ زمان آزمون';
    v3.textContent = typeof situpTimer !== 'undefined' ? `${Math.round(situpTimer)} s` : '--';

    l4.textContent = '🎯 ریتم در دقیقه (Cadence)';
    v4.textContent = typeof situpCadence !== 'undefined' ? `${situpCadence} rpm` : '--';
  } else if (mode === 'pushup') {
    l1.textContent = '💪 شنا سوئدی صحیح';
    v1.textContent = typeof pushupCount !== 'undefined' ? `${pushupCount}` : '0';

    l2.textContent = '📐 زاویه آرنج';
    v2.textContent = typeof pushupElbowAngle !== 'undefined' ? `${Math.round(pushupElbowAngle)}°` : '--°';

    l3.textContent = '⏱️ زمان آزمون';
    v3.textContent = typeof pushupTimer !== 'undefined' ? `${Math.round(pushupTimer)} s` : '--';

    l4.textContent = '🎯 وضعیت فرم حرکت';
    v4.textContent = typeof pushupPhase !== 'undefined' ? pushupPhase : 'آماده';
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

// Automatically initialize desktop architecture on script load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDesktopStudioArchitecture);
} else {
  initDesktopStudioArchitecture();
}
