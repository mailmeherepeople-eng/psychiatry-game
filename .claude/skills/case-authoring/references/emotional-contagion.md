# Emotional contagion treatment per condition

The mood of the room matches the patient's condition. This is the primary teaching mechanism. The player should feel the illness before they can name it.

When drafting a case, pick the matching block and adapt it. Principles at the bottom.

---

## Generalized anxiety disorder (GAD) — case 1 tutorial

**Palette:** washed pastels, slightly cool. Think overcast morning under clinic fluorescents.
- Primary background: `#e8ecef`
- Accent: `#c2d4d6` (muted teal)
- Text: `#2a3438` (near-black, soft)
- Warning/tension: `#d4826b` (muted warm)

**Dialogue tempo:** starts measured, accelerates when topics are threatening, sentences interrupt themselves.

**Text reveal speed:** 35ms per character baseline. Accelerates to 20ms during worry cascades.

**Background audio:** very low-volume hum of fluorescent lights. Silence between beats.

**UI quirks:** patient's dialogue box occasionally adds a trailing ellipsis that rewrites itself mid-sentence. On anxious topics, portrait (if present) has a subtle breathing-faster animation.

**Patient voice patterns:**
- Starts answers then trails off
- Self-corrects mid-sentence
- Over-qualifies ("I mean, I don't know if this is weird but...")
- Asks if what they're feeling is normal
- Lists worst-case scenarios unprompted
- Apologizes for taking up time

**Player's felt experience:** slight urge to reassure the patient rather than assess. Resist.

---

## Major depressive disorder — case 2

**Palette:** desaturated, everything slightly darker than feels right.
- Primary background: `#1a1d21` (near-black)
- Accent: `#4a5058` (cool gray)
- Text: `#8a8f96` (low-contrast, deliberately harder to read)
- Highlight: `#6b7480` (barely brighter gray)

**Dialogue tempo:** slow. Long pauses between lines. Sometimes the patient just doesn't answer.

**Text reveal speed:** 80ms per character. Deliberate. Heavy.

**Background audio:** room tone only. Occasional distant traffic. Silence is load-bearing.

**UI quirks:** dialogue box fade-in slower than other cases. Portrait has slightly hunched posture. Choice buttons fade in with a delay that forces the player to sit with silence before they can act.

**Patient voice patterns:**
- Flat, minimal elaboration
- "I don't know" as a frequent answer
- When asked about emotion: names the word, doesn't elaborate
- References things they "used to" do
- Under-reports distress if anything; no self-pity performance
- Sometimes a half-shrug instead of a sentence

**Player's felt experience:** the room feels heavier by the minute. Time dilates. Urge to rescue with chipper questions; resist.

---

## Bipolar I — mania — case 3

**Palette:** bright, almost aggressive.
- Primary background: `#fff8e6` (warm cream)
- Accent: `#ff7043` (bright orange)
- Text: `#1a1a1a`
- Highlight: `#fdd835` (saturated yellow)

**Dialogue tempo:** fast. Patient keeps going. Interrupts the player's internal rhythm.

**Text reveal speed:** 15ms per character. Text sometimes appears in bursts of 5-10 characters at once.

**Background audio:** slightly up-tempo instrumental, volume higher than other cases.

**UI quirks:** patient dialogue box occasionally overflows its normal size. Player's choice timer is shorter (patient gets impatient and starts answering again). Portrait may gesture dramatically.

**Patient voice patterns:**
- Chains topics together without segue (flight of ideas)
- Grandiose statements delivered casually ("so I figured out how to fix the housing crisis last Tuesday")
- Jokes, puns, wordplay
- Interrupts the player's choice prompt occasionally
- Doesn't notice they're talking over the psychiatrist
- Energy reads as contagious and fun early; exhausting and concerning later

**Player's felt experience:** urge to keep pace, to match the energy. The teaching is in noticing the cost.

---

## Schizophrenia / first-episode psychosis — case 4

**Palette:** subtle unease. Colors that are almost normal but slightly wrong.
- Primary background: `#e5e2dc` (warm gray, slightly sickly)
- Accent: `#7a7368` (muted beige)
- Text: `#2a2722`
- Highlight: `#8a6d5c` (dusty rose)

**Dialogue tempo:** uneven. Patient sometimes answers a question three questions back. Sometimes answers a question no one asked.

**Text reveal speed:** variable. Sometimes smooth, sometimes stutters, sometimes a word appears all at once.

**Background audio:** near-silence with occasional subtle audio artifact — a clock slightly off-beat, a distant voice not quite there.

**UI quirks:** occasionally a dialogue box closes mid-line and reopens with something different. Player's choice list occasionally shows a fourth option that fades before it can be selected.

**Patient voice patterns:**
- Loose associations (idea A connects to idea B via tangential link)
- Tangentiality (never quite returns to the question)
- Derailment (starts answering, drifts into unrelated territory)
- Occasional neologism or idiosyncratic word use
- Affect may not match content (flat while describing something frightening)

**Do NOT** write psychosis as stylistic word salad. Real thought disorder has structure; the structure is just not the one the interviewer expects.

**Player's felt experience:** low-grade confusion that builds. Teaching is in the player's growing awareness that they're not sure where they are in the conversation.

---

## Antisocial personality disorder (psychopath case) — case 5

**Palette:** the most "normal" case visually. Looks like a standard clinic. The wrongness is in the patient, not the room.
- Primary background: `#f5f3ee` (standard warm white)
- Accent: `#4a5f7a` (calm blue)
- Text: `#1a1a1a`
- Highlight: `#c9b382` (muted gold)

**Dialogue tempo:** measured, charming, unhurried. Patient is better at this conversation than many of the psychiatrist's actual patients.

**Text reveal speed:** 30ms. Standard. Deceptively so.

**Background audio:** pleasant ambient. Standard clinic.

**UI quirks:** NONE. This is the trick. Every previous case had a tell in the room. This one doesn't.

**Patient voice patterns:**
- Answers every question smoothly
- Mirrors the psychiatrist's energy
- Tells stories that are too clean, too well-structured
- Expresses appropriate emotion on cue; timing is slightly off
- Notices what the psychiatrist values and reflects it back
- Never loses composure
- Describes harm done to others with neutral factual tone

**The hidden lesson:** there is no trauma. Every other case taught the player "find the trauma." This case punishes that learned pattern. The diagnosis isn't made by uncovering a wound; it's made by noticing the absence of friction where there should be some.

**Player's felt experience:** this is the patient you liked. That's the lesson.

---

## Case 6 — substance use OR PTSD (to be decided)

[Kuroi, pick which you want for slot 6 and we define the contagion treatment during case 6 drafting.]

Placeholder principles:

- **Substance use (alcohol):** palette warm but slightly sickly, patient's speech patterns reveal use patterns (morning-drinker rhythms, defensive around time of day questions, minimization language). Shame is a felt texture in the room.
- **PTSD:** palette muted with sudden high-contrast intrusions. Dialogue runs normally until a trigger word, then the patient's text reveal stutters and resets. Silence after. Audio cues include a subtle low rumble that rises during hyperarousal.

---

## Principles

- **Subtle over loud.** The player should feel the condition before they can name it. If they consciously think "the UI is depressive," it's overdone.
- **One distinctive tell per condition.** Don't reuse treatments across cases. Each case has a signature.
- **Audio and silence are as important as visuals.** A well-placed silence teaches depression better than any color.
- **Contagion is felt experience, not caricature.** Depressive patients aren't weeping. Manic patients aren't screaming. The UI does what the patient won't.
- **Every visual choice serves the teaching.** If a palette shift doesn't help the player feel the condition, cut it.
- **The ASPD case teaches via negation.** Having no quirks IS the quirk. Don't "correct" the lack.
