'use client';

import { useState } from 'react';
import { useCart } from '@/components/CartProvider/CartProvider';
import { useToast } from '@/components/ToastProvider/ToastProvider';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice, variantLabel } from '@/lib/format';
import type { CartItem, Variant } from '@/types/api';
import styles from './VariantPicker.module.css';

interface Props {
  product: CartItem['product'];
  variants: Variant[];
}

// вибір кольору й пам'яті: потрібен стан, тому це клієнтський компонент
export default function VariantPicker({ product, variants }: Props) {
  const { addItem } = useCart();
  const toast = useToast();
  // за замовчуванням перший варіант, який є в наявності
  const [sku, setSku] = useState(
    (variants.find((v) => v.stock > 0) ?? variants[0]).sku,
  );
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const selected = variants.find((v) => v.sku === sku) ?? variants[0];

  const label = (v: Variant) => variantLabel(v) || v.sku;

  const selectVariant = (newSku: string) => {
    setSku(newSku);
    setError('');
  };

  const handleAdd = async () => {
    setIsAdding(true);
    setError('');
    try {
      await addItem({
        product: {
          ...product,
          // фото варіанту, якщо є, інакше головне фото товару
          image: selected.images?.[0] ?? product.image,
        },
        sku: selected.sku,
        color: selected.color,
        storage: selected.storage,
        ram: selected.ram,
        price: selected.price,
        oldPrice: selected.oldPrice,
        stock: selected.stock,
      });
      toast('Додано в кошик', {
        link: { href: '/cart', label: 'Перейти в кошик' },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={styles.picker}>
      {variants.length > 1 && (
        <div className={styles.options}>
          {variants.map((v) => (
            <button
              key={v.sku}
              type="button"
              onClick={() => selectVariant(v.sku)}
              className={v.sku === sku ? styles.active : styles.option}
              disabled={v.stock === 0}
            >
              {label(v)}
            </button>
          ))}
        </div>
      )}

      <div className={styles.prices}>
        <span className={styles.price}>{formatPrice(selected.price)}</span>
        {selected.oldPrice && (
          <span className={styles.oldPrice}>
            {formatPrice(selected.oldPrice)}
          </span>
        )}
      </div>

      <p className={selected.stock > 0 ? styles.inStock : styles.outOfStock}>
        {selected.stock > 0
          ? `В наявності: ${selected.stock} шт.`
          : 'Немає в наявності'}
      </p>

      <button
        type="button"
        className={styles.buy}
        onClick={handleAdd}
        disabled={selected.stock === 0 || isAdding}
      >
        {isAdding ? 'Додаємо…' : 'Додати в кошик'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
