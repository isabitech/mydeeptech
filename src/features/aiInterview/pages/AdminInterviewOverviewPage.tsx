import { Alert, Button, Skeleton } from "antd";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  ShieldCheck,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "../components/MetricCard";
import StatusPill from "../components/StatusPill";
import { useAdminInterviewOverview } from "../hooks/useAiInterviewQueries";

const metricIconMap = {
  total: <FileText size={18} />,
  "pass-rate": <BadgeCheck size={18} />,
  "avg-score": <Star size={18} />,
  pending: <TriangleAlert size={18} />,
};

const AdminInterviewOverviewPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAdminInterviewOverview();

  const insightCopy = useMemo(() => {
    if (!data?.topSkillMatch?.length) {
      return "Interview metrics will populate once candidates begin submitting specialized sessions.";
    }

    const topTrack = data.topSkillMatch[0];
    return `${topTrack.label} has the strongest average signal in the current review window.`;
  }, [data?.topSkillMatch]);

  const metricLookup = useMemo(
    () =>
      Object.fromEntries((data?.metrics ?? []).map((metric) => [metric.id, metric.value])) as Record<
        string,
        string
      >,
    [data?.metrics],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton.Input active block className="!h-[320px] !rounded-[32px]" />
        <div className="grid gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton.Input
              key={index}
              active
              block
              className="!h-[148px] !rounded-[28px]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <Skeleton.Input active block className="!h-[440px] !rounded-[28px]" />
          <Skeleton.Input active block className="!h-[440px] !rounded-[28px]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        type="error"
        message="Unable to load interview overview"
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
      <div className="overflow-hidden rounded-[32px] border border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] p-8 text-[#231A12] shadow-[0_20px_48px_rgba(51,51,51,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-4xl">
            <span className="rounded-full border border-[#ECD9C7] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8D5609]">
              Admin Workspace
            </span>
            <h2 className="mt-5 text-4xl font-[gilroy-bold] tracking-tight">
              AI Interview Overview
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5D5147]">
              Monitor interview throughput, review pass quality, and keep the
              signal used for specialized queue access aligned across the
              platform.
            </p>
          </div>
          <Button
            type="primary"
            onClick={() => navigate("/admin/interviews/candidates")}
            className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-6 !font-[gilroy-semibold] hover:!bg-[#E88518]"
          >
            Open Interview Queue
          </Button>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <div className="flex items-center gap-2 text-[#8A7C70]">
              <FileText size={16} />
              <p className="text-xs uppercase tracking-[0.16em]">Total sessions</p>
            </div>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
              {metricLookup.total ?? "0"}
            </p>
            <p className="mt-2 text-sm text-[#5D5147]">All interview sessions in scope</p>
          </div>
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <div className="flex items-center gap-2 text-[#8A7C70]">
              <ShieldCheck size={16} />
              <p className="text-xs uppercase tracking-[0.16em]">Pass rate</p>
            </div>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
              {metricLookup["pass-rate"] ?? "0%"}
            </p>
            <p className="mt-2 text-sm text-[#5D5147]">
              Cleared sessions in the current review window
            </p>
          </div>
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <div className="flex items-center gap-2 text-[#8A7C70]">
              <TriangleAlert size={16} />
              <p className="text-xs uppercase tracking-[0.16em]">Pending review</p>
            </div>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
              {metricLookup.pending ?? "0"}
            </p>
            <p className="mt-2 text-sm text-[#5D5147]">
              Sessions still waiting for final reviewer action
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            tone={metric.tone}
            icon={metricIconMap[metric.id as keyof typeof metricIconMap]}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
            <div>
              <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
                Volume Trend
              </p>
              <h3 className="mt-2 text-xl font-[gilroy-bold]">Interview volume trend</h3>
              <p className="mt-1 text-sm text-[#7A6B5D]">
                Recent submission volume across the last seven days.
              </p>
            </div>
            <span className="rounded-full border border-[#EFE0D1] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Last 7 Days
            </span>
          </div>
          <div className="h-[340px] px-4 py-6 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <defs>
                  <linearGradient id="interviewVolume" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#F6921E" stopOpacity={0.36} />
                    <stop offset="100%" stopColor="#F6921E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#F1E7DD" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7A6B5D", fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#7A6B5D", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: "#F2D8BC", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid #EADCCF",
                    boxShadow: "0 12px 30px rgba(51,51,51,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="interviews"
                  stroke="#F6921E"
                  strokeWidth={3}
                  fill="url(#interviewVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#E7DED5] bg-white p-6 shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Calibration
            </p>
            <h3 className="mt-2 text-xl font-[gilroy-bold]">Top skill match</h3>
            <div className="mt-6 space-y-5">
              {data.topSkillMatch.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm font-[gilroy-semibold]">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#F1E6DA]">
                    <div
                      className="h-full rounded-full bg-[#F6921E]"
                      style={{ width: `${Math.min(item.value, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#F0DCC9] bg-[linear-gradient(135deg,_#FFF8F0,_#FFFDFB)] p-6 shadow-[0_14px_32px_rgba(246,146,30,0.08)]">
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Insight
            </p>
            <p className="mt-4 text-sm leading-7 text-[#6A5A4A]">{insightCopy}</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
          <div>
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Review Queue
            </p>
            <h3 className="mt-2 text-xl font-[gilroy-bold]">Recent submissions</h3>
            <p className="mt-1 text-sm text-[#7A6B5D]">
              Latest candidate sessions entering the review flow.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/admin/interviews/candidates")}
            className="inline-flex items-center gap-2 text-sm font-[gilroy-semibold] text-[#F6921E]"
          >
            View All Submissions
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#FBF8F4] text-xs uppercase tracking-[0.16em] text-[#85776A]">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Interview Type</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSubmissions.map((session) => (
                <tr
                  key={session.id}
                  className="border-t border-[#F3ECE4] transition-colors hover:bg-[#FFFCF8]"
                >
                  <td className="px-6 py-4">
                    <p className="font-[gilroy-semibold] text-[#231A12]">
                      {session.candidateName}
                    </p>
                    <p className="mt-1 text-xs text-[#8A7C6F]">{session.candidateEmail}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-[gilroy-medium] text-[#231A12]">{session.trackTitle}</p>
                    <p className="mt-1 text-xs text-[#8A7C6F]">{session.targetRole}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-[gilroy-bold] text-[#231A12]">
                      {session.result ? `${(session.result.score / 10).toFixed(1)} / 10` : "-- / 10"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={session.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/interviews/${session.id}`)}
                      className="font-[gilroy-semibold] text-[#F6921E]"
                    >
                      View Report
                    </button>
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

export default AdminInterviewOverviewPage;
