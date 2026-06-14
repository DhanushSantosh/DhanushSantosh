"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerformanceMonitor, Preload, usePerformanceMonitor, type PerformanceMonitorApi } from "@react-three/drei";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";
import { withDynamicModel } from "@/components/DynamicModelLoader";
import { seededRange } from "@/components/sculptureMath";

const PERFORMANCE_FACTOR_MIN = 0;
const PERFORMANCE_FACTOR_MAX = 1;

type FloatingShape = {
  position: THREE.Vector3;
  rotation: THREE.Vector3;
  scale: number;
  speed: number;
  type: 0 | 1 | 2;
};

function PerformanceTuner({ minDpr, maxDpr }: { minDpr: number; maxDpr: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const applyPerformanceChange = useCallback(
    (api: PerformanceMonitorApi) => {
      const factor = THREE.MathUtils.clamp(api.factor, PERFORMANCE_FACTOR_MIN, PERFORMANCE_FACTOR_MAX);
      setDpr(THREE.MathUtils.lerp(minDpr, maxDpr, factor));
    },
    [maxDpr, minDpr, setDpr],
  );

  usePerformanceMonitor({ onChange: applyPerformanceChange, onFallback: applyPerformanceChange });
  return null;
}

function createShapes(count: number): FloatingShape[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = index * 8 + 1;

    return {
      position: new THREE.Vector3(
        seededRange(seed, -10, 10),
        seededRange(seed + 1, -7.5, 7.5),
        seededRange(seed + 2, -10, 0),
      ),
      rotation: new THREE.Vector3(
        seededRange(seed + 3, 0, Math.PI),
        seededRange(seed + 4, 0, Math.PI),
        seededRange(seed + 5, 0, Math.PI),
      ),
      scale: seededRange(seed + 6, 0.2, 0.7),
      speed: seededRange(seed + 7, 0.1, 0.3),
      type: Math.floor(seededRange(seed + 8, 0, 3)) as 0 | 1 | 2,
    };
  });
}

function FloatingGeometry({ quality }: { quality: "full" | "lite" }) {
  const groupRef = useRef<THREE.Group>(null);
  const count = quality === "lite" ? 15 : 30;

  const shapes = useMemo(() => createShapes(count), [count]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, index) => {
      const shape = shapes[index];
      child.rotation.x += delta * shape.speed;
      child.rotation.y += delta * shape.speed * 1.5;
      child.position.y += Math.sin(state.clock.getElapsedTime() * shape.speed + index) * 0.01;
    });
  });

  return (
    <group ref={groupRef}>
      {shapes.map((shape, index) => {
        let geometry;
        if (shape.type === 0) geometry = <boxGeometry args={[1, 1, 1]} />;
        else if (shape.type === 1) geometry = <octahedronGeometry args={[0.8, 0]} />;
        else geometry = <torusGeometry args={[0.6, 0.15, 16, 32]} />;

        return (
          <mesh
            key={index}
            position={shape.position}
            rotation={[shape.rotation.x, shape.rotation.y, shape.rotation.z]}
            scale={shape.scale}
          >
            {geometry}
            <meshStandardMaterial
              color="#5fe1ff"
              wireframe
              transparent
              opacity={0.7}
              emissive="#5fe1ff"
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function StatsSculpture({ quality = "full" }: { quality?: "full" | "lite" }) {
  const dprMax = quality === "lite" ? 2 : 3;
  const maxDeviceDpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, dprMax) : dprMax;

  return (
    <div className="absolute inset-0 -z-10 h-full w-full bg-black pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        dpr={maxDeviceDpr}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        className="h-full w-full"
      >
        <PerformanceMonitor>
          <PerformanceTuner minDpr={1} maxDpr={maxDeviceDpr} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <FloatingGeometry quality={quality} />
          <AdaptiveEvents />
          <Preload all />
        </PerformanceMonitor>
      </Canvas>
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-transparent to-black/80" />
    </div>
  );
}

const Fallback = () => (
  <div className="absolute inset-0 -z-10 bg-black pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-[#0a1526] to-black opacity-50" />
  </div>
);

export const ClientStatsSculpture = withDynamicModel({
  loader: () => import("@/components/StatsSculpture"),
  fallback: <Fallback />,
});

export default StatsSculpture;
