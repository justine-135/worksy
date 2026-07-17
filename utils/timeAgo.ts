import { formatDistanceToNow } from "date-fns";

export const timeAgo = (
  date?: string | Date | number,
  options?: {
    addSuffix?: boolean;
  },
) => {
  if (!date) return "";

  return formatDistanceToNow(new Date(date), {
    addSuffix: options?.addSuffix ?? true,
  });
};

export const notificationTimeAgo = (date?: string | Date | number) => {
  if (!date) return "";

  const now = Date.now();
  const diffMs = now - new Date(date).getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const year = 365 * day;

  if (diffMs < hour) {
    return `${Math.floor(diffMs / minute)}m`;
  }

  if (diffMs < day) {
    return `${Math.floor(diffMs / hour)}h`;
  }

  if (diffMs < year) {
    return `${Math.floor(diffMs / day)}d`;
  }

  return `${Math.floor(diffMs / year)}y`;
};
