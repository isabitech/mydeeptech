import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiInterviewApi, type CandidateIdentity } from "../services/aiInterviewApi";
import {
  SaveAiInterviewDraftPayload,
  ScheduleAiInterviewPayload,
  StartAiInterviewPayload,
  SubmitAiInterviewAnswerPayload,
  SubmitAiInterviewFocusEventsPayload,
  UpdateAiInterviewDecisionPayload,
} from "../types";

const AI_INTERVIEW_QUERY_ROOT = ["aiInterview"] as const;

export const aiInterviewQueryKeys = {
  root: AI_INTERVIEW_QUERY_ROOT,
  tracks: () => [...AI_INTERVIEW_QUERY_ROOT, "tracks"] as const,
  track: (trackId: string) => [...AI_INTERVIEW_QUERY_ROOT, "track", trackId] as const,
  candidateOverview: (candidateId: string) =>
    [...AI_INTERVIEW_QUERY_ROOT, "candidateOverview", candidateId] as const,
  session: (sessionId: string) => [...AI_INTERVIEW_QUERY_ROOT, "session", sessionId] as const,
  result: (sessionId: string) => [...AI_INTERVIEW_QUERY_ROOT, "result", sessionId] as const,
  adminOverview: () => [...AI_INTERVIEW_QUERY_ROOT, "adminOverview"] as const,
  adminSessions: () => [...AI_INTERVIEW_QUERY_ROOT, "adminSessions"] as const,
  adminReport: (sessionId: string) =>
    [...AI_INTERVIEW_QUERY_ROOT, "adminReport", sessionId] as const,
};

export const useAiInterviewTracks = () =>
  useQuery({
    queryKey: aiInterviewQueryKeys.tracks(),
    queryFn: () => aiInterviewApi.getTracks(),
  });

export const useAiInterviewTrack = (trackId: string, enabled = true) =>
  useQuery({
    queryKey: aiInterviewQueryKeys.track(trackId),
    queryFn: () => aiInterviewApi.getTrack(trackId),
    enabled: enabled && Boolean(trackId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const useCandidateInterviewOverview = (
  candidate: CandidateIdentity | null,
  enabled = true,
) =>
  useQuery({
    queryKey: aiInterviewQueryKeys.candidateOverview(candidate?.id ?? "unknown"),
    queryFn: () => {
      if (!candidate) {
        throw new Error("Authenticated candidate context is required.");
      }
      return aiInterviewApi.getCandidateOverview(candidate);
    },
    enabled: enabled && Boolean(candidate?.id),
  });

export const useAiInterviewSession = (sessionId: string, enabled = true) =>
  useQuery({
    queryKey: aiInterviewQueryKeys.session(sessionId),
    queryFn: () => aiInterviewApi.getSession(sessionId),
    enabled: enabled && Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "in-progress" ? 10000 : false;
    },
  });

export const useAiInterviewResult = (sessionId: string, enabled = true) =>
  useQuery({
    queryKey: aiInterviewQueryKeys.result(sessionId),
    queryFn: () => aiInterviewApi.getResult(sessionId),
    enabled: enabled && Boolean(sessionId),
  });

export const useAdminInterviewOverview = () =>
  useQuery({
    queryKey: aiInterviewQueryKeys.adminOverview(),
    queryFn: () => aiInterviewApi.getAdminOverview(),
  });

export const useAdminInterviewSessions = () =>
  useQuery({
    queryKey: aiInterviewQueryKeys.adminSessions(),
    queryFn: () => aiInterviewApi.getAdminSessions(),
  });

export const useAdminInterviewReport = (sessionId: string, enabled = true) =>
  useQuery({
    queryKey: aiInterviewQueryKeys.adminReport(sessionId),
    queryFn: () => aiInterviewApi.getAdminReport(sessionId),
    enabled: enabled && Boolean(sessionId),
  });

export const useStartAiInterviewSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StartAiInterviewPayload) => aiInterviewApi.startSession(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(aiInterviewQueryKeys.session(session.id), session);
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};

export const useSaveAiInterviewDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAiInterviewDraftPayload) => aiInterviewApi.saveDraft(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(aiInterviewQueryKeys.session(session.id), session);
    },
  });
};

export const useSubmitAiInterviewAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAiInterviewAnswerPayload) => aiInterviewApi.submitAnswer(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(aiInterviewQueryKeys.session(session.id), session);
      if (session.result) {
        queryClient.setQueryData(aiInterviewQueryKeys.result(session.id), session);
      }
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};

export const useSubmitAiInterviewFocusEvents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAiInterviewFocusEventsPayload) =>
      aiInterviewApi.submitFocusEvents(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(aiInterviewQueryKeys.session(session.id), session);
      if (session.result) {
        queryClient.setQueryData(aiInterviewQueryKeys.result(session.id), session);
      }
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};

export const useScheduleAiInterview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScheduleAiInterviewPayload) => aiInterviewApi.scheduleInterview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};

export const useUpdateAiInterviewDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAiInterviewDecisionPayload) =>
      aiInterviewApi.updateDecision(payload),
    onSuccess: (session) => {
      queryClient.setQueryData(aiInterviewQueryKeys.session(session.id), session);
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};

export const useUpdateAiInterviewNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, note }: { sessionId: string; note: string }) =>
      aiInterviewApi.updateAdminNote(sessionId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AI_INTERVIEW_QUERY_ROOT });
    },
  });
};
