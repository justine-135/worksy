import { ProjectCard } from "@/components/projects/ProjectCard";
import { SearchField } from "@heroui/react/search-field";
import { RoleFilter } from "./RoleFilter";
import AddProjectModal from "./AddProjectModal";

export default function ProjectsComponent() {
  return (
    <div className="flex flex-col gap-4 items-center mt-20 w-full">
      <div className="flex flex-col gap-4 items-center">
        <SearchField name="search">
          <SearchField.Group className="h-12 rounded-4xl">
            <SearchField.SearchIcon />
            <SearchField.Input className="w-100" placeholder="Search..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <div className="self-start">
          <RoleFilter />
        </div>
        <div className="flex flex-wrap gap-4 w-auto max-w-230">
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <AddProjectModal />
        </div>
      </div>
    </div>
  );
}
