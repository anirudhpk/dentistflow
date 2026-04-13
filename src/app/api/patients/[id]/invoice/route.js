import { NextResponse } from "next/server";

import { generateInvoicePdfBytes } from "@/lib/invoice-pdf";
import { getPatientById } from "@/lib/patient-service";

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const patient = await getPatientById(resolvedParams.id);

  if (!patient) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const bytes = await generateInvoicePdfBytes(patient);

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${patient.id.toLowerCase()}-invoice.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
