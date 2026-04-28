import { ReactNode } from "react";
import { ArrowRight, Database, Languages, ShieldCheck } from "lucide-react";
import { Button } from "antd";
import { cn } from "../../../lib/utils";
import FreelancerImage from "../../../assets/freelancer.jpg";

interface TrackCardProps {
  title: string;
  description: string;
  badge: string;
  meta: string[];
  ctaLabel: string;
  onClick: () => void;
  variant: "generalist" | "project";
  footer?: ReactNode;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

const TrackCard = ({
  title,
  description,
  badge,
  meta,
  ctaLabel,
  onClick,
  variant,
  footer,
  secondaryActionLabel,
  onSecondaryAction,
}: TrackCardProps) => {
  const isGeneralist = variant === "generalist";

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#E7DED5] bg-[linear-gradient(180deg,_#FFFFFF_0%,_#FFFCF8_100%)] shadow-[0_20px_44px_rgba(51,51,51,0.06)] transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        {isGeneralist ? (
          <>
            <img
              src={FreelancerImage}
              alt="Generalist interview preview"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#F7EFE7]/55 via-transparent to-transparent" />
          </>
        ) : (
          <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.25),_transparent_35%),linear-gradient(135deg,_#FFF8F0,_#FFFDFB_50%,_#F6F7FB)]">
            <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(35,26,18,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(35,26,18,0.06)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute inset-x-8 top-8 flex items-center justify-between">
              <div className="rounded-full border border-[#E8D8C8] bg-white px-3 py-1 text-xs font-[gilroy-semibold] text-[#6B5A4A]">
                Specialized Tracks
              </div>
              <div className="rounded-full bg-[#FFF3E5] p-3 text-[#F6921E]">
                <Database size={18} />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 flex gap-3">
              {[Database, Languages, ShieldCheck].map((Icon, index) => (
                <div
                  key={index}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#E8DED4] bg-white text-[#6B5A4A]"
                >
                  <Icon size={18} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/95 to-transparent" />

        <div className="absolute left-6 top-6 rounded-full border border-[#E8D8C8] bg-white/95 px-3 py-1 text-[11px] font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#6B5A4A] backdrop-blur-sm">
          {badge}
        </div>

        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 rounded-[22px] border border-[#E8DED4] bg-white/95 px-4 py-3 backdrop-blur-sm">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#8A7C70]">
              {isGeneralist ? "Platform qualification" : "Priority queue access"}
            </p>
            <p className="mt-2 text-sm font-[gilroy-semibold] text-[#231A12]">
              {isGeneralist ? "Ideal first interview track" : "Higher-context evaluation lanes"}
            </p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#F1D6BA] bg-[#FFF3E5] text-[#F6921E]">
            {isGeneralist ? <ArrowRight size={18} /> : <Database size={18} />}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="text-2xl font-[gilroy-bold] text-[#231A12]">{title}</h3>
          <p className="mt-3 text-sm leading-7 text-[#5B4C40]">{description}</p>
        </div>

        <div className="mt-5 grid gap-3 text-sm text-[#7B6B5D] sm:grid-cols-2 xl:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-[#F2E5D7] bg-[#FFFBF7] px-4 py-3 font-[gilroy-medium]"
            >
              {item}
            </div>
          ))}
        </div>

        {footer ? <div className="mt-5">{footer}</div> : null}

        <div
          className={cn(
            "mt-6 flex flex-wrap gap-3",
            isGeneralist ? "items-center" : "items-stretch",
          )}
        >
          <Button
            type="primary"
            onClick={onClick}
            className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-6 !font-[gilroy-semibold] !shadow-none hover:!bg-[#E88518]"
          >
            <span className="flex items-center gap-2">
              {ctaLabel}
              <ArrowRight size={16} />
            </span>
          </Button>
          {secondaryActionLabel && onSecondaryAction ? (
            <Button
              onClick={onSecondaryAction}
              className="!h-12 !rounded-xl !border-[#F2D0AF] !px-6 !font-[gilroy-semibold] !text-[#A35A06]"
            >
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TrackCard;
