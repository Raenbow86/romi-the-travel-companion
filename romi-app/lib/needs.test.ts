import { test } from "node:test";
import assert from "node:assert/strict";
import { WIFI, classify, comboBadge, coverage, hasWord, needsFromText, passesNeedFilter } from "./needs";

test("whole-word synonyms, not substrings", () => {
  assert.equal(hasWord("barber shop", "bar"), false);
  assert.equal(hasWord("Las Vegas", "gas"), false);
  assert.deepEqual(needsFromText("need a barber").needs, []);
  assert.ok(needsFromText("need gas and a vet").needs.includes("Fuel"));
  assert.deepEqual(needsFromText("need gas and a vet").subChips, ["Vet"]);
});

test("Vet returns vets, never dog parks", () => {
  const vet = classify({ name: "Gunnison Animal Hospital", types: ["veterinary_care", "point_of_interest"] });
  const park = classify({ name: "Salida Dog Park", types: ["park", "point_of_interest"] });
  assert.ok(vet.subChips.includes("Vet"));
  assert.ok(!park.subChips.includes("Vet"));
  assert.ok(park.subChips.includes("Dog park"));
  const subs = { "Dog Needs": ["Vet"] };
  assert.equal(passesNeedFilter(park, ["Dog Needs"], subs), false);
  assert.equal(passesNeedFilter(vet, ["Dog Needs"], subs), true);
});

test("Shower is not Valley Glass and not hot springs", () => {
  assert.ok(!classify({ name: "Valley Glass", types: ["home_goods_store", "point_of_interest"] }).helpsWith.includes("Shower"));
  assert.ok(!classify({ name: "Mt Princeton Hot Springs", types: ["spa", "lodging"] }).helpsWith.includes("Shower"));
  assert.ok(classify({ name: "Love's Travel Stop", types: ["gas_station"], text: "Showers, diesel" }).helpsWith.includes("Shower"));
});

test("Water: campground alone is not potable fill; lakes are not water", () => {
  assert.ok(!classify({ name: "Lodgepole Campground", types: ["campground"] }).helpsWith.includes("Water"));
  assert.ok(classify({ name: "Riverside RV Park", types: ["rv_park"], text: "Potable water fill and dump" }).helpsWith.includes("Water"));
  assert.ok(!classify({ name: "Blue Mesa Reservoir", types: ["natural_feature"] }).helpsWith.includes("Water"));
});

test("Sleep excludes trailheads; Adventure excludes playgrounds and plain campgrounds", () => {
  assert.ok(!classify({ name: "Rainbow Trailhead", types: ["park"] }).helpsWith.includes("Sleep"));
  assert.ok(classify({ name: "Rainbow Trailhead", types: ["park"] }).helpsWith.includes("Adventure"));
  assert.ok(!classify({ name: "Kids Playground", types: ["park"] }).helpsWith.includes("Adventure"));
  assert.ok(!classify({ name: "Lodgepole Campground", types: ["campground"] }).helpsWith.includes("Adventure"));
});

test("Food vs bars/liquor, Adult-friendly excludes night clubs", () => {
  assert.ok(!classify({ name: "Liquor Barn", types: ["liquor_store"] }).helpsWith.includes("Food"));
  assert.ok(classify({ name: "Liquor Barn", types: ["liquor_store"] }).helpsWith.includes("Adult-friendly"));
  assert.ok(!classify({ name: "Club X", types: ["night_club", "bar"] }).helpsWith.includes("Adult-friendly"));
});

test("Fuel is not EV; Power is not hardware; Laundry is not dry cleaners; Wi-Fi not every cafe", () => {
  const ev = classify({ name: "ChargePoint", types: ["electric_vehicle_charging_station"] });
  assert.ok(!ev.helpsWith.includes("Fuel"));
  assert.ok(ev.helpsWith.includes("Power") && ev.subChips.includes("EV charger"));
  assert.ok(!classify({ name: "Ace Hardware", types: ["hardware_store"] }).helpsWith.includes("Power"));
  assert.ok(!classify({ name: "Sparkle Dry Cleaners", types: ["laundry"] }).helpsWith.includes("Laundry"));
  assert.ok(classify({ name: "Suds Laundromat", types: ["laundry"] }).helpsWith.includes("Laundry"));
  assert.ok(!classify({ name: "Bean Cafe", types: ["cafe"] }).helpsWith.includes(WIFI));
  assert.ok(classify({ name: "Bean Cafe", types: ["cafe"], text: "Free WiFi" }).helpsWith.includes(WIFI));
});

test("OSM tags classify too, and no helpsWith never passes a chip", () => {
  assert.ok(classify({ name: "Fill", osmTags: { amenity: "drinking_water" } }).helpsWith.includes("Water"));
  assert.equal(passesNeedFilter({ helpsWith: [] }, ["Food"]), false);
  assert.equal(passesNeedFilter({}, ["Food"]), false);
});

test("combo coverage and badge (Powerstop: Food + Fuel)", () => {
  const p = classify({ name: "The Powerstop", types: ["gas_station", "restaurant"] });
  const cov = coverage(p, ["Food", "Fuel", "Water"]);
  assert.deepEqual(cov, ["Food", "Fuel"]);
  assert.equal(comboBadge(cov), "Food + Fuel here");
  assert.equal(comboBadge(["Food"]), null);
});
