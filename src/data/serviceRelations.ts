import { ArticleItem, ARTICLES_DATA } from './articlesData';

export interface RelatedServiceItem {
  slug: string;
  title: string;
  summary: string;
  icon: string;
}

export interface ServiceRelations {
  relatedServices: RelatedServiceItem[];
  relatedArticles: ArticleItem[];
}

const SERVICE_RELATIONS_MAP: Record<
  string,
  {
    relatedServices: RelatedServiceItem[];
    relatedArticleSlugs: string[];
  }
> = {
  implant: {
    relatedServices: [
      {
        slug: 'surgery',
        title: 'جراحی و کشیدن دندان',
        summary: 'خارج کردن آتروماتیک دندان و حفظ ابعاد استخوان فک برای کاشت پایدار ایمپلنت.',
        icon: 'fa-solid fa-tooth',
      },
      {
        slug: 'crowns',
        title: 'روکش دندان',
        summary: 'طراحی روکش‌های تمام سرامیک و زیرکونیا به عنوان تاج نهایی متصل به ایمپلنت.',
        icon: 'fa-solid fa-gem',
      },
      {
        slug: 'dentures',
        title: 'دندان مصنوعی (اوردنچر)',
        summary: 'پروتزهای متحرک متکی بر ایمپلنت جهت بازسازی کامل قوس فکی بدون لغزش.',
        icon: 'fa-solid fa-teeth-open',
      },
    ],
    relatedArticleSlugs: [
      'dental-implant-post-op-care',
      'gum-recession-and-cervical-sensitivity-causes-treatment',
    ],
  },
  veneers: {
    relatedServices: [
      {
        slug: 'restorations',
        title: 'ترمیم دندان',
        summary: 'ترمیم‌های همرنگ کامپوزیتی جهت رفع پوسیدگی‌ها پیش از اعمال ونیر و لمینت.',
        icon: 'fa-solid fa-wand-magic-sparkles',
      },
      {
        slug: 'crowns',
        title: 'روکش دندان',
        summary: 'روکش تمام سرامیک زیبایی برای دندان‌های با تخریب یا تغییر رنگ عمیق.',
        icon: 'fa-solid fa-gem',
      },
      {
        slug: 'implant',
        title: 'ایمپلنت دندان',
        summary: 'جایگزینی دندان‌های غایب جهت ایجاد قوس لبخند کامل، متقارن و طبیعی.',
        icon: 'fa-solid fa-cube',
      },
    ],
    relatedArticleSlugs: [
      'white-spots-enamel-caries-vs-defects',
      'oral-hygiene-tools-brush-floss-guide',
    ],
  },
  dentures: {
    relatedServices: [
      {
        slug: 'implant',
        title: 'ایمپلنت دندان',
        summary: 'کاشت پایه‌های تیتانیومی جهت افزایش ثبات و تبدیل پروتز متحرک به اوردنچر ثابت.',
        icon: 'fa-solid fa-cube',
      },
      {
        slug: 'surgery',
        title: 'جراحی و کشیدن دندان',
        summary: 'آماده‌سازی اصولی مخاط و استخوان فک پیش از قالب‌گیری پروتز دست‌دندان.',
        icon: 'fa-solid fa-tooth',
      },
      {
        slug: 'crowns',
        title: 'روکش دندان',
        summary: 'روکش دندان‌های پایه‌ای باقی‌مانده جهت افزایش گیرش پروتز پارسیل متحرک.',
        icon: 'fa-solid fa-gem',
      },
    ],
    relatedArticleSlugs: [
      'harmful-traditional-dental-habits-risks',
      'vitamins-minerals-calcium-vitamin-d-dental-health',
    ],
  },
  crowns: {
    relatedServices: [
      {
        slug: 'root-canal',
        title: 'عصب کشی دندان',
        summary: 'پاکسازی کانال ریشه و استریل کامل پیش از پوشش دائمی با روکش سرامیکی.',
        icon: 'fa-solid fa-bolt',
      },
      {
        slug: 'implant',
        title: 'ایمپلنت دندان',
        summary: 'ساخت تاج روکش زیرکونیا متصل به اباتمنت ایمپلنت با تطابق میلی‌متری.',
        icon: 'fa-solid fa-cube',
      },
      {
        slug: 'veneers',
        title: 'کامپوزیت و لمینت',
        summary: 'طراحی هارمونیک لبخند با هماهنگی کامل فرم و رنگ میان روکش‌ها و لمینت‌ها.',
        icon: 'fa-solid fa-wand-magic-sparkles',
      },
    ],
    relatedArticleSlugs: [
      'traditional-toothache-remedies-risks',
      'dental-scaling-myths-and-facts',
    ],
  },
  restorations: {
    relatedServices: [
      {
        slug: 'root-canal',
        title: 'عصب کشی دندان',
        summary: 'درمان ریشه در صورت پیشرفت پوسیدگی‌های عمیق به اتاقک عصب دندان.',
        icon: 'fa-solid fa-bolt',
      },
      {
        slug: 'crowns',
        title: 'روکش دندان',
        summary: 'محافظت از دیواره‌های ضعیف‌شده دندان پس از پرکردگی‌ها و ترمیم‌های وسیع.',
        icon: 'fa-solid fa-gem',
      },
      {
        slug: 'pediatric',
        title: 'دندانپزشکی کودکان',
        summary: 'ترمیم‌های پیشگیرانه، فلورایدتراپی و فیشور سیلانت محافظ برای فرزندان.',
        icon: 'fa-solid fa-child-reaching',
      },
    ],
    relatedArticleSlugs: [
      'white-spots-enamel-caries-vs-defects',
      'sugars-carbohydrates-and-dental-health',
    ],
  },
  'root-canal': {
    relatedServices: [
      {
        slug: 'crowns',
        title: 'روکش دندان',
        summary: 'پوشش محافظتی ضروری پس از عصب‌کشی جهت پیشگیری از شکستگی تاج دندان.',
        icon: 'fa-solid fa-gem',
      },
      {
        slug: 'restorations',
        title: 'ترمیم دندان',
        summary: 'بازسازی ساختار تاجی دندان عصب‌کشی شده با مواد همرنگ و پست فایبرگلاس.',
        icon: 'fa-solid fa-wand-magic-sparkles',
      },
      {
        slug: 'surgery',
        title: 'جراحی و کشیدن دندان',
        summary: 'جراحی آپیکواکتومی انتهای ریشه یا خارج کردن دندان‌های با شکستگی غیرقابل حفظ.',
        icon: 'fa-solid fa-tooth',
      },
    ],
    relatedArticleSlugs: [
      'traditional-toothache-remedies-risks',
      'dental-implant-post-op-care',
    ],
  },
  surgery: {
    relatedServices: [
      {
        slug: 'implant',
        title: 'ایمپلنت دندان',
        summary: 'کاشت همزمان یا تاخیری ایمپلنت بلافاصله پس از کشیدن آتروماتیک دندان.',
        icon: 'fa-solid fa-cube',
      },
      {
        slug: 'root-canal',
        title: 'عصب کشی دندان',
        summary: 'آخرین خط دفاعی جهت نجات و ضدعفونی دندان پیش از رسیدن به مرحله جراحی و کشیدن.',
        icon: 'fa-solid fa-bolt',
      },
      {
        slug: 'dentures',
        title: 'دندان مصنوعی',
        summary: 'ساخت پروتز جایگزین با گیرش بالا پس از کشیدن دندان‌های غیرقابل درمان.',
        icon: 'fa-solid fa-teeth-open',
      },
    ],
    relatedArticleSlugs: [
      'dental-implant-post-op-care',
      'traditional-toothache-remedies-risks',
    ],
  },
  pediatric: {
    relatedServices: [
      {
        slug: 'restorations',
        title: 'ترمیم دندان',
        summary: 'ترمیم‌های همرنگ بیوسازگار و فاقد مواد شیمیایی مضر برای دندان‌های کودکان.',
        icon: 'fa-solid fa-wand-magic-sparkles',
      },
      {
        slug: 'root-canal',
        title: 'عصب کشی دندان',
        summary: 'درمان پالپوتومی و عصب‌کشی دندان شیری جهت حفظ آن تا زمان رویش دندان دائم.',
        icon: 'fa-solid fa-bolt',
      },
      {
        slug: 'surgery',
        title: 'جراحی و کشیدن دندان',
        summary: 'کشیدن ملایم و بدون استرس دندان‌های شیری عفونی همراه با فضا نگهدارنده.',
        icon: 'fa-solid fa-tooth',
      },
    ],
    relatedArticleSlugs: [
      'primary-baby-teeth-guide',
      'pediatric-oral-habits-and-preventive-orthodontics',
    ],
  },
};

// Aliases mapping
const ALIAS_MAP: Record<string, string> = {
  'composite-laminate': 'veneers',
  denture: 'dentures',
  crown: 'crowns',
  restoration: 'restorations',
  fillings: 'restorations',
  filling: 'restorations',
  endodontics: 'root-canal',
  rootcanal: 'root-canal',
  extraction: 'surgery',
  'tooth-extraction': 'surgery',
  'oral-surgery': 'surgery',
  children: 'pediatric',
  kids: 'pediatric',
  'pediatric-dentistry': 'pediatric',
};

export function getServiceRelations(slug: string): ServiceRelations {
  const canonicalSlug = ALIAS_MAP[slug] || slug;
  const config = SERVICE_RELATIONS_MAP[canonicalSlug] || SERVICE_RELATIONS_MAP['implant'];

  // Resolve exactly 2 articles
  const matchedArticles = config.relatedArticleSlugs
    .map((artSlug) => ARTICLES_DATA.find((a) => a.slug === artSlug))
    .filter((a): a is ArticleItem => Boolean(a));

  // Fallback to first 2 articles if needed
  const finalArticles = matchedArticles.length >= 2 ? matchedArticles.slice(0, 2) : ARTICLES_DATA.slice(0, 2);

  return {
    relatedServices: config.relatedServices,
    relatedArticles: finalArticles,
  };
}
