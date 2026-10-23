"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const isDataUrl = (val?: string | null) =>
    typeof val === "string" && (val.startsWith("data:") || val.startsWith("blob:"));

  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (!src || typeof src !== "string" || !src.trim()) {
      return fallbackSrc;
    }
    return src;
  });

  const [hasError, setHasError] = useState(false);
  // Data URLs are already local in memory, so mark loaded immediately
  const [loaded, setLoaded] = useState<boolean>(() => {
    if (!src || typeof src !== "string" || !src.trim()) return true;
    return isDataUrl(src);
  });

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src || typeof src !== "string" || !src.trim()) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setLoaded(true);
    } else {
      setCurrentSrc(src);
      setHasError(false);
      setLoaded(isDataUrl(src));
    }
  }, [src, fallbackSrc]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [currentSrc]);

  const handleError = () => {
    if (!hasError && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
      setLoaded(true);
    }
  };

  const isCurrentData = isDataUrl(currentSrc);

  return (
    <div className={`${fill ? "absolute inset-0" : "relative"} h-full w-full overflow-hidden`}>
      {/* Skeleton Shimmer while loading */}
      {!loaded && !isCurrentData && (
        <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-navy-100/50 via-navy-50 to-navy-100/50" />
      )}

      {isCurrentData ? (
        // Standard img tag for data URLs ensures 100% reliable rendering without Next.js optimization issues
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt || ""}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${className} ${fill ? "h-full w-full object-cover" : ""} transition-opacity duration-200 ${
            loaded ? "opacity-100" : "opacity-90"
          }`}
        />
      ) : (
        <Image
          ref={imgRef}
          src={currentSrc}
          alt={alt || ""}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          unoptimized={true}
          onLoad={() => setLoaded(true)}
          onError={handleError}
          className={`${className} transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
          {...props}
        />
      )}
    </div>
  );
}
