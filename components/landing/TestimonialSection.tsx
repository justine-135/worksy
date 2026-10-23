import { LuStar } from "react-icons/lu";

import Avatar from "./Avatar";
import { FadeInView } from "./FadeInView";

const testimonials = [
  {
    quote:
      "Worksy helped our company cut turnaround time and operational overhead, while improving resource allocation and how we manage every project.",
    name: "Darlene Robertson",
    role: "Head of Strategy at Mailchimp",
    initials: "DR",
    gradient: "from-sky-400 to-indigo-500",
  },
  {
    quote:
      "The Kanban boards and role-based access made onboarding new team members effortless. We ship twice as fast now.",
    name: "Marcus Chen",
    role: "Engineering Lead at Stripe",
    initials: "MC",
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    quote:
      "Finally a project tool that gives managers real visibility without burying the team in noise. The dashboard is exactly what we needed.",
    name: "Sarah Williams",
    role: "VP of Product at Notion",
    initials: "SW",
    gradient: "from-amber-400 to-orange-500",
  },
];

export default function TestimonialSection() {
  return (
    <section className="bg-surface px-6 py-20">
      <FadeInView>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Loved by teams worldwide
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            See what project managers and engineers say about Worksy.
          </p>
        </div>
      </FadeInView>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <FadeInView key={t.name} delay={i * 0.08}>
            <figure className="flex h-full flex-col rounded-card border border-border bg-surface-muted p-6">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <LuStar key={j} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-muted">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar
                  initials={t.initials}
                  gradient={t.gradient}
                  className="h-9 w-9"
                />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs text-subtle">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          </FadeInView>
        ))}
      </div>
    </section>
  );
}
