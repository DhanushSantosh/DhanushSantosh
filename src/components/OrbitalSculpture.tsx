"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const markers = [
  { lat: 40.7128, lon: -74, label: "NYC" },
  { lat: 51.5072, lon: -0.1276, label: "LON" },
  { lat: 35.6762, lon: 139.6503, label: "TOK" },
  { lat: -33.8688, lon: 151.2093, label: "SYD" },
  { lat: 37.7749, lon: -122.4194, label: "SFO" },
  { lat: -23.5505, lon: -46.6333, label: "SAO" },
  { lat: 48.8566, lon: 2.3522, label: "PAR" },
  { lat: 52.52, lon: 13.405, label: "BER" },
  { lat: 1.3521, lon: 103.8198, label: "SGP" },
  { lat: 25.2048, lon: 55.2708, label: "DXB" },
  { lat: -1.2921, lon: 36.8219, label: "NRB" },
  { lat: 43.6532, lon: -79.3832, label: "TOR" },
];

const manualArcCoords: Array<[number, number, number, number]> = [
  [40.7128, -74, 51.5072, -0.1276],
  [51.5072, -0.1276, 35.6762, 139.6503],
  [35.6762, 139.6503, -33.8688, 151.2093],
  [-33.8688, 151.2093, 40.7128, -74],
  [51.5072, -0.1276, -33.8688, 151.2093],
  [35.6762, 139.6503, 40.7128, -74],
  [37.7749, -122.4194, -33.8688, 151.2093],
  [-1.2921, 36.8219, 35.6762, 139.6503],
  [25.2048, 55.2708, 51.5072, -0.1276],
  [-23.5505, -46.6333, 40.7128, -74],
  [48.8566, 2.3522, 52.52, 13.405],
  [1.3521, 103.8198, 37.7749, -122.4194],
  [43.6532, -79.3832, 25.2048, 55.2708],
  [-33.8688, 151.2093, 52.52, 13.405],
  [-1.2921, 36.8219, 25.2048, 55.2708],
];

const pairwiseArcCoords: Array<[number, number, number, number]> = markers.flatMap(
  (source, index) =>
    markers.slice(index + 1).map((target) => [
      source.lat,
      source.lon,
      target.lat,
      target.lon,
    ]),
);

const gridLatitudes = [-70, -40, -10, 20, 45];
const gridLongitudes = Array.from({ length: 12 }, (_, index) => -180 + index * 30);

const gridArcCoords: Array<[number, number, number, number]> = [];

gridLatitudes.forEach((lat, latIndex) => {
  gridLongitudes.forEach((lon, lonIndex) => {
    const targetLon = gridLongitudes[(lonIndex + 2) % gridLongitudes.length];
    const targetLat = gridLatitudes[(latIndex + 1) % gridLatitudes.length];
    gridArcCoords.push([lat, lon, lat, targetLon]);
    gridArcCoords.push([lat, lon, targetLat, targetLon]);
  });
});

const arcs: Array<[number, number, number, number]> = Array.from(
  new Map(
    [...manualArcCoords, ...pairwiseArcCoords, ...gridArcCoords].map((coords) => [
      coords.join(","),
      coords,
    ]),
  ).values(),
);

const globeRadius = 1.65;

function latLonToVector(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

function GlobeBody() {
  const sphereRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group ref={sphereRef}>
      <mesh>
        <sphereGeometry args={[globeRadius, 128, 128]} />
        <meshStandardMaterial
          color="#05060a"
          metalness={0.3}
          roughness={0.4}
          emissive="#060b1d"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[globeRadius + 0.005, 128, 128]} />
        <meshStandardMaterial
          color="#5fe1ff"
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
      <mesh scale={1.07}>
        <sphereGeometry args={[globeRadius * 1.08, 64, 64]} />
        <meshBasicMaterial
          color="#5fe1ff"
          transparent
          opacity={0.09}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

function MarkerNetwork() {
  const pulse = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (pulse.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.15;
      pulse.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={pulse}>
      {markers.map((marker) => {
        const position = latLonToVector(marker.lat, marker.lon, globeRadius + 0.02);
        return (
          <group key={marker.label} position={position}>
            <mesh>
              <sphereGeometry args={[0.04, 16, 16]} />
              <meshStandardMaterial color="#5fe1ff" emissive="#5fe1ff" emissiveIntensity={0.3} />
            </mesh>
            <mesh scale={2}>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color="#5fe1ff" transparent opacity={0.2} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function ArcConnections() {
  const lines = useMemo(() => {
    return arcs.map(([lat1, lon1, lat2, lon2]) => {
      const start = latLonToVector(lat1, lon1, globeRadius + 0.02);
      const end = latLonToVector(lat2, lon2, globeRadius + 0.02);
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      const height = Math.min(distance * 0.3, 1.2);
      const control = mid.normalize().multiplyScalar(globeRadius + height);

      const curve = new THREE.QuadraticBezierCurve3(start, control, end);
      const points = curve.getPoints(64);
      return points;
    });
  }, []);

  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= lines.length) return prev;
        return prev + 2;
      });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [lines.length]);

  return (
    <>
      {lines.slice(0, visibleCount).map((points, index) => (
        <Line
          key={`${index}-${points.length}`}
          points={points}
          color="#5fe1ff"
          lineWidth={1}
          dashed
          dashSize={0.2}
          gapSize={0.1}
          transparent
          opacity={0.4}
        />
      ))}
    </>
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
        <GlobeBody />
        <MarkerNetwork />
        <ArcConnections />
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
