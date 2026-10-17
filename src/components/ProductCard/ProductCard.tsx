import Link from 'next/link';
import ProductImage from '@/components/ProductImage/ProductImage';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/api';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  // варіант із найменшою ціною: від нього показуємо стару ціну
  const cheapest = product.variants.find((v) => v.price === product.minPrice);
  const hasManyPrices = new Set(product.variants.map((v) => v.price)).size > 1;
  const inStock = product.variants.some((v) => v.stock > 0);

  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      <ProductImage
        src={product.images[0]}
        alt={product.name}
        sizes="(max-width: 600px) 50vw, 25vw"
      />

      <p className={styles.brand}>{product.brand.name}</p>
      <h3 className={styles.name}>{product.name}</h3>

      {product.rating.count > 0 && (
        <p className={styles.rating}>
          ★ {product.rating.average.toFixed(1)} ({product.rating.count})
        </p>
      )}

      <div className={styles.prices}>
        <span className={styles.price}>
          {hasManyPrices && 'від '}
          {formatPrice(product.minPrice)}
        </span>
        {cheapest?.oldPrice && (
          <span className={styles.oldPrice}>
            {formatPrice(cheapest.oldPrice)}
          </span>
        )}
      </div>

      {!inStock && <p className={styles.outOfStock}>Немає в наявності</p>}
    </Link>
  );
}
