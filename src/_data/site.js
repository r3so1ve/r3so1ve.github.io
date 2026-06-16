// ── EDIT THIS FILE to make the site yours ─────────────────────────────────
// Anything left as "" is HIDDEN in the templates, so nothing fake ever ships.

module.exports = {
  // Identity
  title: "Security Forge",
  brandTag: "Arthur · Security Researcher", // shown after the slash in the logo
  author: "Arthur",
  url: "https://securityforge.is-a.dev", // no trailing slash; used in feed + sitemap

  // Homepage masthead lede (edit freely; plain text)
  description:
    "Security Forge is the working notebook of Arthur — a penetration tester and aspiring security researcher writing about Web and Application security, Active Directory, Network Security, AI/LLM security and GRC. Long-form posts, reproducible labs, plain language, no marketing copy.",

  // 'about' side-panel + /about/ page blurb
  about:
    "I'm Arthur — a penetration tester and aspiring security researcher. I write about what I find and how I find it. Independent; no affiliations on this site.",
  focus: "web · appsec · ad · llm", // short label in the about panel

  // Footer / masthead
  since: 2026, // year you started writing; set to null to hide the "since" stat
  license: "CC BY 4.0", // footer license line; "" to hide

  // Status-strip extras
  tzLabel: "", // e.g. "EST (UTC-5)"; "" hides the cell

  // Contact / social — leave "" to HIDE the item (no dead links, nothing fake)
  github: "https://github.com/r3so1ve", // e.g. "https://github.com/yourname"
  githubLabel: "@r3so1ve", // display text, e.g. "@yourname"; falls back to the URL
  linkedin: "https://www.linkedin.com/in/artur-agakhanyants/", // "" to hide
  linkedinLabel: "artur-agakhanyants", // display text; falls back to the URL
  email: "agakhanyantsartur@gmail.com", // e.g. "you@example.com"
  pgp: {
    fingerprint: "", // e.g. "4F2C 8A1B 9D33 ...". "" hides the whole PGP block
    url: "", // optional link to your public key
  },
};
