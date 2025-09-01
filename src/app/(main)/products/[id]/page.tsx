import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductImage from "@/components/ProductImage";

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true }
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

const categoryNames = {
  MANHOLES: 'Люки',
  SUPPORT_RINGS: 'Опорные кольца',
  LADDERS: 'Лестницы'
};

async function getContactPhoneTel(): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<Array<{ data: unknown }>>`SELECT data FROM "ContentPage" WHERE page = 'CONTACTS'::"ContentPageType" LIMIT 1`;
    const raw = rows && rows.length ? rows[0].data : null;
    if (!raw || typeof raw !== 'object') return null;
    interface CD { phoneTel?: string }
    const d = raw as CD;
    return typeof d.phoneTel === 'string' ? d.phoneTel : null;
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
  const { id } = await params;
  const product = await getProduct(id);
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
                    <p className="text-lg font-medium">{categoryNames[product.category as keyof typeof categoryNames]}</p>
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
                  {categoryNames[product.category as keyof typeof categoryNames]}
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
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Технические характеристики */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="tertiary">Характеристики</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {product.size && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Размер:</span>
                      <span className="text-gray-600">{product.size}</span>
                    </div>
                  )}
                  {product.thickness && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Толщина:</span>
                      <span className="text-gray-600">{product.thickness}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Вес:</span>
                      <span className="text-gray-600">{product.weight}</span>
                    </div>
                  )}
                  {product.load && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="font-medium text-gray-900">Нагрузка:</span>
                      <span className="text-gray-600">{product.load}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between py-2 border-b border-gray-100 md:col-span-2">
                      <span className="font-medium text-gray-900">Материал:</span>
                      <span className="text-gray-600">{product.material}</span>
                    </div>
                  )}
                  {product.color && (
                    <div className="flex justify-between py-2 border-b border-gray-100 md:col-span-2">
                      <span className="font-medium text-gray-900">Цвет:</span>
                      <span className="text-gray-600">{product.color}</span>
                    </div>
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
