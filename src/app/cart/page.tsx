import type { Metadata } from 'next';
import CartView from './CartView';

export const metadata: Metadata = { title: 'Кошик' };

export default function CartPage() {
  return (
    <div className="container">
      <h1 style={{ margin: '24px 0' }}>Кошик</h1>
      <CartView />
    </div>
  );
}
