import type { Metadata } from "next";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const categories = await prisma.category.findMany({
      select: { code: true, nameRu: true },
      orderBy: { nameRu: "asc" },
    });

    const categoryLabels = categories
      .map(category => category.nameRu?.trim() || category.code)
      .filter((label): label is string => Boolean(label))
      .slice(0, 8);

    const descriptionParts: string[] = [
      "Каталог продукции Laddex с фильтрами по категориям, цене и характеристикам.",
    ];

    if (categoryLabels.length) {
      descriptionParts.push(`Доступные направления: ${categoryLabels.join(", ")}.`);
    }

    return buildMetadata({
      title: "Каталог продукции",
      description: descriptionParts.join(" "),
      path: "/products",
      type: "website",
    });
  } catch {
    return buildMetadata({
      title: "Каталог продукции",
      description: "Актуальный каталог изделий Laddex с возможностью фильтрации и подбора.",
      path: "/products",
      type: "website",
    });
  }
}

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
