import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

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
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300 group">
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder-product.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-center text-blue-600">
                      <div className="w-16 h-16 mx-auto mb-2 bg-blue-200 rounded-full flex items-center justify-center">
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
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {categoryNames[product.category as keyof typeof categoryNames]}
                  </Badge>
                  {product.price && (
                    <span className="text-lg font-bold text-blue-600">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {product.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {product.description}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
                  {product.size && (
                    <div>
                      <span className="font-medium">Размер:</span> {product.size}
                    </div>
                  )}
                  {product.weight && (
                    <div>
                      <span className="font-medium">Вес:</span> {product.weight}
                    </div>
                  )}
                  {product.load && (
                    <div>
                      <span className="font-medium">Нагрузка:</span> {product.load}
                    </div>
                  )}
                  {product.material && (
                    <div className="col-span-2">
                      <span className="font-medium">Материал:</span> {product.material}
                    </div>
                  )}
                </div>
                
                <Button asChild className="w-full" size="sm">
                  <Link href={`/products/${product.id}`}>
                    Подробнее
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Продукция временно недоступна</h3>
            <p className="text-gray-600">Мы работаем над добавлением новых товаров</p>
          </div>
        )}
        
        {/* Призыв к действию */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Нужна консультация?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Наши специалисты помогут подобрать оптимальное решение для ваших задач
                и ответят на все вопросы о продукции
              </p>
              <Button asChild size="lg">
                <Link href="/contacts">
                  Связаться с нами
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
