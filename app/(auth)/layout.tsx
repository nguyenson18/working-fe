import GuardToken from "@/src/components/GuardToken";


export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuardToken>{children}</GuardToken>
  );
}
