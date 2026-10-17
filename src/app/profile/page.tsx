import type { Metadata } from 'next';
import ProfileView from './ProfileView';

export const metadata: Metadata = { title: 'Мій профіль' };

export default function ProfilePage() {
  return (
    <div className="container">
      <ProfileView />
    </div>
  );
}
