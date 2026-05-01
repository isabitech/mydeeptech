import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, DatePicker, notification, Select, Table, Dropdown } from "antd";
import { UserPlus } from "lucide-react";
import { useUserContext } from "../../../UserContext";
import { PlusCircleFilled, LinkOutlined, DeleteOutlined, ExclamationCircleOutlined, EditOutlined, MoreOutlined } from "@ant-design/icons";
import Loader from "../../../components/Loader";
import { getErrorMessage } from "../../../service/apiUtils";
import taskQueryService, { TaskType } from "../../../services/task-service/task-query";
import taskMutationService, { CreateTaskPayload, AssignTaskPayload, UpdateTaskPayload } from "../../../services/task-service/task-mutation";
import type { ColumnsType } from 'antd/es/table';
import dayjs from "dayjs";
import userQueryService from "../../../services/user-service/user-query";
const { Option } = Select;

export type ResponseType = TaskType[];

type CreatedBy = {
  id: string;
  fullName: string;
  email: string;
}


const TaskTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [isAssignTaskModalVisible, setIsAssignTaskModalVisible] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Show Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const { userInfo } = useUserContext();

  // React Query hooks
  const { tasks, isTasksLoading, tasksError } = taskQueryService.useGetAllTasks();
  const { createTaskMutation } = taskMutationService.useCreateTask();
  const { assignTaskMutation } = taskMutationService.useAssignTask();
  const { deleteTaskMutation } = taskMutationService.useDeleteTask();
  const { updateTaskMutation } = taskMutationService.useUpdateTask();
  const { allUsers: getAllUsers, isUsersLoading, isUsersFetching } = userQueryService.useGetAllUsers(submittedQuery.trim());

  // Handle Form Submission
  const handleOk = async () => {
    const values = await form.validateFields();
    const payload: CreateTaskPayload = {
      ...values,
      dueDate: values.dueDate && dayjs.isDayjs(values.dueDate) 
        ? values.dueDate.format("YYYY-MM-DD") 
        : values.dueDate,
    };
    createTaskMutation.mutate(payload, {
      onSuccess: () => {
        form.resetFields();
        setIsModalVisible(false);
        notification.success({ message: "Task created successfully!" });
      },
      onError: (error) => {
        notification.error({ message: getErrorMessage(error) || "Failed to create task" });
      },
    });
  };

  const handleAssignTask = async () => {
    if (!selectedUser) {
      notification.error({ message: "Please select a user to assign the task to." });
      return;
    }
    if (!selectedTask) {
      notification.error({ message: "No task selected for assignment." });
      return;
    }
  
    const payload: AssignTaskPayload = {
      taskId: selectedTask,
      userId: selectedUser,
    };

    assignTaskMutation.mutate(payload, {
      onSuccess: () => {
        assignForm.resetFields();
        setIsAssignTaskModalVisible(false);
        setSelectedUser("");
        notification.success({ message: "Task assigned successfully!" });
      },
      onError: (error) => {
        notification.error({ message: getErrorMessage(error) || "Failed to assign task" });
      },
    })
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    Modal.confirm({
      title: 'Delete Task',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete the task "${taskName}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        deleteTaskMutation.mutate(taskId, {
          onSuccess: () => {
            notification.success({ message: 'Task deleted successfully!' });
          },
          onError: (error) => {
            notification.error({ message: 'Failed to delete task', description: getErrorMessage(error) });
          },
        });
      },
    });
  };

  const handleEditTask = (task: TaskType) => {
    setEditingTask(task);
    editForm.setFieldsValue({
      taskName: task.taskName,
      taskLink: task.taskLink,
      taskGuidelineLink: task.taskGuidelineLink,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setIsEditModalVisible(true);
  };

  const handleUpdateTask = async () => {
  try {
    const values = await editForm.validateFields();
    const payload: UpdateTaskPayload = {
      ...values,
      dueDate: values.dueDate && dayjs.isDayjs(values.dueDate)
        ? values.dueDate.format("YYYY-MM-DD")
        : values.dueDate,
    };

    if (editingTask) {
      updateTaskMutation.mutate(
        { taskId: editingTask._id, payload },
        {
          onSuccess: () => {
            editForm.resetFields();
            setIsEditModalVisible(false);
            setEditingTask(null);
            notification.success({ message: "Task updated successfully!" });
          },
          onError: (error) => {
            notification.error({ message: getErrorMessage(error) || "Failed to update task" });
          },
        }
      );
    }
  } catch (error) {
    console.error("Validation failed:", error);
  }
};

const onSelectUser = (value: string) => {
  setSelectedUser(value);
};

const onSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setSearchQuery(e.target.value);
};

const onSearch = () => {
  setSubmittedQuery(searchQuery); 
};

const handleMenuClick = ({ key }: { key: string }, record: TaskType) => {
  switch (key) {
    case 'edit':
      handleEditTask(record);
      break;
    case 'assign':
      assignForm.setFieldsValue({
        taskLink: record.taskLink,
        taskGuidelineLink: record.taskGuidelineLink,
        taskName: record.taskName,
        dueDate: record.dueDate,
        userInfo: userInfo.fullName,
      });
      setIsAssignTaskModalVisible(true);
      setSelectedTask(record._id);
      break;
    case 'delete':
      handleDeleteTask(record._id, record.taskName);
      break;
  }
};

  // Handle Cancel
  const handleCancel = () => {
    form.resetFields();
    editForm.resetFields();
    assignForm.resetFields();
    setIsModalVisible(false);
    setIsEditModalVisible(false);
    setIsAssignTaskModalVisible(false);
    setEditingTask(null);
    setSearchQuery("");
    setSelectedUser("");
  };

  // Show error notification if there's a query error
  useEffect(() => {
    if (tasksError) {
      notification.error({
        message: "Error fetching tasks",
        description: getErrorMessage(tasksError),
      });
    }
  }, [tasksError]);

  // Define table columns
  const columns: ColumnsType<TaskType> = [
    {
      title: 'S/N',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Task Link',
      dataIndex: 'taskLink',
      key: 'taskLink',
      render: (link: string) => (
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Task
        </Button>
      ),
    },
    {
      title: 'Guidelines',
      dataIndex: 'taskGuidelineLink',
      key: 'taskGuidelineLink',
      render: (link: string) => (
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Guidelines
        </Button>
      ),
    },
    {
      title: 'Task Name',
      dataIndex: 'taskName',
      key: 'taskName',
      ellipsis: true,
    },
    {
      title: 'Deadline',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        if (!date) return 'No deadline';
        return (
          <span>
             {dayjs(date).format("MMM D, YYYY")}
          </span>
        );
      },
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: CreatedBy) =>  typeof createdBy === 'object' ? createdBy.fullName : createdBy,
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, record: TaskType) => {
        const menuItems = [
          {
            key: 'edit',
            label: 'Edit Task',
            icon: <EditOutlined />,
          },
          {
            key: 'assign',
            label: 'Assign Task',
            icon: <PlusCircleFilled />,
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: 'Delete Task',
            icon: <DeleteOutlined />,
            danger: true,
          },
        ];

        return (
          <Dropdown
            menu={{ 
              items: menuItems, 
              onClick: (menuInfo) => handleMenuClick(menuInfo, record)
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                border: 'none',
                boxShadow: 'none',
                background: 'transparent'
              }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      {isTasksLoading && (
        <div className="h-screen flex items-center justify-center">
          <Loader />
        </div>
      )}
      <div className="flex justify-between mb-4">
        <p>List of Created Tasks</p>
        <Button
          onClick={showModal}
          className="!bg-secondary !border-none !mr-3 !font-[gilroy-regular] rounded-md"
        >
          Create a Task <UserPlus />
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={tasks}
        loading={isTasksLoading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          position: ['bottomCenter'],
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} of ${total} tasks`,
        }}
        scroll={{ x: 800 }}
      />

      {/* Assign Task Modal */}
      <Modal
        title="Assign Task"
        open={isAssignTaskModalVisible}
        onOk={handleAssignTask}
        onCancel={() => setIsAssignTaskModalVisible(false)}
        okText="Assign"
        cancelText="Cancel"
        confirmLoading={assignTaskMutation.isPending}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            name="taskLink"
            label="Task Link"
            rules={[
              { required: true, message: "Please enter the task link!" },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="taskGuidelineLink"
            label="Task Guideline Link"
            rules={[
              {
                required: true,
                message: "Please enter the guideline link!",
              },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="taskName"
            label="Task Name"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Deadline"
            rules={[
              { required: true, message: "Please select a deadline!" },
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="userInfo"
            label="Assign to"
            rules={[
              {
                required: true,
                message: "Please select the username of the user!",
              },
            ]}
          >
            <Select
              placeholder="Select A User"
              onChange={onSelectUser}
              className="w-full"
              value={selectedUser || undefined}
              notFoundContent={getAllUsers?.length === 0 ? "No users found" : null}
              popupRender={(menu) => {
                return (
                <>
                  <div className="p-2">
                    <Input.Search
                      placeholder="Search by username or email"
                      value={searchQuery}
                      onChange={onSearchQueryChange}
                      onSearch={onSearch}
                      onKeyDown={(e) => e.stopPropagation()}
                      loading={isUsersLoading || isUsersFetching}
                      enterButton="Search"
                      allowClear
                      onClear={() => {
                        setSearchQuery("");
                        setSubmittedQuery("");
                      }}
                    />
                  </div>
                  {menu}
                </>
              )
              }}
            >
              {
                getAllUsers?.map((user) =>  {
                return (
                <Option key={user._id} value={user._id} className="truncate">
                  {user.fullName}: {user.email}
                </Option>
              )
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Creating New Task */}
      <Modal
        title="Create New Task"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
        confirmLoading={createTaskMutation.isPending}
      >
        <Form form={form} layout="vertical">
           <Form.Item
            name="taskName"
            label="Task Name"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="taskLink"
            label="Task Link"
            rules={[{ required: true, message: "Please enter the task link!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taskGuidelineLink"
            label="Task Guideline Link"
            rules={[
              { required: true, message: "Please enter the guideline link!" },
            ]}
          >
            <Input />
          </Form.Item>
         
          <Form.Item
            name="dueDate"
            label="Deadline"
            rules={[{ required: true, message: "Please select a deadline!" }]}
            className="w-full"
          >
            <DatePicker 
              className="w-full create-task-datepicker"
              placeholder="Select deadline"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Editing Task */}
      <Modal
        title="Edit Task"
        open={isEditModalVisible}
        onOk={handleUpdateTask}
        onCancel={handleCancel}
        okText="Update"
        cancelText="Cancel"
        confirmLoading={updateTaskMutation.isPending}
      >
        <Form form={editForm} layout="vertical">
           <Form.Item
            name="taskName"
            label="Task Name"
            rules={[
              { required: true, message: "Please enter the task name!" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="taskLink"
            label="Task Link"
            rules={[{ required: true, message: "Please enter the task link!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="taskGuidelineLink"
            label="Task Guideline Link"
            rules={[
              { required: true, message: "Please enter the guideline link!" },
            ]}
          >
            <Input />
          </Form.Item>
 
          <Form.Item
            name="dueDate"
            label="Deadline"
            rules={[{ required: true, message: "Please select a deadline!" }]}
            className="w-full"
          >
            <DatePicker 
              className="w-full"
              placeholder="Select deadline"
              classNames={{ popup: { root: "edit-task-datepicker-popup"  } }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskTable;
