// Opening dialogue that plays before the player enters the clinic roaming view.
// Establishes the setting, introduces the nurses, and motivates the interview.

export const INTRO_CHARACTERS = {
  'nurse-priya': {
    name: 'Priya',
    label: 'Priya\nHead Nurse',
    color: '#3a7b7b',
    sprite: 'assets/characters/priya.svg',
  },
  'nurse-dev': {
    name: 'Dev',
    label: 'Dev\nNurse',
    color: '#b84a6a',
    sprite: 'assets/characters/dev.svg',
  },
};

export const INTRO_SCRIPT = [
  { speaker: 'narration', text: 'A small psychiatry clinic. Monday morning.', location: 'reception' },
  { speaker: 'narration', text: 'Your first day.' },
  { speaker: 'nurse-priya', show: ['nurse-priya', 'nurse-dev'], text: "Morning, Dev. You're early." },
  { speaker: 'nurse-dev',   show: ['nurse-priya', 'nurse-dev'], text: "Couldn't sleep. The new doctor starts today." },
  { speaker: 'nurse-priya', show: ['nurse-priya'],              text: "Maya's already in the interview room. Came in half an hour early." },
  { speaker: 'nurse-dev',   show: ['nurse-dev'],                text: "Half an hour? Is she okay?" },
  { speaker: 'nurse-priya', show: ['nurse-priya', 'nurse-dev'], text: "She's Maya. She's been rehearsing what to say since she got here." },
  { speaker: 'nurse-dev',   show: ['nurse-priya', 'nurse-dev'], text: "Poor kid." },
  { speaker: 'nurse-priya', show: ['nurse-priya', 'nurse-dev'], text: "Okay. Here comes the doctor. Let's make them feel welcome." },
  { speaker: 'narration', text: 'The door chimes. You step inside.' },
  { speaker: 'narration', text: 'The clinic smells like old coffee and disinfectant. Home.' },
];
