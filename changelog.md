# Changelog

Running log of every assistant response in every session. Latest at bottom.
Format: `- YYYY-MM-DD HH:MM — <one-line summary>`

Rule (see CLAUDE.md → Workflow → Changelog): every assistant response appends one line here before yielding. Paste the last N lines into a new session for instant context.

---

## 2026-04-20

- 2026-04-20 09:55 — Session open with "status update"; reported M1 walking skeleton + Case 01 draft + screenshots.
- 2026-04-20 10:00 — Refreshed CLAUDE.md status (MCP + skill + M1 no longer "in progress"; Case 01 awaiting sign-off).
- 2026-04-20 10:10 — Briefed and scoped Phoenix Wright intro + Edgeworth roam clinic (2 nurses, 5 rooms, click+WASD, collision).
- 2026-04-20 10:40 — Built intro (`pw-dialogue.js` + `clinic-intro.js` + CSS) with two-portrait framing, typewriter, skip button.
- 2026-04-20 10:45 — Built roam (`clinic-roam.js` + `clinic-rooms.js` + CSS) with canvas side-view, 5 rooms, waypoint pathing, door fades.
- 2026-04-20 11:00 — Fixed `!important` bug on new screen rules that was hiding title on boot.
- 2026-04-20 11:15 — Tuned walk lane + waypoints so click-to-move routes via the floor lane instead of cutting diagonally through doors / sofas.
- 2026-04-20 11:30 — Wired `exit-to-roam` corner-tab; session state preserved; walking back to Maya resumes case.
- 2026-04-20 11:45 — Case 01 game screen reskinned to PW style: navy dialogue box, gold then blue-pill name tag, serif typewriter, choice buttons.
- 2026-04-20 13:00 — iPhone SE landscape pass (667×375): media queries in `title.css`, `pw-dialogue.css`, `game.css`; corner tabs icon-only on mobile.
- 2026-04-20 13:10 — `capacitor.config.json` + `AndroidManifest.xml` set `sensorLandscape` so device auto-locks landscape.
- 2026-04-20 14:00 — Plan + approval + execution: walk speed bumped to 340 px/s; single-speaker framing (patient right / doctor left / narration centered).
- 2026-04-20 14:15 — Kuroi dropped PW reference screenshots into `references/`; dialogue tuned to match: blue-pill name tag (not gold), thin navy border, clean white text.
- 2026-04-20 14:30 — Feet-only collision first cut (14px rect); pseudo-3D furniture: tilted top faces, side bevel, floor shadow ellipse.
- 2026-04-20 14:45 — Generated 4 SVG character placeholders (doctor, maya, priya, dev) — initial waist-up versions.
- 2026-04-20 14:55 — ntfy: "sprites + depth + collision pass done."

## 2026-04-21

- 2026-04-21 00:00 — Kuroi flagged sprites as torso-only and demanded full-body AAI investigation style; asked for actual references + collision = bottom 1/4.
- 2026-04-21 00:30 — Tried to WebFetch Spriters Resource / Ace Attorney Wiki / Court Records — all 403. Fell back to authoring from training knowledge.
- 2026-04-21 00:40 — Redrew all 4 character SVGs as full-body head-to-feet AAI-style (viewBox 200×500): arms, torso, legs, shoes, faces.
- 2026-04-21 00:50 — Retuned `ROAM_SPRITE` to {w:76, h:190} matching new aspect; dialogue cropped waist-up via `overflow:hidden` + `height:215%` anchor-top.
- 2026-04-21 00:55 — `playerCollider()` now `Math.round(ROAM_SPRITE.h / 4)` tall = 48px feet rect; bottom 1/4 only.
- 2026-04-21 00:59 — Added `window.__showColliders` debug overlay (red = obstacle footprints, green = player feet) to verify collision geometry visually.
- 2026-04-21 01:05 — Playwright audit at 667×375: walked reception → kitchen, bumped into break table; green rect stopped exactly at red footprint edge. Collision rule confirmed correct.
- 2026-04-21 01:10 — Updated CLAUDE.md: `Last updated: 2026-04-21 (v4)`; status section rewritten to include M2 work (intro, roam, sprites, exit, mobile, collision, 3D); added Changelog rule to Workflow section.
- 2026-04-21 01:15 — Created this file (`changelog.md`) at repo root and seeded with the backlog above.
- 2026-04-21 01:20 — End-of-day summary to Kuroi: nothing committed, Case 01 content unchanged, debug flag off by default, Priya's head grazes reception desk edge (flagged for per-scene tuning later), auto-append rule now live.
- 2026-04-23 — Added `lottiefiles-creator` MCP server to `.mcp.json` (`cmd /c npx -y @lottiefiles/creator-mcp@latest`). Restart session to activate.
- 2026-04-23 — Verified Supabase MCP: tools registered and reachable, but all calls return Unauthorized. Root cause: `.mcp.json` references `${SUPABASE_PROJECT_REF}` / `${SUPABASE_ACCESS_TOKEN}` and neither env var is set in the launching shell (no .env in repo). Fix: set both in Windows user env or PowerShell before `claude`.
- 2026-04-23 — Supabase MCP re-checked and now authorized. Project URL `gthsqksuujywpyxxxazu.supabase.co`, migration `20260419161958_init_m1_schema` applied, 6 tables live (cases 2, players 20, sessions 24, session_choices 50, clusters 2, session_snippets 34), RLS enabled on all.
- 2026-04-23 23:04 — User interrupted less-permission-prompts skill before any changes were made; no files modified
- 2026-04-23 23:05 — MCP status check: supabase, playwright, lottiefiles-creator all connected
