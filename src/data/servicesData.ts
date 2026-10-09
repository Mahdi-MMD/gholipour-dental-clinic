export interface ServiceJourneyStep {
  stepNumber: string;
  title: string;
  mobileTitle?: string;
  duration: string;
  summary: string;
  details: string[];
  patientComfortTip: string;
}

export interface ServicePainPillar {
  icon: string;
  title: string;
  mobileTitle?: string;
  description: string;
}

export interface ServiceTechFeature {
  icon: string;
  title: string;
  mobileTitle?: string;
  description: string;
  badge: string;
}

export interface ServiceSupportCommitment {
  icon: string;
  title: string;
  mobileTitle?: string;
  description: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export interface ServiceDetailData {
  slug: string;
  serviceKey: string; // Used for booking drawer pre-selection
  title: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  heroBadge: string;
  heroHeadline: string;
  heroHeadlineAccent?: string;
  heroSubheadline: string;
  heroIllustration: string;
  experienceSummary: string;
  painManagementHeadline: string;
  mobilePainManagementHeadline?: string;
  painManagementLead: string;
  mobilePainManagementLead?: string;
  painManagementPillars: ServicePainPillar[];
  diagnosisHeadline: string;
  mobileDiagnosisHeadline?: string;
  diagnosisLead: string;
  mobileDiagnosisLead?: string;
  diagnosisFeatures: ServiceTechFeature[];
  journeyHeadline: string;
  mobileJourneyHeadline?: string;
  journeyLead: string;
  mobileJourneyLead?: string;
  journeySteps: ServiceJourneyStep[];
  supportHeadline: string;
  mobileSupportHeadline?: string;
  supportLead: string;
  mobileSupportLead?: string;
  supportCommitments: ServiceSupportCommitment[];
  qualityStandardTitle: string;
  mobileQualityStandardTitle?: string;
  qualityStandardDesc: string;
  qualityHighlights: string[];
  faqs: ServiceFaqItem[];
  nearbyCitiesServed: string[];
}

export const SERVICES_DATA: Record<string, ServiceDetailData> = {
  implant: {
    slug: 'implant',
    serviceKey: 'ایمپلنت دندان',
    title: 'ایمپلنت دندان',
    seoTitle: 'ایمپلنت دندان در گیلان و رشت | کاشت تخصصی بدون درد با اسکن دیجیتال | کلینیک قلی‌پور',
    seoDescription:
      'کاشت ایمپلنت دندان در کلینیک دندانپزشکی قلی‌پور؛ کنترل کامل درد با بی‌حسی مرحله‌ای، تشخیص ۳ بعدی CBCT، پشتیبانی اختصاصی ۲۴ ساعته و ضمانت کیفیت برندهای برتر سوئیسی و کره‌ای.',
    keywords: [
      'ایمپلنت دندان گیلان',
      'ایمپلنت رشت',
      'کاشت دندان زیباکنار',
      'ایمپلنت بدون درد گیلان',
      'قیمت ایمپلنت دندان رشت',
      'ایمپلنت فوری انزلی',
      'بهترین کلینیک ایمپلنت کیاشهر و لشت نشا',
      'متخصص ایمپلنت کوچصفهان و آستانه',
    ],
    heroBadge: 'کاشت تخصصی ایمپلنت در گیلان',
    heroHeadline: 'کاشت ایمپلنت دندان',
    heroHeadlineAccent: 'با دقت دیجیتال',
    heroSubheadline:
      'طرح درمانی روشن و متناسب با شرایط شما.',
    heroIllustration: '/assets/implant-anatomy-modern.webp',
    experienceSummary:
      'شما شایسته درمانی هستید که در تمام طول آن حس امنیت و آرامش داشته باشید. از لحظه اسکن اولیه تا تحویل روکش نهایی، تمام جزئیات با در نظر گرفتن آسایش بیمار و ماندگاری مادام‌العمر طراحی شده است.',
    painManagementHeadline: 'پروتکل آرامش و مهار درد؛ جراحی آرام و بدون ناراحتی',
    mobilePainManagementHeadline: 'کنترل درد و آرامش شما',
    painManagementLead:
      'بزرگ‌ترین نگرانی مراجعین «درد حین جراحی و تورم پس از آن» است. در کلینیک قلی‌پور این دغدغه را با پروتکل اختصاصی بی‌حسی مرحله‌ای و جراحی ظریف برطرف کرده‌ایم:',
    mobilePainManagementLead:
      'آرامش با بی‌حسی دقیق و مرحله‌ای.',
    painManagementPillars: [
      {
        icon: 'fa-solid fa-syringe',
        title: 'بی‌حسی مرحله‌ای و بدون سوزش',
        mobileTitle: 'بی‌حسی مرحله‌ای',
        description:
          'پیش از تزریق، موضع با ژل بی‌حسی قوی بی‌حس می‌شود تا ورود بی‌حسی کاملاً بدون درد باشد. دوز بی‌حسی با پایش مداوم تنظیم شده و تا پایان کار هیچ دردی حس نمی‌کنید.',
      },
      {
        icon: 'fa-solid fa-feather-pointed',
        title: 'تکنیک جراحی حداقل تهاجم',
        mobileTitle: 'جراحی کم‌تهاجمی',
        description:
          'با پرهیز از برش‌های وسیع لثه و بهره‌گیری از کاشت هدایت‌شده، آسیب به بافت نرم به حداقل می‌رسد. این امر تورم، خونریزی و دوره نقاهت بعد از عمل را تا ۷۰٪ کاهش می‌دهد.',
      },
      {
        icon: 'fa-solid fa-heart-pulse',
        title: 'مدیریت فعال اضطراب دندانپزشکی',
        mobileTitle: 'مدیریت اضطراب',
        description:
          'محیط درمانی کلینیک با موسیقی ملایم و تعامل گام‌به‌گام دندانپزشک همراه است. در هر ثانیه از درمان، در صورت تمایل با یک اشاره کوچک، کار متوقف شده و به شما زمان استراحت داده می‌شود.',
      },
    ],
    diagnosisHeadline: 'تشخیص میلی‌متری با اسکن دیجیتال سه‌بعدی فک',
    mobileDiagnosisHeadline: 'تشخیص دقیق با اسکن دیجیتال',
    diagnosisLead:
      'موفقیت پایدار ایمپلنت به جای‌گذاری دقیق فیکسچر در بهترین زاویه و بیشترین تراکم استخوان وابسته است. ما درمان شما را پیش از آغاز به صورت دیجیتال طراحی می‌کنیم:',
    mobileDiagnosisLead:
      'برنامه‌ریزی دقیق با اسکن سه‌بعدی فک.',
    diagnosisFeatures: [
      {
        icon: 'fa-solid fa-cube',
        badge: '۳D CBCT Analysis',
        title: 'آنالیز عمق و ضخامت استخوان با رادیوگرافی سه‌بعدی',
        mobileTitle: 'بررسی سه‌بعدی فک',
        description:
          'بررسی کامل کانال عصب فک پایین و سینوس فک بالا انجام می‌شود تا احتمال هرگونه عارضه به صفر برسد.',
      },
      {
        icon: 'fa-solid fa-compass-drafting',
        badge: 'Digital Guided Plan',
        title: 'طراحی نقشه کاشت متناسب با فرم دندان‌های طبیعی',
        mobileTitle: 'طراحی دیجیتال کاشت',
        description:
          'انتخاب قطر و طول ایمپلنت بر اساس بار جویدن و زیبایی نهایی لبخند، با تطابق کامل بیومکانیک فک.',
      },
      {
        icon: 'fa-solid fa-bone',
        badge: 'Full Bone Support',
        title: 'ارزیابی نیاز به پیوند استخوان یا لیفت سینوس',
        mobileTitle: 'ارزیابی استخوان فک',
        description:
          'در صورت تحلیل رفتن استخوان، راهکارهای بازسازی استخوان و پودر استخوان درجه‌یک در همان جلسه یا جلسات تکمیلی شفاف‌سازی می‌شود.',
      },
    ],
    journeyHeadline: 'مسیر گام‌به‌گام تجربه درمان شما',
    mobileJourneyHeadline: 'مراحل درمان شما',
    journeyLead:
      'درمان شما دارای برنامه زمانی مشخص، شفاف و بدون غافلگیری مالی یا بالینی خواهد بود:',
    mobileJourneyLead:
      'از مشاوره تا نصب روکش، مرحله‌به‌مرحله.',
    journeySteps: [
      {
        stepNumber: '۰۱',
        title: 'مشاوره اختصاصی، اسکن و برنامه درمان',
        mobileTitle: 'مشاوره و طرح درمان',
        duration: 'جلسه اول (حدود ۳۰ تا ۴۰ دقیقه)',
        summary: 'بررسی تصاویر فک، گفت‌وگوی صمیمانه درباره انتظارات و تعیین شفاف هزینه و برند مناسب.',
        details: [
          'بررسی وضعیت لثه، بهداشت و بیماری‌های زمینه‌ای (مانند قند خون یا فشار)',
          'ارائه طرح درمان مکتوب همراه با برنامه زمان‌بندی',
          'پاسخ به تمام پرسش‌ها و رفع هرگونه ابهام درباره جراحی',
        ],
        patientComfortTip: 'در این جلسه هیچ جراحی انجام نمی‌شود و تنها هدف، آگاهی و تصمیم‌گیری مطمئن شماست.',
      },
      {
        stepNumber: '۰۲',
        title: 'کاشت فیکسچر ایمپلنت در آرامش کامل',
        mobileTitle: 'کاشت ایمپلنت',
        duration: 'جلسه جراحی (۲۰ تا ۳۰ دقیقه برای هر واحد)',
        summary: 'جای‌گذاری ایمپلنت با بی‌حسی کامل موضعی و بدون حس درد یا فشار آزاردهنده.',
        details: [
          'آماده‌سازی استریل کامل محیط و ابزارها مطابق استانداردهای روز',
          'جای‌گذاری آرام پایه تیتانیومی در استخوان فک',
          'بخیه ظریف با نخ‌های غیرتحریک‌کننده در صورت نیاز',
        ],
        patientComfortTip: 'اکثر مراجعین اذعان دارند که کاشت ایمپلنت از کشیدن دندان هم راحت‌تر و سریع‌تر سپری شد.',
      },
      {
        stepNumber: '۰۳',
        title: 'دوره استئواینتگریشن (جوش خوردن ایمپلنت) و مراقبت مداوم',
        mobileTitle: 'ترمیم و پیگیری',
        duration: 'حدود ۶ الی ۱۰ هفته',
        summary: 'فرایند پیوند محکم ایمپلنت با استخوان، با همراهی تلفنی و پیگیری تیم مراقبت کلینیک.',
        details: [
          'تماس پشتیبان کلینیک در روزهای اول برای بررسی حال عمومی',
          'امکان برقراری تماس اورژانسی مستقیم در تمام ساعات در صورت بروز سوال',
          'ویزیت کوتاه پایش جهت اطمینان از سلامت بافت نرم اطراف ایمپلنت',
        ],
        patientComfortTip: 'در صورت نیاز به دندان در ناحیه جلویی، پروتز موقت زیبایی برای حفظ ظاهر لبخند تعبیه می‌شود.',
      },
      {
        stepNumber: '۰۴',
        title: 'قالب‌گیری دیجیتال و نصب روکش تمام‌سرامیک دائمی',
        mobileTitle: 'نصب روکش نهایی',
        duration: 'جلسات نهایی تحویل',
        summary: 'طراحی و ساخت روکش زیرکونیا یا تمام‌سرامیک با هماهنگی دقیق رنگ، فرم و عملکرد طبیعی.',
        details: [
          'قالب‌گیری دقیق فرم لثه و جایگاه فیکسچر',
          'تست فریم، تنظیم بایت (جفت‌شدن دندان‌ها) و درخشش طبیعی',
          'تحویل نهایی، آموزش نخ دندان سوپرفلاس و ثبت پرونده گارانتی',
        ],
        patientComfortTip: 'دندان جدید شما مانند دندان طبیعی‌تان قابلیت جویدن انواع غذاها را با بالاترین استحکام خواهد داشت.',
      },
    ],
    supportHeadline: 'پشتیبانی و همراهی اختصاصی پس از درمان',
    mobileSupportHeadline: 'مراقبت پس از درمان',
    supportLead:
      'در پایان جلسه جراحی، وظیفه ما تمام نمیشود؛ بلکه مراقبت پس از درمان با بالاترین حساسیت آغاز میگردد:',
    mobileSupportLead:
      'پیگیری و مراقبت پس از جراحی.',
    supportCommitments: [
      {
        icon: 'fa-solid fa-headset',
        title: 'خط پیگیری اختصاصی و تماس ۲۴ ساعته',
        mobileTitle: 'پیگیری ۲۴ ساعته',
        description:
          'تیم پشتیبانی کلینیک ۲۴ و ۴۸ ساعت پس از جراحی با شما تماس می‌گیرد و وضعیت بهبود و داروها را بررسی می‌کند. همچنین در صورت بروز هر پرسشی، خط تماس مستقیم در دسترس شماست.',
      },
      {
        icon: 'fa-solid fa-kit-medical',
        title: 'پکیج راهنمای دارویی و مراقبت خانگی',
        mobileTitle: 'راهنمای دارو و مراقبت',
        description:
          'دستورالعمل واضح، گام‌به‌گام و مکتوب شامل زمان‌بندی دقیق مسکن‌ها، دهان‌شویه‌ها و رژیم غذایی مناسب روزهای نخست به شما تحویل داده می‌شود.',
      },
      {
        icon: 'fa-solid fa-shield-halved',
        title: 'چکاپ دوره‌ای رایگان و گارانتی اصالت قطعات',
        mobileTitle: 'چکاپ و ضمانت قطعات',
        description:
          'ویزیت‌های دوره‌ای بررسی سلامت بافت و تمیزی ایمپلنت به صورت منظم انجام شده و اصالت قطعات و فیکسچرهای استاندارد با بارکد رسمی تضمین می‌شود.',
      },
    ],
    qualityStandardTitle: 'استاندارد متریال و برندهای مورد استفاده',
    mobileQualityStandardTitle: 'متریال و برندهای ایمپلنت',
    qualityStandardDesc:
      'ایمپلنت سرمایه‌گذاری برای تمام عمر شماست. به همین دلیل ما صرفاً از فیکسچرهای زیست‌سازگار تیتانیومی دارای تاییدیه‌های بین‌المللی CE اروپا و FDA آمریکا (برندهای نام‌آشنای سوئیسی و کره‌ای) استفاده می‌کنیم که نرخ موفقیت بالای ۹۸٪ را به همراه دارند.',
    qualityHighlights: [
      'فیکسچرهای با تکنولوژی سطحی SLA جهت تسریع جوش خوردن به استخوان',
      'روکش‌های مقاوم زیرکونیا بدون لبه تیره فلزی و با نهایت شفافیت طبیعی',
      'استفاده از کیت‌های جراحی یک‌بارمصرف و پک‌های استریل استاندارد بیمارستانی',
      'امکان پرداخت مرحله‌ای و شرایط منعطف متناسب با مراحل درمان',
    ],
    faqs: [
      {
        question: 'آیا کاشت ایمپلنت درد دارد؟',
        answer:
          'خیر؛ به لطف بی‌حسی‌های موضعی مدرن و ژل‌های پیش‌بی‌حسی، حین کار بیمار هیچ دردی حس نمی‌کند. بعد از پایان کار نیز با مصرف یک مسکن ساده تجویز شده، ناراحتی بسیار جزئی بوده و اغلب مراجعین آن را به مراتب راحت‌تر از کشیدن دندان توصیف می‌کنند.',
      },
      {
        question: 'اگر پوکی استخوان یا دیابت داشته باشم، می‌توانم ایمپلنت بکارم؟',
        answer:
          'بله، داشتن دیابت کنترل‌شده (با شاخص HbA1c استاندارد) یا پوکی استخوان مانع انجام ایمپلنت نیست. در جلسه معاینه شرایط بالینی و آزمایشگاهی شما با دقت سنجیده شده و در صورت لزوم با روش‌های تکمیلی و پیوند استخوان، جراحی ایمن انجام می‌شود.',
      },
      {
        question: 'دوره نقاهت چقدر است و چه زمانی می‌توانم به فعالیت روزمره برگردم؟',
        answer:
          'به دلیل بهره‌گیری از تکنیک جراحی کم‌تهاجم، بیشتر مراجعین از فردای روز عمل می‌توانند به محل کار و فعالیت‌های روزمره بازگردند. تنها لازم است از فعالیت‌های ورزشی سنگین در ۲ تا ۳ روز نخست پرهیز شود.',
      },
      {
        question: 'طول عمر دندان ایمپلنت شده چقدر است؟',
        answer:
          'ایمپلنت‌های استاندارد در صورت رعایت بهداشت دهان (مسواک، نخ دندان و چکاپ‌های دوره‌ای سالانه) راه‌حلی مادام‌العمر برای جایگزینی دندان از دست رفته هستند.',
      },
      {
        question: 'هزینه ایمپلنت چگونه محاسبه می‌شود و آیا امکان پرداخت مرحله‌ای وجود دارد؟',
        answer:
          'هزینه بر اساس برند انتخابی و نیاز احتمالی به پیوند استخوان یا لیفت سینوس تعیین می‌شود. پرداخت هزینه‌ها در کلینیک قلی‌پور به صورت مرحله‌ای (بخشی در زمان جراحی و مابقی در زمان قالب‌گیری و تحویل روکش) انجام می‌گیرد تا مراجعین بدون دغدغه مالی درمان خود را تکمیل کنند.',
      },
    ],
    // Hidden semantic SEO entities (not blatantly printed in UI, injected into Schema JSON-LD)
    nearbyCitiesServed: [
      'زیباکنار',
      'رشت',
      'کیاشهر',
      'لشت نشا',
      'کوچصفهان',
      'انزلی',
      'خشکبیجار',
      'آستانه اشرفیه',
      'لاهیجان',
      'استان گیلان',
    ],
  },
};
