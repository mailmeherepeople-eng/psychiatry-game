# Case file template

Copy this template, fill every field, save as `src/data/cases/case-NN-slug.md`.

---

```yaml
---
id: case-NN-slug
title: <short human title>
difficulty: tutorial | easy | medium | hard
condition_key: gad | mdd | bipolar-mania | schizophrenia | aspd | ptsd | substance
duration_minutes: 45
case_order: N
---
```

# Patient profile

**Name:**
**Age:**
**Pronouns:**
**Occupation:**
**Presenting complaint (one sentence):**
**Referral source:** (self-referred, GP, family pressure, emergency, etc.)
**Accompanied by:** (alone, family member, partner, etc.)

# Hidden backstory

[100-200 words. Not shown to the player directly. Scaffolding for consistent patient behavior. Describe formative experiences, how this condition emerged, key people, core beliefs the patient holds about themselves and the world.]

[For case 5 (psychopath): write "No backstory required. The absence IS the lesson." Do not invent trauma.]

# Mental state exam (rendered as behavior)

**Appearance:** [what the player sees when the patient walks in or is seated]
**Behavior:** [what the patient does during the interview: eye contact, fidgeting, posture changes, gestures]
**Speech:** [rate, rhythm, volume, coherence — described as what you'd hear in the room]
**Mood and affect:** [what the patient reports feeling vs what their affect shows]
**Thought form:** [described as how they talk, not classified]
**Thought content:** [described as what they bring up, not diagnosed]
**Perception:** [any hallucinations or perceptual disturbances, described as what the patient says or does]
**Cognition:** [orientation, memory, attention — described functionally]
**Insight and judgment:** [how they understand their situation]

# Emotional contagion notes

**Palette:** [3-5 hex colors specific to this case]
**Dialogue tempo:** [fast / slow / erratic / measured / uneven]
**Text reveal speed:** [ms per character, or descriptive keyword]
**Background audio:** [ambient description or "silence"]
**UI quirks:** [case-specific UI treatments: shake, fade, color shift, overflow, etc.]
**Portrait cues (if portraits exist):** [posture, breathing rhythm, gaze direction]

# Opening scene

[First 3-5 lines of the case. Establishes tone. Is the patient already in the room? Does the nurse bring them in? Set the emotional contagion from the first beat. This is where the player is taught how to feel before they're taught what to do.]

# Dialogue tree

Nodes use this syntax:

## Node: <node-id>

<Patient speaks or acts. Keep to 1-3 sentences. Occasionally a monologue of 4-6 for important reveals.>

[Optional: stage note in brackets — what the patient does while speaking or while waiting]

Choices:
1. "<player line>" → rapport +N, [flag: <flag_name>,] next: <node-id>
2. "<player line>" → rapport 0, next: <node-id>
3. "<player line>" → rapport -N, next: <node-id>
4. [silence / nod / let them continue] → rapport +N, next: <node-id>

## Node: <next-node-id>

[... continue for all nodes ...]

Guidance:
- Most nodes are just the patient continuing (no choices) to let emotional contagion breathe
- 2-3 branch points where different paths lead to genuinely different subsequent node sequences
- Every ending node must be reachable from the opening
- Name endings like: `ending-correct-diagnosis`, `ending-missed-diagnosis`, `ending-patient-walked-out`, `ending-insufficient-rapport`

## Node: ending-<variant>

[Patient's final line or behavior.]

Outcome: [short description of what the player achieved or missed]

→ go to: debrief

# Differentials

- **[intended correct diagnosis]** — why this is right for this patient specifically
- **[trap differential 1]** — why a less careful player would land here; why it's wrong for this case
- **[trap differential 2]** — plausible but wrong
- **[differential 3]** — less plausible but worth ruling out
- **[differential 4]** — rule-out distractor

# Teaching debrief

[300-400 words shown after the case ends, regardless of outcome.]

**What was going on:** [plain-language description of the condition and this patient's presentation]

**Three or four cues the player should have caught:**
1. [specific behavior the patient showed and what it means]
2. [specific behavior and what it means]
3. [specific behavior and what it means]

**Common misread:** [what the trap differential looks like, why careful players avoid it, what distinguishes the correct answer from the trap]

**Clinical pearl:** [one memorable takeaway the player carries into the next case]

# Rapport scoring rules

**Starting rapport:** 0

**Thresholds:**
- Rapport ≥ N: unlocks <specific node or reveal>
- Rapport ≤ -N: patient becomes guarded; specific nodes become unreachable
- Rapport ≤ -N: patient ends the interview; case ends in failure

**Case-specific rules:**
- [any patient-specific rapport logic — e.g., asking about trauma too early costs -2 if rapport < 2, costs 0 if rapport ≥ 2]

# Build notes

[Optional: any notes for the agent running QA — specific branches to screenshot, specific Supabase fields to verify, specific Playwright assertions.]
