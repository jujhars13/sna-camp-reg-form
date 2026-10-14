import { readFileSync, statSync } from "node:fs";
import { parse } from "yaml";

// Rudimentary authZ: a YAML file mapping email addresses to the camps they
// may view. "*" grants every camp. Authentication itself is done upstream by
// oauth2-proxy; this only decides which camps an authenticated email can see.
//
//   users:
//     someone@example.com:
//       camps: ["*"]
export function parseAccess(text) {
  const doc = parse(text) || {};
  const access = new Map();

  for (const [email, entry] of Object.entries(doc.users || {})) {
    const camps = Array.isArray(entry?.camps) ? entry.camps.map(String) : [];
    access.set(email.trim().toLowerCase(), new Set(camps));
  }

  return access;
}

// Re-reads the file whenever its mtime changes, so edits to the mounted YAML
// take effect without restarting the container.
export function createAuthz(accessFile) {
  let mtimeMs = -1;
  let access = new Map();

  function current() {
    const stat = statSync(accessFile);
    if (stat.mtimeMs !== mtimeMs) {
      access = parseAccess(readFileSync(accessFile, "utf8"));
      mtimeMs = stat.mtimeMs;
    }
    return access;
  }

  function canView(email, campName) {
    const allowed = current().get(normaliseEmail(email));
    if (!allowed) return false;
    return allowed.has("*") || allowed.has(campName);
  }

  function allowedCamps(email, camps) {
    return camps.filter((camp) => canView(email, camp.name));
  }

  return { canView, allowedCamps };
}

export function normaliseEmail(email) {
  return (email || "").trim().toLowerCase();
}
