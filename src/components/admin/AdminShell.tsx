"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpenText,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

interface AdminShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Students", icon: UsersRound },
  { href: "/admin/courses", label: "Course Studio", icon: BookOpenText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminShell({ userName, userEmail, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    const value = search.trim();
    if (!value) return;
    router.push(`/admin/users?q=${encodeURIComponent(value)}`);
  }

  const sidebar = (
    <>
            <div className="px-4 pt-4">
        <Link
          href="/admin/dashboard"
          onClick={() => setMenuOpen(false)}
          className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3 shadow-[0_12px_35px_rgba(0,0,0,.14)] backdrop-blur-xl transition hover:border-violet-400/20 hover:bg-white/[0.065]"
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-500 shadow-[0_8px_24px_rgba(99,102,241,.28)]">
            <GraduationCap className="relative z-10 h-[22px] w-[22px] text-white" strokeWidth={2.1} />
            <span className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/20 blur-lg" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-[15px] font-black tracking-[-0.02em] text-white">
              Kashif <span className="text-violet-300">LMS</span>
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />
              <span className="text-[10px] font-semibold tracking-wide text-slate-500">
                Management Console
              </span>
            </div>
          </div>
        </Link>
      </div>

      <div className="px-3 pt-6">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[.22em] text-slate-600">Workspace</p>
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                  active
                    ? "bg-white/[0.075] text-white ring-1 ring-white/[0.08] shadow-[inset_3px_0_0_#8b5cf6,0_8px_25px_rgba(0,0,0,.08)]"
                    : "text-slate-400 hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-4 mt-auto border-t border-white/[0.08] pt-5">
        <p className="px-1 text-[11px] text-slate-600">Signed in as</p>
        <div className="mt-3 flex items-center gap-3 px-1">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-500/15 text-xs font-black text-indigo-300 ring-1 ring-indigo-400/20">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{userName}</p>
            <p className="mt-0.5 truncate text-[11px] text-slate-500">{userEmail}</p>
          </div>
        </div>
        <div className="pb-5 pt-4"><LogoutButton /></div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <aside className="premium-sidebar fixed inset-y-0 left-0 z-40 hidden w-[276px] flex-col border-r border-white/[0.07] lg:flex">
        {sidebar}
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Close menu overlay" />
          <aside className="premium-sidebar relative flex h-full w-[86%] max-w-[292px] flex-col shadow-2xl">
            <button onClick={() => setMenuOpen(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white" aria-label="Close menu">
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1 lg:ml-[276px]">
        <header className="sticky top-0 z-30 flex h-[86px] items-center gap-3 border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <form onSubmit={submitSearch} className="relative min-w-0 flex-1 lg:max-w-3xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              placeholder="Search students..."
              aria-label="Search students"
            />
          </form>
          <span className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600 sm:inline-flex"><ShieldCheck className="h-4 w-4" /> Secure</span>
          <Link
            href="/admin/settings"
            title="Admin Settings"
            aria-label="Open admin settings"
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-[0_8px_25px_rgba(124,58,237,.28)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(124,58,237,.4)]"
          >
            <UserRound className="h-[22px] w-[22px] text-white" strokeWidth={2.2} />
            <span
              className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500"
              aria-hidden="true"
            />
          </Link>
        </header>

        <main className="surface-light min-h-[calc(100vh-86px)]">{children}</main>
      </div>
    </div>
  );
}

