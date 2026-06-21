"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AdaptiveEvents, PerformanceMonitor, Preload, usePerformanceMonitor, type PerformanceMonitorApi } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { withDynamicModel } from "@/components/DynamicModelLoader";

const colorMap: Record<string, string> = {
  "Next.js": "#ffffff", React: "#61DAFB", TypeScript: "#3178C6",
  "Tailwind CSS": "#06B6D4", "Framer Motion": "#ff007f", "Three.js": "#5fe1ff",
  "Node.js": "#339933", Vercel: "#ffffff", OpenAI: "#10a37f",
  Claude: "#D97757", Llama: "#0490EA", Gemini: "#8E75B2",
  Cursor: "#3b82f6", Python: "#3776AB", "Hugging Face": "#FFD21E",
};

const PERFORMANCE_FACTOR_MIN = 0;
const PERFORMANCE_FACTOR_MAX = 1;

function PerformanceTuner({ minDpr, maxDpr }: { minDpr: number; maxDpr: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const applyPerformanceChange = useCallback(
    (api: PerformanceMonitorApi) => {
      const factor = THREE.MathUtils.clamp(api.factor, PERFORMANCE_FACTOR_MIN, PERFORMANCE_FACTOR_MAX);
      setDpr(THREE.MathUtils.lerp(minDpr, maxDpr, factor));
    },
    [maxDpr, minDpr, setDpr]
  );
  usePerformanceMonitor({ onChange: applyPerformanceChange, onFallback: applyPerformanceChange });
  return null;
}

function NeuralDataWave({ activeTech, hoveredTech, quality }: { activeTech: string | null; hoveredTech: string | null; quality: "full" | "lite" }) {
  const meshRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const gridSize = quality === "lite" ? 40 : 80;
  const size = 30;
  const segments = gridSize;

  const { positions } = useMemo(() => {
    const positions = new Float32Array(segments * segments * 3);
    let i = 0;
    for (let ix = 0; ix < segments; ix++) {
      for (let iy = 0; iy < segments; iy++) {
        const x = (ix / segments) * size - size / 2;
        const z = (iy / segments) * size - size / 2;
        positions[i] = x;
        positions[i + 1] = 0; // y
        positions[i + 2] = z;
        i += 3;
      }
    }
    return { positions };
  }, [segments]);

  const targetColor = useMemo(() => {
    const tech = hoveredTech || activeTech;
    return new THREE.Color(tech && colorMap[tech] ? colorMap[tech] : "#4E88D4");
  }, [hoveredTech, activeTech]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    
    let i = 0;
    for (let ix = 0; ix < segments; ix++) {
      for (let iy = 0; iy < segments; iy++) {
        const x = (ix / segments) * size - size / 2;
        const z = (iy / segments) * size - size / 2;
        // Complex wave function
        positions[i + 1] = Math.sin(x * 0.3 + time * 0.8) * 1.5 + Math.cos(z * 0.2 + time * 0.5) * 1.5;
        i += 3;
      }
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;

    if (matRef.current) {
      matRef.current.color.lerp(targetColor, 0.05);
    }
  });

  return (
    <group rotation={[0.2, 0, 0]} position={[0, -5, -15]}>
      <points ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={matRef} size={0.25} color="#4E88D4" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  );
}

function ExpertiseSculpture({ quality = "full" }: { quality?: "full" | "lite" }) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const checkActiveTech = () => {
      const section = sectionRef.current ?? document.getElementById("expertise");
      if (!section) return;
      sectionRef.current = section;
      const activeEl = section.querySelector('[data-tech-item][data-active="true"]');
      setActiveTech(activeEl ? activeEl.getAttribute("data-tech-item") : null);
    };

    const section = document.getElementById("expertise");
    if (!section) return;
    sectionRef.current = section;

    checkActiveTech();

    const observer = new MutationObserver(checkActiveTech);
    observer.observe(section, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current ?? document.getElementById("expertise");
    if (!section) return;
    sectionRef.current = section;

    const handleMouseOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const techEl = target?.closest("[data-tech-item]");
      setHoveredTech(techEl ? techEl.getAttribute("data-tech-item") : null);
    };
    const handleMouseOut = () => setHoveredTech(null);

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
    <div className="w-full h-full absolute inset-0 -z-10 bg-black pointer-events-none">
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }} dpr={maxDeviceDpr} gl={{ antialias: true, powerPreference: "high-performance" }} className="w-full h-full">
        <PerformanceMonitor>
          <PerformanceTuner minDpr={1} maxDpr={maxDeviceDpr} />
          
          <NeuralDataWave activeTech={activeTech} hoveredTech={hoveredTech} quality={quality} />

          <AdaptiveEvents />
          <Preload all />
        </PerformanceMonitor>
      </Canvas>
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 z-0" />
    </div>
  );
}

const Fallback = () => (
  <div className="absolute inset-0 -z-10 bg-black pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050a1f] to-black opacity-50" />
  </div>
);

export const ClientExpertiseSculpture = withDynamicModel({
  loader: () => import("@/components/ExpertiseSculpture"),
  fallback: <Fallback />,
});

export default ExpertiseSculpture;
