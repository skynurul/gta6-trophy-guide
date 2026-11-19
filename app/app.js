// GTA VI trophy guide & tracker — all 55 trophies, offline.
// Data comes from data/trophies.json (the official list). Progress lives in
// localStorage under KEY and can be exported to a file and imported back.
const KEY = 'gta6-trophy-checklist-v1';
const DATA_URL = 'data/trophies.json';

const listEl = document.getElementById('trophy-list');
const emptyEl = document.getElementById('empty-state');
const countEl = document.getElementById('list-count');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade-filter');
const statusEl = document.getElementById('status-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const stagesEl = document.getElementById('roadmap-stages');
const sourceListEl = document.getElementById('source-list');

let doc;
try {
  doc = await (await fetch(DATA_URL)).json();
} catch (err) {
  listEl.innerHTML = '';
  emptyEl.hidden = false;
  emptyEl.textContent = 'Could not load data/trophies.json. Open this page through a local server (for example "node serve.ts") instead of double-clicking the file, or check that data/trophies.json is present.';
  throw err;
}
const trophies = doc.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

// Earned trophy ids, persisted in localStorage.
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]').map(Number).filter((id) => byId.has(id)));
} catch {
  earned = new Set();
}
function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

// UI state (not persisted).
let kindFilter = 'all';
const openGuides = new Set();

const STAGES = [
  { n: 1, title: 'Stage 1 — Play the story', meta: '18 trophies', blurb: 'Finish all 5 chapters and every story mission. Story trophies unlock automatically. Do the one missable meditation in Chapter 1 (see the callout above) and keep a save at the start and end of each chapter.' },
  { n: 2, title: 'Stage 2 — 100% checklist', meta: '13 trophies', blurb: 'After the story, work the 100% Completion Checklist (Progress > Stats > 100% Completion): 100 optional missions, 200 vehicles scanned, 100 animals studied, 300 stunts, 15 card sets, 15 meditation spots, 70 challenges, plus all robberies, ranges, drone races and Bret’s Target Decks.' },
  { n: 3, title: 'Stage 3 — Strangers & cleanup', meta: '24 trophies', blurb: 'Strangers & Freaks strands, side-character finales, activities and the remaining trophies. Five trophies are still unconfirmed by guides — this page says so plainly instead of guessing.' },
];

function gradeLabel(g) {
  return g[0].toUpperCase() + g.slice(1);
}

function isSpoilerHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progress-text').textContent = `${done} of ${total} earned`;
  document.getElementById('progress-pct').textContent = `${pct}% to platinum`;
  document.getElementById('progress-fill').style.width = `${pct}%`;
  const counts = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const all = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
    return `${gradeLabel(g)} ${got}/${all}`;
  });
  document.getElementById('grade-counts').textContent = counts.join(' · ');
  document.getElementById('tracker-progress').textContent = `${done} of ${total} earned · ${pct}% to platinum · ${counts.join(' · ')}`;
}

function renderRoadmap() {
  stagesEl.replaceChildren();
  for (const stage of STAGES) {
    const members = trophies.filter((t) => t.roadmap === stage.n);
    const got = members.filter((t) => earned.has(t.id)).length;
    const card = el('article', 'stage');
    card.append(el('h3', null, stage.title));
    card.append(el('p', 'stage-meta', `${stage.meta} · ${got}/${members.length} earned`));
    card.append(el('p', null, stage.blurb));
    const ul = el('ul');
    for (const t of members) {
      const li = el('li', earned.has(t.id) ? 'earned' : null, isSpoilerHidden(t) ? 'Hidden story trophy' : t.name);
      ul.append(li);
    }
    card.append(ul);
    card.append(el('p', 'stage-progress', got === members.length ? 'Stage complete.' : `${members.length - got} to go in this stage.`));
    stagesEl.append(card);
  }
}

function renderSources() {
  sourceListEl.replaceChildren();
  for (const [name, url] of Object.entries(doc.sourceList ?? {})) {
    const li = el('li');
    const a = el('a', null, name);
    a.href = url;
    li.append(a);
    sourceListEl.append(li);
  }
}

function matchesFilters(t) {
  if (kindFilter === 'missable' && !t.missable) return false;
  if (kindFilter === 'online') return false;
  if (kindFilter !== 'all' && kindFilter !== 'missable' && t.kind !== kindFilter) return false;
  if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !earned.has(t.id)) return false;
  if (statusEl.value === 'not-earned' && earned.has(t.id)) return false;
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = `${t.name} ${t.description} ${t.guide} ${t.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderList() {
  listEl.replaceChildren();
  const shown = trophies.filter(matchesFilters);
  countEl.textContent = `${shown.length} of ${trophies.length} shown`;
  if (kindFilter === 'online') {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No online trophies. GTA VI has no online trophies at all — all 55 are offline and single-player, so there is nothing to earn online.';
    return;
  }
  if (shown.length === 0) {
    emptyEl.hidden = false;
    emptyEl.textContent = 'No trophies match these filters. Try clearing the search or choosing “All”.';
    return;
  }
  emptyEl.hidden = true;

  for (const t of shown) {
    const hidden = isSpoilerHidden(t);
    const li = el('li', 'trophy' + (earned.has(t.id) ? ' is-earned' : ''));
    li.id = `trophy-${t.id}`;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.id);
      else earned.delete(t.id);
      save();
      renderAll();
    });
    li.append(box);

    const body = el('div');
    const head = el('div', 'trophy-head');
    head.append(el('h3', hidden ? 'is-hidden-name' : null, hidden ? 'Hidden story trophy' : t.name));
    head.append(el('span', `badge badge-${t.grade}`, gradeLabel(t.grade)));
    if (t.missable) head.append(el('span', 'badge badge-missable', 'Missable'));
    head.append(el('span', 'badge badge-kind', t.kind));
    body.append(head);
    body.append(el('p', 'trophy-desc' + (hidden ? ' is-hidden-desc' : ''), hidden ? 'Complete the story to reveal this trophy.' : t.description));

    if (!hidden) {
      const open = openGuides.has(t.id);
      const toggle = el('button', 'guide-toggle', open ? 'Hide guide ▲' : 'How to get it ▼');
      toggle.type = 'button';
      toggle.setAttribute('aria-expanded', String(open));
      const guide = el('div', 'guide');
      guide.hidden = !open;
      guide.append(el('p', null, t.guide));
      const src = el('p', 'sources-line', 'Sources: ');
      (t.sources ?? []).forEach((name, i) => {
        if (i > 0) src.append(document.createTextNode(', '));
        const a = el('a', null, name);
        a.href = (doc.sourceList ?? {})[name] ?? '#';
        src.append(a);
      });
      guide.append(src);
      toggle.addEventListener('click', () => {
        if (openGuides.has(t.id)) openGuides.delete(t.id);
        else openGuides.add(t.id);
        renderList();
      });
      body.append(toggle, guide);
    }
    li.append(body);
    listEl.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderList();
}

// Filters.
document.querySelectorAll('[data-kind]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-kind]').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    kindFilter = btn.dataset.kind;
    renderList();
  });
});
gradeEl.addEventListener('change', renderList);
statusEl.addEventListener('change', renderList);
searchEl.addEventListener('input', renderList);
spoilerEl.addEventListener('change', renderAll);

// Export / import / reset.
document.getElementById('export').addEventListener('click', () => {
  const payload = { game: doc.game, platform: doc.platform, exportedAt: new Date().toISOString(), earned: [...earned].sort((a, b) => a - b) };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    let ids = [];
    if (Array.isArray(parsed)) ids = parsed;
    else if (Array.isArray(parsed.earned)) ids = parsed.earned;
    const next = new Set();
    for (const v of ids) {
      if (typeof v === 'number' && byId.has(v)) next.add(v);
      else if (typeof v === 'string' && byName.has(v)) next.add(byName.get(v).id);
    }
    earned = next;
    save();
    renderAll();
  } catch {
    alert('That file could not be imported. Export a progress file from this page and import that one.');
  }
  e.target.value = '';
});
document.getElementById('reset').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? Export a backup first if you want to keep it.')) return;
  earned = new Set();
  save();
  renderAll();
});

renderSources();
renderAll();
