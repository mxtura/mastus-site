import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Базовые типы для фильтров
export interface FilterOption {
  value: string;
  label: string;
}

export interface RangeFilter {
  min: string;
  max: string;
}

export interface BaseFilters {
  searchText: string;
  [key: string]: string | string[] | RangeFilter | boolean;
}

// Конфигурация отдельного фильтра
export interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'multiselect' | 'checkbox' | 'range';
  placeholder?: string;
  options?: FilterOption[];
  defaultValue?: string | string[] | RangeFilter;
}

// Пропы компонента
export interface FilterPanelProps<T extends BaseFilters> {
  title: string;
  filters: T;
  onFiltersChange: (filters: T) => void;
  filterConfigs: FilterConfig[];
  resultsCount?: number;
  totalCount?: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  className?: string;
}

export function FilterPanel<T extends BaseFilters>({
  title,
  filters,
  onFiltersChange,
  filterConfigs,
  resultsCount,
  totalCount,
  showFilters,
  onToggleFilters,
  className = ''
}: FilterPanelProps<T>) {
  
  // Type guards
  const isRangeFilter = (value: unknown): value is RangeFilter => {
    return value !== null && typeof value === 'object' && value !== undefined && 'min' in value && 'max' in value;
  };

  const isStringArray = (value: unknown): value is string[] => {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
  };
  
  // Подсчет активных фильтров
  const getActiveFiltersCount = () => {
    let count = 0;
    
    filterConfigs.forEach(config => {
      const value = filters[config.key];
      
      switch (config.type) {
        case 'search':
          if (typeof value === 'string' && value.trim() !== '') count++;
          break;
        case 'select':
          if (typeof value === 'string' && value !== 'ALL' && value !== config.defaultValue) count++;
          break;
        case 'multiselect':
          if (isStringArray(value) && value.length > 0 && value.length !== config.options?.length) count++;
          break;
        case 'checkbox':
          if (typeof value === 'string' && value !== 'ALL' && value !== config.defaultValue) count++;
          break;
        case 'range':
          if (isRangeFilter(value) && (value.min !== '' || value.max !== '')) count++;
          break;
      }
    });
    
    return count;
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    const resetFilters = { ...filters };
    
    filterConfigs.forEach(config => {
      switch (config.type) {
        case 'search':
          resetFilters[config.key as keyof T] = '' as T[keyof T];
          break;
        case 'select':
        case 'checkbox':
          resetFilters[config.key as keyof T] = (config.defaultValue || 'ALL') as T[keyof T];
          break;
        case 'multiselect':
          resetFilters[config.key as keyof T] = (config.options?.map(o => o.value) || []) as T[keyof T];
          break;
        case 'range':
          resetFilters[config.key as keyof T] = { min: '', max: '' } as T[keyof T];
          break;
      }
    });
    
    onFiltersChange(resetFilters);
  };

  // Обновление конкретного фильтра
  const updateFilter = (key: string, value: string | string[] | RangeFilter | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={`border border-neutral-300 bg-neutral-50 rounded-none shadow-sm ${className}`}>
      {/* Header bar */}
      <div className="bg-neutral-900 border-b-4 border-[var(--tertiary)] px-6 py-5 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-neutral-800 border border-neutral-600 flex items-center justify-center mr-4">
            <Filter className="w-5 h-5 text-neutral-200" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-wide text-white">{title}</h2>
            <p className="text-xs text-neutral-400 tracking-wide">Точное выделение нужной продукции</p>
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-3">{activeFiltersCount}</Badge>
          )}
        </div>
        <Button
          size="sm"
          onClick={onToggleFilters}
          className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 rounded-none tracking-wide"
          variant="outline"
        >
          {showFilters ? 'Скрыть' : 'Показать'}
        </Button>
      </div>

      {/* Body */}
      {showFilters && (
        <div className="px-6 py-8 space-y-6">
          {/* Search */}
          {filterConfigs
            .filter(config => config.type === 'search')
            .map((config) => (
              <div key={config.key} className="space-y-2">
                <label className="flex items-center text-xs font-semibold tracking-wide text-neutral-700 mb-2 uppercase">
                  Поиск
                </label>
                <Input
                  placeholder={config.placeholder || 'Введите запрос...'}
                  value={typeof filters[config.key] === 'string' ? (filters[config.key] as string) : ''}
                  onChange={(e) => updateFilter(config.key, e.target.value)}
                  className="w-full border-neutral-400 bg-white text-neutral-900 focus:border-[var(--primary)] focus:ring-0 rounded-none text-sm tracking-wide"
                />
              </div>
            ))}

          {/* Grid of other filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filterConfigs
              .filter(config => config.type !== 'search')
              .map((config) => {
                const value = filters[config.key];
                if (config.type === 'select') {
                  return (
                    <div key={config.key} className="space-y-2">
                      <label className="flex items-center text-xs font-semibold tracking-wide text-neutral-700 mb-2 uppercase">
                        {config.label}
                      </label>
                      <Select
                        value={typeof value === 'string' ? value : (typeof config.defaultValue === 'string' ? config.defaultValue : 'ALL')}
                        onValueChange={(newValue) => updateFilter(config.key, newValue)}
                      >
                        <SelectTrigger className="border-neutral-400 bg-white text-neutral-900 focus:border-[var(--primary)] focus:ring-0 rounded-none text-sm tracking-wide">
                          <SelectValue placeholder={config.label} />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                }

                if (config.type === 'multiselect') {
                  return (
                    <div key={config.key} className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center text-xs font-semibold tracking-wide text-neutral-700 uppercase">
                          {config.label}
                        </label>
                        {config.key === 'categories' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-none h-7 px-2 text-xs"
                            onClick={() => {
                              const currentValues = isStringArray(value) ? value : [];
                              const all = (config.options?.map(o => o.value) || []);
                              const isAllSelected = currentValues.length === all.length && all.every(v => currentValues.includes(v));
                              updateFilter(config.key, isAllSelected ? [] : all);
                            }}
                          >
                            {(() => {
                              const currentValues = isStringArray(value) ? value : [];
                              const all = (config.options?.map(o => o.value) || []);
                              const isAllSelected = currentValues.length === all.length && all.every(v => currentValues.includes(v));
                              return isAllSelected ? 'Снять все' : 'Выбрать все';
                            })()}
                          </Button>
                        )}
                      </div>
                      <div className="border border-neutral-300 bg-white p-3 rounded-none">
                        <div className="grid grid-cols-1 gap-2">
                          {config.options?.map((option) => {
                            const checked = isStringArray(value) ? value.includes(option.value) : false;
                            return (
                              <label key={option.value} className="flex items-center gap-2 text-sm text-neutral-800">
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(val) => {
                                    const isChecked = Boolean(val);
                                    const currentValues = isStringArray(value) ? value : [];
                                    const newValues = isChecked
                                      ? Array.from(new Set([...currentValues, option.value]))
                                      : currentValues.filter(v => v !== option.value);
                                    updateFilter(config.key, newValues);
                                  }}
                                />
                                <span>{option.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (config.type === 'range') {
                  const rangeValue = isRangeFilter(value) ? value : { min: '', max: '' };
                  return (
                    <div key={config.key} className="space-y-2">
                      <label className="flex items-center text-xs font-semibold tracking-wide text-neutral-700 mb-2 uppercase">
                        {config.label}
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="От"
                          value={rangeValue.min}
                          onChange={(e) => updateFilter(config.key, { ...rangeValue, min: e.target.value })}
                          className="w-full border-neutral-400 bg-white text-neutral-900 focus:border-[var(--primary)] focus:ring-0 rounded-none text-sm tracking-wide"
                        />
                        <Input
                          type="number"
                          placeholder="До"
                          value={rangeValue.max}
                          onChange={(e) => updateFilter(config.key, { ...rangeValue, max: e.target.value })}
                          className="w-full border-neutral-400 bg-white text-neutral-900 focus:border-[var(--primary)] focus:ring-0 rounded-none text-sm tracking-wide"
                        />
                      </div>
                    </div>
                  );
                }

                return null;
              })}
          </div>

          {/* Stats + Reset */}
          {(resultsCount !== undefined && totalCount !== undefined) && (
            <div className="mt-4 pt-6 border-t border-neutral-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-200 border border-neutral-400 flex items-center justify-center">
                  <svg className="w-5 h-5 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-wide text-neutral-700">НАЙДЕНО: <span className="text-[var(--tertiary)] text-base">{resultsCount}</span> / {totalCount}</p>
                  <p className="text-[10px] text-neutral-500 tracking-wide">Автообновление при изменении условий</p>
                </div>
              </div>
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="rounded-none tracking-wide border-neutral-500 text-neutral-800 hover:bg-neutral-900 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                СБРОСИТЬ
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
