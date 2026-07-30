import { ApiResponse } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface FetchOptions extends Omit<RequestInit, "next"> {
  revalidate?: number | false; // Seconds for ISR caching; false to disable caching
  tags?: string[]; // Cache tags for demand-based revalidation via revalidateTag()
}

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  status: number | null;
}

/**
 * Typed fetch helper designed exclusively for Server Components and Server Actions.
 * Integrates directly with Next.js native fetch caching (ISR, tags, memoization)
 * and safely unwraps Express backend responses without throwing unhandled exceptions.
 */
export async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<FetchResult<T>> {
  const { revalidate, tags, headers, cache, ...restOptions } = options;

  // 1. Safe URL normalization
  const cleanBaseUrl = API_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const targetUrl = `${cleanBaseUrl}${cleanPath}`;

  // 2. Configure Next.js specific caching options
  const nextConfig: { revalidate?: number | false; tags?: string[] } = {};
  if (revalidate !== undefined) nextConfig.revalidate = revalidate;
  if (tags && tags.length > 0) nextConfig.tags = tags;

  try {
    const res = await fetch(targetUrl, {
      ...restOptions,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(Object.keys(nextConfig).length > 0 ? { next: nextConfig } : {}),
      cache: revalidate === undefined && !tags ? cache || "no-store" : cache,
    });

    // Attempt to safely extract json body regardless of status code
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    // Handle Non-2xx Responses cleanly
    if (!res.ok) {
      const errorMessage =
        json?.message || `Request failed with status code ${res.status}`;
      return {
        data: null,
        error: errorMessage,
        status: res.status,
      };
    }

    return {
      data: json?.data ?? null,
      error: null,
      status: res.status,
    };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error ? err.message : "Unable to reach the API server",
      status: null,
    };
  }
}
