import { apiFetch } from './client-api';
import type {
  CreateOrderData,
  DeliveryMethod,
  Order,
  OrderStatus,
  PaymentMethod,
} from '@/types/api';

// ті самі значення, що в constants бекенду (DELIVERY_COST, FREE_DELIVERY_FROM)
export const DELIVERY_OPTIONS: Record<
  DeliveryMethod,
  { label: string; cost: number; addressLabel?: string }
> = {
  'nova-poshta': {
    label: 'Нова пошта',
    cost: 80,
    addressLabel: 'Номер відділення або поштомату',
  },
  courier: {
    label: "Кур'єр",
    cost: 150,
    addressLabel: 'Вулиця, будинок, квартира',
  },
  pickup: { label: 'Самовивіз з магазину', cost: 0 },
};

export const FREE_DELIVERY_FROM = 5000;

export const deliveryCost = (method: DeliveryMethod, itemsTotal: number) =>
  itemsTotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_OPTIONS[method].cost;

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: 'Карткою',
  'cash-on-delivery': 'При отриманні',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Нове',
  confirmed: 'Підтверджене',
  shipped: 'Відправлене',
  delivered: 'Доставлене',
  cancelled: 'Скасоване',
};

export const createOrder = (data: CreateOrderData) =>
  apiFetch<Order>('/orders', { method: 'POST', body: JSON.stringify(data) });

export const getMyOrders = () => apiFetch<Order[]>('/orders');

export const getOrder = (orderId: string) =>
  apiFetch<Order>(`/orders/${encodeURIComponent(orderId)}`);

export const cancelOrder = (orderId: string) =>
  apiFetch<Order>(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
  });

const dateFormat = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatDate = (iso: string) => dateFormat.format(new Date(iso));