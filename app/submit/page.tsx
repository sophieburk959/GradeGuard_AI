"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useAppData } from "@/context/AppDataContext";

const initialState = {
  studentName: "",
  studentId: "",
  course: "",
  assignmentTitle: "",
  additionalNotes: ""
};

async function tryReadText(file: File): Promise<string | undefined> {
  const supportsText =
    file.type.startsWith("text/") || /\.(txt|md|csv|json)$/i.test(file.name);

  if (!supportsText) {
    return undefined;
  }

  const text = await file.text();
  return text.trim().slice(0, 25000);
}

export default function SubmitPage() {
  const { addSubmission } = useAppData();
  const [form, setForm] = useState(initialState);
  const [fileName, setFileName] = useState<string | undefined>();
  const [contentText, setContentText] = useState<string>("");
  const [message, setMessage] = useState("");

  async function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setFileName(file?.name);

    if (!file) {
      setContentText("");
      return;
    }

    const extracted = await tryReadText(file);
    if (extracted) {
      setContentText(extracted);
      setMessage("Text content extracted from file and linked for rubric-based grading.");
    } else {
      setMessage(
        "File attached. For best rubric alignment in MVP mode, also paste essay text below (PDF/DOC parsing is not enabled)."
      );
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    addSubmission({
      ...form,
      fileName,
      contentText: contentText.trim() || undefined
    });

    setMessage("Submission created and linked for AI-assisted rubric grading.");
    setForm(initialState);
    setFileName(undefined);
    setContentText("");
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Submit Work</h1>
        <p className="page-subtitle">Create a new coursework submission for AI-assisted grading support.</p>
      </header>

      <form className="panel space-y-5 p-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Student name</span>
            <input
              required
              value={form.studentName}
              onChange={(event) => setForm((current) => ({ ...current, studentName: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. Alex Morgan"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Student ID</span>
            <input
              required
              value={form.studentId}
              onChange={(event) => setForm((current) => ({ ...current, studentId: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. ML1009"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Course</span>
            <input
              required
              value={form.course}
              onChange={(event) => setForm((current) => ({ ...current, course: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Machine Learning"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-slate-700">Assignment title</span>
            <input
              required
              value={form.assignmentTitle}
              onChange={(event) =>
                setForm((current) => ({ ...current, assignmentTitle: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Neural Network Evaluation"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Additional notes</span>
          <textarea
            value={form.additionalNotes}
            onChange={(event) => setForm((current) => ({ ...current, additionalNotes: event.target.value }))}
            className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Context for graders, submission caveats, or extension details"
          />
        </label>

        <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          <span className="font-medium text-slate-700">File upload</span>
          <p className="mt-1 text-xs text-slate-500">MVP supports direct text extraction from txt/md files.</p>
          <input type="file" onChange={onFileChange} className="mt-3 block w-full text-sm" />
          {fileName ? <p className="mt-2 text-xs text-slate-700">Attached: {fileName}</p> : null}
        </label>

        <label className="space-y-2 text-sm">
          <span className="text-slate-700">Essay text (optional but recommended for grading quality)</span>
          <textarea
            value={contentText}
            onChange={(event) => setContentText(event.target.value)}
            className="min-h-44 w-full rounded-xl border border-slate-200 px-3 py-2"
            placeholder="Paste the assignment text here if your upload is PDF/DOCX so criteria alignment can be assessed in MVP mode."
          />
        </label>

        <div className="flex items-center justify-between">
          <button className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-navySoft">
            Submit Assignment
          </button>
          {message ? <p className="max-w-md text-right text-sm text-emerald-600">{message}</p> : null}
        </div>
      </form>
    </div>
  );
}
