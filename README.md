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
npm run dev
```

- CMS:  http://localhost:4000  ← write your notes here
- Docs: http://localhost:3000  ← preview the published site

Or run them individually: `npm run cms` / `npm run docs`.

**No terminal:** double-click **`cms.cmd`** (or the *Coroutines Notes CMS* shortcut on the
Desktop). It starts **both** the CMS and the docs site, then opens the CMS
(http://localhost:4000) in your browser. Use the **Preview ↗** button in the CMS to jump to
the current lesson on the docs site (http://localhost:3000). Close the little console window
to stop both.

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
