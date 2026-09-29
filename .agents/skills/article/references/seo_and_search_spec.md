# SEO Architecture, Search Discoverability & Anti-Cannibalization Spec

This reference outlines the exact data schema, internal search indexing mechanics, and SEO cluster guidelines required for articles in the Shahid Gholipour Dental Clinic platform.

---

## 1. Schema Specifications (`articlesData.ts`)

Every article item in `src/data/articlesData.ts` follows this exact TypeScript contract:

```typescript
export interface ArticleSection {
  id: string;             // kebab-case english slug for deep linking: e.g. 'recovery-tips'
  title: string;          // Friendly Persian sub-heading (H2)
  body: string;           // Rich, detailed Persian paragraph (120-220 words)
  doctorComment?: string; // 30-60 word chairside clinical observation by Dr. Mahdi Mohammadnezhad
}

export interface ArticleCitation {
  title: string;          // Paper / study title
  source: string;         // Peer-reviewed journal (PubMed, ADA, JADA, Cochrane)
  url?: string;           // Direct publication URL
  doi?: string;           // Digital Object Identifier
}

export interface ArticleFAQ {
  question: string;       // High-intent patient question (e.g. 'آیا لمینت نیاز به تراش دارد؟')
  answer: string;         // Clear, conversational, reassuring medical answer (50-90 words)
}

export interface ArticleItem {
  id: string;                  // Next incremental sequential string (e.g. '9')
  slug: string;                // URL path kebab-case (e.g. 'wisdom-tooth-recovery-tips')
  title: string;               // Compelling, intent-focused Persian title
  category: string;            // One of the standard clinic categories
  readTime: string;            // Persian reading time (e.g. '۵ دقیقه')
  date: string;                // Persian Shamsi date (e.g. '۶ مهر ۱۴۰۵')
  author: string;              // Always: 'دکتر مهدی محمدنژاد'
  summary: string;             // 2-3 sentence engaging teaser & SEO meta description (130-160 chars)
  tldr?: string;               // 1-2 sentence quick summary written by agent for fast scanning & featured snippet
  keywords: string[];          // 8-15 high-volume search tokens & patient symptoms
  sections: ArticleSection[];  // 3-5 structured sections with deep anchors & optional doctorComment
  faqs?: ArticleFAQ[];         // 2-4 patient FAQs for FAQPage schema & accordion
  citations?: ArticleCitation[]; // Scientific journal & DOI citations footer
  image?: string;              // Featured image path (e.g. '/assets/article-implant-dos-donts.webp')
  imageAlt?: string;           // Descriptive Persian alt text for Google Images & accessibility
  imageCaption?: string;       // Helpful clinical caption under hero image
  content: string[];           // Array of section body strings (backwards compatibility)
}
```

### Standard Clinic Categories:
- `ایمپلنت و جراحی` (Implant & Surgery)
- `عصب‌کشی و اندودنتیکس` (Endodontics & Root Canal)
- `دندانپزشکی زیبایی` (Cosmetic Dentistry, Laminates, Veneers, Bleaching)
- `دارو و بهداشت` (Oral Hygiene & Medications)
- `ارتودنسی` (Orthodontics)
- `ترمیم و پیشگیری` (Restorative & Prevention)
- `دندانپزشکی اطفال` (Pediatric Dentistry)

---

## 2. Internal Search & MiniSearch Compatibility

The site uses **MiniSearch** with Persian normalization (`src/lib/search.ts`) and field boosting:
- **`title` (Boost 4.0)**: Exact terms matching the title rank highest.
- **`keywords` (Boost 3.0)**: Must include everyday symptom phrases that patients type when searching:
  - Examples: `درد دندان عقل`, `ورم صورت`, `آبسه`, `بوی بد دهان`, `خونریزی لثه`, `دیابت و ایمپلنت`.
  - Include both formal and informal variants (e.g., `دندون درد`, `ایمپلنت ارزان`).
- **`sections` (Deep Anchors `#id`)**:
  - The site's search engine directs users straight to the exact section anchor (e.g., `/articles/wisdom-tooth#pain-relief`).
  - Section IDs must be clean, lowercase, English kebab-case (`pain-relief`, `dos-and-donts`, `home-care`).

---

## 3. Anti-Cannibalization & Topic Cluster Logic (Hub & Spoke)

### A. Cannibalization Detection (Similarity Rule)
Before writing a new page, evaluate the semantic overlap with existing articles in `ARTICLES_DATA`:
1. **Overlap > 60% (Duplicate Intent)**:
   - *Example*: User wants an article on *"درد بعد از عصب کشی"* when an existing article *"همه چیز درباره عصب‌کشی تخصصی"* already covers treatment steps.
   - *Action*: **UPDATE MODE**. Add a dedicated section to the existing article titled *"کنترل درد بعد از عصب‌کشی: چه میزان دردی طبیعی است؟"* with ID `post-treatment-pain`, update its keywords, summary, and date.
   - *Why*: Prevents two clinic URLs competing against each other on Google, which would dilute page authority and confuse search crawlers.

2. **Distinct Search Intent (Cluster Subpage)**:
   - *Example*: User wants an article on *"تفاوت ارتودنسی نامرئی (اینویزیلاین) با براکت فلزی"* when the existing article is *"مراحل کلی ارتودنسی"*.
   - *Action*: **CREATE MODE**. Build a standalone subpage as a spoke of the Orthodontics cluster.

### B. Bidirectional Backlinks (Internal Linking)
Whenever a new subpage is created:
1. **Link to Parent/Hub**: Reference related clinic treatments or foundational articles.
2. **Backlink from Existing Articles**: Find 1–2 existing articles in `ARTICLES_DATA` that mention the topic, and add an inline mention or contextual link pointing to the new subpage.

---

## 4. Technical Search Engine Architecture

All article detail subpages (`/articles/[slug]`) operate under a high-performance Next.js Server Component architecture:

### A. Pre-Rendering (`generateStaticParams`)
All slugs are pre-rendered at build time:
```typescript
export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({ slug: article.slug }));
}
```
This guarantees instant server responses and immediate indexation by search engine spiders.

### B. Dynamic Metadata & Open Graph (`generateMetadata`)
Each subpage emits custom, per-article metadata:
- **Title**: `<article.title> | کلینیک دندانپزشکی شهید قلی‌پور`
- **Description**: `<article.summary>` (strictly 120–160 Persian characters)
- **Canonical URL**: `https://gholipourdental.com/articles/<article.slug>`
- **Open Graph**: Type `article`, with author, published date, tags, and clinic name.
- **Twitter Card**: `summary_large_image`

### C. JSON-LD Structured Data (Rich Snippets)
Every article injects valid JSON-LD schemas into the document:
1. **`MedicalWebPage` / `Article`**: Declares medical publisher (`DentalClinic`), author, headline, inLanguage (`fa-IR`), and publication date.
2. **`BreadcrumbList`**: Structured trail (`خانه > مقالات دندانپزشکی > عنوان مقاله`) for hierarchical Google SERP presentation.
3. **`FAQPage`**: If `faqs` are defined, emits `FAQPage` schema enabling Google "People Also Ask" and expandable search results cards.



---

## 5. Editorial Featured Image & Author E-E-A-T Specification

### A. Featured Hero Image (16:9 Aspect Ratio)
- **Placement**: Placed directly after the article title and header metadata, before the summary callout box.
- **Acquisition Protocol**:
  1. **Priority 1 (Find)**: Search `public/assets/` for an existing matching image asset.
  2. **Priority 2 (Generate)**: If no appropriate asset exists, generate a professional dental image using `generate_image` (aspectRatio `'16:9'`) and save in assets.
- **Markup**: Renders with Next.js optimized `<Image fill priority>`, rounded corners, responsive aspect ratio (16:9), and optional `<figcaption>`.
- **SEO Social Output**: Automatically populates `og:image` (1200x630) and `twitter:image` for rich social snippet cards.

### B. Medical Authority & Author E-E-A-T
- **Fixed Author & Medical Reviewer**: **دکتر مهدی محمدنژاد** (Dr. Mahdi Mohammadnezhad | Medical Registration Code: ۲۲۹۳۵۳).
- **Credentials Box**: An author biography card rendered beneath the article and FAQ sections, highlighting clinical review, doctor portrait (`/assets/doctor-mohammadnezhad.webp`), and medical registration code (`کد نظام پزشکی : ۲۲۹۳۵۳`).
- **Structured Data**: Injects `author` and `reviewedBy` as `Person` objects in the `MedicalWebPage` JSON-LD schema with `identifier: "229353"`.
- **Inline Physician Annotations (`doctorComment`)**: Mid-page `<aside>` callouts placed directly after relevant section paragraphs containing chairside observations. Wrapped in `MedicalWebPage.hasPart` with `@type: "Comment"` attributed to Dr. Mahdi.
- **Scientific Citations Footer**: Grounded links and DOI references rendered at the article base and mapped to schema `citation`.
- **TL;DR Box**: 1–2 sentence expert summary positioned above the fold for immediate user comprehension and Google snippet capture.
