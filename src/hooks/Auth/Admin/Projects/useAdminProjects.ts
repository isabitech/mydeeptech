import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage, createApiUrl } from "../../../../service/apiUtils";
import {
  Project,
  CreateProjectForm,
  UpdateProjectForm,
  ProjectsResponse,
  ProjectResponse,
  HookOperationResult,
  AnnotatorProjectResponse,
  RemoveApplicantRequest,
  RemoveApplicantResponse,
  RemovableApplicantsResponse,
} from "../../../../types/project.types";

export const useAdminProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  const createProject = useCallback(async (projectData: CreateProjectForm): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const data: ProjectResponse = await apiPost(endpoints.adminProject.createProject, projectData);

      if (data.success) {
        return { success: true, data: data.data.project };
      } else {
        const errorMessage = data.message || "Failed to create project";
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

  const getAllProjects = useCallback(async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
  }): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams: Record<string, string> = {};
      if (params?.page) queryParams.page = params.page.toString();
      if (params?.limit) queryParams.limit = params.limit.toString();
      if (params?.status) queryParams.status = params.status;
      if (params?.category) queryParams.category = params.category;
      if (params?.search) queryParams.search = params.search;

      const data: ProjectsResponse = await apiGet(endpoints.adminProject.getAllProjects, { params: queryParams });

      if (data.success) {
        setProjects(data.data.projects);
        setPagination(data.data.pagination);
        setSummary(data.data.summary);
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to fetch projects";
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

  const getProjectById = useCallback(async (projectId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.getProjectById, projectId);
      const data: ProjectResponse = await apiGet(url);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch project";
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

  const getProjectAnnotators = useCallback(async (projectId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.getProjectAnnotators, projectId);
      const data: AnnotatorProjectResponse = await apiGet(url);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch project annotators";
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

  const updateProject = useCallback(async (
    projectId: string, 
    updateData: UpdateProjectForm
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.updateProject, projectId);
      const data: ProjectResponse = await apiPatch(url, updateData);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to update project";
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

  const deleteProject = useCallback(async (projectId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.deleteProject, projectId);
      const data = await apiDelete(url);

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to delete project";
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

  const requestDeletionOtp = useCallback(async (projectId: string, reason: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.requestDeletionOtp, projectId) + "/request-deletion-otp";
      const data = await apiPost(url, { reason });

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to request deletion OTP";
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

  const verifyDeletionOtp = useCallback(async (
    projectId: string, 
    otp: string, 
    confirmationMessage: string
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.verifyDeletionOtp, projectId) + "/verify-deletion-otp";
      const data = await apiPost(url, { otp, confirmationMessage });

      if (data.success) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || "Failed to verify deletion OTP";
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

  const removeApplicant = useCallback(async (
    applicationId: string,
    removalData: RemoveApplicantRequest
  ): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.removeApplicant, applicationId) + "/remove";
      const data: RemoveApplicantResponse = await apiDelete(url, { 
        data: removalData 
      });

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to remove applicant";
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

  const getRemovableApplicants = useCallback(async (projectId: string): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const url = createApiUrl(endpoints.adminProject.getRemovableApplicants, projectId) + "/removable-applicants";
      const data: RemovableApplicantsResponse = await apiGet(url);

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch removable applicants";
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
    createProject,
    getAllProjects,
    getProjectById,
    getProjectAnnotators,
    updateProject,
    deleteProject,
    requestDeletionOtp,
    verifyDeletionOtp,
    removeApplicant,
    getRemovableApplicants,
    loading,
    error,
    projects,
    pagination,
    summary,
    resetState,
  };
};