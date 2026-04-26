import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { METRICS } from "../copy";
import {
  GradientBackdrop,
  HeadlineBlock,
  LogoMark,
  MetricPill,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene2Brand = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const intro = reveal(frame, fps, 0);

  return (
    <AbsoluteFill>
      <GradientBackdrop />
      <SceneShell align="center">
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 42,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: intro,
              transform: `translateY(${rise(frame, fps, 0, 36)}px)`,
            }}
          >
            <LogoMark size={116} />
            <div
              style={{
                padding: "16px 26px",
                borderRadius: 999,
                border: `1px solid rgba(246, 146, 30, 0.14)`,
                background: "rgba(25, 25, 25, 0.72)",
                fontFamily: "gilroy-semibold",
                fontSize: 24,
                color: BRAND.palette.sky,
              }}
            >
              Trusted for AI Ops
            </div>
          </div>
          <HeadlineBlock
            eyebrow="Brand Positioning"
            title="Africa's #1 AI Workforce Company"
            subtitle="MyDeepTech equips AI companies with vetted African talent for data annotation, audio collection, human evaluation, moderation, and high-precision operations."
            titleSize={92}
            width={1180}
          />
          <div
            style={{
              display: "flex",
              gap: 22,
              marginTop: 12,
            }}
          >
            {METRICS.map((metric, index) => (
              <div
                key={metric.label}
                style={{
                  opacity: reveal(frame, fps, 28 + index * 18),
                  transform: `translateY(${rise(frame, fps, 28 + index * 18, 28)}px)`,
                }}
              >
                <MetricPill
                  value={metric.value}
                  label={metric.label}
                  accent={index === 1 ? BRAND.palette.purple : BRAND.palette.deepBlue}
                  width={300}
                />
              </div>
            ))}
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
