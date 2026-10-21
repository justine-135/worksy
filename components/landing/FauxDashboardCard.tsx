import Avatar from "./Avatar";

const bars = [40, 55, 35, 60, 48, 95, 52, 38, 62, 30, 58, 42];
const highlightedBar = 5;

interface Props {
  chartContainerClassName?: string;
  inactiveClass?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function FauxDashboardCard({
  chartContainerClassName = "mt-5 h-32 gap-1.5",
  inactiveClass = "bg-primary/20",
  children,
  footer,
}: Props) {
  return (
    <div className="rounded-card border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Acme Inc.</span>
        <div className="flex -space-x-2">
          <Avatar
            initials="A"
            gradient="from-rose-400 to-pink-500"
            className="h-6 w-6 ring-2! text-[10px]"
          />
          <Avatar
            initials="B"
            gradient="from-sky-400 to-indigo-500"
            className="h-6 w-6 ring-2! text-[10px]"
          />
          <Avatar
            initials="C"
            gradient="from-amber-400 to-orange-500"
            className="h-6 w-6 ring-2! text-[10px]"
          />
        </div>
      </div>

      {children}

      <div
        className={`flex items-end justify-between ${chartContainerClassName}`}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className={`w-full rounded-t-sm ${
              i === highlightedBar ? "bg-primary" : inactiveClass
            }`}
          />
        ))}
      </div>

      {footer}
    </div>
  );
}
