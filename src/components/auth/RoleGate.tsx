"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuth, type Role } from "@/src/utils/AuthContext";

type RoleGateProps = {
  allowedRoles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
};

const DEFAULT_REDIRECT = "/dashboard";

const DefaultFallback = () => (
  <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Access restricted</h2>
    <p className="text-sm text-slate-600 dark:text-slate-200">
      You do not have permission to view this section. Please contact your administrator if you believe this is a mistake.
    </p>
  </div>
);

export const RoleGate = ({
  allowedRoles,
  children,
  fallback,
  redirectTo = DEFAULT_REDIRECT,
}: RoleGateProps) => {
  const { isAuthLoading, isAuthenticated, session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) {
      const next = pathname && pathname !== "/login" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
    }
  }, [isAuthLoading, isAuthenticated, pathname, router]);

  const userRole = session?.user.role;
  const isAllowed = Boolean(userRole && allowedRoles.includes(userRole));

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    if (!isAllowed && redirectTo && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(redirectTo);
    }
  }, [isAllowed, isAuthenticated, isAuthLoading, redirectTo, router]);

  if (isAuthLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isAllowed) {
    return <>{children}</>;
  }

  return <>{fallback ?? <DefaultFallback />}</>;
};
