import { FilterConfig, BaseFilters, RangeFilter } from '@/components/ui/FilterPanel';

export const MESSAGE_STATUS_OPTIONS = [
  { value: 'NEW', label: 'Новые' },
  { value: 'PROCESSING', label: 'В обработке' },
  { value: 'COMPLETED', label: 'Обработанные' },
  { value: 'ARCHIVED', label: 'Архив' }
];

export const MESSAGE_SUBJECT_OPTIONS = [
  { value: 'PRICE', label: 'Запрос цены' },
  { value: 'ORDER', label: 'Размещение заказа' },
  { value: 'DELIVERY', label: 'Доставка' },
  { value: 'TECHNICAL', label: 'Техническая консультация' },
  { value: 'OTHER', label: 'Другое' }
];

// Конфигурации фильтров для сообщений
export const messageFilterConfigs: FilterConfig[] = [
  {
    key: 'searchText',
    label: 'Поиск',
    type: 'search',
    placeholder: 'Поиск по имени, email, сообщению...',
    defaultValue: ''
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'multiselect',
    options: MESSAGE_STATUS_OPTIONS,
    defaultValue: MESSAGE_STATUS_OPTIONS.map(option => option.value),
    allowSelectAll: true
  },
  {
    key: 'subject',
    label: 'Тема',
    type: 'multiselect',
    options: MESSAGE_SUBJECT_OPTIONS,
    defaultValue: MESSAGE_SUBJECT_OPTIONS.map(option => option.value),
    allowSelectAll: true
  },
  {
    key: 'dateRange',
    label: 'Период',
    type: 'range',
    inputType: 'date',
    defaultValue: { min: '', max: '' },
    section: 'side',
    gridColSpanClassName: 'lg:col-span-2'
  },
  {
    key: 'hasCompany',
    label: 'Компания',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все' },
      { value: 'YES', label: 'Есть компания' },
      { value: 'NO', label: 'Нет компании' }
    ],
    defaultValue: 'ALL',
    section: 'side'
  },
  {
    key: 'hasPhone',
    label: 'Телефон',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все' },
      { value: 'YES', label: 'Есть телефон' },
      { value: 'NO', label: 'Нет телефона' }
    ],
    defaultValue: 'ALL',
    section: 'side'
  }
];

// Интерфейс для фильтров сообщений
export interface MessageFilters extends BaseFilters {
  status: string[];
  subject: string[];
  dateRange: RangeFilter;
  hasCompany: 'ALL' | 'YES' | 'NO';
  hasPhone: 'ALL' | 'YES' | 'NO';
}

// Начальные значения фильтров сообщений
export const initialMessageFilters: MessageFilters = {
  searchText: '',
  status: ['NEW', 'PROCESSING', 'COMPLETED'],
  subject: MESSAGE_SUBJECT_OPTIONS.map(option => option.value),
  dateRange: { min: '', max: '' },
  hasCompany: 'ALL',
  hasPhone: 'ALL'
};
