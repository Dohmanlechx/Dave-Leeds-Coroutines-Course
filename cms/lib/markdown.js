'use strict';

/**
 * Markdown round-trip for lesson notes.
 *
 * A note is stored as a single Docusaurus-compatible `.md` file: YAML frontmatter
 * plus fixed H2 sections. The `.md` file is the single source of truth — there is no
 * sidecar JSON. `buildMarkdown` writes it; `parseMarkdown` reads it back into fields.
 */

// The four note fields, in display + file order. `key` matches the API/JSON payload.
const SECTIONS = [
  { key: 'keyTakeaways', heading: 'Key Takeaways' },
  { key: 'stillUnclear', heading: "What I Still Don't Understand" },
  { key: 'generalNotes', heading: 'General Notes' },
  { key: 'codeSnippets', heading: 'Code Snippets & Gotchas' },
];

function escapeYaml(value) {
  return String(value).replace(/"/g, '\\"');
}

/**
 * Docusaurus compiles notes as MDX, which reads `{...}` in prose as a JavaScript
 * expression - so writing `coroutineScope { ... }` in a sentence fails the whole
 * site build with "Could not parse expression with acorn". Braces are escaped on
 * the way out and unescaped on the way back in, so the editor never shows the
 * backslashes.
 *
 * Code is left alone: inside fences and inline code spans MDX doesn't evaluate
 * braces, and a backslash there would corrupt the snippet.
 *
 * @param {string} text
 * @param {(chunk: string) => string} transform  applied only to prose
 * @returns {string}
 */
function mapProse(text, transform) {
  let inFence = false;
  let fenceMarker = '';

  return String(text)
    .split('\n')
    .map((line) => {
      const fence = /^\s*(`{3,}|~{3,})/.exec(line);
      if (fence) {
        const marker = fence[1];
        if (!inFence) {
          inFence = true;
          fenceMarker = marker;
        } else if (marker[0] === fenceMarker[0] && marker.length >= fenceMarker.length) {
          inFence = false;
          fenceMarker = '';
        }
        return line;
      }
      if (inFence) return line;
      // Odd indices are the captured inline-code spans, which stay verbatim.
      return line
        .split(/(`+[^`]*`+)/g)
        .map((part, i) => (i % 2 === 1 ? part : transform(part)))
        .join('');
    })
    .join('\n');
}

// Skipping already-escaped braces keeps this idempotent across repeated saves.
function escapeMdx(text) {
  return mapProse(text, (chunk) => chunk.replace(/(?<!\\)([{}])/g, '\\$1'));
}

function unescapeMdx(text) {
  return mapProse(text, (chunk) => chunk.replace(/\\([{}])/g, '$1'));
}

/**
 * Build the full Markdown document from note fields + lesson metadata.
 * Empty sections are omitted so the published doc stays clean.
 *
 * @param {object} fields  { keyTakeaways, stillUnclear, generalNotes, codeSnippets }
 * @param {object} meta    { title, module, sidebarPosition }
 * @returns {string}
 */
function buildMarkdown(fields, meta) {
  const front = [
    '---',
    `title: "${escapeYaml(meta.title)}"`,
    `sidebar_position: ${Number(meta.sidebarPosition) || 1}`,
    `module: "${escapeYaml(meta.module)}"`,
    '---',
    '',
    `# ${meta.title}`,
    '',
    '',
  ];

  const body = [];
  for (const { key, heading } of SECTIONS) {
    const value = (fields[key] || '').trim();
    if (!value) continue;
    body.push(`## ${heading}`, '', escapeMdx(value), '');
  }

  return front.join('\n') + body.join('\n') + (body.length ? '\n' : '');
}

/**
 * Parse a stored Markdown document back into note fields.
 * Tolerates missing sections (returns empty strings for them).
 *
 * @param {string} md
 * @returns {object} { keyTakeaways, stillUnclear, generalNotes, codeSnippets }
 */
function parseMarkdown(md) {
  const result = {};
  for (const { key } of SECTIONS) result[key] = '';
  if (!md) return result;

  // Strip frontmatter and the leading H1 title.
  let body = md.replace(/^---\n[\s\S]*?\n---\n?/, '');
  body = body.replace(/^\s*# .*\n?/, '');

  // Map exact headings back to field keys.
  const headingToKey = new Map(SECTIONS.map((s) => [s.heading, s.key]));

  const lines = body.split('\n');
  let currentKey = null;
  let buffer = [];

  const flush = () => {
    if (currentKey) result[currentKey] = unescapeMdx(buffer.join('\n').trim());
    buffer = [];
  };

  for (const line of lines) {
    const match = /^## (.+?)\s*$/.exec(line);
    if (match && headingToKey.has(match[1])) {
      flush();
      currentKey = headingToKey.get(match[1]);
    } else if (currentKey) {
      buffer.push(line);
    }
  }
  flush();

  return result;
}

module.exports = { buildMarkdown, parseMarkdown, SECTIONS };
