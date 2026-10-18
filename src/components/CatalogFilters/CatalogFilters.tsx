import Link from 'next/link';
import type { SelectedFilters } from '@/lib/catalog';
import { SORT_OPTIONS } from '@/lib/sort';
import type { Category, Facets, Ref } from '@/types/api';
import styles from './CatalogFilters.module.css';

interface Props {
  brands: Ref[];
  categories: Category[];
  facets: Facets;
  query: Record<string, string | undefined>;
  selected: SelectedFilters;
}

interface OptionGroupProps {
  title: string;
  name: string;
  options: { value: string; label: string }[];
  selected: string[];
}

// група чекбоксів з однаковим name: форма відправить ?ram=8&ram=12
function OptionGroup({ title, name, options, selected }: OptionGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend>{title}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="checkbox"
            name={name}
            value={option.value}
            defaultChecked={selected.includes(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

// GET-форма: кнопка «Показати» просто відкриває /catalog з новими параметрами
export default function CatalogFilters({
  brands,
  categories,
  facets,
  query,
  selected,
}: Props) {
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

      {facets.ram.length > 0 && (
        <OptionGroup
          title="Оперативна пам'ять"
          name="ram"
          options={facets.ram.map((ram) => ({
            value: String(ram),
            label: `${ram} ГБ`,
          }))}
          selected={selected.ram}
        />
      )}

      {facets.storage.length > 0 && (
        <OptionGroup
          title="Вбудована пам'ять"
          name="storage"
          options={facets.storage.map((storage) => ({
            value: String(storage),
            label: `${storage} ГБ`,
          }))}
          selected={selected.storage}
        />
      )}

      {/* характеристики аксесуарів лише в межах однієї категорії:
          довжина потрібна кабелям, а не чохлам */}
      {query.category &&
        facets.attributes.map((attribute) => (
          <OptionGroup
            key={attribute.name}
            title={attribute.name}
            name="attr"
            options={attribute.values.map((value) => ({
              value: `${attribute.name}:${value}`,
              label: value,
            }))}
            selected={selected.attr}
          />
        ))}

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
