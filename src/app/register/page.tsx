import type { Metadata } from 'next';
import { safeRedirect } from '@/lib/redirect';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Реєстрація' };

export default async function RegisterPage({
  searchParams,
}: PageProps<'/register'>) {
  const { next } = await searchParams;
  return <RegisterForm next={safeRedirect(next)} />;
}
