export const roles = ["Tank", "Healer", "Melee DPS", "Ranged DPS"] as const;
export type Role = (typeof roles)[number];
export type Class = {
  name: string;
  color: string;
  roles: Role[];
  lines: string[];
};
// Original nine classes and hybrid roles retained. DPS split follows original
// descriptions, not unverified WoW Forever-specific rules.
export const classes: Class[] = [
  {
    name: "Druid",
    color: "#FF7D0A",
    roles: ["Tank", "Healer", "Melee DPS", "Ranged DPS"],
    lines: ["Ma melyik formában jössz?", "Egy kaszt. Megint három feladat."],
  },
  {
    name: "Hunter",
    color: "#ABD473",
    roles: ["Ranged DPS"],
    lines: [
      "A pet már pullolt. Szokás szerint.",
      "A pet is benne van a raidlétszámban?",
    ],
  },
  {
    name: "Mage",
    color: "#69CCF0",
    roles: ["Ranged DPS"],
    lines: ["Gratulálunk. Vizet kérünk.", "A damage meter már nyitva van."],
  },
  {
    name: "Paladin",
    color: "#F58CBA",
    roles: ["Tank", "Healer", "Melee DPS"],
    lines: ["Ma is rád bízzák a mentést.", "A wipe után mindenki téged keres."],
  },
  {
    name: "Priest",
    color: "#FFFFFF",
    roles: ["Healer", "Ranged DPS"],
    lines: ["OOM. De azért pulloljatok.", "A falon át most sem megy a heal."],
  },
  {
    name: "Rogue",
    color: "#FFF569",
    roles: ["Melee DPS"],
    lines: [
      "A wipe-ot túlélted. Gyanús.",
      "A lootnál már biztosan ott leszel.",
    ],
  },
  {
    name: "Shaman",
    color: "#4898EE",
    roles: ["Healer", "Melee DPS", "Ranged DPS"],
    lines: [
      "Melyik partyba kérnek? Mindegyikbe.",
      "Ma is lesz helyed a csapatban.",
    ],
  },
  {
    name: "Warlock",
    color: "#B09CDB",
    roles: ["Ranged DPS"],
    lines: ["Summon van?", "Igen, már megint valaki a bejáratnál áll."],
  },
  {
    name: "Warrior",
    color: "#C79C6E",
    roles: ["Tank", "Melee DPS"],
    lines: ["Még egy pack belefér.", "A healer manája csak ajánlás."],
  },
];
export const iconPath = (name: string) =>
  `/class_icons/ClassIcon_${name.toLowerCase()}.webp`;
export const getPool = (selected: string[], filters: Role[]) =>
  classes.filter(
    (c) =>
      selected.includes(c.name) &&
      (!filters.length || c.roles.some((r) => filters.includes(r))),
  );
export function randomIndex(length: number) {
  if (length < 1) throw new Error("Üres pool");
  const limit = Math.floor(0x100000000 / length) * length,
    value = new Uint32Array(1);
  do {
    crypto.getRandomValues(value);
  } while (value[0] >= limit);
  return value[0] % length;
}
