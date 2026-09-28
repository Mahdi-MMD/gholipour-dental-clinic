---
name: article
description: "Researches, drafts, and updates dental clinic article subpages using approved scientific sources, patient-friendly conversational Persian, SEO topic clustering, anti-cannibalization checks, MiniSearch indexing, and Git review/push flow. Triggered via /article <topic>."
---

# Article Agent Runbook (`/article`)

This skill equips the agent to autonomously generate or update article subpages for the Shahid Gholipour Dental Clinic platform (`gholipour-dental-clinic`).

Whenever the user invokes `/article <topic>` (with or without extra explanation or notes), follow the 6-phase procedure below.

---

## Operational Architecture

```mermaid
flowchart TD
    Start["User triggers /article <topic>"] --> Step1["Phase 1: Parse Topic & Anti-Cannibalization Check"]
    Step1 --> Decision{"Similarity > 60% with existing article?"}
    
    Decision -- Yes --> UpdatePath["UPDATE MODE:<br/>Enrich existing article with new section & keywords"]
    Decision -- No --> CreatePath["CREATE MODE:<br/>Prepare new ArticleItem (id, slug, sections, tags)"]
    
    UpdatePath --> Step2["Phase 2: Scientific Fact Retrieval (PubMed, ADA, JADA, BDJ)"]
    CreatePath --> Step2
    
    Step2 --> Step3["Phase 3: Conversational Tone & Persian Text Humanization"]
    Step3 --> Step4["Phase 4: Schema Sync & Backlink Interlinking in articlesData.ts"]
    Step4 --> Step5["Phase 5: User Presentation & Confirmation Request"]
    
    Step5 --> UserChoice{"User confirms changes?"}
    UserChoice -- Yes --> Step6["Phase 6: Git Commit & Push to origin main"]
    UserChoice -- Adjustments --> Refine["Refine content based on feedback"]
    Refine --> Step5
```

---

## Phase 1: Input Analysis & Anti-Cannibalization Check

1. **Read Existing Articles**: Read [`src/data/articlesData.ts`](file:///c:/Users/mahdi/OneDrive/Desktop/%DA%A9%D9%84%DB%8C%D9%86%DB%8C%DA%A9%20%D8%AF%D9%86%D8%AF%D8%A7%D9%86%D9%BE%D8%B2%D8%B4%DA%A9%DB%8C%20%D8%B4%D9%87%DB%8C%D8%AF%20%D9%82%D9%84%DB%8C%20%D9%BE%D9%88%D8%B1/src/data/articlesData.ts) to examine all existing titles, slugs, summaries, and keywords.
2. **Semantic Overlap Audit**:
   - Compare the new topic against existing articles to prevent **keyword cannibalization** (as established in [SEO & Search Spec](./references/seo_and_search_spec.md)).
   - **Update Mode**: If the topic overlaps substantially (> 60% search intent) with an existing article, do NOT create a competing thin subpage. Instead, expand the existing article:
     - Add a new dedicated section with an anchor `#id`.
     - Update its keywords, summary, and date.
   - **Create Mode**: If the topic represents a distinct search intent, prepare a new standalone subpage with:
     - Next sequential `id`
     - English kebab-case `slug` (e.g. `clear-aligners-vs-braces`)
     - Clinic `category`

---

## Phase 2: Scientific Fact-Finding (Medical Literature Only)

1. **Approved Literature Only**:
   All medical and dental claims must be sourced strictly from verified peer-reviewed dental journals and health bodies (see [Scientific Sources Guide](./references/scientific_sources.md)):
   - PubMed / MEDLINE (`pubmed.ncbi.nlm.nih.gov`)
   - American Dental Association (`ada.org`)
   - Journal of the American Dental Association (JADA)
   - British Dental Journal (BDJ)
   - Cochrane Oral Health Library
   - FDI World Dental Federation
   - Academic textbooks and clinical consensus statements
2. **Strictly Prohibited**:
   - Commercial dental clinic marketing blogs, SEO content farms, forums, and unverified summaries.
3. **Execution**:
   - Use `search_web` targeting verified domains (e.g. `site:pubmed.ncbi.nlm.nih.gov <topic>`).
   - Extract clinical success rates, recovery durations, contraindications, and evidence-based home-care steps.

---

## Phase 3: Conversational Tone & Text Humanization

1. **Target Audience**: Everyday patients and families—NOT medical professionals.
2. **Tone Guidelines** (see [Tone and Humanization Guide](./references/tone_and_humanization.md)):
   - **Warm & Empathetic**: Acknowledge patient anxieties, fear of pain, or cost concerns immediately.
   - **Simple Everyday Persian**: Replace academic jargon with daily conversational terms (e.g., use *«عصب دندان»* instead of *«پالپ دندان»*, *«کشیدن دندان»* instead of *«اکستراکشن»*). If technical terms are necessary, explain them in plain language in parentheses.
   - **Zero AI Clichés**: Ban formulas such as *«در این مقاله قصد داریم...»*, *«بر هیچ‌کس پوشیده نیست...»*, *«امروزه سلامت دندان اهمیت بالایی دارد...»*. Start directly with an engaging patient scenario or question.

---

## Phase 4: Data Schema Sync & Internal Linking (Backlinks)

1. **Format into `ArticleItem`**:
   - `id`: Unique incremental ID
   - `slug`: Clean kebab-case string
   - `title`: Catchy, friendly Persian title
   - `category`: Matching clinic specialty
   - `readTime`: e.g. `'۵ دقیقه'`
   - `date`: Current Persian Shamsi date (e.g. `'۶ مهر ۱۴۰۵'`)
   - `author`: Relevant clinical specialist (e.g. `'دندانپزشک متخصص کلینیک شهید قلی‌پور'`)
   - `summary`: 2–3 sentence engaging hook / meta description
   - `keywords`: 8–15 high-volume search keywords and colloquial symptoms (e.g., `دندون درد`, `ورم صورت`, `عصب کشی بدون درد`)
   - `sections`: 3–5 structured sections, each with a unique kebab-case anchor `id` (for MiniSearch deep-linking), `title`, and rich `body`
   - `content`: Array of section texts for backward compatibility
2. **Internal Linking (Hub & Spoke)**:
   - Identify 1–2 related articles in `src/data/articlesData.ts`.
   - Update their section text to cross-reference the new article with natural anchor context.
3. **Save**: Update [`src/data/articlesData.ts`](file:///c:/Users/mahdi/OneDrive/Desktop/%DA%A9%D9%84%DB%8C%D9%86%DB%8C%DA%A9%20%D8%AF%D9%86%D8%AF%D8%A7%D9%86%D9%BE%D8%B2%D8%B4%DA%A9%DB%8C%20%D8%B4%D9%87%DB%8C%D8%AF%20%D9%82%D9%84%DB%8C%20%D9%BE%D9%88%D8%B1/src/data/articlesData.ts).

---

## Phase 5: Presentation & User Review

Output a clean, structured summary for the user to analyze:
- **Decision Mode**: New Article created vs Existing Article enriched (with similarity reasoning).
- **Scientific References Cited**: Exact medical journals and clinical sources used.
- **Article Metadata**: Title, Slug, Category, Keywords, and Reading Time.
- **Section Breakdown**: Heading names, deep anchor IDs (`#id`), and content preview.
- **Backlinks / Internal Links Added**: Existing articles updated to link here.
- **Explicit Call-to-Action**: Prompt the user:
  > *"Please review the generated article structure and content above. If everything meets your approval, confirm and I will automatically commit and push to Git."*

---

## Phase 6: Git Commit & Push (On Confirmation)

When the user confirms approval:
1. Verify git status:
   `git status -s`
2. Stage and commit changes with a descriptive conventional commit message:
   `git add src/data/articlesData.ts` (and any related updated files)  
   `git commit -m "feat(articles): add article <slug> - <title>"`
3. Push to remote repository:
   `git push origin main`
4. Confirm successful push and provide commit hash to the user.
