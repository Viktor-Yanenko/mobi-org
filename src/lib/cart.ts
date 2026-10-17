import { apiFetch } from './client-api';
import type { Cart, CartItem } from '@/types/api';

// бекенд дозволяє не більше 10 одиниць одного варіанту
export const MAX_QUANTITY = 10;

// ---------- гостьовий кошик у localStorage ----------

const STORAGE_KEY = 'mobiorg-cart';

// у localStorage зберігаємо все, щоб показати кошик без запитів до бекенду
export type GuestCartItem = Omit<CartItem, 'subtotal' | 'isAvailable'>;

export const readGuestCart = (): GuestCartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export const writeGuestCart = (items: GuestCartItem[]) => {
  if (items.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// рахуємо підсумки так само, як бекенд
export const toCart = (items: GuestCartItem[]): Cart => {
  const full = items.map((item) => ({
    ...item,
    subtotal: item.price * item.quantity,
    isAvailable: item.stock >= item.quantity,
  }));

  return {
    items: full,
    totalQuantity: full.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: full.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

export const EMPTY_CART = toCart([]);

// ---------- кошик користувача на бекенді ----------

let mergePromise: Promise<Cart> | null = null;

// після входу переносимо гостьовий кошик на сервер (POST /cart/merge)
export const loadServerCart = () => {
  const guestItems = readGuestCart();

  if (guestItems.length) {
    // очищаємо одразу, щоб повторний виклик не додав ті самі товари вдруге
    writeGuestCart([]);
    mergePromise = apiFetch<Cart>('/cart/merge', {
      method: 'POST',
      body: JSON.stringify({
        items: guestItems.map(({ product, sku, quantity }) => ({
          productId: product._id,
          sku,
          quantity,
        })),
      }),
    })
      .catch((error) => {
        writeGuestCart(guestItems);
        throw error;
      })
      .finally(() => {
        mergePromise = null;
      });
    return mergePromise;
  }

  // якщо злиття ще йде, чекаємо його, а не беремо старий кошик
  return mergePromise ?? apiFetch<Cart>('/cart');
};

export const addServerItem = (
  productId: string,
  sku: string,
  quantity: number,
) =>
  apiFetch<Cart>('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, sku, quantity }),
  });

export const updateServerItem = (sku: string, quantity: number) =>
  apiFetch<Cart>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });

export const removeServerItem = (sku: string) =>
  apiFetch<Cart>(`/cart/items/${encodeURIComponent(sku)}`, {
    method: 'DELETE',
  });

export const clearServerCart = () =>
  apiFetch<Cart>('/cart', { method: 'DELETE' });