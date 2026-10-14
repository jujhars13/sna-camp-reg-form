import { readFileSync } from "node:fs";
import pg from "pg";

// Return DATE and TIMESTAMP columns as the strings Postgres sends rather than
// JS Dates, so a dob of 2015-03-01 never shifts a day with the server timezone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, (value) => value);

// TODO: narrow the column list once we know what each report needs.
const CAMPERS_SQL = `
  SELECT 
  id, firstname, surname, dob,
  round((CURRENT_DATE - dob) / 365.25, 1) AS age,
  gender, postcode,
  guardianname AS "Guardian Name", guardiannumber AS "Number",
  allergies, notes
  FROM public.snacamp
  WHERE campname = $1
    AND deleted IS NULL
  ORDER BY surname, firstname
`;

// DATABASE_SSL: "verify" (default) checks the server cert, against
// DATABASE_CA_FILE if given (Supabase signs with its own CA, downloadable from
// the project's database settings). "require" encrypts without verifying,
// "disable" is for the local dev database only.
export function sslConfig(mode = "verify", caFile = "") {
  if (mode === "disable") return false;
  if (mode === "require") return { rejectUnauthorized: false };
  return caFile
    ? { rejectUnauthorized: true, ca: readFileSync(caFile, "utf8") }
    : { rejectUnauthorized: true };
}

export function createDb(connectionString, ssl) {
  const pool = new pg.Pool({ connectionString, ssl, max: 4 });

  async function campers(campName) {
    const result = await pool.query(CAMPERS_SQL, [campName]);
    return {
      columns: result.fields.map((field) => field.name),
      rows: result.rows,
    };
  }

  return { campers, end: () => pool.end() };
}
