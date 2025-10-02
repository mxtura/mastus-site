import { ProductFilters } from './product-filter-config';
import { MessageFilters, MESSAGE_STATUS_OPTIONS, MESSAGE_SUBJECT_OPTIONS } from './message-filter-config';
import { AdminProductFilters } from './admin-product-filter-config';

// Типы для продуктов и сообщений
export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: number | null;
  category: string;
  categoryNameRu?: string;
  images: string[];
  attributes?: Record<string, unknown>;
  attributeLabels?: Record<string, string>;
  advantages: string[];
  applications: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: 'NEW' | 'PROCESSING' | 'COMPLETED' | 'ARCHIVED';
  createdAt: string;
}

// Универсальная функция для применения фильтров к продуктам
export function applyProductFilters(products: Product[], filters: ProductFilters): Product[] {
  let filtered = [...products];
  const hasPricedProducts = products.some(product => product.price !== null && product.price > 0);

  // Фильтр по тексту
  if (filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
  (product.description && product.description.toLowerCase().includes(searchLower)) ||
  (product.sku && product.sku.toLowerCase().includes(searchLower))
    );
  }

  // Фильтр по категориям
  if (filters.categories.length > 0) {
    filtered = filtered.filter(product => filters.categories.includes(product.category));
  }

  // Фильтр по цене (наличие)
  if (filters.priceFilter === 'WITH_PRICE') {
    filtered = filtered.filter(product => product.price !== null && product.price > 0);
  } else if (filters.priceFilter === 'ON_REQUEST') {
    filtered = filtered.filter(product => !product.price || product.price <= 0);
  }

  // Фильтр по цене
  const shouldApplyPriceRange = filters.priceFilter !== 'ON_REQUEST' && hasPricedProducts;
  if (shouldApplyPriceRange && (filters.priceRange.min || filters.priceRange.max)) {
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
    filtered = filtered.filter(product => {
      if (product.price === null) return false;
      return product.price >= minPrice && product.price <= maxPrice;
    });
  }

  // Сортировка
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'ru');
      case 'price':
        return (a.price || 0) - (b.price || 0);
      case 'price-desc':
        return (b.price || 0) - (a.price || 0);
      case 'category':
        return (a.categoryNameRu || a.category).localeCompare(b.categoryNameRu || b.category, 'ru');
      default:
        return 0;
    }
  });

  return filtered;
}

// Функция фильтрации сообщений
export function applyMessageFilters(messages: ContactMessage[], filters: MessageFilters): ContactMessage[] {
  let filtered = [...messages];

  // Фильтр по статусу
  const totalStatusCount = MESSAGE_STATUS_OPTIONS.length;
  if (Array.isArray(filters.status) && filters.status.length > 0 && filters.status.length !== totalStatusCount) {
    filtered = filtered.filter(msg => filters.status.includes(msg.status));
  }

  // Фильтр по теме
  const totalSubjectCount = MESSAGE_SUBJECT_OPTIONS.length;
  if (Array.isArray(filters.subject) && filters.subject.length > 0 && filters.subject.length !== totalSubjectCount) {
    filtered = filtered.filter(msg => msg.subject && filters.subject.includes(msg.subject));
  }

  // Фильтр по наличию компании
  if (filters.hasCompany === 'YES') {
    filtered = filtered.filter(msg => msg.company && msg.company.trim() !== '');
  } else if (filters.hasCompany === 'NO') {
    filtered = filtered.filter(msg => !msg.company || msg.company.trim() === '');
  }

  // Фильтр по наличию телефона
  if (filters.hasPhone === 'YES') {
    filtered = filtered.filter(msg => msg.phone && msg.phone.trim() !== '');
  } else if (filters.hasPhone === 'NO') {
    filtered = filtered.filter(msg => !msg.phone || msg.phone.trim() === '');
  }

  // Фильтр по дате
  const hasDateFrom = Boolean(filters.dateRange?.min);
  const hasDateTo = Boolean(filters.dateRange?.max);
  if (hasDateFrom || hasDateTo) {
    const fromDate = hasDateFrom ? new Date(`${filters.dateRange.min}T00:00:00`) : null;
    const toDate = hasDateTo ? new Date(`${filters.dateRange.max}T23:59:59.999`) : null;

    filtered = filtered.filter(msg => {
      const createdAt = new Date(msg.createdAt);
      if (fromDate && createdAt < fromDate) return false;
      if (toDate && createdAt > toDate) return false;
      return true;
    });
  }

  // Текстовый поиск
  if (filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(msg =>
      msg.name.toLowerCase().includes(searchLower) ||
      msg.email.toLowerCase().includes(searchLower) ||
      msg.message.toLowerCase().includes(searchLower) ||
      (msg.company && msg.company.toLowerCase().includes(searchLower)) ||
      (msg.phone && msg.phone.includes(searchLower))
    );
  }

  return filtered;
}

// Функция фильтрации продуктов для админской страницы
export function applyAdminProductFilters(products: Product[], filters: AdminProductFilters): Product[] {
  let filtered = [...products];
  const hasPricedProducts = products.some(product => product.price !== null && product.price > 0);

  // Фильтр по тексту
  if (filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
  (product.description && product.description.toLowerCase().includes(searchLower)) ||
  (product.sku && product.sku.toLowerCase().includes(searchLower))
    );
  }

  // Фильтр по категориям
  if (filters.categories.length > 0) {
    filtered = filtered.filter(product => filters.categories.includes(product.category));
  }

  // Фильтр по статусу
  if (filters.status !== 'ALL') {
    filtered = filtered.filter(product => 
      filters.status === 'ACTIVE' ? product.isActive : !product.isActive
    );
  }

  // Фильтр по наличию цены
  if (filters.priceFilter !== 'ALL') {
    filtered = filtered.filter(product => {
      const hasPrice = product.price !== null && product.price > 0;
      return filters.priceFilter === 'WITH_PRICE' ? hasPrice : !hasPrice;
    });
  }

  // Фильтр по диапазону цен (только для товаров с указанной ценой)
  const shouldApplyPriceRange = filters.priceFilter !== 'ON_REQUEST' && hasPricedProducts;
  if (shouldApplyPriceRange && (filters.priceRange.min || filters.priceRange.max)) {
    const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
    const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
    filtered = filtered.filter(product => {
      if (product.price === null) return false;
      return product.price >= minPrice && product.price <= maxPrice;
    });
  }

  // Сортировка
  filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name, 'ru');
      case 'price':
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
      case 'price-desc':
        const priceDescA = a.price || 0;
        const priceDescB = b.price || 0;
        return priceDescB - priceDescA;
      case 'category':
        return (a.categoryNameRu || a.category).localeCompare(b.categoryNameRu || b.category, 'ru');
      case 'created':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'created-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return filtered;
}
