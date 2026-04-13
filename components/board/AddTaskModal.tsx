import { Button } from "@heroui/react/button";
import { Modal } from "@heroui/react/modal";
import {
  TextArea,
  Input,
  Label,
  TextField,
  ListBox,
  Select,
} from "@heroui/react";
import { BiPlus } from "react-icons/bi";

export default function AddTaskModal() {
  return (
    <Modal>
      <Button className="px-1 h-5" variant="tertiary">
        <BiPlus scale={2} />
      </Button>{" "}
      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="font-semibold">Add Task</Modal.Heading>
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
              <Select
                className="w-[256px]"
                placeholder="Select countries"
                selectionMode="multiple"
              >
                <Label>Select assignee</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox selectionMode="multiple">
                    <ListBox.Item id="argentina" textValue="Argentina">
                      Argentina
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="venezuela" textValue="Venezuela">
                      Venezuela
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="japan" textValue="Japan">
                      Japan
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="france" textValue="France">
                      France
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="italy" textValue="Italy">
                      Italy
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="spain" textValue="Spain">
                      Spain
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="thailand" textValue="Thailand">
                      Thailand
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="new-zealand" textValue="New Zealand">
                      New Zealand
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                    <ListBox.Item id="iceland" textValue="Iceland">
                      Iceland
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
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
