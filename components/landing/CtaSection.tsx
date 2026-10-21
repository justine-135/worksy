import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-surface px-6 pb-12">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-card bg-primary px-8 py-10 md:flex-row md:items-center">
        <h2 className="max-w-md text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
          Ready to ship faster with Worksy?
        </h2>
        <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row">
          <Link
            href="#features"
            className="rounded-md border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            See features
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md bg-white px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-white/90"
          >
            Start for free
          </Link>
        </div>
      </div>
    </section>
  );
}
