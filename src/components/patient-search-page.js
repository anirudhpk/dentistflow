import Image from "next/image";
import Link from "next/link";

function formatPhone(phone) {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

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

export default function PatientSearchPage({
  patients,
  query = "",
  totalCount = 0,
}) {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-7xl px-5 py-6 lg:px-10">
        <div className="w-full space-y-6">
          <section className="panel-surface rounded-[2rem] p-5 lg:p-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/patients/new"
                    className="rounded-[1.35rem] bg-sky-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Add Patient
                  </Link>
                  <Link
                    href="/home"
                    className="rounded-[1.35rem] border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    Home
                  </Link>
                </div>

                <form action="/patients" className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="search"
                    name="query"
                    defaultValue={query}
                    placeholder="Name, phone, ID"
                    className="w-full rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="rounded-[1.4rem] bg-slate-950 px-6 py-4 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </form>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {totalCount}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Results
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {patients.length}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Mode
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {query ? "Search" : "Latest"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[240px] overflow-hidden rounded-[1.75rem] bg-white">
                <Image
                  src="/patient-intake-visual.svg"
                  alt="Patient search illustration"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 320px"
                />
              </div>
            </div>
          </section>

          <section className="login-card rounded-[2rem] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.1)] sm:p-5">
            <div className="grid gap-3">
              {patients.length ? (
                patients.map((patient) => (
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
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-slate-950">
                          {patient.fullName}
                        </p>
                        <span className="text-xs text-slate-400">{patient.id}</span>
                      </div>
                      <p className="truncate text-sm text-slate-500">
                        {formatPhone(patient.phone)} · {patient.chiefComplaint}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusPill status={patient.status} />
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Open
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-[1.5rem] bg-white px-5 py-10 text-center text-sm text-slate-500">
                  No patients found.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
