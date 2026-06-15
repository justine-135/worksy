import { Button } from "@heroui/react/button";
import {
  TextArea,
  Input,
  Label,
  TextField,
  Form,
  toast,
  Modal,
} from "@heroui/react";
import { BiPlus } from "react-icons/bi";
import useCreateProjectMutation from "@/hooks/project/useCreateProjectMutation";
import {
  CreateProjectInput,
  createProjectSchema,
} from "@/lib/validations/createProject.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import CustomButton from "../../button/CustomButton";
import ImageDropZone from "../../fields/ImageDropZone";
import uploadProjectImage from "@/lib/project/uploadProjectImage.lib";
import deleteProjectImage from "@/lib/project/deleteProjectImage.lib";
import {
  PROJECT_IMAGE_MAX_SIZE_BYTES,
  formatFileSize,
} from "@/lib/blob/projectImage";

interface Props {
  userId?: string | null;
}

export default function AddProjectModal({ userId }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [projectImage, setProjectImage] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const { mutation } = useCreateProjectMutation({ userId });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      reset();
      setProjectImage(null);
    }
  };

  const onSubmit = async (data: CreateProjectInput) => {
    if (!userId) {
      toast("User not authenticated");
      return;
    }

    let uploadedImageUrl: string | undefined;

    try {
      if (projectImage) {
        setIsUploadingImage(true);

        const blob = await uploadProjectImage({
          file: projectImage,
          userId,
        });

        uploadedImageUrl = blob.url;
      }

      await mutation.mutateAsync({
        ...data,
        ownerId: userId,
        imageUrl: uploadedImageUrl,
      });

      reset();
      setProjectImage(null);
      setIsOpen(false);
      toast("Project is created");
    } catch (error) {
      if (uploadedImageUrl) {
        try {
          await deleteProjectImage(uploadedImageUrl);
        } catch (cleanupError) {
          console.error(
            "Failed to clean up uploaded project image",
            cleanupError,
          );
        }
      }

      toast(
        error instanceof Error ? error.message : "Failed to create project",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-42 w-51.25 gap-2 bg-gray-100 hover:cursor-pointer hover:bg-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BiPlus size={40} fill="gray" />
      </Button>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Modal.Container>
          <Modal.Dialog aria-label="add project modal">
            <Modal.CloseTrigger />
            <Modal.Header slot="title" aria-label="title">
              Add Project
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <TextField>
                  <Label>Title</Label>
                  <Input
                    {...register("title")}
                    placeholder="e.g: Jira-style App"
                  />
                  {errors.title && <p>{errors.title.message}</p>}
                </TextField>
                <TextField>
                  <Label>Description</Label>
                  <TextArea
                    {...register("description")}
                    placeholder="(Optional)"
                  />
                </TextField>
                <ImageDropZone
                  value={projectImage}
                  onChange={setProjectImage}
                  label="Project icon"
                  description={`Optional. Upload one JPG, PNG, WEBP, or SVG image up to ${formatFileSize(PROJECT_IMAGE_MAX_SIZE_BYTES)}.`}
                />
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  isPending={mutation.isPending || isUploadingImage}
                  loadingTitle="Creating"
                  title="Create"
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
