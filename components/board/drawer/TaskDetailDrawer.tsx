"use client";

import { Card, Drawer, Form, toast, Typography } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import ActivityLog from "@/components/common/ActivityLog";
import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomButton from "@/components/common/custom/CustomButton";
import TiptapEditor from "@/components/common/TiptapEditor";
import { EActivityLog } from "@/enum/activityLog.enum";
import useCreateComment from "@/hooks/activity/useCreateComment";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";
import { useGetUser } from "@/hooks/user/useGetUser";
import {
  CreateCommentInput,
  createCommentSchema,
} from "@/lib/validations/createComment.schema";
import { useSessionStore } from "@/store/session.store";
import { timeAgo } from "@/utils/timeAgo";

const CommentForm = ({
  projectId,
  taskId,
}: {
  projectId?: string;
  taskId?: string;
}) => {
  const userId = useSessionStore((s) => s.userId);
  const { data: currentUser } = useGetUser({ userId });
  const { mutation } = useCreateComment({ taskId });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
  });

  const onSubmit = (data: CreateCommentInput) => {
    console.log(data);

    if (!projectId || !userId || !taskId || !data) return;

    mutation.mutate(
      {
        ...data,
        taskId,
        projectId,
        userId,
        type: EActivityLog.COMMENT,
      },
      {
        onSuccess: () => {
          reset();
          toast("Task board is created");
        },
        onError: () => {
          reset();
          toast.danger("Task not created");
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
            onChange={(e) => {
              setValue("value", e);
            }}
          />
          {errors.value && <p>{errors.value.message}</p>}
          <CustomButton
            title="Submit"
            loadingTitle="Submitting"
            type="submit"
            isPending={mutation.isPending}
            className="ml-auto"
          />
        </div>
      </Form>
    </div>
  );
};

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const createdBy = {
    src: data?.createdBy.user.image,
    name: data?.createdBy.user.name || "",
  };

  if (isLoading) return "Loading";

  return (
    <div>
      <Drawer>
        <span
          onClick={handleOpenChange}
          className="hover:bg-transparent hover:underline cursor-pointer"
        >
          {title}
        </span>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="min-w-225">
              <Drawer.Header>{title}</Drawer.Header>
              <Drawer.Body className="max-h-[75vh] min-h-[85vh] pt-6">
                {/* <TiptapEditor
                  users={data}
                  value={data?.description || ""}
                  onChange={setDescription}
                /> */}
                <div className="flex gap-4">
                  <CustomAvatar
                    avatarProps={{ className: "size-10" }}
                    avatarImageProps={{
                      src: createdBy.src || "",
                      alt: createdBy.name,
                    }}
                    avatarFallbackProps={{ className: "text-xs" }}
                    fallback={createdBy.name}
                  />
                  <div className="flex flex-col w-full">
                    <div className="space-x-1">
                      <span className="text-sm font-semibold text-gray-900 hover:underline cursor-pointer">
                        {createdBy.name}
                      </span>
                      <span>opened {timeAgo(data?.createdAt)}</span>
                    </div>
                    <Card className="w-full border shadow-xs min-h-75 mt-1">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: data?.description || "",
                        }}
                      />
                    </Card>
                  </div>
                </div>
                <ActivityLog data={data?.activityLog} />
                <CommentForm projectId={data?.projectId} taskId={data?.id} />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
