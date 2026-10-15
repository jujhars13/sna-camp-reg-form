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

function plural(count) {
  return `${count} camper${count === 1 ? "" : "s"}`;
}

// Columns are whatever the query returns, so List.js keys them by position
// (col-0, col-1, …) rather than by name: names like "Guardian Name" aren't
// valid class names. public/reports.js wires up sorting, search, per-column
// filters and the column picker; without JS the plain table still renders.
function report(camp, { columns, rows }, generatedAt) {
  const key = (i) => `col-${i}`;
  const sortHead = columns
    .map(
      (col, i) =>
        `<th class="${key(i)}"><button type="button" class="sort" data-sort="${key(i)}">${escapeHtml(col)}</button></th>`,
    )
    .join("");
  const filterHead = columns
    .map(
      (col, i) =>
        `<th class="${key(i)}"><input type="search" data-filter="${key(i)}" aria-label="Filter ${escapeHtml(col)}" placeholder="Filter"></th>`,
    )
    .join("");
  const picker = columns
    .map(
      (col, i) =>
        `<li><label><input type="checkbox" data-column="${key(i)}" checked> ${escapeHtml(col)}</label></li>`,
    )
    .join("\n              ");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((col, i) => `<td class="${key(i)}">${escapeHtml(formatValue(row[col]))}</td>`).join("")}</tr>`,
    )
    .join("\n          ");

  return `    <section class="report" id="report-list">
      <hgroup>
        <h1>${escapeHtml(camp.humanName)}</h1>
        <p>${escapeHtml(campDates(camp))} · <span id="count" data-total="${rows.length}">${plural(rows.length)}</span> · generated ${escapeHtml(generatedAt)}</p>
      </hgroup>
      <div class="no-print report-controls">
        <input type="search" id="report-search" placeholder="Search all columns" aria-label="Search all columns">
        <details class="dropdown">
          <summary>Columns</summary>
          <ul>
              ${picker}
          </ul>
        </details>
        <button type="button" id="print">Print</button>
      </div>
      <div class="table-wrap">
        <table class="striped">
          <thead>
            <tr>${sortHead}</tr>
            <tr class="filters no-print">${filterHead}</tr>
          </thead>
          <tbody class="list">
          ${body}
          </tbody>
        </table>
      </div>
      <script src="/admin/static/list.min.js" defer></script>
      <script src="/admin/static/reports.js" defer></script>
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
