// Vercel Serverless: send text to Telegram
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return res.status(500).json({ error: 'Missing env vars' });
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const data = await r.json().catch(()=>({}));
    if(!data.ok) return res.status(502).json({ error: 'Telegram error', data });
    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
