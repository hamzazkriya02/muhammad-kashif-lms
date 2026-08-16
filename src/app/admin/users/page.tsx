"use client";

import { useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, Eye, EyeOff, KeyRound, Search, Trash2, UserPlus, UsersRound } from "lucide-react";

interface Lesson { id: string; }
interface Section { lessons: Lesson[]; }
interface Course { id: string; title: string; slug: string; sections: Section[]; }
interface CourseAccessItem { courseId: string; status: string; course: { id: string; title: string; slug: string }; }
interface ProgressItem { lessonId: string; percent: number; completedAt: string | null; }
interface User {
  id: string;
  name: string;
  email: string;
  status: "APPROVED" | "DISABLED" | "PENDING";
  createdAt: string;
  verifiedAt: string | null;
  hasPassword: boolean;
  courseAccess: CourseAccessItem[];
  lessonProgress: ProgressItem[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [passwordInputs, setPasswordInputs] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [selectedCourse, setSelectedCourse] = useState<Record<string, string>>({});

  async function loadData() {
    setLoading(true);
    try {
      const [usersRes, coursesRes] = await Promise.all([
        fetch("/api/admin/users", { cache: "no-store" }),
        fetch("/api/admin/courses", { cache: "no-store" }),
      ]);
      const usersData = await usersRes.json();
      const coursesData = await coursesRes.json();
      if (usersRes.ok) setUsers(usersData.users || []);
      if (coursesRes.ok) setCourses(coursesData.courses || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get("q");
    if (initialQuery) setQuery(initialQuery);
    void loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(needle));
  }, [query, users]);

  function notify(type: "success" | "error", text: string) {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  }

  async function createStudent(event: React.FormEvent) {
    event.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to create student");
      setName(""); setEmail("");
      notify("success", `Student created: ${data.user.email}`);
      await loadData();
    } catch {
      notify("error", "Unable to create student");
    } finally {
      setCreating(false);
    }
  }

  async function setPasswordFor(userId: string) {
    const password = passwordInputs[userId] || "";
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/users/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to set password");
      setPasswordInputs((prev) => ({ ...prev, [userId]: "" }));
      notify("success", "Password updated and old sessions were revoked.");
      await loadData();
    } finally { setBusyId(null); }
  }

  async function assignCourse(userId: string) {
    const courseId = selectedCourse[userId] || courses[0]?.id;
    if (!courseId) return notify("error", "Create the course first.");
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/courses/assign", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, courseId }),
      });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to assign course");
      notify("success", "Course access assigned.");
      await loadData();
    } finally { setBusyId(null); }
  }

  async function unassignCourse(userId: string, courseId: string) {
    if (!window.confirm("Remove this student's course access?")) return;
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/courses/unassign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, courseId }) });
      if (!res.ok) return notify("error", "Unable to remove course access");
      notify("success", "Course access removed.");
      await loadData();
    } finally { setBusyId(null); }
  }

  async function toggleStatus(user: User) {
    const next = user.status === "APPROVED" ? "DISABLED" : "APPROVED";
    setBusyId(user.id);
    try {
      const res = await fetch("/api/admin/users/status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id, status: next }) });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to update status");
      notify("success", next === "APPROVED" ? "Student activated." : "Student disabled and signed out.");
      await loadData();
    } finally { setBusyId(null); }
  }

  async function deleteStudent(user: User) {
    if (!window.confirm(`Delete ${user.name}? This permanently removes their account and progress.`)) return;
    setBusyId(user.id);
    try {
      const res = await fetch("/api/admin/users/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) });
      const data = await res.json();
      if (!res.ok) return notify("error", data.error || "Unable to delete student");
      notify("success", "Student deleted.");
      await loadData();
    } finally { setBusyId(null); }
  }

  function progressFor(user: User) {
    const assignedIds = new Set(user.courseAccess.map((item) => item.courseId));
    const lessons = courses.filter((course) => assignedIds.has(course.id)).flatMap((course) => course.sections.flatMap((section) => section.lessons));
    if (!lessons.length) return { done: 0, total: 0, percent: 0 };
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    const done = user.lessonProgress.filter((item) => item.completedAt && lessonIds.has(item.lessonId)).length;
    return { done, total: lessons.length, percent: Math.round((done / lessons.length) * 100) };
  }

  return (
    <div className="app-page space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="eyebrow">Student Management</p><h1 className="page-title mt-1">Students</h1><p className="page-subtitle">Create accounts, set secure passwords, assign course access and track progress.</p></div>
        <div className="panel-soft flex items-center gap-2 px-3 py-2 text-xs text-slate-400"><UsersRound className="h-4 w-4 text-violet-300" /> {users.length} total students</div>
      </div>

      {message && <div className={`rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300" : "border-rose-400/15 bg-rose-500/10 text-rose-300"}`}>{message.text}</div>}

      <div className="grid gap-5 xl:grid-cols-[.7fr_1.3fr]">
        <form onSubmit={createStudent} className="panel h-fit p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-500/10"><UserPlus className="h-5 w-5 text-violet-300" /></span><div><h2 className="text-sm font-bold text-white">Add New Student</h2><p className="mt-1 text-xs text-slate-500">Create an approved student account.</p></div></div>
          <div className="space-y-4"><div><label className="mb-2 block text-xs font-semibold text-slate-300">Full name</label><input className="field" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Student name" /></div><div><label className="mb-2 block text-xs font-semibold text-slate-300">Email</label><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="student@example.com" /></div><button disabled={creating} className="btn-primary w-full">{creating ? "Creating..." : "Create Student"}</button></div>
          <p className="mt-4 text-[11px] leading-5 text-slate-600">After creating the account, set a strong password and assign the required course access.</p>
        </form>

        <section className="panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="text-sm font-bold text-white">Student Directory</h2><p className="mt-1 text-xs text-slate-500">Search and manage all learner accounts.</p></div><div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input className="field py-2 pl-9" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students..." /></div></div>

          {loading ? <div className="p-8 text-center text-sm text-slate-500">Loading students...</div> : filteredUsers.length === 0 ? <div className="p-8 text-center text-sm text-slate-500">No students found.</div> : (
            <div className="divide-y divide-white/[0.06]">
              {filteredUsers.map((user) => {
                const progress = progressFor(user);
                const assigned = user.courseAccess[0];
                return (
                  <article key={user.id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-sm font-bold text-violet-200">{user.name.slice(0,1).toUpperCase()}</div>
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-white">{user.name}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${user.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300"}`}>{user.status === "APPROVED" ? "Active" : "Disabled"}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${user.hasPassword ? "bg-blue-500/10 text-blue-300" : "bg-amber-500/10 text-amber-300"}`}>{user.hasPassword ? "Password set" : "Needs password"}</span></div><p className="mt-1 truncate text-xs text-slate-600">{user.email}</p><div className="mt-3 max-w-md"><div className="mb-1.5 flex items-center justify-between text-[10px] text-slate-600"><span>{assigned ? assigned.course.title : "No course assigned"}</span><span>{progress.percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${progress.percent}%` }} /></div></div></div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end"><button disabled={busyId === user.id} onClick={() => toggleStatus(user)} className="btn-secondary px-3 py-2 text-xs">{user.status === "APPROVED" ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}{user.status === "APPROVED" ? "Disable" : "Activate"}</button><button disabled={busyId === user.id} onClick={() => deleteStudent(user)} className="btn-danger px-3 py-2 text-xs"><Trash2 className="h-3.5 w-3.5" /> Delete</button></div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-white/[0.06] pt-4 lg:grid-cols-2">
                      <div className="flex gap-2"><div className="relative flex-1"><KeyRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" /><input type={showPassword[user.id] ? "text" : "password"} autoComplete="new-password" className="field py-2 pl-9 pr-9 text-xs" value={passwordInputs[user.id] || ""} onChange={(e) => setPasswordInputs((prev) => ({ ...prev, [user.id]: e.target.value }))} placeholder="New secure password" /><button type="button" onClick={() => setShowPassword((prev) => ({ ...prev, [user.id]: !prev[user.id] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">{showPassword[user.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button></div><button disabled={busyId === user.id} onClick={() => setPasswordFor(user.id)} className="btn-secondary px-3 py-2 text-xs">Set Password</button></div>
                      <div className="flex gap-2">{assigned ? <><div className="field flex flex-1 items-center py-2 text-xs text-slate-400">{assigned.course.title}</div><button disabled={busyId === user.id} onClick={() => unassignCourse(user.id, assigned.courseId)} className="btn-secondary px-3 py-2 text-xs">Remove</button></> : <><select className="field flex-1 py-2 text-xs" value={selectedCourse[user.id] || courses[0]?.id || ""} onChange={(e) => setSelectedCourse((prev) => ({ ...prev, [user.id]: e.target.value }))}><option value="">Select course</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><button disabled={busyId === user.id || courses.length === 0} onClick={() => assignCourse(user.id)} className="btn-primary px-3 py-2 text-xs">Assign</button></>}</div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
