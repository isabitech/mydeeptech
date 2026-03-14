import { useState, useCallback } from "react";
import { endpoints } from "../../../store/api/endpoints";
import { apiGet, apiPost, getErrorMessage } from "../../../service/apiUtils";
import {
  HVNCValidateResponse,
  HVNCSessionState,
  HVNCTerminateResponse,
  HVNCOperationResult,
} from "../hvnc.types";

export const useHVNCSession = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<HVNCSessionState | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [validatedSessionId, setValidatedSessionId] = useState<string | null>(null);

  /**
   * Step 1 — Validate the 6-character access code entered in UserHVNCPortal.
   * On success returns a short-lived sessionToken used for session init calls.
   */
  const validateAccessCode = useCallback(
    async (accessCode: string, email: string, deviceId: string): Promise<HVNCOperationResult<HVNCValidateResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiPost<HVNCValidateResponse>(
          endpoints.userHVNC.validateCode,
          { 
            code: accessCode,
            email,
            device_id: deviceId
          }
        );

        if (data.valid === false) {
          const msg = data.message ?? "Invalid access code. Please check and try again.";
          setError(msg);
          return { success: false, error: msg, data };
        }

        if (data.sessionToken) setSessionToken(data.sessionToken);
        if (data.session?.session_id) setValidatedSessionId(data.session.session_id);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cancel a session that is still in the connecting / initialization phase.
   */
  const cancelSession = useCallback(
    async (token?: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const resolvedToken = token ?? sessionToken;
        await apiPost(endpoints.userHVNC.cancelSession, { sessionToken: resolvedToken });
        setSessionToken(null);
        return { success: true };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    [sessionToken]
  );

  /**
   * Fetch the current active session state once the connecting phase completes.
   * Seeds the live timers (hubstaffSecs, sessionSecs) with real values from the server.
   */
  const getSession = useCallback(
    async (sessionId: string): Promise<HVNCOperationResult<HVNCSessionState>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.userHVNC.getSession}/${sessionId}`;
        const data = await apiGet<{ success?: boolean; data?: HVNCSessionState } & HVNCSessionState>(url);
        const state: HVNCSessionState = (data as any).data ?? data;
        setSession(state);
        return { success: true, data: state };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Pause the Hubstaff timer from within the active session.
   */
  const pauseHubstaff = useCallback(
    async (sessionId: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.userHVNC.hubstaffPause}/${sessionId}/hubstaff/pause`;
        const data = await apiPost(url, {});
        setSession((prev) => prev ? { ...prev, hubstaffRunning: false } : prev);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Resume the Hubstaff timer from within the active session.
   */
  const resumeHubstaff = useCallback(
    async (sessionId: string): Promise<HVNCOperationResult> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.userHVNC.hubstaffResume}/${sessionId}/hubstaff/resume`;
        const data = await apiPost(url, {});
        setSession((prev) => prev ? { ...prev, hubstaffRunning: true } : prev);
        return { success: true, data };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Terminate the active remote desktop session.
   * On success the component should call onDisconnect() to return to the portal.
   */
  const terminateSession = useCallback(
    async (sessionId: string): Promise<HVNCOperationResult<HVNCTerminateResponse>> => {
      setLoading(true);
      setError(null);
      try {
        const url = `${endpoints.userHVNC.terminateSession}/${sessionId}/terminate`;
        const data = await apiPost<{ success?: boolean; data?: HVNCTerminateResponse } & HVNCTerminateResponse>(
          url,
          { sessionId }
        );
        const result: HVNCTerminateResponse = (data as any).data ?? data;
        setSession(null);
        setSessionToken(null);
        return { success: true, data: result };
      } catch (err: any) {
        const msg = getErrorMessage(err);
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    // State
    loading,
    error,
    session,
    sessionToken,
    validatedSessionId,
    // Actions
    validateAccessCode,
    cancelSession,
    getSession,
    pauseHubstaff,
    resumeHubstaff,
    terminateSession,
    // State setters
    setSession,
    setSessionToken,
    setError,
  };
};
