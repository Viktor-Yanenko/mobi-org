import type { Metadata } from 'next';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = { title: 'Оформлення замовлення' };

export default function CheckoutPage() {
  return (
    <div className="container">
      <h1 style={{ margin: '24px 0' }}>Оформлення замовлення</h1>
      <CheckoutForm />
    </div>
  );
}
