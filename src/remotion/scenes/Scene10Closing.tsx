import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import { AfricaMap } from "../components/AfricaMap";
import {
  GlowButton,
  GradientBackdrop,
  HeadlineBlock,
  LogoMark,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene10Closing = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
            gap: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              opacity: reveal(frame, fps, 0),
              transform: `translateY(${rise(frame, fps, 0, 34)}px)`,
            }}
          >
            <LogoMark size={96} />
            <HeadlineBlock
              eyebrow="Closing"
              title={
                <>
                  Build AI With
                  <br />
                  Africa&apos;s Best Workforce
                </>
              }
              subtitle="Hire talent. Train models. Scale faster."
              titleSize={96}
              width={820}
            />
            <GlowButton label={BRAND.website} width={300} />
          </div>
          <div
            style={{
              width: 560,
              height: 620,
              position: "relative",
              opacity: reveal(frame, fps, 28),
            }}
          >
            <AfricaMap />
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
