import type { Metadata } from 'next';
import BrandsTable from './BrandsTable';

export const metadata: Metadata = { title: 'Бренди' };

export default function AdminBrandsPage() {
  return <BrandsTable />;
}
