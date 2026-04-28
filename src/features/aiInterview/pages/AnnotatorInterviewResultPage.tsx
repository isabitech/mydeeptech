import { Alert, Button, Skeleton } from "antd";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Share2,
  ShieldAlert,
  TriangleAlert,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CircularScore from "../components/CircularScore";
import StatusPill from "../components/StatusPill";
import { useAiInterviewResult, useAiInterviewTrack } from "../hooks/useAiInterviewQueries";
import { cn } from "../../../lib/utils";

const downloadTextFile = (filename: string, content: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const AnnotatorInterviewResultPage = () => {
  const navigate = useNavigate();
  const { sessionId = "" } = useParams();
  const { data: session, isLoading, isError, error, refetch } = useAiInterviewResult(
    sessionId,
    Boolean(sessionId),
  );
  const { data: track } = useAiInterviewTrack(session?.trackId ?? "", Boolean(session?.trackId));
  const integrityState = useMemo(() => {
    if (!session?.focusLossAssessment) {
      return {
        hasAssessment: false,
        hasFailure: false,
        summary: "",
        countLabel: "",
      };
    }

    const assessment = session.focusLossAssessment;
    const normalizedStatus = String(assessment.status ?? assessment.decision ?? "")
      .trim()
      .toLowerCase();
    const hasFailure =
      assessment.failed === true ||
      ["failed", "fail", "action-required", "blocked", "integrity-failed"].includes(
        normalizedStatus,
      ) ||
      (session.status === "action-required" && Boolean(assessment.summary || assessment.reason));
    const eventCount = assessment.focusLossCount ?? assessment.eventCount;
    const threshold =
      typeof assessment.threshold === "number" ? assessment.threshold : undefined;

    return {
      hasAssessment: true,
      hasFailure,
      summary:
        assessment.summary ??
        assessment.reason ??
        "This session was flagged by the interview integrity review because focus-loss activity was detected.",
      countLabel:
        typeof eventCount === "number"
          ? threshold
            ? `${eventCount} focus-loss events detected against a threshold of ${threshold}.`
            : `${eventCount} focus-loss events detected during the interview.`
          : "",
    };
  }, [session?.focusLossAssessment, session?.status]);
  const resultPresentation = useMemo(() => {
    if (integrityState.hasFailure) {
      return {
        icon: <ShieldAlert size={36} />,
        iconClassName: "bg-red-100 text-red-600",
        eyebrow: "Integrity review",
        summary: integrityState.summary,
        heroClassName:
          "border-[#F0C9C9] bg-[radial-gradient(circle_at_top_left,_rgba(245,120,120,0.16),_transparent_32%),linear-gradient(135deg,_#FFF8F8,_#FFF1F1_55%,_#FFFDFD)]",
      };
    }

    return {
      icon: <CheckCircle2 size={36} />,
      iconClassName: "bg-emerald-100 text-emerald-600",
      eyebrow: session?.result?.status === "passed" ? "Congratulations" : "Interview outcome",
      summary: session?.result?.summary ?? "",
      heroClassName:
        "border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)]",
    };
  }, [
    integrityState.hasFailure,
    integrityState.summary,
    session?.result?.status,
    session?.result?.summary,
  ]);

  const transcriptText = useMemo(() => {
    if (!session || !track) {
      return "";
    }
    const lines = [
      `${track.title} (${session.id})`,
      `Candidate: ${session.candidateName}`,
      `Status: ${session.result?.badgeLabel ?? session.status}`,
      `Score: ${session.result?.score ?? "N/A"}/100`,
      ...(integrityState.hasFailure
        ? [
            `Integrity Review: ${integrityState.summary}`,
            ...(integrityState.countLabel ? [integrityState.countLabel] : []),
          ]
        : []),
      "",
      "Transcript",
      "----------",
    ];

    track.questions.forEach((question, index) => {
      lines.push(`Q${index + 1}: ${question.prompt}`);
      lines.push(`A${index + 1}: ${session.answers[index]?.answer ?? "No answer recorded"}`);
      lines.push("");
    });

    return lines.join("\n");
  }, [integrityState.countLabel, integrityState.hasFailure, integrityState.summary, session, track]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active block className="!h-[320px] !rounded-[32px]" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_320px]">
          <Skeleton.Input active block className="!h-[460px] !rounded-[28px]" />
          <Skeleton.Input active block className="!h-[360px] !rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (isError || !session || !track || !session.result) {
    return (
      <Alert
        type="error"
        message="Unable to load interview result"
        description={(error as Error | undefined)?.message ?? "Please try again."}
        action={
          <Button onClick={() => refetch()} className="!font-[gilroy-semibold]">
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6 font-[gilroy-regular] text-[#231A12]">
      <div
        className={cn(
          "overflow-hidden rounded-[32px] border p-8 text-[#231A12] shadow-[0_20px_48px_rgba(51,51,51,0.06)]",
          resultPresentation.heroClassName,
        )}
      >
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_320px] xl:items-center">
          <div>
            <div
              className={`flex h-20 w-20 items-center justify-center rounded-full ${resultPresentation.iconClassName}`}
            >
              {resultPresentation.icon}
            </div>
            <p className="mt-6 text-sm text-[#6D5D50]">{resultPresentation.eyebrow}</p>
            <h2 className="mt-2 text-4xl font-[gilroy-bold] tracking-tight">
              Interview Results
            </h2>
            <div className="mt-4 flex items-center">
              <StatusPill status={session.result.status} label={session.result.badgeLabel} />
            </div>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[#5D5147]">
              {resultPresentation.summary}
            </p>
            {integrityState.hasFailure && integrityState.countLabel ? (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#A33E3E]">
                {integrityState.countLabel}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Your score</p>
              <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
                {session.result.score}/100
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Percentile</p>
              <p className="mt-3 text-lg font-[gilroy-semibold] text-[#231A12]">
                {session.result.percentileLabel}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Progress</p>
              <p className="mt-3 text-lg font-[gilroy-semibold] text-[#231A12]">
                {session.result.moduleProgress}% complete
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_320px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  Interview Summary
                </p>
                <h3 className="mt-2 text-2xl font-[gilroy-bold]">{track.title}</h3>
              </div>
              <div className="rounded-2xl bg-white px-5 py-4 shadow-[0_8px_20px_rgba(51,51,51,0.04)]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                  Qualification
                </p>
                <p className="mt-2 text-lg font-[gilroy-bold] text-[#F6921E]">
                  {session.result.qualificationLabel}
                </p>
              </div>
            </div>

            <div className="p-6">
              {integrityState.hasFailure ? (
                <div className="rounded-[24px] border border-[#F2C7C7] bg-[#FFF5F5] p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FCE3E3] text-[#C44D4D]">
                      <TriangleAlert size={18} />
                    </div>
                    <div>
                      <p className="font-[gilroy-bold] text-[#A33E3E]">
                        Integrity failure summary
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#6B4A4A]">
                        {integrityState.summary}
                      </p>
                      {integrityState.countLabel ? (
                        <p className="mt-2 text-sm leading-7 text-[#8B4C4C]">
                          {integrityState.countLabel}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm leading-7 text-[#6B4A4A]">
                        The final session outcome reflects the interview integrity
                        review returned by the backend.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="primary"
                  onClick={() => navigate("/dashboard/projects")}
                  className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-6 !font-[gilroy-semibold] hover:!bg-[#E88518]"
                >
                  Browse Available Projects
                </Button>
                {session.result.status !== "passed" ? (
                  <Button
                    onClick={() =>
                      navigate(
                        `/dashboard/ai-interview/setup/${track.type === "project" ? "project" : track.id}`,
                      )
                    }
                    className="!h-12 !rounded-xl !border-[#E8C7A7] !px-6 !font-[gilroy-semibold] !text-[#8D5508]"
                  >
                    <span className="flex items-center gap-2">
                      <RotateCcw size={16} />
                      Retry Path
                    </span>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_320px]">
            <div className="rounded-[28px] border border-[#E7DED5] bg-white p-7 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
              <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                Strength Signal
              </p>
              <h3 className="mt-2 text-xl font-[gilroy-bold]">Key strengths identified</h3>
              <div className="mt-5 space-y-4">
                {session.result.strengths.map((strength) => (
                  <div
                    key={strength.title}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4"
                  >
                    <p className="font-[gilroy-semibold] text-emerald-800">
                      {strength.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-emerald-900/80">
                      {strength.description}
                    </p>
                  </div>
                ))}
              </div>

              {session.result.concerns.length > 0 ? (
                <div className="mt-6 rounded-2xl border border-[#F0DCC9] bg-[#FFF8F0] p-5">
                  <p className="font-[gilroy-bold] text-[#7F4E10]">Keep in focus</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-[#6B5A4A]">
                    {session.result.concerns.map((concern) => (
                      <li key={concern} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F6921E]" />
                        <span>{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="rounded-[28px] border border-[#E7DED5] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] p-7 text-[#231A12] shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Next step</p>
              <h3 className="mt-2 text-xl font-[gilroy-bold]">
                {session.result.nextStepTitle}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#5D5147]">
                {session.result.nextStepDescription}
              </p>
              <div className="mt-8">
                <div className="mb-2 flex items-center justify-between text-sm font-[gilroy-semibold] text-[#6D5D50]">
                  <span>Module progress</span>
                  <span>{session.result.moduleProgress}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E6DA]">
                  <div
                    className="h-full rounded-full bg-[#F6921E]"
                    style={{ width: `${session.result.moduleProgress}%` }}
                  />
                </div>
              </div>
              <Button
                onClick={() => navigate("/dashboard/projects")}
                className="!mt-8 !h-12 !rounded-xl !border-none !bg-[#F6921E] !px-5 !font-[gilroy-semibold] !text-white hover:!bg-[#E88518]"
              >
                Resume Training
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <CircularScore
            value={session.result.score}
            label={session.result.qualificationLabel}
          />
          <div className="rounded-[28px] border border-[#E7DED5] bg-white p-6 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8A7C70]">
              Result Details
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-[#7A6A5E]">Percentile</p>
                <p className="mt-1 text-lg font-[gilroy-bold]">
                  {session.result.percentileLabel}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#7A6A5E]">Interview ID</p>
                <p className="mt-1 text-sm font-[gilroy-semibold] text-[#231A12]">
                  {session.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#7A6A5E]">Track</p>
                <p className="mt-1 text-sm font-[gilroy-semibold] text-[#231A12]">
                  {track.title}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-[#7A6A5E]">
        <span>Interview ID: {session.id}</span>
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => downloadTextFile(`${session.id}-transcript.txt`, transcriptText)}
            className="inline-flex items-center gap-2 font-[gilroy-semibold] text-[#8D5609]"
          >
            <Download size={16} />
            Download Transcript
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="inline-flex items-center gap-2 font-[gilroy-semibold] text-[#8D5609]"
          >
            <Share2 size={16} />
            Share Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorInterviewResultPage;
