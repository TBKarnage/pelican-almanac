import type { GuideArticle } from '../types/stardew';

export const STARDROPS: {
  id: string;
  name: string;
  source: string;
  tip: string;
}[] = [
  {
    id: 'stardrop-mines-100',
    name: 'Mines Floor 100 Chest',
    source: 'Treasure Chest on Floor 100 of The Mines',
    tip: 'Guaranteed chest when taking the elevator down through the Volcanic levels (Floors 80–120).',
  },
  {
    id: 'stardrop-fair',
    name: 'Stardew Valley Fair (2,000 Star Tokens)',
    source: 'Purchase at the Star Token Exchange Booth (Fall 16)',
    tip: 'Score 90+ in the Grange Display for 1,000 tokens, then bet half your tokens on GREEN at the Wheel (75% odds) to hit 2,000 fast.',
  },
  {
    id: 'stardrop-cannoli',
    name: 'Old Master Cannoli (Secret Woods)',
    source: 'Give a Sweet Gem Berry to the statue in the Secret Woods',
    tip: 'Buy Rare Seed (1,000g) from the Traveling Cart in Spring/Summer, plant Fall 1 (24 days!).',
  },
  {
    id: 'stardrop-krobus',
    name: "Krobus's Sewer Shop (20,000g)",
    source: 'Buy inside The Sewers (Requires Rusty Key at 60 Museum Donations)',
    tip: 'Save Omni Geodes & Artifact Troves to hit 60 Museum items early!',
  },
  {
    id: 'stardrop-angler',
    name: 'Master Angler Achievement',
    source: 'Mail from Willy the morning after catching every unique fish in the Collection',
    tip: 'In 1.6, counts all 72 fish (including Sea/River/Cave Jelly & Clam); Legendary II quest fish are NOT required.',
  },
  {
    id: 'stardrop-museum',
    name: 'Complete Museum Collection',
    source: 'Donate all 95 Artifacts & Minerals to Gunther',
    tip: 'Use Artifact Troves (from Desert Trader for 5 Omni Geodes) and Mystery Boxes (1.6) to hunt stubborn Artifacts.',
  },
  {
    id: 'stardrop-spouse',
    name: 'Spouse / Roommate at 12.5 Hearts',
    source: 'Gift from your married Spouse or Roommate Krobus (~3,125 friendship pts)',
    tip: 'Talk & kiss/hug every morning and gift loved items twice per week after marriage.',
  },
];

export const MONSTER_GOALS: {
  id: string;
  target: string;
  count: number;
  reward: string;
  where: string;
}[] = [
  { id: 'mg-slimes', target: 'Slimes', count: 1000, reward: 'Slime Charmer Ring (Immune to all Slime damage!)', where: 'The Mines, Secret Woods, Skull Cavern' },
  { id: 'mg-void', target: 'Void Spirits (Brutes & Shamans)', count: 150, reward: 'Savage Ring (+2 Speed for 3s on kill)', where: 'Mines Floors 80–119' },
  { id: 'mg-bats', target: 'Bats (Bat, Frost, Lava, Iridium)', count: 200, reward: 'Vampire Ring (+2 HP on kill)', where: 'The Mines & Skull Cavern' },
  { id: 'mg-skeletons', target: 'Skeletons', count: 50, reward: 'Skeleton Mask', where: 'Mines Floors 70–79' },
  { id: 'mg-bugs', target: 'Cave Insects (Grubs, Bugs, Flies)', count: 80, reward: 'Insect Head Sword (Solid Early Lv1–39 Weapon)', where: 'Mines Floors 1–29, Mutant Bug Lair' },
  { id: 'mg-duggies', target: 'Duggies', count: 30, reward: 'Hard Hat', where: 'Mines soft dirt patches (Fl 6–29)' },
  { id: 'mg-dust-sprites', target: 'Dust Sprites', count: 500, reward: "Burglar's Ring (2× Monster Loot Rolls — Must-Have!)", where: 'Mines Floors 40–79 (Best for Coal too!)' },
  { id: 'mg-rock-crabs', target: 'Rock Crabs (Rock, Lava, Iridium)', count: 60, reward: 'Crabshell Ring (+5 Defense!)', where: 'The Mines & Skull Cavern' },
  { id: 'mg-mummies', target: 'Mummies', count: 100, reward: 'Arcane Hat', where: 'Skull Cavern (Need Bomb or Crusader enchant to kill!)' },
  { id: 'mg-pepper-rex', target: 'Pepper Rex', count: 50, reward: "Knight's Helmet", where: 'Skull Cavern Prehistoric Floors' },
  { id: 'mg-serpents', target: 'Serpents', count: 250, reward: 'Napalm Ring (Slain enemies explode rock!)', where: 'Skull Cavern' },
  { id: 'mg-magma-sprites', target: 'Magma Sprites & Sparkers', count: 150, reward: "Marlon's Phone Number (+ Item Recovery call)", where: 'Volcano Dungeon (Ginger Island)' },
];

export const PERFECTION_BREAKDOWN = [
  { label: 'Produce & Forage Shipped', weight: 15, note: 'Ship 1 of every item on Collections -> Shipped tab (crops, animal goods, forage, artisan products, bars/sap).' },
  { label: '4 Earth/Water/Desert/Island Obelisks', weight: 4, note: 'Built by Wizard (Water, Earth, Desert, Island).' },
  { label: 'Gold Clock Built', weight: 10, note: '10,000,000g from Wizard’s Tower.' },
  { label: 'Monster Slayer Hero', weight: 10, note: 'Complete all 12 Adventurer’s Guild Monster Eradication goals.' },
  { label: 'Great Friends (Max Hearts)', weight: 11, note: 'Reach 8♥ with bachelors/bachelorettes & 10♥ with all other Valley/Island villagers (including Kent & Leo).' },
  { label: 'Farmer Level (Skill Levels Total 25 -> 10 in all 5)', weight: 5, note: 'Level 10 in Farming, Mining, Foraging, Fishing & Combat (Mastery Lv is extra bonus).' },
  { label: 'Found Every Stardrop (7)', weight: 10, note: 'Mines 100, Fair, Secret Woods Cannoli, Krobus, Master Angler, Museum Complete, Spouse 12.5♥.' },
  { label: 'Cooking Recipes (Cooked at least 1×)', weight: 10, note: 'Craft/cook all 81 dishes (upgrade Farmhouse for Kitchen; Queen of Sauce + Stardrop Saloon + Heart Mail).' },
  { label: 'Crafting Recipes (Crafted at least 1×)', weight: 10, note: 'Craft every recipe once (Wedding Ring not required in Single Player; check Advanced Crafting Options setting in-game!).' },
  { label: 'Catch Every Fish (Master Angler)', weight: 10, note: 'All 72 non-Qi fish (includes Sea/River/Cave Jelly & Clam in 1.6).' },
  { label: 'Found All Golden Walnuts (130)', weight: 5, note: 'All 130 across Ginger Island (Parrot Joja waiver option in 1.6 for remaining Walnuts!).' },
];

export const GUIDES: GuideArticle[] = [
  {
    id: 'year-1-roadmap',
    title: 'Year 1 Valley Roadmap (Spring -> Winter)',
    category: 'Starter',
    readTime: '4 min read',
    summary: 'Month-by-month priorities from Day 1 Parsnips & Spring 13 Strawberries to unlocking the Greenhouse before your first snowfall.',
    sections: [
      {
        heading: 'Spring (Days 1–28): Cash, Strawberries & Fishing',
        body: 'Spring establishes your tool levels, backpacks, and Greenhouse seeds before summer.',
        bullets: [
          'Day 1: Plant Lewis’s 15 Parsnips + buy 1 Potato, 1 Cauliflower, and 1 Green Bean for the Spring Crops Bundle right away!',
          'Craft Chests (50 Wood) immediately; hoard 300 Wood early to fix the Beach East Bridge for Coral/Sea Urchins.',
          'Save nearly ALL gold before Spring 13 (Egg Festival) to buy Strawberry Seeds (100g each) — plant & water that night for 2 full harvests!',
          'Upgrade Watering Can only on a day BEFORE forecasted Rain (check TV Weather daily at 6am!).',
          'Get Caroline to 2♥ (she Likes Daffodils—pick them free!) and enter her Kitchen Sunroom for the Tea Sapling recipe!',
        ],
        callout: 'Watch Traveling Cart every Friday & Sunday in Cindersap Forest starting Week 1 for Red Cabbage Seeds, Rare Seeds (1,000g), or tough Fish/Animal items!',
      },
      {
        heading: 'Summer (Days 1–28): Quality Sprinklers, Lightning Rods & Starfruit',
        body: 'Aim for Farming Level 6 and Mines Floor 80+ early Summer so Quality Sprinklers water crops automatically.',
        bullets: [
          'Plant Blueberries, Melons, Corn, Wheat, Hops, and 1+ Poppy / Red Cabbage (if Y2 or Cart found).',
          'Craft Lightning Rods (Foraging Lv6) BEFORE summer storms to stockpile Battery Packs (for Iridium Sprinklers & Willy’s boat)!',
          'Unlock The Mines to Floor 80 for Gold Ore -> craft Quality Sprinklers (1 Iron Bar + 1 Gold Bar + 1 Refined Quartz).',
          'Do NOT miss Green Rain Day (check Weather Report day before!) — Harvest loads of Moss and Fiber!',
        ],
      },
      {
        heading: 'Fall (Days 1–28): Cranberries, Pumpkins & Greenhouse Unlock',
        body: 'Harvest Fall Bundles early and turn Pumpkins into artisan income.',
        bullets: [
          'Plant Sweet Gem Berry (Rare Seed from Traveling Cart) on Fall 1 — it takes 24 days!',
          'Plant Pumpkins, Corn, Yam, Eggplant, Cranberries, and Fairy Rose (for Fairy Rose Honey).',
          'Finish Pantry Bundles (especially Gold Quality Crops + Animal/Artisan) by mid-Fall so your Greenhouse runs Ancient Fruit all Winter!',
          'Check Fall 16 Stardew Valley Fair with 9 diverse Gold/Iridium items to grab 1st Prize + the Fair Stardrop (2,000 Tokens).',
        ],
      },
      {
        heading: 'Winter (Days 1–28): Tools, Powdermelon, Night Market & Mines 120',
        body: 'Without outside sprinklers to babysit (except 1.6 Powdermelon!), focus on Mines Floor 120, Tool upgrades, Tappers, & Friendship.',
        bullets: [
          'Plant Powdermelon Seeds (dug from Winter Seed Spots) to boost Farming & earn extra gold.',
          'Sail the Submarine every Night Market evening (Winter 15–17, 5pm+) for Midnight Squid, Spook Fish, and Blobfish!',
          'Prepare 10+ Kegs and Tap Oak Trees for Oak Resin -> build your Greenhouse wine engine.',
        ],
      },
    ],
    checklist: [
      { id: 'y1-pack-24', text: 'Buy Red 24-slot Backpack (2,000g at Pierre’s)' },
      { id: 'y1-bridge', text: 'Repair East Beach Bridge (300 Wood)' },
      { id: 'y1-strawberry', text: 'Buy & plant Strawberries on Spring 13' },
      { id: 'y1-steel-axe', text: 'Upgrade to Steel Axe to enter Secret Woods (Hardwood & Fiddlehead Fern)' },
      { id: 'y1-greenhouse', text: 'Restore Community Center Pantry -> Greenhouse unlocked!' },
      { id: 'y1-mines120', text: 'Reach Floor 120 of The Mines for the Skull Key' },
    ],
  },
  {
    id: 'cc-year1-blitz',
    title: 'Community Center Year 1 Completion Checklist',
    category: 'Starter',
    readTime: '3 min read',
    summary: 'Every single missable seasonal crop, rainy-day fish, barn animal, and Traveling Cart gamble needed to finish the CC in Year 1.',
    sections: [
      {
        heading: 'Top Year 1 Bottlenecks (Never Miss These!)',
        body: 'In Standard Bundles, almost every failure to complete the Community Center in Year 1 comes from just 6 items:',
        bullets: [
          'Red Cabbage: Does NOT sell at Pierre’s in Year 1! Guarantee it by enabling "Guarantee Year 1 Completable" in Advanced Game Options OR checking Traveling Cart every Fri/Sun.',
          'Fiddlehead Fern: ONLY spawns in Summer in the Secret Woods (requires Steel Axe!) OR from mossy/curly Green Rain trees!',
          'Walleye & Catfish & Shad & Eel: Rain-exclusive fish! Catch Catfish/Shad/Eel in Spring/Fall rain, and Walleye in Fall rain (12pm–2am)!',
          'Nautilus Shell: Only washes up on The Beach during WINTER (or gifted randomly by Demetrius).',
          'Rabbits Foot & Truffle: Pigs won’t dig Truffles in Winter! Upgrade to Deluxe Barn BEFORE Fall 15 so Pigs mature before Winter 1!',
          '3 Apples (Fodder Bundle) & 1 Pomegranate (Enchanter’s Bundle): Plant Apple & Pomegranate Saplings BEFORE Summer 28 (they take 28 days!), OR choose Fruit Bats in Farm Cave!',
        ],
      },
      {
        heading: 'Golden Quality Crops Strategy',
        body: 'You need 3 of 4 types (5× Gold Parsnip, 5× Gold Melon, 5× Gold Pumpkin, 5× Gold Corn).',
        bullets: [
          'Save Basic Fertilizer (2 Sap) + Farming Lv4+ -> plant 20–30 Parsnips/Melons/Pumpkins with Basic Fertilizer so 5+ roll Gold Star.',
          'Corn grows Summer AND Fall, giving you twice as many harvests to hit 5 Gold Corn!',
        ],
      },
    ],
    checklist: [
      { id: 'cc1-spring-fish', text: 'Catch Sunfish, Catfish (Rain!), Shad (Rain!), Eel (Ocean Rain night)' },
      { id: 'cc1-summer-trees', text: 'Plant Apple & Pomegranate Fruit Trees by Summer 28 (or Fruit Bat cave)' },
      { id: 'cc1-deluxe-barn', text: 'Unlock Deluxe Barn + buy a Pig before mid-Fall (Winter freezes Truffles!)' },
      { id: 'cc1-walleye', text: 'Catch Fall Rainy Afternoon Walleye (12pm–2am)' },
      { id: 'cc1-redcabbage', text: 'Buy Red Cabbage / Seeds at Traveling Cart (Fri/Sun) or Skull Cavern drops' },
      { id: 'cc1-nautilus', text: 'Grab Nautilus Shell on Beach in Winter Day 1' },
    ],
  },
  {
    id: 'angling-smoker-16',
    title: 'Fishing & 1.6 Fish Smoker Mastery',
    category: 'Fishing',
    readTime: '3 min read',
    summary: 'How Update 1.6 turned Smoking Fish into an enormous early-to-late-game profit engine, plus Targeted Bait and Legend Pond math.',
    sections: [
      {
        heading: 'Why the Fish Smoker Doubles Your Income',
        body: 'Purchased from Willy (10,000g recipe; crafted with 10 Hardwood + 1 Sea Jelly + 1 River Jelly + 1 Cave Jelly).',
        bullets: [
          'Input: 1 Fish + 1 Coal -> Takes 50 in-game minutes -> Sells for 2× Fish Price AND KEEPS ITS STAR QUALITY (Silver/Gold/Iridium)!',
          'PLUS Smoked Fish counts as an Artisan Good AND benefits from Fisher/Angler at the same time (stackable!): +50% Angler × +40% Artisan = 4.2× base fish value on Iridium catches!',
          'Rule of thumb: With Coal costing 150g–250g, smoke any fish worth 150g+ (Catfish, Largemouth Bass, Sturgeon, Lava Eel, Legend II, Octopus, Pufferfish, Super Cucumber).',
        ],
        callout: 'To farm Cave Jelly for your first Fish Smoker, fish on Mines Floor 100 on High Luck days (or run Lava Eel Fish Ponds)!',
      },
      {
        heading: '1.6 Bait Upgrades: Deluxe, Challenge & Targeted Bait',
        body: 'Stop using basic bait once Fishing reaches Level 4–6.',
        bullets: [
          'Deluxe Bait (50g / Crafting Bug Meat + Moss): Increases fishing bar size AND reduces bite delay! Fits Fiberglass & Iridium rods.',
          'Bait Maker (Fishing Lv6): Drop any fish in to print Targeted Bait for that exact species — triples bite rate of Legend II, Sturgeon, Catfish, or Rainbow Trout during Trout Derby!',
          'Challenge Bait (Fishing Mastery): Gives up to 3 fish per Perfect/near-miss catch!',
        ],
      },
      {
        heading: '1.6 Legendary Fish Ponds!',
        body: 'In Stardew 1.6, you can place Legend, Crimsonfish, Angler, Glacierfish, and Mutant Carp inside Fish Ponds!',
        bullets: [
          'Legend Roe sells for huge gold — Aged in a Preserves Jar with Artisan, Aged Legend Roe sells for 7,084g EACH!',
          'Use a Golden Animal Cracker on a Fish Pond (1.6 Mastery!) to permanently DOUBLE all Roe & Squid Ink/Gem outputs!',
        ],
      },
    ],
  },
  {
    id: 'skull-cavern-mining',
    title: 'Mines, Skull Cavern & Volcano Kit',
    category: 'Mining',
    readTime: '4 min read',
    summary: 'Exact inventory loadout, Sunday Jade trading loop, healing foods, and Caldera Ring/Tool forging setups.',
    sections: [
      {
        heading: 'The Unstoppable Skull Cavern Loadout',
        body: 'Skip slow swinging — Bombs + Staircases + Buff food get you to Floor 100+ before noon.',
        bullets: [
          'Pickaxe (Gold/Iridium) + Galaxy Sword / Infinity Blade (enchant with Crusader in Volcano Forge to kill Mummies instantly without bombs!).',
          '50–100 Mega Bombs / Bombs (buy Bombs from Dwarf or trade 5 Quartz at Desert Trader).',
          '50–100 Staircases -> Build 5–10 Crystalariums producing JADE, trade 1 Jade = 1 Staircase every SUNDAY at Desert Trader!',
          'Buffs: 5× Spicy Eel (+1 Luck, +1 Speed — trade Rubies at Desert Trader!) stacked with Triple Shot Espresso (+1 Speed).',
          'Non-buff Healing Stack: 40× Cheese (Gold Cows Milk!) or 40× Salad / Pineapple / Cactus Fruit. Eating unbuffed food NEVER overwrites Spicy Eel/Espresso!',
        ],
      },
      {
        heading: 'Volcano Caldera (Ginger Island) Best Ring Combos',
        body: 'Bring 20+ Cinder Shards & Dragon Teeth to Volcano Floor 10 Forge to weld 4 ring effects into 2 finger slots!',
        bullets: [
          'Classic Meta Pair: [Iridium Band + Lucky Ring] & [Burglar’s Ring + Slime Charmer Ring] (swap Napalm Ring for Slime Charmer in Skull Cavern if aggressive mining!).',
          '1.6 Combat Trinkets (Unlock Combat Mastery): Fairy Box (automatic healing in fight!), Ice Rod (freezes enemies), or Magic Quiver.',
        ],
      },
    ],
  },
  {
    id: 'artisan-greenhouse-16',
    title: 'Greenhouse, Kegs & 1.6 Dehydrators',
    category: 'Profit',
    readTime: '4 min read',
    summary: 'How to balance Kegs, Preserves Jars, 1.6 Dehydrators, Bee Houses, and Ancient Fruit vs Starfruit across your Greenhouse and Ginger Island.',
    sections: [
      {
        heading: 'Greenhouse 116-Tile Optimal Sprinkler Grid',
        body: 'Place 4 Iridium Sprinklers inside the tillable soil + 2 Iridium Sprinklers on the wooden border edge (with 1 tile row overlap), OR plant 18 Fruit Trees cleanly around the outer tiled perimeter (yes, they grow directly on the stone border floor!).',
        bullets: [
          'Fruit Trees planted on Greenhouse floor borders need ZERO watering and produce 1 Fruit every day all year forever.',
          'Early filler while multiplying Ancient Seeds: fill open beds with Starfruit, Hops, or Cranberries -> drop into Seed Makers to scale up to 116 Ancient Fruit.',
        ],
      },
      {
        heading: 'Keg vs Preserves Jar vs 1.6 Dehydrator',
        body: 'Match each machine to crop price and your spare time:',
        bullets: [
          'Kegs (3× Fruit price Wine / 2.25× Veg Juice, takes ~7 days): Best for high-base fruits — Starfruit (3,150g Artisan Wine!), Ancient Fruit (2,310g), Pineapple, Rhubarb, Hops (Pale Ale 420g in 1.5 days!), Wheat (Beer).',
          'Preserves Jars (2× + 50g, takes ~2.5 days): Beats Kegs for low-base Vegetables/Fruits (<50g base fruits like Salmonberry/Hot Pepper & almost all Vegetables <200g except Pumpkin Juice vs Pickles close). Also ages Roe into Aged Roe/Caviar!',
          'Dehydrator (1.6 — takes 5 identical Fruits/Mushrooms -> finishes OVERNIGHT!): Formula = (7.5× base + 25) per 5 fruits -> +50% per fruit base (plus +40% Artisan!), turning massive Cranberry/Blueberry/Grape/Strawberry harvests into daily fast money — AND 5 Grapes make Raisins (Junimos eat Raisins for 20% DOUBLE crop harvest!).',
        ],
      },
    ],
  },
  {
    id: 'update-16-essentials',
    title: 'Stardew 1.6 Complete New Features Guide',
    category: 'Update 1.6',
    readTime: '4 min read',
    summary: 'Mastery Cave, All 5 Masteries, 19 Power Books, Raccoons, Meadowlands Blue Grass, Green Rain, and new 1.6 Festivals.',
    sections: [
      {
        heading: 'The Mastery System (Unlock at Total Skill Level 50 — Lv10 in all 5)',
        body: 'Head to the hidden locked door southeast in Cindersap Forest (north of Hat Mouse cliff) once all 5 core Skills reach Level 10.',
        bullets: [
          'Farming Mastery: IRIDIUM SCYTHE (harvests EVERY crop, even trellises & forage in giant swipe!) + Statue of Blessings (daily random mega-buffs: Butterfly luck, Speed, Infinite Energy!).',
          'Foraging Mastery: Mystic Tree Seeds -> Mystic Syrup (1,000g/bottle + crafts Treasure Totems & Blue Grass Starter!).',
          'Mining Mastery: Heavy Furnace (smelts 25 Ore per 3 Coal & gives bonus Bars!) + Statue of the Dwarf King (choose daily mine perk like "+1 Ore" or "No Bomb Damage").',
          'Fishing Mastery: Advanced Iridium Rod (holds TWO tackles simultaneously! Combine Trap Bobber + Cork/Dressed Spinner!) + Challenge Bait.',
          'Combat Mastery: ANVIL + TRINKET SLOT! Equip Fairy Box (heals you in combat), Magic Quiver, Ice Rod, or Parrot Egg (spawns Gold on kills!).',
        ],
      },
      {
        heading: '1.6 Power Books & Prize Machine',
        body: 'Never miss these permanent buffs!',
        bullets: [
          'Bookseller arrives TWICE every season (look for the red/white Balloon on the calendar!): prioritize Price Catalogue, Way of the Wind pt.1 & 2 (+Speed), Horse: The Book (+Horse Speed), and Queen of Sauce Cookbook (Day 100+).',
          'Complete 3 Help Wanted / Special Order quests -> earn 1 Prize Ticket -> redeem inside Mayor Lewis’s Manor for rare 1.6 loot (Iridium Sprinklers, Saplings, Stardrop Tea, Friendship 101!).',
          'Stardrop Tea (+250 Friendship): ignores weekly 2-gift limit AND grants 750 pts on Birthdays — save it for Kent, Leo, or hard-to-gift birthdays!',
        ],
      },
    ],
  },
  {
    id: 'perfection-guide',
    title: 'Road to 100% Perfection & The Summit',
    category: 'Late Game',
    readTime: '3 min read',
    summary: 'Exact breakdown of the Qi Perfection Statue weights, 130 Golden Walnuts, Craft/Cook tracking, and 1.6 Joja Fizz Perfection Waivers.',
    sections: [
      {
        heading: 'Checking Your Real-Time Percentage',
        body: 'Enter Mr. Qi’s Walnut Room on Ginger Island West (requires 100 Golden Walnuts) and interact with the Pink Perfection Tracker on the right wall.',
        bullets: [
          'Turn ON "Show Advanced Crafting Information" inside Stardew’s Options menu so hovering any Recipe tells you how many times you have actually cooked/crafted it!',
          'Enable "Golden Walnut" count checks via typing `/recountnuts` in in-game chat if a walnut ever bugs.',
          'In Update 1.6, if 1 or 2 goals (such as Great Friends, Master Angler, or Gold Clock) feel tedious, speak to FIZZ in Ginger Island’s Mushroom Cave to buy Perfection Waivers for 500,000g per +1%!',
        ],
      },
    ],
  },
];
