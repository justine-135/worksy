import { Modal } from "@heroui/react/modal";

import SettingsTabs from "./SettingsTabs";

export default function GeneralSettingModal({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
}) {
  if (!isOpen) return;

  return (
    <>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Settings</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4 p-1">
              <SettingsTabs />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
