'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderStatus from '@/components/OrderStatus/OrderStatus';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { formatDate, getMyOrders } from '@/lib/orders';
import type { Order } from '@/types/api';
import styles from './page.module.css';

export default function OrdersList() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  // запит потребує токена, тому чекаємо, поки AuthProvider завантажить користувача
  useEffect(() => {
    if (!user) return;
    getMyOrders()
      .then(setOrders)
      .catch((err) => setError(getErrorMessage(err)));
  }, [user]);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!orders) return <p className={styles.message}>Завантаження…</p>;

  if (orders.length === 0) {
    return (
      <div className={styles.message}>
        <p>У вас ще немає замовлень.</p>
        <Link href="/catalog" className={styles.link}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {orders.map((order) => (
        <li key={order._id}>
          <Link href={`/orders/${order._id}`} className={styles.order}>
            <div>
              <p className={styles.number}>Замовлення №{order.orderNumber}</p>
              <p className={styles.date}>{formatDate(order.createdAt)}</p>
            </div>
            <p className={styles.count}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} шт.
            </p>
            <OrderStatus status={order.status} />
            <p className={styles.total}>{formatPrice(order.totalPrice)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
