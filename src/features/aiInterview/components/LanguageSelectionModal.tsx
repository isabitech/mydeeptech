import { useEffect, useMemo, useState } from "react";
import { Input, Modal } from "antd";
import { Globe2, Search, Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import { AiInterviewLanguage } from "../types";

interface LanguageSelectionModalProps {
  open: boolean;
  options: AiInterviewLanguage[];
  value: string;
  onClose: () => void;
  onConfirm: (languageCode: string) => void;
}

const LanguageSelectionModal = ({
  open,
  options,
  value,
  onClose,
  onConfirm,
}: LanguageSelectionModalProps) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    if (open) {
      setSelected(value);
      setSearch("");
    }
  }, [open, value]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return options;
    }
    const query = search.toLowerCase();
    return options.filter((option) => {
      return (
        option.label.toLowerCase().includes(query) ||
        option.region.toLowerCase().includes(query)
      );
    });
  }, [options, search]);

  const selectedOption = useMemo(
    () => options.find((option) => option.code === selected) ?? options[0],
    [options, selected],
  );

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onClose}
      width={760}
      title={null}
      className="[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-[32px] [&_.ant-modal-content]:p-0 [&_.ant-modal-body]:p-0"
    >
      <div className="font-[gilroy-regular]">
        <div className="overflow-hidden border-b border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] px-8 pb-8 pt-8 text-[#231A12]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ECD9C7] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8D5609]">
                <Globe2 size={14} />
                Language Selection
              </div>
              <h3 className="mt-5 text-3xl font-[gilroy-bold] tracking-tight">
                Select interview language
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5D5147]">
                Choose the language you are most comfortable communicating in for
                this assessment. This setting will be used for the live AI
                interview prompts.
              </p>
            </div>

            {selectedOption ? (
              <div className="rounded-[24px] border border-[#E7DED5] bg-white px-5 py-4 shadow-[0_12px_24px_rgba(51,51,51,0.04)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                  Current selection
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E5] text-sm font-[gilroy-semibold] text-[#231A12]">
                    {selectedOption.flag}
                  </span>
                  <div>
                    <p className="font-[gilroy-semibold] text-[#231A12]">
                      {selectedOption.label}
                    </p>
                    <p className="text-xs text-[#78695B]">{selectedOption.region}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-8 py-7">
          <div className="rounded-[24px] border border-[#E7DED5] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] p-5 shadow-[0_14px_34px_rgba(51,51,51,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  Search Languages
                </p>
                <p className="mt-1 text-sm text-[#6B5A4A]">
                  Filter by language name or region.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#ECD9C7] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
                <Sparkles size={14} />
                {filteredOptions.length} available
              </div>
            </div>

            <div className="relative mt-4">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A7C6F]"
              />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search languages..."
                className="!h-12 !rounded-xl !border-[#F0D5BE] !bg-white !pl-10 !font-[gilroy-medium]"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOptions.map((option) => {
              const active = option.code === selected;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => setSelected(option.code)}
                  className={cn(
                    "rounded-[24px] border p-4 text-left transition-all",
                    active
                      ? "border-[#F6921E] bg-[#FFF5EB] shadow-[0_12px_24px_rgba(246,146,30,0.12)]"
                      : "border-[#E7DED5] bg-white hover:border-[#F0C79D] hover:bg-[#FFFCF8]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3E5] text-sm font-[gilroy-semibold] text-[#231A12]">
                      {option.flag}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-[gilroy-semibold] uppercase tracking-[0.14em]",
                        active
                          ? "bg-white text-[#A15A03]"
                          : "bg-[#F7F0E7] text-[#8A7C70]",
                      )}
                    >
                      {option.code}
                    </span>
                  </div>
                  <p className="mt-4 font-[gilroy-semibold] text-[#231A12]">{option.label}</p>
                  <p className="mt-1 text-xs leading-6 text-[#78695B]">{option.region}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border-t border-[#E9DFD6] bg-[#FFF7F0] px-6 py-5">
            <div>
              <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                Selected language
              </p>
              <p className="mt-1 text-sm font-[gilroy-semibold] text-[#231A12]">
                {selectedOption?.label ?? "No language selected"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 font-[gilroy-semibold] text-[#8A5D27]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onConfirm(selected)}
                className="rounded-xl bg-[#F6921E] px-6 py-3 font-[gilroy-semibold] text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default LanguageSelectionModal;
