"use client";

import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";

import CustomButton from "@/components/common/custom/CustomButton";

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loadingLabel = "Deleting",
  isPending = false,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loadingLabel?: string;
  isPending?: boolean;
}) {
  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
          </Modal.Header>
          <Modal.Body className="p-1">
            <p className="text-sm text-default-600">{description}</p>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <CustomButton
              type="button"
              variant="danger"
              title={confirmLabel}
              loadingTitle={loadingLabel}
              isPending={isPending}
              onClick={onConfirm}
            />
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
