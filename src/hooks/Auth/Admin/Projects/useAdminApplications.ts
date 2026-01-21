import { useState, useCallback } from "react";
import { endpoints } from "../../../../store/api/endpoints";
import {
  apiGet,
  apiPatch,
  bulkDeletePendingApplications,
  getErrorMessage,
} from "../../../../service/apiUtils";
import {
  Application,
  ApplicationsResponse,
  ApplicationResponse,
  ApproveApplicationForm,
  RejectApplicationForm,
  HookOperationResult,
} from "../../../../types/project.types";
import { message, Modal } from "antd";

export const useAdminApplications = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isDeletingPendingApplications, setIsDeletingPendingApplications] =
    useState(false);

  const getAllApplications = useCallback(
    async (params?: {
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

        console.log("🔗 Calling Applications API with params:", queryParams);
        const data: ApplicationsResponse = await apiGet(
          endpoints.adminProject.getAllApplications,
          { params: queryParams },
        );

        console.log("📦 Applications API Response:", data);

        if (data.success) {
          setApplications(data.data.applications);
          setPagination(data.data.pagination);
          setSummary(data.data.summary);
          console.log(
            "✅ Applications loaded:",
            data.data.applications?.length || 0,
            "applications",
          );
          return { success: true, data };
        } else {
          const errorMessage = data.message || "Failed to fetch applications";
          console.error("❌ Applications API Error:", errorMessage);
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err: any) {
        const errorMessage = getErrorMessage(err);
        console.error("❌ Applications API Exception:", err);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const approveApplication = useCallback(
    async (
      applicationId: string,
      approvalData: ApproveApplicationForm,
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const url = `${endpoints.adminProject.approveApplication}/${applicationId}/approve`;
        const data: ApplicationResponse = await apiPatch(url, approvalData);

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
    },
    [],
  );

  const rejectApplication = useCallback(
    async (
      applicationId: string,
      rejectionData: RejectApplicationForm,
    ): Promise<HookOperationResult> => {
      setLoading(true);
      setError(null);

      try {
        const url = `${endpoints.adminProject.rejectApplication}/${applicationId}/reject`;
        const data: ApplicationResponse = await apiPatch(url, rejectionData);

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
    },
    [],
  );

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleBulkDeleteOfPendingApplications = useCallback(() => {
    Modal.confirm({
      title: `Delete ${selectedRowKeys.length} item(s)?`,
      content: "This action cannot be undone.",
      okType: "danger",
      onOk: async () => {
        try {
          setIsDeletingPendingApplications(true);

          // await bulkDeletePendingApplications(selectedRowKeys);

          message.success("Deleted successfully");

          setApplications((prev) =>
            prev.filter((item) => !selectedRowKeys.includes(item._id)),
          );

          setSelectedRowKeys([]);
          // getAllApplications();
        } catch {
          message.error("Failed to delete");
        } finally {
          setIsDeletingPendingApplications(false);
        }
      },
    });
  }, [applications, selectedRowKeys]);

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
    handleBulkDeleteOfPendingApplications,
    setSelectedRowKeys,
    selectedRowKeys,
    clearSelection,
    setIsDeletingPendingApplications,
    isDeletingPendingApplications,
  };
};
