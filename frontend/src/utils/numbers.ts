const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function normalizeDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

export function parseLocalizedInt(str: string): number | undefined {
  const normalized = normalizeDigits(str).replace(/[^\d]/g, "");
  if (!normalized) return undefined;
  const n = Number.parseInt(normalized, 10);
  return Number.isNaN(n) ? undefined : n;
}

export function parseLocalizedNumber(str: string): number | undefined {
  const normalized = normalizeDigits(str).replace(/[^\d.]/g, "");
  if (!normalized) return undefined;
  const n = Number(normalized);
  return Number.isNaN(n) ? undefined : n;
}

export function formatPersianNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return n.toLocaleString("fa-IR", options);
}

export function formatPriceDisplay(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "";
  return formatPersianNumber(n);
}

export function formatIntegerDisplay(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "";
  return formatPersianNumber(n, { maximumFractionDigits: 0 });
}
