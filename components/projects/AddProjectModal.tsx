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
import CustomButton from "../button/CustomButton";

interface Props {
  userId?: string | null;
}

export default function AddProjectModal({ userId }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { mutation } = useCreateProjectMutation({ userId });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
  });

  const onSubmit = (data: CreateProjectInput) => {
    if (!userId) {
      toast("User not authenticated");
      return;
    }

    mutation.mutate(
      {
        ...data,
        ownerId: userId,
      },
      {
        onSuccess: () => {
          reset();
          setIsOpen(false);
          toast("Project is created");
        },
      },
    );
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
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
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
                  <TextArea {...register("content")} placeholder="(Optional)" />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  isPending={mutation.isPending}
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
