import type { Metadata } from "next";
import Link from "next/link";
import { FadingSlideshow } from "@/components/fading-slideshow";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { CategoryDescription } from "@/components/CategoryDescription";
import { getContent, HomeContent, ContactsContent } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { MarkdownText } from "@/components/MarkdownText";
import { buildMetadata, normalizeText } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
    const home = (await getContent("HOME")) as HomeContent;
    const heroTitle = normalizeText(home.heroTitle);
    const heroSubtitle = normalizeText(home.heroSubtitle);

    const title =
        heroTitle && heroTitle.toLowerCase() !== "laddex"
            ? heroTitle
            : "Главная страница";

    const descriptionSource = heroSubtitle ?? heroTitle;

    return buildMetadata({
        title,
        description: descriptionSource ?? undefined,
        path: "/",
        type: "website",
    });
}

type CategoryPreview = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    minPrice: number | null;
    images: { src: string; alt: string }[];
    hasProducts: boolean;
    productCount: number;
};

const toStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    return value
        .map(item => (typeof item === "string" ? item.trim() : ""))
        .filter((item): item is string => Boolean(item));
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(
        Math.round(price)
    );

export default async function Home() {
    const [home, contacts, categories] = await Promise.all([
        getContent("HOME"),
        getContent("CONTACTS"),
        prisma.category.findMany({
            select: { id: true, code: true, nameRu: true, description: true },
            orderBy: { nameRu: "asc" },
        }),
    ]);

    const categoryPreviews: CategoryPreview[] = await Promise.all(
        categories.map(async category => {
            const [priceStats, productCount, recentProducts] = await Promise.all([
                prisma.product.aggregate({
                    where: {
                        categoryId: category.id,
                        isActive: true,
                        price: { not: null },
                    },
                    _min: { price: true },
                }),
                prisma.product.count({
                    where: {
                        categoryId: category.id,
                        isActive: true,
                    },
                }),
                prisma.product.findMany({
                    where: { categoryId: category.id, isActive: true },
                    select: {
                        id: true,
                        name: true,
                        images: true,
                    },
                    orderBy: { createdAt: "desc" },
                    take: 18,
                }),
            ]);

            const imageCandidates = recentProducts.flatMap(product => {
                const images = toStringArray(product.images as unknown);
                return images.map((src, index) => ({
                    src,
                    alt:
                        product.name && images.length > 1
                            ? `${product.name} — ${index + 1}`
                            : product.name || category.nameRu,
                }));
            });

            const uniqueImages: { src: string; alt: string }[] = [];
            const seen = new Set<string>();
            for (const image of imageCandidates) {
                if (!image.src || seen.has(image.src)) continue;
                uniqueImages.push(image);
                seen.add(image.src);
                if (uniqueImages.length >= 8) break;
            }

            return {
                id: category.id,
                code: category.code,
                name: category.nameRu,
                description: category.description ? category.description.trim() || null : null,
                minPrice: priceStats._min.price ?? null,
                images: uniqueImages,
                hasProducts: productCount > 0,
                productCount,
            } satisfies CategoryPreview;
        })
    );

    const hero = home as HomeContent;
    const contactsData = contacts as ContactsContent;
    const phoneTel = contactsData.phoneTel;
    const heroTitle = hero.heroTitle;
    const heroSubtitle = hero.heroSubtitle;
    return (
        <div className="min-h-screen">
            {/* Hero Section (industrial style) */}
            <section className="relative bg-neutral-900 text-white py-20 lg:py-32 overflow-hidden border-b-4 border-[var(--tertiary)]">
                {/* Background Pattern: sharp grid */}
                <div className="absolute inset-0 opacity-15 mix-blend-lighten pointer-events-none select-none">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23ffffff' stroke-width='1' stroke-opacity='0.09'%3E%3Cpath d='M0 .5H80M0 16.5H80M0 32.5H80M0 48.5H80M0 64.5H80M0 79.5H80'/%3E%3Cpath d='M.5 0v80M16.5 0v80M32.5 0v80M48.5 0v80M64.5 0v80M79.5 0v80'/%3E%3C/svg%3E")`,
                            backgroundSize: "80px 80px",
                        }}
                    ></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] bg-clip-text text-transparent heading tracking-wide">
                            <MarkdownText
                                content={heroTitle}
                                variant="inline"
                                baseClassName=""
                                className=""
                            />
                        </h1>

                        <p className="text-xl sm:text-2xl text-gray-300 font-light tracking-wide">
                            <MarkdownText
                                content={heroSubtitle}
                                variant="inline"
                                baseClassName=""
                                className="text-inherit"
                            />
                        </p>
                    </div>
                </div>
            </section>

            {/* Products Section (multiple variants for selection) */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 heading">
                            Наша продукция
                        </h2>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {categoryPreviews.map(category => {
                            const hasImages = category.images.length > 0;
                            const categoryQuery = {
                                pathname: "/products",
                                query: { categories: category.code },
                            } as const;

                            return (
                                <Card
                                    key={category.id}
                                    className="group relative flex flex-col gap-1 overflow-hidden rounded-none border border-neutral-300 bg-white py-0 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="relative flex h-40 items-center justify-center border-b border-neutral-300 bg-neutral-100">
                                        {hasImages ? (
                                            <FadingSlideshow
                                                images={category.images}
                                                interval={3200}
                                                fadeDuration={650}
                                                className="h-full w-full"
                                                priorityFirst
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-xs tracking-wide text-neutral-400">
                                                Нет изображений
                                            </div>
                                        )}
                                        <div className="absolute top-0 left-0 h-1 w-full bg-[var(--tertiary)]" />
                                        <div className="absolute left-4 top-4">
                                            <div className="rounded-full bg-neutral-900/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md backdrop-blur">
                                                Количество: {category.productCount}
                                            </div>
                                        </div>
                                    </div>
                                    <CardHeader className="border-b border-neutral-200 bg-white px-4 py-3 gap-0">
                                        <CardTitle
                                            className="heading text-base font-semibold leading-snug tracking-wide text-neutral-900 overflow-hidden text-ellipsis break-words"
                                            style={{
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                                wordBreak: "break-word",
                                                overflowWrap: "anywhere",
                                            }}
                                            title={category.name}
                                        >
                                            {category.name}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 flex-col gap-5 px-4 pt-2 pb-3">
                                        <CategoryDescription content={category.description} />
                                        <div className="mt-auto space-y-3">
                                            <div
                                                className={
                                                    category.minPrice !== null
                                                        ? "rounded border border-[var(--primary)]/30 bg-[var(--primary)]/8 px-3 py-2 text-sm font-medium tracking-wide text-neutral-900"
                                                        : category.hasProducts
                                                            ? "rounded border border-[var(--tertiary)]/30 bg-[var(--tertiary)]/8 px-3 py-2 text-sm font-medium tracking-wide text-neutral-900"
                                                            : "rounded border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm font-medium tracking-wide text-neutral-600"
                                                }
                                            >
                                                {category.minPrice !== null ? (
                                                    <span>
                                                        от {formatPrice(category.minPrice)} ₽ / шт
                                                    </span>
                                                ) : category.hasProducts ? (
                                                    <span>Цена по запросу</span>
                                                ) : (
                                                    <span>Нет товаров — ассортимент формируется</span>
                                                )}
                                            </div>
                                            <Button
                                                asChild
                                                className="w-full rounded-none bg-[var(--primary)] px-3 py-2 text-sm tracking-wide hover:bg-[var(--primary)]/90"
                                            >
                                                <Link href={categoryQuery}>
                                                    Перейти в каталог
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="text-center mt-4">
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="rounded-none tracking-wide border-neutral-400 hover:bg-neutral-900 hover:text-white"
                        >
                            <Link href="/products">
                                Посмотреть всю продукцию
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-neutral-900 text-white border-t border-neutral-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4 heading">
                        Нужна консультация?
                    </h2>
                    <p className="text-xl mb-8 text-gray-300">
                        Свяжитесь с нами для расчета стоимости
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            asChild
                            size="lg"
                            className="bg-white text-neutral-800 hover:bg-neutral-200 rounded-none tracking-wide"
                        >
                            <a
                                href={phoneTel ? `tel:${phoneTel}` : undefined}
                                className="flex items-center justify-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                Позвонить
                            </a>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            className="bg-white text-neutral-800 hover:bg-neutral-200 rounded-none tracking-wide"
                        >
                            <Link
                                href="/contacts"
                                className="flex items-center justify-center"
                            >
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                Написать
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
