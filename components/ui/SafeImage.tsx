"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = "/placeholder.png";

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className = "",
  fill,
  width,
  height,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!src || typeof src !== "string" || !src.trim()) {
      return fallbackSrc;
    }
    return src;
  });
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src || typeof src !== "string" || !src.trim()) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setLoaded(true);
    } else {
      setCurrentSrc(src);
      setHasError(false);
      setLoaded(false);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setLoaded(true);
    }
  };

  const isDataUrl = typeof currentSrc === "string" && (currentSrc.startsWith("data:") || currentSrc.startsWith("blob:"));

  return (
    <div className={`relative h-full w-full overflow-hidden ${fill ? "absolute inset-0" : ""}`}>
      {/* Skeleton Shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-navy-100/50 via-navy-50 to-navy-100/50" />
      )}

      {isDataUrl ? (
        // Standard img tag for data URLs ensures 100% reliable rendering without Next.js optimization issues
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={currentSrc}
          alt={alt || ""}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${className} ${fill ? "h-full w-full object-cover" : ""} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <Image
          src={currentSrc}
          alt={alt || ""}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          unoptimized={true}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${className} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          {...props}
        />
      )}
    </div>
  );
}
