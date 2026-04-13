import AddPatientPage from "@/components/add-patient-page";

export const metadata = {
  title: "Add Patient | DentistFlow Clinic OS",
  description:
    "Register a new patient and start a new visit from the DentistFlow clinic workspace.",
};

export default function NewPatientRoute() {
  return <AddPatientPage />;
}
