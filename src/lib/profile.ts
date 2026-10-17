import { apiFetch } from './client-api';
import type { Address, User } from '@/types/api';

export interface ProfileData {
  name: string;
  phone: string;
}

export interface AddressData {
  city: string;
  novaPoshtaBranch?: string;
  street?: string;
  isDefault?: boolean;
}

export const updateProfile = (data: ProfileData) =>
  apiFetch<User>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// бекенд відповідає 204 без тіла
export const changePassword = (currentPassword: string, newPassword: string) =>
  apiFetch<null>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

// запити з адресами повертають оновлений список адрес
export const addAddress = (data: AddressData) =>
  apiFetch<Address[]>('/users/me/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const setDefaultAddress = (addressId: string) =>
  apiFetch<Address[]>(`/users/me/addresses/${addressId}`, {
    method: 'PATCH',
    body: JSON.stringify({ isDefault: true }),
  });

export const deleteAddress = (addressId: string) =>
  apiFetch<Address[]>(`/users/me/addresses/${addressId}`, {
    method: 'DELETE',
  });

export const MAX_ADDRESSES = 5;

// «Київ, Нова пошта №12» або «Львів, вул. Шевченка, 5»
export const formatAddress = (address: Address) =>
  [
    address.city,
    address.novaPoshtaBranch && `Нова пошта: ${address.novaPoshtaBranch}`,
    address.street,
  ]
    .filter(Boolean)
    .join(', ');