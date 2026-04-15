import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import { TextArea, Input, Label, TextField } from "@heroui/react";
import { BiPlus } from "react-icons/bi";

export default function AddProjectModal() {
  return (
    <Modal>
      <Button
        variant="ghost"
        className="flex flex-col items-center justify-center h-42 w-51.25 gap-2 bg-gray-100 hover:cursor-pointer hover:bg-gray-200"
      >
        <BiPlus size={40} fill="gray" />
      </Button>
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">
                Add Project
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="space-y-4 p-1">
              <TextField>
                <Label>Title</Label>
                <Input placeholder="Enter title" />
              </TextField>
              <TextField>
                <Label>Description</Label>
                <TextArea placeholder="Enter description" />
              </TextField>
            </Modal.Body>
            <Modal.Footer>
              <Button className="font-semibold">Create</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
