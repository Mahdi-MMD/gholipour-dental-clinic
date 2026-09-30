import { NextRequest, NextResponse } from 'next/server';
import { ARTICLES_DATA } from '@/data/articlesData';
import { normalizePersian } from '@/lib/search';

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

export async function POST(req: NextRequest) {
  try {
    const body: RequestPayload = await req.json();
    const { query, history = [], mode = 'overview' } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const cleanQuery = query.trim();
    const normQuery = normalizePersian(cleanQuery);
    const queryTokens = normQuery.split(/\s+/).filter((t) => t.length > 1);

    // 1. Retrieve most relevant articles and sections from ARTICLES_DATA
    const scoredArticles = ARTICLES_DATA.map((art) => {
      let score = 0;
      const normTitle = normalizePersian(art.title);
      const normSummary = normalizePersian(art.summary);
      const normKeywords = normalizePersian((art.keywords || []).join(' '));

      for (const token of queryTokens) {
        if (normTitle.includes(token)) score += 5;
        if (normKeywords.includes(token)) score += 4;
        if (normSummary.includes(token)) score += 2;
      }

      // Find best matching section
      let bestSection: { id: string; title: string; body: string } | null = null;
      let maxSecScore = 0;

      if (art.sections && art.sections.length > 0) {
        for (const sec of art.sections) {
          let secScore = 0;
          const normSec = normalizePersian(`${sec.title} ${sec.body}`);
          for (const token of queryTokens) {
            if (normSec.includes(token)) secScore += 1;
          }
          if (secScore > maxSecScore) {
            maxSecScore = secScore;
            bestSection = sec;
          }
        }
      }

      score += maxSecScore * 2;

      return {
        article: art,
        score,
        bestSection,
      };
    })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    // Build context block from top matched articles & sections
    const contextBlocks = scoredArticles.map((item) => {
      const art = item.article;
      const secInfo = item.bestSection
        ? `بخش مرتبط: "${item.bestSection.title}"\nمتن: ${item.bestSection.body}`
        : `خلاصه مقاله: ${art.summary}\nمتن: ${art.content.join(' ')}`;

      return `مقاله: "${art.title}" (دسته‌بندی: ${art.category})\nکلیدواژه‌ها: ${art.keywords.join(', ')}\n${secInfo}\nلینک مقاله: /articles/${art.slug}${item.bestSection ? '#' + item.bestSection.id : ''}`;
    });

    const knowledgeBaseText = contextBlocks.length > 0
      ? contextBlocks.join('\n\n---\n\n')
      : 'هیچ مقاله مستقیمی در وب‌سایت برای این عبارت تطابق نیافت.';

    // 2. Strict Clinical System Prompt
    const systemInstruction = `شما دستیار رسمی و هوشمند کلینیک دندانپزشکی شهید قلی‌پور هستید. وظیفه شما پاسخگویی دلسوزانه، دقیق، علمی و آرامش‌بخش به بیماران است.

قوانین و چارچوب‌های الزامی که باید مو به مو رعایت کنید:
۱. حوزه موضوعی: شما صرفاً و منحصراً در زمینه «دندانپزشکی، بهداشت دهان و دندان، درمان‌های کلینیکی نظیر ایمپلنت، ارتودنسی، عصب‌کشی، لمینیت، کشیدن دندان، ترمیم و خدمات کلینیک قلی‌پور» پاسخ می‌دهید. اگر کاربر سوالی نامربوط (مانند برنامه‌نویسی، آشپزی، سیاست، پزشکی عمومی غیر مرتبط با فک و دهان یا مسائل دیگر) پرسید، با نهایت احترام و لحنی حرفه‌ای عذرخواهی کرده و اعلام کنید: «من دستیار تخصصی دندانپزشکی کلینیک شهید قلی‌پور هستم و تنها می‌توانم به سوالات و نگرانی‌های حوزه سلامت دهان و دندان پاسخ دهم.»
۲. قانون پایبندی به دانشنامه کلینیک (قانون ۷۵٪):
- اگر پاسخ سوال بیمار حداقل تا ۷۵٪ در مقالات و دانشنامه زیر موجود بود، از آن استفاده کنید و در صورت نیاز با دانش دندانپزشکی خود پاسخ را روان، کاربردی و کامل‌تر نمایید.
- اگر سوال بیمار در زمینه دندانپزشکی است اما هیچ اطلاعاتی از آن در دانشنامه سایت وجود ندارد (یا اطلاعات بسیار ناقص است)، هرگز اقدام به ساختن فرضیه و توهم اطلاعاتی نکنید. با صراحت و ادب بگویید که جزئیات این درمان در دانشنامه سایت ثبت نشده است و بیمار را صمیمانه راهنمایی کنید که:
  «برای دریافت پاسخ تخصصی این سوال، می‌توانید مستقیماً از ربات تلگرام کلینیک ما به آدرس @Qolipur-bot سوال خود را بپرسید یا جهت معاینه دقیق کلینیکی، از طریق سایت نوبت رزرو نمایید.»
۳. سلب مسئولیت پزشکی الزامی: در انتهای هر پاسخ (مگر در احوالپرسی ساده)، یک یادآوری کوتاه و دوستانه بیاورید که این توضیحات جنبه آموزشی و آگاهی‌بخشی دارد و جایگزین ویزیت و معاینه حضوری دندانپزشک نیست.
۴. زبان و لحن: فارسی روان، بسیار محترمانه، روشن و عاری از اصطلاحات سنگین انگلیسی مگر با توضیح ساده فارسی.
۵. قالب‌بندی: از پاراگراف‌های منظم، فهرست‌های بالت‌دار در صورت نیاز و ارجاع محترمانه به خدمات کلینیک استفاده کنید.`;

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
    const currentPrompt = `[دانشنامه و مقالات استخراج‌شده از وب‌سایت کلینیک]:
${knowledgeBaseText}

[پرسش جدید بیمار / کاربر]:
${cleanQuery}

لطفاً طبق دستورالعمل‌های محول‌شده، پاسخی شیوا، دلسوزانه و مستند ارائه دهید.`;

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
        temperature: 0.3,
        maxOutputTokens: 900,
      },
    };

    // 4. Request Gemini API:
    // Primary: gemini-flash-latest (Always routes to Google's newest Flash generation)
    // Fallback: gemini-flash-lite-latest (Independent rate quota, ultralight, generous free tier)
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
