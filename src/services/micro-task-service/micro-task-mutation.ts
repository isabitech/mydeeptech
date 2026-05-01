import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";

interface StartSubmissionResponse {
  success: boolean;
  data: {
    submissionId: string;
    message: string;
  };
  message?: string;
}

interface UploadImageResponse {
  success: boolean;
  data: {
    slot: {
      _id: string;
      uploaded: boolean;
      image_url?: string;
      image_id?: string;
    };
    message: string;
  };
  message?: string;
}

interface SubmitForReviewResponse {
  success: boolean;
  data: {
    submissionId: string;
    status: string;
    message: string;
  };
  message?: string;
}

const useStartMicroTaskSubmission = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.startMicroTaskSubmission],
    mutationFn: async (taskId: string): Promise<StartSubmissionResponse> => {
      const response = await axiosInstance.post<StartSubmissionResponse>(
        `${endpoints.microTaskSubmissions.startSubmission}/${taskId}/start`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
    },
  });

  return {
    startSubmissionMutation: mutation,
    isStartSubmissionLoading: mutation.isPending,
    isStartSubmissionError: mutation.isError,
    startSubmissionError: mutation.error,
  };
};

const useUploadSubmissionImage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.uploadSubmissionImage],
    mutationFn: async ({ 
      submissionId, 
      file, 
      slotId 
    }: { 
      submissionId: string; 
      file: File; 
      slotId: string;
    }): Promise<UploadImageResponse> => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("slotId", slotId);

      const response = await axiosInstance.post<UploadImageResponse>(
        `${endpoints.microTaskSubmissions.uploadImage}/${submissionId}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate submission details for the specific submission
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, variables.submissionId] 
      });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions] });
    },
  });

  return {
    uploadImageMutation: mutation,
    isUploadImageLoading: mutation.isPending,
    isUploadImageError: mutation.isError,
    uploadImageError: mutation.error,
  };
};

const useDeleteSubmissionImage = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteSubmissionImage],
    mutationFn: async ({ 
      submissionId, 
      slotId 
    }: { 
      submissionId: string; 
      slotId: string;
    }) => {
      const response = await axiosInstance.delete(
        `${endpoints.microTaskSubmissions.deleteImage}/${submissionId}/slots/${slotId}/image`
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate submission details for the specific submission
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, variables.submissionId] 
      });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions] });
    },
  });

  return {
    deleteImageMutation: mutation,
    isDeleteImageLoading: mutation.isPending,
    isDeleteImageError: mutation.isError,
    deleteImageError: mutation.error,
  };
};

const useSubmitForReview = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.submitForReview],
    mutationFn: async (submissionId: string): Promise<SubmitForReviewResponse> => {
      const response = await axiosInstance.post<SubmitForReviewResponse>(
        `${endpoints.microTaskSubmissions.submitForReview}/${submissionId}/submit`
      );
      return response.data;
    },
    onSuccess: (_, submissionId) => {
      // Invalidate submission details for the specific submission
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, submissionId] 
      });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
    },
  });

  return {
    submitForReviewMutation: mutation,
    isSubmitForReviewLoading: mutation.isPending,
    isSubmitForReviewError: mutation.isError,
    submitForReviewError: mutation.error,
  };
};

const useCreateMicroTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createMicroTask],
    mutationFn: async (taskData: any) => {
      const response = await axiosInstance.post(
        endpoints.microTasks.createTask,
        taskData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskStatistics] });
    },
  });

  return {
    createTaskMutation: mutation,
    isCreateTaskLoading: mutation.isPending,
    isCreateTaskError: mutation.isError,
    createTaskError: mutation.error,
  };
};

const useUpdateMicroTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.updateMicroTask],
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: any }) => {
      const response = await axiosInstance.put(
        `${endpoints.microTasks.updateTask}/${taskId}`,
        taskData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskStatistics] });
    },
  });

  return {
    updateTaskMutation: mutation,
    isUpdateTaskLoading: mutation.isPending,
    isUpdateTaskError: mutation.isError,
    updateTaskError: mutation.error,
  };
};

const useDeleteMicroTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteMicroTask],
    mutationFn: async (taskId: string) => {
      const response = await axiosInstance.delete(
        `${endpoints.microTasks.deleteTask}/${taskId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskStatistics] });
    },
  });

  return {
    deleteTaskMutation: mutation,
    isDeleteTaskLoading: mutation.isPending,
    isDeleteTaskError: mutation.isError,
    deleteTaskError: mutation.error,
  };
};

const microTaskMutationService = {
  useStartMicroTaskSubmission,
  useUploadSubmissionImage,
  useDeleteSubmissionImage,
  useSubmitForReview,
  useCreateMicroTask,
  useUpdateMicroTask,
  useDeleteMicroTask,
};

export default microTaskMutationService;