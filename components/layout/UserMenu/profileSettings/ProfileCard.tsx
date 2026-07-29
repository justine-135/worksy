"use client";

import { Form, Input, Label, TextField } from "@heroui/react";

import CustomButton from "@/components/common/custom/CustomButton";
import FieldError from "@/components/common/FieldError";
import ImageDropZone from "@/components/common/ImageDropZone";
import { useGetUserProfile } from "@/hooks/user/useGetUserProfile";
import { useProfileForm } from "@/hooks/user/useProfileForm";
import {
  formatFileSize,
  USER_AVATAR_MAX_SIZE_BYTES,
} from "@/lib/blob/userAvatar";

export default function ProfileCard() {
  const { data: profile, isLoading } = useGetUserProfile();

  const { register, errors, avatarFile, setAvatarFile, submit, isSubmitting } =
    useProfileForm(profile);

  if (isLoading) return "loading";

  return (
    <Form onSubmit={submit} className="space-y-4">
      <div className="flex items-center flex-col gap-4">
        <ImageDropZone
          value={avatarFile}
          onChange={setAvatarFile}
          previewUrl={profile?.image}
          label={undefined}
          description={`Optional. JPG, PNG, or WEBP up to ${formatFileSize(
            USER_AVATAR_MAX_SIZE_BYTES,
          )}.`}
          buttonStyle={{
            width: "150px",
            height: "150px",
            borderRadius: "100%",
          }}
        />
        <div className="flex w-full gap-4">
          <TextField className="w-full">
            <Label>Display name</Label>
            <Input placeholder="Your name" {...register("name")} />
            <FieldError message={errors.name?.message} />
          </TextField>
        </div>
      </div>
      <div className="flex">
        <CustomButton
          title="Save profile"
          loadingTitle="Saving"
          isPending={isSubmitting}
          className="ml-auto"
        />
      </div>
    </Form>
  );
}
