import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

import {
  DataRow,
  GlassPanel,
  GradientBackdrop,
  HeadlineBlock,
  NotificationCard,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene8Admin = () => {
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
            gap: 42,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 6"
            title="Matched by skill. Approved by quality."
            subtitle="Admins review applicant quality, filter by strengths, and move the right workers into production."
            titleSize={74}
            width={650}
          />
          <div
            style={{
              flex: 1,
              position: "relative",
              opacity: reveal(frame, fps, 22),
              transform: `translateY(${rise(frame, fps, 22, 32)}px)`,
            }}
          >
            <GlassPanel
              style={{
                padding: 30,
                display: "grid",
                gridTemplateColumns: "1.1fr 0.9fr",
                gap: 26,
              }}
            >
              <div>
                <div style={{ fontFamily: "gilroy-semibold", fontSize: 30, marginBottom: 18 }}>
                  Application Management
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 0.7fr 1fr", gap: 12, paddingBottom: 14, borderBottom: "1px solid rgba(246,146,30,0.1)" }}>
                  {["Applicant", "Email", "Status", "Actions"].map((header) => (
                    <div key={header} style={{ fontFamily: "gilroy-semibold", fontSize: 18, color: BRAND.palette.sky }}>
                      {header}
                    </div>
                  ))}
                </div>
                {[
                  ["Amara Okoye", "amara@mydeeptech.ai", "approved", "Approve"],
                  ["David Mensah", "david@mydeeptech.ai", "pending", "Edit"],
                  ["Adaobi Obi", "adaobi@mydeeptech.ai", "pending", "Approve"],
                ].map((row, index) => (
                  <div key={row[1]} style={{ display: "grid", gridTemplateColumns: "1.1fr 1.2fr 0.7fr 1fr", gap: 12, padding: "18px 0", borderBottom: "1px solid rgba(246,146,30,0.08)", opacity: reveal(frame, fps, 32 + index * 12) }}>
                    <div style={{ fontFamily: "gilroy-medium", fontSize: 18 }}>{row[0]}</div>
                    <div style={{ fontFamily: "gilroy-medium", fontSize: 18, color: BRAND.palette.softWhite }}>{row[1]}</div>
                    <div style={{ fontFamily: "gilroy-semibold", fontSize: 18, color: row[2] === "approved" ? "#7ddf98" : BRAND.palette.purple }}>{row[2]}</div>
                    <div style={{ fontFamily: "gilroy-semibold", fontSize: 18 }}>{row[3]}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <NotificationCard
                  title="Admin Match"
                  body="Limited Access: management rights and applicant review are handled inside the admin workflow."
                  accent={BRAND.palette.deepBlue}
                  style={{ width: "100%" }}
                />
                <NotificationCard
                  title="Accepted to Project"
                  body="Welcome to LLM Evaluation Sprint 04. Your dashboard is now active."
                  style={{ width: "100%" }}
                />
              </div>
            </GlassPanel>
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
