'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import styles from './admin.module.css';

const LINKS = [
  { href: '/admin', label: 'Огляд' },
  { href: '/admin/products', label: 'Товари' },
  { href: '/admin/orders', label: 'Замовлення' },
];

const isActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === href : pathname.startsWith(href);

// бічне меню і перевірка ролі для всіх сторінок /admin
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // без cookie сюди не пустить proxy.ts, тут лише чекаємо користувача
  if (isLoading || !user) {
    return <p className={styles.message}>Завантаження…</p>;
  }

  // бекенд однаково відповість 403, але краще одразу сказати зрозуміло
  if (user.role !== 'admin') {
    return (
      <p className={styles.message}>Ця сторінка лише для адміністратора.</p>
    );
  }

  return (
    <div className={`container ${styles.shell}`}>
      <nav className={styles.sidebar}>
        <p className={styles.sidebarTitle}>Адмінка</p>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive(pathname, link.href) ? styles.activeLink : styles.link
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <section className={styles.content}>{children}</section>
    </div>
  );
}
