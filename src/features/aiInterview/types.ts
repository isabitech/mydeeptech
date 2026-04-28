export type AiInterviewTrackType = "generalist" | "project";

export type AiInterviewStatus =
  | "scheduled"
  | "not-started"
  | "in-progress"
  | "submitted"
  | "processing"
  | "passed"
  | "retry-required"
  | "action-required";

export type AiInterviewDecision = "passed" | "retry-required" | "action-required";

export interface AiInterviewLanguage {
  code: string;
  label: string;
  region: string;
  flag: string;
}

export interface AiInterviewReadinessItem {
  id: string;
  title: string;
  description: string;
}

export interface AiInterviewQuestion {
  id: string;
  sectionTitle: string;
  prompt: string;
  placeholder: string;
  tip: string;
  suggestedMinutes: number;
}

export interface AiInterviewTrack {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  summary: string;
  type: AiInterviewTrackType;
  levelLabel: string;
  badgeReward: string;
  introId: string;
  durationMinutes: number;
  multiplierLabel: string;
  targetRoles: string[];
  keyInstructions: string[];
  readinessChecklist: AiInterviewReadinessItem[];
  preparationTip: string;
  progressLabel: string;
  sectionLabels: string[];
  heroVariant: "generalist" | "python" | "medical" | "translation";
  questions: AiInterviewQuestion[];
}

export interface AiInterviewAnswer {
  questionId: string;
  answer: string;
  submittedAt: string;
}

export type AiInterviewFocusEventType = "tab-hidden" | "window-blur";

export interface AiInterviewFocusEvent {
  id: string;
  type: AiInterviewFocusEventType;
  occurredAt: string;
  label: string;
}

export interface AiInterviewDimensionScore {
  label: string;
  score: number;
  note: string;
}

export interface AiInterviewFocusLossAssessment {
  status?: string;
  summary?: string;
  reason?: string;
  decision?: string;
  decisionLabel?: string;
  failed?: boolean;
  focusLossCount?: number;
  eventCount?: number;
  threshold?: number;
  [key: string]: unknown;
}

export interface AiInterviewStrength {
  title: string;
  description: string;
}

export interface AiInterviewResult {
  score: number;
  status: AiInterviewDecision;
  badgeLabel: string;
  qualificationLabel: string;
  percentileLabel: string;
  summary: string;
  strengths: AiInterviewStrength[];
  concerns: string[];
  nextStepTitle: string;
  nextStepDescription: string;
  moduleProgress: number;
}

export interface AiInterviewSession {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  trackId: string;
  trackTitle: string;
  type: AiInterviewTrackType;
  languageCode: string;
  status: AiInterviewStatus;
  aiName: string;
  targetRole: string;
  specialization?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  durationMinutes: number;
  questions?: AiInterviewQuestion[];
  answers: AiInterviewAnswer[];
  draftAnswer: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  dimensionScores: AiInterviewDimensionScore[];
  focusLossAssessment?: AiInterviewFocusLossAssessment;
  result?: AiInterviewResult;
}

export interface AiInterviewSummaryStats {
  completed: number;
  pending: number;
  passed: number;
  actionRequired: number;
}

export interface AiInterviewRecentActivity {
  id: string;
  title: string;
  type: AiInterviewTrackType;
  attemptedAt: string;
  status: AiInterviewStatus;
  score?: number;
}

export interface AiInterviewCandidateOverview {
  stats: AiInterviewSummaryStats;
  tracks: AiInterviewTrack[];
  recentActivity: AiInterviewRecentActivity[];
}

export type AiInterviewMetricTone =
  | "positive"
  | "warning"
  | "danger"
  | "negative"
  | "neutral";

export interface AiInterviewAdminMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  tone: AiInterviewMetricTone;
}

export interface AiInterviewTrendPoint {
  label: string;
  interviews: number;
}

export interface AiInterviewAdminOverview {
  metrics: AiInterviewAdminMetric[];
  trend: AiInterviewTrendPoint[];
  topSkillMatch: Array<{
    label: string;
    value: number;
  }>;
  recentSubmissions: AiInterviewSession[];
}

export interface AiInterviewAdminReport {
  session: AiInterviewSession;
  track: AiInterviewTrack;
  adminNote: string;
}

export interface StartAiInterviewPayload {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  trackId: string;
  languageCode: string;
  targetRole: string;
}

export interface SubmitAiInterviewAnswerPayload {
  sessionId: string;
  answer: string;
}

export interface SaveAiInterviewDraftPayload {
  sessionId: string;
  draftAnswer: string;
}

export interface SubmitAiInterviewFocusEventsPayload {
  sessionId: string;
  events: AiInterviewFocusEvent[];
}

export interface ScheduleAiInterviewPayload {
  candidateName: string;
  candidateEmail: string;
  trackId: string;
  languageCode: string;
  targetRole: string;
}

export interface UpdateAiInterviewDecisionPayload {
  sessionId: string;
  status: AiInterviewDecision;
}
