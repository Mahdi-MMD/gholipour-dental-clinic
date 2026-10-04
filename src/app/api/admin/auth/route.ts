import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const correctPassword = process.env.ADMIN_PASSWORD || 'gholipour1405';

    if (password === correctPassword) {
      // In production, this can be an HMAC-signed token or encrypted cookie
      const token = Buffer.from(`admin:${correctPassword}:${Date.now()}`).toString('base64');
      const response = NextResponse.json({ success: true, token });
      
      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'رمز عبور وارد شده نادرست است' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: 'خطا در احراز هویت' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Check auth cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const hasToken = cookieHeader.includes('admin_token=');
  return NextResponse.json({ authenticated: hasToken });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
  });
  return response;
}
