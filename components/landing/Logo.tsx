import Link from "next/link";
import { LuCheck } from "react-icons/lu";

type LogoProps = {
  /** Render light text for use on dark backgrounds. */
  light?: boolean;
};

export function Logo({ light = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white">
        <LuCheck className="h-4 w-4" strokeWidth={3} />
      </span>
      <span
        className={`text-lg font-semibold tracking-tight ${
          light ? "text-white" : "text-emerald-950"
        }`}
      >
        Worksy
      </span>
    </Link>
  );
}
