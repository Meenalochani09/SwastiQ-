// Optional cloud copy of each device's data, stored in Upstash Redis / Vercel KV.
// Without it the app still works: data stays on the device (localStorage).
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = async (cmd) => {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: 'Bearer ' + TOKEN }, body: JSON.stringify(cmd) });
  if (!r.ok) throw new Error('store ' + r.status);
  return (await r.json()).result;
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(501).json({ error: 'No storage configured' });
  const id = String(req.headers['x-device-id'] || '');
  if (!/^[A-Za-z0-9-]{8,64}$/.test(id)) return res.status(400).json({ error: 'Bad device id' });
  const key = 'swastiq:state:' + id;
  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', key]);
      return res.status(200).json(v ? JSON.parse(v) : { json: null, ts: 0 });
    }
    if (req.method === 'PUT') {
      const { ts, json } = req.body || {};
      if (typeof json !== 'string') return res.status(400).json({ error: 'Bad body' });
      await redis(['SET', key, JSON.stringify({ ts: Number(ts) || Date.now(), json })]);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') { await redis(['DEL', key]); return res.status(200).json({ ok: true }); }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) { res.status(500).json({ error: 'Storage error' }); }
};
