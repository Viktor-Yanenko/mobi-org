'use client';

// функції з lib/admin передаємо в RefsTable тут, у клієнтському компоненті:
// серверна page.tsx не може передавати функції в клієнтський компонент
import RefsTable from '../RefsTable';
import {
  createCategory,
  deleteCategory,
  getCategoriesWithCounts,
  updateCategory,
} from '@/lib/admin';

export default function CategoriesTable() {
  return (
    <RefsTable
      title="Категорії"
      load={getCategoriesWithCounts}
      create={createCategory}
      update={updateCategory}
      remove={deleteCategory}
      withType
    />
  );
}
