// /utils/transform-permissions.ts

export type DBPermission = {
  id: string;
  key: string;
};

export type PermissionAction = {
  title: string;
  description: string;
  permission: string;
};

export type PermissionGroup = {
  group: string;
  actions: PermissionAction[];
};

export type PermissionSection = {
  page: string;
  groups: PermissionGroup[];
};

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function formatWords(words: string[]) {
  return words.map(capitalize).join(" ");
}

export function transformPermissions(
  permissions: DBPermission[],
): PermissionSection[] {
  const pages: Record<string, Record<string, PermissionAction[]>> = {};

  for (const perm of permissions) {
    const parts = perm.key.split(".");
    const page = parts[0];
    const action = parts[parts.length - 1];
    const groupParts = parts.slice(1, -1);

    const groupName =
      groupParts.length > 0 ? formatWords(groupParts) : "General";

    if (!pages[page]) {
      pages[page] = {};
    }

    if (!pages[page][groupName]) {
      pages[page][groupName] = [];
    }

    pages[page][groupName].push({
      title: capitalize(action),
      description: `Allows user to ${perm.key.replaceAll(".", " ")}`,
      permission: perm.key,
    });
  }

  return Object.entries(pages).map(([page, groups]) => ({
    page: capitalize(page),
    groups: Object.entries(groups).map(([group, actions]) => ({
      group,
      actions,
    })),
  }));
}
