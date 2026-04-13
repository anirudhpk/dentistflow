import { Pool } from "pg";

const globalForPg = globalThis;

const seedPatients = [
  ["PAT-1001", "Ananya Rao", "", "6381948720", 29, "Female", "Root canal review", "Follow-up", "Arrived", "2026-04-05T09:15:00.000Z", "New patient", "", "", "", "", "", "", "", 0, "Unpaid", "", "2026-04-05T09:15:00.000Z"],
  ["PAT-1002", "Karthik Iyer", "", "9840022174", 41, "Male", "Crown placement", "Procedure", "In chair", "2026-04-05T10:05:00.000Z", "Treatment ongoing", "", "", "", "", "", "", "", 0, "Unpaid", "", "2026-04-05T10:05:00.000Z"],
  ["PAT-1003", "Meera S", "", "9003111476", 34, "Female", "New consultation", "Consultation", "Waiting", "2026-04-04T15:45:00.000Z", "New patient", "", "", "", "", "", "", "", 0, "Unpaid", "", "2026-04-04T15:45:00.000Z"],
  ["PAT-1004", "Rahul Menon", "", "8870355128", 37, "Male", "Scaling and polishing", "Procedure", "Completed", "2026-04-03T11:20:00.000Z", "Recovery", "", "", "", "", "", "", "", 0, "Unpaid", "", "2026-04-03T11:20:00.000Z"],
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
    createdAt: row.created_at.toISOString ? row.created_at.toISOString() : row.created_at,
    lifecycleStage: row.lifecycle_stage,
    nextFollowUpDate: row.next_follow_up_date,
    followUpNote: row.follow_up_note,
    symptoms: row.symptoms,
    diagnosis: row.diagnosis,
    recommendedMedicines: row.recommended_medicines,
    invoiceNumber: row.invoice_number,
    invoiceItems: row.invoice_items,
    invoiceTotal: Number(row.invoice_total || 0),
    invoiceStatus: row.invoice_status,
    invoiceNotes: row.invoice_notes,
    updatedAt: row.updated_at?.toISOString ? row.updated_at.toISOString() : row.updated_at,
  };
}

async function getPool() {
  if (!globalForPg.__dentistPgPoolPromise) {
    globalForPg.__dentistPgPoolPromise = (async () => {
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
      });

      await pool.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL UNIQUE,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          chief_complaint TEXT NOT NULL,
          visit_type TEXT NOT NULL,
          status TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL,
          lifecycle_stage TEXT NOT NULL DEFAULT 'New patient',
          next_follow_up_date TEXT NOT NULL DEFAULT '',
          follow_up_note TEXT NOT NULL DEFAULT '',
          symptoms TEXT NOT NULL DEFAULT '',
          diagnosis TEXT NOT NULL DEFAULT '',
          recommended_medicines TEXT NOT NULL DEFAULT '',
          invoice_number TEXT NOT NULL DEFAULT '',
          invoice_items TEXT NOT NULL DEFAULT '',
          invoice_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
          invoice_status TEXT NOT NULL DEFAULT 'Unpaid',
          invoice_notes TEXT NOT NULL DEFAULT '',
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const count = Number((await pool.query("SELECT COUNT(*)::int AS count FROM patients")).rows[0].count);
      if (count === 0) {
        for (const patient of seedPatients) {
          await pool.query(`
            INSERT INTO patients (
              id, full_name, email, phone, age, gender, chief_complaint, visit_type, status,
              created_at, lifecycle_stage, next_follow_up_date, follow_up_note, symptoms,
              diagnosis, recommended_medicines, invoice_number, invoice_items, invoice_total,
              invoice_status, invoice_notes, updated_at
            ) VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
            )
          `, patient);
        }
      }

      return pool;
    })();
  }

  return globalForPg.__dentistPgPoolPromise;
}

export const postgresPatientStore = {
  async getLastPatientId() {
    const pool = await getPool();
    return (await pool.query("SELECT id FROM patients WHERE id LIKE 'PAT-%' ORDER BY CAST(SUBSTRING(id FROM 5) AS INTEGER) DESC LIMIT 1")).rows[0]?.id || null;
  },
  async getLastInvoiceNumber() {
    const pool = await getPool();
    return (await pool.query("SELECT invoice_number FROM patients WHERE invoice_number LIKE 'INV-%' ORDER BY CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER) DESC LIMIT 1")).rows[0]?.invoice_number || null;
  },
  async listPatients(limit) {
    const pool = await getPool();
    const result = limit
      ? await pool.query("SELECT * FROM patients ORDER BY created_at DESC LIMIT $1", [limit])
      : await pool.query("SELECT * FROM patients ORDER BY created_at DESC");
    return result.rows.map(mapRow);
  },
  async countPatients() {
    const pool = await getPool();
    return Number((await pool.query("SELECT COUNT(*)::int AS count FROM patients")).rows[0].count);
  },
  async getPatientById(id) {
    const pool = await getPool();
    const row = (await pool.query("SELECT * FROM patients WHERE id = $1", [id])).rows[0];
    return row ? mapRow(row) : null;
  },
  async findPatientByPhone(phone) {
    const pool = await getPool();
    return (await pool.query("SELECT id FROM patients WHERE phone = $1", [phone])).rows[0] || null;
  },
  async findPatientByPhoneExcludingId(phone, id) {
    const pool = await getPool();
    return (await pool.query("SELECT id FROM patients WHERE phone = $1 AND id != $2", [phone, id])).rows[0] || null;
  },
  async insertPatient(record) {
    const pool = await getPool();
    await pool.query(`
      INSERT INTO patients (
        id, full_name, email, phone, age, gender, chief_complaint, visit_type, status,
        created_at, lifecycle_stage, next_follow_up_date, follow_up_note, symptoms,
        diagnosis, recommended_medicines, invoice_number, invoice_items, invoice_total,
        invoice_status, invoice_notes, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )
    `, [
      record.id, record.fullName, record.email, record.phone, record.age, record.gender,
      record.chiefComplaint, record.visitType, record.status, record.createdAt,
      record.lifecycleStage, record.nextFollowUpDate, record.followUpNote, record.symptoms,
      record.diagnosis, record.recommendedMedicines, record.invoiceNumber, record.invoiceItems,
      record.invoiceTotal, record.invoiceStatus, record.invoiceNotes, record.updatedAt,
    ]);
    return record;
  },
  async updatePatient(id, patient) {
    const pool = await getPool();
    await pool.query(`
      UPDATE patients SET
        full_name=$1, email=$2, phone=$3, age=$4, gender=$5, chief_complaint=$6,
        visit_type=$7, status=$8, lifecycle_stage=$9, next_follow_up_date=$10,
        follow_up_note=$11, symptoms=$12, diagnosis=$13, recommended_medicines=$14,
        invoice_number=$15, invoice_items=$16, invoice_total=$17, invoice_status=$18,
        invoice_notes=$19, updated_at=$20
      WHERE id=$21
    `, [
      patient.fullName, patient.email, patient.phone, patient.age, patient.gender,
      patient.chiefComplaint, patient.visitType, patient.status, patient.lifecycleStage,
      patient.nextFollowUpDate, patient.followUpNote, patient.symptoms, patient.diagnosis,
      patient.recommendedMedicines, patient.invoiceNumber, patient.invoiceItems,
      patient.invoiceTotal, patient.invoiceStatus, patient.invoiceNotes, patient.updatedAt, id,
    ]);
  },
  async searchPatients(searchValue, digitsOnly, upperQuery, limit) {
    const pool = await getPool();
    const result = await pool.query(`
      SELECT * FROM patients
      WHERE LOWER(full_name) LIKE $1
        OR LOWER(email) LIKE $1
        OR LOWER(chief_complaint) LIKE $1
        OR LOWER(visit_type) LIKE $1
        OR LOWER(symptoms) LIKE $1
        OR LOWER(diagnosis) LIKE $1
        OR LOWER(recommended_medicines) LIKE $1
        OR phone LIKE $2
        OR id LIKE $3
      ORDER BY created_at DESC
      LIMIT $4
    `, [searchValue, digitsOnly ? `%${digitsOnly}%` : "%__no_phone_match__%", `%${upperQuery}%`, limit]);
    return result.rows.map(mapRow);
  },
};
