---
name: case-authoring
description: Use whenever Kuroi requests drafting a new patient case for Jungian Slip, editing an existing case, revising a case after clinical review, or opening any file in src/data/cases/. Triggers on phrases like "draft case", "new case", "write a case", "case for [condition]", "revise case", "case NN", "tutorial case", or any request involving patient presentations, dialogue trees, differential diagnoses, hidden backstories, or teaching debriefs. Covers the full case authoring workflow: patient profile, hidden backstory, MSE-as-behavior, ~20-choice branching dialogue tree with 2-3 real branch points, differentials with trap distractors, teaching debrief, rapport scoring, and emotional contagion treatment. Use this skill whenever Kuroi mentions patients, cases, dialogue trees, clinical presentations, psychiatric conditions, or case files, even without the explicit word "draft".
---

# Case Authoring for Jungian Slip

## Purpose

Kuroi edits, does not draft from zero. This skill produces a complete, clinically plausible, dramatically shaped first draft of a patient case so that Kuroi's role is to edit for clinical accuracy rather than invent from a blank page.

A case is one patient encounter: roughly 45-60 minutes of play, around 20 player choices across 2-3 real branch points, starting with the presenting complaint and ending with the player committing to a working diagnosis and plan.

## Non-negotiables from CLAUDE.md

Before drafting anything, the core tenets apply:

1. **It must be a game.** Not a quiz disguised as one.
2. **It must be fun.** Someone with zero interest in psychiatry should want to play.

And the emotional contagion rule: the mood of the room matches the patient's condition. This is the primary teaching mechanism. The player should feel the illness before they can name it.

Clinical accuracy gate: no case ships without Kuroi's clinical sign-off. Drafts are unrestricted. Shipping is gated.

## Case file format

Cases live at `src/data/cases/` as markdown files named `case-NN-slug.md` (e.g., `case-01-gad-tutorial.md`). A build step converts markdown to JSON at ship time.

See `references/case-template.md` for the full blank template. See `assets/example-case.md` for a short worked example showing the rhythm.

A case file contains:

1. YAML frontmatter (id, title, difficulty, condition_key, duration_minutes, case_order)
2. Patient profile
3. Hidden backstory
4. Mental state exam rendered as observable behavior
5. Emotional contagion notes (palette, tempo, audio, UI treatment)
6. Opening scene
7. Dialogue tree
8. Differentials with the intended correct answer and trap distractors
9. Teaching debrief
10. Rapport scoring rules

## Dialogue tree structure

- **Total player choices per case:** ~20
- **Options per choice:** 3-4
- **Real branch points:** 2-3 (where different paths lead to genuinely different scene sequences)

Most choices advance the conversation without branching. The 2-3 branch points split the case into genuinely different paths (e.g., "push on trauma now" vs "build rapport first").

Choices aren't labeled correct/incorrect. Good choices keep the interview alive. Bad choices damage rapport and can lock out later revelations. Wrong answers don't game-over; they make the case harder and sometimes prevent the correct diagnosis from being reachable.

See `references/case-template.md` for the node syntax.

## The authoring workflow

### 1. Receive the brief

Kuroi's brief may be terse. Example: *"draft case 1: anxiety tutorial, 22yo student, GAD, teaching beat is how to ask about worry without leading."*

If something critical is missing (condition, central teaching beat, rough age), ask one focused question. Don't interview exhaustively. Default reasonable values and move.

### 2. Draft the full case

Write every section top to bottom. No skeletons, no outlines. Aim for a case that could be played as-is if Kuroi had no changes.

Pick the matching emotional contagion block from `references/emotional-contagion.md` and adapt. Follow `references/dialogue-rules.md` for voice and style. Use `references/case-template.md` as the structural scaffold.

Specifics:

- **Patient profile:** pick a plausible name, age, occupation, reason for visit. Default to Indian names (Bengaluru/Mumbai-native) unless the clinical presentation calls for something else. Kuroi is in Bengaluru and the target audience includes Indian med students.
- **Hidden backstory:** 100-200 words. Not shown directly to the player — it's the scaffolding that makes the patient's behavior consistent. For the psychopath case (case 5), write "no backstory required" explicitly; the absence IS the lesson.
- **MSE as behavior:** never "patient exhibits flight of ideas." Instead: "she's on her third topic, hasn't paused for breath, keeps noticing your watch and making jokes about time." Show, don't classify.
- **Emotional contagion notes:** specify palette (hex), dialogue tempo, text reveal speed, background audio, UI quirks. See `references/emotional-contagion.md`.
- **Dialogue tree:** patient lines sound like a person with the specific pressure of their condition. Player choices are sentences a real psychiatrist could say aloud.
- **Differentials:** 4-6 total. One intended correct answer. At least one "trap" that a less careful player would settle on. Rule-out distractors fill the rest.
- **Teaching debrief:** 300-400 words. Shown after the case. Explains what the condition was, three or four cues the player should have caught, what the common misread was, and one clinical pearl.
- **Rapport rules:** define thresholds. Gates should feel natural, not punitive.

### 3. Self-review

Run the self-review checklist below. Fix weak spots. Don't hand Kuroi something you know is under-baked. If there's a weakness you can't fix without more input, flag it explicitly in the handoff.

### 4. Present for clinical edit

Present using the handoff format below. Kuroi is the doctor. Clinical accuracy is non-negotiable.

### 5. Revise

Incorporate Kuroi's edits line by line. Preserve dramatic structure and character voice unless Kuroi asks for rewrites. Re-present with a "changes since last version" summary.

### 6. QA stress-test

Once Kuroi approves content, run the QA pass:
- Play through every branch via Playwright MCP
- Verify no softlocks (every node leads somewhere reachable)
- Verify rapport math (thresholds gate as intended)
- Screenshot every major scene; confirm emotional contagion renders
- Check the browser console for errors
- Query Supabase to confirm the case loads correctly post-build

### 7. Ship

Commit the case file with a clear message. Notify via ntfy:

```
curl.exe -d "Jungian Slip: case-NN shipped" ntfy.sh/ade-maga-jobs-done-agent-time-bitches
```

## Self-review checklist

Before presenting any draft, verify:

- [ ] Patient sounds like a person, not a textbook vignette
- [ ] Hidden backstory is coherent and explains the presentation without over-determining it
- [ ] MSE is rendered as behavior, not jargon
- [ ] Emotional contagion treatment is specified concretely (colors, tempo, audio, UI)
- [ ] Dialogue rhythm matches the condition (fast for mania, slow for depression, interrupted for anxiety, off-kilter for psychosis, too-smooth for ASPD)
- [ ] Every branch reaches a conclusion; no orphan nodes
- [ ] The intended correct differential is reachable but requires attention
- [ ] At least one trap differential is plausible but wrong for specific reasons
- [ ] The teaching debrief connects what happened in the interview to what the condition is
- [ ] No em dashes in any user-facing copy
- [ ] Case length is in the 45-60 minute range (~20 choices)
- [ ] A layperson could play without looking up jargon
- [ ] A psychiatrist would find it clinically respectful

If any box is unchecked, fix before presenting or flag the gap.

## Presenting the draft

Handoff format:

```
CASE NN: <title> — draft v1

**What's here:** [2-3 sentence summary of the arc]
**Emotional beat:** [the feeling this case produces]
**Teaching beat:** [what the player walks away having learned]
**Runtime estimate:** [minutes, choice count, branch count]
**Flagged for clinical review:** [specific items least certain — a suspected medication, a subtle symptom call, a diagnostic criterion]

[full case file contents]

**What I want from you:**
1. Clinical accuracy edit (priority; game ships on your sign-off)
2. Character voice changes (name, phrasing, tics)
3. Path adjustments (branch too punishing, reveal too early)
```

Don't pad with preamble. Kuroi is reading to edit.

## Reference files

Read on demand:

- `references/case-template.md` — blank fill-in template for a case file
- `references/emotional-contagion.md` — per-condition UI/audio/tempo treatment
- `references/dialogue-rules.md` — voice, tone, and writing conventions
- `assets/example-case.md` — short worked example showing the format in action

Always consult the reference file rather than working from memory — they contain specifics that matter.

## Never do

- Ship a case without Kuroi's clinical sign-off
- Write MSE findings as jargon (use observable behavior)
- Pad a case to hit the 20-choice count; prefer fewer, better choices
- Recycle names across cases
- Use em dashes in patient dialogue, player choices, or UI copy
- Invent medications or dosages; when a medication is needed, use a common generic (sertraline, lorazepam, risperidone, lithium, haloperidol) and flag for Kuroi's confirmation
- Describe psychosis as stylistic word salad; real thought disorder is loose associations, tangentiality, and derailment
- Write the psychopath case with childhood trauma; the absence IS the lesson
- Make the "correct" differential trivially obvious; teaching requires some work from the player
- Skip the self-review checklist to move faster; verification is the job
