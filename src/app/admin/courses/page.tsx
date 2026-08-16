"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpenText, Edit3, Layers3, PlayCircle, Plus, Trash2, UsersRound } from "lucide-react";

interface Lesson { id: string; title: string; youtubeId: string | null; }
interface Section { id: string; title: string; lessons: Lesson[]; }
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: string;
  sections: Section[];
  _count?: { courseAccess: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [title, setTitle] = useState("Master Course");
  const [description, setDescription] = useState("A structured training program with step-by-step video modules.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/courses", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadCourses(); }, []);

  function notify(type: "success" | "error", text: string) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  }

  async function createCourse(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description }) });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to create course");
      notify("success", "Course created. You can now add modules and YouTube lessons.");
      await loadCourses();
    } finally { setSaving(false); }
  }

  function startEdit(course: Course) {
    setEditingId(course.id);
    setEditTitle(course.title);
    setEditDescription(course.description || "");
  }

  async function saveEdit(courseId: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/courses/update", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, title: editTitle, description: editDescription }) });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to update course");
      setEditingId(null);
      notify("success", "Course details updated.");
      await loadCourses();
    } finally { setSaving(false); }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`Delete ${course.title}? All modules, lessons, access and progress related to this course will be removed.`)) return;
    const res = await fetch("/api/admin/courses/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: course.id }) });
    const data = await res.json();
    if (!res.ok) return notify("error", data.error || "Unable to delete course");
    notify("success", "Course deleted.");
    await loadCourses();
  }

  const totals = useMemo(() => ({
    modules: courses.reduce((sum, course) => sum + course.sections.length, 0),
    lessons: courses.reduce((sum, course) => sum + course.sections.reduce((inner, section) => inner + section.lessons.length, 0), 0),
    students: courses.reduce((sum, course) => sum + (course._count?.courseAccess || 0), 0),
  }), [courses]);

  return (
    <div className="app-page space-y-7">
      <div><p className="eyebrow">Content Management</p><h1 className="page-title mt-1">Course Studio</h1><p className="page-subtitle">Build and manage your course content from modules and video lessons.</p></div>

      {message && <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300" : "border-rose-400/15 bg-rose-500/10 text-rose-300"}`}>{message.text}</div>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Modules</p><p className="mt-2 text-3xl font-black">{totals.modules}</p></div><Layers3 className="h-5 w-5 text-violet-300" /></div></div>
        <div className="panel p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Video Lessons</p><p className="mt-2 text-3xl font-black">{totals.lessons}</p></div><PlayCircle className="h-5 w-5 text-indigo-300" /></div></div>
        <div className="panel p-5"><div className="flex items-center justify-between"><div><p className="text-xs text-slate-500">Course Assignments</p><p className="mt-2 text-3xl font-black">{totals.students}</p></div><UsersRound className="h-5 w-5 text-emerald-300" /></div></div>
      </div>

      {courses.length === 0 && !loading && (
        <form onSubmit={createCourse} className="panel mx-auto max-w-2xl p-5 sm:p-7">
          <div className="mb-6 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/10"><Plus className="h-5 w-5 text-violet-300" /></span><div><h2 className="text-base font-bold text-white">Create your training course</h2><p className="mt-1 text-xs text-slate-500">Create the course your students will access through the learning portal.</p></div></div>
          <div className="space-y-4"><div><label className="mb-2 block text-xs font-semibold text-slate-300">Course title</label><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} /></div><div><label className="mb-2 block text-xs font-semibold text-slate-300">Description</label><textarea className="field min-h-28 resize-y" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={1500} /></div><button disabled={saving} className="btn-primary w-full">{saving ? "Creating..." : "Create Course"}</button></div>
        </form>
      )}

      {loading ? <div className="panel p-8 text-center text-sm text-slate-500">Loading course studio...</div> : courses.length > 0 && (
        <div className="space-y-4">
          {courses.map((course) => {
            const lessonCount = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
            const firstVideo = course.sections.flatMap((section) => section.lessons).find((lesson) => lesson.youtubeId)?.youtubeId;
            return (
              <article key={course.id} className="panel overflow-hidden">
                <div className="grid lg:grid-cols-[260px_1fr]">
                  <div className="keep-dark relative min-h-44 overflow-hidden border-b border-white/[0.07] bg-gradient-to-br from-violet-500/15 via-indigo-500/8 to-black/20 lg:border-b-0 lg:border-r">
                    {firstVideo ? <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${firstVideo}/hqdefault.jpg)` }} /> : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d18] via-[#0b0d18]/30 to-transparent" />
                    <div className="relative flex h-full min-h-44 flex-col justify-end p-5"><span className="w-fit rounded-full border border-violet-400/15 bg-[#0b0d18]/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-200">{course.status}</span><div className="mt-3 flex gap-3 text-[11px] text-slate-300"><span>{course.sections.length} modules</span><span>•</span><span>{lessonCount} lessons</span></div></div>
                  </div>
                  <div className="p-5 sm:p-6">
                    {editingId === course.id ? (
                      <div className="space-y-4"><div><label className="mb-2 block text-xs font-semibold text-slate-300">Course title</label><input className="field" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /></div><div><label className="mb-2 block text-xs font-semibold text-slate-300">Description</label><textarea className="field min-h-24" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => saveEdit(course.id)} disabled={saving} className="btn-primary">Save changes</button><button type="button" onClick={() => setEditingId(null)} className="btn-secondary">Cancel</button></div></div>
                    ) : (
                      <><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-2"><BookOpenText className="h-4 w-4 text-violet-300" /><p className="text-xs font-semibold text-violet-200">Primary Training Program</p></div><h2 className="mt-2 text-xl font-bold text-white">{course.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{course.description || "No description added yet."}</p></div><div className="flex gap-2"><button onClick={() => startEdit(course)} className="btn-secondary px-3 py-2 text-xs"><Edit3 className="h-3.5 w-3.5" /> Edit</button><button onClick={() => deleteCourse(course)} className="btn-danger px-3 py-2 text-xs"><Trash2 className="h-3.5 w-3.5" /></button></div></div><div className="mt-6 flex flex-wrap items-center gap-3"><Link href={`/admin/courses/${course.slug}`} className="btn-primary">Manage Modules & Videos <ArrowRight className="h-4 w-4" /></Link><span className="text-xs text-slate-600">{course._count?.courseAccess || 0} students assigned</span></div></>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
