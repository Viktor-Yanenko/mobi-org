import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import CartProvider from '@/components/CartProvider/CartProvider';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import ToastProvider from '@/components/ToastProvider/ToastProvider';
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
        {/* повідомлення потрібні всім, тому ToastProvider найзовнішній */}
        <ToastProvider>
          <AuthProvider>
            {/* кошику потрібен користувач, тому він усередині AuthProvider */}
            <CartProvider>
              <Header />
              <main>{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
