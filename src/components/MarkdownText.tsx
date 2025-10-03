"use client";

import React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema, type Options as RehypeSanitizeOptions } from "rehype-sanitize";
import { cn } from "@/lib/utils";

type MarkdownTextProps = {
  content?: string | null;
  className?: string;
  components?: Components;
  variant?: "block" | "inline";
  baseClassName?: string;
  as?: React.ElementType;
};

const tableElements = ["table", "thead", "tbody", "tfoot", "tr", "th", "td"] as const;

type SchemaAttributes = NonNullable<RehypeSanitizeOptions["attributes"]>;
type PropertyDefinition = SchemaAttributes[keyof SchemaAttributes] extends Array<infer Def> ? Def : never;

const createAttributeList = (key: string, extras: PropertyDefinition[]): PropertyDefinition[] => {
  const base = defaultSchema.attributes?.[key];
  return [...(Array.isArray(base) ? base : []), ...extras];
};

const markdownSchema: RehypeSanitizeOptions = {
  ...defaultSchema,
  tagNames: Array.from(
    new Set([...(defaultSchema.tagNames || []), ...tableElements])
  ),
  attributes: {
    ...(defaultSchema.attributes || {}),
    a: createAttributeList("a", [
      ["target", "_blank", "_self", "_parent", "_top"],
      ["rel", "nofollow", "noopener", "noreferrer"],
      "className",
    ]),
    code: createAttributeList("code", ["className"]),
    span: createAttributeList("span", ["className"]),
    table: createAttributeList("table", ["className"]),
    thead: createAttributeList("thead", ["className"]),
    tbody: createAttributeList("tbody", ["className"]),
    tfoot: createAttributeList("tfoot", ["className"]),
    tr: createAttributeList("tr", ["className"]),
    th: createAttributeList("th", [
      "className",
      ["align", "left", "right", "center", "justify", "char"],
    ]),
    td: createAttributeList("td", [
      "className",
      ["align", "left", "right", "center", "justify", "char"],
    ]),
  },
};

export function MarkdownText({
  content,
  className,
  components,
  variant = "block",
  baseClassName,
  as,
}: MarkdownTextProps) {
  if (!content || content.trim() === "") return null;

  const resolvedBaseClassName =
    baseClassName !== undefined
      ? baseClassName
      : variant === "inline"
        ? "inline-flex flex-wrap items-baseline gap-x-1 gap-y-0.5 text-inherit"
        : "space-y-3 text-neutral-700";

  const rootClassName = cn(resolvedBaseClassName, className);
  const Element = as ?? (variant === "inline" ? "span" : "div");

  const defaultComponents: Components = {
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a
        {...props}
        className={cn(
          "underline underline-offset-4 text-[var(--primary)] hover:text-[var(--primary)]/80 transition-colors",
          props.className
        )}
        target={(props.target as string) ?? "_blank"}
        rel={(props.rel as string) ?? "noopener noreferrer"}
      />
    ),
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => <li className="leading-relaxed">{children}</li>,
    table: ({ children, className: providedClassName, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto">
        <table
          {...props}
          className={cn(
            "min-w-full border-collapse text-sm border border-neutral-200",
            providedClassName
          )}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead {...props} className={cn("bg-neutral-100 text-neutral-700", className)}>
        {children}
      </thead>
    ),
    tbody: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody {...props} className={cn("divide-y divide-neutral-200", className)}>
        {children}
      </tbody>
    ),
    tr: ({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
      <tr {...props} className={cn("border-b border-neutral-200 last:border-b-0", className)}>
        {children}
      </tr>
    ),
    th: ({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th
        {...props}
        className={cn("px-3 py-2 text-left font-semibold uppercase tracking-wide text-xs text-neutral-600", className)}
      >
        {children}
      </th>
    ),
    td: ({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td {...props} className={cn("px-3 py-2 align-top text-neutral-700", className)}>
        {children}
      </td>
    ),
    p:
      variant === "inline"
        ? ({ children }: { children?: React.ReactNode }) => <span className="leading-relaxed">{children}</span>
        : ({ children }: { children?: React.ReactNode }) => <p className="leading-relaxed text-inherit">{children}</p>,
  };

  return React.createElement(
    Element,
    { className: rootClassName },
    <ReactMarkdown
      components={{
        ...defaultComponents,
        ...(components || {}),
      }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw as unknown,
        [rehypeSanitize as unknown, markdownSchema] as const,
      ] as unknown as import("unified").PluggableList}
    >
      {content}
    </ReactMarkdown>
  );
}
