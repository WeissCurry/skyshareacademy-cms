/**
 * Converts a Date object or date string into a local YYYY-MM-DD string key
 * using local timezone methods (getFullYear, getMonth, getDate).
 *
 * If the input is already a 'YYYY-MM-DD' string (as returned by the analytics API),
 * it returns that string directly to avoid timezone shifts from UTC parsing.
 */
export function toLocalDateKey(date: Date | string): string {
  if (typeof date === "string") {
    // If it's already 'YYYY-MM-DD' (10 chars), preserve it as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return date;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
