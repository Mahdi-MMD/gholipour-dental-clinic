export interface TreatmentStage {
  stepNumber: number;
  title: string;
  image: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category:
    | 'all'
    | 'composite'
    | 'implant'
    | 'orthodontics'
    | 'endodontics'
    | 'prosthodontics'
    | 'pediatric'
    | 'general'
    | 'laminate-composite'
    | 'restoration'
    | 'crown'
    | 'root-canal'
    | 'dentures'
    | (string & {});
  categoryLabel: string;
  subCategoryLabel: string;
  tags: string[];
  beforeImg?: string;
  afterImg?: string;
  description: string;
  duration?: string;
  doctor?: string;
  sessions?: string;
  date?: string;
  // Type: before-after or work flow / stages
  type?: 'before-after' | 'stages';
  // Steps/Stages sequence for the "مراحل" view with Fancybox
  stages?: TreatmentStage[];
}

/**
 * Maximum character and word limits for Gallery Item titles
 * to ensure titles fit perfectly in 2-column mobile layouts on a single line
 * without overflowing or wrapping awkwardly.
 */
export const GALLERY_TITLE_MAX_CHARS = 32;
export const GALLERY_TITLE_MAX_WORDS = 5;

export const DEFAULT_TREATMENT_STAGES: TreatmentStage[] = [
  {
    stepNumber: 1,
    title: 'مرحله ۱: نمای اولیه قبل درمان',
    image: '/assets/gallery/stage-1.webp',
    description:
      'معاینه، ثبت تصاویر بالینی اولیه و بررسی میزان پوسیدگی و درگیری بافت دندان قبل از شروع درمان.',
  },
  {
    stepNumber: 2,
    title: 'مرحله ۲: برداشت پوسیدگی',
    image: '/assets/gallery/stage-2.webp',
    description:
      'ایزولاسیون کامل با رابردم و کلمپ، تراش و پاکسازی محافظه‌کارانه کلیه بافت‌های پوسیده تا رسیدن به عاج سالم.',
  },
  {
    stepNumber: 3,
    title: 'مرحله ۳: نمای سطح جونده پس از پایان کار',
    image: '/assets/gallery/stage-3.webp',
    description:
      'بازسازی و ترمیم کامل کاسپ‌ها و شیارهای آناتومیک سطح جونده دندان با کامپوزیت نانوهیبرید همرنگ.',
  },
  {
    stepNumber: 4,
    title: 'مرحله ۴: نمای سطح رو به رو پس از پایان کار',
    image: '/assets/gallery/stage-4.webp',
    description:
      'مشاهده تقارن، فرم آناتومیک طبیعی، انطباق مارجینال و فینیشینگ و پالیش نهایی بدون لبه اضافی.',
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    "id": "smile-design-1",
    "title": "اصلاح طرح لبخند با کامپوزیت و لمینت",
    "category": "composite",
    "categoryLabel": "لمینت و کامپوزیت",
    "subCategoryLabel": "طراحی لبخند",
    "tags": [
      "لمینت و کامپوزیت",
      "لمینت",
      "کامپوزیت",
      "زیبایی"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg",
    "description": "اصلاح فرم، رنگ و قرینه‌سازی دندان‌های قدامی فک بالا با ونیرهای سرامیکی بدون آسیب به بافت سالم دندان.",
    "duration": "۲ جلسه (۲ هفته)",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۲ جلسه",
    "date": "۱۴۰۳/۰۸/۱۵",
    "type": "before-after"
  },
  {
    "id": "implant-placement-1",
    "title": "کاشت ایمپلنت و بازسازی فک",
    "category": "implant",
    "categoryLabel": "ایمپلنت",
    "subCategoryLabel": "کاشت دندان",
    "tags": [
      "ایمپلنت",
      "کاشت دندان"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg",
    "description": "جایگزینی دندان‌های از دست رفته با فیکسچرهای تیتانیومی و روکش‌های زیرکونیا با بازگشت کامل توان جویدن و زیبایی.",
    "duration": "۳ ماه دوره استئواینتگریشن",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۳ جلسه",
    "date": "۱۴۰۳/۰۸/۱۰",
    "type": "before-after"
  },
  {
    "id": "restoration-composite-1",
    "title": "ترمیم زیبایی و بازسازی ساختار دندان",
    "category": "general",
    "categoryLabel": "ترمیم",
    "subCategoryLabel": "نانوکامپوزیت",
    "tags": [
      "ترمیم",
      "پوسیدگی",
      "پرکردن"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg",
    "description": "برداشت پوسیدگی‌های عمیق و بازسازی آناتومیک شیارها و کاسپ‌های دندان با کامپوزیت نانوهیبرید همرنگ مینا.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۸/۰۴",
    "type": "before-after"
  },
  {
    "id": "smile-design-2",
    "title": "بستن دیاستم با کامپوزیت لایه‌ای",
    "category": "composite",
    "categoryLabel": "لمینت و کامپوزیت",
    "subCategoryLabel": "بستن فاصله",
    "tags": [
      "لمینت و کامپوزیت",
      "کامپوزیت",
      "ونیر"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg",
    "description": "بستن فواصل بین‌دندانی قدامی بدون تراش دندان‌ها با کامپوزیت لایه‌بندی نانوهیبرید همرنگ طبیعی دندان.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۷/۲۸",
    "type": "before-after"
  },
  {
    "id": "crown-treatment-1",
    "title": "روکش تمام سرامیک زیرکونیا",
    "category": "prosthodontics",
    "categoryLabel": "روکش",
    "subCategoryLabel": "روکش زیرکونیا",
    "tags": [
      "روکش",
      "پروتز ثابت",
      "زیرکونیا"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg",
    "description": "محافظت از ساختار تضعیف شده دندان پس از درمان با روکش دیجیتال زیرکونیا با استحکام و زیبایی فوق‌العاده.",
    "duration": "۲ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۲ جلسه",
    "date": "۱۴۰۳/۰۷/۱۶",
    "type": "before-after"
  },
  {
    "id": "endodontic-treatment-1",
    "title": "درمان ریشه تخصصی و عصب‌کشی",
    "category": "endodontics",
    "categoryLabel": "عصب کشی",
    "subCategoryLabel": "درمان ریشه",
    "tags": [
      "عصب کشی",
      "عصب‌کشی",
      "درمان ریشه",
      "اندو"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg",
    "description": "پاکسازی و سیل میکروسکوپی کانال‌های ریشه با سیستم روتاری پیشرفته و رفع کامل درد و عفونت دندانی.",
    "duration": "۱ الی ۲ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۶/۲۹",
    "type": "before-after"
  },
  {
    "id": "denture-prostho-1",
    "title": "پروتز متحرک و دندان مصنوعی تخصصی",
    "category": "prosthodontics",
    "categoryLabel": "دندان مصنوعی",
    "subCategoryLabel": "پروتز متحرک",
    "tags": [
      "دندان مصنوعی",
      "پروتز",
      "پروتز متحرک",
      "دست دندان"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg",
    "description": "بازسازی کامل قوس فکی با پروتزهای متحرک با لثه ژله‌ای نرم و انطباق بی‌نقص فکی جهت غذا خوردن راحت.",
    "duration": "۳ جلسه قالب‌گیری و تحویل",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۳ جلسه",
    "date": "۱۴۰۳/۰۶/۱۰",
    "type": "before-after"
  },
  {
    "id": "implant-placement-3",
    "title": "ایمپلنت دندان‌های از دست رفته",
    "category": "implant",
    "categoryLabel": "ایمپلنت",
    "subCategoryLabel": "جراحی و کاشت",
    "tags": [
      "ایمپلنت",
      "کاشت"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg",
    "description": "کاشت ایمپلنت تخصصی با برند درجه یک بین‌المللی همراه با پیوند استخوان و روکش زیرکونیای متال‌فری.",
    "duration": "۳ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۳ جلسه",
    "date": "۱۴۰۳/۰۵/۲۴",
    "type": "before-after"
  },
  {
    "id": "decay-filling-3",
    "title": "ترمیم همرنگ و بازسازی دندان خلفی",
    "category": "general",
    "categoryLabel": "ترمیم",
    "subCategoryLabel": "پرکردن دندان",
    "tags": [
      "ترمیم",
      "پرکردن",
      "پوسیدگی"
    ],
    "beforeImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg",
    "afterImg": "https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg",
    "description": "تراش حداقل مینا و عاج و بازسازی با کامپوزیت لایه‌بندی شده مقاوم در برابر فشارهای جویدن.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۵/۰۲",
    "type": "before-after"
  },
  {
    "id": "workflow-implant-surgery-1",
    "title": "مراحل جراحی و کاشت فیکسچر ایمپلنت",
    "category": "implant",
    "categoryLabel": "ایمپلنت",
    "subCategoryLabel": "جراحی فیکسچر",
    "tags": [
      "ایمپلنت",
      "جراحی",
      "کاشت دندان",
      "مراحل"
    ],
    "description": "فرآیند گام‌به‌گام جراحی قراردهی فیکسچر تیتانیومی در استخوان فک، پیوند استخوان موضعی و هیلینگ کپ.",
    "duration": "۳ الی ۴ ماه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۳ جلسه",
    "date": "۱۴۰۳/۰۸/۱۲",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: بررسی رادیوگرافی CBCT و ارزیابی تراکم استخوان",
        "image": "/assets/gallery/stage-1.webp",
        "description": "بررسی دقیق ضخامت و ارتفاع استخوان فک بیمار با اسکن سه‌بعدی پیش از آغاز جراحی."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: برش لثه و دریلینگ دقیق محل کاشت",
        "image": "/assets/gallery/stage-2.webp",
        "description": "ایجاد فلپ محافظه‌کارانه و ایجاد بستر استخوانی منطبق بر قطر فیکسچر انتخابی با سرجیکال گاید."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: جاگذاری فیکسچر و پیچ درپوش (Cover Screw)",
        "image": "/assets/gallery/stage-3.webp",
        "description": "قراردادن فیکسچر تیتانیومی با تورک استاندارد در بستر استخوانی و بخیه دقیق بافت لثه."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: نصب هیلینگ اباتمنت و قالب‌گیری دیجیتال",
        "image": "/assets/gallery/stage-4.webp",
        "description": "پس از استئواینتگریشن کامل استخوان، هیلینگ اباتمنت جهت فرم‌دهی لثه بسته شده و آماده روکش نهایی می‌شود."
      }
    ]
  },
  {
    "id": "workflow-composite-veneer-1",
    "title": "مراحل لایه‌گذاری ونیر کامپوزیت قدامی",
    "category": "composite",
    "categoryLabel": "لمینت و کامپوزیت",
    "subCategoryLabel": "ونیر لایه‌ای",
    "tags": [
      "لمینت و کامپوزیت",
      "کامپوزیت",
      "زیبایی",
      "مراحل"
    ],
    "description": "مراحل فرم‌دهی و هنر لایه‌گذاری رنگ‌های عاجی و ترنسلوسنت کامپوزیت نانوهیبرید روی دندان قدامی.",
    "duration": "۱ جلسه (۳ ساعت)",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۸/۰۸",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: ایزولاسیون با رابردم و اچینگ مینای دندان",
        "image": "/assets/gallery/stage-1.webp",
        "description": "ایزوله کامل دندان‌ها در برابر رطوبت و آماده‌سازی سطح مینا با اسید اچ جهت پیوند مستحکم باندینگ."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: اعمال باندینگ نسل پنجم و لایه‌گذاری عاجی (Dentin)",
        "image": "/assets/gallery/stage-2.webp",
        "description": "کیور باندینگ و استفاده از شید تیره و اپک عاجی جهت پوشش تغییر رنگ زمینه دندان."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: ساخت لبه انسیزال با کامپوزیت ترنسلوسنت",
        "image": "/assets/gallery/stage-3.webp",
        "description": "شبیه‌سازی خاصیت اپالسنس طبیعی لبه‌های برنده دندان مشابه دندان طبیعی."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: کانتورینگ، فینیشینگ و پالیش چندمرحله‌ای",
        "image": "/assets/gallery/stage-4.webp",
        "description": "ایجاد بافت ماکرو و میکروتکستچر سطحی با دیسک‌های پولیش و خمیر الماسه جهت درخشش ماندگار."
      }
    ]
  },
  {
    "id": "workflow-root-canal-1",
    "title": "مراحل عصب‌کشی و درمان کانال ریشه",
    "category": "endodontics",
    "categoryLabel": "عصب کشی",
    "subCategoryLabel": "اندودانتیکس",
    "tags": [
      "عصب کشی",
      "درمان ریشه",
      "اندو",
      "مراحل"
    ],
    "description": "مراحل تخصصی دسترسی به پالپ، پاکسازی بیومکانیکال کانال با فایل روتاری و آبچوریشن سه‌بعدی.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۷/۲۵",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: حفره دسترسی و نمای عصب عفونی",
        "image": "/assets/gallery/stage-1.webp",
        "description": "تراش سقف اتاقک پالپ و یافتن مدخل ورودی کلیه کانال‌های اصلی و فرعی دندان."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: تعیین طول کارکرد با اپکس لوکیتور و فایل روتاری",
        "image": "/assets/gallery/stage-2.webp",
        "description": "اندازه‌گیری دقیق طول ریشه با دستگاه دیجیتال و شکل‌دهی کانال‌ها با فایل‌های نیکل‌تیتانیوم منعطف."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: شستشوی ضدعفونی‌کننده هیپوکلریت و التراسونیک",
        "image": "/assets/gallery/stage-3.webp",
        "description": "فعال‌سازی مایع شستشو با امواج التراسونیک جهت از بین بردن ۱۰۰٪ باکتری‌های پنهان در کانال."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: پرکردن سیلندری کانال با گوتاپرکا و سیلر",
        "image": "/assets/gallery/stage-4.webp",
        "description": "مهر و موم بیوکامپتیبل و غیرقابل نفوذ کلیه فضاهای ریشه جهت جلوگیری از عود مجدد عفونت."
      }
    ]
  },
  {
    "id": "workflow-zirconia-crown-1",
    "title": "مراحل تراش و تحویل روکش زیرکونیا",
    "category": "prosthodontics",
    "categoryLabel": "روکش",
    "subCategoryLabel": "پروتز ثابت",
    "tags": [
      "روکش",
      "زیرکونیا",
      "پروتز",
      "مراحل"
    ],
    "description": "جریان کار تراش مارجینال دندان تضعیف‌شده، اسکن نوری دیجیتال و چسباندن روکش زیرکونیای فول‌کانتور.",
    "duration": "۲ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۲ جلسه",
    "date": "۱۴۰۳/۰۷/۲۰",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: بازسازی بیلداپ دندان و تراش چمفر دقیق",
        "image": "/assets/gallery/stage-1.webp",
        "description": "تقویت هسته دندان با پست فایبر و کامپوزیت و تراش زاویه‌دار خط خاتمه تراش بدون لبه تیز."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: نخ‌گذاری لثه و اسکن دیجیتال سه‌بعدی",
        "image": "/assets/gallery/stage-2.webp",
        "description": "رتراکشن بافت لثه با نخ مخصوص جهت ثبت میکرونی خط لبه و ارسال مدل به نرم‌افزار CAD/CAM."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: تراش بلوک زیرکونیا با دستگاه میلونگ و رنگ‌آمیزی",
        "image": "/assets/gallery/stage-3.webp",
        "description": "تراش روباتیک روکش با دقت میکرومتری، رنگ‌آمیزی شیارها و پخت در کوره سینترینگ با دمای ۱۵۰۰ درجه."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: تست فیتینگ بالینی و سمان کردن با رزین لوتینگ",
        "image": "/assets/gallery/stage-4.webp",
        "description": "بررسی انطباق مارجینال و اکلوژن دندان و سمان کردن دائمی روکش با مقاومت فوق‌العاده."
      }
    ]
  },
  {
    "id": "workflow-ceramic-laminate-1",
    "title": "مراحل ساخت و باندینگ لمینت سرامیکی Emax",
    "category": "composite",
    "categoryLabel": "لمینت و کامپوزیت",
    "subCategoryLabel": "لمینت سرامیکی",
    "tags": [
      "لمینت و کامپوزیت",
      "لمینت",
      "سرامیک",
      "مراحل"
    ],
    "description": "فرآیند خلق لبخند با ونیرهای سرامیکی ایماکس از ماک‌آپ تشخیصی تا باندینگ اختصاصی نهایی.",
    "duration": "۲ جلسه (۱۰ روز)",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۲ جلسه",
    "date": "۱۴۰۳/۰۷/۰۵",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: ماک‌آپ داخل دهانی و تست طرح لبخند",
        "image": "/assets/gallery/stage-1.webp",
        "description": "تست فرم و طول دندان‌ها در دهان بیمار قبل از هرگونه تراش با رزین موقت جهت تایید نهایی زیبایی."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: حداقل تراش در حد مینا (Micro-Preparation)",
        "image": "/assets/gallery/stage-2.webp",
        "description": "تراش بسیار ظریف ۰.۳ تا ۰.۵ میلی‌متری فقط در لایه مینا بدون آسیب به حس زنده دندان."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: آماده‌سازی سرامیک با اسید هیدروفلوئوریک و سایلن",
        "image": "/assets/gallery/stage-3.webp",
        "description": "اچ کردن سطح داخلی لمینت و فعال‌سازی مولکولی با ماده سایلن جهت پیوند شیمیایی قوی."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: لایت کیور با سمان رزینی لایت‌کیور و پاکسازی حاشیه‌ها",
        "image": "/assets/gallery/stage-4.webp",
        "description": "چسباندن هر لمینت با سمان همرنگ دندان و برداشت دقیق اضافات سیمان در زیر رابردم."
      }
    ]
  },
  {
    "id": "workflow-deep-decay-restoration-1",
    "title": "مراحل ترمیم کامپوزیت بیلدآپ دندان پوسیده",
    "category": "general",
    "categoryLabel": "ترمیم",
    "subCategoryLabel": "ترمیم عمیق",
    "tags": [
      "ترمیم",
      "پوسیدگی",
      "پرکردن",
      "مراحل"
    ],
    "description": "پاکسازی ایمن پوسیدگی عمیق مجاور پالپ، کف‌بندی بیولوژیک و بازسازی کاسپ‌های جونده.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۶/۲۱",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: ایزولاسیون کامل با رابردم و حذف دیواره‌های شکننده",
        "image": "/assets/gallery/stage-1.webp",
        "description": "تراش با فرز سرامیکی و سرعت کنترل‌شده جهت محافظت از سلامت عصب دندان."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: دتکتور پوسیدگی و تست تمیزی عاج",
        "image": "/assets/gallery/stage-2.webp",
        "description": "استفاده از رنگ دتکتور پوسیدگی برای اطمینان از پاکسازی کامل میکروب‌ها از کف دندان."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: کف‌بندی بیوسرامیکی با TheraCal جهت تحریک ترمیم عصب",
        "image": "/assets/gallery/stage-3.webp",
        "description": "عایق‌بندی حرارتی و شیمیایی پالپ با لاینر بیواکتیو حاوی سیلیکات کلسیم."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: لایه‌گذاری آناتومیک کاسپ به کاسپ و رنگ‌آمیزی شیارها",
        "image": "/assets/gallery/stage-4.webp",
        "description": "فرم‌دهی شیارهای طبیعی سطح جونده و رنگ‌آمیزی با تینت براون جهت حداکثر طبیعی بودن."
      }
    ]
  },
  {
    "id": "workflow-denture-framework-1",
    "title": "مراحل ساخت پروتز متحرک پارسیل کروم کبالت",
    "category": "prosthodontics",
    "categoryLabel": "دندان مصنوعی",
    "subCategoryLabel": "پروتز متحرک",
    "tags": [
      "دندان مصنوعی",
      "پروتز متحرک",
      "پروتز",
      "مراحل"
    ],
    "description": "مراحل قالب‌گیری اختصاصی، کستینگ فریم فلزی سبک و چینش دندان‌های باکیفیت آکریلی.",
    "duration": "۴ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۴ جلسه",
    "date": "۱۴۰۳/۰۶/۰۵",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: قالب‌گیری اولیه با آلژینات و ساخت تری اختصاصی",
        "image": "/assets/gallery/stage-1.webp",
        "description": "ثبت کلی فرم بافت‌های دهان و تحلیل لثه‌ها جهت طراحی تری اختصاصی انفرادی."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: بوردرمولدینگ و قالب‌گیری ثانویه با پلی‌اتر",
        "image": "/assets/gallery/stage-2.webp",
        "description": "ثبت دقیق حرکات عضلات گونه و لب برای رسیدن به بالاترین گیر و پایداری دست دندان."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: امتحان فریم فلزی و ثبت اکلوژن بایت بیمار",
        "image": "/assets/gallery/stage-3.webp",
        "description": "بررسی نشست دقیق کست کبالت روی دندان‌های پایه و تنظیم ارتفاع صحیح جویدن."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: چیدن دندان‌های قدامی و خلفی و مفصل‌بندی نهایی",
        "image": "/assets/gallery/stage-4.webp",
        "description": "تطابق رنگ با پوست و سن بیمار، ایجاد فرم لثه طبیعی و تحویل نهایی همراه با آموزش نگهداری."
      }
    ]
  },
  {
    "id": "workflow-implant-all-on-4",
    "title": "مراحل درمان بازسازی کامل فک با پروتز هیبرید",
    "category": "implant",
    "categoryLabel": "ایمپلنت",
    "subCategoryLabel": "ایمپلنت تمام فک",
    "tags": [
      "ایمپلنت",
      "کاشت دندان",
      "جراحی",
      "مراحل"
    ],
    "description": "فرآیند کاشت استراتژیک چند فیکسچر ایمپلنت، مولتی‌یونیت اباتمنت و بار تیتانیومی روکش متصل.",
    "duration": "۴ ماه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۴ جلسه",
    "date": "۱۴۰۳/۰۵/۲۸",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: جراحی کاشت ایمپلنت‌های زاویه‌دار خلفی و قدامی",
        "image": "/assets/gallery/stage-1.webp",
        "description": "قرار دادن ایمپلنت‌ها با زوایای بهینه جهت استفاده از حداکثر تراکم استخوان بدون نیاز به پیوند سنگین."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: نصب اباتمنت‌های زاویه‌دار مولتی‌یونیت (Multi-Unit)",
        "image": "/assets/gallery/stage-2.webp",
        "description": "اصلاح زاویه ایمپلنت‌ها و یکدست کردن خط نشست پروتز پیچی بالای لثه."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: تحویل پروتز موقت پیچ‌شونده در روز جراحی",
        "image": "/assets/gallery/stage-3.webp",
        "description": "بازگرداندن فوری زیبایی و توان تکلم بیمار در همان جلسه جراحی با بار موقت سبک."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: ساخت پروتز نهایی مونوکست زیرکونیا بر روی بار تیتانیوم",
        "image": "/assets/gallery/stage-4.webp",
        "description": "پیچ شدن محکم پروتز دائم بدون لقی با زیبایی فوق‌العاده و توانایی جویدن انواع غذاها."
      }
    ]
  },
  {
    "id": "workflow-composite-diastema-closure",
    "title": "مراحل بستن فاصله بین‌دندانی (دیاستم)",
    "category": "composite",
    "categoryLabel": "لمینت و کامپوزیت",
    "subCategoryLabel": "بستن فاصله",
    "tags": [
      "لمینت و کامپوزیت",
      "کامپوزیت",
      "بستن دیاستم",
      "مراحل"
    ],
    "description": "تکنیک گام‌به‌گام بستن فواصل میدلاین دندان‌های قدامی بدون تراش با کامپوزیت لایه‌ای.",
    "duration": "۱ جلسه",
    "doctor": "کلینیک دندانپزشکی قلی‌پور",
    "sessions": "۱ جلسه",
    "date": "۱۴۰۳/۰۵/۱۰",
    "type": "stages",
    "stages": [
      {
        "stepNumber": 1,
        "title": "مرحله ۱: اندازه‌گیری فواصل با پروب و تعیین نسبت طلایی عرض دندان",
        "image": "/assets/gallery/stage-1.webp",
        "description": "محاسبه میلیمتر به میلیمتر فواصل برای حفظ تقارن دوطرفه و تراز خط وسط دندان‌ها با بینی و لب."
      },
      {
        "stepNumber": 2,
        "title": "مرحله ۲: جایگذاری ماتریکس‌های پلاستیکی و کانتورینگ ژنژوال",
        "image": "/assets/gallery/stage-2.webp",
        "description": "ایجاد انحنای خروجی اضلاع بین‌دندانی تا لثه پر شود و مثلث سیاه (Black Triangle) ایجاد نشود."
      },
      {
        "stepNumber": 3,
        "title": "مرحله ۳: تزریق کامپوزیت میکروهیبرید و کیورینگ لایه‌به‌لایه",
        "image": "/assets/gallery/stage-3.webp",
        "description": "فرم‌دهی با قلم‌های باریک قلم‌مو و کیور با نور LED پرقدرت بدون کوچک‌ترین حباب هوا."
      },
      {
        "stepNumber": 4,
        "title": "مرحله ۴: پرداخت بین دندانی با نوارهای سمباده‌ای و تست نخ دندان",
        "image": "/assets/gallery/stage-4.webp",
        "description": "صاف کردن کامل خط اتصال دندان و کامپوزیت جهت عبور روان نخ دندان و جلوگیری از گیر غذایی."
      }
    ]
  }
];

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'همه موارد' },
  {
    id: 'laminate-composite',
    label: 'لمینت و کامپوزیت',
    match: ['لمینت و کامپوزیت', 'کامپوزیت و لمینت', 'لمینت', 'ونیر'],
  },
  { id: 'implant', label: 'ایمپلنت', match: ['ایمپلنت', 'کاشت'] },
  { id: 'restoration', label: 'ترمیم', match: ['ترمیم', 'پوسیدگی', 'پرکردن'] },
  { id: 'crown', label: 'روکش', match: ['روکش'] },
  { id: 'root-canal', label: 'عصب کشی', match: ['عصب کشی', 'عصب‌کشی', 'درمان ریشه', 'اندو'] },
  {
    id: 'dentures',
    label: 'دندان مصنوعی',
    match: ['دندان مصنوعی', 'پروتز متحرک', 'دست دندان', 'پروتز'],
  },
];

export function isGalleryItemMatchingCategory(
  item: GalleryItem,
  categoryId: string
): boolean {
  if (categoryId === 'all') return true;
  const catObj = GALLERY_CATEGORIES.find(c => c.id === categoryId);
  if (!catObj) return true;

  const norm = (s: string) => (s || '').replace(/[\u200c\s]/g, '');
  const itemCatNorm = norm(item.categoryLabel);
  const targetLabelNorm = norm(catObj.label);

  if (itemCatNorm === targetLabelNorm) return true;
  if (item.category === catObj.id) return true;
  if (categoryId === 'laminate-composite' && item.category === 'composite') return true;
  if (categoryId === 'restoration' && (item.category === 'general' || item.category === 'restoration')) return true;
  if (categoryId === 'root-canal' && item.category === 'endodontics') return true;
  if (categoryId === 'crown' && item.category === 'prosthodontics' && item.categoryLabel === 'روکش') return true;
  if (categoryId === 'dentures' && item.category === 'prosthodontics' && item.categoryLabel === 'دندان مصنوعی') return true;

  if (catObj.match && catObj.match.some(m => norm(m) === itemCatNorm)) return true;
  return false;
}

