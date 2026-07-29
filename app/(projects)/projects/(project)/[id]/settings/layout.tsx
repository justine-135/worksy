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
          Manage your project settings such as the title, description, and icon.
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
