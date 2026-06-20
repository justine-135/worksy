import { MembersTable } from "./MembersTable";
import CustomSearchField from "../common/custom/CustomSearchField";
import InviteMemberModal from "./modal/InviteMemberModal";

export default function MembersDetail() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <CustomSearchField />
        <InviteMemberModal />
      </div>
      <MembersTable />
    </div>
  );
}
