# Coroutines Learning Notes

David's learning notes for **Dave Leeds' [Kotlin Coroutines and Concurrency](https://courses.typealias.com/coroutines)** course.

Two pieces:

- **CMS** (`cms/`) - a small local web app. Menu of every course lesson; click one to write
  notes in structured fields (Key Takeaways · What I Still Don't Understand · General Notes ·
  Code Snippets & Gotchas). Each field has a **Rewrite with Claude** button that fixes only
  grammar/spelling. **Save** writes a Markdown file straight into the docs site.
- **Docs site** (`docs-site/`) - a [Docusaurus](https://docusaurus.io) site that publishes
  the notes. Anything saved in the CMS shows up here automatically.

Also: `kotlin/` for practice projects (see its README).

Runs locally on **macOS and Windows** - everything is Node + npm scripts.

## Prerequisites

- **Node.js 18+** and npm.
- The **`claude` CLI** installed and on your PATH (used by the *Rewrite with Claude* button -
  no API key needed, it uses your Claude subscription). Check with `claude --version`.

## Setup

From the repo root:

```bash
npm install
```

This installs both the CMS and the docs site (npm workspaces).

## Running

Start both servers at once:

```bash
npm run dev:search   # docs served as a real build - search works
npm run dev          # docs in dev mode - instant hot reload, no search
```

- CMS:  http://localhost:4000  ← write your notes here
- Docs: http://localhost:3000  ← preview the published site

Both use the same ports; they differ only in how the docs site is served (see
*Search* below). Or run the pieces individually: `npm run cms` / `npm run docs` /
`npm run docs:search`.

**No terminal:** double-click **`cms.cmd`** (or the *Coroutines Notes CMS* shortcut on the
Desktop). It runs `npm run dev:search`, so **both** the CMS and the docs site start with
search working, then opens the CMS (http://localhost:4000) in your browser. Use the
**Preview ↗** button in the CMS to jump to the current lesson on the docs site
(http://localhost:3000). Close the little console window to stop both.

### Search

The docs site has an offline search box (`@easyops-cn/docusaurus-search-local`) - the index is
built locally, so there's no Algolia account or network call. **Docusaurus only generates that
index during a real build**, which is why the dev server tells you to run a build instead.

So `npm run dev:search` (and therefore `cms.cmd`) builds the site and serves the built output
via `scripts/serve-docs.js`, which also watches `docs-site/docs/` and rebuilds a couple of
seconds after you save. The trade-off versus `npm run dev`:

- First start takes ~15s longer (that's the build).
- A saved note appears in the docs after a short rebuild, not instantly - the console prints
  `[docs] ready ...` when the refreshed page is live.

Use plain `npm run dev` when you're writing a lot and want instant reloads and don't need search.

### Workflow

1. Open the CMS (http://localhost:4000).
2. Pick a lesson from the sidebar, write your notes, optionally hit **Rewrite with Claude**.
3. Click **Save**. A Markdown file is written to `docs-site/docs/<module>/<lesson>.md`.
4. The docs site hot-reloads and shows the lesson under its module.

**Screenshots:** paste an image (Ctrl/Cmd+V) into the **General Notes** or **Code Snippets &
Gotchas** field. It's compressed to WebP, saved next to the lesson under `img/`, and inserted
as a Markdown image (with a thumbnail preview you can remove).

## How notes are stored

Each note is a single Markdown file under `docs-site/docs/`, with frontmatter plus fixed
`##` sections. **The Markdown file is the only source of truth** - reopening a lesson in the
CMS parses the file back into the fields. Editing the `.md` by hand works too.

## Build a static site (optional, later)

```bash
npm run build:docs   # outputs docs-site/build/
```

## Editing the lesson list

The menu and folder structure come from `course-structure.json` at the repo root - edit
there to add/rename lessons or modules.
