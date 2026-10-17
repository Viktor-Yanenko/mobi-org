'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import styles from './page.module.css';
import Link from 'next/link';

export default function ProfileView() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  // після кнопки «Вийти» ведемо на головну, а не на сторінку входу
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // сесія закінчилась: просимо увійти знову
  useEffect(() => {
    if (!isLoading && !user && !isLoggingOut) {
      router.replace('/login?next=/profile');
    }
  }, [isLoading, user, isLoggingOut, router]);

  if (!user) return <p className={styles.loading}>Завантаження…</p>;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.name}>
        {user.name}
        {user.role === 'admin' && <span className={styles.badge}>адмін</span>}
      </h1>

      <dl className={styles.info}>
        <div>
          <dt>Email</dt>
          <dd>{user.email}</dd>
        </div>
        <div>
          <dt>Телефон</dt>
          <dd>{user.phone ?? 'не вказано'}</dd>
        </div>
      </dl>

      <Link href="/orders" className={styles.orders}>
        Мої замовлення →
      </Link>

      {user.role === 'admin' && (
        <Link href="/admin" className={styles.orders}>
          Адмінка →
        </Link>
      )}

      <button type="button" onClick={handleLogout} className={styles.logout}>
        Вийти
      </button>
    </div>
  );
}
