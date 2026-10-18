import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CompareButton from '@/components/CompareButton/CompareButton';
import FavoriteButton from '@/components/FavoriteButton/FavoriteButton';
import ProductImage from '@/components/ProductImage/ProductImage';
import Reviews from '@/components/Reviews/Reviews';
import { getProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import {
  formatSpec,
  MEMORY_ROWS,
  memoryValues,
  SPEC_GROUPS,
} from '@/lib/specs';
import ProductGallery from './ProductGallery';
import VariantPicker from './VariantPicker';
import styles from './page.module.css';

export async function generateMetadata({
  params,
}: PageProps<'/products/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? 'Товар не знайдено' };
}

export default async function ProductPage({
  params,
}: PageProps<'/products/[slug]'>) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  // лише заповнені характеристики; група без жодної не показується
  const specGroups = SPEC_GROUPS.map((group) => ({
    ...group,
    fields: group.fields.filter(
      ({ key }) => product.specs?.[key] !== undefined,
    ),
  })).filter((group) => group.fields.length > 0);

  // пам'ять телефону з варіантів; рядки без значень не показуємо
  const memory =
    product.type === 'phone'
      ? MEMORY_ROWS.map(({ label, key }) => ({
          label,
          value: memoryValues(product, key),
        })).filter((row) => row.value)
      : [];

  return (
    <div className="container">
      <p className={styles.breadcrumbs}>
        <Link href="/catalog">Каталог</Link> /{' '}
        <Link href={`/catalog?category=${product.category.slug}`}>
          {product.category.name}
        </Link>
      </p>

      <div className={styles.layout}>
        {/* key: на сторінці іншого товару галерея починається з першого фото */}
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
            {/* порівнюємо лише телефони: в аксесуарів немає характеристик */}
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

          {/* в аксесуарів довільні характеристики: назва — значення */}
          {product.attributes && product.attributes.length > 0 && (
            <>
              <h2 className={styles.subtitle}>Характеристики</h2>
              <dl className={styles.specs}>
                {product.attributes.map((attribute, index) => (
                  <div key={index} className={styles.specRow}>
                    <dt>{attribute.name}</dt>
                    <dd>{attribute.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {(memory.length > 0 || specGroups.length > 0) && (
            <>
              <h2 className={styles.subtitle}>Характеристики</h2>
              {memory.length > 0 && (
                <section className={styles.specGroup}>
                  <h3>Пам&apos;ять</h3>
                  <dl className={styles.specs}>
                    {memory.map((row) => (
                      <div key={row.label} className={styles.specRow}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {specGroups.map((group) => (
                <section key={group.title} className={styles.specGroup}>
                  <h3>{group.title}</h3>
                  <dl className={styles.specs}>
                    {group.fields.map((field) => (
                      <div key={field.key} className={styles.specRow}>
                        <dt>{field.label}</dt>
                        <dd>{formatSpec(field, product.specs?.[field.key])}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
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

      {/* key: при переході на інший товар відгуки завантажуються з нуля */}
      <Reviews
        key={product._id}
        productId={product._id}
        productSlug={product.slug}
      />
    </div>
  );
}
