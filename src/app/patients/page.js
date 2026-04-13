import PatientSearchPage from "@/components/patient-search-page";
import { countPatients, listPatients, searchPatients } from "@/lib/patient-service";

export const metadata = {
  title: "Search Patients | DentistFlow Clinic OS",
  description:
    "Search patient records stored in the DentistFlow clinic database.",
};

export default async function PatientsRoute({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const query = String(resolvedSearchParams.query || "").trim();
  const patients = query ? await searchPatients(query, 25) : await listPatients(25);
  const totalCount = await countPatients();

  return (
    <PatientSearchPage
      patients={patients}
      query={query}
      totalCount={totalCount}
    />
  );
}
