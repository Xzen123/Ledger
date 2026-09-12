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

export function archetypeFromAttributes(attrs = {}) {
  const scores = {
    intellect: attrs.intellect || 0,
    strength: attrs.strength || 0,
    discipline: attrs.discipline || 0,
    creativity: attrs.creativity || 0,
    vitality: attrs.vitality || 0,
  };

  const archetypes = {
    intellect: { key: "intellect", name: "Grand Magus", title: "Grand Magus of the Arcane" },
    strength: { key: "strength", name: "Titan Warlord", title: "Titan Warlord of Valor" },
    discipline: { key: "discipline", name: "Order Sentinel", title: "Sentinel of Unyielding Order" },
    creativity: { key: "creativity", name: "Mythic Artisan", title: "Mythic Artisan of the Forge" },
    vitality: { key: "vitality", name: "Wild Warden", title: "Warden of Vital Essence" },
  };

  let maxKey = "discipline";
  let maxVal = -1;
  for (const [k, v] of Object.entries(scores)) {
    if (v > maxVal) {
      maxVal = v;
      maxKey = k;
    }
  }

  if (maxVal <= 0) {
    return { key: "polymath", name: "Polymath Ascendant", title: "Polymath Ascendant" };
  }

  return archetypes[maxKey] || { key: "polymath", name: "Polymath Ascendant", title: "Polymath Ascendant" };
}
