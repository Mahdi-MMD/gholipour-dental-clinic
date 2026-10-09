import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES_DATA } from '@/data/servicesData';
import ServiceDetailClientView from '@/components/service-detail/ServiceDetailClientView';
import { getServiceRelations } from '@/data/serviceRelations';

interface ServicePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(SERVICES_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_DATA[slug];

  if (!service) {
    return {
      title: 'خدمت مورد نظر یافت نشد | کلینیک دندانپزشکی قلی‌پور',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';
  const pageUrl = `${siteUrl}/services/${service.slug}`;

  return {
    title: service.seoTitle,
    description: service.seoDescription,
    keywords: service.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: service.seoTitle,
      description: service.seoDescription,
      url: pageUrl,
      siteName: 'کلینیک دندانپزشکی قلی‌پور',
      locale: 'fa_IR',
      type: 'website',
      images: [
        {
          url: service.heroIllustration,
          width: 600,
          height: 600,
          alt: service.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.seoTitle,
      description: service.seoDescription,
      images: [service.heroIllustration],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = SERVICES_DATA[slug];

  if (!service) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gholipourdental.com';
  const pageUrl = `${siteUrl}/services/${service.slug}`;

  // Rich JSON-LD Schemas: MedicalWebPage, MedicalProcedure, FAQPage, LocalBusiness with nearby served cities
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalWebPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: service.seoTitle,
        description: service.seoDescription,
        inLanguage: 'fa-IR',
        about: {
          '@type': 'MedicalProcedure',
          name: service.title,
          procedureType: service.procedureType ?? 'https://schema.org/SurgicalProcedure',
          description: service.seoDescription,
          howPerformed: service.journeySteps
            .map((s) => `${s.stepNumber}. ${s.title}: ${s.summary}`)
            .join(' | '),
        },
      },
      {
        '@type': 'Dentist',
        '@id': `${siteUrl}/#dentist`,
        name: 'کلینیک دندانپزشکی قلی‌پور',
        url: siteUrl,
        telephone: '+981333512753',
        priceRange: '$$',
        image: `${siteUrl}/assets/logo.webp`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'جنب پل، پایین تر از پاسگاه نیرو انتظامی',
          addressLocality: 'زیباکنار',
          addressRegion: 'گیلان',
          addressCountry: 'IR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '37.4368492',
          longitude: '49.8711579',
        },
        areaServed: service.nearbyCitiesServed.map((cityName) => ({
          '@type': 'AdministrativeArea',
          name: cityName,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: service.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${pageUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحه اصلی',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'خدمات تخصصی',
            item: `${siteUrl}/#services`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  const relations = getServiceRelations(slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <ServiceDetailClientView
        service={service}
        relatedServices={relations.relatedServices}
        relatedArticles={relations.relatedArticles}
      />
    </>
  );
}
