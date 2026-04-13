import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "pg";

const inputPath = process.argv[2] || join(process.cwd(), "tmp", "patients-export.json");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to import patients into PostgreSQL.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
});

const rows = JSON.parse(readFileSync(inputPath, "utf8"));

const client = await pool.connect();

try {
  await client.query("BEGIN");

  for (const row of rows) {
    await client.query(
      `
        INSERT INTO patients (
          id, full_name, email, phone, age, gender, chief_complaint, visit_type, status,
          created_at, lifecycle_stage, next_follow_up_date, follow_up_note, symptoms,
          diagnosis, recommended_medicines, invoice_number, invoice_items, invoice_total,
          invoice_status, invoice_notes, updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          email = EXCLUDED.email,
          phone = EXCLUDED.phone,
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          chief_complaint = EXCLUDED.chief_complaint,
          visit_type = EXCLUDED.visit_type,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          lifecycle_stage = EXCLUDED.lifecycle_stage,
          next_follow_up_date = EXCLUDED.next_follow_up_date,
          follow_up_note = EXCLUDED.follow_up_note,
          symptoms = EXCLUDED.symptoms,
          diagnosis = EXCLUDED.diagnosis,
          recommended_medicines = EXCLUDED.recommended_medicines,
          invoice_number = EXCLUDED.invoice_number,
          invoice_items = EXCLUDED.invoice_items,
          invoice_total = EXCLUDED.invoice_total,
          invoice_status = EXCLUDED.invoice_status,
          invoice_notes = EXCLUDED.invoice_notes,
          updated_at = EXCLUDED.updated_at
      `,
      [
        row.id,
        row.full_name ?? "",
        row.email ?? "",
        row.phone ?? "",
        Number(row.age ?? 0),
        row.gender ?? "",
        row.chief_complaint ?? "",
        row.visit_type ?? "",
        row.status ?? "",
        row.created_at ?? new Date().toISOString(),
        row.lifecycle_stage ?? "New patient",
        row.next_follow_up_date ?? "",
        row.follow_up_note ?? "",
        row.symptoms ?? "",
        row.diagnosis ?? "",
        row.recommended_medicines ?? "",
        row.invoice_number ?? "",
        row.invoice_items ?? "",
        Number(row.invoice_total ?? 0),
        row.invoice_status ?? "Unpaid",
        row.invoice_notes ?? "",
        row.updated_at ?? row.created_at ?? new Date().toISOString(),
      ]
    );
  }

  await client.query("COMMIT");
  console.log(`Imported ${rows.length} patients from ${inputPath}`);
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  client.release();
  await pool.end();
}
