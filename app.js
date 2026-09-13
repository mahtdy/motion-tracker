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

const historyBtn = document.getElementById('historyBtn');
const settingsBtn = document.getElementById('settingsBtn');
const historyPanel = document.getElementById('historyPanel');
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

let detector = null;
let running = false;

// mode: 'run' | 'jump'
let mode = 'run';

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
    'نوع آزمون',
    'تاریخ و زمان',
    'زمان رکورد (ثانیه)',
    'سرعت (متر بر ثانیه)',
    'مسافت دویدن (متر)',
    'زمان هوا (ثانیه)',
    'ارتفاع پرش (سانتی‌متر)',
    'تعداد پرش‌ها',
    'تعداد لمس زمین',
    'میانگین زمان هوا (ثانیه)',
    'میانگین تماس زمین (ثانیه)',
    'طول دست‌ها (سانتی‌متر)',
    'قد ورزشکار (سانتی‌متر)',
    'فاصله دو جسم (سانتی‌متر)',
    'فاصله دو جسم (متر)',
    'خلاصه کامل نتیجه'
  ];

  const rows = history.map((entry, index) => {
    const rowNum = index + 1;
    let testTypeTitle = '';
    let recordTime = '';
    let speed = '';
    let runDist = '';
    let airTime = '';
    let jumpHeight = '';
    let jumpsCount = '';
    let touchesCount = '';
    let avgAir = '';
    let avgContact = '';
    let wingspan = '';
    let athleteHeight = '';
    let distCm = '';
    let distM = '';
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
      jumpsCount = '1';
      touchesCount = '1';
      summary = `زمان پرواز: ${d.airTime}s | ارتفاع پرش: ${d.height} cm`;
    } else if (entry.type === 'bosco') {
      testTypeTitle = 'آزمون ۳۰ ثانیه پرش (باسکو)';
      recordTime = d.totalAirTime || '30.0';
      airTime = d.totalAirTime || '';
      jumpHeight = d.maxHeight || '';
      jumpsCount = d.totalJumps || '';
      touchesCount = d.totalTouches || '';
      avgAir = d.avgAirTime || '';
      avgContact = d.avgContactTime || '';
      summary = `تعداد پرش: ${d.totalJumps} | لمس زمین: ${d.totalTouches} | زمان هوا: ${d.totalAirTime}s | میانگین هوا: ${d.avgAirTime}s | اوج ارتفاع: ${d.maxHeight} cm`;
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
      escapeCsv(testTypeTitle),
      escapeCsv(entry.date || ''),
      escapeCsv(recordTime),
      escapeCsv(speed),
      escapeCsv(runDist),
      escapeCsv(airTime),
      escapeCsv(jumpHeight),
      escapeCsv(jumpsCount),
      escapeCsv(touchesCount),
      escapeCsv(avgAir),
      escapeCsv(avgContact),
      escapeCsv(wingspan),
      escapeCsv(athleteHeight),
      escapeCsv(distCm),
      escapeCsv(distM),
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
  if (wingspanHud) wingspanHud.style.display = 'none';
  if (distanceHud) distanceHud.style.display = 'none';
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
        setStatus('در حال دویدن... ⏱');
        playChime(660);
      } else {
        runEndTime = crossingTime;
        playChime(880);
        runFinish();
      }
    }
    prevSide[i] = side;
  }
  prevRunnerX = runnerX;
  prevRunnerTime = now;
}

function runDrawGates() {
  // Ground measurement line between obstacles if both are set
  if (gatePoints[0] && gatePoints[1]) {
    const p1 = gatePoints[0];
    const p2 = gatePoints[1];
    ctx.save();
    
    // Glowing ground connector line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Dimension end ticks
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const perpAngle = angle + Math.PI / 2;
    const tickLen = 14;
    
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
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
      const badgeText = `📏 ${distInfo.textFa} (${distInfo.totalM.toFixed(2)}m)`;
      
      ctx.font = 'bold 13px Vazirmatn, Tahoma, sans-serif';
      const textW = ctx.measureText(badgeText).width;
      const padX = 10, h = 26;
      
      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.roundRect(midX - textW/2 - padX + 2, midY - h/2 + 2, textW + padX*2, h, 13);
      ctx.fill();
      
      // Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(midX - textW/2 - padX, midY - h/2, textW + padX*2, h, 13);
      ctx.fill();
      ctx.stroke();
      
      // Text
      ctx.fillStyle = '#4ade80';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, midX, midY);
    }
    
    ctx.restore();
  }

  // Draw vertical gate lines
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
    ctx.arc(pt.x, pt.y, 9, 0, 2 * Math.PI);
    ctx.fill();

    ctx.save();
    ctx.font = 'bold 12px Vazirmatn, Tahoma, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(i === 0 ? 'مانع ۱' : 'مانع ۲', pt.x, Math.max(20, pt.y - 14));
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
  hideAllPanels();
  resetFrameTracking(); // Reset frame tracking
  setStatus('آماده! بپر 🤸');
}

function jumpFinish() {
  jumpPhase = 'done';
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
          height: finalHeightCm.toFixed(1)
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
      height: finalHeightCm.toFixed(1)
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
  const now = performance.now();

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
        minHipYDuringJump = hipY != null ? hipY : Infinity;
        aboveCount = 0;
        belowCount = 0;
        playChime(520, 'sine', 0.1);
        setStatus('در هوا... ⤴️');
      }
    } else {
      aboveCount = 0;
    }
  } else if (jumpPhase === 'airborne') {
    if (hipY != null && hipY < minHipYDuringJump) {
      minHipYDuringJump = hipY;
    }
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
  boscoLastCountdownSec = 30;
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

// Pointer handling on canvas (Object Calibration and Distance Measurement)
document.getElementById('stage').addEventListener('pointerdown', (e) => {
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

  // 2. Android / Mobile default: Prioritize the camera with highest wideScore (Ultra-wide 0.5x)
  const backCameras = availableCameras.filter(c => c.position === 'back');

  if (backCameras.length > 0) {
    // Sort back cameras by wideScore descending
    const sortedByWide = [...backCameras].sort((a, b) => (b.wideScore || 0) - (a.wideScore || 0));
    const widestCam = sortedByWide[0];

    // On Android, if an ultra-wide or wide camera is detected (wideScore >= 80), prefer it immediately
    if (widestCam && widestCam.wideScore >= 80) {
      console.log(`✅ [Android Wide Default] Automatically selected widest camera: ${widestCam.persianLabel} (${widestCam.originalLabel}) with score ${widestCam.wideScore}`);
      currentCameraId = widestCam.deviceId;
      currentCameraInfo = widestCam;
      return widestCam.deviceId;
    }

    // Otherwise use first back camera
    console.log(`✅ Selected back camera: ${backCameras[0].persianLabel}`);
    currentCameraId = backCameras[0].deviceId;
    currentCameraInfo = backCameras[0];
    return backCameras[0].deviceId;
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
    if (mode === 'bosco') boscoDrawOverlay();
    if (mode === 'wingspan') wingspanDrawOverlay();
    if (mode === 'distance') distanceDrawOverlay();
    if (isCalibratingHeight) heightCalibDrawOverlay();
    if (isObjectCalibrating) objectCalibDrawOverlay();

    if (!poses || !poses.length) return;
    const kp = {};
    for (const point of poses[0].keypoints) kp[point.name] = point;

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

    ctx.restore();

    // Dynamically calibrate scale from detected human pose
    updateEstimatedScaleFromPose(kp);

    if (mode === 'run') runUpdateGateCrossing(getRunnerX(kp));
    if (mode === 'jump') jumpProcessFrame(kp);
    if (mode === 'bosco') boscoProcessFrame(kp);
    if (mode === 'wingspan') wingspanProcessFrame(kp);

  } catch (error) {
    logError('drawPose', error, { posesLength: poses?.length });
    // Don't throw - let the loop continue
  }
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
