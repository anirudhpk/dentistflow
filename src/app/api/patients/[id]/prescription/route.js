import { NextResponse } from "next/server";

import { getPatientById } from "@/lib/patient-service";
import { generatePrescriptionPdfBytes } from "@/lib/prescription-pdf";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const patient = await getPatientById(resolvedParams.id);

  if (!patient) {
    return NextResponse.json(
      {
        error: "Patient not found.",
      },
      { status: 404 }
    );
  }

  const bytes = await generatePrescriptionPdfBytes(patient);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${patient.id.toLowerCase()}-prescription.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
