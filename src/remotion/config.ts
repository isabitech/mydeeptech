export const VIDEO_FPS = 30;
export const VIDEO_WIDTH = 1920;
export const VIDEO_HEIGHT = 1080;

export const SCENE_DURATIONS = {
  hook: 180,
  brand: 210,
  landing: 240,
  auth: 240,
  assessment: 270,
  profile: 240,
  marketplace: 270,
  admin: 210,
  work: 300,
  closing: 240,
} as const;

export const TOTAL_DURATION_IN_FRAMES = Object.values(SCENE_DURATIONS).reduce(
  (total, duration) => total + duration,
  0,
);

export const BRAND = {
  name: "MyDeepTech",
  website: "mydeeptechai.com",
  strapline: "Africa's #1 AI Workforce Company",
  palette: {
    ink: "#111111",
    midnight: "#1B1B1B",
    deepBlue: "#333333",
    purple: "#F6921E",
    sky: "#FFBE6D",
    white: "#FFF8F0",
    softWhite: "rgba(255, 248, 240, 0.82)",
    line: "rgba(246, 146, 30, 0.18)",
    success: "#5DFFB1",
    gold: "#FFD28A",
  },
} as const;
