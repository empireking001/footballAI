import { ApiResponse } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface FetchOptions {
  revalidate?: number; // seconds; omit for no caching
  tags?: string[];
}

/**
 * Typed fetch helper for Server Components. Uses Next.js's built-in fetch
 * caching (`revalidate`/`tags`) instead of a client library, since this
 * runs on the server and benefits from Next's request memoization + ISR.
 * Never throws on a non-2xx — callers get `{ data: null }` and render an
 * empty/error state instead of crashing the page.
 */
export async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T | null; error: string | null; status: number | null }> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: options.revalidate !== undefined ? { revalidate: options.revalidate, tags: options.tags } : undefined,
      cache: options.revalidate === undefined ? 'no-store' : undefined,
    });

    if (!res.ok) {
      return { data: null, error: `Request failed (${res.status})`, status: res.status };
    }

    const json = (await res.json()) as ApiResponse<T>;
    return { data: json.data, error: null, status: res.status };
  } catch {
    return { data: null, error: 'Unable to reach the API', status: null };
  }
}
