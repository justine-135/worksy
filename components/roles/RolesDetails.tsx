import CustomSearchField from "../fields/CustomSearchField";
import AddRoleDrawer from "./drawer/AddRoleDrawer";
import RolesTable from "./RolesTable";

export default function RolesDetails() {
  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between p-1">
        <h1 className="font-semibold text-2xl">Roles</h1>
        <AddRoleDrawer />
      </div>
      <CustomSearchField />
      <RolesTable />
    </div>
  );
}
