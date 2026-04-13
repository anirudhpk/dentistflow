import { NextResponse } from "next/server";

import { sendOtp } from "@/lib/otp-service";

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await sendOtp(body.phone);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to send OTP.",
      },
      {
        status: 400,
      }
    );
  }
}
