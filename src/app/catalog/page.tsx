import type { Metadata } from 'next';
import CatalogFilters from '@/components/CatalogFilters/CatalogFilters';
import Pagination from '@/components/Pagination/Pagination';
import ProductCard from '@/components/ProductCard/ProductCard';
import { getBrands, getCategories, getProducts } from '@/lib/catalog';
import { isSortKey, SORT_OPTIONS } from '@/lib/sort';
import styles from './page.module.css';
import CatalogSearch from '@/components/CatalogSearch/CatalogSearch';

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

  const [result, brands, categories] = await Promise.all([
    getProducts({
      type: query.type,
      brand: query.brand,
      category: query.category,
      search: query.search,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
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
        <CatalogFilters brands={brands} categories={categories} query={query} />

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
            query={query}
          />
        </section>
      </div>
    </div>
  );
}
