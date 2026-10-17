'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import { changePassword } from '@/lib/profile';
import styles from './forms.module.css';

export default function PasswordForm() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get('currentPassword'));
    const newPassword = String(form.get('newPassword'));

    setMessage('');
    // збіг двох полів перевіряємо самі, бекенду повтор не потрібен
    if (newPassword !== form.get('repeatPassword')) {
      setError('Нові паролі не збігаються');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      formElement.reset();
      setMessage('Пароль змінено');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Зміна пароля</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          Поточний пароль
          <input
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <label className={styles.field}>
          Новий пароль
          <input
            name="newPassword"
            type="password"
            required
            minLength={8}
            maxLength={64}
            autoComplete="new-password"
          />
        </label>
        <label className={styles.field}>
          Повторіть новий пароль
          <input
            name="repeatPassword"
            type="password"
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}

        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Змінюємо…' : 'Змінити пароль'}
        </button>
      </form>
    </section>
  );
}
