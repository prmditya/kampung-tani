"use client";

import { IconLogout } from "@tabler/icons-react";
import { useLogout } from "@/hooks/use-auth";

export function LogoutButton() {
  const logoutMutation = useLogout();

  return (
    <button
      onClick={() => {
        logoutMutation.mutate();
      }}
      disabled={logoutMutation.isPending}
      className="flex w-full items-center gap-2 text-left disabled:opacity-50"
    >
      <IconLogout className="text-destructive" />
      {logoutMutation.isPending ? "Logging out..." : "Log out"}
    </button>
  );
}
