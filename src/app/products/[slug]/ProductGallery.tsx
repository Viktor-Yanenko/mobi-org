'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import ProductImage, {
  isAllowedImage,
} from '@/components/ProductImage/ProductImage';
import styles from './ProductGallery.module.css';

interface Props {
  images: string[];
  name: string;
}

// головне фото, мініатюри і перегляд на весь екран
export default function ProductGallery({ images: allImages, name }: Props) {
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // next/image не покаже фото з недозволених доменів, тому їх пропускаємо
  const images = allImages.filter(isAllowedImage);

  // без фото показуємо звичайну заглушку
  if (images.length === 0) {
    return <ProductImage alt={name} sizes="50vw" />;
  }

  // по колу: після останнього фото йде перше
  const show = (next: number) =>
    setIndex((next + images.length) % images.length);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  };

  return (
    <div className={styles.gallery}>
      <button
        type="button"
        className={styles.main}
        aria-label="Відкрити фото на весь екран"
        onClick={() => dialogRef.current?.showModal()}
      >
        <ProductImage
          src={images[index]}
          alt={name}
          sizes="(max-width: 800px) 100vw, 50vw"
          priority
        />
      </button>

      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === index ? styles.thumbActive : styles.thumb}
              aria-label={`Фото ${i + 1}`}
              onClick={() => setIndex(i)}
            >
              <ProductImage src={src} alt="" sizes="100px" />
            </button>
          ))}
        </div>
      )}

      {/* <dialog> сам затемнює фон і закривається клавішею Escape */}
      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onKeyDown={onKeyDown}
        // клік по темному фону (а не по фото чи кнопках) закриває перегляд
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className={styles.full}>
          <Image src={images[index]} alt={name} fill sizes="100vw" />
        </div>

        <button
          type="button"
          className={styles.close}
          aria-label="Закрити"
          onClick={() => dialogRef.current?.close()}
        >
          ✕
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.arrow} ${styles.prev}`}
              aria-label="Попереднє фото"
              onClick={() => show(index - 1)}
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.arrow} ${styles.next}`}
              aria-label="Наступне фото"
              onClick={() => show(index + 1)}
            >
              ›
            </button>
            <p className={styles.counter}>
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}
