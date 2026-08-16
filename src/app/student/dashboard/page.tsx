import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { ArrowRight, BookOpen, CheckCircle2, Circle, Clock3, Layers3, PlayCircle, Trophy } from "lucide-react";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") redirect("/login");

  const access = await prisma.courseAccess.findFirst({
    where: { userId: user.id, status: "ACTIVE", OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    orderBy: { assignedAt: "asc" },
    include: { course: { include: { sections: { orderBy: { sortOrder: "asc" }, include: { lessons: { orderBy: { sortOrder: "asc" } } } } } } },
  });

  if (!access) {
    return <div className="app-page"><div className="panel mx-auto max-w-2xl p-8 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><BookOpen className="h-6 w-6" /></span><h1 className="mt-4 text-xl font-black text-slate-950">Your course is not assigned yet</h1><p className="mt-2 text-sm text-slate-500">Please contact the administrator to activate your learning access.</p></div></div>;
  }

  const lessons = access.course.sections.flatMap((section) => section.lessons);
  const progress = lessons.length ? await prisma.lessonProgress.findMany({ where: { userId: user.id, lessonId: { in: lessons.map((lesson) => lesson.id) } } }) : [];
  const completedIds = new Set(progress.filter((item) => item.completedAt).map((item) => item.lessonId));
  const completedCount = completedIds.size;
  const totalLessons = lessons.length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? lessons[0] ?? null;

  return (
    <div className="app-page space-y-7">
      <section>
        <p className="text-sm font-bold text-indigo-600">Learning Overview</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-slate-950 sm:text-4xl">Hi {user.name}, keep going.</h1>
        <p className="mt-2 text-sm text-slate-500 sm:text-base">Your progress is saved as you complete each lesson.</p>
      </section>

      <section className="keep-dark overflow-hidden rounded-3xl bg-gradient-to-br from-[#15104a] via-[#2f2a86] to-[#5b45f4] p-6 text-white shadow-[0_24px_60px_rgba(79,70,229,.24)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white"><BookOpen className="h-3.5 w-3.5" /> Your Course</span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">Your Learning Program</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100/80">Complete each module in order and keep building your progress step by step.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Link href={`/student/courses/${access.course.slug}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5">{completedCount ? "Continue Learning" : "Start Course"} <ArrowRight className="h-4 w-4" /></Link><span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> {completedCount}/{totalLessons} completed</span></div>
          </div>
          <div className="mx-auto grid h-36 w-36 place-items-center rounded-full p-2.5" style={{ background: `conic-gradient(#ffffff ${percent}%, rgba(255,255,255,.18) 0)` }}><div className="grid h-full w-full place-items-center rounded-full bg-[#201d67]"><div className="text-center"><p className="text-3xl font-black text-white">{percent}%</p><p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">Progress</p></div></div></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="metric-card"><span className="icon-tile bg-indigo-50 text-indigo-600"><Layers3 className="h-5 w-5" /></span><p className="mt-5 text-2xl font-black text-slate-950">{access.course.sections.length}</p><p className="mt-1 text-xs font-semibold text-slate-500">Modules</p></div>
        <div className="metric-card"><span className="icon-tile bg-violet-50 text-violet-600"><PlayCircle className="h-5 w-5" /></span><p className="mt-5 text-2xl font-black text-slate-950">{totalLessons}</p><p className="mt-1 text-xs font-semibold text-slate-500">Lessons</p></div>
        <div className="metric-card"><span className="icon-tile bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span><p className="mt-5 text-2xl font-black text-slate-950">{completedCount}</p><p className="mt-1 text-xs font-semibold text-slate-500">Completed</p></div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Course Roadmap</h2>
              <p className="mt-1 text-xs text-slate-500">{access.course.sections.length} modules • {totalLessons} lessons</p>
            </div>
            <BookOpen className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="mt-5 space-y-3">
            {access.course.sections.slice(0, 6).map((section, index) => {
              const ids = section.lessons.map((lesson) => lesson.id);
              const done = ids.filter((id) => completedIds.has(id)).length;
              const sectionPercent = ids.length ? Math.round((done / ids.length) * 100) : 0;

              return (
                <div key={section.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-xs font-black text-slate-500 shadow-sm">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-xs font-bold text-slate-900">{section.title}</p>
                        <span className="text-[10px] font-semibold text-slate-400">{done}/{ids.length}</span>
                      </div>
                      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200/70">
                        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ width: `${sectionPercent}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="panel p-5 sm:p-6">
            <h2 className="text-base font-black text-slate-900">Up Next</h2>
            {nextLesson ? (
              <>
                <div className="mt-4 flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><PlayCircle className="h-5 w-5" /></span>
                  <div><p className="text-sm font-bold text-slate-900">{nextLesson.title}</p><p className="mt-1 text-xs text-slate-400">Continue with your next lesson</p></div>
                </div>
                <Link href={`/student/courses/${access.course.slug}`} className="btn-secondary mt-5 w-full">Open lesson <ArrowRight className="h-4 w-4" /></Link>
              </>
            ) : <p className="mt-4 text-sm text-slate-500">No lessons have been added yet.</p>}
          </div>

          <div className="panel p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600"><Trophy className="h-5 w-5" /></span>
              <div><p className="text-sm font-black text-slate-900">Completion Goal</p><p className="mt-1 text-xs text-slate-500">Finish every lesson to reach 100%.</p></div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
              {percent === 100 ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-slate-300" />}
              {percent === 100 ? "Course completed — excellent work." : `${totalLessons - completedCount} lessons remaining`}
            </div>
          </div>

          <div className="panel flex items-center gap-3 p-5">
            <Clock3 className="h-5 w-5 text-indigo-500" />
            <div><p className="text-sm font-black text-slate-900">Progress Saved</p><p className="mt-1 text-xs text-slate-500">Your completed lessons remain synced with your account.</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
