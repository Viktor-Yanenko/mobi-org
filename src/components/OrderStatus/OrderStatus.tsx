import { STATUS_LABELS } from '@/lib/orders';
import type { OrderStatus as Status } from '@/types/api';
import styles from './OrderStatus.module.css';

export default function OrderStatus({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
