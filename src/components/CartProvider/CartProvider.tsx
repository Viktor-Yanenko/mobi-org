'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import {
  addServerItem,
  clearServerCart,
  EMPTY_CART,
  loadServerCart,
  MAX_QUANTITY,
  readGuestCart,
  removeServerItem,
  toCart,
  updateServerItem,
  writeGuestCart,
  type GuestCartItem,
} from '@/lib/cart';
import type { Cart } from '@/types/api';

interface CartContextValue {
  cart: Cart;
  isLoading: boolean;
  addItem: (
    item: Omit<GuestCartItem, 'quantity'>,
    quantity?: number,
  ) => Promise<void>;
  updateQuantity: (sku: string, quantity: number) => Promise<void>;
  removeItem: (sku: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

// гість: кошик у localStorage; користувач: кошик на бекенді
export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);
  const userId = user?._id;

  // перезавантажуємо кошик, коли користувач увійшов або вийшов
  useEffect(() => {
    if (isAuthLoading) return;

    // відповідь старого запиту не має перезаписати новий стан
    let ignore = false;
    const load = userId
      ? loadServerCart()
      : Promise.resolve(toCart(readGuestCart()));

    load
      .then((loaded) => !ignore && setCart(loaded))
      .catch(() => !ignore && setCart(EMPTY_CART))
      .finally(() => !ignore && setIsLoading(false));

    return () => {
      ignore = true;
    };
  }, [userId, isAuthLoading]);

  // зміни гостьового кошика: зберігаємо в localStorage і в стан
  const saveGuest = (items: GuestCartItem[]) => {
    writeGuestCart(items);
    setCart(toCart(items));
  };

  const limitFor = (stock: number) => Math.min(stock, MAX_QUANTITY);

  const addItem: CartContextValue['addItem'] = async (item, quantity = 1) => {
    if (userId) {
      setCart(await addServerItem(item.product._id, item.sku, quantity));
      return;
    }

    const items = readGuestCart();
    const existing = items.find((i) => i.sku === item.sku);
    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (newQuantity > limitFor(item.stock)) {
      throw new Error(`Більше ${limitFor(item.stock)} шт. додати не можна`);
    }

    saveGuest(
      existing
        ? items.map((i) =>
            i.sku === item.sku ? { ...i, quantity: newQuantity } : i,
          )
        : [...items, { ...item, quantity }],
    );
  };

  const updateQuantity = async (sku: string, quantity: number) => {
    if (userId) {
      setCart(await updateServerItem(sku, quantity));
      return;
    }

    saveGuest(
      readGuestCart().map((i) =>
        i.sku === sku
          ? {
              ...i,
              quantity: Math.min(Math.max(quantity, 1), limitFor(i.stock)),
            }
          : i,
      ),
    );
  };

  const removeItem = async (sku: string) => {
    if (userId) {
      setCart(await removeServerItem(sku));
      return;
    }
    saveGuest(readGuestCart().filter((i) => i.sku !== sku));
  };

  const clear = async () => {
    if (userId) {
      setCart(await clearServerCart());
      return;
    }
    saveGuest([]);
  };

  return (
    <CartContext
      value={{ cart, isLoading, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart можна викликати лише всередині CartProvider');
  }
  return context;
};
