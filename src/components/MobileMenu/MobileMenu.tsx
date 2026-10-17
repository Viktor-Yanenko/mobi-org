'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import styles from './MobileMenu.module.css';

// бургер-меню для екранів до 700px, де посилання не вміщаються в шапку
export default function MobileMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // закриваємо кліком повз меню або клавішею Escape
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const links = [
    { href: '/catalog?type=phone', label: 'Смартфони' },
    { href: '/catalog?type=accessory', label: 'Аксесуари' },
    { href: '/compare', label: 'Порівняння' },
    { href: '/favorites', label: 'Обране' },
    ...(user
      ? [
          { href: '/orders', label: 'Мої замовлення' },
          { href: '/profile', label: 'Профіль' },
        ]
      : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Адмінка' }] : []),
  ];

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        type="button"
        className={styles.burger}
        aria-label={isOpen ? 'Закрити меню' : 'Відкрити меню'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* три смужки, які перетворюються на хрестик */}
        <span className={isOpen ? styles.lineOpen : styles.line} />
        <span className={isOpen ? styles.lineOpen : styles.line} />
        <span className={isOpen ? styles.lineOpen : styles.line} />
      </button>

      <nav className={isOpen ? styles.panelOpen : styles.panel}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsOpen(false)}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
