import type { Metadata } from 'next';
import OrderDetails from './OrderDetails';

export const metadata: Metadata = { title: 'Замовлення' };

export default async function OrderPage({
  params,
  searchParams,
}: PageProps<'/orders/[orderId]'>) {
  const { orderId } = await params;
  const { created } = await searchParams;

  return (
    <div className="container">
      <OrderDetails orderId={orderId} isNew={created === '1'} />
    </div>
  );
}
