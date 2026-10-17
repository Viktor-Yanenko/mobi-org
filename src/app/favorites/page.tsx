import type { Metadata } from 'next';
import FavoritesList from './FavoritesList';

export const metadata: Metadata = { title: 'Обране' };

export default function FavoritesPage() {
  return (
    <div className="container">
      <h1 style={{ margin: '24px 0' }}>Обране</h1>
      <FavoritesList />
    </div>
  );
}
