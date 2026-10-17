import type { Metadata } from 'next';
import EditProduct from './EditProduct';

export const metadata: Metadata = { title: 'Редагування товару' };

export default async function EditProductPage({
  params,
}: PageProps<'/admin/products/[slug]'>) {
  const { slug } = await params;
  return <EditProduct slug={slug} />;
}
