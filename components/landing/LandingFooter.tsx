import Link from "next/link";
import {
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";
import { LuMail, LuPhone } from "react-icons/lu";

import { Logo } from "./Logo";

const columns = [
  {
    title: "Solution",
    links: ["Why Worksy", "Features", "Roadmap", "Security"],
  },
  {
    title: "Customers",
    links: ["Startups", "Agencies", "Enterprise", "Teams"],
  },
  {
    title: "Resources",
    links: ["Pricing", "Contact Sales", "Changelog", "Blog"],
  },
];

const socials = [FaXTwitter, FaLinkedinIn, FaInstagram, FaGithub];

export default function LandingFooter() {
  return (
    <footer className="bg-[#1d2b25] px-6 py-14 text-white">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <div className="mt-5 space-y-2 text-sm text-white/60">
            <p className="flex items-center gap-2">
              <LuMail className="h-4 w-4" />
              hello@worksy.com
            </p>
            <p className="flex items-center gap-2">
              <LuPhone className="h-4 w-4" />
              +1 987 654 321
            </p>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-white">{col.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-white/55 transition-colors hover:text-white"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
        <p className="text-xs text-white/45">
          © 2026 Worksy. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          {socials.map((Icon, i) => (
            <Link
              key={i}
              href="#"
              className="text-white/55 transition-colors hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
