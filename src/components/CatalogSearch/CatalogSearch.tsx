'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import styles from './CatalogSearch.module.css';

// пошук «на льоту»: адреса оновлюється, коли користувач перестав друкувати
// на 400 мс, а не після кожної літери (інакше запит до бекенду на кожну літеру)
export default function CatalogSearch({ initial }: { initial?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = useDebouncedCallback((value: string) => {
    // інші фільтри лишаємо, а сторінку скидаємо на першу
    const params = new URLSearchParams(searchParams);
    const text = value.trim();
    if (text) params.set('search', text);
    else params.delete('search');
    params.delete('page');

    // replace, а не push: кожна літера не потрапляє в історію браузера
    router.replace(`${pathname}?${params}`, { scroll: false });
  }, 400);

  return (
    <input
      type="search"
      className={styles.input}
      placeholder="Пошук у каталозі"
      aria-label="Пошук у каталозі"
      defaultValue={initial}
      onChange={(e) => search(e.target.value)}
    />
  );
}
