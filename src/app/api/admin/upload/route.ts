import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'فایلی انتخاب نشده است.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const timestamp = Date.now();
    const cleanFileName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');
    const finalName = `upload-${timestamp}-${cleanFileName}`;

    const uploadDir = path.join(process.cwd(), 'public', 'assets');
    const filePath = path.join(uploadDir, finalName);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/assets/${finalName}`,
      fileName: finalName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'خطا در بارگذاری تصویر.' }, { status: 500 });
  }
}
