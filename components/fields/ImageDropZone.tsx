"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FiImage, FiUploadCloud } from "react-icons/fi";

interface ImageDropZoneProps {
  id?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  previewUrl?: string | null;
  label?: string;
  description?: string;
  className?: string;
}

export default function ImageDropZone({
  id,
  value = null,
  onChange,
  previewUrl,
  label = "Project icon",
  description = "Drop an image here or browse from your device.",
  className,
}: ImageDropZoneProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const objectUrl = useMemo(() => {
    if (!value) {
      return null;
    }

    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const activePreview = objectUrl ?? previewUrl ?? null;
  const showOverlay = Boolean(activePreview) && (isHovered || isDragging);

  const selectFile = (fileList: FileList | null) => {
    const nextFile = fileList?.[0];

    if (!nextFile || !nextFile.type.startsWith("image/")) {
      return;
    }

    onChange?.(nextFile);
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        id={inputId}
        accept="image/*"
        className="sr-only"
        type="file"
        onChange={(event) => {
          selectFile(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-800">{label}</p>
        </div>

        <button
          type="button"
          onClick={openPicker}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (
              event.currentTarget.contains(event.relatedTarget as Node | null)
            ) {
              return;
            }
            setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files);
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={[
            "group relative flex h-52 w-full justify-center overflow-hidden border border-dashed transition-all duration-200",

            isDragging
              ? "scale-[1.01] border-blue-500 bg-blue-50 shadow-[0_20px_50px_-24px_rgba(37,99,235,0.45)]"
              : "",
          ].join(" ")}
        >
          {activePreview ? (
            <>
              {/* Plain img keeps object URL previews simple for local files. */}
              <Image
                alt="Selected project icon preview"
                className="h-full w-full object-cover"
                src={activePreview}
                fill
                unoptimized
              />
              <div
                className={[
                  "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/55 px-6 text-center text-white transition-opacity duration-200",
                  showOverlay ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                <FiUploadCloud className="size-7" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    {isDragging ? "Drop file here" : "Upload a new image"}
                  </p>
                  <p className="text-xs text-white/75">
                    PNG, JPG, WEBP, or SVG
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="pointer-events-none flex max-w-xs flex-col items-center gap-4 px-6 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-white/90 text-slate-700 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)]">
                {isDragging ? (
                  <FiUploadCloud className="size-7 text-blue-600" />
                ) : (
                  <FiImage className="size-7" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  {isDragging ? "Drop file here" : "Drag and drop your image"}
                </p>
                <p className="text-xs leading-5 text-slate-500">
                  {description}
                </p>
              </div>

              <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                Choose image
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
