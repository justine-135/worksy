import SignInComponent from "@/components/sign-in/SignInComponent";
import { authConfig } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getServerSession(authConfig);

  if (session) {
    redirect("/projects");
  }

  return <SignInComponent />;
}
