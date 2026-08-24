import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { sql } from "drizzle-orm";
import { getDb } from "../src/db";
import { trips, type NewTrip } from "../src/db/schema";

const seedTrips: NewTrip[] = [
  {
    slug: "tail-of-the-dragon",
    region: "graham-county",
    continent: "north-america",
    country: "usa",
    stateProvince: "north-carolina",
    stops: [
      { name: "Deals Gap, NC", lat: 35.4686, lng: -83.9286 },
      { name: "Tapoco, NC", lat: 35.4838, lng: -83.8778 },
      { name: "Chilhowee Lake, TN", lat: 35.5165, lng: -83.8455 },
    ],
    category: "forest",
    name: "Tail of the Dragon",
    miles: 11,
    durationHours: 0.5,
    moodTag: "Twisty & Technical",
    description:
      "318 curves in 11 miles on the NC/TN line. No intersections, no driveways, nowhere to stop — fill up before you drop in.",
    difficulty: 5,
    bestSeason: "Apr – Oct",
    route: [
      [35.4686, -83.9286],
      [35.4712, -83.918],
      [35.474, -83.9075],
      [35.4768, -83.8968],
      [35.4802, -83.8872],
      [35.4838, -83.8778],
      [35.488, -83.869],
      [35.493, -83.861],
      [35.4985, -83.8545],
      [35.504, -83.85],
      [35.51, -83.847],
      [35.5165, -83.8455],
    ],
  },
  {
    slug: "big-sur-coast-run",
    region: "monterey-county",
    continent: "north-america",
    country: "usa",
    stateProvince: "california",
    stops: [
      { name: "Carmel-by-the-Sea, CA", lat: 36.5552, lng: -121.9233 },
      { name: "Bixby Creek Bridge", lat: 36.3716, lng: -121.9017 },
      { name: "Big Sur, CA", lat: 36.2704, lng: -121.8081 },
      { name: "Lucia, CA", lat: 36.0156, lng: -121.6067 },
    ],
    category: "coastal",
    name: "Big Sur Coast Run",
    miles: 62,
    durationHours: 2.5,
    moodTag: "Coastal Cruise",
    description:
      "Ocean on your right for 60 straight miles. Fog rolls in after 3pm and cyclists own the shoulders around Bixby Bridge.",
    difficulty: 2,
    bestSeason: "Year-round",
    route: [
      [36.5552, -121.9233],
      [36.5398, -121.9384],
      [36.523, -121.943],
      [36.494, -121.938],
      [36.47, -121.935],
      [36.441, -121.926],
      [36.414, -121.916],
      [36.393, -121.906],
      [36.3716, -121.9017],
      [36.343, -121.894],
      [36.31, -121.879],
      [36.287, -121.851],
      [36.2704, -121.8081],
      [36.24, -121.774],
      [36.19, -121.7],
      [36.13, -121.63],
      [36.065, -121.6],
      [36.0156, -121.6067],
    ],
  },
  {
    slug: "blue-ridge-parkway-south",
    region: "buncombe-county",
    continent: "north-america",
    country: "usa",
    stateProvince: "north-carolina",
    stops: [
      { name: "Asheville, NC", lat: 35.568, lng: -82.555 },
      { name: "Mount Pisgah, NC", lat: 35.4802, lng: -82.6238 },
      { name: "Brevard, NC", lat: 35.3002, lng: -82.8201 },
    ],
    category: "mountain",
    name: "Blue Ridge Parkway South",
    miles: 74,
    durationHours: 2.2,
    moodTag: "Scenic Chill",
    description:
      "Gentle sweepers at 5,000 ft with long-range mountain views. Empty early in the morning; pack a layer even in July.",
    difficulty: 2,
    bestSeason: "May – Oct",
    route: [
      [35.568, -82.555],
      [35.5435, -82.5462],
      [35.5203, -82.5712],
      [35.5005, -82.6001],
      [35.4802, -82.6238],
      [35.4598, -82.6412],
      [35.4395, -82.6689],
      [35.4201, -82.7002],
      [35.4013, -82.7245],
      [35.3822, -82.7501],
      [35.3601, -82.7734],
      [35.3398, -82.7912],
      [35.3204, -82.8089],
      [35.3002, -82.8201],
    ],
  },
  {
    slug: "angeles-crest-highway",
    region: "los-angeles-county",
    continent: "north-america",
    country: "usa",
    stateProvince: "california",
    stops: [
      { name: "La Cañada-Flintridge, CA", lat: 34.208, lng: -118.2 },
      { name: "Red Box Junction", lat: 34.298, lng: -118.05 },
      { name: "Newcomb's Ranch", lat: 34.339, lng: -117.86 },
      { name: "Wrightwood, CA", lat: 34.318, lng: -117.74 },
    ],
    category: "mountain",
    name: "Angeles Crest Highway",
    miles: 40,
    durationHours: 1.6,
    moodTag: "High Desert Sweepers",
    description:
      "Climb straight out of the LA basin to 7,000 ft. Zero services past Red Box and rockfall after storms — eyes up in the corners.",
    difficulty: 4,
    bestSeason: "Apr – Nov",
    route: [
      [34.208, -118.2],
      [34.226, -118.14],
      [34.25, -118.1],
      [34.274, -118.075],
      [34.298, -118.05],
      [34.32, -118.01],
      [34.34, -117.96],
      [34.35, -117.91],
      [34.339, -117.86],
      [34.33, -117.82],
      [34.323, -117.78],
      [34.318, -117.74],
    ],
  },
  {
    slug: "needles-highway-loop",
    region: "custer-county",
    continent: "north-america",
    country: "usa",
    stateProvince: "south-dakota",
    stops: [
      { name: "Keystone, SD", lat: 43.878, lng: -103.5 },
      { name: "Needles Eye Tunnel", lat: 43.9312, lng: -103.5648 },
      { name: "Sylvan Lake, SD", lat: 43.9012, lng: -103.6021 },
      { name: "Keystone, SD", lat: 43.8765, lng: -103.5189 },
    ],
    category: "canyon",
    name: "Needles Highway Loop",
    miles: 32,
    durationHours: 1.3,
    moodTag: "Granite Gauntlet",
    description:
      "Pigtail bridges and tunnels bored through solid granite in the Black Hills. Bison own the road here — they always have right of way.",
    difficulty: 3,
    bestSeason: "May – Sep",
    route: [
      [43.878, -103.5],
      [43.8865, -103.5212],
      [43.9001, -103.5389],
      [43.9168, -103.5502],
      [43.9312, -103.5648],
      [43.9375, -103.5812],
      [43.9302, -103.5978],
      [43.9155, -103.6089],
      [43.9012, -103.6021],
      [43.8905, -103.5867],
      [43.8842, -103.5678],
      [43.8798, -103.5423],
      [43.8765, -103.5189],
    ],
  },
  {
    slug: "passo-dello-stelvio",
    region: "bolzano",
    continent: "europe",
    country: "italy",
    stateProvince: "south-tyrol",
    stops: [
      { name: "Prato allo Stelvio, Italy", lat: 46.618, lng: 10.595 },
      { name: "Passo dello Stelvio", lat: 46.5285, lng: 10.4525 },
    ],
    category: "mountain",
    name: "Passo dello Stelvio",
    miles: 15,
    durationHours: 0.8,
    moodTag: "Hairpin Heaven",
    description:
      "48 numbered switchbacks up the eastern Alps from Prato. Cold at the summit even in August — gear up before you leave Bormio.",
    difficulty: 4,
    bestSeason: "Jun – Sep",
    route: [
      [46.618, 10.595],
      [46.605, 10.57],
      [46.592, 10.548],
      [46.579, 10.52],
      [46.567, 10.495],
      [46.556, 10.476],
      [46.545, 10.464],
      [46.5375, 10.4585],
      [46.5285, 10.4525],
    ],
  },
];

async function main() {
  const db = getDb();

  console.log(`Seeding ${seedTrips.length} trips…`);
  await db
    .insert(trips)
    .values(seedTrips)
    .onConflictDoUpdate({
      target: trips.slug,
      set: {
        name: sql`excluded.name`,
        miles: sql`excluded.miles`,
        durationHours: sql`excluded.duration_hours`,
        moodTag: sql`excluded.mood_tag`,
        category: sql`excluded.category`,
        description: sql`excluded.description`,
        difficulty: sql`excluded.difficulty`,
        bestSeason: sql`excluded.best_season`,
        stops: sql`excluded.stops`,
        continent: sql`excluded.continent`,
        country: sql`excluded.country`,
        stateProvince: sql`excluded.state_province`,
        region: sql`excluded.region`,
        route: sql`excluded.route`,
      },
    });

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
