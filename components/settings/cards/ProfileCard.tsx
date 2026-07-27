"use client";

import { Form, Input, Label, TextField } from "@heroui/react";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import FieldError from "@/components/common/FieldError";
import ImageDropZone from "@/components/common/ImageDropZone";
import SettingsSection from "@/components/settings/SettingsSection";
import { useProfileForm } from "@/hooks/user/useProfileForm";
import {
  formatFileSize,
  USER_AVATAR_MAX_SIZE_BYTES,
} from "@/lib/blob/userAvatar";
import { UserProfileDTO } from "@/types/user.dto";

export default function ProfileCard({ profile }: { profile: UserProfileDTO }) {
  const { register, errors, avatarFile, setAvatarFile, submit, isSubmitting } =
    useProfileForm(profile);

  return (
    <SettingsSection
      title="Profile"
      description="Your name and avatar are visible to your project members."
    >
      <Form onSubmit={submit} className="space-y-4">
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
          <FieldError message={errors.name?.message} />
        </TextField>

        <CustomButton
          title="Save profile"
          loadingTitle="Saving"
          isPending={isSubmitting}
        />
      </Form>
    </SettingsSection>
  );
}
