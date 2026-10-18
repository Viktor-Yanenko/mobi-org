import type { Metadata } from 'next';
import CatalogFilters from '@/components/CatalogFilters/CatalogFilters';
import CatalogSearch from '@/components/CatalogSearch/CatalogSearch';
import Pagination from '@/components/Pagination/Pagination';
import ProductCard from '@/components/ProductCard/ProductCard';
import {
  getBrands,
  getCategories,
  getFacets,
  getProducts,
} from '@/lib/catalog';
import { toSearchParams, type SelectedFilters } from '@/lib/catalog-query';
import { isSortKey, SORT_OPTIONS } from '@/lib/sort';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Каталог' };

const FILTER_KEYS = [
  'type',
  'brand',
  'category',
  'search',
  'minPrice',
  'maxPrice',
  'sort',
] as const;

// фільтри, у яких можна вибрати кілька значень (чекбокси)
const MULTI_KEYS = ['ram', 'storage', 'attr'] as const;

export default async function CatalogPage({
  searchParams,
}: PageProps<'/catalog'>) {
  const params = await searchParams;

  // беремо з адреси лише відомі фільтри і лише рядки
  const query: Record<string, string | undefined> = {};
  for (const key of FILTER_KEYS) {
    const value = params[key];
    if (typeof value === 'string' && value) query[key] = value;
  }

  const page = typeof params.page === 'string' ? params.page : '1';
  const sort = SORT_OPTIONS[isSortKey(query.sort) ? query.sort : 'new'];

  const baseQuery = {
    type: query.type,
    brand: query.brand,
    category: query.category,
    search: query.search,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
  };
  const facets = await getFacets(baseQuery);

  // лишаємо тільки ті вибрані значення, які є серед доступних. Інакше після
  // переходу з «Кабелів» у «Чохли» фільтр «Довжина: 1 м» лишився б у адресі
  // і нічого б не знайшлося
  const available = {
    ram: facets.ram.map(String),
    storage: facets.storage.map(String),
    attr: query.category
      ? facets.attributes.flatMap((a) => a.values.map((v) => `${a.name}:${v}`))
      : [],
  };
  const selected = {} as SelectedFilters;
  for (const key of MULTI_KEYS) {
    selected[key] = [params[key] ?? []]
      .flat()
      .filter((value) => available[key].includes(value));
  }

  const [result, brands, categories] = await Promise.all([
    getProducts({
      ...baseQuery,
      ...selected,
      sortBy: sort.sortBy,
      sortOrder: sort.sortOrder,
      page,
      perPage: '12',
    }),
    getBrands(),
    getCategories(),
  ]);

  const title = query.search
    ? `Пошук: «${query.search}»`
    : query.type === 'phone'
      ? 'Смартфони'
      : query.type === 'accessory'
        ? 'Аксесуари'
        : 'Каталог';

  return (
    <div className="container">
      <h1 className={styles.title}>
        {title} <span className={styles.count}>{result.totalItems}</span>
      </h1>

      <div className={styles.layout}>
        {/* key змінюється разом з адресою: тоді фільтри створюються заново
            і показують саме те, що в адресі (наприклад, після переходу
            з меню «Смартфони» не лишається вибраних «Кабелів») */}
        <CatalogFilters
          key={toSearchParams({ ...query, ...selected }).toString()}
          brands={brands}
          categories={categories}
          facets={facets}
          query={query}
          selected={selected}
        />

        <section>
          <CatalogSearch initial={query.search} />

          {result.data.length === 0 ? (
            <p className={styles.empty}>
              Нічого не знайшли. Спробуйте змінити фільтри.
            </p>
          ) : (
            <div className="grid">
              {result.data.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            query={{ ...query, ...selected }}
          />
        </section>
      </div>
    </div>
  );
}
