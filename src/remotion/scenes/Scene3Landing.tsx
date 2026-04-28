import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  BrowserWindow,
  Cursor,
  GlowButton,
  GradientBackdrop,
  HeadlineBlock,
  MiniLabel,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene3Landing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cursorX = interpolate(frame, [80, 150], [1180, 1330], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorY = interpolate(frame, [80, 150], [742, 760], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const zoom = interpolate(frame, [150, 220], [1, 1.06], {
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
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 1"
            title="From first visit to first opportunity."
            subtitle="A cinematic landing experience introduces the workforce platform, the talent story, and the path to joining real AI projects."
            titleSize={78}
            width={620}
          />
          <div
            style={{
              position: "relative",
              transform: `scale(${zoom}) translateY(${rise(frame, fps, 20, 32)}px)`,
              transformOrigin: "center center",
              opacity: reveal(frame, fps, 20),
            }}
          >
            <BrowserWindow>
              <div
                style={{
                  padding: 38,
                  display: "grid",
                  gridTemplateColumns: "1.1fr 0.9fr",
                  gap: 30,
                  background:
                    "linear-gradient(180deg, rgba(31, 31, 31, 0.96) 0%, rgba(20, 20, 20, 0.94) 100%)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <MiniLabel text="MyDeepTech Landing Page" />
                  <div
                    style={{
                      fontFamily: "gilroy-extrabold",
                      fontSize: 58,
                      lineHeight: 0.98,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    Empowering Freelancers
                    <br />
                    in Data Annotation &amp; AI Development
                  </div>
                  <div
                    style={{
                      fontFamily: "gilroy-medium",
                      fontSize: 22,
                      lineHeight: 1.45,
                      color: BRAND.palette.softWhite,
                    }}
                  >
                    Join the future of AI. Find premium gigs, showcase your expertise, and earn from verified global AI projects.
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {["Remote Work", "Dollar Payments", "Verified Projects", "Global Opportunities"].map((pill) => (
                      <div
                        key={pill}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 999,
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(246,146,30,0.16)",
                          fontFamily: "gilroy-medium",
                          fontSize: 18,
                        }}
                      >
                        {pill}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <GlowButton label="Get Started Today" />
                    <GlowButton label="Learn More" active={false} width={180} />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      borderRadius: 28,
                      padding: 28,
                      background: "linear-gradient(135deg, rgba(246,146,30,0.18), rgba(255,255,255,0.04))",
                      border: "1px solid rgba(246,146,30,0.18)",
                    }}
                  >
                    <div style={{ fontFamily: "gilroy-extrabold", fontSize: 48 }}>1572+</div>
                    <div style={{ fontFamily: "gilroy-medium", fontSize: 20, color: BRAND.palette.softWhite }}>
                      Active Users
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: 28,
                      padding: 28,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(246,146,30,0.14)",
                    }}
                  >
                    <div style={{ fontFamily: "gilroy-extrabold", fontSize: 48, color: BRAND.palette.purple }}>$50+</div>
                    <div style={{ fontFamily: "gilroy-medium", fontSize: 20, color: BRAND.palette.softWhite }}>
                      Hourly Rate
                    </div>
                  </div>
                  <div
                    style={{
                      borderRadius: 28,
                      padding: 28,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(246,146,30,0.14)",
                    }}
                  >
                    <div style={{ fontFamily: "gilroy-semibold", fontSize: 24 }}>What Makes Us Different</div>
                    <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
                      {["Verified Remote Gigs", "Fair Dollar Payments", "Skill-Based Matching"].map((item) => (
                        <div key={item} style={{ fontFamily: "gilroy-medium", fontSize: 18, color: BRAND.palette.softWhite }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </BrowserWindow>
            <Cursor left={cursorX} top={cursorY} />
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
