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
    const article: ArticleItem = await request.json();

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
    const index = existingArticles.findIndex(
      (a) => a.id === article.id || a.slug === article.slug
    );

    if (index >= 0) {
      // Update existing
      existingArticles[index] = { ...existingArticles[index], ...article };
    } else {
      // Add new
      const nextId = String(
        Math.max(...existingArticles.map((a) => parseInt(a.id, 10) || 0), 0) + 1
      );
      article.id = article.id || nextId;
      existingArticles.push(article);
    }

    // Format new file content preserving TypeScript interface definitions
    const interfaceHeader = fileContent.substring(0, fileContent.indexOf('export const ARTICLES_DATA'));
    const formattedData = `export const ARTICLES_DATA: ArticleItem[] = ${JSON.stringify(
      existingArticles,
      null,
      2
    )};\n`;

    const updatedFileContent = `${interfaceHeader}${formattedData}`;
    await fs.writeFile(ARTICLES_FILE_PATH, updatedFileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'مقاله با موفقیت ذخیره شد.',
      article,
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
      return NextResponse.json({ success: false, message: 'شناسه مقاله الزامی است.' }, { status: 400 });
    }

    const fileContent = await fs.readFile(ARTICLES_FILE_PATH, 'utf-8');
    const existingArticles = ARTICLES_DATA.filter((a) => a.id !== id);

    const interfaceHeader = fileContent.substring(0, fileContent.indexOf('export const ARTICLES_DATA'));
    const formattedData = `export const ARTICLES_DATA: ArticleItem[] = ${JSON.stringify(
      existingArticles,
      null,
      2
    )};\n`;

    const updatedFileContent = `${interfaceHeader}${formattedData}`;
    await fs.writeFile(ARTICLES_FILE_PATH, updatedFileContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'مقاله حذف گردید.',
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
