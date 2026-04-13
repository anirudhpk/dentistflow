import { postgresPatientStore } from "./postgres-patient-store";
import { sqlitePatientStore } from "./sqlite-patient-store";

function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}

function getStore() {
  return process.env.DATABASE_URL ? postgresPatientStore : sqlitePatientStore;
}

function nextIdentifier(prefix, rawValue, fallback) {
  const current = Number(String(rawValue || fallback).replace(`${prefix}-`, ""));
  return `${prefix}-${Number.isFinite(current) ? current + 1 : Number(String(fallback).replace(`${prefix}-`, "")) + 1}`;
}

function normalizePatientInput(input) {
  return {
    fullName: String(input.fullName || "").trim(),
    email: String(input.email || "").trim().toLowerCase(),
    phone: sanitizePhone(input.phone),
    age: Number(input.age),
    gender: String(input.gender || "").trim(),
    chiefComplaint: String(input.chiefComplaint || "").trim(),
    visitType: String(input.visitType || "").trim(),
    status: String(input.status || "Waiting").trim(),
    lifecycleStage: String(input.lifecycleStage || "New patient").trim(),
    nextFollowUpDate: String(input.nextFollowUpDate || "").trim(),
    followUpNote: String(input.followUpNote || "").trim(),
    symptoms: String(input.symptoms || "").trim(),
    diagnosis: String(input.diagnosis || "").trim(),
    recommendedMedicines: String(input.recommendedMedicines || "").trim(),
    invoiceNumber: String(input.invoiceNumber || "").trim(),
    invoiceItems: String(input.invoiceItems || "").trim(),
    invoiceTotal: Number(input.invoiceTotal || 0),
    invoiceStatus: String(input.invoiceStatus || "Unpaid").trim(),
    invoiceNotes: String(input.invoiceNotes || "").trim(),
  };
}

function validatePatient(patient) {
  if (patient.fullName.length < 2) throw new Error("Patient name must be at least 2 characters.");
  if (patient.phone.length !== 10) throw new Error("A valid 10-digit mobile number is required.");
  if (patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patient.email)) {
    throw new Error("Enter a valid email address.");
  }
  if (!Number.isInteger(patient.age) || patient.age < 1 || patient.age > 120) {
    throw new Error("Enter a valid age between 1 and 120.");
  }
  if (!patient.gender) throw new Error("Please select a gender.");
  if (patient.chiefComplaint.length < 3) throw new Error("Chief complaint should be at least 3 characters.");
  if (!patient.visitType) throw new Error("Please select a visit type.");
  if (!patient.lifecycleStage) throw new Error("Please select a lifecycle stage.");
  if (Number.isNaN(patient.invoiceTotal) || patient.invoiceTotal < 0) {
    throw new Error("Enter a valid invoice total.");
  }
}

export async function listPatients(limit) {
  return getStore().listPatients(limit);
}

export async function countPatients() {
  return getStore().countPatients();
}

export async function getDashboardMetrics() {
  const patients = await listPatients();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const windows = [
    { label: "Today", start: startOfToday },
    { label: "Week", start: startOfWeek },
    { label: "Month", start: startOfMonth },
    { label: "All", start: null },
  ];

  return windows.map((window) => {
    const filtered = window.start
      ? patients.filter((patient) => new Date(patient.createdAt) >= window.start)
      : patients;
    return {
      label: window.label,
      visits: filtered.length,
      revenue: filtered.reduce((sum, patient) => sum + Number(patient.invoiceTotal || 0), 0),
      tone:
        window.label === "Today"
          ? "bg-sky-50 border-sky-100"
          : window.label === "Week"
            ? "bg-emerald-50 border-emerald-100"
            : window.label === "Month"
              ? "bg-amber-50 border-amber-100"
              : "bg-white border-slate-200",
    };
  });
}

export async function getPatientById(id) {
  return getStore().getPatientById(id);
}

export async function createPatient(input) {
  const patient = normalizePatientInput(input);
  validatePatient(patient);
  const store = getStore();
  const duplicate = await store.findPatientByPhone(patient.phone);
  if (duplicate) throw new Error("A patient with this phone number already exists.");

  const lastPatientId = await store.getLastPatientId();
  const lastInvoiceNumber = await store.getLastInvoiceNumber();
  const timestamp = new Date().toISOString();

  const record = {
    ...patient,
    id: nextIdentifier("PAT", lastPatientId, "PAT-1000"),
    invoiceNumber: patient.invoiceNumber || nextIdentifier("INV", lastInvoiceNumber, "INV-1000"),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await store.insertPatient(record);
  return record;
}

export async function updatePatient(id, input) {
  const store = getStore();
  const existing = await store.getPatientById(id);
  if (!existing) throw new Error("Patient not found.");

  const patient = normalizePatientInput(input);
  validatePatient(patient);
  const duplicate = await store.findPatientByPhoneExcludingId(patient.phone, id);
  if (duplicate) throw new Error("Another patient already uses this phone number.");

  const updated = {
    ...patient,
    invoiceNumber: existing.invoiceNumber || patient.invoiceNumber || nextIdentifier("INV", await store.getLastInvoiceNumber(), "INV-1000"),
    updatedAt: new Date().toISOString(),
  };

  await store.updatePatient(id, updated);
  return store.getPatientById(id);
}

export async function searchPatients(query, limit = 20) {
  const normalizedQuery = String(query || "").trim();
  if (!normalizedQuery) return listPatients(limit);

  const searchValue = `%${normalizedQuery.toLowerCase()}%`;
  const digitsOnly = sanitizePhone(normalizedQuery);
  return getStore().searchPatients(searchValue, digitsOnly, normalizedQuery.toUpperCase(), limit);
}
