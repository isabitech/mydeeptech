import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { apiGet, apiPost, getErrorMessage } from "../../../../service/apiUtils";
import {
  Application,
  ApplicationsResponse,
  ApplicationResponse,
  ApproveApplicationForm,
  RejectApplicationForm,
  HookOperationResult,
} from "../../../../types/project.types";

export const useAdminApplications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  const getAllApplications = useCallback(async (params?: {
    status?: string;
    projectId?: string;
    page?: number;
    limit?: number;
  }): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.projectId) queryParams.projectId = params.projectId;
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();

      const data: ApplicationsResponse = await apiGet(endpoints.adminProject.getAllApplications, { params: queryParams });

      if (data.success) {
        setApplications(data.data.applications);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to fetch applications";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const approveApplication = useCallback(async (
    applicationId: string,
    approvalData: ApproveApplicationForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminProject.approveApplication}/${applicationId}/approve`;
      const data: ApplicationResponse = await apiPost(url, approvalData);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to approve application";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectApplication = useCallback(async (
    applicationId: string,
    rejectionData: RejectApplicationForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = `${endpoints.adminProject.rejectApplication}/${applicationId}/reject`;
      const data: ApplicationResponse = await apiPost(url, rejectionData);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to reject application";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    getAllApplications,
    approveApplication,
    rejectApplication,
    loading,
    error,
    applications,
    pagination,
    summary,
    resetState,
  };
};