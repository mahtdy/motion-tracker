# Changelog

تمام تغییرات مهم این پروژه در این فایل مستند می‌شود.

فرمت براساس [Keep a Changelog](https://keepachangelog.com/fa/1.0.0/) و این پروژه از [Semantic Versioning](https://semver.org/lang/fa/) پیروی می‌کند.

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
