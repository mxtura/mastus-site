import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getContent, type ContactsContent } from "@/lib/content";
import { buildMetadata, normalizeText } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function generateMetadata(): Promise<Metadata> {
  const contacts = (await getContent("CONTACTS")) as ContactsContent;

  const intro = normalizeText(contacts.intro);
  const address = [contacts.addressCityRegion, contacts.addressStreet]
    .map(part => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");

  const descriptionParts: string[] = [];

  if (intro) descriptionParts.push(intro);
  if (address) descriptionParts.push(`Адрес: ${address}`);
  if (contacts.phoneTel) descriptionParts.push(`Телефон: ${contacts.phoneTel}`);
  if (contacts.emailInfo) descriptionParts.push(`Email: ${contacts.emailInfo}`);

  return buildMetadata({
    title: "Контакты",
    description: descriptionParts.join(" • ") || undefined,
    path: "/contacts",
    type: "website",
  });
}

export default function ContactsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
