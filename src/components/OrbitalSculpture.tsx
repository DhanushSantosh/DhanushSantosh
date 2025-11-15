"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Line2, LineSegments2 } from "three-stdlib";
import { worldLinePaths } from "@/data/worldLines";

const markers = [
  { lat: 40.7128, lon: -74, label: "NYC" },
  { lat: 37.7749, lon: -122.4194, label: "SFO" },
  { lat: 19.4326, lon: -99.1332, label: "MEX" },
  { lat: 51.5072, lon: -0.1276, label: "LON" },
  { lat: 48.8566, lon: 2.3522, label: "PAR" },
  { lat: 52.52, lon: 13.405, label: "BER" },
  { lat: 25.2048, lon: 55.2708, label: "DXB" },
  { lat: 28.6139, lon: 77.209, label: "DEL" },
  { lat: 1.3521, lon: 103.8198, label: "SGP" },
  { lat: 37.5665, lon: 126.978, label: "SEO" },
  { lat: 35.6762, lon: 139.6503, label: "TOK" },
  { lat: -33.8688, lon: 151.2093, label: "SYD" },
  { lat: -23.5505, lon: -46.6333, label: "SAO" },
  { lat: -1.2921, lon: 36.8219, label: "NRB" },
  { lat: -26.2041, lon: 28.0473, label: "JHB" },
  { lat: -75.0, lon: 15.0, label: "ANT" },
];

const markerLookup = Object.fromEntries(markers.map((marker) => [marker.label, marker]));

const arcRoutes: Array<[string, string]> = [
  ["NYC", "SFO"],
  ["NYC", "LON"],
  ["NYC", "DXB"],
  ["NYC", "DEL"],
  ["SFO", "TOK"],
  ["SFO", "SYD"],
  ["MEX", "SAO"],
  ["MEX", "NYC"],
  ["SAO", "JHB"],
  ["JHB", "DXB"],
  ["JHB", "NRB"],
  ["LON", "PAR"],
  ["PAR", "BER"],
  ["BER", "DXB"],
  ["DXB", "SGP"],
  ["DXB", "NRB"],
  ["DXB", "DEL"],
  ["DEL", "SGP"],
  ["SGP", "TOK"],
  ["TOK", "SEO"],
  ["SEO", "SYD"],
  ["SGP", "SYD"],
  ["NRB", "SGP"],
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

function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function MapOutlines() {
  const outlineLines = useMemo(() => {
    return worldLinePaths
      .map((path) =>
        path.map(([lat, lon]) => latLonToVector(lat, lon, globeRadius + 0.01)),
      )
      .filter((points) => points.length >= 2);
  }, []);

  return (
    <group>
      {outlineLines.map((points, index) => (
        <Line
          key={`outline-${index}`}
          points={points}
          color="#5fe1ff"
          lineWidth={0.6}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

function GlobeSurface() {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[globeRadius, 128, 128]} />
        <meshStandardMaterial
          color="#04050c"
          metalness={0.25}
          roughness={0.35}
          emissive="#040714"
          emissiveIntensity={0.25}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[globeRadius + 0.015, 128, 128]} />
        <meshStandardMaterial color="#5fe1ff" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[globeRadius * 1.08, 64, 64]} />
        <meshBasicMaterial color="#5fe1ff" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function CityNode({
  marker,
  index,
}: {
  marker: (typeof markers)[number];
  index: number;
}) {
  const position = useMemo(
    () => latLonToVector(marker.lat, marker.lon, globeRadius + 0.04),
    [marker.lat, marker.lon],
  );
  const quaternion = useMemo(() => {
    const direction = position.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  }, [position]);

  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (ringRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2 + index * 0.7) * 0.18;
      ringRef.current.scale.setScalar(pulse);
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * 1.5;
    }
    if (glowRef.current) {
      const intensity = 0.4 + Math.sin(clock.getElapsedTime() * 1.4 + index) * 0.15;
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.clamp(
        intensity,
        0.2,
        0.6,
      );
    }
  });

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
  return (
    <group>
      {markers.map((marker, index) => (
        <CityNode key={marker.label} marker={marker} index={index} />
      ))}
    </group>
  );
}

function FlowingArc({
  coords,
  speed = 0.6,
}: {
  coords: [number, number, number, number];
  speed?: number;
}) {
  const { points, curve } = useMemo(() => {
    const [lat1, lon1, lat2, lon2] = coords;
    const start = latLonToVector(lat1, lon1, globeRadius + 0.04);
    const end = latLonToVector(lat2, lon2, globeRadius + 0.04);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    const height = Math.min(distance * 0.35, 1.35);
    const control = mid.normalize().multiplyScalar(globeRadius + height);

    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    return {
      curve,
      points: curve.getPoints(72),
    };
  }, [coords]);

  const lineRef = useRef<Line2 | LineSegments2 | null>(null);
  const travelerRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = Math.random();
  }, []);

  useFrame((_, delta) => {
    if (lineRef.current) {
      const rawMaterial = lineRef.current.material;
      const updateDash = (material: THREE.Material | undefined) => {
        if (!material) return;
        const maybeUniforms = material as THREE.ShaderMaterial & {
          uniforms?: { dashOffset?: { value: number } };
        };
        if (maybeUniforms?.uniforms?.dashOffset) {
          maybeUniforms.uniforms.dashOffset.value -= delta * speed * 0.3;
        } else if ("dashOffset" in material) {
          const dashyMaterial = material as THREE.Material & { dashOffset?: number };
          if (typeof dashyMaterial.dashOffset === "number") {
            dashyMaterial.dashOffset -= delta * speed * 0.3;
          }
        }
      };

      if (Array.isArray(rawMaterial)) {
        rawMaterial.forEach(updateDash);
      } else {
        updateDash(rawMaterial);
      }
    }
    progressRef.current = (progressRef.current + delta * speed * 0.04) % 1;
    if (travelerRef.current) {
      travelerRef.current.position.copy(curve.getPoint(progressRef.current));
    }
  });

  return (
    <>
      <Line
        ref={lineRef}
        points={points}
        color="#5fe1ff"
        lineWidth={1.2}
        dashed
        dashSize={0.18}
        gapSize={0.32}
        transparent
        opacity={0.55}
      />
      <mesh ref={travelerRef}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#5fe1ff" emissiveIntensity={0.9} />
      </mesh>
    </>
  );
}

function ArcConnections() {
  return (
    <group>
      {arcs.map((coords, index) => (
        <FlowingArc key={coords.join("-")} coords={coords} speed={0.6 + (index % 4) * 0.1} />
      ))}
    </group>
  );
}

function GlobeAssembly() {
  const assemblyRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (assemblyRef.current) {
      assemblyRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={assemblyRef}>
      <GlobeSurface />
      <MapOutlines />
      <MarkerNetwork />
      <ArcConnections />
    </group>
  );
}

export function OrbitalSculpture() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] overflow-hidden rounded-[32px] bg-black shadow-[0_0_80px_rgba(0,0,0,0.9)]">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 38 }}
        dpr={[1, 2]}
        className="absolute inset-0"
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 5]} intensity={1.4} color="#ffffff" />
        <pointLight position={[-4, -3, -2]} intensity={0.8} color="#5fe1ff" />
        <GlobeAssembly />
        <Sparkles count={40} size={1.5} scale={6} color="#5fe1ff" speed={0.2} opacity={0.25} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
        />
      </Canvas>
    </div>
  );
}

export default OrbitalSculpture;
