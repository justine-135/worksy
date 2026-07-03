import { upload } from "@vercel/blob/client";

import { buildUserAvatarPath, validateUserAvatarFile } from "@/lib/blob/userAvatar";

export default async function uploadAvatar({
  file,
  userId,
}: {
  file: File;
  userId: string;
}) {
  const validationError = validateUserAvatarFile(file);

  if (validationError) {
    throw new Error(validationError);
  }

  const pathname = buildUserAvatarPath({ userId, fileName: file.name });

  return upload(pathname, file, {
    access: "public",
    contentType: file.type,
    handleUploadUrl: "/api/user/avatar",
    clientPayload: JSON.stringify({ userId }),
  });
}
