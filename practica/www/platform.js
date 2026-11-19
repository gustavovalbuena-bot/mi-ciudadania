// Adaptador de plataforma. La app no sabe si corre en un navegador o dentro de
// iOS/Android: este módulo usa los plugins de Capacitor cuando existen y cae a
// las APIs web cuando no. Es la única pieza que cambia entre web y tiendas.
const C = window.Capacitor;
export const isApp = !!C?.isNativePlatform?.();
const P = isApp ? (C.Plugins || {}) : {};

// ── voz en inglés (el examen real es oral, en inglés) ──
let voice = null;
const hasWebSpeech = 'speechSynthesis' in window;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => /en[-_]US/i.test(v.lang) && /natural|premium|enhanced|samantha|google/i.test(v.name))
       || vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
}
if (hasWebSpeech) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

export const canSpeak = () => !!P.TextToSpeech || hasWebSpeech;

export function speak(text, slow = false) {
  const rate = slow ? 0.62 : 0.92;
  if (P.TextToSpeech) { P.TextToSpeech.speak({ text, lang: 'en-US', rate }).catch(() => {}); return; }
  if (!hasWebSpeech) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US'; u.rate = rate; if (voice) u.voice = voice;
  speechSynthesis.speak(u);
}

// ── vibración ──
export function haptic(kind = 'light') {
  if (P.Haptics) { P.Haptics.impact({ style: kind === 'heavy' ? 'HEAVY' : 'LIGHT' }).catch(() => {}); return; }
  if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? [28, 40, 28] : 12);
}

// ── recordatorio diario (solo en la app instalada) ──
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
    body: 'Luz le espera: cinco minutos de práctica hoy.',
    schedule: { on: { hour, minute: 0 }, allowWhileIdle: true },
  }] });
  return true;
}

// ── botón atrás de Android ──
export function onBack(fn) { P.App?.addListener?.('backButton', fn); }
export function exitApp() { P.App?.exitApp?.(); }

// ── funcionamiento sin conexión en la web ──
export function registerSW() {
  if (isApp || !('serviceWorker' in navigator)) return;
  addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
