# Golf House Development - Forms & Admin Dashboard

مشروع كامل لنظام طلبات العملاء مع لوحة تحكم للإدارة

## Design Reference

التصميم مبني على الصور المرفقة - خلفية ذهبية/بني غامق مع أزرار ذهبية وكروت بتأثير glassmorphism.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js + Express** | Backend server & routing |
| **EJS** | Template engine for server-side rendering |
| **Tailwind CSS (CDN)** | Styling framework |
| **MongoDB Atlas** | Database (via Mongoose) |
| **Passport.js + Google OAuth2** | Admin authentication |
| **Chart.js** | Analytics charts in dashboard |
| **Font: Tajawal** | Arabic font from Google Fonts |
| **Lucide Icons** | Modern icon set |

---

## Project Architecture

```
GOLF FORMS/
├── .env
├── package.json
├── server.js                    # Express server entry point
├── config/
│   ├── db.js                    # MongoDB connection
│   └── passport.js              # Google OAuth strategy
├── models/
│   ├── Request.js               # Client form submissions
│   ├── User.js                  # Admin users (Google OAuth)
│   └── Visit.js                 # Visit tracking
├── routes/
│   ├── index.js                 # Public routes (home, form pages)
│   ├── api.js                   # API routes (form submission, visits)
│   ├── auth.js                  # Google OAuth routes
│   └── dashboard.js             # Admin dashboard routes
├── middleware/
│   └── auth.js                  # Authentication & admin middleware
├── public/
│   ├── css/
│   │   └── styles.css           # Custom styles + Tailwind overrides
│   ├── js/
│   │   ├── form.js              # Multi-step form logic
│   │   ├── timePicker.js        # iPhone-style scroll time picker
│   │   └── dashboard.js         # Dashboard interactivity & charts
│   └── images/                  # Static assets
└── views/
    ├── layouts/
    │   └── main.ejs             # Base layout
    ├── home.ejs                 # Landing page (redirect to main site)
    ├── form.ejs                 # Multi-step form (4 steps + submit)
    ├── auth/
    │   └── login.ejs            # Admin login page
    └── dashboard/
        ├── layout.ejs           # Dashboard layout with sidebar
        ├── overview.ejs         # Stats & charts
        ├── requests.ejs         # Client requests management
        └── team.ejs             # Team management
```

---

## Proposed Changes

### 1. Project Setup & Configuration

#### [NEW] package.json
- Express, Mongoose, Passport, passport-google-oauth20, express-session, connect-mongo, dotenv, ejs

#### [NEW] server.js
- Express app initialization
- Session management with MongoDB store
- Passport initialization
- Route mounting
- Visit tracking middleware (counts page visits)
- Static file serving

#### [NEW] config/db.js
- Mongoose connection to MongoDB Atlas using `MONGO_URL` from `.env`

#### [NEW] config/passport.js
- Google OAuth2 strategy
- Serialize/deserialize user
- Save Google profile (name, email, photo) to `User` model
- Callback URL: `http://localhost:3000/auth/google/callback`

---

### 2. Database Models

#### [NEW] models/Request.js
```
Schema:
- rooms: String (أستوديو / أوضة و صالة / أوضتين و صالة / 3 أوض و صالة)
- name: String (required)
- phone: String (required)
- hasWhatsApp: Boolean (default: true)
- email: String (optional)
- jobTitle: String (optional)
- preferredDay: String (النهارده / بكره)
- preferredTime: String (e.g. "12:00 ظهراً")
- status: String (enum: ['قيد المراجعة', 'اشتري', 'لم يشتري'], default: 'قيد المراجعة')
- createdAt: Date
```

#### [NEW] models/User.js
```
Schema:
- googleId: String
- name: String
- email: String
- photo: String (Google profile photo URL)
- role: String (enum: ['admin', 'member'], default: 'member')
- lastOnline: Date
- isOnline: Boolean
```

#### [NEW] models/Visit.js
```
Schema:
- date: Date (indexed, daily aggregation)
- count: Number
- page: String (which page was visited)
```

---

### 3. User-Facing Pages

#### [NEW] views/home.ejs
- الصفحة الرئيسية - خلفية ذهبية/بني غامق
- نص "لو حابب تدخل علي موقعنا الرئيسي"
- زر "أنتقال للموقع الرئيسي" → يحول لـ https://golfhousedevelopment.com/
- تصميم مطابق للصورة الأولى المرفقة

#### [NEW] views/form.ejs
فورم متعددة الخطوات (single page, 4 steps):

**Step 1 - احتياجات العميل:**
- عنوان "عدد الغرف اللي حضرتك محتاجها؟"
- 4 أزرار ذهبية: أستوديو / أوضة و صالة / أوضتين و صالة / 3 أوض و صالة
- Progress bar بأيقونات (سرير - هاتف - ساعة - ملخص)

**Step 2 - التواصل:**
- أسم حضرتك (required)
- رقم تيليفون للتواصل (required)
- Checkbox "اضغط هنا لو الرقم دا مش عليه واتس اب"
- بريد الكتروني (اختياري)
- مسمي وظيفي (اختياري)

**Step 3 - المعاد المختار:**
- اختيار اليوم: النهارده / بكره (أزرار ذهبية)
- اختيار الساعة: scroll picker style (شبه منبه الايفون)
  - من الساعة 9 صباحاً حتى 10 مساءاً
  - بفاصل 30 دقيقة

**Step 4 - ملخص الطلب:**
- عرض كل البيانات في كروت glassmorphism
- كارت 1: عدد الغرف
- كارت 2: بيانات التواصل (اسم, رقم, بريد, مسمي وظيفي)
- كارت 3: معاد التواصل (اليوم + الساعة)
- زر "إرسال الطلب"

---

### 4. Admin Authentication

#### [NEW] routes/auth.js
- `GET /auth/google` → بدء Google OAuth
- `GET /auth/google/callback` → Callback
- `GET /auth/logout` → تسجيل خروج
- `GET /admin/login` → صفحة تسجيل الدخول

#### [NEW] views/auth/login.ejs
- صفحة تسجيل دخول بتصميم فاخر
- زر "تسجيل الدخول بـ Google"
- فقط الأدمن يقدر يدخل

#### [NEW] middleware/auth.js
- `isAuthenticated` - يتأكد إن المستخدم مسجل دخول
- `isAdmin` - يتأكد إن المستخدم admin
- Admin emails list from `.env`

---

### 5. Admin Dashboard

#### [NEW] views/dashboard/layout.ejs
- Sidebar navigation (لمحة / الطلبات / الإدارة)
- Top bar with user avatar & name
- Dark theme with gold accents
- RTL layout

#### [NEW] views/dashboard/overview.ejs (لمحة)
- 4 stat cards:
  - عدد الزيارات (total visits)
  - عدد الطلبات (total requests)
  - عدد العملاء لم يشتروا
  - عدد العملاء اشتروا
- Chart.js line chart: عدد الزيارات / اليوم (آخر 7 أيام)

#### [NEW] views/dashboard/requests.ejs (الطلبات)
- جدول/كروت لكل الطلبات
- لكل طلب:
  - ملخص البيانات (غرف, اسم, هاتف, بريد, وظيفة, معاد)
  - رقم الهاتف كـ:
    - 📞 زر اتصال → `tel:+20{phone}`
    - 💬 زر واتساب → `https://wa.me/+20{phone}`
  - تغيير الحالة: dropdown (قيد المراجعة / اشتري / لم يشتري)
  - تاريخ الطلب
- فلتر حسب الحالة
- بحث بالاسم أو الرقم

#### [NEW] views/dashboard/team.ejs (الإدارة)
- قائمة أعضاء الفريق
- لكل عضو:
  - صورة من Google
  - الاسم
  - الحالة: 🟢 Online / 🔴 Offline + "آخر ظهور: التاريخ"

---

### 6. API Routes

#### [NEW] routes/api.js
- `POST /api/requests` → حفظ طلب جديد
- `POST /api/visits` → تسجيل زيارة
- `GET /api/requests` → جلب كل الطلبات (admin only)
- `PATCH /api/requests/:id/status` → تحديث حالة طلب (admin only)
- `GET /api/stats` → إحصائيات الداشبورد (admin only)
- `GET /api/visits/chart` → بيانات الشارت (admin only)

---

## User Review Required

> [!IMPORTANT]
> **Google OAuth Callback URL**: هحتاج أضيف `http://localhost:3000/auth/google/callback` في Google Cloud Console كـ Authorized Redirect URI. تأكد إن دا متضاف.

> [!IMPORTANT]
> **Admin Access**: حالياً `seifsameh04@gmail.com` هو الأدمن الوحيد. لو عايز تضيف إيميلات تانية أضفهم في `.env` كـ comma-separated list.

> [!WARNING]
> **اسم المشروع في الفورم**: في الصور مكتوب "Q bay" - هل المشروع اسمه "Q bay" فعلاً ولا عايز اسم تاني يظهر في صفحات الفورم؟

---

## Open Questions

1. **اسم المشروع**: هل اسم المشروع اللي يظهر في الفورم "Q bay" ولا "Golf House Development" ولا اسم تاني؟
2. **صفحات الفورم**: في صفحة "احتياجات العميل" - هل الخيارات ثابتة (أستوديو / أوضة و صالة / أوضتين و صالة / 3 أوض و صالة) ولا عايز تتحكم فيها من الداشبورد؟
3. **رابط الفورم**: إزاي العميل هيوصل لصفحة الفورم؟ عن طريق link مباشر زي `/form/qbay` ولا حاجة تانية؟
4. **Admin Users**: هل تيم الإدارة كلهم بيسجلوا دخول بـ Google ولا فيه حسابات خاصة؟

---

## Verification Plan

### Automated Tests
1. `npm start` - التأكد إن السيرفر شغال
2. فتح `http://localhost:3000` - الصفحة الرئيسية
3. فتح الفورم واختبار كل الخطوات
4. تسجيل دخول بـ Google والدخول للداشبورد
5. التأكد من حفظ الطلبات في MongoDB

### Manual Verification
- اختبار الفورم كامل وإرسال طلب
- مراجعة الداشبورد والتأكد من ظهور الإحصائيات
- اختبار روابط الاتصال والواتساب
- التأكد من التصميم RTL والخط Tajawal
