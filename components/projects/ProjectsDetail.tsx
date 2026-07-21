import { Skeleton, Typography } from "@heroui/react";
import { useState } from "react";

import { ProjectCard } from "@/components/projects/ProjectCard";
import { useGetProjects } from "@/hooks/project/useGetProjects";
import { ProjectsResponseDTO, TProjectFilter } from "@/types/project.dto";

import CustomSearchField from "../common/custom/CustomSearchField";
import { ProjectToast } from "../common/ProjectToast";
import AddProjectModal from "./modal/AddProjectModal";
import ProjectFilter from "./ProjectFilter";

const ProjectSkeleton = () => {
  return <Skeleton className="w-51.25 h-42 rounded-xl" />;
};

const ProjectList = ({
  data,
  isLoading,
}: {
  data?: ProjectsResponseDTO[];
  isLoading: boolean;
}) => {
  return (
    <>
      {Array.from({ length: isLoading ? 3 : 0 }).map((_, index) => (
        <ProjectSkeleton key={index} />
      ))}
      {data?.map((project) => {
        const { id, title, members, owner, imageUrl } = project;
        return (
          <ProjectCard
            key={id}
            id={id}
            title={title}
            memberCount={members.length}
            owner={owner.name}
            imageUrl={imageUrl}
          />
        );
      })}
    </>
  );
};

export default function ProjectsDetail() {
  const [filter, setFilter] = useState<TProjectFilter>("all");

  const { data, isLoading } = useGetProjects({
    filter,
  });

  return (
    <div className="ProjectDetail flex flex-col space-y-6">
      <section>
        <div className="flex flex-col gap-4 items-center mt-20 w-full">
          <div className="flex flex-col gap-4 w-[53%] max-w-217.25">
            <div className="flex items-center justify-between w-full">
              <Typography.Heading
                level={1}
                className="font-extralight text-2xl mr-8"
              >
                Projects
              </Typography.Heading>
              <CustomSearchField />
            </div>
            <div className="my-7">
              <ProjectFilter filter={filter} setFilter={setFilter} />
            </div>
            <div className="flex flex-wrap mr-auto gap-4 max-w-230">
              <ProjectList data={data} isLoading={isLoading} />
              {!isLoading && filter !== "shared" && <AddProjectModal />}
            </div>
          </div>
          <ProjectToast />
        </div>
      </section>
    </div>
  );
}
