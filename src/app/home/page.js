import HomePage from "@/components/home-page";
import { getDashboardMetrics, listPatients } from "@/lib/patient-service";

export const metadata = {
  title: "Clinic Home | DentistFlow Clinic OS",
  description:
    "Manage patients, search records, and monitor clinic visits from the DentistFlow home dashboard.",
};

export default async function ClinicHomeRoute({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const recentPatients = await listPatients(4);
  const dashboardMetrics = await getDashboardMetrics();

  return (
    <HomePage
      recentPatients={recentPatients}
      dashboardMetrics={dashboardMetrics}
      createdPatientId={resolvedSearchParams.created || ""}
    />
  );
}
