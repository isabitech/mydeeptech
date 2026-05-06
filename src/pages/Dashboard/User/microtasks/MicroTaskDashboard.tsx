import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Tag,
  Statistic,
  Alert,
  Modal,
  Empty,
  Spin,
  Table,
  Tabs,
  Pagination,
  Divider,
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { microTaskQueryService, microTaskAdminQueryService } from "../../../../services/micro-task-service";
import { TaskSchema } from "../../../../validators/task/all-task-schema";
import { TaskStatus } from "../../../../services/micro-task-service/micro-task-query";

const { Title, Text, Paragraph } = Typography;

const MicroTaskDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskSchema | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskStatus>("active");
  const [modalContext, setModalContext] = useState<'active' | 'pending' | 'approved' | 'rejected'>('active');

  const navigate = useNavigate();

  const { isMyTasksLoading } = microTaskAdminQueryService.useGetMyTasks();
  const { allTasks, allTaskPagination } = microTaskQueryService.useGetAllTasks();
  const { allFilters: allFiltersPending } = microTaskQueryService.useGetTasksByFilter({ page: 1, limit: 10, status: "ongoing" });
  const { allFilters: allFiltersApproved } = microTaskQueryService.useGetTasksByFilter({ page: 1, limit: 10, status: "approved" });
  const { allFilters: allFiltersRejected } = microTaskQueryService.useGetTasksByFilter({ page: 1, limit: 10, status: "rejected" });
  const { earningStats, isEarningStatsLoading, earningStatsError } = microTaskQueryService.useGetUserEarningStatistics();

  const handleStartTask = async  (taskId: string) => {
    navigate(`/dashboard/microtasks/${taskId}/start`);
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "mask_collection":
        return {
          name: "Mask Collection",
          description: "Upload 20 face mask images with different angles",
          color: "blue",
          icon: ""
        };
      case "age_progression":
        return {
          name: "Age Progression",
          description: "Upload 15 images across different time periods",
          color: "purple",
          icon: ""
        };
      default:
        return { name: category, description: "", color: "default", icon: "" };
    }
  };

  // Show loading state
  if (isMyTasksLoading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading micro tasks...</div>
      </div>
    );
  }


  return (
    <div className="h-full flex flex-col gap-4 font-[gilroy-regular]">
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Micro Tasks</Title>
        <Text type="secondary">
          Complete structured data collection tasks and earn money
        </Text>
      </div>

      {/* Earnings Statistics Section */}
      {earningStatsError ? (
        <Alert
          message="Unable to load earnings data"
          description="Please try refreshing the page"
          type="error"
          showIcon
        />
      ) : earningStats ? (
        <Row gutter={[16, 16]}>
          <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card>
              <Statistic
                title="Total Tasks Available"
                value={earningStats.summary.totalTasksAvailable}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card>
              <Statistic
                title="Total Tasks I Submitted"
                value={earningStats.summary.totalTasksSubmitted}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card>
              <Statistic
                title="Total Tasks Completed"
                value={earningStats.summary.totalTasksCompleted}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6} xs={24} sm={12} md={6} lg={6} xl={6}>
            <Card>
              <Statistic
                title="My Earnings"
                value={earningStats.summary.myEarnings.toFixed(2)}
                precision={2}
                prefix={<TrophyOutlined />}
                suffix="USD"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      ) : (
        <Card loading={isEarningStatsLoading}>
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Text type="secondary">No earning data available yet. Complete your first task to start earning!</Text>
          </div>
        </Card>
      )}

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab as (key: string) => void}
          items={[
            {
              key: 'active',
              label: (<span>All Tasks ({allTasks.length})</span>),
              children: (
          <div>
            {allTasks.length === 0 ? (
              <Empty description="No available tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <>
                <Row gutter={[16, 16]}>
                  {allTasks.map((record) => (
                    <Col xs={24} sm={24} md={12} lg={8} xl={8} key={record._id}>
                      <Card
                        style={{ height: '300px', display: 'flex', flexDirection: 'column', width: '100%' }}
                        styles={{ body: { flex: 1, overflow: 'hidden' } }}
                        actions={[
                          <Button
                            key="details"
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedTask(record);
                              setModalContext('active');
                              setIsTaskModalVisible(true);
                            }}
                          >
                            Details
                          </Button>,
                          <Button
                            key="apply"
                            type="default"
                            onClick={() => { 
                              handleStartTask(record?._id ?? "");
                            }}
                          >
                            Start Task
                          </Button>,
                        ]}
                      >
                        <Card.Meta
                          title={
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <span>{record.taskTitle}</span>
                              <Tag color={getCategoryInfo(record.category).color} style={{ width: 'fit-content' }}>
                                {getCategoryInfo(record.category).name}
                              </Tag>
                            </div>
                          }
                        />
                        <Divider style={{ margin: '12px 0' }} />
                        <Space direction="vertical" size={8} style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Status</Text>
                            <Tag color={record.isActive ? 'green' : 'red'}>
                              {record.isActive ? 'Active' : 'Inactive'}
                            </Tag>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Pay Rate</Text>
                            <Text strong>{record.currency} {record.payRate}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Assigned Date</Text>
                            <Text>{record.createdAt ? moment(record.createdAt).format('MMM DD, YYYY') : 'N/A'}</Text>
                          </div>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
                <div className="mt-6 flex justify-center">
                  <Pagination
                    current={allTaskPagination?.current_page || 1}
                    pageSize={allTaskPagination?.per_page || 10}
                    total={allTaskPagination?.total_items || 0}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} tasks`}
                  />
                </div>
              </>
            )}
          </div>
        ),
      },
      {
        key: 'pending',
            label: (
              <span>
                Pending ({Array.isArray(allFiltersPending) ? allFiltersPending.length : 0})
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={Array.isArray(allFiltersPending) ? allFiltersPending : []}
                  rowKey="_id"
                  pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                  scroll={{ x: "max-content" }}
                  columns={[
                    {
                      title: 'Task Name',
                      dataIndex: 'taskTitle',
                      key: 'taskTitle',
                      render: (text, record) => (
                        <div className="flex flex-col">
                          <strong>{record.task.taskTitle || 'Untitled Task'}</strong>
                           <span>{record.task.category && (<span className="text-xs text-gray-400">{record.task.category}</span>)}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Pay Rate',
                      key: 'payRate',
                      render: (record) => (
                        <Text strong>{record.task.currency || 'USD'} {record.task.payRate || 0}</Text>
                      ),
                    },
                    {
                      title: 'Created Date',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A',
                    },
                  ]}
                  locale={{
                    emptyText: <Empty description="No pending tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                />
              </Card>
            ),
          },
            {
            key: 'approved',
            label: (
              <span>
                Approved ({Array.isArray(allFiltersApproved) ? allFiltersApproved.length : 0})
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={Array.isArray(allFiltersApproved) ? allFiltersApproved : []}
                  rowKey="_id"
                  pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                  columns={[
                    {
                      title: 'Task Name',
                      dataIndex: 'taskTitle',
                      key: 'taskTitle',
                      render: (text, record) => (
                        <div className="flex flex-col">
                          <strong>{record.task.taskTitle || 'Untitled Task'}</strong>
                           <span>{record.task.category && (<span className="text-xs text-gray-400">{record.task.category}</span>)}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Pay Rate',
                      key: 'payRate',
                      render: (record) => (
                        <Text strong>{record.task.currency || 'USD'} {record.task.payRate || 0}</Text>
                      ),
                    },
                    {
                      title: 'Created Date',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A',
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (record) => (
                        <Space>
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedTask(record.task);
                              setModalContext('approved');
                              setIsTaskModalVisible(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            key="start"
                            type="primary"
                            onClick={() => handleStartTask(record?.task?._id ?? "")}
                          >
                             View Task
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: <Empty description="No pending tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                  scroll={{ x: "max-content" }}
                />
              </Card>
            ),
          },
          {
            key: 'rejected',
            label: (
              <span>
                Rejected ({Array.isArray(allFiltersRejected) ? allFiltersRejected.length : 0})
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={Array.isArray(allFiltersRejected) ? allFiltersRejected : []}
                  rowKey="_id"
                  pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                   scroll={{ x: "max-content" }}
                  columns={[
                    {
                      title: 'Task Name',
                      dataIndex: 'taskTitle',
                      key: 'taskTitle',
                      render: (text, record) => (
                        <div className="flex flex-col">
                          <strong>{record.task.taskTitle || 'Untitled Task'}</strong>
                           <span>{record.task.category && (<span className="text-xs text-gray-400">{record.task.category}</span>)}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Pay Rate',
                      key: 'payRate',
                      render: (record) => (
                        <Text strong>{record.task.currency || 'USD'} {record.task.payRate || 0}</Text>
                      ),
                    },
                    {
                      title: 'Rejected Date',
                      dataIndex: 'updatedAt',
                      key: 'rejectedDate',
                      render: (date) => date ? moment(date).format('MMM DD, YYYY') : 'N/A',
                    },
                    {
                      title: 'Actions',
                      key: 'actions',
                      render: (record) => (
                        <Space>
                          <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={() => {
                              setSelectedTask(record.task);
                              setModalContext('rejected');
                              setIsTaskModalVisible(true);
                            }}
                          >
                            View Details
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: <Empty description="No rejected tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                />
              </Card>
            ),
          },
        ]}
      />
      </Card>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          title={`${selectedTask.taskTitle || 'Task Details'}`}
          open={isTaskModalVisible}
          onCancel={() => {
            setIsTaskModalVisible(false);
            setSelectedTask(null);
            setModalContext('active');
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsTaskModalVisible(false);
                setSelectedTask(null);
                setModalContext('active');
              }}
            >
              Close
            </Button>,
            ...(modalContext !== 'rejected' ? [
              <Button
                key="start"
                type="primary"
                onClick={() => {
                  setIsTaskModalVisible(false);
                  handleStartTask(selectedTask._id || "");
                }}
              >
                View Task
              </Button>
            ] : []),
          ]}
        >
          <div style={{ marginBottom: 16 }}>
            <Tag color={getCategoryInfo(selectedTask?.category || "default").color} style={{ marginBottom: 8 }}>
              {getCategoryInfo(selectedTask?.category || "default").name}
            </Tag>
            <Tag color={selectedTask?.isActive ? 'green' : 'red'}>
              {selectedTask?.isActive ? 'Active' : 'Inactive'}
            </Tag>
            <Paragraph>{selectedTask?.description || 'No description available'}</Paragraph>
            {
              selectedTask?.instructions 
              ? <Paragraph>{selectedTask.instructions}</Paragraph>
              : null
            }
            <span> Total Images Required: <strong>{selectedTask?.totalImagesRequired ?? "N/A"}</strong> </span>
          </div>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Pay Rate"
                value={`${selectedTask?.currency || 'USD'} ${selectedTask?.payRate || selectedTask?.payRate || 0}`}
                prefix={<DollarOutlined />}
              />
            </Col>
          </Row>

          {(selectedTask?.dueDate || selectedTask?.dueDate) && (
            <Alert
              message={`Due Date: ${moment(selectedTask?.dueDate || selectedTask?.dueDate).format("MMM DD, YYYY HH:mm")}`}
              type="info"
              style={{ marginBottom: 16 }}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

export default MicroTaskDashboard;