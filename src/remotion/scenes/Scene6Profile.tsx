import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  DataRow,
  GlassPanel,
  GradientBackdrop,
  HeadlineBlock,
  ProgressBar,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene6Profile = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const completion = interpolate(frame, [30, 170], [0.08, 1], {
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
            gap: 48,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 4"
            title="Profile setup turns talent into deployable capacity."
            subtitle="Workers complete their operational profile with skills, geography, language fluency, past experience, and payout setup."
            titleSize={74}
            width={640}
          />
          <GlassPanel
            style={{
              flex: 1,
              padding: 32,
              opacity: reveal(frame, fps, 18),
              transform: `translateY(${rise(frame, fps, 18, 36)}px)`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 320px",
                gap: 30,
              }}
            >
              <div>
                <div
                  style={{
                    padding: "0 0 18px",
                    borderBottom: "1px solid rgba(246,146,30,0.08)",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      width: 76,
                      height: 76,
                      borderRadius: 999,
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "gilroy-extrabold",
                      fontSize: 26,
                    }}
                  >
                    AO
                  </div>
                  <div>
                    <div style={{ fontFamily: "gilroy-semibold", fontSize: 26 }}>Amara Okoye</div>
                    <div style={{ fontFamily: "gilroy-medium", fontSize: 18, color: BRAND.palette.softWhite }}>
                      Annotator
                    </div>
                  </div>
                </div>
                {[
                  "User Information",
                  "Payment Information",
                  "Professional Background",
                  "Device Information",
                  "Document Attachments",
                ].map((field, index) => (
                  <div
                    key={field}
                    style={{
                      opacity: reveal(frame, fps, 34 + index * 12),
                    }}
                  >
                    <DataRow label={field} value="Configured" />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                <div
                  style={{
                  fontFamily: "gilroy-extrabold",
                  fontSize: 86,
                  letterSpacing: "-0.06em",
                }}
                >
                  100%
                </div>
                <ProgressBar progress={completion} label="Profile completion" />
                <div
                  style={{
                    padding: 22,
                    borderRadius: 22,
                    background: "rgba(255,255,255,0.04)",
                    fontFamily: "gilroy-medium",
                    fontSize: 22,
                    lineHeight: 1.5,
                    color: "rgba(246, 250, 255, 0.78)",
                  }}
                >
                  Payment currency selected, bank details ready, and profile sections prepared for project matching.
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
