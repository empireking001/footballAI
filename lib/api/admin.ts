import { apiClient } from './client';
import { ApiResponse } from './auth';
import { PaginationMeta } from '@/types/api';

// Admin Table Filtering & Pagination Parameters
export interface AdminListParams {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined | null;
}

export interface AdminListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

function normalizePagination(
  response: Partial<{ meta: PaginationMeta; pagination: PaginationMeta }>,
): PaginationMeta {
  return response.meta ?? response.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 };
}

/**
 * Generic, typed helpers for /admin/* CRUD endpoints.
 * Every admin entity page (leagues, predictions, users, coupons, blog posts, etc.)
 * leverages these core functions to execute API requests cleanly.
 */

export async function adminList<T>(
  resource: string,
  params: AdminListParams = {},
): Promise<AdminListResponse<T>> {
  const { data } = await apiClient.get<
    ApiResponse<T[]> & {
      items?: T[];
      meta?: PaginationMeta;
      pagination?: PaginationMeta;
    }
  >(`/admin/${resource}`, { params });

  return {
    data: Array.isArray(data.data) ? data.data : data.items ?? [],
    meta: normalizePagination(data),
  };
}

export async function adminGet<T>(resource: string, id: string): Promise<T> {
  const { data } = await apiClient.get<ApiResponse<T>>(`/admin/${resource}/${id}`);
  return data.data;
}

export async function adminCreate<T, P = unknown>(
  resource: string,
  body: P,
): Promise<T> {
  const { data } = await apiClient.post<ApiResponse<T>>(`/admin/${resource}`, body);
  return data.data;
}

export async function adminUpdate<T, P = unknown>(
  resource: string,
  id: string,
  body: P,
): Promise<T> {
  const { data } = await apiClient.patch<ApiResponse<T>>(`/admin/${resource}/${id}`, body);
  return data.data;
}

export async function adminSyncFixtures(body: { leagueId: string; from: string; to: string }): Promise<{ message?: string }> {
  const { data } = await apiClient.post<ApiResponse<null>>('/admin/matches/sync', body);
  return { message: data.message };
}

export async function adminRemove(
  resource: string,
  id: string,
): Promise<{ message?: string }> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/${resource}/${id}`);
  return { message: data.message };
}