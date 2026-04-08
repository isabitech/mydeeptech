import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  message,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { useAdminInvoices } from "../../../../hooks/Auth/Admin/Invoices/useAdminInvoices";
import { useAdminProjects } from "../../../../hooks/Auth/Admin/Projects/useAdminProjects";
import { useAdminApplications } from "../../../../hooks/Auth/Admin/Projects/useAdminApplications";
import { useAdminDTUsers } from "../../../../hooks/Auth/Admin/useAdminDTUsers";
import {
  CreateInvoiceForm,
} from "../../../../types/invoice.types";
import { Project, DTUser, Application } from "../../../../types/project.types";

const { Option } = Select;
const { TextArea } = Input;

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { createInvoice, loading } = useAdminInvoices();
  const { getAllProjects } = useAdminProjects();
  const { getAllApplications } = useAdminApplications();
  const { getAllDTUsers } = useAdminDTUsers();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [dtUsers, setDtUsers] = useState<DTUser[]>([]);
  const [projectDTUsers, setProjectDTUsers] = useState<DTUser[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingDTUsers, setLoadingDTUsers] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (open) {
      loadInitialData();
    } else {
      // Clean up search timeout when modal closes
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    }
  }, [open]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);
  


  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      // Load all projects and DTUsers
      const [projectsResult, dtUsersResult] = await Promise.all([
        getAllProjects({ status: "active" }),
        getAllDTUsers(),
      ]);

      if (projectsResult.success) {
        setProjects(projectsResult.data.data.projects);
        console.log('📋 Projects loaded:', projectsResult.data.data.projects);
      }

      console.log('👤 DTUsers API Response:', dtUsersResult);

      if (dtUsersResult.success) {
        // Handle different response structures
        let usersData;
        if (dtUsersResult.data.users) {
          usersData = dtUsersResult.data.users;
        } else if (Array.isArray(dtUsersResult.data)) {
          usersData = dtUsersResult.data;
        } else {
          usersData = [];
        }
        
        console.log('👤 Setting DTUsers:', usersData);
        setDtUsers(usersData);
      } else {
        console.error('❌ Failed to load DTUsers:', dtUsersResult.error);
      }
    } catch (error) {
      message.error("Failed to load data");
      console.error("Error loading data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Function to load DTUsers for selected project with optional search
  const loadProjectDTUsers = async (projectId: string, search?: string) => {
    try {
      // Build search parameters
      const searchParams: any = {
        projectId,
        status: "approved",
        limit: 1000,
      };

      // Add search parameter if provided
      if (search && search.trim()) {
        searchParams.search = search.trim();
      }

      // Get approved applications for this project
      const applicationsResult = await getAllApplications(searchParams);

      if (applicationsResult.success) {
        const applications = applicationsResult.data.data.applications;
        
        if (!applications || applications.length === 0) {
          return [];
        }
        
        // Extract DTUsers directly from approved applications
        const assignedDTUsers = applications
          .map((app: Application) => {
            if (!app.applicantId) {
              return null;
            }
            
            const dtUser: DTUser = {
              _id: app.applicantId._id,
              fullName: app.applicantId.fullName,
              email: app.applicantId.email,
              annotatorStatus: app.applicantId.annotatorStatus || 'unknown',
              microTaskerStatus: app.applicantId.microTaskerStatus || 'unknown',
              isEmailVerified: true,
              hasSetPassword: true,
              skills: app.applicantId.professionalBackground?.skills || [],
              domains: []
            };
            
            return dtUser;
          })
          .filter((user: DTUser | null) => user !== null) as DTUser[];

        return assignedDTUsers;
      } else {
        throw new Error(applicationsResult.error || 'Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading project users:', error);
      throw error;
    }
  };

  // Debounced search function
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const debouncedSearch = useCallback(
    (projectId: string, searchValue: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(async () => {
        if (!projectId) return;
        
        setSearchingUsers(true);
        try {
          const users = await loadProjectDTUsers(projectId, searchValue);
          setProjectDTUsers(users);
          
          if (searchValue && users.length === 0) {
            message.info(`No users found matching "${searchValue}"`);
          }
        } catch (error) {
          message.error('Failed to search users: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
          setSearchingUsers(false);
        }
      }, 500);
    },
    []
  );

  // Handle DTUser search
  const handleUserSearch = (value: string) => {
    setSearchTerm(value);
    if (selectedProjectId) {
      debouncedSearch(selectedProjectId, value);
    }
  };

  const handleProjectChange = async (projectId: string) => {
    console.log('🎯 Project selected:', projectId);
    setSelectedProjectId(projectId);
    setProjectDTUsers([]);
    setLoadingDTUsers(true);
    setSearchTerm(""); // Reset search term
    
    // Reset the DTUser field
    form.setFieldValue('dtUserId', undefined);
    
    try {
      // First, check if there are any applications at all for this project
      const allApplicationsParams = {
        projectId,
        limit: 1000,
      };
      
      const allApplicationsResult = await getAllApplications(allApplicationsParams);
      
      let allAppsData: any[] = [];
      if (allApplicationsResult.success) {
        allAppsData = allApplicationsResult.data.data.applications;
        
        // If no applications exist at all, show specific message
        if (allAppsData.length === 0) {
          message.info('No one has applied to this project yet. Users must apply to the project first before invoices can be created.');
          return;
        }
      }
      
      // Load initial approved DTUsers (without search filter)
      const assignedDTUsers = await loadProjectDTUsers(projectId);
      setProjectDTUsers(assignedDTUsers);

      if (assignedDTUsers.length === 0) {
        // Check if there were any applications at all from our earlier call
        if (allAppsData.length > 0) {
          message.info(`This project has ${allAppsData.length} application(s), but none are approved yet. Please review and approve applications first.`);
        }
      } else {
        message.success(`Found ${assignedDTUsers.length} assigned user(s) for this project`);
      }
    } catch (error) {
      message.error('Failed to load project users: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoadingDTUsers(false);
    }
  };

  const handleCancel = () => {
    // Clean up search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    form.resetFields();
    setSelectedProjectId(null);
    setProjectDTUsers([]);
    setLoadingDTUsers(false);
    setSearchingUsers(false);
    setSearchTerm("");
    onClose();
  };

  const handleSubmit = async (values: any) => {
    try {
      const invoiceData: CreateInvoiceForm = {
        projectId: values.projectId,
        dtUserId: values.dtUserId,
        invoiceAmount: values.invoiceAmount,
        currency: values.currency || "USD",
        dueDate: values.dueDate.toISOString(),
        description: values.description,
        workDescription: values.workDescription,
        hoursWorked: values.hoursWorked,
        tasksCompleted: values.tasksCompleted,
        qualityScore: values.qualityScore,
        invoiceType: values.invoiceType || "project_completion",
        adminNotes: values.adminNotes,
        workPeriodStart: values.workPeriod?.[0]?.toISOString(),
        workPeriodEnd: values.workPeriod?.[1]?.toISOString(),
      };

      const result = await createInvoice(invoiceData);
      if (result.success) {
        form.resetFields();
        setSelectedProjectId(null);
        setProjectDTUsers([]);
        setSearchTerm("");
        setSearchingUsers(false);
        message.success("Invoice created successfully!");
        onSuccess();
      } else {
        message.error(result.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error("Failed to create invoice");
    }
  };

  return (
    <Modal
      title="Create New Invoice"
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          Create Invoice
        </Button>,
      ]}
    >
      <Spin spinning={loadingData}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: "USD",
            invoiceType: "project_completion",
            dueDate: dayjs().add(30, "day"),
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="projectId"
                label="Project"
                rules={[{ required: true, message: "Please select a project" }]}
              >
                <Select 
                  placeholder="Select project"
                  onChange={handleProjectChange}
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {projects.filter(project => project && project._id).map((project) => (
                    <Option key={project._id} value={project._id} label={`${project.projectName} (${project.projectCategory})`}>
                      {project.projectName} ({project.projectCategory})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dtUserId"
                label={`DTUser ${selectedProjectId ? `(${projectDTUsers.length} available)` : ''}`}
                rules={[{ required: true, message: "Please select a DTUser" }]}
                extra={selectedProjectId && projectDTUsers.length === 0 ? 
                  "No approved users found for this project." : 
                  selectedProjectId ? 
                  `Select from ${projectDTUsers.length} user(s) assigned to this project` : 
                  "Select a project first to see available DTUsers"
                }
              >
                <Select 
                  placeholder={
                    loadingDTUsers
                      ? "Loading users..."
                      : searchingUsers
                        ? "Searching..."
                        : selectedProjectId 
                          ? projectDTUsers.length > 0 
                            ? "Type to search DTUsers or select from list" 
                            : "No approved applicants available"
                          : "Please select a project first"
                  }
                  disabled={!selectedProjectId || loadingDTUsers}
                  showSearch
                  allowClear
                  searchValue={searchTerm}
                  loading={loadingDTUsers || searchingUsers}
                  onSearch={handleUserSearch}
                  onClear={() => {
                    setSearchTerm("");
                    form.setFieldValue('dtUserId', undefined);
                  }}
                  filterOption={false} // Disable frontend filtering
                  notFoundContent={
                    loadingDTUsers || searchingUsers
                      ? "Loading..."
                      : searchTerm 
                        ? `No users found matching "${searchTerm}"`
                        : selectedProjectId && projectDTUsers.length === 0 
                          ? "No approved applicants found. Users must apply to the project and be approved before invoices can be created." 
                          : "Type to search for users"
                  }
                >
                  {projectDTUsers.map((user, index) => (
                    <Option 
                      key={user._id || `user-${index}`} 
                      value={user._id}
                      label={`${user.fullName || 'Unknown User'} (${user.email || 'No email'})`}
                    >
                      <div className="block">
                        <div style={{ fontWeight: 'bold' }}>{user.fullName || 'Unknown User'}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{user.email || 'No email'}</div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          Status: {user.annotatorStatus || 'Unknown'}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="invoiceAmount"
                label="Invoice Amount"
                rules={[
                  { required: true, message: "Please enter invoice amount" },
                  { type: "number", min: 0.01, message: "Amount must be greater than 0" },
                ]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter amount"
                  precision={2}
                  min={0.01}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="currency" label="Currency">
                <Select>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                  <Option value="GBP">GBP</Option>
                  <Option value="NGN">NGN</Option>
                  <Option value="KES">KES</Option>
                  <Option value="GHS">GHS</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="dueDate"
                label="Due Date"
                rules={[{ required: true, message: "Please select due date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="invoiceType" label="Invoice Type">
                <Select>
                  <Option value="project_completion">Project Completion</Option>
                  <Option value="milestone">Milestone</Option>
                  <Option value="hourly">Hourly</Option>
                  <Option value="fixed_rate">Fixed Rate</Option>
                  <Option value="bonus">Bonus</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="hoursWorked" label="Hours Worked">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Enter hours"
                  min={0}
                  precision={1}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tasksCompleted" label="Tasks Completed">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Number of tasks"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="workPeriod" label="Work Period">
                <DatePicker.RangePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="qualityScore" label="Quality Score (0-100)">
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="Quality score"
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Invoice description"
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item name="workDescription" label="Work Description">
            <TextArea
              rows={3}
              placeholder="Detailed work description"
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item name="adminNotes" label="Admin Notes">
            <TextArea
              rows={2}
              placeholder="Internal notes"
              maxLength={1000}
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CreateInvoiceModal;