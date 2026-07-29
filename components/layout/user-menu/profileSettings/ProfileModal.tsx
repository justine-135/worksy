import { Modal } from "@heroui/react/modal";

import ProfileCard from "@/components/layout/user-menu/profileSettings/ProfileCard";

export default function ProfileModal({
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
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Profile</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4 p-1">
              <p>Your profile helps people recognize you in group chats.</p>
              <ProfileCard />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
