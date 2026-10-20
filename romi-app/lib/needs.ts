/**
 * ROMI need definitions — the ONE place each chip is defined.
 *
 * page.tsx (chips, sub-chips, talk-to-ROMI, list + pins), /api/nearby and
 * /api/search all import from here. Plain-English definitions were approved
 * by Angela (Oct 2026). If a definition changes, change it here only.
 *
 * Rule of the road: a place gets a need only when its own types / tags /
 * listing text pass that need's rules. A search query returning a place is
 * NEVER evidence on its own. Google and OSM are leads (orange). Teal comes
 * only from the gold list and scout reports, never from this file.
 */

export const WIFI = "Wi\u2011Fi & Cell"; // non-breaking hyphen, matches existing saved data

export const NEED_LABELS = [
  "Sleep",
  "Water",
  "Shower",
  "Food",
  "Fuel",
  "Power",
  WIFI,
  "Laundry",
  "Dog Needs",
  "Adventure",
  "Adult-friendly",
] as const;

export type NeedLabel = (typeof NEED_LABELS)[number];

/** What classify() looks at. Everything optional so Google, OSM and search can all use it. */
export type PlaceFacts = {
  name?: string;
  /** Google place types, e.g. ["gas_station", "convenience_store"]. */
  types?: string[];
  /** OpenStreetMap tags, e.g. { amenity: "fuel", "fuel:lpg": "yes" }. */
  osmTags?: Record<string, string>;
  /** Listing text the place itself publishes (editorial summary, description). */
  text?: string;
};

export type Classification = {
  helpsWith: NeedLabel[];
  /** Sub-chip labels this place satisfies, e.g. ["Vet"]. */
  subChips: string[];
};

type Evidence = { types: Set<string>; osm: Record<string, string>; name: string; text: string };

type Rule = (e: Evidence) => boolean;

export type SubChip = {
  label: string;
  /** Extra words (whole-word) that mean this sub-chip in talk-to-ROMI. */
  synonyms: string[];
  /** Google Nearby queries that find candidates. Candidates still must pass `matches`. */
  google: Array<{ type: string; keyword: string }>;
  /** OSM Overpass tag filters for the fallback. */
  osm: string[];
  matches: Rule;
};

export type NeedDef = {
  label: NeedLabel;
  icon: string;
  /** Short line under the chip. */
  detail: string;
  /** Angela-approved plain-English definition. */
  description: string;
  /** Whole-word synonyms for talk-to-ROMI. */
  synonyms: string[];
  google: Array<{ type: string; keyword: string }>;
  osm: string[];
  /** Google types that can qualify (still subject to `matches`). Documentation + quick reference. */
  allowedTypes: string[];
  /** Google types that disqualify unless an allowed type is also present. */
  rejectedTypes: string[];
  subChips: SubChip[];
  /** Base rule. A place passes the need if it passes this OR any sub-chip. */
  matches: Rule;
};

// ---------- helpers ----------

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Whole-word / whole-phrase match. "bar" does not match "barber"; "gas" does not match "vegas". */
export function hasWord(hay: string, word: string): boolean {
  if (!hay || !word) return false;
  return new RegExp(`(^|[^a-z0-9])${escapeRe(word.toLowerCase())}([^a-z0-9]|$)`, "i").test(hay.toLowerCase());
}

const anyWord = (hay: string, words: string[]) => words.some((w) => hasWord(hay, w));
const hasType = (e: Evidence, ...t: string[]) => t.some((x) => e.types.has(x));
const osmIs = (e: Evidence, key: string, ...vals: string[]) => vals.includes(e.osm[key] ?? "");
const nameOrText = (e: Evidence) => `${e.name} ${e.text}`;

const FOOD_TYPES = ["restaurant", "cafe", "bakery", "meal_takeaway", "meal_delivery", "supermarket", "grocery_or_supermarket"];
const OSM_FOOD = ["restaurant", "cafe", "fast_food", "food_court"];

// ---------- sub-chip rules ----------

const isVet: Rule = (e) =>
  (hasType(e, "veterinary_care") || osmIs(e, "amenity", "veterinary") ||
    anyWord(e.name, ["animal hospital", "veterinary", "veterinarian", "vet clinic", "emergency vet"])) &&
  !hasType(e, "park", "dog_park", "pet_store") &&
  !osmIs(e, "leisure", "dog_park", "park");

const isDogPark: Rule = (e) =>
  !hasType(e, "veterinary_care", "pet_store") &&
  (hasType(e, "dog_park") || osmIs(e, "leisure", "dog_park") ||
    (hasType(e, "park") && anyWord(e.name, ["dog park", "bark park", "off leash area", "off-leash area"])));

const isOffLeash: Rule = (e) =>
  isDogPark(e) &&
  (anyWord(nameOrText(e), ["off leash", "off-leash", "offleash", "unleashed"]) ||
    osmIs(e, "dog", "unleashed") || osmIs(e, "off_leash", "yes"));

const isPetSupplies: Rule = (e) =>
  hasType(e, "pet_store") ||
  osmIs(e, "shop", "pet", "agrarian", "farm") ||
  (hasType(e, "store") && anyWord(e.name, ["feed", "feed store", "pet supply", "pet supplies"]));

/** Stays orange: Google text can only make it a lead. Teal needs a scout. */
const isPetPatio: Rule = (e) =>
  (hasType(e, ...FOOD_TYPES, "bar") || osmIs(e, "amenity", ...OSM_FOOD, "bar", "pub")) &&
  (anyWord(nameOrText(e), ["dog friendly", "dog-friendly", "pet friendly", "pet-friendly", "dogs welcome"]) ||
    osmIs(e, "dog", "yes"));

const isPropane: Rule = (e) =>
  osmIs(e, "fuel:lpg", "yes") ||
  osmIs(e, "shop", "gas") ||
  ((hasType(e, "gas_station") || osmIs(e, "amenity", "fuel")) && anyWord(nameOrText(e), ["propane", "lpg"])) ||
  anyWord(e.name, ["propane"]);

const isEvCharger: Rule = (e) =>
  hasType(e, "electric_vehicle_charging_station") || osmIs(e, "amenity", "charging_station");

const isRvHookup: Rule = (e) =>
  (hasType(e, "rv_park", "campground") || osmIs(e, "tourism", "caravan_site", "camp_site")) &&
  (osmIs(e, "power_supply", "yes") ||
    anyWord(nameOrText(e), ["hookup", "hookups", "hook-ups", "full hookup", "electric hookup", "30 amp", "50 amp", "30/50 amp"]));

// ---------- need rules ----------

const isSleep: Rule = (e) =>
  hasType(e, "campground", "rv_park", "lodging") ||
  osmIs(e, "tourism", "camp_site", "caravan_site", "hotel", "motel", "chalet", "guest_house", "hostel", "alpine_hut");

const isTrailheadOrDayUse = (e: Evidence) =>
  anyWord(e.name, ["trailhead", "day use", "day-use", "picnic area"]) || osmIs(e, "highway", "trailhead");

const isWater: Rule = (e) => {
  const lakeOrStore =
    hasType(e, "natural_feature") || osmIs(e, "natural", "water") ||
    (hasType(e, "store", "convenience_store", "supermarket") && !hasType(e, "campground", "rv_park"));
  if (lakeOrStore) {
    // lakes and bottled-water stores are not potable fill
    if (!anyWord(e.name, ["water station", "fill station", "dump station"])) return false;
  }
  if (osmIs(e, "amenity", "drinking_water", "water_point") || (osmIs(e, "drinking_water", "yes") && osmIs(e, "amenity", "sanitary_dump_station"))) return true;
  if (anyWord(e.name, ["water station", "water fill", "fill station", "dump station", "potable water"])) return true;
  return (hasType(e, "campground", "rv_park") || osmIs(e, "tourism", "camp_site", "caravan_site")) &&
    anyWord(nameOrText(e), ["potable", "potable water", "water fill", "fill station", "fresh water fill", "water hookup", "water hookups"]);
};

const isShower: Rule = (e) => {
  if (hasType(e, "spa") || anyWord(e.name, ["hot spring", "hot springs", "glass", "plumbing"])) return false;
  if (hasType(e, "plumber", "home_goods_store", "hardware_store", "general_contractor")) return false;
  if (osmIs(e, "amenity", "shower") || osmIs(e, "shower", "yes", "hot")) return true;
  const words = nameOrText(e);
  if ((hasType(e, "gas_station") || osmIs(e, "amenity", "fuel")) &&
    (anyWord(words, ["shower", "showers"]) || anyWord(e.name, ["truck stop", "travel center", "travel centre", "travel plaza", "love's", "pilot", "flying j"])))
    return true;
  if ((hasType(e, "campground", "rv_park") || osmIs(e, "tourism", "camp_site", "caravan_site")) &&
    anyWord(words, ["shower", "showers", "shower house", "bathhouse"]))
    return true;
  if (hasType(e, "gym") || osmIs(e, "leisure", "sports_centre", "fitness_centre") || anyWord(e.name, ["rec center", "recreation center", "community center"]))
    return true;
  return anyWord(e.name, ["public shower", "public showers"]);
};

const isFood: Rule = (e) =>
  hasType(e, ...FOOD_TYPES) ||
  osmIs(e, "amenity", ...OSM_FOOD) ||
  osmIs(e, "shop", "bakery", "supermarket", "grocery", "greengrocer", "deli", "farm") ||
  // a bar/brewery only counts when it actually lists food
  (hasType(e, "bar") && anyWord(nameOrText(e), ["kitchen", "grill", "pizza", "burgers", "food", "eatery", "taproom & kitchen"]));

const isFuel: Rule = (e) =>
  hasType(e, "gas_station") || osmIs(e, "amenity", "fuel") || isPropane(e);

const isWifi: Rule = (e) => {
  if (hasType(e, "library") || osmIs(e, "amenity", "library")) return true;
  if (osmIs(e, "internet_access", "wlan", "yes", "wifi")) return true;
  const advertises = anyWord(nameOrText(e), ["wifi", "wi-fi", "free wifi", "internet"]);
  return advertises && (hasType(e, "cafe", "campground", "rv_park") || osmIs(e, "amenity", "cafe") || osmIs(e, "tourism", "camp_site", "caravan_site"));
};

const isLaundry: Rule = (e) => {
  const words = nameOrText(e);
  if (osmIs(e, "shop", "dry_cleaning")) return false;
  if (anyWord(e.name, ["dry cleaner", "dry cleaners", "dry cleaning", "cleaners", "tailor"]) && !anyWord(words, ["laundromat", "coin laundry", "self-serve", "self serve"]))
    return false;
  if (osmIs(e, "amenity", "laundry")) return true;
  if (osmIs(e, "shop", "laundry")) return !osmIs(e, "self_service", "no");
  return hasType(e, "laundry") || anyWord(e.name, ["laundromat", "coin laundry", "washateria"]);
};

const isAdventure: Rule = (e) => {
  if (hasType(e, "amusement_park", "playground", "school") || osmIs(e, "leisure", "playground") || anyWord(e.name, ["playground", "dog park"]))
    return false;
  if (osmIs(e, "tourism", "viewpoint") || osmIs(e, "highway", "trailhead") || osmIs(e, "leisure", "nature_reserve", "fishing", "slipway") ||
    osmIs(e, "boundary", "protected_area", "national_park") || osmIs(e, "natural", "hot_spring", "peak"))
    return true;
  if (hasType(e, "natural_feature")) return true;
  const words = [
    "trailhead", "trail", "trails", "fishing", "fishing access", "boat ramp", "overlook", "viewpoint", "vista", "scenic",
    "hot spring", "hot springs", "atv", "ohv", "jeep", "rafting", "whitewater", "float trip", "national forest",
    "national park", "national monument", "recreation area", "wilderness", "state park", "state wildlife area", "blm", "canyon",
  ];
  return hasType(e, "park", "tourist_attraction", "spa", "travel_agency", "campground") && anyWord(e.name, words) &&
    // campgrounds are Sleep by default, not Adventure, unless the name says rec area/hot springs etc.
    !(hasType(e, "campground") && !anyWord(e.name, ["recreation area", "hot springs", "state park", "fishing access"]));
};

const isAdult: Rule = (e) => {
  if (hasType(e, "night_club") || osmIs(e, "amenity", "nightclub")) return false;
  return hasType(e, "bar", "liquor_store", "winery", "brewery", "distillery") ||
    osmIs(e, "amenity", "bar", "pub", "biergarten") ||
    osmIs(e, "craft", "winery", "brewery", "distillery") ||
    osmIs(e, "shop", "wine", "alcohol", "beer") ||
    anyWord(e.name, ["winery", "vineyard", "vineyards", "cellars", "brewery", "brewing", "taproom", "distillery", "pub", "saloon", "tavern"]);
};

// ---------- definitions ----------

export const NEEDS: NeedDef[] = [
  {
    label: "Sleep", icon: "🛏️", detail: "Campgrounds, RV parks, cabins, and motels",
    description: "Legal overnight places: campgrounds, RV parks, cabins, motels, hotels. Not trailheads or day-use parks.",
    synonyms: ["sleep", "camp", "camping", "campground", "stay", "overnight", "motel", "hotel", "cabin", "rv park", "boondock"],
    google: [
      { type: "campground", keyword: "campground" },
      { type: "rv_park", keyword: "rv park" },
      { type: "lodging", keyword: "cabin motel" },
    ],
    osm: ['["tourism"="camp_site"]', '["tourism"="caravan_site"]', '["tourism"="hotel"]', '["tourism"="motel"]', '["tourism"="chalet"]'],
    allowedTypes: ["campground", "rv_park", "lodging"],
    rejectedTypes: ["park", "tourist_attraction"],
    subChips: [],
    matches: (e) => isSleep(e) && !isTrailheadOrDayUse(e),
  },
  {
    label: "Water", icon: "💧", detail: "Potable fill, water and dump/fill stations",
    description: "Potable fill: water stations, dump/fill stations, campgrounds or RV parks that list potable fill. Not lakes, not bottled-water stores, not a campground just for being a campground.",
    synonyms: ["water", "potable", "fill up water", "water fill", "dump station"],
    google: [
      { type: "rv_park", keyword: "potable water fill" },
      { type: "campground", keyword: "potable water" },
      { type: "point_of_interest", keyword: "water fill station" },
      { type: "point_of_interest", keyword: "rv dump station" },
    ],
    osm: ['["amenity"="drinking_water"]', '["amenity"="water_point"]', '["amenity"="sanitary_dump_station"]["drinking_water"="yes"]'],
    allowedTypes: ["campground", "rv_park", "point_of_interest"],
    rejectedTypes: ["natural_feature", "store", "convenience_store", "supermarket"],
    subChips: [],
    matches: isWater,
  },
  {
    label: "Shower", icon: "🚿", detail: "Truck stops, shower houses, gym day passes",
    description: "Truck stops with showers, campground or RV shower houses, gym/rec center day passes, public showers. Not glass or plumbing shops, not hot springs.",
    synonyms: ["shower", "showers", "clean up", "bathhouse"],
    google: [
      { type: "gas_station", keyword: "truck stop showers" },
      { type: "rv_park", keyword: "showers" },
      { type: "campground", keyword: "showers" },
      { type: "gym", keyword: "day pass" },
    ],
    osm: ['["amenity"="shower"]', '["amenity"="fuel"]["shower"="yes"]', '["leisure"="sports_centre"]'],
    allowedTypes: ["gas_station", "rv_park", "campground", "gym"],
    rejectedTypes: ["spa", "plumber", "home_goods_store", "hardware_store", "general_contractor"],
    subChips: [],
    matches: isShower,
  },
  {
    label: "Food", icon: "🍎", detail: "Restaurants, cafes, bakeries, groceries, takeout",
    description: "Restaurants, cafes, bakeries, groceries, takeout. Not bars without food, not liquor stores.",
    synonyms: ["food", "eat", "dinner", "lunch", "breakfast", "hungry", "restaurant", "grocery", "groceries", "takeout", "snack", "snacks"],
    google: [
      { type: "restaurant", keyword: "restaurant" },
      { type: "cafe", keyword: "cafe bakery" },
      { type: "supermarket", keyword: "grocery" },
    ],
    osm: ['["amenity"="restaurant"]', '["amenity"="cafe"]', '["amenity"="fast_food"]', '["shop"="bakery"]', '["shop"="supermarket"]'],
    allowedTypes: FOOD_TYPES,
    rejectedTypes: ["liquor_store", "night_club"],
    subChips: [
      { label: "Groceries", synonyms: ["grocery", "groceries", "resupply"], google: [{ type: "supermarket", keyword: "grocery" }],
        osm: ['["shop"="supermarket"]', '["shop"="grocery"]'],
        matches: (e) => hasType(e, "supermarket", "grocery_or_supermarket") || osmIs(e, "shop", "supermarket", "grocery", "greengrocer") },
      { label: "Sit-down", synonyms: ["sit down", "sit-down"], google: [{ type: "restaurant", keyword: "restaurant" }],
        osm: ['["amenity"="restaurant"]'],
        matches: (e) => hasType(e, "restaurant") || osmIs(e, "amenity", "restaurant") },
      { label: "Coffee", synonyms: ["coffee", "espresso"], google: [{ type: "cafe", keyword: "coffee" }],
        osm: ['["amenity"="cafe"]'],
        matches: (e) => hasType(e, "cafe") || osmIs(e, "amenity", "cafe") || anyWord(e.name, ["coffee", "espresso"]) },
    ],
    matches: (e) => isFood(e) && !(hasType(e, "liquor_store") && !hasType(e, ...FOOD_TYPES)),
  },
  {
    label: "Fuel", icon: "⛽", detail: "Gas and diesel, propane",
    description: "Gas and diesel, with a propane sub-chip. Not EV charging, not auto repair.",
    synonyms: ["fuel", "gas", "diesel", "fill up", "gas station"],
    google: [{ type: "gas_station", keyword: "gas station diesel" }],
    osm: ['["amenity"="fuel"]'],
    allowedTypes: ["gas_station"],
    rejectedTypes: ["car_repair", "electric_vehicle_charging_station", "car_dealer"],
    subChips: [
      { label: "Propane", synonyms: ["propane", "lpg"], google: [{ type: "gas_station", keyword: "propane" }, { type: "point_of_interest", keyword: "propane refill" }],
        osm: ['["fuel:lpg"="yes"]', '["shop"="gas"]'], matches: isPropane },
    ],
    matches: (e) => isFuel(e) && !(hasType(e, "car_repair") && !hasType(e, "gas_station")),
  },
  {
    label: "Power", icon: "⚡", detail: "RV electric hookups, EV chargers",
    description: "RV electric hookups, with an EV charger sub-chip. Not hardware stores.",
    synonyms: ["power", "hookup", "hookups", "electric", "plug in", "ev", "charger", "charging"],
    google: [{ type: "rv_park", keyword: "full hookups electric" }, { type: "campground", keyword: "electric hookups" }],
    osm: ['["tourism"="caravan_site"]["power_supply"="yes"]', '["tourism"="camp_site"]["power_supply"="yes"]'],
    allowedTypes: ["rv_park", "campground", "electric_vehicle_charging_station"],
    rejectedTypes: ["hardware_store", "electrician", "home_goods_store"],
    subChips: [
      { label: "RV hookups", synonyms: ["hookup", "hookups", "30 amp", "50 amp"], google: [{ type: "rv_park", keyword: "full hookups electric" }],
        osm: ['["tourism"="caravan_site"]["power_supply"="yes"]', '["tourism"="camp_site"]["power_supply"="yes"]'], matches: isRvHookup },
      { label: "EV charger", synonyms: ["ev", "ev charger", "tesla", "supercharger", "charging station"],
        google: [{ type: "electric_vehicle_charging_station", keyword: "ev charging" }],
        osm: ['["amenity"="charging_station"]'], matches: isEvCharger },
    ],
    matches: (e) => !hasType(e, "hardware_store") && (isRvHookup(e) || isEvCharger(e)),
  },
  {
    label: WIFI, icon: "📶", detail: "Libraries, Wi‑Fi cafes, campgrounds with Wi‑Fi",
    description: "Libraries, cafes that advertise Wi-Fi, campgrounds with Wi-Fi. Cell signal comes only from scout data. Not every cafe.",
    synonyms: ["wifi", "wi-fi", "internet", "signal", "cell", "work remote", "library"],
    google: [{ type: "library", keyword: "library" }, { type: "cafe", keyword: "wifi" }, { type: "rv_park", keyword: "wifi" }],
    osm: ['["amenity"="library"]', '["internet_access"="wlan"]'],
    allowedTypes: ["library", "cafe", "campground", "rv_park"],
    rejectedTypes: [],
    subChips: [],
    matches: isWifi,
  },
  {
    label: "Laundry", icon: "🧺", detail: "Self-serve washers and dryers",
    description: "Self-serve washers and dryers. Not dry cleaners.",
    synonyms: ["laundry", "laundromat", "wash clothes", "washer", "dryer"],
    google: [{ type: "laundry", keyword: "laundromat coin laundry" }],
    osm: ['["amenity"="laundry"]', '["shop"="laundry"]'],
    allowedTypes: ["laundry"],
    rejectedTypes: [],
    subChips: [],
    matches: isLaundry,
  },
  {
    label: "Dog Needs", icon: "🐾", detail: "Vets, dog parks, supplies, patios, off-leash",
    description: "Strict sub-chips: Vet (clinics and emergency hospitals only), Dog park (official only), Supplies (pet and feed stores), Pet-friendly patio (stays orange unless a scout confirms), Off-leash.",
    synonyms: ["dog", "dogs", "pup", "puppy", "pet", "pets"],
    google: [
      { type: "veterinary_care", keyword: "veterinarian" },
      { type: "park", keyword: "dog park" },
      { type: "pet_store", keyword: "pet store" },
    ],
    osm: ['["amenity"="veterinary"]', '["leisure"="dog_park"]', '["shop"="pet"]'],
    allowedTypes: ["veterinary_care", "pet_store", "park", "dog_park"],
    rejectedTypes: [],
    subChips: [
      { label: "Vet", synonyms: ["vet", "vets", "veterinarian", "animal hospital", "emergency vet"],
        google: [{ type: "veterinary_care", keyword: "veterinarian animal hospital" }], osm: ['["amenity"="veterinary"]'], matches: isVet },
      { label: "Dog park", synonyms: ["dog park", "bark park"], google: [{ type: "park", keyword: "dog park" }],
        osm: ['["leisure"="dog_park"]'], matches: isDogPark },
      { label: "Supplies", synonyms: ["pet store", "dog food", "feed store", "pet supplies"],
        google: [{ type: "pet_store", keyword: "pet supplies" }, { type: "store", keyword: "feed store" }],
        osm: ['["shop"="pet"]', '["shop"="agrarian"]'], matches: isPetSupplies },
      { label: "Pet-friendly patio", synonyms: ["dog friendly patio", "pet friendly patio", "dog-friendly patio"],
        google: [{ type: "restaurant", keyword: "dog friendly patio" }],
        osm: ['["amenity"="restaurant"]["dog"="yes"]', '["amenity"="cafe"]["dog"="yes"]'], matches: isPetPatio },
      { label: "Off-leash", synonyms: ["off leash", "off-leash"], google: [{ type: "park", keyword: "off leash dog park" }],
        osm: ['["leisure"="dog_park"]'], matches: isOffLeash },
    ],
    matches: (e) => isVet(e) || isDogPark(e) || isPetSupplies(e) || isPetPatio(e),
  },
  {
    label: "Adventure", icon: "🏔️", detail: "Trailheads, fishing, views, hot springs, ATV, rafting",
    description: "Trailheads, fishing access, viewpoints, hot springs, ATV/jeep, rafting, public lands. Not playgrounds, not campgrounds by default.",
    synonyms: ["adventure", "hike", "hiking", "trail", "trailhead", "fish", "fishing", "atv", "jeep", "raft", "rafting", "hot spring", "hot springs", "view", "overlook"],
    google: [
      { type: "park", keyword: "trailhead" },
      { type: "tourist_attraction", keyword: "fishing access viewpoint" },
      { type: "park", keyword: "national forest recreation area" },
    ],
    osm: ['["highway"="trailhead"]', '["tourism"="viewpoint"]', '["leisure"="nature_reserve"]', '["natural"="hot_spring"]'],
    allowedTypes: ["park", "tourist_attraction", "natural_feature", "spa"],
    rejectedTypes: ["amusement_park", "playground", "school"],
    subChips: [
      { label: "Hike", synonyms: ["hike", "hiking", "trail", "trailhead"], google: [{ type: "park", keyword: "hiking trailhead" }],
        osm: ['["highway"="trailhead"]'], matches: (e) => osmIs(e, "highway", "trailhead") || anyWord(e.name, ["trail", "trails", "trailhead"]) },
      { label: "Fish", synonyms: ["fish", "fishing"], google: [{ type: "park", keyword: "fishing access" }],
        osm: ['["leisure"="fishing"]'], matches: (e) => osmIs(e, "leisure", "fishing") || anyWord(e.name, ["fishing", "fishing access", "boat ramp", "anglers"]) },
      { label: "View", synonyms: ["view", "views", "overlook", "viewpoint", "scenic"], google: [{ type: "tourist_attraction", keyword: "viewpoint overlook" }],
        osm: ['["tourism"="viewpoint"]'], matches: (e) => osmIs(e, "tourism", "viewpoint") || anyWord(e.name, ["overlook", "viewpoint", "vista", "scenic"]) },
      { label: "Hot springs", synonyms: ["hot spring", "hot springs", "soak"], google: [{ type: "tourist_attraction", keyword: "hot springs" }],
        osm: ['["natural"="hot_spring"]'], matches: (e) => osmIs(e, "natural", "hot_spring") || anyWord(e.name, ["hot spring", "hot springs"]) },
      { label: "ATV", synonyms: ["atv", "ohv", "jeep", "side by side", "utv"], google: [{ type: "tourist_attraction", keyword: "atv jeep trail" }],
        osm: ['["highway"="track"]["atv"="yes"]'], matches: (e) => anyWord(nameOrText(e), ["atv", "ohv", "jeep", "utv", "off-road", "off road"]) },
      { label: "Rafting", synonyms: ["raft", "rafting", "whitewater", "float"], google: [{ type: "tourist_attraction", keyword: "rafting" }],
        osm: ['["sport"="canoe"]'], matches: (e) => anyWord(nameOrText(e), ["rafting", "whitewater", "raft", "float trip"]) },
    ],
    matches: isAdventure,
  },
  {
    label: "Adult-friendly", icon: "🍷", detail: "Wineries, breweries, distilleries, bars, liquor",
    description: "Wineries, breweries, distilleries, bars/pubs, liquor/wine shops. No night clubs.",
    synonyms: ["adult", "drink", "drinks", "bar", "beer", "wine", "brewery", "winery", "cocktail", "cocktails", "liquor", "distillery", "pub"],
    google: [
      { type: "bar", keyword: "bar brewery" },
      { type: "liquor_store", keyword: "liquor wine" },
      { type: "point_of_interest", keyword: "winery tasting room" },
    ],
    osm: ['["craft"="winery"]', '["craft"="brewery"]', '["craft"="distillery"]', '["shop"="wine"]', '["shop"="alcohol"]', '["amenity"="bar"]', '["amenity"="pub"]'],
    allowedTypes: ["bar", "liquor_store", "winery", "brewery", "distillery"],
    rejectedTypes: ["night_club"],
    subChips: [
      { label: "Golf carts", synonyms: ["golf cart", "golf carts"], google: [{ type: "bar", keyword: "golf cart" }],
        osm: [], matches: (e) => anyWord(nameOrText(e), ["golf cart", "golf carts"]) },
      { label: "Brewery", synonyms: ["brewery", "beer", "taproom"], google: [{ type: "bar", keyword: "brewery" }],
        osm: ['["craft"="brewery"]'], matches: (e) => hasType(e, "brewery") || osmIs(e, "craft", "brewery") || anyWord(e.name, ["brewery", "brewing", "taproom", "brewpub"]) },
      { label: "Winery", synonyms: ["winery", "wine", "tasting room", "vineyard"], google: [{ type: "point_of_interest", keyword: "winery tasting" }],
        osm: ['["craft"="winery"]', '["shop"="wine"]'], matches: (e) => hasType(e, "winery") || osmIs(e, "craft", "winery") || osmIs(e, "shop", "wine") || anyWord(e.name, ["winery", "vineyard", "vineyards", "cellars", "wine"]) },
      { label: "Cocktails", synonyms: ["cocktail", "cocktails", "distillery"], google: [{ type: "bar", keyword: "cocktail bar" }],
        osm: ['["craft"="distillery"]', '["amenity"="bar"]'], matches: (e) => osmIs(e, "craft", "distillery") || anyWord(nameOrText(e), ["cocktail", "cocktails", "distillery", "spirits", "lounge"]) },
      { label: "Patio", synonyms: ["patio", "outdoor seating", "beer garden"], google: [{ type: "bar", keyword: "patio" }],
        osm: ['["amenity"="biergarten"]', '["outdoor_seating"="yes"]["amenity"="bar"]'],
        matches: (e) => osmIs(e, "amenity", "biergarten") || osmIs(e, "outdoor_seating", "yes") || anyWord(nameOrText(e), ["patio", "beer garden", "outdoor seating", "deck"]) },
    ],
    matches: isAdult,
  },
];

export const NEED_BY_LABEL: Record<string, NeedDef> = Object.fromEntries(NEEDS.map((n) => [n.label, n]));

export function iconForNeed(label?: string): string {
  return (label && NEED_BY_LABEL[label]?.icon) || "📍";
}

function evidenceFor(place: PlaceFacts): Evidence {
  return {
    types: new Set((place.types || []).map((t) => t.toLowerCase())),
    osm: place.osmTags || {},
    name: (place.name || "").toLowerCase(),
    text: (place.text || "").toLowerCase(),
  };
}

function rejectedFor(def: NeedDef, e: Evidence) {
  // A rejected type disqualifies unless the place also carries an allowed type.
  return def.rejectedTypes.some((t) => e.types.has(t)) && !def.allowedTypes.some((t) => e.types.has(t));
}

/**
 * Decide which needs (and sub-chips) a place actually satisfies, from its own
 * types / tags / listing text. Order of helpsWith follows NEEDS order.
 */
export function classify(place: PlaceFacts): Classification {
  const e = evidenceFor(place);
  const helpsWith: NeedLabel[] = [];
  const subChips: string[] = [];
  for (const def of NEEDS) {
    if (rejectedFor(def, e)) continue;
    const subs = def.subChips.filter((s) => s.matches(e)).map((s) => s.label);
    if (def.matches(e)) {
      helpsWith.push(def.label);
      subChips.push(...subs);
    }
  }
  return { helpsWith, subChips };
}

/** Sub-chips picked for a need, from the free-form refinement list the UI keeps. */
export function pickedSubChips(needs: string[], refinements: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const lower = refinements.map((r) => r.trim().toLowerCase());
  for (const need of needs) {
    const def = NEED_BY_LABEL[need];
    if (!def) continue;
    const picked = def.subChips.filter((s) => lower.includes(s.label.toLowerCase())).map((s) => s.label);
    if (picked.length) out[need] = picked;
  }
  return out;
}

/**
 * Which of the picked needs this place really covers. Respects sub-chips:
 * if Dog Needs → Vet is picked, a dog park does not cover Dog Needs.
 */
export function coverage(
  place: { helpsWith?: string[]; subChips?: string[] },
  needs: string[],
  subs: Record<string, string[]> = {},
): string[] {
  const helps = place.helpsWith || [];
  const placeSubs = place.subChips || [];
  return needs.filter((need) => {
    if (!helps.includes(need)) return false;
    const wanted = subs[need];
    if (!wanted?.length) return true;
    return wanted.some((s) => placeSubs.includes(s)); // OR within a need's sub-chips
  });
}

/**
 * The chip filter. OR across needs. A place with no helpsWith never passes
 * when any need is picked.
 */
export function passesNeedFilter(
  place: { helpsWith?: string[]; subChips?: string[] },
  needs: string[],
  subs: Record<string, string[]> = {},
): boolean {
  if (needs.length === 0) return true;
  return coverage(place, needs, subs).length > 0;
}

/** "Food + Water here" when a place covers 2+ picked needs, else null. */
export function comboBadge(covered: string[]): string | null {
  return covered.length >= 2 ? `${covered.join(" + ")} here` : null;
}

/** talk-to-ROMI: whole-word synonym match → needs and sub-chips. */
export function needsFromText(text: string): { needs: NeedLabel[]; subChips: string[] } {
  const needs = new Set<NeedLabel>();
  const subChips: string[] = [];
  for (const def of NEEDS) {
    if (def.synonyms.some((w) => hasWord(text, w))) needs.add(def.label);
    for (const sub of def.subChips) {
      if ([sub.label, ...sub.synonyms].some((w) => hasWord(text, w))) {
        needs.add(def.label);
        subChips.push(sub.label);
      }
    }
  }
  return { needs: [...needs], subChips };
}

/**
 * FUTURE multi-stop route planner (not built — data shape only).
 * Each stop candidate needs: stable id, lat/lng, helpsWith + subChips from
 * classify(), coverage against the trip's needs, verified (teal) vs lead
 * (orange), and opening hours as structured periods (not just a string) so a
 * planner can check "open when I arrive". Plus rig constraints a scout knows
 * (pullThrough, maxRigLengthFt, gravel/switchbacks) and the order along the
 * route (distance from start along the polyline, detour minutes).
 */
export type RouteStopCandidate = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  helpsWith: NeedLabel[];
  subChips: string[];
  covers: string[];
  status: "verified" | "google";
  hoursPeriods?: Array<{ day: number; open: string; close: string }>;
  pullThrough?: boolean;
  maxRigLengthFt?: number;
  roadNotes?: string;
  alongRouteMiles?: number;
  detourMinutes?: number;
};
