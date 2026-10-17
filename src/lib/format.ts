const priceFormat = new Intl.NumberFormat('uk-UA');

export const formatPrice = (price: number) => `${priceFormat.format(price)} ₴`;