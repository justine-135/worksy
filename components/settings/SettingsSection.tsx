import { ReactNode } from "react";

// Shared card wrapper for each settings group. Uses design tokens so it
// recolors automatically in dark mode.
export default function SettingsSection({
  title,
  description,
  children,
  danger = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={`rounded-card border bg-surface p-5 shadow-card ${
        danger ? "border-danger/40" : "border-border"
      }`}
    >
      <div className="mb-4">
        <h2
          className={`text-base font-semibold ${
            danger ? "text-danger" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
