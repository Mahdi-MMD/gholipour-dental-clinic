/**
 * Validation and normalization rules for clinic reservations.
 */

export const ALREADY_RESERVED_MESSAGE =
  'شما در ۲۴ ساعت گذشته یک نوبت فعال ثبت کرده‌اید. امکان ثبت نوبت جدید تا ۲۴ ساعت پس از نوبت قبلی وجود ندارد.';

/**
 * Convert Persian and Arabic-Indic numerals to ASCII standard digits
 */
export function toAsciiDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
}

export interface NameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a patient name according to strict Persian naming rules:
 * - Persian characters only (Persian alphabet, spaces, and ZWNJ \u200c)
 * - No English characters allowed
 * - No numbers (0-9, ۰-۹, ٠-٩) allowed
 * - No symbols, punctuation, or emojis allowed
 * - Length limits: between 3 and 50 actual Persian letters (excluding spaces and ZWNJ)
 */
export function validate_persian_name(name: string): NameValidationResult {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return {
      isValid: false,
      error: 'لطفاً نام و نام خانوادگی را وارد نمایید.',
    };
  }

  const trimmed = name.trim();

  // Check for English characters
  if (/[a-zA-Z]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'استفاده از حروف انگلیسی در نام و نام خانوادگی مجاز نمی‌باشد.',
    };
  }

  // Check for Numbers (English, Persian, Arabic-Indic)
  if (/[0-9\u0660-\u0669\u06F0-\u06F9]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'استفاده از اعداد در نام و نام خانوادگی مجاز نمی‌باشد.',
    };
  }

  // Check for Persian alphabet letters, spaces, and ZWNJ (\u200C)
  // Persian unicode letters: \u0621-\u064A, \u067E, \u0686, \u0698, \u06A9, \u06AF, \u06CC
  const persianAlphabetRegex = /^[آابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیءأإؤئ\u200C\s]+$/u;
  if (!persianAlphabetRegex.test(trimmed)) {
    return {
      isValid: false,
      error:
        'نام فقط باید شامل حروف الفبای فارسی باشد (استفاده از علائم، نمادها و ایموجی مجاز نیست).',
    };
  }

  // Count actual Persian letters (excluding whitespace and ZWNJ)
  const lettersOnly = trimmed.replace(/[\s\u200C]/g, '');

  if (lettersOnly.length < 3) {
    return {
      isValid: false,
      error: 'نام و نام خانوادگی باید حداقل شامل ۳ حرف فارسی باشد.',
    };
  }

  if (lettersOnly.length > 50) {
    return {
      isValid: false,
      error: 'نام و نام خانوادگی نمی‌تواند بیش از ۵۰ حرف باشد.',
    };
  }

  return { isValid: true };
}

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string;
  error?: string;
}

/**
 * Normalizes and validates an Iranian phone number:
 * - Strips spaces, dashes, dots
 * - Converts Persian and Arabic numerals to standard digits
 * - Digits only: no symbols or letters are accepted
 * - Must start with 0 and be exactly 11 digits (e.g. 09121112233)
 * - Rejects numbers starting with 00 or international prefixes (+)
 */
export function normalize_and_validate_iran_phone(rawPhone: string): PhoneValidationResult {
  if (!rawPhone || typeof rawPhone !== 'string' || !rawPhone.trim()) {
    return {
      isValid: false,
      normalizedPhone: '',
      error: 'لطفاً شماره تماس همراه را وارد نمایید.',
    };
  }

  const trimmed = rawPhone.trim();

  // Convert Persian and Arabic digits to ASCII
  const asciiConverted = toAsciiDigits(trimmed);

  // Rejection of international numbers (starting with + or 00)
  if (asciiConverted.startsWith('+') || asciiConverted.startsWith('00')) {
    return {
      isValid: false,
      normalizedPhone: '',
      error: 'شماره‌های بین‌المللی یا پیش‌شماره ۰۰ مجاز نمی‌باشند. لطفاً شماره ایران وارد نمایید.',
    };
  }

  // Strip allowed separators: spaces, dashes, dots
  const stripped = asciiConverted.replace(/[\s\-\.]/g, '');

  // Must only contain digits (no letters, symbols, punctuation)
  if (!/^\d+$/.test(stripped)) {
    return {
      isValid: false,
      normalizedPhone: '',
      error: 'شماره تماس فقط باید شامل ارقام باشد (استفاده از حروف و علائم مجاز نیست).',
    };
  }

  // Must start with 0
  if (!stripped.startsWith('0')) {
    return {
      isValid: false,
      normalizedPhone: '',
      error: 'شماره همراه باید با ۰ شروع شود (مثال: ۰۹۱۲۳۴۵۶۷۸۹).',
    };
  }

  // Must be exactly 11 digits
  if (stripped.length !== 11) {
    return {
      isValid: false,
      normalizedPhone: '',
      error: 'شماره همراه باید دقیقاً ۱۱ رقم باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹).',
    };
  }

  return {
    isValid: true,
    normalizedPhone: stripped,
  };
}
