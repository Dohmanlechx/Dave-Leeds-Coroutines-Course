# Project guide for Claude

David's learning notes for Dave Leeds' Kotlin Coroutines course: a local **CMS** (`cms/`) that
writes Markdown into a **Docusaurus** site (`docs-site/`). Kotlin practice projects live in
`kotlin/`. See `README.md` for how to run everything.

## Commit conventions

Use **[Conventional Commits](https://www.conventionalcommits.org/)**:

```
<type>(<optional scope>): <short summary>
```

- **Title only — never write a commit body.** One subject line per commit (to save tokens).
  Keep the required `Co-Authored-By:` trailer; that footer is not a "body".
- **type** — one of:
  - `feat` — a new feature
  - `fix` — a bug fix
  - `docs` — documentation only
  - `style` — formatting/whitespace, no code-behavior change
  - `refactor` — code change that neither fixes a bug nor adds a feature
  - `perf` — performance improvement
  - `test` — adding or fixing tests
  - `build` / `chore` — build, deps, tooling, config
- **scope** (optional) — the area touched, e.g. `cms`, `docs`, `kotlin`.
- **summary** — imperative mood, lowercase, no trailing period (e.g. "add rewrite endpoint").
- Breaking changes: add `!` after the type/scope (e.g. `feat(cms)!: ...`) or a `BREAKING CHANGE:` footer.

Examples:
- `feat(cms): auto-open the first lesson on load`
- `fix(cms): strip model preamble from rewrite output`
- `docs: document the claude CLI prerequisite`
