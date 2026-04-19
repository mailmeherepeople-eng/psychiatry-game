---
id: case-01-gad-tutorial
title: Maya Nair and the 11pm Replay
difficulty: tutorial
condition_key: gad
duration_minutes: 45
case_order: 1
---

# Patient profile

**Name:** Maya Nair
**Age:** 22
**Pronouns:** she/her
**Occupation:** final-year BCom student, part-time maths tutor
**Presenting complaint:** "My friend said I should talk to someone because I can't sleep."
**Referral source:** self-referred, pushed by a friend
**Accompanied by:** alone

# Hidden backstory

Maya is the eldest of three in a Bengaluru family where her father, a mid-level IT manager, measures every month against the next one. She has always been the "steady" child. She cleared her 12th board with distinction, landed a BCom seat that matters to her parents more than it matters to her, and has kept a 9 CGPA without anyone seeing her work for it. Her mother is warm and anxious; her father is warm when things are going well and silent when they are not. Maya's younger brother dropped a year for NEET prep last year, which was taken by the family as a minor tragedy, and Maya has privately decided that nobody gets to be a tragedy twice in one house. Worry is not new for her. It was a background hum through school. It started to cost her sleep around April, when placement season opened and she took on a second tutoring child to "keep busy." She has told no one how bad it is. Her friend Anjali noticed the tired eyes and won't let it go.

# Mental state exam (rendered as behavior)

**Appearance:** neatly dressed, kurta and jeans, hair tied back. Eyes look tired. No makeup today. Phone face-down on her lap from the start.
**Behavior:** polite. Eye contact in flashes, then to the window. Shifts in her chair. One hand migrates between her hair, the armrest, and the corner of her dupatta. Apologizes for small things ("sorry, I'm rambling").
**Speech:** measured at first. Speeds up when the topic is placements, tutoring, or anything her parents might say. Sentences self-correct. Trails into qualifiers ("I mean, I don't know if this is weird but").
**Mood and affect:** reports "fine, mostly." Affect is attentive but guarded; no smiling during the interview except once, briefly, when she mentions Anjali.
**Thought form:** linear. Ideas connect cleanly. Occasional over-explanation loop where she circles a worry and comes back to it.
**Thought content:** worry about placements, worry about tutoring families, worry about her parents noticing, worry about whether being here is overreacting. No suicidal ideation elicited without asking. No delusional content. No obsessions in the OCD sense.
**Perception:** no hallucinations. No depersonalization reported.
**Cognition:** alert, oriented, attention intact. She is tired but present.
**Insight and judgment:** good insight that something has shifted. Mild denial about severity ("it's nothing serious"). Judgment intact.

# Emotional contagion notes

**Palette:** cool washed pastels. Overcast-morning-under-fluorescents feel.
- Primary background: `#e8ecef`
- Accent: `#c2d4d6` (muted teal)
- Text: `#2a3438`
- Warning/tension: `#d4826b`

**Dialogue tempo:** starts measured, accelerates on threatening topics, sentences interrupt themselves.
**Text reveal speed:** 35ms per character baseline. Accelerates to 20ms during worry cascades.
**Background audio:** low-volume fluorescent hum. Silence between beats.
**UI quirks:** dialogue box occasionally adds a trailing ellipsis that rewrites itself mid-sentence. Portrait has a subtle faster-breathing animation on anxious topics.
**Portrait cues:** silhouette color `#9ba5b3` (cool gray-blue). Shoulders slightly forward. Not slumped. Alert.

# Opening scene

Maya is already seated when the player walks in. Phone face-down on her lap. Hair tied back. A polite half-smile, then she is looking at the window.

Somewhere in the ceiling a fluorescent light is humming in a key nobody can name.

# Dialogue tree

## Node: opening

Maya: "Hi. Um. Sorry, I don't really know how this works. Is it okay if I just... talk?"

Choices:
1. "Of course. Take your time." → rapport +1, next: warmup
2. "Tell me what brought you in today." → rapport 0, next: warmup
3. "You sound nervous. That's okay." → rapport -1, flag: named_it_too_early, next: warmup
4. [Nod. Stay silent.] → rapport +1, flag: comfortable_with_silence, next: warmup

## Node: warmup

Maya: "Okay. Um. So my friend Anjali, she's the one who told me to come. I didn't... I mean, I don't think anything's wrong exactly. I just haven't been sleeping. Like, at all. Well, I sleep. But it's... not sleep."

[Her hand goes to her hair, then to the armrest.]

Choices:
1. "Not sleep. What does that mean for you?" **[snippet trigger for s1]** → rapport +1, next: sleep_detail
2. "When did this start?" → rapport 0, next: sleep_detail
3. "What does Anjali notice that you might not?" → rapport +1, next: sleep_detail
4. "Okay, we can probably fix this with better sleep hygiene." → rapport -2, flag: played_expert, next: sleep_detail

## Node: sleep_detail

Maya: "It's like my body is sleeping."

"But my brain is just replaying everything." **[snippet s1]**

"Every conversation I had that day. Every email I sent. Everything I might have done wrong. It just loops."

"It's been happening since April." **[snippet s2]** "Maybe before."

"I'm awake at eleven, or three, or both." **[snippet s3]**

Choices:
1. [Let her keep going.] → rapport 0, next: brain_loops
2. "That sounds exhausting." → rapport +1, next: brain_loops
3. "You said every email. That's a lot of replay." → rapport +1, next: brain_loops

## Node: brain_loops

Maya: "I keep thinking, what if I sent it too casual. What if the reply comes tomorrow and it's bad."

"Every email I sent. Everything I might have done wrong." **[snippet s4]**

"And then what Anjali will say if I'm late again." **[snippet s5]**

"And then my tutoring families. And then I'm back to the emails."

[Her speech is noticeably quicker here. The UI reveal accelerates.]

Choices:
1. "Is there one worry that comes up more than the others?" → rapport 0, next: function_probe
2. "When your mind loops like that, does it ever stop?" → rapport +1, next: function_probe
3. "What happens in your body when this is happening?" → rapport +1, flag: asked_about_body, next: function_probe
4. "Have you tried not thinking about it?" → rapport -2, flag: dismissed, next: function_probe

## Node: function_probe

Maya: "It's affecting things."

"I dropped two of my tutoring kids last week." **[snippet s9]**

"I couldn't face telling their parents in person. I did it over WhatsApp. I'm behind on a project submission."

"I left a paper half-done because I couldn't focus." **[snippet s10]**

"I don't know. I feel like I'm the kind of person who doesn't do this."

Choices:
1. "What does 'the kind of person who does this' look like to you?" → rapport +1, next: physical_symptoms
2. "That must be hard when you're used to coping." → rapport +1, next: physical_symptoms
3. "Dropping the tutoring sounds responsible, actually." → rapport 0, next: physical_symptoms
4. "How are your parents taking it?" → rapport 0, flag: family_probed_early, next: physical_symptoms

## Node: physical_symptoms

Maya: "There's this... my chest gets tight. Like I can't pull a full breath. Mostly when I'm checking my inbox. My hands go kind of numb sometimes. I thought it was like a heart thing, so I looked it up. The internet was not helpful."

[Nervous laugh.]

[Snippets captured: s7, s8]

Choices:
1. [Let the moment breathe.] → rapport 0, next: trigger_branch
2. "Looking it up at three AM is a special kind of hell." → rapport +1, next: trigger_branch
3. "Have you had anyone check your heart?" → rapport 0, next: trigger_branch

## Node: trigger_branch

**[BRANCH POINT 1]**

Maya: "I don't know why I'm like this. It's not like I have big problems. Some people have actual things going wrong. I just have... the usual things. Placements. My mum. The usual things."

Choices:
1. "Tell me about placements." → rapport 0, next: academic_beat_1
2. "Tell me about your mum." → rapport 0, next: family_beat_1
3. "You said 'some people have actual things.' What counts as actual?" → rapport +1, flag: caught_minimization, next: minimization_insight
4. "You're probably just stressed about exams." → rapport -3, flag: dismissed_hard, next: uncomfortable

## Node: academic_beat_1

Maya: "Placement season started in April. Everyone's got a plan. I don't. My CGPA is fine but that's not enough now. And I keep thinking, what if I freeze in an interview. What if I'm not good enough for placements and I end up sitting at home while everyone else is... you know."

Choices:
1. "What would that mean to you? Sitting at home?" → rapport +1, next: academic_beat_2
2. "Have you had an interview yet?" → rapport 0, next: academic_beat_2

## Node: academic_beat_2

Maya: "One. Last week. I don't know how it went. I keep replaying it. They asked me about teamwork and I said this thing about group projects and I don't know if it landed. I've been checking my email since Thursday."

[The phone is still face-down. Her thumb moves across it anyway.]

Choices:
1. [Say nothing.] → rapport 0, next: trigger_merge
2. "Checking your email for four days is its own kind of marathon." → rapport +1, next: trigger_merge

## Node: family_beat_1

Maya: "My mum is... she's fine. She's kind. She worries. My dad doesn't say much. He didn't speak to my brother for like a week when he dropped a year. I think about that sometimes."

Choices:
1. "What do you think about when you think about that?" → rapport +1, next: family_beat_2
2. "Does your mum know you're here today?" → rapport 0, next: family_beat_2

## Node: family_beat_2

Maya: "I haven't told her. I just think... I'm the one who doesn't drop anything. That's my whole thing. I'm not allowed to."

[Long pause. She looks at the window.]

Choices:
1. [Stay with the silence.] → rapport 0, next: trigger_merge
2. "Nobody tells you that out loud, do they." → rapport +1, next: trigger_merge

## Node: minimization_insight

Maya: "I don't know. Actual things are like, cancer. Or someone died. Or you didn't have food growing up. I had food. I have a BCom seat. I don't get to be sitting here."

Choices:
1. "You're here though. What brought you past that thought?" → rapport +1, next: trigger_merge
2. "Being here doesn't require permission from how bad it is." → rapport +1, next: trigger_merge
3. "Tell me about placements." → rapport 0, next: academic_beat_1

## Node: trigger_merge

Maya: "Sorry. I haven't actually talked about any of this to anyone. It feels weird to hear it out loud."

Choices:
1. "It's supposed to feel weird. That means it's working." → rapport +1, next: safety_check
2. "Take your time." → rapport +1, next: safety_check
3. "Let me ask you a harder question." → rapport 0, next: safety_check

## Node: safety_check

[Player screens for self-harm. This beat exists regardless of path.]

Maya: "I... no. No, nothing like that. I just want to sleep. I get frustrated with myself for not being able to, like, get it together. But not... not that."

Choices:
1. "Thanks for being honest with me about that." → rapport +1, next: mood_screen
2. "Have you ever felt that way, even briefly?" → rapport 0, next: mood_screen
3. "Do you have people around you?" → rapport +1, next: mood_screen

## Node: mood_screen

[Player screens for depression to rule out MDD.]

Maya: "I mean, I'm tired all the time, yeah. Food is whatever. I'm not... sad, exactly? Like I can still laugh at things with Anjali. I went to a wedding two weeks ago and I actually had fun, for like three hours. I think I'm just wound."

Choices:
1. "Wound. That's a good word for it." → rapport +1, next: diagnostic_framing
2. "When you say tired, do you mean sleepy tired or can't-get-up tired?" → rapport +1, next: diagnostic_framing
3. "What do you enjoy, when your brain isn't looping?" → rapport +1, next: diagnostic_framing

## Node: diagnostic_framing

**[BRANCH POINT 2]**

Maya: "So. What is it. Is something wrong with me."

[She asks this lightly. She's been waiting the whole hour.]

Choices:
1. "I think what you're describing is anxiety. The kind that runs constantly, in the background. It's very common and it's treatable." → next: ending_correct_gad
2. "It sounds like you might be depressed. I'd like to talk about that." → next: ending_missed_mdd
3. "I'd want to rule out some physical things before giving this a name." → rapport -1, flag: over_cautious, next: ending_correct_gad
4. "Honestly, I think you're stressed about exams. It'll pass." → rapport -4, next: ending_walkout

## Node: uncomfortable

Maya: "Maybe. Yeah. Um. Sorry, I think I'm wasting your time. This was... a bad idea. I'll figure it out."

[She's reaching for her phone now. The polite half-smile is back, tighter.]

Choices:
1. "Please stay. I hear I just missed it. Can I try again?" → rapport +2, next: trigger_branch
2. "I don't think this is a waste of time. Sit with me another minute." → rapport +1, next: trigger_branch
3. "Okay. Think about coming back." → next: ending_walkout

## Node: ending_correct_gad

Maya: "Anxiety. Okay. That actually... that makes sense. I think I'd been making up worse things in my head."

[Her shoulders drop a centimetre. It's small.]

"What do I do with it?"

**Narration:** You explain the plan. A trial of a low-dose SSRI if she's open to it. Cognitive therapy referral. Sleep hygiene that doesn't pretend this is just about sleep. She nods through it. When you're done, she picks up her phone and puts it in her bag.

"Same time next week?"

Outcome: Working alliance. Diagnosis named. Plan accepted.

**Ending:** `ending_correct_gad` — "Named and Held"

## Node: ending_missed_mdd

Maya: "Depressed. I mean. Maybe? I don't feel depressed. I feel wound up. But you're the doctor."

**Narration:** You go on to discuss depression. She agrees politely to an SSRI. She's agreeing to anything now; she stopped pushing back two questions ago. She leaves with a prescription and a follow-up card. She will take the medication. It may even help. But she walked out of this room still believing her worry is just who she is, and the part of her that replayed every email at 3 AM will do so again tonight.

Outcome: Diagnosis missed. Treatment offered, relationship intact, teaching moment lost.

**Ending:** `ending_missed_mdd` — "Close, Not Right"

## Node: ending_walkout

Maya: "Yeah, okay. Thank you for your time."

[She's already standing. The phone is in her hand now.]

**Narration:** She walks out. At the reception desk she doesn't book another appointment. Anjali will ask how it went and Maya will say it was fine. She will not come back this year.

Outcome: Patient lost. Rapport damage was too much to recover.

**Ending:** `ending_walkout` — "She Left"

# Differentials

- **Generalized anxiety disorder (GAD)** — intended correct. 6+ months of excessive worry that is hard to control, somatic symptoms (chest tightness, dysnea, paresthesias), sleep onset/maintenance issues, impairment in role functioning, no major depressive episode, no panic attacks discrete enough to qualify as panic disorder.
- **Major depressive disorder** — trap. She IS tired and functioning is down. A less careful player hears "can't sleep, dropped responsibilities, tired" and anchors on depression. Distinguishing features: she retains interest and pleasure (wedding, Anjali), her low mood is not sustained, her cognition is worry-dominated rather than ruminative/hopeless, appetite is normal.
- **Adjustment disorder** — plausible rule-out. Placement season is an identifiable stressor. Ruled out by duration (symptoms predate the acute stressor; hum of worry throughout school) and severity criteria.
- **Panic disorder** — rule-out distractor. The chest tightness and paresthesias could suggest this. But the episodes are not discrete panic attacks with abrupt onset; they're slow-burn somatic anxiety tied to checking behavior.
- **Hyperthyroidism** — medical rule-out. Worth screening with a TSH given palpitations, weight changes, and sleep disruption. "Over_cautious" flag reflects this being a responsible step but delaying a working diagnosis.

# Teaching debrief

**What was going on:** Maya has generalized anxiety disorder. Her worry runs continuously, spans multiple domains (placements, tutoring, family), and is hard to switch off. Her body is participating: sleep-onset insomnia, chest tightness when she checks her inbox, paresthesias in her hands. She's been this way for months, and placement season pushed a latent pattern into clinical territory.

**Three cues the player should have caught:**

1. **The worry content was broad, not focused.** She wasn't ruminating on one thing. She was looping across emails, Anjali, her tutoring families, her mother, her future. That breadth is GAD's signature. MDD ruminates. OCD obsesses on specific themes. GAD runs wide.

2. **The physical symptoms tracked the worry, not the body.** Chest tight when checking email. Hands numb when the replay is at its worst. These are somatic anxiety, not cardiac events, not panic attacks with discrete onset.

3. **She still had pleasure.** The wedding. Anjali. A brief smile. This is the cleanest separator from depression. A depressed Maya would have reported the wedding as exhausting or meaningless. Wound-up Maya had fun for three hours.

**Common misread:** Calling this depression because she's tired and dropped responsibilities. The shape is wrong. Depressed patients lose interest; anxious patients lose sleep. Both are impaired. One is paralyzed by emptiness, the other by too much signal.

**Clinical pearl:** When a young adult says "my brain won't stop replaying," you are not hearing insomnia. You are hearing the anxiety under it. Treat the worry. Sleep comes back.

# Rapport scoring rules

**Starting rapport:** 0

**Thresholds:**
- Rapport ≥ 3: Maya opens the minimization_insight path naturally.
- Rapport ≤ -3: Maya's `uncomfortable` branch activates on the next mis-step.
- Rapport ≤ -4 at diagnostic_framing: only walkout ending is reachable.

**Case-specific rules:**
- Naming anxiety too early (opening node 3) costs -1 and sets `named_it_too_early`. Does not block the correct ending but reduces rapport buffer.
- Dismissing her worry ("have you tried not thinking about it") always costs -2 and sets `dismissed`.
- The "stressed about exams" dismissal at trigger_branch is the hardest bad move: -3 rapport, routes to `uncomfortable`, and can collapse the case if she walks.

# Build notes

- Snippets expected in Mind Palace after a full good playthrough:
  - s1 "My brain is just replaying everything."
  - s2 "It's been happening since April."
  - s3 "I'm awake at eleven, or three, or both."
  - s4 "Every email I sent. Everything I might have done wrong."
  - s5 "What Anjali will say if I'm late again."
  - s7 "My chest gets tight. Like I can't pull a full breath."
  - s8 "My hands go kind of numb sometimes."
  - s9 "I dropped two of my tutoring kids last week."
  - s10 "I left a paper half-done because I couldn't focus."
- Natural Mind Palace clusters the player might form:
  - Rumination (s1, s2, s3)
  - Worry content (s4, s5)
  - Somatic (s7, s8)
  - Function loss (s9, s10)
- Playwright QA: verify reaches ending_correct_gad via good choices, ending_missed_mdd via choice 2 at diagnostic_framing, ending_walkout via choice 4 at trigger_branch.
