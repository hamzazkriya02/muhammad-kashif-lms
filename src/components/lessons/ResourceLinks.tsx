import { ExternalLink, FileText } from "lucide-react";
import { parseLessonResources } from "@/lib/lesson-resources";

export default function ResourceLinks({ resources }: { resources: unknown }) {
  let links;
  try { links = parseLessonResources(resources); } catch { return null; }
  if (!links.length) return null;
  return (
    <section className="mt-4 space-y-3 border-t border-slate-200 pt-4" aria-label="Lesson resources">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900"><FileText className="h-4 w-4 text-indigo-500" /> Lesson resources</h3>
      {links.map((link, index) => (
        <a key={`${index}-${link.url}`} href={link.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm transition hover:border-indigo-300 hover:bg-indigo-50">
          <div className="min-w-0 flex-1"><p className="break-words font-semibold text-indigo-700">{link.title}</p><p className="mt-1 truncate text-xs text-slate-500">{new URL(link.url).hostname} · Opens in a new tab</p></div>
          <ExternalLink className="h-4 w-4 shrink-0 text-indigo-500" />
        </a>
      ))}
    </section>
  );
}
