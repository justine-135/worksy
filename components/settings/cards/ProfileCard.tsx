"use client";

import { Form, Input, Label, TextField, toast } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import ImageDropZone from "@/components/common/ImageDropZone";
import SettingsSection from "@/components/settings/SettingsSection";
import { useUpdateUserProfile } from "@/hooks/user/useUpdateUserProfile";
import { formatFileSize, USER_AVATAR_MAX_SIZE_BYTES } from "@/lib/blob/userAvatar";
import uploadAvatar from "@/lib/user/uploadAvatar.lib";
import {
  UpdateProfileInput,
  updateProfileSchema,
} from "@/lib/validations/updateProfile.schema";
import { useSessionStore } from "@/store/session.store";
import { UserProfileDTO } from "@/types/user.dto";

export default function ProfileCard({ profile }: { profile: UserProfileDTO }) {
  const userId = useSessionStore((s) => s.userId);
  const { mutateAsync, isPending } = useUpdateUserProfile();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: { name: profile.name ?? "", image: profile.image },
  });

  const onSubmit = async (data: UpdateProfileInput) => {
    if (!userId) return;

    try {
      let imageUrl = profile.image ?? null;

      if (avatarFile) {
        setIsUploading(true);
        const blob = await uploadAvatar({ file: avatarFile, userId });
        imageUrl = blob.url;
      }

      await mutateAsync({ name: data.name, image: imageUrl });

      setAvatarFile(null);
      toast("Profile updated");
    } catch (error) {
      toast.danger(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SettingsSection
      title="Profile"
      description="Your name and avatar are visible to your project members."
    >
      <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-4">
          <CustomAvatar
            avatarProps={{
              className:
                "size-16 shrink-0 rounded-full border border-border bg-surface-muted",
            }}
            avatarImageProps={{
              src: profile.image || "",
              alt: "Current avatar",
              className: "object-cover",
            }}
            avatarFallbackProps={{ className: "text-base text-muted" }}
            fallback={profile.name || profile.email || "U"}
          />
          <div className="min-w-0 flex-1">
            <ImageDropZone
              value={avatarFile}
              onChange={setAvatarFile}
              previewUrl={profile.image}
              label="Avatar"
              description={`Optional. JPG, PNG, or WEBP up to ${formatFileSize(
                USER_AVATAR_MAX_SIZE_BYTES,
              )}.`}
            />
          </div>
        </div>

        <TextField>
          <Label>Display name</Label>
          <Input placeholder="Your name" {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
          )}
        </TextField>

        <CustomButton
          title="Save profile"
          loadingTitle="Saving"
          isPending={isPending || isUploading}
        />
      </Form>
    </SettingsSection>
  );
}
