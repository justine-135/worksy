import { ProjectCard } from "@/components/projects/ProjectCard";
import AddProjectModal from "./AddProjectModal";
import { useGetProjects } from "@/hooks/project/useGetProjects";
import { ProjectToast } from "../toast/ProjectToast";
import CustomSearchField from "../fields/CustomSearchField";
import { useSessionStore } from "@/store/session.store";
import { Typography } from "@heroui/react";
import ProjectFilter from "./ProjectFilter";
import { useState } from "react";
import { TProjectFilter } from "@/types/project.dto";

export default function ProjectsDetail() {
  const [filter, setFilter] = useState<TProjectFilter>("all");
  const userId = useSessionStore((s) => s.userId);

  const { data, isLoading } = useGetProjects({
    userId,
    filter,
  });

  if (isLoading) return "Loading";

  return (
    <div className="ProjectDetail flex flex-col space-y-6">
      <section>
        <div className="flex flex-col gap-4 items-center mt-20 w-full">
          <div className="flex flex-col gap-4 w-[53%] max-w-217.25">
            <div className="flex items-center justify-between w-full">
              <Typography.Heading
                level={1}
                className="font-extralight text-2xl"
              >
                Projects
              </Typography.Heading>
              <CustomSearchField />
            </div>
            <div className="my-7">
              <ProjectFilter filter={filter} setFilter={setFilter} />
            </div>
            <div className="flex flex-wrap mr-auto gap-4 max-w-230">
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
              <AddProjectModal userId={userId} />
            </div>
          </div>
          <ProjectToast />
        </div>
      </section>
    </div>
  );
}
