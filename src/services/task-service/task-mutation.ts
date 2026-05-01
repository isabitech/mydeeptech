import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

export interface CreateTaskPayload {
  taskName: string;
  taskLink: string;
  taskGuidelineLink: string;
  dueDate: string;
}

export interface AssignTaskPayload {
  taskId: string;
  userId: string;
}

export interface UpdateTaskPayload {
  taskName?: string;
  taskLink?: string;
  taskGuidelineLink?: string;
  dueDate?: string;
}

const useCreateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createTask],
    mutationFn: async (payload: CreateTaskPayload) => {
      const response = await axiosInstance.post(endpoints.tasks.createTask, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    },
  });

  return {
    createTaskMutation: mutation,
    isCreateTaskLoading: mutation.isPending,
    isCreateTaskError: mutation.isError,
    createTaskError: mutation.error,
  };
};

const useAssignTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.assignTask],
    mutationFn: async (payload: AssignTaskPayload) => {
      const response = await axiosInstance.post(endpoints.tasks.assignTask, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    }
  });

  return {
    assignTaskMutation: mutation,
    isAssignTaskLoading: mutation.isPending,
    isAssignTaskError: mutation.isError,
    assignTaskError: mutation.error,
  };
};

const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteTask],
    mutationFn: async (taskId: string) => {
      const response = await axiosInstance.delete(`${endpoints.tasks.deleteTask}/${taskId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    }
  });

  return {
    deleteTaskMutation: mutation,
    isDeleteTaskLoading: mutation.isPending,
    isDeleteTaskError: mutation.isError,
    deleteTaskError: mutation.error,
  };
};

const useUpdateTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.updateTask],
    mutationFn: async ({ taskId, payload }: { taskId: string; payload: UpdateTaskPayload }) => {
      const response = await axiosInstance.put(`${endpoints.tasks.updateTask}/${taskId}`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    }
  });

  return {
    updateTaskMutation: mutation,
    isUpdateTaskLoading: mutation.isPending,
    isUpdateTaskError: mutation.isError,
    updateTaskError: mutation.error,
  };
};

const taskMutationService = {
  useCreateTask,
  useAssignTask,
  useDeleteTask,
  useUpdateTask,
};

export default taskMutationService;