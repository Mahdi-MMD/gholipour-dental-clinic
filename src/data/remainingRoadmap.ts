import fs from 'fs';
import path from 'path';

export interface TopicItem {
  id: string;
  groupNumber: number;
  groupTitle: string;
  topicTitle: string;
  topicSummary: string;
  suggestedSlug: string;
}

export const REMAINING_ARTICLE_ROADMAP: TopicItem[] = [
  // Group 7: ایمپلنت‌های دندانی و جراحی‌های پیش‌پروتزی (Articles 34–37)
  {
    id: '34',
    groupNumber: 7,
    groupTitle: 'ایمپلنت‌های دندانی و جراحی‌های پیش‌پروتزی',
    topicTitle:
      'جراحی‌های بازسازی استخوان و بافت: پیوند استخوان، پیوند لثه و سینوس لیفت باز و بسته',
    topicSummary:
      'بازسازی نقایص استخوانی فک، انواع پودر استخوان (آلوگرافت و زنوگرافت)، جراحی سینوس لیفت فک بالا و افزایش ضخامت بافت کراتینیزه',
    suggestedSlug: 'bone-grafting-sinus-lift-gum-graft-for-implants',
  },
  {
    id: '35',
    groupNumber: 7,
    groupTitle: 'ایمپلنت‌های دندانی و جراحی‌های پیش‌پروتزی',
    topicTitle:
      'تکنیک‌های نوین کاشت ایمپلنت: اسکن دیجیتال سه بعدی (CBCT)، ایمپلنت فوری (Immediate) و راهنمای جراحی دیجیتال',
    topicSummary:
      'بررسی کاشت هم‌زمان ایمپلنت در روز کشیدن، روکش موقت فوری، راهنمای جراحی دیجیتال (Surgical Guide) و مقایسه با روش سنتی',
    suggestedSlug: 'immediate-dental-implants-cbct-digital-guided-surgery',
  },
  {
    id: '36',
    groupNumber: 7,
    groupTitle: 'ایمپلنت‌های دندانی و جراحی‌های پیش‌پروتزی',
    topicTitle:
      'نگهداری، بهداشت و پیشگیری از عفونت بافت اطراف ایمپلنت: پیشگیری از پری‌موکوزایتیس و پری‌ایمپلنتایتیس',
    topicSummary:
      'تفاوت‌های بیولوژیک ایمپلنت با دندان طبیعی، علائم التهاب بافت نرم، مسواک‌های بین دندانی ویژه، واترپیک و جرم‌گیری دوره‌ای تخصصی',
    suggestedSlug: 'dental-implant-care-hygiene-peri-implantitis-prevention',
  },
  {
    id: '37',
    groupNumber: 7,
    groupTitle: 'ایمپلنت‌های دندانی و جراحی‌های پیش‌پروتزی',
    topicTitle:
      'جراحی افزایش طول تاج دندان (Crown Lengthening): اهداف بیولوژیک، نحوه انجام و بازسازی دندان‌های شکسته',
    topicSummary:
      'رعایت پهنای بیولوژیک (Biological Width)، کاربرد در دندان‌های شکسته زیر لثه، لبخند لثه‌ای (Gummy Smile) و پیش‌نیاز روکش',
    suggestedSlug: 'crown-lengthening-surgery-biological-width-indications',
  },

  // Group 8: دندانپزشکی ترمیمی و زیبایی (Articles 38–41)
  {
    id: '38',
    groupNumber: 8,
    groupTitle: 'دندانپزشکی ترمیمی و زیبایی',
    topicTitle:
      'مقایسه جامع کامپوزیت ونیر و لامینیت سرامیکی: مراحل، میزان تراش، ماندگاری، هزینه و زیبایی لبخند',
    topicSummary:
      'مقایسه علمی و بالینی ونیر سرامیکی پرسلن با کامپوزیت مستقیم، تراش مینا، تغییر رنگ، مقاومت به شکست و قابلیت ترمیم',
    suggestedSlug: 'composite-veneers-vs-porcelain-laminates-comparison',
  },
  {
    id: '39',
    groupNumber: 8,
    groupTitle: 'دندانپزشکی ترمیمی و زیبایی',
    topicTitle:
      'حقایق علمی بلیچینگ دندان: مقایسه بلیچینگ آفیس (مطب) و هوم (خانگی)، ماندگاری و کنترل حساسیت دندان',
    topicSummary:
      'مکانیسم هیدروژن پراکساید و کاربامید پراکساید، مقایسه نتایج بلیچینگ در مطب و خانه، پایداری رنگ و پروتکل ضدحساسیت خمیردندان‌ها',
    suggestedSlug: 'teeth-bleaching-whitening-office-vs-home-sensitivity',
  },
  {
    id: '40',
    groupNumber: 8,
    groupTitle: 'دندانپزشکی ترمیمی و زیبایی',
    topicTitle:
      'طول عمر ترمیم‌های دندانی و حقایق آمالگام: ایمنی جیوه، علل نیاز به تعویض پرکردگی و رنگ دندان سالم',
    topicSummary:
      'بررسی علمی گزارش FDA و ADA درباره ایمنی آمالگام نقره، میکرولیکیج، پوسیدگی ثانویه، طول عمر کامپوزیت‌ها و علت رنگ طبیعی عاج دندان',
    suggestedSlug: 'dental-fillings-longevity-amalgam-mercury-safety-replacement',
  },
  {
    id: '41',
    groupNumber: 8,
    groupTitle: 'دندانپزشکی ترمیمی و زیبایی',
    topicTitle:
      'اصلاح نامرتبی‌های خفیف دندانی با ونیر و کامپوزیت: مزایا، محدودیت‌ها و جایگزینی با ارتودنسی',
    topicSummary:
      'چه زمانی می‌توان کجی خفیف دندان را با کامپوزیت یا لامینیت اصلاح کرد و چه زمانی درمان ارجح فقط ارتودنسی است؟ بررسی پیامدهای تراش بیش‌ازحد',
    suggestedSlug: 'mild-misalignment-correction-veneers-vs-orthodontics',
  },

  // Group 9: ارتودنسی و ناهنجاری‌های فک و صورت (Articles 42–45)
  {
    id: '42',
    groupNumber: 9,
    groupTitle: 'ارتودنسی و ناهنجاری‌های فک و صورت',
    topicTitle:
      'انواع روش‌های ارتودنسی مدرن: مقایسه ارتودنسی ثابت سیمی، براکت‌های سرامیکی، پلاک‌های شفاف (الاینر) و متحرک',
    topicSummary:
      'بررسی مزایا و معایب براکت‌های فلزی، زیبایی الاینرهای شفاف (اینویزیلاین)، پلاک‌های متحرک کودکان و هدایت رشد',
    suggestedSlug: 'orthodontic-treatment-types-metal-braces-clear-aligners',
  },
  {
    id: '43',
    groupNumber: 9,
    groupTitle: 'ارتودنسی و ناهنجاری‌های فک و صورت',
    topicTitle: 'مدیریت درد، طول دوره درمان ارتودنسی و اهمیت حیاتی استفاده از ریتینر (نگهدارنده)',
    topicSummary:
      'راهکارهای کاهش درد در روزهای اول تنظیم سیم، مدت زمان متوسط درمان، علل بازگشت (Relapse) و مقایسه ریتینر ثابت و متحرک',
    suggestedSlug: 'orthodontics-pain-management-duration-retainers-importance',
  },
  {
    id: '44',
    groupNumber: 9,
    groupTitle: 'ارتودنسی و ناهنجاری‌های فک و صورت',
    topicTitle:
      'کشیدن دندان در ارتودنسی: چرا دندان‌های آسیاب کوچک کشیده می‌شوند و چرا دندان نیش حفظ می‌شود؟',
    topicSummary:
      'اصول فضاگیری و کرودینگ شدید، تفاوت فانکشنال دندان‌های پرمولر و کانین، عوارض اجتناب نادرست از کشیدن و حفظ هارمونی صورت',
    suggestedSlug: 'tooth-extraction-in-orthodontics-premolars-vs-canines',
  },
  {
    id: '45',
    groupNumber: 9,
    groupTitle: 'ارتودنسی و ناهنجاری‌های فک و صورت',
    topicTitle:
      'درمان ناهنجاری‌های فکی (ارتوسرجری): اصلاح فک در کودکی در برابر جراحی ترکیبی فک در بزرگسالی',
    topicSummary:
      'ارتودنسی پیشگیرانه و فانکشنال در سنین رشد، جراحی ارتوگناتیک فک (جلو یا عقب بودن فک)، هماهنگی با جراحی بینی و توالی درمان',
    suggestedSlug: 'orthognathic-surgery-jaw-discrepancies-orthodontics-timeline',
  },

  // Group 10: بیماری‌های دهان و آسیب‌شناسی فک و صورت (Articles 46–49)
  {
    id: '46',
    groupNumber: 10,
    groupTitle: 'بیماری‌های دهان و آسیب‌شناسی فک و صورت',
    topicTitle:
      'ضایعات شایع دهان و زبان: آفت‌های راجعه، زبان باردار و شیاردار، و علائم هشداردهنده نیاز به بیوپسی',
    topicSummary:
      'تفاوت آفت با تبخال، زبان جغرافیایی و شیاردار، زخم‌های مخاطی پایدار بیش از ۲ هفته، و مراحل نمونه‌برداری پاتولوژی',
    suggestedSlug: 'common-oral-lesions-aphthous-ulcers-fissured-tongue-biopsy',
  },
  {
    id: '47',
    groupNumber: 10,
    groupTitle: 'بیماری‌های دهان و آسیب‌شناسی فک و صورت',
    topicTitle:
      'عفونت‌های ویروسی و پاپیلوما (HPV) در دهان: علائم بالینی، انتقال و راهکارهای پیشگیری و درمان',
    topicSummary:
      'تظاهرات بالینی پاپیلوما و زگیل‌های دهانی، ویروس پاپیلومای انسانی (HPV)، واکسیناسیون گارداسیل و بهداشت رابطه دهانی',
    suggestedSlug: 'oral-hpv-infection-papilloma-symptoms-prevention',
  },
  {
    id: '48',
    groupNumber: 10,
    groupTitle: 'بیماری‌های دهان و آسیب‌شناسی فک و صورت',
    topicTitle:
      'ریسک‌فاکتورهای سرطان دهان: اثرات دخانیات، الکل، قلیان و سیگارهای الکترونیکی (ویپ) بر سلول‌های مخاط دهان',
    topicSummary:
      'لکه‌های سفید و قرمز (لوکوپلاکیا و اریتروپلاکیا)، سمیت ویپ و تنباکو، اهمیت غربالگری سالانه مخاط توسط دندانپزشک و تشخیص زودهنگام',
    suggestedSlug: 'oral-cancer-risk-factors-smoking-vaping-leukoplakia',
  },
  {
    id: '49',
    groupNumber: 10,
    groupTitle: 'بیماری‌های دهان و آسیب‌شناسی فک و صورت',
    topicTitle:
      'ارتباط بیماری‌های سیستمیک با دهان: اثرات دیابت بر بافت‌های لثه و علل ریشه‌ای بوی بد دهان (هلیتوزیس)',
    topicSummary:
      'تاثیر دوطرفه دیابت و عفونت‌های لثه، بوی بد دهان صبحگاهی و منشأ باکتری‌های بی‌هوازی روی پرزهای زبان در مقایسه با علل گوارشی',
    suggestedSlug: 'systemic-diseases-oral-health-diabetes-halitosis',
  },

  // Group 11: پروتزهای دندانی ثابت و متحرک (Articles 50–52)
  {
    id: '50',
    groupNumber: 11,
    groupTitle: 'پروتزهای دندانی ثابت و متحرک',
    topicTitle:
      'پروتزهای دندانی ثابت (روکش و بریج): اندیکاسیون‌ها، انواع زیرکونیا و سرامیک، و اقدامات اورژانسی افتادن روکش',
    topicSummary:
      'چه دندان‌هایی نیاز به روکش دارند، مقایسه زیرکونیا و متال سرامیک (PFM)، بریج دندانی، و اقدامات صحیح در هنگام شل شدن یا کنده شدن روکش',
    suggestedSlug: 'dental-crowns-and-bridges-zirconia-emergency-loose-crown',
  },
  {
    id: '51',
    groupNumber: 11,
    groupTitle: 'پروتزهای دندانی ثابت و متحرک',
    topicTitle:
      'دست دندان مصنوعی (دنچر متحرک): مراحل ساخت، دوره عادت‌پذیری، اصول شست‌وشو، نگهداری و زمان ریلاین',
    topicSummary:
      'نحوه سازگاری با دندان مصنوعی، گفتار و غذا خوردن، روش صحیح ضدعفونی قرص‌های تمیزکننده، خطرات خوابیدن با دنچر و آتروفی فک',
    suggestedSlug: 'complete-dentures-adaptation-cleaning-reline-care',
  },
  {
    id: '52',
    groupNumber: 11,
    groupTitle: 'پروتزهای دندانی ثابت و متحرک',
    topicTitle:
      'مقایسه جامع گزینه‌های جایگزینی دندان‌های ازدست‌رفته: ایمپلنت، بریج، اوردنچر و پلاک پارسیل متحرک',
    topicSummary:
      'بررسی هزینه‌ها، حفظ استخوان فک، تراش دندان‌های مجاور، استحکام جونده و انتخاب بهترین طرح درمان بر اساس سن و توانایی مالی',
    suggestedSlug: 'missing-teeth-replacement-options-implants-bridges-dentures',
  },

  // Group 12: اورژانس‌ها، تروما و اصول کلینیک دندانپزشکی (Articles 53–56)
  {
    id: '53',
    groupNumber: 12,
    groupTitle: 'اورژانس‌ها، تروما و اصول کلینیک دندانپزشکی',
    topicTitle:
      'مدیریت فوری بیرون افتادن دندان دائمی (Avulsion): پنجره طلایی ۳۰ دقیقه، نگهداری در شیر و نجات ریشه',
    topicSummary:
      'اقدامات ثانیه‌ای والدین و فرد آسیب‌دیده، ممنوعیت مطلق دست زدن به ریشه، شست‌وشو و جازدن در سوکت، محیط‌های انتقال استاندارد (HBSS/شیر)',
    suggestedSlug: 'avulsed-tooth-emergency-golden-30-minutes-save-knocked-out-tooth',
  },
  {
    id: '54',
    groupNumber: 12,
    groupTitle: 'اورژانس‌ها، تروما و اصول کلینیک دندانپزشکی',
    topicTitle:
      'ترومای دندان و شکستگی تاج: انواع شکستگی مینا و عاج، بیرون‌زدگی عصب و بازسازی فوری دندان ضربه‌دیده',
    topicSummary:
      'طبقه بندی شکستگی دندان ناشی از ضربه، نگهداری قطعه شکسته دندان، محافظت از عصب زنده (پالپ کپینگ) و ونیرهای ترمیمی سریع',
    suggestedSlug: 'dental-trauma-crown-fracture-emergency-pulp-capping',
  },
  {
    id: '55',
    groupNumber: 12,
    groupTitle: 'اورژانس‌ها، تروما و اصول کلینیک دندانپزشکی',
    topicTitle:
      'باورهای دارویی و آنتی‌بیوتیک‌ها در دندانپزشکی: خطرات مصرف خودسرانه آموکسی‌سیلین و بی‌اثری بر دردهای پالپی',
    topicSummary:
      'چرا آنتی‌بیوتیک دندان‌درد را درمان نمی‌کند، پدیده مقاومت میکروبی، تنها موارد مجاز تجویز چرک‌خشک‌کن و لزوم مداخله فیزیکی دندانپزشک',
    suggestedSlug: 'antibiotics-in-dentistry-misconceptions-toothache-amoxicillin',
  },
  {
    id: '56',
    groupNumber: 12,
    groupTitle: 'اورژانس‌ها، تروما و اصول کلینیک دندانپزشکی',
    topicTitle:
      'ایمنی، استریلیزاسیون و تجربه درمانی آرام: استانداردهای اتوکلاو، کنترل درد با بی‌حسی و اهمیت تغذیه قبل از ویزیت',
    topicSummary:
      'چگونه از استریل بودن تجهیزات کلینیک مطمئن شویم؟ استانداردهای اتوکلاو کلاس B، مدیریت فوبیا و ترس از سوزن با ژل بی‌حسی، و علت افت قند خون',
    suggestedSlug: 'dental-clinic-sterilization-autoclave-anesthesia-fear-management',
  },
];
