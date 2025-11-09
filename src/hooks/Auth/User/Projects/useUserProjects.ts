import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import {
  apiGet,
  apiPost,
  getErrorMessage,
  createApiUrl,
} from "../../../../service/apiUtils";
import {
  Project,
  Application,
  ProjectsResponse,
  ApplyToProjectForm,
  ApplicationResponse,
  HookOperationResult,
} from "../../../../types/project.types";

export type ProjectView = "available" | "applied" | "all";
export type ApplicationStatus = "approved" | "rejected" | "pending";

export const useUserProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);

  // Get available projects (default view)
  const getAvailableProjects = useCallback(
    async (params?: {
      category?: string;
      minPayRate?: number;
      maxPayRate?: number;
      difficultyLevel?: string;
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        // Build query parameters
        const queryParams: Record<string, string> = { view: "available" };
        if (params?.category) queryParams.category = params.category;
        if (params?.minPayRate)
          queryParams.minPayRate = params.minPayRate.toString();
        if (params?.maxPayRate)
          queryParams.maxPayRate = params.maxPayRate.toString();
        if (params?.difficultyLevel)
          queryParams.difficultyLevel = params.difficultyLevel;
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const data: ProjectsResponse = await apiGet(
          endpoints.userProject.projects,
          { params: queryParams }
        );

        if (data.success) {
          setProjects(data.data.projects);
          setPagination(data.data.pagination);
          setUserStats(data.data.userStats);
          return { success: true, data };
        } else {
          const errorMessage =
            data.message || "Failed to fetch available projects";
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
    },
    []
  );

  // Get user's applications with optional status filter
  const getUserApplications = useCallback(
    async (
      status?: ApplicationStatus,
      params?: {
        page?: number;
        limit?: number;
      }
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        let endpoint = endpoints.userProject.projects;
        const queryParams: Record<string, string> = {};

        // Build different endpoints based on status
        if (status === "approved") {
          // Call active projects endpoint
          endpoint = `${endpoints.userProject.projects}?view=applied&status=approved`;
        } else if (status === "pending") {
          // Call pending applications endpoint
          endpoint = `${endpoints.userProject.projects}?view=applied&status=pending`;
        } else if (status === "rejected") {
          // Call rejected applications endpoint
          endpoint = `${endpoints.userProject.projects}?view=applied&status=rejected`;
        } else {
          // Default to all applications
          endpoint = `${endpoints.userProject.projects}?view=applied`;
        }

        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const data: any = await apiGet(
          endpoint,
          Object.keys(queryParams).length ? { params: queryParams } : {}
        );

        if (data.success) {
          const allApplications = data.data.applications || [];

          // Set filtered applications based on status
          setApplications(allApplications);
          setPagination(data.data.pagination);
          setUserStats(data.data.userStats);
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
    },
    []
  );

  // Get user's applications by status
  const getApplicationsByStatus = useCallback(
    async (
      status: ApplicationStatus,
      params?: {
        page?: number;
        limit?: number;
      }
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = `${endpoints.userProject.projects}?view=applied&status=${status}`;
        const queryParams: Record<string, string> = {};
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const data: any = await apiGet(
          endpoint,
          Object.keys(queryParams).length ? { params: queryParams } : {}
        );

        if (data.success) {
          setApplications(data.data.applications || []);
          setPagination(data.data.pagination);
          setUserStats(data.data.userStats);
          return { success: true, data };
        } else {
          const errorMessage =
            data.message || `Failed to fetch ${status} applications`;
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
    },
    []
  );

  // Convenience methods that use the main getApplicationsByStatus method
  const getActiveProjects = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      return getApplicationsByStatus("approved", params);
    },
    [getApplicationsByStatus]
  );

  const getPendingApplications = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      return getApplicationsByStatus("pending", params);
    },
    [getApplicationsByStatus]
  );

  const getRejectedApplications = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      return getApplicationsByStatus("rejected", params);
    },
    [getApplicationsByStatus]
  );

  // Get all projects with application status
  const getAllProjectsWithStatus = useCallback(
    async (params?: {
      category?: string;
      minPayRate?: number;
      maxPayRate?: number;
      difficultyLevel?: string;
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const queryParams: Record<string, string> = { view: "all" };
        if (params?.category) queryParams.category = params.category;
        if (params?.minPayRate)
          queryParams.minPayRate = params.minPayRate.toString();
        if (params?.maxPayRate)
          queryParams.maxPayRate = params.maxPayRate.toString();
        if (params?.difficultyLevel)
          queryParams.difficultyLevel = params.difficultyLevel;
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const data: any = await apiGet(endpoints.userProject.projects, {
          params: queryParams,
        });

        if (data.success) {
          setProjects(data.data.projects || []);
          setApplications(data.data.applications || []);
          setPagination(data.data.pagination);
          setUserStats(data.data.userStats);
          return { success: true, data };
        } else {
          const errorMessage =
            data.message || "Failed to fetch projects with status";
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
    },
    []
  );

  // Get all applications and calculate statistics (similar to old hook)
  const getAllUserApplications = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const queryParams: Record<string, string> = { view: "applied" };
        if (params?.page) queryParams.page = params.page.toString();
        if (params?.limit) queryParams.limit = params.limit.toString();

        const data: any = await apiGet(endpoints.userProject.projects, {
          params: queryParams,
        });

        if (data.success) {
          const allApplications = data.data.applications || [];

          // Set all applications
          setApplications(allApplications);
          setPagination(data.data.pagination);

          const stats = {
            totalApplications: allApplications.length,
            activeProjects: allApplications.filter(
              (app: Application) => app.status === "approved"
            ).length,
            pendingApplications: allApplications.filter(
              (app: Application) => app.status === "pending"
            ).length,
            rejectedApplications: allApplications.filter(
              (app: Application) => app.status === "rejected"
            ).length,
            completedProjects: 0,
          };

          setUserStats(stats);

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
    },
    []
  );

  // Legacy method for backward compatibility
  const browseProjects = useCallback(
    async (params?: {
      category?: string;
      minPayRate?: number;
      maxPayRate?: number;
      difficultyLevel?: string;
      page?: number;
      limit?: number;
    }): Promise<HookOperationResult> => {
      return getAvailableProjects(params);
    },
    [getAvailableProjects]
  );

  const applyToProject = useCallback(
    async (
      projectId: string,
      applicationData: ApplyToProjectForm
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const url = createApiUrl(
          endpoints.userProject.applyToProject,
          projectId
        );
        const data: ApplicationResponse = await apiPost(
          `${url}/apply`,
          applicationData
        );

        if (data.success) {
          return { success: true, data: data.data };
        } else {
          const errorMessage = data.message || "Failed to submit application";
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
    },
    []
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setProjects([]);
    setApplications([]);
    setPagination(null);
    setUserStats(null);
  }, []);

  return {
    // Main method that accepts status argument
    getApplicationsByStatus,

    // Convenience methods for different views
    getAvailableProjects,
    getUserApplications,
    getActiveProjects,
    getPendingApplications,
    getRejectedApplications,
    getAllProjectsWithStatus,
    getAllUserApplications,

    // Legacy methods for backward compatibility
    browseProjects,
    applyToProject,

    // State
    loading,
    error,
    projects,
    applications,
    pagination,
    userStats,
    resetState,
  };
};
