import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const globalForDatabase = globalThis;

const seedPatients = [
  {
    id: "PAT-1001",
    fullName: "Ananya Rao",
    email: "",
    phone: "6381948720",
    age: 29,
    gender: "Female",
    chiefComplaint: "Root canal review",
    visitType: "Follow-up",
    status: "Arrived",
    createdAt: "2026-04-05T09:15:00.000Z",
    lifecycleStage: "New patient",
    nextFollowUpDate: "",
    followUpNote: "",
    symptoms: "",
    diagnosis: "",
    recommendedMedicines: "",
    invoiceNumber: "",
    invoiceItems: "",
    invoiceTotal: 0,
    invoiceStatus: "Unpaid",
    invoiceNotes: "",
    updatedAt: "2026-04-05T09:15:00.000Z",
  },
  {
    id: "PAT-1002",
    fullName: "Karthik Iyer",
    email: "",
    phone: "9840022174",
    age: 41,
    gender: "Male",
    chiefComplaint: "Crown placement",
    visitType: "Procedure",
    status: "In chair",
    createdAt: "2026-04-05T10:05:00.000Z",
    lifecycleStage: "Treatment ongoing",
    nextFollowUpDate: "",
    followUpNote: "",
    symptoms: "",
    diagnosis: "",
    recommendedMedicines: "",
    invoiceNumber: "",
    invoiceItems: "",
    invoiceTotal: 0,
    invoiceStatus: "Unpaid",
    invoiceNotes: "",
    updatedAt: "2026-04-05T10:05:00.000Z",
  },
  {
    id: "PAT-1003",
    fullName: "Meera S",
    email: "",
    phone: "9003111476",
    age: 34,
    gender: "Female",
    chiefComplaint: "New consultation",
    visitType: "Consultation",
    status: "Waiting",
    createdAt: "2026-04-04T15:45:00.000Z",
    lifecycleStage: "New patient",
    nextFollowUpDate: "",
    followUpNote: "",
    symptoms: "",
    diagnosis: "",
    recommendedMedicines: "",
    invoiceNumber: "",
    invoiceItems: "",
    invoiceTotal: 0,
    invoiceStatus: "Unpaid",
    invoiceNotes: "",
    updatedAt: "2026-04-04T15:45:00.000Z",
  },
  {
    id: "PAT-1004",
    fullName: "Rahul Menon",
    email: "",
    phone: "8870355128",
    age: 37,
    gender: "Male",
    chiefComplaint: "Scaling and polishing",
    visitType: "Procedure",
    status: "Completed",
    createdAt: "2026-04-03T11:20:00.000Z",
    lifecycleStage: "Recovery",
    nextFollowUpDate: "",
    followUpNote: "",
    symptoms: "",
    diagnosis: "",
    recommendedMedicines: "",
    invoiceNumber: "",
    invoiceItems: "",
    invoiceTotal: 0,
    invoiceStatus: "Unpaid",
    invoiceNotes: "",
    updatedAt: "2026-04-03T11:20:00.000Z",
  },
];

function mapRow(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    age: row.age,
    gender: row.gender,
    chiefComplaint: row.chief_complaint,
    visitType: row.visit_type,
    status: row.status,
    createdAt: row.created_at,
    lifecycleStage: row.lifecycle_stage,
    nextFollowUpDate: row.next_follow_up_date,
    followUpNote: row.follow_up_note,
    symptoms: row.symptoms,
    diagnosis: row.diagnosis,
    recommendedMedicines: row.recommended_medicines,
    invoiceNumber: row.invoice_number,
    invoiceItems: row.invoice_items,
    invoiceTotal: row.invoice_total,
    invoiceStatus: row.invoice_status,
    invoiceNotes: row.invoice_notes,
    updatedAt: row.updated_at,
  };
}

function getDb() {
  if (!globalForDatabase.__dentistSqliteDatabase) {
    const dataDirectory = join(process.cwd(), "data");
    mkdirSync(dataDirectory, { recursive: true });
    const database = new DatabaseSync(join(dataDirectory, "dentistflow.sqlite"));

    database.exec(`
      CREATE TABLE IF NOT EXISTS patients (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL UNIQUE,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        chief_complaint TEXT NOT NULL,
        visit_type TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      ) STRICT
    `);

    const existingColumns = new Set(
      database.prepare("PRAGMA table_info(patients)").all().map((column) => column.name)
    );

    const columnMigrations = [
      ["email", "ALTER TABLE patients ADD COLUMN email TEXT NOT NULL DEFAULT ''"],
      ["invoice_number", "ALTER TABLE patients ADD COLUMN invoice_number TEXT NOT NULL DEFAULT ''"],
      ["invoice_items", "ALTER TABLE patients ADD COLUMN invoice_items TEXT NOT NULL DEFAULT ''"],
      ["invoice_total", "ALTER TABLE patients ADD COLUMN invoice_total REAL NOT NULL DEFAULT 0"],
      ["invoice_status", "ALTER TABLE patients ADD COLUMN invoice_status TEXT NOT NULL DEFAULT 'Unpaid'"],
      ["invoice_notes", "ALTER TABLE patients ADD COLUMN invoice_notes TEXT NOT NULL DEFAULT ''"],
      ["lifecycle_stage", "ALTER TABLE patients ADD COLUMN lifecycle_stage TEXT NOT NULL DEFAULT 'New patient'"],
      ["next_follow_up_date", "ALTER TABLE patients ADD COLUMN next_follow_up_date TEXT NOT NULL DEFAULT ''"],
      ["follow_up_note", "ALTER TABLE patients ADD COLUMN follow_up_note TEXT NOT NULL DEFAULT ''"],
      ["symptoms", "ALTER TABLE patients ADD COLUMN symptoms TEXT NOT NULL DEFAULT ''"],
      ["diagnosis", "ALTER TABLE patients ADD COLUMN diagnosis TEXT NOT NULL DEFAULT ''"],
      ["recommended_medicines", "ALTER TABLE patients ADD COLUMN recommended_medicines TEXT NOT NULL DEFAULT ''"],
      ["updated_at", "ALTER TABLE patients ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''"],
    ];

    for (const [columnName, statement] of columnMigrations) {
      if (!existingColumns.has(columnName)) database.exec(statement);
    }

    const existingCount =
      database.prepare("SELECT COUNT(*) AS count FROM patients").get().count || 0;

    if (existingCount === 0) {
      const insertSeed = database.prepare(`
        INSERT INTO patients (
          id, full_name, email, phone, age, gender, chief_complaint, visit_type,
          status, created_at, lifecycle_stage, next_follow_up_date, follow_up_note,
          symptoms, diagnosis, recommended_medicines, invoice_number, invoice_items,
          invoice_total, invoice_status, invoice_notes, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const patient of seedPatients) {
        insertSeed.run(
          patient.id,
          patient.fullName,
          patient.email,
          patient.phone,
          patient.age,
          patient.gender,
          patient.chiefComplaint,
          patient.visitType,
          patient.status,
          patient.createdAt,
          patient.lifecycleStage,
          patient.nextFollowUpDate,
          patient.followUpNote,
          patient.symptoms,
          patient.diagnosis,
          patient.recommendedMedicines,
          patient.invoiceNumber,
          patient.invoiceItems,
          patient.invoiceTotal,
          patient.invoiceStatus,
          patient.invoiceNotes,
          patient.updatedAt
        );
      }
    }

    globalForDatabase.__dentistSqliteDatabase = database;
  }

  return globalForDatabase.__dentistSqliteDatabase;
}

export const sqlitePatientStore = {
  async getLastPatientId() {
    return (
      getDb()
        .prepare(
          "SELECT id FROM patients WHERE id LIKE 'PAT-%' ORDER BY CAST(SUBSTR(id, 5) AS INTEGER) DESC LIMIT 1"
        )
        .get()?.id || null
    );
  },
  async getLastInvoiceNumber() {
    return (
      getDb()
        .prepare(
          "SELECT invoice_number FROM patients WHERE invoice_number LIKE 'INV-%' ORDER BY CAST(SUBSTR(invoice_number, 5) AS INTEGER) DESC LIMIT 1"
        )
        .get()?.invoice_number || null
    );
  },
  async listPatients(limit) {
    const rows = limit
      ? getDb().prepare("SELECT * FROM patients ORDER BY datetime(created_at) DESC LIMIT ?").all(limit)
      : getDb().prepare("SELECT * FROM patients ORDER BY datetime(created_at) DESC").all();
    return rows.map(mapRow);
  },
  async countPatients() {
    return getDb().prepare("SELECT COUNT(*) AS count FROM patients").get().count || 0;
  },
  async getPatientById(id) {
    const row = getDb().prepare("SELECT * FROM patients WHERE id = ?").get(id);
    return row ? mapRow(row) : null;
  },
  async findPatientByPhone(phone) {
    return getDb().prepare("SELECT id FROM patients WHERE phone = ?").get(phone) || null;
  },
  async findPatientByPhoneExcludingId(phone, id) {
    return getDb().prepare("SELECT id FROM patients WHERE phone = ? AND id != ?").get(phone, id) || null;
  },
  async insertPatient(record) {
    getDb().prepare(`
      INSERT INTO patients (
        id, full_name, email, phone, age, gender, chief_complaint, visit_type, status,
        created_at, lifecycle_stage, next_follow_up_date, follow_up_note, symptoms,
        diagnosis, recommended_medicines, invoice_number, invoice_items, invoice_total,
        invoice_status, invoice_notes, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      record.id, record.fullName, record.email, record.phone, record.age, record.gender,
      record.chiefComplaint, record.visitType, record.status, record.createdAt,
      record.lifecycleStage, record.nextFollowUpDate, record.followUpNote, record.symptoms,
      record.diagnosis, record.recommendedMedicines, record.invoiceNumber, record.invoiceItems,
      record.invoiceTotal, record.invoiceStatus, record.invoiceNotes, record.updatedAt
    );
    return record;
  },
  async updatePatient(id, patient) {
    getDb().prepare(`
      UPDATE patients SET
        full_name = ?, email = ?, phone = ?, age = ?, gender = ?, chief_complaint = ?,
        visit_type = ?, status = ?, lifecycle_stage = ?, next_follow_up_date = ?,
        follow_up_note = ?, symptoms = ?, diagnosis = ?, recommended_medicines = ?,
        invoice_number = ?, invoice_items = ?, invoice_total = ?, invoice_status = ?,
        invoice_notes = ?, updated_at = ?
      WHERE id = ?
    `).run(
      patient.fullName, patient.email, patient.phone, patient.age, patient.gender,
      patient.chiefComplaint, patient.visitType, patient.status, patient.lifecycleStage,
      patient.nextFollowUpDate, patient.followUpNote, patient.symptoms, patient.diagnosis,
      patient.recommendedMedicines, patient.invoiceNumber, patient.invoiceItems,
      patient.invoiceTotal, patient.invoiceStatus, patient.invoiceNotes, patient.updatedAt, id
    );
  },
  async searchPatients(query, digitsOnly, limit) {
    const rows = getDb().prepare(`
      SELECT * FROM patients
      WHERE LOWER(full_name) LIKE ?
        OR LOWER(email) LIKE ?
        OR LOWER(chief_complaint) LIKE ?
        OR LOWER(visit_type) LIKE ?
        OR LOWER(symptoms) LIKE ?
        OR LOWER(diagnosis) LIKE ?
        OR LOWER(recommended_medicines) LIKE ?
        OR phone LIKE ?
        OR id LIKE ?
      ORDER BY datetime(created_at) DESC
      LIMIT ?
    `).all(
      query, query, query, query, query, query, query,
      digitsOnly ? `%${digitsOnly}%` : "%__no_phone_match__%",
      `%${query.replaceAll("%", "").toUpperCase()}%`,
      limit
    );
    return rows.map(mapRow);
  },
};
