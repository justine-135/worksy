type AvatarProps = {
  initials: string;
  className?: string;
  /** Tailwind gradient classes, e.g. "from-emerald-400 to-teal-500" */
  gradient?: string;
};

/**
 * Lightweight decorative avatar (initials on a gradient circle).
 * Avoids shipping real photos / external image requests on the marketing page.
 */
export default function Avatar({
  initials,
  className = "",
  gradient = "from-emerald-400 to-teal-500",
}: AvatarProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white ring-4 ring-white ${gradient} ${className}`}
    >
      {initials}
    </span>
  );
}
