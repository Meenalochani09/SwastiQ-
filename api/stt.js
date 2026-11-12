// Browser -> this function -> Gnani Prisma (REST). The API key stays on the server.
const MAX = 3 * 1024 * 1024; // 30 s of 16 kHz mono audio is ~1 MB

async function readBody(req) {
  const chunks = []; let n = 0;
  for await (const c of req) { n += c.length; if (n > MAX) throw new Error('Recording too long'); chunks.push(c); }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GNANI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GNANI_API_KEY is not set on the server' });
  try {
    const audio = await readBody(req);
    if (audio.length < 2000) return res.status(200).json({ transcript: '' });
    const lang = String(req.query.lang || 'indic-auto').replace(/[^A-Za-z,\-]/g, '').slice(0, 40) || 'indic-auto';
    const form = new FormData();
    form.append('audio_file', new Blob([audio], { type: 'audio/wav' }), 'speech.wav');
    form.append('model', process.env.GNANI_STT_MODEL || 'prisma-v3.0');
    form.append('language_code', lang);
    form.append('format', 'transcribe'); // numbers and dates written as digits
    const r = await fetch('https://api.vachana.ai/stt/v3', { method: 'POST', headers: { 'X-API-Key-ID': key }, body: form });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (j.error && j.error.message) || (j.detail && (j.detail.message || JSON.stringify(j.detail))) || j.message || 'Gnani returned ' + r.status;
      return res.status(r.status === 429 ? 429 : 502).json({ error: msg });
    }
    res.status(200).json({ transcript: j.transcript || '', language: j.detected_language_code || null });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Speech service failed' });
  }
};
