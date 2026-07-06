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
    body.push(`## ${heading}`, '', value, '');
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
    if (currentKey) result[currentKey] = buffer.join('\n').trim();
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
