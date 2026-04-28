import { Easing, interpolate, spring } from "remotion";

export const rise = (
  frame: number,
  fps: number,
  delay = 0,
  distance = 70,
) => {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {
      damping: 18,
      mass: 0.8,
      stiffness: 120,
    },
  });

  return interpolate(progress, [0, 1], [distance, 0]);
};

export const reveal = (frame: number, fps: number, delay = 0) =>
  spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: {
      damping: 16,
      mass: 0.7,
      stiffness: 110,
    },
  });

export const drift = (
  frame: number,
  speed = 1,
  distance = 18,
  initial = 0,
) => Math.sin(frame / (18 / speed) + initial) * distance;

export const pulse = (frame: number, min = 0.92, max = 1.08) =>
  interpolate(Math.sin(frame / 8), [-1, 1], [min, max], {
    easing: Easing.bezier(0.22, 1, 0.36, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const wipe = (frame: number, fps: number, delay = 0) =>
  interpolate(reveal(frame, fps, delay), [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
