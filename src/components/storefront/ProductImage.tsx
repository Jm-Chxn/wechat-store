"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  className?: string;
  rounded?: "lg" | "xl" | "2xl" | "none";
}

/**
 * Next.js Image wrapper that falls back to a warm gradient if the network
 * image fails — important because the demo runs against external Unsplash URLs
 * that may occasionally fail to load.
 */
export function ProductImage({
  src,
  alt,
  className,
  rounded = "2xl",
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

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      onError={() => setErrored(true)}
      className={cn(
        "object-cover img-fallback",
        radius,
        className,
      )}
    />
  );
}
