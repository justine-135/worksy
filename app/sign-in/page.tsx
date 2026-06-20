import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import SignInComponent from "@/components/sign-in/SignInComponent";
import { authConfig } from "@/lib/auth/auth";

export default async function SignInPage() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect("/projects");
  }

  return <SignInComponent />;
}
