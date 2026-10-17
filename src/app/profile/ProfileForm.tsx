'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import { updateProfile } from '@/lib/profile';
import styles from './forms.module.css';

export default function ProfileForm() {
  const { user, updateUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setMessage('');
    setError('');
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        name: String(form.get('name')).trim(),
        // порожній рядок прибирає телефон з профілю
        phone: String(form.get('phone')).trim(),
      });
      updateUser({ name: updated.name, phone: updated.phone });
      setMessage('Збережено');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Особисті дані</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          Ім&apos;я
          <input
            name="name"
            required
            minLength={2}
            maxLength={50}
            defaultValue={user.name}
          />
        </label>
        <label className={styles.field}>
          Телефон
          <input
            name="phone"
            type="tel"
            pattern="\+?\d{10,13}"
            title="10–13 цифр, можна з + на початку"
            placeholder="+380501234567"
            defaultValue={user.phone}
          />
        </label>
        <p className={styles.hint}>
          Email змінити не можна: він потрібен для входу.
        </p>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Зберігаємо…' : 'Зберегти'}
        </button>
      </form>
    </section>
  );
}
