import { apiGet, ApiError } from './api';
import type { Category, Paginated, Product, Ref } from '@/types/api';

export type ProductsQuery = Record<string, string | undefined>;

// товари завжди беремо свіжі: ціни й наявність змінюються
export const getProducts = (query: ProductsQuery) => {
  // порожні параметри не відправляємо
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }

  return apiGet<Paginated<Product>>(`/products?${params}`, {
    cache: 'no-store',
  });
};

export const getProduct = async (slug: string) => {
  try {
    return await apiGet<Product>(`/products/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
};

// бренди й категорії змінюються рідко, тому кешуємо їх на хвилину:
// новий бренд з адмінки з'явиться у фільтрах каталогу не пізніше ніж за 60 с
export const getBrands = () =>
  apiGet<Ref[]>('/brands', { next: { revalidate: 60 } });

export const getCategories = () =>
  apiGet<Category[]>('/categories', { next: { revalidate: 60 } });