'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { addFavorite, removeFavorite } from '@/lib/favorites';
import { getErrorMessage } from '@/lib/errors';
import styles from './FavoriteButton.module.css';

export default function FavoriteButton({ productId }: { productId: string }) {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  // id обраних товарів приходять разом із користувачем (/auth/current)
  const isFavorite = Boolean(user?.favorites.includes(productId));

  const handleClick = async () => {
    // обране зберігається в акаунті, тому гостя спершу ведемо на вхід
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    setError('');
    setIsBusy(true);
    try {
      const list = isFavorite
        ? await removeFavorite(productId)
        : await addFavorite(productId);
      updateUser({ favorites: list.map((product) => product._id) });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={isFavorite ? styles.active : styles.button}
        disabled={isBusy}
        aria-pressed={isFavorite}
        onClick={handleClick}
      >
        {isFavorite ? '♥ В обраному' : '♡ В обране'}
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </>
  );
}
