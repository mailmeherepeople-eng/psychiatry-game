# Dialogue-writing rules for Jungian Slip

Voice, tone, and style conventions for every case.

## Core principle

Dialogue reads like a person talking, not a clinical vignette. Contractions, interruptions, natural rhythm.

## Hard rules

- **No em dashes** anywhere in user-facing copy: patient dialogue, player choices, UI text. Hard rule, inherited from Chronology. Use commas, periods, or ellipses instead.
- **No unexplained jargon in player choices.** A layperson should understand every option. If a choice uses a clinical term, that term is either common (depression, anxiety, trauma, sleep) or defined in-scene.
- **No capitalized emotion names.** "Patient shows SADNESS" is textbook. Write: "her shoulders drop when you mention her sister."
- **No stage directions inside dialogue.** The patient says what they say. Their behavior is described in the MSE section or in bracketed stage notes attached to the node, not inside their speech.

## Patient voice

- Write like a human under the specific pressure of their condition.
- Age-appropriate register. A 22-year-old student doesn't talk like a 55-year-old accountant.
- Use demographic markers sparingly. A Bengaluru-native character might code-switch naturally; don't caricature.
- Tells are in what they don't say as much as in what they do.
- Every patient has a small verbal tic that's theirs alone (a filler phrase, a way of starting sentences, a stock metaphor they return to). Give each patient one.

## Player voice (the psychiatrist)

- The player character is a thoughtful, curious clinician, not a robot and not a wellness influencer.
- Choices are sentences the player could imagine saying aloud. Not commands. Not meta-descriptions.

Good:
- "Tell me about the last time you felt like yourself."
- "That sounds like a lot to carry alone."
- "Walk me through yesterday morning."

Bad:
- "EXPLORE LOSS OF HEDONIC TONE"
- "Ask about anhedonia"
- "Inquire about social support"

- Range the options across different clinical instincts. One gentle, one direct, one tangential, one "silence" or "let them continue." Each choice is a different way a real psychiatrist might handle this moment.

## Choice design

Each choice in a set should feel like a different clinical instinct, not a different level of correctness. The bad choice isn't bad because it's less clinical; it's bad because it's the wrong instinct for this patient in this moment.

Typical 4-option structure:

1. **Gentle open-ended** — good for rapport, sometimes slow to reveal
2. **Direct and specific** — advances the interview, sometimes costs rapport
3. **Seemingly unrelated** — sometimes the right call; sometimes a detour
4. **Silence / nod / let them continue** — under-used in real practice; sometimes the strongest move

Not every set needs all four. But the range matters. Don't write four versions of the same question.

## Pacing

- Don't make every node a choice. Some nodes are the patient continuing to talk. Use them to let emotional contagion breathe.
- A good case has rhythm: choice, patient response, patient continues, choice, long patient beat, choice, etc.
- Avoid interrogative mode. Two direct questions in a row feels like an interview, not a conversation.

## Lengths

- **Patient line:** typically 1-3 sentences. Occasionally a monologue of 4-6 sentences for important reveals. Never a wall of text.
- **Player choice:** one sentence. Sometimes two. Never a paragraph.
- **Teaching debrief:** 300-400 words. Shown only at end of case.
- **Total dialogue in a case:** aim for playable in 45-60 minutes.

## Dialect and localization

- Default to Indian English where natural. A 22-year-old Bengaluru student saying "I was totally stressing" is fine. A 55-year-old Mumbai doctor saying "what to do, no" is also fine.
- Don't perform Indianness. Don't scrub it away either.
- No regional stereotyping. A patient's regional identity is a detail, not a characterization.
- Keep the game accessible to non-Indian English speakers. If a Hindi or regional word is used, context should carry it.

## Silence and white space

Silence is a tool. A patient who stops mid-sentence and doesn't continue is a teaching moment. The UI should register the silence (pause before choices appear, audio beat, fade). Don't rush past silence.

## When you're stuck

If you can't figure out how a patient would answer a question, write the plainest human version first, then add the one specific distortion their condition creates:

- Depression adds flatness and under-elaboration
- Anxiety adds over-qualification and worst-case branching
- Mania adds speed, tangent, grandiosity, humor
- Psychosis adds oblique reference and structural drift
- ASPD adds too-smooth polish and missing emotional weight
- PTSD adds avoidance, then intrusion, then avoidance again
- Substance use adds minimization and defensive humor

## Things to avoid

- Dialogue that exists only to set up a diagnostic hint (patient would never actually say this)
- Patients who sound like they've read the DSM
- Player choices that are obviously "the right answer" (unless the choice's being obvious is itself the point)
- Mood names inside dialogue ("I feel depressed, doctor")
- Epiphanies delivered by the patient unprompted (patients don't usually hand you the diagnosis)
- "You're the best doctor I've ever had" validation moments for the player

## One test

Read the patient's lines out loud. If they sound like a person you could overhear on a bus or in a waiting room, they're working. If they sound like a textbook vignette, rewrite.
