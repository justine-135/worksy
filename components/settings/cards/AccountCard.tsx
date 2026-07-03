"use client";

import { Button } from "@heroui/react/button";
import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";

import SettingsSection from "@/components/settings/SettingsSection";
import { UserProfileDTO } from "@/types/user.dto";

export default function AccountCard({ profile }: { profile: UserProfileDTO }) {
  return (
    <SettingsSection
      title="Account"
      description="The account you're signed in with."
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {profile.name ?? "Unnamed user"}
          </p>
          <p className="truncate text-sm text-muted">
            {profile.email ?? "No email on file"}
          </p>
        </div>
        <Button
          variant="outline"
          className="shrink-0 gap-2"
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
        >
          <LuLogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </SettingsSection>
  );
}
