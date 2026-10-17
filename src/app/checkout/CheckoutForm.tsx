'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { useCart } from '@/components/CartProvider/CartProvider';
import { getErrorMessage } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import {
  createOrder,
  deliveryCost,
  DELIVERY_OPTIONS,
  FREE_DELIVERY_FROM,
  PAYMENT_LABELS,
} from '@/lib/orders';
import type { DeliveryMethod, PaymentMethod } from '@/types/api';
import styles from './page.module.css';

export default function CheckoutForm() {
  const { user } = useAuth();
  const { cart, isLoading, reload } = useCart();
  const router = useRouter();
  const [method, setMethod] = useState<DeliveryMethod>('nova-poshta');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // після успіху кошик стає порожнім, але показувати «Кошик порожній» не треба
  const [isPlaced, setIsPlaced] = useState(false);

  // сторінка захищена proxy.ts, тож user з'явиться, щойно AuthProvider його завантажить
  if (isLoading || !user)
    return <p className={styles.message}>Завантаження…</p>;

  if (isPlaced) return <p className={styles.message}>Замовлення оформлено…</p>;

  if (cart.items.length === 0) {
    return (
      <div className={styles.message}>
        <p>Кошик порожній.</p>
        <Link href="/catalog" className={styles.link}>
          Перейти в каталог
        </Link>
      </div>
    );
  }

  // адреса за замовчуванням із профілю, щоб не вводити щоразу
  const address = user.addresses.find((a) => a.isDefault) ?? user.addresses[0];
  const delivery = deliveryCost(method, cart.totalPrice);
  const option = DELIVERY_OPTIONS[method];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? '').trim();

    setError('');
    setIsSubmitting(true);
    try {
      const order = await createOrder({
        contact: {
          name: text('name'),
          phone: text('phone'),
          email: text('email'),
        },
        delivery:
          method === 'pickup'
            ? { method }
            : { method, city: text('city'), address: text('address') },
        payment: { method: text('payment') as PaymentMethod },
        comment: text('comment'),
      });

      setIsPlaced(true);
      router.push(`/orders/${order._id}?created=1`);
      // бекенд уже очистив кошик, оновлюємо лічильник у шапці
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.layout}>
      <div className={styles.sections}>
        <fieldset className={styles.section}>
          <legend>Контактні дані</legend>
          <label className={styles.field}>
            Ім&apos;я та прізвище
            <input
              name="name"
              required
              minLength={2}
              defaultValue={user.name}
            />
          </label>
          <div className={styles.row}>
            <label className={styles.field}>
              Телефон
              <input
                type="tel"
                name="phone"
                required
                pattern="\+?\d{10,13}"
                placeholder="+380501234567"
                defaultValue={user.phone}
              />
            </label>
            <label className={styles.field}>
              Email
              <input
                type="email"
                name="email"
                required
                defaultValue={user.email}
              />
            </label>
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Доставка</legend>
          <div className={styles.options}>
            {Object.entries(DELIVERY_OPTIONS).map(([key, value]) => (
              <label key={key} className={styles.option}>
                <input
                  type="radio"
                  name="delivery"
                  value={key}
                  checked={method === key}
                  onChange={() => setMethod(key as DeliveryMethod)}
                />
                <span>{value.label}</span>
                <span className={styles.optionPrice}>
                  {value.cost === 0 || cart.totalPrice >= FREE_DELIVERY_FROM
                    ? 'безкоштовно'
                    : formatPrice(value.cost)}
                </span>
              </label>
            ))}
          </div>

          {method === 'pickup' ? (
            <p className={styles.hint}>
              с. Миртюки, вул. Тараса Шевченка, 2. Щодня 10:00–20:00.
            </p>
          ) : (
            <div className={styles.row}>
              <label className={styles.field}>
                Місто
                <input name="city" required defaultValue={address?.city} />
              </label>
              <label className={styles.field}>
                {option.addressLabel}
                {/* key: при зміні способу доставки поле очищається */}
                <input
                  key={method}
                  name="address"
                  required
                  defaultValue={
                    method === 'nova-poshta'
                      ? address?.novaPoshtaBranch
                      : address?.street
                  }
                />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Оплата</legend>
          <div className={styles.options}>
            {Object.entries(PAYMENT_LABELS).map(([key, label], index) => (
              <label key={key} className={styles.option}>
                <input
                  type="radio"
                  name="payment"
                  value={key}
                  defaultChecked={index === 0}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.section}>
          <legend>Коментар</legend>
          <textarea
            name="comment"
            maxLength={500}
            rows={3}
            placeholder="Наприклад, зручний час для дзвінка"
          />
        </fieldset>
      </div>

      <aside className={styles.summary}>
        <ul className={styles.items}>
          {cart.items.map((item) => (
            <li key={item.sku}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <span>{formatPrice(item.subtotal)}</span>
            </li>
          ))}
        </ul>

        <p className={styles.line}>
          <span>Доставка</span>
          <span>{delivery === 0 ? 'безкоштовно' : formatPrice(delivery)}</span>
        </p>
        <p className={`${styles.line} ${styles.total}`}>
          <span>До сплати</span>
          <span>{formatPrice(cart.totalPrice + delivery)}</span>
        </p>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Оформлюємо…' : 'Підтвердити замовлення'}
        </button>
        <Link href="/cart" className={styles.back}>
          Повернутися до кошика
        </Link>
      </aside>
    </form>
  );
}
