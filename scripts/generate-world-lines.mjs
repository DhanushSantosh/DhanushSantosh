import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { feature } from "topojson-client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const sourcePath = require.resolve("world-atlas/countries-110m.json");
const outputPath = resolve(__dirname, "../public/data/world-lines.json");

const topology = JSON.parse(readFileSync(sourcePath, "utf-8"));
const geojson = feature(topology, topology.objects.countries);

const TARGET_POINTS_PER_RING = 60;

const dedupe = new Set();
const worldLines = [];

function simplifyRing(ring) {
  if (!ring || ring.length < 2) return null;
  const step = Math.max(1, Math.floor(ring.length / TARGET_POINTS_PER_RING));
  const simplified = [];
  for (let i = 0; i < ring.length; i += step) {
    simplified.push(ring[i]);
  }
  const lastPoint = ring[ring.length - 1];
  const simplifiedLast = simplified[simplified.length - 1];
  if (
    simplifiedLast[0] !== lastPoint[0] ||
    simplifiedLast[1] !== lastPoint[1]
  ) {
    simplified.push(lastPoint);
  }
  return simplified;
}

function processPolygonCoords(coords) {
  if (!Array.isArray(coords)) return;
  coords.forEach((ring, ringIndex) => {
    if (!ring || !ring.length) return;
    if (ringIndex > 0) return; // skip inner holes for clarity
    const simplified = simplifyRing(ring);
    if (!simplified || simplified.length < 2) return;
    const path = simplified.map(([lon, lat]) => [Number(lat.toFixed(3)), Number(lon.toFixed(3))]);
    const lats = path.map(([lat]) => lat);
    const lons = path.map(([, lon]) => lon);
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lonRange = Math.max(...lons) - Math.min(...lons);
    const approxArea = latRange * lonRange;
    if (approxArea < 1) return;
    const key = path.map(([lat, lon]) => `${lat},${lon}`).join("|");
    if (!dedupe.has(key)) {
      dedupe.add(key);
      worldLines.push(path);
    }
  });
}

for (const feature of geojson.features) {
  const { geometry } = feature;
  if (!geometry) continue;
  const { type, coordinates } = geometry;
  if (type === "Polygon") {
    processPolygonCoords(coordinates);
  } else if (type === "MultiPolygon") {
    coordinates.forEach(processPolygonCoords);
  }
}

writeFileSync(outputPath, `${JSON.stringify(worldLines)}\n`);
console.log(`Created ${worldLines.length} line paths from world-atlas at ${outputPath}`);
