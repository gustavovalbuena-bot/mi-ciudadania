// Adaptador de plataforma. La app no sabe si corre en un navegador o dentro de
// iOS/Android: este módulo usa los plugins de Capacitor cuando existen y cae a
// las APIs web cuando no. Es la única pieza que cambia entre web y tiendas.
const C = window.Capacitor;
export const isApp = !!C?.isNativePlatform?.();
const P = isApp ? (C.Plugins || {}) : {};

// En la app instalada no hay mismo origen: la API vive en el dominio publicado.
export const API = isApp ? 'https://mi-ciudadania.vercel.app' : '';

/* ───────────── voz en inglés ─────────────
   Problemas que resuelve:
   1. Safari y Chrome cortan la lectura tras la primera palabra si el objeto
      SpeechSynthesisUtterance se libera de memoria: se guarda una referencia.
   2. Chrome corta textos largos (~15 s): se lee por frases.
   3. Llamar speak() justo después de cancel() a veces no suena: pequeña pausa.
   4. La voz por defecto suele ser robótica: se elige la más natural disponible. */
const hasWebSpeech = 'speechSynthesis' in window;
let voices = [], chosen = null, preferred = null, queue = [];
const RANK = [/natural/i, /neural/i, /premium/i, /enhanced/i, /google us english/i, /\b(ava|samantha|allison|susan|zoe|evan|nathan|aaron|nicky|joelle)\b/i, /microsoft (aria|jenny|guy)/i];
function score(v) {
  let s = /en[-_]US/i.test(v.lang) ? 100 : /^en/i.test(v.lang) ? 40 : 0;
  RANK.forEach((r, i) => { if (r.test(v.name)) s += 60 - i * 6; });
  if (/compact|eloquence|novelty|bad news|bells|boing|bubbles|cellos|whisper|zarvox|trinoids|organ|jester|superstar|grandpa|grandma|rocko|shelley|flo|reed|sandy/i.test(v.name)) s -= 80;
  if (v.localService) s += 4;
  return s;
}
function loadVoices() {
  voices = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)).sort((a, b) => score(b) - score(a));
  chosen = voices.find(v => v.name === preferred) || voices[0] || null;
}
if (hasWebSpeech) { loadVoices(); speechSynthesis.addEventListener?.('voiceschanged', loadVoices); }

export const canSpeak = () => !!P.TextToSpeech || hasWebSpeech;
export const listVoices = () => voices.filter(v => score(v) > 60).slice(0, 8).map(v => v.name);
export function setVoice(name) { preferred = name || null; if (hasWebSpeech) loadVoices(); }
export const voiceName = () => chosen?.name || '';

const chunks = t => String(t).replace(/\s+/g, ' ').match(/[^.!?;]+[.!?;]?/g)?.map(s => s.trim()).filter(Boolean) || [];

export function stopSpeaking() {
  if (P.TextToSpeech) { P.TextToSpeech.stop().catch(() => {}); return; }
  if (hasWebSpeech) { queue = []; speechSynthesis.cancel(); }
}

// Lee una lista de textos seguidos (pregunta y luego opciones). Devuelve una promesa al terminar.
export function speak(parts, slow = false) {
  const list = (Array.isArray(parts) ? parts : [parts]).flatMap(chunks);
  if (!list.length) return Promise.resolve();
  const rate = slow ? 0.68 : 0.9;
  if (P.TextToSpeech) {
    return list.reduce((p, text) => p.then(() => P.TextToSpeech.speak({ text, lang: 'en-US', rate, pitch: 1, category: 'playback' }).catch(() => {})), P.TextToSpeech.stop().catch(() => {}));
  }
  if (!hasWebSpeech) return Promise.resolve();
  speechSynthesis.cancel();
  if (!chosen) loadVoices();
  return new Promise(resolve => {
    setTimeout(() => {
      queue = list.map(text => {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = rate; u.pitch = 1; if (chosen) u.voice = chosen;
        return u;
      });
      const mine = queue;
      if (!mine.length) return resolve();
      mine[mine.length - 1].onend = mine[mine.length - 1].onerror = () => resolve();
      mine.forEach(u => speechSynthesis.speak(u));   // las referencias quedan en `queue`
      if (speechSynthesis.paused) speechSynthesis.resume();
    }, 80);
  });
}

/* ───────────── reconocimiento de voz (responder hablando) ───────────── */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = () => !!P.SpeechRecognition || !!SR;

// Escucha una respuesta en inglés. Devuelve las transcripciones posibles.
export async function listen() {
  if (P.SpeechRecognition) {
    const R = P.SpeechRecognition;
    const perm = await R.requestPermissions().catch(() => ({}));
    if (perm.speechRecognition && perm.speechRecognition !== 'granted') throw new Error('permiso');
    const r = await R.start({ language: 'en-US', maxResults: 5, partialResults: false, popup: false });
    return r?.matches || [];
  }
  if (!SR) throw new Error('sin-soporte');
  stopSpeaking();
  return new Promise((resolve, reject) => {
    const r = new SR();
    r.lang = 'en-US'; r.maxAlternatives = 5; r.interimResults = false; r.continuous = false;
    let got = false;
    r.onresult = e => { got = true; resolve([...e.results[0]].map(a => a.transcript)); };
    r.onerror = e => reject(new Error(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'permiso' : e.error));
    r.onend = () => { if (!got) resolve([]); };
    window.__rec = r;                                   // evita que se libere de memoria
    r.start();
    setTimeout(() => { try { r.stop(); } catch {} }, 9000);
  });
}
export function stopListening() {
  if (P.SpeechRecognition) { P.SpeechRecognition.stop().catch(() => {}); return; }
  try { window.__rec?.stop(); } catch {}
}

/* ───────────── vibración ───────────── */
export function haptic(kind = 'light') {
  if (P.Haptics) { P.Haptics.impact({ style: kind === 'heavy' ? 'HEAVY' : 'LIGHT' }).catch(() => {}); return; }
  if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? [28, 40, 28] : 12);
}

/* ───────────── recordatorio diario (solo en la app instalada) ───────────── */
export const canNotify = () => !!P.LocalNotifications;
export async function scheduleReminder(on, hour = 19) {
  const N = P.LocalNotifications;
  if (!N) return false;
  await N.cancel({ notifications: [{ id: 1 }] }).catch(() => {});
  if (!on) return true;
  const perm = await N.requestPermissions().catch(() => ({}));
  if (perm.display !== 'granted') return false;
  await N.schedule({ notifications: [{
    id: 1, title: 'Mi Ciudadanía',
    body: 'Su cafecito de estudio le espera: cinco minutos hoy.',
    schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
  }] });
  return true;
}

/* ───────────── botón atrás de Android ───────────── */
export function onBack(fn) { P.App?.addListener?.('backButton', fn); }
export function exitApp() { P.App?.exitApp?.(); }

/* ───────────── funcionamiento sin conexión en la web ───────────── */
export function registerSW() {
  if (isApp || !('serviceWorker' in navigator)) return;
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
