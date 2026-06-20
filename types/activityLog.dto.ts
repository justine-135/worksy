import { ActivityLog } from "@/enum/activityLog.enum";

import { UserResponseDTO } from "./user.dto";

export interface ActivityLogResponseDTO {
  type: ActivityLog;
  actor: {
    user: UserResponseDTO;
  };
  statusChange: {
    fromBoard?: {
      title: string;
    };
    toBoard?: {
      title: string;
    };
  };
  createdAt: true;
}
