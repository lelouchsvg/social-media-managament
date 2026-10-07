# social-media-managament

## Auto-captioned social clip pipeline

Turns a raw talking-head/voiceover clip into a themed, word-by-word captioned
vertical video ready for TikTok/Reels/Shorts — built from three downloaded
tools in `external-tools/` (gitignored vendor checkouts, not part of this
repo's own code):

```
video.mp4
   │  scripts/transcribe.py  (wraps m-bain/whisperX)
   ▼
captions.json              word-level timestamps, optional speaker labels
   │  content/agents/social-caption-strategist.md
   │  (adapted from msitarzewski/agency-agents, MIT)
   ▼
{ hook, theme, platform }  picks the caption theme + hook line
   │
   ▼
apps/caption-studio/        Remotion app (scaffolded via `create-video`)
   │  npx remotion render src/index.ts CaptionedClip out.mp4 \
   │    --props='{"theme":"<theme>","videoSrc":"<video.mp4>"}'
   ▼
out.mp4                     1080×1920, animated captions burned in
```

### 1. Transcribe

```bash
pip install whisperx
python scripts/transcribe.py video.mp4 -o apps/caption-studio/public/captions.json \
  --model base --device cpu --compute-type int8
# add --diarize --hf-token $HF_TOKEN for speaker labels
```

### 2. Pick a hook + theme

Feed `captions.json` to the `content/agents/social-caption-strategist.md`
prompt (via your LLM of choice) to get back:

```json
{ "hook": "Stop scrolling.", "theme": "bold", "platform": "tiktok" }
```

### 3. Render

```bash
cd apps/caption-studio
npm run dev     # live preview in Remotion Studio
# or render straight to a file:
npx remotion render src/index.ts CaptionedClip out/final.mp4 \
  --props='{"theme":"bold","videoSrc":"../../video.mp4"}'
```

Three caption themes ship out of the box — `bold`, `minimal`, `neon` — in
`apps/caption-studio/src/captions/themes.ts`, loosely modeled on the
palette/typography schema used by heygen-com/hyperframes' `embedded-captions`
skill (`external-tools/hyperframes/skills/embedded-captions/themes/*.json`),
simplified down to what CSS + Remotion's `spring()` can drive directly.

### Repo layout

- `apps/caption-studio/` — the Remotion app (tracked; this is the actual
  deliverable).
- `scripts/transcribe.py` — whisperX wrapper, outputs the JSON schema
  `apps/caption-studio` expects.
- `content/agents/social-caption-strategist.md` — the hook/theme-picking
  agent prompt.
- `external-tools/` — gitignored checkouts of whisperX, hyperframes, and
  agency-agents, kept for reference/inspiration; not part of this project's
  own commits.
