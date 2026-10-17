import Link from 'next/link';
import { SORT_OPTIONS } from '@/lib/sort';
import type { Category, Ref } from '@/types/api';
import styles from './CatalogFilters.module.css';

interface Props {
  brands: Ref[];
  categories: Category[];
  query: Record<string, string | undefined>;
}

// GET-форма: кнопка «Показати» просто відкриває /catalog з новими параметрами
export default function CatalogFilters({ brands, categories, query }: Props) {
  // якщо вибрано тип, показуємо лише його категорії
  const visibleCategories = query.type
    ? categories.filter((c) => c.type === query.type)
    : categories;

  return (
    <form action="/catalog" className={styles.filters}>
      {query.search && (
        <input type="hidden" name="search" value={query.search} />
      )}

      <label className={styles.field}>
        Тип
        <select name="type" defaultValue={query.type ?? ''}>
          <option value="">Усі товари</option>
          <option value="phone">Смартфони</option>
          <option value="accessory">Аксесуари</option>
        </select>
      </label>

      <label className={styles.field}>
        Категорія
        <select name="category" defaultValue={query.category ?? ''}>
          <option value="">Усі</option>
          {visibleCategories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        Бренд
        <select name="brand" defaultValue={query.brand ?? ''}>
          <option value="">Усі</option>
          {brands.map((b) => (
            <option key={b._id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </label>

      <div className={styles.field}>
        Ціна, ₴
        <div className={styles.priceRow}>
          <input
            type="number"
            name="minPrice"
            min={0}
            placeholder="від"
            defaultValue={query.minPrice}
          />
          <input
            type="number"
            name="maxPrice"
            min={0}
            placeholder="до"
            defaultValue={query.maxPrice}
          />
        </div>
      </div>

      <label className={styles.field}>
        Сортування
        <select name="sort" defaultValue={query.sort ?? 'new'}>
          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className={styles.submit}>
        Показати
      </button>
      <Link href="/catalog" className={styles.reset}>
        Скинути фільтри
      </Link>
    </form>
  );
}
