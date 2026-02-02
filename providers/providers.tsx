"use client";

import { SnackbarProvider, useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { setNotifier } from "@/src/lib/notifier";

function Bridges() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();

  useEffect(() => {
    setNotifier((msg, option) =>
      enqueueSnackbar(msg, { variant: option?.variant || "warning" })
    );
  }, [enqueueSnackbar]);

  useEffect(() => {
    const onLogout = () => router.replace("/login");
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        maxSnack={3}
        autoHideDuration={3000}
      >
        <Bridges />
        {children}
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
