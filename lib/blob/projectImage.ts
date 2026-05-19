import { z } from "zod";

export const PROJECT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

export const PROJECT_IMAGE_ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".svg",
] as const;

export const PROJECT_IMAGE_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const projectImageUploadPayloadSchema = z.object({
  userId: z.string().min(1),
});

export function validateProjectImageFile(file: File) {
  if (
    !PROJECT_IMAGE_ALLOWED_TYPES.includes(
      file.type as (typeof PROJECT_IMAGE_ALLOWED_TYPES)[number],
    )
  ) {
    return "Upload a JPG, PNG, WEBP, or SVG image.";
  }

  if (file.size > PROJECT_IMAGE_MAX_SIZE_BYTES) {
    return `Image must be ${formatFileSize(PROJECT_IMAGE_MAX_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function buildProjectImagePath({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) {
  const extension = getSafeExtension(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "");
  const safeBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  const finalBaseName = safeBaseName || "project-icon";

  return `projects/icons/${userId}/${finalBaseName}${extension}`;
}

export function isValidProjectImagePath(pathname: string, userId: string) {
  if (!pathname.startsWith(`projects/icons/${userId}/`)) {
    return false;
  }

  return PROJECT_IMAGE_ALLOWED_EXTENSIONS.some((extension) =>
    pathname.toLowerCase().endsWith(extension),
  );
}

export function formatFileSize(sizeInBytes: number) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(0)} KB`;
  }

  return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getSafeExtension(fileName: string) {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  if (
    PROJECT_IMAGE_ALLOWED_EXTENSIONS.includes(
      extension as (typeof PROJECT_IMAGE_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return extension;
  }

  return ".png";
}
