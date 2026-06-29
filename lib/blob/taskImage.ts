import { z } from "zod";

import { formatFileSize } from "@/lib/blob/projectImage";

export const TASK_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const TASK_IMAGE_ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
] as const;

export const TASK_IMAGE_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const taskImageUploadPayloadSchema = z.object({
  userId: z.string().min(1),
});

export function validateTaskImageFile(file: File) {
  if (
    !TASK_IMAGE_ALLOWED_TYPES.includes(
      file.type as (typeof TASK_IMAGE_ALLOWED_TYPES)[number],
    )
  ) {
    return "Upload a JPG, PNG, WEBP, or GIF image.";
  }

  if (file.size > TASK_IMAGE_MAX_SIZE_BYTES) {
    return `Image must be ${formatFileSize(TASK_IMAGE_MAX_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function buildTaskImagePath({
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

  const finalBaseName = safeBaseName || "task-image";

  return `tasks/descriptions/${userId}/${finalBaseName}${extension}`;
}

export function isValidTaskImagePath(pathname: string, userId: string) {
  if (!pathname.startsWith(`tasks/descriptions/${userId}/`)) {
    return false;
  }

  return TASK_IMAGE_ALLOWED_EXTENSIONS.some((extension) =>
    pathname.toLowerCase().endsWith(extension),
  );
}

function getSafeExtension(fileName: string) {
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();

  if (
    TASK_IMAGE_ALLOWED_EXTENSIONS.includes(
      extension as (typeof TASK_IMAGE_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return extension;
  }

  return ".png";
}
