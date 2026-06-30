import Link from "next/link";
import { LuZap } from "react-icons/lu";
import {
  SiDropbox,
  SiHubspot,
  SiIntercom,
  SiSquare,
} from "react-icons/si";

import Avatar from "./Avatar";

const partners = [
  { label: "HubSpot", Icon: SiHubspot },
  { label: "Dropbox", Icon: SiDropbox },
  { label: "Square", Icon: SiSquare },
  { label: "Intercom", Icon: SiIntercom },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f6f7f4] px-6 pb-16 pt-14">
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
          gradient="from-emerald-400 to-teal-500"
          className="absolute -right-10 top-44 hidden h-12 w-12 xl:flex"
        />

        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-900/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
          <LuZap className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
          Built for fast teams
        </span>

        <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-emerald-950 sm:text-5xl">
          One tool to{" "}
          <span className="relative whitespace-nowrap">
            manage projects
            <span className="absolute inset-x-0 -bottom-1 h-3 -skew-x-6 bg-lime-300/70" />
          </span>{" "}
          and your team
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-emerald-950/60">
          Worksy helps teams plan, track, and ship work faster — with Kanban
          boards, role-based access, and data-driven insights to keep every
          project on schedule.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/sign-in"
            className="w-full rounded-full bg-emerald-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 sm:w-auto"
          >
            Start for Free
          </Link>
          <Link
            href="#features"
            className="w-full rounded-full border border-emerald-900/15 bg-white px-6 py-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-50 sm:w-auto"
          >
            See how it works
          </Link>
        </div>
      </div>

      {/* partner row */}
      <div className="relative mx-auto mt-16 flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="max-w-[7rem] text-center text-xs font-medium leading-5 text-emerald-950/50 sm:text-left">
          More than 100+ companies partner
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {partners.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-emerald-950/40 transition-colors hover:text-emerald-950/70"
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
