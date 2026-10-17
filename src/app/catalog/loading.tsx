import ProductCardSkeleton from '@/components/Skeleton/ProductCardSkeleton';
import styles from './page.module.css';

// Next показує цей файл, поки сторінка каталогу чекає на бекенд
export default function CatalogLoading() {
  return (
    <div className="container" aria-busy>
      <div className={`skeleton ${styles.titleSkeleton}`} />

      <div className={styles.layout}>
        <div className={`skeleton ${styles.filtersSkeleton}`} />
        <div className="grid">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
