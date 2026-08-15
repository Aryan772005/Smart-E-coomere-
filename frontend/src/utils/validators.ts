const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[+]?[0-9]{10,15}$/;
const OTP_REGEX = /^[0-9]{6}$/;

export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isPhone(value: string): boolean {
  return PHONE_REGEX.test(value.replace(/[\s-]/g, ""));
}

export function isOtp(value: string): boolean {
  return OTP_REGEX.test(value.trim());
}

export function isStrongPassword(value: string): boolean {
  return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
}

export function isEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length === 0;
}

export function isPositiveNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}
