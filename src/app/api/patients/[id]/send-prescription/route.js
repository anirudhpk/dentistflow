import { NextResponse } from "next/server";

import { getPatientById } from "@/lib/patient-service";
import { sendPrescription } from "@/lib/prescription-delivery";

export async function POST(_request, { params }) {
  try {
    const resolvedParams = await params;
    const patient = await getPatientById(resolvedParams.id);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found." }, { status: 404 });
    }

    const results = await sendPrescription(patient);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Unable to send prescription." },
      { status: 400 }
    );
  }
}
