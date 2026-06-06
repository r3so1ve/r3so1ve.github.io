# Security Forge

Static blog built with [Eleventy](https://www.11ty.dev/). Posts are Markdown
files; the site is generated and deployed by a GitHub Action. The design is the
original Security Forge theme, unchanged — only the engine underneath it is new.

## Quick start

```bash
npm install      # once
npm run serve    # local preview with live reload (also shows drafts)
npm run build    # production build into _site/ (drafts excluded)
```

You need Node 18 or newer.

## How to add a post

See **ADDING-A-POST.md**. Short version: drop one Markdown file in `src/posts/`,
fill the front matter, push to `main`.

## Make it yours

Edit **`src/_data/site.js`** — title, your name, the masthead lede, the about
text, and your contact links. Any contact field left as `""` is hidden, so the
site never shows a placeholder or a dead link. Fill in your real GitHub, email,
and PGP fingerprint there when you have them.

## Project structure

```
.
├── eleventy.config.js        # build config: filters, collections, passthrough
├── package.json
├── .github/workflows/deploy.yml   # builds + deploys on push to main
├── ADDING-A-POST.md
├── BACKLOG.md                # future post ideas (e.g. the "$1 Tahoe" write-up)
└── src/
    ├── _data/
    │   ├── site.js           # ← the file you edit to make the site yours
    │   └── build.js          # current year, auto
    ├── _includes/
    │   ├── base.njk          # page shell: head, top bar, footer
    │   ├── post.njk          # article layout
    │   └── macros.njk        # severity badge + ascii rule helpers
    ├── index.njk             # homepage (masthead, search, filter, archive)
    ├── about.njk             # /about/
    ├── feed.njk              # /feed.xml (Atom)
    ├── sitemap.njk           # /sitemap.xml
    ├── 404.html
    ├── styles.css            # the original theme, untouched
    ├── favicon.ico
    ├── CNAME                 # custom domain (securityforge.is-a.dev)
    ├── assets/app.js         # theme toggle + search/filter (vanilla JS)
    └── posts/
        ├── posts.11tydata.js # post defaults + draft handling
        └── _example-post.md  # draft showcase / copy-me template
```

## How deploy works

On every push to `main`, the GitHub Action runs `npm ci` then `npm run build`,
and publishes the generated `_site/` folder to GitHub Pages. You do not commit
`_site/` — it is built fresh each time (and is in `.gitignore`).

## Migrating the existing repo (`r3so1ve.github.io`)

The old site served raw files from the repo root and compiled React in the
browser. This version builds with Eleventy and deploys via Actions. To switch:

1. **Back up first**: `git checkout -b backup-old-site && git push origin backup-old-site`.
   Then go back to main: `git checkout main`.
2. **Copy this project's contents into the repo root** (so `package.json`,
   `eleventy.config.js`, `src/`, and `.github/` sit at the top level).
3. **Delete the old files** that this replaces:
   `app.jsx`, `data.jsx`, `parts.jsx`, `tweaks-panel.jsx`, the old root
   `index.html`, `posts/template.html`, and the two
   `*-security-forge-blog-design-changes.txt` logs.
   `CNAME` and `favicon.ico` now live in `src/` and are copied to the output on
   build, so remove the old root copies to avoid confusion.
4. **Commit and push** to `main`.
5. In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
   switch from *Deploy from a branch* to **GitHub Actions**.
6. Push once more (or re-run the workflow from the Actions tab). The custom
   domain keeps working because `src/CNAME` is published with the site.

## Notes

- No client-side framework and no in-browser compilation: every page is plain
  static HTML, so it loads fast.
- The only dependency is Eleventy itself (a dev dependency). RSS and the sitemap
  are generated from built-in templates, not plugins.
