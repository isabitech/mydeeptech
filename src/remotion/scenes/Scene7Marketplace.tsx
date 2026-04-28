import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { PROJECT_TYPES } from "../copy";
import {
  Cursor,
  GlassPanel,
  GlowButton,
  GradientBackdrop,
  HeadlineBlock,
  MiniLabel,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene7Marketplace = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cursorX = interpolate(frame, [120, 210], [1500, 1540], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [120, 210], [660, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <GradientBackdrop />
      <SceneShell align="center">
        <div
          style={{
            width: "100%",
            display: "flex",
            gap: 40,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 5"
            title="A marketplace of real AI work."
            subtitle="Workers browse active opportunities and apply to projects aligned to their proven skills and availability."
            titleSize={76}
            width={620}
          />
          <div
            style={{
              flex: 1,
              position: "relative",
              opacity: reveal(frame, fps, 18),
              transform: `translateY(${rise(frame, fps, 18, 36)}px)`,
            }}
          >
            <GlassPanel
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 18,
              }}
            >
              <MiniLabel text="Available Projects" />
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {["Search projects...", "Category", "Difficulty", "Min Rate", "Max Rate"].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 14,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(246,146,30,0.1)",
                      fontFamily: "gilroy-medium",
                      fontSize: 18,
                      color: BRAND.palette.softWhite,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {PROJECT_TYPES.map((type, index) => (
                <div
                  key={type}
                  style={{
                    padding: 24,
                    borderRadius: 24,
                    display: "grid",
                    gridTemplateColumns: "1.6fr 0.8fr 0.8fr 0.6fr",
                    gap: 16,
                    alignItems: "center",
                    border: "1px solid rgba(246, 146, 30, 0.1)",
                    background:
                      index === 2
                        ? "linear-gradient(135deg, rgba(246, 146, 30, 0.18), rgba(51, 51, 51, 0.26))"
                        : "rgba(255,255,255,0.04)",
                    opacity: reveal(frame, fps, 30 + index * 12),
                  }}
                  >
                    <div
                      style={{
                        fontFamily: "gilroy-semibold",
                        fontSize: 26,
                      }}
                    >
                      {type}
                    </div>
                    <div
                      style={{
                        fontFamily: "gilroy-medium",
                        fontSize: 20,
                        color: BRAND.palette.softWhite,
                      }}
                    >
                      {index % 2 === 0 ? "USD 8/hr" : "USD 12/task"}
                    </div>
                    <div
                      style={{
                        fontFamily: "gilroy-medium",
                        fontSize: 20,
                        color: BRAND.palette.softWhite,
                      }}
                    >
                      {index % 2 === 0 ? "Open" : "Active"}
                    </div>
                    <GlowButton label="Apply" active={index === 2} width={120} />
                  </div>
              ))}
            </GlassPanel>
            <Cursor left={cursorX} top={cursorY} scale={0.95} />
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
