import { NextRequest, NextResponse } from 'next/server';
import { ARTICLES_DATA } from '@/data/articlesData';
import { normalizePersian, createArticlesSearchIndex, SearchableArticleDoc } from '@/lib/search';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface RequestPayload {
  query: string;
  history?: ChatMessage[];
  mode?: 'overview' | 'chat';
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';

// Initialize MiniSearch indexing once at module level
const searchableDocs: SearchableArticleDoc[] = ARTICLES_DATA.map((art) => ({
  id: art.id,
  slug: art.slug,
  title: art.title,
  category: art.category,
  summary: art.summary,
  keywords: (art.keywords || []).join(' '),
  content: art.content ? art.content.join(' ') : '',
  author: art.author || '',
}));

const articleSearchIndex = createArticlesSearchIndex(searchableDocs);

// Rate Limiting: 10 queries per hour, 25 queries per day per user/IP
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitRecord>();

const ONE_HOUR_MS = 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_HOURLY_QUERIES = 10;
const MAX_DAILY_QUERIES = 25;

function checkRateLimit(identifier: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Filter timestamps within the last 24 hours
  record.timestamps = record.timestamps.filter((ts) => now - ts < ONE_DAY_MS);

  // Hourly count
  const hourlyCount = record.timestamps.filter((ts) => now - ts < ONE_HOUR_MS).length;
  if (hourlyCount >= MAX_HOURLY_QUERIES) {
    return {
      allowed: false,
      message: 'سقف پرسش‌های این ساعت شما تکمیل شده است (حداکثر ۱۰ سوال در ساعت). لطفاً ساعتی دیگر مراجعه فرمایید یا با ربات تلگرام ارتباط بگیرید.',
    };
  }

  // Daily count
  if (record.timestamps.length >= MAX_DAILY_QUERIES) {
    return {
      allowed: false,
      message: 'سقف پرسش‌های روزانه شما تکمیل شده است (حداکثر ۲۵ سوال در روز). لطفاً فردا مراجعه فرمایید یا با ربات تلگرام @Qolipur-bot در ارتباط باشید.',
    };
  }

  // Record this query
  record.timestamps.push(now);
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  try {
    // Determine client identifier for rate limiting
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || 'unknown-client';

    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 });
    }

    const body: RequestPayload = await req.json();
    const { query, history = [], mode = 'overview' } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    const wordCount = cleanQuery.split(/\s+/).filter(Boolean).length;
    if (wordCount > 50 || cleanQuery.length > 350) {
      return NextResponse.json(
        { error: 'طول پرسش بیش از حد مجاز است (حداکثر ۵۰ کلمه). لطفاً سوال خود را خلاصه‌تر بفرمایید.' },
        { status: 400 }
      );
    }

    const normQuery = normalizePersian(cleanQuery);
    const rawTokens = normQuery.split(/\s+/).filter((t) => t.length > 1);

    // Stop words to prevent irrelevant keyword matching
    const stopWords = new Set([
      'است', 'چیست', 'چه', 'چگونه', 'برای', 'در', 'با', 'به', 'از', 'که', 'این', 'آن',
      'یا', 'تا', 'بر', 'روی', 'چند', 'آیا', 'کدام', 'چرا', 'باید', 'نباید', 'درباره',
      'مورد', 'شدن', 'کردن', 'می', 'نمی', 'ها', 'های', 'هایش', 'دارد', 'کند', 'کنیم',
      'هست', 'نیست', 'باشیم', 'باشید', 'شوند', 'شود', 'سلام', 'روز', 'بخیر', 'خسته'
    ]);
    const meaningfulTokens = rawTokens.filter((t) => !stopWords.has(t) && t.length > 1);
    const searchQueryStr = meaningfulTokens.length > 0 ? meaningfulTokens.join(' ') : normQuery;

    // Search via MiniSearch with TF-IDF and field boosts
    let searchHits = articleSearchIndex.search(searchQueryStr, { combineWith: 'AND' });
    if (searchHits.length === 0 && meaningfulTokens.length > 1) {
      searchHits = articleSearchIndex.search(searchQueryStr, { combineWith: 'OR' });
    }

    // Filter hits by meaningful relevance score threshold (minimum 8 in MiniSearch with boost)
    const validHits = searchHits.filter((hit) => hit.score >= 8).slice(0, 3);

    // 1. Retrieve most relevant articles and sections from ARTICLES_DATA (0 to 3 max)
    const scoredArticles = validHits
      .map((hit) => {
        const art = ARTICLES_DATA.find((a) => a.id === hit.id);
        if (!art) return null;

        // Find best matching section for context
        let bestSection: { id: string; title: string; body: string } | null = null;
        let maxSecScore = 0;

        if (art.sections && art.sections.length > 0) {
          for (const sec of art.sections) {
            let secScore = 0;
            const normSec = normalizePersian(`${sec.title} ${sec.body}`);
            for (const token of (meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens)) {
              if (normSec.includes(token)) secScore += 1;
            }
            if (secScore > maxSecScore) {
              maxSecScore = secScore;
              bestSection = sec;
            }
          }
        }

        return {
          article: art,
          score: hit.score,
          bestSection,
        };
      })
      .filter(Boolean) as Array<{
        article: (typeof ARTICLES_DATA)[0];
        score: number;
        bestSection: { id: string; title: string; body: string } | null;
      }>;

    // Build context block from top matched articles & sections
    const hasArticleMatches = scoredArticles.length > 0;
    const contextBlocks = scoredArticles.map((item, idx) => {
      const art = item.article;
      const secInfo = item.bestSection
        ? `بخش مرتبط: "${item.bestSection.title}"\nمتن بخش: ${item.bestSection.body}`
        : `خلاصه مقاله: ${art.summary}\nمتن مقاله: ${art.content.join(' ')}`;

      return `[سند شماره ${idx + 1} از وب‌سایت کلینیک]:
عنوان مقاله: "${art.title}" (دسته‌بندی: ${art.category})
کلیدواژه‌ها: ${art.keywords.join('، ')}
${secInfo}
آدرس ارجاع: /articles/${art.slug}${item.bestSection ? '#' + item.bestSection.id : ''}`;
    });

    const knowledgeBaseText = hasArticleMatches
      ? contextBlocks.join('\n\n---\n\n')
      : 'در پایگاه مقالات فعلی وب‌سایت، مقاله‌ای مستقیماً منطبق با این پرسش یافت نشد.';

    // 2. Hybrid Clinical Reasoning & Paraphrasing System Prompt (in English to save input tokens)
    const systemInstruction = `You are the AI Clinical Assistant for Gholipour Dental Clinic.
Always respond in fluent, empathetic, professional, and patient-friendly Persian (فارسی روان).

Core Directives:
1. Concise & Focused (Strict limit: under 300 words):
   - Answer only the specific dental issue asked. Do not explain unrelated teeth, timelines, or procedures.
   - Extract only the exact relevant fact from matched articles; do not dump irrelevant article sections.
   - Keep answers clear, direct, and practical without fluff.

2. Visual Formatting:
   - Use bold Markdown section headers like **عنوان** (e.g. **پاسخ به سوال شما:** or **نکات مراقبتی:**).
   - Use clean bullet points (- or •) when listing steps, causes, or tips.

3. Hybrid Knowledge Hierarchy:
   - Priority 1 (Clinic Articles): Paraphrase relevant facts from matched clinic articles. Never copy-paste verbatim.
   - Priority 2 (Internal Clinical Knowledge): If articles don't fully cover the question or no matches are found, use your expert dental clinical knowledge to provide an accurate, helpful Persian response. Never say "I don't know".

4. Omit Booking & Bot Links:
   - A dedicated appointment reservation banner and Telegram bot button are displayed beneath your response in the UI. Do NOT mention appointment booking, phone numbers, or @Qolipur-bot in your text.

5. Domain Boundary:
   - Only answer questions regarding dentistry, oral health, gum diseases, implants, orthodontics, cosmetic treatments, and pediatric dentistry.
   - For non-dental questions, politely decline in Persian: "من دستیار هوشمند کلینیک دندانپزشکی قلی‌پور هستم و تنها به سوالات حوزه بهداشت و درمان‌های دندانپزشکی پاسخ می‌دهم."

6. Mandatory Disclaimer:
   - End medical answers with a short 1-sentence reminder in Persian that this guidance is educational and does not replace in-person dental consultation.`;

    // 3. Format contents for Gemini API (including multi-turn history)
    const geminiContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Add prior conversation history if provided
    for (const msg of history) {
      geminiContents.push({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }],
      });
    }

    // Current prompt with injected knowledge base
    const currentPrompt = `[Clinic Knowledge Base / Context]:
${knowledgeBaseText}

----------------------------------------
[Patient Question]:
${cleanQuery}

Execution Guidelines:
- Respond in fluent, natural Persian (فارسی روان).
- Strictly under 300 words. Focus directly on the patient question.
- Use bold section headers (**عنوان**) and bullet lists (-).
- Do NOT mention appointment booking or Telegram bot in your text.`;

    geminiContents.push({
      role: 'user',
      parts: [{ text: currentPrompt }],
    });

    // 4. Request Gemini API
    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents: geminiContents,
      generationConfig: {
        temperature: 0.4,
      },
    };

    // Candidate models cascade:
    // 1. Primary: gemini-3.5-flash (full capability)
    // 2. Secondary: gemini-3.5-flash-lite (fast lightweight)
    // 3. Fallback: gemini-3.1-flash-lite (peak hour stability)
    const candidateModels = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
    ];

    let candidateText = '';
    let lastErrorDetails = '';

    for (const modelName of candidateModels) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
        const geminiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(geminiPayload),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const parts = geminiData.candidates?.[0]?.content?.parts || [];
          candidateText = parts
            .map((p: { text?: string }) => p.text || '')
            .filter(Boolean)
            .join('');

          if (candidateText && candidateText.trim().length > 0) {
            break; // Success!
          }
        } else {
          lastErrorDetails = await geminiRes.text();
          console.warn(`Model ${modelName} returned status ${geminiRes.status}, trying fallback...`);
        }
      } catch (err: any) {
        lastErrorDetails = err?.message || 'Network error';
        console.warn(`Failed calling ${modelName} (${err?.message}), trying fallback...`);
      }
    }

    if (!candidateText) {
      return NextResponse.json(
        {
          error: 'سرویس هوش مصنوعی موقتاً با ترافیک بالا مواجه است. لطفاً چند لحظه دیگر تلاش کنید.',
          details: lastErrorDetails,
        },
        { status: 503 }
      );
    }

    // Extract sources metadata for rich UI chips
    const sources = scoredArticles.map((s) => ({
      title: s.article.title,
      category: s.article.category,
      slug: s.article.slug,
      sectionId: s.bestSection ? s.bestSection.id : undefined,
      sectionTitle: s.bestSection ? s.bestSection.title : undefined,
      snippet: s.bestSection ? s.bestSection.body.slice(0, 120) + '...' : s.article.summary,
    }));

    return NextResponse.json({
      answer: candidateText,
      sources,
      usedInternalKnowledge: sources.length === 0,
      mode,
    });
  } catch (error: any) {
    console.error('AI Search route handler error:', error);
    return NextResponse.json(
      { error: 'خطای سرور در پردازش درخواست', message: error?.message },
      { status: 500 }
    );
  }
}
