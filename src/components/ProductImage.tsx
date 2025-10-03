'use client';

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  unoptimized?: boolean;
}

export default function ProductImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  fallbackSrc = "/images/placeholder-product.svg",
  unoptimized,
}: ProductImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(fallbackSrc);
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      unoptimized={
        typeof unoptimized === 'boolean'
          ? unoptimized
          : imageSrc.startsWith('/uploads/') || imageSrc.startsWith('blob:')
      }
    />
  );
}
