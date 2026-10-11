# Gholipour Dental Clinic — Architecture & Engineering Standards (`AGENTS.md`)

This document defines core architecture conventions, directory structures, code guidelines, and design systems for the **Gholipour Dental Clinic** website. Automated coding agents and developers must adhere to these standards.

---

## 1. Core Architecture & Next.js Conventions

- **Framework**: Next.js 15+ (App Router) with React 19 and TypeScript.
- **Rendering Paradigms**:
  - **Server Components (RSC) by Default**: All route pages (`page.tsx`), layouts (`layout.tsx`), and metadata handlers should remain React Server Components to preserve zero-bundle-cost data fetching, optimal TTFB, and SEO indexing.
  - **Client Components Leaf Isolation**: Use `'use client'` strictly on interactive leaf components (e.g., interactive carousels, tabs, modal drawers, search inputs, copy-to-clipboard buttons). Never mark entire pages as client components unless absolutely required.
  - **Static Site Generation (SSG)**: Dynamic routes such as `/services/[slug]` and `/articles/[slug]` must implement `generateStaticParams()` to pre-render static HTML at build time for optimal performance and crawlability.
- **System State Boundaries**:
  - `loading.tsx`: Clean, accessible streaming fallbacks with minimal overhead.
  - `error.tsx`: Client-boundary error catchers with bilingual/Persian error messaging and retry (`reset()`) capabilities.
  - `not-found.tsx`: Custom 404 response with clear navigation back to the home page or service index.

---

## 2. Directory Structure

```text
gholipour-dental-clinic/
├── public/                 # Static public assets (images, icons, webp, manifests)
│   └── assets/             # Brand logos, service graphics, doctors, clinic photos
├── src/
│   ├── app/                # Next.js App Router routes, API handlers, & CSS
│   │   ├── (routes)/       # about, contact, services, articles, gallery, admin
│   │   ├── api/            # Route handlers (/api/admin, /api/articles/ai-search)
│   │   ├── globals.css     # Global theme, CSS custom properties, fonts, reset
│   │   ├── layout.tsx      # Root HTML layout with RTL dir and font preconnects
│   │   ├── loading.tsx     # Root loading state
│   │   ├── error.tsx       # Root error boundary
│   │   ├── not-found.tsx   # Custom 404 handler
│   │   └── sitemap.ts      # Automated XML sitemap generation
│   ├── components/         # Modular React components
│   │   ├── gallery/        # Gallery-specific interactive views (sliders, comparisons)
│   │   ├── service-detail/ # Service subpage specific components
│   │   └── *.tsx           # Global UI pieces (Header, Footer, Hero, Articles, etc.)
│   ├── data/               # Static type-safe content repositories
│   │   ├── articlesData.ts # Scientific & educational articles
│   │   ├── servicesData.ts # Comprehensive clinic service descriptions & FAQs
│   │   ├── galleryData.ts  # Treatment before/after portfolio items
│   │   └── ...
│   └── lib/                # Shared utilities & helpers (search engine, formatters)
├── scripts/                # Build and image optimization scripts (sharp)
├── package.json
├── tsconfig.json
└── next.config.mjs
```

---

## 3. Styling & Design System Standards

- **Color Palette (Golden Ratio 60-30-10 System)**:
  - **Dominant 60%**: Pure White (`--color-white: #ffffff`) and Light Surface Tint (`--color-bg-light: #f8fdff`).
  - **Structural 30%**: Deep Navy Teal (`--color-primary-dark: #1c434f`).
  - **Accent 10%**: Vibrant Ocean Blue (`--color-primary: #1c83aa`, hover: `#156b8c`).
  - **Supporting Accents**: Ice Blue (`--color-ice-blue: #c4eaf7`), Sky Tint (`--color-sky-tint: #e3f9ff`).
- **Typography & RTL Direction**:
  - Primary Fonts: `PeydaWeb` & `Vazirmatn`.
  - Layout Direction: Strict `dir="rtl"` with proper Persian typography, zero layout shifts, and Persian-digit formatting for localized texts.
- **CSS Architecture**:
  - Keep styling modular, readable, and performant. Utilize CSS custom properties declared in `globals.css`.
  - For utility classes and code formatting, maintain Prettier cleanliness with consistent indentation.

---

## 4. Code Quality, TypeScript & Linting

- **TypeScript**: Strict mode enabled (`tsconfig.json`). Explicitly type props and function returns. Avoid `any`.
- **Formatting**: Format code using `prettier` (`npx prettier --write .`).
- **Imports**: Group imports consistently:
  1. React and Next.js built-ins.
  2. Third-party packages.
  3. Internal components (`@/...` or relative).
  4. Internal data / lib / types.
  5. Stylesheets (`.css`).
- **Image Optimization**:
  - Always prefer WebP/AVIF format with width, height, and priority attributes where appropriate.
  - Run `npm run optimize-images` to batch-convert unoptimized assets.

---

## 5. Security & Build Validation

- Never commit sensitive keys (API tokens, admin passphrases) to source control; reference them via `.env.local` or deployment environment variables.
- Run `npm run build` prior to all deployments to guarantee zero type errors or broken SSG params.
