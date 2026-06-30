import { cn } from "@heroui/react";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  count?: number;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Shared white panel used across the dashboard sections. */
export default function SectionCard({
  title,
  icon,
  count,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-border bg-surface p-5 shadow-card",
        className,
      )}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-danger">{icon}</span>}
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {typeof count === "number" && (
            <span className="rounded-pill bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
              {count}
            </span>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
