interface CircularScoreProps {
  value: number;
  label: string;
  suffix?: string;
}

const CircularScore = ({ value, label, suffix = "%" }: CircularScoreProps) => {
  const normalized = Math.max(0, Math.min(100, value));

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white p-7 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-[#FFF1DF] blur-3xl" />
      <div className="relative flex flex-col items-center justify-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A7C70]">Overall score</p>
        <div
          className="mt-5 flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#F6921E ${normalized * 3.6}deg, #F4E7DA 0deg)`,
          }}
        >
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-[#231A12] shadow-[inset_0_0_0_1px_rgba(231,222,213,0.8)]">
            <span className="text-3xl font-[gilroy-bold] leading-none">
              {normalized}
              {suffix}
            </span>
            <span className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#8A7C70]">
              Composite
            </span>
          </div>
        </div>
        <div className="mt-6 w-full rounded-[22px] border border-[#F2E5D8] bg-[#FFFBF7] px-4 py-4 text-center">
          <p className="text-sm font-[gilroy-semibold] text-[#231A12]">{label}</p>
          <p className="mt-1 text-xs leading-6 text-[#7B6C60]">
            Composite interview readiness signal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CircularScore;
