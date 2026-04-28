import { Alert, Button, Input, Skeleton } from "antd";
import {
  ArrowLeft,
  Download,
  Save,
  ShieldAlert,
  SquareChartGantt,
} from "lucide-react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import StatusPill from "../components/StatusPill";
import {
  useAdminInterviewReport,
  useUpdateAiInterviewDecision,
  useUpdateAiInterviewNote,
} from "../hooks/useAiInterviewQueries";
import { AiInterviewDecision } from "../types";

const { TextArea } = Input;

const downloadJson = (filename: string, payload: unknown) => {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const AdminInterviewReportPage = () => {
  const navigate = useNavigate();
  const { sessionId = "" } = useParams();
  const { data, isLoading, isError, error, refetch } = useAdminInterviewReport(
    sessionId,
    Boolean(sessionId),
  );
  const updateDecisionMutation = useUpdateAiInterviewDecision();
  const updateNoteMutation = useUpdateAiInterviewNote();
  const [note, setNote] = useState("");

  useEffect(() => {
    setNote(data?.adminNote ?? "");
  }, [data?.adminNote]);

  const dimensionAverage = useMemo(() => {
    if (!data?.session.dimensionScores.length) {
      return 0;
    }
    const total = data.session.dimensionScores.reduce((sum, item) => sum + item.score, 0);
    return Math.round((total / data.session.dimensionScores.length) * 10) / 10;
  }, [data?.session.dimensionScores]);

  const answeredCount = useMemo(
    () =>
      data?.session.answers.filter((item) => item.answer?.trim().length).length ?? 0,
    [data?.session.answers],
  );

  const integritySummary = useMemo(() => {
    const assessment = data?.session.focusLossAssessment;
    if (!assessment) {
      return null;
    }

    const normalizedStatus = String(assessment.status ?? assessment.decision ?? "")
      .trim()
      .toLowerCase();
    const failed =
      assessment.failed === true ||
      ["failed", "fail", "action-required", "blocked", "integrity-failed"].includes(
        normalizedStatus,
      );
    const eventCount = assessment.focusLossCount ?? assessment.eventCount;
    const threshold =
      typeof assessment.threshold === "number" ? assessment.threshold : undefined;

    return {
      failed,
      summary:
        assessment.summary ??
        assessment.reason ??
        "Focus-loss activity was detected during the interview session.",
      countLabel:
        typeof eventCount === "number"
          ? threshold
            ? `${eventCount} focus-loss events detected against a threshold of ${threshold}.`
            : `${eventCount} focus-loss events detected during the session.`
          : "",
    };
  }, [data?.session.focusLossAssessment]);

  const handleDecision = async (status: AiInterviewDecision) => {
    if (!data) {
      return;
    }

    try {
      await updateDecisionMutation.mutateAsync({
        sessionId: data.session.id,
        status,
      });
      toast.success("Interview decision updated.");
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to update decision.");
    }
  };

  const handleSaveNote = async () => {
    if (!data) {
      return;
    }

    try {
      await updateNoteMutation.mutateAsync({
        sessionId: data.session.id,
        note,
      });
      toast.success("Admin note saved.");
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to save note.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active block className="!h-[280px] !rounded-[32px]" />
        <Skeleton.Input active block className="!h-[560px] !rounded-[28px]" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        type="error"
        message="Unable to load interview report"
        description={(error as Error | undefined)?.message ?? "Please try again."}
        action={
          <Button onClick={() => refetch()} className="!font-[gilroy-semibold]">
            Retry
          </Button>
        }
      />
    );
  }

  const { session, track } = data;

  return (
    <div className="space-y-6 font-[gilroy-regular] text-[#231A12]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/interviews/candidates")}
          className="inline-flex items-center gap-2 text-sm font-[gilroy-semibold] text-[#6A5A4A]"
        >
          <ArrowLeft size={16} />
          Back to Interview Queue
        </button>
        <button
          type="button"
          onClick={() =>
            downloadJson(`${session.id}-report.json`, {
              session,
              track,
              adminNote: note,
            })
          }
          className="inline-flex items-center gap-2 text-sm font-[gilroy-semibold] text-[#8D5609]"
        >
          <Download size={16} />
          Download Report JSON
        </button>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] p-8 text-[#231A12] shadow-[0_20px_48px_rgba(51,51,51,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-4xl">
            <p className="text-sm text-[#6D5D50]">{track.title}</p>
            <h2 className="mt-2 text-4xl font-[gilroy-bold] tracking-tight">
              {session.candidateName}
            </h2>
            <p className="mt-3 text-sm text-[#5D5147]">{session.candidateEmail}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <StatusPill status={session.status} />
              <span className="rounded-full border border-[#ECD9C7] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8D5609]">
                {session.targetRole}
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Interview ID</p>
              <p className="mt-2 text-sm font-[gilroy-semibold] text-[#231A12]">{session.id}</p>
            </div>
            <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Language</p>
              <p className="mt-2 text-sm font-[gilroy-semibold] text-[#231A12]">
                {session.languageCode}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Updated</p>
              <p className="mt-2 text-sm font-[gilroy-semibold] text-[#231A12]">
                {format(new Date(session.updatedAt), "MMM dd, yyyy")}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#E7DED5] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Score</p>
              <p className="mt-2 text-sm font-[gilroy-semibold] text-[#231A12]">
                {session.result ? `${session.result.score}/100` : `${dimensionAverage}/10`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            onClick={() => handleDecision("passed")}
            loading={updateDecisionMutation.isPending}
            className="!h-11 !rounded-xl !border-[#C6E7D5] !bg-[#EDF9F2] !font-[gilroy-semibold] !text-[#177245]"
          >
            Mark Passed
          </Button>
          <Button
            onClick={() => handleDecision("retry-required")}
            loading={updateDecisionMutation.isPending}
            className="!h-11 !rounded-xl !border-[#F1D9BF] !bg-[#FFF5EB] !font-[gilroy-semibold] !text-[#A15A03]"
          >
            Request Retry
          </Button>
          <Button
            onClick={() => handleDecision("action-required")}
            loading={updateDecisionMutation.isPending}
            className="!h-11 !rounded-xl !border-[#F0C9C9] !bg-[#FFF1F1] !font-[gilroy-semibold] !text-[#B34B4B]"
          >
            Flag Action Required
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  Dimension Breakdown
                </p>
                <h3 className="mt-2 text-xl font-[gilroy-bold]">Reviewer score calibration</h3>
              </div>
              <div className="rounded-full border border-[#F2DFC9] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
                Avg. {dimensionAverage}/10
              </div>
            </div>
            <div className="space-y-5 p-6">
              {session.dimensionScores.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-[#EFE4D8] bg-[#FFFBF7] p-5"
                >
                  <div className="mb-3 flex items-center justify-between text-sm font-[gilroy-semibold]">
                    <span>{item.label}</span>
                    <span>{item.score}/10</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E6DA]">
                    <div
                      className="h-full rounded-full bg-[#F6921E]"
                      style={{ width: `${item.score * 10}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#67584B]">{item.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  Transcript Review
                </p>
                <h3 className="mt-2 text-xl font-[gilroy-bold]">Question by question answers</h3>
              </div>
              <div className="rounded-full border border-[#F2DFC9] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
                {answeredCount}/{track.questions.length} answered
              </div>
            </div>
            <div className="space-y-5 p-6">
              {track.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-[22px] border border-[#ECE2D7] bg-[#FFFDFB] p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF3E5] text-sm font-[gilroy-bold] text-[#A15A03]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                        Question {index + 1}
                      </p>
                      <p className="mt-3 text-base leading-8 text-[#231A12]">
                        {question.prompt}
                      </p>
                      <div className="mt-4 rounded-2xl bg-[#FBF7F3] p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">
                          Candidate Answer
                        </p>
                        <p className="mt-3 text-sm leading-7 text-[#5D5147]">
                          {session.answers[index]?.answer ??
                            "No answer submitted for this question."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <div className="flex items-center gap-3 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
              <SquareChartGantt size={18} className="text-[#F6921E]" />
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  AI Summary
                </p>
                <h3 className="mt-1 text-xl font-[gilroy-bold]">Outcome and watchouts</h3>
              </div>
            </div>
            <div className="p-6">
              {session.result ? (
                <>
                  <p className="text-sm leading-7 text-[#5D5147]">
                    {session.result.summary}
                  </p>
                  <div className="mt-6 rounded-2xl bg-[#FFF8F0] p-5">
                    <p className="font-[gilroy-semibold] text-[#8C5409]">Watchouts</p>
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-[#67584B]">
                      {session.result.concerns.map((concern) => (
                        <li key={concern} className="flex gap-3">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#F6921E]" />
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-7 text-[#5D5147]">
                  This session is still awaiting a final candidate outcome. Partial
                  answers and dimension scores are available for reviewer inspection.
                </p>
              )}
            </div>
          </div>

          {integritySummary ? (
            <div
              className={`rounded-[28px] border p-6 shadow-[0_14px_30px_rgba(51,51,51,0.04)] ${
                integritySummary.failed
                  ? "border-[#F0C9C9] bg-[#FFF5F5]"
                  : "border-[#E7DED5] bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${
                    integritySummary.failed
                      ? "bg-[#FCE3E3] text-[#C44D4D]"
                      : "bg-[#FFF3E5] text-[#A15A03]"
                  }`}
                >
                  <ShieldAlert size={18} />
                </div>
                <div>
                  <p
                    className={`font-[gilroy-bold] ${
                      integritySummary.failed ? "text-[#A33E3E]" : "text-[#7F4E10]"
                    }`}
                  >
                    Integrity review
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#6B4A4A]">
                    {integritySummary.summary}
                  </p>
                  {integritySummary.countLabel ? (
                    <p className="mt-2 text-sm leading-7 text-[#8B4C4C]">
                      {integritySummary.countLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <div className="flex items-center gap-3 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
              <Save size={18} className="text-[#F6921E]" />
              <div>
                <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                  Admin Notes
                </p>
                <h3 className="mt-1 text-xl font-[gilroy-bold]">Reviewer context</h3>
              </div>
            </div>
            <div className="p-6">
              <TextArea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Document reviewer context, escalation notes, or calibration comments."
                className="!min-h-[220px] !rounded-2xl !border-[#E7DED5] !bg-[#FFFDFB] !p-4 !leading-7"
              />
              <Button
                type="primary"
                loading={updateNoteMutation.isPending}
                onClick={handleSaveNote}
                className="!mt-5 !h-11 !rounded-xl !border-none !bg-[#F6921E] !px-5 !font-[gilroy-semibold]"
              >
                <span className="flex items-center gap-2">
                  <Save size={16} />
                  Save Note
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterviewReportPage;
