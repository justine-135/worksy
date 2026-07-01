"use client";

import PermissionGate from "@/components/common/PermissionGate";
import { Permissions } from "@/enum/permissions.enum";

import BoardDetail from "./BoardDetail";
import BoardSkeleton from "./BoardSkeleton";

function BoardComponent() {
  return (
    <PermissionGate
      permission={Permissions.BoardView}
      skeleton={<BoardSkeleton />}
    >
      <BoardDetail />
    </PermissionGate>
  );
}

export default BoardComponent;
