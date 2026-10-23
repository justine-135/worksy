import Link from "next/link";
import { LuArrowRight } from "react-icons/lu";

import { FadeInView } from "./FadeInView";

const steps = [
  {
    number: "01",
    title: "Create a project",
    description: "Set up your workspace with a name and team in seconds.",
  },
  {
    number: "02",
    title: "Collaborate",
    description:
      "Invite members, assign roles, and plan work on shared boards.",
  },
  {
    number: "03",
    title: "Ship on time",
    description:
      "Track progress, get alerts, and hit every deadline with confidence.",
  },
];

export default function HowItWorksTeaser() {
  return (
    <section className="bg-background px-6 py-20">
      <FadeInView>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            From project setup to shipping — Worksy keeps every step simple.
          </p>
        </div>
      </FadeInView>

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {steps.map((step, i) => (
          <FadeInView key={step.number} delay={i * 0.08}>
            <div className="rounded-card border border-border bg-surface p-6">
              <p className="text-4xl font-bold text-primary/20">{step.number}</p>
              <h3 className="mt-3 text-base font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {step.description}
              </p>
            </div>
          </FadeInView>
        ))}
      </div>

      <FadeInView>
        <div className="mx-auto mt-8 flex max-w-4xl justify-end">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            See the full walkthrough
            <LuArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </FadeInView>
    </section>
  );
}
