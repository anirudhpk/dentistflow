import { NextResponse } from "next/server";

import { getPatientById, updatePatient } from "@/lib/patient-service";

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

  return NextResponse.json({ patient });
}

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const patient = await updatePatient(resolvedParams.id, body);

    return NextResponse.json({ patient });
  } catch (error) {
    const status = error.message === "Patient not found." ? 404 : 400;

    return NextResponse.json(
      {
        error: error.message || "Unable to update patient.",
      },
      { status }
    );
  }
}
