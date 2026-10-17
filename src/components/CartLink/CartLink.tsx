'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartProvider/CartProvider';
import styles from './CartLink.module.css';

export default function CartLink() {
  const { cart, isLoading } = useCart();

  return (
    <Link href="/cart" className={styles.link}>
      Кошик
      {!isLoading && cart.totalQuantity > 0 && (
        <span className={styles.badge}>{cart.totalQuantity}</span>
      )}
    </Link>
  );
}
