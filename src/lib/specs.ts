import type { PhoneSpecs } from '@/types/api';

// усі характеристики телефону в одному місці: з цього списку будуються
// таблиця на сторінці товару, порівняння і підписи у формі адмінки
export interface SpecField {
  key: keyof PhoneSpecs;
  label: string;
  unit?: string;
  // тип поля у формі адмінки (за замовчуванням текст)
  type?: 'number' | 'boolean';
  example?: string; // підказка в полі форми
  formUnit?: string; // одиниця в підписі поля, якщо відрізняється від unit
  // яке значення краще при порівнянні (підсвічується зеленим)
  best?: 'max' | 'min';
}

export const SPEC_GROUPS: { title: string; fields: SpecField[] }[] = [
  {
    title: 'Загальне',
    fields: [
      { key: 'os', label: 'Операційна система', example: 'iOS 18' },
      { key: 'processor', label: 'Процесор', example: 'Apple A18' },
      {
        key: 'ram',
        label: "Оперативна пам'ять",
        unit: ' ГБ',
        type: 'number',
        best: 'max',
      },
    ],
  },
  {
    title: 'Екран',
    fields: [
      {
        key: 'screenSize',
        label: 'Діагональ',
        unit: '″',
        formUnit: 'дюймів',
        type: 'number',
        example: '6.1',
      },
      { key: 'screenType', label: 'Тип матриці', example: 'OLED' },
      {
        key: 'refreshRate',
        label: 'Частота оновлення',
        unit: ' Гц',
        type: 'number',
        best: 'max',
      },
    ],
  },
  {
    title: 'Камери',
    fields: [
      {
        key: 'mainCamera',
        label: 'Основна камера',
        unit: ' Мп',
        type: 'number',
        best: 'max',
      },
      {
        key: 'frontCamera',
        label: 'Фронтальна камера',
        unit: ' Мп',
        type: 'number',
      },
    ],
  },
  {
    title: 'Живлення і зв’язок',
    fields: [
      {
        key: 'battery',
        label: 'Акумулятор',
        unit: ' мА·год',
        type: 'number',
        best: 'max',
      },
      { key: 'has5g', label: '5G', type: 'boolean' },
      { key: 'hasNfc', label: 'NFC', type: 'boolean' },
    ],
  },
  {
    title: 'Корпус',
    fields: [
      { key: 'weight', label: 'Вага', unit: ' г', type: 'number', best: 'min' },
      {
        key: 'waterResistance',
        label: 'Захист від води',
        example: 'IP68',
      },
    ],
  },
];

export const SPEC_FIELDS = SPEC_GROUPS.flatMap((group) => group.fields);

// true/false показуємо словами, до чисел додаємо одиницю виміру
export const formatSpec = (
  field: SpecField,
  value: PhoneSpecs[keyof PhoneSpecs],
) => {
  if (typeof value === 'boolean') return value ? 'Так' : 'Ні';
  return `${value}${field.unit ?? ''}`;
};