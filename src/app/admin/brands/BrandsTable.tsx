'use client';

// функції з lib/admin передаємо в RefsTable тут, у клієнтському компоненті:
// серверна page.tsx не може передавати функції в клієнтський компонент
import RefsTable from '../RefsTable';
import {
  createBrand,
  deleteBrand,
  getBrandsWithCounts,
  updateBrand,
} from '@/lib/admin';

export default function BrandsTable() {
  return (
    <RefsTable
      title="Бренди"
      load={getBrandsWithCounts}
      create={createBrand}
      update={updateBrand}
      remove={deleteBrand}
    />
  );
}
