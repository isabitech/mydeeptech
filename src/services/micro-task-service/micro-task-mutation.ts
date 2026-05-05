import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../service/axiosApi";
import { endpoints } from "../../store/api/endpoints";
import REACT_QUERY_KEYS from "../_keys/react-query-keys";
import { BaseTaskSchema, CreateTaskResponseSchema, TaskSchema } from "../../validators/task/task-schema";

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
    mutationFn: async (formData: FormData) => {
      const response = await axiosInstance.post<UploadImageResponse>("/micro-tasks/upload",
        formData,
        {
           onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`Upload progress: ${percent}%`);
        },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    }
  });

  return {
    uploadImageMutation: mutation,
    isUploadImageLoading: mutation.isPending,
    isUploadImageError: mutation.isError,
    uploadImageError: mutation.error,
  };
};

const useApplyForTask = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.applyForTask],
    mutationFn: async (taskId: string) => {
      const response = await axiosInstance.post("/micro-tasks/apply",{ taskId });
      console.log("Apply for Task API Response:", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
    },
  });

  return {
    applyForTaskMutation: mutation,
    isApplyForTaskLoading: mutation.isPending,
    isApplyForTaskError: mutation.isError,
    applyForTaskError: mutation.error,
  };
};

const useDeleteSubmissionImage = () => {
  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.deleteSubmissionImage],
    mutationFn: async ({ 
      taskApplicationId, 
      publicId,
      taskId,
      imageId
    }: { 
      taskApplicationId: string;
      publicId: string;
      taskId: string;
      imageId: string;
    }) => {
  
      const payload = {
            taskApplicationId, 
            publicId,
            taskId,
            imageId
      }
      const response = await axiosInstance.delete(`${endpoints.microTaskSubmissions.getSubmissionDetails}/${taskApplicationId}/deleteImage`, { data: payload });
      return response.data;
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

const useCreateTaskSlots = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createTaskSlots],
    mutationFn: async (submissionId: string) => {
      const response = await axiosInstance.post(
        `${endpoints.microTaskSubmissions.getSubmissionDetails}/${submissionId}/create-slots`
      );
      return response.data;
    },
    onSuccess: (_, submissionId) => {
      // Invalidate submission details to refetch with new slots
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskSubmissionDetails, submissionId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [REACT_QUERY_KEYS.QUERY.getUserMicroTaskSubmissions] 
      });
    },
  });

  return {
    createTaskSlotsMutation: mutation,
    isCreateTaskSlotsLoading: mutation.isPending,
    isCreateTaskSlotsError: mutation.isError,
    createTaskSlotsError: mutation.error,
  };
};

const useCreateMicroTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.createMicroTask],
    mutationFn: async (taskData: TaskSchema) => {
      const response = await axiosInstance.post<CreateTaskResponseSchema>(endpoints.tasks.createTask, taskData);
       console.log("taskData", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllTasks] });
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
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: Partial<BaseTaskSchema> }) => {
      const response = await axiosInstance.put(`${endpoints.tasks.updateTask}/${taskId}`, taskData);
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

const useApproveOrRejectApplication = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.approveOrRejectApplication],
    mutationFn: async ({ 
      applicationId, 
      action, 
      rejectionReason 
    }: { 
      applicationId: string; 
      action: 'approve' | 'reject'; 
      rejectionReason?: string; 
    }) => {
      const payload: { applicationId: string; action: 'approve' | 'reject'; rejectionReason?: string } = {
        applicationId,
        action
      };
      
      // Only include rejectionReason if it's provided
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await axiosInstance.post(`${endpoints.microTasks.approveOrRejectApplication}`, payload);

      console.log("Approve/Reject Application API Response:", response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks] });
    },
  });

  return {
    approveOrRejectApplicationMutation: mutation,
    isApproveOrRejectApplicationLoading: mutation.isPending,
    isApproveOrRejectApplicationError: mutation.isError,
    approveOrRejectApplicationError: mutation.error,
  };
};


const useRejectSubmissionImage = () => {
  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.rejectSubmissionImage],
    mutationFn: async ({ 
      taskApplicationId, 
      imageId, 
      rejectionReason,
      taskId
    }: { 
      taskApplicationId: string; 
      imageId: string; 
      rejectionReason: string; 
      taskId: string;
    }) => {
      const payload = {
        taskId,
        imageId,
        applicationId: taskApplicationId,
        rejectionMessage: rejectionReason,
      };
      const response = await axiosInstance.post(`${endpoints.microTasks.rejectImage}`, payload);
      return response.data;
    }
  });

  return {
    rejectSubmissionImageMutation: mutation,
    isRejectSubmissionImageLoading: mutation.isPending,
    isRejectSubmissionImageError: mutation.isError,
    rejectSubmissionImageError: mutation.error,
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

const useAssignTaskToUsers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationKey: [REACT_QUERY_KEYS.MUTATION.assignTaskToUsers],
    mutationFn: async ({ taskId, userIds }: { taskId: string; userIds: string[] }) => {
      const response = await axiosInstance.post(`${endpoints.tasks.assignTaskToUsers}`,{ taskId, userIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAllMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getAvailableMicroTasks] });
      queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.QUERY.getMicroTaskStatistics] });
    },
  });

  return {
    assignTaskToUsersMutation: mutation,
    isAssignTaskToUsersLoading: mutation.isPending,
    isAssignTaskToUsersError: mutation.isError,
    assignTaskToUsersError: mutation.error,
  };
};

const microTaskMutationService = {
  useStartMicroTaskSubmission,
  useUploadSubmissionImage,
  useDeleteSubmissionImage,
  useSubmitForReview,
  useCreateTaskSlots,
  useCreateMicroTask,
  useUpdateMicroTask,
  useDeleteMicroTask,
  useAssignTaskToUsers,
  useApplyForTask,
  useApproveOrRejectApplication,
  useRejectSubmissionImage,
};

export default microTaskMutationService;