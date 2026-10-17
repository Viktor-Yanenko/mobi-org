import { ApiError } from './api';

// повідомлення бекенду, які показуємо українською
const MESSAGES: Record<string, string> = {
  'Email or password is wrong': 'Невірна пошта або пароль',
  'Email in use': 'Користувач з такою поштою вже існує',
  'Product variant not found': 'Цей товар більше не продається',
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
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