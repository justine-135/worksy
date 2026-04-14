"use client";

import { Button } from "@heroui/react";
import { signIn } from "next-auth/react";

const providers = [
  {
    id: "google",
    label: "Continue with Google",
  },
  {
    id: "github",
    label: "Continue with GitHub",
  },
] as const;

export default function SignInComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Worksy
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Sign in
          </h1>
          <p className="text-sm text-slate-600">
            Use one of the configured OAuth providers to continue.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {providers.map((provider) => (
            <Button
              key={provider.id}
              onClick={() => {
                signIn(provider.id, { callbackUrl: "/projects" });
              }}
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {provider.label}
            </Button>
          ))}
        </div>
      </div>
    </main>
  );
}
