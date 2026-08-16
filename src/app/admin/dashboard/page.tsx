import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Clock3,
  Layers3,
  PlayCircle,
  UserCheck,
  UserPlus,
  UsersRound,
} from "lucide-react";

function progressFromAccess(access: {
  course: { sections: { lessons: { id: string }[] }[] };
  user: { lessonProgress: { lessonId: string; completedAt: Date | null }[] };
}) {
  const lessonIds = new Set(access.course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)));
  if (!lessonIds.size) return 0;
  const done = access.user.lessonProgress.filter((item) => item.completedAt && lessonIds.has(item.lessonId)).length;
  return Math.round((done / lessonIds.size) * 100);
}

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const [studentCount, activeStudents, courseCount, moduleCount, lessonCount, completedLessons, recentStudents, activeAccess, recentCompletions] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "STUDENT", status: "APPROVED" } }),
    prisma.course.count(),
    prisma.courseSection.count(),
    prisma.lesson.count(),
    prisma.lessonProgress.count({ where: { completedAt: { not: null } } }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        lessonProgress: { select: { lessonId: true, completedAt: true } },
        courseAccess: {
          where: { status: "ACTIVE" },
          take: 1,
          select: { course: { select: { sections: { select: { lessons: { select: { id: true } } } } } } },
        },
      },
    }),
    prisma.courseAccess.findMany({
      where: { status: "ACTIVE", user: { role: "STUDENT", status: "APPROVED" } },
      select: {
        userId: true,
        course: { select: { sections: { select: { lessons: { select: { id: true } } } } } },
        user: { select: { lessonProgress: { select: { lessonId: true, completedAt: true } } } },
      },
    }),
    prisma.lessonProgress.findMany({
      where: { completedAt: { gte: since } },
      select: { completedAt: true },
    }),
  ]);

  const progressValues = activeAccess.map(progressFromAccess);
  const avgProgress = progressValues.length ? Math.round(progressValues.reduce((sum, value) => sum + value, 0) / progressValues.length) : 0;
  const completeStudents = progressValues.filter((value) => value === 100).length;
  const inProgressStudents = progressValues.filter((value) => value > 0 && value < 100).length;
  const notStartedStudents = Math.max(activeStudents - completeStudents - inProgressStudents, 0);
  const distributionTotal = Math.max(completeStudents + inProgressStudents + notStartedStudents, 1);
  const completeDeg = (completeStudents / distributionTotal) * 360;
  const inProgressDeg = (inProgressStudents / distributionTotal) * 360;

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(since);
    date.setDate(since.getDate() + index);
    return date;
  });
  const activity = days.map((date) => {
    const key = date.toISOString().slice(0, 10);
    return recentCompletions.filter((item) => item.completedAt?.toISOString().slice(0, 10) === key).length;
  });
  const maxActivity = Math.max(...activity, 1);
  const points = activity.map((value, index) => ({
    x: 24 + index * (552 / 6),
    y: 148 - (value / maxActivity) * 112,
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L576,160 L24,160 Z`;

  const stats = [
    { label: "Total Students", value: studentCount, icon: UsersRound, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Active Students", value: activeStudents, icon: UserCheck, tone: "bg-emerald-50 text-emerald-600" },
    { label: "Courses", value: courseCount, icon: BookOpenText, tone: "bg-amber-50 text-amber-600" },
    { label: "Modules", value: moduleCount, icon: Layers3, tone: "bg-cyan-50 text-cyan-600" },
    { label: "Video Lessons", value: lessonCount, icon: PlayCircle, tone: "bg-rose-50 text-rose-600" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: CheckCircle2, tone: "bg-violet-50 text-violet-600" },
  ];

  return (
    <div className="app-page space-y-7">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">Overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Welcome, {user.name}.</h1>
          <p className="mt-2 text-sm text-slate-500 sm:text-base">Here&apos;s what is happening across your learning platform.</p>
        </div>
        <Link href="/admin/users" className="btn-primary w-fit px-5 py-3">
          Add Student <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="metric-card min-h-[170px]">
            <span className={`icon-tile ${tone}`}><Icon className="h-5 w-5" /></span>
            <p className="mt-7 text-3xl font-black tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_.75fr]">
        <article className="panel overflow-hidden p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-base font-black text-slate-900">Learning Activity</h2><p className="mt-1 text-xs text-slate-500">Lesson completions during the last 7 days</p></div>
            <div className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">{recentCompletions.length} completions</div>
          </div>
          <div className="analytics-grid mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/70 px-3 pb-2 pt-4">
            <svg viewBox="0 0 600 175" className="h-[230px] w-full" role="img" aria-label="Seven day learning activity chart">
              <defs>
                <linearGradient id="activityFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#5b45f4" stopOpacity=".24" /><stop offset="100%" stopColor="#5b45f4" stopOpacity="0" /></linearGradient>
              </defs>
              <path d={areaPath} fill="url(#activityFill)" />
              <path d={linePath} fill="none" stroke="#5b45f4" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="5" fill="#ffffff" stroke="#5b45f4" strokeWidth="3" />)}
            </svg>
            <div className="grid grid-cols-7 px-1 text-center text-[10px] font-semibold text-slate-400 sm:text-xs">
              {days.map((date) => <span key={date.toISOString()}>{date.toLocaleDateString("en-US", { weekday: "short" })}</span>)}
            </div>
          </div>
        </article>

        <article className="panel p-5 sm:p-6">
          <h2 className="text-base font-black text-slate-900">Student Progress</h2>
          <p className="mt-1 text-xs text-slate-500">Current learning status distribution</p>
          <div className="mx-auto mt-7 grid h-52 w-52 place-items-center rounded-full p-[22px]" style={{ background: `conic-gradient(#5b45f4 0 ${completeDeg}deg, #8b7cf8 ${completeDeg}deg ${completeDeg + inProgressDeg}deg, #d7dce5 ${completeDeg + inProgressDeg}deg 360deg)` }}>
            <div className="grid h-full w-full place-items-center rounded-full bg-white shadow-inner"><div className="text-center"><p className="text-3xl font-black text-slate-950">{avgProgress}%</p><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average</p></div></div>
          </div>
          <div className="mt-7 space-y-3 text-xs">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-500"><i className="h-2.5 w-2.5 rounded-full bg-indigo-600" />Completed</span><strong className="text-slate-900">{completeStudents}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-500"><i className="h-2.5 w-2.5 rounded-full bg-violet-400" />In Progress</span><strong className="text-slate-900">{inProgressStudents}</strong></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-500"><i className="h-2.5 w-2.5 rounded-full bg-slate-300" />Not Started</span><strong className="text-slate-900">{notStartedStudents}</strong></div>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><h2 className="text-base font-black text-slate-900">Recent Students</h2><p className="mt-1 text-xs text-slate-500">Latest learner accounts added to the platform</p></div>
            <Link href="/admin/users" className="text-xs font-bold text-indigo-600 hover:text-indigo-500">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400"><th className="px-6 py-3">Student</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Joined</th><th className="px-6 py-3 text-right">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {recentStudents.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No students yet.</td></tr> : recentStudents.map((student) => {
                  const access = student.courseAccess[0];
                  const lessonIds = new Set(access?.course.sections.flatMap((section) => section.lessons.map((lesson) => lesson.id)) ?? []);
                  const done = student.lessonProgress.filter((item) => item.completedAt && lessonIds.has(item.lessonId)).length;
                  const progress = lessonIds.size ? Math.round((done / lessonIds.size) * 100) : 0;
                  return <tr key={student.id} className="text-sm">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-indigo-50 text-xs font-black text-indigo-600">{student.name.slice(0,1).toUpperCase()}</div><div className="min-w-0"><p className="truncate font-bold text-slate-900">{student.name}</p><p className="mt-0.5 truncate text-xs text-slate-400">{student.email}</p></div></div></td>
                    <td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${progress}%` }} /></div><span className="text-xs font-bold text-slate-600">{progress}%</span></div></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" />{student.createdAt.toLocaleDateString()}</span></td>
                    <td className="px-6 py-4 text-right"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${student.status === "APPROVED" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{student.status === "APPROVED" ? "Active" : "Disabled"}</span></td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        </article>

        <article className="panel p-5 sm:p-6">
          <h2 className="text-base font-black text-slate-900">Quick Actions</h2><p className="mt-1 text-xs text-slate-500">Common administration tasks</p>
          <div className="mt-5 space-y-3">
            <Link href="/admin/users" className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><UserPlus className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-bold text-slate-900">Add Student</p><p className="mt-1 text-[11px] text-slate-400">Create learner access</p></div><ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500" /></Link>
            <Link href="/admin/courses" className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-violet-200 hover:bg-violet-50/50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><PlayCircle className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-bold text-slate-900">Manage Lessons</p><p className="mt-1 text-[11px] text-slate-400">Open Course Studio</p></div><ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-violet-500" /></Link>
            <Link href="/admin/analytics" className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50"><span className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-600"><CheckCircle2 className="h-5 w-5" /></span><div className="flex-1"><p className="text-sm font-bold text-slate-900">View Analytics</p><p className="mt-1 text-[11px] text-slate-400">Review learning progress</p></div><ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-cyan-500" /></Link>
          </div>
        </article>
      </section>

      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div><h2 className="text-base font-black text-slate-900">Content Overview</h2><p className="mt-1 text-xs text-slate-500">Your course structure and lessons are managed privately inside Course Studio.</p></div>
        <div className="flex flex-wrap gap-2"><span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600">{moduleCount} Modules</span><span className="rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold text-violet-600">{lessonCount} Lessons</span><span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">{completedLessons} Completions</span><Link href="/admin/courses" className="btn-secondary px-3 py-2 text-xs">Open Studio <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
      </section>
    </div>
  );
}
