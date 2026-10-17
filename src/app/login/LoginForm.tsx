'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import styles from '@/components/AuthForm/AuthForm.module.css';

export default function LoginForm({ next }: { next: string }) {
  const { user, login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // хто вже увійшов, тому сторінка входу не потрібна
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setError('');
    setIsSubmitting(true);
    try {
      await login(String(form.get('email')), String(form.get('password')));
      // далі спрацює useEffect вище і перекине на next
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Вхід</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          Email
          <input type="email" name="email" required autoComplete="email" />
        </label>

        <label className={styles.field}>
          Пароль
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submit} disabled={isSubmitting}>
          {isSubmitting ? 'Входимо…' : 'Увійти'}
        </button>
      </form>

      <p className={styles.switch}>
        Ще немає акаунта?{' '}
        <Link href={`/register?next=${encodeURIComponent(next)}`}>
          Зареєструватися
        </Link>
      </p>
    </div>
  );
}
