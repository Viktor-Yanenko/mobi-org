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