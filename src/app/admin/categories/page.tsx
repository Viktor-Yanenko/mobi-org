import type { Metadata } from 'next';
import CategoriesTable from './CategoriesTable';

export const metadata: Metadata = { title: 'Категорії' };

export default function AdminCategoriesPage() {
  return <CategoriesTable />;
}
