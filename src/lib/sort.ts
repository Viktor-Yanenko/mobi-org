// варіанти сортування в каталозі -> параметри sortBy і sortOrder бекенду
export const SORT_OPTIONS = {
  new: { label: 'Спочатку нові', sortBy: 'createdAt', sortOrder: 'desc' },
  'price-asc': { label: 'Спочатку дешевші', sortBy: 'price', sortOrder: 'asc' },
  'price-desc': {
    label: 'Спочатку дорожчі',
    sortBy: 'price',
    sortOrder: 'desc',
  },
  rating: { label: 'За рейтингом', sortBy: 'rating', sortOrder: 'desc' },
} as const;

export type SortKey = keyof typeof SORT_OPTIONS;

export const isSortKey = (value?: string): value is SortKey =>
  Boolean(value && value in SORT_OPTIONS);