import { Alert, Button, Input, Skeleton, Switch } from "antd";
import {
  Camera,
  Clock3,
  Mic,
  MonitorUp,
  Pause,
  Play,
  Repeat2,
  Volume2,
  VolumeOff,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import StatusPill from "../components/StatusPill";
import {
  useAiInterviewSession,
  useAiInterviewTrack,
  useSaveAiInterviewDraft,
  useSubmitAiInterviewAnswer,
  useSubmitAiInterviewFocusEvents,
} from "../hooks/useAiInterviewQueries";
import {
  clearInterviewFocusEvents,
  useInterviewFocusTracking,
} from "../hooks/useInterviewFocusTracking";
import { useInterviewTimer } from "../hooks/useInterviewTimer";
import { useProctoringMedia } from "../hooks/useProctoringMedia";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";
import { useAiInterviewSessionStore } from "../store/useAiInterviewSessionStore";

const { TextArea } = Input;

const tipCards = [
  {
    title: "Precision Tip",
    description:
      "Detail your specific method for cross-referencing conflicting guidelines.",
  },
  {
    title: "Time Suggestion",
    description: "Take 3 to 5 minutes per answer to ensure a high-quality depth score.",
  },
  {
    title: "Scoring Metric",
    description: "Clarity, professional tone, and task-specific logic are prioritized.",
  },
];

const primaryActionButtonClassName =
  "!border-none !bg-[#F6921E] !font-[gilroy-semibold] !text-white hover:!bg-[#E88518] hover:!text-white";

const AnnotatorInterviewSessionPage = () => {
  const navigate = useNavigate();
  const { sessionId = "" } = useParams();
  const proctoringStartKey = `ai-interview-proctoring-start:${sessionId}`;
  const [proctoringStartedAt, setProctoringStartedAt] = useState<string | null>(() => {
    if (!sessionId) {
      return null;
    }
    return sessionStorage.getItem(proctoringStartKey);
  });
  const { data: session, isLoading, isError, error, refetch } =
    useAiInterviewSession(sessionId, Boolean(sessionId));
  const { data: track } = useAiInterviewTrack(session?.trackId ?? "", Boolean(session?.trackId));

  const storedDraft = useAiInterviewSessionStore((state) => state.drafts[sessionId] ?? "");
  const setDraftInStore = useAiInterviewSessionStore((state) => state.setDraft);
  const clearDraft = useAiInterviewSessionStore((state) => state.clearDraft);
  const autoReadQuestions = useAiInterviewSessionStore((state) => state.autoReadQuestions);
  const toggleAutoReadQuestions = useAiInterviewSessionStore(
    (state) => state.toggleAutoReadQuestions,
  );

  const saveDraftMutation = useSaveAiInterviewDraft();
  const submitAnswerMutation = useSubmitAiInterviewAnswer();
  const submitFocusEventsMutation = useSubmitAiInterviewFocusEvents();
  const {
    muted,
    isPaused,
    isSpeaking,
    pause,
    replay,
    resume,
    speak,
    stop,
    toggleMute,
  } = useSpeechSynthesis();

  const [answer, setAnswer] = useState("");
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const lastClipboardWarningAtRef = useRef(0);
  const {
    cameraActive,
    cameraError,
    cameraPending,
    cameraStream,
    screenActive,
    screenError,
    screenPending,
    screenStream,
    screenVerified,
    startCamera,
    startScreenShare,
    stopAll,
    stopCamera,
    stopScreenShare,
  } = useProctoringMedia();
  const proctoringReady = cameraActive && screenVerified;
  const interviewUnlocked = Boolean(proctoringStartedAt);
  const interactionEnabled = proctoringReady && interviewUnlocked;
  const { remainingLabel, isExpired } = useInterviewTimer(
    proctoringStartedAt ?? session?.startedAt ?? new Date().toISOString(),
    session?.durationMinutes ?? 15,
    interviewUnlocked,
  );
  const { events: focusEvents } = useInterviewFocusTracking(sessionId, interviewUnlocked);

  const questionList = useMemo(() => {
    if (session?.questions?.length) {
      return session.questions;
    }

    return track?.questions ?? [];
  }, [session?.questions, track?.questions]);

  const totalQuestions = useMemo(() => {
    if (questionList.length > 0) {
      return questionList.length;
    }

    return session?.totalQuestions ?? 0;
  }, [questionList, session?.totalQuestions]);

  const currentQuestion = useMemo(() => {
    if (!session || questionList.length === 0) {
      return undefined;
    }
    return questionList[session.currentQuestionIndex];
  }, [questionList, session]);

  const interviewTitle = session?.trackTitle ?? track?.title ?? "AI Interview";

  const progressPercent = useMemo(() => {
    if (!session || totalQuestions === 0) {
      return 0;
    }
    return Math.round(((session.currentQuestionIndex + 1) / totalQuestions) * 100);
  }, [session, totalQuestions]);
  const proctoringRequirementMessage = useMemo(() => {
    if (!cameraActive && !screenVerified) {
      return "Turn on your camera and share your entire screen to unlock the interview.";
    }
    if (!cameraActive) {
      return "Turn on your camera to unlock the interview.";
    }
    return "Share your entire screen to unlock the interview.";
  }, [cameraActive, screenVerified]);

  useEffect(() => {
    if (!session) {
      return;
    }
    setAnswer(storedDraft || session.draftAnswer || "");
  }, [session, storedDraft]);

  useEffect(() => {
    if (!currentQuestion || !session || !autoReadQuestions || !interactionEnabled) {
      return;
    }
    speak(currentQuestion.prompt, { lang: session.languageCode });
  }, [
    autoReadQuestions,
    currentQuestion?.id,
    interactionEnabled,
    session?.languageCode,
    session?.id,
    speak,
  ]);

  useEffect(() => {
    if (!sessionId) {
      setProctoringStartedAt(null);
      return;
    }
    setProctoringStartedAt(sessionStorage.getItem(proctoringStartKey));
  }, [proctoringStartKey, sessionId]);

  useEffect(() => {
    if (!sessionId || interviewUnlocked || !proctoringReady) {
      return;
    }

    const startedAt = new Date().toISOString();
    sessionStorage.setItem(proctoringStartKey, startedAt);
    setProctoringStartedAt(startedAt);
    toast.success("Proctoring is active. The interview session is now live.");
  }, [interviewUnlocked, proctoringReady, proctoringStartKey, sessionId]);

  useEffect(() => {
    if (interactionEnabled) {
      return;
    }
    stop();
  }, [interactionEnabled, stop]);

  useEffect(() => {
    if (!cameraVideoRef.current) {
      return;
    }

    cameraVideoRef.current.srcObject = cameraStream;
    if (cameraStream) {
      cameraVideoRef.current.play().catch(() => undefined);
    }
  }, [cameraStream]);

  useEffect(() => {
    if (!screenVideoRef.current) {
      return;
    }

    screenVideoRef.current.srcObject = screenStream;
    if (screenStream) {
      screenVideoRef.current.play().catch(() => undefined);
    }
  }, [screenStream]);

  const handleSaveDraft = async () => {
    if (!session) {
      return;
    }
    if (!interactionEnabled) {
      toast.error("Turn on your camera and share your entire screen before continuing.");
      return;
    }
    setDraftInStore(session.id, answer);
    try {
      await saveDraftMutation.mutateAsync({
        sessionId: session.id,
        draftAnswer: answer,
      });
      toast.success("Progress saved.");
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to save progress.");
    }
  };

  const notifyClipboardRestriction = () => {
    const now = Date.now();
    if (now - lastClipboardWarningAtRef.current < 1500) {
      return;
    }
    lastClipboardWarningAtRef.current = now;
    toast.error("Copy and paste are disabled during this interview.");
  };

  const handleAnswerClipboardBlock = (
    event: ReactClipboardEvent<HTMLTextAreaElement>,
  ) => {
    event.preventDefault();
    notifyClipboardRestriction();
  };

  const handleAnswerShortcutBlock = (
    event: ReactKeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    if (!["c", "v", "x"].includes(event.key.toLowerCase())) {
      return;
    }

    event.preventDefault();
    notifyClipboardRestriction();
  };

  const finalizeFocusEvents = async (completedSessionId: string) => {
    try {
      await submitFocusEventsMutation.mutateAsync({
        sessionId: completedSessionId,
        events: focusEvents,
      });
      clearInterviewFocusEvents(completedSessionId);
      sessionStorage.removeItem(proctoringStartKey);
    } catch {
      toast.error("The interview ended, but the focus-loss audit could not be finalized.");
    }
  };

  const handleSubmit = async () => {
    if (!session) {
      return;
    }
    if (!interactionEnabled) {
      toast.error("Turn on your camera and share your entire screen before continuing.");
      return;
    }
    if (answer.trim().length < 40) {
      toast.error("Add more detail before you submit this answer.");
      return;
    }

    setDraftInStore(session.id, answer);

    try {
      const updatedSession = await submitAnswerMutation.mutateAsync({
        sessionId: session.id,
        answer,
      });
      clearDraft(session.id);
      setAnswer("");

      if (updatedSession.result) {
        await finalizeFocusEvents(updatedSession.id);
        stop();
        stopAll();
        navigate(`/dashboard/ai-interview/results/${updatedSession.id}`);
        return;
      }

      toast.success("Answer submitted. Moving to the next question.");
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to submit answer.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active block className="!h-[150px] !rounded-[24px]" />
        <Skeleton.Input active block className="!h-[540px] !rounded-[24px]" />
      </div>
    );
  }

  if (isError || !session || !currentQuestion) {
    return (
      <Alert
        type="error"
        message="Unable to load interview session"
        description={(error as Error | undefined)?.message ?? "Please try again."}
        action={
          <Button onClick={() => refetch()} className="!font-[gilroy-semibold]">
            Retry
          </Button>
        }
      />
    );
  }

  if (session.result && session.status !== "in-progress") {
    return (
      <Alert
        type="info"
        message="This interview session has already been completed."
        description="Open the results page to review the score and next steps."
        action={
          <Button
            onClick={() => navigate(`/dashboard/ai-interview/results/${session.id}`)}
            className="!font-[gilroy-semibold]"
          >
            View Result
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 font-[gilroy-regular] text-[#231A12]">
      <div className="space-y-4">
        <div className="overflow-hidden rounded-[32px] border border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] p-7 text-[#231A12] shadow-[0_20px_48px_rgba(51,51,51,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-4xl">
              <p className="text-sm font-[gilroy-semibold] text-[#6D5D50]">{interviewTitle}</p>
              <h2 className="mt-3 text-3xl font-[gilroy-bold] tracking-tight">
                Section {session.currentQuestionIndex + 1} of {totalQuestions} -{" "}
                {currentQuestion.sectionTitle}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5D5147]">
                Stay on camera and keep your entire screen shared while you answer.
                The interview flow unlocks only after both proctoring surfaces are
                live.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                  Session Clock
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-[gilroy-semibold] text-[#231A12]">
                  <Clock3 size={15} className="text-[#F6921E]" />
                  {remainingLabel}
                </p>
              </div>
              <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                  Session Status
                </p>
                <div className="mt-2">
                  <StatusPill status={session.status} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-sm font-[gilroy-semibold] text-[#6D5D50]">
              <span>{progressPercent}% complete</span>
              <span>
                {session.currentQuestionIndex + 1}/{totalQuestions}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#E9DED4]">
              <div
                className="h-full rounded-full bg-[#F6921E] transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {!interviewUnlocked ? (
          <Alert
            type="info"
            message="Interview locked until proctoring is active."
            description={`${proctoringRequirementMessage} The question flow and session timer begin only after both are live.`}
          />
        ) : !interactionEnabled ? (
          <Alert
            type="warning"
            message="Restore proctoring to continue."
            description="This session has started, but answering is paused until the camera preview and entire-screen share are both live again."
          />
        ) : null}

        {isExpired ? (
          <Alert
            type="warning"
            message="The suggested interview window has elapsed."
            description="You can still submit this answer, but the session will be flagged for review."
          />
        ) : null}
      </div>

      <div className="space-y-5 rounded-[28px] border border-[#E7DED5] bg-[linear-gradient(180deg,_#FFFFFF_0%,_#FFFCF8_100%)] p-8 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
        <div className="flex flex-col gap-4 rounded-[24px] border border-[#EDE1D5] bg-[linear-gradient(135deg,_#FFFDFB,_#FFF8F0)] p-5 md:flex-row md:items-start">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF3E5] text-[#F6921E]">
            <Mic size={20} />
            <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#FFF3E5] px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#A45C02]">
                AI Interviewer
              </span>
              <span className="text-sm font-[gilroy-semibold] text-[#6A5A4D]">
                {session.aiName}
              </span>
            </div>
            {interviewUnlocked ? (
              <p className="mt-4 text-lg leading-8 text-[#231A12]">
                {currentQuestion.prompt}
              </p>
            ) : (
              <div className="mt-4 rounded-[20px] border border-[#F3D5AF] bg-[#FFF7EC] px-4 py-4">
                <p className="text-sm font-[gilroy-semibold] text-[#8D5609]">
                  Proctoring must be active before the first question appears.
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6B5A4A]">
                  Turn on your camera and share only your entire screen. Browser
                  tabs and single application windows are not accepted for this
                  interview.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#EDE1D5] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                Your Answer
              </p>
              <p className="mt-1 text-sm text-[#6A5A4D]">
                Be detailed and provide specific examples where possible.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8A7C70]">
                  Auto read
                </span>
                <Switch
                  checked={autoReadQuestions}
                  disabled={!interactionEnabled}
                  onChange={toggleAutoReadQuestions}
                />
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#E7DED5] bg-white px-3 py-2">
                <button
                  type="button"
                  disabled={!interactionEnabled}
                  onClick={toggleMute}
                  className={`${
                    interactionEnabled
                      ? "text-[#6B5A4A]"
                      : "cursor-not-allowed text-[#B8AEA3]"
                  }`}
                >
                  {muted ? <VolumeOff size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  type="button"
                  disabled={!interactionEnabled}
                  onClick={() => {
                    if (isSpeaking) {
                      pause();
                    } else if (isPaused) {
                      resume();
                    }
                  }}
                  className={`${
                    interactionEnabled
                      ? "text-[#6B5A4A]"
                      : "cursor-not-allowed text-[#B8AEA3]"
                  }`}
                >
                  {isSpeaking ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <button
                  type="button"
                  disabled={!interactionEnabled}
                  onClick={() =>
                    replay(currentQuestion.prompt, { lang: session.languageCode })
                  }
                  className={`${
                    interactionEnabled
                      ? "text-[#6B5A4A]"
                      : "cursor-not-allowed text-[#B8AEA3]"
                  }`}
                >
                  <Repeat2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-5">
            {!interactionEnabled ? (
              <div className="mb-4 rounded-2xl border border-[#F3D5AF] bg-[#FFF7EC] px-4 py-4">
                <p className="text-sm font-[gilroy-semibold] text-[#8D5609]">
                  {interviewUnlocked
                    ? "Restore full proctoring to continue answering."
                    : "The answer area unlocks only after proctoring is active."}
                </p>
                <p className="mt-2 text-sm leading-7 text-[#6B5A4A]">
                  {interviewUnlocked
                    ? "Your camera and entire-screen share must stay live while you answer. Re-open screen sharing if the browser offered only a tab or application window."
                    : "The AI question and answer flow will remain paused until your camera is on and your full screen is being shared."}
                </p>
              </div>
            ) : null}
            <TextArea
              value={answer}
              disabled={!interactionEnabled}
              onCopy={handleAnswerClipboardBlock}
              onCut={handleAnswerClipboardBlock}
              onChange={(event) => {
                setAnswer(event.target.value);
                setDraftInStore(session.id, event.target.value);
              }}
              onKeyDown={handleAnswerShortcutBlock}
              onPaste={handleAnswerClipboardBlock}
              placeholder={
                interactionEnabled
                  ? currentQuestion.placeholder
                  : interviewUnlocked
                    ? "Restore camera access and entire-screen sharing to continue answering."
                    : "Turn on your camera and share your entire screen to start the interview."
              }
              className="!min-h-[220px] !rounded-2xl !border-[#E8DED4] !bg-[#FFFDFB] !p-5 !text-base !leading-8"
              count={{
                show: true,
                max: 1800,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF3E5] text-[#F6921E]">
              <MonitorUp size={18} />
            </div>
            <div>
              <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                Security & Monitoring
              </p>
              <p className="mt-1 text-sm text-[#6B5A4A]">
                Camera presence and full-screen share must remain active for the
                entire response flow.
              </p>
            </div>
          </div>
          <Alert
            type={proctoringReady ? "success" : interviewUnlocked ? "warning" : "info"}
            message={
              proctoringReady
                ? "Proctoring is active."
                : interviewUnlocked
                  ? "Restore proctoring to continue."
                  : "Proctoring setup is required before the interview starts."
            }
            description={
              proctoringReady
                ? "Camera preview and entire-screen sharing are both live. The interview is now unlocked."
                : interviewUnlocked
                  ? "Camera preview and entire-screen sharing must stay live while the candidate answers. Re-share the display if the browser only offered a tab or single window."
                  : "Turn on the camera and share only the candidate's entire screen. The AI interview will not start until both proctoring surfaces are active."
            }
          />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="overflow-hidden rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_14px_30px_rgba(51,51,51,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-[gilroy-semibold] uppercase tracking-[0.14em] ${
                    cameraActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {cameraActive ? "Camera live" : "Camera off"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    type="primary"
                    loading={cameraPending}
                    onClick={cameraActive ? stopCamera : startCamera}
                    className={primaryActionButtonClassName}
                  >
                    {cameraActive ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Camera size={16} className="text-[#8A7C70]" />
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-[22px] border border-[#E7DED5] bg-[radial-gradient(circle_at_top,_rgba(246,146,30,0.18),_transparent_45%),#FBF7F3]">
                {cameraActive ? (
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-52 w-full bg-[#071018] object-cover"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-[gilroy-semibold] text-[#231A12]">User Camera</p>
                      <p className="mt-2 text-xs text-[#6D5D50]">
                        Start the camera to preview the candidate feed here before the interview begins.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1.5">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A7C70]">
                  Proctoring Surface
                </p>
                <p className="text-sm text-[#5D5147]">
                  This box shows the live webcam stream used to monitor candidate presence during the interview.
                </p>
                {cameraError ? (
                  <p className="text-xs leading-6 text-[#B34B4B]">{cameraError}</p>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_14px_30px_rgba(51,51,51,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-[gilroy-semibold] uppercase tracking-[0.14em] ${
                    screenVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {screenVerified ? "Entire screen live" : "Screen off"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="small"
                    type="primary"
                    loading={screenPending}
                    onClick={screenActive ? stopScreenShare : startScreenShare}
                    className={primaryActionButtonClassName}
                  >
                    {screenActive ? "Stop Share" : "Share Screen"}
                  </Button>
                  <MonitorUp size={16} className="text-[#8A7C70]" />
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-[22px] border border-[#E7DED5] bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_35%),#FBF7F3]">
                {screenActive ? (
                  <video
                    ref={screenVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-52 w-full bg-[#071018] object-contain"
                  />
                ) : (
                  <div className="flex h-52 items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm font-[gilroy-semibold] text-[#231A12]">Screen Share</p>
                      <p className="mt-2 text-xs text-[#6D5D50]">
                        Share the candidate's entire screen to preview it here. Tabs and individual windows are rejected.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1.5">
                <p className="text-xs uppercase tracking-[0.14em] text-[#8A7C70]">
                  Proctoring Surface
                </p>
                <p className="text-sm text-[#5D5147]">
                  This box shows the live entire-screen share. Only the full monitor is accepted for this interview.
                </p>
                {screenError ? (
                  <p className="text-xs leading-6 text-[#B34B4B]">{screenError}</p>
                ) : null}
              </div>
            </div>
          </div>

          {/* Focus tracking panel intentionally hidden from the candidate UI. */}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="primary"
            disabled={!interactionEnabled}
            loading={submitAnswerMutation.isPending}
            onClick={handleSubmit}
            className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-6 !font-[gilroy-semibold] hover:!bg-[#E88518]"
          >
            Submit Answer
          </Button>
          <Button
            disabled={!interactionEnabled}
            loading={saveDraftMutation.isPending}
            onClick={handleSaveDraft}
            className="!h-12 !rounded-xl !border-[#E5C8A8] !px-6 !font-[gilroy-semibold] !text-[#8D5609]"
          >
            Save Progress
          </Button>
          <button
            type="button"
            onClick={() => {
              stop();
              stopAll();
              navigate("/dashboard/ai-interview");
            }}
            className="ml-auto text-sm font-[gilroy-semibold] text-[#C55B5B]"
          >
            Exit Session
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {tipCards.map((card, index) => (
          <div
            key={card.title}
            className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_14px_30px_rgba(51,51,51,0.04)]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FFF3E5] text-sm font-[gilroy-bold] text-[#A15A03]">
              0{index + 1}
            </div>
            <p className="mt-4 text-base font-[gilroy-bold] text-[#231A12]">{card.title}</p>
            <p className="mt-3 text-sm leading-7 text-[#6B5A4A]">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotatorInterviewSessionPage;
