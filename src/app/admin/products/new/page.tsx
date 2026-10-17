import type { Metadata } from 'next';
import NewProduct from './NewProduct';

export const metadata: Metadata = { title: 'Новий товар' };

export default function NewProductPage() {
  return <NewProduct />;
}
