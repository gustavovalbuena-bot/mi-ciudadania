// Mi Ciudadanía · Estudio. Práctica diaria del examen cívico (banco 2025, 128 preguntas).
// Sin dependencias ni compilación: módulos ES que corren igual en la web y dentro de Capacitor.
import { GROUPS, VIZ, QUESTIONS } from './data.js';
import { WRONG, MULTI } from './distractors.js';
import { luz } from './mascot.js';
import * as P from './platform.js';

/* ───────────── utilidades ───────────── */
const root = document.getElementById('app');
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.random() * a.length | 0];
const norm = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\(.*?\)/g, '').replace(/[-–—]/g, ' ').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
const clean = s => String(s).replace(/\s+[–—]\s+/g, ', ').replace(/[–—]/g, ', ');
const esc = s => clean(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = () => ymd(new Date());
const dayN = s => Math.round(new Date(s + 'T12:00:00').getTime() / 864e5);
const nDaysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return ymd(d); };
const BAD = /visit|vary|visite|var[ií]a/i;
const QBY = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const STOP = new Set('the a an of to and in for on is it by with at from that be as or de la el los las y en del para por un una que se al su sus o'.split(' '));

/* ───────────── estado persistente ───────────── */
const KEY = 'mc-estudio.v1';
const fresh = () => ({ v: 2, auth: null, onboarded: false, goal: 5, senior: false, sound: true, voiceOn: true, voice: null, remind: false,
  xp: 0, streak: 0, lastDay: null, days: [], rests: [], restUsed: null, day: { date: today(), sec: 0, lessons: 0 }, done: {}, stats: {}, personal: {}, micOffUntil: 0 });
let S;
try { S = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { S = fresh(); }
if (S.day?.date !== today()) S.day = { date: today(), sec: 0, lessons: 0 };
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
if (S.voice) P.setVoice(S.voice);

/* ───────────── granitos y cafecito ─────────────
   Granitos: cada respuesta correcta "pone su granito". Se cosechan por niveles.
   Cafecito: un día con práctica es una taza servida. Una vez por semana Luz
   guarda un día de descanso: faltar un día no rompe la racha. */
const LEVELS = [[0, 'Semilla'], [40, 'Brote'], [120, 'Matita'], [260, 'Cafetal'], [480, 'Cosecha'], [800, 'Gran cosecha'], [1300, 'Maestro cafetero']];
function level(g = S.xp) {
  let i = 0; while (i + 1 < LEVELS.length && g >= LEVELS[i + 1][0]) i++;
  const [from, name] = LEVELS[i], next = LEVELS[i + 1];
  return { i, name, from, next: next?.[0], nextName: next?.[1], pct: next ? (g - from) / (next[0] - from) : 1 };
}
const restAvailable = () => !S.restUsed || dayN(today()) - dayN(S.restUsed) >= 7;
function streakNow() {
  if (!S.lastDay) return 0;
  const gap = dayN(today()) - dayN(S.lastDay);
  return gap <= 1 || (gap === 2 && restAvailable()) ? S.streak : 0;
}
function serveCup() {                                  // al terminar la primera lección del día
  if (S.lastDay === today()) return false;
  const gap = S.lastDay ? dayN(today()) - dayN(S.lastDay) : 99;
  if (gap === 1) S.streak++;
  else if (gap === 2 && restAvailable()) { S.streak++; S.restUsed = nDaysAgo(1); S.rests = [...(S.rests || []), nDaysAgo(1)].slice(-20); }
  else S.streak = 1;
  S.lastDay = today(); S.days = [...(S.days || []), today()].slice(-90);
  return true;
}

/* ───────────── unidades y lecciones ───────────── */
const pool = g => QUESTIONS.filter(q => q.group === g && (!S.senior || q.starred));
const per = g => g === 'cambian' ? 4 : 3;
const units = () => GROUPS.map(g => { const qs = pool(g.key); return { ...g, qs, n: Math.ceil(qs.length / per(g.key)) }; }).filter(u => u.n);
const doneKey = k => (S.senior ? 's:' : '') + k;
const doneOf = k => S.done[doneKey(k)] || 0;
const currentUnit = () => units().find(u => doneOf(u.key) < u.n);
const graded = q => q.group !== 'cambian';

/* ───────────── generadores de ejercicios ───────────── */
const answersOf = (q, lang) => (lang === 'en' ? q.answers_en : q.answers_es).filter(a => !BAD.test(a));
const wrongsOf = (q, lang) => (WRONG[q.id] || []).map(s => s.split('|')[lang === 'en' ? 0 : 1]);
const plain = s => s.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').replace(/\s([.,])/g, '$1').trim();

function mc(q, lang) {
  const correct = pick(answersOf(q, lang));
  return { options: shuffle([correct, ...shuffle(wrongsOf(q, lang)).slice(0, 3)]), correct };
}
function multi(q, lang) {
  const k = MULTI[q.id], total = k === 2 ? 6 : k === 3 ? 8 : 10;
  const good = shuffle(answersOf(q, lang)).slice(0, k);
  return { k, options: shuffle([...good, ...shuffle(wrongsOf(q, lang)).slice(0, total - k)]), correct: good };
}
function tilesFor(q) {
  if (MULTI[q.id]) return null;
  const cand = answersOf(q, 'en').map(plain).map(a => a.replace(/\.$/, '')).filter(a => { const w = a.split(' ').length; return w >= 2 && w <= 7; });
  if (!cand.length) return null;
  const target = pick(cand), words = target.split(' '), have = new Set(words.map(norm));
  const extra = shuffle(wrongsOf(q, 'en').flatMap(a => plain(a).replace(/\.$/, '').split(' ')))
    .filter(w => { const n = norm(w); if (!n || have.has(n)) return false; have.add(n); return true; }).slice(0, Math.max(3, 8 - words.length));
  return extra.length >= 2 ? { target, bank: shuffle([...words, ...extra]) } : null;
}
function blankFor(q, lang) {
  if (MULTI[q.id]) return null;
  for (const ans of shuffle(answersOf(q, lang).map(plain))) {
    const words = ans.replace(/\.$/, '').split(' ');
    if (words.length < 3) continue;
    const idxs = shuffle(words.map((w, i) => i).filter(i => norm(words[i]).length >= 3 && !STOP.has(norm(words[i]))));
    for (const i of idxs) {
      const target = words[i].replace(/[,.]$/, '');
      const same = wrongsOf(q, lang).map(w => plain(w).replace(/\.$/, '').split(' ')).filter(w => w.length === words.length).map(w => w[i]?.replace(/[,.]$/, ''));
      const any = wrongsOf(q, lang).flatMap(w => plain(w).replace(/\.$/, '').split(' ')).map(w => w.replace(/[,.]$/, '')).filter(w => norm(w).length >= 3 && !STOP.has(norm(w)));
      const seen = new Set([norm(target)]), out = [];
      for (const w of [...shuffle(same), ...shuffle(any)]) { if (!w) continue; const n = norm(w); if (seen.has(n)) continue; seen.add(n); out.push(w); if (out.length === 3) break; }
      if (out.length < 3) continue;
      return { before: words.slice(0, i).join(' '), after: words.slice(i + 1).join(' '), correct: target, options: shuffle([target, ...out]), full: ans };
    }
  }
  return null;
}
const item = (type, q, extra = {}) => ({ type, id: q?.id, uid: `${type}-${q?.id}-${Math.random()}`, ...extra });
const mcItem = (q, lang, type = 'mc') => MULTI[q.id] ? item('multi', q, { lang, ...multi(q, lang) }) : item(type, q, { lang, ...mc(q, lang) });
const micOK = () => S.voiceOn && P.canListen() && Date.now() > (S.micOffUntil || 0);

function practice(q, allowSpeak = true) {
  if (S.senior) { const b = Math.random() < .35 && blankFor(q, 'es'); return b ? item('blank', q, { lang: 'es', ...b }) : mcItem(q, 'es'); }
  const kinds = ['mc'];
  if (P.canSpeak()) kinds.push('listen');
  const t = tilesFor(q); if (t) kinds.push('tiles');
  const b = blankFor(q, 'en'); if (b) kinds.push('blank', 'blank');
  if (allowSpeak && micOK()) kinds.push('speak');
  const k = pick(kinds);
  if (k === 'tiles') return item('tiles', q, t);
  if (k === 'blank') return item('blank', q, { lang: 'en', ...b });
  if (k === 'speak') return item('speak', q, { heard: null });
  if (k === 'listen') return mcItem(q, 'en', 'listen');
  return mcItem(q, 'en');
}
function pairsFor(qs) {
  const used = new Set(), list = [];
  for (const q of shuffle(qs)) {
    const en = plain(answersOf(q, 'en')[0] || ''), es = plain(answersOf(q, 'es')[0] || '');
    if (!en || !es || norm(en) === norm(es) || used.has(norm(en)) || used.has(norm(es)) || en.length > 48 || es.length > 48) continue;
    used.add(norm(en)); used.add(norm(es)); list.push({ id: q.id, en, es });
    if (list.length === 4) break;
  }
  return list.length >= 3 ? { type: 'pairs', uid: 'pairs-' + Math.random(), list, left: shuffle(list.map(p => p.id)), right: shuffle(list.map(p => p.id)), matched: [] } : null;
}
function weakest(n, exclude = new Set()) {
  return Object.entries(S.stats).map(([id, s]) => ({ q: QBY[id], s }))
    .filter(x => x.q && graded(x.q) && !exclude.has(x.q.id) && (!S.senior || x.q.starred))
    .sort((a, b) => (b.s.w * 2 - b.s.c) - (a.s.w * 2 - a.s.c) || a.s.t - b.s.t).slice(0, n).map(x => x.q);
}
function buildLesson(uKey, idx) {
  const u = units().find(x => x.key === uKey);
  const qs = u.qs.slice(idx * per(uKey), idx * per(uKey) + per(uKey));
  if (uKey === 'cambian') return qs.map(q => item('info', q));
  const items = [];
  for (const q of qs) { items.push(item('teach', q)); items.push(mcItem(q, 'es')); }
  let spoke = 0;
  for (const q of shuffle(qs)) { const it = practice(q, spoke < 1); if (it.type === 'speak') spoke++; items.push(it); }
  const rev = weakest(2, new Set(qs.map(q => q.id)));
  for (const q of rev) items.push(practice(q, false));
  const p = pairsFor([...qs, ...rev, ...shuffle(u.qs).slice(0, 4)].filter(graded));
  if (p && !S.senior) items.splice(Math.max(items.length - 2, 0), 0, p);
  return items;
}
const buildReview = qs => qs.map(q => practice(q, false));
function buildExam() {
  const n = S.senior ? 10 : 20;
  const qs = shuffle(QUESTIONS.filter(q => graded(q) && (!S.senior || q.starred))).slice(0, n);
  return qs.map(q => S.senior ? mcItem(q, 'es') : mcItem(q, 'en', P.canSpeak() && Math.random() < .5 ? 'listen' : 'mc'));
}

// ¿Lo que dijo coincide con alguna respuesta aceptada?
const NUMW = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twenty: 20, thirty: 30, fifty: 50, hundred: 100 };
const toks = s => norm(s).split(' ').filter(w => w && !STOP.has(w)).map(w => NUMW[w] ? String(NUMW[w]) : w);
function matchSpoken(q, heard) {
  const variants = answersOf(q, 'en').flatMap(a => [a, a.replace(/[()]/g, ''), ...(a.match(/\((.*?)\)/g) || []).map(m => m.slice(1, -1))]);
  const need = MULTI[q.id] || 1;
  for (const h of heard) {
    const H = new Set(toks(h)), hit = new Set();
    for (const v of variants) {
      const T = toks(v); if (!T.length) continue;
      const got = T.filter(t => H.has(t)).length;
      if (got === T.length || (T.length >= 3 && got / T.length >= .7)) hit.add(norm(v).slice(0, 12));
    }
    if (hit.size >= need) return true;
  }
  return false;
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
  cup: (s, fill = 1, steam = true) => { const y = 9 + 9 * (1 - Math.max(0, Math.min(1, fill))); return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">
    <defs><clipPath id="cc${s}${Math.round(fill * 10)}"><path d="M4 8h13v6.5A5.5 5.5 0 0 1 11.5 20h-2A5.5 5.5 0 0 1 4 14.5V8Z"/></clipPath></defs>
    ${steam && fill > 0 ? '<path d="M8 2.5c-1 1.2 1 1.8 0 3M12 2.5c-1 1.2 1 1.8 0 3" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>' : ''}
    <path d="M4 8h13v6.5A5.5 5.5 0 0 1 11.5 20h-2A5.5 5.5 0 0 1 4 14.5V8Z" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="3" y="${y}" width="15" height="13" fill="currentColor" clip-path="url(#cc${s}${Math.round(fill * 10)})"/>
    <path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 22h15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`; },
  bean: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="7.2" ry="9.5" transform="rotate(35 12 12)" fill="currentColor"/><path d="M8.2 6.6c3.4 2.2.6 6.6 7.6 10.8" stroke="var(--bean-line,#fff)" stroke-width="1.8" fill="none" stroke-linecap="round" opacity=".75"/></svg>`,
  moon: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"/></svg>`,
  check: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  x: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
  star: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8L12 2.8Z"/></svg>`,
  trophy: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 3h10v2h3v2.5A4.5 4.5 0 0 1 16.3 12a5 5 0 0 1-3.3 2.8V18h3v3H8v-3h3v-3.2A5 5 0 0 1 7.7 12 4.5 4.5 0 0 1 4 7.5V5h3V3Zm0 4H6v.5c0 1 .5 1.9 1.3 2.4A5 5 0 0 1 7 8V7Zm10 0v1c0 .7-.1 1.3-.3 1.9.8-.5 1.3-1.4 1.3-2.4V7h-1Z"/></svg>`,
  home: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3 3 10.5V21h6.5v-6h5v6H21V10.5L12 3Z"/></svg>`,
  repeat: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chart: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="12" width="4.5" height="9" rx="1.5" fill="currentColor"/><rect x="9.8" y="7" width="4.5" height="14" rx="1.5" fill="currentColor"/><rect x="16" y="3" width="4.5" height="18" rx="1.5" fill="currentColor"/></svg>`,
  speaker: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9.5h4L12.5 5v14L7 14.5H3v-5Z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.8 5.8a9 9 0 0 1 0 12.4" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
  slow: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 16.5c0-4.4 3.1-8 7-8s7 3.6 7 8H4Zm15-1.5 2.5-1.5a1.5 1.5 0 0 0-1.4-2.6L18.3 12M6 16.5V19h2.5v-2.5M13.5 16.5V19H16v-2.5"/></svg>`,
  list: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="4.5" cy="6" r="1.6" fill="currentColor"/><circle cx="4.5" cy="12" r="1.6" fill="currentColor"/><circle cx="4.5" cy="18" r="1.6" fill="currentColor"/></svg>`,
  mic: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="8.5" y="2.5" width="7" height="12" rx="3.5" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`,
  shield: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6.5c0 5 3.4 8.8 8 10.5 4.6-1.7 8-5.5 8-10.5V5l-8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5" stroke="#fff" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mail: s => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>`,
};

/* ───────────── interfaz: estado efímero ───────────── */
let ui = { tab: 'learn', pop: null, onb: 0, toast: null, reg: { step: 'info', email: '', phone: '', ok: false, err: '', busy: false, token: null, sentAt: 0 } };
let L = null, R = null;

function topBar() {
  const st = streakNow(), mins = Math.floor(S.day.sec / 60), fill = Math.min(1, S.day.sec / (S.goal * 60));
  return `<header class="top">
    <div class="stat cafe ${st ? '' : 'off'}" aria-label="Cafecito: ${st} días seguidos">${I.cup(26, st ? 1 : 0)}<span class="num">${st}</span></div>
    <div class="stat bean" aria-label="${S.xp} granitos">${I.bean(22)}<span class="num">${S.xp}</span></div>
    <div class="goal" aria-label="Taza de hoy: ${mins} de ${S.goal} minutos"><span class="goalcup ${fill >= 1 ? 'full' : ''}">${I.cup(26, fill, false)}</span><span class="num">${Math.min(mins, S.goal)}/${S.goal} min</span></div>
  </header>`;
}
function tabs() {
  const t = (k, ic, lb) => `<button class="tab ${ui.tab === k ? 'on' : ''}" data-a="tab" data-v="${k}" aria-current="${ui.tab === k ? 'page' : 'false'}">${I[ic](26)}${lb}</button>`;
  return `<nav class="tabs" aria-label="Secciones">${t('learn', 'home', 'Ruta')}${t('review', 'repeat', 'Repaso')}${t('progress', 'chart', 'Progreso')}</nav>`;
}
const talk = (html, mood = 'idle', size = 84) => `<div class="talk">${luz(mood, size)}<div class="bubble">${html}</div></div>`;
function week() {
  const days = new Set(S.days), rests = new Set(S.rests || []), d = new Date(), dow = (d.getDay() + 6) % 7, names = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return `<div class="week">${names.map((n, i) => { const x = new Date(d); x.setDate(d.getDate() - dow + i); const k = ymd(x);
    const st = days.has(k) ? 'on' : rests.has(k) ? 'rest' : k === today() ? 'today' : k > today() ? 'future' : 'off';
    return `<span class="${st}" aria-label="${n}: ${st === 'on' ? 'practicó' : st === 'rest' ? 'descanso' : 'sin práctica'}"><i>${st === 'rest' ? I.moon(18) : I.cup(22, st === 'on' ? 1 : 0, false)}</i>${n}</span>`; }).join('')}</div>`;
}

/* ───────────── bienvenida y registro ───────────── */
// Registro con código por correo: apagado hasta configurar Resend en Vercel (ver README).
const REGISTRO = false;
const okEmail = e => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e.trim());
const okPhone = p => { const d = p.replace(/\D/g, ''); return p.trim().startsWith('+') ? d.length >= 8 && d.length <= 15 : d.length === 10 || (d.length === 11 && d[0] === '1'); };
function welcome() {
  const r = ui.reg;
  if (r.step === 'otp') {
    const wait = Math.max(0, 30 - Math.floor((Date.now() - r.sentAt) / 1000));
    return `<main class="lesson"><div class="screen" style="padding-bottom:20px"><div class="stack">
      ${talk(`Le enviamos un código de 6 números a <b>${esc(r.email)}</b>. Revise también la carpeta de correo no deseado.`, 'idle', 70)}
      <label class="lbl" for="otp">Código del correo</label>
      <input id="otp" class="field otp" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••" aria-describedby="otp-err">
      ${r.err ? `<p class="err" id="otp-err" role="alert">${esc(r.err)}</p>` : ''}
      <button class="btn green" data-a="verify" ${r.busy ? 'disabled' : ''}>${r.busy ? 'Verificando…' : 'Entrar'}</button>
      <div class="row-links"><button class="link-btn" data-a="resend" ${wait ? 'disabled' : ''}>${wait ? `Reenviar en ${wait} s` : 'Reenviar código'}</button>
      <button class="link-btn" data-a="regback">Cambiar correo</button></div>
    </div></div></main>`;
  }
  const can = r.ok && okEmail(r.email) && okPhone(r.phone) && !r.busy;
  const step = (n, t, d) => `<li><b class="n">${n}</b><div><h3>${t}</h3><p>${d}</p></div></li>`;
  return `<main class="welcome">
    <section class="w-hero">${luz('cheer', 132)}
      <h1>Prepárese para el examen de ciudadanía, cinco minutos al día</h1>
      <p>Luz, una colibrí que conoce bien el camino, le acompaña por las 128 preguntas cívicas de 2025. En español, con práctica en inglés.</p></section>
    <section class="w-how"><h2>Cómo funciona</h2><ol class="steps">
      ${step(1, 'Recorra la ruta', 'Nueve paradas, de lo más fácil a lo más difícil: lugares, el Presidente, números, personas, fechas, enmiendas, listas, el porqué y lo que cambia.')}
      ${step(2, 'Lecciones de cinco minutos', 'Aprende tres preguntas por lección. Las escucha y las lee en inglés y en español, elige, completa, une parejas y responde en voz alta.')}
      ${step(3, 'Su cafecito diario', 'Cada día que practica se sirve una taza. Si un día no puede, tiene un día de descanso por semana sin perder la racha. Cada acierto suma un granito a su cosecha.')}
      ${step(4, 'Examen de práctica', '20 preguntas con las reglas reales: aprueba con 12. Si tiene 65 años o más y 20 de residencia, practica 10 en español.')}
    </ol></section>
    <section class="w-legal" aria-labelledby="aviso"><div class="lg-h">${I.shield(26)}<h2 id="aviso">Aviso importante: esto no es asesoría legal</h2></div>
      <ul><li>Mi Ciudadanía es una herramienta de estudio. <b>No somos abogados</b> y no le representamos ante ninguna autoridad.</li>
        <li><b>No estamos afiliados a USCIS</b>, al Departamento de Seguridad Nacional ni a ninguna agencia del gobierno.</li>
        <li>Las preguntas vienen del banco público oficial de 2025. Usar esta app <b>no garantiza</b> que apruebe el examen ni que su solicitud sea aprobada.</li>
        <li>Para decidir sobre su caso, consulte a un abogado de inmigración o a un representante acreditado por el Departamento de Justicia.</li></ul>
      <label class="agree"><input type="checkbox" id="agree" ${r.ok ? 'checked' : ''}><span>Entiendo que Mi Ciudadanía es solo una herramienta de estudio y que no me da asesoría legal.</span></label></section>
    ${!REGISTRO ? `<section class="w-form"><button class="btn green" data-a="enter" ${r.ok ? '' : 'disabled'}>Empezar gratis</button>
      <p class="hint-s">${r.ok ? ' ' : 'Marque la casilla del aviso para continuar.'}</p></section></main>` : ''}
    ${REGISTRO ? `<section class="w-form"><h2>Regístrese gratis</h2>
      <p class="sub">Le enviaremos un código a su correo para entrar. Usamos su correo y teléfono solo para su cuenta y avisos de la app.</p>
      <label class="lbl" for="email">Correo electrónico</label>
      <input id="email" class="field" type="email" inputmode="email" autocomplete="email" placeholder="nombre@correo.com" value="${esc(r.email)}">
      <label class="lbl" for="phone">Número de teléfono</label>
      <input id="phone" class="field" type="tel" inputmode="tel" autocomplete="tel" placeholder="(555) 123-4567" value="${esc(r.phone)}">
      ${r.err ? `<p class="err" role="alert">${esc(r.err)}</p>` : ''}
      <button class="btn green" data-a="sendcode" ${can ? '' : 'disabled'}>${r.busy ? 'Enviando…' : 'Recibir mi código'}</button>
      <p class="hint-s">${!r.ok ? 'Marque la casilla del aviso para continuar.' : !okEmail(r.email) ? 'Escriba su correo.' : !okPhone(r.phone) ? 'Escriba su teléfono (10 dígitos en EE.UU.).' : ' '}</p>
    </section></main>` : ''}`;
}
async function api(path, data) {
  const res = await fetch(P.API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j.error || 'No hay conexión. Intente de nuevo.');
  return j;
}

/* ───────────── pantallas principales ───────────── */
function onboarding() {
  const totalLessons = units().reduce((a, u) => a + u.n, 0);
  const weeks = m => Math.max(1, Math.ceil(totalLessons / Math.max(1, Math.floor(m / 4.5)) / 7));
  const steps = [
    () => `<div class="center">${luz('cheer', 168)}
      <h1 class="h1">¡Bienvenido! Soy Luz.</h1>
      <p class="muted">Soy una colibrí: cada año viajo miles de kilómetros entre México y Estados Unidos. Ahora le acompaño en su camino a la ciudadanía.</p>
      <p class="muted" style="font-size:14px">Aplica a las solicitudes presentadas desde el 20 de octubre de 2025.</p></div>
      <div class="foot-actions"><button class="btn green" data-a="onb">Empezar</button></div>`,
    () => `<div class="screen" style="padding-bottom:20px"><div class="stack">${talk('¿De qué tamaño quiere su cafecito de estudio cada día?')}
      ${[[5, 'Pequeño'], [10, 'Mediano'], [15, 'Grande']].map(([m, t]) => `<button class="choice ${S.goal === m ? 'on' : ''}" data-a="goal" data-v="${m}"><span class="cupsz" style="--s:${m}">${I.cup(18 + m * 1.4, 1)}</span><span>${t}: ${m} minutos<small>Termina la ruta en unas ${weeks(m)} semanas</small></span></button>`).join('')}
      </div></div><div class="foot-actions"><button class="btn" data-a="onb">Continuar</button></div>`,
    () => `<div class="screen" style="padding-bottom:20px"><div class="stack">${talk('¿Tiene 65 años o más y lleva 20 años o más como residente permanente?')}
      <p class="muted">Si es así, puede tomar el examen en español y solo estudia 20 preguntas marcadas. Le preguntan 10 y aprueba con 6.</p>
      <button class="choice ${S.senior ? 'on' : ''}" data-a="senior" data-v="1">Sí, cumplo las dos condiciones<small>Practico solo las 20 preguntas, en español</small></button>
      <button class="choice ${!S.senior ? 'on' : ''}" data-a="senior" data-v="0">No<small>Practico las 128 preguntas, en inglés y español</small></button>
      </div></div><div class="foot-actions"><button class="btn green" data-a="onb">Empezar la ruta</button></div>`,
  ];
  return `<main class="lesson">${steps[ui.onb]()}</main>`;
}

/* La Ruta: cada unidad es una parada del camino; cada lección, un sello del pasaporte. */
const RW = 340, STEP = 108, AMP = 92;
const routePts = (n, k0) => Array.from({ length: n }, (_, i) => ({ x: RW / 2 + AMP * Math.sin((k0 + i) * 0.95), y: 64 + i * STEP }));
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
    : S.day.sec >= S.goal * 60 ? 'Ya se tomó su cafecito de hoy. Si quiere, avance un poco más.'
    : doneOf(cur.key) === 0 && curIdx === 0 ? 'Este es su camino a la ciudadanía. Primera parada: lugares y símbolos.'
    : `Siguiente parada: <b>${esc(cur.name)}</b>.`;
  let k = 0;
  const html = us.map((u, ui_) => {
    const d = doneOf(u.key), isCur = curIdx === ui_, locked = curIdx < ui_, passed = curIdx > ui_;
    const pts = routePts(u.n + 1, k); k += u.n + 1;
    const H = 64 + u.n * STEP + 70;
    const reach = passed ? u.n + 1 : isCur ? d + 1 : 0;
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
    ${state === 'done' ? `<p>Repase todas las preguntas de ${esc(u.name.toLowerCase())} antes de seguir.</p><button class="btn" data-a="unitrev" data-v="${u.key}">Repasar · +5 granitos</button>` : '<p>Termine las lecciones de esta parada para abrirlo.</p>'}</div></div>`;
  if (state === 'locked') return `<div class="tk off"><div class="tk-h">Lección ${i + 1}</div><div class="tk-b"><p>Este tramo se abre cuando termine las lecciones anteriores.</p></div></div>`;
  return `<div class="tk"><div class="tk-h">${esc(u.name)} · ${i + 1} de ${u.n}</div><div class="tk-b">
    <p>${state === 'done' ? 'Ya tiene este sello. Puede volver a practicarlo.' : 'Tres preguntas nuevas y un repaso. Unos cinco minutos.'}</p>
    <button class="btn" data-a="start" data-v="${u.key}:${i}">${state === 'done' ? 'Practicar de nuevo' : 'Empezar · +10 granitos'}</button></div></div>`;
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
  const lv = level(), voices = P.listVoices();
  const sw = (a, on, lb, sub) => `<button class="switch" data-a="${a}" role="switch" aria-checked="${on}"><span>${lb}${sub ? `<small>${sub}</small>` : ''}</span><span class="tog ${on ? 'on' : ''}"></span></button>`;
  return `${topBar()}<main class="screen"><div class="stack">
    <h1 class="h1">Progreso</h1>
    <div class="card harvest"><div class="hv-top">${I.bean(40)}<div><div class="k">Su cosecha</div><h3>${lv.name}</h3></div><b class="num">${S.xp}<small> granitos</small></b></div>
      <div class="track"><i style="width:${Math.round(lv.pct * 100)}%"></i></div>
      <p class="sub" style="font-size:14px">${lv.next ? `Le faltan ${lv.next - S.xp} granitos para llegar a <b>${lv.nextName}</b>.` : 'Llegó al nivel más alto. ¡Felicidades!'}</p></div>
    <div class="card cafe-card"><div class="hv-top"><span class="cafe-ic">${I.cup(40, streakNow() ? 1 : 0)}</span><div><div class="k">Su cafecito</div><h3>${streakNow()} ${streakNow() === 1 ? 'día seguido' : 'días seguidos'}</h3></div></div>
      ${week()}<p class="sub" style="font-size:14px">${restAvailable() ? 'Tiene su día de descanso de esta semana disponible: si falta un día, la racha sigue.' : 'Ya usó su día de descanso esta semana. Vuelve a estar disponible en unos días.'}</p></div>
    <div class="metric"><div><b class="num" style="color:var(--green)">${learned}</b><span>de ${totalQ} preguntas</span></div>
      <div><b class="num" style="color:var(--cafe)">${(S.days || []).length}</b><span>tazas servidas</span></div>
      <div><b class="num" style="color:var(--blue)">${us.reduce((a, u) => a + Math.min(doneOf(u.key), u.n), 0)}</b><span>sellos</span></div></div>
    <div class="card"><h3 style="font-size:18px;font-weight:800;margin-bottom:4px">Por parada</h3>
      ${us.map(u => { const p = Math.round(doneOf(u.key) / u.n * 100); return `<div class="prow" style="--u:${u.color}"><div class="t"><span>${esc(u.name)}</span><span class="num">${p}%</span></div><div class="track"><i style="width:${p}%"></i></div></div>`; }).join('')}</div>
    <div class="card"><h3 style="font-size:18px;font-weight:800">Ajustes</h3>
      <div class="setrow"><div style="font-weight:700;margin-bottom:10px">Tamaño del cafecito diario</div>
        <div class="seg">${[5, 10, 15].map(m => `<button class="${S.goal === m ? 'on' : ''}" data-a="setgoal" data-v="${m}">${m} min</button>`).join('')}</div></div>
      ${P.canSpeak() ? `<div class="setrow"><div style="font-weight:700;margin-bottom:10px">Voz en inglés</div>
        ${voices.length > 1 ? `<select class="field" id="voice" aria-label="Voz en inglés">${voices.map(v => `<option ${v === P.voiceName() ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>` : ''}
        <button class="btn ghost" data-a="testvoice" style="margin-top:10px">${I.speaker(22)} Probar la voz</button></div>` : ''}
      ${sw('sound', S.sound, 'Sonidos')}
      ${P.canListen() ? sw('voiceon', S.voiceOn, 'Responder hablando', 'Ejercicios en los que contesta en voz alta en inglés') : ''}
      ${sw('senior', S.senior, 'Modo 65/20', 'Solo las 20 preguntas marcadas, en español')}
      ${P.canNotify() ? sw('remind', S.remind, 'Recordatorio diario', 'A las 7 de la noche') : ''}
      ${S.auth?.email ? `<div class="setrow"><div style="font-weight:700">Cuenta</div><p class="sub" style="font-size:14px;margin-top:4px">${esc(S.auth.email)} · ${esc(S.auth.phone || '')}</p></div>
      <button class="switch" data-a="logout">Cerrar sesión</button>` : ''}
      <button class="switch" data-a="reset" style="color:var(--red-tx)">Borrar mi progreso</button>
    </div>
    <p class="sub" style="font-size:13.5px">Mi Ciudadanía es una herramienta de estudio, no asesoría legal. No somos abogados ni estamos afiliados a USCIS. Preguntas del banco oficial público de 2025. Su progreso se guarda en este dispositivo.</p>
  </div></main>${tabs()}`;
}

/* ───────────── lección ───────────── */
function startSession(kind, items, meta = {}) {
  if (!items.length) return;
  L = { kind, items, pos: 0, total: new Set(items.map(i => i.uid)).size, resolved: new Set(), requeued: new Set(),
    correct: 0, wrong: 0, missed: [], start: Date.now(), sel: null, multi: [], checked: null, line: [], showText: false, ...meta };
  ui.pop = null; render(); onItem();
}
const cur = () => L.items[L.pos];
function onItem() { const it = cur(); if (it?.type === 'listen') setTimeout(() => P.speak(QBY[it.id].q_en), 350); }
const readAll = it => P.speak([QBY[it.id].q_en, ...it.options.map((o, i) => `${i + 1}. ${plain(o)}`)]);

function qHeader(q, lang, big = true) {         // la pregunta siempre en los dos idiomas, con lectura completa en inglés
  const en = `<p class="${big && lang === 'en' ? 'prompt' : 'sub'} qen"><button class="say" data-a="say" data-v="q" aria-label="Escuchar la pregunta en inglés">${I.speaker(big && lang === 'en' ? 26 : 20)}</button><span>${esc(q.q_en)}</span></p>`;
  const es = `<p class="${big && lang !== 'en' ? 'prompt' : 'sub'}">${esc(q.q_es)}</p>`;
  return lang === 'en' ? en + es : es + en;
}
function lessonScreen() {
  const it = cur(), q = it.id ? QBY[it.id] : null;
  const pct = L.resolved.size / L.total * 100;
  const head = `<div class="lhead"><button class="x" data-a="quit" aria-label="Salir de la lección">${I.x(28)}</button>
    <div class="bar" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(pct, 3)}%"></i></div>
    ${L.kind === 'exam' ? `<span class="score num" style="color:var(--green)">${L.correct}</span><span class="score num" style="color:var(--red)">${L.wrong}</span>` : ''}</div>`;
  let body = '', canCheck = false, direct = false;
  const readBtn = it.lang === 'en' && it.options ? `<button class="chip" data-a="readall">${I.list(18)} Escuchar pregunta y opciones</button>` : '';
  const opts = () => `<div class="opts" role="radiogroup">${it.options.map((o, i) => {
    const st = L.checked ? (o === it.correct ? 'right' : L.sel === i ? 'wrong' : '') : L.sel === i ? 'on' : '';
    return `<button class="opt ${st}" data-a="sel" data-v="${i}" role="radio" aria-checked="${L.sel === i}" ${L.checked ? 'disabled' : ''}><span class="key">${i + 1}</span>${esc(o)}</button>`; }).join('')}</div>`;

  if (it.type === 'teach') {
    direct = true;
    body = `<span class="pill">${I.star(14)} Pregunta nueva</span>
      ${talk('Esta es nueva. Léala, escúchela completa en inglés y fíjese en el truco.', 'idle', 60)}
      <div class="teach">${qHeader(q, 'es')}
      <div class="ans"><div class="lb">${q.answers_es.length > 1 ? 'Respuestas aceptadas' : 'Respuesta'}</div><p>${q.answers_es.slice(0, 5).map(esc).join(' · ')}</p>
        <p class="qen"><button class="say" data-a="say" data-v="a" aria-label="Escuchar las respuestas en inglés">${I.speaker(20)}</button><span>${q.answers_en.slice(0, 5).map(esc).join(' · ')}</span></p></div>
      ${MULTI[q.id] ? `<p class="hint">En la entrevista debe nombrar ${MULTI[q.id] === 5 ? 'cinco' : MULTI[q.id] === 3 ? 'tres' : 'dos'}.</p>` : ''}
      ${q.ancla ? `<div class="hook"><div class="lb">Para recordarlo</div><b>${esc(q.ancla)}</b>${q.por ? `<p>${esc(q.por)}</p>` : ''}</div>` : ''}
      ${q.viz && VIZ[q.viz] ? `<div class="viz">${VIZ[q.viz]}</div>` : ''}</div>`;
  } else if (it.type === 'mc') {
    canCheck = L.sel != null;
    body = `<h1 class="kind">${it.lang === 'en' ? 'Elija la respuesta en inglés' : 'Elija la respuesta correcta'}</h1>${qHeader(q, it.lang)}${readBtn}${opts()}`;
  } else if (it.type === 'multi') {
    canCheck = L.multi.length === it.k;
    const n = { 2: 'dos', 3: 'tres', 5: 'cinco' }[it.k];
    body = `<h1 class="kind">Elija ${n} respuestas correctas</h1>${qHeader(q, it.lang)}${readBtn}
      <p class="hint">Hay ${it.options.length} opciones y ${n} son correctas. Lleva <b>${L.multi.length} de ${it.k}</b>.</p>
      <div class="opts grid2">${it.options.map((o, i) => {
        const on = L.multi.includes(i), right = it.correct.includes(o);
        const st = L.checked ? (right ? 'right' : on ? 'wrong' : '') : on ? 'on' : '';
        return `<button class="opt ${st}" data-a="msel" data-v="${i}" role="checkbox" aria-checked="${on}" ${L.checked ? 'disabled' : ''}><span class="key">${on || (L.checked && right) ? I.check(14) : ''}</span>${esc(o)}</button>`; }).join('')}</div>`;
  } else if (it.type === 'listen') {
    canCheck = L.sel != null;
    body = `<h1 class="kind">Escuche la pregunta y elija la respuesta</h1>
      <div class="speak"><button class="spk" data-a="say" data-v="q" aria-label="Escuchar la pregunta">${I.speaker(40)}</button>
      <button class="spk sm" data-a="say" data-v="slow" aria-label="Escuchar despacio">${I.slow(28)}</button>
      <button class="link-btn" data-a="showtext">${L.showText ? 'Ocultar texto' : 'Mostrar texto'}</button></div>
      ${L.showText || L.checked ? `<p class="sub">${esc(q.q_en)}<br>${esc(q.q_es)}</p>` : ''}${readBtn}${opts()}`;
  } else if (it.type === 'tiles') {
    canCheck = L.line.length > 0;
    body = `<h1 class="kind">Arme la respuesta en inglés</h1>${qHeader(q, 'en')}
      <div class="tiles-line" aria-label="Su respuesta">${L.line.map((w, j) => `<button class="tile" data-a="untile" data-v="${j}" ${L.checked ? 'disabled' : ''}>${esc(it.bank[w])}</button>`).join('')}</div>
      <div class="bank">${it.bank.map((w, i) => `<button class="tile ${L.line.includes(i) ? 'used' : ''}" data-a="tile" data-v="${i}" ${L.line.includes(i) || L.checked ? 'disabled' : ''}>${esc(w)}</button>`).join('')}</div>`;
  } else if (it.type === 'blank') {
    canCheck = L.sel != null;
    const fill = L.sel != null ? `<b class="gap filled ${L.checked ? (it.options[L.sel] === it.correct ? 'ok' : 'bad') : ''}">${esc(it.options[L.sel])}</b>` : `<b class="gap">&nbsp;</b>`;
    body = `<h1 class="kind">Complete la respuesta</h1>${qHeader(q, it.lang, false)}
      <p class="sentence">${esc(it.before)} ${fill} ${esc(it.after)}</p>
      <div class="bank">${it.options.map((o, i) => `<button class="tile ${L.sel === i ? 'picked' : ''}" data-a="sel" data-v="${i}" ${L.checked ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>`;
  } else if (it.type === 'speak') {
    const st = L.mic || 'idle';
    body = `<h1 class="kind">Responda en voz alta, en inglés</h1>${qHeader(q, 'en')}
      ${MULTI[q.id] ? `<p class="hint">Nombre ${MULTI[q.id] === 5 ? 'cinco' : MULTI[q.id] === 3 ? 'tres' : 'dos'}, una tras otra.</p>` : ''}
      <div class="micwrap"><button class="mic ${st}" data-a="mic" ${L.checked || st === 'listening' ? 'disabled' : ''} aria-label="${st === 'listening' ? 'Escuchando' : 'Tocar para hablar'}">${I.mic(44)}</button>
      <p class="sub" aria-live="polite">${st === 'listening' ? 'Le escucho… diga su respuesta.' : it.heard?.length ? `Escuchamos: «${esc(it.heard[0])}»` : st === 'empty' ? 'No le escuché bien. Toque y hable otra vez.' : 'Toque el micrófono y diga la respuesta.'}</p></div>
      <p class="note">La primera vez, su teléfono le pedirá permiso para usar el micrófono. Mi Ciudadanía no guarda grabaciones de su voz.</p>
      ${L.checked ? '' : `<button class="link-btn" data-a="nomic" style="justify-self:center">No puedo hablar ahora</button>`}`;
  } else if (it.type === 'pairs') {
    const col = (side, ids, key) => ids.map(id => { const p = it.list.find(x => x.id === id); const m = it.matched.includes(id);
      return `<button class="pair ${m ? 'done' : L.sel === side + id ? 'on' : ''} ${L.bad === side + id ? 'bad' : ''}" data-a="pair" data-v="${side}${id}" ${m ? 'disabled' : ''}>${esc(p[key])}</button>`; }).join('');
    direct = it.matched.length === it.list.length;
    body = `<h1 class="kind">Una cada respuesta con su traducción</h1><div class="pairs"><div class="col">${col('L', it.left, 'en')}</div><div class="col">${col('R', it.right, 'es')}</div></div>`;
  } else if (it.type === 'info') {
    direct = true;
    const link = { 23: ['senate.gov', 'https://www.senate.gov/senators/senators-contact.htm'], 29: ['house.gov', 'https://www.house.gov/representatives/find-your-representative'],
      61: ['usa.gov', 'https://www.usa.gov/state-governor'], 62: ['usa.gov', 'https://www.usa.gov/states-and-territories'] }[q.id] || ['uscis.gov', 'https://www.uscis.gov/citizenship/testupdates'];
    body = `<span class="pill">Respuesta que cambia</span>
      ${talk('Esta respuesta depende de dónde vive o de quién ocupa el cargo. Búsquela y anótela aquí.', 'idle', 60)}
      ${qHeader(q, 'es')}
      <p class="muted">Consulte la respuesta vigente en <a class="ext" href="${link[1]}" target="_blank" rel="noopener">${link[0]}</a>. Verifíquela de nuevo la semana de su entrevista.</p>
      <label class="lbl" for="personal">Mi respuesta</label>
      <input id="personal" class="field" data-id="${q.id}" value="${esc(S.personal[q.id] || '')}" placeholder="Escríbala aquí" autocomplete="off">`;
  }

  let foot;
  if (L.checked) {
    const ok = L.checked === 'ok';
    const ans = it.type === 'tiles' ? it.target : it.type === 'multi' ? it.correct.join(' · ') : it.type === 'blank' ? it.full
      : it.type === 'speak' ? answersOf(q, 'en').slice(0, MULTI[q.id] || 1).join(' · ') : it.correct;
    foot = `<footer class="lfoot ${ok ? 'ok' : 'bad'}" role="status"><div class="fb"><span class="ic">${ok ? I.check(30) : I.x(26)}</span><div>
      <h3>${ok ? L.praise : 'Respuesta correcta:'}</h3>
      ${ok ? (it.type === 'blank' ? `<p class="h">${esc(it.full)}</p>` : '') : `<p>${esc(ans)}</p>${q.ancla ? `<p class="h">Recuerde: ${esc(q.ancla)}</p>` : ''}`}</div></div>
      <button class="btn ${ok ? 'green' : 'red'}" data-a="next">Continuar</button></footer>`;
  } else if (direct) {
    foot = `<footer class="lfoot"><button class="btn green" data-a="next">Continuar</button></footer>`;
  } else if (it.type === 'speak') {
    foot = `<footer class="lfoot"><button class="btn ghost" data-a="skipmic">Saltar este ejercicio</button></footer>`;
  } else {
    foot = `<footer class="lfoot"><button class="btn green" data-a="check" ${canCheck ? '' : 'disabled'}>Comprobar</button></footer>`;
  }
  return `<main class="lesson">${head}<div class="lbody">${body}</div>${foot}</main>`;
}

const PRAISE = ['¡Muy bien!', '¡Excelente!', '¡Eso es!', '¡Así se hace!', '¡Perfecto!', '¡Qué bien!'];
function grade(ok) {
  const it = cur();
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
      L.items.push(it.type === 'mc' || it.type === 'listen' || it.type === 'multi' ? { ...mcItem(q, it.lang, it.type === 'multi' ? 'mc' : it.type), uid: it.uid } : { ...it, heard: null });
    } else L.resolved.add(it.uid);
  }
  save(); render();
}
function check() {
  const it = cur();
  if (it.type === 'tiles') return grade(norm(L.line.map(i => it.bank[i]).join(' ')) === norm(it.target));
  if (it.type === 'multi') { const pickd = L.multi.map(i => it.options[i]); return grade(pickd.length === it.k && pickd.every(o => it.correct.includes(o))); }
  grade(it.options[L.sel] === it.correct);
}
function next() {
  const it = cur();
  if (['teach', 'info', 'pairs'].includes(it.type)) L.resolved.add(it.uid);
  P.stopSpeaking();
  L.pos++; L.sel = null; L.multi = []; L.checked = null; L.line = []; L.showText = false; L.bad = null; L.mic = null;
  if (L.kind === 'exam') {
    const need = S.senior ? 6 : 12, fail = S.senior ? 5 : 9;
    if (L.correct >= need || L.wrong >= fail) return finish();
  }
  if (L.pos >= L.items.length) return finish();
  render(); onItem(); scrollTo(0, 0);
}
function finish() {
  const sec = Math.min(1200, Math.round((Date.now() - L.start) / 1000));
  const n = L.correct + L.wrong;
  let g = L.correct;
  if (L.kind === 'lesson') { if (!L.replay) { g += 10; S.done[doneKey(L.unit)] = Math.max(doneOf(L.unit), L.idx + 1); } }
  else if (L.kind === 'unitrev') g += 5;
  const lvBefore = level().i, goalBefore = S.day.sec >= S.goal * 60;
  S.xp += g; S.day.sec += sec; S.day.lessons++;
  const cup = serveCup();
  save(); tone('done'); P.haptic('heavy');
  R = { kind: L.kind, g, sec, acc: n ? Math.round(L.correct / n * 100) : 100, correct: L.correct, wrong: L.wrong, missed: L.missed,
    goalNow: !goalBefore && S.day.sec >= S.goal * 60, cup, levelUp: level().i > lvBefore, step: 0 };
  L = null; render();
}
function resultScreen() {
  if (R.step === 1) {
    return `<main class="lesson"><div class="center">
      <div class="bigcup">${I.cup(150, 1)}<span class="num">${S.streak}</span></div>
      <h2 class="h1">${S.streak === 1 ? '¡Se sirvió su primer cafecito!' : `¡${S.streak} días seguidos con su cafecito!`}</h2>
      <p class="muted">Vuelva mañana por otra taza. Si un día no puede, Luz le guarda un día de descanso por semana.</p>${week()}</div>
      <div class="foot-actions"><button class="btn" data-a="done">Continuar</button></div></main>`;
  }
  const exam = R.kind === 'exam', need = S.senior ? 6 : 12, pass = R.correct >= need;
  const title = exam ? (pass ? '¡Aprobó el examen de práctica!' : 'Todavía no, pero va bien') : '¡Lección completada!';
  const lv = level();
  const missed = R.missed.length ? `<div class="missed"><p class="sub" style="font-weight:800">Para repasar</p>${R.missed.slice(0, 6).map(id => { const q = QBY[id];
    return `<div>${esc(S.senior ? q.q_es : q.q_en)}<b>${esc((S.senior ? q.answers_es : q.answers_en)[0])}</b></div>`; }).join('')}</div>` : '';
  return `<main class="lesson"><div class="center">${luz(exam && !pass ? 'sad' : 'cheer', 150)}
    <h1 class="h1">${title}</h1>
    ${exam ? `<p class="muted">${R.correct} correctas de ${R.correct + R.wrong}. ${pass ? 'En la entrevista necesita ' + need + '.' : `Necesita ${need}. Siga repasando y vuelva a intentarlo.`}</p>` : ''}
    ${R.levelUp ? `<p class="levelup">${I.bean(20)} Su cosecha creció: ahora es <b>${lv.name}</b></p>` : ''}
    ${R.goalNow ? `<p class="muted" style="color:var(--green-tx)">Se tomó su cafecito de ${S.goal} minutos de hoy.</p>` : ''}
    <div class="metric" style="width:100%"><div><b class="num" style="color:var(--cafe)">+${R.g}</b><span>granitos</span></div>
      <div><b class="num" style="color:var(--green)">${R.acc}%</b><span>aciertos</span></div>
      <div><b class="num" style="color:var(--blue)">${Math.floor(R.sec / 60)}:${String(R.sec % 60).padStart(2, '0')}</b><span>tiempo</span></div></div>
    ${missed}</div>
    <div class="foot-actions"><button class="btn" data-a="${R.cup ? 'cafecito' : 'done'}">Continuar</button></div></main>`;
}

/* ───────────── render y acciones ───────────── */
function render() {
  const html = !S.auth || (REGISTRO && S.auth.guest) ? welcome() : !S.onboarded ? onboarding() : R ? resultScreen() : L ? lessonScreen()
    : ui.tab === 'review' ? reviewScreen() : ui.tab === 'progress' ? progressScreen() : pathScreen();
  const focus = document.activeElement?.id, pos = document.activeElement?.selectionStart;
  root.innerHTML = html + (ui.toast ? `<div class="toast" role="status">${esc(ui.toast)}</div>` : '');
  if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); try { el.setSelectionRange(pos, pos); } catch {} } }
  if (ui.pop) document.querySelector('.pop')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function toast(t) { ui.toast = t; render(); setTimeout(() => { ui.toast = null; render(); }, 2600); }

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
  enter() { if (!ui.reg.ok) return; S.auth = { guest: true, accepted: Date.now() }; save(); render(); scrollTo(0, 0); },
  async sendcode() {
    const r = ui.reg; r.err = ''; r.busy = true; render();
    try { const j = await api('/api/registro/enviar', { email: r.email.trim(), phone: r.phone.trim(), acepta: r.ok }); r.token = j.token; r.step = 'otp'; r.sentAt = Date.now(); tickResend(); }
    catch (e) { r.err = e.message; }
    r.busy = false; render(); document.getElementById('otp')?.focus();
  },
  resend() { actions.sendcode(); },
  regback() { ui.reg.step = 'info'; ui.reg.err = ''; render(); },
  async verify() {
    const r = ui.reg, code = (document.getElementById('otp')?.value || '').replace(/\D/g, '');
    if (code.length !== 6) { r.err = 'El código tiene 6 números.'; return render(); }
    r.err = ''; r.busy = true; render();
    try { const j = await api('/api/registro/verificar', { token: r.token, code }); S.auth = { email: j.email, phone: j.phone, session: j.session, at: Date.now() }; save(); ui.reg = { step: 'info', email: '', phone: '', ok: false, err: '', busy: false }; }
    catch (e) { r.err = e.message; r.busy = false; }
    render();
  },
  onb() { if (ui.onb < 2) ui.onb++; else { S.onboarded = true; save(); } render(); },
  goal(v) { S.goal = +v; save(); render(); },
  setgoal(v) { S.goal = +v; save(); render(); },
  senior(v) { S.senior = v == null ? !S.senior : v === '1'; save(); render(); },
  sound() { S.sound = !S.sound; save(); render(); },
  voiceon() { S.voiceOn = !S.voiceOn; S.micOffUntil = 0; save(); render(); },
  testvoice() { P.speak(['Who was the first President of the United States?', 'George Washington.']); },
  async remind() { const want = !S.remind; const ok = await P.scheduleReminder(want); S.remind = want && ok; save(); render(); if (want && !ok) toast('Active las notificaciones en los ajustes del teléfono.'); },
  logout() { confirmBox('¿Cerrar sesión?', 'Su progreso se queda en este dispositivo. Para volver a entrar le enviaremos otro código.', 'Cerrar sesión', () => { S.auth = null; save(); render(); }); },
  reset() { confirmBox('¿Borrar todo su progreso?', 'Se borran sus tazas, granitos y respuestas. No se puede deshacer.', 'Sí, borrar', () => { S = { ...fresh(), auth: S.auth, onboarded: true }; save(); render(); }, true); },
  tab(v) { ui.tab = v; ui.pop = null; render(); scrollTo(0, 0); },
  pop(v) { ui.pop = ui.pop === v ? null : v; P.haptic(); render(); },
  start(v) { const [u, i] = v.split(':'); startSession('lesson', buildLesson(u, +i), { unit: u, idx: +i, replay: +i < doneOf(u) }); },
  unitrev(v) { const u = units().find(x => x.key === v); startSession('unitrev', buildReview(shuffle(u.qs.filter(graded)).slice(0, 10)), { unit: v }); },
  review() { startSession('review', buildReview(weakest(8))); },
  exam() { startSession('exam', buildExam()); },
  quit() { confirmBox('¿Salir de la lección?', 'Si sale ahora, perderá el avance de esta lección.', 'Salir', () => { P.stopSpeaking(); L = null; render(); }); },
  say(v) { const q = QBY[cur().id]; P.speak(v === 'a' ? q.answers_en.map(plain) : q.q_en, v === 'slow'); },
  readall() { readAll(cur()); },
  showtext() { L.showText = !L.showText; render(); },
  sel(v) { if (L.checked) return; L.sel = +v; P.haptic(); render(); },
  msel(v) { if (L.checked) return; const i = +v, it = cur(); L.multi = L.multi.includes(i) ? L.multi.filter(x => x !== i) : L.multi.length < it.k ? [...L.multi, i] : L.multi; P.haptic(); render(); },
  tile(v) { L.line.push(+v); P.haptic(); render(); },
  untile(v) { L.line.splice(+v, 1); render(); },
  async mic() {
    const it = cur(); L.mic = 'listening'; render();
    try {
      const heard = await P.listen();
      if (cur() !== it) return;
      it.heard = heard; L.mic = heard.length ? 'heard' : 'empty';
      if (heard.length) return grade(matchSpoken(QBY[it.id], heard));
      render();
    } catch (e) {
      L.mic = 'idle'; render();
      toast(e.message === 'permiso' ? 'Permita el micrófono en los ajustes del navegador o del teléfono.' : 'El micrófono no está disponible ahora.');
    }
  },
  skipmic() { P.stopListening(); const it = cur(); L.items[L.pos] = { ...mcItem(QBY[it.id], 'en'), uid: it.uid }; L.mic = null; render(); },
  nomic() {
    P.stopListening(); S.micOffUntil = Date.now() + 60 * 60 * 1000; save();
    const it = cur(); L.items[L.pos] = { ...mcItem(QBY[it.id], 'en'), uid: it.uid }; L.mic = null; render();
    toast('Listo. Por una hora no le pediremos hablar.');
  },
  pair(v) {
    const it = cur(); L.bad = null;
    if (!L.sel || L.sel[0] === v[0]) { L.sel = v; P.haptic(); return render(); }
    if (L.sel.slice(1) === v.slice(1)) { it.matched.push(+v.slice(1)); tone('ok'); P.haptic(); }
    else { L.bad = v; tone('bad'); P.haptic('heavy'); }
    L.sel = null; render();
  },
  check() { if (!L.checked) check(); },
  next() { next(); },
  cafecito() { R.step = 1; render(); },
  done() { R = null; ui.tab = 'learn'; render(); requestAnimationFrame(() => document.querySelector('.stamp.current')?.scrollIntoView({ block: 'center' })); },
};
let resendTimer;
function tickResend() { clearInterval(resendTimer); resendTimer = setInterval(() => { if (S.auth || ui.reg.step !== 'otp' || Date.now() - ui.reg.sentAt > 31000) clearInterval(resendTimer); if (!S.auth && ui.reg.step === 'otp') { const b = document.querySelector('[data-a="resend"]'); const w = Math.max(0, 30 - Math.floor((Date.now() - ui.reg.sentAt) / 1000)); if (b) { b.disabled = !!w; b.textContent = w ? `Reenviar en ${w} s` : 'Reenviar código'; } } }, 1000); }

document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]');
  if (!b) { if (ui.pop && !e.target.closest('.pop')) { ui.pop = null; render(); } return; }
  if (b.disabled) return;
  actions[b.dataset.a]?.(b.dataset.v);
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'personal') { const v = t.value.trim(); if (v) S.personal[t.dataset.id] = v; else delete S.personal[t.dataset.id]; save(); }
  if (t.id === 'email' || t.id === 'phone') { ui.reg[t.id] = t.value; ui.reg.err = ''; refreshReg(); }
  if (t.id === 'otp') { t.value = t.value.replace(/\D/g, '').slice(0, 6); if (t.value.length === 6) actions.verify(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'agree') { ui.reg.ok = e.target.checked; refreshReg(); }
  if (e.target.id === 'voice') { S.voice = e.target.value; P.setVoice(S.voice); save(); P.speak('Who is the Commander in Chief of the military?'); }
});
function refreshReg() {                                 // sin re-render para no perder el foco al escribir
  const r = ui.reg, btn = document.querySelector('[data-a="sendcode"]'), h = document.querySelector('.hint-s'), go = document.querySelector('[data-a="enter"]');
  if (go) { go.disabled = !r.ok; if (h) h.textContent = r.ok ? ' ' : 'Marque la casilla del aviso para continuar.'; return; }
  if (btn) btn.disabled = !(r.ok && okEmail(r.email) && okPhone(r.phone) && !r.busy);
  if (h) h.textContent = !r.ok ? 'Marque la casilla del aviso para continuar.' : !okEmail(r.email) ? 'Escriba su correo.' : !okPhone(r.phone) ? 'Escriba su teléfono (10 dígitos en EE.UU.).' : ' ';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'otp') return actions.verify();
  if (!L || document.querySelector('dialog[open]') || e.target.tagName === 'INPUT') return;
  const it = cur();
  if (/^[1-9]$/.test(e.key) && it.options && !L.checked && +e.key <= it.options.length) (it.type === 'multi' ? actions.msel : actions.sel)(String(+e.key - 1));
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
