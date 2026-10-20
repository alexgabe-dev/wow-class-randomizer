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
    lines: [
      "Ma melyik formában jössz?",
      "Egy kaszt. Megint három feladat.",
      "Innervate? Már elhasználtam a másik healerre.",
      "Battle rez van. Akkor még nincs wipe.",
      "Medve, macska, fa. A loot azért nem neked esik.",
      "Te leszel az off-tank. Megint.",
    ],
  },
  {
    name: "Hunter",
    color: "#ABD473",
    roles: ["Ranged DPS"],
    lines: [
      "A pet már pullolt. Szokás szerint.",
      "A pet is benne van a raidlétszámban?",
      "Pet stay. Most tényleg.",
      "A trap le van rakva. Kérlek, ne húzd rá a bosst.",
      "Feign Death. A repair billt nem úsztad meg.",
      "Van nálad ammo? Most már mindegy, pull van.",
    ],
  },
  {
    name: "Mage",
    color: "#69CCF0",
    roles: ["Ranged DPS"],
    lines: [
      "Gratulálunk. Vizet kérünk.",
      "A damage meter már nyitva van.",
      "Sheepeld azt. Nem, a másikat.",
      "Portál van, corpse run továbbra is lesz.",
      "Kaja-víz kiosztva. Most már senki nem kérhet semmit.",
      "A mana gemet ne a trashre lődd el.",
    ],
  },
  {
    name: "Paladin",
    color: "#F58CBA",
    roles: ["Tank", "Healer", "Melee DPS"],
    lines: [
      "Ma is rád bízzák a mentést.",
      "A wipe után mindenki téged keres.",
      "Mindenki kap buffot. Egyesével. Türelem.",
      "Bubázni lehet, a hearthstone már más kérdés.",
      "Ki kér Kingset? Jó, mindenki.",
      "Te vagy a backup tank. Persze, hogy te.",
    ],
  },
  {
    name: "Priest",
    color: "#FFFFFF",
    roles: ["Healer", "Ranged DPS"],
    lines: [
      "OOM. De azért pulloljatok.",
      "A falon át most sem megy a heal.",
      "Shield kint. Na, most már lehet hibázni.",
      "A fear jó volt, csak kár, hogy behúzta a szomszéd szobát.",
      "Dispel kell? Már nyomom.",
      "Mana van. Csak ne kérdezd, mennyi.",
    ],
  },
  {
    name: "Rogue",
    color: "#FFF569",
    roles: ["Melee DPS"],
    lines: [
      "A wipe-ot túlélted. Gyanús.",
      "A lootnál már biztosan ott leszel.",
      "Sap megvolt. A pull is.",
      "Vanish CD-n. Most már vállaljuk a következményeket.",
      "A poison jó fegyverre ment. A másikra is?",
      "Eltűntél a pull előtt. Ez most taktika vagy AFK?",
    ],
  },
  {
    name: "Shaman",
    color: "#4898EE",
    roles: ["Healer", "Melee DPS", "Ranged DPS"],
    lines: [
      "Melyik partyba kérnek? Mindegyikbe.",
      "Ma is lesz helyed a csapatban.",
      "Windfury kint. Most már csak proccolnia kéne.",
      "Totemek lerakva. Melyik groupba is vagyok?",
      "Chain Heal, aztán reménykedünk.",
      "A warrior már kérdezi, hol a Windfury.",
    ],
  },
  {
    name: "Warlock",
    color: "#B09CDB",
    roles: ["Ranged DPS"],
    lines: [
      "Summon van?",
      "Igen, már megint valaki a bejáratnál áll.",
      "Summonhoz még két ember kéne. Meg egy kis türelem.",
      "Healthstone kiosztva. Használni is szabad.",
      "Soul shard van. Hely a táskában nincs.",
      "Soulstone felrakva. Nem, attól még ne halj meg direkt.",
    ],
  },
  {
    name: "Warrior",
    color: "#C79C6E",
    roles: ["Tank", "Melee DPS"],
    lines: [
      "Még egy pack belefér.",
      "A healer manája csak ajánlás.",
      "Rage van. Terv nincs.",
      "Taunt resist. Nem történt semmi.",
      "Charge-oltál? A raidlead is látta.",
      "A healer manája megint csak tájékoztató jellegű.",
    ],
  },
];
export const iconPath = (name: string) =>
  `/class_icons/ClassIcon_${name.toLowerCase()}.png`;
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
