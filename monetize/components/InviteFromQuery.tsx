"use client";

import { useSearchParams } from "next/navigation";
import { InviteBootstrap } from "@/components/InviteBootstrap";
import { lookupInviteToken } from "@/lib/invite-tokens";

/** Stash invite access code on login/signup when ?invite= is present. */
export function InviteFromQuery() {
  const search = useSearchParams();
  const invite = lookupInviteToken(search.get("invite"));
  if (!invite) return null;
  return <InviteBootstrap accessCode={invite.accessCode} />;
}
