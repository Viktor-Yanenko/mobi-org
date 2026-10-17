'use client';

import Link from 'next/link';
import { useCompareList } from '@/lib/compare';
import styles from './CompareLink.module.css';

// посилання в шапці з кількістю телефонів у порівнянні
export default function CompareLink() {
  const count = useCompareList().length;

  return (
    <Link href="/compare" className={styles.link}>
      Порівняння
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </Link>
  );
}
