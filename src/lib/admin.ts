import { apiFetch } from './client-api';
import type {
  AdminOrder,
  Category,
  OrderStats,
  OrderStatus,
  Paginated,
  Product,
  Ref,
  WithCount,
} from '@/types/api';

// ---------- довідники ----------

export const getBrands = () => apiFetch<Ref[]>('/brands');
export const getCategories = () => apiFetch<Category[]>('/categories');

// ---------- керування брендами й категоріями ----------

export type RefPayload = { name?: string; slug?: string; type?: string };

export const getBrandsWithCounts = () =>
  apiFetch<WithCount<Ref>[]>('/brands/all');

export const createBrand = (payload: RefPayload) =>
  apiFetch<Ref>('/brands', { method: 'POST', body: JSON.stringify(payload) });

export const updateBrand = (id: string, payload: RefPayload) =>
  apiFetch<Ref>(`/brands/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteBrand = (id: string) =>
  apiFetch<null>(`/brands/${id}`, { method: 'DELETE' });

export const getCategoriesWithCounts = () =>
  apiFetch<WithCount<Category>[]>('/categories/all');

export const createCategory = (payload: RefPayload) =>
  apiFetch<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateCategory = (id: string, payload: RefPayload) =>
  apiFetch<Category>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteCategory = (id: string) =>
  apiFetch<null>(`/categories/${id}`, { method: 'DELETE' });

// ---------- товари ----------

export const getAdminProducts = (params: Record<string, string>) =>
  apiFetch<Paginated<Product>>(`/products?${new URLSearchParams(params)}`);

export const getProductBySlug = (slug: string) =>
  apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);

// тіло POST і PATCH /products: лише ті поля, які дозволяє Joi-схема бекенду
export type ProductPayload = Record<string, unknown>;

export const createProduct = (payload: ProductPayload) =>
  apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const updateProduct = (productId: string, payload: ProductPayload) =>
  apiFetch<Product>(`/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

export const deleteProduct = (productId: string) =>
  apiFetch<null>(`/products/${productId}`, { method: 'DELETE' });

// фото відправляємо як multipart/form-data з полем images (як у Swagger)
export const uploadProductImages = (productId: string, files: FileList) => {
  const form = new FormData();
  for (const file of files) form.append('images', file);

  return apiFetch<Product>(`/products/${productId}/images`, {
    method: 'POST',
    body: form,
  });
};

export const removeProductImage = (productId: string, url: string) =>
  apiFetch<Product>(`/products/${productId}/images`, {
    method: 'DELETE',
    body: JSON.stringify({ url }),
  });

// ---------- замовлення ----------

export const getAllOrders = (params: Record<string, string>) =>
  apiFetch<Paginated<AdminOrder>>(`/orders/all?${new URLSearchParams(params)}`);

export const updateOrderStatus = (orderId: string, status: OrderStatus) =>
  apiFetch<AdminOrder>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ---------- slug з назви ----------

// пари «літера-латиниця» через пробіл
const TRANSLIT: Record<string, string> = Object.fromEntries(
  'а-a б-b в-v г-h ґ-g д-d е-e є-ie ж-zh з-z и-y і-i ї-i й-i к-k л-l м-m н-n о-o п-p р-r с-s т-t у-u ф-f х-kh ц-ts ч-ch ш-sh щ-shch ь- ю-iu я-ia'
    .split(' ')
    .map((pair) => pair.split('-')),
);

// «Чохол для iPhone 16» -> «chokhol-dlia-iphone-16» (формат, який приймає бекенд)
export const slugify = (text: string) =>
  [...text.toLowerCase()]
    .map((char) => TRANSLIT[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---------- статистика ----------

export const STATS_PERIODS = [7, 30, 90];

export const getOrderStats = (days: number) =>
  apiFetch<OrderStats>(`/orders/stats?days=${days}`);