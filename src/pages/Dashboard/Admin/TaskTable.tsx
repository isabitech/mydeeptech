import { useEffect, useState } from "react";
import { Button, Modal, Form, Input, DatePicker, notification } from "antd";
import { UserPlus } from "lucide-react";
import { useUserContext } from "../../../UserContext";
import { baseURL, endpoints } from "../../../store/api/endpoints";
import { PlusCircleFilled } from "@ant-design/icons";
import useGetUsers from "../../../hooks/Auth/Admin/Users/useGetUsers";
import Loader from "../../../components/Loader";
import { getErrorMessage } from "../../../service/apiUtils";

export type ResponseType = TaskType[];

export interface TaskType {
  _id: string;
  taskLink: string;
  taskGuidelineLink: string;
  taskName: string;
  createdBy: string;
  dateCreated: string;
  dueDate: string;
  __v: number;
}

const TaskTable = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [totalTask, settotalTask] = useState<number>(0);
  const [allTask, setAllTask] = useState<ResponseType>();
  const [isAssignTaskModalVisibile, setIsAssignTaskModalVisibile] =
    useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");

  // Show Modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  const { userInfo } = useUserContext();
  const getAllUsers = useGetUsers();

  // Handle Form Submission
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dueDate: values.dueDate.format("YYYY-MM-DD"),
      };

      const response = await fetch(`${baseURL}${endpoints.tasks.createTask}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create project");
      }

      const data = await response.json();
      console.log(data);
      setAllTask((prev) => prev?.map((task)=>( task._id === data._id ? {...task, ...payload}: task)));

      notification.success({ message: "Task created successfully!" });

      // setProjects((prevProjects) => [...prevProjects, data]); // Add new project to the list
      form.resetFields();
      setIsModalVisible(false);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      notification.error({
        message: "Error Creating Project",
        description: errorMessage,
      });
    }
  };

  const handleAssingTask = async (
    selectedUser: string,
    selectedTask: string
  ) => {
    try {
      const payload = {
        taskId: selectedTask,
        userId: selectedUser,
      };

      const response = await fetch(`${baseURL}${endpoints.tasks.assignTask}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.responseMessage || "Failed to assign task");
      }

      const data = await response.json();
      console.log(data);

      notification.success({ message: "Task assigned successfully!" });

      // setProjects((prevProjects) => [...prevProjects, data]); // Add new project to the list
      form.resetFields();
      setIsAssignTaskModalVisibile(false);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      notification.error({
        message: "Error Assigning Task",
        description: errorMessage,
      });
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setIsAssignTaskModalVisibile(false);
  };

  useEffect(() => {
    setIsLoading(!isLoading);
    const fetchAllTasks = async () => {
      try {
        const response = await fetch(`${baseURL}${endpoints.tasks.getAllTasks}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setIsLoading(false);
        const result: ResponseType = data.data;
        console.log(result);
        setAllTask(result);
        // const totalTask = result.length;

        settotalTask(totalTask);
      } catch (error) {
        console.error("An error occurred:", error);
        const errorMessage = getErrorMessage(error);
        notification.error({
          message: "Error fetching tasks",
          description: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllTasks();
  }, []);

  return (
    <div className="p-4">
      {isLoading && (
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
      <table className="min-w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">S/N</th>
            {/* <th className="border p-2">Annotator First Name</th>
            <th className="border p-2">Email</th> */}
            <th className="border p-2">Task Link</th>
            <th className="border p-2">Task Guideline Link</th>
            <th className="border p-2">Task Name</th>
            <th className="border p-2">Deadline</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {allTask?.map((task, index) => (
            <tr key={task._id}>
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">
                <a
                  href={task.taskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Task
                </a>
              </td>
              <td className="border p-2">
                <a
                  href={task.taskGuidelineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Guidelines
                </a>
              </td>
              <td className="border p-2">{task.taskName}</td>
              <td className="border p-2">{task.dueDate}</td>
              <td className="border p-2">{task.createdBy}</td>
              <td>
                <button
                  onClick={() => {
                    form.setFieldsValue({
                      taskLink: task.taskLink,
                      taskGuidelineLink: task.taskGuidelineLink,
                      taskName: task.taskName,
                      dueDate: task.dueDate,
                      userInfo: userInfo.fullName,
                    });
                    setIsAssignTaskModalVisibile(true);
                    setSelectedTask(task._id); // Track the selected task
                  }}
                  className="!bg-primary !text-white !border-none !mr-3 !font-[gilroy-regular] rounded-md p-1 !hover:bg-secondary"
                >
                  Assign Task <PlusCircleFilled />
                </button>
              </td>
            </tr>
          ))}

          {/* Assign Task Modal */}
          <Modal
            title="Assign Task"
            visible={isAssignTaskModalVisibile}
            onOk={() => handleAssingTask(selectedUser, selectedTask)}
            onCancel={() => setIsAssignTaskModalVisibile(false)}
            okText="Assign"
            cancelText="Cancel"
          >
            <Form form={form} layout="vertical">
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
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  onChange={(e: any) => setSelectedUser(e.target.value)} // Ensure setSelectedUser is defined
                >
                  {/* Check if getAllUsers and getAllUsers.users exist before mapping */}
                  <option value="">Select A User</option>
                  {getAllUsers?.users?.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.email}){" "}
                    </option>
                  ))}
                </select>
              </Form.Item>
            </Form>
          </Modal>
        </tbody>
      </table>

      {/* Modal for Creating New Task */}
      <Modal
        title="Create New Task"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Create"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
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
            name="taskName"
            label="Task Name"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="dueDate"
            label="Deadline"
            rules={[{ required: true, message: "Please select a deadline!" }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="createdBy"
            label="Created By"
            rules={[
              { required: true, message: "Please select the task name!" },
            ]}
          >
            <Input value={userInfo.fullName} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskTable;
