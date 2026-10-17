'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import styles from './UserMenu.module.css';

export default function UserMenu() {
  const { user, isLoading } = useAuth();

  // поки не знаємо, чи користувач увійшов, нічого не показуємо, щоб не блимало
  if (isLoading) return <span className={styles.placeholder} />;

  return user ? (
    <Link href="/profile" className={styles.user}>
      {user.name}
    </Link>
  ) : (
    <Link href="/login" className={styles.login}>
      Увійти
    </Link>
  );
}
