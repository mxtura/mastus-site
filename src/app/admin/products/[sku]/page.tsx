import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, EyeOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProductGallery from "@/components/ProductGallery";
import { MarkdownText } from "@/components/MarkdownText";

interface PageProps {
  params: Promise<{
    sku: string;
  }>;
}

type ProductWithCategory = Product & {
  attributes?: unknown;
  category: {
    code: string;
    nameRu: string;
    params?: {
      parameter: { code: string; nameRu: string };
      visible: boolean;
      required: boolean;
    }[];
  };
};

interface NormalizedProduct
  extends Omit<ProductWithCategory, "images" | "advantages" | "applications"> {
  images: string[];
  advantages: string[];
  applications: string[];
}

async function getProductForAdmin(rawSku: string) {
  const sku = rawSku.trim();
  if (!sku) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma as any).product.findFirst({
      where: { sku },
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
    console.error("Error fetching admin preview product by SKU:", error);
    return null;
  }
}

export default async function AdminProductPreviewPage({ params }: PageProps) {
  const { sku } = await params;
  const productRaw = await getProductForAdmin(sku);

  if (!productRaw) {
    notFound();
  }

  const product: NormalizedProduct = {
    ...(productRaw as ProductWithCategory),
    images: Array.isArray(productRaw.images)
      ? (productRaw.images as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    advantages: Array.isArray(productRaw.advantages)
      ? (productRaw.advantages as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
    applications: Array.isArray(productRaw.applications)
      ? (productRaw.applications as unknown[]).filter((item): item is string => typeof item === "string")
      : [],
  };

  const categoryLabel = product.category.nameRu || product.category.code;
  const attributeEntries =
    product.category.params &&
    product.attributes &&
    typeof product.attributes === "object"
      ? Object.entries(product.attributes as Record<string, unknown>).reduce<
          Array<{ key: string; label: string; value: string }>
        >((acc, [key, rawValue]) => {
          const config = product.category.params!.find(
            param => param.parameter.code === key && param.visible,
          );

          if (!config) {
            return acc;
          }

          let normalizedValue = "";
          if (typeof rawValue === "string" || typeof rawValue === "number") {
            normalizedValue = String(rawValue);
          } else if (Array.isArray(rawValue)) {
            normalizedValue = rawValue
              .filter((item): item is string | number => typeof item === "string" || typeof item === "number")
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
        }, [])
      : [];

  const hasAdvantages = product.advantages.length > 0;
  const hasApplications = product.applications.length > 0;
  const publicProductUrl = `/products/${product.sku}`;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            asChild
            className="w-full gap-2 rounded-none border-neutral-300 text-neutral-700 hover:bg-neutral-900 hover:text-white sm:w-auto"
          >
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              Назад к продукции
            </Link>
          </Button>
          <Button
            variant="ghost"
            asChild
            className="w-full gap-2 rounded-none border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 sm:w-auto"
          >
            <Link href={publicProductUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Открыть на сайте
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant="tertiary" className="rounded-none px-3 py-1 text-[11px] uppercase tracking-wide">
            {categoryLabel}
          </Badge>
          <Badge
            variant={product.isActive ? "default" : "secondary"}
            className="flex items-center gap-1 rounded-none px-3 py-1 text-[10px] uppercase tracking-wide"
          >
            {product.isActive ? (
              "Опубликован"
            ) : (
              <span className="flex items-center gap-1">
                <EyeOff className="h-3.5 w-3.5" /> Скрыт
              </span>
            )}
          </Badge>
        </div>
      </header>

      <Card className="border border-neutral-200 bg-white shadow-sm">
        <CardContent className="space-y-10 p-4 sm:p-6 lg:p-8">
          <div className="rounded border border-dashed border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
            <p>
              Это превью продуктовой страницы, доступное только администраторам. Вы можете безопасно
              проверять контент, изображения и форматирование Markdown, не выходя из панели управления.
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,55%)_minmax(0,45%)] xl:gap-16">
            <div className="flex flex-col gap-6">
              <ProductGallery images={product.images} name={product.name} categoryLabel={categoryLabel} />
            </div>

            <div className="flex flex-col gap-6">
              <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                <CardContent className="space-y-6 p-6">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="space-y-3">
                      <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{product.name}</h1>
                      {product.description && (
                        <MarkdownText
                          content={product.description}
                          as="div"
                          baseClassName=""
                          className="text-base leading-relaxed text-neutral-700 space-y-3"
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {product.sku && (
                      <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-neutral-500">Артикул</span>
                        <span className="text-sm font-semibold text-neutral-900">{product.sku}</span>
                      </div>
                    )}
                    {product.price ? (
                      <span className="text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
                        {product.price.toLocaleString("ru-RU")} ₽
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
                    <Badge variant="tertiary" className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide">
                      Характеристики
                    </Badge>
                    <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Техническая информация
                    </span>
                  </div>
                  {attributeEntries.length > 0 ? (
                    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {attributeEntries.map(({ key, label, value }) => (
                        <div key={key} className="space-y-1">
                          <dt className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</dt>
                          <dd className="text-sm font-medium leading-snug text-neutral-900">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-neutral-600">
                      Для продукта не указаны характеристики или соответствующие параметры скрыты в настройках
                      категории.
                    </p>
                  )}
                </CardContent>
              </Card>

              {hasAdvantages && (
                <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="tertiary" className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide">
                        Преимущества
                      </Badge>
                      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Почему выбирают нас
                      </span>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {product.advantages.map((advantage, index) => (
                        <li
                          key={`${advantage}-${index}`}
                          className="flex items-start gap-2 rounded border border-neutral-200/70 bg-neutral-50 px-3 py-2"
                        >
                          <span className="mt-1 h-2 w-2 flex-shrink-0 bg-[var(--primary)]" />
                          <MarkdownText
                            content={advantage}
                            as="div"
                            baseClassName=""
                            className="text-sm leading-snug text-neutral-700"
                          />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {hasApplications && (
                <Card className="rounded-none border border-neutral-200 bg-white shadow-sm">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="tertiary" className="rounded-none px-2 py-1 text-[11px] uppercase tracking-wide">
                        Области применения
                      </Badge>
                      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                        Где использовать продукт
                      </span>
                    </div>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {product.applications.map((application, index) => (
                        <li
                          key={`${application}-${index}`}
                          className="flex items-start gap-2 rounded border border-neutral-200/70 bg-neutral-50 px-3 py-2"
                        >
                          <span className="mt-1 h-2 w-2 flex-shrink-0 bg-[var(--tertiary)]" />
                          <MarkdownText
                            content={application}
                            as="div"
                            baseClassName=""
                            className="text-sm leading-snug text-neutral-700"
                          />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
