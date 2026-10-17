'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm/ProductForm';
import ProductImages from '@/components/ProductImages/ProductImages';
import { getProductBySlug } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import type { Product } from '@/types/api';
import styles from '../../admin.module.css';

export default function EditProduct({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getProductBySlug(slug)
      .then(setProduct)
      .catch((err) => setError(getErrorMessage(err)));
  }, [slug]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return <p className={styles.muted}>Завантаження…</p>;

  return (
    <>
      <div className={styles.toolbar}>
        <h1>{product.name}</h1>
        <Link
          href={`/products/${product.slug}`}
          className={styles.button}
          target="_blank"
        >
          На сайті
        </Link>
        <Link href="/admin/products" className={styles.button}>
          ← До списку
        </Link>
      </div>

      <ProductImages
        product={product}
        onChange={(images) => setProduct({ ...product, images })}
      />

      <h2 className={styles.subtitle}>Дані товару</h2>
      <ProductForm
        product={product}
        onSaved={(saved) => {
          setProduct({ ...product, name: saved.name });
          // адреса сторінки залежить від slug, тож якщо його змінили, оновлюємо URL
          if (saved.slug !== slug)
            router.replace(`/admin/products/${saved.slug}`);
        }}
      />
    </>
  );
}
