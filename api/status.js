// Tells the page which features are available. Never returns the key itself.
module.exports = (req, res) => {
  const hasKey = !!process.env.GNANI_API_KEY;
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    stt: hasKey,
    tts: hasKey,
    alerts: false, // Vercel functions cannot hold WebSocket connections
    state: !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL),
  });
};
