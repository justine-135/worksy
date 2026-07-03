import { z } from "zod";

export const USER_AVATAR_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const USER_AVATAR_ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
] as const;

export const USER_AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export const userAvatarUploadPayloadSchema = z.object({
  userId: z.string().min(1),
});

export function validateUserAvatarFile(file: File) {
  if (
    !USER_AVATAR_ALLOWED_TYPES.includes(
      file.type as (typeof USER_AVATAR_ALLOWED_TYPES)[number],
    )
  ) {
    return "Upload a JPG, PNG, or WEBP image.";
  }

  if (file.size > USER_AVATAR_MAX_SIZE_BYTES) {
    return `Image must be ${formatFileSize(USER_AVATAR_MAX_SIZE_BYTES)} or smaller.`;
  }

  return null;
}

export function buildUserAvatarPath({
  userId,
  fileName,
}: {
  userId: string;
  fileName: string;
}) {
  const extension = getSafeExtension(fileName);
  return `avatars/${userId}/avatar${extension}`;
}

export function isValidUserAvatarPath(pathname: string, userId: string) {
  if (!pathname.startsWith(`avatars/${userId}/`)) {
    return false;
  }

  return USER_AVATAR_ALLOWED_EXTENSIONS.some((extension) =>
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
    USER_AVATAR_ALLOWED_EXTENSIONS.includes(
      extension as (typeof USER_AVATAR_ALLOWED_EXTENSIONS)[number],
    )
  ) {
    return extension;
  }

  return ".png";
}
