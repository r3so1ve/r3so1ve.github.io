// Eleventy configuration (CommonJS). No "type":"module" in package.json.
// Zero plugin dependencies on purpose — Markdown and the sitemap are all
// produced from built-in features so there is less that can break on upgrade.

const WPM = 200; // words-per-minute used for reading-time estimates

function stripHtml(s) {
  return String(s || "").replace(/<[^>]*>/g, " ");
}
function countWords(s) {
  const t = stripHtml(s).trim();
  return t ? t.split(/\s+/).length : 0;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}
function asDate(d) {
  return d instanceof Date ? d : new Date(d);
}

module.exports = function (eleventyConfig) {
  // ---- Static assets copied straight through to the output ----
  eleventyConfig.addPassthroughCopy({ "src/styles.css": "styles.css" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  // ---- Markdown: allow inline HTML (callouts) and give every table the
  //      .post-table class the stylesheet expects, so styles.css is untouched.
  eleventyConfig.amendLibrary("md", (md) => {
    md.set({ html: true, linkify: false, breaks: false });
    // Wrap every table so it can scroll horizontally on narrow screens
    // instead of forcing the whole page to scroll (CVSS vectors are long).
    md.renderer.rules.table_open = () => '<div class="table-wrap"><table class="post-table">\n';
    md.renderer.rules.table_close = () => '</table></div>\n';
  });

  // ---- Posts collection, newest first ----
  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByTag("posts").sort((a, b) => b.date - a.date)
  );

  // ---- Reading time / word counts ----
  eleventyConfig.addFilter("wordCount", (c) => countWords(c));
  eleventyConfig.addFilter("readingTime", (c) => Math.max(1, Math.ceil(countWords(c) / WPM)) + " min");
  eleventyConfig.addFilter("sumWords", (posts) =>
  (posts || []).reduce((n, p) => {
    let content = "";
    try { content = p.templateContent; } catch (e) { content = ""; }
    return n + countWords(content);
  }, 0)
);
  eleventyConfig.addFilter("compactNumber", (n) => {
    n = Number(n) || 0;
    if (n >= 1000) return (Math.round(n / 100) / 10).toString().replace(/\.0$/, "") + "k";
    return String(n);
  });

  // ---- Listing helpers ----
  eleventyConfig.addFilter("featuredPost", (posts) => (posts || []).find((p) => p.data.featured) || null);

  eleventyConfig.addFilter("tagList", (posts) => {
    const m = new Map();
    (posts || []).forEach((p) => {
      const t = p.data.tag;
      if (!t) return;
      m.set(t, (m.get(t) || 0) + 1);
    });
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([id, count]) => ({ id, label: id, count }));
  });

  const SEVS = ["critical", "high", "medium", "low", "info"];
  eleventyConfig.addFilter("severityData", (posts) => {
    const rows = SEVS.map((s) => ({ s, n: (posts || []).filter((p) => p.data.sev === s).length }));
    const max = Math.max(1, ...rows.map((r) => r.n));
    return { rows, max };
  });

  eleventyConfig.addFilter("groupByYear", (posts) => {
    const groups = new Map();
    (posts || []).forEach((p) => {
      const y = asDate(p.date).getUTCFullYear();
      if (!groups.has(y)) groups.set(y, []);
      groups.get(y).push(p);
    });
    return [...groups.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, ps]) => {
        ps.sort((a, b) => b.date - a.date);
        return {
          year,
          posts: ps,
          crit: ps.filter((p) => p.data.sev === "critical").length,
          high: ps.filter((p) => p.data.sev === "high").length,
          topics: new Set(ps.map((p) => p.data.tag).filter(Boolean)).size,
        };
      });
  });

  eleventyConfig.addFilter("head", (arr, n) => (arr || []).slice(0, n));

  // ---- Dates ----
  eleventyConfig.addFilter("isoDate", (d) => {
    const dt = asDate(d);
    return dt.getUTCFullYear() + "-" + pad2(dt.getUTCMonth() + 1) + "-" + pad2(dt.getUTCDate());
  });
  eleventyConfig.addFilter("rfc3339", (d) => asDate(d).toISOString());
  eleventyConfig.addFilter("timeAgo", (d) => {
    const days = Math.floor((Date.now() - asDate(d).getTime()) / 86400000);
    if (days <= 0) return "today";
    if (days < 7) return days + "d";
    if (days < 30) return Math.floor(days / 7) + "w";
    if (days < 365) return Math.floor(days / 30) + "mo";
    return Math.floor(days / 365) + "y";
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
};