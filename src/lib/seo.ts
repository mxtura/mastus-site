import type { Metadata } from "next";
import { URLS } from "./constants";

const SITE_NAME = "Laddex";
const DEFAULT_DESCRIPTION =
    "Полимер-песчаные люки, опорные кольца и инженерные решения от Laddex со складской наличием и консультацией специалистов.";

type OpenGraphType =
    | "website"
    | "article"
    | "profile"
    | "book"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";

interface BuildMetadataOptions {
    title?: string | null;
    description?: string | null;
    path?: string;
    ogImage?: string | null;
    type?: string | null;
}

const truncate = (value: string, maxLength: number) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1).trim()}…`;
};

export const normalizeText = (raw: string | null | undefined): string | null => {
    if (!raw) return null;

    const withoutHtml = raw.replace(/<[^>]*>/g, " ");
    const withoutMd = withoutHtml
        .replace(/[#*_`>\[\]]+/g, " ")
        .replace(/\r?\n+/g, " ")
        .replace(/\s{2,}/g, " ");

    const cleaned = withoutMd.trim();
    return cleaned.length ? cleaned : null;
};

export function buildMetadata({
    title,
    description,
    path,
    ogImage,
    type = "website",
}: BuildMetadataOptions): Metadata {
    const allowedOpenGraphTypes = new Set<OpenGraphType>([
        "website",
        "article",
        "profile",
        "book",
        "music.song",
        "music.album",
        "music.playlist",
        "music.radio_station",
        "video.movie",
        "video.episode",
        "video.tv_show",
        "video.other",
    ]);

    const resolvedType: OpenGraphType = type && allowedOpenGraphTypes.has(type as OpenGraphType)
        ? (type as OpenGraphType)
        : "website";

    const siteUrl = URLS.main;
    const pageUrl = path ? new URL(path.replace(/^\//, ""), siteUrl).toString() : siteUrl;

    const normalizedTitle = title?.trim();
    const pageTitle = normalizedTitle ? `${normalizedTitle} | ${SITE_NAME}` : SITE_NAME;

    const normalizedDescription = normalizeText(description) ?? DEFAULT_DESCRIPTION;
    const summary = truncate(normalizedDescription, 160);

    const images = (() => {
        if (!ogImage) return undefined;
        try {
            const imageUrl = new URL(ogImage, URLS.main).toString();
            return [{ url: imageUrl }];
        } catch {
            return undefined;
        }
    })();

    return {
        title: pageTitle,
        description: summary,
        alternates: {
            canonical: pageUrl,
        },
        openGraph: {
            title: pageTitle,
            description: summary,
            url: pageUrl,
            siteName: SITE_NAME,
            type: resolvedType,
            locale: "ru_RU",
            images,
        },
        twitter: {
            card: "summary_large_image",
            title: pageTitle,
            description: summary,
            images: images?.map(image => image.url),
        },
    };
}
