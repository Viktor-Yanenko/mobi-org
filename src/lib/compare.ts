import { useSyncExternalStore } from 'react';
import { apiFetch } from './client-api';
import { formatPrice } from './format';
import type { Product } from '@/types/api';
import { formatSpec, SPEC_FIELDS, type SpecField, MEMORY_ROWS, memoryValues } from './specs';

// ---------- список порівняння в localStorage ----------

export const MAX_COMPARE = 3;

export interface CompareItem {
  _id: string;
  slug: string;
  name: string;
}

const STORAGE_KEY = 'mobiorg-compare';
const EMPTY: CompareItem[] = [];
const listeners = new Set<() => void>();

// useSyncExternalStore вимагає, щоб незмінений список був тим самим масивом,
// тому запам'ятовуємо останній прочитаний рядок і його розбір
let cache = { raw: '', items: EMPTY };

const readItems = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? '';
    if (raw !== cache.raw) {
      cache = { raw, items: raw ? JSON.parse(raw) : EMPTY };
    }
  } catch {
    // зіпсований запис або localStorage недоступний
    cache = { raw: '', items: EMPTY };
  }
  return cache.items;
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // подія storage приходить зі сторінок в інших вкладках
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
};

const writeItems = (items: CompareItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
};

// на сервері localStorage немає, тому там список завжди порожній
export const useCompareList = () =>
  useSyncExternalStore(subscribe, readItems, () => EMPTY);

export const addToCompare = (item: CompareItem) =>
  writeItems([...readItems(), item]);

export const removeFromCompare = (productId: string) =>
  writeItems(readItems().filter((item) => item._id !== productId));

// ---------- дані для таблиці ----------

export const getCompareProduct = (slug: string) =>
  apiFetch<Product>(`/products/${encodeURIComponent(slug)}`);

export interface CompareRow {
  label: string;
  value: (product: Product) => string | number | undefined;
  // яке значення найкраще: більше чи менше (для підсвічування)
  best?: 'max' | 'min';
  format?: (value: number) => string;
}

// різні значення без повторів, наприклад пам'ять усіх варіантів: 128 / 256
const unique = <T>(values: (T | undefined)[]) => [
  ...new Set(values.filter((value) => value !== undefined)),
];

// рядок порівняння з характеристики телефону
const specRow = (field: SpecField): CompareRow => ({
  label: field.label,
  value: (p) => {
    const value = p.specs?.[field.key];
    // «Так» / «Ні» порівнюємо як текст, числа — як числа
    return typeof value === 'boolean' ? formatSpec(field, value) : value;
  },
  best: field.best,
  format: (value) => formatSpec(field, value),
});

export const COMPARE_ROWS: CompareRow[] = [
  {
    label: 'Ціна від',
    value: (p) => p.minPrice,
    best: 'min',
    format: formatPrice,
  },
  {
    label: 'Рейтинг',
    value: (p) => (p.rating.count > 0 ? p.rating.average : undefined),
    best: 'max',
    format: (value) => `★ ${value.toFixed(1)}`,
  },
  { label: 'Бренд', value: (p) => p.brand.name },
  ...SPEC_FIELDS.map(specRow),
  ...MEMORY_ROWS.map(({ key, label }) => ({
    label,
    value: (p: Product) => memoryValues(p, key),
  })),
  {
    label: 'Кольори',
    value: (p) => {
      const colors = unique(p.variants.map((v) => v.color));
      return colors.length ? colors.join(', ') : undefined;
    },
  },
];