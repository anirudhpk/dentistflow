import { notFound } from "next/navigation";

import PatientEditorPage from "@/components/patient-editor-page";
import { getPatientById } from "@/lib/patient-service";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const patient = await getPatientById(resolvedParams.id);

  if (!patient) {
    return {
      title: "Patient Not Found | DentistFlow Clinic OS",
    };
  }

  return {
    title: `${patient.fullName} | DentistFlow Clinic OS`,
    description: `Edit clinical details and prescriptions for ${patient.fullName}.`,
  };
}

export default async function PatientDetailRoute({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const patient = await getPatientById(resolvedParams.id);

  if (!patient) {
    notFound();
  }

  return (
    <PatientEditorPage
      patient={patient}
      created={resolvedSearchParams.created === "1"}
    />
  );
}
