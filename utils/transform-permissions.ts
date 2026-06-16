export function formatPermission(permissionStr: string): string {
  const words = permissionStr.split(".").reverse();

  const combined = words.join(" ");

  return combined.charAt(0).toUpperCase() + combined.slice(1);
}
