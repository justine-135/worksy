import { LuArrowRight, LuPlug } from "react-icons/lu";
import {
  SiAsana,
  SiFigma,
  SiGithub,
  SiGoogledrive,
  SiMailchimp,
  SiNotion,
  SiPaypal,
  SiShopify,
  SiSlack,
  SiTrello,
  SiZapier,
  SiZendesk,
} from "react-icons/si";

const integrations = [
  { Icon: SiSlack, color: "text-[#4A154B]" },
  { Icon: SiNotion, color: "text-black" },
  { Icon: SiTrello, color: "text-[#0052CC]" },
  { Icon: SiPaypal, color: "text-[#003087]" },
  { Icon: SiGithub, color: "text-black" },
  { Icon: SiGoogledrive, color: "text-[#1FA463]" },
  { Icon: SiFigma, color: "text-[#F24E1E]" },
  { Icon: SiMailchimp, color: "text-[#FFE01B]" },
  { Icon: SiAsana, color: "text-[#F06A6A]" },
  { Icon: SiZendesk, color: "text-black" },
  { Icon: SiZapier, color: "text-[#FF4F00]" },
  { Icon: SiShopify, color: "text-[#95BF47]" },
];

export default function IntegrationsSection() {
  return (
    <section className="bg-white px-6 py-12">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#1d2b25] px-6 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]"
        />

        <div className="relative mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            <LuPlug className="h-3.5 w-3.5" />
            Integrations
          </span>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Don&apos;t replace. Integrate.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-white/60">
            Keep the tools your team already loves. Worksy connects to the apps
            you use every day so your workflow stays uninterrupted.
          </p>
          <a
            href="/sign-in"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            All integrations
            <LuArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="relative mx-auto mt-12 grid max-w-3xl grid-cols-4 gap-4 sm:grid-cols-6">
          {integrations.map(({ Icon, color }, i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-2xl bg-white shadow-sm transition-transform hover:-translate-y-1"
            >
              <Icon className={`h-7 w-7 ${color}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
