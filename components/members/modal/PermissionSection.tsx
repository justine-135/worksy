import {
  Checkbox,
  Description,
  Label,
  Separator,
  Surface,
} from "@heroui/react";
import { PermissionSection as PermissionSectionType } from "@/utils/transform-permissions";

export function PermissionSection({
  section,
}: {
  section: PermissionSectionType;
}) {
  return (
    <div className="space-y-4">
      <Label className="text-lg font-semibold">{section.page}</Label>
      <div className="flex flex-wrap">
        {section.groups.map((group) => (
          <div key={group.group} className="space-y-3">
            <Label className="text-sm font-medium text-muted-foreground">
              {group.group}
            </Label>

            <div className="flex flex-wrap space-y-2 pl-4">
              {group.actions.map((action) => (
                <Surface
                  key={action.permission}
                  // variant="secondary"
                  className="rounded-xl"
                >
                  <Checkbox value={action.permission} className="px-4 py-2">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    <Checkbox.Content>
                      <Label>{action.title}</Label>
                      <Description>{action.description}</Description>
                    </Checkbox.Content>
                  </Checkbox>
                </Surface>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Separator />
    </div>
  );
}
