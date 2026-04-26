import type { CSSProperties, ReactNode } from "react";

import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { BRAND } from "../config";
import { drift, reveal, rise } from "../lib/motion";

export const pagePadding = 96;

export const GradientBackdrop = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(circle at 18% 20%, rgba(246, 146, 30, 0.18), transparent 30%),
          radial-gradient(circle at 82% 16%, rgba(230, 129, 27, 0.16), transparent 28%),
          radial-gradient(circle at 56% 78%, rgba(255, 210, 138, 0.08), transparent 26%),
          linear-gradient(135deg, #151515 0%, #232323 48%, #101010 100%)
        `,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 32,
          border: `1px solid ${BRAND.palette.line}`,
          borderRadius: 38,
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(246, 146, 30, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(246, 146, 30, 0.05) 1px, transparent 1px)",
          backgroundSize: "160px 160px",
          opacity: 0.25,
          transform: `translateY(${drift(frame, 0.45, 16)}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

export const SceneShell = ({
  children,
  align = "flex-start",
}: {
  children: ReactNode;
  align?: CSSProperties["justifyContent"];
}) => (
  <AbsoluteFill
    style={{
      padding: `${pagePadding}px`,
      display: "flex",
      justifyContent: align,
      color: BRAND.palette.white,
      overflow: "hidden",
    }}
  >
    {children}
  </AbsoluteFill>
);

export const Eyebrow = ({ text }: { text: string }) => (
  <div
    style={{
      alignSelf: "flex-start",
      padding: "12px 20px",
      borderRadius: 999,
      border: `1px solid rgba(246, 146, 30, 0.22)`,
      background: "rgba(28, 28, 28, 0.68)",
      color: BRAND.palette.sky,
      fontFamily: "gilroy-semibold",
      fontSize: 20,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      backdropFilter: "blur(16px)",
    }}
  >
    {text}
  </div>
);

export const HeadlineBlock = ({
  eyebrow,
  title,
  subtitle,
  titleSize = 88,
  width = 760,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  titleSize?: number;
  width?: number;
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = reveal(frame, fps, 0);

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        opacity,
        transform: `translateY(${rise(frame, fps, 0, 54)}px)`,
      }}
    >
      {eyebrow ? <Eyebrow text={eyebrow} /> : null}
      <h1
        style={{
          margin: 0,
          fontFamily: "gilroy-extrabold",
          fontSize: titleSize,
          lineHeight: 0.94,
          letterSpacing: "-0.045em",
        }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p
          style={{
            margin: 0,
            maxWidth: width - 60,
            fontFamily: "gilroy-medium",
            color: BRAND.palette.softWhite,
            fontSize: 28,
            lineHeight: 1.45,
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
};

export const GlassPanel = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      borderRadius: 32,
      border: `1px solid rgba(246, 146, 30, 0.14)`,
      background:
        "linear-gradient(180deg, rgba(37, 37, 37, 0.92) 0%, rgba(24, 24, 24, 0.88) 100%)",
      boxShadow:
        "0 26px 80px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(22px)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const BrowserWindow = ({
  children,
  title = "mydeeptechai.com",
  style,
}: {
  children: ReactNode;
  title?: string;
  style?: CSSProperties;
}) => (
  <GlassPanel
    style={{
      width: 940,
      padding: 0,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: 72,
        padding: "0 28px",
        display: "flex",
        alignItems: "center",
        gap: 18,
        borderBottom: `1px solid rgba(246, 146, 30, 0.12)`,
        background: "rgba(255, 255, 255, 0.03)",
      }}
    >
      {["#FF6D7A", "#FFCB58", "#4AE384"].map((dot) => (
        <div
          key={dot}
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            background: dot,
          }}
        />
      ))}
      <div
        style={{
          marginLeft: 12,
          padding: "10px 20px",
          borderRadius: 999,
          background: "rgba(20, 20, 20, 0.84)",
          color: BRAND.palette.softWhite,
          fontFamily: "gilroy-medium",
          fontSize: 20,
        }}
      >
        {title}
      </div>
    </div>
    {children}
  </GlassPanel>
);

export const MetricPill = ({
  value,
  label,
  accent = BRAND.palette.deepBlue,
  width = 220,
}: {
  value: string;
  label: string;
  accent?: string;
  width?: number;
}) => (
  <GlassPanel
    style={{
      width,
      padding: "24px 26px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      background: `linear-gradient(180deg, rgba(39, 39, 39, 0.9), rgba(23, 23, 23, 0.92)), linear-gradient(120deg, ${accent}20, transparent 65%)`,
    }}
  >
    <div
      style={{
        fontFamily: "gilroy-extrabold",
        fontSize: 44,
        color: BRAND.palette.white,
        letterSpacing: "-0.05em",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: "gilroy-medium",
        fontSize: 22,
        color: BRAND.palette.softWhite,
      }}
    >
      {label}
    </div>
  </GlassPanel>
);

export const GlowButton = ({
  label,
  active = true,
  width = 230,
}: {
  label: string;
  active?: boolean;
  width?: number;
}) => (
  <div
    style={{
      width,
      padding: "18px 26px",
      borderRadius: 18,
      background: active
        ? `linear-gradient(135deg, ${BRAND.palette.deepBlue} 0%, ${BRAND.palette.purple} 100%)`
        : "rgba(255, 255, 255, 0.08)",
      border: `1px solid ${active ? "rgba(255,255,255,0.14)" : "rgba(246,146,30,0.12)"}`,
      boxShadow: active ? "0 18px 40px rgba(246, 146, 30, 0.28)" : "none",
      fontFamily: "gilroy-semibold",
      fontSize: 24,
      textAlign: "center",
      color: BRAND.palette.white,
    }}
  >
    {label}
  </div>
);

export const ProgressBar = ({
  progress,
  label,
}: {
  progress: number;
  label?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {label ? (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "gilroy-medium",
          fontSize: 20,
          color: BRAND.palette.softWhite,
        }}
      >
        <span>{label}</span>
        <span>{Math.round(progress * 100)}%</span>
      </div>
    ) : null}
    <div
      style={{
        height: 14,
        borderRadius: 999,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.round(progress * 100)}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${BRAND.palette.deepBlue} 0%, ${BRAND.palette.purple} 100%)`,
          boxShadow: "0 0 24px rgba(246, 146, 30, 0.28)",
        }}
      />
    </div>
  </div>
);

export const MiniLabel = ({ text }: { text: string }) => (
  <div
    style={{
      fontFamily: "gilroy-semibold",
      fontSize: 18,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(255, 190, 109, 0.86)",
    }}
  >
    {text}
  </div>
);

export const DataRow = ({
  label,
  value,
  dim = false,
}: {
  label: string;
  value: string;
  dim?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "14px 0",
      borderBottom: "1px solid rgba(246, 146, 30, 0.08)",
      opacity: dim ? 0.7 : 1,
    }}
  >
    <span
      style={{
        fontFamily: "gilroy-medium",
        fontSize: 22,
        color: BRAND.palette.softWhite,
      }}
    >
      {label}
    </span>
    <span
      style={{
        fontFamily: "gilroy-semibold",
        fontSize: 22,
        color: BRAND.palette.white,
      }}
    >
      {value}
    </span>
  </div>
);

export const Cursor = ({
  left,
  top,
  scale = 1,
}: {
  left: number;
  top: number;
  scale?: number;
}) => (
  <div
    style={{
      position: "absolute",
      left,
      top,
      transform: `scale(${scale})`,
      filter: "drop-shadow(0 18px 32px rgba(0, 0, 0, 0.4))",
    }}
  >
    <svg width="42" height="52" viewBox="0 0 42 52" fill="none">
      <path
        d="M8 4L34 28L23 30L29 46L22 49L16 33L8 40V4Z"
        fill="#fff"
        stroke="#0A0F20"
        strokeWidth="2"
      />
    </svg>
  </div>
);

export const NotificationCard = ({
  title,
  body,
  accent = BRAND.palette.success,
  style,
}: {
  title: string;
  body: string;
  accent?: string;
  style?: CSSProperties;
}) => (
  <GlassPanel
    style={{
      width: 360,
      padding: 24,
      borderColor: `${accent}44`,
      background: `linear-gradient(180deg, rgba(37, 37, 37, 0.94), rgba(23, 23, 23, 0.92)), linear-gradient(135deg, ${accent}16, transparent 65%)`,
      ...style,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 16px ${accent}`,
        }}
      />
      <div
        style={{
          fontFamily: "gilroy-semibold",
          fontSize: 24,
          color: BRAND.palette.white,
        }}
      >
        {title}
      </div>
    </div>
    <p
      style={{
        margin: "14px 0 0",
        fontFamily: "gilroy-medium",
        fontSize: 20,
        lineHeight: 1.45,
        color: BRAND.palette.softWhite,
      }}
    >
      {body}
    </p>
  </GlassPanel>
);

export const LogoMark = ({
  size = 92,
  withWordmark = true,
}: {
  size?: number;
  withWordmark?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 22,
    }}
  >
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 20px 46px rgba(12, 27, 84, 0.36)",
      }}
    >
      <Img
        src={staticFile("deeptech.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
    {withWordmark ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            fontFamily: "gilroy-extrabold",
            fontSize: 54,
            letterSpacing: "-0.05em",
          }}
        >
          MyDeepTech
        </div>
        <div
          style={{
            fontFamily: "gilroy-medium",
            fontSize: 22,
            color: BRAND.palette.softWhite,
          }}
        >
          AI workforce infrastructure for global teams
        </div>
      </div>
    ) : null}
  </div>
);

export const ChartBars = ({
  values,
  accent = BRAND.palette.deepBlue,
}: {
  values: number[];
  accent?: string;
}) => (
  <div
    style={{
      height: 170,
      display: "flex",
      alignItems: "flex-end",
      gap: 18,
    }}
  >
    {values.map((value, index) => (
      <div
        key={`${value}-${index}`}
        style={{
          width: 46,
          height: `${value}%`,
          borderRadius: 18,
          background: `linear-gradient(180deg, ${accent} 0%, ${BRAND.palette.purple} 100%)`,
          boxShadow: `0 18px 36px ${accent}30`,
        }}
      />
    ))}
  </div>
);

export const FloatStack = ({ children }: { children: ReactNode }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = reveal(frame, fps, 10);

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${rise(frame, fps, 10, 40)}px)`,
      }}
    >
      {children}
    </div>
  );
};
