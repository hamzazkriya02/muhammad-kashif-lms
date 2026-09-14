import BrandLogo from "@/components/branding/BrandLogo";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <BrandLogo />
          <div><p className="text-sm font-black text-slate-950">Muhammad Kashif LMS</p><p className="mt-0.5 text-[11px] font-medium text-slate-400">Private Learning Portal</p></div>
        </Link>
        <Link href="/login" className="btn-primary px-4 py-2.5">Sign in <ArrowRight className="h-4 w-4" /></Link>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600"><ShieldCheck className="h-3.5 w-3.5" /> Secure enrolled-student access</div>
          <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-.045em] text-slate-950 sm:text-5xl lg:text-7xl">Learn at your own pace, from one focused workspace.</h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">A simple, private learning portal for structured lessons, course progress and secure student access.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/login" className="btn-primary px-6 py-3">Open Learning Portal <ArrowRight className="h-4 w-4" /></Link><span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500 shadow-sm"><BookOpenCheck className="h-4 w-4 text-indigo-500" /> Progress saved automatically</span></div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-indigo-100/80 via-violet-50 to-transparent blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(16,24,40,.12)] sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5"><div className="flex items-center gap-3"><BrandLogo /><div><p className="text-sm font-black text-slate-900">Learning Dashboard</p><p className="mt-0.5 text-[11px] text-slate-400">Your private workspace</p></div></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">Active</span></div>
            <div className="mt-6 grid grid-cols-3 gap-3">{[["12","Lessons"],["6","Completed"],["50%","Progress"]].map(([value,label]) => <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center"><p className="text-xl font-black text-slate-950">{value}</p><p className="mt-1 text-[10px] font-semibold text-slate-400">{label}</p></div>)}</div>
            <div className="mt-5 rounded-2xl border border-slate-100 p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold text-slate-900">Continue Learning</p><p className="mt-1 text-[11px] text-slate-400">Resume your next lesson</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><ArrowRight className="h-4 w-4" /></span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" /></div></div>
          </div>
        </div>
      </section>
    </main>
  );
}
