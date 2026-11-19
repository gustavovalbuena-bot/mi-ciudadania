// Mi Ciudadanía · Estudio. Práctica diaria del examen cívico (banco 2025, 128 preguntas).
// Sin dependencias ni compilación: módulos ES que corren igual en la web y dentro de Capacitor.
import { GROUPS, VIZ, QUESTIONS } from './data.js';
import { luz } from './mascot.js';
import * as P from './platform.js';

/* ───────────── utilidades ───────────── */
const root = document.getElementById('app');
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const norm = s => s.toLowerCase().replace(/\(.*?\)/g, '').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
const clean = s => String(s).replace(/\s+[–—]\s+/g, ', ').replace(/[–—]/g, ', ');
const esc = s => clean(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymd(new Date());
const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };
const BAD = /visit|vary|visite|var[ií]a/i;
const QBY = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const GBY = Object.fromEntries(GROUPS.map(g => [g.key, g]));

/* ───────────── estado persistente ───────────── */
const KEY = 'mc-estudio.v1';
const fresh = () => ({ v: 1, onboarded: false, goal: 5, senior: false, sound: true, remind: false, xp: 0, streak: 0, lastDay: null, days: [], day: { date: today(), sec: 0, lessons: 0 }, done: {}, stats: {}, personal: {} });
let S;
try { S = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { S = fresh(); }
if (S.day?.date !== today()) S.day = { date: today(), sec: 0, lessons: 0 };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const streakNow = () => (S.lastDay === today() || S.lastDay === yesterday()) ? S.streak : 0;

/* ───────────── unidades y lecciones ───────────── */
const pool = g => QUESTIONS.filter(q => q.group === g && (!S.senior || q.starred));
const per = g => g === 'cambian' ? 4 : 3;
function units() {
  return GROUPS.map(g => { const qs = pool(g.key); return { ...g, qs, n: Math.ceil(qs.length / per(g.key)) }; }).filter(u => u.n);
}
const doneKey = k => (S.senior ? 's:' : '') + k;
const doneOf = k => S.done[doneKey(k)] || 0;
const currentUnit = () => units().find(u => doneOf(u.key) < u.n);
const graded = q => q.group !== 'cambian';

/* ───────────── generadores de ejercicios ───────────── */
function mc(q, lang) {
  const k = lang === 'en' ? 'answers_en' : 'answers_es';
  const good = q[k].filter(a => !BAD.test(a));
  const correct = pick(good);
  const acc = new Set([...q.answers_es, ...q.answers_en].map(norm));
  const same = shuffle(QUESTIONS.filter(x => x.group === q.group && x.id !== q.id).flatMap(x => x[k]));
  const other = shuffle(QUESTIONS.filter(x => x.group !== q.group && graded(x)).flatMap(x => x[k]));
  const seen = new Set([norm(correct)]), out = [];
  for (const a of [...same, ...other]) {
    if (out.length === 3) break;
    const n = norm(a);
    if (BAD.test(a) || acc.has(n) || seen.has(n) || a.length > 80) continue;
    seen.add(n); out.push(a);
  }
  return { options: shuffle([correct, ...out]), correct };
}
function tilesFor(q) {
  const cand = q.answers_en.filter(a => !BAD.test(a)).map(a => a.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim())
    .filter(a => { const w = a.split(' ').length; return w >= 2 && w <= 6; });
  if (!cand.length) return null;
  const target = pick(cand), words = target.split(' ');
  const have = new Set(words.map(norm));
  const extra = shuffle(QUESTIONS.filter(x => x.group === q.group && x.id !== q.id).flatMap(x => x.answers_en.join(' ').replace(/\(.*?\)/g, '').split(/\s+/)))
    .filter(w => w && !BAD.test(w) && !have.has(norm(w)) && (have.add(norm(w)), true)).slice(0, Math.max(3, 7 - words.length));
  return { target, bank: shuffle([...words, ...extra]) };
}
const item = (type, q, extra = {}) => ({ type, id: q?.id, uid: `${type}-${q?.id}-${Math.random()}`, ...extra });
function practice(q) {
  if (S.senior) return item('mc', q, { lang: 'es', ...mc(q, 'es') });
  const kinds = ['mc_en'];
  if (P.canSpeak()) kinds.push('listen');
  const t = tilesFor(q); if (t) kinds.push('tiles');
  const k = pick(kinds);
  if (k === 'tiles') return item('tiles', q, t);
  if (k === 'listen') return item('listen', q, { lang: 'en', ...mc(q, 'en') });
  return item('mc', q, { lang: 'en', ...mc(q, 'en') });
}
function pairsFor(qs) {
  const used = new Set(), list = [];
  for (const q of shuffle(qs)) {
    const en = q.answers_en.find(a => !BAD.test(a)), es = q.answers_es.find(a => !BAD.test(a));
    if (!en || !es || norm(en) === norm(es) || used.has(norm(en)) || used.has(norm(es)) || en.length > 40 || es.length > 40) continue;
    used.add(norm(en)); used.add(norm(es)); list.push({ id: q.id, en, es });
    if (list.length === 4) break;
  }
  return list.length >= 3 ? { type: 'pairs', uid: 'pairs-' + Math.random(), list, left: shuffle(list.map(p => p.id)), right: shuffle(list.map(p => p.id)), matched: [] } : null;
}
function weakest(n, exclude = new Set(), from = null) {
  return Object.entries(S.stats).map(([id, s]) => ({ q: QBY[id], s }))
    .filter(x => x.q && graded(x.q) && !exclude.has(x.q.id) && (!S.senior || x.q.starred) && (!from || x.q.group === from))
    .sort((a, b) => (b.s.w * 2 - b.s.c) - (a.s.w * 2 - a.s.c) || a.s.t - b.s.t).slice(0, n).map(x => x.q);
}

function buildLesson(uKey, idx) {
  const u = units().find(x => x.key === uKey);
  const qs = u.qs.slice(idx * per(uKey), idx * per(uKey) + per(uKey));
  if (uKey === 'cambian') return qs.map(q => item('info', q));
  const items = [];
  for (const q of qs) { items.push(item('teach', q)); items.push(item('mc', q, { lang: 'es', ...mc(q, 'es') })); }
  for (const q of shuffle(qs)) items.push(practice(q));
  const rev = weakest(2, new Set(qs.map(q => q.id)));
  for (const q of rev) items.push(practice(q));
  if (!S.senior) { const p = pairsFor([...qs, ...rev]); if (p) items.splice(Math.max(items.length - 2, 0), 0, p); }
  return items;
}
function buildReview(qs) { return qs.map(practice); }
function buildExam() {
  const n = S.senior ? 10 : 20;
  const qs = shuffle(QUESTIONS.filter(q => graded(q) && (!S.senior || q.starred))).slice(0, n);
  return qs.map(q => S.senior ? item('mc', q, { lang: 'es', ...mc(q, 'es') })
    : item(P.canSpeak() && Math.random() < .5 ? 'listen' : 'mc', q, { lang: 'en', ...mc(q, 'en') }));
}

/* ───────────── sonido ───────────── */
let ac;
function tone(kind) {
  if (!S.sound) return;
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [[660, 0], [880, .09]], bad: [[220, 0], [180, .12]], done: [[523, 0], [659, .1], [784, .2], [1046, .32]] }[kind];
    for (const [f, t] of seq) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = kind === 'bad' ? 'triangle' : 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, ac.currentTime + t); g.gain.linearRampToValueAtTime(.18, ac.currentTime + t + .015);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime + t + .22);
      o.connect(g).connect(ac.destination); o.start(ac.currentTime + t); o.stop(ac.currentTime + t + .25);
    }
  } catch {}
}

/* ───────────── iconos ───────────── */
const I = {
  flame: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 2.2c.4 3-1.3 4.6-2.8 6.2C8.4 9.9 7 11.5 7 14.2A5 5 0 0 0 12 19a5 5 0 0 0 5-5c0-1.6-.6-2.9-1.3-3.9-.2 1.2-.9 2-1.8 2.3.7-3.3-.4-7-1.3-10.2Z"/><path fill="#FFD27A" d="M12 19a2.7 2.7 0 0 1-2.7-2.7c0-1.7 1.4-2.6 2.2-4 .9 1.4 3.2 2.3 3.2 4.1A2.7 2.7 0 0 1 12 19Z"/></svg>`,
  bolt: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.5 2 5 13.5h5.5L9.5 22 19 9.8h-5.6L13.5 2Z"/></svg>`,
  check: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  x: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  star: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8L12 2.8Z"/></svg>`,
  lock: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" stroke="currentColor" stroke-width="2.6" fill="none"/></svg>`,
  book: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5.5C4 4.1 5.1 3 6.5 3H20v15H6.5a1.5 1.5 0 0 0 0 3H20v1H6.5A2.5 2.5 0 0 1 4 19.5v-14Z"/></svg>`,
  trophy: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h3v2.5A4.5 4.5 0 0 1 16.3 12a5 5 0 0 1-3.3 2.8V18h3v3H8v-3h3v-3.2A5 5 0 0 1 7.7 12 4.5 4.5 0 0 1 4 7.5V5h3V3Zm0 4H6v.5c0 1 .5 1.9 1.3 2.4A5 5 0 0 1 7 8V7Zm10 0v1c0 .7-.1 1.3-.3 1.9.8-.5 1.3-1.4 1.3-2.4V7h-1Z"/></svg>`,
  home: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 3 10.5V21h6.5v-6h5v6H21V10.5L12 3Z"/></svg>`,
  repeat: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chart: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="12" width="4.5" height="9" rx="1.5" fill="currentColor"/><rect x="9.8" y="7" width="4.5" height="14" rx="1.5" fill="currentColor"/><rect x="16" y="3" width="4.5" height="18" rx="1.5" fill="currentColor"/></svg>`,
  speaker: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9.5h4L12.5 5v14L7 14.5H3v-5Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
  slow: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 16.5c0-4.4 3.1-8 7-8s7 3.6 7 8H4Zm15-1.5 2.5-1.5a1.5 1.5 0 0 0-1.4-2.6L18.3 12M6 16.5V19h2.5v-2.5M13.5 16.5V19H16v-2.5"/></svg>`,
};

/* ───────────── interfaz: estado efímero ───────────── */
let ui = { tab: 'learn', pop: null, onb: 0, toast: null };
let L = null;       // lección en curso
let R = null;       // pantalla de resultado

function goalRing(size = 30) {
  const pct = Math.min(1, S.day.sec / (S.goal * 60)), r = size / 2 - 3, c = 2 * Math.PI * r;
  return `<svg width="${size}" height="${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--line)" stroke-width="4.5" fill="none"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${pct >= 1 ? 'var(--green)' : 'var(--gold)'}" stroke-width="4.5" fill="none" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}"/></svg>`;
}
function topBar() {
  const st = streakNow(), mins = Math.floor(S.day.sec / 60);
  return `<header class="top">
    <div class="stat flame ${st ? '' : 'off'}" aria-label="Racha: ${st} días">${I.flame(26)}<span class="num">${st}</span></div>
    <div class="stat xp" aria-label="${S.xp} puntos de experiencia">${I.bolt(24)}<span class="num">${S.xp}</span></div>
    <div class="goal" aria-label="Meta de hoy: ${mins} de ${S.goal} minutos">${goalRing()}<span class="num">${Math.min(mins, S.goal)}/${S.goal} min</span></div>
  </header>`;
}
function tabs() {
  const t = (k, ic, lb) => `<button class="tab ${ui.tab === k ? 'on' : ''}" data-a="tab" data-v="${k}" aria-current="${ui.tab === k ? 'page' : 'false'}">${I[ic](26)}${lb}</button>`;
  return `<nav class="tabs" aria-label="Secciones">${t('learn', 'home', 'Aprender')}${t('review', 'repeat', 'Repaso')}${t('progress', 'chart', 'Progreso')}</nav>`;
}
const talk = (html, mood = 'idle', size = 84) => `<div class="talk">${luz(mood, size)}<div class="bubble">${html}</div></div>`;

/* ───────────── pantallas ───────────── */
function onboarding() {
  const totalLessons = units().reduce((a, u) => a + u.n, 0);
  const weeks = m => Math.max(1, Math.ceil(totalLessons / Math.max(1, Math.floor(m / 4.5)) / 7));
  const steps = [
    () => `<div class="center">${luz('cheer', 168)}
      <h1 class="h1">¡Hola! Soy Luz.</h1>
      <p class="muted">Soy una colibrí: cada año viajo miles de kilómetros entre México y Estados Unidos. Ahora le acompaño en su camino a la ciudadanía con las 128 preguntas del examen cívico, cinco minutos al día.</p>
      <p class="muted" style="font-size:14px">Aplica a las solicitudes presentadas desde el 20 de octubre de 2025.</p></div>
      <div class="foot-actions"><button class="btn green" data-a="onb">Empezar</button></div>`,
    () => `<div class="screen" style="padding-bottom:20px"><div class="stack">${talk('¿Cuánto tiempo puede practicar cada día?')}
      ${[5, 10, 15].map(m => `<button class="choice ${S.goal === m ? 'on' : ''}" data-a="goal" data-v="${m}">${I.flame(28)}<span>${m} minutos<small>${m === 5 ? 'Tranquilo' : m === 10 ? 'Constante' : 'Intenso'}: termina las lecciones en unas ${weeks(m)} semanas</small></span></button>`).join('')}
      </div></div><div class="foot-actions"><button class="btn" data-a="onb">Continuar</button></div>`,
    () => `<div class="screen" style="padding-bottom:20px"><div class="stack">${talk('¿Tiene 65 años o más y lleva 20 años o más como residente permanente?')}
      <p class="muted">Si es así, puede tomar el examen en español y solo estudia 20 preguntas marcadas. Le preguntan 10 y aprueba con 6.</p>
      <button class="choice ${S.senior ? 'on' : ''}" data-a="senior" data-v="1">Sí, cumplo las dos condiciones<small>Practico solo las 20 preguntas, en español</small></button>
      <button class="choice ${!S.senior ? 'on' : ''}" data-a="senior" data-v="0">No<small>Practico las 128 preguntas, en inglés y español</small></button>
      </div></div><div class="foot-actions"><button class="btn" data-a="onb">Continuar</button></div>`,
    () => `<div class="screen" style="padding-bottom:20px"><div class="stack">${talk('Antes de empezar, algo importante.', 'idle')}
      <div class="card"><p class="muted">Mi Ciudadanía no es un despacho de abogados y no está afiliado a USCIS ni al gobierno. Las preguntas y respuestas vienen del banco oficial público de 2025. Para su caso particular, consulte a un abogado o a un representante acreditado.</p></div>
      <p class="muted" style="font-size:14px">Su progreso se guarda solo en este dispositivo.</p>
      </div></div><div class="foot-actions"><button class="btn green" data-a="onb">Entendido</button></div>`,
  ];
  return `<main class="lesson">${steps[ui.onb]()}</main>`;
}

/* La Ruta: cada unidad es una parada del camino; cada lección, un sello del pasaporte. */
const RW = 340, STEP = 108, AMP = 92;
function routePts(n, k0) {
  return Array.from({ length: n }, (_, i) => ({ x: RW / 2 + AMP * Math.sin((k0 + i) * 0.95), y: 64 + i * STEP }));
}
function roadD(pts, H) {
  let d = `M${RW / 2} 0`, px = RW / 2, py = 0;
  for (const p of [...pts, { x: RW / 2, y: H }]) { const m = (p.y - py) / 2; d += ` C${px} ${py + m} ${p.x} ${p.y - m} ${p.x} ${p.y}`; px = p.x; py = p.y; }
  return d;
}
function stamp(state, label, trophy) {
  if (trophy) return `<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true"><g transform="rotate(45 40 40)">
    <rect x="14" y="14" width="52" height="52" rx="12" class="st-fill"/><rect x="20" y="20" width="40" height="40" rx="8" class="st-ring"/></g>
    <g class="st-ink" transform="translate(28 26)"><path d="M3 2v26" stroke-width="3.2" stroke-linecap="round"/><path d="M4 3h16l-4 6 4 6H4Z" stroke-width="0"/></g></svg>`;
  return `<svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
    <circle cx="40" cy="40" r="33" class="st-fill"/><circle cx="40" cy="40" r="26.5" class="st-ring"/>
    ${state === 'done' ? `<path class="st-ink" d="m28 41 8 8 16-17" stroke-width="5.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<text x="40" y="49" text-anchor="middle" class="st-num">${label}</text>`}</svg>`;
}
function pathScreen() {
  const us = units(), cur = currentUnit(), curIdx = cur ? us.findIndex(x => x.key === cur.key) : us.length;
  const greet = !cur ? '¡Recorrió toda la ruta! Solo falta el examen de práctica.'
    : S.day.sec >= S.goal * 60 ? 'Meta de hoy cumplida. Si quiere, avance un poco más.'
    : doneOf(cur.key) === 0 && curIdx === 0 ? 'Este es su camino a la ciudadanía. Primera parada: lugares y símbolos.'
    : `Siguiente parada: <b>${esc(cur.name)}</b>.`;
  let k = 0;
  const html = us.map((u, ui_) => {
    const d = doneOf(u.key), isCur = curIdx === ui_, locked = curIdx < ui_, passed = curIdx > ui_;
    const pts = routePts(u.n + 1, k); k += u.n + 1;
    const H = 64 + u.n * STEP + 70;
    const reach = passed ? u.n + 1 : isCur ? d + 1 : 0;           // hasta dónde llega el tramo recorrido
    const trail = passed ? roadD(pts, H) : reach ? roadD(pts.slice(0, reach), pts[reach - 1].y).replace(/ C[^C]*$/, '') : '';
    const scen = pts.map((p, i) => i % 2 ? '' : `<g class="tree" transform="translate(${p.x > RW / 2 ? p.x - 118 : p.x + 104} ${p.y + 38})"><path d="M0-16 9-2H-9Z"/><path d="M0-9 11 6h-22Z"/><rect x="-1.6" y="6" width="3.2" height="5" rx="1"/></g>`).join('');
    const nodes = pts.map((p, i) => {
      const trophy = i === u.n;
      const state = trophy ? (d >= u.n ? 'done' : 'locked') : i < d ? 'done' : (isCur && i === d) ? 'current' : 'locked';
      const id = `${u.key}:${i}`, open = ui.pop === id;
      const tilt = state === 'done' && !trophy ? ((i * 37) % 15) - 7 : 0;
      return `<button class="stamp ${state} ${trophy ? 'check' : ''}" style="left:${p.x - 40}px;top:${p.y - 40}px;--tilt:${tilt}deg" data-a="pop" data-v="${id}"
          aria-label="${trophy ? 'Puesto de control: repaso de la unidad' : `Lección ${i + 1}`}: ${state === 'done' ? 'completada' : state === 'current' ? 'usted está aquí' : 'bloqueada'}">${stamp(state, i + 1, trophy)}</button>
        ${state === 'current' && !open ? `<span class="here" style="left:${p.x > RW / 2 ? p.x - 93 : p.x + 91}px;top:${p.y - 40}px">USTED ESTÁ AQUÍ</span>
          <div class="nluz" style="left:${p.x > RW / 2 ? p.x - 132 : p.x + 52}px;top:${p.y - 34}px">${luz('idle', 78)}</div>` : ''}
        ${open ? `<div class="pop" style="top:${p.y + 50}px">${popover(u, i, state, trophy)}</div>` : ''}`;
    }).join('');
    return `<section class="unit ${locked ? 'locked' : ''}" style="--u:${locked ? 'var(--lockc)' : u.color}">
      <div class="sign"><div class="sign-in"><div class="k">Parada ${ui_ + 1}<span>${u.qs.length} preguntas</span></div><h2>${esc(u.name)}</h2><p>${esc(u.desc)}</p></div></div>
      <div class="route" style="height:${H}px">
        <svg class="road" viewBox="0 0 ${RW} ${H}" width="${RW}" height="${H}" aria-hidden="true">${scen}
          <path d="${roadD(pts, H)}" class="r-base"/><path d="${roadD(pts, H)}" class="r-line"/>
          ${trail ? `<path d="${trail}" class="r-done"/>` : ''}</svg>
        ${nodes}</div></section>`;
  }).join('');
  const exam = `<section class="unit finale" style="--u:#B07D1C">
    <div class="sign gold"><div class="sign-in"><div class="k">Destino<span>${S.senior ? '10 preguntas' : '20 preguntas'}</span></div><h2>Ceremonia de juramento</h2>
    <p>${S.senior ? 'Examen de práctica en español. Aprueba con 6.' : 'Examen de práctica, como en la entrevista. Aprueba con 12.'}</p></div></div>
    <div class="dest"><button class="capitol" data-a="exam" aria-label="Empezar examen de práctica">
      <svg viewBox="0 0 120 96" width="132" height="106" aria-hidden="true">
        <path d="M60 6v10" stroke="#7E5810" stroke-width="2.4"/><path d="M60 6h13l-3 4 3 4H60Z" fill="#C8414F"/>
        <path d="M34 40a26 22 0 0 1 52 0Z" fill="#E2B53B"/><rect x="30" y="38" width="60" height="6" rx="2" fill="#C99A2E"/>
        <path d="M14 52 60 44l46 8Z" fill="#E2B53B"/><rect x="18" y="52" width="84" height="5" fill="#C99A2E"/>
        ${[24, 38, 52, 66, 80, 94].map(x => `<rect x="${x - 3}" y="57" width="6" height="24" rx="1.5" fill="#F1D27A"/>`).join('')}
        <rect x="12" y="81" width="96" height="6" rx="2" fill="#C99A2E"/><rect x="6" y="87" width="108" height="6" rx="2" fill="#B07D1C"/></svg>
      <span>Hacer el examen</span></button></div></section>`;
  return `${topBar()}<main class="screen path">
    <div class="hello">${talk(greet, cur ? 'idle' : 'cheer', 64)}</div>${html}${exam}</main>${tabs()}`;
}
function popover(u, i, state, trophy) {
  if (trophy) return `<div class="tk"><div class="tk-h">Puesto de control</div><div class="tk-b">
    ${state === 'done' ? `<p>Repase todas las preguntas de ${esc(u.name.toLowerCase())} antes de seguir.</p><button class="btn" data-a="unitrev" data-v="${u.key}">Repasar +10 XP</button>` : '<p>Termine las lecciones de esta parada para abrirlo.</p>'}</div></div>`;
  if (state === 'locked') return `<div class="tk off"><div class="tk-h">Lección ${i + 1}</div><div class="tk-b"><p>Este tramo se abre cuando termine las lecciones anteriores.</p></div></div>`;
  return `<div class="tk"><div class="tk-h">${esc(u.name)} · ${i + 1} de ${u.n}</div><div class="tk-b">
    <p>${state === 'done' ? 'Ya tiene este sello. Puede volver a practicarlo.' : 'Tres preguntas nuevas y un repaso. Unos cinco minutos.'}</p>
    <button class="btn" data-a="start" data-v="${u.key}:${i}">${state === 'done' ? 'Practicar de nuevo +5 XP' : 'Empezar +15 XP'}</button></div></div>`;
}
function reviewScreen() {
  const weak = weakest(8);
  const body = weak.length ? `${talk('Estas son las preguntas que más le cuestan. Repasarlas es la forma más rápida de mejorar.')}
      <div class="card"><h3 style="font-size:18px;font-weight:800;margin-bottom:6px">Sus preguntas difíciles</h3>
      ${weak.map(q => { const s = S.stats[q.id]; return `<div class="prow"><div class="t"><span>${esc(q.q_es)}</span></div><span class="sub" style="font-size:13.5px">${s.c} bien · ${s.w} mal</span></div>`; }).join('')}</div>
      <button class="btn" data-a="review">Practicar ${weak.length} preguntas</button>`
    : `${talk('Aún no hay nada que repasar. Complete su primera lección y aquí aparecerán las preguntas que más le cuesten.')}`;
  return `${topBar()}<main class="screen"><div class="stack">
    <h1 class="h1">Repaso</h1>${body}
    <div class="card" style="display:grid;gap:12px"><div style="display:flex;gap:12px;align-items:center;color:#B07D1C">${I.trophy(34)}<div><h3 style="font-size:18px;font-weight:800;color:var(--tx)">Examen de práctica</h3>
    <p class="sub" style="font-size:14.5px">${S.senior ? '10 preguntas en español. Aprueba con 6 correctas; termina al llegar a 6 o al fallar 5.' : '20 preguntas. Aprueba con 12 correctas; termina al llegar a 12 o al fallar 9.'}</p></div></div>
    <button class="btn ghost" data-a="exam">Hacer el examen</button></div>
  </div></main>${tabs()}`;
}

function progressScreen() {
  const us = units(), totalQ = us.reduce((a, u) => a + u.qs.length, 0);
  const learned = us.reduce((a, u) => a + u.qs.filter(q => S.stats[q.id]?.c || S.personal[q.id]).length, 0);
  const sw = (a, on, lb, sub) => `<button class="switch" data-a="${a}" role="switch" aria-checked="${on}"><span>${lb}${sub ? `<small>${sub}</small>` : ''}</span><span class="tog ${on ? 'on' : ''}"></span></button>`;
  return `${topBar()}<main class="screen"><div class="stack">
    <h1 class="h1">Progreso</h1>
    <div class="metric"><div><b class="num" style="color:var(--flame)">${streakNow()}</b><span>días de racha</span></div>
      <div><b class="num" style="color:var(--gold)">${S.xp}</b><span>XP total</span></div>
      <div><b class="num" style="color:var(--green)">${learned}</b><span>de ${totalQ} preguntas</span></div></div>
    <div class="card"><h3 style="font-size:18px;font-weight:800;margin-bottom:4px">Por unidad</h3>
      ${us.map(u => { const p = Math.round(doneOf(u.key) / u.n * 100); return `<div class="prow" style="--u:${u.color}"><div class="t"><span>${esc(u.name)}</span><span class="num">${p}%</span></div><div class="track"><i style="width:${p}%"></i></div></div>`; }).join('')}</div>
    <div class="card"><h3 style="font-size:18px;font-weight:800">Ajustes</h3>
      <div style="padding:14px 0;border-bottom:2px solid var(--line)"><div style="font-weight:700;margin-bottom:10px">Meta diaria</div>
        <div class="seg">${[5, 10, 15].map(m => `<button class="${S.goal === m ? 'on' : ''}" data-a="setgoal" data-v="${m}">${m} min</button>`).join('')}</div></div>
      ${sw('sound', S.sound, 'Sonidos')}
      ${sw('senior', S.senior, 'Modo 65/20', 'Solo las 20 preguntas marcadas, en español')}
      ${P.canNotify() ? sw('remind', S.remind, 'Recordatorio diario', 'A las 7 de la noche') : ''}
      <button class="switch" data-a="reset" style="color:var(--red-tx)">Borrar mi progreso</button>
    </div>
    <p class="sub" style="font-size:13.5px">Mi Ciudadanía no es abogado ni está afiliado a USCIS. Preguntas del banco oficial público de 2025. Su progreso se guarda solo en este dispositivo.</p>
  </div></main>${tabs()}`;
}

/* ───────────── lección ───────────── */
function startSession(kind, items, meta = {}) {
  if (!items.length) return;
  L = { kind, items, pos: 0, total: new Set(items.map(i => i.uid)).size, resolved: new Set(), requeued: new Set(),
    correct: 0, wrong: 0, missed: [], start: Date.now(), sel: null, checked: null, line: [], showText: false, ...meta };
  ui.pop = null; render(); onItem();
}
const cur = () => L.items[L.pos];
function onItem() {
  const it = cur(); if (!it) return;
  if (it.type === 'listen') setTimeout(() => P.speak(QBY[it.id].q_en), 350);
}
function lessonScreen() {
  const it = cur(), q = it.id ? QBY[it.id] : null;
  const pct = L.resolved.size / L.total * 100;
  const head = `<div class="lhead"><button class="x" data-a="quit" aria-label="Salir de la lección">${I.x(28)}</button>
    <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(pct, 3)}%"></i></div>
    ${L.kind === 'exam' ? `<span class="score num" style="color:var(--green)">${L.correct}</span><span class="score num" style="color:var(--red)">${L.wrong}</span>` : ''}</div>`;
  let body = '', canCheck = false, direct = false;
  const hintMany = q && /^(name|nombre) (two|three|dos|tres)/i.test(q.q_en + '|' + q.q_es) ? `<p class="hint">En la entrevista debe dar ${/three|tres/i.test(q.q_en) ? 'tres respuestas' : 'dos respuestas'}. Aquí practicamos una a la vez.</p>` : '';
  const opts = () => `<div class="opts" role="radiogroup">${it.options.map((o, i) => {
    const st = L.checked ? (o === it.correct ? 'right' : L.sel === i ? 'wrong' : '') : L.sel === i ? 'on' : '';
    return `<button class="opt ${st}" data-a="sel" data-v="${i}" role="radio" aria-checked="${L.sel === i}" ${L.checked ? 'disabled' : ''}><span class="key">${i + 1}</span>${esc(o)}</button>`; }).join('')}</div>`;

  if (it.type === 'teach') {
    direct = true;
    body = `<span class="pill">${I.star(14)} Pregunta nueva</span>
      ${talk('Esta es nueva. Léala, escúchela en inglés y fíjese en el truco.', 'idle', 60)}
      <div class="teach"><p class="prompt">${esc(q.q_es)}</p>
      <p class="qen"><button data-a="say" data-v="q" aria-label="Escuchar en inglés">${I.speaker(24)}</button>${esc(q.q_en)}</p>
      <div class="ans"><div class="lb">${q.answers_es.length > 1 ? 'Respuestas aceptadas' : 'Respuesta'}</div><p>${q.answers_es.slice(0, 4).map(esc).join(' · ')}</p>
        <p style="display:flex;align-items:center;gap:8px"><button data-a="say" data-v="a" style="color:var(--blue)" aria-label="Escuchar respuesta en inglés">${I.speaker(20)}</button>${q.answers_en.slice(0, 4).map(esc).join(' · ')}</p></div>
      ${q.ancla ? `<div class="hook"><div class="lb">Para recordarlo</div><b>${esc(q.ancla)}</b>${q.por ? `<p>${esc(q.por)}</p>` : ''}</div>` : ''}
      ${q.viz && VIZ[q.viz] ? `<div class="viz">${VIZ[q.viz]}</div>` : ''}</div>`;
  } else if (it.type === 'mc') {
    canCheck = L.sel != null;
    body = `<h1 class="kind">${it.lang === 'en' ? 'Elija la respuesta en inglés' : 'Elija la respuesta correcta'}</h1>
      ${it.lang === 'en' ? `<p class="qen" style="font-size:20px"><button data-a="say" data-v="q" aria-label="Escuchar">${I.speaker(26)}</button>${esc(q.q_en)}</p>` : `<p class="prompt">${esc(q.q_es)}</p>`}
      ${hintMany}${opts()}`;
  } else if (it.type === 'listen') {
    canCheck = L.sel != null;
    body = `<h1 class="kind">Escuche la pregunta y elija la respuesta</h1>
      <div class="speak"><button class="spk" data-a="say" data-v="q" aria-label="Escuchar la pregunta">${I.speaker(40)}</button>
      <button class="spk sm" data-a="say" data-v="slow" aria-label="Escuchar despacio">${I.slow(28)}</button>
      <button class="link-btn" data-a="showtext">${L.showText ? 'Ocultar texto' : 'Mostrar texto'}</button></div>
      ${L.showText || L.checked ? `<p class="sub">${esc(q.q_en)}</p>` : ''}${opts()}`;
  } else if (it.type === 'tiles') {
    canCheck = L.line.length > 0;
    body = `<h1 class="kind">Escriba la respuesta en inglés</h1>
      <p class="qen"><button data-a="say" data-v="q" aria-label="Escuchar">${I.speaker(24)}</button>${esc(q.q_en)}</p>
      <p class="sub">${esc(q.q_es)}</p>
      <div class="tiles-line" aria-label="Su respuesta">${L.line.map((w, j) => `<button class="tile" data-a="untile" data-v="${j}" ${L.checked ? 'disabled' : ''}>${esc(it.bank[w])}</button>`).join('')}</div>
      <div class="bank">${it.bank.map((w, i) => `<button class="tile ${L.line.includes(i) ? 'used' : ''}" data-a="tile" data-v="${i}" ${L.line.includes(i) || L.checked ? 'disabled' : ''}>${esc(w)}</button>`).join('')}</div>`;
  } else if (it.type === 'pairs') {
    const left = it.left.map(id => { const p = it.list.find(x => x.id === id); const m = it.matched.includes(id);
      return `<button class="pair ${m ? 'done' : L.sel === 'L' + id ? 'on' : ''} ${L.bad === 'L' + id ? 'bad' : ''}" data-a="pair" data-v="L${id}" ${m ? 'disabled' : ''}>${esc(p.en)}</button>`; }).join('');
    const right = it.right.map(id => { const p = it.list.find(x => x.id === id); const m = it.matched.includes(id);
      return `<button class="pair ${m ? 'done' : L.sel === 'R' + id ? 'on' : ''} ${L.bad === 'R' + id ? 'bad' : ''}" data-a="pair" data-v="R${id}" ${m ? 'disabled' : ''}>${esc(p.es)}</button>`; }).join('');
    direct = it.matched.length === it.list.length;
    body = `<h1 class="kind">Una cada respuesta con su traducción</h1><div class="pairs"><div class="col">${left}</div><div class="col">${right}</div></div>`;
  } else if (it.type === 'info') {
    direct = true;
    const link = { 23: ['senate.gov', 'https://www.senate.gov/senators/senators-contact.htm'], 29: ['house.gov', 'https://www.house.gov/representatives/find-your-representative'],
      61: ['usa.gov', 'https://www.usa.gov/state-governor'], 62: ['usa.gov', 'https://www.usa.gov/states-and-territories'] }[q.id] || ['uscis.gov', 'https://www.uscis.gov/citizenship/testupdates'];
    body = `<span class="pill">Respuesta que cambia</span>
      ${talk('Esta respuesta depende de dónde vive o de quién ocupa el cargo. Búsquela y anótela aquí.', 'idle', 60)}
      <p class="prompt">${esc(q.q_es)}</p>
      <p class="qen"><button data-a="say" data-v="q" aria-label="Escuchar en inglés">${I.speaker(24)}</button>${esc(q.q_en)}</p>
      <p class="muted">Consulte la respuesta vigente en <a class="ext" href="${link[1]}" target="_blank" rel="noopener">${link[0]}</a>. Verifíquela de nuevo la semana de su entrevista.</p>
      <label class="sub" for="personal" style="font-weight:800">Mi respuesta</label>
      <input id="personal" class="field" data-id="${q.id}" value="${esc(S.personal[q.id] || '')}" placeholder="Escríbala aquí" autocomplete="off">`;
  }

  let foot;
  if (L.checked) {
    const ok = L.checked === 'ok';
    const ans = it.type === 'tiles' ? it.target : it.correct;
    foot = `<footer class="lfoot ${ok ? 'ok' : 'bad'}" role="status"><div class="fb"><span class="ic">${ok ? I.check(30) : I.x(26)}</span><div>
      <h3>${ok ? L.praise : 'Respuesta correcta:'}</h3>
      ${ok ? '' : `<p>${esc(ans)}</p>${q.ancla ? `<p class="h">Recuerde: ${esc(q.ancla)}</p>` : ''}`}
</div></div>
      <button class="btn ${ok ? 'green' : 'red'}" data-a="next">Continuar</button></footer>`;
  } else if (direct) {
    foot = `<footer class="lfoot"><button class="btn green" data-a="next">Continuar</button></footer>`;
  } else {
    foot = `<footer class="lfoot"><button class="btn green" data-a="check" ${canCheck ? '' : 'disabled'}>Comprobar</button></footer>`;
  }
  return `<main class="lesson">${head}<div class="lbody">${body}</div>${foot}</main>`;
}

const PRAISE = ['¡Muy bien!', '¡Excelente!', '¡Correcto!', '¡Así se hace!', '¡Perfecto!'];
function check() {
  const it = cur();
  let ok;
  if (it.type === 'tiles') ok = norm(L.line.map(i => it.bank[i]).join(' ')) === norm(it.target);
  else ok = it.options[L.sel] === it.correct;
  L.checked = ok ? 'ok' : 'bad'; L.praise = pick(PRAISE);
  const s = S.stats[it.id] ||= { c: 0, w: 0, t: 0 };
  s.t = Date.now();
  if (ok) { s.c++; L.correct++; L.resolved.add(it.uid); tone('ok'); P.haptic('light'); }
  else {
    s.w++; L.wrong++; tone('bad'); P.haptic('heavy');
    if (!L.missed.includes(it.id)) L.missed.push(it.id);
    if (L.kind !== 'exam' && !L.requeued.has(it.uid)) {
      L.requeued.add(it.uid);
      const q = QBY[it.id];
      L.items.push(it.type === 'tiles' ? { ...it } : { ...it, ...mc(q, it.lang) });
    } else L.resolved.add(it.uid);
  }
  save(); render();
}
function next() {
  const it = cur();
  if (['teach', 'info', 'pairs'].includes(it.type)) L.resolved.add(it.uid);
  L.pos++; L.sel = null; L.checked = null; L.line = []; L.showText = false; L.bad = null;
  if (L.kind === 'exam') {
    const need = S.senior ? 6 : 12, fail = S.senior ? 5 : 9;
    if (L.correct >= need || L.wrong >= fail) return finish();
  }
  if (L.pos >= L.items.length) return finish();
  render(); onItem();
  document.querySelector('.lbody')?.scrollTo?.(0, 0); scrollTo(0, 0);
}
function finish() {
  const sec = Math.min(1200, Math.round((Date.now() - L.start) / 1000));
  const graded_ = L.correct + L.wrong;
  let xp = L.correct;
  if (L.kind === 'lesson') {
    xp += L.replay ? 0 : 10;
    if (!L.replay) S.done[doneKey(L.unit)] = Math.max(doneOf(L.unit), L.idx + 1);
  } else if (L.kind === 'unitrev') xp += 5;
  const goalBefore = S.day.sec >= S.goal * 60;
  S.xp += xp; S.day.sec += sec; S.day.lessons++;
  let newStreak = false;
  if (S.lastDay !== today()) { S.streak = S.lastDay === yesterday() ? S.streak + 1 : 1; S.lastDay = today(); S.days = [...(S.days || []), today()].slice(-60); newStreak = true; }
  save(); tone('done'); P.haptic('heavy');
  R = { kind: L.kind, xp, sec, acc: graded_ ? Math.round(L.correct / graded_ * 100) : 100, correct: L.correct, wrong: L.wrong, missed: L.missed,
    goalNow: !goalBefore && S.day.sec >= S.goal * 60, newStreak, step: 0 };
  L = null; render();
}
function resultScreen() {
  if (R.step === 1) {
    const days = new Set(S.days), d = new Date(), dow = (d.getDay() + 6) % 7, names = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const strip = names.map((n, i) => { const x = new Date(d); x.setDate(d.getDate() - dow + i); const on = days.has(ymd(x));
      return `<span class="${on ? 'on' : ''}"><i>${on ? I.check(16) : ''}</i>${n}</span>`; }).join('');
    return `<main class="lesson"><div class="center"><div class="big-flame" style="color:var(--flame)">${I.flame(150)}</div>
      <h1 class="h1" style="font-size:44px;color:var(--flame)"><span class="num">${S.streak}</span></h1>
      <h2 class="h1">${S.streak === 1 ? '¡Empezó su racha!' : `¡${S.streak} días seguidos!`}</h2>
      <p class="muted">Practique mañana para que la llama siga encendida.</p><div class="week">${strip}</div></div>
      <div class="foot-actions"><button class="btn" data-a="done">Continuar</button></div></main>`;
  }
  const exam = R.kind === 'exam', need = S.senior ? 6 : 12, pass = R.correct >= need;
  const title = exam ? (pass ? '¡Aprobó el examen de práctica!' : 'Todavía no, pero va bien') : '¡Lección completada!';
  const mood = exam && !pass ? 'sad' : 'cheer';
  const missed = R.missed.length ? `<div class="missed"><p class="sub" style="font-weight:800">Para repasar</p>${R.missed.slice(0, 6).map(id => { const q = QBY[id];
    return `<div>${esc(S.senior ? q.q_es : q.q_en)}<b>${esc((S.senior ? q.answers_es : q.answers_en)[0])}</b></div>`; }).join('')}</div>` : '';
  return `<main class="lesson"><div class="center">${luz(mood, 150)}
    <h1 class="h1">${title}</h1>
    ${exam ? `<p class="muted">${R.correct} correctas de ${R.correct + R.wrong}. ${pass ? 'En la entrevista necesita ' + need + '.' : `Necesita ${need}. Siga repasando y vuelva a intentarlo.`}</p>` : ''}
    ${R.goalNow ? `<p class="muted" style="color:var(--green-tx)">Cumplió su meta de ${S.goal} minutos de hoy.</p>` : ''}
    <div class="metric" style="width:100%"><div><b class="num" style="color:var(--gold)">+${R.xp}</b><span>XP</span></div>
      <div><b class="num" style="color:var(--green)">${R.acc}%</b><span>precisión</span></div>
      <div><b class="num" style="color:var(--blue)">${Math.floor(R.sec / 60)}:${String(R.sec % 60).padStart(2, '0')}</b><span>tiempo</span></div></div>
    ${missed}</div>
    <div class="foot-actions"><button class="btn" data-a="${R.newStreak ? 'streak' : 'done'}">Continuar</button></div></main>`;
}

/* ───────────── render y acciones ───────────── */
function render() {
  const html = !S.onboarded ? onboarding() : R ? resultScreen() : L ? lessonScreen()
    : ui.tab === 'review' ? reviewScreen() : ui.tab === 'progress' ? progressScreen() : pathScreen();
  root.innerHTML = html + (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '');
  if (ui.pop) document.querySelector('.pop')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function toast(t) { ui.toast = t; render(); setTimeout(() => { ui.toast = null; render(); }, 2200); }

function confirmBox(title, text, okLabel, onOk, danger) {
  const d = document.createElement('dialog');
  d.innerHTML = `<div class="stack">${luz('sad', 90)}<h2 class="h1" style="font-size:22px">${title}</h2><p class="muted">${text}</p>
    <button class="btn" data-k="stay">Seguir aquí</button><button class="link-btn" data-k="ok" style="${danger ? 'color:var(--red-tx)' : ''}">${okLabel}</button></div>`;
  d.querySelector('.luz').style.margin = '0 auto';
  document.body.append(d); d.showModal();
  d.addEventListener('click', e => { const k = e.target.closest('[data-k]')?.dataset.k; if (!k && e.target !== d) return; d.close(); d.remove(); if (k === 'ok') onOk(); });
  d.addEventListener('cancel', () => d.remove());
}

const actions = {
  onb() { if (ui.onb < 3) ui.onb++; else { S.onboarded = true; save(); } render(); },
  goal(v) { S.goal = +v; save(); render(); },
  setgoal(v) { S.goal = +v; save(); render(); },
  senior(v) { S.senior = v == null ? !S.senior : v === '1'; save(); render(); },
  sound() { S.sound = !S.sound; save(); render(); },
  async remind() { const want = !S.remind; const ok = await P.scheduleReminder(want); S.remind = want && ok; save(); render(); if (want && !ok) toast('Active las notificaciones en los ajustes del teléfono.'); },
  reset() { confirmBox('¿Borrar todo su progreso?', 'Se borran su racha, XP y respuestas. No se puede deshacer.', 'Sí, borrar', () => { S = { ...fresh(), onboarded: true }; save(); render(); }, true); },
  tab(v) { ui.tab = v; ui.pop = null; render(); scrollTo(0, 0); },
  pop(v) { ui.pop = ui.pop === v ? null : v; P.haptic(); render(); },
  start(v) { const [u, i] = v.split(':'); startSession('lesson', buildLesson(u, +i), { unit: u, idx: +i, replay: +i < doneOf(u) }); },
  unitrev(v) { const u = units().find(x => x.key === v); const qs = u.qs.filter(graded); startSession('unitrev', buildReview(shuffle(qs).slice(0, 10)), { unit: v }); },
  review() { startSession('review', buildReview(weakest(8))); },
  exam() { startSession('exam', buildExam()); },
  quit() { confirmBox('¿Salir de la lección?', 'Si sale ahora, perderá el avance de esta lección.', 'Salir', () => { L = null; render(); }); },
  say(v) { const q = QBY[cur().id]; P.speak(v === 'a' ? q.answers_en[0] : q.q_en, v === 'slow'); },
  showtext() { L.showText = !L.showText; render(); },
  sel(v) { if (L.checked) return; L.sel = +v; P.haptic(); render(); },
  tile(v) { L.line.push(+v); P.haptic(); render(); },
  untile(v) { L.line.splice(+v, 1); render(); },
  pair(v) {
    const it = cur(); L.bad = null;
    if (!L.sel || L.sel[0] === v[0]) { L.sel = v; P.haptic(); return render(); }
    if (L.sel.slice(1) === v.slice(1)) { it.matched.push(+v.slice(1)); tone('ok'); P.haptic(); }
    else { L.bad = v; tone('bad'); P.haptic('heavy'); }
    L.sel = null; render();
  },
  check() { if (!L.checked) check(); },
  next() { next(); },
  streak() { R.step = 1; render(); },
  done() { R = null; ui.tab = 'learn'; render(); requestAnimationFrame(() => document.querySelector('.stamp.current')?.scrollIntoView({ block: 'center' })); },
};

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) { if (ui.pop && !e.target.closest('.pop')) { ui.pop = null; render(); } return; }
  if (b.disabled) return;
  actions[b.dataset.a]?.(b.dataset.v);
});
document.addEventListener('input', e => {
  if (e.target.id === 'personal') { const v = e.target.value.trim(); if (v) S.personal[e.target.dataset.id] = v; else delete S.personal[e.target.dataset.id]; save(); }
});
document.addEventListener('keydown', e => {
  if (!L || document.querySelector('dialog[open]') || e.target.tagName === 'INPUT') return;
  const it = cur();
  if (/^[1-4]$/.test(e.key) && it.options && !L.checked && +e.key <= it.options.length) actions.sel(+e.key - 1);
  else if (e.key === 'Enter') { e.preventDefault(); document.querySelector('.lfoot .btn:not(:disabled)')?.click(); }
});

/* ───────────── plataforma ───────────── */
P.onBack(() => {
  const d = document.querySelector('dialog[open]');
  if (d) { d.close(); d.remove(); return; }
  if (L) return actions.quit();
  if (R) return actions.done();
  if (ui.pop) { ui.pop = null; return render(); }
  if (ui.tab !== 'learn') return actions.tab('learn');
  P.exitApp();
});
P.registerSW();
document.addEventListener('visibilitychange', () => { if (!document.hidden && S.day.date !== today()) { S.day = { date: today(), sec: 0, lessons: 0 }; save(); if (!L) render(); } });

render();
requestAnimationFrame(() => document.querySelector('.stamp.current')?.scrollIntoView({ block: 'center' }));
