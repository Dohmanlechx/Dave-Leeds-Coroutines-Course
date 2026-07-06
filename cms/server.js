'use strict';

const express = require('express');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const { buildMarkdown, parseMarkdown } = require('./lib/markdown');
const { rewrite } = require('./lib/claude');

const PORT = process.env.CMS_PORT || 4000;
const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs-site', 'docs');
const STRUCTURE_PATH = path.join(ROOT, 'course-structure.json');

const structure = JSON.parse(fs.readFileSync(STRUCTURE_PATH, 'utf8'));

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

app.listen(PORT, () => {
  console.log(`\n  TIL CMS running:  http://localhost:${PORT}`);
  console.log(`  Writing notes to: ${DOCS_DIR}\n`);
});
