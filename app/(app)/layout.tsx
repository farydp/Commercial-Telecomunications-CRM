import { AppShell } from "@/components/app-shell";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireUser();
  return <AppShell profile={profile}>{children}</AppShell>;
}


