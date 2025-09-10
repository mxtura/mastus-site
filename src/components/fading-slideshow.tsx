"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import clsx from "clsx";

export interface SlideshowImage {
  src: string;
  alt?: string;
}

interface FadingSlideshowProps {
  images: SlideshowImage[];
  interval?: number; // ms
  className?: string;
  fadeDuration?: number; // ms
  priorityFirst?: boolean;
}

// Simple fading slideshow (crossfade) without external libs
export function FadingSlideshow({
  images,
  interval = 3500,
  fadeDuration = 600,
  className,
  priorityFirst = false,
}: FadingSlideshowProps) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!images || images.length <= 1) return; // nothing to cycle
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images, interval]);

  return (
    <div className={clsx("relative w-full h-full overflow-hidden", className)}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className={clsx(
            "absolute inset-0 transition-opacity ease-in-out",
            i === index ? "opacity-100" : "opacity-0"
          )}
          style={{ transitionDuration: fadeDuration + "ms" }}
          aria-hidden={i !== index}
        >
          <Image
            src={img.src}
            alt={img.alt || ""}
            fill
            priority={priorityFirst && i === 0}
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-contain p-6 select-none"
          />
        </div>
      ))}
      {/* subtle overlay lines (optional aesthetic) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden="true" />
    </div>
  );
}
