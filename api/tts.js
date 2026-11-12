// Page -> this function -> Gnani Timbre (REST). Returns playable audio.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GNANI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GNANI_API_KEY is not set on the server' });
  try {
    const text = String((req.body && req.body.text) || '').slice(0, 500);
    if (!text) return res.status(400).json({ error: 'No text' });
    const r = await fetch('https://api.vachana.ai/api/v1/tts/inference', {
      method: 'POST',
      headers: { 'X-API-Key-ID': key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: process.env.GNANI_TTS_VOICE || 'Nalini',
        model: process.env.GNANI_TTS_MODEL || 'timbre-v2.5',
        language: process.env.GNANI_TTS_LANG || 'en-IN',
        speed: 1.0,
        audio_config: { sample_rate: 48000, num_channels: 1, sample_width: 2, encoding: 'linear_pcm', container: 'wav' },
      }),
    });
    if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gnani returned ' + r.status, detail: t.slice(0, 300) }); }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', r.headers.get('content-type') || 'audio/wav');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buf);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Speech service failed' });
  }
};
