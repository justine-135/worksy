import { LuQuote } from "react-icons/lu";

import Avatar from "./Avatar";

export default function TestimonialSection() {
  return (
    <section className="bg-surface px-6 py-20">
      <figure className="mx-auto max-w-2xl text-center">
        <LuQuote className="mx-auto h-8 w-8 fill-primary text-primary" />
        <blockquote className="mt-6 text-2xl font-medium leading-relaxed tracking-tight text-foreground sm:text-3xl">
          “Worksy helped our company cut turnaround time and operational
          overhead, while improving resource allocation and the effectiveness
          of how we manage every project.”
        </blockquote>
        <figcaption className="mt-8 flex flex-col items-center gap-3">
          <Avatar
            initials="DR"
            gradient="from-sky-400 to-indigo-500"
            className="h-12 w-12"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Darlene Robertson
            </p>
            <p className="text-sm text-subtle">Head of Strategy at Mailchimp</p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
