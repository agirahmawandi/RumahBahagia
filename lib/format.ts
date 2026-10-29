import { format, isToday, isYesterday, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";

const idrFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

/**
 * Format angka menjadi format Rupiah sesuai Design Brief (DBD §7):
 * - Normal: "Rp 1.250.000"
 * - Negatif: "−Rp 250.000" (menggunakan karakter minus unicode U+2212)
 * - Compact (kartu kecil): "Rp 1,2 jt", "Rp 3,4 M"
 */
export function formatRupiah(
  value: number | string | null | undefined,
  options?: { compact?: boolean; showPlus?: boolean }
): string {
  const num = typeof value === "string" ? Number(value) : (value ?? 0);
  if (Number.isNaN(num)) return "Rp 0";

  const isNegative = num < 0;
  const absVal = Math.abs(num);
  const signPrefix = isNegative ? "−" : options?.showPlus && absVal > 0 ? "+" : "";

  if (options?.compact) {
    if (absVal >= 1_000_000_000) {
      const m = (absVal / 1_000_000_000).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      });
      return `${signPrefix}Rp ${m} M`;
    }
    if (absVal >= 1_000_000) {
      const jt = (absVal / 1_000_000).toLocaleString("id-ID", {
        maximumFractionDigits: 1,
      });
      return `${signPrefix}Rp ${jt} jt`;
    }
    if (absVal >= 100_000) {
      const rb = (absVal / 1_000).toLocaleString("id-ID", {
        maximumFractionDigits: 0,
      });
      return `${signPrefix}Rp ${rb} rb`;
    }
  }

  return `${signPrefix}Rp ${idrFormatter.format(Math.round(absVal))}`;
}

/**
 * Format input string angka ribuan (tanpa prefix "Rp ") untuk komponen Input Nominal
 */
export function formatNominalInput(value: number | string): string {
  const digits = String(value).replace(/\D/g, "");
  if (!digits) return "";
  return idrFormatter.format(Number(digits));
}

/**
 * Mengambil nilai numerik murni dari string input nominal ribuan
 */
export function parseNominalInput(formatted: string): number {
  const digits = formatted.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

/**
 * Format tanggal ke Bahasa Indonesia (default: "28 Okt 2026")
 */
export function formatTanggal(
  date: Date | string | null | undefined,
  pattern = "d MMM yyyy"
): string {
  if (!date) return "-";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (Number.isNaN(parsed.getTime())) return "-";
  return format(parsed, pattern, { locale: idLocale });
}

/**
 * Format label grup tanggal untuk daftar transaksi ("Hari ini", "Kemarin", atau "28 Okt 2026")
 */
export function formatTanggalGrup(date: Date | string): string {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (Number.isNaN(parsed.getTime())) return "-";
  if (isToday(parsed)) return `Hari ini · ${format(parsed, "d MMM yyyy", { locale: idLocale })}`;
  if (isYesterday(parsed))
    return `Kemarin · ${format(parsed, "d MMM yyyy", { locale: idLocale })}`;
  return format(parsed, "EEEE, d MMM yyyy", { locale: idLocale });
}

