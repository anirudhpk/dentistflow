import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const sqlitePath = join(process.cwd(), "data", "dentistflow.sqlite");
const outputDir = join(process.cwd(), "tmp");
const outputPath = join(outputDir, "patients-export.json");

mkdirSync(outputDir, { recursive: true });

const db = new DatabaseSync(sqlitePath);
const rows = db.prepare("SELECT * FROM patients ORDER BY datetime(created_at) ASC").all();

writeFileSync(outputPath, JSON.stringify(rows, null, 2));
console.log(`Exported ${rows.length} patients to ${outputPath}`);
