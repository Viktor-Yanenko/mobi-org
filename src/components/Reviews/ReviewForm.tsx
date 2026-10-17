'use client';

import { useState } from 'react';
import { getErrorMessage } from '@/lib/errors';
import type { ReviewData } from '@/types/api';
import StarRating from './StarRating';
import styles from './Reviews.module.css';

interface Props {
  // є initial: редагування свого відгуку
  initial?: ReviewData;
  onSubmit: (data: ReviewData) => Promise<void>;
  onCancel?: () => void;
}

export default function ReviewForm({ initial, onSubmit, onCancel }: Props) {
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [text, setText] = useState(initial?.text ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!rating) {
      setError('Виберіть оцінку від 1 до 5 зірок');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSubmit({ rating, text: text.trim() });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="Що сподобалось, а що ні?"
        className={styles.textarea}
      />
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.formActions}>
        <button type="submit" className={styles.submit} disabled={isSaving}>
          {isSaving ? 'Зберігаємо…' : initial ? 'Зберегти' : 'Надіслати відгук'}
        </button>
        {onCancel && (
          <button
            type="button"
            className={styles.linkButton}
            onClick={onCancel}
          >
            Скасувати
          </button>
        )}
      </div>
    </form>
  );
}
