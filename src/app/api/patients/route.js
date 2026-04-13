import { NextResponse } from "next/server";

import { createPatient, listPatients, searchPatients } from "@/lib/patient-service";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const query = searchParams.get("query");
  const limit = limitParam ? Number(limitParam) : undefined;

  return NextResponse.json({
    patients: query ? await searchPatients(query, limit || 20) : await listPatients(limit),
  });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const patient = await createPatient(body);

    return NextResponse.json(
      {
        patient,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "Unable to create patient.",
      },
      {
        status: 400,
      }
    );
  }
}
