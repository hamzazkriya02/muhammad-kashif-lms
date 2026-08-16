"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Circle, Layers3, PlayCircle } from "lucide-react";
import YoutubePlayer from "@/components/video/YoutubePlayer";

interface Lesson { id: string; title: string; youtubeId: string | null; }
interface Section { id: string; title: string; lessons: Lesson[]; }
interface Course { id: string; title: string; slug: string; description: string | null; sections: Section[]; }
interface Progress { lessonId: string; percent: number; completedAt: string | null; }

export default function StudentCoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/student/courses", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load course");
        if (cancelled) return;
        const found = (data.courses || []).find((item: Course) => item.slug === slug) || null;
        const progressList: Progress[] = data.progress || [];
        setCourse(found);
        setProgress(progressList);
        if (found) {
          const lessons: Lesson[] = found.sections.flatMap((section: Section) => section.lessons);
          const firstIncomplete = lessons.find((lesson) => !progressList.some((item) => item.lessonId === lesson.id && item.completedAt));
          setActiveLesson(firstIncomplete || lessons[0] || null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [slug]);

  const allLessons = useMemo(() => course?.sections.flatMap((section) => section.lessons) || [], [course]);
  const completedIds = useMemo(() => new Set(progress.filter((item) => item.completedAt).map((item) => item.lessonId)), [progress]);
  const completedCount = allLessons.filter((lesson) => completedIds.has(lesson.id)).length;
  const percent = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const activeIndex = activeLesson ? allLessons.findIndex((lesson) => lesson.id === activeLesson.id) : -1;
  const previousLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;

  async function toggleComplete() {
    if (!activeLesson) return;
    const currentlyComplete = completedIds.has(activeLesson.id);
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/student/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id, completed: !currentlyComplete }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update progress");
      setProgress((current) => {
        const exists = current.some((item) => item.lessonId === activeLesson.id);
        const replacement: Progress = { lessonId: activeLesson.id, percent: currentlyComplete ? 0 : 100, completedAt: currentlyComplete ? null : new Date().toISOString() };
        return exists ? current.map((item) => item.lessonId === activeLesson.id ? replacement : item) : [...current, replacement];
      });
      if (!currentlyComplete && nextLesson) setActiveLesson(nextLesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save progress");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="app-page"><div className="panel p-8 text-center text-sm text-slate-500">Loading your course...</div></div>;
  if (!course) return <div className="app-page"><div className="panel p-8 text-center"><p className="text-sm text-slate-400">{error || "Course not found or access has expired."}</p><Link href="/student/dashboard" className="btn-secondary mt-4">Back to dashboard</Link></div></div>;

  return (
    <div className="app-page space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div><Link href="/student/dashboard" className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Learning Home</Link><p className="eyebrow">Course Learning</p><h1 className="page-title mt-1">{course.title}</h1><p className="page-subtitle">{completedCount} of {allLessons.length} lessons completed</p></div>
        <div className="min-w-64"><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">Course progress</span><span className="font-bold text-violet-200">{percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all" style={{ width: `${percent}%` }} /></div></div>
      </div>

      {error && <div className="rounded-xl border border-rose-400/15 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <section className="space-y-4">
          <div className="panel overflow-hidden p-2 sm:p-3">
            {activeLesson?.youtubeId ? <YoutubePlayer youtubeId={activeLesson.youtubeId} title={activeLesson.title} /> : <div className="grid aspect-video place-items-center rounded-2xl bg-black/30"><p className="text-sm text-slate-600">Select a video lesson</p></div>}
          </div>

          {activeLesson && (
            <div className="panel p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-violet-300">Now Learning</p><h2 className="mt-1 text-lg font-bold text-white">{activeLesson.title}</h2><p className="mt-1 text-xs text-slate-600">Lesson {activeIndex + 1} of {allLessons.length}</p></div><button onClick={toggleComplete} disabled={saving} className={completedIds.has(activeLesson.id) ? "btn-secondary border-emerald-400/15 bg-emerald-500/10 text-emerald-300" : "btn-primary"}>{completedIds.has(activeLesson.id) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}{saving ? "Saving..." : completedIds.has(activeLesson.id) ? "Completed" : "Mark Complete"}</button></div>
              <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4"><button disabled={!previousLesson} onClick={() => previousLesson && setActiveLesson(previousLesson)} className="btn-secondary px-3 py-2 text-xs"><ChevronLeft className="h-4 w-4" /> Previous</button><button disabled={!nextLesson} onClick={() => nextLesson && setActiveLesson(nextLesson)} className="btn-secondary px-3 py-2 text-xs">Next <ChevronRight className="h-4 w-4" /></button></div>
            </div>
          )}
        </section>

        <aside className="panel h-fit overflow-hidden xl:sticky xl:top-6">
          <div className="border-b border-white/[0.07] p-4 sm:p-5"><div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-violet-300" /><p className="text-sm font-bold text-white">Course Content</p></div><p className="mt-1 text-xs text-slate-500">{course.sections.length} modules • {allLessons.length} lessons</p></div>
          <div className="max-h-[70vh] overflow-y-auto p-3">
            {course.sections.map((section, sectionIndex) => {
              const sectionDone = section.lessons.filter((lesson) => completedIds.has(lesson.id)).length;
              return <div key={section.id} className="mb-3 overflow-hidden rounded-xl border border-white/[0.07] bg-white/[0.018]"><div className="flex items-center justify-between border-b border-white/[0.05] px-3.5 py-3"><div className="min-w-0"><p className="truncate text-xs font-bold text-white">{sectionIndex + 1}. {section.title}</p><p className="mt-1 text-[10px] text-slate-600">{sectionDone}/{section.lessons.length} completed</p></div></div><div className="p-1.5">{section.lessons.map((lesson) => { const active = activeLesson?.id === lesson.id; const completed = completedIds.has(lesson.id); return <button key={lesson.id} onClick={() => setActiveLesson(lesson)} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition ${active ? "bg-violet-500/10 text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"}`}><span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${completed ? "bg-emerald-500/10 text-emerald-300" : active ? "bg-violet-500/15 text-violet-300" : "bg-white/[0.04] text-slate-600"}`}>{completed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <PlayCircle className="h-3.5 w-3.5" />}</span><span className="min-w-0 flex-1 truncate text-xs font-medium">{lesson.title}</span></button>; })}</div></div>;
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
