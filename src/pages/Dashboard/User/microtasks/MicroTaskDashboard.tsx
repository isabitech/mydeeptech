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
} from "antd";
import {
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { microTaskQueryService, microTaskAdminQueryService } from "../../../../services/micro-task-service";
import { TaskAssignmentSchema } from "../../../../validators/task/single-task-schema";

const { Title, Text, Paragraph } = Typography;

const MicroTaskDashboard: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskAssignmentSchema | null>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const navigate = useNavigate();

  const { 
      myTasks,
      isMyTasksLoading,
  } = microTaskAdminQueryService.useGetMyTasks();

  // TanStack Query hooks
  const {
    availableTasks,
  } = microTaskQueryService.useGetAvailableMicroTasks();

  const handleStartTask = async (submissionId: string, taskId: string) => {
    navigate(`/dashboard/microtasks/submission/${submissionId}?task=${taskId}`);
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
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Micro Tasks</Title>
        <Text type="secondary">
          Complete structured data collection tasks and earn money
        </Text>
      </div>

      {/* Task Management Tabs */}
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: (
              <span>
                My Tasks ({Array.isArray(myTasks) ? myTasks.length : 0})
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={Array.isArray(myTasks) ? myTasks : []}
                  rowKey="_id"
                  pagination={{ pageSize: 10, position: ['bottomCenter'] }}
                  loading={isMyTasksLoading}
                  columns={[
                    {
                      title: 'Task Name',
                      key: 'taskName',
                      render: (record) => (
                        <div className="flex flex-col">
                          <strong>{record.task?.taskTitle || record.task?.title || 'Untitled Task'}</strong>
                           <span>{record.task?.category && (<span className="text-xs text-gray-400">{record.task.category}</span>)}</span>
                        </div>
                      ),
                    },
                    {
                      title: 'Description',
                      dataIndex: ['task', 'description'],
                      key: 'description',
                    },
                    {
                      title: 'Pay Rate',
                      key: 'payRate',
                      render: (record) => (
                        <Text strong>{record.task?.currency || 'USD'} {record.task?.payRate || 0}</Text>
                      ),
                    },
                    {
                      title: 'Assigned Date',
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
                              setSelectedTask(record);
                              setIsTaskModalVisible(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => handleStartTask(record?._id ?? "", record?.task?._id ?? "")}
                          >
                            Start Task
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: <Empty description="No tasks assigned to you" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                />
              </Card>
            ),
          },
          {
            key: '2',
            label: (
              <span>
                All Tasks ({availableTasks.length})
              </span>
            ),
            children: (
              <Card>
                <Table
                  dataSource={availableTasks}
                  rowKey="_id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: 'Task Name',
                      dataIndex: 'title',
                      key: 'title',
                      render: (text, record) => (
                        <div>
                          <Space>
                            <span>{getCategoryInfo(record.category).icon}</span>
                            <strong>{text}</strong>
                            <Tag color={getCategoryInfo(record.category).color}>
                              {getCategoryInfo(record.category).name}
                            </Tag>
                          </Space>
                        </div>
                      ),
                    },
                    {
                      title: 'Description',
                      dataIndex: 'description',
                      key: 'description',
                      ellipsis: true,
                      // width: '30%',
                    },
                    {
                      title: 'Pay Rate',
                      key: 'payRate',
                      render: (record) => (
                        <Text strong>{record.payRateCurrency} {record.payRate}</Text>
                      ),
                    },
                    {
                      title: 'Details',
                      key: 'details',
                      render: (record) => (
                        <div>
                          <div>{record.estimated_time}</div>
                          <Text type="secondary">{record.required_count} images</Text>
                          {record.deadline && (
                            <div>
                              <Text type="secondary">Due {moment(record.deadline).fromNow()}</Text>
                            </div>
                          )}
                        </div>
                      ),
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
                              setSelectedTask(record);
                              setIsTaskModalVisible(true);
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            type="primary"
                            onClick={() => handleStartTask(record?._id ?? "", record?.task?._id ?? "")}
                          >
                            Start Task
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: <Empty description="No available tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  }}
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          title={`Task Details: ${selectedTask.task?.taskTitle || 'Task Details'}`}
          open={isTaskModalVisible}
          onCancel={() => {
            setIsTaskModalVisible(false);
            setSelectedTask(null);
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsTaskModalVisible(false);
                setSelectedTask(null);
              }}
            >
              Close
            </Button>,
            <Button
              key="start"
              type="primary"
              onClick={() => {
                setIsTaskModalVisible(false);
                handleStartTask(selectedTask._id, selectedTask.task?._id || "");
              }}
            >
              Start Task
            </Button>
          ]}
         
        >
          <div style={{ marginBottom: 16 }}>
            <Tag color={getCategoryInfo(selectedTask?.task?.category || selectedTask.task?.category).color} style={{ marginBottom: 8 }}>
              {getCategoryInfo(selectedTask?.task?.category || selectedTask.task.category).name}
            </Tag>
            <Paragraph>{selectedTask.task?.description || 'No description available'}</Paragraph>
          </div>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Statistic
                title="Pay Rate"
                value={`${selectedTask.task?.currency || selectedTask.task?.currency || 'USD'} ${selectedTask.task?.payRate || selectedTask.task?.payRate || 0}`}
                prefix={<DollarOutlined />}
              />
            </Col>
         
          </Row>

          {(selectedTask.task?.dueDate) && (
            <Alert
              message={`Due Date: ${moment(selectedTask.task?.dueDate).format("MMM DD, YYYY HH:mm")}`}
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