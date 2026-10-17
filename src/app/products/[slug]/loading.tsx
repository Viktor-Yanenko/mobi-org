import styles from './page.module.css';

// заглушка сторінки товару: фото ліворуч, текст і кнопка праворуч
export default function ProductLoading() {
  return (
    <div className="container" aria-busy>
      <div className={`skeleton ${styles.breadcrumbsSkeleton}`} />

      <div className={styles.layout}>
        <div className={`skeleton ${styles.imageSkeleton}`} />

        <div className={styles.info}>
          <div className={`skeleton ${styles.lineSkeleton}`} />
          <div className={`skeleton ${styles.nameSkeleton}`} />
          <div className={`skeleton ${styles.priceSkeleton}`} />
          <div className={`skeleton ${styles.buttonSkeleton}`} />
          <div className={`skeleton ${styles.lineSkeleton}`} />
          <div className={`skeleton ${styles.lineSkeleton}`} />
        </div>
      </div>
    </div>
  );
}
