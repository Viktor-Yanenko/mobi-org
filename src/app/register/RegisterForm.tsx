'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import styles from '@/components/AuthForm/AuthForm.module.css';

export default function RegisterForm({ next }: { next: string }) {
  const { user, register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = String(form.get('phone')).trim();

    const password = String(form.get('password'));

    // повтор пароля перевіряємо самі, на бекенд він не йде
    if (password !== form.get('repeatPassword')) {
      setError('Паролі не збігаються');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await register({
        name: String(form.get('name')).trim(),
        email: String(form.get('email')).trim(),
        password,
        // телефон необов'язковий: порожній рядок бекенд не пропустить
        ...(phone && { phone }),
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Реєстрація</h1>

      {/* обмеження ті самі, що в Joi-схемі бекенду */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          Ім&apos;я
          <input
            name="name"
            required
            minLength={2}
            maxLength={50}
            autoComplete="name"
          />
        </label>

        <label className={styles.field}>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>

        <label className={styles.field}>
          Телефон <span className={styles.hint}>необов&apos;язково</span>
          <input
            type="tel"
            name="phone"
            pattern="\+?\d{10,13}"
            placeholder="+380501234567"
            autoComplete="tel"
          />
        </label>

        <label className={styles.field}>
          Пароль <span className={styles.hint}>щонайменше 8 символів</span>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            maxLength={64}
            autoComplete="new-password"
          />
        </label>

        <label className={styles.field}>
          Повторіть пароль
          <input
            type="password"
            name="repeatPassword"
            required
            autoComplete="new-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Створюємо акаунт…' : 'Зареєструватися'}
        </button>
      </form>

      <p className={styles.switch}>
        Уже є акаунт?{' '}
        <Link href={`/login?next=${encodeURIComponent(next)}`}>Увійти</Link>
      </p>
    </div>
  );
}
