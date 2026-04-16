import { Button } from "@heroui/react";
import { MembersTable } from "./MembersTable";

export default function MembersDetail() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Members</h1>
        <Button>Invite member</Button>
      </div>
      <MembersTable />
    </div>
  );
}
