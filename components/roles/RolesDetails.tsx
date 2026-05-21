import CustomSearchField from "../fields/CustomSearchField";
import AddRoleDrawer from "./drawer/AddRoleDrawer";
import RolesTable from "./RolesTable";

export default function RolesDetails() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <AddRoleDrawer />
      <CustomSearchField />
      <RolesTable />
    </div>
  );
}
