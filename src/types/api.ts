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