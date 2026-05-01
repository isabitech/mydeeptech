import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

export interface TaskType {
  _id: string;
  taskLink: string;
  taskGuidelineLink: string;
  taskName: string;
  createdBy: {
    _id: string;
    fullName: string;
    email: string;
  };
  dateCreated: string;
  dueDate: string;
  __v: number;
}

export interface AssignedTaskType {
  assignmentId: string;
  task: TaskType;
  assignedDate: string;
  status: string;
}

const useGetAllTasks = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.tasks.getAllTasks);
      return response.data;
    },
  });

  return {
    tasks: query.data?.data as TaskType[],
    isTasksLoading: query.isLoading,
    isTasksError: query.isError,
    tasksError: query.error,
    tasksRefetch: () => query.refetch(),
    isTasksFetching: query.isFetching,
  };
};

const useGetAssignedTasks = () => {
  const query = useQuery({
    queryKey: [REACT_QUERY_KEYS.QUERY.getAssignedTasks],
    queryFn: async () => {
      const response = await axiosInstance.get(endpoints.tasks.getAssignedTasks);
      return response.data;
    },
  });

  return {
    assignedTasks: query.data?.data as AssignedTaskType[],
    isAssignedTasksLoading: query.isLoading,
    isAssignedTasksError: query.isError,
    assignedTasksError: query.error,
    assignedTasksRefetch: () => query.refetch(),
    isAssignedTasksFetching: query.isFetching,
  };
};

const taskQueryService = {
  useGetAllTasks,
  useGetAssignedTasks,
};

export default taskQueryService;