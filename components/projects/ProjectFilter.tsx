import { TProjectFilter } from "@/types/project.dto";

import CustomButton from "../common/custom/CustomButton";

export default function ProjectFilter({
  filter,
  setFilter,
}: {
  filter: TProjectFilter;
  setFilter: (filter: TProjectFilter) => void;
}) {
  const isAll = filter === "all";
  const isOwned = filter === "owned";
  const isShared = filter === "shared";

  return (
    <div className="flex space-x-2">
      <CustomButton
        title="All"
        onClick={() => setFilter("all")}
        variant={isAll ? "outline" : "ghost"}
        className={!isAll ? "font-extralight" : "font-normal"}
      />
      <CustomButton
        title="Owned"
        onClick={() => setFilter("owned")}
        variant={isOwned ? "outline" : "ghost"}
        className={!isOwned ? "font-extralight" : "font-normal"}
      />
      <CustomButton
        title="Shared"
        onClick={() => setFilter("shared")}
        variant={isShared ? "outline" : "ghost"}
        className={!isShared ? "font-extralight" : "font-normal"}
      />
    </div>
  );
}
