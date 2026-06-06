(function () {
  // ---- Theme toggle (all pages) ----
  var btn = document.getElementById("themeBtn");
  function syncLabel() {
    if (btn) btn.textContent = document.documentElement.dataset.theme === "dark" ? "◐ dark" : "◑ light";
  }
  syncLabel();
  if (btn) {
    btn.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem("sf-theme", next); } catch (e) {}
      syncLabel();
    });
  }

  // ---- Homepage search + tag filter ----
  var search = document.getElementById("searchInput");
  var filterBar = document.getElementById("filterBar");
  var archive = document.getElementById("archive");
  var isHome = !!(search && archive && filterBar);

  function activeTag() {
    var on = filterBar.querySelector(".chip.on");
    return on ? on.dataset.tag : "all";
  }

  function applyFilters() {
    if (!isHome) return;
    var q = (search.value || "").trim().toLowerCase();
    var tag = activeTag();
    var visible = 0;

    archive.querySelectorAll(".row").forEach(function (row) {
      var matchTag = tag === "all" || row.dataset.tag === tag;
      var matchQ = !q || (row.dataset.haystack || "").indexOf(q) !== -1;
      var show = matchTag && matchQ;
      row.hidden = !show;
      if (show) visible++;
    });

    archive.querySelectorAll(".year-block").forEach(function (yb) {
      yb.hidden = !yb.querySelector(".row:not([hidden])");
    });

    var fw = document.getElementById("featuredWrap");
    if (fw) fw.hidden = !!(q || tag !== "all");

    var vc = document.getElementById("visibleCount"); if (vc) vc.textContent = visible;
    var ec = document.getElementById("eofCount"); if (ec) ec.textContent = visible;
    var nr = document.getElementById("noResults"); if (nr) nr.hidden = visible !== 0;
    archive.hidden = visible === 0;
  }

  if (isHome) {
    search.addEventListener("input", applyFilters);
    filterBar.addEventListener("click", function (e) {
      var chip = e.target.closest(".chip");
      if (!chip) return;
      filterBar.querySelectorAll(".chip").forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("on", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      applyFilters();
    });
    var reset = document.getElementById("resetFilters");
    if (reset) {
      reset.addEventListener("click", function () {
        search.value = "";
        var all = filterBar.querySelector('.chip[data-tag="all"]');
        if (all) all.click(); else applyFilters();
      });
    }
  }

  // ---- Keyboard: "/" focus search, Esc clear, "t" toggle theme ----
  document.addEventListener("keydown", function (e) {
    var t = (e.target && e.target.tagName) || "";
    var typing = t === "INPUT" || t === "TEXTAREA";
    if (e.key === "/" && !typing && search) { e.preventDefault(); search.focus(); }
    else if (e.key === "Escape" && typing) { e.target.blur(); if (search) { search.value = ""; applyFilters(); } }
    else if (e.key === "t" && !typing && btn) { btn.click(); }
  });
})();
