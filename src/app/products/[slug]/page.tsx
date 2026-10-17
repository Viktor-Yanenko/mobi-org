import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage/ProductImage';
import { getProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import type { PhoneSpecs } from '@/types/api';
import VariantPicker from './VariantPicker';
import ProductGallery from './ProductGallery';
import styles from './page.module.css';
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';
import Reviews from '@/components/Reviews/Reviews';
import CompareButton from '@/components/CompareButton/CompareButton';

export async function generateMetadata({
  params,
}: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? 'Товар не знайдено' };
}

const SPECS: { key: keyof PhoneSpecs; label: string; unit?: string }[] = [
  { key: 'os', label: 'Операційна система' },
  { key: 'screenSize', label: 'Діагональ екрана', unit: '″' },
  { key: 'ram', label: "Оперативна пам'ять", unit: ' ГБ' },
  { key: 'battery', label: 'Акумулятор', unit: ' мА·год' },
];

export default async function ProductPage({
  params,
}: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // лише ті характеристики, які заповнені в товару
  const specs = SPECS.filter(({ key }) => product.specs?.[key] !== undefined);

  return (
    <div className="container">
      <p className={styles.breadcrumbs}>
        <Link href="/catalog">Каталог</Link> /{' '}
        <Link href={`/catalog?category=${product.category.slug}`}>
          {product.category.name}
        </Link>
      </p>

      <div className={styles.layout}>
        <ProductGallery
          key={product._id}
          images={product.images}
          name={product.name}
        />

        <div className={styles.info}>
          <p className={styles.brand}>{product.brand.name}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <div className={styles.meta}>
            {product.rating.count > 0 && (
              <a href="#reviews" className={styles.rating}>
                ★ {product.rating.average.toFixed(1)} · відгуків:{' '}
                {product.rating.count}
              </a>
            )}
            <FavoriteButton productId={product._id} />
            {product.type === 'phone' && (
              <CompareButton
                product={{
                  _id: product._id,
                  slug: product.slug,
                  name: product.name,
                }}
              />
            )}
          </div>

          <VariantPicker
            product={{
              _id: product._id,
              name: product.name,
              slug: product.slug,
              image: product.images[0] ?? null,
            }}
            variants={product.variants}
          />

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {specs.length > 0 && (
            <>
              <h2 className={styles.subtitle}>Характеристики</h2>
              <dl className={styles.specs}>
                {specs.map(({ key, label, unit }) => (
                  <div key={key} className={styles.specRow}>
                    <dt>{label}</dt>
                    <dd>
                      {product.specs?.[key]}
                      {unit}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>

      {product.accessories && product.accessories.length > 0 && (
        <section className={styles.accessories}>
          <h2 className={styles.subtitle}>Аксесуари до цього телефону</h2>
          <div className="grid">
            {product.accessories.map((item) => (
              <Link
                key={item._id}
                href={`/products/${item.slug}`}
                className={styles.accessory}
              >
                <ProductImage
                  src={item.images[0]}
                  alt={item.name}
                  sizes="25vw"
                />
                <span>{item.name}</span>
                <strong>{formatPrice(item.minPrice)}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}
      <Reviews
        key={product._id}
        productId={product._id}
        productSlug={product.slug}
      />
    </div>
  );
}
