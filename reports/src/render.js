const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function formatValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function campLabel(camp) {
  return `${camp.humanName} (${camp.from})`;
}

function campDates(camp) {
  return camp.from === camp.to ? camp.from : `${camp.from} to ${camp.to}`;
}

function layout({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/admin/static/pico.min.css">
  <link rel="stylesheet" href="/admin/static/reports.css">
</head>
<body>
  <main class="container-fluid">
${body}
  </main>
</body>
</html>
`;
}

function header(email) {
  return `    <header class="no-print">
      <nav>
        <ul><li><strong>SNA camp reports</strong></li></ul>
        <ul>
          <li><small>${escapeHtml(email)}</small></li>
          <li><a href="/admin/oauth2/sign_out">Sign out</a></li>
        </ul>
      </nav>
    </header>`;
}

function menu(camps, selected) {
  if (camps.length === 0) {
    return `    <section class="no-print">
      <p>You don't have access to any camp reports. Ask an admin to add your email address.</p>
    </section>`;
  }

  const options = camps
    .map(
      (camp) =>
        `<option value="${escapeHtml(camp.name)}"${camp.name === selected ? " selected" : ""}>${escapeHtml(campLabel(camp))}</option>`,
    )
    .join("\n          ");

  return `    <form class="no-print camp-menu" method="get" action="/admin">
      <fieldset role="group">
        <select name="camp" aria-label="Camp" required>
          <option value="" disabled${selected ? "" : " selected"}>Choose a camp…</option>
          ${options}
        </select>
        <button type="submit">Show report</button>
      </fieldset>
    </form>`;
}

function report(camp, { columns, rows }, generatedAt) {
  const head = columns.map((col) => `<th>${escapeHtml(col)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((col) => `<td>${escapeHtml(formatValue(row[col]))}</td>`).join("")}</tr>`,
    )
    .join("\n          ");

  return `    <section class="report">
      <hgroup>
        <h1>${escapeHtml(camp.humanName)}</h1>
        <p>${escapeHtml(campDates(camp))} · ${rows.length} camper${rows.length === 1 ? "" : "s"} · generated ${escapeHtml(generatedAt)}</p>
      </hgroup>
      <button type="button" class="no-print" onclick="window.print()">Print</button>
      <div class="table-wrap">
        <table class="striped">
          <thead><tr>${head}</tr></thead>
          <tbody>
          ${body}
          </tbody>
        </table>
      </div>
    </section>`;
}

export function renderPage({ email, camps, selected, data, generatedAt }) {
  const sections = [header(email), menu(camps, selected?.name)];
  if (selected && data) sections.push(report(selected, data, generatedAt));

  return layout({
    title: selected ? `${selected.humanName} report` : "Camp reports",
    body: sections.join("\n"),
  });
}

export function renderError(status, message) {
  return layout({
    title: `${status}`,
    body: `    <article>
      <h1>${status}</h1>
      <p>${escapeHtml(message)}</p>
      <p><a href="/admin">Back to reports</a></p>
    </article>`,
  });
}
