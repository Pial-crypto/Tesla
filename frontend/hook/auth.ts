"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearSession } from "@/lib/api";

type AuthUser = Record<string, unknown>;
type AuthMeResponse = {
  user?: AuthUser | null;
} | null;

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const data = (await api("/auth/me")) as AuthMeResponse;

        if (!data?.user) {
          router.replace("/");
          return;
        }

        setUser(data.user);
      } catch {
        clearSession();
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  return { user, loading };
}