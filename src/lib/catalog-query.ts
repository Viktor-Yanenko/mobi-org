// параметри адреси каталогу; файл без запитів до бекенду, тому його можна
// імпортувати і в серверних, і в клієнтських компонентах

// масив — це кілька значень одного фільтра: ?ram=8&ram=12
export type ProductsQuery = Record<string, string | string[] | undefined>;

// вибрані чекбокси у фільтрах каталогу
export type SelectedFilters = Record<'ram' | 'storage' | 'attr', string[]>;

// порожні параметри не відправляємо, масиви додаємо по одному значенню
export const toSearchParams = (query: ProductsQuery) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of [value ?? []].flat()) {
      if (item) params.append(key, item);
    }
  }
  return params;
};