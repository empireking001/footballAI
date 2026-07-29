import { apiClient } from './client';
import { PaginationMeta } from '@/types/api';

export interface AdminListParams {
  page?: number;
  limit?: number;
  q?: string;
  [key: string]: string | number | undefined;
}

interface AdminListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Generic, typed helpers for the /admin/* CRUD endpoints — every admin
 * entity page (leagues, coupons, blog posts, etc.) is built on these four
 * functions plus a resource path, instead of hand-rolling fetch calls per
 * entity. */
export async function adminList<T>(resource: string, params: AdminListParams = {}): Promise<AdminListResponse<T>> {
  const { data } = await apiClient.get<AdminListResponse<T>>(`/admin/${resource}`, { params });
  return data;
}

export async function adminGet<T>(resource: string, id: string): Promise<T> {
  const { data } = await apiClient.get<{ data: T }>(`/admin/${resource}/${id}`);
  return data.data;
}

export async function adminCreate<T>(resource: string, body: unknown): Promise<T> {
  const { data } = await apiClient.post<{ data: T }>(`/admin/${resource}`, body);
  return data.data;
}

export async function adminUpdate<T>(resource: string, id: string, body: unknown): Promise<T> {
  const { data } = await apiClient.patch<{ data: T }>(`/admin/${resource}/${id}`, body);
  return data.data;
}

export async function adminRemove(resource: string, id: string): Promise<void> {
  await apiClient.delete(`/admin/${resource}/${id}`);
}
