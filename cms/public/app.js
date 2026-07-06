'use strict';

// Field definitions — keys must match the server / markdown.js SECTIONS keys.
const FIELDS = [
  { key: 'keyTakeaways', label: 'Key Takeaways' },
  { key: 'stillUnclear', label: "What I Still Don't Understand" },
  { key: 'generalNotes', label: 'General Notes' },
  {
    key: 'codeSnippets',
    label: 'Code Snippets & Gotchas',
    hint: 'Rendered as Markdown — wrap code in ```kotlin fences.',
  },
];

const state = {
  structure: [],
  current: null, // { moduleSlug, lessonSlug }
  dirty: false,
  inputs: {}, // key -> textarea element
};

const $ = (sel) => document.querySelector(sel);

async function api(method, url, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// --- Sidebar --------------------------------------------------------------

async function loadMenu() {
  state.structure = await api('GET', '/api/structure');
  renderMenu();
}

function renderMenu() {
  const menu = $('#menu');
  menu.innerHTML = '';

  state.structure.forEach((mod, i) => {
    const section = document.createElement('div');
    section.className = 'module' + (i === 0 ? '' : ' collapsed');

    const toggle = document.createElement('button');
    toggle.className = 'module-toggle';
    toggle.innerHTML =
      `<span class="chevron">▼</span><span class="module-num">${String(i + 1).padStart(2, '0')}</span><span>${escapeHtml(mod.module)}</span>`;
    toggle.addEventListener('click', () => section.classList.toggle('collapsed'));

    const list = document.createElement('ul');
    list.className = 'lessons';

    mod.lessons.forEach((lesson) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'lesson-btn' + (lesson.hasNote ? ' has-note' : '');
      btn.dataset.module = mod.slug;
      btn.dataset.lesson = lesson.slug;
      btn.innerHTML = `<span class="dot"></span><span>${escapeHtml(lesson.title)}</span>`;
      btn.addEventListener('click', () => selectLesson(mod.slug, lesson.slug));
      li.appendChild(btn);
      list.appendChild(li);
    });

    section.appendChild(toggle);
    section.appendChild(list);
    menu.appendChild(section);
  });

  highlightActive();
}

function highlightActive() {
  document.querySelectorAll('.lesson-btn').forEach((btn) => {
    const active =
      state.current &&
      btn.dataset.module === state.current.moduleSlug &&
      btn.dataset.lesson === state.current.lessonSlug;
    btn.classList.toggle('active', !!active);
  });
}

// --- Editor ---------------------------------------------------------------

async function selectLesson(moduleSlug, lessonSlug) {
  if (state.dirty && !confirm('You have unsaved changes. Discard them?')) return;

  const note = await api('GET', `/api/note/${moduleSlug}/${lessonSlug}`);
  state.current = { moduleSlug, lessonSlug };
  state.dirty = false;

  $('#editor').hidden = false;
  $('#editor-module').textContent = note.module;
  $('#editor-title').textContent = note.title;

  renderFields(note.fields);
  setStatus(note.exists ? 'Loaded' : 'New note', note.exists ? 'saved' : '');
  highlightActive();
}

function renderFields(values) {
  const container = $('#fields');
  container.innerHTML = '';
  state.inputs = {};
  const tpl = $('#field-template');

  FIELDS.forEach((field) => {
    const node = tpl.content.cloneNode(true);
    node.querySelector('label').textContent = field.label;
    const hint = node.querySelector('.field-hint');
    if (field.hint) {
      hint.textContent = field.hint;
      hint.hidden = false;
    }
    const textarea = node.querySelector('textarea');
    textarea.value = values[field.key] || '';
    textarea.addEventListener('input', markDirty);
    state.inputs[field.key] = textarea;

    const rewriteBtn = node.querySelector('.rewrite-btn');
    rewriteBtn.addEventListener('click', () => rewriteField(field.key, rewriteBtn));

    container.appendChild(node);
  });
}

function markDirty() {
  if (!state.dirty) {
    state.dirty = true;
    setStatus('Unsaved changes', 'unsaved');
  }
}

function setStatus(text, cls) {
  const el = $('#status');
  el.textContent = text;
  el.className = 'status' + (cls ? ' ' + cls : '');
}

async function rewriteField(key, btn) {
  const textarea = state.inputs[key];
  const text = textarea.value.trim();
  if (!text) return;

  const original = btn.textContent;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = '✨ Rewriting…';
  textarea.disabled = true;

  try {
    const { text: corrected } = await api('POST', '/api/rewrite', { text });
    if (corrected && corrected !== textarea.value) {
      textarea.value = corrected;
      markDirty();
    }
  } catch (err) {
    alert('Rewrite failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = original;
    textarea.disabled = false;
  }
}

async function saveNote() {
  if (!state.current) return;
  const saveBtn = $('#save-btn');
  saveBtn.disabled = true;
  setStatus('Saving…', '');

  const fields = {};
  for (const field of FIELDS) fields[field.key] = state.inputs[field.key].value;

  try {
    const { moduleSlug, lessonSlug } = state.current;
    await api('POST', `/api/note/${moduleSlug}/${lessonSlug}`, { fields });
    state.dirty = false;
    setStatus('Saved ✓', 'saved');
    // Refresh the has-note dot in the sidebar.
    await loadMenu();
  } catch (err) {
    setStatus('Save failed', 'unsaved');
    alert('Save failed: ' + err.message);
  } finally {
    saveBtn.disabled = false;
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
  );
}

// --- Init -----------------------------------------------------------------

$('#save-btn').addEventListener('click', saveNote);
window.addEventListener('beforeunload', (e) => {
  if (state.dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

async function bootstrap() {
  await loadMenu();
  // Show inputs immediately by opening the first lesson.
  const first = state.structure[0];
  if (first && first.lessons[0]) {
    await selectLesson(first.slug, first.lessons[0].slug);
  }
}

bootstrap().catch((err) => {
  document.querySelector('#menu').innerHTML =
    `<p style="padding:16px;color:#e0a437">Could not load course menu: ${escapeHtml(err.message)}</p>`;
});
