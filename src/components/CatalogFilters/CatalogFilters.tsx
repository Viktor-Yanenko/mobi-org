'use client';

import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  toSearchParams,
  type ProductsQuery,
  type SelectedFilters,
} from '@/lib/catalog-query';
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
  name: keyof SelectedFilters;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (name: keyof SelectedFilters, value: string) => void;
}

function OptionGroup({
  title,
  name,
  options,
  selected,
  onToggle,
}: OptionGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend>{title}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="checkbox"
            defaultChecked={selected.includes(option.value)}
            onChange={() => onToggle(name, option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

// фільтри застосовуються одразу: кожна зміна відкриває /catalog з новою адресою
export default function CatalogFilters({
  brands,
  categories,
  facets,
  query,
  selected,
}: Props) {
  const router = useRouter();
  // поки сервер готує нову сторінку, isPending = true
  const [isPending, startTransition] = useTransition();

  // поточні фільтри + зміни; page не передаємо, тож сторінка скидається на першу
  const apply = (changes: ProductsQuery) => {
    const params = toSearchParams({ ...query, ...selected, ...changes });
    startTransition(() => {
      router.push(`/catalog?${params}`, { scroll: false });
    });
  };

  // інший тип товарів: категорія, пам'ять і характеристики від попереднього
  // типу вже не підходять, тому скидаємо їх
  const changeType = (type: string) =>
    apply({ type, category: undefined, ram: [], storage: [], attr: [] });

  // характеристики в кожної категорії свої; тип беремо з категорії
  const changeCategory = (slug: string) => {
    const category = categories.find((c) => c.slug === slug);
    apply({ category: slug, type: category?.type ?? query.type, attr: [] });
  };

  const toggle = (name: keyof SelectedFilters, value: string) => {
    const values = selected[name];
    apply({
      [name]: values.includes(value)
        ? values.filter((v) => v !== value)
        : [...values, value],
    });
  };

  // ціну застосовуємо, коли поле втратило фокус або натиснули Enter,
  // а не на кожну цифру
  const changePrice = (name: 'minPrice' | 'maxPrice', value: string) => {
    if (value !== (query[name] ?? '')) apply({ [name]: value });
  };

  // якщо вибрано тип, показуємо лише його категорії
  const visibleCategories = query.type
    ? categories.filter((c) => c.type === query.type)
    : categories;

  return (
    <form
      className={styles.filters}
      aria-busy={isPending}
      onSubmit={(e) => {
        // Enter у полі ціни
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        apply({
          minPrice: String(form.get('minPrice') ?? ''),
          maxPrice: String(form.get('maxPrice') ?? ''),
        });
      }}
    >
      <label className={styles.field}>
        Тип
        <select
          defaultValue={query.type ?? ''}
          onChange={(e) => changeType(e.target.value)}
        >
          <option value="">Усі товари</option>
          <option value="phone">Смартфони</option>
          <option value="accessory">Аксесуари</option>
        </select>
      </label>

      <label className={styles.field}>
        Категорія
        <select
          defaultValue={query.category ?? ''}
          onChange={(e) => changeCategory(e.target.value)}
        >
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
        <select
          defaultValue={query.brand ?? ''}
          onChange={(e) => apply({ brand: e.target.value })}
        >
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
            onBlur={(e) => changePrice('minPrice', e.target.value)}
          />
          <input
            type="number"
            name="maxPrice"
            min={0}
            placeholder="до"
            defaultValue={query.maxPrice}
            onBlur={(e) => changePrice('maxPrice', e.target.value)}
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
          onToggle={toggle}
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
          onToggle={toggle}
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
            onToggle={toggle}
          />
        ))}

      <label className={styles.field}>
        Сортування
        <select
          defaultValue={query.sort ?? 'new'}
          onChange={(e) => apply({ sort: e.target.value })}
        >
          {Object.entries(SORT_OPTIONS).map(([key, option]) => (
            <option key={key} value={key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* без кнопки форма не відправляється по Enter */}
      <button type="submit" hidden />

      {isPending && <p className={styles.pending}>Оновлюємо…</p>}

      {/* тип лишаємо: «Скинути» на сторінці смартфонів лишає смартфони */}
      <Link
        href={query.type ? `/catalog?type=${query.type}` : '/catalog'}
        className={styles.reset}
      >
        Скинути фільтри
      </Link>
    </form>
  );
}
