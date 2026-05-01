import { useEffect } from "react";
import { Button, Table, notification, Empty, Tag } from "antd";
import { LinkOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import taskQueryService, { AssignedTaskType } from "../../../../services/task-service/task-query";
import { getErrorMessage } from "../../../../service/apiUtils";
import type { ColumnsType } from 'antd/es/table';

const AssignedTasks = () => {
  const { 
    assignedTasks, 
    isAssignedTasksLoading, 
    assignedTasksError, 
    assignedTasksRefetch 
  } = taskQueryService.useGetAssignedTasks();

  // Debug: Log the data structure
  useEffect(() => {
    if (assignedTasks) {
      console.log("🔍 Assigned Tasks Data:", assignedTasks);
    }
  }, [assignedTasks]);

  // Show error notification if there's a query error
  useEffect(() => {
    if (assignedTasksError) {
      notification.error({
        message: "Error fetching assigned tasks",
        description: getErrorMessage(assignedTasksError),
      });
    }
  }, [assignedTasksError]);

  const columns: ColumnsType<AssignedTaskType> = [
    {
      title: 'S/N',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Task Name',
      dataIndex: ['task', 'taskName'],
      key: 'taskName',
      ellipsis: true,
      render: (_, record: AssignedTaskType) => (
        <span>{record.task?.taskName || 'No task name'}</span>
      ),
    },
    {
      title: 'Task Link',
      dataIndex: ['task', 'taskLink'],
      key: 'taskLink',
      render: (_, record: AssignedTaskType) => (
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          href={record.task?.taskLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Task
        </Button>
      ),
    },
    {
      title: 'Guidelines',
      dataIndex: ['task', 'taskGuidelineLink'],
      key: 'taskGuidelineLink',
      render: (_, record: AssignedTaskType) => (
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          href={record.task?.taskGuidelineLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Guidelines
        </Button>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: ['task', 'dueDate'],
      key: 'dueDate',
      render: (_, record: AssignedTaskType) => {
        const date = record.task?.dueDate;
        if (!date) return 'No deadline';
        return (
          <span>
            <CalendarOutlined /> {dayjs(date).format("MMM D, YYYY")}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case 'completed': return 'green';
            case 'in-progress': return 'blue';
            case 'pending': return 'orange';
            default: return 'default';
          }
        };
        
        return (
          <Tag color={getStatusColor(status)}>
            {status?.toUpperCase() || 'PENDING'}
          </Tag>
        );
      },
    },
    {
      title: 'Assigned Date',
      dataIndex: 'assignedDate',
      key: 'assignedDate',
      render: (date: string) => (
        <span>
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Your Assigned Tasks</h2>
        <Button onClick={() => assignedTasksRefetch()}>
          Refresh
        </Button>
      </div>
      
      {assignedTasks && assignedTasks.length === 0 ? (
        <Empty
          description="No tasks assigned to you yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={assignedTasks}
          loading={isAssignedTasksLoading}
          rowKey="assignmentId"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            position: ['bottomCenter'],
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} assigned tasks`,
          }}
          scroll={{ x: 800 }}
        />
      )}
    </div>
  );
};

export default AssignedTasks;