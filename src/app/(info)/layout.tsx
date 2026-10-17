import styles from './info.module.css';

// (info) у дужках — «група маршрутів»: в адресі її немає (/delivery, /contacts),
// вона лише дає цим сторінкам спільний макет і стилі
export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container">
      <article className={styles.page}>{children}</article>
    </div>
  );
}
