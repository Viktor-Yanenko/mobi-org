'use client';

import { createContext, useContext, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './ToastProvider.module.css';

interface ToastOptions {
  type?: 'success' | 'error';
  // кнопка-посилання в повідомленні, наприклад «Перейти в кошик»
  link?: { href: string; label: string };
}

interface Toast extends ToastOptions {
  id: number;
  message: string;
}

type ShowToast = (message: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

const DURATION = 3500; // скільки мілісекунд видно повідомлення
const MAX_TOASTS = 3;

// спливаючі повідомлення внизу екрана: toast('Додано в кошик')
export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const hide = (id: number) =>
    setToasts((list) => list.filter((toast) => toast.id !== id));

  const show: ShowToast = (message, options = {}) => {
    const id = nextId.current++;
    // нове повідомлення внизу; найстаріші зникають, якщо їх забагато
    setToasts((list) =>
      [...list, { id, message, ...options }].slice(-MAX_TOASTS),
    );
    setTimeout(() => hide(id), DURATION);
  };

  return (
    <ToastContext value={show}>
      {children}

      {/* aria-live: програми екранного доступу зачитають повідомлення */}
      <div className={styles.stack} aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={toast.type === 'error' ? styles.error : styles.toast}
          >
            <span>{toast.message}</span>
            {toast.link && (
              <Link
                href={toast.link.href}
                className={styles.link}
                onClick={() => hide(toast.id)}
              >
                {toast.link.label}
              </Link>
            )}
            <button
              type="button"
              className={styles.close}
              aria-label="Закрити"
              onClick={() => hide(toast.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export const useToast = () => {
  const toast = useContext(ToastContext);
  if (!toast)
    throw new Error('useToast можна викликати лише всередині ToastProvider');
  return toast;
};
