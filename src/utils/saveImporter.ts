import type { FarmProfile, Season } from '../types/stardew';
import { VILLAGERS } from '../data/villagers';
import { ALL_CATALOG_ITEMS } from '../data/items';
import { BUNDLES } from '../data/bundles';

const VALID_SEASONS: Record<string, Season> = {
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
  winter: 'Winter',
};

export interface ImportSummary {
  profile: FarmProfile;
  importedVillagers: number;
  importedFish: number;
  importedMuseum: number;
  importedShipped: number;
  notes: string[];
}

// Lookup helper from in-game Save XML name/object variations to Almanac catalog ID
const NAME_LOOKUP = new Map<string, string>();
for (const item of ALL_CATALOG_ITEMS) {
  const clean = item.name.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
  NAME_LOOKUP.set(clean, item.id);
  NAME_LOOKUP.set(item.id.toLowerCase(), item.id);
}

// Well-known Stardew XML numeric / string item IDs mapped to core catalog IDs
const OBJECT_KEY_ALIASES: Record<string, string> = {
  '24': 'parsnip',
  '192': 'potato',
  '190': 'cauliflower',
  '188': 'green-bean',
  '400': 'strawberry',
  '254': 'melon',
  '258': 'blueberry',
  '268': 'starfruit',
  '272': 'eggplant',
  '276': 'pumpkin',
  '282': 'cranberries',
  '454': 'ancient-fruit',
  '417': 'sweet-gem-berry',
  '128': 'pufferfish',
  '130': 'tuna',
  '131': 'sardine',
  '136': 'largemouth-bass',
  '138': 'rainbow-trout',
  '139': 'salmon',
  '140': 'walleye',
  '141': 'perch',
  '142': 'carp',
  '143': 'catfish',
  '145': 'sunfish',
  '148': 'eel',
  '149': 'octopus',
  '150': 'red-snapper',
  '151': 'squid',
  '154': 'sea-cucumber',
  '155': 'super-cucumber',
  '159': 'crimsonfish',
  '160': 'angler',
  '162': 'lava-eel',
  '163': 'legend',
  '682': 'mutant-carp',
  '698': 'sturgeon',
  '699': 'tiger-trout',
  '700': 'bullhead',
  '701': 'tilapia',
  '702': 'chub',
  '704': 'dorado',
  '705': 'albacore',
  '706': 'shad',
  '707': 'lingcod',
  '708': 'halibut',
  '734': 'woodskip',
  '775': 'glacierfish',
  '795': 'void-salmon',
  '796': 'slimejack',
  '798': 'midnight-squid',
  '799': 'spook-fish',
  '800': 'blobfish',
  '836': 'stingray',
  '837': 'lionfish',
  '838': 'blue-discus',
  '74': 'prismatic-shard',
  '72': 'diamond',
  '60': 'emerald',
  '64': 'ruby',
  '62': 'aquamarine',
  '66': 'amethyst',
  '68': 'topaz',
  '70': 'jade',
  '80': 'quartz',
  '82': 'fire-quartz',
  '84': 'frozen-tear',
  '86': 'earth-crystal',
  '114': 'ancient-seed-artifact',
  '107': 'dinosaur-egg',
  '638': 'cherry',
  '634': 'apricot',
  '635': 'orange',
  '636': 'peach',
  '637': 'pomegranate',
  '613': 'apple',
  '91': 'banana',
  '834': 'mango',
  '(O)SeaJelly': 'sea-jelly',
  '(O)RiverJelly': 'river-jelly',
  '(O)CaveJelly': 'cave-jelly',
  '(O)Carrot': 'carrot',
  '(O)SummerSquash': 'summer-squash',
  '(O)Broccoli': 'broccoli',
  '(O)Powdermelon': 'powdermelon',
};

function mapKeyToItemId(rawKey: string): string | null {
  const trimmed = rawKey.trim();
  if (OBJECT_KEY_ALIASES[trimmed]) return OBJECT_KEY_ALIASES[trimmed];
  const stripped = trimmed.replace(/^\(O\)/, '').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  if (NAME_LOOKUP.has(stripped)) return NAME_LOOKUP.get(stripped)!;
  const slug = stripped.replace(/\s+/g, '-');
  if (NAME_LOOKUP.has(slug)) return NAME_LOOKUP.get(slug)!;
  return null;
}

export function parseStardewSaveXml(xmlString: string, templateProfile: FarmProfile): ImportSummary {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Could not parse file as Stardew Valley XML save.');
  }

  const root = doc.querySelector('SaveGame');
  if (!root) {
    throw new Error('Invalid save file: missing <SaveGame> root tag.');
  }

  const text = (parent: Element | null, tag: string) =>
    parent?.querySelector(`:scope > ${tag}`)?.textContent?.trim() ?? '';

  const player = root.querySelector(':scope > player');
  const farmerName = text(player, 'name') || templateProfile.farmerName;
  const farmName = text(player, 'farmName') || templateProfile.name;

  const rawSeason = text(root, 'currentSeason').toLowerCase();
  const season: Season = VALID_SEASONS[rawSeason] ?? 'Spring';
  const day = Math.min(28, Math.max(1, parseInt(text(root, 'dayOfMonth'), 10) || 1));
  const year = Math.max(1, parseInt(text(root, 'year'), 10) || 1);
  const walnuts = parseInt(text(root, 'goldenWalnutsFound'), 10) || 0;

  const profile: FarmProfile = {
    ...templateProfile,
    id: `farm-xml-${Date.now()}`,
    name: `${farmName} Farm`,
    farmerName,
    year,
    season,
    day,
    goldenWalnuts: walnuts,
    villagerHearts: { ...templateProfile.villagerHearts },
    villagerGiftedThisWeek: {},
    villagerTalkedToday: {},
    trackedItems: { ...templateProfile.trackedItems },
    checkedBundleItems: {},
    jojaProjects: {},
  };

  // Friendship points (250 pts = 1 Heart)
  let importedVillagers = 0;
  const friendItems = player?.querySelectorAll(':scope > friendshipData > item') ?? [];
  const villagerLookup = new Map(VILLAGERS.map((v) => [v.name.toLowerCase(), v.id]));
  friendItems.forEach((node) => {
    const npcName = node.querySelector(':scope > key > string')?.textContent?.trim().toLowerCase();
    const pts = parseInt(node.querySelector(':scope > value > Friendship > Points')?.textContent ?? '0', 10);
    const weekly = parseInt(node.querySelector(':scope > value > Friendship > GiftsThisWeek')?.textContent ?? '0', 10);
    const npcId = npcName === 'm. rasmodius' ? 'wizard' : villagerLookup.get(npcName ?? '');
    if (npcId) {
      profile.villagerHearts[npcId] = Math.min(14, Math.floor(pts / 250));
      profile.villagerGiftedThisWeek[npcId] = Math.min(2, Math.max(0, weekly));
      importedVillagers++;
    }
  });

  // Caught Fish
  let importedFish = 0;
  player?.querySelectorAll(':scope > fishCaught > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) {
      profile.trackedItems[id] = true;
      importedFish++;
    }
  });

  // Museum Donations (Minerals + Archaeology)
  let importedMuseum = 0;
  player?.querySelectorAll(':scope > mineralsFound > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) {
      profile.trackedItems[id] = true;
      importedMuseum++;
    }
  });
  player?.querySelectorAll(':scope > archaeologyFound > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) {
      profile.trackedItems[id] = true;
      importedMuseum++;
    }
  });

  // Basic Shipped
  let importedShipped = 0;
  player?.querySelectorAll(':scope > basicShipped > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) {
      profile.trackedItems[id] = true;
      importedShipped++;
    }
  });

  // Cooking & Crafting
  player?.querySelectorAll(':scope > recipesCooked > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) profile.trackedItems[id] = true;
  });
  player?.querySelectorAll(':scope > craftingRecipes > item > key > string').forEach((node) => {
    const id = mapKeyToItemId(node.textContent ?? '');
    if (id) profile.trackedItems[id] = true;
  });

  // Community Center Room Mail flags -> auto-check completed room bundles
  const mails = new Set<string>();
  player?.querySelectorAll(':scope > mailReceived > string').forEach((m) => {
    if (m.textContent) mails.add(m.textContent.trim());
  });

  if (mails.has('JojaMember')) {
    profile.bundleMode = 'Joja';
  }
  const roomMailMap: Record<string, string> = {
    ccCraftsRoom: 'Crafts Room',
    ccPantry: 'Pantry',
    ccFishTank: 'Fish Tank',
    ccBoilerRoom: 'Boiler Room',
    ccBulletin: 'Bulletin Board',
    ccVault: 'Vault',
    ccMovieTheater: 'Abandoned JojaMart',
  };
  for (const [mailFlag, roomName] of Object.entries(roomMailMap)) {
    if (mails.has(mailFlag)) {
      for (const b of BUNDLES.filter((bun) => bun.room === roomName && !bun.isRemixedVariant)) {
        for (const item of b.items) {
          profile.checkedBundleItems[`${b.id}:${item.id}`] = true;
        }
      }
    }
  }

  return {
    profile,
    importedVillagers,
    importedFish,
    importedMuseum,
    importedShipped,
    notes: [
      `Loaded ${farmName} Farm (${season} ${day}, Year ${year}) for Farmer ${farmerName}.`,
      `Synced ${importedVillagers} friendships, ${importedFish} caught fish, ${importedShipped} shipped records, and ${walnuts} Golden Walnuts.`,
    ],
  };
}
