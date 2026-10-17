import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductImage from '@/components/ProductImage/ProductImage';
import { getProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import type { PhoneSpecs } from '@/types/api';
import VariantPicker from './VariantPicker';
import styles from './page.module.css';

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
        <div className={styles.gallery}>
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            sizes="(max-width: 800px) 100vw, 50vw"
            priority
          />
          {product.images.length > 1 && (
            <div className={styles.thumbs}>
              {product.images.slice(1).map((src) => (
                <ProductImage
                  key={src}
                  src={src}
                  alt={product.name}
                  sizes="120px"
                />
              ))}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>{product.brand.name}</p>
          <h1 className={styles.name}>{product.name}</h1>
          {product.rating.count > 0 && (
            <p className={styles.rating}>
              ★ {product.rating.average.toFixed(1)} · відгуків:{' '}
              {product.rating.count}
            </p>
          )}

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
    </div>
  );
}
