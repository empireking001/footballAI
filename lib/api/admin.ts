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
    ApiResponse<T[]> & { meta: PaginationMeta }
  >(`/admin/${resource}`, { params });
  return { data: data.data, meta: data.meta };
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

export async function adminRemove(
  resource: string,
  id: string,
): Promise<{ message?: string }> {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/admin/${resource}/${id}`);
  return { message: data.message };
}