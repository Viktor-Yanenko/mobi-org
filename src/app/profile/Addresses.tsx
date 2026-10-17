'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import {
  addAddress,
  deleteAddress,
  formatAddress,
  MAX_ADDRESSES,
  setDefaultAddress,
} from '@/lib/profile';
import type { Address } from '@/types/api';
import styles from './forms.module.css';

export default function Addresses() {
  const { user, updateUser } = useAuth();
  // куди доставляти: у відділення Нової пошти чи на адресу (кур'єр)
  const [kind, setKind] = useState<'branch' | 'street'>('branch');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  if (!user) return null;

  // кожен запит повертає новий список адрес: кладемо його в user,
  // тоді й форма оформлення замовлення підставить нову основну адресу
  const run = async (action: () => Promise<Address[]>) => {
    setError('');
    setIsBusy(true);
    try {
      updateUser({ addresses: await action() });
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsBusy(false);
    }
  };

  const handleAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = String(form.get('value')).trim();

    const isAdded = await run(() =>
      addAddress({
        city: String(form.get('city')).trim(),
        ...(kind === 'branch'
          ? { novaPoshtaBranch: value }
          : { street: value }),
        isDefault: form.get('isDefault') === 'on',
      }),
    );
    if (isAdded) setIsFormOpen(false);
  };

  const handleDelete = (address: Address) => {
    if (!confirm(`Видалити адресу «${formatAddress(address)}»?`)) return;
    run(() => deleteAddress(address._id));
  };

  const canAdd = user.addresses.length < MAX_ADDRESSES;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Адреси доставки</h2>

      {user.addresses.length === 0 ? (
        <p className={styles.hint}>
          Адрес ще немає. Основна адреса підставляється при оформленні
          замовлення.
        </p>
      ) : (
        <ul className={styles.addresses}>
          {user.addresses.map((address) => (
            <li key={address._id} className={styles.address}>
              <span>
                {formatAddress(address)}
                {address.isDefault && (
                  <span className={styles.default}>Основна</span>
                )}
              </span>
              <span className={styles.addressActions}>
                {!address.isDefault && (
                  <button
                    type="button"
                    className={styles.linkButton}
                    disabled={isBusy}
                    onClick={() => run(() => setDefaultAddress(address._id))}
                  >
                    Зробити основною
                  </button>
                )}
                <button
                  type="button"
                  className={styles.deleteButton}
                  disabled={isBusy}
                  onClick={() => handleDelete(address)}
                >
                  Видалити
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {isFormOpen ? (
        <form onSubmit={handleAdd} className={styles.form}>
          <div className={styles.kind}>
            <label>
              <input
                type="radio"
                checked={kind === 'branch'}
                onChange={() => setKind('branch')}
              />
              Нова пошта
            </label>
            <label>
              <input
                type="radio"
                checked={kind === 'street'}
                onChange={() => setKind('street')}
              />
              Кур&apos;єр на адресу
            </label>
          </div>
          <label className={styles.field}>
            Місто
            <input name="city" required maxLength={100} />
          </label>
          <label className={styles.field}>
            {kind === 'branch' ? 'Відділення' : 'Вулиця, будинок, квартира'}
            <input
              name="value"
              required
              maxLength={kind === 'branch' ? 100 : 200}
              placeholder={
                kind === 'branch' ? '№12' : 'вул. Шевченка, 5, кв. 3'
              }
            />
          </label>
          <label className={styles.checkbox}>
            <input type="checkbox" name="isDefault" />
            Зробити основною
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.submit} disabled={isBusy}>
              Додати
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setIsFormOpen(false)}
            >
              Скасувати
            </button>
          </div>
        </form>
      ) : canAdd ? (
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsFormOpen(true)}
        >
          + Додати адресу
        </button>
      ) : (
        <p className={styles.hint}>
          Можна зберегти не більше {MAX_ADDRESSES} адрес.
        </p>
      )}
    </section>
  );
}
