'use client';

import { useEffect, useState } from 'react';
import {
  createProduct,
  getAdminProducts,
  getBrands,
  getCategories,
  slugify,
  updateProduct,
  type ProductPayload,
} from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import type { Category, Product, ProductType, Ref, Variant } from '@/types/api';
import styles from './ProductForm.module.css';

const ACCESSORY_TYPES = {
  case: 'Чохол',
  charger: 'Зарядний пристрій',
  cable: 'Кабель',
  headphones: 'Навушники',
  'screen-protector': 'Захисне скло',
  powerbank: 'Павербанк',
  other: 'Інше',
};

// у полях форми все рядки; числа перетворюємо при відправці
interface VariantRow {
  key: string;
  sku: string;
  color: string;
  storage: string;
  price: string;
  oldPrice: string;
  stock: string;
  images?: string[];
}

// ключ для React, щоб при видаленні рядка не переплутались значення полів
let nextKey = 0;

const toRow = (v?: Variant): VariantRow => ({
  key: String(nextKey++),
  sku: v?.sku ?? '',
  color: v?.color ?? '',
  storage: v?.storage?.toString() ?? '',
  price: v?.price?.toString() ?? '',
  oldPrice: v?.oldPrice?.toString() ?? '',
  stock: v?.stock?.toString() ?? '0',
  images: v?.images,
});

// бекенд не приймає порожні рядки, тому необов'язкові поля просто пропускаємо
const toVariant = (row: VariantRow) => ({
  sku: row.sku.trim().toUpperCase(),
  price: Number(row.price),
  stock: Number(row.stock || 0),
  ...(row.color.trim() && { color: row.color.trim() }),
  ...(row.storage && { storage: Number(row.storage) }),
  ...(row.oldPrice && { oldPrice: Number(row.oldPrice) }),
  ...(row.images?.length && { images: row.images }),
});

interface Props {
  // немає product: створення нового товару
  product?: Product;
  onSaved: (product: Product) => void;
}

export default function ProductForm({ product, onSaved }: Props) {
  const [type, setType] = useState<ProductType>(product?.type ?? 'phone');
  const [variants, setVariants] = useState<VariantRow[]>(
    product ? product.variants.map(toRow) : [toRow()],
  );
  const [brands, setBrands] = useState<Ref[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [phones, setPhones] = useState<Product[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getBrands(),
      getCategories(),
      getAdminProducts({
        type: 'phone',
        perPage: '50',
        sortBy: 'name',
        sortOrder: 'asc',
      }),
    ])
      .then(([b, c, p]) => {
        setBrands(b);
        setCategories(c);
        setPhones(p.data);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string,
  ) =>
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    const number = (name: string) =>
      text(name) ? Number(text(name)) : undefined;

    const payload: ProductPayload = {
      name: text('name'),
      slug: text('slug') || slugify(text('name')),
      description: text('description'),
      brand: text('brand'),
      category: text('category'),
      variants: variants.map(toVariant),
      ...(type === 'phone'
        ? {
            // JSON.stringify сам викине undefined
            specs: {
              os: text('os') || undefined,
              screenSize: number('screenSize'),
              ram: number('ram'),
              battery: number('battery'),
            },
          }
        : {
            accessoryType: text('accessoryType'),
            compatibleWith: form.getAll('compatibleWith').map(String),
          }),
    };

    setError('');
    setMessage('');
    setIsSaving(true);
    try {
      const saved = product
        ? await updateProduct(product._id, payload)
        : await createProduct({ type, ...payload });
      setMessage('Збережено');
      onSaved(saved);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // бренд і категорія можуть прийти populated ({ _id, name }) або просто id
  const idOf = (value?: Ref | string) =>
    typeof value === 'string' ? value : value?._id;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <fieldset className={styles.section}>
        <legend>Основне</legend>

        {/* тип змінити не можна: це різні підмоделі на бекенді */}
        <div className={styles.typeSwitch}>
          {(['phone', 'accessory'] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                checked={type === value}
                disabled={Boolean(product)}
                onChange={() => setType(value)}
              />
              {value === 'phone' ? 'Телефон' : 'Аксесуар'}
            </label>
          ))}
        </div>

        <label className={styles.field}>
          Назва
          <input
            name="name"
            required
            minLength={2}
            defaultValue={product?.name}
          />
        </label>
        <label className={styles.field}>
          Slug (адреса сторінки)
          <input
            name="slug"
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            placeholder="створиться з назви, якщо лишити порожнім"
            defaultValue={product?.slug}
          />
        </label>
        <div className={styles.row}>
          <label className={styles.field}>
            Бренд
            {/* key: defaultValue застосується, коли бренди завантажаться */}
            <select
              key={`brand-${brands.length}`}
              name="brand"
              required
              defaultValue={idOf(product?.brand) ?? ''}
            >
              <option value="" disabled>
                Виберіть бренд
              </option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Категорія
            <select
              key={`category-${categories.length}-${type}`}
              name="category"
              required
              defaultValue={idOf(product?.category) ?? ''}
            >
              <option value="" disabled>
                Виберіть категорію
              </option>
              {categories
                .filter((c) => c.type === type)
                .map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <label className={styles.field}>
          Опис
          <textarea
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={product?.description}
          />
        </label>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Варіанти (колір, пам&apos;ять, ціна, залишок)</legend>
        <div className={styles.variants}>
          <div className={styles.variantHead}>
            <span>SKU</span>
            <span>Колір</span>
            <span>Пам&apos;ять, ГБ</span>
            <span>Ціна, ₴</span>
            <span>Стара ціна</span>
            <span>Склад</span>
            <span />
          </div>
          {variants.map((row, index) => (
            <div key={row.key} className={styles.variant}>
              <input
                aria-label="SKU"
                required
                value={row.sku}
                onChange={(e) => updateVariant(index, 'sku', e.target.value)}
              />
              <input
                aria-label="Колір"
                value={row.color}
                onChange={(e) => updateVariant(index, 'color', e.target.value)}
              />
              <input
                aria-label="Пам'ять"
                type="number"
                min={1}
                value={row.storage}
                onChange={(e) =>
                  updateVariant(index, 'storage', e.target.value)
                }
              />
              <input
                aria-label="Ціна"
                type="number"
                min={0}
                required
                value={row.price}
                onChange={(e) => updateVariant(index, 'price', e.target.value)}
              />
              <input
                aria-label="Стара ціна"
                type="number"
                min={0}
                value={row.oldPrice}
                onChange={(e) =>
                  updateVariant(index, 'oldPrice', e.target.value)
                }
              />
              <input
                aria-label="Склад"
                type="number"
                min={0}
                value={row.stock}
                onChange={(e) => updateVariant(index, 'stock', e.target.value)}
              />
              <button
                type="button"
                aria-label="Видалити варіант"
                className={styles.removeVariant}
                disabled={variants.length === 1}
                onClick={() =>
                  setVariants((rows) => rows.filter((_, i) => i !== index))
                }
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.addVariant}
          onClick={() => setVariants((rows) => [...rows, toRow()])}
        >
          + Додати варіант
        </button>
      </fieldset>

      {type === 'phone' ? (
        <fieldset className={styles.section}>
          <legend>Характеристики</legend>
          <div className={styles.row}>
            <label className={styles.field}>
              Операційна система
              <input name="os" defaultValue={product?.specs?.os} />
            </label>
            <label className={styles.field}>
              Діагональ, дюймів
              <input
                name="screenSize"
                type="number"
                step="0.01"
                min={1}
                max={20}
                defaultValue={product?.specs?.screenSize}
              />
            </label>
            <label className={styles.field}>
              Оперативна пам&apos;ять, ГБ
              <input
                name="ram"
                type="number"
                min={1}
                defaultValue={product?.specs?.ram}
              />
            </label>
            <label className={styles.field}>
              Акумулятор, мА·год
              <input
                name="battery"
                type="number"
                min={100}
                defaultValue={product?.specs?.battery}
              />
            </label>
          </div>
        </fieldset>
      ) : (
        <fieldset className={styles.section}>
          <legend>Аксесуар</legend>
          <label className={styles.field}>
            Тип аксесуара
            <select
              name="accessoryType"
              required
              defaultValue={product?.accessoryType ?? 'case'}
            >
              {Object.entries(ACCESSORY_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <p className={styles.label}>Сумісні телефони</p>
          <div className={styles.checkboxes}>
            {phones.map((phone) => (
              <label key={phone._id}>
                <input
                  type="checkbox"
                  name="compatibleWith"
                  value={phone._id}
                  defaultChecked={product?.compatibleWith?.includes(phone._id)}
                />
                {phone.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {error && <p className={styles.error}>{error}</p>}
      {message && <p className={styles.success}>{message}</p>}

      <button type="submit" className={styles.submit} disabled={isSaving}>
        {isSaving
          ? 'Зберігаємо…'
          : product
            ? 'Зберегти зміни'
            : 'Створити товар'}
      </button>
    </form>
  );
}
