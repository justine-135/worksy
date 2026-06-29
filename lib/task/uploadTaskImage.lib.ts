import { upload } from "@vercel/blob/client";

import { buildTaskImagePath, validateTaskImageFile } from "@/lib/blob/taskImage";

export default async function uploadTaskImage({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) {
  const validationError = validateTaskImageFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const pathname = buildTaskImagePath({
    userId,
    fileName: file.name,
  });

  return upload(pathname, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/task/image",
    clientPayload: JSON.stringify({ userId }),
  });
}
