import { ReactNode } from "react";
import { cn } from "../../../lib/utils";
import type { AiInterviewMetricTone } from "../types";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  tone?: AiInterviewMetricTone | string;
  className?: string;
}

const toneStyleMap = {
  positive: {
    badge: "border border-emerald-200 bg-emerald-50 text-emerald-700",
    iconWrap: "border-emerald-100 bg-emerald-50 text-emerald-600",
    glow: "bg-emerald-200/50",
    accent: "bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-200",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
  },
  warning: {
    badge: "border border-[#F4D8B7] bg-[#FFF5EB] text-[#A15B05]",
    iconWrap: "border-[#F3DFC7] bg-[#FFF5EB] text-[#F6921E]",
    glow: "bg-[#FFD9B0]/60",
    accent: "bg-gradient-to-r from-[#F6921E] via-[#F7A847] to-[#FFE1BD]",
    bar: "bg-[#F6921E]",
    dot: "bg-[#F6921E]",
  },
  danger: {
    badge: "border border-red-200 bg-red-50 text-red-700",
    iconWrap: "border-red-100 bg-red-50 text-red-600",
    glow: "bg-red-200/50",
    accent: "bg-gradient-to-r from-red-500 via-red-400 to-red-200",
    bar: "bg-red-500",
    dot: "bg-red-500",
  },
  neutral: {
    badge: "border border-[#E9DED3] bg-[#FBF7F2] text-[#6F6053]",
    iconWrap: "border-[#EFE4D8] bg-[#FFF8F0] text-[#8D5609]",
    glow: "bg-[#F7E7D6]/80",
    accent: "bg-gradient-to-r from-[#D7C1AB] via-[#E8D7C8] to-[#F7EFE7]",
    bar: "bg-[#C5B2A0]",
    dot: "bg-[#A08D7B]",
  },
};

const toneAliases: Record<string, keyof typeof toneStyleMap> = {
  positive: "positive",
  warning: "warning",
  danger: "danger",
  negative: "danger",
  neutral: "neutral",
};

const resolveToneStyle = (tone?: string) => {
  const toneKey = toneAliases[tone ?? "neutral"] ?? "neutral";
  return toneStyleMap[toneKey];
};

const MetricCard = ({
  label,
  value,
  delta,
  icon,
  tone = "neutral",
  className,
}: MetricCardProps) => {
  const toneStyle = resolveToneStyle(tone);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white border border-[#E7DED5] bg-[linear-gradient(180deg,_#FFFFFF_0%,_#FFFDFB_100%)] p-5 shadow-[0_16px_38px_rgba(51,51,51,0.05)] transition-transform duration-300 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1 rounded-t-[28px]", toneStyle.accent)} />
      <div className={cn("absolute right-0 top-0 h-24 w-24 rounded-full blur-3xl", toneStyle.glow)} />

      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border text-lg",
              toneStyle.iconWrap,
            )}
          >
            {icon ?? <span className={cn("h-2.5 w-2.5 rounded-full", toneStyle.dot)} />}
          </div>
          {delta ? (
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em]",
                toneStyle.badge,
              )}
            >
              {delta}
            </span>
          ) : null}
        </div>

        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A7C6F]">{label}</p>
        <p className="mt-3 text-[2.15rem] font-[gilroy-bold] leading-none text-[#231A12]">
          {value}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <span className={cn("h-1.5 w-14 rounded-full", toneStyle.bar)} />
          <span className="text-[11px] uppercase tracking-[0.16em] text-[#A08D7B]">
            Live metric
          </span>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
