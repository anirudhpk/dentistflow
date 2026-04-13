"use client";

import Link from "next/link";
import { useState } from "react";

const actions = [
  {
    title: "Add",
    subtitle: "Patient",
    href: "/patients/new",
    emoji: "plus",
    tone: "bg-sky-900 text-white",
  },
  {
    title: "Search",
    subtitle: "Patient",
    href: "/patients",
    emoji: "search",
    tone: "bg-white text-slate-900 border border-slate-200",
  },
  {
    title: "Follow-up",
    subtitle: "Queue",
    href: "/patients",
    emoji: "call",
    tone: "bg-white text-slate-900 border border-slate-200",
  },
];

function StatusPill({ status }) {
  const toneMap = {
    Arrived: "bg-emerald-100 text-emerald-700",
    "In chair": "bg-sky-100 text-sky-700",
    Waiting: "bg-amber-100 text-amber-700",
    Completed: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        toneMap[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

function ActionIcon({ emoji }) {
  if (emoji === "plus") {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15">
        <div className="relative h-5 w-5">
          <span className="absolute left-1/2 top-0 h-5 w-0.5 -translate-x-1/2 rounded bg-current" />
          <span className="absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 rounded bg-current" />
        </div>
      </div>
    );
  }

  if (emoji === "search") {
    return (
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100">
        <div className="relative h-5 w-5 rounded-full border-2 border-slate-700">
          <span className="absolute -bottom-1.5 right-[-5px] h-2.5 w-0.5 rotate-[-45deg] rounded bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100">
      <div className="relative h-5 w-5">
        <span className="absolute left-0 top-0 h-3 w-5 rounded-t-full border-2 border-b-0 border-emerald-700" />
        <span className="absolute bottom-0 left-1/2 h-2.5 w-0.5 -translate-x-1/2 rounded bg-emerald-700" />
      </div>
    </div>
  );
}

function EyeToggleIcon({ visible }) {
  return (
    <div className="relative h-5 w-5">
      <span className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full border-2 border-slate-700" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700" />
      {!visible ? (
        <span className="absolute left-1/2 top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded bg-slate-700" />
      ) : null}
    </div>
  );
}

function formatPhone(phone) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export default function HomePage({
  recentPatients = [],
  dashboardMetrics = [],
  createdPatientId = "",
}) {
  const [showRevenue, setShowRevenue] = useState(false);
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-7xl px-5 py-6 lg:px-10">
        <div className="w-full space-y-6">
          <section className="panel-surface overflow-hidden rounded-[2rem] p-5 lg:p-7">
            <div className="space-y-5">
              <div className="space-y-5">
                <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-sky-900 text-white">
                    DC
                  </span>
                  DentistFlow
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Clinic Home
                  </h1>
                  <p className="text-sm text-slate-500">Simple. Clear. Fast.</p>
                </div>

                {createdPatientId ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    Saved: {createdPatientId}
                  </div>
                ) : null}

                <div className="grid gap-3 sm:grid-cols-3">
                  {actions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className={`rounded-[1.6rem] p-4 shadow-sm transition hover:-translate-y-0.5 ${action.tone}`}
                    >
                      <ActionIcon emoji={action.emoji} />
                      <p className="mt-4 text-lg font-semibold">{action.title}</p>
                      <p className="text-sm opacity-80">{action.subtitle}</p>
                    </Link>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {showRevenue ? "Collections" : "Visits"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowRevenue((current) => !current)}
                    aria-label={
                      showRevenue ? "Hide revenue amounts" : "Show revenue amounts"
                    }
                    title={showRevenue ? "Hide revenue" : "Show revenue"}
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-slate-700 shadow-sm"
                  >
                    <EyeToggleIcon visible={showRevenue} />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-4">
                  {dashboardMetrics.map((item) => (
                    <article
                      key={item.label}
                      className={`rounded-[1.4rem] border p-4 ${item.tone}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold text-slate-950">
                        {showRevenue
                          ? `Rs ${Number(item.revenue).toLocaleString("en-IN")}`
                          : item.visits}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="login-card rounded-[2rem] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.1)] lg:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">Patients</h2>
                <Link
                  href="/patients"
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                >
                  Open
                </Link>
              </div>

              <div className="grid gap-3">
                {recentPatients.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/patients/${patient.id}`}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-white px-4 py-3 transition hover:border-sky-200 hover:bg-sky-50/40"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sm font-semibold text-sky-900">
                      {patient.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">
                        {patient.fullName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {formatPhone(patient.phone)}
                      </p>
                    </div>
                    <StatusPill status={patient.status} />
                  </Link>
                ))}
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">Quick Find</h2>
                <Link href="/" className="text-sm font-medium text-sky-700">
                  Exit
                </Link>
              </div>

              <form action="/patients" className="space-y-3">
                <input
                  type="search"
                  name="query"
                  placeholder="Name, phone, ID"
                  className="w-full rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="w-full rounded-[1.4rem] bg-slate-950 px-4 py-4 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </form>

              <div className="mt-5 rounded-[1.6rem] bg-slate-50 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[1.2rem] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Waiting
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">05</p>
                  </div>
                  <div className="rounded-[1.2rem] bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Chair
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">03</p>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>
      </div>
    </main>
  );
}
