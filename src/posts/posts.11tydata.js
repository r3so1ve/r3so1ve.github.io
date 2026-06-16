// Defaults applied to every file in src/posts/.
// A post is just a Markdown file here; this wires it into the site.

module.exports = {
  tags: ["posts"], // puts the post in collections.posts — do NOT set `tags` in a post
  layout: "post.njk",
  isPost: true,

  eleventyComputed: {
    // draft: true  ->  visible in `npm run serve`, but NOT built for production.
    eleventyExcludeFromCollections: (data) =>
      data.draft && process.env.ELEVENTY_RUN_MODE === "build"
        ? true
        : data.eleventyExcludeFromCollections || false,

    // File-style URLs: /posts/<slug>.html (drafts get no page in a build).
    // This makes a relative image path like ../assets/img/x.png resolve the
    // same way in Obsidian and on the live site.
    permalink: (data) =>
      data.draft && process.env.ELEVENTY_RUN_MODE === "build"
        ? false
        : `/posts/${data.page.fileSlug}.html`,
  },
};