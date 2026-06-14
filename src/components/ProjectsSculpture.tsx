"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerformanceMonitor, Preload, usePerformanceMonitor, type PerformanceMonitorApi } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { withDynamicModel } from "@/components/DynamicModelLoader";
import { createParticles } from "@/components/sculptureMath";

const PERFORMANCE_FACTOR_MIN = 0;
const PERFORMANCE_FACTOR_MAX = 1;

const projectColors: Record<string, string> = {
  Intellex: "#3b82f6",
  DeskCrafter: "#10b981",
  "WinePrefix-Automation": "#8b5cf6",
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

function NeuralConstellation({
  hoveredProject,
  quality,
}: {
  hoveredProject: string | null;
  quality: "full" | "lite";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsGeometryRef = useRef<THREE.BufferGeometry>(null);
  const linesGeometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const pointsMaterialRef = useRef<THREE.PointsMaterial>(null);
  const particlesRef = useRef(createParticles(0, 0));
  const pointPositionsRef = useRef(new Float32Array(0));
  const linePositionsRef = useRef(new Float32Array(0));

  const particleCount = quality === "lite" ? 80 : 150;
  const maxDistance = 4.5;
  const areaSize = 25;

  const targetColor = useMemo(
    () => new THREE.Color(hoveredProject && projectColors[hoveredProject] ? projectColors[hoveredProject] : "#5fe1ff"),
    [hoveredProject],
  );

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

    const speed = hoveredProject ? 4 : 0.8;
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

    materialRef.current?.color.lerp(targetColor, 0.05);
    pointsMaterialRef.current?.color.lerp(targetColor, 0.05);
  });

  return (
    <group ref={groupRef} position={[0, 0, -8]}>
      <points>
        <bufferGeometry ref={pointsGeometryRef} />
        <pointsMaterial
          ref={pointsMaterialRef}
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
          ref={materialRef}
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

export function ProjectsSculpture({ quality = "full" }: { quality?: "full" | "lite" }) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = document.getElementById("projects");
    if (!section) return;
    sectionRef.current = section;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const projectEl = target?.closest("[data-project-item]");
      setHoveredProject(projectEl ? projectEl.getAttribute("data-project-item") : null);
    };

    const handleMouseOut = () => setHoveredProject(null);

    section.addEventListener("mouseover", handleMouseOver);
    section.addEventListener("mouseout", handleMouseOut);

    return () => {
      section.removeEventListener("mouseover", handleMouseOver);
      section.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

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
          <NeuralConstellation hoveredProject={hoveredProject} quality={quality} />
          <AdaptiveEvents />
          <Preload all />
        </PerformanceMonitor>
      </Canvas>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/90 via-black/30 to-black/90" />
    </div>
  );
}

const Fallback = () => (
  <div className="absolute inset-0 -z-10 bg-black pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-[#080d1f] to-black opacity-50" />
  </div>
);

export const ClientProjectsSculpture = withDynamicModel({
  loader: () => import("@/components/ProjectsSculpture"),
  fallback: <Fallback />,
});

export default ProjectsSculpture;
