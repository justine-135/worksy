import SettingsNav from "@/components/settings/SettingsNav";

// Shared chrome for every Settings subsection: heading + the sub-nav. The
// active subsection renders into {children} from its own route segment.
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted">
          Manage your appearance, profile, and this project.
        </p>
      </div>

      <SettingsNav />

      <div>{children}</div>
    </div>
  );
}
