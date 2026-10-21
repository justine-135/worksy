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
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-md">
        <div className="rounded-card border border-border bg-surface p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Logo />

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
                className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-surface px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
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
