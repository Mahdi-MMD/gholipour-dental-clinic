# SEO Architecture, Search Discoverability & Anti-Cannibalization Spec

This reference outlines the exact data schema, internal search indexing mechanics, and SEO cluster guidelines required for articles in the Shahid Gholipour Dental Clinic platform.

---

## 1. Schema Specifications (`articlesData.ts`)

Every article item in `src/data/articlesData.ts` follows this exact TypeScript contract:

```typescript
export interface ArticleSection {
  id: string;      // kebab-case english slug for deep linking: e.g. 'recovery-tips'
  title: string;   // Friendly Persian sub-heading (H2)
  body: string;    // Rich, detailed Persian paragraph (120-220 words)
}

export interface ArticleItem {
  id: string;                  // Next incremental sequential string (e.g. '9')
  slug: string;                // URL path kebab-case (e.g. 'wisdom-tooth-recovery-tips')
  title: string;               // Compelling, intent-focused Persian title
  category: string;            // One of the standard clinic categories
  readTime: string;            // Persian reading time (e.g. '۵ دقیقه')
  date: string;                // Persian Shamsi date (e.g. '۶ مهر ۱۴۰۵')
  author: string;              // Clinical author title (e.g. 'جراح دندانپزشک کلینیک قلی‌پور')
  summary: string;             // 2-3 sentence engaging teaser / meta description
  keywords: string[];          // 8-15 high-volume search tokens & patient symptoms
  sections: ArticleSection[];  // 3-5 structured sections with deep anchors
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
