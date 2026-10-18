'use client';

import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider/ToastProvider';
import { slugify, type RefPayload } from '@/lib/admin';
import { getErrorMessage } from '@/lib/errors';
import type { Ref, WithCount } from '@/types/api';
import styles from './admin.module.css';
import refs from './RefsTable.module.css';

// у категорії є ще type, у бренду немає
type Item = WithCount<Ref & { type?: string }>;

interface Props {
  title: string;
  load: () => Promise<Item[]>;
  create: (payload: RefPayload) => Promise<unknown>;
  update: (id: string, payload: RefPayload) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  // для категорій: вибір «телефони / аксесуари» при створенні
  withType?: boolean;
}

const TYPE_LABELS: Record<string, string> = {
  phone: 'Телефони',
  accessory: 'Аксесуари',
};

// одна таблиця для брендів і категорій: додати, перейменувати, видалити
export default function RefsTable({
  title,
  load,
  create,
  update,
  remove,
  withType,
}: Props) {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  // збільшуємо після кожної зміни, щоб список перезавантажився
  const [version, setVersion] = useState(0);

  useEffect(() => {
    load()
      .then(setItems)
      .catch((err) => setError(getErrorMessage(err)));
  }, [load, version]);

  // спільна обробка: помилка під заголовком, успіх — сповіщенням
  const run = async (action: () => Promise<unknown>, success: string) => {
    setError('');
    try {
      await action();
      toast(success);
      setEditingId(null);
      setVersion((v) => v + 1);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get('name')).trim();
    const slug = String(form.get('slug')).trim() || slugify(name);

    const ok = await run(
      () =>
        create({
          name,
          slug,
          ...(withType && { type: String(form.get('type')) }),
        }),
      `«${name}» додано`,
    );
    if (ok) formElement.reset();
  };

  const handleUpdate = (
    event: React.FormEvent<HTMLFormElement>,
    item: Item,
  ) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    run(
      () =>
        update(item._id, {
          name: String(form.get('name')).trim(),
          slug: String(form.get('slug')).trim(),
        }),
      'Збережено',
    );
  };

  const handleDelete = (item: Item) => {
    if (!confirm(`Видалити «${item.name}»?`)) return;
    run(() => remove(item._id), `«${item.name}» видалено`);
  };

  return (
    <>
      <div className={styles.toolbar}>
        <h1>{title}</h1>
      </div>

      <form className={refs.addForm} onSubmit={handleCreate}>
        <input
          name="name"
          required
          minLength={2}
          placeholder="Назва, наприклад Motorola"
          className={styles.input}
        />
        <input
          name="slug"
          placeholder="slug (можна не заповнювати)"
          className={styles.input}
        />
        {withType && (
          <select name="type" className={styles.input}>
            <option value="accessory">Аксесуари</option>
            <option value="phone">Телефони</option>
          </select>
        )}
        <button type="submit" className={styles.primary}>
          + Додати
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {!items ? (
        <p className={styles.muted}>Завантаження…</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Назва</th>
                <th>slug</th>
                {withType && <th>Тип</th>}
                <th>Товарів</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((item) =>
                item._id === editingId ? (
                  <tr key={item._id}>
                    <td colSpan={withType ? 5 : 4}>
                      {/* форма в одній клітинці: <form> не можна класти в <tr> */}
                      <form
                        className={refs.editForm}
                        onSubmit={(e) => handleUpdate(e, item)}
                      >
                        <input
                          name="name"
                          required
                          minLength={2}
                          defaultValue={item.name}
                          className={styles.input}
                          aria-label="Назва"
                        />
                        <input
                          name="slug"
                          required
                          defaultValue={item.slug}
                          className={styles.input}
                          aria-label="slug"
                        />
                        <button type="submit" className={styles.primary}>
                          Зберегти
                        </button>
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => setEditingId(null)}
                        >
                          Скасувати
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td className={styles.muted}>{item.slug}</td>
                    {withType && <td>{TYPE_LABELS[item.type ?? '']}</td>}
                    <td>{item.productsCount}</td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={styles.button}
                          onClick={() => setEditingId(item._id)}
                        >
                          Змінити
                        </button>
                        <button
                          type="button"
                          className={styles.danger}
                          disabled={item.productsCount > 0}
                          // підказка, чому кнопка неактивна
                          title={
                            item.productsCount > 0
                              ? 'Спершу перенесіть товари в інший розділ'
                              : undefined
                          }
                          onClick={() => handleDelete(item)}
                        >
                          Видалити
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
