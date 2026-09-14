"use client";

import BrandLogo from "@/components/branding/BrandLogo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      router.replace(data.user.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard");
      router.refresh();
    } catch { setError("Unable to sign in. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <main className="grid min-h-screen bg-[#f7f8fc] lg:grid-cols-[.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden bg-[#0b1020] p-10 lg:flex lg:flex-col lg:justify-between">
        {/* Premium background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,#111827_0%,#0d1324_48%,#080c17_100%)]" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-600/[0.14] blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-32 right-[-80px] h-96 w-96 rounded-full bg-indigo-500/[0.10] blur-[110px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_28%,rgba(255,255,255,.035),transparent_22rem)]" />

        {/* Brand */}
        <Link
          href="/"
          className="relative z-10 inline-flex w-fit items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 backdrop-blur-xl transition hover:bg-white/[0.06]"
        >
          <BrandLogo />

          <div>
            <p className="text-sm font-black tracking-[-0.02em] text-white">
              Muhammad Kashif <span className="text-violet-300">LMS</span>
            </p>
            <p className="mt-0.5 text-[10px] font-medium tracking-wide text-slate-500">
              Private Learning Portal
            </p>
          </div>
        </Link>

        {/* Main message */}
        <div className="relative z-10 max-w-[620px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/[0.15] bg-violet-500/[0.08] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,.75)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-300">
              Learning Workspace
            </span>
          </div>

          <h1 className="mt-6 max-w-[590px] text-[50px] font-black leading-[1.04] tracking-[-0.055em] text-white xl:text-[58px]">
            Learn with focus.
            <span className="mt-1 block bg-gradient-to-r from-slate-200 via-violet-200 to-slate-400 bg-clip-text text-transparent">
              Grow with confidence.
            </span>
          </h1>

          <p className="mt-6 max-w-[535px] text-[15px] leading-7 text-slate-400">
            Access your learning content, continue where you left off and keep
            track of your progress from one simple workspace.
          </p>

          <div className="mt-8 flex w-fit items-center gap-3 rounded-xl border border-emerald-400/[0.12] bg-emerald-400/[0.055] px-4 py-3">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-400/[0.08]">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </span>

            <div>
              <p className="text-xs font-bold text-emerald-300">
                Protected access
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Secure account authentication
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
          © Muhammad Kashif LMS
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 transition hover:text-indigo-600 lg:hidden"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
          <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">Secure Sign In</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Welcome back</h2><p className="mt-2 text-sm text-slate-500">Enter the credentials provided by your administrator.</p></div>
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(16,24,40,.08)] sm:p-7">
            <div><label htmlFor="email" className="mb-2 block text-xs font-bold text-slate-600">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="field pl-10" placeholder="you@example.com" /></div></div>
            <div className="mt-5"><label htmlFor="password" className="mb-2 block text-xs font-bold text-slate-600">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required className="field px-10" placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-600">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-3">{loading ? "Signing in..." : "Sign in securely"}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
