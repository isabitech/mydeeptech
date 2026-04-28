import { Alert, Button, Form, Input, Modal, Select, Skeleton } from "antd";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Download,
  FileText,
  Plus,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AI_INTERVIEW_LANGUAGE_OPTIONS } from "../constants/languages";
import MetricCard from "../components/MetricCard";
import StatusPill from "../components/StatusPill";
import {
  useAdminInterviewSessions,
  useAiInterviewTracks,
  useScheduleAiInterview,
} from "../hooks/useAiInterviewQueries";
import { AiInterviewSession } from "../types";

const downloadCsv = (rows: string[][], filename: string) => {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const withinDateWindow = (value: string, range: string) => {
  if (range === "all") {
    return true;
  }

  const targetDate = new Date(value).getTime();
  const start =
    range === "7d"
      ? subDays(new Date(), 7).getTime()
      : subDays(new Date(), 30).getTime();
  return targetDate >= start;
};

const AdminInterviewManagementPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: sessions, isLoading, isError, error, refetch } = useAdminInterviewSessions();
  const { data: tracks } = useAiInterviewTracks();
  const scheduleMutation = useScheduleAiInterview();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("30d");
  const [page, setPage] = useState(1);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const filteredSessions = useMemo(() => {
    if (!sessions) {
      return [];
    }

    const query = search.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesSearch =
        !query ||
        session.candidateName.toLowerCase().includes(query) ||
        session.candidateEmail.toLowerCase().includes(query) ||
        session.trackTitle.toLowerCase().includes(query) ||
        session.id.toLowerCase().includes(query);
      const matchesType = typeFilter === "all" || session.type === typeFilter;
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      const matchesDate = withinDateWindow(session.updatedAt, dateFilter);

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [dateFilter, search, sessions, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    const total = sessions?.length ?? 0;
    const completed = sessions?.filter((session) => Boolean(session.completedAt)) ?? [];
    const passed = completed.filter((session) => session.status === "passed");
    const averageScore = completed.reduce(
      (sum, session) => sum + (session.result?.score ?? 0),
      0,
    );
    const pendingCount =
      sessions?.filter((session) =>
        ["processing", "submitted", "scheduled"].includes(session.status),
      ).length ?? 0;

    return {
      total,
      avgScore: completed.length ? (averageScore / completed.length / 10).toFixed(1) : "0.0",
      successRate: completed.length
        ? `${Math.round((passed.length / completed.length) * 100)}%`
        : "0%",
      pendingCount,
    };
  }, [sessions]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const handleExportCsv = () => {
    const rows = [
      ["Candidate Name", "Email", "Interview Type", "Target Role", "Date", "Status", "Score"],
      ...filteredSessions.map((session) => [
        session.candidateName,
        session.candidateEmail,
        session.trackTitle,
        session.targetRole,
        format(new Date(session.updatedAt), "yyyy-MM-dd"),
        session.status,
        session.result?.score?.toString() ?? "",
      ]),
    ];
    downloadCsv(rows, "ai-interview-report.csv");
  };

  const handleScheduleInterview = async (values: {
    candidateName: string;
    candidateEmail: string;
    trackId: string;
    languageCode: string;
    targetRole: string;
  }) => {
    try {
      await scheduleMutation.mutateAsync(values);
      toast.success("Interview schedule created.");
      form.resetFields();
      setScheduleOpen(false);
    } catch (mutationError) {
      toast.error((mutationError as Error).message ?? "Unable to schedule interview.");
    }
  };

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
        <Skeleton.Input active block className="!h-[560px] !rounded-[28px]" />
      </div>
    );
  }

  if (isError || !sessions) {
    return (
      <Alert
        type="error"
        message="Unable to load interview management data"
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
              Review Operations
            </span>
            <h2 className="mt-5 text-4xl font-[gilroy-bold] tracking-tight">
              Interview Management
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#5D5147]">
              Monitor candidate performance, review pending sessions, and keep
              the hiring signal calibrated across generalist and project-based
              interview queues.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportCsv}
              className="!h-12 !rounded-xl !border-[#E7DED5] !bg-white !px-5 !font-[gilroy-semibold] !text-[#8D5609] hover:!border-[#F0CFAE] hover:!bg-[#FFF8F0]"
            >
              <span className="flex items-center gap-2">
                <Download size={16} />
                Export CSV
              </span>
            </Button>
            <Button
              type="primary"
              onClick={() => setScheduleOpen(true)}
              className="!h-12 !rounded-xl !border-none !bg-[#F6921E] !px-5 !font-[gilroy-semibold] hover:!bg-[#E88518]"
            >
              <span className="flex items-center gap-2">
                <Plus size={16} />
                Schedule Interview
              </span>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Sessions in scope</p>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">{metrics.total}</p>
            <p className="mt-2 text-sm text-[#5D5147]">Total interview records in this view</p>
          </div>
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Filtered view</p>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
              {filteredSessions.length}
            </p>
            <p className="mt-2 text-sm text-[#5D5147]">
              Sessions matching the current search and filter set
            </p>
          </div>
          <div className="rounded-[24px] border border-[#E7DED5] bg-white p-5 shadow-[0_10px_24px_rgba(51,51,51,0.04)]">
            <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Pending review</p>
            <p className="mt-3 text-3xl font-[gilroy-bold] text-[#231A12]">
              {metrics.pendingCount}
            </p>
            <p className="mt-2 text-sm text-[#5D5147]">
              Submitted, processing, or scheduled sessions awaiting action
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total Interviews"
          value={metrics.total.toString()}
          delta="Across queues"
          tone="neutral"
          icon={<FileText size={18} />}
        />
        <MetricCard
          label="Avg. Score"
          value={`${metrics.avgScore}/10`}
          delta="Reviewed sessions"
          tone="warning"
          icon={<Star size={18} />}
        />
        <MetricCard
          label="Success Rate"
          value={metrics.successRate}
          delta="Current window"
          tone="positive"
          icon={<BadgeCheck size={18} />}
        />
        <MetricCard
          label="Pending Tasks"
          value={metrics.pendingCount.toString()}
          delta="Needs attention"
          tone="danger"
          icon={<Clock3 size={18} />}
        />
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#E7DED5] bg-white shadow-[0_18px_40px_rgba(51,51,51,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E5DA] bg-[linear-gradient(135deg,_#FFFCF8,_#FFF5EB)] px-6 py-5">
          <div>
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
              Queue Filters
            </p>
            <h3 className="mt-2 text-xl font-[gilroy-bold]">Search and segment the queue</h3>
            <p className="mt-1 text-sm text-[#7A6B5D]">
              Narrow down candidate sessions by track type, status, and date range.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#F2DFC9] bg-white px-3 py-1 text-xs font-[gilroy-semibold] uppercase tracking-[0.14em] text-[#8D5609]">
            <SlidersHorizontal size={14} />
            {filteredSessions.length} matching sessions
          </div>
        </div>

        <div className="p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_190px_190px_190px]">
            <div className="rounded-[22px] border border-[#EFE4D8] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Search</p>
              <Input
                value={search}
                allowClear
                prefix={<Search size={16} className="text-[#8A7C70]" />}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                size="large"
                placeholder="Search candidates, emails, tracks, or session IDs..."
                className="!mt-3 !rounded-xl"
              />
            </div>
            <div className="rounded-[22px] border border-[#EFE4D8] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Type</p>
              <Select
                size="large"
                value={typeFilter}
                className="!mt-3 w-full"
                onChange={(value) => {
                  setTypeFilter(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Types", value: "all" },
                  { label: "Generalist", value: "generalist" },
                  { label: "Project", value: "project" },
                ]}
              />
            </div>
            <div className="rounded-[22px] border border-[#EFE4D8] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Status</p>
              <Select
                size="large"
                value={statusFilter}
                className="!mt-3 w-full"
                onChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Statuses", value: "all" },
                  { label: "Passed", value: "passed" },
                  { label: "Submitted", value: "submitted" },
                  { label: "Processing", value: "processing" },
                  { label: "Retry Required", value: "retry-required" },
                  { label: "Action Required", value: "action-required" },
                  { label: "Scheduled", value: "scheduled" },
                ]}
              />
            </div>
            <div className="rounded-[22px] border border-[#EFE4D8] bg-[#FFFBF7] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[#8A7C70]">Date range</p>
              <Select
                size="large"
                value={dateFilter}
                className="!mt-3 w-full"
                onChange={(value) => {
                  setDateFilter(value);
                  setPage(1);
                }}
                options={[
                  { label: "Last 30 Days", value: "30d" },
                  { label: "Last 7 Days", value: "7d" },
                  { label: "All Time", value: "all" },
                ]}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setStatusFilter("all");
                setDateFilter("30d");
                setPage(1);
              }}
              className="text-sm font-[gilroy-semibold] text-[#F6921E]"
            >
              Clear all filters
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-[#EEE2D5]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#FBF8F4] text-xs uppercase tracking-[0.16em] text-[#85776A]">
                  <tr>
                    <th className="px-6 py-4">Candidate Name</th>
                    <th className="px-6 py-4">Interview Type</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.map((session: AiInterviewSession) => (
                    <tr
                      key={session.id}
                      className="border-t border-[#F3ECE4] transition-colors hover:bg-[#FFFCF8]"
                    >
                      <td className="px-6 py-4">
                        <p className="font-[gilroy-semibold] text-[#231A12]">
                          {session.candidateName}
                        </p>
                        <p className="mt-1 text-xs text-[#8A7C6F]">
                          {session.candidateEmail}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-[gilroy-medium] text-[#231A12]">
                          {session.trackTitle}
                        </p>
                        <p className="mt-1 text-xs text-[#8A7C6F]">{session.targetRole}</p>
                      </td>
                      <td className="px-6 py-4 text-[#5D5147]">
                        {format(new Date(session.updatedAt), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-[gilroy-bold] text-[#231A12]">
                          {session.result ? `${(session.result.score / 10).toFixed(1)}` : "--"}
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[#7A6B5D]">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredSessions.length)} of{" "}
              {filteredSessions.length} interviews
            </p>
            <div className="flex items-center gap-2">
              <Button
                disabled={currentPage === 1}
                onClick={() => setPage((previous) => Math.max(1, previous - 1))}
                className="!rounded-xl"
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index + 1)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-[gilroy-semibold] ${
                    currentPage === index + 1
                      ? "border-[#F6921E] bg-[#FFF5EB] text-[#F6921E]"
                      : "border-[#E7DED5] bg-white text-[#6B5A4A]"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <Button
                disabled={currentPage === totalPages}
                onClick={() => setPage((previous) => Math.min(totalPages, previous + 1))}
                className="!rounded-xl"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-[#F0DCC9] bg-[linear-gradient(135deg,_#FFF8F0,_#FFFDFB)] p-6 shadow-[0_14px_32px_rgba(246,146,30,0.08)]">
          <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#946232]">
            Reviewer Guidance
          </p>
          <p className="mt-4 text-sm leading-7 text-[#6A5A4A]">
            Scores should remain hidden from candidates until the interview is
            completed. Reviewers can use candidate transcripts, dimension scores,
            and admin notes to validate outliers before final approval.
          </p>
        </div>
        <div className="rounded-[24px] border border-[#E7DED5] bg-white p-6 shadow-[0_14px_30px_rgba(51,51,51,0.04)]">
          <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8A7C70]">
            Attention Required
          </p>
          <p className="mt-4 text-sm leading-7 text-[#6A5A4A]">
            Candidates marked as retry required should receive targeted feedback
            within 24 hours so the second attempt stays tied to the same project
            requirements and evaluation rubric.
          </p>
        </div>
      </div>

      <Modal
        open={scheduleOpen}
        title={null}
        footer={null}
        onCancel={() => setScheduleOpen(false)}
        width={680}
        className="[&_.ant-modal-content]:overflow-hidden [&_.ant-modal-content]:rounded-[32px] [&_.ant-modal-content]:p-0 [&_.ant-modal-body]:p-0"
      >
        <div className="font-[gilroy-regular]">
          <div className="overflow-hidden border-b border-[#E7DED5] bg-[radial-gradient(circle_at_top_left,_rgba(246,146,30,0.16),_transparent_30%),linear-gradient(135deg,_#FFFCF8,_#FFF5EB_55%,_#FFFDFB)] px-8 pb-8 pt-8 text-[#231A12]">
            <p className="text-xs font-[gilroy-semibold] uppercase tracking-[0.16em] text-[#8D5609]">
              Interview Coordination
            </p>
            <h3 className="mt-4 text-3xl font-[gilroy-bold] tracking-tight">
              Schedule interview
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#5D5147]">
              Create a new interview session for a candidate and route it into the
              correct track, language, and role context.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleScheduleInterview}
            className="p-8 font-[gilroy-regular]"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="candidateName"
                label="Candidate Name"
                rules={[{ required: true, message: "Enter the candidate name." }]}
              >
                <Input size="large" />
              </Form.Item>
              <Form.Item
                name="candidateEmail"
                label="Candidate Email"
                rules={[{ required: true, message: "Enter the candidate email." }]}
              >
                <Input size="large" type="email" />
              </Form.Item>
            </div>
            <Form.Item
              name="trackId"
              label="Interview Track"
              rules={[{ required: true, message: "Select an interview track." }]}
            >
              <Select
                size="large"
                options={(tracks ?? []).map((track) => ({
                  label: track.title,
                  value: track.id,
                }))}
              />
            </Form.Item>
            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item
                name="languageCode"
                label="Language"
                initialValue="en-US"
                rules={[{ required: true, message: "Select an interview language." }]}
              >
                <Select
                  size="large"
                  options={AI_INTERVIEW_LANGUAGE_OPTIONS.map((option) => ({
                    label: option.label,
                    value: option.code,
                  }))}
                />
              </Form.Item>
              <Form.Item
                name="targetRole"
                label="Target Role"
                rules={[{ required: true, message: "Enter the target role." }]}
              >
                <Input size="large" />
              </Form.Item>
            </div>
            <div className="mt-2 flex justify-end gap-3 rounded-t-[28px] border-t border-[#E9DFD6] bg-[#FFF7F0] px-6 py-5">
              <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={scheduleMutation.isPending}
                className="!bg-[#F6921E] !font-[gilroy-semibold]"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Schedule
                </span>
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default AdminInterviewManagementPage;
