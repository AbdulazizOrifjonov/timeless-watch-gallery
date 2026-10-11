"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, ready, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && (!user || !isAdmin)) {
      router.push("/login");
    }
  }, [ready, user, isAdmin, router]);

  if (!ready || !user || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center text-navy-900/50">
        Yuklanmoqda...
      </div>
    );
  }

  return <>{children}</>;
}
