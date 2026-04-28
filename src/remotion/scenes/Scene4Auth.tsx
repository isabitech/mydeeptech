import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  GlassPanel,
  GlowButton,
  GradientBackdrop,
  HeadlineBlock,
  NotificationCard,
  ProgressBar,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

const fieldStyle = {
  padding: "18px 20px",
  borderRadius: 18,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(246, 146, 30, 0.12)",
  fontFamily: "gilroy-medium",
  fontSize: 22,
  color: BRAND.palette.softWhite,
};

export const Scene4Auth = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const verification = interpolate(frame, [145, 205], [0, 1], {
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
            gap: 36,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 2"
            title="Signup that feels instant, secure, and global."
            subtitle="Email signup, Google authentication, and verification feedback are presented with fast UI motion and clear trust signals."
            titleSize={72}
            width={640}
          />
          <div
            style={{
              position: "relative",
              opacity: reveal(frame, fps, 16),
              transform: `translateY(${rise(frame, fps, 16, 34)}px)`,
            }}
          >
            <GlassPanel
              style={{
                width: 760,
                padding: 34,
                display: "grid",
                gridTemplateColumns: "1fr 300px",
                gap: 28,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  {[1, 2, 3].map((step) => (
                    <div key={step} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 999,
                          background: step === 3 ? "#10b981" : step === 2 ? BRAND.palette.purple : "#374151",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "gilroy-semibold",
                          fontSize: 16,
                        }}
                      >
                        {step}
                      </div>
                      {step < 3 ? (
                        <div style={{ width: 54, height: 4, borderRadius: 999, background: "rgba(255,255,255,0.12)" }} />
                      ) : null}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: "gilroy-semibold", fontSize: 30 }}>Personal Info</div>
                {["Full Name", "Phone Number", "Email Address"].map((field, index) => (
                  <div
                    key={field}
                    style={{
                      ...fieldStyle,
                      opacity: reveal(frame, fps, 32 + index * 14),
                    }}
                  >
                    {field}
                  </div>
                ))}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {["Data Annotation", "Translation", "Moderation", "Transcription"].map((domain) => (
                    <div
                      key={domain}
                      style={{
                        ...fieldStyle,
                        fontSize: 18,
                        padding: "14px 16px",
                        background: "rgba(255,255,255,0.04)",
                      }}
                    >
                      {domain}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    ...fieldStyle,
                    fontSize: 18,
                    opacity: reveal(frame, fps, 88),
                  }}
                >
                  Consent for Updates: Yes, keep me updated on opportunities
                </div>
                <GlowButton label="Join Community" width={260} />
              </div>
              <GlassPanel
                style={{
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  background: "rgba(255,255,255,0.04)",
                }}
              >
                <div
                  style={{
                    fontFamily: "gilroy-semibold",
                    fontSize: 28,
                  }}
                >
                  Workflow State
                </div>
                <ProgressBar progress={verification} label="Stage completion" />
                <NotificationCard
                  title="Welcome to the community!"
                  body="Please check your mail for further instructions."
                  style={{ width: "100%" }}
                />
              </GlassPanel>
            </GlassPanel>
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
