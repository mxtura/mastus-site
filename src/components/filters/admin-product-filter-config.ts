import { FilterConfig, BaseFilters, RangeFilter } from '@/components/ui/FilterPanel';

// Конфигурации фильтров для админской страницы продуктов
export const adminProductFilterConfigs: FilterConfig[] = [
  {
    key: 'searchText',
    label: 'Поиск',
    type: 'search',
    placeholder: 'Поиск по названию, артикулу, описанию...',
    defaultValue: ''
  },
  {
    key: 'categories',
    label: 'Категории',
    type: 'multiselect',
    // options are provided dynamically from DB in the page component
    options: [],
    defaultValue: [],
    allowSelectAll: true,
    gridColSpanClassName: 'lg:col-span-1 lg:flex-none lg:w-[260px]'
  },
  {
    key: 'sortBy',
    label: 'Сортировка',
    type: 'select',
    options: [
      { value: 'name', label: 'По названию' },
      { value: 'price', label: 'По цене (возр.)' },
      { value: 'price-desc', label: 'По цене (убыв.)' },
      { value: 'category', label: 'По категории' },
      { value: 'created', label: 'По дате создания' },
      { value: 'created-desc', label: 'Сначала новые' }
    ],
    defaultValue: 'created-desc',
    gridColSpanClassName: 'lg:col-span-1 lg:flex-none lg:w-[200px]'
  },
  {
    key: 'status',
    label: 'Статус',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все статусы' },
      { value: 'ACTIVE', label: 'Активные' },
      { value: 'INACTIVE', label: 'Скрытые' }
    ],
    defaultValue: 'ALL',
    gridColSpanClassName: 'lg:col-span-1 lg:flex-none lg:w-[200px]'
  },
  {
    key: 'priceFilter',
    label: 'Цена',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все товары' },
      { value: 'WITH_PRICE', label: 'С указанной ценой' },
      { value: 'ON_REQUEST', label: 'По запросу' }
    ],
    defaultValue: 'ALL',
    gridColSpanClassName: 'lg:col-span-1 lg:flex-none lg:w-[220px]'
  },
  {
    key: 'priceRange',
    label: 'Диапазон цен (₽)',
    type: 'range',
    defaultValue: { min: '', max: '' },
    inlineWith: 'priceFilter'
  }
];

// Интерфейс для админских фильтров продуктов
export interface AdminProductFilters extends BaseFilters {
  categories: string[];
  status: 'ALL' | 'ACTIVE' | 'INACTIVE';
  priceFilter: 'ALL' | 'WITH_PRICE' | 'ON_REQUEST';
  priceRange: RangeFilter;
  sortBy: string;
}

// Начальные значения фильтров для админки
export const initialAdminProductFilters: AdminProductFilters = {
  searchText: '',
  categories: ['LADDERS', 'MANHOLES', 'SUPPORT_RINGS'],
  status: 'ALL',
  priceFilter: 'ALL',
  priceRange: { min: '', max: '' },
  sortBy: 'created-desc'
};
