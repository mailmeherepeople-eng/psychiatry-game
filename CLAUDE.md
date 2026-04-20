# CLAUDE.md — Jungian Slip

> Persistent project briefing for Claude Code. Read this at the start of every session.
> Last updated: 2026-04-21 (v4)

## The project

**Jungian Slip** is a Phoenix Wright-style psychiatry dialogue game for mobile. The player is a psychiatrist. Each case is a patient interview where the player chooses dialogue responses to uncover the clinical picture, build rapport, and eventually reach a working diagnosis and plan. The game teaches psychiatry through feel and decision-making, not through quizzes.

Published by **Git Gud** (playgitgudgames.com). App ID: `com.gitgud.jungianslip`. Sibling title: **Chronology** (shipping, `com.gitgud.chronology`).

---

## Core tenets (non-negotiable)

Git Gud makes **educational games that are learn-to-win**. The more you play, the more you learn. The player should never realise they're learning because the game is genuinely fun.

1. **It must be a game.** Not a quiz disguised as a game.
2. **It must be fun.** Someone with zero interest in psychiatry should want to play it.

Every design and implementation decision is checked against these two tenets. If a proposed feature fails either test, don't build it. Surface the concern and ask for direction.

---

## Design principles for Jungian Slip

### The emotional contagion rule (the north star)

The mood of the room should match the patient's condition. This is the primary teaching mechanism.

- Manic patient: upbeat tempo, rapid dialogue, bright palette, the patient cracks jokes, text scrolls faster, music energetic
- Depressive patient: slow tempo, long pauses, muted palette, heavy silences between lines
- Anxious patient: fidgety animations, interrupted dialogue, unstable camera, rising background tension
- Psychotic patient: disorienting UI shifts, unreliable text, ambient wrongness

The player should *feel* the condition before they can name it. That's how psychiatrists recognise illness in real life and it's how the player learns here.

### Patient structure

Every patient has a hidden backstory or trauma that informs their presentation. The player uncovers it through dialogue choices. One case subverts this: the psychopath, where the expected trauma never materialises. That subversion is the lesson — not every disorder is caused by pain.

### Tone mix

Healthy mix of funny, serious, depressing, anxiety-inducing. Matched per case, not uniform across the game. Grounded but stylised. Moments of warmth. No cheap comedy in serious cases, but character tics and human humour are welcome throughout.

### Case design

Realistic enough to teach, dramatic enough to play. Each case has an investigative feel: right dialogue advances, wrong choices stall or damage rapport, great choices unlock deeper layers. Differentials should be reachable, not ambiguous to the point of frustration.

### Target audience

Everyone. First wave will realistically be med students and psychiatry-curious adults, but design for the layperson. No unexplained jargon. A psychiatrist should find it easier, never a prerequisite. Learn to win.

---

## MVP scope

**6 cases at launch:**

1. **Tutorial case** — a lighter, clearly-signalled presentation that teaches the mechanic (an anxiety disorder works well here: player-relatable, rapport and escalation mechanics show cleanly)
2. A mood disorder — depression
3. A mood disorder — mania (paired with #2 so the player feels the contrast)
4. A psychotic disorder
5. A personality disorder — the psychopath / no-trauma surprise
6. A substance or trauma-related presentation

Plus a clinic hub: one nurse, one receptionist, optional colleague. Hub scenes are between-case beats for flavour, continuity, character relationships, and occasional gameplay.

---

## Tech stack

- **Frontend:** Capacitor + HTML/JS/CSS (same stack as Chronology)
- **Backend:** Supabase (auth, saves, analytics, case versioning)
- **Mobile shell:** Capacitor Android first, iOS later
- **Dev server:** http-server on port 3000 against `src/`
- **Testing:** Playwright MCP for visual and flow testing
- **Notifications:** ntfy.sh (see Workflow section)

---

## Project structure

```
psychiatry-game/
├── CLAUDE.md                  ← this file
├── .claude/                   ← agent config (skills, settings)
├── .mcp.json                  ← MCP server config (Supabase + Playwright)
├── src/                       ← source of truth for code
│   ├── index.html
│   ├── js/                    ← engine, state, main, case-loader, mind-palace, notebook, player, supabase-client
│   ├── css/                   ← main, title, game, mind-palace, notebook
│   └── data/cases/            ← case JSON files + author-facing .md companion docs
├── supabase/
│   └── migrations/            ← schema source of truth (see Database rules)
├── www/                       ← build output (gitignored)
├── android/                   ← Capacitor Android project
├── capacitor.config.json
└── package.json
```

Work happens in `src/`. Build output goes to `www/`. `npm run sync` handles the pipeline.

---

## Environment — Windows / PowerShell

This project is developed on Windows PowerShell. Do not use Unix-only commands blindly.

| Need              | Do not use (breaks on PowerShell)       | Use instead                                |
|-------------------|-----------------------------------------|--------------------------------------------|
| HTTP request      | `curl` (aliased to Invoke-WebRequest)   | `curl.exe`                                 |
| Copy files        | `cp -r src/* www/`                      | `xcopy src\* www\ /E /I /Y`                |
| Remove files      | `rm -rf`                                | `Remove-Item -Recurse -Force`              |
| List files        | `ls -la`                                | `dir` or `Get-ChildItem`                   |
| Path separators   | `/` in Windows-command args             | `\` when passing to Windows commands       |

When writing npm scripts or shell commands, default to Windows-native syntax. Scripts in `package.json` use `xcopy`, not `cp`.

Workstation path: `C:\Users\user\Documents\GitHub\psychiatry-game`

---

## Commands

- `npm run dev` — serve `src/` on localhost:3000 and open browser
- `npm run copy` — copy `src/` to `www/`
- `npm run sync` — copy + `npx cap sync` (prepare for device)
- `npm run android` — full pipeline + open Android Studio

---

## Workflow

### Session start: "status update"

When Kuroi types **"status update"** at the beginning of a session, immediately respond with:

1. What was built in the last session (derived from git log and any handoff notes)
2. What is currently in progress (uncommitted changes, TODOs)
3. What was flagged as next
4. Any known issues or blockers

Do not start coding. Wait for direction after the status summary.

### Task execution buckets

**Autonomous execution** — the agent builds, tests, iterates, and reports done:

- UI components, animations, transitions
- Wiring data to views
- Aesthetic matching (screenshot, compare to target, adjust)
- Bug fixes, refactors, performance work
- Test coverage
- Build and deploy plumbing
- **Case drafting** (see Case authoring workflow below)

**Kuroi-gated** — agent drafts or proposes, Kuroi signs off before anything ships:

- Clinical validation of every case
- Major design direction shifts
- Final copy, tone, and character voice

### Case authoring workflow

The goal: Kuroi edits, does not draft from zero. The AI does the creative heavy lifting so the blank page is never the starting point. Clinical accuracy is gated by Kuroi's edit pass.

1. **Brief** — Kuroi gives a case brief: condition, difficulty tier, desired emotional beat, specific teaching point, constraints. Can be a single sentence.
2. **Draft** — Agent writes the full case aggressively and completely:
   - Patient profile (name, age, presenting complaint, demographic detail)
   - Hidden backstory or trauma (or deliberate absence thereof)
   - Mental state exam rendered as observable behaviour, not jargon
   - Full dialogue tree with branches, rapport-affecting choices, and derailments
   - Differential list with the intended correct answer
   - Teaching debrief shown after case completion
   - Notes on the emotional contagion expression (palette, tempo, audio, UI treatment)
3. **Self-review** — Agent reviews its own draft for dialogue quality, tonal match, branch completeness, and consistency with the emotional contagion rule. Flag anything weak before presenting.
4. **Present for clinical edit** — Agent hands the draft to Kuroi. Clinical validation is non-negotiable. Kuroi edits for diagnostic accuracy and clinical realism. The game launches medically accurate.
5. **Revise** — Agent incorporates Kuroi's edits, preserves the creative scaffolding, re-presents.
6. **QA stress-test** — Once Kuroi approves content, agent stress-tests end-to-end: every branch reachable, no softlocks, rapport math works, screenshots match target aesthetic, console clean, timing and animation intact.
7. **Ship** — Case enters the game.

### Self-check loop (for any visual or behavioural change)

1. Make the change in `src/`
2. Run the dev server if not already running
3. Use Playwright MCP to open the game, navigate to the affected screen, take a screenshot
4. Compare the screenshot against the target aesthetic (reference images, Phoenix Wright style, or whatever was specified)
5. If the target is aesthetic-based and no reference exists, web-search for visual references matching Kuroi's description before building
6. Read the browser console for errors
7. Play through the affected branch end-to-end if logic changed
8. Only report "done" after the above passes

### Demo before commit

Never commit mid-feature. Flow:

1. Build
2. Self-check
3. Present screenshot or demo to Kuroi
4. Get explicit approval
5. Commit with a clear message

### Notifications

When a task is fully complete (passed self-check, demoed, ready for review), send a notification via ntfy:

```
curl.exe -d "Jungian Slip: <one-line task summary>" ntfy.sh/ade-maga-jobs-done-agent-time-bitches
```

Then stop. Do not start the next task unprompted.

### Changelog

`changelog.md` at repo root is the running log of every change made in a session.

**Rule:** Every assistant response appends one line to `changelog.md` before yielding. Format:

```
- YYYY-MM-DD HH:MM — <one-line summary of what this response did / changed / concluded>
```

If the response is purely conversational (no code touched, no decisions reached), still append a short note so the timeline doesn't gap. Major changes (ships, structural decisions, new mechanics) additionally update the "Current status" section below.

Kuroi uses `changelog.md` as pasteable context for new sessions — pasting the last ~N lines is faster than re-reading CLAUDE.md.

---

## Writing conventions

- **No em dashes** in any user-facing content (dialogue, UI copy, case text). Hard rule, carried over from Chronology.
- Dialogue reads like a person talking, not a clinical vignette. Contractions, interruptions, natural rhythm.
- UI copy: clear, short, no jargon without grounding.
- Variable and file names: `kebab-case` for files, `camelCase` for JS variables, `SCREAMING_SNAKE` for constants.

---

## Do-nots

- Don't ship a case without Kuroi's clinical sign-off. Drafts are fine. Shipping is gated.
- Don't edit files in `www/` directly. `www/` is generated. Work in `src/`.
- Don't commit without Kuroi's approval on any change beyond trivial.
- Don't install new npm dependencies without flagging them first.
- Don't bypass the self-check loop to move faster. Verification is the job.
- Don't use em dashes in user-facing copy.
- Don't assume Unix shell behaviour. See the Environment section.

---

## Database rules

The agent has write access to the Supabase project `jungian-slip` via MCP. With that power come rules:

1. **Migration files over ad-hoc SQL.** Any schema change creates a file in `supabase/migrations/` with a timestamp and a description. The file is the source of truth. Running raw SQL directly is only for reads and for experimenting — never for durable changes.
2. **No destructive operations without explicit approval.** `DROP`, `TRUNCATE`, and `DELETE` without a `WHERE` clause must be presented to Kuroi as SQL text first. Agent waits for "approved" before running.
3. **Always test on one row first.** Before running an `UPDATE` or `DELETE` on many rows, agent runs the same query with `LIMIT 1` and shows the result.
4. **Production is off-limits.** This project is `jungian-slip` (dev). When we add `jungian-slip-prod` later, the agent has no access to it. Kuroi promotes migrations to prod manually.
5. **Never expose credentials.** Agent does not read or print the contents of `.env`. Agent does not echo the `SUPABASE_ACCESS_TOKEN`, the service role key, or any other secret to the terminal.

---

## About Kuroi

Doctor turned indie game developer. Runs Git Gud solo. Prefers terse communication, complete deliverables, demo before commit, decisions before code. Handles vision, taste, and clinical validation. Claude handles creative drafting, execution, and verification.

---

## Current status

Milestone 2 in flight: Phoenix Wright-style dialogue + Edgeworth-style clinic roam + full-body character sprites. Case 01 still awaits clinical sign-off (content unchanged since M1).

**Done:**
- Scaffold: Capacitor (`com.gitgud.jungianslip`), Android platform, dev server on localhost:3000
- Tooling: ntfy, Claude Code on Max, `.claude/settings.json` permissions, MCP (Supabase + Playwright)
- Supabase: first migration `supabase/migrations/20260419_init_m1_schema.sql` applied, `src/js/supabase-client.js` in place
- `case-authoring` skill committed and in use
- Walking skeleton (M1): title screen, dialogue engine, state, notebook, mind palace, player module
- **Case 01 drafted**: "Maya Nair and the 11pm Replay" (GAD tutorial) — JSON + author `.md`, dialogue tree, differential, debrief. NOT yet clinically signed off.
- **Phoenix Wright intro** (`src/js/pw-dialogue.js`, `src/css/pw-dialogue.css`): two-nurse opening with active/inactive portrait dimming, blue-pill name tag, typewriter, advance indicator
- **Edgeworth-style clinic roam** (`src/js/clinic-roam.js`, `src/js/clinic-rooms.js`): canvas side-view, 5 rooms (reception, corridor, interview room, kitchen, office), click-to-move via waypoints + WASD/arrows, room transitions with fade
- **Full-body SVG character sprites** (`src/assets/characters/`): `doctor.svg`, `maya.svg`, `priya.svg`, `dev.svg` — head-to-feet AAI investigation style. Same SVGs drive both dialogue portraits (cropped waist-up via CSS) and roam sprites (full body on canvas).
- **Case 01 PW reskin**: dark navy dialogue box, yellow gold name-tag → blue-pill name-tag, serif italic narration, speaker portrait on right for patient / left for doctor
- **Exit interview**: corner-tab "Exit" button returns player to the interview room in roam view. Session state persists — walking back to Maya resumes the case at the current node.
- **Feet-only collision** (bottom 1/4 of sprite): `playerCollider()` returns `ROAM_SPRITE.h / 4` tall rect; `obstacleCollider()` returns back-wall floor footprint per obstacle type (depth 26-46px). Head/torso visually overlap furniture; only feet stop. Debug overlay available via `window.__showColliders = true` in DevTools.
- **Pseudo-3D furniture**: each obstacle drawn with tilted top face (parallelogram), left side bevel, front gradient, floor shadow ellipse.
- **Mobile lock**: `capacitor.config.json` + Android manifest set `sensorLandscape`. iPhone SE landscape (667×375) media queries in `title.css`, `pw-dialogue.css`, `game.css` shrink dialogue box, portrait, and corner tabs.
- **Walk speed**: `PLAYER.speed = 340` px/s (1.5× original).
- References from Kuroi stored in `references/` (pasted screenshots of PW courtroom + AAI investigation sprites).

**In progress:**
- Nothing uncommitted. Working tree includes today's changes — awaiting Kuroi's commit approval.

**Next (in order):**
1. Kuroi's visual parity pass against `references/*.png` — iterate until the dialogue and roam both match.
2. Case 01 clinical edit pass (still gated).
3. Case 02 brief (first mood disorder — depression).
4. Walk animation loop (currently static sprite).
5. Real painted room backgrounds (currently gradient).

**Blocked on:** Case 01 clinical sign-off. No technical blockers.