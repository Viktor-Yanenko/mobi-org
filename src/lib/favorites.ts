import { apiFetch } from './client-api';
import type { FavoriteProduct } from '@/types/api';

// усі три запити повертають оновлений список обраного
export const getFavorites = () => apiFetch<FavoriteProduct[]>('/favorites');

export const addFavorite = (productId: string) =>
  apiFetch<FavoriteProduct[]>(`/favorites/${productId}`, { method: 'POST' });

export const removeFavorite = (productId: string) =>
  apiFetch<FavoriteProduct[]>(`/favorites/${productId}`, { method: 'DELETE' });