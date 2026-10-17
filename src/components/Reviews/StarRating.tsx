import styles from './Reviews.module.css';

interface Props {
  value: number;
  // без onChange зірки лише показують оцінку
  onChange?: (value: number) => void;
}

export default function StarRating({ value, onChange }: Props) {
  if (!onChange) {
    return (
      <span className={styles.stars} aria-label={`Оцінка ${value} з 5`}>
        {'★'.repeat(value)}
        <span className={styles.starsEmpty}>{'★'.repeat(5 - value)}</span>
      </span>
    );
  }

  return (
    <div className={styles.starInput} role="radiogroup" aria-label="Оцінка">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} з 5`}
          className={star <= value ? styles.starOn : styles.starOff}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
