import Link from 'next/link';
import { toSearchParams, type ProductsQuery } from '@/lib/catalog-query';
import styles from './Pagination.module.css';

interface Props {
  page: number;
  totalPages: number;
  // поточні фільтри, щоб не загубити їх при переході на іншу сторінку
  query: ProductsQuery;
}

export default function Pagination({ page, totalPages, query }: Props) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number) => {
    const params = toSearchParams(query);
    params.set('page', String(target));
    return `/catalog?${params}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={styles.pagination} aria-label="Сторінки">
      {pages.map((p) =>
        p === page ? (
          <span key={p} className={styles.current} aria-current="page">
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={styles.link}>
            {p}
          </Link>
        ),
      )}
    </nav>
  );
}
