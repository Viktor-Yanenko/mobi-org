import type { Metadata } from 'next';
import { formatPrice } from '@/lib/format';
import {
  DELIVERY_OPTIONS,
  FREE_DELIVERY_FROM,
  PAYMENT_LABELS,
} from '@/lib/orders';
import styles from '../info.module.css';

export const metadata: Metadata = { title: 'Доставка й оплата' };

// ціни беремо з тих самих констант, що й оформлення замовлення,
// щоб на сторінці й у кошику ніколи не було різних сум
export default function DeliveryPage() {
  return (
    <>
      <h1>Доставка й оплата</h1>
      <p className={styles.lead}>
        Відправляємо замовлення в день оформлення, якщо воно надійшло до 16:00.
      </p>

      <h2>Доставка</h2>
      <div className={styles.cards}>
        {Object.values(DELIVERY_OPTIONS).map((option) => (
          <div key={option.label} className={styles.card}>
            <p>{option.label}</p>
            <strong>
              {option.cost === 0 ? 'Безкоштовно' : formatPrice(option.cost)}
            </strong>
          </div>
        ))}
      </div>
      <ul>
        <li>
          Від {formatPrice(FREE_DELIVERY_FROM)} доставка будь-яким способом
          безкоштовна.
        </li>
        <li>Нова пошта: 1–2 дні по всій Україні.</li>
        <li>Кур&apos;єр: по Стрию в день замовлення або наступного дня.</li>
        <li>Самовивіз: з магазину за адресою на сторінці «Контакти».</li>
      </ul>

      <h2>Оплата</h2>
      <ul>
        {Object.values(PAYMENT_LABELS).map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>

      <h2>Гарантія й повернення</h2>
      <ul>
        <li>На всі смартфони діє офіційна гарантія виробника 12 місяців.</li>
        <li>
          Товар належної якості можна повернути протягом 14 днів, якщо він не
          був у використанні і збережено упаковку.
        </li>
        <li>
          Скасувати замовлення можна самостійно в розділі «Мої замовлення», поки
          воно має статус «Нове».
        </li>
      </ul>
    </>
  );
}
