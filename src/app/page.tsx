import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getProducts } from '@/lib/catalog';
import styles from './page.module.css';

export default async function HomePage() {
  const { data: newest } = await getProducts({ perPage: '8' });

  return (
    <div className="container">
      <section className={styles.hero}>
        <h1>Смартфони та аксесуари</h1>
        <p>Оригінальна техніка з гарантією і доставкою Новою поштою.</p>
        <div className={styles.actions}>
          <Link href="/catalog?type=phone" className={styles.primary}>
            Смартфони
          </Link>
          <Link href="/catalog?type=accessory" className={styles.secondary}>
            Аксесуари
          </Link>
        </div>
      </section>

      <section>
        <div className={styles.heading}>
          <h2>Новинки</h2>
          <Link href="/catalog">Весь каталог →</Link>
        </div>
        <div className="grid">
          {newest.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
