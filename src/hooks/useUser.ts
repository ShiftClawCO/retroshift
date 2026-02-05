"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useUser() {
  const user = useQuery(api.users.getCurrent);
  
  return {
    user,
    isLoading: user === undefined,
    isPro: user?.plan === "pro",
  };
}
