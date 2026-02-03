import GuardToken from "@/src/components/GuardToken";
import { Suspense } from "react";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
     <Suspense fallback={null}>
      <GuardToken>{children}</GuardToken>
    </Suspense>
  );
}
