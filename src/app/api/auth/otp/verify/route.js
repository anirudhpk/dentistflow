import { NextResponse } from "next/server";

import { verifyOtp } from "@/lib/otp-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await verifyOtp(body.phone, body.otp);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to verify OTP.",
      },
      {
        status: 400,
      }
    );
  }
}
