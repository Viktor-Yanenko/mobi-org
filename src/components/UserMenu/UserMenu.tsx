'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, isLoading } = useAuth();

  // поки не знаємо, чи користувач увійшов, нічого не показуємо, щоб не блимало
  if (isLoading) return <span className={styles.placeholder} />;

  if (!user) {
    return (
      <Link href="/login" className={styles.login}>
        Увійти
      </Link>
    );
  }

  return (
    <>
      {user.role === 'admin' && (
        <Link href="/admin" className={styles.admin}>
          Адмінка
        </Link>
      )}
      <Link href="/profile" className={styles.user}>
        {user.name}
      </Link>
    </>
  );
}
