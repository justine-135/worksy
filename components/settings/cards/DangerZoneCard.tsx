"use client";

import { toast } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { useState } from "react";

import CustomButton from "@/components/common/custom/CustomButton";
import SettingsSection from "@/components/settings/SettingsSection";
import { useDeleteProject } from "@/hooks/project/useDeleteProject";
import { ProjectDetailDTO } from "@/types/project.dto";

export default function DangerZoneCard({
  project,
}: {
  project: ProjectDetailDTO;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, isPending } = useDeleteProject(project.id);

  const handleDelete = () => {
    mutate(undefined, {
      onSuccess: () => toast("Project deleted"),
      onError: (error) =>
        toast.danger(
          error instanceof Error ? error.message : "Failed to delete project",
        ),
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

      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog aria-label="Delete project confirmation">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">
                Delete “{project.title}”?
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-1">
              <p className="text-sm text-muted">
                All boards, tasks, members, roles, and activity for this project
                will be permanently deleted. This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer className="flex justify-end gap-2">
              <Button variant="tertiary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <CustomButton
                type="button"
                title="Delete project"
                loadingTitle="Deleting"
                isPending={isPending}
                className="bg-danger text-white"
                onClick={handleDelete}
              />
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </SettingsSection>
  );
}
