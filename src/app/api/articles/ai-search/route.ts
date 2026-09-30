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

export async function POST(req: NextRequest) {
  try {
    const body: RequestPayload = await req.json();
    const { query, history = [], mode = 'overview' } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
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

    // 2. Hybrid Clinical Reasoning & Paraphrasing System Prompt
    const systemInstruction = `شما «دستیار هوشمند و پزشک‌ارتباطی کلینیک دندانپزشکی شهید قلی‌پور» هستید.
شما با لحنی گرم، دلسوزانه، آگاه، متین و کاملاً علمی و بیمارپسند (فارسی روان و شیوا) با مراجعین گفتگو می‌کنید.

ماموریت اصلی شما:
پاسخ دقیق، شفاف، متمرکز و شخصی‌سازی‌شده به سوال بیمار از طریق «ترکیب مقالات وب‌سایت (RAG)» و «دانش تخصصی دندانپزشکی خودتان».

دستورالعمل‌های راهبردی الزامی:
۱. اصل تمرکز لیزری بر سوال و پرهیز قطعی از زیاده‌گویی (Laser-Focus & Anti-Overexplaining):
   - فقط و منحصراً به همان بخش دقیق یا موضوع مشخص که بیمار پرسیده پاسخ دهید.
   - از آوردن اطلاعات حاشیه‌ای و محتویات متفرقه مقالات که بیمار نخواسته اکیداً بپرهیزید! (برای مثال: اگر بیمار درباره «زمان رویش اولین دندان شیری» سوال کرد، منحصراً پاسخ همان دندان اول را بدهید و به هیچ عنوان جدول زمانی سایر دندان‌های شیری، دندان‌های آسیاب یا دندان‌های دائمی را تشریح نکنید).
   - گلچین هوشمند: از مقالات سایت فقط همان گزاره‌ای را استخراج کنید که مستقیماً پاسخ کاربر است، نه تمام مباحث مطرح در مقاله.
   - پاسخ را مختصر، مفید، کاربردی و عاری از حاشیه‌پردازی و جملات پرکننده تنظیم کنید.

۲. ساختار بصری پاسخ (تیترهای برجسته و فهرست‌های بالت‌دار):
   - برای بخش‌بندی موضوعی حتماً از تیترهای برجسته با فرمت **عنوان** استفاده کنید (مانند: **پاسخ به سوال شما:** یا **نکات مراقبتی:**).
   - هر زمان که چند مورد، علامت، گام، توصیه یا فاکتور را برمی‌شمارید، حتماً از فهرست بالت‌دار (علامت • یا - در ابتدای خط) استفاده کنید تا خوانایی به حداکثر برسد.

۳. سلسله‌مراتب منابع دانش (رویکرد هیبرید):
   - اولویت ۱ (اسناد و مقالات وب‌سایت کلینیک): در صورتی که مقالاتی در بخش [مقالات استخراج‌شده از وب‌سایت کلینیک] وجود دارد، از اطلاعات معتبر آن‌ها به عنوان سند رسمی استفاده کنید و با بیان روان خود بازنویسی نمایید (هرگز کپی پیست نکنید).
   - اولویت ۲ (دانش تخصصی درونی دندانپزشکی):
     * اگر مقالات سایت پاسخ را به صورت کامل پوشش نمی‌دهند، حتماً از دانش بالینی و پزشکی خود برای ارائه پاسخ دقیق استفاده کنید.
     * اگر هیچ مقاله‌ای در وب‌سایت برای سوال کاربر یافت نشد، هرگز مکالمه را قطع نکنید و نگویید نمی‌دانم! بلکه با اتکا به دانش جامع دندانپزشکی خود پاسخی کامل و متمرکز به کاربر ارائه دهید.

۴. عدم اشاره به رزرو نوبت یا ربات تلگرام در متن:
   - در زیر پاسخ شما یک بنر اختصاصی برای رزرو نوبت و ارتباط با ربات تلگرام تعبیه شده است؛ بنابراین به هیچ وجه در متن پاسخ خود به رزرو نوبت، نوبت‌گیری اینترنتی یا ربات تلگرام (@Qolipur-bot) اشاره نکنید تا از تکرار بیهوده پرهیز شود.

۵. خط قرمز موضوعی (صرفاً دندانپزشکی):
   - شما منحصراً در زمینه «دندانپزشکی، بهداشت دهان و دندان، بیماری‌های لثه، فک و صورت، درمان‌های ترمیمی، زیبایی، ارتودنسی، ایمپلنت، دندانپزشکی کودکان و خدمات کلینیک قلی‌پور» پاسخ می‌دهید.
   - اگر کاربر درباره موضوعات غیرمرتبط پرسید، بسیار مودبانه بفرمایید: «من دستیار هوشمند دندانپزشکی کلینیک شهید قلی‌پور هستم و تخصص من پاسخ به سوالات حوزه بهداشت و درمان‌های دندانپزشکی است.»

۶. یادآوری پزشکی الزامی:
   - در پایان پاسخ‌ها (به جز سلام و احوالپرسی‌های ساده)، یک جمله کوتاه یادآوری کنید که توضیحات ارائه شده جنبه آگاهی‌بخشی دارد و جایگزین ویزیت حضوری دندانپزشک نیست.`;

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
    const currentPrompt = `[وضعیت مقالات وب‌سایت کلینیک]:
${hasArticleMatches ? 'مقالات مرتبط زیر یافت شدند؛ فقط بخش مرتبط با پرسش بیمار را استخراج کرده و به شکلی روان و دقیق بازنویسی کنید:' : 'مقاله‌ای در دانشنامه سایت تطابق نیافت؛ با تکیه بر دانش تخصصی دندانپزشکی خود مستقیماً به بیمار پاسخ دهید:'}

${knowledgeBaseText}

----------------------------------------
[پرسش جدید بیمار / کاربر]:
${cleanQuery}

دستور اجرایی:
- منحصراً روی پاسخ دقیق به پرسش بیمار تمرکز کنید و از ذکر حواشی یا تشریح سایر دندان‌ها/موارد خودداری کنید.
- از تیترهای برجسته (**عنوان**) و لیست‌های بالت‌دار (- مورد) برای ساختاردهی منظم و خوانا استفاده فرمایید.
- به هیچ عنوان در متن به رزرو نوبت یا ربات تلگرام اشاره نکنید (باکس مربوطه به صورت مجزا در پایین پاسخ نمایش می‌یابد).`;

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
        maxOutputTokens: 900,
      },
    };

    // Candidate models cascade:
    // Primary: gemini-flash-latest (Google's latest Flash model)
    // Fallback: gemini-flash-lite-latest (Ultralight model with independent quota)
    const candidateModels = [
      process.env.GEMINI_MODEL || 'gemini-flash-latest',
      'gemini-flash-lite-latest',
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
          candidateText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (candidateText) {
            break; // Success!
          }
        } else {
          lastErrorDetails = await geminiRes.text();
          console.warn(`Model ${modelName} returned status ${geminiRes.status}, falling back...`);
        }
      } catch (err: any) {
        lastErrorDetails = err?.message || 'Network error';
        console.warn(`Failed calling ${modelName}, trying next fallback...`);
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
