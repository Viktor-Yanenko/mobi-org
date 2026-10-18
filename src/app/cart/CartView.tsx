'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider/CartProvider';
import ProductImage from '@/components/ProductImage/ProductImage';
import { MAX_QUANTITY } from '@/lib/cart';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice, variantLabel } from '@/lib/format';
import styles from './page.module.css';

export default function CartView() {
  const { cart, isLoading, updateQuantity, removeItem, clear } = useCart();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  // усі зміни кошика проходять тут: блокуємо кнопки і показуємо помилку
  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) return <p className={styles.message}>Завантаження…</p>;

  if (cart.items.length === 0) {
    return (
      <div className={styles.message}>
        <p>Кошик порожній.</p>
        <Link href="/catalog" className={styles.toCatalog}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  const hasUnavailable = cart.items.some((item) => !item.isAvailable);

  return (
    <div className={styles.layout}>
      <ul className={styles.items}>
        {cart.items.map((item) => (
          <li key={item.sku} className={styles.item}>
            <Link
              href={`/products/${item.product.slug}`}
              className={styles.image}
            >
              <ProductImage
                src={item.product.image ?? undefined}
                alt={item.product.name}
                sizes="96px"
              />
            </Link>

            <div className={styles.info}>
              <Link
                href={`/products/${item.product.slug}`}
                className={styles.name}
              >
                {item.product.name}
              </Link>
              {variantLabel(item) && (
                <p className={styles.variant}>{variantLabel(item)}</p>
              )}
              <p className={styles.unitPrice}>
                {formatPrice(item.price)} / шт.
              </p>
              {!item.isAvailable && (
                <p className={styles.warning}>
                  {item.stock > 0
                    ? `На складі лише ${item.stock} шт.`
                    : 'Немає в наявності'}
                </p>
              )}
            </div>

            <div className={styles.quantity}>
              <button
                type="button"
                aria-label="Менше"
                disabled={isBusy || item.quantity <= 1}
                onClick={() =>
                  run(() => updateQuantity(item.sku, item.quantity - 1))
                }
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                aria-label="Більше"
                disabled={
                  isBusy || item.quantity >= Math.min(item.stock, MAX_QUANTITY)
                }
                onClick={() =>
                  run(() => updateQuantity(item.sku, item.quantity + 1))
                }
              >
                +
              </button>
            </div>

            <p className={styles.subtotal}>{formatPrice(item.subtotal)}</p>

            <button
              type="button"
              className={styles.remove}
              aria-label="Видалити"
              disabled={isBusy}
              onClick={() => run(() => removeItem(item.sku))}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <aside className={styles.summary}>
        <p className={styles.row}>
          <span>Товарів</span>
          <span>{cart.totalQuantity} шт.</span>
        </p>
        <p className={`${styles.row} ${styles.total}`}>
          <span>Разом</span>
          <span>{formatPrice(cart.totalPrice)}</span>
        </p>

        {error && <p className={styles.warning}>{error}</p>}
        {hasUnavailable && (
          <p className={styles.warning}>
            Зменште кількість товарів, яких не вистачає на складі.
          </p>
        )}

        {hasUnavailable ? (
          <button type="button" className={styles.checkout} disabled>
            Оформити замовлення
          </button>
        ) : (
          <Link href="/checkout" className={styles.checkout}>
            Оформити замовлення
          </Link>
        )}

        <button
          type="button"
          className={styles.clear}
          disabled={isBusy}
          onClick={() => run(clear)}
        >
          Очистити кошик
        </button>
      </aside>
    </div>
  );
}
