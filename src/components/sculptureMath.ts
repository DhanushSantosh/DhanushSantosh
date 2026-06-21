export type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function seededRange(seed: number, min: number, max: number) {
  return min + seededUnit(seed) * (max - min);
}

export function createParticles(count: number, areaSize: number, velocityLimit = 0.25): Particle[] {
  const halfArea = areaSize / 2;

  return Array.from({ length: count }, (_, index) => {
    const seed = index * 6 + 1;

    return {
      x: seededRange(seed, -halfArea, halfArea),
      y: seededRange(seed + 1, -halfArea, halfArea),
      z: seededRange(seed + 2, -halfArea, halfArea),
      vx: seededRange(seed + 3, -velocityLimit, velocityLimit),
      vy: seededRange(seed + 4, -velocityLimit, velocityLimit),
      vz: seededRange(seed + 5, -velocityLimit, velocityLimit),
    };
  });
}
