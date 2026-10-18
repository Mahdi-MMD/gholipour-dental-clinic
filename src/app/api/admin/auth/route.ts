import { NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  createAdminToken,
  verifyAdminSession,
  getClientIp,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
} from '@/lib/adminAuth';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkLoginRateLimit(ip);

    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.retryAfterSeconds || 60) / 60);
      return NextResponse.json(
        {
          success: false,
          message: `تعداد تلاش‌های ناموفق بیش از حد مجاز است. به دلایل امنیتی دسترسی این IP به مدت ${minutes} دقیقه مسدود شده است.`,
          locked: true,
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';

    const isMatch = verifyAdminPassword(password);

    if (isMatch) {
      recordSuccessfulLogin(ip);
      const token = createAdminToken();
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

    const failStatus = recordFailedLogin(ip);
    if (failStatus.isLocked) {
      const minutes = Math.ceil((failStatus.retryAfterSeconds || 60) / 60);
      return NextResponse.json(
        {
          success: false,
          message: `رمز عبور نامعتبر است. حساب شما به دلیل تکرار تلاش اشتباه به مدت ${minutes} دقیقه مسدود گردید.`,
          locked: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `رمز عبور وارد شده نادرست است (${failStatus.remainingAttempts} تلاش باقی‌مانده).`,
        remainingAttempts: failStatus.remainingAttempts,
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در احراز هویت' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Cryptographically verify session cookie and expiration
  const session = verifyAdminSession(request);
  return NextResponse.json({ authenticated: session.authorized });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'خروج موفقیت‌آمیز' });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}

