import { FilterConfig, BaseFilters } from '@/components/ui/FilterPanel';

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
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все статусы' },
      { value: 'NEW', label: 'Новые' },
      { value: 'PROCESSING', label: 'В обработке' },
      { value: 'COMPLETED', label: 'Обработанные' },
      { value: 'ARCHIVED', label: 'Архив' }
    ],
    defaultValue: 'ALL'
  },
  {
    key: 'subject',
    label: 'Тема',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все темы' },
      { value: 'PRICE', label: 'Запрос цены' },
      { value: 'ORDER', label: 'Размещение заказа' },
      { value: 'DELIVERY', label: 'Доставка' },
      { value: 'TECHNICAL', label: 'Техническая консультация' },
      { value: 'OTHER', label: 'Другое' }
    ],
    defaultValue: 'ALL'
  },
  {
    key: 'dateRange',
    label: 'Период',
    type: 'select',
    options: [
      { value: 'ALL', label: 'За все время' },
      { value: 'TODAY', label: 'Сегодня' },
      { value: 'WEEK', label: 'За неделю' },
      { value: 'MONTH', label: 'За месяц' }
    ],
    defaultValue: 'ALL'
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
    defaultValue: 'ALL'
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
    defaultValue: 'ALL'
  }
];

// Интерфейс для фильтров сообщений
export interface MessageFilters extends BaseFilters {
  status: 'ALL' | 'NEW' | 'PROCESSING' | 'COMPLETED' | 'ARCHIVED';
  subject: 'ALL' | 'PRICE' | 'ORDER' | 'DELIVERY' | 'TECHNICAL' | 'OTHER';
  dateRange: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';
  hasCompany: 'ALL' | 'YES' | 'NO';
  hasPhone: 'ALL' | 'YES' | 'NO';
}

// Начальные значения фильтров сообщений
export const initialMessageFilters: MessageFilters = {
  searchText: '',
  status: 'ALL',
  subject: 'ALL',
  dateRange: 'ALL',
  hasCompany: 'ALL',
  hasPhone: 'ALL'
};
