"use client";

import { Plus, Trash2 } from "lucide-react";
import type { LessonResource } from "@/lib/lesson-resources";

export default function ResourceEditor({ value, onChange, disabled = false }: {
  value: LessonResource[];
  onChange: (value: LessonResource[]) => void;
  disabled?: boolean;
}) {
  function update(index: number, field: keyof LessonResource, text: string) {
    onChange(value.map((item, i) => i === index ? { ...item, [field]: text } : item));
  }
  return (
    <fieldset disabled={disabled} className="mt-3 min-w-0 space-y-3">
      <legend className="text-xs font-semibold text-slate-600">Lesson resources (optional)</legend>
      <p className="text-xs text-slate-500">Add Google Docs, Drive, PDF or other website links. Students open them in a new tab.</p>
      {value.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
            <input aria-label={`Resource ${index + 1} title`} className="field py-2 text-xs" value={item.title} maxLength={140} placeholder="Title, e.g. Lesson notes" onChange={(e) => update(index, "title", e.target.value)} />
            <input aria-label={`Resource ${index + 1} URL`} className="field py-2 text-xs" type="url" value={item.url} maxLength={2048} placeholder="https://docs.google.com/..." onChange={(e) => update(index, "url", e.target.value)} />
          </div>
          <button type="button" className="btn-danger px-3 py-2" aria-label={`Remove resource ${index + 1}`} onClick={() => onChange(value.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" disabled={disabled || value.length >= 20} className="btn-secondary px-3 py-2 text-xs" onClick={() => onChange([...value, { title: "", url: "" }])}><Plus className="h-3.5 w-3.5" /> Add resource link</button>
    </fieldset>
  );
}
