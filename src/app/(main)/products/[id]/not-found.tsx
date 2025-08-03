import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <Package className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Продукт не найден
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            К сожалению, запрашиваемый продукт не существует или больше не доступен.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild>
            <Link href="/products" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Вернуться к продукции
            </Link>
          </Button>
          
          <div className="text-sm text-gray-500">
            <p>Или свяжитесь с нами, если возникли вопросы:</p>
            <Link 
              href="/contacts" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
