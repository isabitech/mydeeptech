
import React from "react";
import { Table, Card, Space, Tag, Alert } from "antd";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import { usePermission } from "../../hooks/usePermission";
import { ACTIONS } from "../../utils/permissions";
import { PermissionButton } from "../../components/PermissionButton";
import { PermissionGate } from "../../components/PermissionGate";

interface ApplicationsPageProps {
  viewOwn?: boolean;
}

const ApplicationsPage: React.FC<ApplicationsPageProps> = ({ viewOwn = false }) => {
  const { can, isLoading: isPermissionLoading } = usePermission("applications");

  const { data: applications = [], isLoading: isDataLoading } = useQuery({
    queryKey: ["admin", "applications", { viewOwn }],
    queryFn: async () => {
      const params = viewOwn ? { scope: "own" } : {};
      const response = await axiosInstance.get(endpoints.rbac.users.all, { params });
      return response.data?.data || [];
    },
    staleTime: 30000,
  });

  const columns = [
    { title: "Applicant", dataIndex: "fullName", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => <Tag color={status === "approved" ? "green" : "orange"}>{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <PermissionButton
            resource="applications"
            action={ACTIONS.EDIT}
            size="small"
          >
            Edit
          </PermissionButton>

          <PermissionButton
            resource="applications"
            action={ACTIONS.APPROVE}
            size="small"
            type="primary"
          >
            Approve
          </PermissionButton>

          <PermissionButton
            resource="applications"
            action={ACTIONS.DELETE}
            size="small"
            danger
          >
            Delete
          </PermissionButton>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Application Management</h1>

        <PermissionButton
          resource="applications"
          action={ACTIONS.CREATE}
          type="primary"
        >
          Create New Application
        </PermissionButton>
      </div>

      {viewOwn && (
        <Alert
          message="Restricted View: You are only seeing applications assigned to you."
          type="info"
          showIcon
        />
      )}

      <PermissionGate
        resource="applications"
        action={ACTIONS.MANAGE}
        fallback={<Alert message="Limited Access: You do not have management rights." type="warning" />}
      >
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <strong>Admin Insight:</strong> Total pending across all regions: {applications.length}
        </div>
      </PermissionGate>

      <Card>
        <Table
          dataSource={applications}
          columns={columns}
          loading={isDataLoading || isPermissionLoading}
          rowKey="id"
        />
      </Card>
    </div>
  );
};

export default ApplicationsPage;
