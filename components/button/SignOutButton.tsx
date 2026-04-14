import { Button } from "@heroui/react/button";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <Button className="mt-auto" onClick={() => signOut()}>
      Sign out
    </Button>
  );
}
