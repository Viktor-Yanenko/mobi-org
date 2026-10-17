'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage/ProductImage';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import { getFavorites, removeFavorite } from '@/lib/favorites';
import { formatPrice } from '@/lib/format';
import type { FavoriteProduct } from '@/types/api';
import styles from './page.module.css';

export default function FavoritesList() {
  const { user, updateUser } = useAuth();
  const [products, setProducts] = useState<FavoriteProduct[] | null>(null);
  const [error, setError] = useState('');

  // залежимо лише від id: updateUser міняє об'єкт user, і без цього
  // список перезавантажувався б після кожного видалення
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;
    getFavorites()
      .then(setProducts)
      .catch((err) => setError(getErrorMessage(err)));
  }, [userId]);

  const handleRemove = async (productId: string) => {
    try {
      const list = await removeFavorite(productId);
      setProducts(list);
      updateUser({ favorites: list.map((product) => product._id) });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!products) return <p className={styles.message}>Завантаження…</p>;

  if (products.length === 0) {
    return (
      <div className={styles.message}>
        <p>Тут поки порожньо. Додавайте товари кнопкою «♡ В обране».</p>
        <Link href="/catalog" className={styles.link}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <div key={product._id} className={styles.card}>
          <Link href={`/products/${product.slug}`} className={styles.info}>
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              sizes="(max-width: 600px) 50vw, 25vw"
            />
            <h3 className={styles.name}>{product.name}</h3>
            {product.rating.count > 0 && (
              <p className={styles.rating}>
                ★ {product.rating.average.toFixed(1)} ({product.rating.count})
              </p>
            )}
            <strong>від {formatPrice(product.minPrice)}</strong>
          </Link>
          <button
            type="button"
            className={styles.remove}
            onClick={() => handleRemove(product._id)}
          >
            Прибрати з обраного
          </button>
        </div>
      ))}
    </div>
  );
}
