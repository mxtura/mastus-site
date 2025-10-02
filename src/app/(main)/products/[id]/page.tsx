import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";
import ProductGallery from "@/components/ProductGallery";

type ProductWithCategory = Product & {
    attributes?: unknown;
    category: {
        code: string;
        nameRu: string;
        params?: {
            parameter: { code: string; nameRu: string };
            visible: boolean;
        }[];
    };
};

interface NormalizedProduct
    extends Omit<
        ProductWithCategory,
        "images" | "advantages" | "applications"
    > {
    sku: string;
    images: string[];
    advantages: string[];
    applications: string[];
}

async function getProductBySku(rawSku: string) {
    const sku = rawSku.trim();
    if (!sku) {
        return null;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const product = await (prisma as any).product.findFirst({
            where: { sku, isActive: true },
            include: {
                category: {
                    select: {
                        code: true,
                        nameRu: true,
                        params: {
                            include: {
                                parameter: {
                                    select: { code: true, nameRu: true },
                                },
                            },
                        },
                    },
                },
            },
        });
        return product as ProductWithCategory | null;
    } catch (error) {
        console.error("Error fetching product by SKU:", error);
        return null;
    }
}

async function getProductById(rawId: string) {
    const id = rawId.trim();
    if (!id) {
        return null;
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const product = await (prisma as any).product.findFirst({
            where: { id, isActive: true },
            select: { id: true, sku: true },
        });
        return product as Pick<Product, "id" | "sku"> | null;
    } catch (error) {
        console.error("Error resolving product by ID:", error);
        return null;
    }
}

async function getContactPhoneTel(): Promise<string | null> {
    try {
        const page = await prisma.contentPage.findUnique({
            where: { page: "CONTACTS" },
            select: { data: true },
        });
        const raw = page?.data;
        if (!raw || typeof raw !== "object") return null;

        interface ContactData {
            phoneTel?: string;
        }

        const data = raw as ContactData;
        return typeof data.phoneTel === "string" ? data.phoneTel : null;
    } catch {
        return null;
    }
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: PageProps) {
    const { id: skuParam } = await params;
    const productRaw = await getProductBySku(skuParam);
    if (!productRaw) {
        const legacy = await getProductById(skuParam);
        if (legacy?.sku) {
            redirect(`/products/${legacy.sku}`);
        }
    }

    const product: NormalizedProduct | null = productRaw
        ? {
              ...(productRaw as ProductWithCategory),
              sku: typeof productRaw.sku === "string" ? productRaw.sku : "",
              images: Array.isArray(productRaw.images)
                  ? (productRaw.images as unknown[]).filter(
                        (item): item is string => typeof item === "string"
                    )
                  : [],
              advantages: Array.isArray(productRaw.advantages)
                  ? (productRaw.advantages as unknown[]).filter(
                        (item): item is string => typeof item === "string"
                    )
                  : [],
              applications: Array.isArray(productRaw.applications)
                  ? (productRaw.applications as unknown[]).filter(
                        (item): item is string => typeof item === "string"
                    )
                  : [],
          }
        : null;

    const phoneTel = await getContactPhoneTel();

    if (!product || !product.sku) {
        notFound();
    }

    const categoryLabel = product.category.nameRu || product.category.code;

    const attributeEntries =
        product.category.params &&
        product.attributes &&
        typeof product.attributes === "object"
            ? Object.entries(
                  product.attributes as Record<string, unknown>
              ).reduce<Array<{ key: string; label: string; value: string }>>(
                  (acc, [key, rawValue]) => {
                      const config = product.category.params!.find(
                          param => param.parameter.code === key && param.visible
                      );
                      if (!config) {
                          return acc;
                      }

                      let normalizedValue = "";
                      if (
                          typeof rawValue === "string" ||
                          typeof rawValue === "number"
                      ) {
                          normalizedValue = String(rawValue);
                      } else if (Array.isArray(rawValue)) {
                          normalizedValue = rawValue
                              .filter(
                                  (item): item is string | number =>
                                      typeof item === "string" ||
                                      typeof item === "number"
                              )
                              .map(item => String(item))
                              .join(", ");
                      }

                      if (!normalizedValue) {
                          return acc;
                      }

                      acc.push({
                          key,
                          label: config.parameter.nameRu || key,
                          value: normalizedValue,
                      });
                      return acc;
                  },
                  []
              )
            : [];

    const updatedAtDate = product.updatedAt
        ? new Date(product.updatedAt)
        : null;
    const lastUpdated = updatedAtDate
        ? updatedAtDate.toLocaleDateString("ru-RU")
        : null;

    const hasAdvantages = product.advantages.length > 0;
    const hasApplications = product.applications.length > 0;

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        variant="outline"
                        asChild
                        className="w-full gap-2 rounded-none border-neutral-300 text-neutral-700 hover:bg-neutral-900 hover:text-white sm:w-auto"
                    >
                        <Link href="/products">
                            <ArrowLeft className="h-4 w-4" />
                            Назад к продукции
                        </Link>
                    </Button>
                    <div className="text-xs uppercase tracking-wide text-neutral-500">
                        <Badge
                            variant="tertiary"
                            className="rounded-none px-3 py-1 text-[11px] uppercase tracking-wide"
                        >
                            {categoryLabel}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-10 lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] xl:gap-16">
                    <div className="flex flex-col gap-6">
                        <ProductGallery
                            images={product.images}
                            name={product.name}
                            categoryLabel={categoryLabel}
                        />

                        <Card className="rounded-none border border-neutral-800 bg-neutral-900 text-neutral-50 shadow-lg">
                            <CardContent className="space-y-6 p-6">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
                                        Свяжитесь с нами
                                    </p>
                                    <h3 className="text-2xl font-semibold">
                                        Нужна консультация по продукту?
                                    </h3>
                                    <p className="text-sm leading-relaxed text-neutral-300">
                                        Мы поможем подобрать оптимальную
                                        комплектацию, подготовим расчёт и
                                        ответим на технические вопросы. Напишите
                                        нам или позвоните — откликнемся в
                                        ближайшее время.
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
                                        <Link
                                            href={
                                                phoneTel
                                                    ? `tel:${phoneTel}`
                                                    : "/contacts"
                                            }
                                            className="flex items-center justify-center gap-2"
                                        >
                                            <Phone className="h-4 w-4" />
                                            Позвонить
                                        </Link>
                                    </Button>
                                </div>
                                {phoneTel && (
                                    <p className="text-xs uppercase tracking-wide text-neutral-400">
                                        Телефон:{" "}
                                        <span className="text-neutral-200">
                                            {phoneTel}
                                        </span>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-6">
                        <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                            <CardContent className="space-y-6 p-6">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="space-y-3">
                                        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
                                            {product.name}
                                        </h1>
                                        {product.description && (
                                            <p className="text-base leading-relaxed text-neutral-700">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {product.sku && (
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase tracking-wide text-neutral-500">
                                                Артикул
                                            </span>
                                            <span className="text-sm font-semibold text-neutral-900">
                                                {product.sku}
                                            </span>
                                        </div>
                                    )}
                                    {product.price ? (
                                        <span className="text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                                            {product.price.toLocaleString(
                                                "ru-RU"
                                            )}{" "}
                                            ₽
                                        </span>
                                    ) : (
                                        <span className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                                            Цена по запросу
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                            <CardContent className="space-y-4 p-5 sm:p-6">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge
                                        variant="tertiary"
                                        className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide"
                                    >
                                        Характеристики
                                    </Badge>
                                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                        Техническая информация
                                    </span>
                                </div>
                                {attributeEntries.length > 0 ? (
                                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                                        {attributeEntries.map(
                                            ({ key, label, value }) => (
                                                <div key={key} className="space-y-1">
                                                    <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                                                        {label}
                                                    </dt>
                                                    <dd className="text-sm font-medium leading-snug text-neutral-900">
                                                        {value}
                                                    </dd>
                                                </div>
                                            )
                                        )}
                                    </dl>
                                ) : (
                                    <p className="text-sm text-neutral-600">
                                        Для данного продукта пока нет
                                        опубликованных характеристик. Свяжитесь с
                                        менеджером, и мы подготовим подробную
                                        спецификацию.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {hasAdvantages && (
                            <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                                <CardContent className="space-y-4 p-5 sm:p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="tertiary"
                                            className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide"
                                        >
                                            Преимущества
                                        </Badge>
                                        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Почему выбирают нас
                                        </span>
                                    </div>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {product.advantages.map(
                                            (advantage, index) => (
                                                <li
                                                    key={`${advantage}-${index}`}
                                                    className="flex items-start gap-2 rounded border border-neutral-200/70 bg-neutral-50 px-3 py-2 text-sm leading-snug text-neutral-700"
                                                >
                                                    <span className="mt-1 h-2 w-2 flex-shrink-0 bg-[var(--primary)]" />
                                                    <span>{advantage}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {hasApplications && (
                            <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                                <CardContent className="space-y-4 p-5 sm:p-6">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge
                                            variant="tertiary"
                                            className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide"
                                        >
                                            Области применения
                                        </Badge>
                                        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                                            Где использовать продукт
                                        </span>
                                    </div>
                                    <ul className="grid gap-2 sm:grid-cols-2">
                                        {product.applications.map(
                                            (application, index) => (
                                                <li
                                                    key={`${application}-${index}`}
                                                    className="flex items-start gap-2 rounded border border-neutral-200/70 bg-neutral-50 px-3 py-2 text-sm leading-snug text-neutral-700"
                                                >
                                                    <span className="mt-1 h-2 w-2 flex-shrink-0 bg-[var(--tertiary)]" />
                                                    <span>{application}</span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
