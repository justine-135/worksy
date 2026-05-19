import {
  buildProjectImagePath,
  validateProjectImageFile,
} from "@/lib/blob/projectImage";
import { upload } from "@vercel/blob/client";

export default async function uploadProjectImage({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) {
  const validationError = validateProjectImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const pathname = buildProjectImagePath({
    userId,
    fileName: file.name,
  });

  return upload(pathname, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/project/image",
    clientPayload: JSON.stringify({ userId }),
  });
}
