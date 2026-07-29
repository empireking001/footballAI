import { apiClient } from './client';
import { Prediction, User, Team, League } from '@/types/api';

export async function updateProfile(input: { name?: string; avatarUrl?: string }): Promise<User> {
  const { data } = await apiClient.patch<{ data: { user: User } }>('/users/me', input);
  return data.data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  const { data } = await apiClient.post<{ data: { accessToken: string } }>(
    '/users/me/change-password',
    { currentPassword, newPassword },
  );
  return data.data.accessToken;
}

export async function getSavedPredictions(page = 1, limit = 20): Promise<{ data: Prediction[]; meta: unknown }> {
  const { data } = await apiClient.get('/users/me/saved-predictions', { params: { page, limit } });
  return data;
}

export async function toggleSavedPrediction(predictionId: string): Promise<boolean> {
  const { data } = await apiClient.post<{ data: { saved: boolean } }>(
    `/users/me/saved-predictions/${predictionId}`,
  );
  return data.data.saved;
}

export async function getFavorites(): Promise<{ teams: Team[]; leagues: League[] }> {
  const { data } = await apiClient.get<{ data: { teams: Team[]; leagues: League[] } }>(
    '/users/me/favorites',
  );
  return data.data;
}

export async function toggleFavoriteTeam(teamId: string): Promise<boolean> {
  const { data } = await apiClient.post<{ data: { favorited: boolean } }>(
    `/users/me/favorites/teams/${teamId}`,
  );
  return data.data.favorited;
}

export async function toggleFavoriteLeague(leagueId: string): Promise<boolean> {
  const { data } = await apiClient.post<{ data: { favorited: boolean } }>(
    `/users/me/favorites/leagues/${leagueId}`,
  );
  return data.data.favorited;
}
