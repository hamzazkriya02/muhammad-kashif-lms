"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

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
      <section className="premium-sidebar relative hidden overflow-hidden p-10 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(91,69,244,.28),transparent_32%),radial-gradient(circle_at_80%_75%,rgba(124,58,237,.16),transparent_30%)]" />
        <Link href="/" className="relative z-10 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600"><GraduationCap className="h-5 w-5 text-white" /></span><div><p className="text-sm font-black text-white">Muhammad Kashif LMS</p><p className="mt-0.5 text-[11px] text-slate-500">Private Learning Portal</p></div></Link>
        <div className="relative z-10 max-w-xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Student Workspace</p><h1 className="mt-5 text-5xl font-black leading-[1.08] tracking-[-.04em] text-white">Everything you need to keep learning, in one place.</h1><p className="mt-5 max-w-lg text-base leading-7 text-slate-400">Sign in to access your assigned content, continue lessons and track your progress securely.</p><div className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"><ShieldCheck className="h-4 w-4" /> Protected account access</div></div>
        <p className="relative z-10 text-xs text-slate-600">© Muhammad Kashif LMS</p>
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
