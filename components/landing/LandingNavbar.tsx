import Link from "next/link";
import { LuChevronDown } from "react-icons/lu";

import { Logo } from "./Logo";

const navLinks = [
  { label: "Solutions", hasMenu: true },
  { label: "Customers", hasMenu: true },
  { label: "Pricing", hasMenu: false },
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
                  href="#features"
                  className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  {link.label}
                  {link.hasMenu && <LuChevronDown className="h-3.5 w-3.5" />}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted sm:inline-flex"
          >
            Log In
          </Link>
          <Link
            href="/sign-in"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            Start Now
          </Link>
        </div>
      </nav>
    </header>
  );
}
