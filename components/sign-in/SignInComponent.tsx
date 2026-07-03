"use client";

import { Button } from "@heroui/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { LuArrowLeft } from "react-icons/lu";

import { Logo } from "@/components/landing/Logo";

const providers = [
  {
    id: "google",
    label: "Continue with Google",
    icon: <FcGoogle className="h-5 w-5" />,
  },
  {
    id: "github",
    label: "Continue with GitHub",
    icon: <FaGithub className="h-5 w-5 text-foreground" />,
  },
] as const;

export default function SignInComponent() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-16">
      {/* faint grid backdrop — matches the landing hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [background-image:linear-gradient(#0000000a_1px,transparent_1px),linear-gradient(90deg,#0000000a_1px,transparent_1px)] [background-size:40px_40px]"
      />

      <div className="relative w-full max-w-md">
        <div className="rounded-card border border-border bg-surface p-8 shadow-card">
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo />

            <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
              Welcome back
            </span>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Sign in to Worksy
              </h1>
              <p className="text-sm text-muted">
                Continue with one of the configured OAuth providers.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                onClick={() => {
                  signIn(provider.id, { callbackUrl: "/projects" });
                }}
                className="flex w-full items-center justify-center gap-2.5 rounded-pill border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                {provider.icon}
                {provider.label}
              </Button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-subtle">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <LuArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
