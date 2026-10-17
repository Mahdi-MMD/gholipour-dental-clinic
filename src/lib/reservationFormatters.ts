// Convert English/Arabic numerals to Persian numerals
export const toPersianDigits = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num)
    .replace(/[0-9]/g, d => persianDigits[parseInt(d, 10)])
    .replace(/[\u0660-\u0669]/g, d => persianDigits[d.charCodeAt(0) - 0x0660]);
};

// Convert Persian and Arabic-Indic numerals to standard ASCII English digits
export const toEnglishDigits = (str: string | number): string => {
  return String(str)
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 1632));
};

// Clean phone number for tel: link protocol (requires ASCII digits and optional +)
export const cleanPhoneForTel = (phone: string): string => {
  return toEnglishDigits(phone).replace(/[^\d+]/g, '');
};

// Format Date to Persian standard string
export function formatToPersianDateTime(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}
