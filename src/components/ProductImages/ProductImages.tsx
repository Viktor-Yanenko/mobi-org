'use client';

import { useState } from 'react';
import ProductImage from '@/components/ProductImage/ProductImage';
import { removeProductImage, uploadProductImages } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import type { Product } from '@/types/api';
import styles from './ProductImages.module.css';

interface Props {
  product: Product;
  onChange: (images: string[]) => void;
}

export default function ProductImages({ product, onChange }: Props) {
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  // спільна обгортка: блокуємо кнопки, ловимо помилку, віддаємо нові фото нагору
  const run = async (action: () => Promise<Product>) => {
    setError('');
    setIsBusy(true);
    try {
      const updated = await action();
      onChange(updated.images);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    if (!input.files?.length) return;
    if (input.files.length > 5) {
      setError('За раз можна завантажити не більше 5 фото');
    } else {
      await run(() => uploadProductImages(product._id, input.files!));
    }
    // очищаємо, щоб можна було вибрати ті самі файли ще раз
    input.value = '';
  };

  const handleRemove = (url: string) => {
    if (!confirm('Видалити це фото?')) return;
    run(() => removeProductImage(product._id, url));
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Фото</h2>

      {product.images.length === 0 ? (
        <p className={styles.muted}>Фото ще немає. Перше фото буде головним.</p>
      ) : (
        <ul className={styles.grid}>
          {product.images.map((url, index) => (
            <li key={url} className={styles.item}>
              <ProductImage src={url} alt={product.name} sizes="140px" />
              {index === 0 && <span className={styles.main}>Головне</span>}
              <button
                type="button"
                className={styles.remove}
                disabled={isBusy}
                onClick={() => handleRemove(url)}
              >
                Видалити
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className={styles.upload}>
        {isBusy ? 'Завантажуємо…' : '+ Додати фото'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={isBusy}
          onChange={handleUpload}
        />
      </label>
      <p className={styles.muted}>
        JPG, PNG або WEBP, до 5 МБ, до 5 файлів за раз.
      </p>

      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
}
