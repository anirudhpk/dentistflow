"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { getFollowUpSuggestion, lifecycleStages } from "@/lib/patient-helpers";

function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function PatientEditorPage({ patient, created = false }) {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: patient.fullName,
    email: patient.email || "",
    phone: patient.phone,
    age: String(patient.age),
    gender: patient.gender,
    chiefComplaint: patient.chiefComplaint,
    visitType: patient.visitType,
    status: patient.status,
    lifecycleStage: patient.lifecycleStage || "New patient",
    nextFollowUpDate: patient.nextFollowUpDate || "",
    followUpNote: patient.followUpNote || "",
    symptoms: patient.symptoms || "",
    diagnosis: patient.diagnosis || "",
    recommendedMedicines: patient.recommendedMedicines || "",
    invoiceNumber: patient.invoiceNumber || "",
    invoiceItems: patient.invoiceItems || "",
    invoiceTotal: String(patient.invoiceTotal || ""),
    invoiceStatus: patient.invoiceStatus || "Unpaid",
    invoiceNotes: patient.invoiceNotes || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(
    created ? "Patient created." : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSending, setIsSending] = useState(false);

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
    setSuccess("Follow-up updated.");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          phone: sanitizePhone(form.phone),
          age: Number(form.age),
          invoiceTotal: Number(form.invoiceTotal || 0),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to update patient.");
      }

      setSuccess("Saved.");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendPrescription() {
    setError("");
    setSuccess("");
    setIsSending(true);

    try {
      const response = await fetch(`/api/patients/${patient.id}/send-prescription`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to send prescription.");
      }

      const summary = data.results
        .map((result) =>
          result.status === "sent"
            ? `${result.channel}: sent`
            : `${result.channel}: ${result.reason || result.status}`
        )
        .join(" | ");
      setSuccess(summary);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-7xl px-5 py-6 lg:px-10">
        <div className="grid w-full gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="panel-surface rounded-[2rem] p-5 lg:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                {patient.id}
              </div>
              <Link
                href="/patients"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Patients
              </Link>
              <Link
                href="/home"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
              >
                Home
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Stage
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.lifecycleStage}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Status
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.status}
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Visit
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-950">
                  {form.visitType}
                </p>
              </div>
            </div>

            <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Invoice No
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {form.invoiceNumber || "Auto"}
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Quick Notes
              </p>
              <p className="mt-3 line-clamp-4 min-h-24 text-sm leading-6 text-slate-600">
                {form.followUpNote || form.chiefComplaint || "No notes yet."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={applyFollowUpSuggestion}
                className="rounded-[1.35rem] bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-900"
              >
                Suggest Follow-up
              </button>
              <a
                href={`/api/patients/${patient.id}/prescription`}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.35rem] bg-sky-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Prescription PDF
              </a>
              <a
                href={`/api/patients/${patient.id}/invoice`}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.35rem] bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Invoice PDF
              </a>
            </div>
          </section>

          <section className="login-card rounded-[2rem] p-5 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold text-slate-950">
                {patient.fullName}
              </h1>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                Edit
              </span>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  className="md:col-span-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
                  placeholder="Full name"
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  className="md:col-span-2 rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none"
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
                    inputMode="numeric"
                    placeholder="Mobile"
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

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-900">Clinical Notes</p>
                <div className="grid gap-4">
                  <textarea
                    rows="3"
                    value={form.symptoms}
                    onChange={(event) => updateField("symptoms", event.target.value)}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Symptoms"
                  />
                  <textarea
                    rows="3"
                    value={form.diagnosis}
                    onChange={(event) => updateField("diagnosis", event.target.value)}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Diagnosis"
                  />
                  <textarea
                    rows="5"
                    value={form.recommendedMedicines}
                    onChange={(event) =>
                      updateField("recommendedMedicines", event.target.value)
                    }
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Medicines"
                  />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Invoice</p>
                  <a
                    href={`/api/patients/${patient.id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-emerald-700"
                  >
                    Generate
                  </a>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900">
                    {form.invoiceNumber || "Auto-generated on save"}
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.invoiceTotal}
                    onChange={(event) => updateField("invoiceTotal", event.target.value)}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Total amount"
                  />
                  <select
                    value={form.invoiceStatus}
                    onChange={(event) => updateField("invoiceStatus", event.target.value)}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                  <input
                    value={form.invoiceNotes}
                    onChange={(event) => updateField("invoiceNotes", event.target.value)}
                    className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder="Invoice notes"
                  />
                  <textarea
                    rows="4"
                    value={form.invoiceItems}
                    onChange={(event) => updateField("invoiceItems", event.target.value)}
                    className="md:col-span-2 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none"
                    placeholder={"Invoice items\nExample: Consultation - Rs 500\nX-Ray - Rs 300"}
                  />
                </div>
              </div>

              {error ? (
                <p className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
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
                <button
                  type="button"
                  onClick={handleSendPrescription}
                  disabled={isSending}
                  className="inline-flex items-center justify-center rounded-[1.35rem] bg-emerald-600 px-4 py-4 text-sm font-semibold text-white disabled:bg-slate-400"
                >
                  {isSending ? "Sending..." : "Send Prescription"}
                </button>
                <a
                  href={`/api/patients/${patient.id}/prescription`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700"
                >
                  PDF
                </a>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
