import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import ProductImage from "@/components/ProductImage";

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

const categoryNames = {
  MANHOLES: 'Люки',
  SUPPORT_RINGS: 'Опорные кольца'
};

export default async function Products() {
  const products = await getProducts();

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Продукция</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            ООО &quot;МАСТУС&quot; специализируется на производстве высококачественных 
            полимер-песчаных изделий для городских инженерных коммуникаций
          </p>
        </div>

        {/* Сетка продуктов */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`}>
              <Card className="hover:shadow-lg transition-shadow duration-300 group cursor-pointer">
                <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <ProductImage
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                      <div className="text-center text-blue-600">
                        <div className="w-16 h-16 mx-auto mb-3 bg-blue-200 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
                          </svg>
                        </div>
                        <p className="text-sm font-medium">{categoryNames[product.category as keyof typeof categoryNames]}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg leading-6 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </CardTitle>
                    <Badge variant="outline" className="flex-shrink-0">
                      {categoryNames[product.category as keyof typeof categoryNames]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="space-y-2">
                    {/* Основные характеристики */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                      {product.size && (
                        <div>
                          <span className="font-medium">Размер:</span>
                          <br />
                          <span>{product.size}</span>
                        </div>
                      )}
                      {product.load && (
                        <div>
                          <span className="font-medium">Нагрузка:</span>
                          <br />
                          <span>{product.load}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Цена */}
                    {product.price && (
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Цена:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {product.price.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Пустое состояние */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Продукция не найдена</h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              В данный момент нет доступных продуктов для отображения
            </p>
          </div>
        )}

        {/* Заказать консультацию */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Не нашли подходящий продукт?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Свяжитесь с нами для получения индивидуального предложения 
              или консультации по выбору оптимального решения
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/contacts">
                  Получить консультацию
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/info">
                  Узнать больше о компании
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
