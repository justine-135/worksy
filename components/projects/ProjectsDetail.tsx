import { ProjectCard } from "@/components/projects/ProjectCard";
import AddProjectModal from "./AddProjectModal";
import { useGetProjects } from "@/hooks/project/useGetProjects";
import { ProjectToast } from "../toast/ProjectToast";
import CustomSearchField from "../fields/CustomSearchField";
import { useSessionStore } from "@/store/session.store";
import { MdPeopleAlt } from "react-icons/md";
import CustomButton from "../button/CustomButton";
import { Tooltip } from "@heroui/react/tooltip";

export default function ProjectsDetail() {
  const userId = useSessionStore((s) => s.userId);

  const { data, isLoading } = useGetProjects({
    userId,
  });

  if (isLoading) return "Loading";

  return (
    <div className="flex flex-col gap-4 items-center mt-20 w-full">
      <div className="flex flex-col gap-4 items-center w-[53%]">
        <div className="flex items-center justify-between w-full">
          <CustomSearchField />
          <Tooltip delay={0}>
            <CustomButton title={<MdPeopleAlt />} />
            <Tooltip.Content>
              <p>Invites</p>
            </Tooltip.Content>
          </Tooltip>
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
  );
}
