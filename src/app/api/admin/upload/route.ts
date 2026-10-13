import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'فایلی انتخاب نشده است.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file base name
    const timestamp = Date.now();
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const ext = path.extname(cleanFileName);
    const baseName = path.basename(cleanFileName, ext);

    const uploadDir = path.join(process.cwd(), 'public', 'assets');

    // Attempt instant on-the-fly WebP conversion if format is convertible
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      try {
        const webpName = `upload-${timestamp}-${baseName}.webp`;
        const webpPath = path.join(uploadDir, webpName);

        const convertedBuffer = await sharp(buffer).webp({ quality: 82, effort: 6 }).toBuffer();

        await fs.writeFile(webpPath, convertedBuffer);

        return NextResponse.json({
          success: true,
          url: `/assets/${webpName}`,
          fileName: webpName,
          converted: true,
        });
      } catch (conversionErr) {
        console.warn(
          'On-upload Sharp conversion warning, falling back to original write:',
          conversionErr
        );
      }
    }

    // Default / fallback save (for already .webp files, SVGs, or if sharp encountered an issue)
    const finalName = `upload-${timestamp}-${cleanFileName}`;
    const filePath = path.join(uploadDir, finalName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/assets/${finalName}`,
      fileName: finalName,
      converted: false,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری تصویر.' },
      { status: 500 }
    );
  }
}
