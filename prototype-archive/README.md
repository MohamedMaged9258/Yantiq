# `prototype-archive` — the original UI prototype

**This is archived reference material, not production code.** It is kept as a source of
general design inspiration per
[`../docs/phase-0-baseline.md`](../docs/phase-0-baseline.md) §15.3. Nothing here ships.

## What it actually is

A pure front-end mock: vanilla JavaScript ES modules + Vite 5 + Tailwind 3, built as a
multi-page app with 16 HTML entry points, styled to look like a phone screen in a browser.
Roughly 7,500 lines across 45 source files.

**There is no server.** `client/` and `shared/` are the only directories; the `server/` that
`shared/types/index.js` refers to was never written. Every API call is faked in memory by
`client/src/js/utils/api.js`, which says so in its own header comment. `client/src/pages/admin.html`
renders a "no backend is running" notice.

```
prototype-archive/
  client/
    index.html                landing / splash
    vite.config.js            16 HTML entry points
    tailwind.config.js        brand tokens
    public/                   manifest.json, sw.js, icons
    src/
      css/main.css            the design system (~668 lines)
      js/
        modules/              auth, badges, dashboard, progress,
                              pronunciation, quiz, rewards
        utils/                animations, api (mock), router, storage
      pages/                  16 screens
  shared/
    constants/arabic.js       alphabet, tashkeel, levels, words, badges
    types/index.js            JSDoc typedefs only
```

`node_modules/` and `dist/` are present on disk but no longer tracked in git — they were
committed by mistake before the ignore rules took effect.

## Worth reusing

- **`client/src/css/main.css` and `client/tailwind.config.js`** — the colour, typography and
  radius token system (primary `#0A5744`, gold `#D4940E`, Amiri / Fredoka / Nunito). Portable
  to NativeWind for the mobile app or straight into the admin portal.
- **`shared/constants/arabic.js`** — the 28-letter alphabet table with names, sounds and dot
  positions, the 8 tashkeel marks, and the common-words list. Real content, and a reasonable
  seed for the curriculum the administrator will author.
- **`client/src/js/modules/pronunciation.js`** (the recording section) — the MediaRecorder +
  AnalyserNode capture-and-waveform pattern, including MIME-type negotiation, is a sound
  reference for the React Native audio module.
- **`client/src/pages/*.html`** — useful as UX reference for the screen navigation map
  (Diagram 17 in [`../docs/architecture/diagrams.md`](../docs/architecture/diagrams.md)),
  bearing in mind the map has since split into a mobile app and a separate admin portal.

## Never copy

These are not stylistic preferences — each one violates the baseline directly.

| In the prototype | Why it must not survive |
|---|---|
| `client/src/js/utils/api.js` invents a score with `Math.random()` and sets `passed` from it; `modules/pronunciation.js` does the same as an "offline simulation" | §9.1 and §9.4: the app renders backend results and never invents scoring rules |
| `modules/quiz.js` computes stars and pass/fail client-side from hardcoded cutoffs | §3 and §9.1: thresholds and reward values are admin-configured and backend-applied |
| `modules/pronunciation.js` sets `transcribedText` to the expected answer | A fake transcription that always matches — it hides every real failure |
| Five levels, in two mutually inconsistent lists (`shared/constants/arabic.js` and the mock API) | §3: the curriculum is four levels, with an `Exercise` tier below `Lesson` |
| `utils/storage.js` persists an `accessToken` in `localStorage` and treats its presence as "authenticated" | §6.1: authentication is a Firebase ID token verified server-side, and presence of a token is not authorization |
| Streak tracking (`streakDays`, `longestStreak`) | §2.3: daily streak pressure mechanics are deferred |
| `client/index.html` carries a "Powered by Anthropic AI" line | Factually wrong — the model is a fine-tuned Wav2Vec2-BERT. Must not reach a demo |

## Running it

Not required for any Yantiq workflow, but if you want to look at the screens:

```bash
cd prototype-archive/client
npm install
npm run dev
```
