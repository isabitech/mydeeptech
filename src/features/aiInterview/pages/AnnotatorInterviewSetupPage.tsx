import { Alert, Button, Select, Skeleton } from "antd";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  Play,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import LanguageSelectionModal from "../components/LanguageSelectionModal";
import { AI_INTERVIEW_LANGUAGE_OPTIONS } from "../constants/languages";
import { useAiInterviewTracks, useStartAiInterviewSession } from "../hooks/useAiInterviewQueries";
import { useAiInterviewSessionStore } from "../store/useAiInterviewSessionStore";
import { useGetUserInfo } from "../../../store/useAuthStore";
import { cn } from "../../../lib/utils";

const heroVariantClassMap = {
  generalist: "from-[#FFFCF8] via-[#FFF5EB] to-[#F6F7FB]",
  python: "from-[#F7FAFD] via-[#FFFDFB] to-[#EEF6FF]",
  medical: "from-[#F5FBF8] via-[#FFFDFB] to-[#EEF9F4]",
  translation: "from-[#FCF6FF] via-[#FFFDFB] to-[#F7EEFF]",
};

const AnnotatorInterviewSetupPage = () => {
  const navigate = useNavigate();
  const { trackId = "project" } = useParams();
  const userInfo = useGetUserInfo("user");

  const candidate = useMemo(
    () =>
      userInfo?.id && userInfo?.fullName && userInfo?.email
        ? {
            candidateId: userInfo.id,
            candidateName: userInfo.fullName,
            candidateEmail: userInfo.email,
          }
        : null,
    [userInfo?.email, userInfo?.fullName, userInfo?.id],
  );

  const { data: tracks, isLoading, isError, error, refetch } = useAiInterviewTracks();
  const isProjectCollection = trackId === "project";
  const projectTracks = useMemo(
    () => tracks?.filter((track) => track.type === "project") ?? [],
    [tracks],
  );

  const [selectedProjectTrackId, setSelectedProjectTrackId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const preferredLanguage = useAiInterviewSessionStore((state) => state.preferredLanguage);
  const setPreferredLanguage = useAiInterviewSessionStore(
    (state) => state.setPreferredLanguage,
  );

  const startSessionMutation = useStartAiInterviewSession();

  const activeTrack = useMemo(() => {
    if (!tracks?.length) {
      return undefined;
    }
    if (isProjectCollection) {
      return projectTracks.find((track) => track.id === selectedProjectTrackId) ?? projectTracks[0];
    }
    return tracks.find((track) => track.id === trackId);
  }, [isProjectCollection, projectTracks, selectedProjectTrackId, trackId, tracks]);

  useEffect(() => {
    if (isProjectCollection && projectTracks.length > 0 && !selectedProjectTrackId) {
      setSelectedProjectTrackId(projectTracks[0].id);
    }
  }, [isProjectCollection, projectTracks, selectedProjectTrackId]);

  useEffect(() => {
    if (activeTrack?.targetRoles?.length) {
      setSelectedRole((current) => {
        if (current && activeTrack.targetRoles.includes(current)) {
          return current;
        }
        return activeTrack.targetRoles[0];
      });
    }
  }, [activeTrack]);

  const selectedLanguage = useMemo(() => {
    return (
      AI_INTERVIEW_LANGUAGE_OPTIONS.find((option) => option.code === preferredLanguage) ??
      AI_INTERVIEW_LANGUAGE_OPTIONS[0]
    );
  }, [preferredLanguage]);

  const startInterview = async (languageCode: string) => {
    if (!activeTrack) {
      toast.error("Select an interview track first.");
      return;
    }
    if (!candidate) {
      toast.error("Your account profile is not ready yet. Reload the page and try again.");
      return;
    }
    if (!selectedRole) {
      toast.error("Select the role you want this interview to map to.");
      return;
    }

    setPreferredLanguage(languageCode);
    try {
      const session = await startSessionMutation.mutateAsync({
        ...candidate,
        trackId: activeTrack.id,
        languageCode,
        targetRole: selectedRole,
      });
      navigate(`/dashboard/ai-interview/session/${session.id}`);
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to start interview.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active block className="!h-[92px] !rounded-[24px]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
          <Skeleton.Input active block className="!h-[860px] !rounded-[28px]" />
          <div className="space-y-4">
            <Skeleton.Input active block className="!h-[260px] !rounded-[28px]" />
            <Skeleton.Input active block className="!h-[220px] !rounded-[28px]" />
            <Skeleton.Input active block className="!h-[180px] !rounded-[28px]" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !tracks || !activeTrack) {
    return (
      <Alert
        type="error"
        message="Unable to load interview setup"
        description={(error as Error | undefined)?.message ?? "Please refresh and try again."}
        action={
          <Button onClick={() => refetch()} className="!font-[gilroy-semibold]">
            Retry
          </Button>
        }
      />
    );
  }

  if (!candidate) {
    return (
      <Alert
        type="error"
        message="Unable to resolve your account profile"
        description="Reload the page after your account session finishes initializing."
      />
    );
  }

  return (
    <div className="space-y-6 font-[gilroy-regular] text-[#231A12]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard/ai-interview")}
          className="inline-flex items-center gap-2 text-sm font-[gilroy-semibold] text-[#6E6054]"
        >
          <ArrowLeft size={16} />
          Back to AI Interview
        </button>
        <span className="rounded-full border border-[#ECD9C7] bg-[#FFF8F0] px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
          Interview Setup
        </span>
      </div>

      {isProjectCollection ? (
        <div className="rounded-[28px] border border-[#E7DED5] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] p-6 shadow-[0_14px_34px_rgba(51,51,51,0.04)]">
          <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.18em] text-[#946232]">
            Specialized Tracks
          </p>
          <h2 className="mt-2 text-2xl font-[gilroy-bold] tracking-tight">
            Choose a project interview lane
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#5C5046]">
            Each specialized interview is tuned to a specific project class. Pick
            the queue you want to qualify for and we will tailor the questions
            around that context.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {projectTracks.map((track) => {
              const active = activeTrack.id === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedProjectTrackId(track.id)}
                  className={cn(
                    "rounded-[24px] border p-5 text-left transition-all",
                    active
                      ? "border-[#F6921E] bg-white shadow-[0_16px_32px_rgba(246,146,30,0.14)]"
                      : "border-[#E8DED4] bg-white/80 hover:border-[#F1C79E]",
                  )}
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-[#946232]">
                    {track.levelLabel}
                  </p>
                  <h3 className="mt-3 text-lg font-[gilroy-bold] text-[#231A12]">
                    {track.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#645647]">{track.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_380px]">
        <div className="rounded-[28px] border border-[#E7DED5] bg-white p-8 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
          <div
            className={cn(
              "overflow-hidden rounded-[28px] border border-[#E7DED5] bg-gradient-to-br p-7 text-[#231A12] shadow-[0_18px_40px_rgba(51,51,51,0.05)]",
              heroVariantClassMap[activeTrack.heroVariant],
            )}
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#ECD9C7] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
                Screening Phase
              </span>
              <span className="text-sm text-[#6D5D50]">ID: {activeTrack.introId}</span>
            </div>

            <h2 className="mt-5 text-3xl font-[gilroy-bold] tracking-tight">
              {activeTrack.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#5D5147]">
              {activeTrack.description}
            </p>

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-[#E7DED5] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Type</p>
                <p className="mt-2 text-lg font-[gilroy-semibold] capitalize text-[#231A12]">
                  {activeTrack.type}
                </p>
              </div>
              <div className="rounded-[22px] border border-[#E7DED5] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Est. Time</p>
                <p className="mt-2 text-lg font-[gilroy-semibold] text-[#231A12]">
                  {activeTrack.durationMinutes - 3}-{activeTrack.durationMinutes} mins
                </p>
              </div>
              <div className="rounded-[22px] border border-[#E7DED5] bg-white px-4 py-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Sections</p>
                <p className="mt-2 text-lg font-[gilroy-semibold] text-[#231A12]">
                  {activeTrack.sectionLabels.length} sections
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 max-w-xl">
            <div className="rounded-[24px] border border-[#E8DED4] bg-[#FFFDFB] p-5">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Target role</p>
              <Select
                value={selectedRole}
                onChange={setSelectedRole}
                options={activeTrack.targetRoles.map((role) => ({
                  label: role,
                  value: role,
                }))}
                className="!mt-3 w-full"
                size="large"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-[24px] border border-[#F0E0D0] bg-[#FFF8F0] px-5 py-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#F6921E]">
              <Globe2 size={18} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                Interview language
              </p>
              <p className="mt-1 font-[gilroy-semibold] text-[#231A12]">
                {selectedLanguage.label}
              </p>
            </div>
            <Button
              onClick={() => setLanguageModalOpen(true)}
              className="!h-11 !rounded-xl !border-[#F0CFAE] !font-[gilroy-semibold] !text-[#8E5507]"
            >
              Change
            </Button>
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF3E5] text-[#F6921E]">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#946232]">
                  Readiness Checklist
                </p>
                <h3 className="mt-1 text-lg font-[gilroy-bold]">Before you begin</h3>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {activeTrack.readinessChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-[22px] border border-[#EFD8C1] bg-[#FFFDFB] px-5 py-4"
                >
                  <div className="mt-1 text-emerald-600">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-[gilroy-semibold] text-[#231A12]">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#645647]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              type="primary"
              loading={startSessionMutation.isPending}
              onClick={() => setLanguageModalOpen(true)}
              className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-6 !font-[gilroy-semibold] hover:!bg-[#E98719]"
            >
              <span className="flex items-center gap-2">
                Start Interview
                <Play size={16} />
              </span>
            </Button>
            <Button
              onClick={() => navigate("/dashboard/ai-interview")}
              className="!h-12 !rounded-xl !border-[#E8C6A1] !px-6 !font-[gilroy-semibold] !text-[#9B5804]"
            >
              Back
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          <div
            className={cn(
              "overflow-hidden rounded-[28px] border border-[#E7DED5] bg-gradient-to-br p-7 text-[#231A12] shadow-[0_18px_40px_rgba(51,51,51,0.05)]",
              heroVariantClassMap[activeTrack.heroVariant],
            )}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#8A7C70]">
              {activeTrack.badgeReward}
            </p>
            <h3 className="mt-5 text-2xl font-[gilroy-bold] leading-tight">
              {activeTrack.progressLabel}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[#5D5147]">{activeTrack.subtitle}</p>
          </div>

          <div className="rounded-[24px] border border-[#E7DED5] bg-[#FFF8F0] p-6 shadow-[0_14px_30px_rgba(246,146,30,0.06)]">
            <div className="flex items-center gap-3 text-[#A15A03]">
              <Sparkles size={18} />
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em]">
                  Key Instructions
                </p>
                <h3 className="mt-1 text-base font-[gilroy-bold] text-[#231A12]">
                  What this track expects
                </h3>
              </div>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#5E5145]">
              {activeTrack.keyInstructions.map((instruction) => (
                <li key={instruction} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F6921E]" />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-6 shadow-[0_14px_30px_rgba(51,51,51,0.04)]">
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8A7C70]">
              Preparation Tip
            </p>
            <p className="mt-4 text-sm leading-7 text-[#5E5145]">
              {activeTrack.preparationTip}
            </p>
          </div>
        </div>
      </div>

      <LanguageSelectionModal
        open={languageModalOpen}
        options={AI_INTERVIEW_LANGUAGE_OPTIONS}
        value={preferredLanguage}
        onClose={() => setLanguageModalOpen(false)}
        onConfirm={async (languageCode) => {
          setLanguageModalOpen(false);
          await startInterview(languageCode);
        }}
      />
    </div>
  );
};

export default AnnotatorInterviewSetupPage;
