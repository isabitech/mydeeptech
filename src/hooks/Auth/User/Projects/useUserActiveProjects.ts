import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import { apiGet, getErrorMessage } from "../../../../service/apiUtils";
import {
  Application,
  HookOperationResult,
} from "../../../../types/project.types";

export const useUserActiveProjects = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProjects, setActiveProjects] = useState<Application[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Application[]>([]);
  const [rejectedApplications, setRejectedApplications] = useState<Application[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Get active projects (approved applications)
  const getActiveProjects = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      // Use the new API endpoint with view=applied&status=approved
      const queryParams = { view: 'applied', status: 'approved' };
      const data: any = await apiGet(endpoints.userProject.projects, { params: queryParams });

      if (data.success) {
        setActiveProjects(data.data.applications || []);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch active projects";
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

  // Get pending applications
  const getPendingApplications = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = { view: 'applied', status: 'pending' };
      const data: any = await apiGet(endpoints.userProject.projects, { params: queryParams });

      if (data.success) {
        setPendingApplications(data.data.applications || []);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch pending applications";
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

  // Get rejected applications
  const getRejectedApplications = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = { view: 'applied', status: 'rejected' };
      const data: any = await apiGet(endpoints.userProject.projects, { params: queryParams });

      if (data.success) {
        setRejectedApplications(data.data.applications || []);
        return { success: true, data: data.data };
      } else {
        const errorMessage = data.message || "Failed to fetch rejected applications";
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

  // Get all user applications and calculate statistics
  const getAllUserApplications = useCallback(async (): Promise<HookOperationResult> => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = { view: 'applied' };
      const data: any = await apiGet(endpoints.userProject.projects, { params: queryParams });

      if (data.success) {
        const applications = data.data.applications || [];
        // Separate applications by status
        const active = applications.filter((app: Application) => app.status === 'approved');
        const pending = applications.filter((app: Application) => app.status === 'pending');
        const rejected = applications.filter((app: Application) => app.status === 'rejected');

        setActiveProjects(active);
        setPendingApplications(pending);
        setRejectedApplications(rejected);

        // Calculate statistics
        const stats = {
          totalApplications: applications.length,
          activeProjects: active.length,
          pendingApplicationions: pending.length, // Keep the typo for backward compatibility
          rejectedApplications: rejected.length,
          completedProjects: 0, // This might need to be calculated differently based on your data
        };
        setStatistics(stats);

        return { success: true, data: { activeProjects: active, pendingApplications: pending, statistics: stats } };
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

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setActiveProjects([]);
    setPendingApplications([]);
    setRejectedApplications([]);
    setStatistics(null);
  }, []);

  return {
    // Main methods
    getActiveProjects,
    getPendingApplications,
    getRejectedApplications,
    getAllUserApplications,

    // State
    loading,
    error,
    activeProjects,
    pendingApplications,
    rejectedApplications,
    statistics,
    resetState,
  };
};