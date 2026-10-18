import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GALLERY_ITEMS, GalleryItem } from '@/data/galleryData';
import { verifyAdminSession } from '@/lib/adminAuth';

const GALLERY_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'galleryData.ts');

export async function GET() {
  try {
    return NextResponse.json({ success: true, items: GALLERY_ITEMS });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const item: GalleryItem = body.item || body;
    const isNew: boolean = Boolean(body.isNew);

    if (!item.title) {
      return NextResponse.json(
        { success: false, message: 'عنوان نمونه کار الزامی است.' },
        { status: 400 }
      );
    }

    // Read current galleryData.ts file
    const fileContent = await fs.readFile(GALLERY_FILE_PATH, 'utf-8');

    // Make a clone of GALLERY_ITEMS
    const existingItems = [...GALLERY_ITEMS];

    // Determine if updating or creating
    let index = -1;
    if (!isNew && item.id) {
      index = existingItems.findIndex(i => i.id === item.id);
    }

    let savedItem: GalleryItem;
    if (index >= 0) {
      // Update existing item
      existingItems[index] = { ...existingItems[index], ...item };
      savedItem = existingItems[index];
    } else {
      // Generate unique ID
      const baseSlug = item.id
        ? item.id
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
        : `gallery-${Date.now()}`;
      let uniqueId = baseSlug;
      let counter = 1;
      while (existingItems.some(i => i.id === uniqueId)) {
        uniqueId = `${baseSlug}-${counter++}`;
      }
      item.id = uniqueId;
      existingItems.unshift(item); // Put new item at top
      savedItem = item;
    }

    // Preserve header before GALLERY_ITEMS and footer after GALLERY_ITEMS
    const startMarker = 'export const GALLERY_ITEMS: GalleryItem[] = [';
    const endMarker = 'export const GALLERY_CATEGORIES = [';

    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not locate GALLERY_ITEMS markers in galleryData.ts');
    }

    const header = fileContent.substring(0, startIndex);
    const footer = fileContent.substring(endIndex);

    const formattedData = `export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(
      existingItems,
      null,
      2
    )};\n\n`;

    const updatedFileContent = `${header}${formattedData}${footer}`;
    await fs.writeFile(GALLERY_FILE_PATH, updatedFileContent, 'utf-8');

    // Update in-memory items
    GALLERY_ITEMS.length = 0;
    GALLERY_ITEMS.push(...existingItems);

    return NextResponse.json({
      success: true,
      message: 'نمونه کار با موفقیت ذخیره شد.',
      item: savedItem,
    });
  } catch (error) {
    console.error('Save gallery error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ذخیره‌سازی نمونه کار: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه نمونه کار الزامی است.' },
        { status: 400 }
      );
    }

    const fileContent = await fs.readFile(GALLERY_FILE_PATH, 'utf-8');
    const existingItems = GALLERY_ITEMS.filter(i => i.id !== id);

    const startMarker = 'export const GALLERY_ITEMS: GalleryItem[] = [';
    const endMarker = 'export const GALLERY_CATEGORIES = [';

    const startIndex = fileContent.indexOf(startMarker);
    const endIndex = fileContent.indexOf(endMarker);

    if (startIndex === -1 || endIndex === -1) {
      throw new Error('Could not locate GALLERY_ITEMS markers in galleryData.ts');
    }

    const header = fileContent.substring(0, startIndex);
    const footer = fileContent.substring(endIndex);

    const formattedData = `export const GALLERY_ITEMS: GalleryItem[] = ${JSON.stringify(
      existingItems,
      null,
      2
    )};\n\n`;

    const updatedFileContent = `${header}${formattedData}${footer}`;
    await fs.writeFile(GALLERY_FILE_PATH, updatedFileContent, 'utf-8');

    GALLERY_ITEMS.length = 0;
    GALLERY_ITEMS.push(...existingItems);

    return NextResponse.json({
      success: true,
      message: 'نمونه کار با موفقیت حذف شد.',
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف نمونه کار: ' + String(error) },
      { status: 500 }
    );
  }
}
