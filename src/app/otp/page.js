import { Suspense } from "react";

import OtpPage from "@/components/otp-page";

export const metadata = {
  title: "Enter OTP | DentistFlow Clinic OS",
  description: "Verify your clinic login with the one-time password sent by SMS.",
};

export default function OtpRoutePage() {
  return (
    <Suspense fallback={null}>
      <OtpPage />
    </Suspense>
  );
}
