import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

// Camp definitions are the same JSON files the registration form uses
// (app/src/data). Each camp's `name` is what the form writes into
// snacamp.campname, so that is the key we report on.
export function loadCamps(dataDir, { includeTest = false } = {}) {
  const camps = new Map();

  for (const file of readdirSync(dataDir)) {
    if (!file.endsWith(".json")) continue;
    if (!includeTest && file === "test.json") continue;

    const camp = JSON.parse(readFileSync(path.join(dataDir, file), "utf8"));
    if (!camp.name) continue;

    camps.set(camp.name, {
      name: camp.name,
      humanName: camp.humanName || camp.name,
      from: camp.date?.from || "",
      to: camp.date?.to || "",
    });
  }

  return camps;
}

// Newest camp first, so the upcoming/most recent camp is at the top of the menu.
export function sortCamps(camps) {
  return [...camps].sort((a, b) => b.from.localeCompare(a.from));
}
