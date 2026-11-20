const { crypto, sign, open, hmac, cors, body } = require('../_otp');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (!process.env.OTP_SECRET) return res.status(503).json({ error: 'El registro todavía no está configurado.' });
  const b = body(req);
  const t = open(b.token);
  const code = String(b.code || '').replace(/\D/g, '');
  if (!t || !t.e || !t.h) return res.status(400).json({ error: 'Pida un código nuevo.' });
  if (Date.now() > t.x) return res.status(400).json({ error: 'El código venció. Pida uno nuevo.' });
  const want = hmac(`${code}:${t.e}:${t.x}`);
  if (code.length !== 6 || want.length !== t.h.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(t.h))) {
    return res.status(400).json({ error: 'El código no coincide. Revise el correo e inténtelo otra vez.' });
  }
  const fecha = new Date().toISOString();
  if (process.env.REGISTRO_WEBHOOK_URL) {
    const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), 3000);
    await fetch(process.env.REGISTRO_WEBHOOK_URL, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: t.e, telefono: t.p, fecha }) }).catch(() => {});
    clearTimeout(to);
  }
  res.status(200).json({ session: sign({ e: t.e, p: t.p, iat: Date.now() }), email: t.e, phone: t.p });
};
