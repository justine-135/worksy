import CustomSearchField from "../common/custom/CustomSearchField";
import AddRoleDrawer from "./drawer/AddRoleDrawer";
import RolesTable from "./RolesTable";

export default function RolesDetails() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <CustomSearchField /> <AddRoleDrawer />
      </div>
      <RolesTable />
    </div>
  );
}
