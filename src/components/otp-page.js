"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function sanitizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function maskPhone(phone) {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 2)}•••••${phone.slice(-3)}`;
}

export default function OtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = sanitizePhone(searchParams.get("phone") || "");
  const devCode = searchParams.get("devCode") || "";
  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();

    if (phone.length !== 10) {
      setError("Missing phone number. Return to login and request a new OTP.");
      return;
    }

    const normalizedOtp = otp.replace(/\D/g, "").slice(0, 6);
    if (normalizedOtp.length < 4) {
      setError("Enter the OTP sent to your phone.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          otp: normalizedOtp,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed.");
      }

      setSuccess("OTP verified. You can now continue to the clinic dashboard.");
      router.push("/home");
      router.refresh();
    } catch (verifyError) {
      setError(verifyError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (phone.length !== 10) {
      setError("Missing phone number. Return to login and request a new OTP.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to resend OTP right now.");
      }

      setSuccess("A new OTP has been sent to your registered mobile number.");
      setOtp("");
    } catch (resendError) {
      setError(resendError.message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[var(--background)]">
      <div className="page-shell mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="panel-surface relative overflow-hidden rounded-[2rem] p-6 lg:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-white/60" />
            <div className="mb-4 inline-flex w-fit items-center gap-3 rounded-full border border-white/65 bg-white/75 px-4 py-2 text-sm font-medium text-sky-950 shadow-sm backdrop-blur">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-900 text-sm font-semibold text-white">
                OTP
              </span>
              Verify
            </div>
            <div className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] bg-white">
              <Image
                src="/healthy-teeth.svg"
                alt="Healthy teeth illustration"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </section>

          <section className="flex items-center">
            <div className="login-card w-full rounded-[2rem] p-6 shadow-[0_30px_80px_rgba(15,23,42,0.16)] sm:p-8">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700/70">
                    OTP verification
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    Confirm your login
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                >
                  Change number
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleVerify}>
                <div className="space-y-2">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter 4-6 digit OTP"
                    value={otp}
                    onChange={(event) => {
                      setOtp(event.target.value.replace(/\D/g, "").slice(0, 6));
                      if (error) setError("");
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-lg tracking-[0.35em] text-slate-900 outline-none placeholder:tracking-normal placeholder:text-slate-400"
                  />
                </div>

                {devCode ? (
                  <p className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                    Local development OTP: <span className="font-semibold">{devCode}</span>
                  </p>
                ) : null}

                {error ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </p>
                ) : null}

                {success ? (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {success}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-900 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>
              </form>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <Link
                  href="/"
                  className="text-sm font-medium text-sky-700 transition hover:text-sky-900"
                >
                  Change number
                </Link>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
