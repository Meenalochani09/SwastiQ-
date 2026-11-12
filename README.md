# SwastiQ on Vercel

Voice-first community health register. Speech recognition by Gnani Prisma, spoken read-back by Gnani Timbre.

```
public/index.html   the app (static)
api/status.js       tells the page whether Gnani is connected
api/stt.js          microphone audio -> Gnani Prisma -> text
api/tts.js          text -> Gnani Timbre -> audio
api/state.js        optional cloud backup of each device's data
```

## Deploy

1. Put this folder in a GitHub repository (or run `npx vercel` inside it).
2. In Vercel: **Add New > Project**, import the repository. Framework preset: **Other**. Leave build settings empty.
3. Before the first deploy, open **Environment Variables** and add:
   - Name: `GNANI_API_KEY`
   - Value: your Gnani API key
   - Environments: Production, Preview and Development
4. Click **Deploy**. Open the site, go to **Voice**. A green "Live voice" card means Gnani is connected.

If you added the key after deploying: Settings > Environment Variables, then **Deployments > Redeploy**. Variables only apply to new deployments.

The key lives only in Vercel. It is never in the page, the zip or the browser.

## Test on your computer (http://localhost:8000)
```
cp .env.example .env.local      # then put your key in .env.local
node local-server.js
```
Windows: use `copy` instead of `cp`. No Vercel login is needed for this.

## Optional settings (environment variables)
| Name | Default | Purpose |
|---|---|---|
| `GNANI_STT_MODEL` | `prisma-v3.0` | Speech model |
| `GNANI_TTS_MODEL` | `timbre-v2.5` | Voice model |
| `GNANI_TTS_VOICE` | `Nalini` | Voice name from Gnani's voice catalog |
| `GNANI_TTS_LANG` | `en-IN` | Language of the read-back |

## Optional: keep data across devices
Without this, records stay on each device (the app still works offline). To also back them up:
Vercel project > **Storage** > add an **Upstash Redis** database and connect it to the project. Redeploy. Nothing else to configure.

## Limits on Vercel
- Each voice clip is limited to 30 seconds by Gnani's REST API. The app stops recording at 28 seconds, or after a pause.
- Live alerts between different workers' phones need a WebSocket server, which Vercel does not run. Alerts still appear, sound and speak on the device that records the visit.
- Gnani may allow only one active request at a time per account. If you see "rate limited", wait a moment and try again.
