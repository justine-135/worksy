import { Permissions } from "@/enum/enum";
import {
  Checkbox,
  CheckboxGroup,
  Description,
  Label,
  Separator,
  Surface,
} from "@heroui/react";

function PermissionItem({ items }: { items: any }) {
  return (
    <CheckboxGroup name="permissions">
      <Label aria-label="Permission page title">{items.page}</Label>
      <Description>Choose all that apply</Description>
      {/* <Separator className="mt-4 w-full" /> */}
      <div className="space-y-4">
        {items.permission.map((item: any) => {
          return (
            <Surface
              variant="secondary"
              className="rounded-xl"
              key={item.title}
            >
              <Checkbox value={item.permission} className="px-4 py-2">
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <Label>{item.title}</Label>
                  <Description>{item.description}</Description>
                </Checkbox.Content>
              </Checkbox>
            </Surface>
          );
        })}
      </div>
    </CheckboxGroup>
  );
}

const data = [
  {
    page: "Dashboard",
    permission: [
      {
        title: "View",
        description: "Can visit and view dashboard page",
        permission: Permissions.DashboardView,
      },
    ],
  },
  {
    page: "Boarda",
    permission: [
      {
        title: "View",
        description: "Can visit and view board page",
        permission: Permissions.BoardView,
      },
      {
        title: "Create Task",
        description: "Can create task for assignees",
        permission: Permissions.BoardTaskCreate,
      },
      {
        title: "Edit Task",
        description: "Can edit task details",
        permission: Permissions.BoardTaskEdit,
      },
      {
        title: "Delete Task",
        description: "Can delete task",
        permission: Permissions.BoardTaskDelete,
      },
      {
        title: "Create Task Board",
        description: "Can create task board for new tasks",
        permission: Permissions.BoardTaskBoardCreate,
      },
      {
        title: "Edit Task Board",
        description: "Can edit task board details",
        permission: Permissions.BoardTaskBoardEdit,
      },
      {
        title: "Delete Task Board",
        description: "Can delete task board",
        permission: Permissions.BoardTaskBoardDelete,
      },
    ],
  },
  {
    page: "Members",
    permission: [
      {
        title: "Views",
        description: "Can visit and view page",
        permission: 1,
      },
    ],
  },
  {
    page: "Memberss",
    permission: [
      {
        title: "Viewa",
        description: "Can visit and view page",
        permission: 2,
      },
    ],
  },
  {
    page: "Members2s",
    permission: [
      {
        title: "Viewas",
        description: "Can visit and view page",
        permission: 22,
      },
      {
        title: "Viewass",
        description: "Can visit and view page",
        permission: 222,
      },
      {
        title: "Viewa4s",
        description: "Can visit and view page",
        permission: 232,
      },
      {
        title: "Viewasz",
        description: "Can visit and view page",
        permission: 252,
      },
    ],
  },
];

export function PermissionList() {
  return (
    <div className="space-y-5">
      {data.map((item) => {
        return <PermissionItem items={item} key={item.page} />;
      })}
    </div>
  );
}
