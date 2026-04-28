import type { CSSProperties } from "react";

import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { BRAND } from "../config";
import { pulse, reveal } from "../lib/motion";

const nodes = [
  { left: "30%", top: "29%" },
  { left: "45%", top: "22%" },
  { left: "52%", top: "36%" },
  { left: "43%", top: "49%" },
  { left: "56%", top: "56%" },
  { left: "38%", top: "66%" },
  { left: "28%", top: "53%" },
];

const nodeStyle: CSSProperties = {
  position: "absolute",
  width: 20,
  height: 20,
  borderRadius: 999,
  background: BRAND.palette.white,
  boxShadow: `0 0 0 8px rgba(246, 146, 30, 0.18), 0 0 28px ${BRAND.palette.purple}`,
};

export const AfricaMap = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 24);
  const glow = pulse(frame, 0.9, 1.12);
  const mapOpacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        opacity: mapOpacity,
        transform: `translateY(${interpolate(progress, [0, 1], [40, 0])}px) scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
      }}
    >
      <svg
        viewBox="0 0 480 520"
        style={{
          position: "absolute",
          right: 130,
          top: 130,
          width: 560,
          height: 620,
          filter: "drop-shadow(0 40px 120px rgba(246, 146, 30, 0.24))",
        }}
      >
        <defs>
          <linearGradient id="africa-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(246,146,30,0.16)" />
            <stop offset="55%" stopColor="rgba(230,129,27,0.26)" />
            <stop offset="100%" stopColor="rgba(51,51,51,0.22)" />
          </linearGradient>
        </defs>
        <path
          d="M194 36l51 31 64 5 20 48-21 33 19 42-11 70-49 31-8 62-29 27-27 67-48 32-39-14-27-57-58-58-41-67 11-53-21-54 33-43 6-60 72-35 31 7 29-11 34-3z"
          fill="url(#africa-fill)"
          stroke="rgba(246, 146, 30, 0.55)"
          strokeWidth="3"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 142,
          top: 146,
          width: 540,
          height: 600,
        }}
      >
        {nodes.map((node, index) => (
          <div
            key={`${node.left}-${node.top}`}
            style={{
              ...nodeStyle,
              left: node.left,
              top: node.top,
              transform: `scale(${glow + index * 0.01})`,
              opacity: interpolate(progress, [0, 1], [0, 1]),
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
