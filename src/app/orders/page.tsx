import type { Metadata } from 'next';
import OrdersList from './OrdersList';

export const metadata: Metadata = { title: 'Мої замовлення' };

export default function OrdersPage() {
  return (
    <div className="container">
      <h1 style={{ margin: '24px 0' }}>Мої замовлення</h1>
      <OrdersList />
    </div>
  );
}
