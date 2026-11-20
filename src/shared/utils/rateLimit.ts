/**
 * Utility to extract retry-after wait time in seconds from Axios HTTP 429 response.
 * Checks:
 * 1. Retry-After response header (seconds or HTTP date)
 * 2. RateLimit-Reset / X-RateLimit-Reset header (delta seconds or epoch timestamp)
 * 3. Response body fields (retry_after, retry_after_seconds, etc.)
 */
export function extractRetryAfter(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;

  const err = error as {
    response?: {
      headers?: Record<string, unknown> & {
        get?: (name: string) => unknown;
      };
      data?: {
        retry_after?: unknown;
        retry_after_seconds?: unknown;
        data?: {
          retry_after?: unknown;
          retry_after_seconds?: unknown;
        };
      };
    };
  };

  const headers = err.response?.headers;
  const data = err.response?.data;

  // 1. Try Retry-After header (could be seconds or HTTP date string)
  const retryHeader =
    headers?.["retry-after"] ??
    (typeof headers?.get === "function" ? headers.get("retry-after") : undefined);

  if (retryHeader !== undefined && retryHeader !== null && retryHeader !== "") {
    const numeric = Number(retryHeader);
    if (!isNaN(numeric) && numeric > 0) {
      return Math.ceil(numeric);
    }
    const dateMs = Date.parse(String(retryHeader));
    if (!isNaN(dateMs)) {
      const diffSec = Math.ceil((dateMs - Date.now()) / 1000);
      if (diffSec > 0) return diffSec;
    }
  }

  // 2. Try RateLimit-Reset / X-RateLimit-Reset header
  const resetHeader =
    headers?.["ratelimit-reset"] ??
    headers?.["x-ratelimit-reset"] ??
    (typeof headers?.get === "function"
      ? headers.get("ratelimit-reset") || headers.get("x-ratelimit-reset")
      : undefined);

  if (resetHeader !== undefined && resetHeader !== null && resetHeader !== "") {
    const numeric = Number(resetHeader);
    if (!isNaN(numeric) && numeric > 0) {
      if (numeric > 1_000_000_000) {
        const diffSec = Math.ceil(numeric - Date.now() / 1000);
        if (diffSec > 0) return diffSec;
      } else {
        return Math.ceil(numeric);
      }
    }
  }

  // 3. Try response body fields
  const bodyCandidate =
    data?.retry_after ??
    data?.retry_after_seconds ??
    data?.data?.retry_after ??
    data?.data?.retry_after_seconds;

  if (typeof bodyCandidate === "number" && bodyCandidate > 0) {
    return Math.ceil(bodyCandidate);
  }
  if (typeof bodyCandidate === "string") {
    const numeric = Number(bodyCandidate);
    if (!isNaN(numeric) && numeric > 0) return Math.ceil(numeric);
  }

  return null;
}

/**
 * Builds a user-friendly message for HTTP 429 response.
 */
export function formatRateLimitMessage(
  error: unknown,
  retrySeconds?: number | null
): string {
  const err = error as {
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  const serverMsg = err?.response?.data?.message?.trim();
  const defaultMsg = "Terlalu banyak permintaan, coba lagi nanti.";
  const base = serverMsg || defaultMsg;

  const seconds =
    retrySeconds !== undefined ? retrySeconds : extractRetryAfter(error);

  if (seconds && seconds > 0) {
    if (/\b\d+\s*(detik|s|seconds)\b/i.test(base)) {
      return base;
    }
    const cleanBase = base.endsWith(".") ? base : `${base}.`;
    return `${cleanBase} Silakan tunggu ${seconds} detik sebelum mencoba lagi.`;
  }

  return base;
}
