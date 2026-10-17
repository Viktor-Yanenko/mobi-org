import Link from 'next/link';
import { SHOP } from '@/lib/shop';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* container окремим div: його padding інакше перебив би наш */}
      <div className="container">
        <div className={styles.columns}>
          <div>
            <p className={styles.logo}>
              Mobi<span>Org</span>
            </p>
            <p className={styles.about}>
              Інтернет-магазин смартфонів та аксесуарів з офіційною гарантією.
            </p>
          </div>

          <nav className={styles.column}>
            <p className={styles.title}>Каталог</p>
            <Link href="/catalog?type=phone">Смартфони</Link>
            <Link href="/catalog?type=accessory">Аксесуари</Link>
            <Link href="/compare">Порівняння</Link>
          </nav>

          <nav className={styles.column}>
            <p className={styles.title}>Покупцям</p>
            <Link href="/delivery">Доставка й оплата</Link>
            <Link href="/contacts">Контакти</Link>
            <Link href="/orders">Мої замовлення</Link>
          </nav>

          <div className={styles.column}>
            <p className={styles.title}>Зв&apos;язатися</p>
            <a href={SHOP.phoneHref}>{SHOP.phone}</a>
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
            {SHOP.hours.map((item) => (
              <span key={item.days} className={styles.muted}>
                {item.days}: {item.time}
              </span>
            ))}
          </div>
        </div>

        <p className={styles.bottom}>
          © {new Date().getFullYear()} MobiOrg. Дипломний проєкт.
        </p>
      </div>
    </footer>
  );
}
