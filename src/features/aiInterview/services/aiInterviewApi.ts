import { apiGet, apiPatch, apiPost } from "../../../service/apiUtils";
import { endpoints } from "../../../store/api/endpoints";
import type {
  AiInterviewAdminOverview,
  AiInterviewAdminReport,
  AiInterviewCandidateOverview,
  AiInterviewSession,
  AiInterviewTrack,
  SaveAiInterviewDraftPayload,
  ScheduleAiInterviewPayload,
  StartAiInterviewPayload,
  SubmitAiInterviewAnswerPayload,
  SubmitAiInterviewFocusEventsPayload,
  UpdateAiInterviewDecisionPayload,
} from "../types";

type CandidateIdentity = {
  id: string;
  fullName: string;
  email: string;
};

const unwrap = <T,>(payload: unknown): T => {
  return ((payload as { data?: T })?.data ?? payload) as T;
};

export const aiInterviewApi = {
  async getTracks() {
    return unwrap<AiInterviewTrack[]>(await apiGet(endpoints.aiInterview.tracks));
  },

  async getTrack(trackId: string) {
    return unwrap<AiInterviewTrack>(await apiGet(`${endpoints.aiInterview.tracks}/${trackId}`));
  },

  async getCandidateOverview(_candidate: CandidateIdentity) {
    return unwrap<AiInterviewCandidateOverview>(
      await apiGet(endpoints.aiInterview.candidateOverview),
    );
  },

  async startSession(payload: StartAiInterviewPayload) {
    return unwrap<AiInterviewSession>(
      await apiPost(endpoints.aiInterview.startSession, payload),
    );
  },

  async getSession(sessionId: string) {
    return unwrap<AiInterviewSession>(
      await apiGet(`${endpoints.aiInterview.session}/${sessionId}`),
    );
  },

  async saveDraft(payload: SaveAiInterviewDraftPayload) {
    return unwrap<AiInterviewSession>(
      await apiPatch(`${endpoints.aiInterview.session}/${payload.sessionId}/draft`, payload),
    );
  },

  async submitAnswer(payload: SubmitAiInterviewAnswerPayload) {
    return unwrap<AiInterviewSession>(
      await apiPost(`${endpoints.aiInterview.session}/${payload.sessionId}/answer`, payload),
    );
  },

  async submitFocusEvents(payload: SubmitAiInterviewFocusEventsPayload) {
    return unwrap<AiInterviewSession>(
      await apiPost(
        `${endpoints.aiInterview.focusEvents}/${payload.sessionId}/focus-events`,
        payload,
      ),
    );
  },

  async getResult(sessionId: string) {
    return unwrap<AiInterviewSession>(
      await apiGet(`${endpoints.aiInterview.result}/${sessionId}`),
    );
  },

  async getAdminOverview() {
    return unwrap<AiInterviewAdminOverview>(await apiGet(endpoints.aiInterview.adminOverview));
  },

  async getAdminSessions() {
    return unwrap<AiInterviewSession[]>(await apiGet(endpoints.aiInterview.adminSessions));
  },

  async getAdminReport(sessionId: string) {
    return unwrap<AiInterviewAdminReport>(
      await apiGet(`${endpoints.aiInterview.report}/${sessionId}`),
    );
  },

  async scheduleInterview(payload: ScheduleAiInterviewPayload) {
    return unwrap<AiInterviewSession>(await apiPost(endpoints.aiInterview.schedule, payload));
  },

  async updateDecision(payload: UpdateAiInterviewDecisionPayload) {
    return unwrap<AiInterviewSession>(
      await apiPatch(`${endpoints.aiInterview.decision}/${payload.sessionId}/decision`, payload),
    );
  },

  async updateAdminNote(sessionId: string, note: string) {
    return unwrap<{ success: boolean }>(
      await apiPatch(`${endpoints.aiInterview.note}/${sessionId}/note`, { note }),
    );
  },
};

export type { CandidateIdentity };
