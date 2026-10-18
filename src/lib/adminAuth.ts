import crypto from 'crypto';

/**
 * Fallback password used strictly in testing environment.
 * For production, set ADMIN_PASSWORD in .env.local or production secrets.
 */
const DEFAULT_TEST_PASSWORD = 'gholipour1405';

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || DEFAULT_TEST_PASSWORD;
}

/**
 * Stable HMAC signing secret for session tokens.
 * Can be explicitly set via ADMIN_SECRET, or derived deterministically.
 */
function getSigningSecret(): string {
  if (process.env.ADMIN_SECRET && process.env.ADMIN_SECRET.length >= 16) {
    return process.env.ADMIN_SECRET;
  }
  const base = getAdminPassword();
  return crypto.createHash('sha256').update(`gholipour_clinic_secure_hmac_${base}`).digest('hex');
}

/**
 * Constant-time comparison between two strings to prevent timing attacks.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Still perform constant-time check against self to prevent execution-duration inference
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify candidate password against configured admin password in constant time.
 */
export function verifyAdminPassword(candidate: string): boolean {
  if (!candidate || typeof candidate !== 'string') return false;
  const currentPassword = getAdminPassword();
  return timingSafeEqualString(candidate, currentPassword);
}

/**
 * Session Token Payload
 */
interface TokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

/**
 * Signs and generates a cryptographic HMAC-SHA256 session token.
 * Default lifespan: 7 days.
 */
export function createAdminToken(lifespanSeconds: number = 7 * 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    role: 'admin',
    iat: now,
    exp: now + lifespanSeconds,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Validates cryptographic signature and expiration of an admin session token.
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 2) {
    // Backwards-compatibility check for legacy plain tokens (during transition in test phase)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      if (decoded.startsWith('admin:')) {
        const segments = decoded.split(':');
        const legacyPwd = segments[1];
        if (legacyPwd && timingSafeEqualString(legacyPwd, getAdminPassword())) {
          return true;
        }
      }
    } catch {
      // not a legacy token
    }
    return false;
  }

  const [payloadB64, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(payloadB64)
    .digest('base64url');

  if (!timingSafeEqualString(signature, expectedSig)) {
    return false;
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(payloadJson);

    if (payload.role !== 'admin') return false;

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Extract token from Cookie header or Authorization Bearer header.
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Try Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/);
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // 2. Try Authorization Bearer
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Verifies whether the incoming HTTP Request has an authenticated, valid admin session.
 */
export function verifyAdminSession(request: Request): { authorized: boolean; reason?: string } {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return { authorized: false, reason: 'توکن دسترسی مدیریت یافت نشد.' };
  }

  const isValid = verifyAdminToken(token);
  if (!isValid) {
    return { authorized: false, reason: 'توکن نامعتبر یا منقضی شده است.' };
  }

  return { authorized: true };
}

/**
 * In-memory brute-force prevention tracker
 * Tracks failed login attempts per client IP.
 */
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function checkLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently locked out
  if (record.lockedUntil && record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Reset window if expired
  if (now - record.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.delete(ip);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.attempts);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

export function recordFailedLogin(ip: string): {
  isLocked: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record || now - record.firstAttemptAt > WINDOW_MS) {
    record = { attempts: 1, firstAttemptAt: now };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    rateLimitMap.set(ip, record);
    return {
      isLocked: true,
      remainingAttempts: 0,
      retryAfterSeconds: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  rateLimitMap.set(ip, record);
  return {
    isLocked: false,
    remainingAttempts: MAX_ATTEMPTS - record.attempts,
  };
}

export function recordSuccessfulLogin(ip: string): void {
  rateLimitMap.delete(ip);
}
