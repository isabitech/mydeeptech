import { cn } from "../../../lib/utils";
import { AiInterviewDecision, AiInterviewStatus } from "../types";

type StatusKey = AiInterviewStatus | AiInterviewDecision;

const STATUS_STYLES: Record<
  StatusKey,
  { label: string; className: string; dotClassName: string }
> = {
  scheduled: {
    label: "Scheduled",
    className: "border-orange-200 bg-orange-50/90 text-orange-700",
    dotClassName: "bg-orange-500",
  },
  "not-started": {
    label: "Not Started",
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dotClassName: "bg-slate-400",
  },
  "in-progress": {
    label: "In Progress",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  submitted: {
    label: "Submitted",
    className: "border-orange-200 bg-orange-50/90 text-orange-700",
    dotClassName: "bg-orange-500",
  },
  processing: {
    label: "Processing",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  passed: {
    label: "Passed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  "retry-required": {
    label: "Retry Required",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    dotClassName: "bg-rose-500",
  },
  "action-required": {
    label: "Action Required",
    className: "border-red-200 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
};

interface StatusPillProps {
  status: StatusKey;
  label?: string;
  className?: string;
}

const StatusPill = ({ status, label, className }: StatusPillProps) => {
  const config = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-[gilroy-semibold] uppercase tracking-[0.14em] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
        config.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotClassName)} />
      {label ?? config.label}
    </span>
  );
};

export default StatusPill;
