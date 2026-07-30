import { apiClient } from "./client";
import { ApiResponse } from "./auth";
import { Prediction, User, Team, League } from "@/types/api";

// Payload & Data Types
export interface UpdateProfileInput {
  name?: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPredictions {
  predictions: Prediction[];
  meta: PaginationMeta;
}

export interface UserFavorites {
  teams: Team[];
  leagues: League[];
}

// ==========================================
// USER API METHODS
// ==========================================

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const { data } = await apiClient.patch<ApiResponse<{ user: User }>>(
    "/users/me",
    input,
  );
  return data.data.user;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<string> {
  const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
    "/users/me/change-password",
    input,
  );
  return data.data.accessToken;
}

export async function getSavedPredictions(
  page = 1,
  limit = 20,
): Promise<PaginatedPredictions> {
  const { data } = await apiClient.get<ApiResponse<PaginatedPredictions>>(
    "/users/me/saved-predictions",
    { params: { page, limit } },
  );
  return data.data;
}

export async function toggleSavedPrediction(
  predictionId: string,
): Promise<boolean> {
  const { data } = await apiClient.post<ApiResponse<{ saved: boolean }>>(
    `/users/me/saved-predictions/${predictionId}`,
  );
  return data.data.saved;
}

export async function getFavorites(): Promise<UserFavorites> {
  const { data } = await apiClient.get<ApiResponse<UserFavorites>>(
    "/users/me/favorites",
  );
  return data.data;
}

export async function toggleFavoriteTeam(teamId: string): Promise<boolean> {
  const { data } = await apiClient.post<ApiResponse<{ favorited: boolean }>>(
    `/users/me/favorites/teams/${teamId}`,
  );
  return data.data.favorited;
}

export async function toggleFavoriteLeague(leagueId: string): Promise<boolean> {
  const { data } = await apiClient.post<ApiResponse<{ favorited: boolean }>>(
    `/users/me/favorites/leagues/${leagueId}`,
  );
  return data.data.favorited;
}
