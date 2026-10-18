import type { Variant } from '@/types/api';

const priceFormat = new Intl.NumberFormat('uk-UA');

export const formatPrice = (price: number) => `${priceFormat.format(price)} ₴`;

// пам'ять варіанту: «8/256 ГБ», або «256 ГБ», якщо RAM не вказана
export const formatMemory = ({
  ram,
  storage,
}: Pick<Variant, 'ram' | 'storage'>) => {
  if (ram && storage) return `${ram}/${storage} ГБ`;
  if (storage) return `${storage} ГБ`;
  if (ram) return `${ram} ГБ RAM`;
  return '';
};

// підпис варіанту на сторінці товару і в кошику: «Black · 8/256 ГБ»
export const variantLabel = (v: Pick<Variant, 'color' | 'ram' | 'storage'>) =>
  [v.color, formatMemory(v)].filter(Boolean).join(' · ');