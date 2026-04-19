# Example: opening of Case 1 (GAD tutorial) — abbreviated

This is not a full case. It's the first few beats of a hypothetical Case 1 draft, showing the rhythm of the format. Use it as a vibe reference when drafting.

Notice:
- Patient sounds like a real 22-year-old, not a textbook
- Choices are things a real psychiatrist might say, not commands
- No em dashes. Ellipses and commas instead
- MSE is implicit in behavior (phone face-down, looking at the window, nervous laugh)
- Rapport changes are small. +1 for attunement. No dramatic swings
- Option 4 in the opening is silence. That's a real option.

---

```yaml
---
id: case-01-gad-tutorial
title: Maya Nair and the 11pm Replay
difficulty: tutorial
condition_key: gad
duration_minutes: 45
case_order: 1
---
```

# Patient profile

**Name:** Maya Nair
**Age:** 22
**Pronouns:** she/her
**Occupation:** final-year BCom student, part-time maths tutor
**Presenting complaint:** "My friend said I should talk to someone because I can't sleep."
**Referral source:** self-referred, pushed by a friend
**Accompanied by:** alone

# Opening scene

Maya is already seated when you enter. Phone face-down on her lap. She looks up, gives a polite half-smile, then looks at the window.

[Emotional contagion active: cool washed palette, fluorescent hum just audible, dialogue reveal at 35ms.]

# Dialogue tree

## Node: opening

Maya: "Hi. Um. Sorry, I don't really know how this works. Is it okay if I just... talk?"

Choices:
1. "Of course. Take your time." → rapport +1, next: node-warmup-a
2. "Tell me what brought you in today." → rapport 0, next: node-warmup-b
3. "Before we start, can you tell me a bit about yourself?" → rapport 0, next: node-warmup-c
4. [nod, stay silent] → rapport +1, flag: comfortable_with_silence, next: node-warmup-a

## Node: node-warmup-a

Maya: "Okay. Um. So my friend Anjali, she's the one who said I should come. I didn't... I mean, I don't think I'm depressed or anything. I just can't sleep. Like, at all. Well, I sleep, but it's... not sleep."

[She laughs a little, looks at her phone, doesn't pick it up.]

Choices:
1. "Walk me through a typical night." → rapport 0, next: node-night-detail
2. "What does Anjali notice that you might not?" → rapport +1, next: node-friend-perspective
3. "When did this start?" → rapport 0, next: node-onset
4. "Not sleep. What does that mean for you?" → rapport +1, next: node-night-detail-deep

## Node: node-night-detail-deep

Maya: "It's like... my body is sleeping. But my brain is just... replaying everything. Like every conversation I had that day. Every email I sent. Everything I might have done wrong. It just loops. It's been happening since like April? Maybe before. I don't know."

[Her hand goes to her hair, then to the armrest, then back.]

Choices:
1. "That sounds exhausting." → rapport +1, next: node-rapport-beat
2. "Are there particular thoughts that come up more than others?" → rapport 0, next: node-content-probe
3. "How is this affecting your days?" → rapport 0, next: node-function
4. "Is there something specific you're worried you did wrong?" → rapport -1, flag: pushed_early, next: node-defensive

[... case continues for ~16 more player choices ...]
```

---

## What this example shows

- **Patient's first line is disarming.** She's apologetic and uncertain. That's already the anxiety presenting.
- **Silence is an option in the first choice.** Players who use silence are rewarded with the same path as the warm verbal option. Teaching: silence is a clinical tool.
- **MSE is in the stage notes.** "phone face-down," "looks at window," "hand goes to her hair, then to the armrest, then back" — all observable, none labeled.
- **Choice 4 at node-night-detail-deep** (asking what she did wrong) is the "pushed_early" flag. It doesn't end the interview. It just damages rapport and sets a flag that gates a later reveal.
- **Tempo builds.** Opening node is measured; by node-night-detail-deep, Maya's speech is speeding up ("like every conversation I had that day. Every email I sent. Everything I might have done wrong. It just loops."). The text reveal speed accelerates with her.

## Things to notice that aren't in the example but would be in a full case

- The hidden backstory (why this specific person is presenting with GAD and not something else)
- The 2-3 branch points (e.g., "push on academic pressure" vs "push on family")
- The differentials at the end
- The teaching debrief

Write those for every case. This fragment just shows the rhythm of opening dialogue.
