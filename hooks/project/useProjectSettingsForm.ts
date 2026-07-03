"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { DEFAULT_TASK_PRIORITY } from "@/constant/taskPriority";
import { ETaskPriority } from "@/enum/taskPriority.enum";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import { useUpdateProjectSettings } from "@/hooks/project/useUpdateProjectSettings";
import {
  UpdateProjectSettingsInput,
  updateProjectSettingsSchema,
} from "@/lib/validations/updateProjectSettings.schema";
import { ProjectDetailDTO } from "@/types/project.dto";

/**
 * Encapsulates the Project settings form's behaviour so `ProjectCard` only has
 * to render fields (SRP). The default-priority select is part of the same
 * react-hook-form instance via `control`, so the form is the single source of
 * truth — there's no separate `useState` to keep in sync.
 */
export function useProjectSettingsForm(project: ProjectDetailDTO) {
  const { mutateAsync, isPending } = useUpdateProjectSettings(project.id);
  const { showSuccess, showError } = useApiMessage();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectSettingsInput>({
    resolver: zodResolver(updateProjectSettingsSchema),
    values: {
      title: project.title,
      description: project.description ?? "",
      defaultTaskPriority:
        (project.defaultTaskPriority as ETaskPriority) ?? DEFAULT_TASK_PRIORITY,
    },
  });

  const submit = handleSubmit(async (data) => {
    try {
      await mutateAsync({
        title: data.title,
        description: data.description ?? null,
        defaultTaskPriority: data.defaultTaskPriority,
      });
      showSuccess("Project settings updated");
    } catch (error) {
      showError(error, "Failed to update project");
    }
  });

  return {
    register,
    control,
    errors,
    submit,
    isSubmitting: isPending,
  };
}

export default useProjectSettingsForm;
