const SIERRA_LEONE_COUNTRY_CODE = "232";
const SIERRA_LEONE_LOCAL_DIGITS = 9;

/** Keep the characters that are useful while a phone number is being typed. */
export function sanitizePhoneInput(value: string) {
  const cleaned = value.replace(/[^0-9+()\s-]/g, "");
  const hasLeadingPlus = cleaned.startsWith("+");
  const body = cleaned.slice(hasLeadingPlus ? 1 : 0).replace(/\+/g, "");
  return `${hasLeadingPlus ? "+" : ""}${body}`.slice(0, 24);
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Accept Sierra Leone international numbers (+232XXXXXXXX) and local numbers
 * (0XXXXXXXX), including the common `(0) 77 123 456` presentation.
 */
export function isValidPhone(value: string) {
  const trimmed = value.trim();
  const digits = phoneDigits(trimmed);

  if (trimmed.startsWith("+")) {
    return digits.startsWith(SIERRA_LEONE_COUNTRY_CODE) && digits.length === 11;
  }

  return digits.startsWith("0") && digits.length === SIERRA_LEONE_LOCAL_DIGITS;
}

/** Store valid phone numbers in a consistent international format. */
export function normalizePhone(value: string) {
  const trimmed = value.trim();
  if (!isValidPhone(trimmed)) return trimmed;

  const digits = phoneDigits(trimmed);
  if (trimmed.startsWith("+")) return `+${digits}`;
  return `+${SIERRA_LEONE_COUNTRY_CODE}${digits.slice(1)}`;
}

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function isValidCardNumber(value: string) {
  return /^\d{13,16}$/.test(value.replace(/\D/g, ""));
}

export function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/** Card expiry is valid through the final day of the selected month. */
export function isValidExpiry(value: string, now = new Date()) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2));
  if (month < 1 || month > 12) return false;

  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

export function isValidCVV(value: string) {
  return /^\d{3,4}$/.test(value);
}

export function requireFields(fields: Record<string, string>) {
  const missing = Object.entries(fields).find(([, value]) => !value.trim());
  return missing ? `${missing[0]} is required.` : null;
}
