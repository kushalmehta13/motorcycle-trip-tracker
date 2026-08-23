import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { getDb } from "../src/db";
import { trips, type NewTrip } from "../src/db/schema";

const seedTrips: NewTrip[] = [
  {
    slug: "tail-of-the-dragon",
    name: "Tail of the Dragon",
    miles: 11,
    durationHours: 0.5,
    moodTag: "Twisty & Technical",
    description:
      "318 curves in 11 miles on the NC/TN line. No intersections, no driveways, nowhere to stop — fill up before you drop in.",
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
    name: "Big Sur Coast Run",
    miles: 62,
    durationHours: 2.5,
    moodTag: "Coastal Cruise",
    description:
      "Ocean on your right for 60 straight miles. Fog rolls in after 3pm and cyclists own the shoulders around Bixby Bridge.",
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
    name: "Blue Ridge Parkway South",
    miles: 74,
    durationHours: 2.2,
    moodTag: "Scenic Chill",
    description:
      "Gentle sweepers at 5,000 ft with long-range mountain views. Empty early in the morning; pack a layer even in July.",
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
    name: "Angeles Crest Highway",
    miles: 40,
    durationHours: 1.6,
    moodTag: "High Desert Sweepers",
    description:
      "Climb straight out of the LA basin to 7,000 ft. Zero services past Red Box and rockfall after storms — eyes up in the corners.",
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
    name: "Needles Highway Loop",
    miles: 32,
    durationHours: 1.3,
    moodTag: "Granite Gauntlet",
    description:
      "Pigtail bridges and tunnels bored through solid granite in the Black Hills. Bison own the road here — they always have right of way.",
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
    name: "Passo dello Stelvio",
    miles: 15,
    durationHours: 0.8,
    moodTag: "Hairpin Heaven",
    description:
      "48 numbered switchbacks up the eastern Alps from Prato. Cold at the summit even in August — gear up before you leave Bormio.",
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
  await db.insert(trips).values(seedTrips).onConflictDoNothing({
    target: trips.slug,
  });

  console.log("Seed complete.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
