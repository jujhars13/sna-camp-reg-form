// Sort, search, per-column filters and column picker for the camp report.
// Served as a static file so the CSP can stay at script-src 'self'.
//
// List.js does the sorting and holds the filtered/visible state. Its built-in
// search isn't used: it matches against cell innerHTML (so "O'Brien" is stored
// as "O&#39;Brien") and regex-escapes the term before an indexOf, so "9.5" or
// "2015-03" never match. Instead, the global search and column filters run
// through one list.filter() predicate on each cell's textContent.
(() => {
  const container = document.getElementById("report-list");
  if (!container) return;

  const table = container.querySelector("table");
  const valueNames = [...table.querySelectorAll("thead .sort")].map(
    (btn) => btn.dataset.sort,
  );
  const list = new List(container, { valueNames });

  const search = container.querySelector("#report-search");
  const filters = [...container.querySelectorAll("input[data-filter]")];
  const count = document.getElementById("count");
  const total = Number(count.dataset.total);

  const norm = (s) => s.trim().toLowerCase();
  const cellText = (item, key) =>
    item.elm.querySelector(`.${key}`)?.textContent.toLowerCase() ?? "";

  function applyFilters() {
    const words = norm(search.value).split(/\s+/).filter(Boolean);
    const active = filters
      .map((input) => [input.dataset.filter, norm(input.value)])
      .filter(([, term]) => term);

    if (words.length === 0 && active.length === 0) return list.filter();

    list.filter((item) => {
      if (!active.every(([key, term]) => cellText(item, key).includes(term)))
        return false;
      // Every search word must appear in some column (AND across words).
      const row = item.elm.textContent.toLowerCase();
      return words.every((word) => row.includes(word));
    });
  }

  search.addEventListener("input", applyFilters);
  for (const input of filters) input.addEventListener("input", applyFilters);

  // List.js clears the asc/desc classes on filterStart but keeps the order,
  // so remember the active sort button and put its arrow back.
  let sorted = null;
  list.on("sortComplete", () => {
    const btn = container.querySelector(".sort.asc, .sort.desc");
    sorted = btn && {
      btn,
      order: btn.classList.contains("asc") ? "asc" : "desc",
    };
  });
  list.on("filterComplete", () => {
    sorted?.btn.classList.add(sorted.order);
  });

  list.on("updated", () => {
    const shown = list.matchingItems.length;
    const noun = `camper${total === 1 ? "" : "s"}`;
    count.textContent =
      shown === total ? `${total} ${noun}` : `${shown} of ${total} ${noun}`;
  });

  // List.js detaches filtered-out rows from the DOM, so walk list.items
  // rather than querying the table, or rows hidden now would keep the column
  // when they come back.
  for (const box of container.querySelectorAll("input[data-column]")) {
    const key = box.dataset.column;
    box.addEventListener("change", () => {
      const cells = [
        ...table.tHead.querySelectorAll(`.${key}`),
        ...list.items.map((item) => item.elm.querySelector(`.${key}`)),
      ];
      for (const cell of cells)
        cell?.classList.toggle("col-hidden", !box.checked);
    });
  }

  document
    .getElementById("print")
    .addEventListener("click", () => window.print());

  // CSV of the current view, like Print: matching rows in sorted order
  // (List.js keeps matchingItems in list order), visible columns only.
  // Built in the browser, so no second server route or authz path.
  document.getElementById("csv").addEventListener("click", () => {
    const keys = valueNames.filter(
      (key) =>
        !table.tHead.querySelector(`.${key}`).classList.contains("col-hidden"),
    );
    const header = keys.map(
      (key) =>
        table.tHead.querySelector(`.sort[data-sort="${key}"]`).textContent,
    );
    const rows = list.matchingItems.map((item) =>
      keys.map((key) => item.elm.querySelector(`.${key}`)?.textContent ?? ""),
    );
    // BOM so Excel reads UTF-8 names correctly; CRLF per RFC 4180.
    const csv = `\uFEFF${[header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n")}\r\n`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${container.dataset.camp}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    // Revoking synchronously can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  });

  // Free-text fields (notes, allergies) are parent-entered, so neutralise
  // spreadsheet formula injection: a leading = + - @ tab or CR makes Excel
  // and Sheets evaluate the cell. Prefixing ' forces it to text.
  function csvCell(value) {
    const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  }
})();
