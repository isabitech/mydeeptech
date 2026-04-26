import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { AfricaMap } from "../components/AfricaMap";
import { GradientBackdrop, HeadlineBlock, SceneShell } from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = reveal(frame, fps, 0);
  const secondary = reveal(frame, fps, 64);

  return (
    <AbsoluteFill>
      <GradientBackdrop />
      <SceneShell align="center">
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              opacity: progress,
              transform: `translateY(${rise(frame, fps, 0, 50)}px)`,
            }}
          >
            <HeadlineBlock
              eyebrow="Human Intelligence"
              title={
                <>
                  The Future of AI
                  <br />
                  Needs Human Intelligence
                </>
              }
              subtitle="High-performing models are built by precise people, rigorous workflows, and scalable global operations."
              titleSize={98}
              width={840}
            />
            <div
              style={{
                fontFamily: "gilroy-semibold",
                fontSize: 38,
                color: BRAND.palette.white,
                opacity: secondary,
                transform: `translateY(${rise(frame, fps, 60, 24)}px)`,
              }}
            >
              Africa&apos;s Talent is Ready
            </div>
          </div>
          <div
            style={{
              width: 660,
              height: 720,
              position: "relative",
              opacity: interpolate(progress, [0, 1], [0.5, 1]),
              transform: `translateX(${interpolate(progress, [0, 1], [80, 0])}px)`,
            }}
          >
            <AfricaMap />
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
