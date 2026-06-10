"use client";

import * as React from "react";
import { ImageOff, Loader2, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api/client";

interface Props {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

type UploadState = "idle" | "uploading" | "error";

export function ImageUploadField({ value, onChange, disabled }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = React.useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [previewSrc, setPreviewSrc] = React.useState(value);

  // Keep preview in sync when value is set externally (e.g. editing existing product)
  React.useEffect(() => {
    setPreviewSrc(value);
  }, [value]);

  async function handleFile(file: File) {
    setUploadState("uploading");
    setErrorMsg("");

    // Show instant local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewSrc(localUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await apiFetch<{ url: string }>(
        "/api/v1/admin/products/upload",
        { method: "POST", body: formData, timeoutMs: 30_000 },
      );
      onChange(result.url);
      setPreviewSrc(result.url);
      setUploadState("idle");
    } catch (err) {
      setUploadState("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
      setPreviewSrc(value); // revert preview
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function clearImage() {
    onChange("");
    setPreviewSrc("");
    setUploadState("idle");
    setErrorMsg("");
  }

  const isUploading = uploadState === "uploading";

  return (
    <div className="space-y-2">
      {/* Drop zone / preview */}
      {previewSrc ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt="preview"
            className="h-24 w-24 rounded-xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = "0.4";
            }}
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
          {!isUploading && (
            <button
              type="button"
              onClick={clearImage}
              disabled={disabled}
              className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white shadow"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !isUploading && !disabled && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className={[
            "flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1",
            "rounded-xl border-2 border-dashed border-border text-muted-foreground",
            "transition-colors hover:border-primary hover:text-primary",
            isUploading ? "pointer-events-none opacity-60" : "",
          ].join(" ")}
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <UploadCloud className="h-6 w-6" />
              <span className="text-xs">Click or drag to upload</span>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
        disabled={disabled || isUploading}
      />

      {/* Error message */}
      {uploadState === "error" && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <ImageOff className="h-3 w-3" />
          {errorMsg}
        </p>
      )}

      {/* URL fallback toggle */}
      <button
        type="button"
        onClick={() => setShowUrlInput((v) => !v)}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        {showUrlInput ? "Hide URL input" : "Or paste a URL instead"}
      </button>

      {showUrlInput && (
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setPreviewSrc(e.target.value);
          }}
          placeholder="https://..."
          disabled={disabled || isUploading}
        />
      )}
    </div>
  );
}
