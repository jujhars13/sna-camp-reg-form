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
})();
