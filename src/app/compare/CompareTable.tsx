'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage/ProductImage';
import {
  COMPARE_ROWS,
  getCompareProduct,
  removeFromCompare,
  useCompareList,
  type CompareRow,
} from '@/lib/compare';
import type { Product } from '@/types/api';
import styles from './page.module.css';

// які товари в рядку мають найкраще значення (лише якщо значення різні)
const bestIds = (row: CompareRow, products: Product[]) => {
  if (!row.best || products.length < 2) return [];

  const values = products
    .map((p) => ({ id: p._id, value: row.value(p) }))
    .filter(
      (item): item is { id: string; value: number } =>
        typeof item.value === 'number',
    );
  const numbers = values.map((item) => item.value);
  const best = row.best === 'max' ? Math.max(...numbers) : Math.min(...numbers);

  // якщо в усіх однаково, підсвічувати нема чого
  if (numbers.every((n) => n === best)) return [];
  return values.filter((item) => item.value === best).map((item) => item.id);
};

export default function CompareTable() {
  const list = useCompareList();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlyDifferent, setOnlyDifferent] = useState(false);

  // рядок-ключ: перезавантажуємо, лише коли змінився сам набір товарів
  const slugs = list.map((item) => item.slug).join(',');

  useEffect(() => {
    let ignore = false;

    Promise.all(
      slugs
        .split(',')
        .filter(Boolean)
        // товар могли видалити: такий просто пропускаємо
        .map((slug) => getCompareProduct(slug).catch(() => null)),
    )
      .then((loaded) => {
        if (!ignore) setProducts(loaded.filter((p) => p !== null));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [slugs]);

  if (list.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Порівняння телефонів</h1>
        <p>
          Додайте 2–3 телефони кнопкою «⇄ Порівняти» на сторінці товару, і тут
          з&apos;явиться таблиця їхніх характеристик.
        </p>
        <Link href="/catalog?type=phone" className={styles.button}>
          До смартфонів
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <p className={styles.muted}>Завантаження…</p>;
  }

  // рядки, де в усіх товарів однакове значення, можна сховати
  const rows = COMPARE_ROWS.filter((row) => {
    if (!onlyDifferent) return true;
    const values = products.map((p) => String(row.value(p) ?? ''));
    return new Set(values).size > 1;
  });

  return (
    <>
      <div className={styles.toolbar}>
        <h1>Порівняння телефонів</h1>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={onlyDifferent}
            onChange={(e) => setOnlyDifferent(e.target.checked)}
          />
          Лише відмінності
        </label>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th />
              {products.map((product) => (
                <th key={product._id} className={styles.product}>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label={`Прибрати ${product.name}`}
                    onClick={() => removeFromCompare(product._id)}
                  >
                    ✕
                  </button>
                  <Link href={`/products/${product.slug}`}>
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      sizes="200px"
                    />
                    <span>{product.name}</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const best = bestIds(row, products);
              return (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {products.map((product) => {
                    const value = row.value(product);
                    return (
                      <td
                        key={product._id}
                        className={
                          best.includes(product._id) ? styles.best : undefined
                        }
                      >
                        {value === undefined
                          ? '—'
                          : row.format && typeof value === 'number'
                            ? row.format(value)
                            : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length < 2 && (
        <p className={styles.muted}>
          Додайте ще хоча б один телефон, щоб було з чим порівнювати.
        </p>
      )}
    </>
  );
}
