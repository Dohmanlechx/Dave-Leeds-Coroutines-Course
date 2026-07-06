'use strict';

// Field definitions — keys must match the server / markdown.js SECTIONS keys.
// type 'list' → bullet-list editor (one input per bullet); 'text' → textarea.
const FIELDS = [
  {
    key: 'keyTakeaways',
    label: 'Key Takeaways',
    type: 'list',
    hint: 'One takeaway per bullet — press Enter for a new bullet.',
  },
  {
    key: 'stillUnclear',
    label: "What I Still Don't Understand",
    type: 'list',
    hint: 'One question per bullet — press Enter for a new bullet.',
  },
  { key: 'generalNotes', label: 'General Notes', type: 'text' },
  {
    key: 'codeSnippets',
    label: 'Code Snippets & Gotchas',
    type: 'text',
    hint: 'Rendered as Markdown — wrap code in ```kotlin fences.',
  },
];

const state = {
  structure: [],
  current: null, // { moduleSlug, lessonSlug }
  dirty: false,
  controllers: {}, // key -> field controller
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
  state.controllers = {};

  FIELDS.forEach((field) => {
    const ctrl =
      field.type === 'list'
        ? buildListField(field, values[field.key] || '')
        : buildTextField(field, values[field.key] || '');
    state.controllers[field.key] = ctrl;
    container.appendChild(ctrl.element);
  });
}

// Shared field chrome: wrapper + head (label + rewrite button) + optional hint.
function buildFieldShell(field) {
  const wrap = document.createElement('div');
  wrap.className = 'field';

  const head = document.createElement('div');
  head.className = 'field-head';
  const label = document.createElement('label');
  label.textContent = field.label;
  const rewriteBtn = document.createElement('button');
  rewriteBtn.type = 'button';
  rewriteBtn.className = 'btn btn-ghost rewrite-btn';
  rewriteBtn.textContent = '✨ Rewrite with Claude';
  head.appendChild(label);
  head.appendChild(rewriteBtn);
  wrap.appendChild(head);

  if (field.hint) {
    const hint = document.createElement('p');
    hint.className = 'field-hint';
    hint.textContent = field.hint;
    wrap.appendChild(hint);
  }

  return { wrap, rewriteBtn };
}

function buildTextField(field, value) {
  const { wrap, rewriteBtn } = buildFieldShell(field);

  const textarea = document.createElement('textarea');
  textarea.rows = 6;
  textarea.spellcheck = true;
  textarea.value = value;
  textarea.addEventListener('input', markDirty);
  wrap.appendChild(textarea);

  const ctrl = {
    element: wrap,
    getMarkdown: () => textarea.value,
    getRewriteInput: () => textarea.value,
    applyRewrite: (str) => {
      textarea.value = str;
      markDirty();
    },
    setDisabled: (b) => {
      textarea.disabled = b;
    },
  };

  rewriteBtn.addEventListener('click', () => rewriteField(rewriteBtn, ctrl));
  return ctrl;
}

// Turn a stored "- item" markdown block into an array of item strings.
function parseBullets(str) {
  if (!str) return [];
  return str
    .split('\n')
    .map((line) => {
      const m = /^\s*[-*]\s+(.*)$/.exec(line);
      return (m ? m[1] : line).trim();
    })
    .filter((s) => s.length);
}

function buildListField(field, markdownStr) {
  const { wrap, rewriteBtn } = buildFieldShell(field);

  const editor = document.createElement('div');
  editor.className = 'list-editor';
  wrap.appendChild(editor);

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-ghost add-item';
  addBtn.textContent = '+ Add item';
  addBtn.addEventListener('click', () => {
    const input = addRow(editor, '');
    input.focus();
    markDirty();
  });
  wrap.appendChild(addBtn);

  const items = parseBullets(markdownStr);
  if (items.length) items.forEach((it) => addRow(editor, it));
  else addRow(editor, '');

  const readItems = () =>
    Array.from(editor.querySelectorAll('.list-input'))
      .map((i) => i.value.trim())
      .filter(Boolean);

  const ctrl = {
    element: wrap,
    getMarkdown: () => readItems().map((i) => `- ${i}`).join('\n'),
    getRewriteInput: () => readItems().map((i) => `- ${i}`).join('\n'),
    applyRewrite: (str) => {
      editor.innerHTML = '';
      const next = parseBullets(str);
      if (next.length) next.forEach((it) => addRow(editor, it));
      else addRow(editor, '');
      markDirty();
    },
    setDisabled: (b) => {
      editor.querySelectorAll('.list-input, .row-remove').forEach((el) => {
        el.disabled = b;
      });
      addBtn.disabled = b;
    },
  };

  rewriteBtn.addEventListener('click', () => rewriteField(rewriteBtn, ctrl));
  return ctrl;
}

// Create one bullet row; inserts after `afterRow` if given, else appends.
function addRow(editor, value, afterRow) {
  const row = document.createElement('div');
  row.className = 'list-row';

  const bullet = document.createElement('span');
  bullet.className = 'bullet';
  bullet.textContent = '•';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'list-input';
  input.spellcheck = true;
  input.value = value;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'row-remove';
  remove.title = 'Remove';
  remove.textContent = '×';

  row.appendChild(bullet);
  row.appendChild(input);
  row.appendChild(remove);

  if (afterRow && afterRow.nextSibling) editor.insertBefore(row, afterRow.nextSibling);
  else editor.appendChild(row);

  input.addEventListener('input', markDirty);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = addRow(editor, '', row);
      next.focus();
      markDirty();
    } else if (e.key === 'Backspace' && input.value === '') {
      const rows = editor.querySelectorAll('.list-row');
      if (rows.length > 1) {
        e.preventDefault();
        const prev = row.previousElementSibling;
        row.remove();
        markDirty();
        const prevInput = prev && prev.querySelector('.list-input');
        if (prevInput) {
          prevInput.focus();
          prevInput.setSelectionRange(prevInput.value.length, prevInput.value.length);
        }
      }
    }
  });

  remove.addEventListener('click', () => {
    const rows = editor.querySelectorAll('.list-row');
    if (rows.length > 1) row.remove();
    else input.value = '';
    markDirty();
  });

  return input;
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

async function rewriteField(btn, ctrl) {
  const text = ctrl.getRewriteInput().trim();
  if (!text) return;

  const original = btn.textContent;
  btn.disabled = true;
  btn.classList.add('loading');
  btn.textContent = '✨ Rewriting…';
  ctrl.setDisabled(true);

  try {
    const { text: corrected } = await api('POST', '/api/rewrite', { text });
    if (corrected) ctrl.applyRewrite(corrected);
  } catch (err) {
    alert('Rewrite failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    btn.textContent = original;
    ctrl.setDisabled(false);
  }
}

async function saveNote() {
  if (!state.current) return;
  const saveBtn = $('#save-btn');
  saveBtn.disabled = true;
  setStatus('Saving…', '');

  const fields = {};
  for (const field of FIELDS) fields[field.key] = state.controllers[field.key].getMarkdown();

  try {
    const { moduleSlug, lessonSlug } = state.current;
    await api('POST', `/api/note/${moduleSlug}/${lessonSlug}`, { fields });
    state.dirty = false;
    setStatus('Saved ✓', 'saved');
    await loadMenu(); // refresh the has-note dot in the sidebar
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
