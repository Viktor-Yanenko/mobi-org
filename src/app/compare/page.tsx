import type { Metadata } from 'next';
import CompareTable from './CompareTable';

export const metadata: Metadata = { title: 'Порівняння телефонів' };

export default function ComparePage() {
  return (
    <div className="container">
      <CompareTable />
    </div>
  );
}
