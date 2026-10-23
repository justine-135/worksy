import Link from "next/link";

import { Logo } from "./Logo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "#" },
];

export default function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <ul className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden rounded-md px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/sign-in"
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            Start Now
          </Link>
        </div>
      </nav>
    </header>
  );
}
