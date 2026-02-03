"use client";

import React, { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

export default function GuardToken({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirectTo") || "/";
  const ok = hasToken();
  useEffect(() => {
    if (ok) {
      router.replace(redirectTo);
    } else {
      router.replace(`/login`);
    }
  }, [ok]);

  return <>{children}</>;
}
