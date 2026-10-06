import { Metadata } from 'next';
import GalleryClient from './GalleryClient';

export const metadata: Metadata = {
  title: 'گالری و نمونه کارهای درمانی | کلینیک دندانپزشکی دکتر قلی‌پور',
  description:
    'مشاهده نمونه کارهای درمانی، اصلاح طرح لبخند، کامپوزیت ونیر، لمینت سرامیکی و ایمپلنت دندان با اسلایدر مقایسه قبل و بعد و نمای ساید بای ساید در کلینیک دندانپزشکی دکتر قلی‌پور.',
  openGraph: {
    title: 'گالری و نمونه کارهای درمانی | کلینیک دندانپزشکی دکتر قلی‌پور',
    description:
      'مشاهده آنلاین قبل و بعد درمان‌های دندانپزشکی تخصصی، زیبایی، ایمپلنت، روکش و اطفال.',
    type: 'website',
    locale: 'fa_IR',
  },
};

export default function GalleryPage() {
  return <GalleryClient />;
}
