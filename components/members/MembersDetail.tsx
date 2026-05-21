import { MembersTable } from "./MembersTable";
import CustomSearchField from "../fields/CustomSearchField";
import InviteMemberModal from "./modal/InviteMemberModal";

export default function MembersDetail() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <InviteMemberModal />
      <CustomSearchField />
      <MembersTable />
    </div>
  );
}
