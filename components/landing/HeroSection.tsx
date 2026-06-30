import Link from "next/link";
import { LuZap } from "react-icons/lu";

import Avatar from "./Avatar";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background px-6 pb-20 pt-14">
      {/* faint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(#0000000a_1px,transparent_1px),linear-gradient(90deg,#0000000a_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* floating decorative avatars */}
        <Avatar
          initials="AM"
          gradient="from-rose-400 to-pink-500"
          className="absolute -left-2 top-2 hidden h-14 w-14 lg:flex"
        />
        <Avatar
          initials="JC"
          gradient="from-sky-400 to-indigo-500"
          className="absolute -right-2 top-2 hidden h-14 w-14 lg:flex"
        />
        <Avatar
          initials="RT"
          gradient="from-amber-400 to-orange-500"
          className="absolute -left-10 top-44 hidden h-12 w-12 xl:flex"
        />
        <Avatar
          initials="LS"
          gradient="from-violet-400 to-indigo-500"
          className="absolute -right-10 top-44 hidden h-12 w-12 xl:flex"
        />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
          <LuZap className="h-3.5 w-3.5 fill-primary text-primary" />
          Built for fast teams
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          One tool to{" "}
          <span className="relative whitespace-nowrap">
            manage projects
            <span className="absolute inset-x-0 -bottom-1 h-3 -skew-x-6 bg-primary/25" />
          </span>{" "}
          and your team
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-muted">
          Worksy helps teams plan, track, and ship work faster — with Kanban
          boards, role-based access, and data-driven insights to keep every
          project on schedule.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 sm:w-auto"
          >
            Start for Free
          </Link>
          <Link
            href="#features"
            className="w-full rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted sm:w-auto"
          >
            See how it works
          </Link>
        </div>
      </div>
    </section>
  );
}
