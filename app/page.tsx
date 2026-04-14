"use server";

import Link from "next/link";
// import { auth, signOut } from "@/lib/auth";

export default async function Home() {
  // const session = await auth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Worksy
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
            NextAuth is ready
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Google and GitHub providers are configured. Protected project routes
            will redirect to the sign-in page until valid OAuth credentials are
            added to your environment.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-slate-50 p-5">
          <p className="text-sm font-medium text-slate-700">Current session</p>
          {/* <p className="mt-2 text-sm text-slate-600">
            {session?.user?.email
              ? `Signed in as ${session.user.email}`
              : "No active session"}
          </p> */}
        </div>

        {/* <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={session ? "/projects" : "/sign-in"}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            {session ? "Open Projects" : "Open Sign In"}
          </Link>

          {session ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:w-auto"
              >
                Sign out
              </button>
            </form>
          ) : null}
        </div> */}
      </div>
    </main>
  );
}
