/**
 * Memastikan sebuah URL eksternal selalu diawali dengan https://
 * - Jika sudah ada https:// atau http://, dikembalikan apa adanya
 * - Jika kosong / whitespace saja, dikembalikan string kosong
 * - Jika hanya path relatif (dimulai dengan /), dikembalikan apa adanya
 * - Jika mailto: atau tel:, dikembalikan apa adanya
 * - Jika mengandung spasi (kemungkinan besar label / caption teks), dikembalikan apa adanya
 * - Selain itu (e.g. wa.me/..., bit.ly/..., forms.gle/...), ditambahkan https://
 */
export function ensureHttps(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }

  // Jika mengandung spasi di tengah teks, itu label tombol biasa (bukan link)
  if (/\s/.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
