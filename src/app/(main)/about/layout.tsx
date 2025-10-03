import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent, type AboutContent } from "@/lib/content";
import { buildMetadata, normalizeText } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const about = (await getContent("ABOUT")) as AboutContent;

  const intro = normalizeText(about.intro);
  const company = normalizeText(about.companyText);
  const description = intro ?? company ?? undefined;

  const ogImage = Array.isArray(about.factoryImages) && about.factoryImages.length
    ? about.factoryImages[0]
    : null;

  return buildMetadata({
    title: "О компании",
    description,
    path: "/about",
    ogImage,
    type: "article",
  });
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
