"use client";

import { Form, Typography } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import TiptapEditor from "@/components/common/TiptapEditor";
import { EActivityLog } from "@/enum/activityLog.enum";
import useCreateComment from "@/hooks/activity/useCreateComment";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import {
  CreateCommentInput,
  createCommentSchema,
} from "@/lib/validations/createComment.schema";
import { UserResponseDTO } from "@/types/user.dto";

interface CommentFormProps {
  projectId?: string;
  taskId?: string;
  currentUser: Omit<UserResponseDTO, "id">;
}

const CommentForm = ({ projectId, taskId, currentUser }: CommentFormProps) => {
  const { mutation } = useCreateComment({ taskId });
  const { showSuccess, showError } = useApiMessage();
  const [editorKey, setEditorKey] = useState(0);

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
  });

  const onSubmit = (data: CreateCommentInput) => {
    if (!projectId || !taskId || !data) return;

    mutation.mutate(
      {
        ...data,
        taskId,
        projectId,
        type: EActivityLog.COMMENT,
      },
      {
        onSuccess: (result) => {
          reset();
          setValue("value", "");
          setEditorKey((k) => k + 1);
          showSuccess(result);
        },
        onError: (error) => {
          reset();
          showError(error);
        },
      },
    );
  };

  return (
    <div className="flex gap-4 mt-8">
      <CustomAvatar
        avatarProps={{ className: "size-10" }}
        avatarImageProps={{
          src: currentUser.image || "",
          alt: currentUser.name,
        }}
        avatarFallbackProps={{ className: "text-xs" }}
        fallback={currentUser.name || ""}
      />
      <Form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col space-y-6 w-full">
          <Typography.Heading level={6} className="mt-2">
            Add comment
          </Typography.Heading>
          <TiptapEditor
            key={editorKey}
            onChange={(e) => {
              setValue("value", e);
            }}
          />
          {errors.value && <p>{errors.value.message}</p>}
          <CustomButton
            title="Comment"
            loadingTitle="Commenting"
            type="submit"
            isPending={mutation.isPending}
            className="ml-auto"
          />
        </div>
      </Form>
    </div>
  );
};

export default CommentForm;
