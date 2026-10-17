'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductForm from '@/components/ProductForm/ProductForm';
import styles from '../../admin.module.css';

export default function NewProduct() {
  const router = useRouter();

  return (
    <>
      <div className={styles.toolbar}>
        <h1>Новий товар</h1>
        <Link href="/admin/products" className={styles.button}>
          ← До списку
        </Link>
      </div>
      <p className={styles.muted}>
        Фото можна буде додати одразу після створення.
      </p>
      <ProductForm
        // фото завантажуються в уже існуючий товар, тому переходимо до редагування
        onSaved={(product) => router.push(`/admin/products/${product.slug}`)}
      />
    </>
  );
}
