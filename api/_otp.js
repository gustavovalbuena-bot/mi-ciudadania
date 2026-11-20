// Registro con código de un solo uso (OTP) por correo. Sin base de datos:
// el código viaja firmado (HMAC) dentro de un token que el cliente devuelve al verificar.
// Variables de entorno (Vercel → Settings → Environment Variables):
//   OTP_SECRET            cadena aleatoria larga (obligatoria)
//   RESEND_API_KEY        clave de https://resend.com (obligatoria para enviar correos)
//   EMAIL_FROM            remitente verificado, p. ej. "Mi Ciudadanía <codigo@sudominio.com>"
//   REGISTRO_WEBHOOK_URL  opcional: recibe {email, telefono, fecha} de cada registro verificado
const crypto = require('crypto');

const TTL_MIN = 10;
const ORIGINS = ['capacitor://localhost', 'https://localhost', 'http://localhost'];

const b64 = s => Buffer.from(s).toString('base64url');
const unb64 = s => Buffer.from(s, 'base64url').toString();
const hmac = (data) => crypto.createHmac('sha256', process.env.OTP_SECRET).update(data).digest('base64url');

function sign(obj) { const p = b64(JSON.stringify(obj)); return `${p}.${hmac(p)}`; }
function open(token) {
  const [p, s] = String(token || '').split('.');
  if (!p || !s) return null;
  const good = hmac(p);
  if (s.length !== good.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(good))) return null;
  try { return JSON.parse(unb64(p)); } catch { return null; }
}

function cleanEmail(e) {
  e = String(e || '').trim().toLowerCase();
  return /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(e) ? e : null;
}
function cleanPhone(p) {
  const d = String(p || '').replace(/[^\d+]/g, '');
  const digits = d.replace(/\D/g, '');
  if (d.startsWith('+')) return digits.length >= 8 && digits.length <= 15 ? '+' + digits : null;
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
  return null;
}

function cors(req, res) {
  const o = req.headers.origin;
  if (o && (ORIGINS.includes(o) || o.endsWith('.vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', o);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return true; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return true; }
  return false;
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch { return {}; }
}

module.exports = { crypto, TTL_MIN, sign, open, hmac, cleanEmail, cleanPhone, cors, body };
