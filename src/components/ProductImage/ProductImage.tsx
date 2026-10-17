import Image from 'next/image';
import styles from './ProductImage.module.css';

interface Props {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
}

// next/image показує лише фото з дозволених доменів (next.config.ts),
// тому для інших посилань і для товарів без фото малюємо заглушку
const isAllowed = (src?: string) =>
  Boolean(src?.startsWith('https://res.cloudinary.com/'));

export default function ProductImage({ src, alt, sizes, priority }: Props) {
  return (
    <div className={styles.frame}>
      {isAllowed(src) ? (
        <Image
          src={src!}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
        />
      ) : (
        <span className={styles.placeholder}>Немає фото</span>
      )}
    </div>
  );
}
