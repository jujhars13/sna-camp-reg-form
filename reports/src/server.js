import { readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createAuthz, normaliseEmail } from "./authz.js";
import { loadCamps, sortCamps } from "./camps.js";
import { createDb, sslConfig } from "./db.js";
import { renderError, renderPage } from "./render.js";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const STATIC_FILES = {
  "/admin/static/pico.min.css": "pico.min.css",
  "/admin/static/reports.css": "reports.css",
};

// Everything the server needs from the outside world is passed in, so tests
// can build one against fixtures and a fake db.
export function createApp({ camps, authz, db, devEmail = "" }) {
  const sortedCamps = sortCamps(camps.values());
  const staticCache = new Map(
    Object.entries(STATIC_FILES).map(([url, file]) => [
      url,
      readFileSync(path.join(root, "public", file)),
    ]),
  );

  function send(res, status, body, type = "text/html; charset=utf-8") {
    res.writeHead(status, {
      "Content-Type": type,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        "default-src 'none'; style-src 'self'; img-src data:; script-src 'unsafe-inline'; form-action 'self'",
    });
    res.end(body);
  }

  return async function handler(req, res) {
    try {
      await route(req, res);
    } catch (err) {
      console.error(`${req.method} ${req.url} failed:`, err);
      if (!res.headersSent)
        send(res, 500, renderError(500, "Something went wrong"));
      else res.end();
    }
  };

  async function route(req, res) {
    const url = new URL(req.url, "http://reports.local");

    if (req.method !== "GET" && req.method !== "HEAD") {
      return send(res, 405, renderError(405, "Method not allowed"));
    }

    if (url.pathname === "/") {
      res.writeHead(302, { Location: "/admin" });
      return res.end();
    }

    if (url.pathname === "/admin/healthz") {
      return send(res, 200, "ok", "text/plain");
    }

    if (staticCache.has(url.pathname)) {
      res.writeHead(200, {
        "Content-Type": "text/css; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      });
      return res.end(staticCache.get(url.pathname));
    }

    if (url.pathname !== "/admin" && url.pathname !== "/admin/") {
      return send(res, 404, renderError(404, "Page not found"));
    }

    // oauth2-proxy sets this after a successful Google login. The reports
    // container is only reachable through oauth2-proxy, so it can be trusted.
    const email = normaliseEmail(req.headers["x-forwarded-email"] || devEmail);
    if (!email) {
      return send(res, 401, renderError(401, "Not signed in"));
    }

    const visibleCamps = authz.allowedCamps(email, sortedCamps);
    const campName = url.searchParams.get("camp");

    if (!campName) {
      return send(res, 200, renderPage({ email, camps: visibleCamps }));
    }

    const camp = camps.get(campName);
    if (!camp) {
      return send(res, 404, renderError(404, "Unknown camp"));
    }
    if (!authz.canView(email, campName)) {
      return send(
        res,
        403,
        renderError(403, "You don't have access to this camp"),
      );
    }

    const data = await db.campers(campName);
    const generatedAt = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
    });
    return send(
      res,
      200,
      renderPage({
        email,
        camps: visibleCamps,
        selected: camp,
        data,
        generatedAt,
      }),
    );
  }
}

function main() {
  const env = process.env;
  if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set");

  const isDev = env.NODE_ENV === "development";
  const camps = loadCamps(env.CAMPS_DIR || path.join(root, "data"), {
    includeTest: isDev,
  });
  const authz = createAuthz(
    env.ACCESS_FILE || path.join(root, "config", "access.yaml"),
  );
  const db = createDb(
    env.DATABASE_URL,
    sslConfig(env.DATABASE_SSL, env.DATABASE_CA_FILE),
  );
  // Only honoured in development, so a stray env var can't bypass OAuth in prod.
  const devEmail = isDev ? env.DEV_USER_EMAIL || "" : "";

  const port = Number(env.PORT || 3000);
  http
    .createServer(createApp({ camps, authz, db, devEmail }))
    .listen(port, () => {
      console.log(`reports listening on :${port} with ${camps.size} camps`);
    });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => db.end().finally(() => process.exit(0)));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
