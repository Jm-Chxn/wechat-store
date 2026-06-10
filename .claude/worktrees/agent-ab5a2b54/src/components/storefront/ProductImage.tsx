"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  rounded?: "lg" | "xl" | "2xl" | "none";
}

/**
 * <img> wrapper that falls back to a warm gradient if the network image fails
 * — important because the demo runs against external Unsplash URLs that may
 * occasionally fail to load.
 */
export function ProductImage({
  src,
  alt,
  className,
  rounded = "2xl",
  ...rest
}: Props) {
  const [errored, setErrored] = React.useState(false);
  const radius =
    rounded === "none"
      ? ""
      : rounded === "lg"
        ? "rounded-lg"
        : rounded === "xl"
          ? "rounded-xl"
          : "rounded-2xl";

  if (errored) {
    return (
      <div
        className={cn(
          "img-fallback flex aspect-square w-full items-center justify-center text-primary/60",
          radius,
          className,
        )}
        aria-label={alt}
      >
        <ImageOff className="h-7 w-7" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setErrored(true)}
      className={cn(
        "h-full w-full object-cover img-fallback",
        radius,
        className,
      )}
      {...rest}
    />
  );
}
