const { crypto, TTL_MIN, sign, hmac, cleanEmail, cleanPhone, cors, body } = require('../_otp');

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  if (!process.env.OTP_SECRET || !process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    return res.status(503).json({ error: 'El registro todavía no está configurado. Intente más tarde.' });
  }
  const b = body(req);
  const email = cleanEmail(b.email), phone = cleanPhone(b.phone);
  if (!email) return res.status(400).json({ error: 'Revise su correo electrónico.' });
  if (!phone) return res.status(400).json({ error: 'Revise su número de teléfono (10 dígitos en EE.UU.).' });
  if (b.acepta !== true) return res.status(400).json({ error: 'Debe confirmar que entiende el aviso.' });

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const exp = Date.now() + TTL_MIN * 60 * 1000;
  const token = sign({ e: email, p: phone, x: exp, h: hmac(`${code}:${email}:${exp}`) });

  const text = `Su código de Mi Ciudadanía es ${code}.\n\nVence en ${TTL_MIN} minutos. Si usted no lo pidió, ignore este correo.\n\nMi Ciudadanía no es un despacho de abogados ni está afiliado a USCIS.`;
  const html = `<div style="font-family:system-ui,sans-serif;max-width:440px;margin:auto;padding:24px;color:#1B2333">
    <p style="font-size:16px">Su código para entrar a <b>Mi Ciudadanía Estudio</b>:</p>
    <p style="font-size:34px;font-weight:800;letter-spacing:8px;margin:18px 0;color:#1F9D74">${code}</p>
    <p style="font-size:14px;color:#5B6779">Vence en ${TTL_MIN} minutos. Si usted no lo pidió, ignore este correo.</p>
    <p style="font-size:12px;color:#7D8899;margin-top:28px">Mi Ciudadanía no es un despacho de abogados ni está afiliado a USCIS ni al gobierno.</p></div>`;

  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject: `Su código: ${code}`, text, html }),
  }).catch(() => null);
  if (!r || !r.ok) return res.status(502).json({ error: 'No pudimos enviar el correo. Intente de nuevo en un momento.' });

  res.status(200).json({ token, vence: exp });
};
