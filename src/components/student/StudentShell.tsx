"use client";

import BrandLogo from "@/components/branding/BrandLogo";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Home, KeyRound, LogOut, Menu, UserRound, X } from "lucide-react";

interface StudentShellProps {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
}

export default function StudentShell({ userName, userEmail, children }: StudentShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const links = [
    { href: "/student/dashboard", label: "Learning Home", icon: Home },
    { href: "/student/change-password", label: "Account Security", icon: KeyRound },
  ];

  const sidebar = (
    <>
            <div className="px-4 pt-4">
        <Link
          href="/student/dashboard"
          onClick={() => setMenuOpen(false)}
          className="group flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.045] px-3.5 py-3 shadow-[0_12px_35px_rgba(0,0,0,.14)] backdrop-blur-xl transition hover:border-violet-400/20 hover:bg-white/[0.065]"
        >
          <BrandLogo />

          <div className="min-w-0">
            <p className="truncate text-[15px] font-black tracking-[-0.02em] text-white">
              Kashif <span className="text-violet-300">LMS</span>
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.7)]" />
              <span className="text-[10px] font-semibold tracking-wide text-slate-500">
                Learning Workspace
              </span>
            </div>
          </div>
        </Link>
      </div>

      <nav className="space-y-1.5 px-3 pt-6">
        {links.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-white/[0.075] text-white ring-1 ring-white/[0.08] shadow-[inset_3px_0_0_#8b5cf6,0_8px_25px_rgba(0,0,0,.08)]" : "text-slate-400 hover:bg-white/[0.055] hover:text-white"}`}><Icon className="h-[18px] w-[18px]" />{item.label}</Link>;
        })}
      </nav>
      <div className="mx-4 mt-7 overflow-hidden rounded-2xl border border-violet-400/[0.12] bg-gradient-to-br from-violet-500/[0.08] via-white/[0.025] to-blue-500/[0.04] p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-500/10 text-violet-300 ring-1 ring-violet-400/10">
            <BookOpen className="h-4 w-4" />
          </span>
          <div>
            <p className="text-xs font-bold text-white">Your Learning Space</p>
            <p className="mt-0.5 text-[10px] text-slate-500">Keep making progress</p>
          </div>
        </div>
      </div>
      <div className="mx-4 mt-auto border-t border-white/[0.08] pb-5 pt-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-[0_8px_20px_rgba(124,58,237,.25)]">
            <UserRound className="h-[19px] w-[19px] text-white" strokeWidth={2.2} />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#111827] bg-emerald-500" />
          </div>
          <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{userName}</p><p className="mt-0.5 truncate text-[11px] text-slate-500">{userEmail}</p></div>
        </div>
        <button onClick={handleLogout} className="sidebar-action"><LogOut className="h-4 w-4" /> Sign out</button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] lg:flex">
      <aside className="premium-sidebar fixed inset-y-0 left-0 z-40 hidden w-[276px] flex-col border-r border-white/[0.07] lg:flex">{sidebar}</aside>
      {menuOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm" onClick={() => setMenuOpen(false)} aria-label="Close overlay" /><aside className="premium-sidebar relative flex h-full w-[86%] max-w-[292px] flex-col"><button onClick={() => setMenuOpen(false)} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white" aria-label="Close menu"><X className="h-4 w-4" /></button>{sidebar}</aside></div>}
      <div className="min-w-0 flex-1 lg:ml-[276px]">
        <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><button onClick={() => setMenuOpen(true)} className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button><div><p className="text-xs font-semibold text-slate-400">Welcome back</p><p className="text-sm font-black text-slate-900">{userName}</p></div></div>
          <Link
            href="/student/change-password"
            title="Student Account"
            aria-label="Open student account"
            className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 shadow-[0_8px_25px_rgba(124,58,237,.28)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(124,58,237,.4)]"
          >
            <UserRound className="h-[22px] w-[22px] text-white" strokeWidth={2.2} />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-emerald-500" />
          </Link>
        </header>
        <main className="surface-light min-h-[calc(100vh-78px)]">{children}</main>
      </div>
    </div>
  );
}

