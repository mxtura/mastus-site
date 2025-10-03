"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { MarkdownText } from "@/components/MarkdownText";
import { cn } from "@/lib/utils";

const CLAMP_MAX_HEIGHT = 45; // px ~3 lines with 1.5 line-height at 13px

interface CategoryDescriptionProps {
  content?: string | null;
  className?: string;
  fallback?: ReactNode;
}

export function CategoryDescription({
  content,
  className,
  fallback = (
    <p className="text-neutral-500">
      Описание появится позже — свяжитесь с менеджером для консультации.
    </p>
  ),
}: CategoryDescriptionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);

  const trimmed = content?.trim() ?? "";

  useEffect(() => {
    setExpanded(false);
    setHasMeasured(false);
    setCanExpand(false);
  }, [trimmed]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      if (!el) return;
      const maxHeight = CLAMP_MAX_HEIGHT;
      const needs = el.scrollHeight > maxHeight + 4;
      setHasMeasured(true);
      setCanExpand(needs);
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        update();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }

    const handleResize = () => update();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [expanded, trimmed]);

  if (!trimmed) {
    return (
      <div
        className={cn("text-[13px] leading-relaxed text-neutral-600 break-words", className)}
        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
      >
        {fallback}
      </div>
    );
  }

  const shouldClamp = !expanded && (!hasMeasured || canExpand);

  return (
    <div
      className={cn(
        "relative text-[13px] leading-relaxed text-neutral-600 break-words",
        className,
      )}
      style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
    >
      <div
        ref={contentRef}
        className={cn(
          "space-y-1.5",
          canExpand ? "pr-7" : undefined,
        )}
        style={
          shouldClamp
            ? {
                maxHeight: CLAMP_MAX_HEIGHT,
                overflow: "hidden",
              }
            : undefined
        }
      >
        <MarkdownText
          content={trimmed}
          baseClassName="space-y-1.5 text-[13px] leading-relaxed text-neutral-600 break-words"
          className="break-words"
        />
      </div>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-500 shadow-sm transition-colors hover:border-neutral-400 hover:text-neutral-800"
          aria-expanded={expanded}
          aria-label={expanded ? "Свернуть описание" : "Показать полное описание"}
        >
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      )}
    </div>
  );
}
