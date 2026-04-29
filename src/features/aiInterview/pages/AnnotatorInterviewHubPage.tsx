import { Alert, Button, Skeleton } from "antd";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  FlaskConical,
  Layers3,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import StatusPill from "../components/StatusPill";
import TrackCard from "../components/TrackCard";
import { useCandidateInterviewOverview } from "../hooks/useAiInterviewQueries";
import { useGetUserInfo } from "../../../store/useAuthStore";

const AnnotatorInterviewHubPage = () => {
  const navigate = useNavigate();
  const userInfo = useGetUserInfo("user");

  const candidate = useMemo(
    () =>
      userInfo?.id && userInfo?.fullName && userInfo?.email
        ? {
            id: userInfo.id,
            fullName: userInfo.fullName,
            email: userInfo.email,
          }
        : null,
    [userInfo?.email, userInfo?.fullName, userInfo?.id],
  );

  const { data, isLoading, isError, error, refetch } =
    useCandidateInterviewOverview(candidate, Boolean(candidate?.id));

  const generalistTrack = data?.tracks.find((track) => track.type === "generalist");
  const projectTracks = data?.tracks.filter((track) => track.type === "project") ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 font-[gilroy-regular]">
        <Skeleton.Input active block className="!h-[320px] !rounded-[32px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton.Input
              key={index}
              active
              block
              className="!h-[148px] !rounded-[28px]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <Skeleton.Input active block className="!h-[520px] !rounded-[28px]" />
          <Skeleton.Input active block className="!h-[520px] !rounded-[28px]" />
        </div>
      </div>
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

  if (isError || !data) {
    return (
      <Alert
        type="error"
        message="Unable to load AI interview data"
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
    <div className="flex flex-col gap-y-10 font-[gilroy-regular] text-[#231A12] mb-10">
      <div className="overflow-hidden rounded-md border border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] p-6 text-[#231A12] shadow-[0_20px_48px_rgba(51,51,51,0.06)]">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_340px]">
          <div className="flex flex-col gap-3">
            <span className="rounded-full border border-[#ECD9C7] self-start bg-white px-3 py-2 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8D5609]">
              Annotator Qualification
            </span>
            <h2 className="text-4xl font-[gilroy-bold] tracking-tight">
              AI Interview
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-[#5D5147]">
              Evaluate your readiness, unlock higher-trust queues, and move into
              more specialized project lanes through guided interview sessions
              built around real delivery expectations.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-md border border-[#E7DED5] bg-white p-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
                <div className="flex items-center gap-2 text-[#8A7C70]">
                  <BadgeCheck size={16} />
                  <p className="text-xs uppercase tracking-[0.16em]">Generalist track</p>
                </div>
                <p className="mt-3 text-sm font-[gilroy-semibold] text-[#231A12]">
                  {generalistTrack?.title ?? "Platform qualification interview"}
                </p>
              </div>
              <div className="rounded-md border border-[#E7DED5] bg-white p-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
                <div className="flex items-center gap-2 text-[#8A7C70]">
                  <Layers3 size={16} />
                  <p className="text-xs uppercase tracking-[0.16em]">Project interviews</p>
                </div>
                <p className="mt-3 text-sm font-[gilroy-semibold] text-[#231A12]">
                  {projectTracks.length} specialized queues available now
                </p>
              </div>
              <div className="rounded-md border border-[#E7DED5] bg-white p-4 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
                <div className="flex items-center gap-2 text-[#8A7C70]">
                  <Sparkles size={16} />
                  <p className="text-xs uppercase tracking-[0.16em]">Reward signal</p>
                </div>
                <p className="mt-3 text-sm font-[gilroy-semibold] text-[#231A12]">
                  {generalistTrack?.multiplierLabel ?? "Higher trust and pay multipliers"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-md border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Completed</p>
              <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
                {data.stats.completed}
              </p>
              <p className="mt-2 text-sm text-[#5D5147]">Interview history on your account</p>
            </div>
            <div className="rounded-md border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Pending</p>
              <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
                {data.stats.pending}
              </p>
              <p className="mt-2 text-sm text-[#5D5147]">Sessions still awaiting review</p>
            </div>
            <div className="rounded-md border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Passed</p>
              <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
                {data.stats.passed}
              </p>
              <p className="mt-2 text-sm text-[#5D5147]">Approved tracks ready for work</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.18em] text-[#946232]">
            Progress Snapshot
          </p>
          <h3 className="mt-2 text-2xl font-[gilroy-bold] tracking-tight">
            Current interview standing
          </h3>
          <p className="max-w-2xl text-sm leading-7 mt-2 text-[#6B5C4F]">
          These signals summarize completed assessments, pending reviews, passed
          tracks, and any integrity or retry states that still need attention.
        </p>
        </div>
        
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Completed"
          value={data.stats.completed.toString()}
          delta="Interview history"
          tone="neutral"
          icon={<BadgeCheck size={18} />}
        />
        <MetricCard
          label="Pending"
          value={data.stats.pending.toString()}
          delta="Awaiting action"
          tone="warning"
          icon={<Clock3 size={18} />}
        />
        <MetricCard
          label="Passed"
          value={data.stats.passed.toString()}
          delta="Approved tracks"
          tone="positive"
          icon={<FlaskConical size={18} />}
        />
        <MetricCard
          label="Action Required"
          value={data.stats.actionRequired.toString()}
          delta="Needs review"
          tone="danger"
          icon={<ShieldAlert size={18} />}
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.18em] text-[#946232]">
            Available Interviews
          </p>
          <h3 className="mt-2 text-2xl font-[gilroy-bold] tracking-tight">
            Choose your next qualification path
          </h3>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2 p-6 bg-white border border-gray-200 rounded-md">
        {generalistTrack ? (
          <TrackCard
            title={generalistTrack.title}
            description={generalistTrack.summary}
            badge={generalistTrack.levelLabel}
            meta={[
              `${generalistTrack.durationMinutes}m avg.`,
              generalistTrack.multiplierLabel,
              generalistTrack.badgeReward,
            ]}
            ctaLabel="Start Generalist Interview"
            onClick={() => navigate(`/dashboard/ai-interview/setup/${generalistTrack.id}`)}
            variant="generalist"
            footer={
              <div className="flex items-center justify-between rounded-md border border-[#F2E4D6] bg-[#FFFBF7] px-4 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#946232]">
                    Best first step
                  </p>
                  <p className="mt-1 text-sm text-[#5B4C40]">
                    Start here to unlock project-based interview tracks.
                  </p>
                </div>
                <ArrowRight size={18} className="text-[#F6921E]" />
              </div>
            }
          />
        ) : null}
      </div>

      <div className="overflow-hidden rounded-md border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
          <div>
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Recent Activity
            </p>
            <h3 className="mt-2 text-xl font-[gilroy-bold]">Latest interview attempts</h3>
            <p className="mt-1 text-sm text-[#716355]">
              Your most recent sessions, scores, and review outcomes.
            </p>
          </div>
          <div className="rounded-full border border-[#F2DFC9] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
            {data.recentActivity.length} sessions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#FBF8F4] text-xs uppercase tracking-[0.16em] text-[#85776A]">
              <tr>
                <th className="px-6 py-4">Assessment Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date Attempted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentActivity.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#F3ECE4] transition-colors hover:bg-[#FFFCF8]"
                >
                  <td className="px-6 py-4">
                    <p className="font-[gilroy-semibold] text-[#231A12]">{row.title}</p>
                    <p className="mt-1 text-xs text-[#8A7C6F]">
                      {row.score ? `Score ${row.score}/100` : "Awaiting score"}
                    </p>
                  </td>
                  <td className="px-6 py-4 capitalize text-[#5D5147]">{row.type}</td>
                  <td className="px-6 py-4 text-[#5D5147]">
                    {format(new Date(row.attemptedAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    {row.status === "in-progress" ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/ai-interview/session/${row.id}`)}
                        className="font-[gilroy-semibold] text-[#F6921E]"
                      >
                        Continue
                      </button>
                    ) : row.status === "processing" || row.status === "submitted" ? (
                      <span className="text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8A7C6F]">
                        Await review
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/ai-interview/results/${row.id}`)}
                        className="font-[gilroy-semibold] text-[#F6921E]"
                      >
                        View result
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorInterviewHubPage;
