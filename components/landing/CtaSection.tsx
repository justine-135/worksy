import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-surface px-6 pb-12">
      <div className="relative mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-primary px-8 py-10 md:flex-row md:items-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"
        />
        <h2 className="relative max-w-md text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
          Discover the full scale of{" "}
          <span className="relative whitespace-nowrap">
            Worksy
            <span className="absolute inset-x-0 -bottom-1 h-2.5 -skew-x-6 bg-white/30" />
          </span>{" "}
          capabilities
        </h2>
        <div className="relative flex flex-shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="#features"
            className="rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            See features
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            Start for Free
          </Link>
        </div>
      </div>
    </section>
  );
}
