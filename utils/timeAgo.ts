import { formatDistanceToNow } from "date-fns";

export const timeAgo = (
  date: string | Date | number,
  options?: {
    addSuffix?: boolean;
  },
) => {
  if (!date) return "";

  return formatDistanceToNow(new Date(date), {
    addSuffix: options?.addSuffix ?? true,
  });
};
