import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="container"
      style={{ padding: '64px 16px', textAlign: 'center' }}
    >
      <h1>Сторінку не знайдено</h1>
      <p style={{ margin: '12px 0 24px' }}>
        Можливо, товар уже прибрали з продажу.
      </p>
      <Link href="/catalog" style={{ color: 'var(--accent)' }}>
        Перейти в каталог
      </Link>
    </div>
  );
}
