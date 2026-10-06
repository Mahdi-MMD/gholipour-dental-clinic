export interface TreatmentStage {
  stepNumber: number;
  title: string;
  image: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'composite' | 'implant' | 'orthodontics' | 'endodontics' | 'prosthodontics' | 'pediatric' | 'general';
  categoryLabel: string;
  subCategoryLabel: string;
  tags: string[];
  beforeImg: string;
  afterImg: string;
  description: string;
  duration?: string;
  doctor?: string;
  sessions?: string;
  // Steps/Stages sequence for the "مراحل" view with Fancybox
  stages?: TreatmentStage[];
}

export const DEFAULT_TREATMENT_STAGES: TreatmentStage[] = [
  {
    stepNumber: 1,
    title: 'مرحله ۱: نمای اولیه قبل درمان',
    image: '/assets/gallery/stage-1.webp',
    description: 'معاینه، ثبت تصاویر بالینی اولیه و بررسی میزان پوسیدگی و درگیری بافت دندان قبل از شروع درمان.',
  },
  {
    stepNumber: 2,
    title: 'مرحله ۲: برداشت پوسیدگی',
    image: '/assets/gallery/stage-2.webp',
    description: 'ایزولاسیون کامل با رابردم و کلمپ، تراش و پاکسازی محافظه‌کارانه کلیه بافت‌های پوسیده تا رسیدن به عاج سالم.',
  },
  {
    stepNumber: 3,
    title: 'مرحله ۳: نمای سطح جونده پس از پایان کار',
    image: '/assets/gallery/stage-3.webp',
    description: 'بازسازی و ترمیم کامل کاسپ‌ها و شیارهای آناتومیک سطح جونده دندان با کامپوزیت نانوهیبرید همرنگ.',
  },
  {
    stepNumber: 4,
    title: 'مرحله ۴: نمای سطح رو به رو پس از پایان کار',
    image: '/assets/gallery/stage-4.webp',
    description: 'مشاهده تقارن، فرم آناتومیک طبیعی، انطباق مارجینال و فینیشینگ و پالیش نهایی بدون لبه اضافی.',
  },
];

// 3 pairs from Home page Portfolio (sarvdental31/32, sarvdental35/36, sarvdental33/34), used 3 times each = 9 items
export const GALLERY_ITEMS: GalleryItem[] = [
  // Item 1: لمینت و کامپوزیت (Pair 1, Occ 1)
  {
    id: 'smile-design-1',
    title: 'اصلاح طرح لبخند با کامپوزیت و لمینت',
    category: 'composite',
    categoryLabel: 'لمینت و کامپوزیت',
    subCategoryLabel: 'طراحی لبخند',
    tags: ['لمینت و کامپوزیت', 'لمینت', 'کامپوزیت', 'زیبایی'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg',
    description: 'اصلاح فرم، رنگ و قرینه‌سازی دندان‌های قدامی فک بالا با ونیرهای سرامیکی بدون آسیب به بافت سالم دندان.',
    duration: '۲ جلسه (۲ هفته)',
    doctor: 'دکتر قلی‌پور',
    sessions: '۲ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 2: ایمپلنت (Pair 2, Occ 1)
  {
    id: 'implant-placement-1',
    title: 'کاشت ایمپلنت و بازسازی فک',
    category: 'implant',
    categoryLabel: 'ایمپلنت',
    subCategoryLabel: 'کاشت دندان',
    tags: ['ایمپلنت', 'کاشت دندان'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg',
    description: 'جایگزینی دندان‌های از دست رفته با فیکسچرهای تیتانیومی و روکش‌های زیرکونیا با بازگشت کامل توان جویدن و زیبایی.',
    duration: '۳ ماه دوره استئواینتگریشن',
    doctor: 'دکتر قلی‌پور',
    sessions: '۳ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 3: ترمیم دندان (Pair 3, Occ 1)
  {
    id: 'restoration-composite-1',
    title: 'ترمیم زیبایی و بازسازی ساختار دندان',
    category: 'general',
    categoryLabel: 'ترمیم',
    subCategoryLabel: 'نانوکامپوزیت',
    tags: ['ترمیم', 'پوسیدگی', 'کامپوزیت'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg',
    description: 'برداشت پوسیدگی‌های عمیق و بازسازی آناتومیک شیارها و کاسپ‌های دندان با کامپوزیت نانوهیبرید همرنگ مینا.',
    duration: '۱ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۱ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },

  // Item 4: لمینت و کامپوزیت (Pair 1, Occ 2)
  {
    id: 'smile-design-2',
    title: 'بستن دیاستم با کامپوزیت لایه‌ای',
    category: 'composite',
    categoryLabel: 'لمینت و کامپوزیت',
    subCategoryLabel: 'بستن فاصله',
    tags: ['لمینت و کامپوزیت', 'کامپوزیت', 'ترمیم'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg',
    description: 'بستن فواصل بین‌دندانی قدامی بدون تراش دندان‌ها با کامپوزیت لایه‌بندی نانوهیبرید همرنگ طبیعی دندان.',
    duration: '۱ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۱ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 5: روکش دندان (Pair 2, Occ 2)
  {
    id: 'crown-treatment-1',
    title: 'روکش تمام سرامیک زیرکونیا',
    category: 'prosthodontics',
    categoryLabel: 'روکش',
    subCategoryLabel: 'روکش زیرکونیا',
    tags: ['روکش', 'پروتز ثابت', 'زیرکونیا'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg',
    description: 'محافظت از ساختار تضعیف شده دندان پس از درمان با روکش دیجیتال زیرکونیا با استحکام و زیبایی فوق‌العاده.',
    duration: '۲ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۲ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 6: عصب کشی (Pair 3, Occ 2)
  {
    id: 'endodontic-treatment-1',
    title: 'درمان ریشه تخصصی و عصب‌کشی',
    category: 'endodontics',
    categoryLabel: 'عصب کشی',
    subCategoryLabel: 'درمان ریشه',
    tags: ['عصب کشی', 'عصب‌کشی', 'درمان ریشه', 'اندو'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg',
    description: 'پاکسازی و سیل میکروسکوپی کانال‌های ریشه با سیستم روتاری پیشرفته و رفع کامل درد و عفونت دندانی.',
    duration: '۱ الی ۲ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۱ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },

  // Item 7: دندان مصنوعی (Pair 1, Occ 3)
  {
    id: 'denture-prostho-1',
    title: 'پروتز متحرک و دندان مصنوعی تخصصی',
    category: 'prosthodontics',
    categoryLabel: 'دندان مصنوعی',
    subCategoryLabel: 'پروتز متحرک',
    tags: ['دندان مصنوعی', 'پروتز', 'پروتز متحرک', 'دست دندان'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental31.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental32.jpg',
    description: 'بازسازی کامل قوس فکی با پروتزهای متحرک با لثه ژله‌ای نرم و انطباق بی‌نقص فکی جهت غذا خوردن راحت.',
    duration: '۳ جلسه قالب‌گیری و تحویل',
    doctor: 'دکتر قلی‌پور',
    sessions: '۳ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 8: ایمپلنت (Pair 2, Occ 3)
  {
    id: 'implant-placement-3',
    title: 'ایمپلنت دندان‌های از دست رفته',
    category: 'implant',
    categoryLabel: 'ایمپلنت',
    subCategoryLabel: 'جراحی و کاشت',
    tags: ['ایمپلنت', 'کاشت'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental35.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental36.jpg',
    description: 'کاشت ایمپلنت تخصصی با برند درجه یک بین‌المللی همراه با پیوند استخوان و روکش زیرکونیای متال‌فری.',
    duration: '۳ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۳ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
  // Item 9: ترمیم دندان (Pair 3, Occ 3)
  {
    id: 'decay-filling-3',
    title: 'ترمیم همرنگ و بازسازی دندان خلفی',
    category: 'general',
    categoryLabel: 'ترمیم',
    subCategoryLabel: 'پرکردن دندان',
    tags: ['ترمیم', 'پرکردن', 'پوسیدگی'],
    beforeImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental33.jpg',
    afterImg: 'https://sarvdental.clinic/wp-content/uploads/2025/08/sarvdental34.jpg',
    description: 'تراش حداقل مینا و عاج و بازسازی با کامپوزیت لایه‌بندی شده مقاوم در برابر فشارهای جویدن.',
    duration: '۱ جلسه',
    doctor: 'دکتر قلی‌پور',
    sessions: '۱ جلسه',
    stages: DEFAULT_TREATMENT_STAGES,
  },
];

export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'همه موارد' },
  { id: 'laminate-composite', label: 'لمینت و کامپوزیت', match: ['لمینت و کامپوزیت', 'لمینت', 'کامپوزیت'] },
  { id: 'implant', label: 'ایمپلنت', match: ['ایمپلنت', 'کاشت'] },
  { id: 'restoration', label: 'ترمیم', match: ['ترمیم', 'پوسیدگی', 'پرکردن'] },
  { id: 'crown', label: 'روکش', match: ['روکش'] },
  { id: 'root-canal', label: 'عصب کشی', match: ['عصب کشی', 'عصب‌کشی', 'درمان ریشه', 'اندو'] },
  { id: 'dentures', label: 'دندان مصنوعی', match: ['دندان مصنوعی', 'پروتز متحرک', 'دست دندان', 'پروتز'] },
];
