"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, KeyRound, ShieldCheck, UserCog } from "lucide-react";

export default function AdminSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/create-admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, password }) });
      const data = await res.json();
      if (!res.ok) return setMessage({ type: "error", text: data.error || "Unable to create administrator" });
      setMessage({ type: "success", text: `Administrator created: ${data.admin.email}` }); setName(""); setEmail(""); setPassword("");
    } catch { setMessage({ type: "error", text: "Unable to create administrator" }); }
    finally { setLoading(false); }
  }

  return (
    <div className="app-page space-y-7">
      <div><p className="eyebrow">System Settings</p><h1 className="page-title mt-1">Settings & Security</h1><p className="page-subtitle">Manage administrator access and your own account security.</p></div>
      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <form onSubmit={submit} className="panel p-5 sm:p-7"><div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10"><UserCog className="h-5 w-5 text-violet-300" /></span><div><h2 className="text-sm font-bold text-white">Create Administrator</h2><p className="mt-1 text-xs text-slate-500">Only give admin access to people you fully trust.</p></div></div><div className="space-y-4"><div><label className="mb-2 block text-xs font-semibold text-slate-300">Full name</label><input className="field" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} /></div><div><label className="mb-2 block text-xs font-semibold text-slate-300">Email</label><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div><label className="mb-2 block text-xs font-semibold text-slate-300">Secure password</label><div className="relative"><KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input className="field px-10" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>{message && <div className={`rounded-xl border px-3 py-2.5 text-xs ${message.type === "success" ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300" : "border-rose-400/15 bg-rose-500/10 text-rose-300"}`}>{message.text}</div>}<button disabled={loading} className="btn-primary w-full">{loading ? "Creating..." : "Create Administrator"}</button></div></form>
        <div className="space-y-5"><div className="panel p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10"><ShieldCheck className="h-5 w-5 text-emerald-300" /></span><div><p className="text-sm font-bold text-white">Security Center</p><p className="mt-1 text-xs text-slate-500">Session and password protection is enabled.</p></div></div><div className="mt-5 space-y-3 text-xs text-slate-500"><div className="flex items-center justify-between border-b border-white/[0.06] pb-3"><span>HTTP-only session cookies</span><span className="text-emerald-300">Enabled</span></div><div className="flex items-center justify-between border-b border-white/[0.06] pb-3"><span>Login rate limiting</span><span className="text-emerald-300">Enabled</span></div><div className="flex items-center justify-between"><span>Security headers</span><span className="text-emerald-300">Enabled</span></div></div></div><Link href="/admin/change-password" className="panel flex items-center gap-3 p-5 transition hover:border-violet-400/20"><KeyRound className="h-5 w-5 text-violet-300" /><div className="flex-1"><p className="text-sm font-bold text-white">Change Your Password</p><p className="mt-1 text-xs text-slate-500">Updates your credentials and revokes old sessions.</p></div></Link></div>
      </div>
    </div>
  );
}
