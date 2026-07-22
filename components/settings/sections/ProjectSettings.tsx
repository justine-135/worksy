"use client";

import PermissionGate from "@/components/common/PermissionGate";
import SettingsSkeleton from "@/components/common/skeleton/SettingsSkeleton";
import DangerZoneCard from "@/components/settings/cards/DangerZoneCard";
import ProjectCard from "@/components/settings/cards/ProjectCard";
import { Permissions } from "@/enum/permissions.enum";
import { useGetProject } from "@/hooks/project/useGetProject";
import { useSessionStore } from "@/store/session.store";

// Project subsection: name/description/default-priority and the danger zone.
// Gated behind `settings.project.view`; the danger zone stays owner-only on top
// of that (deletion is irreversible and owner-scoped on the server).
export default function ProjectSettings() {
  const userId = useSessionStore((s) => s.userId);
  const projectId = useSessionStore((s) => s.projectId);
  const { data: project, isLoading } = useGetProject({ projectId });

  return (
    <PermissionGate
      permission={Permissions.SettingsProjectView}
      skeleton={<SettingsSkeleton />}
    >
      {isLoading || !project ? (
        <SettingsSkeleton />
      ) : (
        <div className="space-y-6">
          <ProjectCard project={project} isOwner={project.ownerId === userId} />
          {project.ownerId === userId && <DangerZoneCard project={project} />}
        </div>
      )}
    </PermissionGate>
  );
}
