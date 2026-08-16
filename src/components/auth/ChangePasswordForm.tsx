"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";

export default function ChangePasswordForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) return setError("New passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/student/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json();
      if (!res.ok) return setError(data.error || "Unable to change password");
      router.replace("/login");
      router.refresh();
    } catch { setError("Unable to change password. Please try again."); }
    finally { setLoading(false); }
  }

  const fields = [
    { label: "Current password", value: currentPassword, setter: setCurrentPassword, autocomplete: "current-password" },
    { label: "New password", value: newPassword, setter: setNewPassword, autocomplete: "new-password" },
    { label: "Confirm new password", value: confirmPassword, setter: setConfirmPassword, autocomplete: "new-password" },
  ];

  return (
    <form onSubmit={submit} className="panel p-5 sm:p-7">
      <div className="mb-6 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10"><ShieldCheck className="h-5 w-5 text-emerald-300" /></span><div><h2 className="text-sm font-bold text-white">Update your password</h2><p className="mt-1 text-xs text-slate-500">All active sessions will be signed out after the change.</p></div></div>
      <div className="space-y-4">{fields.map((field) => <div key={field.label}><label className="mb-2 block text-xs font-semibold text-slate-300">{field.label}</label><div className="relative"><KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input className="field px-10" type={show ? "text" : "password"} autoComplete={field.autocomplete} value={field.value} onChange={(e) => field.setter(e.target.value)} required /><button type="button" onClick={() => setShow((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white" aria-label={show ? "Hide passwords" : "Show passwords"}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>)}</div>
      <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3 text-[11px] leading-5 text-slate-500">Use at least 10 characters with uppercase, lowercase and a number.</div>
      {error && <div className="mt-4 rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">{error}</div>}
      <button disabled={loading} className="btn-primary mt-5 w-full">{loading ? "Updating..." : "Change Password & Sign Out"}</button>
    </form>
  );
}
