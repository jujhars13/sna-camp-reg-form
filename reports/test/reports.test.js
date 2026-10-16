import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { after, before, describe, it, mock } from "node:test";
import { fileURLToPath } from "node:url";
import { createAuthz, parseAccess } from "../src/authz.js";
import { loadCamps, sortCamps } from "../src/camps.js";
import { escapeHtml, renderPage } from "../src/render.js";
import { createApp } from "../src/server.js";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);
const camps = loadCamps(path.join(fixtures, "data"));
const authz = createAuthz(path.join(fixtures, "access.yaml"));

describe("camps", () => {
  it("keys camps by their name field and skips test.json", () => {
    assert.deepEqual([...camps.keys()].sort(), [
      "stratford-road-2025-08-11",
      "west-bromwich-2026-07-20",
    ]);
  });

  it("includes test.json when asked", () => {
    const all = loadCamps(path.join(fixtures, "data"), { includeTest: true });
    assert.ok(all.has("test-2026-08-11"));
  });

  it("sorts newest first", () => {
    assert.deepEqual(
      sortCamps(camps.values()).map((c) => c.name),
      ["west-bromwich-2026-07-20", "stratford-road-2025-08-11"],
    );
  });
});

describe("authz", () => {
  it("grants every camp for a wildcard, case-insensitively", () => {
    assert.ok(authz.canView("admin@example.com", "stratford-road-2025-08-11"));
    assert.ok(authz.canView(" ADMIN@example.com ", "anything"));
  });

  it("limits listed users to their camps", () => {
    assert.ok(authz.canView("leader@example.com", "west-bromwich-2026-07-20"));
    assert.ok(
      !authz.canView("leader@example.com", "stratford-road-2025-08-11"),
    );
  });

  it("denies unlisted emails", () => {
    assert.ok(
      !authz.canView("stranger@example.com", "west-bromwich-2026-07-20"),
    );
    assert.ok(!authz.canView("", "west-bromwich-2026-07-20"));
  });

  it("tolerates an empty file and entries without camps", () => {
    assert.equal(parseAccess("").size, 0);
    assert.equal(parseAccess("users:\n  a@b.com:\n").get("a@b.com").size, 0);
  });
});

describe("render", () => {
  it("escapes HTML", () => {
    assert.equal(
      escapeHtml(`<b a="x">'&`),
      "&lt;b a=&quot;x&quot;&gt;&#39;&amp;",
    );
  });

  it("shows no report without a selected camp", () => {
    const html = renderPage({
      email: "a@b.com",
      camps: sortCamps(camps.values()),
    });
    assert.match(html, /Choose a camp/);
    assert.doesNotMatch(html, /<table/);
    assert.doesNotMatch(html, /<script/);
  });

  it("escapes camper data in the report", () => {
    const html = renderPage({
      email: "a@b.com",
      camps: [],
      selected: camps.get("west-bromwich-2026-07-20"),
      data: {
        columns: ["firstname", "terms"],
        rows: [{ firstname: "<script>x</script>", terms: true }],
      },
      generatedAt: "now",
    });
    assert.match(html, /&lt;script&gt;x&lt;\/script&gt;/);
    assert.match(html, /<td class="col-1">Yes<\/td>/);
    assert.match(html, /data-total="1">1 camper<\/span>/);
  });

  it("adds sort, filter and column controls keyed by position", () => {
    const html = renderPage({
      email: "a@b.com",
      camps: [],
      selected: camps.get("west-bromwich-2026-07-20"),
      data: {
        columns: ["firstname", `Guardian "Name"`],
        rows: [{ firstname: "Ajeet", 'Guardian "Name"': "Kaur" }],
      },
      generatedAt: "now",
    });
    assert.match(
      html,
      /<button type="button" class="sort" data-sort="col-1">Guardian &quot;Name&quot;<\/button>/,
    );
    assert.match(
      html,
      /data-filter="col-1" aria-label="Filter Guardian &quot;Name&quot;"/,
    );
    assert.match(html, /data-column="col-0" checked/);
    assert.match(html, /<tbody class="list">/);
    assert.match(html, /src="\/admin\/static\/list\.min\.js"/);
    assert.match(html, /src="\/admin\/static\/reports\.js"/);
    assert.doesNotMatch(html, /onclick=/);
    assert.match(html, /<button type="button" id="csv"/);
    assert.match(html, /data-camp="west-bromwich-2026-07-20"/);
  });
});

describe("server", () => {
  let server;
  let base;
  const queried = [];
  const db = {
    campers: async (name) => {
      queried.push(name);
      return {
        columns: ["firstname", "surname"],
        rows: [{ firstname: "Ajeet", surname: "Kaur" }],
      };
    },
  };

  before(async () => {
    server = http.createServer(createApp({ camps, authz, db }));
    await new Promise((resolve) => server.listen(0, resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => server.close());

  const get = (url, email) =>
    fetch(base + url, { headers: email ? { "X-Forwarded-Email": email } : {} });

  it("requires an email header", async () => {
    assert.equal((await get("/admin")).status, 401);
  });

  it("lists only the camps a user may see, without a report", async () => {
    const res = await get("/admin", "leader@example.com");
    const html = await res.text();
    assert.equal(res.status, 200);
    assert.match(html, /West Brom 2026/);
    assert.doesNotMatch(html, /Stratford Road 2025/);
    assert.doesNotMatch(html, /<table/);
    assert.equal(queried.length, 0);
  });

  it("renders a permitted camp report", async () => {
    const res = await get(
      "/admin?camp=west-bromwich-2026-07-20",
      "leader@example.com",
    );
    assert.equal(res.status, 200);
    assert.match(await res.text(), /<td class="col-0">Ajeet<\/td>/);
    assert.deepEqual(queried, ["west-bromwich-2026-07-20"]);
  });

  it("forbids camps outside the user's list", async () => {
    const res = await get(
      "/admin?camp=stratford-road-2025-08-11",
      "leader@example.com",
    );
    assert.equal(res.status, 403);
  });

  it("404s unknown camps", async () => {
    assert.equal(
      (await get("/admin?camp=nope", "admin@example.com")).status,
      404,
    );
  });

  it("serves static css and a health check", async () => {
    assert.equal((await get("/admin/static/reports.css")).status, 200);
    assert.equal((await get("/admin/healthz")).status, 200);
  });

  it("serves the report scripts as javascript", async () => {
    for (const file of ["list.min.js", "reports.js"]) {
      const res = await get(`/admin/static/${file}`);
      assert.equal(res.status, 200);
      assert.match(res.headers.get("content-type"), /^text\/javascript/);
    }
  });

  it("only allows same-origin scripts", async () => {
    const csp = (await get("/admin", "leader@example.com")).headers.get(
      "content-security-policy",
    );
    assert.match(csp, /script-src 'self'/);
    assert.doesNotMatch(csp, /unsafe-inline/);
  });

  it("redirects / to /admin", async () => {
    const res = await fetch(`${base}/`, { redirect: "manual" });
    assert.equal(res.status, 302);
    assert.equal(res.headers.get("location"), "/admin");
  });
});

describe("resilience", () => {
  it("keeps no access, without throwing, when access.yaml is malformed", () => {
    const logs = [];
    const broken = createAuthz(
      path.join(fixtures, "broken-access.yaml"),
      (...a) => logs.push(a),
    );
    assert.equal(broken.canView("jujhar@example.com", "anything"), false);
    assert.equal(logs.length, 1);
  });

  it("returns 500 instead of crashing when the db fails", async () => {
    const failing = {
      campers: async () => {
        throw new Error("db down");
      },
    };
    const server = http.createServer(createApp({ camps, authz, db: failing }));
    await new Promise((resolve) => server.listen(0, resolve));
    const quiet = mock.method(console, "error", () => undefined);
    try {
      const res = await fetch(
        `http://127.0.0.1:${server.address().port}/admin?camp=west-bromwich-2026-07-20`,
        {
          headers: { "X-Forwarded-Email": "admin@example.com" },
        },
      );
      assert.equal(res.status, 500);
    } finally {
      quiet.mock.restore();
      server.close();
    }
  });
});
