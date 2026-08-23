"use client";

import { useEffect, useState } from "react";

const PLACEHOLDER = "/images/placeholder.svg";

type SafeImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
};

export default function SafeImage({ src, alt, className, loading }: SafeImageProps) {
  const [current, setCurrent] = useState(src || PLACEHOLDER);

  useEffect(() => {
    setCurrent(src || PLACEHOLDER);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (current !== PLACEHOLDER) setCurrent(PLACEHOLDER);
      }}
    />
  );
}
