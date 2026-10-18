import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { verifyAdminSession } from '@/lib/adminAuth';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function POST(request: Request) {
  try {
    // 1. Enforce admin authentication
    const session = verifyAdminSession(request);
    if (!session.authorized) {
      return NextResponse.json(
        { success: false, message: session.reason || 'دسترسی غیرمجاز.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'فایلی انتخاب نشده است.' },
        { status: 400 }
      );
    }

    // 2. Enforce file size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: 'حجم تصویر نباید بیشتر از ۵ مگابایت باشد.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Extension allowlist check
    const rawFileName = (file.name || 'image').toLowerCase();
    const ext = path.extname(rawFileName);
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        {
          success: false,
          message: 'فرمت فایل نامعتبر است. فقط تصاویر JPG، PNG و WebP مجاز هستند.',
        },
        { status: 400 }
      );
    }

    // 4. Validate image binary header via Sharp (blocks polyglot scripts / non-images)
    let imageMeta;
    try {
      imageMeta = await sharp(buffer).metadata();
      if (!imageMeta.format || !['jpeg', 'png', 'webp'].includes(imageMeta.format)) {
        return NextResponse.json(
          { success: false, message: 'محتوای فایل ارسالی با فرمت تصویری معتبر همخوانی ندارد.' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'فایل ارسالی آسیب‌دیده یا تصویر معتبری نیست.' },
        { status: 400 }
      );
    }

    // 5. Sanitize file name & guard against directory traversal
    const timestamp = Date.now();
    const rawBaseName = path.basename(rawFileName, ext);
    const cleanBaseName =
      rawBaseName
        .replace(/[^a-z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 50) || 'image';

    const uploadDir = path.join(process.cwd(), 'public', 'assets');

    // 6. Convert to high-quality optimized WebP
    try {
      const webpName = `upload-${timestamp}-${cleanBaseName}.webp`;
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
      console.warn('Sharp conversion warning, falling back to direct webp write:', conversionErr);
      const safeName = `upload-${timestamp}-${cleanBaseName}${ext}`;
      const safePath = path.join(uploadDir, safeName);
      await fs.writeFile(safePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/assets/${safeName}`,
        fileName: safeName,
        converted: false,
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در بارگذاری تصویر.' },
      { status: 500 }
    );
  }
}

