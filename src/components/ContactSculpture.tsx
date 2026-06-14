"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerformanceMonitor, Preload, usePerformanceMonitor, type PerformanceMonitorApi } from "@react-three/drei";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { withDynamicModel } from "@/components/DynamicModelLoader";
import { createParticles } from "@/components/sculptureMath";

const PERFORMANCE_FACTOR_MIN = 0;
const PERFORMANCE_FACTOR_MAX = 1;

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

function NeuralConstellation({ quality }: { quality: "full" | "lite" }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsGeometryRef = useRef<THREE.BufferGeometry>(null);
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null);
  const particlesRef = useRef(createParticles(0, 0));
  const pointPositionsRef = useRef(new Float32Array(0));
  const linePositionsRef = useRef(new Float32Array(0));

  const particleCount = quality === "lite" ? 80 : 150;
  const maxDistance = 4.5;
  const areaSize = 25;

  useEffect(() => {
    particlesRef.current = createParticles(particleCount, areaSize);
    pointPositionsRef.current = new Float32Array(particleCount * 3);
    linePositionsRef.current = new Float32Array(((particleCount * (particleCount - 1)) / 2) * 6);

    if (pointsGeometryRef.current) {
      pointsGeometryRef.current.setAttribute("position", new THREE.BufferAttribute(pointPositionsRef.current, 3));
    }

    if (linesGeometryRef.current) {
      linesGeometryRef.current.setAttribute("position", new THREE.BufferAttribute(linePositionsRef.current, 3));
      linesGeometryRef.current.setDrawRange(0, 0);
    }
  }, [areaSize, particleCount]);

  useFrame((_, delta) => {
    const particles = particlesRef.current;
    const pointPositions = pointPositionsRef.current;
    const linePositions = linePositionsRef.current;
    if (!particles.length || !pointPositions.length || !linePositions.length) return;

    const speed = 0.8;
    let lineIndex = 0;

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i];
      p.x += p.vx * delta * speed;
      p.y += p.vy * delta * speed;
      p.z += p.vz * delta * speed;

      if (Math.abs(p.x) > areaSize / 2) p.vx *= -1;
      if (Math.abs(p.y) > areaSize / 2) p.vy *= -1;
      if (Math.abs(p.z) > areaSize / 2) p.vz *= -1;

      pointPositions[i * 3] = p.x;
      pointPositions[i * 3 + 1] = p.y;
      pointPositions[i * 3 + 2] = p.z;
    }

    for (let i = 0; i < particleCount; i++) {
      const p1 = particles[i];
      for (let j = i + 1; j < particleCount; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dz = p1.z - p2.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < maxDistance * maxDistance) {
          linePositions[lineIndex++] = p1.x;
          linePositions[lineIndex++] = p1.y;
          linePositions[lineIndex++] = p1.z;
          linePositions[lineIndex++] = p2.x;
          linePositions[lineIndex++] = p2.y;
          linePositions[lineIndex++] = p2.z;
        }
      }
    }

    if (pointsGeometryRef.current) {
      pointsGeometryRef.current.attributes.position.needsUpdate = true;
    }

    if (linesGeometryRef.current) {
      linesGeometryRef.current.attributes.position.needsUpdate = true;
      linesGeometryRef.current.setDrawRange(0, lineIndex / 3);
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05 * speed;
      groupRef.current.rotation.x += delta * 0.02 * speed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      <points>
        <bufferGeometry ref={pointsGeometryRef} />
        <pointsMaterial
          size={0.3}
          color="#5fe1ff"
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef} />
        <lineBasicMaterial
          color="#5fe1ff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

export function ContactSculpture({ quality = "full" }: { quality?: "full" | "lite" }) {
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
          <NeuralConstellation quality={quality} />
          <AdaptiveEvents />
          <Preload all />
        </PerformanceMonitor>
      </Canvas>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/20 to-black/80 pointer-events-none" />
    </div>
  );
}

const Fallback = () => (
  <div className="absolute inset-0 -z-10 bg-black pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-[#040f24] to-black opacity-50" />
  </div>
);

export const ClientContactSculpture = withDynamicModel({
  loader: () => import("@/components/ContactSculpture"),
  fallback: <Fallback />,
});

export default ContactSculpture;
