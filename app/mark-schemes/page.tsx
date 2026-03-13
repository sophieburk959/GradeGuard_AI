"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAppData } from "@/context/AppDataContext";
import { Criterion, MarkScheme } from "@/lib/types";

function newCriterion(): Criterion {
  return {
    id: `criterion-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: "",
    description: "",
    weight: 0
  };
}

export default function MarkSchemesPage() {
  const { markSchemes, upsertMarkScheme, removeMarkScheme } = useAppData();
  const [editing, setEditing] = useState<MarkScheme | null>(null);
  const [schemeName, setSchemeName] = useState("");
  const [course, setCourse] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([newCriterion()]);
  const [error, setError] = useState("");

  const totalWeight = useMemo(
    () => criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0),
    [criteria]
  );

  function resetForm() {
    setEditing(null);
    setSchemeName("");
    setCourse("");
    setCriteria([newCriterion()]);
    setError("");
  }

  function loadForEdit(scheme: MarkScheme) {
    setEditing(scheme);
    setSchemeName(scheme.schemeName);
    setCourse(scheme.course);
    setCriteria(scheme.criteria);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (totalWeight <= 0) {
      setError("Total rubric points must be greater than 0.");
      return;
    }

    if (criteria.some((criterion) => criterion.weight <= 0)) {
      setError("Each criterion must have a positive point value.");
      return;
    }

    if (criteria.some((criterion) => !criterion.title.trim() || !criterion.description.trim())) {
      setError("Each criterion needs a title and description.");
      return;
    }

    const scheme: MarkScheme = {
      id: editing?.id ?? `scheme-${Date.now()}`,
      schemeName,
      course,
      criteria,
      updatedAt: new Date().toISOString()
    };

    upsertMarkScheme(scheme);
    resetForm();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">Mark Schemes</h1>
        <p className="page-subtitle">Define and maintain rubrics with any total points (e.g. out of 30).</p>
      </header>

      <form onSubmit={save} className="panel space-y-4 p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span>Scheme name</span>
            <input
              required
              value={schemeName}
              onChange={(event) => setSchemeName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span>Course</span>
            <input
              required
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">Criteria</p>
            <button
              type="button"
              onClick={() => setCriteria((current) => [...current, newCriterion()])}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700"
            >
              Add criterion
            </button>
          </div>

          {criteria.map((criterion) => (
            <div key={criterion.id} className="rounded-xl border border-slate-100 p-3">
              <div className="grid gap-3 md:grid-cols-3">
                <input
                  placeholder="Criterion title"
                  value={criterion.title}
                  onChange={(event) =>
                    setCriteria((current) =>
                      current.map((item) =>
                        item.id === criterion.id ? { ...item, title: event.target.value } : item
                      )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                <input
                  placeholder="Description"
                  value={criterion.description}
                  onChange={(event) =>
                    setCriteria((current) =>
                      current.map((item) =>
                        item.id === criterion.id ? { ...item, description: event.target.value } : item
                      )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm md:col-span-2"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  placeholder="Points"
                  value={criterion.weight}
                  onChange={(event) =>
                    setCriteria((current) =>
                      current.map((item) =>
                        item.id === criterion.id
                          ? { ...item, weight: Number(event.target.value || 0) }
                          : item
                      )
                    )
                  }
                  className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
                {criteria.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCriteria((current) => current.filter((item) => item.id !== criterion.id))
                    }
                    className="text-xs text-rose-600"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          <p className="text-sm text-slate-700">Total rubric points: {totalWeight}</p>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="flex gap-3">
          <button className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-medium text-white">
            {editing ? "Update Scheme" : "Save Scheme"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
          >
            Clear
          </button>
        </div>
      </form>

      <section className="grid gap-4 md:grid-cols-2">
        {markSchemes.map((scheme) => {
          const schemeTotal = scheme.criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
          return (
            <article key={scheme.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{scheme.schemeName}</h3>
                  <p className="text-sm text-slate-500">{scheme.course}</p>
                </div>
                <p className="rounded-full bg-brand-slate px-3 py-1 text-xs text-slate-600">
                  Updated {new Date(scheme.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-700">Total: {schemeTotal} points</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {scheme.criteria.map((criterion) => (
                  <li key={criterion.id}>
                    {criterion.title} - {criterion.weight} points
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => loadForEdit(scheme)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeMarkScheme(scheme.id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs text-rose-700"
                >
                  Remove
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
