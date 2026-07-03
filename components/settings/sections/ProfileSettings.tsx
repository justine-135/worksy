"use client";

import SettingsSkeleton from "@/components/common/skeleton/SettingsSkeleton";
import AccountCard from "@/components/settings/cards/AccountCard";
import ProfileCard from "@/components/settings/cards/ProfileCard";
import { useGetUserProfile } from "@/hooks/user/useGetUserProfile";

// Profile subsection: the user's own name/avatar plus the signed-in account.
// Open to every project member (no permission gate).
export default function ProfileSettings() {
  const { data: profile, isLoading } = useGetUserProfile();

  if (isLoading || !profile) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <ProfileCard profile={profile} />
      <AccountCard profile={profile} />
    </div>
  );
}
