"use client";

import SettingsSkeleton from "@/components/common/skeleton/SettingsSkeleton";
import AccountCard from "@/components/settings/cards/AccountCard";
import AppearanceCard from "@/components/settings/cards/AppearanceCard";
import DangerZoneCard from "@/components/settings/cards/DangerZoneCard";
import ProfileCard from "@/components/settings/cards/ProfileCard";
import ProjectCard from "@/components/settings/cards/ProjectCard";
import { useGetProject } from "@/hooks/project/useGetProject";
import { useGetUserProfile } from "@/hooks/user/useGetUserProfile";
import { useSessionStore } from "@/store/session.store";

export default function SettingsComponent() {
  const userId = useSessionStore((s) => s.userId);
  const projectId = useSessionStore((s) => s.projectId);

  const { data: project, isLoading: isProjectLoading } =
    useGetProject(projectId);
  const { data: profile, isLoading: isProfileLoading } = useGetUserProfile();

  if (isProjectLoading || isProfileLoading || !project || !profile) {
    return <SettingsSkeleton />;
  }

  const isOwner = project.ownerId === userId;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted">
          Manage your appearance, profile, and this project.
        </p>
      </div>

      <AppearanceCard />
      <ProfileCard profile={profile} />
      <ProjectCard project={project} isOwner={isOwner} />
      <AccountCard profile={profile} />
      {isOwner && <DangerZoneCard project={project} />}
    </div>
  );
}
