import styles from './Skeleton.module.css';

// сіра картка такого ж розміру, як ProductCard
export default function ProductCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden>
      <div className={`skeleton ${styles.image}`} />
      <div className={`skeleton ${styles.line}`} style={{ width: '40%' }} />
      <div className={`skeleton ${styles.line}`} style={{ width: '85%' }} />
      <div className={`skeleton ${styles.price}`} />
    </div>
  );
}
