# 🛡️ راهنمای سیستم Error Handling

## معرفی

این سند راهنمای کامل سیستم مدیریت خطا (Error Handling) در پروژه حرکت‌سنج است که در نسخه جدید اضافه شده.

---

## 🎯 اهداف

1. **تجربه کاربری بهتر**: نمایش پیام‌های خطای واضح و قابل فهم به فارسی
2. **قابلیت بازیابی**: امکان تلاش مجدد برای خطاهای قابل رفع
3. **Debugging آسان‌تر**: لاگ کامل خطاها برای توسعه‌دهندگان
4. **پایداری بیشتر**: جلوگیری از کرش برنامه در مواجهه با خطا

---

## 📋 انواع خطاهای پشتیبانی شده

### 1. خطاهای دوربین

| نوع خطا | کد | توضیح | قابل بازیابی |
|---------|-----|-------|---------------|
| دسترسی رد شد | `CAMERA_PERMISSION_DENIED` | کاربر دسترسی دوربین رو رد کرده | ✅ بله |
| دوربین یافت نشد | `CAMERA_NOT_FOUND` | دستگاه دوربین نداره یا غیرفعاله | ✅ بله |
| دوربین در حال استفاده | `CAMERA_IN_USE` | دوربین توسط برنامه دیگه‌ای استفاده می‌شه | ✅ بله |
| خطای ناشناخته دوربین | `CAMERA_UNKNOWN` | خطای غیرمنتظره دوربین | ✅ بله |

### 2. خطاهای مدل AI

| نوع خطا | کد | توضیح | قابل بازیابی |
|---------|-----|-------|---------------|
| بارگذاری مدل ناموفق | `MODEL_LOAD_FAILED` | مدل TensorFlow.js بارگذاری نشد | ✅ بله (با retry) |
| راه‌اندازی مدل ناموفق | `MODEL_INIT_FAILED` | مشکل در initialize کردن detector | ✅ بله |

### 3. خطاهای تشخیص

| نوع خطا | کد | توضیح | قابل بازیابی |
|---------|-----|-------|---------------|
| خطا در تشخیص | `DETECTION_FAILED` | خطاهای متوالی در detection loop | ✅ بله |

### 4. خطاهای سیستم

| نوع خطا | کد | توضیح | قابل بازیابی |
|---------|-----|-------|---------------|
| WebGL پشتیبانی نمی‌شه | `WEBGL_NOT_SUPPORTED` | دستگاه WebGL نداره | ❌ خیر |
| مرورگر پشتیبانی نمی‌شه | `UNSUPPORTED_BROWSER` | مرورگر قدیمی یا ناسازگار | ❌ خیر |
| خطای ناشناخته | `UNKNOWN_ERROR` | خطای غیرمنتظره | ✅ بله |

---

## 🔧 معماری سیستم

### 1. **Error Classification**

تابع `classifyCameraError(error)` خطاهای دوربین رو تشخیص و دسته‌بندی می‌کنه:

```javascript
function classifyCameraError(error) {
  const errorName = error?.name || '';
  const errorMessage = error?.message?.toLowerCase() || '';

  if (errorName === 'NotAllowedError') {
    return 'CAMERA_PERMISSION_DENIED';
  }
  // ... سایر موارد
}
```

### 2. **Error Logging**

تابع `logError(context, error, additionalInfo)` خطاها رو لاگ می‌کنه:

```javascript
function logError(context, error, additionalInfo = {}) {
  console.group(`🔴 Error in ${context}`);
  console.error('Error object:', error);
  console.error('Error message:', error?.message);
  console.error('Error stack:', error?.stack);
  if (Object.keys(additionalInfo).length > 0) {
    console.error('Additional info:', additionalInfo);
  }
  console.groupEnd();
}
```

### 3. **Error Modal**

تابع `showErrorModal(errorType, technicalDetails)` خطا رو به کاربر نمایش می‌ده:

```javascript
showErrorModal('CAMERA_PERMISSION_DENIED', error.message);
```

### 4. **Retry Logic**

- **Camera**: تلاش مجدد با دکمه retry
- **Model**: retry خودکار تا 3 بار با exponential backoff
- **Detection**: توقف بعد از 10 خطای متوالی

---

## 🎨 UI Components

### Error Modal Structure

```
┌─────────────────────────────────┐
│         [Emoji Icon]            │
│         Error Title             │
│                                 │
│    User-friendly message        │
│                                 │
│  [Technical Details - Toggle]   │
│                                 │
│   [🔄 Retry Button]             │
│   [Close Button]                │
└─────────────────────────────────┘
```

### رنگ‌ها و استایل‌ها

- **Background**: `rgba(0, 0, 0, 0.95)` - تیره و نیمه شفاف
- **Modal**: `#1e293b` - پس‌زمینه خاکستری تیره
- **Border**: `#ef4444` - قرمز برای error
- **Title**: `#ef4444` - قرمز
- **Message**: `#94a3b8` - خاکستری روشن
- **Retry Button**: `#22c55e` - سبز
- **Close Button**: `transparent` با border `#475569`

---

## 📊 Error Flow

### Camera Error Flow

```
User clicks "Start"
  ↓
checkBrowserCompatibility()
  ↓
setupCamera()
  ↓
getUserMedia() → [Error]
  ↓
classifyCameraError()
  ↓
logError()
  ↓
showErrorModal()
  ↓
User clicks "Retry"
  ↓
retryStart()
```

### Model Loading Flow

```
loadModel()
  ↓
Attempt 1 → [Fail]
  ↓
Wait 1s
  ↓
Attempt 2 → [Fail]
  ↓
Wait 2s
  ↓
Attempt 3 → [Fail]
  ↓
logError()
  ↓
showErrorModal('MODEL_LOAD_FAILED')
```

### Detection Loop Error Flow

```
detectLoop()
  ↓
estimatePoses() → [Error]
  ↓
consecutiveErrors++
  ↓
if (consecutiveErrors >= 10)
  ↓
showErrorModal('DETECTION_FAILED')
  ↓
Stop loop
```

---

## 🧪 تست کردن

### 1. اجرای تست‌های خودکار

فایل `test-error-handling.html` رو در مرورگر باز کن:

```bash
# در مرورگر باز کن:
test-error-handling.html
```

### 2. تست دستی خطاها

#### تست CAMERA_PERMISSION_DENIED
1. برنامه رو باز کن
2. روی "Block" بزن وقتی permission میخواد
3. باید error modal نمایش داده بشه

#### تست CAMERA_IN_USE
1. برنامه‌ای رو باز کن که دوربین رو استفاده می‌کنه (مثلاً Zoom)
2. برنامه حرکت‌سنج رو باز کن
3. باید خطای "دوربین در حال استفاده" نمایش داده بشه

#### تست MODEL_LOAD_FAILED
1. اتصال اینترنت رو قطع کن
2. برنامه رو باز کن
3. بعد از چند تلاش، باید خطا نمایش داده بشه

---

## 💡 نکات توسعه‌دهندگان

### اضافه کردن نوع خطای جدید

1. خطا رو به `ERROR_MESSAGES` اضافه کن:

```javascript
const ERROR_MESSAGES = {
  // ...
  YOUR_NEW_ERROR: {
    title: '⚠️ عنوان خطا',
    message: 'پیام کاربرپسند به فارسی',
    recoverable: true
  }
};
```

2. در جایی که خطا رخ می‌ده، از این کد استفاده کن:

```javascript
try {
  // کد شما
} catch (error) {
  logError('context', error);
  showErrorModal('YOUR_NEW_ERROR', error.message);
}
```

### Best Practices

1. **همیشه context رو لاگ کن**:
   ```javascript
   logError('functionName', error, { param1, param2 });
   ```

2. **پیام‌های فارسی و واضح**:
   - ❌ بد: "Error 404"
   - ✅ خوب: "دوربین یافت نشد. مطمئن شو که دوربین فعاله."

3. **Technical details رو اضافه کن**:
   ```javascript
   showErrorModal(errorType, JSON.stringify(error, null, 2));
   ```

4. **Retry logic برای خطاهای موقت**:
   ```javascript
   if (errorType.includes('NETWORK') || errorType.includes('TIMEOUT')) {
     // Enable retry
   }
   ```

---

## 📈 آمار و Monitoring

### لاگ‌های مهم

تمام خطاها در Console لاگ می‌شن با این فرمت:

```
🔴 Error in setupCamera - getUserMedia
  Error object: NotAllowedError
  Error message: Permission denied
  Error stack: ...
  Additional info: { constraints: {...} }
```

### Global Error Handlers

دو handler برای catch کردن خطاهای handle نشده:

1. **Unhandled Promise Rejections**:
   ```javascript
   window.addEventListener('unhandledrejection', handler);
   ```

2. **Global Errors**:
   ```javascript
   window.addEventListener('error', handler);
   ```

---

## 🔍 Debugging

### چک لیست زمان خطا

1. ✅ Console رو باز کن و error log ها رو بخون
2. ✅ جزئیات فنی در modal رو باز کن
3. ✅ مرورگر و نسخه اون رو چک کن
4. ✅ دسترسی‌های دوربین رو در تنظیمات چک کن
5. ✅ اتصال اینترنت رو چک کن
6. ✅ WebGL رو تست کن: `chrome://gpu`

### ابزارهای مفید

- **Chrome DevTools**: F12
- **Console Filters**: فقط errors رو نمایش بده
- **Network Tab**: بررسی بارگذاری CDN scripts
- **Application Tab**: بررسی Service Worker

---

## 📝 Changelog

### نسخه 1.0 (فعلی)

- ✅ Error classification برای camera errors
- ✅ Error modal با retry capability
- ✅ Comprehensive logging system
- ✅ Model loading retry logic (3 attempts)
- ✅ Detection loop error handling
- ✅ Browser compatibility check
- ✅ Global error handlers
- ✅ Persian error messages
- ✅ Technical details toggle

---

## 🤝 مشارکت

اگر باگ یا خطایی پیدا کردی که handle نمی‌شه:

1. Issue باز کن با این اطلاعات:
   - مرورگر و نسخه
   - پیام خطا (از Console)
   - Stack trace
   - مراحل تکرار

2. Pull Request برای بهبود Error Handling همیشه خوش‌آمده!

---

## 📞 پشتیبانی

اگر سوالی دارید:
- GitHub: [@mahtdy](https://github.com/mahtdy)
- Issues: پروژه GitHub

---

<div align="center">

**ساخته شده با ❤️ و دقت برای بهترین تجربه کاربری**

</div>
