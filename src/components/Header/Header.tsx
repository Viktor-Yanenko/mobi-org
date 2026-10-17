import Image from 'next/image';
import Link from 'next/link';
import CartLink from '@/components/CartLink/CartLink';
import UserMenu from '@/components/UserMenu/UserMenu';
import styles from './Header.module.css';
import MobileMenu from '@/components/MobileMenu/MobileMenu';
import CompareLink from '@/components/CompareLink/CompareLink';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          {/* та сама картинка, що й favicon */}
          <Image src="/icon.svg" alt="" width={28} height={28} />
          <p>
            Mobi<span>Org</span>
          </p>
        </Link>

        <nav className={styles.nav}>
          <Link href="/catalog?type=phone">Смартфони</Link>
          <Link href="/catalog?type=accessory">Аксесуари</Link>
          <CompareLink />
        </nav>

        {/* звичайна GET-форма: відкриває /catalog?search=... без жодного JS */}
        <form action="/catalog" className={styles.search}>
          <input
            type="search"
            name="search"
            placeholder="Пошук товарів"
            aria-label="Пошук товарів"
          />
        </form>

        <CartLink />
        <UserMenu />
        <MobileMenu />
      </div>
    </header>
  );
}
