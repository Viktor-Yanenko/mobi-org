'use client';

// показується, якщо бекенд не відповів (наприклад, Render ще прокидається)
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div
      className="container"
      style={{ padding: '64px 16px', textAlign: 'center' }}
    >
      <h1>Не вдалося завантажити дані</h1>
      <p style={{ margin: '12px 0 24px' }}>
        Сервер може прокидатися до хвилини. Спробуйте ще раз.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{ padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}
      >
        Спробувати ще раз
      </button>
    </div>
  );
}
