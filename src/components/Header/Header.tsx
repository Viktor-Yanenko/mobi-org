import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.logo}>
          MobiOrg
        </Link>

        <nav className={styles.nav}>
          <Link href="/catalog?type=phone">Смартфони</Link>
          <Link href="/catalog?type=accessory">Аксесуари</Link>
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
      </div>
    </header>
  );
}
