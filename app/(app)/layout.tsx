import AppShell from "@/src/components/AppShell";
import AuthGuard from "@/src/components/AuthGuard";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
