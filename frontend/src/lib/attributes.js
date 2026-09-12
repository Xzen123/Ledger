// Mirrors the spirit of the backend's non-linear leveling, but purely for
// display: every 10 points in an attribute is a "tier".
export const ATTRIBUTE_META = {
  intellect: { label: "Intellect", hint: "Study, reading, deep work" },
  strength: { label: "Strength", hint: "Gym, sport, physical effort" },
  discipline: { label: "Discipline", hint: "Chores, admin, routines" },
  creativity: { label: "Creativity", hint: "Making, writing, art" },
  vitality: { label: "Vitality", hint: "Sleep, health, recovery" },
};

export function attributeTier(points) {
  const tier = Math.floor(points / 10) + 1;
  const progress = (points % 10) / 10;
  return { tier, progress, pointsIntoTier: points % 10 };
}

/* commit_stage_12_ayush */
