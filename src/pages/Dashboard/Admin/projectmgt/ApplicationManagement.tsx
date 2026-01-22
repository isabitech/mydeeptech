import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Space,
  Card,
  Select,
  Alert,
  Spin,
  Modal,
  Form,
  Input,
  Descriptions,
  message,
  Popconfirm,
  Dropdown,
  Menu,
  TableColumnsType,
  TableProps,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
  MoreOutlined,
  FilePdfOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { GlobalWorkerOptions } from "pdfjs-dist";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import { Worker } from '@react-pdf-viewer/core';

// Configure PDF.js worker for @react-pdf-viewer
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.0.279/pdf.worker.min.js`;

import Header from "../../User/Header";
import moment from "moment";
import { useAdminApplications } from "../../../../hooks/Auth/Admin/Projects/useAdminApplications";
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import {
  Application,
  Project,
  ApproveApplicationForm,
  RejectApplicationForm,
  RejectionReason,
} from "../../../../types/project.types";
import PageModal from "../../../../components/Modal/PageModal";


const { Option } = Select;
const { TextArea } = Input;

const REJECTION_REASONS: { value: RejectionReason; label: string }[] = [
  { value: "insufficient_experience", label: "Insufficient Experience" },
  { value: "project_full", label: "Project Full" },
  { value: "qualifications_mismatch", label: "Qualifications Mismatch" },
  { value: "other", label: "Other" },
];



const ApplicationManagement: React.FC = () => {
  // Initialize PDF viewer plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [isRejectionModalVisible, setIsRejectionModalVisible] = useState(false);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [pdfViewerApplication, setPdfViewerApplication] =
    useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [approvalForm] = Form.useForm();
  const [rejectionForm] = Form.useForm();


  const {
    getAllApplications,
    approveApplication,
    rejectApplication,
    loading,
    error,
    applications,
    pagination,
    summary,
    resetState,
    handleBulkApprovalOfPendingApplications,
    handleBulkDeleteOfPendingApplications,
    selectedRowKeys,
    setSelectedRowKeys,
    isDeletingPendingApplications,
    isApprovingPendingApplications,
  } = useAdminApplications();

  const { getAllProjects, projects } = useAdminProjects();

  useEffect(() => {
    fetchApplications();
    fetchProjects();
  }, []);

  const fetchApplications = async () => {
    await getAllApplications({
      status: statusFilter || undefined,
      projectId: projectFilter || undefined,
      page: 1,
      limit: 50,
    });
  };

  const fetchProjects = async () => {
    await getAllProjects({ page: 1, limit: 100 });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    getAllApplications({
      status: value || undefined,
      projectId: projectFilter || undefined,
    });
  };

  const handleProjectFilter = (value: string) => {
    setProjectFilter(value);
    getAllApplications({
      projectId: value || undefined,
      status: statusFilter || undefined,
    });
  };

  const showApplicationDetails = (application: Application) => {
    setSelectedApplication(application);
    setIsDetailModalVisible(true);
  };

  const showApprovalModal = (application: Application) => {
    setSelectedApplication(application);
    setIsApprovalModalVisible(true);
    approvalForm.resetFields();
  };

  const showRejectionModal = (application: Application) => {
    setSelectedApplication(application);
    setIsRejectionModalVisible(true);
    rejectionForm.resetFields();
  };

  const viewResume = (resumeUrl: string, application?: Application) => {
    setPdfUrl(resumeUrl);
    setPdfViewerApplication(application || null);
    setIsPdfModalVisible(true);
  };

  const closePdfModal = () => {
    setIsPdfModalVisible(false);
    setPdfUrl("");
    setPdfViewerApplication(null);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      const values = await approvalForm.validateFields();
      const approvalData: ApproveApplicationForm = {
        reviewNotes: values.reviewNotes,
      };

      const result = await approveApplication(
        selectedApplication._id,
        approvalData
      );

      if (result.success) {
        message.success("Application approved successfully!");
        setIsApprovalModalVisible(false);
        approvalForm.resetFields();
        fetchApplications();
      } else {
        message.error(result.error || "Failed to approve application");
      }
    } catch (error) {
      message.error("Please complete the required fields");
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;

    try {
      const values = await rejectionForm.validateFields();
      const rejectionData: RejectApplicationForm = {
        rejectionReason: values.rejectionReason,
        reviewNotes: values.reviewNotes,
      };

      const result = await rejectApplication(
        selectedApplication._id,
        rejectionData
      );

      if (result.success) {
        message.success("Application rejected successfully!");
        setIsRejectionModalVisible(false);
        rejectionForm.resetFields();
        fetchApplications();
      } else {
        message.error(result.error || "Failed to reject application");
      }
    } catch (error) {
      message.error("Please complete the required fields");
    }
  };

  
  const columns: TableColumnsType<Application> = [
    {
      title: "Applicant",
      key: "applicant",
      width: 200,
      // fixed: 'left' as any,
      render: (record: Application) => (
        <div>
          <div className="font-medium">
            {typeof record.applicantId === "object"
              ? record.applicantId.fullName
              : "Unknown User"}
          </div>
          <div className="text-gray-500 text-sm">
            {typeof record.applicantId === "object"
              ? record.applicantId.email
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Project",
      key: "project",
      width: 200,
      render: (record: Application) => (
        <div>
          <div className="font-medium">
            {typeof record.projectId === "object"
              ? record.projectId.projectName
              : "Unknown Project"}
          </div>
          <div className="text-gray-500 text-sm">
            {typeof record.projectId === "object"
              ? record.projectId.projectCategory
              : ""}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          pending: "orange",
          approved: "green",
          rejected: "red",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Availability",
      dataIndex: "availability",
      key: "availability",
      render: (availability: string) => (
        <Tag color="blue">{availability.replace("_", " ").toUpperCase()}</Tag>
      ),
    },
    {
      title: "Proposed Rate",
      dataIndex: "proposedRate",
      key: "proposedRate",
      render: (rate: number, record: Application) => {
        if (!rate) return "As Listed";
        return (
          <span>
            {typeof record.projectId === "object"
              ? record.projectId.payRateCurrency
              : ""}{" "}
            {rate}
          </span>
        );
      },
    },
    {
      title: "Applied Date",
      dataIndex: "appliedAt",
      key: "appliedAt",
      render: (date: string) => moment(date).format("MMM DD, YYYY"),
      sorter: (a: Application, b: Application) =>
        moment(a.appliedAt).unix() - moment(b.appliedAt).unix(),
    },
    {
      title: "Resume",
      dataIndex: "resumeUrl",
      key: "resumeUrl",
      render: (resumeUrl: string, record: Application) =>
        resumeUrl ? (
          <Button
            type="link"
            icon={<FilePdfOutlined />}
            onClick={() => viewResume(resumeUrl, record)}
            size="small"
          >
            View
          </Button>
        ) : (
          <span className="text-gray-400">No resume</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      // fixed: 'right' as any,
      width: 100,
      render: (_: any, record: Application) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item
                key="view-details"
                icon={<EyeOutlined />}
                onClick={() => showApplicationDetails(record)}
              >
                View Details
              </Menu.Item>
              {record.resumeUrl && (
                <Menu.Item
                  key="view-resume"
                  icon={<FilePdfOutlined />}
                  onClick={() => viewResume(record.resumeUrl!, record)}
                >
                  View Resume
                </Menu.Item>
              )}
              {record.status === "pending" && (
                <>
                  <Menu.Divider />
                  <Menu.Item
                    key="approve"
                    icon={<CheckOutlined />}
                    onClick={() => showApprovalModal(record)}
                    className="text-green-600"
                  >
                    Approve
                  </Menu.Item>
                  <Menu.Item
                    key="reject"
                    icon={<CloseOutlined />}
                    onClick={() => showRejectionModal(record)}
                    className="text-red-600"
                  >
                    Reject
                  </Menu.Item>
                </>
              )}
            </Menu>
          }
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="hover:bg-gray-100"
          >
            Actions
          </Button>
        </Dropdown>
      ),
    },
  ];

  const rowSelection: TableProps<Application>['rowSelection'] = {
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys as string[]);
    },
    getCheckboxProps: (record) => ({
      disabled: record.status !== 'pending', // Disable checkbox for non-pending applications
      name: record._id,
    }),
    preserveSelectedRowKeys: true,
  };

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          action={
            <Button
              size="small"
              onClick={() => {
                resetState();
                fetchApplications();
              }}
            >
              Retry
            </Button>
          }
          closable
          onClose={resetState}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular] w-full">
      {/* <Header title="Application Management" /> */}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalApplications}
              </div>
              <div className="text-gray-600">Total Applications</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {summary.statusBreakdown?.pending || 0}
              </div>
              <div className="text-gray-600">Pending</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {summary.statusBreakdown?.approved || 0}
              </div>
              <div className="text-gray-600">Approved</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {summary.statusBreakdown?.rejected || 0}
              </div>
              <div className="text-gray-600">Rejected</div>
            </div>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Space wrap>
          <Select
            placeholder="Filter by status"
            allowClear
            style={{ width: 150 }}
            onChange={handleStatusFilter}
            value={statusFilter}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>

          <Select
            placeholder="Filter by project"
            allowClear
            style={{ width: 250 }}
            onChange={handleProjectFilter}
            value={projectFilter}
            showSearch
            optionFilterProp="children"
          >
            {projects.map((project) => (
              <Option key={project._id} value={project._id}>
                {project.projectName}
              </Option>
            ))}
          </Select>

          <Button
            icon={<ReloadOutlined />}
            onClick={fetchApplications}
            loading={loading}
          >
            Refresh
          </Button>
            <Button
    type="primary"
    icon={<CheckOutlined />}
    onClick={handleBulkApprovalOfPendingApplications}
    disabled={selectedRowKeys.length === 0 || isApprovingPendingApplications} 
  >
    Approve Selected ({selectedRowKeys.length})
  </Button>

  <Button
    danger
    icon={<CloseOutlined />}
    onClick={handleBulkDeleteOfPendingApplications}
    disabled={selectedRowKeys.length === 0 || isDeletingPendingApplications} 
  >
    Reject Selected ({selectedRowKeys.length})
  </Button>
        </Space>
      </div>
          <Space wrap className="mb-4">

</Space>

      {/* Applications Table */}
      <Spin spinning={loading}>
        <Table
           rowSelection={rowSelection}
          columns={columns}
          dataSource={applications}
          rowKey="_id"
          pagination={{
            current: pagination?.currentPage || 1,
            pageSize: pagination?.limit || 50,
            total: pagination?.totalApplications || 0,
            position: ["bottomCenter"],
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} applications`,
            pageSizeOptions: ['10', '25', '50', '100'],
            onChange: (page, pageSize) => {
              getAllApplications({
                status: statusFilter || undefined,
                projectId: projectFilter || undefined,
                page,
                limit: pageSize,
              });
            },
            onShowSizeChange: (current, size) => {
              getAllApplications({
                status: statusFilter || undefined,
                projectId: projectFilter || undefined,
                page: 1,
                limit: size,
              });
            },
          }}
          // scroll={{ x: 500 }}
          scroll={{ x: 'max-content' }}
        />
      </Spin>

      {/* Application Details Modal */}
      <PageModal
        openModal={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        closable={true}
        className="application-details-modal"
        modalwidth="800px"
      >
        {selectedApplication && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Application Details
              </h2>
              <Tag
                color={
                  selectedApplication.status === "pending"
                    ? "orange"
                    : selectedApplication.status === "approved"
                      ? "green"
                      : "red"
                }
              >
                {selectedApplication.status.toUpperCase()}
              </Tag>
            </div>

            <Card className="mb-6">
              <Descriptions title="Applicant Information" bordered column={2}>
                <Descriptions.Item label="Name">
                  {typeof selectedApplication.applicantId === "object"
                    ? selectedApplication.applicantId.fullName
                    : "Unknown User"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {typeof selectedApplication.applicantId === "object"
                    ? selectedApplication.applicantId.email
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Skills" span={2}>
                  {typeof selectedApplication.applicantId === "object" &&
                    selectedApplication.applicantId.skills
                    ? selectedApplication.applicantId.skills.map(
                      (skill, index) => (
                        <Tag key={index} color="blue">
                          {skill}
                        </Tag>
                      )
                    )
                    : "No skills listed"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Project Information" bordered column={2}>
                <Descriptions.Item label="Project Name">
                  {typeof selectedApplication.projectId === "object"
                    ? selectedApplication.projectId.projectName
                    : "Unknown Project"}
                </Descriptions.Item>
                <Descriptions.Item label="Category">
                  {typeof selectedApplication.projectId === "object"
                    ? selectedApplication.projectId.projectCategory
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Pay Rate">
                  {typeof selectedApplication.projectId === "object"
                    ? `${selectedApplication.projectId.payRateCurrency} ${selectedApplication.projectId.payRate}`
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Proposed Rate">
                  {selectedApplication.proposedRate || "As Listed"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card className="mb-6">
              <Descriptions title="Application Information" bordered column={2}>
                <Descriptions.Item label="Applied Date">
                  {moment(selectedApplication.appliedAt).format(
                    "MMMM DD, YYYY HH:mm"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Availability">
                  {selectedApplication.availability
                    .replace("_", " ")
                    .toUpperCase()}
                </Descriptions.Item>
                <Descriptions.Item label="Estimated Completion">
                  {selectedApplication.estimatedCompletionTime ||
                    "Not specified"}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  {selectedApplication.status.toUpperCase()}
                </Descriptions.Item>
                {selectedApplication.resumeUrl && (
                  <Descriptions.Item label="Resume" span={2}>
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      onClick={() => viewResume(selectedApplication.resumeUrl!)}
                    >
                      View Resume
                    </Button>
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="Cover Letter" span={2}>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedApplication.coverLetter}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedApplication.status !== "pending" && (
              <Card>
                <Descriptions title="Review Information" bordered column={1}>
                  {selectedApplication.reviewNotes && (
                    <Descriptions.Item label="Review Notes">
                      <div className="bg-gray-50 p-3 rounded">
                        {selectedApplication.reviewNotes}
                      </div>
                    </Descriptions.Item>
                  )}
                  {selectedApplication.status === "approved" &&
                    selectedApplication.approvedAt && (
                      <Descriptions.Item label="Approved Date">
                        {moment(selectedApplication.approvedAt).format(
                          "MMMM DD, YYYY HH:mm"
                        )}
                      </Descriptions.Item>
                    )}
                  {selectedApplication.status === "rejected" && (
                    <>
                      <Descriptions.Item label="Rejection Reason">
                        {selectedApplication.rejectionReason
                          ?.replace("_", " ")
                          .toUpperCase()}
                      </Descriptions.Item>
                      {selectedApplication.rejectedAt && (
                        <Descriptions.Item label="Rejected Date">
                          {moment(selectedApplication.rejectedAt).format(
                            "MMMM DD, YYYY HH:mm"
                          )}
                        </Descriptions.Item>
                      )}
                    </>
                  )}
                </Descriptions>
              </Card>
            )}

            {/* Action Buttons for Pending Applications */}
            {selectedApplication.status === "pending" && (
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    showApprovalModal(selectedApplication);
                  }}
                  className="bg-green-500 border-green-500"
                >
                  Approve Application
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    showRejectionModal(selectedApplication);
                  }}
                >
                  Reject Application
                </Button>
              </div>
            )}
          </div>
        )}
      </PageModal>

      {/* Approval Modal */}
      <Modal
        title="Approve Application"
        open={isApprovalModalVisible}
        onOk={handleApprove}
        onCancel={() => setIsApprovalModalVisible(false)}
        okText="Approve"
        cancelText="Cancel"
        okButtonProps={{ loading }}
        className="approval-modal"
      >
        {selectedApplication && (
          <div>
            <p className="mb-4">
              You are about to approve{" "}
              <strong>
                {typeof selectedApplication.applicantId === "object"
                  ? selectedApplication.applicantId.fullName
                  : "Unknown User"}
              </strong>{" "}
              for the project{" "}
              <strong>
                {typeof selectedApplication.projectId === "object"
                  ? selectedApplication.projectId.projectName
                  : "Unknown Project"}
              </strong>
              .
            </p>

            <Form form={approvalForm} layout="vertical">
              <Form.Item
                name="reviewNotes"
                label="Review Notes"
                rules={[{ required: true, message: "Please add review notes" }]}
              >
                <TextArea
                  placeholder="Add notes about why this application was approved..."
                  rows={4}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        title="Reject Application"
        open={isRejectionModalVisible}
        onOk={handleReject}
        onCancel={() => setIsRejectionModalVisible(false)}
        okText="Reject"
        cancelText="Cancel"
        okButtonProps={{ loading, danger: true }}
        className="rejection-modal"
      >
        {selectedApplication && (
          <div>
            <p className="mb-4">
              You are about to reject{" "}
              <strong>
                {typeof selectedApplication.applicantId === "object"
                  ? selectedApplication.applicantId.fullName
                  : "Unknown User"}
              </strong>
              's application for{" "}
              <strong>
                {typeof selectedApplication.projectId === "object"
                  ? selectedApplication.projectId.projectName
                  : "Unknown Project"}
              </strong>
              .
            </p>

            <Form form={rejectionForm} layout="vertical">
              <Form.Item
                name="rejectionReason"
                label="Rejection Reason"
                rules={[
                  {
                    required: true,
                    message: "Please select a rejection reason",
                  },
                ]}
              >
                <Select placeholder="Select reason for rejection">
                  {REJECTION_REASONS.map((reason) => (
                    <Option key={reason.value} value={reason.value}>
                      {reason.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="reviewNotes"
                label="Review Notes"
                rules={[{ required: true, message: "Please add review notes" }]}
              >
                <TextArea
                  placeholder="Add detailed feedback about why this application was rejected..."
                  rows={4}
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        title="Resume Preview"
        open={isPdfModalVisible}
        onCancel={closePdfModal}
        width={900}
        footer={[
          pdfViewerApplication?.status === "pending" && (
            <div
              key="pdf-actions"
              style={{
                display: "flex",
                gap: "8px",
                justifyContent: "flex-end",
                marginRight: "16px",
                marginBottom: "8px",
              }}
            >
              <Button
                key="reject"
                onClick={() => {
                  setSelectedApplication(pdfViewerApplication);
                  setIsRejectionModalVisible(true);
                  closePdfModal();
                }}
              >
                Reject
              </Button>
              <Button
                key="approve"
                type="primary"
                onClick={() => {
                  setSelectedApplication(pdfViewerApplication);
                  setIsApprovalModalVisible(true);
                  closePdfModal();
                }}
              >
                Approve
              </Button>
            </div>
          ),
          <Button key="close" onClick={closePdfModal}>
            Close
          </Button>,
        ].filter(Boolean)}
        styles={{
          body: {
            height: "70vh",
            overflow: "hidden",
            padding: "8px",
          },
        }}
      >
        {pdfUrl && (
          <div style={{ height: "100%" }}>
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApplicationManagement;
