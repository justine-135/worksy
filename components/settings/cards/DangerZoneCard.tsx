"use client";

import { Button } from "@heroui/react/button";
import { useState } from "react";

import ConfirmModal from "@/components/common/ConfirmModal";
import SettingsSection from "@/components/settings/SettingsSection";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import { useDeleteProject } from "@/hooks/project/useDeleteProject";
import { ProjectDetailDTO } from "@/types/project.dto";

export default function DangerZoneCard({
  project,
}: {
  project: ProjectDetailDTO;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = useDeleteProject(project.id);
  const { showSuccess, showError } = useApiMessage();

  const handleDelete = () => {
    mutate(undefined, {
      onSuccess: () => {
        setIsOpen(false);
        showSuccess("Project deleted");
      },
      onError: (error) => showError(error, "Failed to delete project"),
    });
  };

  return (
    <SettingsSection
      title="Danger zone"
      description="Permanently delete this project and everything in it."
      danger
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          This removes all boards, tasks, members, and activity. This cannot be
          undone.
        </p>
        <Button
          variant="outline"
          className="shrink-0 border-danger/50 text-danger"
          onClick={() => setIsOpen(true)}
        >
          Delete project
        </Button>
      </div>

      <ConfirmModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={handleDelete}
        isPending={isPending}
        title={`Delete "${project.title}"?`}
        description="All boards, tasks, members, roles, and activity for this project will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete project"
        loadingLabel="Deleting"
      />
    </SettingsSection>
  );
}
