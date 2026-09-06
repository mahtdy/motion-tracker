# Changelog

تمام تغییرات مهم این پروژه در این فایل مستند می‌شود.

فرمت براساس [Keep a Changelog](https://keepachangelog.com/fa/1.0.0/) و این پروژه از [Semantic Versioning](https://semver.org/lang/fa/) پیروی می‌کند.

---

## [1.3.7] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 🔄 Advanced Service Worker System
- سه استراتژی caching مختلف:
  - **Cache First**: برای فایل‌های core app
  - **Stale While Revalidate**: برای CDN resources
  - **Network First**: برای بقیه requests
- تابع `cacheFirst()` - cache اولویت دارد
- تابع `staleWhileRevalidate()` - cache قدیمی + بروزرسانی background
- تابع `networkFirst()` - network اولویت با fallback به cache

#### 🔔 Update Notification System
- تشخیص خودکار update های service worker
- تابع `showUpdateNotification()` - modal اطلاع‌رسانی
- دکمه "بارگذاری مجدد" برای اعمال update
- دکمه "بعداً" برای به تعویق انداختن
- بررسی update هر 60 ثانیه
- Communication بین SW و client

#### 📦 Smart Cache Management
- Cache busting با timestamp
- تابع `getCacheTime()` - دریافت زمان cache
- تابع `setCacheTime()` - ذخیره زمان cache
- Expire کردن cache بعد از 7 روز
- پاک‌سازی خودکار cache های قدیمی
- سه cache جداگانه: core, CDN, runtime

#### 📡 Offline Fallback Page
- تابع `getOfflineFallback()` - صفحه آفلاین
- صفحه زیبای فارسی با:
  - آیکن 📡
  - پیام واضح "اتصال اینترنت قطع شده"
  - دکمه "تلاش مجدد"
  - طراحی responsive
- نمایش برای navigation requests

#### 🌐 CDN Resource Optimization
- Pattern matching برای CDN ها:
  - cdn.jsdelivr.net
  - fonts.googleapis.com
  - fonts.gstatic.com
- تابع `isCDNResource()` - تشخیص CDN
- Background update برای CDN resources
- سرعت load بهتر با stale-while-revalidate

### 🔧 Changed (تغییر یافته)

#### sw.js
- بازنویسی کامل از 25 خط به ~350 خط
- اضافه کردن 12 تابع جدید
- سه cache strategy مختلف
- Logging کامل برای debugging
- Meta cache برای timestamps
- Version constant: 1.3.7
- Cache names: v17

#### app.js
- بازنویسی registration handler
- اضافه کردن update detection
- اضافه کردن message listener
- تابع `showUpdateNotification()` - ~80 خط
- Auto-check update هر 60 ثانیه
- ~100 خط کد جدید

#### index.html
- آپدیت نسخه از 1.3.6 به 1.3.7

#### manifest.json
- آپدیت version از 1.3.6 به 1.3.7

### 🐛 Fixed (رفع شده)
- Cache invalidation نامناسب
- عدم اطلاع کاربر از update
- CDN resources بدون cache
- عدم offline support
- Cache های قدیمی پاک نمی‌شدند

### 📈 Improved (بهبود یافته)
- سرعت load با smart caching
- User experience با update notification
- Offline capability با fallback page
- Performance با CDN caching
- Cache management با auto-cleanup

### 🎯 Technical Details
- 12 تابع جدید در sw.js
- 3 cache strategy پیاده‌سازی شده
- MAX_CACHE_AGE: 7 days (604800000 ms)
- Update check interval: 60 seconds
- 3 cache stores: core, CDN, runtime
- Meta cache برای timestamps
- Message passing بین SW و client

### 📊 Cache Strategies
```javascript
Cache First (core files):
- Check cache first
- Fetch if not cached
- Expire after 7 days

Stale While Revalidate (CDN):
- Return cached immediately
- Update in background
- Always fresh eventually

Network First (runtime):
- Try network first
- Fall back to cache
- Offline fallback for navigation
```

### 🎨 Update Modal
- Modal با border آبی (#3b82f6)
- آیکن ✨ برای update
- دو دکمه: بارگذاری مجدد (سبز) و بعداً (خاکستری)
- پیام فارسی واضح
- Auto-reload بعد از تایید

### 📡 Offline Page
- Background تیره (#0f172a)
- آیکن 📡
- عنوان سبز (#4ade80)
- دکمه reload
- Responsive design
- Persian text

---

## [1.3.6] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 💡 Low Light Detection System
- تابع `detectLightLevel()` - تشخیص نور محیط از روی confidence
- محاسبه میانگین confidence از keypoints
- ذخیره history آخرین 10 بررسی
- تشخیص خودکار نور کم (میانگین <35%)
- بررسی هر 3 ثانیه

#### 🎯 Dynamic Confidence Threshold
- threshold عادی: 0.3 (30%)
- threshold در نور کم: 0.2 (20%) - relaxed برای دقت بیشتر
- تغییر خودکار threshold براساس نور
- اعمال threshold در تمام keypoint checks
- بهبود تشخیص در شرایط نور ضعیف

#### 📊 Detection Quality Indicator
- تابع `updateQualityIndicator()` - نمایش کیفیت تشخیص
- سه سطح: خوب (●●●)، متوسط (●●○)، ضعیف (●○○)
- رنگ‌بندی: سبز (>50%)، زرد (35-50%)، قرمز (<35%)
- نمایش در گوشه بالای صفحه
- Real-time update

#### ⚠️ Low Light Warning System
- تابع `showLowLightWarning()` - modal هشدار نور کم
- نمایش کیفیت فعلی به درصد
- 4 پیشنهاد برای بهبود نور:
  - روشن کردن چراغ اتاق
  - رفتن به محیط روشن‌تر
  - استفاده از نور طبیعی
  - قرار دادن نور از پشت سر
- Cooldown 10 ثانیه بین هشدارها
- Auto-close بعد از 8 ثانیه

#### 🔧 Smart Threshold Application
- اعمال در `drawPose()` برای رسم skeleton
- اعمال در `getAnkleX()` برای run mode
- اعمال در `getHipAnkleY()` برای jump mode
- اعمال در `isPoseInFrame()` برای frame tracking
- یکپارچگی کامل در سیستم

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی تابع `drawPose()` - اضافه کردن light detection و dynamic threshold
- بهبود تابع `getAnkleX()` - استفاده از currentConfidenceThreshold
- بهبود تابع `getHipAnkleY()` - استفاده از currentConfidenceThreshold  
- بهبود تابع `isPoseInFrame()` - استفاده از currentConfidenceThreshold
- اضافه کردن ~250 خط کد برای low light system
- 8 تابع جدید برای light detection
- 7 متغیر global جدید

#### index.html
- آپدیت نسخه از 1.3.5 به 1.3.6

#### sw.js
- ارتقا نسخه cache از `v15` به `v16`

#### manifest.json
- آپدیت version از 1.3.5 به 1.3.6

### 🐛 Fixed (رفع شده)
- دقت ضعیف در نور کم
- از دست رفتن keypoints در محیط کم‌نور
- عدم آگاهی کاربر از مشکل نور
- threshold ثابت که در همه شرایط یکسان بود

### 📈 Improved (بهبود یافته)
- دقت تشخیص در نور کم با relaxed threshold
- User awareness با warning و quality indicator
- Visual feedback با نمایش real-time quality
- Adaptability به شرایط مختلف نور
- کیفیت کلی اندازه‌گیری

### 🎯 Technical Details
- Object constant: `LIGHT_DETECTION_SETTINGS` با 7 پارامتر
- 7 متغیر state: isLowLight, confidenceHistory, currentConfidenceThreshold, etc.
- 8 تابع جدید برای light management
- Check interval: 3000ms (3 seconds)
- Warning cooldown: 10000ms (10 seconds)
- Low light threshold: 35% average confidence
- Quality levels:
  - Good: >50% (green, ●●●)
  - Medium: 35-50% (yellow, ●●○)
  - Poor: <35% (red, ●○○)
- Dynamic indicator با inline styling

### 📊 Quality Thresholds
```javascript
Normal confidence: 0.3 (30%)
Low-light confidence: 0.2 (20%)
Quality good: >0.5 (50%)
Quality medium: 0.35-0.5 (35-50%)
Quality poor: <0.35 (35%)
```

### 🎨 Visual Elements
- Quality indicator: top-right corner با 3-dot display
- Low light modal: center با 4 bullet points
- Color coding: green/yellow/red based on quality
- Border color matches quality level
- Auto-dismiss modal after 8 seconds

---

## [1.3.5] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 🔒 Orientation Lock Feature
- دکمه 🔓/🔒 برای قفل کردن orientation
- جلوگیری از reconfiguration اتوماتیک در حین timing
- تابع `toggleOrientationLock()` - فعال/غیرفعال کردن lock
- نمایش status message برای lock/unlock
- دکمه در topActions با toggle visual feedback

#### 💾 Ratio-Based Calibration Storage
- تابع `saveCalibrationAsRatio()` - ذخیره calibration به صورت نسبی
- تابع `restoreCalibrationFromRatio()` - بازیابی از ratio
- ذخیره gate points به صورت ratio نسبت به canvas
- ذخیره jump calibration به صورت ratio نسبت به height
- Preservation در تغییرات جزئی size

#### 📐 Minor Orientation Change Detection
- تابع `isMinorOrientationChange()` - تشخیص تغییرات کوچک (<10°)
- حفظ calibration در rotation های جزئی
- Track کردن `lastOrientationAngle` برای مقایسه
- Log کردن angle differences

#### ❓ Orientation Change Confirmation
- تابع `showOrientationChangeConfirmation()` - modal تایید
- دو گزینه: "تایید و ادامه" یا "انصراف (حفظ کالیبراسیون)"
- نمایش پیام واضح درباره پاک شدن calibration
- تلاش برای restore در صورت انصراف
- Smooth transition بعد از تایید

#### 🔄 Smart Calibration Preservation
- حفظ calibration در تغییرات کوچک orientation
- Automatic save قبل از reconfiguration
- Restore attempt بعد از orientation change
- Fallback به reset در صورت شکست restore

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی کامل تابع `refreshCanvasForOrientation()` با:
  - بررسی orientation lock
  - تشخیص minor changes
  - confirmation modal برای major changes
  - save/restore calibration logic
  - ~100 خط کد اضافه
- اضافه کردن ~150 خط کد برای orientation management
- اضافه کردن 4 تابع جدید برای calibration ratio
- اضافه کردن event listener برای orientation lock button
- 4 متغیر global جدید: orientationLocked, lastOrientationAngle, calibrationData, etc.

#### index.html
- اضافه کردن دکمه 🔓 orientation lock در topActions
- آپدیت نسخه از 1.3.4 به 1.3.5

#### sw.js
- ارتقا نسخه cache از `v14` به `v15`

#### manifest.json
- آپدیت version از 1.3.4 به 1.3.5

### 🐛 Fixed (رفع شده)
- از بین رفتن calibration در تغییرات جزئی orientation
- reset اجباری calibration بدون اطلاع کاربر
- عدم امکان قفل کردن orientation در timing
- calibration pixel-based که با resize شکسته می‌شد

### 📈 Improved (بهبود یافته)
- User experience با confirmation قبل از reset
- دقت calibration با ratio-based storage
- کنترل کاربر با orientation lock
- Smooth transition در orientation changes
- جلوگیری از reset های غیرضروری

### 🎯 Technical Details
- 4 تابع جدید برای calibration management
- 3 تابع جدید برای orientation management
- Minor angle threshold: 10 degrees
- Calibration stored as: {x/width, y/height} ratios
- Modal با 2 دکمه (confirm/cancel)
- Lock button toggle visual: 🔓 (gray) ↔ 🔒 (green)
- Save calibration قبل از هر reconfiguration

### 📊 Calibration Data Structure
```javascript
// Run mode:
{
  type: 'run',
  gate1: { x: ratio, y: ratio },
  gate2: { x: ratio, y: ratio },
  distance: meters
}

// Jump mode:
{
  type: 'jump',
  legLengthRatio: ratio,
  airThresholdRatio: ratio,
  landThresholdRatio: ratio
}
```

---

## [1.3.4] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 📡 Out-of-Frame Tracking System
- تابع `isPoseInFrame()` - تشخیص وضعیت pose در یا خارج از کادر
- تابع `handleFrameTracking()` - مدیریت تغییرات وضعیت frame
- تابع `showFrameWarning()` - نمایش هشدار خروج از کادر
- تابع `pauseTiming()` - متوقف کردن timing در صورت out-of-frame طولانی
- تابع `resumeTiming()` - ادامه timing بعد از برگشت به کادر
- تابع `updateFrameIndicator()` - نمایش indicator وضعیت frame
- تابع `resetFrameTracking()` - reset کردن state در شروع جدید

#### 🎯 Frame Detection Rules
- حداقل 3 keypoint با confidence >0.3 باید visible باشه
- 5% margin از لبه‌های صفحه برای تشخیص
- تشخیص دقیق keypoint های داخل/خارج کادر
- Real-time tracking بدون تأخیر محسوس

#### ⏸ Timing Pause System
- بعد از 2 ثانیه out-of-frame، timing متوقف می‌شه
- ذخیره elapsed time قبل از pause
- Adjust کردن start time بعد از resume
- Smooth resume بدون از دست دادن دقت
- فقط در حالت‌های timing/measuring فعاله

#### 🔔 Warning & Indicator System
- هشدار "در کادر دوربین بمون!" با 3 ثانیه cooldown
- Frame indicator در گوشه صفحه:
  - ✓ در کادر (سبز)
  - ✗ خارج از کادر (قرمز)
- پیام‌های واضح فارسی برای pause/resume
- هشدار فقط در حالت‌های active (نه calibration)

#### 🎨 Visual Feedback
- Border رنگی در frame indicator (سبز/قرمز)
- Status messages برای pause: "⏸ متوقف شد - در کادر برگرد!"
- Status messages برای resume: "▶️ ادامه... در حال دویدن ⏱"
- Automatic status reset بعد از 1-2 ثانیه

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی تابع `drawPose()` - اضافه کردن handleFrameTracking()
- بهبود تابع `runEnterReady()` - reset frame tracking
- بهبود تابع `jumpEnterReady()` - reset frame tracking
- اضافه کردن ~250 خط کد برای frame tracking system
- 7 متغیر global جدید برای state management

#### index.html
- آپدیت نسخه از 1.3.3 به 1.3.4

#### sw.js
- ارتقا نسخه cache از `v13` به `v14`

#### manifest.json
- آپدیت version از 1.3.3 به 1.3.4

### 🐛 Fixed (رفع شده)
- قطع شدن tracking وقتی کاربر از کادر خارج می‌شه
- ادامه timing بدون توجه به out-of-frame
- عدم آگاهی کاربر از خروج از کادر
- نتایج نادرست به خاطر pose lost

### 📈 Improved (بهبود یافته)
- دقت اندازه‌گیری با pause در out-of-frame
- User experience با warning و indicator
- Fair timing با توقف خودکار
- Visual feedback واضح برای وضعیت frame
- Smooth resume بعد از برگشت به کادر

### 🎯 Technical Details
- Object constant: `FRAME_TRACKING_SETTINGS` با 5 تنظیم
- 7 متغیر state: isInFrame, lastInFrameTime, outOfFrameStartTime, etc.
- 7 تابع جدید برای frame tracking
- Edge margin: 5% از هر لبه صفحه
- Timeout: 2000ms قبل از pause
- Warning cooldown: 3000ms بین هشدارها
- Min keypoints: 3 با confidence >0.3
- Frame indicator: dynamic element با styling inline

### 🔄 State Management
- Reset frame tracking در شروع هر measurement جدید
- Preserve elapsed time در pause
- Adjust timing بعد از resume
- Independent tracking برای run و jump modes
- No interference با calibration phases

---

## [1.3.3] - 2024-01-XX

### ✨ Added (اضافه شده)

#### ✅ Comprehensive Validation System
- تابع `validateGatePoints()` - اعتبارسنجی فاصله بین موانع
- تابع `validateDistance()` - اعتبارسنجی فاصله ورودی کاربر
- تابع `validateJumpAirTime()` - اعتبارسنجی زمان پرواز
- تابع `validateRunSpeed()` - اعتبارسنجی سرعت دویدن
- تابع `validateJumpHeight()` - اعتبارسنجی ارتفاع پرش
- تابع `showValidationWarning()` - نمایش modal هشدار اعتبارسنجی

#### 🎯 Validation Rules
- **Gate Points**: حداقل 20% عرض صفحه فاصله بین دو مانع
- **Distance Input**: حداقل 0.1m، حداکثر 100m، نباید منفی یا صفر باشه
- **Jump Air Time**: حداکثر 2 ثانیه (بیشتر غیرمنطقیه)
- **Run Speed**: حداقل 0.5 m/s، حداکثر 15 m/s (رکورد جهان ~12.4 m/s)
- **Jump Height**: حداقل 1cm، حداکثر 150cm (رکورد جهان ~63cm)
- **Timing**: زمان‌های خیلی کوتاه (<0.3s) رو هشدار می‌ده

#### 🔔 Warning System
- هشدار برای سرعت غیرمنطقی (بیش از 15 m/s)
- هشدار برای سرعت خیلی کم (<0.5 m/s)
- هشدار برای ارتفاع غیرمنطقی (>150cm)
- هشدار برای زمان‌های خیلی کوتاه
- دو گزینه: "ادامه با این نتیجه" یا "دوباره تلاش کن"
- ذخیره اختیاری نتایج غیرمنطقی

#### 🛡️ Safety & UX Improvements
- جلوگیری از انتخاب موانع خیلی نزدیک به هم
- Validation real-time برای distance input
- Confirmation مشروح برای پاک کردن تاریخچه
- نمایش تعداد رکوردها قبل از حذف
- پیام‌های خطای واضح و راهنما به فارسی

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی تابع `runFinish()` با speed validation
- بازنویسی تابع `jumpFinish()` با air time و height validation
- بهبود handler `gateNextBtn` - validation قبل از ادامه
- بهبود handler `confirmDistBtn` - validation قبل از تایید
- بهبود handler `clearHistoryBtn` - confirmation با جزئیات
- اضافه کردن ~200 خط کد برای validation system

#### index.html
- آپدیت نسخه از 1.3.2 به 1.3.3

#### sw.js
- ارتقا نسخه cache از `v12` به `v13`

#### manifest.json
- آپدیت version از 1.3.2 به 1.3.3

### 🐛 Fixed (رفع شده)
- ذخیره نتایج غیرمنطقی بدون هشدار
- انتخاب موانع خیلی نزدیک به هم
- ورود فاصله‌های منفی یا صفر
- حذف تصادفی تاریخچه با confirm ساده
- عدم validation نتایج قبل از ذخیره

### 📈 Improved (بهبود یافته)
- دقت اندازه‌گیری با validation موانع
- اعتماد به نتایج با هشدار موارد غیرمنطقی
- امنیت داده‌ها با confirmation برای حذف
- User experience با پیام‌های واضح فارسی
- جلوگیری از خطاهای کاربر با validation پیشگیرانه

### 🎯 Technical Details
- 6 تابع جدید برای validation
- 1 object constant: `VALIDATION_SETTINGS` با 8 قانون
- Validation در 5 نقطه مختلف: gate points, distance input, speed result, jump result, clear history
- Modal system با دو دکمه (confirm/cancel) برای validation warnings
- Color-coded warnings: نارنجی برای validation، قرمز برای errors
- عدم ذخیره خودکار نتایج غیرمنطقی - نیاز به تایید کاربر

### 📊 Validation Thresholds
- Min gate distance: 20% screen width
- Distance range: 0.1m - 100m
- Max air time: 2.0s
- Speed range: 0.5 m/s - 15 m/s
- Height range: 1cm - 150cm
- Min timing: 0.3s

---

## [1.3.2] - 2024-01-XX

### ✨ Added (اضافه شده)

#### ⚡ Performance Monitoring System
- تابع `calculateFPS()` - محاسبه FPS واقعی (میانگین 30 فریم اخیر)
- تابع `checkPerformance()` - بررسی عملکرد و نمایش هشدار
- تابع `showLowFPSWarning()` - نمایش هشدار FPS پایین
- تابع `updateFPSIndicator()` - نمایش FPS در گوشه صفحه
- نمایشگر FPS با رنگ‌بندی (سبز >40, زرد 25-40, نارنجی 15-25, قرمز <15)
- هشدار خودکار در FPS زیر 15
- فعال‌سازی خودکار حالت کم‌مصرف در FPS زیر 10

#### ⚡ Low-Power Mode (حالت کم‌مصرف)
- گزینه "حالت کم‌مصرف" در Settings Panel
- تابع `enableLowPowerMode()` و `disableLowPowerMode()`
- Skip کردن هر فریم دیگر در detectLoop (30 FPS → 15 FPS)
- کاهش تعداد keypoint های رسم شده (فقط 6 keypoint ضروری)
- کاهش تعداد connection های رسم شده (5 بجای 12)
- کوچک‌تر کردن دایره‌های keypoint (5px → 4px)
- نازک‌تر کردن خطوط skeleton (3px → 2px)

#### 🎯 Essential Keypoints Mode
- انتخاب هوشمند keypoints (hips, knees, ankles برای jump/run)
- رسم فقط keypoint های ضروری در low-power mode
- حفظ دقت اندازه‌گیری با کاهش overhead رسم

#### 🔧 Performance Settings Integration
- ذخیره lowPowerMode در localStorage
- آپدیت UI checkbox بر اساس تنظیمات
- Apply خودکار تنظیمات در startup

### 🔧 Changed (تغییر یافته)

#### app.js
- اضافه کردن ~300 خط کد برای performance monitoring
- بازنویسی تابع `detectLoop()` با FPS calculation و frame skipping
- بازنویسی تابع `drawPose()` با essential keypoints mode
- بهبود تابع `getSettings()` - اضافه کردن lowPowerMode
- بهبود تابع `loadSettingsUI()` - load کردن lowPowerMode checkbox
- بهبود handler `closeSettingsBtn` - apply کردن lowPowerMode

#### index.html
- اضافه کردن checkbox "حالت کم‌مصرف" در Settings Panel
- توضیحات فارسی برای حالت کم‌مصرف
- آپدیت نسخه از 1.3.0 به 1.3.2

#### sw.js
- ارتقا نسخه cache از `v11` به `v12`

### 🐛 Fixed (رفع شده)
- کندی در گوشی‌های ضعیف
- FPS پایین در طول detection
- استفاده زیاد از CPU/GPU
- عدم تشخیص مشکلات performance

### 📈 Improved (بهبود یافته)
- عملکرد در گوشی‌های ضعیف با low-power mode
- نرخ فریم (FPS) با frame skipping
- مصرف باتری با کاهش محاسبات رسم
- Visibility با FPS indicator
- User experience با هشدار خودکار و راهنمایی

### 🎯 Technical Details
- 7 متغیر global جدید: `performanceMode`, `fpsHistory`, `lastFrameTime`, etc.
- 6 تابع جدید برای performance management
- محاسبه میانگین FPS از 30 فریم اخیر
- بررسی performance هر 60 فریم (~1 ثانیه)
- کاهش 58% تعداد keypoint های رسم شده (17 → 6)
- کاهش 58% تعداد connection های رسم شده (12 → 5)
- کاهش 50% نرخ detection در low-power mode

### 🎨 Visual Indicators
- نمایشگر FPS در گوشه بالا-چپ
- آیکن ⚡ در کنار FPS برای نشان دادن low-power mode
- Modal هشدار FPS پایین با دکمه فعال‌سازی
- رنگ‌بندی FPS indicator براساس عملکرد

---

## [1.3.1] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 🏷️ نمایش ورژن
- اضافه کردن نمایش ورژن (1.3.0) در صفحه شروع
- کاربر می‌تونه بدونه چه نسخه‌ای رو استفاده می‌کنه

#### 📱 Responsive Design برای گوشی‌های کوچک
- بهینه‌سازی کامل برای صفحات زیر 360px
- تمام دکمه‌ها حداقل 44x44px (استاندارد touch target)
- جلوگیری از overlap دکمه‌ها
- استفاده بهینه از safe-area-inset برای notch ها
- بهبود layout در landscape mode برای صفحات کوچک

#### 🎯 Touch Target Optimization
- تمام button ها حداقل 44x44px
- جلوگیری از text selection با double-tap
- حذف tap highlight برای تجربه بهتر
- touch-action: manipulation برای سرعت بیشتر

### 🔧 Changed (تغییر یافته)

#### index.html
- اضافه کردن 150+ خط CSS برای responsive
- Media query برای max-width: 360px
- بهبود landscape mode (max-height: 500px)
- کاهش padding/margin در صفحات کوچک
- کاهش font-size در صفحات کوچک

#### sw.js
- ارتقا نسخه cache از `v10` به `v11`

### 🐛 Fixed (رفع شده)
- دکمه‌های تاپ از کادر خارج نمی‌شن
- gateControls در گوشی‌های کوچک به درستی نمایش داده می‌شه
- overlap دکمه‌ها در landscape mode
- دکمه‌های کوچک‌تر از 44px (touch target issue)
- text selection نامناسب

### 📈 Improved (بهبود یافته)
- تجربه کاربری در گوشی‌های کوچک (iPhone SE, etc.)
- خوانایی متن در صفحات کوچک
- فاصله بهتر بین المان‌ها
- استفاده بهینه از فضای موجود
- landscape mode بسیار بهتر

### 🎯 Technical Details
- 2 media query جدید (360px, landscape)
- 10+ CSS property برای touch optimization
- user-select: none برای prevent text selection
- -webkit-tap-highlight-color: transparent
- min-width و min-height برای تمام buttons

---

## [1.3.0] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 📐 سیستم مدیریت Resolution و Orientation هوشمند
- تابع `getCurrentOrientation()` - تشخیص orientation فعلی
- تابع `calculateOptimalResolution()` - محاسبه بهترین resolution براساس صفحه نمایش
- تابع `getSupportedResolutions()` - دریافت resolution های پشتیبانی شده دوربین
- پشتیبانی از aspect ratio های مختلف (16:9, 18:9, 19.5:9, 20:9, 21:9)
- محاسبه دقیق resolution برای portrait و landscape

#### 🔄 Smooth Orientation Reconfiguration
- تشخیص خودکار تغییر orientation (portrait ↔ landscape)
- Reconfigure خودکار دوربین با resolution مناسب
- جلوگیری از multiple rapid reconfiguration با debounce
- حفظ stream قبلی و stop کردن قبل از شروع جدید
- Reset خودکار calibration بعد از تغییر orientation

#### 🎯 Aspect Ratio Matching
- Match کردن aspect ratio دوربین با صفحه نمایش
- کاهش crop شدن frame
- بهینه‌سازی برای گوشی‌های ultra-tall (20:9, 21:9)
- Fallback strategy برای resolution های پشتیبانی نشده

#### 📊 Enhanced Logging
- لاگ aspect ratio مقایسه (requested vs actual)
- لاگ کامل orientation changes
- نمایش ✅ یا ⚠️ برای aspect ratio match
- Track کردن supported resolutions

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی تابع `setupCamera()` با پارامتر `forceReconfigure`
- بازنویسی کامل تابع `refreshCanvasForOrientation()` (async + smooth)
- اضافه کردن ~150 خط کد برای orientation/resolution management
- بهبود event listeners با debounce timer

#### sw.js
- ارتقا نسخه cache از `v9` به `v10`

### 🐛 Fixed (رفع شده)
- Crop بیش از حد frame در orientation های مختلف
- Aspect ratio mismatch بین دوربین و صفحه
- Multiple rapid reconfiguration در تغییر orientation
- از دست رفتن calibration بدون اطلاع به کاربر

### 📈 Improved (بهبود یافته)
- Field of view بهتر با aspect ratio matching
- تجربه smooth در تغییر orientation
- کیفیت تصویر با resolution بهینه
- سازگاری با گوشی‌های ultra-wide (20:9, 21:9)
- استفاده بهتر از صفحه نمایش

### 🎯 Technical Details
- 3 متغیر global جدید: `currentOrientation`, `currentCameraStream`, `isReconfiguring`
- پشتیبانی از 5+ aspect ratio مختلف
- Debounce 300-500ms برای orientation events
- Relaxed constraints با min resolution در retry
- Timeout prevention برای concurrent reconfigurations

---

## [1.2.0] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 📷 سیستم انتخاب دوربین هوشمند
- تابع `getAvailableCameras()` برای دریافت لیست دوربین‌های موجود
- تابع `selectBestCamera()` برای انتخاب بهترین دوربین wide-angle
- شناسایی دوربین‌های ultra-wide با کلمات کلیدی (wide, ultra, 0.5, etc.)
- اولویت‌بندی: ultra-wide > wide > back > first available
- لاگ جامع برای capabilities و settings دوربین

#### 🔄 Retry Strategy پیشرفته
- تلاش چندمرحله‌ای برای دسترسی به دوربین (حداکثر 3 بار)
- Fallback strategy: exact deviceId → without deviceId → basic constraints
- بازیابی خودکار در صورت شکست constraints

#### 📊 Camera Logging سیستم
- نمایش تمام دوربین‌های موجود با label
- لاگ capabilities (zoom range, focus mode, resolution)
- لاگ final settings (deviceId, width, height, facingMode, aspect ratio)
- لاگ مراحل video loading و playing

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی کامل تابع `setupCamera()` با قابلیت‌های جدید
- اضافه کردن ~200 خط کد برای مدیریت دوربین
- بهبود error handling با context بیشتر

#### sw.js
- ارتقا نسخه cache از `v8` به `v9`

### 🐛 Fixed (رفع شده)
- مشکل zoom in بیش از حد در گوشی‌های multi-lens (Samsung, Huawei, etc.)
- انتخاب اشتباه دوربین (telephoto به جای wide-angle)
- عدم دسترسی به دوربین با constraints سفت و سخت

### 📈 Improved (بهبود یافته)
- کیفیت تصویر با انتخاب بهترین دوربین
- field of view گسترده‌تر با wide-angle lens
- سازگاری با انواع گوشی‌ها (Android, iOS)
- Debugging با لاگ‌های جامع

### 🎯 Technical Details
- 3 تلاش برای دسترسی به دوربین با strategies مختلف
- شناسایی 6+ کلمه کلیدی برای تشخیص wide-angle
- زوم reset به minimum برای بیشترین field of view
- فوکوس continuous برای بهترین کیفیت
- Timeout 10 ثانیه با پیام خطای واضح

---

## [1.1.0] - 2024-01-XX

### ✨ Added (اضافه شده)

#### 🛡️ سیستم Error Handling حرفه‌ای
- سیستم دسته‌بندی خطا با 10 نوع خطای مختلف
- پیام‌های خطای فارسی و کاربرپسند
- Error Modal با طراحی زیبا و responsive
- دکمه Retry برای خطاهای قابل بازیابی
- سیستم Logging جامع با `logError()`
- نمایش جزئیات فنی (technical details) برای توسعه‌دهندگان
- Browser Compatibility Check (getUserMedia, WebGL)
- Global Error Handlers (`unhandledrejection`, `window.error`)

#### 📁 فایل‌های جدید
- `test-error-handling.html` - صفحه تست سیستم Error Handling
- `ERROR-HANDLING-GUIDE.md` - مستندات کامل Error Handling
- `CHANGELOG.md` - این فایل!

#### 🔄 Retry Logic
- Retry خودکار برای بارگذاری مدل (حداکثر 3 بار)
- Exponential backoff (1s → 2s → 4s)
- تابع `retryStart()` برای تلاش مجدد کاربر

#### 📊 انواع خطاهای پشتیبانی شده
- `CAMERA_PERMISSION_DENIED` - دسترسی دوربین رد شد
- `CAMERA_NOT_FOUND` - دوربین یافت نشد
- `CAMERA_IN_USE` - دوربین در حال استفاده
- `CAMERA_UNKNOWN` - خطای ناشناخته دوربین
- `MODEL_LOAD_FAILED` - بارگذاری مدل ناموفق
- `MODEL_INIT_FAILED` - راه‌اندازی مدل ناموفق
- `DETECTION_FAILED` - خطا در تشخیص
- `WEBGL_NOT_SUPPORTED` - WebGL پشتیبانی نمی‌شه
- `UNSUPPORTED_BROWSER` - مرورگر پشتیبانی نمی‌شه
- `UNKNOWN_ERROR` - خطای ناشناخته

### 🔧 Changed (تغییر یافته)

#### app.js
- بازنویسی تابع `setupCamera()` با error handling کامل
- بازنویسی تابع `loadModel()` با retry logic
- بهبود تابع `detectLoop()` با tracking خطاهای متوالی
- اضافه کردن error handling به `drawPose()`
- بازنویسی تابع `start()` با try-catch جامع

#### sw.js
- ارتقا نسخه cache از `v7` به `v8`

#### README.md
- اضافه کردن بخش "🛡️ مدیریت خطا (Error Handling)"

### 🐛 Fixed (رفع شده)
- برنامه دیگه با خطاهای دوربین crash نمی‌کنه
- پیام‌های خطا حالا به فارسی و قابل فهم هستند
- خطاهای مدل AI به درستی handle می‌شن
- خطاهای متوالی detection منجر به توقف کنترل شده می‌شه

### 📈 Improved (بهبود یافته)
- تجربه کاربری در مواجهه با خطا
- قابلیت debugging با لاگ‌های ساختاریافته
- پایداری برنامه در شرایط نامناسب
- Recovery سریع با retry logic

### 📝 Technical Details
- ~400 خط کد جدید
- 6 تابع جدید
- 10 نوع خطای دسته‌بندی شده
- 2 فایل جدید
- Timeout 10 ثانیه برای camera setup
- حداکثر 10 خطای متوالی قبل از توقف detection

---

## [1.0.0] - 2024-01-XX

### ✨ نسخه اولیه

#### ویژگی‌های اصلی
- حالت دویدن (Run Mode) با اندازه‌گیری زمان و سرعت
- حالت پرش (Jump Mode) با محاسبه ارتفاع
- کالیبراسیون دو نقطه‌ای برای دویدن
- کالیبراسیون خودکار برای پرش
- تشخیص بدن با TensorFlow.js و BlazePose
- ذخیره تاریخچه (50 رکورد آخر)
- تنظیمات قابل تنظیم (حساسیت پرش/فرود)
- رابط کاربری فارسی RTL
- پشتیبانی از Portrait و Landscape
- Progressive Web App (PWA)
- سیستم راهنما (Guide System)
- Service Worker برای کار آفلاین

#### فایل‌های اصلی
- `index.html` - صفحه اصلی
- `app.js` - منطق برنامه
- `sw.js` - Service Worker
- `manifest.json` - تنظیمات PWA
- `icon.svg` - آیکون برنامه
- `README.md` - مستندات

---

## Legend (راهنما)

- `Added` (اضافه شده): ویژگی‌های جدید
- `Changed` (تغییر یافته): تغییرات در ویژگی‌های موجود
- `Deprecated` (منسوخ شده): ویژگی‌هایی که به زودی حذف می‌شن
- `Removed` (حذف شده): ویژگی‌های حذف شده
- `Fixed` (رفع شده): باگ‌های رفع شده
- `Security` (امنیت): رفع آسیب‌پذیری‌های امنیتی
- `Improved` (بهبود یافته): بهبودهای کلی

---

<div align="center">

**برای مشاهده تغییرات دقیق هر commit، به [Git History](https://github.com/mahtdy/motion-tracker/commits) مراجعه کنید**

</div>
