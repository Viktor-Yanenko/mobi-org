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
  getAttributeSuggestions,
} from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import { SPEC_FIELDS, type SpecField } from '@/lib/specs';
import type {
  Category,
  Product,
  ProductType,
  Ref,
  Variant,
  AccessoryAttribute,
  Facets,
} from '@/types/api';
import styles from './ProductForm.module.css';

const ACCESSORY_TYPES = {
  case: 'Чохол',
  charger: 'Зарядний пристрій',
  cable: 'Кабель',
  headphones: 'Навушники',
  'screen-protector': 'Захисне скло',
  powerbank: 'Павербанк',
  smartwatch: 'Смарт-годинник',
  speaker: 'Колонка',
  'memory-card': 'Карта пам’яті',
  holder: 'Тримач',
  other: 'Інше',
};

// у полях форми все рядки; числа перетворюємо при відправці
interface VariantRow {
  key: string;
  sku: string;
  color: string;
  storage: string;
  ram: string;
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
  ram: v?.ram?.toString() ?? '',
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
  ...(row.ram && { ram: Number(row.ram) }),
  ...(row.oldPrice && { oldPrice: Number(row.oldPrice) }),
  ...(row.images?.length && { images: row.images }),
});

// характеристика аксесуара в формі; key — як у варіантів
interface AttributeRow {
  key: string;
  name: string;
  value: string;
}

const toAttributeRow = (a?: AccessoryAttribute): AttributeRow => ({
  key: String(nextKey++),
  name: a?.name ?? '',
  value: a?.value ?? '',
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
  const [attributes, setAttributes] = useState<AttributeRow[]>(
    product?.attributes?.map(toAttributeRow) ?? [],
  );
  const [brands, setBrands] = useState<Ref[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(
    typeof product?.category === 'string'
      ? product.category
      : (product?.category?._id ?? ''),
  );
  // характеристики, які вже є в товарів цієї категорії (підказки в полях)
  const [suggestions, setSuggestions] = useState<Facets['attributes']>([]);
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

  const categorySlug = categories.find((c) => c._id === categoryId)?.slug;

  useEffect(() => {
    if (type !== 'accessory' || !categorySlug) return;
    getAttributeSuggestions(categorySlug)
      .then((facets) => setSuggestions(facets.attributes))
      .catch(() => setSuggestions([])); // без підказок форма теж працює
  }, [type, categorySlug]);

  const updateVariant = (
    index: number,
    field: keyof VariantRow,
    value: string,
  ) =>
    setVariants((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );

  const updateAttribute = (
    index: number,
    field: 'name' | 'value',
    value: string,
  ) =>
    setAttributes((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();
    const number = (name: string) =>
      text(name) ? Number(text(name)) : undefined;

    const specValue = ({ key, type }: SpecField) => {
      if (type === 'number') return number(key);
      // '' означає «не вказано»: таке поле не відправляємо
      if (type === 'boolean')
        return text(key) ? text(key) === 'true' : undefined;
      return text(key) || undefined;
    };

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
            specs: Object.fromEntries(
              SPEC_FIELDS.map((field) => [field.key, specValue(field)]),
            ),
          }
        : {
            accessoryType: text('accessoryType'),
            compatibleWith: form.getAll('compatibleWith').map(String),
            attributes: attributes
              .map((row) => ({
                name: row.name.trim(),
                value: row.value.trim(),
              }))
              .filter((row) => row.name && row.value),
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
              onChange={(e) => setCategoryId(e.target.value)}
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
            <span>RAM, ГБ</span>
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
                aria-label="Оперативна пам'ять"
                type="number"
                min={1}
                value={row.ram}
                onChange={(e) => updateVariant(index, 'ram', e.target.value)}
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
          {SPEC_FIELDS.map((field) => {
            const value = product?.specs?.[field.key];
            const unit = field.formUnit ?? field.unit?.trim();
            return (
              <label key={field.key} className={styles.field}>
                {field.label}
                {unit && `, ${unit}`}
                {field.type === 'boolean' ? (
                  <select
                    name={field.key}
                    defaultValue={value === undefined ? '' : String(value)}
                  >
                    <option value="">Не вказано</option>
                    <option value="true">Так</option>
                    <option value="false">Ні</option>
                  </select>
                ) : (
                  <input
                    name={field.key}
                    type={field.type === 'number' ? 'number' : 'text'}
                    step="any"
                    min={field.type === 'number' ? 0 : undefined}
                    placeholder={field.example}
                    defaultValue={value === undefined ? '' : String(value)}
                  />
                )}
              </label>
            );
          })}
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
          <p className={styles.label}>Характеристики</p>
          {/* підказки: однакові назви й значення потрібні для фільтрів каталогу */}
          <datalist id="attribute-names">
            {suggestions.map((s) => (
              <option key={s.name} value={s.name} />
            ))}
          </datalist>
          <div className={styles.attributes}>
            {attributes.map((row, index) => (
              <div key={row.key} className={styles.attribute}>
                <input
                  aria-label="Назва характеристики"
                  placeholder="Наприклад, Довжина"
                  value={row.name}
                  onChange={(e) =>
                    updateAttribute(index, 'name', e.target.value)
                  }
                />
                <input
                  aria-label="Значення"
                  placeholder="1 м"
                  list={`attribute-values-${row.key}`}
                  value={row.value}
                  onChange={(e) =>
                    updateAttribute(index, 'value', e.target.value)
                  }
                />
                <datalist id={`attribute-values-${row.key}`}>
                  {suggestions
                    .find((s) => s.name === row.name)
                    ?.values.map((value) => (
                      <option key={value} value={value} />
                    ))}
                </datalist>
                <button
                  type="button"
                  aria-label="Видалити характеристику"
                  className={styles.removeVariant}
                  onClick={() =>
                    setAttributes((rows) => rows.filter((_, i) => i !== index))
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
            onClick={() => setAttributes((rows) => [...rows, toAttributeRow()])}
          >
            + Додати характеристику
          </button>
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
