import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  GlassPanel,
  GradientBackdrop,
  HeadlineBlock,
  MiniLabel,
  ProgressBar,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene5Assessment = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sampleProgress = interpolate(frame, [96, 220], [0.28, 0.96], {
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
            alignItems: "center",
            gap: 42,
          }}
        >
          <div style={{ flex: 0.9 }}>
            <HeadlineBlock
              eyebrow="Step 3"
              title="Only quality talent gets through."
              subtitle="Candidates complete English evaluation, attention checks, and a task simulation that mirrors real production work."
              titleSize={78}
              width={620}
            />
          </div>
          <div
            style={{
              flex: 1.1,
              display: "flex",
              flexDirection: "column",
              gap: 22,
              opacity: reveal(frame, fps, 20),
              transform: `translateY(${rise(frame, fps, 20, 36)}px)`,
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
              <MiniLabel text="Assessment Introduction" />
              <div style={{ fontFamily: "gilroy-extrabold", fontSize: 40 }}>
                English Proficiency Assessment
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { title: "Time Limit", value: "15 Minutes Total" },
                  { title: "Questions", value: "20 Multiple Choice" },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    style={{
                      padding: 20,
                      borderRadius: 22,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(246, 146, 30, 0.1)",
                      opacity: reveal(frame, fps, 36 + index * 18),
                    }}
                  >
                    <MiniLabel text={item.title} />
                    <div
                      style={{
                        marginTop: 18,
                        fontFamily: "gilroy-semibold",
                        fontSize: 28,
                        lineHeight: 1.15,
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  "Comprehension",
                  "Vocabulary",
                  "Grammar",
                  "Writing",
                ].map((assessment, index) => (
                <div
                  key={assessment}
                  style={{
                    padding: 20,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(246, 146, 30, 0.1)",
                    opacity: reveal(frame, fps, 72 + index * 12),
                  }}
                >
                  <MiniLabel text={`Section 0${index + 1}`} />
                  <div
                    style={{
                      marginTop: 18,
                      fontFamily: "gilroy-semibold",
                      fontSize: 28,
                      lineHeight: 1.15,
                    }}
                  >
                    {assessment}
                  </div>
                </div>
              ))}
              </div>
            </GlassPanel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 22,
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
                <MiniLabel text="Scoring Information" />
                <div style={{ color: "#8be28b", fontFamily: "gilroy-semibold", fontSize: 26 }}>
                  Score ≥ 60%
                </div>
                <div style={{ fontFamily: "gilroy-medium", fontSize: 20, color: BRAND.palette.softWhite }}>
                  Qualified for Advanced English Tasks
                </div>
                <div style={{ color: "#7bb7ff", fontFamily: "gilroy-semibold", fontSize: 26 }}>
                  Score &lt; 60%
                </div>
                <div style={{ fontFamily: "gilroy-medium", fontSize: 20, color: BRAND.palette.softWhite }}>
                  Qualified for Basic English Tasks
                </div>
              </GlassPanel>
              <GlassPanel
                style={{
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                <MiniLabel text="Assessment Rules" />
                <div style={{ fontFamily: "gilroy-medium", fontSize: 20, color: BRAND.palette.softWhite, lineHeight: 1.5 }}>
                  One attempt only. All questions must be answered. Auto-submit on timeout. Stable internet required.
                </div>
                <ProgressBar progress={sampleProgress} label="Ready to start assessment" />
              </GlassPanel>
            </div>
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
