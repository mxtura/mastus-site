import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";
import ProductImage from "@/components/ProductImage";

type ProductWithCategory = Product & { attributes?: unknown, category: { code: string; nameRu: string; params?: { parameter: { code: string; nameRu: string }, visible: boolean }[] } };
interface NormalizedProduct extends Omit<ProductWithCategory, 'images' | 'advantages' | 'applications'> {
  sku?: string | null;
  images: string[];
  advantages: string[];
  applications: string[];
}

async function getProduct(id: string) {
  try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product = await (prisma as any).product.findFirst({
      where: { id, isActive: true },
      include: { category: { select: { code: true, nameRu: true, params: { include: { parameter: { select: { code: true, nameRu: true } } } } } } },
    });
    return product as ProductWithCategory | null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Категория берётся из БД: показываем русское имя, при его отсутствии — код

async function getContactPhoneTel(): Promise<string | null> {
  try {
    const page = await prisma.contentPage.findUnique({ where: { page: 'CONTACTS' }, select: { data: true } })
    const raw = page?.data
    if (!raw || typeof raw !== 'object') return null
    interface CD { phoneTel?: string }
    const d = raw as CD
    return typeof d.phoneTel === 'string' ? d.phoneTel : null
  } catch {
    return null
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productRaw = await getProduct(id);
  const product: NormalizedProduct | null = productRaw ? {
    ...(productRaw as ProductWithCategory),
    images: Array.isArray(productRaw.images) ? (productRaw.images as unknown[]).filter(x=>typeof x==='string') as string[] : [],
    advantages: Array.isArray(productRaw.advantages) ? (productRaw.advantages as unknown[]).filter(x=>typeof x==='string') as string[] : [],
    applications: Array.isArray(productRaw.applications) ? (productRaw.applications as unknown[]).filter(x=>typeof x==='string') as string[] : [],
  } : null;
  const phoneTel = await getContactPhoneTel();

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Навигация */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="gap-2">
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              Назад к продукции
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Изображения */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
              {product.images && product.images.length > 0 ? (
                <ProductImage
                  src={product.images[0]}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--primary)]/5">
                  <div className="text-center text-[var(--primary)]">
                    <div className="w-24 h-24 mx-auto mb-4 bg-[var(--primary)]/20 rounded-none flex items-center justify-center border border-[var(--primary)]/30">
                      <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                      </svg>
                    </div>
                    <p className="text-lg font-medium">{product.category.nameRu || product.category.code}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Дополнительные изображения */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-2">
                    <ProductImage
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      width={150}
                      height={150}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Информация о продукте */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="tertiary">
                  {product.category.nameRu || product.category.code}
                </Badge>
                {product.price && (
                  <span className="text-3xl font-bold text-blue-600">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.sku && (
                <p className="text-sm text-gray-500 mb-2">Артикул: <span className="font-medium">{product.sku}</span></p>
              )}
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Характеристики (динамические) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="tertiary">Характеристики</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Boolean(product.attributes && typeof product.attributes === 'object' && product.category.params) && (
                    Object.entries(product.attributes as Record<string, unknown>)
                      .filter(([key]) => product.category.params!.some(p => p.parameter.code === key && p.visible))
                      .map(([key, value]) => {
                        const cp = product.category.params!.find(p => p.parameter.code === key)
                        const label = cp?.parameter.nameRu || key
                        const val = typeof value === 'string' || typeof value === 'number' ? String(value) : Array.isArray(value) ? value.join(', ') : ''
                        if (!val) return null
                        return (
                          <div key={key} className="flex justify-between py-2 border-b border-gray-100 md:col-span-2">
                            <span className="font-medium text-gray-900">{label}:</span>
                            <span className="text-gray-600">{val}</span>
                          </div>
                        )
                      })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Преимущества */}
            {product.advantages && product.advantages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="tertiary" className="bg-transparent">
                      Преимущества
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {product.advantages.map((advantage, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Области применения */}
            {product.applications && product.applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="tertiary" className="bg-transparent">
                      Области применения
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-2">
                    {product.applications.map((application, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-gray-600">{application}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Заказать */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Заинтересовались продукцией?
                </h3>
                <p className="text-gray-600 mb-6">
                  Свяжитесь с нами для получения коммерческого предложения, 
                  консультации или размещения заказа
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild variant="tertiary" className="flex-1">
                    <Link href="/contacts" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Отправить запрос
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1 border-[var(--tertiary)] text-[var(--tertiary)] hover:bg-[var(--tertiary)] hover:text-white">
                    <Link href={phoneTel ? `tel:${phoneTel}` : '#'} className="gap-2">
                      <Phone className="h-4 w-4" />
                      Позвонить
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
