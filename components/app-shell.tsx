"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, LogOut, UserRoundPlus, Users } from "lucide-react";
import { signOutAction } from "@/app/(app)/actions";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems: Array<{ href: "/" | "/contacts" | "/contacts/new"; label: string; icon: typeof BarChart3 }> = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/contacts", label: "Contactos", icon: Users },
  { href: "/contacts/new", label: "Nuevo contacto", icon: UserRoundPlus }
];

export function AppShell({ children, profile }: { children: React.ReactNode; profile: Profile }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-sand/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="block min-w-0 transition hover:text-teal">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/45">TrujiConnect</p>
            <h1 className="font-[family-name:var(--font-display)] text-2xl">CRM comercial privado</h1>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-right sm:block">
              <p className="text-sm font-semibold">{profile.display_name}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/45">{profile.role}</p>
            </div>
            <form action={signOutAction}>
              <button className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-coral hover:text-coral">
                <LogOut className="h-4 w-4" />
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-[28px] border border-white/60 bg-white/80 p-3 shadow-card">
          <nav className="space-y-2">
            {navItems.map((item) => {
              if (item.href === "/contacts/new" && profile.role !== "admin") {
                return null;
              }

              const Icon = item.icon;
              const active = pathname === item.href || (item.href === "/contacts" && pathname.startsWith("/contacts"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active ? "bg-ink text-white" : "text-ink/70 hover:bg-sand"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
