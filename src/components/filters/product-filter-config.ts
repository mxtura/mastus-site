import { FilterConfig, BaseFilters, RangeFilter } from '@/components/ui/FilterPanel';

// Конфигурации фильтров для продуктов
export const productFilterConfigs: FilterConfig[] = [
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
    // options are injected dynamically from DB in the page
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
      { value: 'category', label: 'По категории' }
    ],
    defaultValue: 'name',
    gridColSpanClassName: 'lg:col-span-1 lg:flex-none lg:w-[200px]'
  },
  {
    key: 'priceFilter',
    label: 'Цена',
    type: 'select',
    options: [
      { value: 'ALL', label: 'Все товары' },
      { value: 'WITH_PRICE', label: 'С ценой' },
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

// Интерфейс для фильтров продуктов
export interface ProductFilters extends BaseFilters {
  categories: string[];
  priceFilter: 'ALL' | 'WITH_PRICE' | 'ON_REQUEST';
  sortBy: string;
  priceRange: RangeFilter;
}

// Начальные значения фильтров продуктов
export const initialProductFilters: ProductFilters = {
  searchText: '',
  categories: ['LADDERS', 'MANHOLES', 'SUPPORT_RINGS'],
  priceFilter: 'ALL',
  sortBy: 'name',
  priceRange: { min: '', max: '' }
};
