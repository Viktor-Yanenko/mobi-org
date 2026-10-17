'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderStatus from '@/components/OrderStatus/OrderStatus';
import { getAllOrders, updateOrderStatus } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { formatDate, STATUS_LABELS } from '@/lib/orders';
import type { AdminOrder, OrderStatus as Status, Paginated } from '@/types/api';
import styles from '../admin.module.css';

const STATUSES = Object.keys(STATUS_LABELS) as Status[];

export default function OrdersTable() {
  const [result, setResult] = useState<Paginated<AdminOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  // id замовлення, статус якого саме зберігається
  const [savingId, setSavingId] = useState('');

  useEffect(() => {
    getAllOrders({
      page: String(page),
      perPage: '20',
      ...(status && { status }),
    })
      .then(setResult)
      .catch((err) => setError(getErrorMessage(err)));
  }, [page, status]);

  const handleStatusChange = async (order: AdminOrder, next: Status) => {
    if (
      next === 'cancelled' &&
      !confirm(
        `Скасувати замовлення №${order.orderNumber}? Товари повернуться на склад.`,
      )
    ) {
      return;
    }

    setError('');
    setSavingId(order._id);
    try {
      const updated = await updateOrderStatus(order._id, next);
      // бекенд повертає замовлення без імені покупця, тому міняємо лише статус
      setResult(
        (prev) =>
          prev && {
            ...prev,
            data: prev.data.map((o) =>
              o._id === order._id ? { ...o, status: updated.status } : o,
            ),
          },
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId('');
    }
  };

  return (
    <>
      <div className={styles.toolbar}>
        <h1>Замовлення</h1>
        <select
          className={styles.input}
          value={status}
          aria-label="Фільтр за статусом"
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Усі статуси</option>
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!result ? (
        <p className={styles.muted}>Завантаження…</p>
      ) : result.data.length === 0 ? (
        <p className={styles.muted}>Замовлень немає.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>№</th>
                <th>Дата</th>
                <th>Покупець</th>
                <th>Доставка</th>
                <th>Сума</th>
                <th>Статус</th>
                <th>Змінити статус</th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((order) => (
                <tr key={order._id}>
                  <td>
                    <Link href={`/orders/${order._id}`}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    {order.contact.name}
                    <br />
                    <span className={styles.muted}>{order.contact.phone}</span>
                  </td>
                  <td>{order.delivery.city ?? 'Самовивіз'}</td>
                  <td>{formatPrice(order.totalPrice)}</td>
                  <td>
                    <OrderStatus status={order.status} />
                  </td>
                  <td>
                    {/* скасоване замовлення бекенд змінити не дасть */}
                    <select
                      className={styles.input}
                      value={order.status}
                      disabled={
                        order.status === 'cancelled' || savingId === order._id
                      }
                      aria-label={`Статус замовлення ${order.orderNumber}`}
                      onChange={(e) =>
                        handleStatusChange(order, e.target.value as Status)
                      }
                    >
                      {STATUSES.map((value) => (
                        <option key={value} value={value}>
                          {STATUS_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result && result.totalPages > 1 && (
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.button}
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ←
          </button>
          <span>
            {result.page} з {result.totalPages}
          </span>
          <button
            type="button"
            className={styles.button}
            disabled={page >= result.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
