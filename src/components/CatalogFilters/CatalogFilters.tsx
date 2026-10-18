'use client';

import { useState, useTransition } from 'react';
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
  // поле пошуку над чекбоксами, коли варіантів багато (моделі телефонів)
  searchable?: boolean;
}

// текст пошуку в групах. Після кожного кліку фільтри створюються заново
// (key у page.tsx), і звичайний useState втратив би введене. Змінна поза
// компонентом живе, поки відкрита вкладка
const searchTexts = new Map<string, string>();

function OptionGroup({
  title,
  name,
  options,
  selected,
  onToggle,
  searchable,
}: OptionGroupProps) {
  const [search, setSearch] = useState(searchTexts.get(name) ?? '');
  const text = search.trim().toLowerCase();

  // вибрані лишаємо завжди, решту — якщо назва містить введений текст
  const visible = options.filter(
    (option) =>
      selected.includes(option.value) ||
      option.label.toLowerCase().includes(text),
  );

  return (
    <fieldset className={styles.group}>
      <legend>{title}</legend>
      {searchable && (
        <input
          type="search"
          className={styles.groupSearch}
          placeholder="Пошук моделі"
          aria-label={`Пошук: ${title}`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            searchTexts.set(name, e.target.value);
          }}
        />
      )}
      {visible.length === 0 && <p className={styles.noOptions}>Не знайдено</p>}
      {visible.map((option) => (
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
  const changeType = (type: string) => {
    searchTexts.clear();
    apply({
      type,
      category: undefined,
      ram: [],
      storage: [],
      attr: [],
      compatible: [],
    });
  };

  // характеристики в кожної категорії свої; тип беремо з категорії
  const changeCategory = (slug: string) => {
    const category = categories.find((c) => c.slug === slug);
    searchTexts.clear();
    apply({
      category: slug,
      type: category?.type ?? query.type,
      attr: [],
      compatible: [],
    });
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

      {/* сумісність — для аксесуарів: і для всіх одразу («усе для iPhone 16»),
          і для однієї категорії */}
      {(query.type === 'accessory' || query.category) &&
        facets.compatible.length > 0 && (
          <OptionGroup
            title="Сумісність з моделлю"
            name="compatible"
            options={facets.compatible.map((phone) => ({
              value: phone.slug,
              label: phone.name,
            }))}
            selected={selected.compatible}
            onToggle={toggle}
            searchable
          />
        )}

      {/* характеристики — лише в межах однієї категорії:
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
