import { ProjectCard } from "@/components/projects/ProjectCard";
import { SearchField } from "@heroui/react/search-field";
import { RoleFilter } from "./RoleFilter";
import AddProjectModal from "./AddProjectModal";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useGetProjects } from "@/hooks/project/useGetProjects";

export default function ProjectsDetail({ userId }: { userId: string }) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = useMemo(
    () => ["projects", userId] as const,
    [userId],
  );

  const { data, isLoading } = useGetProjects({
    userId,
  });

  const invalidateProjects = async () => {
    await queryClient.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  if (isLoading) return "Loading";

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
          {data?.map((project) => {
            const { id, title, members, owner } = project;
            return (
              <ProjectCard
                key={id}
                title={title}
                memberCount={members.length}
                owner={owner.name}
              />
            );
          })}

          <AddProjectModal
            userId={userId}
            invalidateProjects={invalidateProjects}
          />
        </div>
      </div>
    </div>
  );
}
