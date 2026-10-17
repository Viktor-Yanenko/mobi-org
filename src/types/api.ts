export type ProductType = 'phone' | 'accessory';

export interface Ref {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
}

export interface Category extends Ref {
  type: ProductType;
}

export interface Variant {
  sku: string;
  color?: string;
  storage?: number;
  price: number;
  oldPrice?: number;
  stock: number;
  images?: string[];
}

export interface PhoneSpecs {
  os?: string;
  screenSize?: number;
  ram?: number;
  battery?: number;
}

export interface AccessoryShort {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  minPrice: number;
  accessoryType: string;
}

export interface Product {
  _id: string;
  // для аксесуара: id сумісних телефонів
  compatibleWith?: string[];
  type: ProductType;
  name: string;
  slug: string;
  description?: string;
  brand: Ref;
  category: Ref;
  images: string[];
  variants: Variant[];
  minPrice: number;
  rating: { average: number; count: number };
  specs?: PhoneSpecs;
  accessoryType?: string;
  // бекенд додає їх лише для телефону на сторінці товару
  accessories?: AccessoryShort[];
}

export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Address {
  _id: string;
  city: string;
  novaPoshtaBranch?: string;
  street?: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  addresses: Address[];
  favorites: string[];
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// позиція кошика в тому вигляді, як її віддає бекенд (GET /cart)
export interface CartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    image: string | null;
  };
  sku: string;
  color?: string;
  storage?: number;
  price: number;
  oldPrice?: number;
  stock: number;
  quantity: number;
  subtotal: number;
  isAvailable: boolean;
}

export interface Cart {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

export type DeliveryMethod = 'nova-poshta' | 'courier' | 'pickup';
export type PaymentMethod = 'card' | 'cash-on-delivery';
export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product: string;
  sku: string;
  name: string;
  image?: string | null;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: number;
  items: OrderItem[];
  contact: { name: string; phone: string; email: string };
  delivery: {
    method: DeliveryMethod;
    city?: string;
    address?: string;
    cost: number;
  };
  payment: {
    method: PaymentMethod;
    status: 'pending' | 'paid' | 'refunded';
  };
  totalPrice: number;
  status: OrderStatus;
  comment?: string;
  createdAt: string;
}

// тіло POST /orders
export interface CreateOrderData {
  contact: Order['contact'];
  delivery: { method: DeliveryMethod; city?: string; address?: string };
  payment: { method: PaymentMethod };
  comment?: string;
}

export interface AdminOrder extends Order {
  // у списку для адміна бекенд підставляє ім'я та email покупця
  user: { _id: string; name: string; email: string } | null;
}

export interface Review {
  _id: string;
  product: string;
  // populate('user', 'name'); null, якщо користувача видалили
  user: { _id: string; name: string } | null;
  rating: number;
  text?: string;
  // покупець отримав цей товар у доставленому замовленні
  isVerifiedPurchase: boolean;
  createdAt: string;
}

// тіло POST /products/:id/reviews і PATCH /reviews/:id
export interface ReviewData {
  rating: number;
  text: string;
}

// GET /favorites віддає лише ці поля товару
export type FavoriteProduct = Pick<
  Product,
  '_id' | 'type' | 'name' | 'slug' | 'images' | 'minPrice' | 'rating'
  >;

  // GET /orders/stats (адмінка)
export interface OrderStats {
  days: number;
  orders: number;
  revenue: number;
  averageCheck: number;
  byStatus: Record<OrderStatus, number>;
  daily: { date: string; orders: number; revenue: number }[];
  topProducts: {
    _id: string;
    name: string;
    image: string | null;
    quantity: number;
    revenue: number;
  }[];
  lowStock: {
    _id: string;
    name: string;
    slug: string;
    sku: string;
    stock: number;
  }[];
}