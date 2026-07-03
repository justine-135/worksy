"use client";

import { FiMonitor, FiMoon, FiSun } from "react-icons/fi";

import SettingsSection from "@/components/settings/SettingsSection";
import { useTheme } from "@/hooks/useTheme";
import { Theme, THEME_OPTIONS } from "@/lib/theme/theme";

const ICONS: Record<Theme, React.ReactNode> = {
  light: <FiSun className="size-4" />,
  dark: <FiMoon className="size-4" />,
  system: <FiMonitor className="size-4" />,
};

export default function AppearanceCard() {
  const { theme, setTheme, mounted } = useTheme();

  return (
    <SettingsSection
      title="Appearance"
      description="Choose how Worksy looks. System follows your device setting."
    >
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((option) => {
          // Only reflect the active theme after mount to avoid a hydration
          // mismatch (the server can't know the browser/OS choice).
          const isActive = mounted && theme === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border bg-surface text-muted hover:bg-surface-muted"
              }`}
            >
              {ICONS[option.value]}
              {option.label}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
