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

/**
 * Resolves an asset URL (e.g. uploaded images, signed file tokens, QRIS).
 * If the URL is already absolute (http://, https://, blob:, data:), returns it as is.
 * Otherwise, prepends the configured API base URL so the browser loads it from the API origin,
 * preventing 404s when SPA and API are hosted on different origins or ports.
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || "https://api.skyshareacademy.id"
  ).replace(/\/+$/, "");

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${baseUrl}${path}`;
}
