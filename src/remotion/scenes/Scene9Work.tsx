import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import {
  GlassPanel,
  GradientBackdrop,
  HeadlineBlock,
  NotificationCard,
  SceneShell,
} from "../components/Primitives";
import { BRAND } from "../config";
import { reveal, rise } from "../lib/motion";

export const Scene9Work = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const payout = interpolate(frame, [180, 260], [0, 1], {
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
            flexDirection: "column",
            gap: 30,
          }}
        >
          <HeadlineBlock
            eyebrow="Step 7-9"
            title="Work delivered. Accuracy sustained. Earnings unlocked."
            subtitle="The production dashboard surfaces throughput, precision, project completion, and payout status in one clear operating view."
            titleSize={82}
            width={1200}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 0.9fr",
              gap: 24,
              opacity: reveal(frame, fps, 20),
              transform: `translateY(${rise(frame, fps, 20, 32)}px)`,
            }}
          >
            <GlassPanel
              style={{
                padding: 30,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 20,
              }}
            >
              {[
                ["Total Invoices", "18"],
                ["Total Amount", "$540"],
                ["Paid Amount", "$420"],
                ["Unpaid Amount", "$120"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  style={{
                    padding: 22,
                    borderRadius: 24,
                    background: index === 2 ? "linear-gradient(135deg, rgba(246,146,30,0.16), rgba(255,255,255,0.04))" : "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(246,146,30,0.12)",
                  }}
                >
                  <div style={{ fontFamily: "gilroy-medium", fontSize: 18, color: BRAND.palette.softWhite }}>{label}</div>
                  <div style={{ fontFamily: "gilroy-extrabold", fontSize: 42, marginTop: 12 }}>{value}</div>
                </div>
              ))}
              <div
                style={{
                  gridColumn: "span 4",
                  display: "flex",
                  gap: 18,
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: 22,
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(246,146,30,0.12)",
                  }}
                >
                  <div style={{ fontFamily: "gilroy-semibold", fontSize: 24, marginBottom: 12 }}>Unpaid Invoices</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      ["INV-1042", "Pending", "$120"],
                      ["INV-1038", "Submitted", "$80"],
                    ].map(([id, status, amount]) => (
                      <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, fontFamily: "gilroy-medium", fontSize: 18 }}>
                        <span>{id}</span>
                        <span style={{ color: BRAND.palette.purple }}>{status}</span>
                        <span>{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 22,
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(246,146,30,0.12)",
                  }}
                >
                  <div style={{ fontFamily: "gilroy-semibold", fontSize: 24, marginBottom: 12 }}>Paid Invoices</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {[
                      ["INV-1032", "Paid", "$220"],
                      ["INV-1027", "Paid", "$200"],
                    ].map(([id, status, amount]) => (
                      <div key={id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, fontFamily: "gilroy-medium", fontSize: 18 }}>
                        <span>{id}</span>
                        <span style={{ color: "#7ddf98" }}>{status}</span>
                        <span>{amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassPanel>
            <GlassPanel
              style={{
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "gilroy-semibold",
                  fontSize: 30,
                }}
              >
                Bank Transfer Status
              </div>
              <div
                style={{
                  fontFamily: "gilroy-semibold",
                  fontSize: 22,
                  color: BRAND.palette.softWhite,
                }}
              >
                Earnings released to payment workflow
              </div>
              <div
                style={{
                  padding: 22,
                  borderRadius: 24,
                  background:
                    "linear-gradient(135deg, rgba(246, 146, 30, 0.18), rgba(51, 51, 51, 0.26))",
                  border: "1px solid rgba(246, 146, 30, 0.12)",
                }}
              >
                <div
                  style={{
                    fontFamily: "gilroy-extrabold",
                    fontSize: 72,
                    letterSpacing: "-0.06em",
                  }}
                >
                  ${interpolate(payout, [0, 1], [0, 420]).toFixed(0)}
                </div>
                <div
                  style={{
                    fontFamily: "gilroy-medium",
                    fontSize: 22,
                    color: BRAND.palette.softWhite,
                  }}
                >
                  Transfer to bank / wallet
                </div>
              </div>
              <NotificationCard
                title="Payment Successful"
                body="Funds transferred successfully. Continue working on your next AI project."
                style={{ width: "100%" }}
              />
            </GlassPanel>
          </div>
        </div>
      </SceneShell>
    </AbsoluteFill>
  );
};
