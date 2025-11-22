"use client";

import Image from "next/image";

type PhotoFrameProps = {
  imageUrl: string;
  alt?: string;
};

export function PhotoFrame({ imageUrl, alt = "Profile photo" }: PhotoFrameProps) {
  return (
    <div className="relative aspect-square w-full max-w-sm lg:max-w-md">
      {/* Animated arc segment 1 - travels around border */}
      <div className="absolute inset-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="0.5"
            strokeDasharray="15 85"
            strokeLinecap="round"
            className="animate-arc-rotate"
          />
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Animated arc segment 2 - counter direction */}
      <div className="absolute inset-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="0.5"
            strokeDasharray="10 90"
            strokeLinecap="round"
            className="animate-arc-reverse"
          />
          <defs>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Static subtle ring */}
      <div className="absolute inset-3 rounded-full ring-1 ring-white/5" />

      {/* Profile image */}
      <div className="absolute inset-4 overflow-hidden rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        <Image src={imageUrl} alt={alt} fill className="object-cover" priority />
      </div>

      {/* Inner shadow for depth */}
      <div className="pointer-events-none absolute inset-4 rounded-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.4)]" />
    </div>
  );
}

export default PhotoFrame;
