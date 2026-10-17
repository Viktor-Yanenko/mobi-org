import type { Metadata } from 'next';
import { safeRedirect } from '@/lib/redirect';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Вхід' };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { next } = await searchParams;
  return <LoginForm next={safeRedirect(next)} />;
}
