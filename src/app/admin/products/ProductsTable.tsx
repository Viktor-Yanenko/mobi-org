'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { deleteProduct, getAdminProducts } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import type { Paginated, Product } from '@/types/api';
import styles from '../admin.module.css';

export default function ProductsTable() {
  const [result, setResult] = useState<Paginated<Product> | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  // збільшуємо після видалення, щоб список перезавантажився
  const [version, setVersion] = useState(0);

  useEffect(() => {
    getAdminProducts({ page: String(page), perPage: '20', search })
      .then(setResult)
      .catch((err) => setError(getErrorMessage(err)));
  }, [page, search, version]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('search');
    setSearch(String(value ?? '').trim());
    setPage(1);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Прибрати «${product.name}» з каталогу?`)) return;
    try {
      await deleteProduct(product._id);
      setVersion((v) => v + 1);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <>
      <div className={styles.toolbar}>
        <h1>Товари</h1>
        <form onSubmit={handleSearch}>
          <input
            name="search"
            type="search"
            placeholder="Пошук за назвою"
            className={styles.input}
          />
        </form>
        <Link href="/admin/products/new" className={styles.primary}>
          + Додати товар
        </Link>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!result ? (
        <p className={styles.muted}>Завантаження…</p>
      ) : result.data.length === 0 ? (
        <p className={styles.muted}>Нічого не знайдено.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Назва</th>
                <th>Тип</th>
                <th>Бренд</th>
                <th>Ціна від</th>
                <th>На складі</th>
                <th>Фото</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {result.data.map((product) => (
                <tr key={product._id}>
                  <td>
                    <Link href={`/admin/products/${product.slug}`}>
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.type === 'phone' ? 'Телефон' : 'Аксесуар'}</td>
                  <td>{product.brand.name}</td>
                  <td>{formatPrice(product.minPrice)}</td>
                  <td>
                    {product.variants.reduce((sum, v) => sum + v.stock, 0)} шт.
                  </td>
                  <td>{product.images.length}</td>
                  <td>
                    <div className={styles.actions}>
                      <Link
                        href={`/products/${product.slug}`}
                        className={styles.button}
                        target="_blank"
                      >
                        На сайті
                      </Link>
                      <button
                        type="button"
                        className={styles.danger}
                        onClick={() => handleDelete(product)}
                      >
                        Видалити
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.totalPages > 1 && (
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.button}
            disabled={!result.hasPreviousPage}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </button>
          <span>
            {result.page} з {result.totalPages}
          </span>
          <button
            type="button"
            className={styles.button}
            disabled={!result.hasNextPage}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
