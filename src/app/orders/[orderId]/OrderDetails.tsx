'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderStatus from '@/components/OrderStatus/OrderStatus';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import {
  cancelOrder,
  DELIVERY_OPTIONS,
  formatDate,
  getOrder,
  PAYMENT_LABELS,
} from '@/lib/orders';
import type { Order } from '@/types/api';
import styles from './page.module.css';

interface Props {
  orderId: string;
  // щойно оформлене: показуємо подяку
  isNew: boolean;
}

export default function OrderDetails({ orderId, isNew }: Props) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!user) return;
    getOrder(orderId)
      .then(setOrder)
      .catch((err) => setError(getErrorMessage(err)));
  }, [user, orderId]);

  if (error && !order) return <p className={styles.error}>{error}</p>;
  if (!order) return <p className={styles.message}>Завантаження…</p>;

  const itemsTotal = order.totalPrice - order.delivery.cost;

  const handleCancel = async () => {
    if (!confirm('Скасувати замовлення?')) return;
    setIsCancelling(true);
    setError('');
    try {
      setOrder(await cancelOrder(order._id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      {isNew && order.status === 'new' && (
        <div className={styles.success}>
          Дякуємо! Замовлення оформлено, менеджер зв&apos;яжеться з вами для
          підтвердження.
        </div>
      )}

      <div className={styles.heading}>
        <h1>Замовлення №{order.orderNumber}</h1>
        <OrderStatus status={order.status} />
      </div>
      <p className={styles.date}>{formatDate(order.createdAt)}</p>

      <div className={styles.layout}>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={item.sku} className={styles.item}>
              <span>
                {item.name}
                <span className={styles.muted}> · {item.sku}</span>
              </span>
              <span className={styles.muted}>
                {item.quantity} × {formatPrice(item.price)}
              </span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </li>
          ))}
        </ul>

        <aside className={styles.info}>
          <section>
            <h2>Отримувач</h2>
            <p>{order.contact.name}</p>
            <p>{order.contact.phone}</p>
            <p>{order.contact.email}</p>
          </section>

          <section>
            <h2>Доставка</h2>
            <p>{DELIVERY_OPTIONS[order.delivery.method].label}</p>
            {order.delivery.city && (
              <p>
                {order.delivery.city}, {order.delivery.address}
              </p>
            )}
          </section>

          <section>
            <h2>Оплата</h2>
            <p>{PAYMENT_LABELS[order.payment.method]}</p>
          </section>

          {order.comment && (
            <section>
              <h2>Коментар</h2>
              <p>{order.comment}</p>
            </section>
          )}

          <section className={styles.totals}>
            <p>
              <span>Товари</span>
              <span>{formatPrice(itemsTotal)}</span>
            </p>
            <p>
              <span>Доставка</span>
              <span>
                {order.delivery.cost === 0
                  ? 'безкоштовно'
                  : formatPrice(order.delivery.cost)}
              </span>
            </p>
            <p className={styles.total}>
              <span>Разом</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </p>
          </section>

          {error && <p className={styles.error}>{error}</p>}

          {/* бекенд дозволяє скасувати лише нове замовлення */}
          {order.status === 'new' && (
            <button
              type="button"
              className={styles.cancel}
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Скасовуємо…' : 'Скасувати замовлення'}
            </button>
          )}
        </aside>
      </div>

      <Link href="/orders" className={styles.back}>
        ← Усі замовлення
      </Link>
    </>
  );
}
