import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header/Header';
import './globals.css';

// cyrillic потрібен для української
const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: { default: 'MobiOrg', template: '%s | MobiOrg' },
  description: 'Інтернет-магазин мобільних телефонів та аксесуарів',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="uk" className={inter.className}>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
