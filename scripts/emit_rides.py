import json
import sys

sys.path.insert(0, "scripts")

from gen_rides import RIDES as P1
from gen_rides2 import RIDES2 as P2

ALL = P1 + P2


def interp(a, b, n=2):
    lat1, lng1 = a[1], a[2]
    lat2, lng2 = b[1], b[2]
    pts = []
    for i in range(1, n + 1):
        f = i / (n + 1)
        pts.append([round(lat1 + (lat2 - lat1) * f, 4), round(lng1 + (lng2 - lng1) * f, 4)])
    return pts


def ts_str(s):
    return json.dumps(s)


def route_for(stops):
    route = []
    for i, stop in enumerate(stops):
        if i > 0:
            route.extend(interp(stops[i - 1], stop))
        route.append([stop[1], stop[2]])
    return route


out = []
out.append('import type { NewTrip } from "../src/db/schema";')
out.append("")
out.append("// 54 curated rides, generated to complement the 6 original seed trips.")
out.append("export const seedRides: NewTrip[] = [")
for slug, name, continent, country, state, region, miles, hours, mood, cat, diff, season, desc, stops in ALL:
    out.append("  {")
    out.append(f"    slug: {ts_str(slug)},")
    out.append(f"    name: {ts_str(name)},")
    out.append(f"    continent: {ts_str(continent)},")
    out.append(f"    country: {ts_str(country)},")
    out.append(f"    stateProvince: {ts_str(state)},")
    if region:
        out.append(f"    region: {ts_str(region)},")
    out.append(f"    miles: {miles},")
    out.append(f"    durationHours: {hours},")
    out.append(f"    category: {ts_str(cat)},")
    out.append(f"    moodTag: {ts_str(mood)},")
    out.append(f"    difficulty: {diff},")
    out.append(f"    bestSeason: {ts_str(season)},")
    out.append(f"    description: {ts_str(desc)},")
    out.append("    stops: [")
    for name, lat, lng in stops:
        out.append(f"      {{ name: {ts_str(name)}, lat: {lat}, lng: {lng} }},")
    out.append("    ],")
    out.append("    route: [")
    for lat, lng in route_for(stops):
        out.append(f"      [{lat}, {lng}],")
    out.append("    ],")
    out.append("  },")
out.append("];")
out.append("")

with open("scripts/seed-rides.ts", "w") as f:
    f.write("\n".join(out))

# sanity
counts = {}
for r in ALL:
    counts[r[2]] = counts.get(r[2], 0) + 1
print(counts)
