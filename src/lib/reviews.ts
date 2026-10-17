import { apiFetch } from './client-api';
import type { Paginated, Review, ReviewData } from '@/types/api';

export const REVIEWS_PER_PAGE = 5;

export const getReviews = (productId: string, page: number) =>
  apiFetch<Paginated<Review>>(
    `/products/${productId}/reviews?page=${page}&perPage=${REVIEWS_PER_PAGE}`,
  );

export const createReview = (productId: string, data: ReviewData) =>
  apiFetch<Review>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateReview = (reviewId: string, data: ReviewData) =>
  apiFetch<Review>(`/reviews/${reviewId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteReview = (reviewId: string) =>
  apiFetch<null>(`/reviews/${reviewId}`, { method: 'DELETE' });