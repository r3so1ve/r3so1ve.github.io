// Defaults applied to every file in src/posts/.
// A post is just a Markdown file here; this wires it into the site.

module.exports = {
  tags: ["posts"], // puts the post in collections.posts — do NOT set `tags` in a post
  layout: "post.njk",
  isPost: true,

  eleventyComputed: {
    // draft: true  ->  visible in `npm run serve`, but NOT built for production.
    // (ELEVENTY_RUN_MODE is "build" for `npm run build`, "serve"/"watch" locally.)
    eleventyExcludeFromCollections: (data) =>
      data.draft && process.env.ELEVENTY_RUN_MODE === "build"
        ? true
        : data.eleventyExcludeFromCollections || false,

    // Don't even write a page for a draft in a production build.
    permalink: (data) =>
      data.draft && process.env.ELEVENTY_RUN_MODE === "build" ? false : data.permalink,
  },
};
