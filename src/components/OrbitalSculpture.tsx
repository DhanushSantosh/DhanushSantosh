"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  AdaptiveEvents,
  Line,
  OrbitControls,
  PerformanceMonitor,
  Preload,
  usePerformanceMonitor,
  type PerformanceMonitorApi,
} from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState, type Ref } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { scheduleIdleTask } from "@/hooks/scheduleIdleTask";

type OrbitalSculptureProps = {
  quality?: "full" | "lite";
};

type WorldLinePaths = Array<Array<[number, number]>>;

const markers = [
  { lat: 40.7128, lon: -74, label: "NYC" },
  { lat: 37.7749, lon: -122.4194, label: "SFO" },
  { lat: 19.4326, lon: -99.1332, label: "MEX" },
  { lat: 51.5072, lon: -0.1276, label: "LON" },
  { lat: 64.1466, lon: -21.9426, label: "REK" },
  { lat: 21.3069, lon: -157.8583, label: "HNL" },
  { lat: 25.2048, lon: 55.2708, label: "DXB" },
  { lat: 28.6139, lon: 77.209, label: "DEL" },
  { lat: 1.3521, lon: 103.8198, label: "SGP" },
  { lat: 37.5665, lon: 126.978, label: "SEO" },
  { lat: 35.6762, lon: 139.6503, label: "TOK" },
  { lat: -33.8688, lon: 151.2093, label: "SYD" },
  { lat: -23.5505, lon: -46.6333, label: "SAO" },
  { lat: -1.2921, lon: 36.8219, label: "NRB" },
  { lat: 5.6037, lon: -0.187, label: "ACC" },
  { lat: -26.2041, lon: 28.0473, label: "JHB" },
  { lat: -75.0, lon: 15.0, label: "ANT" },
];

const markerLookup = Object.fromEntries(markers.map((marker) => [marker.label, marker]));

const arcRoutes: Array<[string, string]> = [
  ["NYC", "SFO"],
  ["NYC", "LON"],
  ["NYC", "REK"],
  ["NYC", "DXB"],
  ["NYC", "DEL"],
  ["REK", "LON"],
  ["REK", "DXB"],
  ["SFO", "TOK"],
  ["SFO", "SYD"],
  ["SFO", "HNL"],
  ["MEX", "SAO"],
  ["MEX", "NYC"],
  ["MEX", "HNL"],
  ["SAO", "JHB"],
  ["JHB", "DXB"],
  ["JHB", "NRB"],
  ["SAO", "SYD"],
  ["DXB", "SGP"],
  ["DXB", "NRB"],
  ["DXB", "DEL"],
  ["DXB", "SYD"],
  ["DEL", "SGP"],
  ["SGP", "TOK"],
  ["TOK", "SEO"],
  ["SEO", "SYD"],
  ["SGP", "SYD"],
  ["NRB", "SGP"],
  ["NYC", "HNL"],
  ["HNL", "TOK"],
  ["HNL", "SYD"],
  ["ACC", "SYD"],
  ["ACC", "LON"],
  ["ACC", "DXB"],
  ["ACC", "NRB"],
  ["REK", "SYD"],
  ["SYD", "ANT"],
  ["JHB", "ANT"],
  ["DEL", "ANT"],
  ["SAO", "ANT"],
];

const arcs: Array<[number, number, number, number]> = arcRoutes
  .map(([from, to]) => {
    const start = markerLookup[from];
    const end = markerLookup[to];
    if (!start || !end) return null;
    return [start.lat, start.lon, end.lat, end.lon] as [number, number, number, number];
  })
  .filter(Boolean) as Array<[number, number, number, number]>;

const globeRadius = 1.65;
const OUTLINE_ELEVATION = 0.01;
const OUTLINE_MIN_POINTS = 2;
const MARKER_ELEVATION = 0.04;
const ARC_ELEVATION = 0.04;
const WORLD_LINES_IDLE_TIMEOUT_MS = 1200;
const WORLD_LINES_FALLBACK_TIMEOUT_MS = 200;
const DETAIL_ENHANCE_IDLE_TIMEOUT_MS = 1200;
const DETAIL_ENHANCE_FALLBACK_TIMEOUT_MS = 200;
const DETAIL_PREWARM_RATIO = 0.7;
const MARKER_PULSE_SPEED = 2;
const MARKER_PULSE_AMPLITUDE = 0.18;
const MARKER_PULSE_PHASE_OFFSET = 0.7;
const MARKER_PULSE_BASE = 1;
const MARKER_ORBIT_ROTATION_SPEED = 1.5;
const MARKER_GLOW_SPEED = 1.4;
const MARKER_GLOW_BASE = 0.4;
const MARKER_GLOW_VARIANCE = 0.15;
const MARKER_GLOW_MIN = 0.2;
const MARKER_GLOW_MAX = 0.6;
const ARC_MIN_COUNT = 6;
const ARC_SPEED_BASE = 0.6;
const ARC_SPEED_STEP = 0.1;
const ARC_SPEED_VARIANTS = 4;
const ARC_DASH_SPEED = 0.3;
const ARC_TRAVEL_SPEED = 0.04;
const ARC_HEIGHT_FACTOR = 0.35;
const ARC_MAX_HEIGHT = 1.35;
const ARC_LINE_WIDTH = 1.2;
const ARC_DASH_SIZE = 0.18;
const ARC_GAP_SIZE = 0.32;
const ARC_TRAVELER_RADIUS = 0.035;
const ARC_TRAVELER_SEGMENTS = 16;
const ARC_PROGRESS_WRAP = 1;
const ARC_PROGRESS_FALLBACK = 0;
const ARC_PROGRESS_HASH_BASE = 31;
const ARC_PROGRESS_HASH_MODULUS = 1_000_000;
const ARC_PROGRESS_HASH_SCALE = 1_000_000;
const ARC_OPACITY = 0.55;
const ARC_EMISSIVE_INTENSITY = 0.9;
const GLOBE_ROTATION_SPEED = 0.08;
const ORBIT_AUTO_ROTATE_SPEED = 0.35;
const PERFORMANCE_FACTOR_MIN = 0;
const PERFORMANCE_FACTOR_MAX = 1;
const PERFORMANCE_UPDATE_MIN_INTERVAL_MS = 600;
const PERFORMANCE_UPDATE_THRESHOLD = 0.08;
const DPR_MIN = 1;
const DPR_MIN_MULTIPLIER = 0.7;
const ARC_DENSITY_MIN = 0;
const ARC_DENSITY_MAX = 1;

function useWorldLines() {
  const [paths, setPaths] = useState<WorldLinePaths | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      import("@/data/worldLines")
        .then((module) => {
          if (!cancelled) {
            setPaths(module.worldLinePaths);
          }
        })
        .catch(() => {
          // Keep map outlines disabled if the data chunk fails to load.
        });
    };

    const cancelIdle = scheduleIdleTask(load, {
      timeoutMs: WORLD_LINES_IDLE_TIMEOUT_MS,
      fallbackMs: WORLD_LINES_FALLBACK_TIMEOUT_MS,
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, []);

  return paths;
}

const qualityPresets = {
  full: {
    surfaceDetail: 200,
    wireDetail: 140, // reduce wireframe rings/meridians for fewer globe lines
    haloDetail: 140,
    arcPoints: 140,
    dprMax: 3,
  },
  lite: {
    surfaceDetail: 120,
    wireDetail: 72,
    haloDetail: 84,
    arcPoints: 80,
    dprMax: 2.25,
  },
} as const;

function scaleDetail(value: number, minValue: number) {
  return Math.max(minValue, Math.round(value * DETAIL_PREWARM_RATIO));
}

function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function getArcKey(coords: [number, number, number, number]) {
  return coords.join("-");
}

function seedArcProgress(key: string) {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * ARC_PROGRESS_HASH_BASE + key.charCodeAt(index)) % ARC_PROGRESS_HASH_MODULUS;
  }
  return (hash % ARC_PROGRESS_HASH_SCALE) / ARC_PROGRESS_HASH_SCALE;
}

function MapOutlines({
  paths,
  color,
  lineWidth,
  opacity,
}: {
  paths: WorldLinePaths | null;
  color: string;
  lineWidth: number;
  opacity: number;
}) {
  const outlineSegments = useMemo(() => {
    if (!paths) return [];
    const points: Array<[number, number, number]> = [];

    paths.forEach((path) => {
      if (path.length < OUTLINE_MIN_POINTS) return;
      for (let index = 0; index < path.length - 1; index += 1) {
        const [latA, lonA] = path[index];
        const [latB, lonB] = path[index + 1];
        const start = latLonToVector(latA, lonA, globeRadius + OUTLINE_ELEVATION);
        const end = latLonToVector(latB, lonB, globeRadius + OUTLINE_ELEVATION);
        points.push([start.x, start.y, start.z], [end.x, end.y, end.z]);
      }
    });

    return points;
  }, [paths]);

  if (!outlineSegments.length) return null;

  return (
    <Line
      points={outlineSegments}
      segments
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      toneMapped={false}
    />
  );
}

function GlobeSurface({
  surfaceDetail,
  wireDetail,
  haloDetail,
}: {
  surfaceDetail: number;
  wireDetail: number;
  haloDetail: number;
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[globeRadius, surfaceDetail, surfaceDetail]} />
        <meshStandardMaterial
          color="#04050c"
          metalness={0.25}
          roughness={0.35}
          emissive="#040714"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[globeRadius + 0.015, wireDetail, wireDetail]} />
        <meshStandardMaterial color="#5fe1ff" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[globeRadius * 1.08, haloDetail, haloDetail]} />
        <meshBasicMaterial color="#5fe1ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

type MeshRef = Ref<THREE.Mesh>;

function CityNode({
  marker,
  ringRef,
  orbitRef,
  glowRef,
}: {
  marker: (typeof markers)[number];
  ringRef: MeshRef;
  orbitRef: MeshRef;
  glowRef: MeshRef;
}) {
  const position = useMemo(
    () => latLonToVector(marker.lat, marker.lon, globeRadius + MARKER_ELEVATION),
    [marker.lat, marker.lon],
  );
  const quaternion = useMemo(() => {
    const direction = position.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  }, [position]);

  return (
    <group position={position} quaternion={quaternion}>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.14, 48]} />
        <meshBasicMaterial color="#5fe1ff" transparent opacity={0.55} />
      </mesh>
      <mesh ref={orbitRef} position={[0, 0.22, 0]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.07, 0.01, 16, 48]} />
        <meshBasicMaterial color="#8cf9ff" transparent opacity={0.6} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color="#5fe1ff" transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.05, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#7ef9ff"
          emissiveIntensity={0.9}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#7ef9ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function MarkerNetwork() {
  const ringRefs = useRef<Array<THREE.Mesh | null>>([]);
  const orbitRefs = useRef<Array<THREE.Mesh | null>>([]);
  const glowRefs = useRef<Array<THREE.Mesh | null>>([]);

  const setRingRef = useCallback(
    (index: number) => (node: THREE.Mesh | null) => {
      ringRefs.current[index] = node;
    },
    [],
  );
  const setOrbitRef = useCallback(
    (index: number) => (node: THREE.Mesh | null) => {
      orbitRefs.current[index] = node;
    },
    [],
  );
  const setGlowRef = useCallback(
    (index: number) => (node: THREE.Mesh | null) => {
      glowRefs.current[index] = node;
    },
    [],
  );

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();

    markers.forEach((_, index) => {
      const ring = ringRefs.current[index];
      if (ring) {
        const pulse =
          MARKER_PULSE_BASE +
          Math.sin(time * MARKER_PULSE_SPEED + index * MARKER_PULSE_PHASE_OFFSET) * MARKER_PULSE_AMPLITUDE;
        ring.scale.setScalar(pulse);
      }

      const orbit = orbitRefs.current[index];
      if (orbit) {
        orbit.rotation.y += delta * MARKER_ORBIT_ROTATION_SPEED;
      }

      const glow = glowRefs.current[index];
      if (glow) {
        const intensity =
          MARKER_GLOW_BASE + Math.sin(time * MARKER_GLOW_SPEED + index) * MARKER_GLOW_VARIANCE;
        (glow.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(
          intensity,
          MARKER_GLOW_MIN,
          MARKER_GLOW_MAX,
        );
      }
    });
  });

  return (
    <group>
      {markers.map((marker, index) => (
        <CityNode
          key={marker.label}
          marker={marker}
          ringRef={setRingRef(index)}
          orbitRef={setOrbitRef(index)}
          glowRef={setGlowRef(index)}
        />
      ))}
    </group>
  );
}

type ArcData = {
  key: string;
  coords: [number, number, number, number];
  points: THREE.Vector3[];
  curve: THREE.QuadraticBezierCurve3;
  dashSpeed: number;
  travelSpeed: number;
};

function buildArcCurve(coords: [number, number, number, number], samples: number) {
  const [lat1, lon1, lat2, lon2] = coords;
  const start = latLonToVector(lat1, lon1, globeRadius + ARC_ELEVATION);
  const end = latLonToVector(lat2, lon2, globeRadius + ARC_ELEVATION);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const distance = start.distanceTo(end);
  const height = Math.min(distance * ARC_HEIGHT_FACTOR, ARC_MAX_HEIGHT);
  const control = mid.normalize().multiplyScalar(globeRadius + height);

  const curve = new THREE.QuadraticBezierCurve3(start, control, end);
  return {
    curve,
    points: curve.getPoints(samples),
  };
}

function updateDashOffset(
  material: THREE.Material | THREE.Material[] | undefined,
  delta: number,
  dashSpeed: number,
) {
  const applyOffset = (target: THREE.Material | undefined) => {
    if (!target) return;
    const shaderMaterial = target as THREE.ShaderMaterial & {
      uniforms?: { dashOffset?: { value: number } };
    };
    if (shaderMaterial.uniforms?.dashOffset) {
      shaderMaterial.uniforms.dashOffset.value -= delta * dashSpeed;
      return;
    }
    const dashMaterial = target as THREE.Material & { dashOffset?: number };
    if (typeof dashMaterial.dashOffset === "number") {
      dashMaterial.dashOffset -= delta * dashSpeed;
    }
  };

  if (Array.isArray(material)) {
    material.forEach(applyOffset);
  } else {
    applyOffset(material);
  }
}

function ArcConnections({ samples, density }: { samples: number; density: number }) {
  const arcData = useMemo<ArcData[]>(() => {
    return arcs.map((coords, index) => {
      const { points, curve } = buildArcCurve(coords, samples);
      const speed = ARC_SPEED_BASE + (index % ARC_SPEED_VARIANTS) * ARC_SPEED_STEP;
      return {
        key: getArcKey(coords),
        coords,
        points,
        curve,
        dashSpeed: speed * ARC_DASH_SPEED,
        travelSpeed: speed * ARC_TRAVEL_SPEED,
      };
    });
  }, [samples]);

  const clampedDensity = useMemo(
    () => THREE.MathUtils.clamp(density, ARC_DENSITY_MIN, ARC_DENSITY_MAX),
    [density],
  );
  const activeCount = useMemo(() => {
    const scaled = Math.max(ARC_MIN_COUNT, Math.round(arcData.length * clampedDensity));
    return Math.min(arcData.length, scaled);
  }, [arcData.length, clampedDensity]);
  const visibleArcs = useMemo(() => arcData.slice(0, activeCount), [arcData, activeCount]);

  const lineRefs = useRef<Array<Line2 | LineSegments2 | null>>([]);
  const travelerRefs = useRef<Array<THREE.Mesh | null>>([]);
  const progressRef = useRef<Record<string, number>>({});

  const setLineRef = useCallback(
    (index: number) => (node: Line2 | LineSegments2 | null) => {
      lineRefs.current[index] = node;
    },
    [],
  );
  const setTravelerRef = useCallback(
    (index: number) => (node: THREE.Mesh | null) => {
      travelerRefs.current[index] = node;
    },
    [],
  );

  useEffect(() => {
    arcData.forEach((arc) => {
      if (progressRef.current[arc.key] === undefined) {
        progressRef.current[arc.key] = seedArcProgress(arc.key);
      }
    });
  }, [arcData]);

  useFrame((_, delta) => {
    visibleArcs.forEach((arc, index) => {
      const line = lineRefs.current[index];
      if (line) {
        updateDashOffset(line.material, delta, arc.dashSpeed);
      }
      const currentProgress = progressRef.current[arc.key] ?? ARC_PROGRESS_FALLBACK;
      const nextProgress = (currentProgress + delta * arc.travelSpeed) % ARC_PROGRESS_WRAP;
      progressRef.current[arc.key] = nextProgress;
      const traveler = travelerRefs.current[index];
      if (traveler) {
        traveler.position.copy(arc.curve.getPoint(nextProgress));
      }
    });
  });

  return (
    <group>
      {visibleArcs.map((arc, index) => (
        <group key={arc.key}>
          <Line
            ref={setLineRef(index)}
            points={arc.points}
            color="#5fe1ff"
            lineWidth={ARC_LINE_WIDTH}
            dashed
            dashSize={ARC_DASH_SIZE}
            gapSize={ARC_GAP_SIZE}
            transparent
            opacity={ARC_OPACITY}
          />
          <mesh ref={setTravelerRef(index)}>
            <sphereGeometry args={[ARC_TRAVELER_RADIUS, ARC_TRAVELER_SEGMENTS, ARC_TRAVELER_SEGMENTS]} />
            <meshStandardMaterial color="#ffffff" emissive="#5fe1ff" emissiveIntensity={ARC_EMISSIVE_INTENSITY} />
          </mesh>
        </group>
      ))}
    </group>
  );
}


function GlobeAssembly({
  surfaceDetail,
  wireDetail,
  haloDetail,
  arcSamples,
  outlineColor,
  outlineOpacity,
  outlineWidth,
  arcDensity,
  outlinePaths,
  showMarkers,
  showArcs,
}: {
  surfaceDetail: number;
  wireDetail: number;
  haloDetail: number;
  arcSamples: number;
  outlineColor: string;
  outlineOpacity: number;
  outlineWidth: number;
  arcDensity: number;
  outlinePaths: WorldLinePaths | null;
  showMarkers: boolean;
  showArcs: boolean;
}) {
  const assemblyRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (assemblyRef.current) {
      // Set initial rotation to load from a different point (180 degrees)
      assemblyRef.current.rotation.y = Math.PI;
    }
  }, []);

  useFrame((_, delta) => {
    if (assemblyRef.current) {
      assemblyRef.current.rotation.y += delta * GLOBE_ROTATION_SPEED;
    }
  });

  return (
    <group ref={assemblyRef}>
      <GlobeSurface surfaceDetail={surfaceDetail} wireDetail={wireDetail} haloDetail={haloDetail} />
      <MapOutlines
        paths={outlinePaths}
        color={outlineColor}
        lineWidth={outlineWidth}
        opacity={outlineOpacity}
      />
      {showMarkers ? <MarkerNetwork /> : null}
      {showArcs ? <ArcConnections samples={arcSamples} density={arcDensity} /> : null}
    </group>
  );
}

type PerformanceTunerProps = {
  minDpr: number;
  maxDpr: number;
};

function PerformanceTuner({ minDpr, maxDpr }: PerformanceTunerProps) {
  const setDpr = useThree((state) => state.setDpr);
  const lastUpdateRef = useRef<{ time: number; factor: number } | null>(null);

  const applyPerformanceChange = useCallback(
    (api: PerformanceMonitorApi) => {
      const factor = THREE.MathUtils.clamp(api.factor, PERFORMANCE_FACTOR_MIN, PERFORMANCE_FACTOR_MAX);
      const now =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : Date.now();
      const lastUpdate = lastUpdateRef.current;
      if (lastUpdate) {
        const delta = Math.abs(factor - lastUpdate.factor);
        if (
          delta < PERFORMANCE_UPDATE_THRESHOLD &&
          now - lastUpdate.time < PERFORMANCE_UPDATE_MIN_INTERVAL_MS
        ) {
          return;
        }
      }
      lastUpdateRef.current = { time: now, factor };
      const nextDpr = THREE.MathUtils.lerp(minDpr, maxDpr, factor);
      setDpr(nextDpr);
    },
    [maxDpr, minDpr, setDpr],
  );

  usePerformanceMonitor({
    onChange: applyPerformanceChange,
    onFallback: applyPerformanceChange,
  });

  return null;
}

export function OrbitalSculpture({ quality = "full" }: OrbitalSculptureProps) {
  const preset = qualityPresets[quality] ?? qualityPresets.full;
  const [isMobile, setIsMobile] = useState(false);
  const [enhancedDetails, setEnhancedDetails] = useState(false);
  const worldLines = useWorldLines();

  useEffect(() => {
    const cancelIdle = scheduleIdleTask(() => setEnhancedDetails(true), {
      timeoutMs: DETAIL_ENHANCE_IDLE_TIMEOUT_MS,
      fallbackMs: DETAIL_ENHANCE_FALLBACK_TIMEOUT_MS,
    });

    return () => cancelIdle();
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const update = (event?: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile((event ?? mql).matches);
    };
    update(mql);

    if (typeof mql.addEventListener === "function") {
      const listener = (event: MediaQueryListEvent) => update(event);
      mql.addEventListener("change", listener);
      return () => mql.removeEventListener("change", listener);
    }
    // Safari fallback
    const legacyListener = (event: MediaQueryListEvent) => update(event);
    mql.addListener(legacyListener);
    return () => mql.removeListener(legacyListener);
  }, []);

  const renderPreset = useMemo(() => {
    if (enhancedDetails || quality !== "full") {
      return preset;
    }
    const minPreset = qualityPresets.lite;
    return {
      ...preset,
      surfaceDetail: scaleDetail(preset.surfaceDetail, minPreset.surfaceDetail),
      wireDetail: scaleDetail(preset.wireDetail, minPreset.wireDetail),
      haloDetail: scaleDetail(preset.haloDetail, minPreset.haloDetail),
      arcPoints: scaleDetail(preset.arcPoints, minPreset.arcPoints),
    };
  }, [enhancedDetails, preset, quality]);

  const dprCap = enhancedDetails
    ? preset.dprMax
    : Math.min(preset.dprMax, qualityPresets.lite.dprMax);
  const maxDeviceDpr =
    typeof window !== "undefined"
      ? Math.min(window.devicePixelRatio || 1, dprCap)
      : dprCap;
  const minDeviceDpr = Math.max(DPR_MIN, maxDeviceDpr * DPR_MIN_MULTIPLIER);
  const outlineColor = isMobile ? "#5ad8f0" : "#6fe6ff";
  const outlineOpacity = isMobile ? 0.22 : 0.35;
  const outlineWidth = isMobile ? 0.72 : 0.9;
  const ambientIntensity = 0.5;
  const directionalIntensity = 1.4;
  const pointIntensity = 0.8;
  const arcDensity = isMobile ? 0.85 : 1.0;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[32px] bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 38 }}
        dpr={maxDeviceDpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="absolute inset-0"
      >
        <PerformanceMonitor>
          <PerformanceTuner
            minDpr={minDeviceDpr}
            maxDpr={maxDeviceDpr}
          />
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={[4, 4, 5]} intensity={directionalIntensity} color="#ffffff" />
          <pointLight position={[-4, -3, -2]} intensity={pointIntensity} color="#5fe1ff" />
          <GlobeAssembly
            surfaceDetail={renderPreset.surfaceDetail}
            wireDetail={renderPreset.wireDetail}
            haloDetail={renderPreset.haloDetail}
            arcSamples={renderPreset.arcPoints}
            outlineColor={outlineColor}
            outlineOpacity={outlineOpacity}
            outlineWidth={outlineWidth}
            arcDensity={arcDensity}
            outlinePaths={worldLines}
            showMarkers={enhancedDetails}
            showArcs={enhancedDetails}
          />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={ORBIT_AUTO_ROTATE_SPEED}
          />
          <AdaptiveEvents />
          <Preload all />
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}

export default OrbitalSculpture;
