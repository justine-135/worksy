import Link from "next/link";

import { FadeInView } from "@/components/landing/FadeInView";
import { StepVisual } from "@/components/landing/how-it-works/StepVisual";
import LandingFooter from "@/components/landing/LandingFooter";
import LandingNavbar from "@/components/landing/LandingNavbar";

const steps = [
  {
    number: 1,
    title: "Create a project",
    description:
      "Set up your workspace in seconds. Give your project a name, pick a color, and add a description — Worksy takes care of the rest.",
  },
  {
    number: 2,
    title: "Invite your team",
    description:
      "Add members by email and assign each one a role. Roles control exactly what they can see and do inside the project — from viewing tasks to managing permissions.",
  },
  {
    number: 3,
    title: "Build your Kanban board",
    description:
      "Add task columns and drag cards between stages as work progresses. Every move is captured automatically in the project activity log.",
  },
  {
    number: 4,
    title: "Assign tasks & set due dates",
    description:
      "Give each task an owner, priority level, and deadline so nothing slips through the cracks. Overdue items surface in your dashboard automatically.",
  },
  {
    number: 5,
    title: "Track progress with your dashboard",
    description:
      "Real-time stats, member workload breakdowns, and overdue alerts give you full visibility at a glance — so you can act before small delays become big problems.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-surface">
      <LandingNavbar />
      <main>
        {/* Page hero */}
        <section className="bg-background px-6 py-16 md:py-24">
          <FadeInView>
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                See Worksy in action
              </h1>
              <p className="mt-5 text-base leading-7 text-muted">
                From creating a project to shipping on time — here&apos;s
                exactly how Worksy works.
              </p>
              <div className="mt-8 flex justify-center gap-3">
                <Link
                  href="/sign-in"
                  className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Get started free
                </Link>
                <Link
                  href="#features"
                  className="rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-surface-muted"
                >
                  See features
                </Link>
              </div>
            </div>
          </FadeInView>
        </section>

        {/* Step-by-step walkthrough */}
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl space-y-20 md:space-y-28">
            {steps.map((step, i) => {
              const flip = i % 2 === 1;
              return (
                <FadeInView key={step.number}>
                  <div
                    className={`grid items-center gap-10 md:grid-cols-2 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}
                  >
                    {/* Text */}
                    <div>
                      <span className="text-5xl font-bold text-primary/15">
                        {String(step.number).padStart(2, "0")}
                      </span>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {step.title}
                      </h2>
                      <p className="mt-4 text-base leading-7 text-muted">
                        {step.description}
                      </p>
                    </div>

                    {/* Visual */}
                    <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
                      <StepVisual step={step.number} />
                    </div>
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-16">
          <FadeInView>
            <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 rounded-card bg-primary px-8 py-10 md:flex-row md:items-center">
              <h2 className="max-w-md text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
                Ready to ship faster with Worksy?
              </h2>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="rounded-md border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Back to home
                </Link>
                <Link
                  href="/sign-in"
                  className="rounded-md bg-white px-6 py-3 text-center text-sm font-semibold text-primary transition-colors hover:bg-white/90"
                >
                  Start for free
                </Link>
              </div>
            </div>
          </FadeInView>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
