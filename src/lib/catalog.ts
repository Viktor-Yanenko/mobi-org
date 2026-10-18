import { apiGet, ApiError } from './api';
import { toSearchParams, type ProductsQuery } from './catalog-query';
import type { Category, Facets, Paginated, Product, Ref } from '@/types/api';

// товари завжди беремо свіжі: ціни й наявність змінюються
export const getProducts = (query: ProductsQuery) =>
  apiGet<Paginated<Product>>(`/products?${toSearchParams(query)}`, {
    cache: 'no-store',
  });

// які значення пам'яті й характеристик є серед знайдених товарів
export const getFacets = (query: ProductsQuery) =>
  apiGet<Facets>(`/products/facets?${toSearchParams(query)}`, {
    cache: 'no-store',
  });

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