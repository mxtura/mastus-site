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
  defaultValue: []
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
    defaultValue: 'name'
  },
  {
    key: 'priceRange',
    label: 'Цена (₽)',
    type: 'range',
    defaultValue: { min: '', max: '' }
  }
];

// Интерфейс для фильтров продуктов
export interface ProductFilters extends BaseFilters {
  categories: string[];
  sortBy: string;
  priceRange: RangeFilter;
}

// Начальные значения фильтров продуктов
export const initialProductFilters: ProductFilters = {
  searchText: '',
  categories: ['LADDERS', 'MANHOLES', 'SUPPORT_RINGS'],
  sortBy: 'name',
  priceRange: { min: '', max: '' }
};
