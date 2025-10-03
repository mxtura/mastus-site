import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminProductNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Card className="max-w-xl border border-dashed border-neutral-300 bg-white shadow-sm">
        <CardContent className="space-y-4 p-8 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">Продукт не найден</h1>
          <p className="text-sm text-neutral-600">
            Мы не смогли найти продукт с указанным артикулом. Возможно, он был удалён или его артикул изменился.
          </p>
          <Button asChild className="rounded-none">
            <Link href="/admin/products">Вернуться к управлению продукцией</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
