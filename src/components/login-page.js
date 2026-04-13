"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const normalizedPhone = sanitizePhone(phone);
    if (normalizedPhone.length !== 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: normalizedPhone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to send OTP right now.");
      }

      const nextUrl = data.devCode
        ? `/otp?phone=${normalizedPhone}&devCode=${data.devCode}`
        : `/otp?phone=${normalizedPhone}`;

      router.push(nextUrl);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="panel-surface relative overflow-hidden rounded-[2rem] p-6 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
            <div className="mb-4 inline-flex w-fit items-center gap-3 rounded-full border border-white/65 bg-white/75 px-4 py-2 text-sm font-medium text-sky-950 shadow-sm backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-900 text-sm font-semibold text-white">
                DC
              </span>
              DentistFlow
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-white">
              <Image
                src="/healthy-teeth.svg"
                alt="Healthy teeth illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>
          </section>

          <section className="flex items-center">
            <div className="login-card w-full rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700/70">
                    Team login
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    Welcome back
                  </h2>
                </div>
                <div className="rounded-2xl bg-sky-50 px-4 py-3 text-right">
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-emerald-600">
                    Clinic online
                  </p>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <div className="flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <span className="flex items-center border-r border-slate-200 bg-white px-4 text-sm font-medium text-slate-600">
                      +91
                    </span>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Enter your mobile number"
                      value={phone}
                      onChange={(event) => {
                        setPhone(sanitizePhone(event.target.value));
                        if (error) setError("");
                      }}
                      className="w-full bg-transparent px-4 py-4 text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSubmitting ? "Sending OTP..." : "Send OTP"}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200 pt-6">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm text-slate-500">SMS verification</p>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    OTP
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
