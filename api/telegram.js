// api/telegram.js — серверная функция Vercel для отправки сообщений в Telegram
// + защита от дублей по трек-коду

const seen = new Map(); // trackCode -> timestamp
const TTL_MS = 90 * 1000; // 90 секунд

function isDuplicate(track) {
  const now = Date.now();
  for (const [k, t] of [...seen.entries()]) {
    if (now - t > TTL_MS) seen.delete(k);
  }
  if (!track) return false;
  const was = seen.get(track);
  seen.set(track, now);
  return was && (now - was) < TTL_MS;
}

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, track } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });

    // Антидубль
    if (isDuplicate(track)) {
      return res.status(200).json({ ok: true, duplicate: true });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId)
      return res.status(500).json({ error: 'Missing env vars' });

    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });

    const data = await r.json().catch(() => ({}));
    if (!data.ok)
      return res.status(502).json({ error: 'Telegram error', data });

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
