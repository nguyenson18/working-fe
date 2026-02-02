"use client";

import React, { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

function hasToken() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("accessToken");
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const ok = hasToken();

  useEffect(() => {
    if (!ok) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/today")}`);
    }
  }, [ok, router, pathname]);

  if (!ok) {
    return (
      <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
