'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider/AuthProvider';
import { getErrorMessage } from '@/lib/errors';
import { formatDate } from '@/lib/orders';
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from '@/lib/reviews';
import type { Review, ReviewData } from '@/types/api';
import ReviewForm from './ReviewForm';
import StarRating from './StarRating';
import styles from './Reviews.module.css';

interface Props {
  productId: string;
  productSlug: string;
}

export default function Reviews({ productId, productSlug }: Props) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState('');
  // id відгуку, який зараз редагуємо
  const [editingId, setEditingId] = useState('');

  // перша сторінка, потім «Показати ще» дописує наступні в кінець
  useEffect(() => {
    getReviews(productId, page)
      .then((result) => {
        setReviews((prev) =>
          page === 1 ? result.data : [...prev, ...result.data],
        );
        setTotalPages(result.totalPages);
        setTotalItems(result.totalItems);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setIsLoaded(true));
  }, [productId, page]);

  const isOwn = (review: Review) => review.user?._id === user?._id;
  const hasOwnReview = reviews.some(isOwn);

  // середня оцінка на сторінці рахується сервером, тому після змін
  // просимо Next.js перемалювати серверну частину сторінки
  const handleCreate = async (data: ReviewData) => {
    const review = await createReview(productId, data);
    // бекенд повертає відгук без імені автора, підставляємо своє
    setReviews((prev) => [
      { ...review, user: { _id: user!._id, name: user!.name } },
      ...prev,
    ]);
    setTotalItems((n) => n + 1);
    router.refresh();
  };

  const handleUpdate = async (review: Review, data: ReviewData) => {
    const updated = await updateReview(review._id, data);
    setReviews((prev) =>
      prev.map((r) =>
        r._id === review._id ? { ...updated, user: r.user } : r,
      ),
    );
    setEditingId('');
    router.refresh();
  };

  const handleDelete = async (review: Review) => {
    if (!confirm('Видалити відгук?')) return;
    try {
      await deleteReview(review._id);
      setReviews((prev) => prev.filter((r) => r._id !== review._id));
      setTotalItems((n) => n - 1);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section id="reviews" className={styles.section}>
      <h2 className={styles.title}>
        Відгуки {totalItems > 0 && <span>({totalItems})</span>}
      </h2>

      {isLoading ? null : !user ? (
        <p className={styles.muted}>
          <Link
            href={`/login?next=/products/${productSlug}`}
            className={styles.link}
          >
            Увійдіть
          </Link>
          , щоб залишити відгук.
        </p>
      ) : (
        !hasOwnReview && <ReviewForm onSubmit={handleCreate} />
      )}

      {error && <p className={styles.error}>{error}</p>}

      {isLoaded && reviews.length === 0 && (
        <p className={styles.muted}>Відгуків ще немає. Будьте першим!</p>
      )}

      <ul className={styles.list}>
        {reviews.map((review) => (
          <li key={review._id} className={styles.review}>
            <div className={styles.header}>
              <strong>{review.user?.name ?? 'Користувач'}</strong>
              {review.isVerifiedPurchase && (
                <span className={styles.verified}>✓ Підтверджена покупка</span>
              )}
              <span className={styles.date}>
                {formatDate(review.createdAt)}
              </span>
            </div>

            {editingId === review._id ? (
              <ReviewForm
                initial={{ rating: review.rating, text: review.text ?? '' }}
                onSubmit={(data) => handleUpdate(review, data)}
                onCancel={() => setEditingId('')}
              />
            ) : (
              <>
                <StarRating value={review.rating} />
                {review.text && <p className={styles.text}>{review.text}</p>}
              </>
            )}

            {/* редагує лише автор, видаляє автор або адмін (як на бекенді) */}
            {editingId !== review._id &&
              (isOwn(review) || user?.role === 'admin') && (
                <div className={styles.actions}>
                  {isOwn(review) && (
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => setEditingId(review._id)}
                    >
                      Редагувати
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDelete(review)}
                  >
                    Видалити
                  </button>
                </div>
              )}
          </li>
        ))}
      </ul>

      {page < totalPages && (
        <button
          type="button"
          className={styles.more}
          onClick={() => setPage((p) => p + 1)}
        >
          Показати ще
        </button>
      )}
    </section>
  );
}
