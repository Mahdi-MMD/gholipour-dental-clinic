import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { ARTICLES_DATA, ArticleItem } from '@/data/articlesData';

const ARTICLES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'articlesData.ts');

export async function GET() {
  try {
    return NextResponse.json({ success: true, articles: ARTICLES_DATA });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const article: ArticleItem = body.article || body;
    const isNew: boolean = Boolean(body.isNew);

    if (!article.title || !article.slug) {
      return NextResponse.json(
        { success: false, message: 'عنوان و نامک (slug) مقاله الزامی است.' },
        { status: 400 }
      );
    }

    // Read current articlesData.ts file
    const fileContent = await fs.readFile(ARTICLES_FILE_PATH, 'utf-8');

    // Make a clone of ARTICLES_DATA
    const existingArticles = [...ARTICLES_DATA];

    // Determine if updating or creating
    let index = -1;
    if (!isNew && article.id) {
      index = existingArticles.findIndex(a => a.id === article.id);
    }

    // If still not found by ID and not forced new, check by slug
    if (index < 0 && !isNew) {
      index = existingArticles.findIndex(a => a.slug === article.slug);
    }

    // Check for duplicate slug
    const duplicateSlug = existingArticles.find(
      a => a.slug === article.slug && a.id !== (index >= 0 ? existingArticles[index].id : undefined)
    );
    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message: `نامک (slug) «${article.slug}» تکراری است و قبلاً برای مقاله «${duplicateSlug.title}» استفاده شده است. لطفاً نامک یکتایی انتخاب کنید.`,
        },
        { status: 400 }
      );
    }

    // Keep backwards-compatible and AI-search content fully synchronized without truncation
    article.content =
      article.sections && article.sections.length > 0
        ? article.sections.map(s => s.body)
        : [article.summary || ''];

    let savedArticle: ArticleItem;
    if (index >= 0) {
      // Update existing
      existingArticles[index] = { ...existingArticles[index], ...article };
      savedArticle = existingArticles[index];
    } else {
      // Add new
      const nextId = String(Math.max(...existingArticles.map(a => parseInt(a.id, 10) || 0), 0) + 1);
      article.id = nextId;
      existingArticles.push(article);
      savedArticle = article;
    }

    // Format new file content preserving TypeScript interface definitions
    const interfaceHeader = fileContent.substring(
      0,
      fileContent.indexOf('export const ARTICLES_DATA')
    );
    const formattedData = `export const ARTICLES_DATA: ArticleItem[] = ${JSON.stringify(
      existingArticles,
      null,
      2
    )};\n`;

    const updatedFileContent = `${interfaceHeader}${formattedData}`;
    await fs.writeFile(ARTICLES_FILE_PATH, updatedFileContent, 'utf-8');

    // Update in-memory ARTICLES_DATA so GET() and subsequent requests reflect immediately
    ARTICLES_DATA.length = 0;
    ARTICLES_DATA.push(...existingArticles);

    return NextResponse.json({
      success: true,
      message: 'مقاله با موفقیت ذخیره شد.',
      article: savedArticle,
    });
  } catch (error) {
    console.error('Save article error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی مقاله: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه مقاله الزامی است.' },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(ARTICLES_FILE_PATH, 'utf-8');
    const existingArticles = ARTICLES_DATA.filter(a => a.id !== id);

    const interfaceHeader = fileContent.substring(
      0,
      fileContent.indexOf('export const ARTICLES_DATA')
    );
    const formattedData = `export const ARTICLES_DATA: ArticleItem[] = ${JSON.stringify(
      existingArticles,
      null,
      2
    )};\n`;

    const updatedFileContent = `${interfaceHeader}${formattedData}`;
    await fs.writeFile(ARTICLES_FILE_PATH, updatedFileContent, 'utf-8');

    ARTICLES_DATA.length = 0;
    ARTICLES_DATA.push(...existingArticles);

    return NextResponse.json({
      success: true,
      message: 'مقاله حذف گردید.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
