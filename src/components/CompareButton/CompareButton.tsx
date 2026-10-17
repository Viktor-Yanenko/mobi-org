'use client';

import { useToast } from '@/components/ToastProvider/ToastProvider';
import {
  addToCompare,
  MAX_COMPARE,
  removeFromCompare,
  useCompareList,
  type CompareItem,
} from '@/lib/compare';
import styles from './CompareButton.module.css';

// кнопка «Порівняти» на сторінці телефону
export default function CompareButton({ product }: { product: CompareItem }) {
  const list = useCompareList();
  const toast = useToast();
  const isAdded = list.some((item) => item._id === product._id);

  const handleClick = () => {
    if (isAdded) {
      removeFromCompare(product._id);
      toast('Прибрано з порівняння');
      return;
    }

    if (list.length >= MAX_COMPARE) {
      toast(`Порівняти можна не більше ${MAX_COMPARE} телефонів`, {
        type: 'error',
        link: { href: '/compare', label: 'Відкрити' },
      });
      return;
    }

    addToCompare(product);
    toast('Додано до порівняння', {
      link: { href: '/compare', label: `Порівняти (${list.length + 1})` },
    });
  };

  return (
    <button
      type="button"
      className={isAdded ? styles.active : styles.button}
      aria-pressed={isAdded}
      onClick={handleClick}
    >
      {isAdded ? '✓ У порівнянні' : '⇄ Порівняти'}
    </button>
  );
}
