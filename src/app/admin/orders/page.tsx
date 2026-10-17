import type { Metadata } from 'next';
import OrdersTable from './OrdersTable';

export const metadata: Metadata = { title: 'Замовлення' };

export default function AdminOrdersPage() {
  return <OrdersTable />;
}
