"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getFollowUpSuggestion, lifecycleStages } from "@/lib/patient-helpers";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  chiefComplaint: "",
  visitType: "Consultation",
  status: "Waiting",
  lifecycleStage: "New patient",
  nextFollowUpDate: "",
  followUpNote: "",
};

function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function AddPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function applyFollowUpSuggestion() {
    const suggestion = getFollowUpSuggestion(form.lifecycleStage);
    setForm((current) => ({
      ...current,
      ...suggestion,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          phone: sanitizePhone(form.phone),
          age: Number(form.age),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to create patient.");
      }

      router.push(`/patients/${data.patient.id}?created=1`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-6xl px-5 py-6 lg:px-10">
        <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="panel-surface rounded-[2rem] p-5 lg:p-6">
            <div className="mb-4 inline-flex w-fit items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-900 text-white">
                +
              </span>
              Add Patient
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  New
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  Patient
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Stage
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.lifecycleStage}
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Visit
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.visitType}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Follow-up
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.nextFollowUpDate || "Not set"}
                </p>
              </div>
            </div>

            <div className="mt-3 rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Quick Note
              </p>
              <p className="mt-3 min-h-24 text-sm leading-6 text-slate-600">
                {form.followUpNote || form.chiefComplaint || "No notes yet."}
              </p>
            </div>
          </section>

          <section className="login-card rounded-[2rem] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-slate-950">New Patient</h1>
              <Link
                href="/home"
                className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
              >
                Home
              </Link>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                  placeholder="Full name"
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                  placeholder="Email"
                />

                <div className="flex overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-50">
                  <span className="flex items-center border-r border-slate-200 bg-white px-4 text-sm font-medium text-slate-600">
                    +91
                  </span>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", sanitizePhone(event.target.value))
                    }
                    className="w-full bg-transparent px-4 py-4 text-slate-900 outline-none"
                    placeholder="Mobile"
                    inputMode="numeric"
                  />
                </div>

                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.age}
                  onChange={(event) => updateField("age", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                  placeholder="Age"
                />

                <select
                  value={form.gender}
                  onChange={(event) => updateField("gender", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                >
                  <option value="">Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>

                <select
                  value={form.visitType}
                  onChange={(event) => updateField("visitType", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Emergency">Emergency</option>
                </select>

                <select
                  value={form.status}
                  onChange={(event) => updateField("status", event.target.value)}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="Arrived">Arrived</option>
                  <option value="In chair">In chair</option>
                  <option value="Completed">Completed</option>
                </select>

                <textarea
                  rows="3"
                  value={form.chiefComplaint}
                  onChange={(event) => updateField("chiefComplaint", event.target.value)}
                  className="md:col-span-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                  placeholder="Chief complaint"
                />
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Follow-up</p>
                  <button
                    type="button"
                    onClick={applyFollowUpSuggestion}
                    className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-amber-900"
                  >
                    Suggest
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <select
                    value={form.lifecycleStage}
                    onChange={(event) =>
                      updateField("lifecycleStage", event.target.value)
                    }
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                  >
                    {lifecycleStages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={form.nextFollowUpDate}
                    onChange={(event) =>
                      updateField("nextFollowUpDate", event.target.value)
                    }
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                  />

                  <textarea
                    rows="3"
                    value={form.followUpNote}
                    onChange={(event) => updateField("followUpNote", event.target.value)}
                    className="md:col-span-2 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Follow-up note"
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex flex-1 items-center justify-center rounded-[1.35rem] bg-sky-900 px-4 py-4 text-sm font-semibold text-white disabled:bg-slate-400"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <Link
                  href="/home"
                  className="inline-flex items-center justify-center rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
