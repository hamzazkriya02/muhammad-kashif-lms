"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit3, ExternalLink, GripVertical, Layers3, PlayCircle, Plus, Save, Trash2, Video } from "lucide-react";
import ResourceEditor from "@/components/lessons/ResourceEditor";
import ResourceLinks from "@/components/lessons/ResourceLinks";
import { parseLessonResources, type LessonResource } from "@/lib/lesson-resources";
import YoutubePlayer from "@/components/video/YoutubePlayer";

interface Lesson { id: string; title: string; youtubeId: string | null; resources?: LessonResource[]; sortOrder: number; }
interface Section { id: string; title: string; sortOrder: number; lessons: Lesson[]; }
interface Course { id: string; title: string; slug: string; description: string | null; sections: Section[]; }

type Message = { type: "success" | "error"; text: string } | null;

export default function CourseBuilderPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleTitle, setModuleTitle] = useState("");
  const [lessonInputs, setLessonInputs] = useState<Record<string, { title: string; youtubeId: string }>>({});
  const [resourceInputs, setResourceInputs] = useState<Record<string, LessonResource[]>>({});
  const [editResources, setEditResources] = useState<LessonResource[]>([]);
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [moduleEditTitle, setModuleEditTitle] = useState("");
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [lessonEdit, setLessonEdit] = useState({ title: "", youtubeId: "" });
  const [preview, setPreview] = useState<Lesson | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [busy, setBusy] = useState(false);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        const found = (data.courses || []).find((item: Course) => item.slug === slug) || null;
        setCourse(found);
        if (found) {
          const availableLessons = found.sections.flatMap((section: Section) => section.lessons);
          setPreview((current) => {
            if (current) {
              const refreshed = availableLessons.find((lesson: Lesson) => lesson.id === current.id);
              if (refreshed) return refreshed;
            }
            return availableLessons.find((lesson: Lesson) => lesson.youtubeId) || null;
          });
        } else {
          setPreview(null);
        }
      }
    } finally { setLoading(false); }
  }, [slug]);

  useEffect(() => { void loadCourse(); }, [loadCourse]);

  function notify(type: "success" | "error", text: string) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3200);
  }

  async function apiPost(url: string, payload: Record<string, unknown>) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  async function addModule(event: React.FormEvent) {
    event.preventDefault();
    if (!course || !moduleTitle.trim()) return;
    setBusy(true);
    try {
      await apiPost("/api/admin/courses/sections", { courseId: course.id, title: moduleTitle });
      setModuleTitle(""); notify("success", "Module added."); await loadCourse();
    } catch (error) { notify("error", error instanceof Error ? error.message : "Unable to add module"); }
    finally { setBusy(false); }
  }

  async function addLesson(sectionId: string) {
    const input = lessonInputs[sectionId];
    if (!input?.title.trim() || !input.youtubeId.trim()) return notify("error", "Enter lesson title and YouTube URL.");
    setBusy(true);
    try {
      const data = await apiPost("/api/admin/courses/lessons", { sectionId, title: input.title, youtubeId: input.youtubeId, resources: parseLessonResources(resourceInputs[sectionId]) });
      setResourceInputs((prev) => ({ ...prev, [sectionId]: [] }));
      setLessonInputs((prev) => ({ ...prev, [sectionId]: { title: "", youtubeId: "" } }));
      setPreview(data.lesson || null); notify("success", "Video lesson added."); await loadCourse();
    } catch (error) { notify("error", error instanceof Error ? error.message : "Unable to add lesson"); }
    finally { setBusy(false); }
  }

  async function saveModule(sectionId: string) {
    if (!moduleEditTitle.trim()) return;
    setBusy(true);
    try { await apiPost("/api/admin/courses/sections/update", { sectionId, title: moduleEditTitle }); setEditingModule(null); notify("success", "Module updated."); await loadCourse(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Unable to update module"); }
    finally { setBusy(false); }
  }

  async function removeModule(sectionId: string) {
    if (!window.confirm("Delete this module and all of its video lessons?")) return;
    setBusy(true);
    try { await apiPost("/api/admin/courses/sections/delete", { sectionId }); notify("success", "Module deleted."); await loadCourse(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Unable to delete module"); }
    finally { setBusy(false); }
  }

  function beginLessonEdit(lesson: Lesson) {
    setEditingLesson(lesson.id);
    setEditResources(lesson.resources || []);
    setLessonEdit({ title: lesson.title, youtubeId: lesson.youtubeId ? `https://youtu.be/${lesson.youtubeId}` : "" });
  }

  async function saveLesson(lessonId: string) {
    setBusy(true);
    try { await apiPost("/api/admin/courses/lessons/update", { lessonId, title: lessonEdit.title, youtubeId: lessonEdit.youtubeId, resources: parseLessonResources(editResources) }); setEditingLesson(null); notify("success", "Lesson updated."); await loadCourse(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Unable to update lesson"); }
    finally { setBusy(false); }
  }

  async function removeLesson(lessonId: string) {
    if (!window.confirm("Delete this video lesson?")) return;
    setBusy(true);
    try { await apiPost("/api/admin/courses/lessons/delete", { lessonId }); if (preview?.id === lessonId) setPreview(null); notify("success", "Lesson deleted."); await loadCourse(); }
    catch (error) { notify("error", error instanceof Error ? error.message : "Unable to delete lesson"); }
    finally { setBusy(false); }
  }

  const lessonCount = useMemo(() => course?.sections.reduce((sum, section) => sum + section.lessons.length, 0) || 0, [course]);

  if (loading && !course) return <div className="app-page"><div className="panel p-8 text-center text-sm text-slate-500">Loading course builder...</div></div>;
  if (!course) return <div className="app-page"><div className="panel p-8"><p className="text-sm text-slate-400">Course not found.</p><Link href="/admin/courses" className="btn-secondary mt-4">Back to Course Studio</Link></div></div>;

  return (
    <div className="app-page space-y-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Course Studio</Link>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="eyebrow">Module Builder</p><h1 className="page-title mt-1">{course.title}</h1><p className="page-subtitle">Add YouTube lessons and attach notes, documents, PDFs or useful links below each video.</p></div><div className="flex gap-2"><span className="panel-soft px-3 py-2 text-xs text-slate-400"><Layers3 className="mr-1.5 inline h-3.5 w-3.5 text-violet-300" /> {course.sections.length} modules</span><span className="panel-soft px-3 py-2 text-xs text-slate-400"><Video className="mr-1.5 inline h-3.5 w-3.5 text-indigo-300" /> {lessonCount} videos</span></div></div>
      {message && <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300" : "border-rose-400/15 bg-rose-500/10 text-rose-300"}`}>{message.text}</div>}

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <form onSubmit={addModule} className="panel p-4 sm:p-5"><div className="flex flex-col gap-3 sm:flex-row"><input className="field flex-1" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} placeholder="New module title, e.g. Getting Started" maxLength={100} /><button disabled={busy} className="btn-primary"><Plus className="h-4 w-4" /> Add Module</button></div></form>

          {course.sections.length === 0 ? <div className="panel p-8 text-center"><Layers3 className="mx-auto h-9 w-9 text-slate-700" /><p className="mt-3 text-sm font-semibold text-white">Start with your first module</p><p className="mt-1 text-xs text-slate-500">Example: Getting Started, Core Concepts, Practice, Advanced Lessons.</p></div> : course.sections.map((section, sectionIndex) => (
            <section key={section.id} className="panel overflow-hidden">
              <div className="flex items-center gap-3 border-b border-white/[0.07] p-4 sm:p-5">
                <GripVertical className="h-4 w-4 text-slate-700" />
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-500/10 text-xs font-bold text-violet-200">{String(sectionIndex + 1).padStart(2, "0")}</span>
                {editingModule === section.id ? <div className="flex min-w-0 flex-1 gap-2"><input className="field py-2" value={moduleEditTitle} onChange={(e) => setModuleEditTitle(e.target.value)} /><button type="button" disabled={busy} onClick={() => saveModule(section.id)} className="btn-primary px-3 py-2"><Save className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setEditingModule(null)} className="btn-secondary px-3 py-2">Cancel</button></div> : <><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-white">{section.title}</h2><p className="mt-1 text-[11px] text-slate-600">{section.lessons.length} video lessons</p></div><button type="button" onClick={() => { setEditingModule(section.id); setModuleEditTitle(section.title); }} className="btn-secondary px-3 py-2 text-xs"><Edit3 className="h-3.5 w-3.5" /></button><button type="button" disabled={busy} onClick={() => removeModule(section.id)} className="btn-danger px-3 py-2"><Trash2 className="h-3.5 w-3.5" /></button></>}
              </div>

              <div className="divide-y divide-white/[0.05]">
                {section.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="p-4 sm:px-5">
                    {editingLesson === lesson.id ? <div><div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><input className="field py-2 text-xs" value={lessonEdit.title} onChange={(e) => setLessonEdit((prev) => ({ ...prev, title: e.target.value }))} placeholder="Lesson title" /><input className="field py-2 text-xs" value={lessonEdit.youtubeId} onChange={(e) => setLessonEdit((prev) => ({ ...prev, youtubeId: e.target.value }))} placeholder="YouTube URL" /><div className="flex gap-2"><button type="button" disabled={busy} onClick={() => saveLesson(lesson.id)} className="btn-primary px-3 py-2 text-xs">Save</button><button type="button" onClick={() => setEditingLesson(null)} className="btn-secondary px-3 py-2 text-xs">Cancel</button></div></div><ResourceEditor value={editResources} onChange={setEditResources} disabled={busy} /></div> : (
                      <div className="flex items-center gap-3"><button type="button" onClick={() => setPreview(lesson)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.04] transition hover:bg-violet-500/10"><PlayCircle className="h-4 w-4 text-violet-300" /></button><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-white">{lessonIndex + 1}. {lesson.title}</p><p className="mt-1 truncate text-[10px] text-slate-600">youtube.com/watch?v={lesson.youtubeId}{!!lesson.resources?.length && ` · ${lesson.resources.length} resources`}</p></div>{lesson.youtubeId && <a href={`https://youtu.be/${lesson.youtubeId}`} target="_blank" rel="noreferrer" className="hidden p-2 text-slate-600 hover:text-white sm:block" aria-label="Open on YouTube"><ExternalLink className="h-3.5 w-3.5" /></a>}<button type="button" onClick={() => beginLessonEdit(lesson)} className="p-2 text-slate-600 hover:text-white" aria-label="Edit lesson"><Edit3 className="h-3.5 w-3.5" /></button><button type="button" disabled={busy} onClick={() => removeLesson(lesson.id)} className="p-2 text-slate-600 hover:text-rose-300" aria-label="Delete lesson"><Trash2 className="h-3.5 w-3.5" /></button></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.07] bg-white/[0.015] p-4 sm:p-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-600">Add YouTube Lesson</p>
                <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]"><input className="field py-2 text-xs" value={lessonInputs[section.id]?.title || ""} onChange={(e) => setLessonInputs((prev) => ({ ...prev, [section.id]: { title: e.target.value, youtubeId: prev[section.id]?.youtubeId || "" } }))} placeholder="Lesson title" /><input className="field py-2 text-xs" value={lessonInputs[section.id]?.youtubeId || ""} onChange={(e) => setLessonInputs((prev) => ({ ...prev, [section.id]: { title: prev[section.id]?.title || "", youtubeId: e.target.value } }))} placeholder="Paste YouTube URL or video ID" /><button type="button" disabled={busy} onClick={() => addLesson(section.id)} className="btn-primary px-4 py-2 text-xs"><Plus className="h-3.5 w-3.5" /> Add Video</button></div>
                <ResourceEditor value={resourceInputs[section.id] || []} onChange={(resources) => setResourceInputs((prev) => ({ ...prev, [section.id]: resources }))} disabled={busy} />
              </div>
            </section>
          ))}
        </div>

        <aside className="h-fit xl:sticky xl:top-6">
          <div className="panel overflow-hidden"><div className="border-b border-white/[0.07] p-4 sm:p-5"><p className="text-sm font-bold text-white">Video Preview</p><p className="mt-1 text-xs text-slate-500">Click any lesson to preview it.</p></div><div className="p-4 sm:p-5">{preview?.youtubeId ? <><YoutubePlayer youtubeId={preview.youtubeId} title={preview.title} /><p className="mt-4 text-sm font-semibold text-white">{preview.title}</p><ResourceLinks resources={preview.resources} /><p className="mt-1 text-xs text-slate-600">YouTube privacy-enhanced embed mode</p></> : <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-center"><div><PlayCircle className="mx-auto h-8 w-8 text-slate-700" /><p className="mt-2 text-xs text-slate-600">No video selected</p></div></div>}</div></div>
        </aside>
      </div>
    </div>
  );
}
