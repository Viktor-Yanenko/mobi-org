import type { Metadata } from 'next';
import ProductsTable from './ProductsTable';

export const metadata: Metadata = { title: 'Товари' };

export default function AdminProductsPage() {
  return <ProductsTable />;
}
