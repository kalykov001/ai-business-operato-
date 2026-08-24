"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function GoogleButton() {
  return (
    <Button
      className="tracking-[1.3px]"
      onClick={() => signIn("google")}
    >
      Continue with Google
    </Button>
  );
}