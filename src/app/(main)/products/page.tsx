"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilterPanel } from "@/components/ui/FilterPanel";
import {
    productFilterConfigs,
    initialProductFilters,
    ProductFilters,
} from "@/components/filters/product-filter-config";
import {
    applyProductFilters,
    Product as ProductType,
} from "@/components/filters/filter-utils";
import ProductImage from "@/components/ProductImage";
import { Mail, Phone } from "lucide-react";

// Название категории берём из API (categoryNameRu), иначе показываем код

function ProductsPageInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [products, setProducts] = useState<ProductType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(true);
    const [categoriesMap, setCategoriesMap] = useState<Record<string, string>>(
        {}
    );
    const [contactPhone, setContactPhone] = useState<string | null>(null);
    const categoriesInitializedRef = useRef(false);
    const categoriesUniverseRef = useRef<string[]>([]);
    const initialCategoriesFromQueryRef = useRef(false);

    // Инициализируем фильтры с учётом query
    const [filters, setFilters] = useState<ProductFilters>(() => {
        // Build initial filters from URL query
        const categoriesParam = searchParams?.getAll("categories");
        const catSingle = searchParams?.get("categories");
        const categoriesFromQuery =
            categoriesParam && categoriesParam.length
                ? categoriesParam
                : catSingle
                ? catSingle.split(",")
                : undefined;

        const text = searchParams?.get("text") || "";
        const sorting =
            searchParams?.get("sorting") || initialProductFilters.sortBy;
        const priceFilterParam =
            searchParams?.get("priceFilter") ||
            initialProductFilters.priceFilter;
        const priceFilter = ["ALL", "WITH_PRICE", "ON_REQUEST"].includes(
            priceFilterParam
        )
            ? (priceFilterParam as ProductFilters["priceFilter"])
            : initialProductFilters.priceFilter;
        const currencyPrice = searchParams?.get("currency_price") || "";

        const priceRange = (() => {
            if (!currencyPrice) return { min: "", max: "" };
            const [minRaw, maxRaw] = currencyPrice.split("-");
            return {
                min: (minRaw || "").trim(),
                max: (maxRaw || "").trim(),
            };
        })();

        const hasQueryCategories = Boolean(
            categoriesFromQuery && categoriesFromQuery.length
        );
        initialCategoriesFromQueryRef.current = hasQueryCategories;

        const initialCategories = hasQueryCategories
            ? (categoriesFromQuery as string[])
            : initialProductFilters.categories;

        return {
            searchText: text,
            categories: initialCategories,
            sortBy: sorting,
            priceRange,
            priceFilter,
        };
    });

    // Синхронизируем смену query после монтирования (на случай client nav)
    useEffect(() => {
        // Sync filters from URL when query changes (e.g., back/forward, external link)
        const catSingle = searchParams?.get("categories");
        const categoriesParam = searchParams?.getAll("categories");
        const categoriesFromQuery =
            categoriesParam && categoriesParam.length
                ? categoriesParam
                : catSingle
                ? catSingle.split(",")
                : undefined;

        const text = searchParams?.get("text") || "";
        const sorting =
            searchParams?.get("sorting") || initialProductFilters.sortBy;
        const priceFilterParam =
            searchParams?.get("priceFilter") ||
            initialProductFilters.priceFilter;
        const priceFilter = ["ALL", "WITH_PRICE", "ON_REQUEST"].includes(
            priceFilterParam
        )
            ? (priceFilterParam as ProductFilters["priceFilter"])
            : initialProductFilters.priceFilter;
        const currencyPrice = searchParams?.get("currency_price") || "";
        const priceRange = (() => {
            if (!currencyPrice) return { min: "", max: "" };
            const [minRaw, maxRaw] = currencyPrice.split("-");
            return {
                min: (minRaw || "").trim(),
                max: (maxRaw || "").trim(),
            };
        })();

        setFilters(prev => {
            const next: ProductFilters = {
                searchText: text,
                // If URL has explicit categories -> use them; else preserve current categories
                categories:
                    categoriesFromQuery && categoriesFromQuery.length
                        ? (categoriesFromQuery as string[])
                        : prev.categories,
                sortBy: sorting,
                priceRange,
                priceFilter,
            };
            // Avoid unnecessary state updates
            if (
                prev.searchText === next.searchText &&
                prev.sortBy === next.sortBy &&
                prev.priceRange.min === next.priceRange.min &&
                prev.priceRange.max === next.priceRange.max &&
                prev.priceFilter === next.priceFilter &&
                prev.categories.length === next.categories.length &&
                prev.categories.every((c, i) => c === next.categories[i])
            ) {
                return prev;
            }
            return next;
        });
    }, [searchParams]);

    // Update URL when filters change via UI
    const updateUrlFromFilters = (nextFilters: ProductFilters) => {
        const params = new URLSearchParams(searchParams?.toString() || "");

        // text => searchText
        if (nextFilters.searchText && nextFilters.searchText.trim() !== "") {
            params.set("text", nextFilters.searchText.trim());
        } else {
            params.delete("text");
        }

        // sorting => sortBy
        if (
            nextFilters.sortBy &&
            nextFilters.sortBy !== initialProductFilters.sortBy
        ) {
            params.set("sorting", nextFilters.sortBy);
        } else {
            params.delete("sorting");
        }

        // priceFilter
        if (
            nextFilters.priceFilter &&
            nextFilters.priceFilter !== initialProductFilters.priceFilter
        ) {
            params.set("priceFilter", nextFilters.priceFilter);
        } else {
            params.delete("priceFilter");
        }

        // currency_price => priceRange "min-max"
        const datasetHasPrice = products.some(
            product => product.price !== null && product.price > 0
        );
        const shouldSyncPriceRange =
            nextFilters.priceFilter !== "ON_REQUEST" &&
            (nextFilters.priceFilter !== "ALL" || datasetHasPrice);
        const min = (nextFilters.priceRange?.min || "").trim();
        const max = (nextFilters.priceRange?.max || "").trim();
        if (shouldSyncPriceRange && (min !== "" || max !== "")) {
            params.set("currency_price", `${min}-${max}`);
        } else {
            params.delete("currency_price");
        }

        // categories (multi) => only include if not all categories selected
        params.delete("categories");
        const allCategories = Object.keys(categoriesMap);
        const selected = nextFilters.categories || [];
        const isAllSelected =
            selected.length === allCategories.length &&
            selected.every(c => allCategories.includes(c));
        if (!isAllSelected && selected.length > 0) {
            selected.forEach(c => params.append("categories", c));
        }

        const query = params.toString();
        router.replace(`${pathname}${query ? `?${query}` : ""}`);
    };
    const handleFiltersChange = (next: ProductFilters) => {
        setFilters(next);
        updateUrlFromFilters(next);
    };

    useEffect(() => {
        let aborted = false;
        async function load() {
            try {
                setLoading(true);
                const [res, catsRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/categories", { cache: "no-store" }),
                ]);
                if (!res.ok) throw new Error("Failed to load");
                const data = await res.json();
                if (catsRes.ok) {
                    const catsJson = await catsRes.json();
                    const map: Record<string, string> = {};
                    for (const c of catsJson as Array<{
                        code: string;
                        nameRu: string;
                    }>)
                        map[c.code] = c.nameRu || c.code;
                    setCategoriesMap(map);
                }
                if (!aborted) setProducts(data || []);
            } catch (e) {
                if (!aborted)
                    setError(e instanceof Error ? e.message : "Unknown error");
            } finally {
                if (!aborted) setLoading(false);
            }
        }
        load();
        return () => {
            aborted = true;
        };
    }, []);

    // Когда подтянули категории, если выбор пуст — выбираем все
    useEffect(() => {
        const nextUniverse = Object.keys(categoriesMap);
        const previousUniverse = categoriesUniverseRef.current;

        if (!nextUniverse.length) {
            categoriesUniverseRef.current = nextUniverse;
            return;
        }

        setFilters(prev => {
            const currentSelection = Array.isArray(prev.categories)
                ? prev.categories
                : [];
            let sanitizedSelection = currentSelection.filter(code =>
                nextUniverse.includes(code)
            );
            let changed = sanitizedSelection.length !== currentSelection.length;

            if (!categoriesInitializedRef.current) {
                categoriesInitializedRef.current = true;

                const representsAll =
                    sanitizedSelection.length === nextUniverse.length &&
                    nextUniverse.every(code =>
                        sanitizedSelection.includes(code)
                    );

                if (!initialCategoriesFromQueryRef.current && !representsAll) {
                    sanitizedSelection = [...nextUniverse];
                    changed = true;
                } else if (
                    initialCategoriesFromQueryRef.current &&
                    sanitizedSelection.length === 0
                ) {
                    sanitizedSelection = [...nextUniverse];
                    changed = true;
                }
            } else {
                const wasFullSelectionBefore =
                    previousUniverse.length > 0 &&
                    currentSelection.length === previousUniverse.length &&
                    previousUniverse.every(code =>
                        currentSelection.includes(code)
                    );

                if (
                    wasFullSelectionBefore &&
                    nextUniverse.length !== previousUniverse.length
                ) {
                    sanitizedSelection = [...nextUniverse];
                    changed = true;
                }
            }

            if (changed) {
                return { ...prev, categories: sanitizedSelection };
            }

            return prev;
        });

        categoriesUniverseRef.current = nextUniverse;
    }, [categoriesMap, setFilters]);

    useEffect(() => {
        let cancelled = false;

        async function loadContactInfo() {
            try {
                const response = await fetch("/api/content?type=CONTACTS", {
                    cache: "force-cache",
                });
                if (!response.ok) return;
                const payload = await response.json();
                const phone = payload?.data?.phoneTel;
                if (!cancelled && typeof phone === "string") {
                    setContactPhone(phone);
                }
            } catch {
                // Ignore contact info errors for public page experience
            }
        }

        loadContactInfo();

        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(
        () => applyProductFilters(products, filters),
        [products, filters]
    );
    const hasPricedProducts = useMemo(
        () =>
            products.some(
                product => product.price !== null && product.price > 0
            ),
        [products]
    );

    const dynamicProductFilterConfigs = useMemo(() => {
        const showPriceRange =
            filters.priceFilter !== "ON_REQUEST" &&
            (filters.priceFilter !== "ALL" || hasPricedProducts);
        const catOptions = Object.entries(categoriesMap).map(
            ([value, label]) => ({ value, label })
        );

        return productFilterConfigs.map(cfg => {
            if (cfg.key === "categories") {
                return {
                    ...cfg,
                    options: catOptions,
                    defaultValue: catOptions.map(option => option.value),
                };
            }
            if (cfg.key === "priceRange") {
                return { ...cfg, hidden: !showPriceRange };
            }
            return cfg;
        });
    }, [categoriesMap, filters.priceFilter, hasPricedProducts]);

    if (loading) {
        return (
            <div className="min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Продукция
                        </h1>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <Card key={i} className="animate-pulse">
                                <div className="aspect-video bg-gray-200 rounded-t-lg"></div>
                                <CardHeader>
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Продукция
                        </h1>
                    </div>

                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            Ошибка загрузки
                        </h3>
                        <p className="text-gray-600 max-w-sm mx-auto mb-4">
                            Не удалось загрузить список продуктов: {error}
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Попробовать снова
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 heading">
                        Продукция
                    </h1>
                </div>

                {/* Панель фильтров (универсальная) */}
                <div className="mb-10">
                    <FilterPanel
                        title="Фильтры и поиск"
                        filters={filters}
                        onFiltersChange={handleFiltersChange}
                        filterConfigs={dynamicProductFilterConfigs}
                        resultsCount={filtered.length}
                        totalCount={products.length}
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(v => !v)}
                    />
                </div>

                {/* Сетка продуктов */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
                    {filtered.map(product => {
                        const hasPrice =
                            typeof product.price === "number" &&
                            product.price > 0;
                        const formattedPrice = hasPrice
                            ? product.price!.toLocaleString("ru-RU")
                            : null;
                        const skuLabel =
                            product.sku && product.sku.trim()
                                ? product.sku
                                : "—";

                        return (
                            <Link
                                key={product.id}
                                href={`/products/${product.sku}`}
                                className="h-full"
                            >
                                <Card className="group flex h-full flex-col rounded-none border border-neutral-200 py-0 transition-shadow duration-300 hover:shadow-lg">
                                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                                        <div className="flex h-full w-full items-center justify-center px-2 pb-3 pt-0">
                                            {product.images &&
                                            product.images.length > 0 ? (
                                                <ProductImage
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    width={400}
                                                    height={300}
                                                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--primary)]">
                                                    <div className="flex h-16 w-16 items-center justify-center border border-[var(--primary)]/30 bg-[var(--primary)]/10">
                                                        <svg
                                                            className="h-8 w-8"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                                        {product.categoryNameRu ||
                                                            product.category}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <CardContent className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-2">
                                        <div
                                            className="heading min-h-[3.25rem] text-base font-semibold leading-snug text-neutral-900 transition-colors duration-200 line-clamp-2 group-hover:text-[var(--primary)]"
                                            title={product.name}
                                        >
                                            {product.name}
                                        </div>

                                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 text-xs uppercase tracking-wide text-neutral-500">
                                            <span>
                                                Артикул:{" "}
                                                <span className="font-semibold text-neutral-800">
                                                    {skuLabel}
                                                </span>
                                            </span>
                                            <Badge
                                                variant="tertiary"
                                                className="shrink-0 rounded-none px-2 py-1 text-[10px] uppercase tracking-wide"
                                            >
                                                {product.categoryNameRu ||
                                                    product.category}
                                            </Badge>
                                        </div>

                                        <div className="flex items-baseline justify-between pt-2 text-sm">
                                            <span className="text-xs uppercase tracking-wide text-neutral-500">
                                                Цена
                                            </span>
                                            <span className="text-lg font-semibold text-[var(--primary)]">
                                                {hasPrice && formattedPrice
                                                    ? `${formattedPrice} ₽`
                                                    : "По запросу"}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>

                {/* Пустое состояние */}
                {filtered.length === 0 && !loading && products.length > 0 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            Ничего не найдено
                        </h3>
                        <p className="text-gray-600 max-w-sm mx-auto mb-4">
                            Попробуйте изменить параметры поиска или фильтры
                        </p>
                        <Button
                            onClick={() =>
                                handleFiltersChange({
                                    ...initialProductFilters,
                                })
                            }
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                        >
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                            </svg>
                            Сбросить фильтры
                        </Button>
                    </div>
                )}

                {/* Пустое состояние - нет продуктов вообще */}
                {products.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-12 h-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">
                            Продукция не найдена
                        </h3>
                        <p className="text-gray-600 max-w-sm mx-auto">
                            В данный момент нет доступных продуктов для
                            отображения
                        </p>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-16 px-60">
                    <Card className="rounded-none border border-neutral-800 bg-neutral-900 text-neutral-50 shadow-lg">
                        <CardContent className="space-y-6 p-6">
                            <div className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                                    Свяжитесь с нами
                                </p>
                                <h3 className="text-2xl font-semibold">
                                    Не нашли подходящий продукт?
                                </h3>
                                <p className="text-sm leading-relaxed text-neutral-300">
                                    Мы поможем подобрать оптимальную комплектацию, подготовим расчёт и ответим на технические вопросы. Напишите нам или позвоните — откликнемся в ближайшее время.
                                </p>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    asChild
                                    className="flex-1 rounded-none border border-transparent bg-[var(--tertiary)] text-white hover:bg-[var(--primary)]"
                                >
                                    <Link
                                        href="/contacts"
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Отправить запрос
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="flex-1 rounded-none border-neutral-500 bg-transparent text-neutral-50 hover:bg-neutral-800 hover:text-white"
                                >
                                    <a
                                        href={
                                            contactPhone
                                                ? `tel:${contactPhone}`
                                                : "/contacts"
                                        }
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Позвонить
                                    </a>
                                </Button>
                            </div>
                            {contactPhone && (
                                <p className="text-xs uppercase tracking-wide text-neutral-400">
                                    Телефон: <span className="text-neutral-200">{contactPhone}</span>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen py-12 text-center">
                    Загрузка...
                </div>
            }
        >
            <ProductsPageInner />
        </Suspense>
    );
}
