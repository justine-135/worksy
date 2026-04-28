import { MembersTable } from "./MembersTable";
import CustomSearchField from "../fields/CustomSearchField";
import InviteMemberModal from "./modal/InviteMemberModal";

export default function MembersDetail() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between p-1">
        <h1 className="font-semibold text-2xl">Members</h1>
        <InviteMemberModal />
      </div>
      <CustomSearchField />
      <MembersTable />
    </div>
  );
}
