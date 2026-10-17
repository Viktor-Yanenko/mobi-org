import { ApiError } from './api';

// повідомлення бекенду, які показуємо українською
const MESSAGES: Record<string, string> = {
  'Email or password is wrong': 'Невірна пошта або пароль',
  'Email in use': 'Користувач з такою поштою вже існує',
  'Product variant not found': 'Цей товар більше не продається',
  'Cart is empty': 'Кошик порожній',
  'Only new orders can be cancelled': 'Скасувати можна лише нове замовлення',
  'Order not found': 'Замовлення не знайдено',
  'Product with this slug or SKU already exists':
    'Товар з таким slug або SKU вже існує',
  'Cancelled order cannot be changed': 'Скасоване замовлення змінити не можна',
  'Admin access required': 'Потрібні права адміністратора',
  'Brand not found': 'Бренд не знайдено',
  'Category not found': 'Категорію не знайдено',
  'Some compatible phones not found': 'Деякі сумісні телефони не знайдено',
  'Only JPG, PNG and WEBP images are allowed': 'Можна лише JPG, PNG і WEBP',
  'File too large': 'Файл більший за 5 МБ',
    'You have already reviewed this product':
    'Ви вже залишили відгук на цей товар',
  'Review not found': 'Відгук не знайдено',
  'Product not found': 'Товар не знайдено',
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    // 409 від замовлення: errors містить назви товарів, яких не вистачає
    if (error.message === 'Some items are out of stock') {
      return `Не вистачає на складі: ${error.errors?.join(', ')}`;
    }
    if (error.errors?.length) return error.errors.join('. ');

    // 409 від кошика: "Only 3 items in stock"
    const stock = error.message.match(/^Only (\d+) items in stock$/);
    if (stock) return `На складі лише ${stock[1]} шт.`;

    return MESSAGES[error.message] ?? error.message;
  }
  // fetch кидає TypeError, коли сервер недоступний
  if (error instanceof Error && !(error instanceof TypeError)) {
    return error.message;
  }
  return 'Не вдалося з’єднатися з сервером. Спробуйте ще раз.';
};