'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderStatus from '@/components/OrderStatus/OrderStatus';
import { getOrderStats, STATS_PERIODS } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import type { OrderStats, OrderStatus as Status } from '@/types/api';
import styles from './admin.module.css';
import dash from './Dashboard.module.css';

// 2026-10-17 -> 17.10
const shortDate = (date: string) => date.slice(8) + '.' + date.slice(5, 7);

export default function Dashboard() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false; // відповідь для старого періоду вже не потрібна

    getOrderStats(days)
      .then((data) => {
        if (!ignore) setStats(data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err));
      });

    return () => {
      ignore = true;
    };
  }, [days]);

  const changePeriod = (value: number) => {
    setDays(value);
    setStats(null);
    setError('');
  };

  // висота стовпчиків графіка рахується від найкращого дня
  const maxRevenue = Math.max(1, ...(stats?.daily.map((d) => d.revenue) ?? []));
  const totalByStatus = stats
    ? Object.values(stats.byStatus).reduce((sum, n) => sum + n, 0)
    : 0;

  return (
    <>
      <div className={styles.toolbar}>
        <h1>Огляд</h1>
        <div className={dash.periods}>
          {STATS_PERIODS.map((value) => (
            <button
              key={value}
              type="button"
              className={value === days ? styles.primary : styles.button}
              onClick={() => changePeriod(value)}
            >
              {value} днів
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {!stats && !error && <p className={styles.muted}>Завантаження…</p>}

      {stats && (
        <>
          <div className={dash.cards}>
            <div className={dash.card}>
              <p>Виручка</p>
              <strong>{formatPrice(stats.revenue)}</strong>
            </div>
            <div className={dash.card}>
              <p>Замовлень</p>
              <strong>{stats.orders}</strong>
            </div>
            <div className={dash.card}>
              <p>Середній чек</p>
              <strong>{formatPrice(stats.averageCheck)}</strong>
            </div>
            <div className={dash.card}>
              <p>Скасовано</p>
              <strong>{stats.byStatus.cancelled}</strong>
            </div>
          </div>
          <p className={dash.note}>
            Скасовані замовлення не входять у виручку.
          </p>

          <h2 className={styles.subtitle}>Виручка по днях</h2>
          <div className={dash.chart}>
            {stats.daily.map((day) => (
              <div
                key={day.date}
                className={dash.column}
                // підказка при наведенні
                title={`${shortDate(day.date)}: ${formatPrice(day.revenue)}, замовлень: ${day.orders}`}
              >
                <div
                  className={dash.bar}
                  style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                />
              </div>
            ))}
          </div>
          <div className={dash.axis}>
            <span>{shortDate(stats.daily[0].date)}</span>
            <span>{shortDate(stats.daily[stats.daily.length - 1].date)}</span>
          </div>

          <div className={dash.columns}>
            <section>
              <h2 className={styles.subtitle}>Замовлення за статусами</h2>
              <ul className={dash.statuses}>
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <li key={status}>
                    <OrderStatus status={status as Status} />
                    <div className={dash.track}>
                      <div
                        className={dash.fill}
                        style={{
                          width: `${totalByStatus ? (count / totalByStatus) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span>{count}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className={styles.subtitle}>Топ-5 товарів</h2>
              {stats.topProducts.length === 0 ? (
                <p className={styles.muted}>За цей період продажів немає.</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Товар</th>
                        <th>Продано</th>
                        <th>Сума</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.topProducts.map((item) => (
                        <tr key={item._id}>
                          <td>{item.name}</td>
                          <td>{item.quantity} шт.</td>
                          <td>{formatPrice(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          <h2 className={styles.subtitle}>Закінчуються на складі</h2>
          {stats.lowStock.length === 0 ? (
            <p className={styles.muted}>Усіх товарів достатньо.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>SKU</th>
                    <th>Залишок</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.lowStock.map((item) => (
                    <tr key={item.sku}>
                      <td>
                        <Link href={`/admin/products/${item.slug}`}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.sku}</td>
                      <td className={item.stock === 0 ? dash.out : undefined}>
                        {item.stock === 0 ? 'немає' : `${item.stock} шт.`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}
