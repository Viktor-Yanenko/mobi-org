import { apiGet, ApiError } from './api';
import type { Category, Facets, Paginated, Product, Ref } from '@/types/api';

// масив — це кілька значень одного фільтра: ?ram=8&ram=12
export type ProductsQuery = Record<string, string | string[] | undefined>;

// вибрані чекбокси у фільтрах каталогу
export type SelectedFilters = Record<'ram' | 'storage' | 'attr', string[]>;

// порожні параметри не відправляємо, масиви додаємо по одному значенню
export const toSearchParams = (query: ProductsQuery) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value ?? []].flat()) {
      if (item) params.append(key, item);
    }
  }
  return params;
};

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