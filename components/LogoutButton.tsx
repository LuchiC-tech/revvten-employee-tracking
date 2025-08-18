"use client";
import { useTransition } from "react";
import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [pending, start] = useTransition();
  return (
    <Button variant="outline" size="sm" onClick={() => start(async () => { await signOut(); location.reload(); })}>
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}



