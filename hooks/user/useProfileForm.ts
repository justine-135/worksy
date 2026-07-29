"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { useApiMessage } from "@/hooks/common/useApiMessage";
import { useUpdateUserProfile } from "@/hooks/user/useUpdateUserProfile";
import uploadAvatar from "@/lib/user/uploadAvatar.lib";
import {
  UpdateProfileInput,
  updateProfileSchema,
} from "@/lib/validations/updateProfile.schema";
import { useSessionStore } from "@/store/session.store";
import { UserProfileDTO } from "@/types/user.dto";

export function useProfileForm(profile?: UserProfileDTO) {
  const userId = useSessionStore((s) => s.userId);
  const { mutateAsync, isPending } = useUpdateUserProfile();
  const { showSuccess, showError } = useApiMessage();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: profile?.name ?? "", image: profile?.image },
  });

  useEffect(() => {
    if (profile?.name) {
      setValue("name", profile.name);
      console.log(profile.name);
    }
  }, [profile, setValue]);

  const submit = handleSubmit(async (data) => {
    if (!userId) return;

    try {
      let imageUrl = profile?.image ?? null;

      // Upload the newly-picked avatar first so we persist its blob URL, not
      // the stale one, alongside the rest of the profile in a single save.
      if (avatarFile) {
        setIsUploading(true);

        // Remove the previous blob so replacing an avatar doesn't orphan it in
        // storage. Best-effort: a failed cleanup must not block the new upload.
        if (profile?.image) {
          try {
            await fetch("/api/user/avatar", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: profile.image }),
            });
          } catch {
            // Ignore — the old blob will simply linger; the save still proceeds.
          }
        }

        const blob = await uploadAvatar({ file: avatarFile, userId });
        imageUrl = blob.url;
      }

      await mutateAsync({ name: data.name, image: imageUrl });

      setAvatarFile(null);
      showSuccess("Profile updated");
    } catch (error) {
      showError(error, "Failed to update profile");
    } finally {
      setIsUploading(false);
    }
  });

  return {
    register,
    errors,
    avatarFile,
    setAvatarFile,
    submit,
    isSubmitting: isPending || isUploading,
  };
}

export default useProfileForm;
