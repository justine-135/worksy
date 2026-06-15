import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import {
  Input,
  Label,
  TextField,
  ListBox,
  Select,
  Form,
  toast,
} from "@heroui/react";
import { BiPlus } from "react-icons/bi";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import TiptapEditor from "@/components/fields/TiptapEditor";
import { useState } from "react";
import useCreateTaskMutation from "@/hooks/task/useCreateTask";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateTaskInput,
  createTaskSchema,
} from "@/lib/validations/createTask.schema";
import CustomButton from "@/components/button/CustomButton";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/store/session.store";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";

export default function AddTaskModal({
  projectId,
  taskBoardID,
}: {
  projectId?: string | null;
  taskBoardID: string;
}) {
  const { data } = useGetProjectMembers({ projectId });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [description, setDescription] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);

  const { invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    userId,
    queryClient,
  );

  const { mutation } = useCreateTaskMutation({
    invalidateTasks: invalidateTaskBoards,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      reset();
      setDescription("");
    }
  };

  const onSubmit = (data: CreateTaskInput) => {
    if (!projectId) return;
    mutation.mutate(
      {
        ...data,
        description,
        priority: "low",
        taskBoardId: taskBoardID,
        assignees: selectedAssignees,
        projectId,
      },
      {
        onSuccess: () => {
          reset();
          toast("Task board is created");
          setIsOpen(!isOpen);
        },
        onError: () => {
          reset();
          toast.danger("Task not created");
        },
      },
    );
  };

  return (
    <Modal>
      <Button
        className="px-1 h-5"
        variant="tertiary"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BiPlus scale={2} />
      </Button>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">Add Task</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="space-y-4 p-1">
                <TextField>
                  <Label>Title</Label>
                  <Input placeholder="Enter title" {...register("title")} />
                  {errors.title && <p>{errors.title.message}</p>}
                </TextField>
                <Select
                  fullWidth
                  placeholder="Select assignees"
                  selectionMode="multiple"
                  value={selectedAssignees}
                  onChange={(keys) => setSelectedAssignees(keys as string[])}
                >
                  <Label>Assignees</Label>
                  <Select.Trigger className="SelectTriggerAssignees">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox selectionMode="multiple">
                      {data.map((member) => (
                        <ListBox.Item
                          id={member.id}
                          key={member.id}
                          textValue={member.name}
                          className="flex items-center gap-2"
                        >
                          {member.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <TextField>
                  <Label>Description</Label>
                  <TiptapEditor
                    users={data}
                    value={description}
                    onChange={setDescription}
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  className="font-semibold"
                  title="Create"
                  isPending={mutation.isPending}
                  loadingTitle="Creating"
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
