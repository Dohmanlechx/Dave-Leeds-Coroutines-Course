'use strict';

const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const { buildMarkdown, parseMarkdown } = require('./lib/markdown');
const { rewrite } = require('./lib/claude');

const PORT = process.env.CMS_PORT || 4000;
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs-site', 'docs');
const STRUCTURE_PATH = path.join(ROOT, 'course-structure.json');

const structure = JSON.parse(fs.readFileSync(STRUCTURE_PATH, 'utf8'));

// Where the Docusaurus dev server serves the published notes. The baseUrl is read
// straight from the docs config so the two never drift; the port is Docusaurus's
// default (overridable to match `npm run docs`).
const DOCS_PORT = process.env.DOCS_PORT || 3000;
const DOCS_BASE_URL = (() => {
  try {
    const cfg = fs.readFileSync(path.join(ROOT, 'docs-site', 'docusaurus.config.js'), 'utf8');
    const m = /baseUrl:\s*['"]([^'"]+)['"]/.exec(cfg);
    const base = m ? m[1] : '/';
    return base.endsWith('/') ? base : base + '/';
  } catch {
    return '/';
  }
})();

// The URL a saved lesson is published at. Docusaurus drops leading `NN-` number
// prefixes from each path segment, so we mirror that to land on the real page.
function previewUrl(moduleSlug, lessonSlug) {
  const clean = (seg) => seg.replace(/^\d+-/, '');
  return `http://localhost:${DOCS_PORT}${DOCS_BASE_URL}${clean(moduleSlug)}/${clean(lessonSlug)}`;
}

// Fast lookup: moduleSlug -> module, and moduleSlug/lessonSlug -> { lesson, module, index }.
const moduleBySlug = new Map();
const lessonIndex = new Map();
structure.forEach((mod, moduleOrder) => {
  moduleBySlug.set(mod.slug, { ...mod, moduleOrder });
  mod.lessons.forEach((lesson, i) => {
    lessonIndex.set(`${mod.slug}/${lesson.slug}`, {
      lesson,
      module: mod,
      sidebarPosition: i + 1,
      moduleOrder,
    });
  });
});

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function docPath(moduleSlug, lessonSlug) {
  return path.join(DOCS_DIR, moduleSlug, `${lessonSlug}.md`);
}

// Ensure the module folder exists and has a _category_.json so Docusaurus labels/orders it.
async function ensureCategory(mod, moduleOrder) {
  const dir = path.join(DOCS_DIR, mod.slug);
  await fsp.mkdir(dir, { recursive: true });
  const categoryPath = path.join(dir, '_category_.json');
  if (!fs.existsSync(categoryPath)) {
    const category = {
      label: mod.module,
      position: moduleOrder + 1,
      collapsed: true,
    };
    await fsp.writeFile(categoryPath, JSON.stringify(category, null, 2) + '\n', 'utf8');
  }
}

// Directory that holds a module's pasted images (referenced as ./img/<file> from the .md).
function imgDir(moduleSlug) {
  return path.join(DOCS_DIR, moduleSlug, 'img');
}

// Resolve a request's asset path safely: known module, no traversal, .webp only.
function safeAssetPath(moduleSlug, file) {
  if (!moduleBySlug.has(moduleSlug)) return null;
  const name = path.basename(file || '');
  if (!name.toLowerCase().endsWith('.webp')) return null;
  return path.join(imgDir(moduleSlug), name);
}

// --- API ------------------------------------------------------------------

// Course menu, annotated with whether each lesson already has a saved note.
app.get('/api/structure', (_req, res) => {
  const annotated = structure.map((mod) => ({
    module: mod.module,
    slug: mod.slug,
    lessons: mod.lessons.map((lesson) => ({
      title: lesson.title,
      slug: lesson.slug,
      hasNote: fs.existsSync(docPath(mod.slug, lesson.slug)),
    })),
  }));
  res.json(annotated);
});

// Load an existing note (or empty fields) for a lesson.
app.get('/api/note/:moduleSlug/:lessonSlug', async (req, res) => {
  const { moduleSlug, lessonSlug } = req.params;
  const info = lessonIndex.get(`${moduleSlug}/${lessonSlug}`);
  if (!info) return res.status(404).json({ error: 'Unknown lesson' });

  const file = docPath(moduleSlug, lessonSlug);
  let fields = { keyTakeaways: '', stillUnclear: '', generalNotes: '', codeSnippets: '' };
  let exists = false;
  try {
    const md = await fsp.readFile(file, 'utf8');
    fields = parseMarkdown(md);
    exists = true;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }

  res.json({
    title: info.lesson.title,
    module: info.module.module,
    fields,
    exists,
    previewUrl: previewUrl(moduleSlug, lessonSlug),
  });
});

// Save (write/overwrite) a note as a Markdown file in the Docusaurus docs folder.
app.post('/api/note/:moduleSlug/:lessonSlug', async (req, res) => {
  try {
    const { moduleSlug, lessonSlug } = req.params;
    const info = lessonIndex.get(`${moduleSlug}/${lessonSlug}`);
    if (!info) return res.status(404).json({ error: 'Unknown lesson' });

    await ensureCategory(info.module, info.moduleOrder);

    const md = buildMarkdown(req.body.fields || {}, {
      title: info.lesson.title,
      module: info.module.module,
      sidebarPosition: info.sidebarPosition,
    });

    await fsp.writeFile(docPath(moduleSlug, lessonSlug), md, 'utf8');
    res.json({ ok: true });
  } catch (err) {
    console.error('Save failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Grammar-fix a chunk of text with the local claude CLI.
app.post('/api/rewrite', async (req, res) => {
  const text = (req.body && req.body.text) || '';
  if (!text.trim()) return res.json({ text: '' });
  try {
    const corrected = await rewrite(text);
    res.json({ text: corrected });
  } catch (err) {
    console.error('Rewrite failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Save a pasted screenshot (already converted to WebP client-side) next to the lesson.
app.post(
  '/api/image/:moduleSlug/:lessonSlug',
  express.raw({ type: 'image/webp', limit: '25mb' }),
  async (req, res) => {
    try {
      const { moduleSlug, lessonSlug } = req.params;
      const info = lessonIndex.get(`${moduleSlug}/${lessonSlug}`);
      if (!info) return res.status(404).json({ error: 'Unknown lesson' });
      if (!req.body || !req.body.length) return res.status(400).json({ error: 'Empty image' });

      await ensureCategory(info.module, info.moduleOrder);
      await fsp.mkdir(imgDir(moduleSlug), { recursive: true });

      const suffix = Math.random().toString(36).slice(2, 6);
      const file = `${lessonSlug}-${Date.now()}${suffix}.webp`;
      await fsp.writeFile(path.join(imgDir(moduleSlug), file), req.body);

      res.json({
        file,
        markdown: `![screenshot](./img/${file})`,
        url: `/api/asset/${moduleSlug}/${file}`,
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Serve a stored image (used by the CMS thumbnail strip).
app.get('/api/asset/:moduleSlug/:file', (req, res) => {
  const full = safeAssetPath(req.params.moduleSlug, req.params.file);
  if (!full) return res.status(400).end();
  res.sendFile(full, (err) => {
    if (err && !res.headersSent) res.status(404).end();
  });
});

// Delete a stored image (thumbnail × removal).
app.delete('/api/asset/:moduleSlug/:file', async (req, res) => {
  const full = safeAssetPath(req.params.moduleSlug, req.params.file);
  if (!full) return res.status(400).json({ error: 'Bad asset path' });
  try {
    await fsp.unlink(full);
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'ENOENT') return res.json({ ok: true }); // already gone
    console.error('Image delete failed:', err);
    res.status(500).json({ error: err.message });
  }
});

// Open the given URL in the default browser (best-effort, cross-platform).
function openBrowser(url) {
  const cmd =
    process.platform === 'win32' ? 'cmd'
    : process.platform === 'darwin' ? 'open'
    : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '""', url] : [url];
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
  } catch {
    /* opening the browser is a convenience; ignore failures */
  }
}

app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  TIL CMS running:  ${url}`);
  console.log(`  Writing notes to: ${DOCS_DIR}\n`);
  // Launched via the double-click icon (cms.cmd sets CMS_OPEN) — pop the browser
  // once we're actually listening, so there's no connect-before-ready race.
  if (process.env.CMS_OPEN) openBrowser(url);
});
