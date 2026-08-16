import { redirect } from "next/navigation";
import { BarChart3, CheckCircle2, Clock3, ShieldCheck, UsersRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const [students, completed, logins, alerts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        lessonProgress: { select: { completedAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lessonProgress.count({ where: { completedAt: { not: null } } }),
    prisma.loginHistory.count({ where: { success: true } }),
    prisma.securityAlert.count({ where: { resolvedAt: null } }),
  ]);

  const ranked = students
    .map((student) => ({ ...student, completed: student.lessonProgress.filter((item) => item.completedAt).length }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 8);

  return (
    <div className="app-page space-y-7">
      <div><p className="eyebrow">Platform Insights</p><h1 className="page-title mt-1">Analytics</h1><p className="page-subtitle">Monitor learning activity, engagement and account security from one place.</p></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="metric-card"><span className="icon-tile bg-indigo-50 text-indigo-600"><UsersRound className="h-5 w-5" /></span><p className="mt-6 text-3xl font-black text-slate-950">{students.length}</p><p className="mt-1 text-xs font-semibold text-slate-500">Registered Students</p></div>
        <div className="metric-card"><span className="icon-tile bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><p className="mt-6 text-3xl font-black text-slate-950">{completed}</p><p className="mt-1 text-xs font-semibold text-slate-500">Lesson Completions</p></div>
        <div className="metric-card"><span className="icon-tile bg-cyan-50 text-cyan-600"><Clock3 className="h-5 w-5" /></span><p className="mt-6 text-3xl font-black text-slate-950">{logins}</p><p className="mt-1 text-xs font-semibold text-slate-500">Successful Logins</p></div>
        <div className="metric-card"><span className="icon-tile bg-amber-50 text-amber-600"><ShieldCheck className="h-5 w-5" /></span><p className="mt-6 text-3xl font-black text-slate-950">{alerts}</p><p className="mt-1 text-xs font-semibold text-slate-500">Open Security Alerts</p></div>
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-base font-black text-slate-900">Student Activity</h2><p className="mt-1 text-xs text-slate-500">Learners ranked by completed lessons</p></div><BarChart3 className="h-5 w-5 text-indigo-500" /></div>
        <div className="divide-y divide-slate-100">
          {ranked.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No student activity yet.</p> : ranked.map((student, index) => {
            const max = Math.max(ranked[0]?.completed || 1, 1);
            const width = Math.max((student.completed / max) * 100, student.completed ? 8 : 0);
            return <div key={student.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[40px_1fr_110px] sm:items-center sm:px-6">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-50 text-xs font-black text-slate-500">{String(index + 1).padStart(2, "0")}</div>
              <div><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-bold text-slate-900">{student.name}</p><p className="mt-0.5 text-xs text-slate-400">{student.email}</p></div><span className="text-xs font-bold text-indigo-600">{student.completed} completed</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${width}%` }} /></div></div>
              <div className="text-left sm:text-right"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${student.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{student.status === "APPROVED" ? "Active" : "Inactive"}</span></div>
            </div>;
          })}
        </div>
      </section>
    </div>
  );
}
