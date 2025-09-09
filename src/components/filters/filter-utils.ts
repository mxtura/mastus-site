import { ProductFilters } from './product-filter-config';
import { MessageFilters } from './message-filter-config';
import { AdminProductFilters } from './admin-product-filter-config';

// Типы для продуктов и сообщений
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  category: string;
  categoryNameRu?: string;
  images: string[];
  attributes?: Record<string, unknown>;
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

  // Фильтр по тексту
  if (filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    );
  }

  // Фильтр по категориям
  if (filters.categories.length > 0) {
    filtered = filtered.filter(product => filters.categories.includes(product.category));
  }

  // Фильтр по цене
  const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
  const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
  if (filters.priceRange.min || filters.priceRange.max) {
    filtered = filtered.filter(product => {
      const productPrice = product.price || 0;
      return productPrice >= minPrice && productPrice <= maxPrice;
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
        return a.category.localeCompare(b.category);
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
  if (filters.status !== 'ALL') {
    filtered = filtered.filter(msg => msg.status === filters.status);
  }

  // Фильтр по теме
  if (filters.subject !== 'ALL') {
    filtered = filtered.filter(msg => msg.subject === filters.subject);
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
  if (filters.dateRange !== 'ALL') {
    const now = new Date();
    const filterDate = new Date();
    
    switch (filters.dateRange) {
      case 'TODAY':
        filterDate.setHours(0, 0, 0, 0);
        break;
      case 'WEEK':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'MONTH':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }
    
    filtered = filtered.filter(msg => new Date(msg.createdAt) >= filterDate);
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

  // Фильтр по тексту
  if (filters.searchText.trim() !== '') {
    const searchLower = filters.searchText.toLowerCase();
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
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
  const minPrice = filters.priceRange.min ? parseFloat(filters.priceRange.min) : 0;
  const maxPrice = filters.priceRange.max ? parseFloat(filters.priceRange.max) : Infinity;
  if (filters.priceRange.min || filters.priceRange.max) {
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
        return a.category.localeCompare(b.category);
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
