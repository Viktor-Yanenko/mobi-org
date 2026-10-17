import type { Metadata } from 'next';
import { SHOP } from '@/lib/shop';
import styles from '../info.module.css';

export const metadata: Metadata = { title: 'Контакти' };

export default function ContactsPage() {
  return (
    <>
      <h1>Контакти</h1>
      <p className={styles.lead}>
        Допоможемо вибрати телефон і відповімо на питання щодо замовлення.
      </p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <p>Телефон</p>
          <a href={SHOP.phoneHref}>{SHOP.phone}</a>
        </div>
        <div className={styles.card}>
          <p>Пошта</p>
          <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
        </div>
        {SHOP.hours.map((item) => (
          <div key={item.days} className={styles.card}>
            <p>{item.days}</p>
            <strong>{item.time}</strong>
          </div>
        ))}
      </div>

      <h2>Магазин</h2>
      <p>{SHOP.address}</p>
      {/* карта OpenStreetMap: безкоштовна і без ключа API */}
      <iframe
        className={styles.map}
        title="Магазин на карті"
        src="https://www.openstreetmap.org/export/embed.html?bbox=23.849895%2C49.233798%2C23.855895%2C49.236798&layer=mapnik&marker=49.235298%2C23.852895"
        loading="lazy"
      />
    </>
  );
}
